let gameState = {
            towers: [[], [], []],
            selectedDisk: null,
            selectedTower: null,
            moves: 0,
            diskCount: 3,
            gameWon: false
        };
        
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
                    disk.style.bottom = `${20 + index * 27}px`; // 從底部往上排列
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
                // 移動圓盤
                if (tower.length === 0 || tower[tower.length - 1] > gameState.selectedDisk) {
                    // 移動圓盤
                    gameState.towers[gameState.selectedTower].pop();
                    gameState.towers[towerIndex].push(gameState.selectedDisk);
                    
                    gameState.moves++;
                    updateMoves();
                    updateDisplay();
                    
                    // 檢查勝利條件
                    if (gameState.towers[2].length === gameState.diskCount) {
                        gameWon();
                    }
                    
                    clearSelection();
                    
                    // 塔的視覺效果
                    const towerElement = document.querySelector(`[data-tower="${towerIndex}"]`);
                    towerElement.classList.add('highlight');
                    setTimeout(() => {
                        towerElement.classList.remove('highlight');
                    }, 500);
                } else {
                    // 無效移動
                    clearSelection();
                }
            } else {
                // 選擇塔上的圓盤
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
            document.getElementById('finalMoves').textContent = gameState.moves;
            document.getElementById('victoryMessage').classList.add('show');
            
            setTimeout(() => {
                document.getElementById('victoryMessage').classList.remove('show');
            }, 4000);
        }
        
        function resetGame() {
            document.getElementById('victoryMessage').classList.remove('show');
            initGame(gameState.diskCount);
        }
        
        document.querySelectorAll('.disk-selector').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.disk-selector').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const diskCount = parseInt(this.dataset.disks);
                initGame(diskCount);
            });
        });
        
        document.querySelectorAll('.tower').forEach(tower => {
            tower.addEventListener('click', function(e) {
                if (e.target.classList.contains('disk')) return;
                const towerIndex = parseInt(this.dataset.tower);
                selectTower(towerIndex);
            });
        });
        
        initGame(3);