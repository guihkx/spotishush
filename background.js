"use strict";

var filter = {
        urls: ["https://audio-fa.scdn.co/audio/*"]
    },
    opts = ["responseHeaders"],

    // Control variable.
    // We don't want to unmute a tab if the user manually muted it.
    we_muted = false,
    LOG = false;

chrome.webRequest.onHeadersReceived.addListener(analyse_headers, filter, opts);

function analyse_headers(info)
{
    var t, i, header, shall_mute;

    t = info.responseHeaders.length;

    for(i = 0; i < t; i++) {
        header = info.responseHeaders[i];

        if(header.name.toLowerCase() !== "content-type") {
            continue;
        }
        shall_mute = is_audio_ad(header.value);

        if(shall_mute || (!shall_mute && we_muted)) {
            chrome.tabs.update(info.tabId, {"muted": shall_mute}, volume_control);
            we_muted = shall_mute;
        }
        return true;
    }
}

// Spotify currently uses the same CDNs to serve both ads and songs.
// But songs are encrypted and ads are not.
// If the Content-Type header matches `audio/*`, then it's an ad.
function is_audio_ad(content_type)
{
    var is_ad;

    if(content_type.indexOf("audio/") === 0) {
        is_ad = true;
        log("is_audio_ad(): Ad detected");
    }
    else {
        is_ad = false;
        log("is_audio_ad(): Not an ad");
    }
    return is_ad;
}

function volume_control(info)
{
    log("volume_control(): " + (info.mutedInfo.muted ? "Muted" : "Unmuted"));
}

function log(what)
{
    if(LOG) {
        console.log(what);
    }
}

console.log("You must type LOG=1 to enable logging.");
