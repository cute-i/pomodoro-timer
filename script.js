class Game2048 {
    constructor() {
        this.gridSize = 4;
        this.grid = [];
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('bestScore') || '0');
        this.won = false;
        this.gameOver = false;
        
        this.initElements();
        this.newGame();
        this.bindEvents();
    }

    initElements() {
        this.tilesContainer = document.getElementById('tiles');
        this.scoreDisplay = document.getElementById('score');
        this.bestScoreDisplay = document.getElementById('best-score');
        this.gameOverOverlay = document.getElementById('game-over');
        this.winOverlay = document.getElementById('win-overlay');
        this.finalScoreDisplay = document.getElementById('final-score');
        
        document.getElementById('restart-btn').addEventListener('click', () => this.newGame());
        document.getElementById('try-again-btn').addEventListener('click', () => this.newGame());
        document.getElementById('keep-playing-btn').addEventListener('click', () => this.continueGame());
        document.getElementById('new-game-btn').addEventListener('click', () => this.newGame());
        
        this.updateBestScore();
    }

    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if (this.gameOver) return;
            
            const keyMap = {
                ArrowUp: 'up',
                ArrowDown: 'down',
                ArrowLeft: 'left',
                ArrowRight: 'right'
            };
            
            const direction = keyMap[e.key];
            if (direction) {
                e.preventDefault();
                this.move(direction);
            }
        });

        let touchStartX = 0;
        let touchStartY = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchend', (e) => {
            if (this.gameOver) return;
            
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            
            const minSwipeDistance = 30;
            
            if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) {
                return;
            }
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                this.move(deltaX > 0 ? 'right' : 'left');
            } else {
                this.move(deltaY > 0 ? 'down' : 'up');
            }
        });
    }

    newGame() {
        this.grid = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(0));
        this.score = 0;
        this.won = false;
        this.gameOver = false;
        
        this.addRandomTile();
        this.addRandomTile();
        this.updateScore();
        this.render();
        this.hideOverlays();
    }

    continueGame() {
        this.won = false;
        this.hideOverlays();
    }

    hideOverlays() {
        this.gameOverOverlay.classList.remove('show');
        this.winOverlay.classList.remove('show');
    }

    addRandomTile() {
        const emptyCells = [];
        
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({ row: i, col: j });
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.grid[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    move(direction) {
        let moved = false;
        const originalGrid = this.grid.map(row => [...row]);
        
        if (direction === 'left') {
            for (let i = 0; i < this.gridSize; i++) {
                this.grid[i] = this.mergeRow(this.grid[i]);
            }
        } else if (direction === 'right') {
            for (let i = 0; i < this.gridSize; i++) {
                this.grid[i] = this.mergeRow(this.grid[i].reverse()).reverse();
            }
        } else if (direction === 'up') {
            for (let j = 0; j < this.gridSize; j++) {
                const column = this.getColumn(j);
                const mergedColumn = this.mergeRow(column);
                this.setColumn(j, mergedColumn);
            }
        } else if (direction === 'down') {
            for (let j = 0; j < this.gridSize; j++) {
                const column = this.getColumn(j).reverse();
                const mergedColumn = this.mergeRow(column).reverse();
                this.setColumn(j, mergedColumn);
            }
        }
        
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] !== originalGrid[i][j]) {
                    moved = true;
                    break;
                }
            }
            if (moved) break;
        }
        
        if (moved) {
            this.addRandomTile();
            this.updateScore();
            this.render();
            this.checkGameState();
        }
    }

    mergeRow(row) {
        let filtered = row.filter(val => val !== 0);
        let merged = [];
        
        for (let i = 0; i < filtered.length; i++) {
            if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
                const newValue = filtered[i] * 2;
                merged.push(newValue);
                this.score += newValue;
                
                if (newValue === 2048) {
                    this.won = true;
                }
                i++;
            } else {
                merged.push(filtered[i]);
            }
        }
        
        while (merged.length < this.gridSize) {
            merged.push(0);
        }
        
        return merged;
    }

    getColumn(col) {
        const column = [];
        for (let i = 0; i < this.gridSize; i++) {
            column.push(this.grid[i][col]);
        }
        return column;
    }

    setColumn(col, column) {
        for (let i = 0; i < this.gridSize; i++) {
            this.grid[i][col] = column[i];
        }
    }

    updateScore() {
        this.scoreDisplay.textContent = this.score;
        
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('bestScore', this.bestScore.toString());
            this.updateBestScore();
        }
    }

    updateBestScore() {
        this.bestScoreDisplay.textContent = this.bestScore;
    }

    render() {
        this.tilesContainer.innerHTML = '';
        
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                const value = this.grid[i][j];
                if (value !== 0) {
                    const tile = document.createElement('div');
                    tile.className = `tile value-${value}`;
                    tile.textContent = value;
                    this.tilesContainer.appendChild(tile);
                }
            }
        }
    }

    checkGameState() {
        if (this.won && !this.gameOver) {
            this.winOverlay.classList.add('show');
            return;
        }
        
        if (!this.canMove()) {
            this.gameOver = true;
            this.finalScoreDisplay.textContent = `最终得分: ${this.score}`;
            this.gameOverOverlay.classList.add('show');
        }
    }

    canMove() {
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] === 0) {
                    return true;
                }
                
                if (j < this.gridSize - 1 && this.grid[i][j] === this.grid[i][j + 1]) {
                    return true;
                }
                
                if (i < this.gridSize - 1 && this.grid[i][j] === this.grid[i + 1][j]) {
                    return true;
                }
            }
        }
        return false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Game2048();
});