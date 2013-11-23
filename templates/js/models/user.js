window.User = Backbone.Model.extend({

	url: '/user',

	loggedIn: function() {
		return !!this.get('AccessToken');
	},

	repos: function() {
    var result = new Repositories();
		var userRepositories = new Repositories([], { url: 'https://api.github.com/user/repos' });
		userRepositories.fetch({
		  success: function() {
			  userRepositories.each(function(repo) {
				  result.add(repo);
				});
				result.trigger('reset');
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
							  result.add(repo);
							});
							result.trigger('reset');
						},
					});
				});
			},
		});
		return result;
	},
});


