App.LoginController = Ember.ObjectController.extend({
        needs: 'application',
        error: Ember.computed.alias('controllers.application.error'),
        username: Ember.computed.alias('controllers.application.username'),

	actions: {
		login: function(username) {
			if(username.length > 0) {
				// save this object and namespace, as we'll need
				// to access it from within the socket
				var context = this;

				// tell the server the user is logged in
				// so they can be added to the database and
				// other users can see they are online
				var io = this.get('socket');
				var socket = io.socket;
				socket.emit('login', {user: this.get('username')});

				socket.on('error', function(data) {
					// there's been a problem! clear any saved
					context.set('username', '');
					localStorage['username'] = '';

					// send the error through to the user/UI
					context.set('error', data);
				});
				socket.on('ok', function() {
					// server says this username is ok, save it
					context.set('username', username);
					localStorage['username'] = context.get('username');
					// redirect to the logged in view
					context.transitionTo('lobby', localStorage['username']);
				});
			}
		}
	}
});
