
var bkg = chrome.extension.getBackgroundPage();

chrome.storage.sync.get(['extensionList'], async function(list) {
    let extensionList = list.extensionList || {};
    extensionList = JSON.parse(extensionList);
    var table = document.getElementById("scoreDetailsTable");
    var rowCount = table.rows.length;
    for(let key in extensionList) {
        bkg.console.log(key + ":" +extensionList[key])
        if(extensionList[key].name != "Is It Secure") {
            var response = await fetch("https://api.crxcavator.io/v1/report/"+ key +"/" +extensionList[key].version)
            var result = await response.json();
            var row = scoreDetailsTable.insertRow(rowCount++);
            var name = row.insertCell(0);
            var csp = row.insertCell(1);
            var extcalls = row.insertCell(2);
            var permissions = row.insertCell(3);
            var optpermissions = row.insertCell(4);
            var retire = row.insertCell(5);
            var webstore = row.insertCell(6);
            var total = row.insertCell(7);
            
            name.innerHTML = extensionList[key].name;
            var score=result.data.risk;
            total.innerHTML = score.total;
			for (let sc in score) {
				if (sc == "csp") {
					csp.innerHTML = score.csp.total;
				} else if (sc == "permissions") {
					permissions.innerHTML = score.permissions.total;
				} else if (sc == "extcalls") {
					extcalls.innerHTML = score.extcalls.total;
				} else if (sc == "webstore") {
					webstore.innerHTML = score.webstore.total;
				} else if (sc == "optional_permissions") {
					optpermissions.innerHTML = score.optional_permissions.total;
				} else if (sc == "retire") {
					retire.innerHTML = score.retire.total;
				}
			}
        }
    }
});

