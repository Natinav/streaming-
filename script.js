document.addEventListener("DOMContentLoaded", () => {
    const playBtn = document.getElementById("play-btn");
    const statusText = document.getElementById("player-status");
    
    // Your exact extracted secure Caster.fm stream URL
    const streamUrl = "https://morcast.caster.fm:16710/qF3ub?token=3c978a9acb3d1ab0112ce1d1c1748e36";
    
    let audioInstance = null;
    let isPlaying = false;

    playBtn.addEventListener("click", () => {
        if (!isPlaying) {
            statusText.innerText = "Connecting & Buffering...";
            
            audioInstance = new Audio(streamUrl);
            
            // LOW LATENCY INJECTIONS
            audioInstance.preload = "none";
            
            audioInstance.play()
                .then(() => {
                    isPlaying = true;
                    playBtn.innerText = "⏸ STOP AUDIO";
                    playBtn.classList.add("playing");
                    statusText.innerText = "📡 Streaming Voice Live";
                    
                    // Force browser to jump to the immediate live edge of the buffer stream
                    if (audioInstance.buffered.length > 0) {
                        audioInstance.currentTime = audioInstance.buffered.end(0) - 0.5;
                    }
                })
                .catch((error) => {
                    console.error("Playback failed:", error);
                    statusText.innerText = "Connection Failed. Is your transmitter online?";
                });

            // Keep monitoring the live feed edge so it doesn't slowly slide behind over time
            audioInstance.addEventListener("timeupdate", () => {
                if (audioInstance && audioInstance.buffered.length > 0) {
                    const bufferEnd = audioInstance.buffered.end(0);
                    const current = audioInstance.currentTime;
                    
                    // If network lag slips the audio more than 4 seconds behind the live edge, catch up
                    if (bufferEnd - current > 4) {
                        audioInstance.currentTime = bufferEnd - 1;
                    }
                }
            });

        } else {
            if (audioInstance) {
                audioInstance.pause();
                audioInstance.src = ""; 
                audioInstance.load();
                audioInstance = null;
            }
            isPlaying = false;
            playBtn.innerText = "▶ TAP TO LISTEN";
            playBtn.classList.remove("playing");
            statusText.innerText = "Player Stopped";
        }
    });
});
