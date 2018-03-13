"use strict";

var id, now_playing, port;

console.info("[SpotiShush] Loaded");
console.info("[SpotiShush] Awaiting UI initilization");

id = setInterval(wait_for_any_song, 1000);

function wait_for_any_song()
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
    var np_url, is_ad;

    console.log("[SpotiShush] Mutations:");
    console.log(mutations);

    np_url = now_playing.firstElementChild;

    if(np_url === null) {
        return;
    }
    if(np_url.tagName !== "A") {
        console.error("[SpotiShush] Unexpected firstElementChild:");
        console.error(np_url);

        return;
    }
    console.info("[SpotiShush] URL of current album/playlist: " + np_url.href);

    if(np_url.hostname === "open.spotify.com") {
        is_ad = false;
        console.info("[SpotiShush] Not an ad");
    }
    else {
        is_ad = true;
        console.info("[SpotiShush] Ad detected");
    }
    port.postMessage({"mute": is_ad});
}
