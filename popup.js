// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

var bkg = chrome.extension.getBackgroundPage();

function clickHandler() {
  bkg.console.log("Clicked Run");
  chrome.runtime.sendMessage({directive: "popup-click"}, function(response) {
     chrome.tabs.create({ url: 'extension-report.html' });
    this.close(); // close the popup when the background finishes processing request
});
}

document.getElementById('run_extension').addEventListener('click', clickHandler);
