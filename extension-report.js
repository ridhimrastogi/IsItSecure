
var bkg = chrome.extension.getBackgroundPage();

chrome.storage.sync.get(['extensionList'], async function(list) {
    let extensionList = list.extensionList || {};
    extensionList = JSON.parse(extensionList);
    bkg.console.log(extensionList);
    for(let key in extensionList) {
        bkg.console.log(key + ":" +extensionList[key])
        if(extensionList[key].name != "Is It Secure") {
            var response = await fetch("https://api.crxcavator.io/v1/report/"+ key +"/" + extensionList[key].version)
            if(response == null || response.status != 200)
                continue;
            var result = await response.json();
            riskScore = result.data.risk.total;
            bkg.console.log(result.data);
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

            var score=result.data.risk;
            const section = document.createElement("section");
            const button = document.createElement("button")
            button.innerHTML = extensionList[key].name + ": " + riskScore;
            button.className = "collapsible"

            var response = await fetch("https://api.crxcavator.io/v1/report/"+ key);
            var result = await response.json();
            var riskOverTime = [];
            var latest_version = 0;
            for(let res in result){
                bkg.console.log(extensionList[key].name + " " + result[res].version + " " + result[res].data.risk.total);
                riskOverTime.push({y: result[res].data.risk.total});
                latest_version = result[res].version;
            }

            button.addEventListener("click", function() {
                this.classList.toggle("active");
                var content = this.nextElementSibling;
                if (content.style.maxHeight){
                content.style.maxHeight = null;
                } else {
                content.style.maxHeight = content.scrollHeight + "px";
                }
            });

            const parent = document.createElement("div");
            parent.className = "content"

            const riskdetails = document.createElement("div");
            const heading1 = document.createElement("h2")
            heading1.innerHTML = "Risk Breakdown"

            const list = document.createElement("ul")
            list.className = "bigFont"
            list.setAttribute("style", "width: 100%;list-style-type: none;display: inline-block;");
            var item = document.createElement("li");
            if(parseFloat(latest_version) > parseFloat(extensionList[key].version))
            {
                item.innerHTML = "Updated to Latest version: False"
            }
            else{
                item.innerHTML = "Updated to Latest version: True"
            }
            list.appendChild(item);
            for (let sc in score) {
                if( sc == "metadata")
                {  continue; }
                var item = document.createElement("li");
                if (sc == "csp") {
                    item.innerHTML = "CSP score: " + score.csp.total;
                } else if (sc == "permissions") {
                    item.innerHTML = "Permissions score: " + score.permissions.total;
                }else if (sc == "extcalls") {
                    item.innerHTML = "External Calls score: " + score.extcalls.total;
                }
                if (sc == "webstore") {
                    item.innerHTML = "Webstore score: " + score.webstore.total;
                }
                if (sc == "optional_permissions") {
                    item.innerHTML = "Optional Permissions score: " + score.optional_permissions.total;
                }
                if (sc == "retire") {
                    item.innerHTML = "Retired(Outdated) libraries score: " + score.retire.total;
                }
                list.appendChild(item);
            }

            riskdetails.appendChild(heading1);
            riskdetails.appendChild(list)

            const related = document.createElement("div");
            related.setAttribute("style", "width: 100%;display: inline-block;");
            const heading2 = document.createElement("h2")
            heading2.innerHTML = "Related Extensions and Risk scores"

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
            related.appendChild(heading2);
            related.appendChild(t);

            const versionchart = document.createElement("div");
            versionchart.setAttribute("id", extensionList[key].name);
            versionchart.setAttribute("style", "width: 100%;display: block;");

            parent.appendChild(riskdetails);
            parent.appendChild(related);
            parent.appendChild(versionchart);

            section.appendChild(button);
            section.appendChild(parent);

            const currentDiv = document.getElementById("chartContainer");

            document.body.insertBefore(section, currentDiv);
            const chart = new CanvasJS.Chart(extensionList[key].name, {
                title:{
                    text:  "Risk Score across Versions for " + extensionList[key].name
                },
                toolTip:{
                    enabled: false
                },
                backgroundColor: "#F5DEB3",
                height: 400,
                axisX: {
                    minimum: 0,
                   interval: 1,
                    title: "versions"
                },
                axisY:{
                    title : "Risk score"
                },
                data: [{
                    type: "line",
                    indexLabelFontSize: 16,
                    dataPoints: riskOverTime
                }]
            });
            chart.render();
        }
    }
});



