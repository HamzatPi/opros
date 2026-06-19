(function() {
    // ========== НАСТРОЙКИ TELEGRAM ==========
    const BOT_TOKEN = '8704242436:AAFyBhpDfJV2RYPhpWCnMAkOEoR347N0k9I';
    const CHAT_ID = '704917538';
    // ========================================

    const modalOverlay = document.getElementById('modalOverlay');
    const btnYes = document.getElementById('btnYes');
    const btnNo = document.getElementById('btnNo');
    const meetingArea = document.getElementById('meetingArea');
    const placeInput = document.getElementById('placeInput');
    const invitationCard = document.getElementById('invitationCard');
    const sendingStatus = document.getElementById('sendingStatus');
    const hintText = document.getElementById('hintText');

    let isNoFloating = false;
    let floatingBtn = null;
    let isSending = false;

    // ----- Функция отправки в Telegram -----
    async function sendToTelegram(message) {
        if (!BOT_TOKEN || BOT_TOKEN === 'ВАШ_ТОКЕН_БОТА') {
            sendingStatus.textContent = '⚠️ Бот не настроен. Вставьте токен и chat_id в код.';
            sendingStatus.className = 'sending-status visible error';
            return false;
        }

        if (!CHAT_ID || CHAT_ID === 'ВАШ_CHAT_ID') {
            sendingStatus.textContent = '⚠️ Chat ID не настроен. Получите его у @userinfobot.';
            sendingStatus.className = 'sending-status visible error';
            return false;
        }

        isSending = true;
        sendingStatus.textContent = '⏳ Отправка...';
        sendingStatus.className = 'sending-status visible';

        try {
            const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: CHAT_ID,
                    text: message,
                    parse_mode: 'HTML',
                }),
            });

            const data = await response.json();

            if (data.ok) {
                sendingStatus.textContent = '✅ Сообщение отправлено!';
                sendingStatus.className = 'sending-status visible success';
                hintText.textContent = 'Отлично, жду';
                return true;
            } else {
                console.error('Telegram API error:', data);
                sendingStatus.textContent = `❌ Ошибка: ${data.description || 'Неизвестная ошибка'}`;
                sendingStatus.className = 'sending-status visible error';
                return false;
            }
        } catch (error) {
            console.error('Network error:', error);
            sendingStatus.textContent = '❌ Ошибка сети. Проверьте интернет.';
            sendingStatus.className = 'sending-status visible error';
            return false;
        } finally {
            isSending = false;
        }
    }

    // ----- Функции для "убегающей" кнопки -----
    function createFloatingNoButton() {
        if (floatingBtn) {
            floatingBtn.remove();
            floatingBtn = null;
        }

        const floatBtn = document.createElement('button');
        floatBtn.className = 'btn-no no-float';
        floatBtn.textContent = 'Нет';
        document.body.appendChild(floatBtn);
        floatingBtn = floatBtn;

        setRandomPosition(floatBtn, true);

        floatBtn.addEventListener('mouseover', function(e) {
            setRandomPosition(floatBtn, false);
        });

        floatBtn.addEventListener('touchstart', function(e) {
            e.preventDefault();
            setRandomPosition(floatBtn, false);
        });

        floatBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            setRandomPosition(floatBtn, false);
        });

        return floatBtn;
    }

    function setRandomPosition(element, isInitial = false) {
        if (!element) return;

        const winWidth = window.innerWidth;
        const winHeight = window.innerHeight;
        const btnWidth = element.offsetWidth || 140;
        const btnHeight = element.offsetHeight || 60;

        const margin = 20;
        const maxX = Math.max(winWidth - btnWidth - margin, margin);
        const maxY = Math.max(winHeight - btnHeight - margin, margin);

        let randomX = Math.floor(Math.random() * (maxX - margin + 1)) + margin;
        let randomY = Math.floor(Math.random() * (maxY - margin + 1)) + margin;

        element.style.position = 'fixed';
        element.style.left = randomX + 'px';
        element.style.top = randomY + 'px';
        element.style.transform = `rotate(${Math.random() * 4 - 2}deg)`;
    }

    function repositionFloatingButton() {
        if (floatingBtn && isNoFloating) {
            setRandomPosition(floatingBtn, false);
        }
    }

    // ----- Обработчики -----
    btnYes.addEventListener('click', function() {
        if (floatingBtn) {
            floatingBtn.remove();
            floatingBtn = null;
            isNoFloating = false;
        }

        const buttonRow = document.getElementById('buttonRow');
        if (buttonRow) {
            buttonRow.style.display = 'none';
        }

        meetingArea.classList.add('active');

        setTimeout(() => {
            placeInput.focus();
        }, 300);

        btnYes.style.transform = 'scale(0.96)';
        setTimeout(() => { btnYes.style.transform = ''; }, 200);
    });

    btnNo.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        if (!isNoFloating) {
            btnNo.style.display = 'none';
            createFloatingNoButton();
            isNoFloating = true;
        } else {
            if (floatingBtn) {
                setRandomPosition(floatingBtn, false);
            }
        }
    });

    btnNo.addEventListener('mouseenter', function(e) {
        if (!isNoFloating && btnNo.style.display !== 'none') {
            btnNo.style.display = 'none';
            createFloatingNoButton();
            isNoFloating = true;
        }
    });

    btnNo.addEventListener('touchstart', function(e) {
        if (!isNoFloating && btnNo.style.display !== 'none') {
            e.preventDefault();
            btnNo.style.display = 'none';
            createFloatingNoButton();
            isNoFloating = true;
        }
    }, { passive: false });

    window.addEventListener('resize', repositionFloatingButton);

    // ----- Отправка при вводе места -----
    placeInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && this.value.trim().length > 2 && !isSending) {
            const place = this.value.trim();
            
            const message = `📍 <b>Новая встреча!</b>\n\nМесто и время: ${place}\n\n👤 От кого: сайт приглашения`;
            
            sendToTelegram(message).then(success => {
                if (success) {
                    this.style.borderColor = '#7a9a7a';
                    this.style.boxShadow = '0 0 0 4px rgba(90, 130, 100, 0.15)';
                    setTimeout(() => {
                        this.style.borderColor = '#ddd0ca';
                        this.style.boxShadow = '';
                    }, 300);
                    
                    setTimeout(() => {
                        modalOverlay.classList.add('hidden');
                        if (floatingBtn) {
                            floatingBtn.remove();
                            floatingBtn = null;
                            isNoFloating = false;
                        }
                        invitationCard.style.opacity = '1';
                    }, 1500);
                }
            });
        } else if (e.key === 'Enter' && this.value.trim().length <= 2) {
            this.style.borderColor = '#b05a5a';
            this.style.boxShadow = '0 0 0 4px rgba(176, 90, 90, 0.12)';
            sendingStatus.textContent = '✏️ Напиши место и время (минимум 3 символа)';
            sendingStatus.className = 'sending-status visible';
            setTimeout(() => {
                this.style.borderColor = '#ddd0ca';
                this.style.boxShadow = '';
            }, 300);
        }
    });

    // ----- Клик по оверлею -----
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            if (meetingArea.classList.contains('active') && placeInput.value.trim().length > 0) {
                if (sendingStatus.textContent.includes('отправлено')) {
                    modalOverlay.classList.add('hidden');
                    if (floatingBtn) {
                        floatingBtn.remove();
                        floatingBtn = null;
                        isNoFloating = false;
                    }
                    invitationCard.style.opacity = '1';
                }
            } else if (meetingArea.classList.contains('active')) {
                placeInput.focus();
                placeInput.placeholder = 'Напиши место и время';
                setTimeout(() => {
                    placeInput.placeholder = 'Напиши место и время';
                }, 2000);
            }
        }
    });

    invitationCard.style.opacity = '0.8';

    if (BOT_TOKEN === 'ВАШ_ТОКЕН_БОТА' || CHAT_ID === 'ВАШ_CHAT_ID') {
        console.warn('⚠️ Telegram не настроен. Вставьте BOT_TOKEN и CHAT_ID в код.');
    } else {
        console.log('✅ Telegram настроен. Жду ответов...');
    }
})();