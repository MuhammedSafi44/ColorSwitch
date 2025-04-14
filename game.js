class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.gameSpeed = 0.8;
        this.isGameOver = false;
        this.colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'];
        this.currentColor = 0;
        this.player = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 50,
            radius: 20,
            speed: 5
        };
        this.obstacles = [];
        this.lastObstacleTime = 0;
        this.obstacleInterval = 2500;
        this.keys = {
            left: false,
            right: false
        };
        this.isDragging = false;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.setupEventListeners();
        this.resizeCanvas();
        this.showStartScreen();
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.resizeCanvas());
        document.getElementById('startButton').addEventListener('click', () => this.startGame());
        document.getElementById('restartButton').addEventListener('click', () => this.restartGame());
        document.getElementById('shareTwitter').addEventListener('click', () => this.shareScore('twitter'));
        document.getElementById('shareFacebook').addEventListener('click', () => this.shareScore('facebook'));
        document.getElementById('shareWhatsApp').addEventListener('click', () => this.shareScore('whatsapp'));
        
        // Color switch on click/tap
        this.canvas.addEventListener('click', () => this.switchColor());
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.switchColor();
        });

        // Keyboard controls
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.keys.left = true;
            if (e.key === 'ArrowRight') this.keys.right = true;
        });
        
        window.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft') this.keys.left = false;
            if (e.key === 'ArrowRight') this.keys.right = false;
        });

        // Touch drag controls
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this.touchStartX = touch.clientX - rect.left;
            this.touchStartY = touch.clientY - rect.top;
            
            // Check if touch is near the ball to start dragging
            const distance = Math.sqrt(
                Math.pow(this.touchStartX - this.player.x, 2) + 
                Math.pow(this.touchStartY - this.player.y, 2)
            );
            
            if (distance <= this.player.radius) {
                this.isDragging = true;
            }
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!this.isDragging) return;
            
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const touchX = touch.clientX - rect.left;
            
            // Update player position
            this.player.x = Math.max(
                this.player.radius,
                Math.min(this.canvas.width - this.player.radius, touchX)
            );
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.isDragging = false;
        });
    }

    resizeCanvas() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        this.player.x = this.canvas.width / 2;
        this.player.y = this.canvas.height - 50;
    }

    showStartScreen() {
        document.getElementById('startScreen').style.display = 'flex';
        document.getElementById('gameOverScreen').style.display = 'none';
    }

    showGameOverScreen() {
        document.getElementById('gameOverScreen').style.display = 'flex';
        document.getElementById('startScreen').style.display = 'none';
        document.getElementById('finalScore').textContent = this.score;
    }

    startGame() {
        document.getElementById('startScreen').style.display = 'none';
        this.score = 0;
        this.gameSpeed = 0.8;
        this.isGameOver = false;
        this.obstacles = [];
        this.player = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 50,
            radius: 20,
            speed: 5
        };
        this.currentColor = 0;
        this.updateScore();
        this.gameLoop();
    }

    restartGame() {
        this.showStartScreen();
    }

    switchColor() {
        if (this.isGameOver) return;
        this.currentColor = (this.currentColor + 1) % this.colors.length;
    }

    createObstacle() {
        const now = Date.now();
        if (now - this.lastObstacleTime > this.obstacleInterval) {
            const color = this.colors[Math.floor(Math.random() * this.colors.length)];
            const width = Math.random() * 150 + 100;
            const x = Math.random() * (this.canvas.width - width);
            
            this.obstacles.push({
                x: x,
                y: -50,
                width: width,
                height: 20,
                color: color,
                speed: 1.5 * this.gameSpeed
            });
            
            this.lastObstacleTime = now;
            this.obstacleInterval = Math.max(1000, 3000 - this.score * 5);
        }
    }

    updateObstacles() {
        this.obstacles = this.obstacles.filter(obstacle => {
            obstacle.y += obstacle.speed;
            return obstacle.y < this.canvas.height + 50;
        });
    }

    checkCollision() {
        for (const obstacle of this.obstacles) {
            if (this.player.y - this.player.radius < obstacle.y + obstacle.height &&
                this.player.y + this.player.radius > obstacle.y &&
                this.player.x + this.player.radius > obstacle.x &&
                this.player.x - this.player.radius < obstacle.x + obstacle.width) {
                
                if (this.colors[this.currentColor] !== obstacle.color) {
                    this.isGameOver = true;
                    this.showGameOverScreen();
                    return;
                }
            }
        }
    }

    updateScore() {
        this.score++;
        document.getElementById('score').textContent = this.score;
        this.gameSpeed = 0.8 + Math.floor(this.score / 200) * 0.05;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw player
        this.ctx.beginPath();
        this.ctx.arc(this.player.x, this.player.y, this.player.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.colors[this.currentColor];
        this.ctx.fill();
        this.ctx.closePath();

        // Draw obstacles
        this.obstacles.forEach(obstacle => {
            this.ctx.fillStyle = obstacle.color;
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        });
    }

    updatePlayer() {
        if (!this.isDragging) {
            if (this.keys.left && this.player.x > this.player.radius) {
                this.player.x -= this.player.speed;
            }
            if (this.keys.right && this.player.x < this.canvas.width - this.player.radius) {
                this.player.x += this.player.speed;
            }
        }
    }

    gameLoop() {
        if (this.isGameOver) return;

        this.updatePlayer();
        this.createObstacle();
        this.updateObstacles();
        this.checkCollision();
        this.draw();
        this.updateScore();

        requestAnimationFrame(() => this.gameLoop());
    }

    shareScore(platform) {
        const message = `🎮 I scored ${this.score} points in Color Switch Challenge! Can you beat my score? ${window.location.href}`;
        
        if (platform === 'twitter') {
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`);
        } else if (platform === 'facebook') {
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(message)}`);
        } else if (platform === 'whatsapp') {
            window.open(`https://wa.me/?text=${encodeURIComponent(message)}`);
        }
    }
}

// Initialize the game when the page loads
window.addEventListener('load', () => {
    new Game();
}); 