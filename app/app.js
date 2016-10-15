/**
  @module app
  @main app
**/
var express = require('express');
var http = require('http');
var mongoskin = require('mongoskin');
var compress = require('compression');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var logger = require('morgan');
var errorHandler = require('errorhandler');
var cors = require('cors');
var sio = require('socket.io');
var config = require('./config')();

/**
  Configure application settings
  @config app
**/
var app = express();
var server = http.createServer(app);
var corsAllowed = {origin: "http://mancala.vladionescu.com"};

/**
  MongoDB connector
**/
var db = mongoskin.db('mongodb://@localhost:27017/mancala', {safe:true});

app.param('collectionName', function(req, res, next, collectionName){
  req.collection = db.collection(collectionName);
  return next();
})

//app.use(express.cookieParser('secret'));
//app.use(express.cookieSession());
app.use(compress());
app.use(bodyParser());
app.use(methodOverride());

if (config.node_env == 'development') {
  app.use(errorHandler({ dumpExceptions: true, showStack: true }));
}

/**
  Load application routes
**/
app.get('/', cors(corsAllowed), function(req, res, next) {
  res.send('please select a collection, e.g., /collections/messages');
});

app.get('/collections/:collectionName', function(req, res, next) {
  req.collection.find({} ,{limit:10, sort: [['_id',-1]]}).toArray(function(e, results){
    if (e) return next(e);
    res.send(results);
  });
});

app.post('/collections/:collectionName', function(req, res, next) {
  req.collection.insert(req.body, {}, function(e, results){
    if (e) return next(e);
    res.send(results);
  });
});

app.get('/collections/:collectionName/:id', function(req, res, next) {
  req.collection.findById(req.params.id, function(e, result){
    if (e) return next(e);
    res.send(result);
  });
});

app.put('/collections/:collectionName/:id', function(req, res, next) {
  req.collection.updateById(req.params.id, {$set:req.body}, {safe:true, multi:false}, function(e, result){
    if (e) return next(e);
    res.send((result===1)?{msg:'success'}:{msg:'error'});
  });
});

app.del('/collections/:collectionName/:id', function(req, res, next) {
  req.collection.removeById(req.params.id, function(e, result){
    if (e) return next(e);
    res.send((result===1)?{msg:'success'}:{msg:'error'});
  });
});

/**
  Listen or export if required by testing
**/
if (!module.parent) {
  var port = 8244;
  var io = sio.listen(server);
  server.listen(port);
  console.log('Mancala-server listening on localhost port '+ port);
} else {
  module.exports = app;
}

/**
  Socket Handling
**/
io.sockets.on('connection', function(socket) {
	socket.on('login', function(data) {
		// check if this user is already logged in
		db.collection('users').findOne({user:data.user}, function(err, result) {
			if(err) throw err;
			
			if(result) {
				// if that username is already logged in
				// ask the user for another name, send back en error
				socket.emit('error', 'This user is already logged in.');
			} else {
				// if that username isn't logged in, log them in
				db.collection('users').insert({user:data.user}, function(err, result) {
					if(err) throw err;
					if(result) {
						console.log(data.user+" just logged in.");
						socket.emit('ok');

						// tell who are the currently logged in (active) users
						var active;
						db.collection('users').find({}, {user:1, _id:0}).toArray(function(err, result) {
							if(err) throw err;
							
							socket.emit('active', result);
						});
					}
				});
			}
		});
	});

	socket.on('logout', function(data) {
		// try to remove the user from the logged in users
		db.collection('users').remove({user:data.user}, function(err, result) {
			if (err) throw err;
			if (result) socket.emit('ok');
			else socket.emit('error', 'This user is not logged in.');

			// tell who are the currently logged in (active) users
			var active;
			db.collection('users').find({}, {user:1, _id:0}).toArray(function(err, result) {
				if(err) throw err;
				
				socket.emit('active', result);
			});
		});
	});

	socket.on('who', function() {
		// tell who are the currently logged in (active) users
		var active;
		db.collection('users').find({}, {user:1, _id:0}).toArray(function(err, result) {
			if(err) throw err;
			
			socket.emit('active', result);
		});
	});
});
