App.LoginController = Ember.ObjectController.extend({
	// if there is a previously saved username, load it
	username: localStorage['username'],

	actions: {
		login: function(username) {
			if(username.length > 0) {
				// username was submitted, first save it then persist it
				this.set('username', username);
				localStorage['username'] = this.get('username');
				
				// redirect to the logged in view
				this.transitionTo('lobby', localStorage['username']);
			}
		}
	}
});
