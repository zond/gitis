window.ProjectsView = BaseView.extend({

	template: _.template($('#projects_underscore').html()),

	events: {
	  'click .add-project button': 'createProject',
	},
	
	initialize: function() {
	  _.bindAll(this, 'doRender');
		this.collection = new Projects();
		this.listenTo(window.session.user, 'change', this.doRender);
		this.listenTo(this.collection, 'reset', this.doRender);
		this.listenTo(this.collection, 'add', this.doRender);
		this.listenTo(this.collection, 'remove', this.doRender);
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


