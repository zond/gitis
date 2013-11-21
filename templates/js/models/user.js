window.User = Backbone.Model.extend({

	url: '/user',

	loggedIn: function() {
		return false;
	},
});


