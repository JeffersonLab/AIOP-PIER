// This assumes policyModelBase64 and actionModelBase64
// are already defined and contain base64 representation of the model onnx files.
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
        this.ort_session_policy = null;
        this.ort_session_action = null;
        this.loadModel();  // Load the model asynchronously
        this.reset();
    }

    async loadModelFromBase64(base64String) {
        const byteCharacters = atob(base64String);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray]);
        const blobUrl = URL.createObjectURL(blob);
    
        return ort.InferenceSession.create(blobUrl);
    }

    async loadModel() {
        try {
            // Initialize inference sessions for the policy and action models
            this.ort_session_policy = await this.loadModelFromBase64(policyModelBase64);
            this.ort_session_action = await this.loadModelFromBase64(actionModelBase64);
    
            // If the model loads successfully, print a success message
            console.log("ONNX models loaded successfully.");
    
            // Optionally: Check if inputs and outputs are defined
            this.input_name_policy  = this.ort_session_policy.inputNames[0]
            this.output_name_policy = this.ort_session_policy.outputNames[0]
            this.input_name_action  = this.ort_session_action.inputNames[0]
            this.output_name_action = this.ort_session_action.outputNames[0]
    
            // this.ort_policy_session = session;
        } catch (error) {
            // If there's any error loading the model, catch it and print an error message
            console.error("Error loading ONNX models:", error.message);
        }
    }

    async predictAction(state) {

        // Wait until the model is loaded
        if (!this.ort_session_policy || !this.ort_session_action) {
            console.error("Models are not loaded yet!");
            return 0;
        }

        // Run inference with policy model
        const policyTensor = new ort.Tensor('float32', state, [1, state.length]);
        const policyOutputMap = await this.ort_session_policy.run({ [this.input_name_policy ]: policyTensor });
        const policyOutput = policyOutputMap[this.output_name_policy].data;

        // Run inference with action model
        const actionTensor = new ort.Tensor('float32', policyOutput, [1, policyOutput.length]);
        const actionOutputMap = await this.ort_session_action.run({ [this.input_name_action]: actionTensor });
        const actionOutput = actionOutputMap[this.output_name_action].data;

        // Determine action (0=no flap, 1=flap)
        const action = actionOutput[0] > actionOutput[1] ? 0 : 1;

        return action;
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
        this.ctx.fillText("Press Enter to Restart", SCREEN_WIDTH/3 - 30, SCREEN_HEIGHT / 2 + 30);
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
            }

            if (obstacle.isOffScreen()) {
                this.obstacles.shift();
            }

            if (obstacle.x + OBSTACLE_WIDTH < PLAYER_X && !obstacle.passed) {
                obstacle.passed = true;
            }
        }

        if(!collision) this.score++;

        return collision;
    }

    runGame() {

        const gameLoop = async () => {

            const state = this.getCurrentState(this.player, this.obstacles);
            const action = await this.predictAction(state);
 
            let collision = this.stepGame(action);
            this.renderFrame();

            if (!collision) {
                setTimeout(gameLoop, 1000 / FPS);
            } else {
                this.gameOver = true;
                this.showGameOver();
                return
            }
        }

        gameLoop();
    }

    getCurrentState(player, obstacles) {
        for (let obs of obstacles) {
            if (obs.x > PLAYER_X + PLAYER_SIZE) {
                return [
                    player.y - obs.gap_y,
                    player.velocity,
                    obs.x
                ];
            }
        }
        return [0, 0, 0]; // Default state if no obstacle is found
    };
}

// Factory function to create and initialize the game instance
async function createFlappyGame() {
    const game = new FlappyGame();
    await game.loadModel();  // Wait for models to load before returning the game instance
    return game;
}

// Initialize and start the game
createFlappyGame().then((game) => {
    if( game != null ){
        console.log("Game initialized and models loaded!");
        
        document.addEventListener('keydown', (event) => {
            if (event.code === 'Enter') {
                if (game.gameOver) {
                    game.reset();
                    game.runGame();
                }
            }
        });
        
        game.runGame();
    }else{
        console.log("Game initialization failed!");
    }
});


