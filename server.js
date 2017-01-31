var express = require('express')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var currentWinner = '';

/* Express setup
---------------------------------------*/
app.set('view engine', 'pug');
app.set('views', './views');
app.use(express.static('public'));


/* Express routes
---------------------------------------*/
app.get('/', function(req, res){
	if(req.query.team) return res.redirect('/team/'+req.query.team);
	res.render('index');
});

app.get('/team/:team', function(req, res){
	res.render('team', {team: req.params.team});
});


/* WebSocket communication
---------------------------------------*/
io.on('connection', function(socket){
	console.log('a user connected');
	socket.on('buzz', function(team){
		console.log('buzzing: ' + team);
		if(!currentWinner) currentWinner = team;
		console.log('currentWinner: ' + currentWinner);
		socket.emit('winner', currentWinner);
	});
});


/* Server
---------------------------------------*/
http.listen(8080, function(){
	console.log('listening on *:8080');
});