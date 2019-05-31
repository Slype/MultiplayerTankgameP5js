# Import necessary libraries
from flask import Flask, render_template, request
from flask_socketio import SocketIO
import urllib, json, time, socket, random

# Setup app
app = Flask(__name__)
app.config['SECRET_KEY'] = '123addfsdf9k'
socketio = SocketIO(app)

# Find LAN IPv4 Address
appHost = socket.gethostbyname(socket.gethostname())
appPort = 80

# Authentication key
serverAuthkey = "asd9kajs9d8fujas9d8"
serverID = ""
clients = []
randomNames = {}

# Load randomNames
with open('randomNames.json', 'r') as file:
    jsondata = file.read()
    randomNames = json.loads(jsondata)

# Returns a random hex color
def randomColor():
    r = hex(random.randint(0, 255))[2:]
    if len(r) != 2:
        r += "0"
    g = hex(random.randint(0, 255))[2:]
    if len(g) != 2:
        g += "0"
    b = hex(random.randint(0, 255))[2:]
    if len(b) != 2:
        b += "0"
    return "#" + r + g + b

# Returns a random unique name if possible, otherwise player_{randomNumer}
def randomName():
	if "first" in randomNames:
		for n in range(25):
			name = randomNames["first"][random.randint(0, len(randomNames["first"]) - 1)] + " " + randomNames["second"][random.randint(0, len(randomNames["second"]) - 1)]
			exists = False
			for i in range(len(clients)):
				if clients[i]["name"] == name:
					exists = True
			if not exists:
				return name
	return "player_" + hex(random.randint(0, 255))[2:] + hex(random.randint(0, 255))[2:]

# Return controller.html when someone connects
@app.route('/')
def index():
    return render_template("controller.html")

# Handle connect events to socket
@socketio.on('connect')
def handle_connect():
	global serverID
	print("Client connected...")
    # Check if client already exists
	for i in range(len(clients)):
		if clients[i]["id"] == request.sid:
			return
    # Assign client its data
	clientData = {"id": request.sid, "name": randomName(), "color": randomColor()}
	clients.append(clientData)
    # If a game host exists, send client data to it
	if serverID != "":
		socketio.emit("newPlayer", json.dumps(clientData), room=serverID)
		socketio.emit("profile", json.dumps(clientData), room=request.sid)

# Handle authentication events
@socketio.on('auth')
def handle_auth(id):
	global serverID
    # Remove it from the client list if key is valid
	if id == serverAuthkey:
		for i in range(len(clients)):
			if clients[i]["id"] == request.sid:
				clients.pop(i)
				break
        # Update serverID
		serverID = request.sid
        # Return any already connected clients
		return json.dumps(clients)
	return False

# Handles a disconnect event
@socketio.on('disconnect')
def handle_disconnect():
	global serverID
    # Pop it off the list
	for i in range(len(clients)):
		if clients[i]["id"] == request.sid:
			clients.pop(i)
			break
    # If it's the host, update serverID
	if serverID == request.sid:
		serverID = ""
    # Otherwise, inform the host of the player disconnect
	if serverID != "":
		socketio.emit("removePlayer", json.dumps({"id": request.sid}), room=serverID)

# Handles the event when the player tilts their phone
@socketio.on('tilt')
def handle_tilt(data):
	global serverID
    # Make sure it's a valid int
	if isinstance(data, int):
		angle = data
	else:
		return False
    # Figure out which client it is
	for client in clients:
		if client["id"] == request.sid:
            # Inform the host
			if serverID != "":
				socketio.emit("tilt", json.dumps({"id": request.sid, "angle": angle}), room=serverID)
				return True
			break

# Handles the event when a player is updating their throttle
@socketio.on('moving')
def handle_moving(data):
	global serverID
    # Make sure it's a boolean
	if isinstance(data, bool):
		moving = data
	else:
		return False
    # Figure out which client
	for client in clients:
		if client["id"] == request.sid:
			if serverID != "":
				socketio.emit("moving", json.dumps({"id": request.sid, "moving": moving}), room=serverID)
				return True
			break

# Handles the event when a player is hitting the fire button
@socketio.on('fire')
def handle_fire(data):
	global serverID
    # Make sure it's a boolean
	if isinstance(data, bool):
		firing = data
	else:
		return False
    # Figure out which client
	for client in clients:
		if client["id"] == request.sid:
			if serverID != "":
				socketio.emit("firing", json.dumps({"id": request.sid, "firing": firing}), room=serverID)
				return True
			break

# Forwards the vibrate event from the host to the client
@socketio.on('vibrate')
def handle_fire(jsondata):
	global serverID
	if serverID != request.sid:
		return False
	data = json.loads(jsondata)
	for client in clients:
		if client["id"] == data["id"]:
			socketio.emit("vibrate", data["time"], room=data["id"])
			return True
	return False

# Run the server
print("Server started on {}:{}".format(appHost, appPort))
if __name__ == '__main__':
	socketio.run(app, host=appHost, port=appPort )
