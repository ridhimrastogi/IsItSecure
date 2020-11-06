
var bkg = chrome.extension.getBackgroundPage();

chrome.storage.sync.get(['extensionList'], async function(list) {
    let extensionList = list.extensionList || {};
    extensionList = JSON.parse(extensionList);
    var table = document.getElementById("extensionTable");
    bkg.console.log(extensionList);
    var rowCount = table.rows.length;
    for(let key in extensionList) {
        bkg.console.log(key + ":" +extensionList[key])
        if(extensionList[key].name != "Is It Secure") {
            var response = await fetch("https://api.crxcavator.io/v1/report/"+ key +"/" +extensionList[key].version)
            var result = await response.json();
            var row = table.insertRow(rowCount++);
            var name = row.insertCell(0);
            var id = row.insertCell(1);
            var riskScore = row.insertCell(2);
            var relatedExtensions = row.insertCell(3);
            name.innerHTML = extensionList[key].name;
            id.innerHTML = key;
            riskScore.innerHTML = result.data.risk.total;
            bkg.console.log(result.data.webstore.icon);
            var relatedExtensionsList = [];
            var relatedWithRisk = [];
            for(let relatedExtensionKey in result.data.related) {
            	var relatedExtensionsResponse = await fetch("https://api.crxcavator.io/v1/report/"+ relatedExtensionKey +"/");
            	if (relatedExtensionsResponse != null && relatedExtensionsResponse.status == 200) {
            		var relatedExtensionsResult = await relatedExtensionsResponse.json();
        			// retrieve data of latest version
        			if (relatedExtensionsResult != null && relatedExtensionsResult[relatedExtensionsResult.length - 1] != null) {
        				var relatedExtensionRiskScore = relatedExtensionsResult[relatedExtensionsResult.length - 1].data.risk.total;
	            		if (result.data.risk.total > relatedExtensionRiskScore) {
                            relatedExtensionsList.push(result.data.related[relatedExtensionKey].name);
                            relatedWithRisk.push([ result.data.related[relatedExtensionKey].name, relatedExtensionRiskScore ]);
	            		}
            		}
            	}
            }            
            
            const newDiv = document.createElement("div");
            const section = document.createElement("section");
            
            const extension = document.createElement("h1");
            extension.innerHTML = extensionList[key].name + ": " + riskScore.innerHTML;
            const related = document.createElement("div");
            const t = document.createElement("table");
            let tdd = document.createElement("tr");
            let trr = document.createElement("td");
            let trr1 = document.createElement("td");
            trr.innerHTML = "Related";
            trr1.innerHTML = "Risk Score";
            tdd.appendChild(trr);
            tdd.appendChild(trr1);
            t.appendChild(tdd);
            relatedWithRisk.forEach(rel => {
                let tr = document.createElement("tr");
                rel.forEach(r => {
                    let td = document.createElement("td");
                    td.innerHTML = r;
                    tr.appendChild(td);
                });
                t.appendChild(tr);
            });
            related.appendChild(t);
            
            section.appendChild(extension);
            section.appendChild(newDiv);
            section.appendChild(related);
            newDiv.setAttribute("id", extensionList[key].name);
            newDiv.setAttribute("style", "width: 100%; height: 400px;display: inline-block;");
            const currentDiv = document.getElementById("chartContainer"); 

            var response = await fetch("https://api.crxcavator.io/v1/report/"+ key);
            var result = await response.json();
            var riskOverTime = [];
            for(let res in result){
                console.log(extensionList[key].name + " " + result[res].version + " " + result[res].data.risk.total);
                riskOverTime.push({y: result[res].data.risk.total});
            }
            
            document.body.insertBefore(section, currentDiv);
            let chart = new CanvasJS.Chart(extensionList[key].name, {
                animationEnabled: true,
                title:{
                    text: extensionList[key].name
                },
                // height: 400,
                axisX: {
                    minimum: 0,
                    interval: 1,
                },
                data: [{        
                    type: "line",
                    indexLabelFontSize: 16,
                    dataPoints: riskOverTime
                }]
            });
            chart.render();           
            relatedExtensions.innerHTML = relatedExtensionsList; // return a list of relevant extensions with a better risk score
            
        }
    }
    
});

