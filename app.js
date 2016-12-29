var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	currentRoom;

app.use(express.static(__dirname + '/public'));

server.listen(3000);

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket) {
	socket.on('room', function(data) {
		var newRoom = data.newRoom;
		currentRoom = data.currentRoom;
		if(currentRoom != undefined) {
			socket.leave(currentRoom);
			io.in(currentRoom).emit('new message', {currentRoom, message: '<strong>A user has disconnected from the room.</strong>'});
			socket.room = newRoom;
		}
		else {
			socket.room = "Global Chat";
		}
		socket.join(newRoom);
		socket.emit('new message', {newRoom, message: '<strong>Joined room: '+newRoom+'</strong>'});
		socket.broadcast.to(newRoom).emit('new message', {newRoom, message:'<strong>A new user has joined the room.</strong>'});
	});

	socket.on('send message', function(data) {
		var room = data.room;
		var message = data.message;
		io.in(data.room).emit('new message', {room, message});
	});

	socket.on('disconnect', function() {
		if(currentRoom === undefined) currentRoom = "Global Chat";
		io.in(currentRoom).emit('new message', {currentRoom, message: '<strong>A user has disconnected from the room.</strong>'});
	});
});

console.log("Server started on port 3000...");
