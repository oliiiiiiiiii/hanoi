// script.js
let gameState = {
    towers: [[], [], []],
    selectedDisk: null,
    selectedTower: null,
    moves: 0,
    diskCount: 3,
    gameWon: false,
    startTime: null,
    timerInterval: null,
    elapsedTime: 0
};

function startGame() {
    showPage('gamePage');
    initGame(3);
    startTimer();
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

function startTimer() {
    gameState.startTime = Date.now();
    gameState.timerInterval = setInterval(updateTimer, 1000);
}

function stopTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

function updateTimer() {
    if (gameState.startTime) {
        gameState.elapsedTime = Date.now() - gameState.startTime;
        const seconds = Math.floor(gameState.elapsedTime / 1000);
        const minutes = Math.floor(seconds / 60);
        const displaySeconds = seconds % 60;
        document.getElementById('timer').textContent =
            `${minutes.toString().padStart(2, '0')}:${displaySeconds.toString().padStart(2, '0')}`;
    }
}

function formatTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const displaySeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${displaySeconds.toString().padStart(2, '0')}`;
}

function initGame(diskCount = 3) {
    gameState.towers = [[], [], []];
    gameState.selectedDisk = null;
    gameState.selectedTower = null;
    gameState.moves = 0;
    gameState.diskCount = diskCount;
    gameState.gameWon = false;

    for (let i = diskCount; i >= 1; i--) {
        gameState.towers[0].push(i);
    }

    updateDisplay();
    updateMoves();
    updateMinMoves();
}

function updateDisplay() {
    const towers = document.querySelectorAll('.tower');

    towers.forEach((tower, towerIndex) => {
        const existingDisks = tower.querySelectorAll('.disk');
        existingDisks.forEach(disk => disk.remove());

        gameState.towers[towerIndex].forEach((diskSize, index) => {
            const disk = document.createElement('div');
            disk.className = `disk disk-${diskSize}`;
            disk.textContent = diskSize;
            disk.onclick = () => selectDisk(towerIndex, diskSize);
            disk.style.position = 'absolute';
            disk.style.bottom = `${20 + index * 27}px`;
            disk.style.zIndex = 10 + index;
            tower.appendChild(disk);
        });
    });
}

function selectDisk(towerIndex, diskSize) {
    if (gameState.gameWon) return;

    const tower = gameState.towers[towerIndex];

    if (gameState.selectedDisk === null) {
        if (tower.length === 0) return;
        const topDisk = tower[tower.length - 1];
        if (topDisk !== diskSize) return;

        gameState.selectedDisk = diskSize;
        gameState.selectedTower = towerIndex;

        const diskElement = document.querySelector(`[data-tower="${towerIndex}"] .disk-${diskSize}`);
        if (diskElement) {
            diskElement.classList.add('selected');
        }
    } else {
        if (gameState.selectedTower === towerIndex && gameState.selectedDisk === diskSize) {
            clearSelection();
        }
    }
}

function clearSelection() {
    const selectedElements = document.querySelectorAll('.disk.selected');
    selectedElements.forEach(el => el.classList.remove('selected'));

    gameState.selectedDisk = null;
    gameState.selectedTower = null;
}

function selectTower(towerIndex) {
    if (gameState.gameWon) return;

    const tower = gameState.towers[towerIndex];

    if (gameState.selectedDisk !== null) {
        if (tower.length === 0 || tower[tower.length - 1] > gameState.selectedDisk) {
            gameState.towers[gameState.selectedTower].pop();
            gameState.towers[towerIndex].push(gameState.selectedDisk);

            gameState.moves++;
            updateMoves();
            updateDisplay();

            if (gameState.towers[2].length === gameState.diskCount) {
                gameWon();
            }

            clearSelection();

            const towerElement = document.querySelector(`[data-tower="${towerIndex}"]`);
            towerElement.classList.add('highlight');
            setTimeout(() => {
                towerElement.classList.remove('highlight');
            }, 500);
        } else {
            clearSelection();
        }
    } else {
        if (tower.length > 0) {
            const topDisk = tower[tower.length - 1];
            selectDisk(towerIndex, topDisk);
        }
    }
}

function updateMoves() {
    document.getElementById('moves').textContent = gameState.moves;
}

function updateMinMoves() {
    const minMoves = Math.pow(2, gameState.diskCount) - 1;
    document.getElementById('minMoves').textContent = minMoves;
}

function gameWon() {
    gameState.gameWon = true;
    stopTimer();

    const minMoves = Math.pow(2, gameState.diskCount) - 1;
    document.getElementById('finalMoves').textContent = gameState.moves;
    document.getElementById('finalTime').textContent = formatTime(gameState.elapsedTime);
    document.getElementById('finalMinMoves').textContent = minMoves;

    let performanceMsg = '';
    if (gameState.moves === minMoves) {
        performanceMsg = '🏆 完美！你用了最少的步數！';
    } else if (gameState.moves <= minMoves * 1.5) {
        performanceMsg = '🌟 很棒！你的表現很不錯！';
    } else if (gameState.moves <= minMoves * 2) {
        performanceMsg = '👍 不錯！還有進步空間！';
    } else {
        performanceMsg = '💪 繼續努力！多練習會更好！';
    }
    document.getElementById('performanceMsg').textContent = performanceMsg;

    setTimeout(() => {
        showPage('resultPage');
    }, 1000);
}

function resetToStart() {
    stopTimer();
    gameState.elapsedTime = 0;
    showPage('startPage');
}

document.querySelectorAll('.disk-selector').forEach(btn => {
    btn.addEventListener('click', function () {
        if (gameState.gameWon) return;

        document.querySelectorAll('.disk-selector').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const diskCount = parseInt(this.dataset.disks);
        stopTimer();
        initGame(diskCount);
        startTimer();
    });
});

document.querySelectorAll('.tower').forEach(tower => {
    tower.addEventListener('click', function (e) {
        if (e.target.classList.contains('disk')) return;
        const towerIndex = parseInt(this.dataset.tower);
        selectTower(towerIndex);
    });
});