#--------------------------------------------------------------------
# This script is used to have the trained model play the 
# flappy bird game. It assumes the trained model already
# exists in the file:
#      "flappy_bird_rl_model.ppo".
#
# The flappy_env.py and flappy_game.py files need to be in
# the same directory or in your PYTHONPATH for this to work.
#
# Run it like this:
#
#    python3 flappy_RL_test.py
#
#--------------------------------------------------------------------

import flappy_env as env
from stable_baselines3 import PPO

# Load the model
model = PPO.load("flappy_bird_rl_model.ppo")

# Create the environment for playing the game
flappyenv = env.FlappyEnv(render_mode="human")

# Play the game
obs, _ = flappyenv.reset()
while True:
    # Use model to decide whether to flap or not
    action, _ = model.predict(obs, deterministic=True)
    
    # Go to next time step and render frame
    obs, rewards, terminated, truncated, infos = flappyenv.step(action)
    flappyenv.render()
    if terminated or truncated: break

print(f"Total time steps: {flappyenv.game.score}")
