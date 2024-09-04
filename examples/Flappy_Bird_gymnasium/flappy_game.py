#--------------------------------------------------------------------
# This is a self-contained, playable flappy bird game.
#
# It is kept minimal for the purposes of illustration.
# It is designed to be used with an RL learning environment.
# (see flappy_env.py and flappy_RL_train.py)
#
# The game can be played by a human (using the spacebar) by running:
#
#   python3 flappy_game.py
#
#--------------------------------------------------------------------

import pygame
import random

# Initialize pygame
pygame.init()

# Constants
GRID_WIDTH = 256
GRID_HEIGHT = 128
BLOCK_SIZE = 2
SCREEN_WIDTH = GRID_WIDTH * BLOCK_SIZE
SCREEN_HEIGHT = GRID_HEIGHT * BLOCK_SIZE

WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (255, 0, 0)
GREEN = (0, 255, 0)

PLAYER_X = 30
PLAYER_SIZE = 4
PLAYER_COLOR = RED
GRAVITY = 0.5
FLAP_STRENGTH = -4
GAP_HEIGHT = 20
OBSTACLE_WIDTH = 10
OBSTACLE_COLOR = GREEN
OBSTACLE_SPEED = 3
FPS = 30

#-------------------------------------------------------------------------------------
class Player:
    def __init__(self):
        self.y = GRID_HEIGHT // 2
        self.velocity = 0

    def flap(self):
        self.velocity = FLAP_STRENGTH

    def update(self):
        self.velocity += GRAVITY
        self.y += self.velocity
        self.y = max(0, min(GRID_HEIGHT - PLAYER_SIZE, self.y))
        
        # If player is at edge of screen then set velocity to 0
        if self.y>=(GRID_HEIGHT - PLAYER_SIZE): self.velocity = 0

    def draw(self, screen):
        pygame.draw.rect(screen, PLAYER_COLOR, (PLAYER_X * BLOCK_SIZE, int(self.y) * BLOCK_SIZE, PLAYER_SIZE * BLOCK_SIZE, PLAYER_SIZE * BLOCK_SIZE))

#-------------------------------------------------------------------------------------
class Obstacle:
    def __init__(self):
        self.x = GRID_WIDTH
        self.gap_y = random.randint(GAP_HEIGHT, GRID_HEIGHT - GAP_HEIGHT)
        self.passed = False

    def update(self):
        self.x -= OBSTACLE_SPEED

    def draw(self, screen):
        pygame.draw.rect(screen, OBSTACLE_COLOR, (self.x * BLOCK_SIZE, 0, OBSTACLE_WIDTH * BLOCK_SIZE, (self.gap_y - GAP_HEIGHT) * BLOCK_SIZE))
        pygame.draw.rect(screen, OBSTACLE_COLOR, (self.x * BLOCK_SIZE, (self.gap_y + GAP_HEIGHT) * BLOCK_SIZE, OBSTACLE_WIDTH * BLOCK_SIZE, SCREEN_HEIGHT - (self.gap_y + GAP_HEIGHT) * BLOCK_SIZE))

    def is_off_screen(self):
        return self.x < -OBSTACLE_WIDTH

    def check_collision(self, player):
        if PLAYER_X + PLAYER_SIZE > self.x and PLAYER_X < self.x + OBSTACLE_WIDTH:
            if player.y < self.gap_y - GAP_HEIGHT or player.y + PLAYER_SIZE > self.gap_y + GAP_HEIGHT:
                return True
        return False

#-------------------------------------------------------------------------------------
class FlappyGame:
    
    def __init__(self, human_mode=True):
        self.screen = None
        self.clock = None
        self.reset()

    def reset(self):
        self.player = Player()
        self.obstacles = [Obstacle()]
        self.score = 0
   
    def get_current_state(self, player, obstacles):
        for obs in obstacles:
            # Find next obstacle
            if obs.x > PLAYER_X + PLAYER_SIZE:
                state = [
                    player.y - obs.gap_y,
                    player.velocity,
                    obs.x
                ]
                return state
        return None

    def render_frame(self, add_delay=True):
        if not self.screen:
            self.screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
            self.clock = pygame.time.Clock()
        
        pygame.event.pump()
        self.screen.fill(BLACK)
        self.player.draw(self.screen)
        for obstacle in self.obstacles:
            obstacle.draw(self.screen)
        pygame.display.flip()
        if add_delay: self.clock.tick(FPS)

    def step_game(self, action):
        if action: self.player.flap()
        self.player.update()

        if self.obstacles[-1].x < GRID_WIDTH - 100:
            self.obstacles.append(Obstacle())

        collision = False
        for obstacle in self.obstacles:
            obstacle.update()

            if obstacle.check_collision(self.player):
                collision = True

            if obstacle.is_off_screen():
                self.obstacles.remove(obstacle)

            if obstacle.x + OBSTACLE_WIDTH < PLAYER_X and not obstacle.passed:
                obstacle.passed = True

        if not collision: self.score += 1
        return collision

    def run_game(self):

        while True:
            action =0
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    break
                if event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_SPACE:
                        action = 1
    
            collision = self.step_game(action)
            self.render_frame()
            if collision: break

        pygame.quit()

#==============================================================================================
if __name__ == "__main__":

    game = FlappyGame()
    game.run_game()
    print(f"Final score: {game.score}")
