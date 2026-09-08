(function() {
    // bgm.js - Sends interaction signal to parent wrapper to start continuous BGM,
    // or plays BGM directly if opened as a standalone page.
    
    let interactionSent = false;

    // Check if we are running outside of the index.html wrapper
    const isStandalone = window === window.parent;
    let standaloneAudio = null;

    if (isStandalone) {
        // Create audio element for standalone playback
        standaloneAudio = document.createElement('audio');
        // Determine the path to the audio file relative to this script
        const scriptUrl = document.currentScript ? document.currentScript.src : window.location.href;
        standaloneAudio.src = new URL('funk-breakbeat.m4a', scriptUrl).href;
        standaloneAudio.loop = true;
        standaloneAudio.volume = 0.15;
        const appendAudio = () => {
            (document.body || document.documentElement).appendChild(standaloneAudio);
        };
        if (document.body) {
            appendAudio();
        } else {
            document.addEventListener('DOMContentLoaded', appendAudio);
        }
    }

    const signalInteraction = () => {
        if (isStandalone && standaloneAudio) {
            if (standaloneAudio.paused) {
                standaloneAudio.play().catch(e => console.log('BGM Autoplay blocked:', e));
            }
        } else {
            // webOS 등 엄격한 정책에서는 postMessage 비동기 처리 시 play()가 막힐 수 있으므로 직접 접근 시도
            try {
                const bgmPlayer = window.parent.document.getElementById('bgm-player');
                if (bgmPlayer && bgmPlayer.paused) {
                    bgmPlayer.play().catch(e => console.log('BGM direct play blocked:', e));
                }
            } catch (e) {
                // Cross-origin 등으로 접근 불가능할 경우 기존 postMessage 방식(비동기) 폴백
                if (!interactionSent) {
                    window.parent.postMessage({ type: 'interaction' }, '*');
                }
            }
            interactionSent = true;
        }
        
        // webOS 등에서 예기치 않게 BGM이 일시정지될 경우를 대비해
        // 이벤트 리스너를 제거하지 않고 유지하여 다음 터치 시 다시 재생되도록 함
    };

    // 새 iframe 로드 시 부모 BGM이 멈춰있다면 즉시 재생 복구 시도
    if (!isStandalone) {
        try {
            const bgmPlayer = window.parent.document.getElementById('bgm-player');
            if (bgmPlayer && bgmPlayer.paused) {
                bgmPlayer.play().catch(() => {});
            }
        } catch (e) {}
    }

    document.addEventListener('touchstart', signalInteraction, { passive: true });
    document.addEventListener('click', signalInteraction, { passive: true });
})();
