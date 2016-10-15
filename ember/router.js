App.Router.map(function() {
	this.resource('login');
	this.resource('lobby', { path: 'lobby/:username' });
});

// Initial route, consider this a pre-routing filter
App.ApplicationRoute = Ember.Route.extend({
	beforeModel: function() {
		// setup the websocket connection to the backend server
		var socket = this.get('socket');
		socket.connect();

		// if there is no existing username, make the user login
		if(localStorage['username'] === undefined || localStorage['username'].length === 0)
			this.transitionTo('login');
		else
			this.transitionTo('lobby', localStorage['username']);
	}
});

App.LoginRoute = Ember.Route.extend({
	beforeModel: function() {
		// if the user is logged in, bypass login send to lobby
		if(localStorage['username'] !== '' && localStorage['username'] !== undefined)
			this.transitionTo('lobby', localStorage['username']);
	},
	model: function() {
		return { username: localStorage['username'] };
	}
});

App.LobbyRoute = Ember.Route.extend({
	setupController: function(controller, model) {
		// setup socket connection and ask who is active right now
		var socket = this.get('socket').socket;
		socket.emit('who');
		socket.on('active', function(data) {
			// get the current model
			var new_model = model;

			// add the active_users property to this model
			new_model.active_users = data;

			// set the model to include our addition
			controller.set('model', new_model);
		});
	},

	model: function() {
		return {
			username: localStorage['username']
		};
	}
});
