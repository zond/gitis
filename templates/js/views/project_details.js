window.ProjectDetailsView = Backbone.View.extend({

	template: _.template($('#project_details_underscore').html()),

	initialize: function() {
	  _.bindAll(this, 'render');
		this.repos = window.session.user.repos();
		this.listenTo(this.model, 'change', this.render);
		this.listenTo(this.repos, 'reset', this.render);
	},

	updateProject: function() {
	  console.log(values);
	},

	render: function() {
		var that = this;
		window.session.nav.setPath([ 
			{
				label: that.model.get('Name'),
				path: '/projects/' + that.model.get('Id'),
			},
		]);
		that.$el.html(that.template({
		  model: that.model,
		}));
		var current = {};
		_.each(that.model.get('Repositories'), function(repo) {
      current[repo] = true;
		});
		that.repos.each(function(repo) {
      that.$('.project-repositories').append('<option ' + (current[repo.get('full_name')] ? 'selected="selected" ' : '' ) + 'value=' + repo.get('full_name') + '>' + repo.get('full_name') + '</option>');
		});
		that.$('.project-repositories').multiSelect({
		  afterSelect: function(values) {
			  if (that.model.get('Repositories') == null) {
				  that.model.set('Repositories', [], { silent: true });
				}
			  _.each(values, function(repo) {
					that.model.get('Repositories').push(repo);
				});
				that.model.save();
			},
			afterDeselect: function(values) {
			  _.each(values, function(repo) {
				  var now = that.model.get('Repositories');
					var pos = now.indexOf(repo);
					now = now.slice(0, pos).concat(now.slice(pos + 1));
					that.model.set('Repositories', now, { silent: true })
				});
				that.model.save();
			},
		});
		return that;
	},

});

