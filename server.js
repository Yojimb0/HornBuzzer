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
	console.log('[server.js - socket] New connection');
	socket.on('buzz', function(team){
		if(!currentWinner) currentWinner = team;
		console.log('[server.js - socket] buzz from team:' + team + ' currentWinner:' + currentWinner);
		socket.emit('winner', currentWinner);
	});
});


/* Server
---------------------------------------*/
http.listen(process.env.PORT || 5000, function(){
	console.log('[server.js - listen] port:' + process.env.PORT || 5000);
});