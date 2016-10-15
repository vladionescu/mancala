App.ApplicationController = Ember.Controller.extend({
	// error message placeholder
	error: null,
        // if there is a previously saved username, load it
        username: localStorage['username'],

	actions: {
		close_alert: function() {
			// clear the error property, which will hide the error alert
			this.set('error', null);
		},
	        logout: function() {
			// save this object and namespace, as we'll need
			// to access it from within the socket
			var context = this;

			// tell the server the user logged out
			// so the database can be updated, that way other users
			// won't be fooled thinking this user is still online
			var io = this.get('socket');
			var socket = io.socket;			
			socket.emit('logout', {user:this.get('username')});

			socket.on('error', function(data) {
				// there was a problem logging out from server
				// display the error
				context.set('error', data);
			});

			// clear the saved username and effectively log the user out
			// from the user's perspective
			this.set('username', null);
			localStorage.removeItem('username');
       
			// redirect to the login screen
			this.transitionTo('login');
                }
	}
});
