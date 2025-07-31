/// ВЕСЬ ЭТОТ КОД ПРЕДНАЗНАЧЕН ДЛЯ ФАЙЛА app.js (ПОЛНАЯ ЗАМЕНА)

document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('app-container');
    let currentPageCleanup = null;
    

    function cleanup() {
        if (typeof currentPageCleanup === 'function') {
            currentPageCleanup();
        }
        currentPageCleanup = null;
        appContainer.innerHTML = '';
        window.scrollTo(0, 0); 
    }


function renderMainMenu() {
    cleanup();
    appContainer.innerHTML = `
        <h1 id="main-menu-title">Тренажер игры в палочки</h1>
        <div id="main-menu">
            <button class="menu-button" data-mode="standard">Режим: Стандартный</button>
            <button class="menu-button" data-mode="interval">Режим: Интервальный</button>
            <button class="menu-button" data-mode="consecutive">Режим: Подряд</button>
            <button class="menu-button" data-mode="consecutive_interval">Режим: Подряд и интервально</button>
            <button class="menu-button" data-mode="special">Режим: Особый</button>
            <button class="menu-button" data-action="tutorial">Обучение</button>
            <button class="menu-button" data-action="strategies">Готовые стратегии</button>
        </div>
    `;
    appContainer.querySelector('#main-menu').addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        const mode = e.target.dataset.mode;

        if (mode) {
            renderPreGameSetup(mode);
        } else if (action === 'tutorial') {
            // ИЗМЕНЕНИЕ: Переадресация на страницу обучения
            window.location.href = 'tutorial.html';
        } else if (action === 'strategies') {
            window.location.href = 'strategies.html';
        } else if (action === 'info') {
            alert('Этот раздел скоро появится!');
        }
    });
}

    // --- Функция для отрисовки экрана Пре-настроек ---
    function renderPreGameSetup(mode) {
        cleanup();
        const setupDiv = document.createElement('div');
        setupDiv.id = 'setup-screen';

        setupDiv.innerHTML = `
            <h2>Настройка режима</h2>
            <p class="setup-control">
                <label for="initial-sticks">Начальное кол-во палочек (5-50):</label>
                <input type="number" id="initial-sticks" value="20" min="5" max="50">
            </p>
        `;

        const createInput = (labelText, inputId, defaultValue) => `<p class="setup-control"><label>${labelText}</label><input type="number" id="${inputId}" value="${defaultValue}" min="1"></p>`;
        
        switch (mode) {
            case 'standard':
                setupDiv.innerHTML += createInput('Взять от 1 до k =', 'param-k', 3);
                break;
            case 'interval':
                setupDiv.innerHTML += createInput('Взять от a =', 'param-a', 2) + createInput('до b =', 'param-b', 4);
                break;
            case 'consecutive':
                setupDiv.innerHTML += createInput('Взять от 1 до k =', 'param-k', 3);
                break;
            case 'consecutive_interval':
                setupDiv.innerHTML += createInput('Взять от a =', 'param-a', 2) + createInput('до b =', 'param-b', 4);
                break;
            case 'special':
                setupDiv.innerHTML += `<p>Правила: 1 любая, 2 любые или 3 подряд.</p>`;
                break;
        }

        setupDiv.innerHTML += `
            <div class="turn-selector">
                <span>Кто ходит первым:</span>
                <input type="radio" id="turn-player" name="first-turn" value="player" checked><label for="turn-player">Игрок</label>
                <input type="radio" id="turn-opponent" name="first-turn" value="opponent"><label for="turn-opponent">Соперник</label>
            </div>
            <p id="validation-warning"></p>
            <button class="menu-button" id="start-game-btn">Играть!</button>
        `;
        appContainer.appendChild(setupDiv);

        const n_input = document.getElementById('initial-sticks');
        const k_input = document.getElementById('param-k');
        const a_input = document.getElementById('param-a');
        const b_input = document.getElementById('param-b');
        const startGameBtn = document.getElementById('start-game-btn');
        const warningP = document.getElementById('validation-warning');

        function validateSettings() {
            const n = parseInt(n_input.value);
            if (isNaN(n) || n < 5 || n > 50) return { valid: false, message: 'Общее кол-во палочек должно быть от 5 до 50.' };

            if (k_input) {
                const k = parseInt(k_input.value);
                if (isNaN(k) || k < 1 || k > n) return { valid: false, message: 'Параметр k должен быть от 1 до ' + n + '.' };
            }
            if (a_input && b_input) {
                const a = parseInt(a_input.value);
                const b = parseInt(b_input.value);
                if (isNaN(a) || a < 2 || a > n) return { valid: false, message: 'Параметр a должен быть от 2 до ' + n + '.' };
                if (isNaN(b) || b < a || b > n) return { valid: false, message: 'Параметр b должен быть от a (' + a + ') до ' + n + '.'};
            }
            return { valid: true, message: '' };
        }

        function runValidationAndUpdateUI() {
            const result = validateSettings();
            startGameBtn.disabled = !result.valid;
            warningP.textContent = result.message;
        }

        const inputsToWatch = [n_input, k_input, a_input, b_input].filter(el => el !== null);
        inputsToWatch.forEach(input => {
            input.addEventListener('input', runValidationAndUpdateUI);
        });

        runValidationAndUpdateUI();
        
        startGameBtn.addEventListener('click', () => {
            const gameSettings = { mode: mode };
            gameSettings.initialSticks = parseInt(n_input.value);
            if (k_input) gameSettings.k = parseInt(k_input.value);
            if (a_input) gameSettings.a = parseInt(a_input.value);
            if (b_input) gameSettings.b = parseInt(b_input.value);
            gameSettings.isPlayerFirst = document.querySelector('input[name="first-turn"]:checked').value === 'player';

            if (mode === 'special' && gameSettings.initialSticks > 30 && grundyValues === null) {
                showCacheModal(gameSettings);
            } else {
                currentPageCleanup = renderGamePage(appContainer, gameSettings, renderMainMenu);
            }
        });
    }

    function showCacheModal(gameSettings) {
        const overlay = document.createElement('div');
        overlay.id = 'modal-overlay';
        overlay.innerHTML = `
            <div id="modal-content">
                <h3>Требуется кэш для "Особого режима"</h3>
                <p>Для игры с ${gameSettings.initialSticks} палочками требуется большой объем вычислений. Вы можете загрузить его с сервера, из файла или рассчитать сейчас.</p>
                <div class="modal-buttons">
                    <button class="menu-button" id="load-server-btn">Загрузить с сервера</button>
                    <button class="menu-button" id="load-file-btn">Загрузить из файла</button>
                    <button class="menu-button" id="calc-cache-btn">Рассчитать</button>
                </div>
                <input type="file" id="file-input" accept=".json" style="display: none;">
                <div id="progress-bar-container" style="display: none;">
                     <div id="progress-bar">0%</div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        const modalContent = document.getElementById('modal-content');
        const fileInput = document.getElementById('file-input');
        const buttonsDiv = modalContent.querySelector('.modal-buttons');
        const messageP = modalContent.querySelector('p');

        document.getElementById('load-server-btn').onclick = () => {
            buttonsDiv.style.display = 'none';
            messageP.textContent = 'Загрузка кэша с сервера...';
            
            fetch('cache.json')
                .then(response => {
                    if (!response.ok) throw new Error(`Ошибка сети: ${response.statusText}`);
                    return response.json();
                })
                .then(parsedJson => {
                    try {
                        grundyValues = new Map(parsedJson); // ИСПРАВЛЕННАЯ СТРОКА
                        messageP.textContent = 'Кэш успешно загружен и обработан!';
                        setTimeout(() => {
                            document.body.removeChild(overlay);
                            currentPageCleanup = renderGamePage(appContainer, gameSettings, renderMainMenu);
                        }, 1500);
                    } catch (mapError) {
                        throw new Error("Не удалось создать Map из JSON. Убедитесь, что формат файла правильный (массив пар).");
                    }
                })
                .catch(error => {
                    console.error('Ошибка при загрузке кэша с сервера:', error);
                    messageP.textContent = 'Не удалось загрузить кэш. Проверьте консоль.';
                });
        };

        document.getElementById('load-file-btn').onclick = () => fileInput.click();
        
        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            buttonsDiv.style.display = 'none';
            messageP.textContent = 'Чтение файла...';
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const parsedJson = JSON.parse(event.target.result);
                    grundyValues = new Map(parsedJson); // ИСПРАВЛЕННАЯ СТРОКА
                    messageP.textContent = 'Кэш успешно загружен и обработан!';
                    setTimeout(() => {
                        document.body.removeChild(overlay);
                        currentPageCleanup = renderGamePage(appContainer, gameSettings, renderMainMenu);
                    }, 1500);
                } catch (error) {
                    messageP.textContent = 'Ошибка! Неверный формат JSON или не удалось создать Map.';
                }
            };
            reader.readAsText(file);
        };
        
        document.getElementById('calc-cache-btn').onclick = () => {
            buttonsDiv.style.display = 'none';
            messageP.textContent = 'Идет расчет... Это может занять от 3 до 5-7 минут в зависимости от мощности компа и даже больше.';
            grundyValues = gGen_5(gameSettings.initialSticks);
            document.body.removeChild(overlay);
            currentPageCleanup = renderGamePage(appContainer, gameSettings, renderMainMenu);;
        };
    }

    // --- Начальная загрузка приложения ---
    renderMainMenu();
});