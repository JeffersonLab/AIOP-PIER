
# Flappy Bird RL example using [Gymnasium](https://gymnasium.farama.org)

This directory contains a simple example of Reinforcement Learning (RL) to train an AI model to learn to play the Flappy Bird game. It uses the popular [Gymnasium](https://gymnasium.farama.org) framework. The example is purposely kept very minimal to hopefully distill it down to the essential features.

This example uses [pygame](https://www.pygame.org/docs/) which can be run locally to open a window for the graphics and accept user input (spacebar). It consists of four python scripts:

- flappy_game.py : a stand-alone playable flappy bird game that can be imported by other scripts to implement the game mechanics and graphics

- flappy_env.py : a Gynamsium environment that uses `flappy_game.py`

- flappy_RL_train.py : a script to use `flappy_env.py` to train and save an RL model

- flappy_RL_test.py : a script that uses the saved model to play the game


## Installation

To use this, grab the code and then set up a python vitural environment with the necessary dependencies:

~~~bash
git clone https://github.com/JeffersonLab/AIOP-PIER
cd AIOP-PIER/examples/Flappy_Bird_gymnasium

python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip

pip install pygame gymnasium tensorflow stable_baselines3
~~~

## Playing the game

~~~bash
python3 flappy_game.py
~~~

## Training an RL model

Use the `flappy_RL_train.py` script to train and save a model. The script is set to train for up to 200,000 time steps. This is culumlative over many games. The first obstacle will collide with the player at 75 time steps so many games will be "played" during the first part of the learning process in these 200k steps.

Run the training script like this:

~~~bash
python3 flappy_RL_train.py
~~~

Because it is randomly sampling the action space as the game presents it with various points in the observation space, it may not find a workable solution in the first 200k time steps. In other words, you may run it multiple times without it learning anything. Once it finds how to reliably pass the first obstacle though, it will start learning quickly. You may wish to change the number `total_timesteps` to something larger in order to ensure that the model finds a useful solution, or trains to a better one.

Note that every time you run the training script it starts from scratch, forgetting anything about earlier training and overwriting the model.

## Testing the RL model

To see the model actually play the game, run the `flappy_RL_test.py` script like this:

~~~bash
python3 flappy_RL_test.py
~~~

You can run it multiple times to see how well it plays with different randomization of the obstacles.




