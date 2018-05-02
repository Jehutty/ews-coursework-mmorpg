# Wizard Brawl MMORPG

This project is a full MEAN stack app, it uses Node.js as a server, uses the Express framework to deliver files to the front end
It uses Angular.js for the front end routing with controllers and services.
For the authentication system Angular is using the API routes that connect and retrieve data from the MongoDB hosted on mlabs
all routes except login/register need authentication.
the API routes that access the database are only accessible from Angular authService that implements factories to perform these actions.
If the user is not authenticated he must either login or register a new account and then login into the system.


# Game & Game logic
The game is built with javascript and Socket.io
The user is controlling a wizard character.
The game is supporting live multiplayer interaction, a chat system, an inventory system and leaderboards

When the user logs in to the system and goes to the /game route
he has to press the Join game button to initialize his character

The player is given a socket and registers it on the server
The server checks the socket's id and if it already exists in the database it retrieves the progress of that player and sends a response to 
the user that updates his player accordingly. If the user has not played the game before, he is given a default player entity from the server.

The players socket client and the server are in communication continiously
The client's socket fires up a socket.emit request on every event available to the player to notify the server of his intent
The server listens to these requests using the socket.on function and updates the players accordingly.
When a player moves he emits a request depending on his direction (key W,A,S,D being pressed on the keyboard)
The server then checks if the player's entity is within the bounds set on the map and updates the player's speed and position by sending an emit response
The player listens on that response and updates accordingly.
All connected players are being notified by the server on their events accordingly.

Same logic applies to the bullets being fired from the player. (while the player holds the left click on his mouse) he emits a request to the server
to notify him to create a bullet from the player towards a certain angle.
The server updates all the clients that a bullet has been fired along with its direction and angle.
The bullet entity constantly checks for collision with other players.
The entity is aware of the player who fired the bullet and if a collision occurs it becomes aware of the player that has been shot.
When this happens the bullet object gets removed but before doing so it damges the player that it colided with and checks if the Hit points of the player are depletted.
If the player has 0 Hit points left then the shooter gets a score increment along with experience points, if the experience points are above a threshold
the shooter is granted a level and his experience points are getting reset.
A bullet gets garbage collected after a certain timeout of 100 update frames (25 seconds) so that it doesnt overload the clients and the server.

--Page might need to be refreshed due to the fact that JQuery library loads before Angular elements so when 
the functions of JQuery are used to hook on 
these elements are not yet loaded.
I tried many workarounds for this such as loading jQuery after a certain timeout or performing conditional checks on the elements but
it wasn't working. After extensive research I found out that in order to load jQuery after Angular has finished loading you need a directive function 
on your controllers. The directive function is highly complicated and depends on the model you build your controllers upon, thus I wasn't able to implement it.



# LEVELING SYSTEM:
His/her character starts as level 0 and as a fire wizard
when the user kills other players he receives a score increment and experience points
upon reaching a certain amount of experience points he gains a level 

Upon reaching a threshold of level 3 the user's character transforms from a fire wizard to a frost one
after level 6 the user transforms to an arcane wizard.




# CHAT:
The player is able to communicate with other players using the chat
All messages sent from the chat are being broadcasted to all the players in the game.
A player can send a private message to another player currently in the game by using 
the following pattern when writing a message

@<receiver's username>, <message to sent>

The messages sent using this pattern are only visible to the receiver.
The receiver gets notified by having this message displayed in purple. 
And the message displays the username of the one who sent the message

If the player tries to send a private message to someone who is not online at the current session
he gets notified that this player is not online.

--if the syntax of the private message is not correct it might crash the instance for the player.

# ANIMATIONS:
The player's character is using a finite state model system
If the character is idle (not moving)
The character's model is changing based on a 2 step loop state

If the character is being hurt then his model changes accordingly

If the character is moving then his model uses a 4 step loop state

-- I would like to add a death animation but due to time constraints and lack of knowledge on game developing this wasn't implemented.




# PLAYER MOVEMENT:
The player is unable to move outside the boundaries of the map.
--This is working as it should and no bugs were found.



# LEADERBOARDS:
There is a route in the system where the users can see the score of other players.
--The path is built in Angular, users are displayed but are not sorted depending on their score but in alphabetical order of their username
--Could not find out how Angular sorts html elements depending on certain conditions. I tried using the ng-sort function but to no avail.
--Javascript/jQuery wouldn't let me access these elements since they are created in the shadow dom of the .html file and again jQuery loads before angular 
thus can't target it's elements before they are loaded.



# ITEMS:
The player's character has an inventory that holds items 
--I could only add items but was not able to use them.
--For some reason when i try to click on the button that represents an item and fire off a socket emit event, so that the server gets notified and the player's
character gets updated depending on the use of the item, the function was not being registered.


# MAP INSTANCES:
The game implements two different maps used as game instances.
A player is able to change the map by clicking the "Change Map" button in the game canvas.
The player is only able to see and interact with players that are on the same map instance.

--had i more time i would like to add more maps to the design of the game and introduce NPC entitites that reward exp upon killing them.
--also i would like to lock some maps so that they are accessible only to the user's level.



# Functionality to be added
I would like to introduce a marketplace so that users can buy items or unlock abilities depending on their level
A kill death ratio implementation on the leaderboards.
Other object entities that players could take cover from and destroy after hitting them a certain amount of times.


