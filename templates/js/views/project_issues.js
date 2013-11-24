window.ProjectIssuesView = Backbone.View.extend({

	template: _.template($('#project_issues_underscore').html()),

	events: {
	  "click .close-backlog": "closeBacklog",
	  "click .open-backlog": "openBacklog",
	},

	initialize: function() {
	  _.bindAll(this, 'render');
		this.listenTo(this.model, 'change', this.render);
	},

	closeBacklog: function(ev) {
		var that = this;
	  ev.preventDefault();
		that.$('.state-col').each(function(ind, e) {
			var el = $(e);
			el.removeClass('col-md-3').addClass('col-md-4');
		});
		that.$('.backlog-col').addClass('hidden');
		that.$('.glyphicon-folder-close').removeClass('hidden');
	},

	openBacklog: function(ev) {
	  var that = this;
		ev.preventDefault();
		that.$('.state-col').each(function(ind, e) {
			var el = $(e);
			el.removeClass('col-md-4').addClass('col-md-3');
		});
		that.$('.backlog-col').removeClass('hidden');
		that.$('.glyphicon-folder-close').addClass('hidden');
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
		  var state = issue.state();
			if (state == 'Ready') {
			  that.$('.ready-issues').append(new IssueView({
				  model: issue,
				}).render().el);
			} else if (state == 'Doing') {
			  that.$('.doing-issues').append(new IssueView({
				  model: issue,
				}).render().el);
			} else if (state == 'Done') {
			  that.$('.done-issues').append(new IssueView({
				  model: issue,
				}).render().el);
			} else if (state == 'Backlog') {
			  that.$('.backlog-issues').append(new IssueView({
				  model: issue,
				}).render().el);
			}
		});
		that.$('.issue-list').sortable();
		return that;
	},

});


