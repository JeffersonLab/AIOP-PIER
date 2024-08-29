
const canvas = document.getElementById("flappyCanvas");
const ctx = canvas.getContext("2d");

// Constants from the Python script
const GRID_WIDTH = 256;
const GRID_HEIGHT = 128;
const BLOCK_SIZE = 2;
const SCREEN_WIDTH = GRID_WIDTH * BLOCK_SIZE;
const SCREEN_HEIGHT = GRID_HEIGHT * BLOCK_SIZE;

const WHITE = "#FFFFFF";
const BLACK = "#000000";
const RED = "#FF0000";
const GREEN = "#00FF00";

const PLAYER_X = 30;
const PLAYER_SIZE = 4;
const PLAYER_COLOR = RED;
const GRAVITY = 0.5;
const FLAP_STRENGTH = -4;
const GAP_HEIGHT = 20;
const OBSTACLE_WIDTH = 10;
const OBSTACLE_COLOR = GREEN;
const OBSTACLE_SPEED = 3;
const FPS = 30;

// Player class
class Player {
    constructor() {
        this.y = GRID_HEIGHT / 2;
        this.velocity = 0;
    }

    flap() {
        this.velocity = FLAP_STRENGTH;
    }

    update() {
        this.velocity += GRAVITY;
        this.y += this.velocity;
        this.y = Math.max(0, Math.min(GRID_HEIGHT - PLAYER_SIZE, this.y));

        // Stop falling if at the bottom of the screen
        if (this.y >= GRID_HEIGHT - PLAYER_SIZE) {
            this.velocity = 0;
        }
    }

    draw(ctx) {
        ctx.fillStyle = PLAYER_COLOR;
        ctx.fillRect(PLAYER_X * BLOCK_SIZE, this.y * BLOCK_SIZE, PLAYER_SIZE * BLOCK_SIZE, PLAYER_SIZE * BLOCK_SIZE);
    }
}

// Obstacle class
class Obstacle {
    constructor() {
        this.x = GRID_WIDTH;
        this.gap_y = Math.floor(Math.random() * (GRID_HEIGHT - 2 * GAP_HEIGHT) + GAP_HEIGHT);
        this.passed = false;
    }

    update() {
        this.x -= OBSTACLE_SPEED;
    }

    draw(ctx) {
        ctx.fillStyle = OBSTACLE_COLOR;
        ctx.fillRect(this.x * BLOCK_SIZE, 0, OBSTACLE_WIDTH * BLOCK_SIZE, (this.gap_y - GAP_HEIGHT) * BLOCK_SIZE);
        ctx.fillRect(this.x * BLOCK_SIZE, (this.gap_y + GAP_HEIGHT) * BLOCK_SIZE, OBSTACLE_WIDTH * BLOCK_SIZE, (SCREEN_HEIGHT - (this.gap_y + GAP_HEIGHT) * BLOCK_SIZE));
    }

    isOffScreen() {
        return this.x < -OBSTACLE_WIDTH;
    }

    checkCollision(player) {
        if (PLAYER_X + PLAYER_SIZE > this.x && PLAYER_X < this.x + OBSTACLE_WIDTH) {
            if (player.y < this.gap_y - GAP_HEIGHT || player.y + PLAYER_SIZE > this.gap_y + GAP_HEIGHT) {
                return true;
            }
        }
        return false;
    }
}

// FlappyGame class
class FlappyGame {
    constructor() {
        this.canvas = document.getElementById('flappyCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.reset();
    }

    reset() {
        this.player = new Player();
        this.obstacles = [new Obstacle()];
        this.score = 0;
        this.gameOver = false;
        this.flap = false;
    }

    showGameOver() {
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        this.ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
        this.ctx.fillStyle = WHITE;
        this.ctx.font = "30px Arial";
        this.ctx.fillText("Game Over", SCREEN_WIDTH/3, SCREEN_HEIGHT / 2);
        this.ctx.font = "20px Arial";
        this.ctx.fillText("Press Space to Restart", SCREEN_WIDTH/3 - 30, SCREEN_HEIGHT / 2 + 30);
    }

    renderFrame() {
        this.ctx.fillStyle = BLACK;
        this.ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

        this.player.draw(this.ctx);
        for (let obstacle of this.obstacles) {
            obstacle.draw(this.ctx);
        }

        this.ctx.fillStyle = WHITE;
        this.ctx.font = "20px Arial";
        this.ctx.fillText("Score: " + this.score, 10, 25);
    }

    stepGame(action) {
        if (action) this.player.flap();
        this.player.update();

        if (this.obstacles[this.obstacles.length - 1].x < GRID_WIDTH - 100) {
            this.obstacles.push(new Obstacle());
        }

        let collision = false;
        for (let obstacle of this.obstacles) {
            obstacle.update();

            if (obstacle.checkCollision(this.player)) {
                collision = true;
            }else{
                this.score++;
            }

            if (obstacle.isOffScreen()) {
                this.obstacles.shift();
            }

            if (obstacle.x + OBSTACLE_WIDTH < PLAYER_X && !obstacle.passed) {
                obstacle.passed = true;
            }
        }

        return collision;
    }

    runGame() {

        const gameLoop = () => {
            let action = this.flap ? 1 : 0;
            this.flap = false;

            let collision = this.stepGame(action);
            this.renderFrame();

            if (!collision) {
                setTimeout(gameLoop, 1000 / FPS);
            } else {
                this.gameOver = true;
                this.showGameOver();
                return
            }
        };

        gameLoop();
    }
}

// Initialize and start the game
const game = new FlappyGame();
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        if (game.gameOver) {
            game.reset();
            game.runGame();
        } else {
            game.flap = true;
        }
    }
});
game.runGame();

