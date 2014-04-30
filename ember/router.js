App.Router.map(function() {
	this.resource('login');
	this.resource('lobby', { path: 'lobby/:username' });
});

// Initial route, consider this a pre-routing filter
App.ApplicationRoute = Ember.Route.extend({
	beforeModel: function() {
		// if there is no existing username, make the user login
		if(localStorage['username'] === undefined || localStorage['username'].length === 0)
			this.transitionTo('login');
		else
			this.transitionTo('lobby', localStorage['username']);
	}
});

App.LoginRoute = Ember.Route.extend({
	model: function() {
		return { username: localStorage['username'] };
	}
});
