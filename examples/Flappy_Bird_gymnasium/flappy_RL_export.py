#--------------------------------------------------------------------
# This is only needed if you want to deploy the trained policy model
# using a language other than python, or on a system where the 
# stable_baselines3 package is not available.
#
# This script is used to export the policy and action models from
# the saved PPO model file into portable onnx files. This should be
# run after successfully running the flappy_RL_train.py script.
#
# Run this script like this:
#
#    python3 flappy_RL_export.py
#--------------------------------------------------------------------

import flappy_env as env
from stable_baselines3 import PPO
import torch

# Load PPO model
model_name = "flappy_bird_rl_model.ppo"
model = PPO.load(model_name)
print(f"Loaded {model_name}")

# Create the environment
flappyenv = env.FlappyEnv(render_mode="human")

# Save the policy model
model_name_policy = "flappy_bird_rl_policy_model.onnx"
policy_net = model.policy.mlp_extractor.policy_net
obs,_ = flappyenv.reset()
dummy_policy_input = torch.tensor(obs, dtype=torch.float32).unsqueeze(0)
torch.onnx.export(policy_net, dummy_policy_input,  model_name_policy)
print(f"policy model saved to: {model_name_policy}")

# Save the action model
model_name_action  = "flappy_bird_rl_action_model.onnx"
action_net = model.policy.action_net
dummy_action_input = policy_net(dummy_policy_input)
torch.onnx.export(action_net, dummy_action_input,  model_name_action)
print(f"action model saved to: {model_name_action}")
