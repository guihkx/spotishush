"use strict";

var filter = {
        urls: ["https://audio-fa.scdn.co/audio/*"]
    },
    opts = ["responseHeaders"],

    // Control variable.
    // We don't want to unmute a tab if the user manually muted it.
    we_muted = false;

chrome.webRequest.onHeadersReceived.addListener(analyse_headers, filter, opts);

// The logic here is very simple.
// Spotify uses the same CDNs for both ads and music.
// But the audio ads are served in unencrypted form, while music are not.
// So we simply to check if the Content-Type header matches 'audio/mpeg'.
function analyse_headers(info)
{
    var t, i, header, shall_mute = false;

    t = info.responseHeaders.length;

    for(i = 0; i < t; i++) {
        header = info.responseHeaders[i];

        if(header.name.toLowerCase() !== "content-type") {
            continue;
        }
        // Ads are served unencrypted.
        if(header.value.toLowerCase() === "audio/mpeg") {
            shall_mute = true;
            console.log("analyse_headers(): Ad detected. Trying to mute tab");
        }
        if(shall_mute || (!shall_mute && we_muted)) {
            chrome.tabs.update(info.tabId, {"muted": shall_mute}, volume_control);
            we_muted = shall_mute;
        }
        break;
    }
}

function volume_control(info)
{
    console.log("volume_control(): " + (info.mutedInfo.muted ? "Muted" : "Unmuted"));
}
