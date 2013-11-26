window.ProjectView = BaseView.extend({

	template: _.template($('#project_underscore').html()),

	tagName: 'tr',

	events: {
	  'click .remove-button': 'removeProject',
		'click .show-project': 'showProject',
		'click .show-issues': 'showIssues',
	},

	initialize: function() {
	  _.bindAll(this, 'doRender');
		this.listenTo(this.model, 'change', this.doRender);
	},

	removeProject: function(ev) {
	  ev.preventDefault();
		this.model.destroy();
	},

	showProject: function(ev) {
	  ev.preventDefault();
		new ProjectDetailsView({
		  el: $('#content'),
			model: this.model,
		}).doRender();
		this.remove();
	},

	showIssues: function(ev) {
	  ev.preventDefault();
		new ProjectIssuesView({
		  el: $('#content'),
			model: this.model,
		}).doRender();
		this.remove();
	},

	render: function() {
		var that = this;
		that.$el.html(that.template({
		  model: that.model,
		}));
		return that;
	},

});


