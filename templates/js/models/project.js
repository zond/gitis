window.Project = Backbone.Model.extend({

  idAttribute: 'Id',

	urlRoot: '/projects',

	initialize: function(attrs, opts) {
	  _.bindAll(this, 'change');
	  this.issues = new Issues();
		this.collaborators = new Collaborators();
		this.listenTo(this.issues, 'reset', this.change);
		this.listenTo(this.collaborators, 'reset', this.change);
		this.states = {};
	},

	change: function() {
	  this.updateStates()
	  this.trigger('change');
	},

	updateStates: function() {
		var that = this;
	  that.states = {};
		that.issues.each(function(issue) {
			that.states[issue.fullName()] = issue.getState();
		});
		that.trigger('updated_states');
	},

	parse: function(data) {
		var that = this;
		_.each(data.Repositories, function(repo) {
		  var repoCollaborators = new Collaborators([], { url: 'https://api.github.com/repos/' + repo + '/collaborators' });
			repoCollaborators.fetch({
			  success: function() {
				  that.collaborators.set(repoCollaborators.models, { remove: false, silent: true });
					that.collaborators.trigger('reset');
				},
			});
		  var repoIssues = new Issues([], { url: 'https://api.github.com/repos/' + repo + '/issues' });
			repoIssues.fetch({
			  success: function() {
					that.issues.each(function(issue) {
					  var parts = repo.split('/');
					  if (issue.get('user').login == parts[0] && !repoIssues.contains(issue)) {
						  that.issues.remove(issue, { silent: true });
						}
					});
          that.issues.set(repoIssues.models, { remove: false, silent: true });
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



