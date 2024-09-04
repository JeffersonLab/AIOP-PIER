#--------------------------------------------------------------------
# This script is used to train a model using RL to play the flappy
# bird game. It relies on flappy_env.py which itself relies on
# flappy_game.py.
#
# This will train the model for a minimum number of time frames
# and then save the model to a model file. Run it like this:
#
#   python3 flappy_RL_train.py
#
# The training must do some exploration of the observation/action
# space so it may or may not settle into a useful solution when
# run. The value "ep_len_mean" printed while training will give 
# you an idea how well it is learning. A value of 75 means it
# hit the first obstacle so really hasn't learned anything. It is
# not unusual for it not to find a solution which gets it past
# the first obstacle when you run this. If the value of ep_len_mean
# is not greater than 100 at the end of training, just try running
# it again. Alternatively change the value of total_timesteps.
#--------------------------------------------------------------------

import flappy_env as env
from stable_baselines3 import PPO

# Create the environment
flappyenv = env.FlappyEnv(render_mode="human")

# Define the policy architecture
policy_kwargs = dict(
    net_arch=[128, 64, 32],  # Adjust the architecture as needed
)

# Create the PPO model
model = PPO("MlpPolicy", flappyenv, policy_kwargs=policy_kwargs, learning_rate=2e-4, verbose=1)

# Train the model
model.learn(total_timesteps=500000)

# Save the fully trained PPO model (actor, critic, action)
model_name_ppo = "flappy_bird_rl_model.ppo"
model.save(model_name_ppo)
print(f"PPO model saved to: {model_name_ppo}")
