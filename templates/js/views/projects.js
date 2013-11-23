window.ProjectsView = Backbone.View.extend({

	template: _.template($('#projects_underscore').html()),
	
	initialize: function() {
	  _.bindAll(this, 'render');
		this.collection = new Projects();
		this.listenTo(window.session.user, 'change', this.render);
		this.listenTo(this.collection, 'change', this.render);
		this.collection.fetch();
	},

	render: function() {
		var that = this;
		that.$el.html(that.template({}));
		if (window.session.user.loggedIn()) {
		  that.$el.show();
		} else {
		  that.$el.hide();
		}
		return that;
	},

});


