window.Project = Backbone.Model.extend({

  idAttribute: 'Id',

	urlRoot: '/projects',

	initialize: function(attrs, opts) {
	  _.bindAll(this, 'change');
	  this.issues = new Issues();
		this.listenTo(this.issues, 'reset', this.change);
	},

	change: function() {
	  this.trigger('change');
	},

	parse: function(data) {
		var that = this;
		_.each(data.Repositories, function(repo) {
		  var repoIssues = new Issues([], { url: 'https://api.github.com/repos/' + repo + '/issues' });
			repoIssues.fetch({
			  success: function() {
				  repoIssues.each(function(issue) {
					  that.issues.set([issue], { remove: false, silent: true });
					});
					that.issues.each(function(issue) {
					  var parts = repo.split('/');
					  if (issue.get('user').login == parts[0] && !repoIssues.contains(issue)) {
						  that.issues.remove(issue, { silent: true });
						}
					});
					that.issues.trigger('reset');
				},
			});
		});
	  return data;
	},

	issueCount: function() {
		var that = this;
		var result = 0;
	  if (that.get('Repositories') != null) {
			window.session.user.repos.each(function(repo) {
				if (that.get('Repositories').indexOf(repo.get('full_name')) != -1) {
					result += repo.get('open_issues');
				}
			});
		}
		return result;
	},

});



