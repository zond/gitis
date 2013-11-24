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
		that.$('.issue-list').css('height', '' + ($(window).height() - 150) + 'px');
		that.model.issues.each(function(issue) {
		  var state = issue.getState();
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
		that.$('.issue-list').sortable({
		  connectWith: '.issue-list',
			stop: function(ev, ui) {
			  var issueElement = $(ev.toElement).closest('.issue');
			  var before = issueElement.prev('.issue');
				var after = issueElement.next('.issue');
				var newPrio = issueElement[0].issue.getPrio();
				if (before.length == 0 && after.length == 1) {
				  newPrio = after[0].issue.getPrio() - 1;
				} else if (before.length == 1 && after.length == 0) {
				  newPrio = before[0].issue.getPrio() + 1;
				} else if (before.length == 1 && after.length == 1) {
				  newPrio = (before[0].issue.getPrio() + after[0].issue.getPrio()) / 2.0;
				}
        issueElement[0].issue.setPrio(newPrio);
			},
			receive: function(ev, ui) {
				var issue = $(ev.toElement).closest('.issue')[0].issue;
			  var el = $(ev.target);
				if (el.hasClass('ready-issues')) {
				  issue.setState('Ready');
				} else if (el.hasClass('doing-issues')) {
				  issue.setState('Doing');
				} else if (el.hasClass('done-issues')) {
				  issue.setState('Done');
				} else if (el.hasClass('backlog-issues')) {
				  issue.setState('Backlog');
				}
			},
		});
		return that;
	},

});


