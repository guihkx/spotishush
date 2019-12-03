"use strict";

var id, now_playing, port;

console.info("[SpotiShush] Loaded");
console.info("[SpotiShush] Awaiting UI initialization");

id = setInterval(await_spotify_ui, 1000);

function await_spotify_ui()
{
    now_playing = document.querySelector("div.now-playing");

    if(now_playing === null) {
        return;
    }
    clearInterval(id);
    setup_observer();
}

function setup_observer()
{
    var mo;

    mo = new MutationObserver(is_audio_ad);
    mo.observe(now_playing, {"childList": true});

    console.info("[SpotiShush] Success! Monitoring ads now...");

    setup_port();
}

function setup_port()
{
    port = chrome.runtime.connect({"name": "spotishush"});
}

function is_audio_ad(mutations)
{
    var span, is_ad;

    console.log("[SpotiShush] Mutations:");
    console.log(mutations);

    // If the first element is draggable, then it's a regular song:
    // <span draggable="true"></a>
    //     <a aria-label="Now playing: ..." href="..."></a>
    // </span>
    span = now_playing.firstElementChild;

    if(span !== null && span.tagName === "SPAN" && span.draggable === true) {
        is_ad = false;
        console.info("[SpotiShush] Not an ad");
    }
    else {
        is_ad = true;
        console.info("[SpotiShush] Ad detected");
    }
    port.postMessage({"mute": is_ad});
}
