Subway Surfers
=========================

# Introduction:
In this game, we are controlling a character (a ball) and our goal is to maximize the score while avoiding different type of enemies and obstacles. The game is moving forward automatically and is endless.

# Controls:
- Right and left keys to move the player right and left.
- Up key to jump.
- Space key to use jetpack.
- F key to fire water balloons.
- Mouse scrolling to zoom in/out. W, A, S, D to move the screen if zoomed in.

# Instructions to run the game:
- `mkdir build`
- `cd build`
- `cmake ../`
- `make all -j 4`

# Features
- **Player**: Shaped like a ball.
- **Fire Lines**: Yellow beam between two circular balls. Can beat any angle. Kills the player if collides with him.
- **Fire Beams**: Orange horizontal beam between two circular balls, spaws at random time and translates on y-axis. Kills the player if collides with him.
- **Water Balloons**: Sky blue colored balls thrown by the player. Destroys fire lines and fire beams if hits them and also self-explode. Also destroys if comes in contact with the ground.
- **Walls**: Only for view. Shape of clouds.
- **Coins**: Increases the score of player. Three different colored coins, all give different scores.
- **Boomerang**: Comes at random time and have parabola like motion. Kills the player if collides with him. Cannot be destroyed by a water balloon.
- **Magnet**: Comes at random time. Exerts a constant attractive force to the player.
- **Semi-circular Ring**: Bluish colored semicircular ring. Comes at random time. Player can go in the ring if goes to its left end. It protects the player from enemy objects as long as player is inside the ring. Player can’t be move anywhere else as long as he is inside ring. He can come outside if he goes to its right end.
- **Power Ups**:
	- Shield: Protects the player from enemy objects for 10 seconds
	- Magnet: All the coins within some radius gets collected automatically. Works for 10 seconds.
- **Score**: Implemented using 7-segment display. Displays score according to the coins collected by the player.
- **Zooming**: Can be zoomed in/out using mouse scrolling. Score stays at the same place even after zoom. Screen can be moved using ‘W’, ‘A’, ‘S’, ‘D’ if zoomed-in.
- **Dragon**: Red and green colored. Spaws at random. Throws ice balls at the player. Player does not get killed if collides
with the dragon.
- **Ice Balls**: Deep blue octagon. Created by the dragon after every 2 seconds. Kills the player if collides with him. If water
balloon and ice ball comes in contact, both gets destroyed. Also gets destroyed if comes in contact with the ground.
