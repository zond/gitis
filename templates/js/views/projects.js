window.ProjectsView = Backbone.View.extend({

	template: _.template($('#projects_underscore').html()),
	
	initialize: function() {
	  _.bindAll(this, 'render');
		this.listenTo(window.session.user, 'change', this.render);
	},

	render: function() {
		var that = this;
		that.$el.html(that.template({}));
		if (window.session.user.loggedIn()) {
		  that.$('.add-project').show();
		} else {
		  that.$('.add-project').hide();
		}
		return that;
	},

});


