// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
      switch (request.directive) {
      case "popup-click":
          var extension_list = {};
          chrome.management.getAll(function(result){
            for(var i=0; i < result.length; i++){
              extension_list[result[i].id] = {'name': result[i].shortName, 'version': result[i].version };
            }
            chrome.storage.sync.set({"extensionList": JSON.stringify(extension_list)});
          })
          sendResponse({}); // sending back empty response to sender
          break;
      default:
          // helps debug when request directive doesn't match
          alert("Unmatched request of '" + request + "' from script to background.js from " + sender);
      }
  }
);