window.ProjectDetailsView = Backbone.View.extend({

	template: _.template($('#project_details_underscore').html()),

	initialize: function() {
	  _.bindAll(this, 'render');
		this.listenTo(this.model, 'change', this.render);
	},

	render: function() {
		var that = this;
		window.session.nav.setPath([ this.model.get('Name') ]);
		that.$el.html(that.template({
		  model: that.model,
		}));
		return that;
	},

});


