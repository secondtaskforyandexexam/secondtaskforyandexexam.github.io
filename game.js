// ВЕСЬ ЭТОТ КОД ПРЕДНАЗНАЧЕН ДЛЯ ФАЙЛА game.js (ПОЛНАЯ ЗАМЕНА)

function renderGamePage(appContainer, gameSettings, onExitCallback) {
    console.log("Игра запущена с настройками:", gameSettings);

    appContainer.innerHTML = `
        <div id="turn-indicator"><p id="turn-text"></p></div>
        <div id="container" class="container"></div>
        <div id="game-controls">
            <button id="exit-game-btn">Выход в меню</button>
            <button id="take-button">Забрать</button>
        </div>
    `;

    const container = document.getElementById('container');
    const takeButton = document.getElementById('take-button');
    const exitGameBtn = document.getElementById('exit-game-btn');

    let isGameFinished = false; // НОВЫЙ ФЛАГ
    const CONTAINER_RESIZE_DURATION_MS = 400;
    const STICK_FADE_DURATION_MS = 200;
    const fragmentColors = ['#FFADAD', '#FFD6A5', '#FDFFB6', '#CAFFBF', '#9BF6FF', '#A0C4FF', '#BDB2FF', '#FFC6FF', '#E4C1F9', '#F6E4F6', '#FFF3E1', '#D4E09B', '#F5D2D3', '#BDE4A7', '#C8B8DB', '#D7BCE8', '#EFC3E6', '#FAD4D8', '#FFDAB9', '#E6E6FA', '#D8BFD8', '#ADD8E6', '#F0E68C', '#90EE90', '#FFA07A'];
    let isDragging = false;
    let selectionBox = null;
    let startX = 0;
    let startY = 0;

    function toggleTurn(isOpponent) {
        const turnIndicator = document.getElementById('turn-indicator');
        const turnText = document.getElementById('turn-text');
        if (!turnIndicator || !turnText) return;
        if (isOpponent) {
            turnIndicator.className = 'opponent-turn';
            turnText.textContent = 'Ход соперника';
            takeButton.classList.remove('visible');
        } else {
            turnIndicator.className = 'your-turn';
            turnText.textContent = 'Ваш ход';
            takeButton.classList.add('visible');
        }
    }

    function createStickElements(fragments) {
        const elements = [];
        fragments.forEach((count, index) => {
            const color = fragmentColors[index % fragmentColors.length];
            for (let i = 0; i < count; i++) {
                const stick = document.createElement('div');
                stick.className = 'stick';
                stick.style.backgroundColor = color;
                elements.push(stick);
            }
            if (index < fragments.length - 1) {
                const emptySpace = document.createElement('div');
                emptySpace.className = 'empty-space';
                elements.push(emptySpace);
            }
        });
        return elements;
    }

    function calculateTargetHeight(fragments, targetWidth) {
        const clone = container.cloneNode(false);
        clone.style.position = 'absolute'; clone.style.left = '-9999px'; clone.style.visibility = 'hidden'; clone.style.height = 'auto'; clone.style.width = targetWidth + 'px';
        const newElements = createStickElements(fragments);
        clone.append(...newElements);
        document.body.appendChild(clone);
        const height = clone.scrollHeight;
        document.body.removeChild(clone);
        return height;
    }

    function calculateNewPosition() {
        const newFragments = []; let currentFragmentLength = 0;
        for (const element of container.children) {
            if (element.classList.contains('stick')) {
                if (!element.classList.contains('selected')) { currentFragmentLength++; } else { if (currentFragmentLength > 0) newFragments.push(currentFragmentLength); currentFragmentLength = 0; }
            }
            if (element.classList.contains('empty-space')) { if (currentFragmentLength > 0) newFragments.push(currentFragmentLength); currentFragmentLength = 0; }
        }
        if (currentFragmentLength > 0) newFragments.push(currentFragmentLength);
        return newFragments.filter(count => count > 0);
    }

    function checkCollision(rect1, rect2) { return !(rect1.right < rect2.left || rect1.left > rect2.right || rect1.bottom < rect2.top || rect1.top > rect2.bottom); }
    function getModeParams(settings) {
        switch (settings.mode) {
            case 'standard': case 'consecutive': return { min: 1, max: settings.k };
            case 'interval': case 'consecutive_interval': return { min: settings.a, max: settings.b };
            default: return { min: 0, max: 0 };
        }
    }

    function canAnyoneMove(position, mode, params) {
        if (position.length === 0 || position.every(p => p === 0)) { return false; }
        const totalSticks = position.reduce((sum, fragment) => sum + fragment, 0);
        const longestFragment = Math.max(0, ...position);
        switch (mode) {
            case 'standard': case 'interval': return totalSticks >= params.min;
            case 'consecutive': case 'consecutive_interval': return longestFragment >= params.min;
            case 'special': return totalSticks >= 1 || longestFragment >= 3;
            default: console.error("Неизвестный режим в canAnyoneMove:", mode); return false;
        }
    }

    function showEndGameModal(isPlayerWinner) {
        isGameFinished = true;
        const overlay = document.createElement('div');
        overlay.id = 'end-game-overlay';
        const resultClass = isPlayerWinner ? 'victory' : 'defeat';
        const resultText = isPlayerWinner ? 'Победа!' : 'Поражение';
        overlay.innerHTML = `<div id="end-game-modal"><h2 class="${resultClass}">${resultText}</h2><button class="menu-button" id="modal-exit-btn">Выход в меню</button></div>`;
        document.body.appendChild(overlay);
        document.getElementById('modal-exit-btn').addEventListener('click', () => {
            document.body.removeChild(overlay);
            onExitCallback();
        });
    }

    function checkGameEnd(currentPosition, isOpponentAboutToPlay) {
        if (isGameFinished) return;
        const params = getModeParams(gameSettings);
        if (!canAnyoneMove(currentPosition, gameSettings.mode, params)) {
            const isPlayerWinner = isOpponentAboutToPlay;
            showEndGameModal(isPlayerWinner);
        }
    }

    function updateBoard(fragments, isOpponentTurn = false) {
        if (isGameFinished) return;
        toggleTurn(isOpponentTurn);
        const elementWidth = 30 + 5;
        const requiredWidth = (fragments.reduce((sum, count) => sum + count, 0) + (fragments.length - 1)) * elementWidth;
        const containerMaxWidth = document.body.clientWidth * 0.8;
        const newWidth = requiredWidth < containerMaxWidth ? requiredWidth : containerMaxWidth;
        container.classList.add('container--updating');
        setTimeout(() => {
            container.style.height = container.clientHeight + 'px';
            container.innerHTML = '';
            const newElements = createStickElements(fragments);
            container.append(...newElements);
            const targetHeight = calculateTargetHeight(fragments, newWidth);
            container.style.width = newWidth + 'px';
            container.style.height = targetHeight + 'px';
        }, STICK_FADE_DURATION_MS);
        setTimeout(() => {
            container.classList.remove('container--updating');
            container.style.height = '';
            checkGameEnd(fragments, isOpponentTurn);
        }, STICK_FADE_DURATION_MS + CONTAINER_RESIZE_DURATION_MS);
    }

    function makeComputerMove(currentPosition) {
        if (isGameFinished) return;
        console.log("Ход соперника...");
        let computerMovePosition;
        const currentParams = getModeParams(gameSettings);
        switch (gameSettings.mode) {
            case 'standard': case 'interval': computerMovePosition = move_1_2(currentPosition, currentParams.min, currentParams.max); break;
            case 'consecutive': case 'consecutive_interval': computerMovePosition = move_3_4(currentPosition, currentParams.min, currentParams.max); break;
            case 'special': computerMovePosition = move_5(currentPosition); break;
        }
        console.log("Соперник сделал ход. Новая позиция:", computerMovePosition);
        updateBoard(computerMovePosition, false);
    }

    function handleMouseDown(e) { if(e.ctrlKey){ e.preventDefault(); isDragging = true; startX = e.clientX; startY = e.clientY; selectionBox = document.createElement('div'); selectionBox.id = 'selection-box'; document.body.appendChild(selectionBox); selectionBox.style.left = `${startX}px`; selectionBox.style.top = `${startY}px`; } }
    function handleMouseMove(e) { if (!isDragging) return; const newX = Math.min(startX, e.clientX); const newY = Math.min(startY, e.clientY); selectionBox.style.left = `${newX}px`; selectionBox.style.top = `${newY}px`; selectionBox.style.width = `${Math.abs(startX - e.clientX)}px`; selectionBox.style.height = `${Math.abs(startY - e.clientY)}px`; }
    function handleMouseUp(e) { if (isDragging) { isDragging = false; const boxRect = selectionBox.getBoundingClientRect(); document.querySelectorAll('.stick').forEach(stick => { if (checkCollision(boxRect, stick.getBoundingClientRect())) { stick.classList.toggle('selected'); } }); document.body.removeChild(selectionBox); selectionBox = null; } else if (e.target.classList.contains('stick')) { e.target.classList.toggle('selected'); } }

    function handleTakeButtonClick() {
        if (isGameFinished) return;
        let positionBefore = []; let currentLength = 0;
        for (const el of container.children) { if (el.classList.contains('stick')) currentLength++; if (el.classList.contains('empty-space')) { if(currentLength > 0) positionBefore.push(currentLength); currentLength = 0; } }
        if (currentLength > 0) positionBefore.push(currentLength);
        const positionAfter = calculateNewPosition();
        const params = getModeParams(gameSettings);
        let isMoveValid = false;
        switch (gameSettings.mode) {
            case 'standard': case 'interval': isMoveValid = mode_1_2_check(positionBefore, positionAfter, params.min, params.max); break;
            case 'consecutive': case 'consecutive_interval': isMoveValid = mode_3_4_check(positionBefore, positionAfter, params.min, params.max); break;
            case 'special': isMoveValid = mode_5_check(positionBefore, positionAfter); break;
        }
        if (isMoveValid) {
            updateBoard(positionAfter, true);
            setTimeout(() => makeComputerMove(positionAfter), 2000);
        } else {
            alert("Неверный ход! Пожалуйста, проверьте правила для текущего режима.");
        }
    }

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    takeButton.addEventListener('click', handleTakeButtonClick);
    exitGameBtn.addEventListener('click', onExitCallback);

    const initialPosition = [gameSettings.initialSticks];
    updateBoard(initialPosition, !gameSettings.isPlayerFirst);

    if (!gameSettings.isPlayerFirst) {
        setTimeout(() => makeComputerMove(initialPosition), 2000);
    }

    return function cleanup() {
        console.log("Уборка слушателей игры...");
        document.removeEventListener('mousedown', handleMouseDown);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        gNumbers = [];
        grundyValues = null;
    }
}