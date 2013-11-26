window.User = Backbone.Model.extend({

	url: '/user',

  idAttribute: 'Id',

	initialize: function(attrs, opts) {
	  _.bindAll(this, 'change');
	  this.repos = new Repositories();
		this.listenTo(this.repos, 'reset', this.change);
	},

	change: function() {
	  this.trigger('change');
	},

	loggedIn: function() {
		return !!this.get('access_token');
	},

	parse: function(data) {
		var that = this;
		if (!!data.access_token) {
		  that.set('access_token', data.access_token, { silent: true });
			var userRepositories = new Repositories([], { url: 'https://api.github.com/user/repos' });
			userRepositories.fetch({
				success: function() {
          that.repos.each(function(repo) {
					  var parts = repo.get('full_name').split('/');
						if (parts[0] == that.get('login') && !userRepositories.contains(repo)) {
						  that.repos.remove(repo, { silent: true });
						}
					});
					that.repos.set(userRepositories.models, { remove: false, silent: true });
					that.repos.trigger('reset');
				},
			});
			var userOrgs = new Orgs();
			userOrgs.fetch({
				success: function() {
					userOrgs.each(function(org) {
						var orgRepos = new Repositories([], { url: org.get('repos_url') });
						orgRepos.fetch({
							success: function() {
								that.repos.each(function(repo) {
									var parts = repo.get('full_name').split('/');
									if (parts[0] == org.get('login') && !orgRepos.contains(repo)) {
										that.repos.remove(repo, { silent: true });
									}
								});
								that.repos.set(orgRepos.models, { remove: false, silent: true });
								that.repos.trigger('reset');
							},
						});
					});
				},
			});
		}
	  return data;
	},

});


