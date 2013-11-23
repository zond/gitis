window.Project = Backbone.Model.extend({

  idAttribute: 'Id',

	urlRoot: '/projects',

	issueCount: function() {
	  var that = this;
	  var result = 0;
		window.session.user.repos.each(function(repo) {
		  if (that.get('Repositories').indexOf(repo.get('full_name')) != -1) {
			  result += repo.get('open_issues');
			}
		});
		return result;
	},

});



