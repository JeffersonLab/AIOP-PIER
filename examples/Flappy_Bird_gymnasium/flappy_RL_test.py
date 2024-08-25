#--------------------------------------------------------------------
# This script is used to have the trained model play the 
# flappy bird game. It assumes the trained model already
# exists in the file "flappy_bird_rl_model.keras".
#
# The flappy_env.py and flappy_game.py files need to be in
# the same directory or in you PYTHONPATH for this to work.
#
# Run it like this:
#
#    python3 flappy_RL_test.py
#
#--------------------------------------------------------------------

import flappy_env as env

from stable_baselines3 import PPO
from stable_baselines3.common.env_util import make_vec_env
import gymnasium as gym

# Create the environment
flappyenv = env.FlappyEnv(render_mode="human")

# Load the model
model_name = "flappy_bird_rl_model.keras"
model = PPO.load(model_name)
print(f"model loaded from: {model_name}")

# Test the trained model
obs, _ = flappyenv.reset()
while True:
    action, _ = model.predict(obs)
    obs, rewards, terminated, truncated, infos = flappyenv.step(action)
    flappyenv.render()
    if terminated or truncated: break

print(f"Total time steps: {flappyenv.steps_without_collision}")
