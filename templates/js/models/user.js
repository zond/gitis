window.User = Backbone.Model.extend({

	url: '/user',

	loggedIn: function() {
		return !!this.get('access_token');
	},
});


