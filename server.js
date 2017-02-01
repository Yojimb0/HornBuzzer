var express = require('express')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var respondingTeams = [];
var timestamp = process.hrtime();

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

app.get('/admin/:password', function(req, res){
	if(req.params.password === (process.env.PASSWORD)){
		console.log('[server.js - route admin] Password matching', req.params.password);
		return res.render('admin');
	}
	console.log('[server.js - route admin] Password not matching => 404');
	res.render('404');
});

app.get('*', function(req, res){
	res.status(404);
	res.render('404');
});

/* WebSocket communication
---------------------------------------*/
io.on('connection', function(socket){
	console.log('[server.js - socket] New connection');
	socket.on('buzz', function(team){
		console.log('[server.js - socket(buzz)] team:' + team)
		console.log('[server.js - socket(buzz)] respondingTeams:', respondingTeams)
		if(respondingTeams.find(o => o.team === team)) return console.log('[server.js - socket(buzz)] team:' + team + ' already counted');
		respondingTeams.push({
			team: team,
			time: process.hrtime(timestamp)[0] + '.' + Math.round(process.hrtime(timestamp)[1]/10000000) + 's'
		});
		console.log('[server.js - socket(buzz)] buzz from team:' + team);
		socket.broadcast.emit('winner', respondingTeams);
		socket.emit('winner', respondingTeams);
	});
	socket.on('reset', function(){
		console.log('[server.js - socket(reset)]')
		socket.broadcast.emit('resetClients');
		socket.emit('resetClients');
		timestamp = process.hrtime();
		respondingTeams = [];
	});
});


/* Server
---------------------------------------*/
http.listen(process.env.PORT || 5000, function(){
	console.log('[server.js - listen] port:' + (process.env.PORT || 5000));
});