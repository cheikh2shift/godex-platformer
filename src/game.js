class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.lives = 3;
        this.gameState = 'start'; // start, playing, gameover, win
        this.lastTime = 0;
        
        // Player starts at y=512 so feet touch ground (560 - 48)
        this.player = new Player(50, 512);
        this.level = new Level();
        
        this.setupUI();
        this.gameLoop = this.gameLoop.bind(this);
        requestAnimationFrame(this.gameLoop);
    }

    setupUI() {
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.restartGame());
    }

    startGame() {
        this.gameState = 'playing';
        document.getElementById('start-screen').classList.add('hidden');
        this.score = 0;
        this.lives = 3;
        this.updateUI();
    }

    restartGame() {
        this.player = new Player(50, 512);
        this.level = new Level();
        this.gameState = 'playing';
        document.getElementById('game-over-screen').classList.add('hidden');
        document.getElementById('win-screen').classList.add('hidden');
        this.score = 0;
        this.lives = 3;
        this.updateUI();
    }

    updateUI() {
        document.getElementById('scoreValue').textContent = this.score;
        document.getElementById('livesValue').textContent = this.lives;
    }

    gameLoop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        if (this.gameState === 'playing') {
            this.update(deltaTime);
        }
        
        this.draw();
        requestAnimationFrame(this.gameLoop);
    }

    update(deltaTime) {
        // Update level
        this.level.update();

        // Update player
        const result = this.player.update(deltaTime, this.level.platforms, this.level.enemies, this.level.coins);

        // Handle player actions
        if (result === 'coin') {
            this.score += 10;
            this.updateUI();
        } else if (result === 'enemyKilled') {
            this.score += 50;
            this.updateUI();
        } else if (result === 'hit') {
            this.lives--;
            this.updateUI();
            if (this.lives <= 0) {
                this.gameOver();
            }
        } else if (result === 'died') {
            this.lives--;
            this.updateUI();
            if (this.lives <= 0) {
                this.gameOver();
            } else {
                this.player.reset(50, 512);
            }
        }

        // Check win condition - player must touch the flag
        if (this.gameState === 'playing' && this.checkWin()) {
            this.win();
        }
    }

    checkWin() {
        const flag = this.level.flag;
        const player = this.player;
        
        // Check if player overlaps with flag
        return player.x < flag.x + flag.width &&
               player.x + player.width > flag.x &&
               player.y < flag.y + flag.height &&
               player.y + player.height > flag.y;
    }

    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw level
        this.level.draw(this.ctx);

        // Draw player
        if (this.gameState === 'playing' || this.gameState === 'win') {
            this.player.draw(this.ctx);
        }
    }

    gameOver() {
        this.gameState = 'gameover';
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('game-over-screen').classList.remove('hidden');
    }

    win() {
        this.gameState = 'win';
        this.score += this.lives * 100; // Bonus for lives remaining
        document.getElementById('winScore').textContent = this.score;
        document.getElementById('win-screen').classList.remove('hidden');
        soundManager.play('gem');
    }
}

// Start the game when page loads
window.addEventListener('load', () => {
    const game = new Game();
});
