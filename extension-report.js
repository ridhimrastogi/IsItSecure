
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
            for(let relatedExtensionKey in result.data.related) {
            	var relatedExtensionsResponse = await fetch("https://api.crxcavator.io/v1/report/"+ relatedExtensionKey +"/");
            	if (relatedExtensionsResponse != null && relatedExtensionsResponse.status == 200) {
            		var relatedExtensionsResult = await relatedExtensionsResponse.json();
        			// retrieve data of latest version
        			if (relatedExtensionsResult != null && relatedExtensionsResult[relatedExtensionsResult.length - 1] != null) {
        				var relatedExtensionRiskScore = relatedExtensionsResult[relatedExtensionsResult.length - 1].data.risk.total;
	            		if (result.data.risk.total > relatedExtensionRiskScore) {
	            			relatedExtensionsList.push(result.data.related[relatedExtensionKey].name);
	            		}
            		}
            	}
            }
            response = await fetch("https://api.crxcavator.io/v1/report/"+ key);
            result = await response.json();
            data = []
            for(let res in result){
                console.log(extensionList[key].name + " " + result[res].version + " " + result[res].data.risk.total);
                data.push({x: res, y: result[res].data.risk.total});
            }
            console.log(data);
            const newDiv = document.createElement("div");
            newDiv.setAttribute("id", extensionList[key].name);
            const currentDiv = document.getElementById("chartContainer"); 
            document.body.insertBefore(newDiv, currentDiv);
            var chart = new CanvasJS.Chart(extensionList[key].name, {
                animationEnabled: true,
                theme: "light2",
                title:{
                    text: "Simple Line Chart"
                },
                data: [{        
                    type: "line",
                    indexLabelFontSize: 16,
                    dataPoints: data
                }]
            });
            chart.render();           
            relatedExtensions.innerHTML = relatedExtensionsList; // return a list of relevant extensions with a better risk score
            
        }
    }
    
});

