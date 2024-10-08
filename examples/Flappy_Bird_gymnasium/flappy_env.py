#--------------------------------------------------------------------
# This is an RL environment that uses gymnasium to train an AI model
# to play falppy bird. The actual game mechanics are in the 
# flappy_game.py script which is imported here.
#
# This environment has an observation space of just 3 values:
#
#  - y_player_y - y_next_obstacle
#  - y_velocity
#  - x_next_obstacle
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

        obs = self.game.get_current_state(self.game.player, self.game.obstacles)
        reward = self.game.score
        terminated = self.done
        truncated = False
        info = {}
        return obs, reward, terminated, truncated, info
        
    def reset(self, seed=None):
        super().reset(seed=seed)
        self.game.reset()
        
        self.done = False
        
        obs = self.game.get_current_state(self.game.player, self.game.obstacles)
        info = {}
        return obs, info
    
    def render(self):
        self.game.render_frame()
