(function() {
    // 0. 1분 무입력(유휴 상태) 감지 및 첫 화면 복귀 로직
    const IDLE_TIMEOUT_MS = 60000; // 1분
    let lastActivityTime = Date.now();
    let isReturningToMain = false;

    const onUserActivity = () => {
        lastActivityTime = Date.now();
    };

    const ACTIVITY_EVENTS = [
        'touchstart',
        'touchmove',
        'touchend',
        'touchcancel',
        'pointerdown',
        'pointermove',
        'pointerup',
        'pointercancel',
        'mousedown',
        'mousemove',
        'mouseup',
        'keydown',
        'click',
        'scroll'
    ];

    ACTIVITY_EVENTS.forEach(event => {
        window.addEventListener(event, onUserActivity, { passive: true, capture: true });
    });

    const returnToMainScreen = () => {
        if (isReturningToMain) return;
        isReturningToMain = true;

        sessionStorage.clear();
        localStorage.clear();

        const path = window.location.pathname;
        const isScene1 = path.includes('scene1.html');

        if (isScene1) {
            // 이미 scene1에 있는 경우 (시작 버튼 클릭 후 유휴 방치 등) 직접 리로드하여 초기 첫 화면으로 복원
            window.location.reload();
        } else {
            if (window.parent && window.parent !== window) {
                window.parent.postMessage({ type: 'navigate', url: encodeURI('./도로화면/scene1.html') }, '*');
            } else {
                window.location.href = '../도로화면/scene1.html';
            }
        }
    };

    const checkIdle = () => {
        if (isReturningToMain) return;

        const elapsed = Date.now() - lastActivityTime;
        if (elapsed >= IDLE_TIMEOUT_MS) {
            const path = window.location.pathname;
            const isScene1 = path.includes('scene1.html');
            if (isScene1) {
                const btnStart = document.getElementById('btnStart');
                // 시작 버튼이 여전히 표시 중인 초기 첫 화면 대기 상태라면 리로드하지 않고 타이머 유지
                if (btnStart && window.getComputedStyle(btnStart).display !== 'none') {
                    lastActivityTime = Date.now();
                    return;
                }
            }

            returnToMainScreen();
        }
    };

    setInterval(checkIdle, 1000);

    // 1. CSS 인젝션
    const style = document.createElement('style');
    style.innerHTML = `
        .back-btn-ui:active {
            transform: scale(0.90) !important;
            opacity: 0.8;
        }
        .back-btn-ui, #popup-btn-close {
            transition: transform 0.1s, opacity 0.1s;
        }
        #popup-btn-main {
            transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1), filter 0.1s ease;
        }
        #popup-btn-main:active {
            transform: translateY(4px) scale(0.97) !important;
            filter: brightness(0.95);
        }
        #popup-btn-close:active {
            transform: scale(0.90) !important;
            opacity: 0.8;
        }
    `;
    document.head.appendChild(style);

    // 2. HTML 인젝션
    // DOM이 완전히 로드된 후 .screen-container 또는 body에 추가
    document.addEventListener('DOMContentLoaded', () => {
        const container = document.querySelector('.screen-container') // 도로화면 1,2,3
                       || document.querySelector('.game-container')   // 퀴즈1/quiz_game_(4-7)
                       || document.querySelector('#canvas')           // 퀴즈1 전반부
                       || document.querySelector('#intro-scene')      // 퀴즈2(0824)
                       || document.body;

        // 뒤로가기 버튼
        const backBtn = document.createElement('img');
        backBtn.src = '../back_assets/bt-back.svg';
        backBtn.id = 'back-btn';
        backBtn.className = 'back-btn-ui';
        backBtn.draggable = false;
        backBtn.style.cssText = 'position: absolute; top: 40px; left: 40px; z-index: 9999; cursor: pointer; transform-origin: center;';
        container.appendChild(backBtn);

        // 팝업 오버레이
        const popupOverlay = document.createElement('div');
        popupOverlay.id = 'main-popup-overlay';
        popupOverlay.style.cssText = 'display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10000; pointer-events: auto;';

        // 팝업 컨텐츠 래퍼
        const popupContent = document.createElement('div');
        popupContent.className = 'main-popup-group';
        popupContent.style.cssText = 'position: absolute; top: 516.93px; left: 50%; width: 799px; height: 866px; transform: translateX(-50%);';

        // 버튼 영역은 기존처럼 화면 중앙의 801×801 Flex 레이아웃을 사용
        const popupControls = document.createElement('div');
        popupControls.style.cssText = 'position: absolute; top: 50%; left: 50%; width: 801px; height: 801px; z-index: 2; display: flex; flex-direction: column; justify-content: center; align-items: center; transform: translate(-50%, -50%) translateY(30px);';
        
        // 팝업 배경 (back_popup.png)
        const popupBg = document.createElement('img');
        popupBg.src = '../back_assets/back_popup.png';
        popupBg.draggable = false;
        popupBg.style.cssText = 'position: absolute; top: 0; left: 0; width: 799px; height: 866px; z-index: 1; pointer-events: none;';

        // 메인화면으로 버튼
        const btnMain = document.createElement('img');
        btnMain.src = '../back_assets/view-main-bt.svg';
        btnMain.id = 'popup-btn-main';
        btnMain.className = 'popup-btn-ui';
        btnMain.draggable = false;
        btnMain.style.cssText = 'width: 553px; height: 119px; margin-top: 370px; z-index: 2; cursor: pointer; transform-origin: center;';

        // 닫기 버튼 (코드 작성 텍스트)
        const btnClose = document.createElement('div');
        btnClose.id = 'popup-btn-close';
        btnClose.className = 'popup-btn-ui';
        btnClose.textContent = '닫기';
        btnClose.style.cssText = "margin-top: 30px; z-index: 2; font-family: 'Pretendard', sans-serif; font-size: 45px; font-weight: 700; color: #35D047; cursor: pointer; text-align: center; padding: 20px; transform-origin: center;";

        // 조립
        popupContent.appendChild(popupBg);
        popupControls.appendChild(btnMain);
        popupControls.appendChild(btnClose);
        popupOverlay.appendChild(popupContent);
        popupOverlay.appendChild(popupControls);
        container.appendChild(popupOverlay);

        // 3. 이벤트 핸들러
        backBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            popupOverlay.style.display = 'flex';
        });

        const closePopup = (e) => {
            e.stopPropagation();
            popupOverlay.style.display = 'none';
        };
        btnClose.addEventListener('click', closePopup);

        const goMain = (e) => {
            if (e && e.stopPropagation) e.stopPropagation();
            returnToMainScreen();
        };
        btnMain.addEventListener('click', goMain);
        
        // 터치 이벤트 기본 동작 대응 (클릭 지연이나 더블 탭 확대 방지용)
        [backBtn, btnClose, btnMain].forEach(el => {
            el.addEventListener('touchstart', (e) => {
                e.stopPropagation();
                // 패시브 옵션을 통해 스크롤 등 기본 동작은 허용하되, 버튼 눌림 효과(액티브)를 위해 추가
            }, { passive: true });
        });
        
        // 팝업 오버레이 외부 클릭 시 이벤트 전파 방지
        popupOverlay.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        popupOverlay.addEventListener('touchstart', (e) => {
            e.stopPropagation();
        }, { passive: true });

        // --- 숨김 로직 추가 (MutationObserver) ---
        const isPagePopupActive = () => {
            const quiz1Result = document.getElementById('popupWrapper');
            const quiz1Congrats = document.getElementById('congratulationWrapper');
            const quiz2Overlay = document.getElementById('overlay');

            return Boolean(
                (quiz1Result && !quiz1Result.classList.contains('hidden')) ||
                (quiz1Congrats && !quiz1Congrats.classList.contains('hidden')) ||
                (quiz2Overlay && quiz2Overlay.style.display === 'block')
            );
        };

        const updateVisibility = () => {
            let isVisible = true;
            const path = window.location.pathname;

            // 1. 도로화면/scene1.html
            if (path.includes('scene1.html')) {
                const signBubble = document.getElementById('signBubble');
                const bigJeogu1 = document.getElementById('bigJeogu1');
                const bigJeogu2 = document.getElementById('bigJeogu2');
                const quizScreen = document.getElementById('quizScreen');
                
                // 시작 시 말풍선(signBubble)이 없으면 숨김
                if (signBubble && signBubble.style.display !== 'block') {
                    isVisible = false;
                }
                // 끝 전환 시 숨김 (bigJeogu1, bigJeogu2, quizScreen 중 하나라도 보이면 숨김 유지)
                if (bigJeogu1 && bigJeogu1.style.display === 'block') isVisible = false;
                if (bigJeogu2 && bigJeogu2.style.display === 'block') isVisible = false;
                if (quizScreen && quizScreen.classList.contains('active')) isVisible = false;
            }
            
            // 2. 도로화면/scene2.html
            else if (path.includes('scene2.html')) {
                const bigJeogu1 = document.getElementById('bigJeogu1');
                const bigJeogu2 = document.getElementById('bigJeogu2');
                const quizScreen = document.getElementById('quizScreen');
                
                // 끝 전환 시 숨김
                if (bigJeogu1 && bigJeogu1.style.display === 'block') isVisible = false;
                if (bigJeogu2 && bigJeogu2.style.display === 'block') isVisible = false;
                if (quizScreen && quizScreen.classList.contains('active')) isVisible = false;
            }
            
            // 3. 퀴즈1 전반부/index.html
            else if (path.includes('%ED%80%B4%EC%A6%881%20%EC%A0%84%EB%B0%98%EB%B6%80') || path.includes('퀴즈1 전반부')) {
                const questionPrompt = document.getElementById('question-prompt');
                if (questionPrompt && questionPrompt.classList.contains('is-visible')) {
                    isVisible = false;
                }
            }
            
            // 4. 퀴즈2(0824)/integrated.html
            else if (path.includes('%ED%80%B4%EC%A6%882') || path.includes('퀴즈2')) {
                const quizCard = document.getElementById('quiz-card');
                const carouselWrap = document.getElementById('carousel-wrap');
                const quizScene = document.getElementById('quiz-scene');
                
                // intro-scene 쪽에 머물러 있을 때만 특정 요소 표시 시 백버튼 숨김
                if (!quizScene || quizScene.style.display !== 'block') {
                    if (quizCard && quizCard.style.display === 'block') isVisible = false;
                    if (carouselWrap && carouselWrap.classList.contains('visible')) isVisible = false;
                }
            }

            backBtn.style.display = isVisible ? 'block' : 'none';
            const isPopupActive = isPagePopupActive();
            const isQuiz2 = path.includes('%ED%80%B4%EC%A6%882') || path.includes('퀴즈2');
            const popupBackButtonZ = isQuiz2 ? '150' : '90';
            backBtn.style.zIndex = isPopupActive ? popupBackButtonZ : '9999';
            backBtn.style.pointerEvents = isPopupActive ? 'none' : 'auto';
        };

        // 초기 상태 설정
        updateVisibility();

        // 상태 변화 감지 (style, class 변경) - rAF 스로틀링 적용으로 프레임 드랍 방지
        let isObserverScheduled = false;
        const observer = new MutationObserver(() => {
            if (isObserverScheduled) return;
            isObserverScheduled = true;
            requestAnimationFrame(() => {
                isObserverScheduled = false;
                updateVisibility();

                const path = window.location.pathname;
                if (path.includes('%ED%80%B4%EC%A6%882') || path.includes('퀴즈2')) {
                    const introScene = document.getElementById('intro-scene');
                    const quizScene = document.getElementById('quiz-scene');
                    
                    if (quizScene && quizScene.style.display === 'block' && backBtn.parentElement !== quizScene) {
                        quizScene.appendChild(backBtn);
                        quizScene.appendChild(popupOverlay);
                    } else if (introScene && introScene.style.display !== 'none' && backBtn.parentElement !== introScene) {
                        introScene.appendChild(backBtn);
                        introScene.appendChild(popupOverlay);
                    }
                }
            });
        });

        // 감지할 대상 요소들
        const targets = [
            'signBubble', 'bigJeogu1', 'bigJeogu2', 'quizScreen', 
            'question-prompt', 'quiz-scene', 'quiz-card', 'carousel-wrap',
            'popupWrapper', 'congratulationWrapper', 'overlay', 'congratulation-wrap'
        ];
        
        targets.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                observer.observe(el, { attributes: true, attributeFilter: ['style', 'class'] });
            }
        });
    });
})();
