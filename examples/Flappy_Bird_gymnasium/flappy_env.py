#--------------------------------------------------------------------
# This is an RL environment that uses gymnasium to train an AI model
# to play falppy bird. The actual game mechanics are in the 
# flappy_game.py script which is imported here.
#
# This environment has an observation space of just 3 values:
#
#  - player_y - next_obstacle_y
#  - player_y_velocity
#  - x position of next obstacle
#
# The action space is discrete with only 2 values: flap or no flap.
#
# This script is used by the flappy_RL_train.py script and is not
# intended to be run directly.
#--------------------------------------------------------------------

import gymnasium as gym
import numpy as np
import flappy_game as game

class FlappyEnv(gym.Env):
    
    def __init__(self, render_mode=None):

        self.render_mode = render_mode

        # Action space
        self.action_space = gym.spaces.Discrete(2) # 0=no flap  1=flap
        
        # Observation space: ydiff, y_velocity, x_obstacle
        self.observation_space = gym.spaces.Box(low=np.array([-game.SCREEN_HEIGHT, -np.inf, 0]), 
                                               high=np.array([+game.SCREEN_HEIGHT, +np.inf, game.SCREEN_WIDTH]), 
                                              dtype=np.float32)
        
        # Create instance of playable FlappyGame object
        self.game = game.FlappyGame()
        
        # Reset game and instatiate objects
        self.reset()

    def step(self, action):
        
        collision = self.game.step_game(action)
        self.done = collision
        if not self.done: self.steps_without_collision += 1

        obs = self.game.get_current_state(self.game.player, self.game.obstacles)
        reward = self.steps_without_collision
        terminated = self.done
        truncated = False
        info = {}
        return obs, reward, terminated, truncated, info
        
    def reset(self, seed=None):
        super().reset(seed=seed)
        self.game.reset()
        
        self.steps_without_collision = 0 
        self.done = False
        
        obs = self.game.get_current_state(self.game.player, self.game.obstacles)
        info = {}
        return obs, info
    
    def render(self):
        self.game.render_frame()
