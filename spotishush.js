"use strict";

var id, play_button, port;

id = setInterval(wait_for_player_controls, 1000);

function wait_for_player_controls()
{
    var obj;
    
    // Play/Pause button
    obj = document.getElementsByClassName("control-button--circled");

    if(obj.length !== 1) {
        return false;
    }
    console.log("[SpotiShush] Caching play/pause button");

    play_button = obj[0];

    clearInterval(id);
    setup_observer();
}

function setup_observer()
{
    var mo;

    mo = new MutationObserver(is_audio_ad);
    mo.observe(play_button, {"attributes": true});

    setup_port();
}

function setup_port()
{
    port = chrome.runtime.connect({"name": "spotishush"});
}

function is_audio_ad(mutations)
{
    var classes, is_ad;

    classes = play_button.className;

    if(classes.indexOf("control-button--disabled") !== -1) {
        is_ad = true;
        console.log("[SpotiShush] An ad is about to be played");
    }
    else {
        is_ad = false;
    }
    port.postMessage({"mute": is_ad});
}
