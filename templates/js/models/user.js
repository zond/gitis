window.User = Backbone.Model.extend({

	url: '/user',

	initialize: function(attrs, opts) {
	  this.repos = new Repositories();
	},

	loggedIn: function() {
		return !!this.get('AccessToken');
	},

	parse: function(data) {
		var that = this;
		if (!!data.AccessToken) {
		  that.set('AccessToken', data.AccessToken, { silent: true });
			var userRepositories = new Repositories([], { url: 'https://api.github.com/user/repos' });
			userRepositories.fetch({
				success: function() {
					userRepositories.each(function(repo) {
						that.repos.add(repo);
					});
          that.repos.each(function(repo) {
					  var parts = repo.get('full_name').split('/');
						if (parts[0] == that.get('login') && !userRepositories.contains(repo)) {
						  that.repos.remove(repo);
						}
					});
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
								orgRepos.each(function(repo) {
									that.repos.add(repo);
								});
								that.repos.each(function(repo) {
									var parts = repo.get('full_name').split('/');
									if (parts[0] == org.get('login') && !orgRepos.contains(repo)) {
										that.repos.remove(repo);
									}
								});
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


