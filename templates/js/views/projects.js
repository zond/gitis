window.ProjectsView = Backbone.View.extend({

	template: _.template($('#projects_underscore').html()),

	events: {
	  'click .add-project button': 'createProject',
	},
	
	initialize: function() {
	  _.bindAll(this, 'render');
		this.collection = new Projects();
		this.listenTo(window.session.user, 'change', this.render);
		this.listenTo(this.collection, 'reset', this.render);
		this.listenTo(this.collection, 'add', this.render);
		this.listenTo(this.collection, 'remove', this.render);
		this.collection.fetch({ reset: true });
	},

	createProject: function(ev) {
	  ev.preventDefault();
		this.collection.create({
		  Name: $('.new-project-name').val(),
		});
	},

	render: function() {
		var that = this;
		window.session.nav.setPath([ ]);
		window.session.nav.setCollaborators([]);
		that.$el.html(that.template({}));
		if (window.session.user.loggedIn()) {
      that.collection.each(function(project) {
			  that.$('table').append(new ProjectView({
				  model: project,
				}).render().el);
			});
		  that.$el.show();
		} else {
		  that.$el.hide();
		}
		return that;
	},

});


