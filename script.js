(function() {
    // ========== НАСТРОЙКИ TELEGRAM ==========
    const BOT_TOKEN = '8704242436:AAFyBhpDfJV2RYPhpWCnMAkOEoR347N0k9I';
    const CHAT_ID = '704917538';
    // ========================================

    const modalOverlay = document.getElementById('modalOverlay');
    const firstScreen = document.getElementById('firstScreen');
    const btnYes = document.getElementById('btnYes');
    const btnNo = document.getElementById('btnNo');
    const meetingArea = document.getElementById('meetingArea');
    const placeInput = document.getElementById('placeInput');
    const timeInput = document.getElementById('timeInput');
    const sendBtn = document.getElementById('sendBtn');
    const sendingStatus = document.getElementById('sendingStatus');
    const hintText = document.getElementById('hintText');
    const thankYouArea = document.getElementById('thankYouArea');
    const closeBtn = document.getElementById('closeBtn');
    const invitationCard = document.getElementById('invitationCard');

    let isNoFloating = false;
    let floatingBtn = null;
    let isSending = false;

    // ----- Функция отправки в Telegram -----
    async function sendToTelegram(message) {
        if (!BOT_TOKEN || BOT_TOKEN === 'ВАШ_ТОКЕН_БОТА') {
            sendingStatus.textContent = '⚠️ Бот не настроен.';
            sendingStatus.className = 'sending-status visible error';
            return false;
        }

        if (!CHAT_ID || CHAT_ID === 'ВАШ_CHAT_ID') {
            sendingStatus.textContent = '⚠️ Chat ID не настроен.';
            sendingStatus.className = 'sending-status visible error';
            return false;
        }

        isSending = true;
        sendBtn.disabled = true;
        sendingStatus.textContent = '⏳ Отправка...';
        sendingStatus.className = 'sending-status visible';

        try {
            const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
            sendBtn.disabled = false;
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

    // ----- Показать благодарность -----
    function showThankYou() {
        meetingArea.classList.remove('active');
        meetingArea.style.display = 'none';
        thankYouArea.classList.add('active');
    }

    // ----- Закрыть модалку полностью -----
    function closeModal() {
        modalOverlay.classList.add('hidden');
        if (floatingBtn) {
            floatingBtn.remove();
            floatingBtn = null;
            isNoFloating = false;
        }
        invitationCard.style.opacity = '1';
    }

    // ----- Обработчики -----
    btnYes.addEventListener('click', function() {
        if (floatingBtn) {
            floatingBtn.remove();
            floatingBtn = null;
            isNoFloating = false;
        }

        firstScreen.style.display = 'none';
        meetingArea.classList.add('active');
        meetingArea.style.display = 'block';

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

    // ----- Отправка данных -----
    function handleSend() {
        if (isSending) return;

        const place = placeInput.value.trim();
        const time = timeInput.value;

        if (place.length < 2) {
            placeInput.style.borderColor = '#b05a5a';
            placeInput.style.boxShadow = '0 0 0 4px rgba(176, 90, 90, 0.12)';
            sendingStatus.textContent = '✏️ Напиши место (минимум 2 символа)';
            sendingStatus.className = 'sending-status visible';
            setTimeout(() => {
                placeInput.style.borderColor = '#ddd0ca';
                placeInput.style.boxShadow = '';
            }, 300);
            placeInput.focus();
            return;
        }

        if (!time) {
            timeInput.style.borderColor = '#b05a5a';
            timeInput.style.boxShadow = '0 0 0 4px rgba(176, 90, 90, 0.12)';
            sendingStatus.textContent = '🕒 Выбери время встречи';
            sendingStatus.className = 'sending-status visible';
            setTimeout(() => {
                timeInput.style.borderColor = '#ddd0ca';
                timeInput.style.boxShadow = '';
            }, 300);
            timeInput.focus();
            return;
        }

        const dateObj = new Date(time);
        const formattedTime = dateObj.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const message = `📍 <b>Новая встреча!</b>\n\n🏠 Место: ${place}\n🕒 Время: ${formattedTime}\n\n👤 От кого: сайт приглашения`;

        sendToTelegram(message).then(success => {
            if (success) {
                // Визуальный фидбек
                placeInput.style.borderColor = '#7a9a7a';
                placeInput.style.boxShadow = '0 0 0 4px rgba(90, 130, 100, 0.15)';
                timeInput.style.borderColor = '#7a9a7a';
                timeInput.style.boxShadow = '0 0 0 4px rgba(90, 130, 100, 0.15)';
                
                // Показываем благодарность
                setTimeout(() => {
                    showThankYou();
                }, 400);

                // Автоматическое закрытие через 4 секунды
                setTimeout(() => {
                    closeModal();
                }, 4000);
            }
        });
    }

    // ----- Обработчики отправки -----
    sendBtn.addEventListener('click', handleSend);

    placeInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSend();
        }
    });

    timeInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSend();
        }
    });

    // ----- Кнопка "Закрыть" на экране благодарности -----
    closeBtn.addEventListener('click', closeModal);

    // ----- Клик по оверлею (закрытие только если благодарность показана) -----
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            if (thankYouArea.classList.contains('active')) {
                closeModal();
            } else if (meetingArea.classList.contains('active')) {
                // Если поля не заполнены — фокус на первое
                placeInput.focus();
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