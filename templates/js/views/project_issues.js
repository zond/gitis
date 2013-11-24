window.ProjectIssuesView = Backbone.View.extend({

	template: _.template($('#project_issues_underscore').html()),

	initialize: function() {
	  _.bindAll(this, 'render');
		this.listenTo(this.model, 'change', this.render);
	},

	render: function() {
		var that = this;
		window.session.nav.setPath([ 
			{
				label: that.model.get('Name'),
				path: '/projects/' + that.model.get('Id'),
			},
			{
				label: 'Issues',
				path: '/projects/' + that.model.get('Id') + '/issues',
			},
		]);
		that.$el.html(that.template({
		  model: that.model,
		}));
		that.model.issues.each(function(issue) {
		});
		return that;
	},

});


