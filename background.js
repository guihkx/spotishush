"use strict";

var we_muted = false;

chrome.runtime.onConnect.addListener(msg_listener);

function msg_listener(port)
{
    console.assert(port.name === "spotishush");

    console.log("msg_listener(): connected");

    port.onMessage.addListener(mute_unmute);
}

function mute_unmute(msg, info)
{
    if(msg.mute || (!msg.mute && we_muted)) {
        we_muted = msg.mute;
        chrome.tabs.update(info.sender.tab.id, {"muted": msg.mute}, volume_control);
    }
}

function volume_control(info)
{
    console.log("volume_control(): " + (info.mutedInfo.muted ? "Muted" : "Unmuted"));
}
