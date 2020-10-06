
var bkg = chrome.extension.getBackgroundPage();

chrome.storage.sync.get(['extensionList'], function(list) {
    let extensionList = list.extensionList || {};
    extensionList = JSON.parse(extensionList);
    var table = document.getElementById("extensionTable");
    bkg.console.log(extensionList);
    var rowCount = table.rows.length;
    for(let key in extensionList) {
        bkg.console.log(key + ":" +extensionList[key])
        jQuery.get("https://api.crxcavator.io/v1/report/"+ key +"/" +extensionList[key].version, function(data){console.log(data)});
        var row = table.insertRow(rowCount++);
        var name = row.insertCell(0);
        var id = row.insertCell(1);
        var version = row.insertCell(2);
        name.innerHTML = extensionList[key].name;
        id.innerHTML = key;
        version.innerHTML = extensionList[key].version;
    }
});

