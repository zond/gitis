window.ProjectDetailsView = Backbone.View.extend({

	template: _.template($('#project_details_underscore').html()),

	initialize: function() {
	  _.bindAll(this, 'render');
		this.repos = window.session.user.repos();
		this.listenTo(this.model, 'change', this.render);
		this.listenTo(this.repos, 'reset', this.render);
	},

	render: function() {
		var that = this;
		window.session.nav.setPath([ this.model.get('Name') ]);
		that.$el.html(that.template({
		  model: that.model,
		}));
		that.repos.each(function(repo) {
      that.$('.project-repositories').append('<option value=' + repo.get('full_name') + '>' + repo.get('full_name') + '</option>');
		});
		that.$('.project-repositories').multiSelect();
		return that;
	},

});


