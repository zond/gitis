window.ProjectView = Backbone.View.extend({

	template: _.template($('#project_underscore').html()),

	tagName: 'tr',

	events: {
	  'click .remove-button': 'removeProject',
	},

	initialize: function() {
	  _.bindAll(this, 'render');
		this.listenTo(this.model, 'change', this.render);
	},

	removeProject: function(ev) {
	  ev.preventDefault();
		this.model.destroy();
	},

	render: function() {
		var that = this;
		that.$el.html(that.template({
		  model: that.model,
		}));
		return that;
	},

});


