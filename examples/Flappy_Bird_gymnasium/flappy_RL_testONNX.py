#--------------------------------------------------------------------
# This script is used to have the trained model play the 
# flappy bird game. It assumes the trained models already
# exists in the files: 
#      "flappy_bird_rl_policy_model.onnx".
#      "flappy_bird_rl_action_model.onnx".
#
# The flappy_env.py and flappy_game.py files need to be in
# the same directory or in your PYTHONPATH for this to work.
#
# Run it like this:
#
#    python3 flappy_RL_testONNX.py
#
#--------------------------------------------------------------------

import flappy_env as env
import onnxruntime as ort
import numpy as np

# Load models
policy_session = ort.InferenceSession("flappy_bird_rl_policy_model.onnx")
action_session = ort.InferenceSession('flappy_bird_rl_action_model.onnx')

# Get names of input layers
input_name_policy = policy_session.get_inputs()[0].name
input_name_action = action_session.get_inputs()[0].name

# Create the environment for playing the game
flappyenv = env.FlappyEnv(render_mode="human")

# Play the game
obs, _ = flappyenv.reset()
while True:
    # Use models to decide whether to flap or not
    input_data = np.array([obs], dtype=np.float32)
    policy_output = policy_session.run(None, {input_name_policy: input_data})
    action_output = action_session.run(None, {input_name_action: policy_output[0]})
    action = np.argmax(action_output[0])

    # Go to next time step and render frame
    obs, rewards, terminated, truncated, infos = flappyenv.step(action)
    flappyenv.render()
    if terminated or truncated: break

print(f"Total time steps: {flappyenv.game.score}")
