
var bkg = chrome.extension.getBackgroundPage();

chrome.storage.sync.get(['extensionList'], function(list) {
    let extensionList = list.extensionList || {};
    extensionList = JSON.parse(extensionList);
    var table = document.getElementById("extensionTable");
    bkg.console.log(extensionList);
    var rowCount = table.rows.length;
    for(let key in extensionList) {
        bkg.console.log(key + ":" +extensionList[key])
        var row = table.insertRow(rowCount++);
        var name = row.insertCell(0);
        var id = row.insertCell(1);
        name.innerHTML = extensionList[key];
        id.innerHTML = key;
    }
});

