window.IssueView = Backbone.View.extend({

	template: _.template($('#issue_underscore').html()),

	className: 'panel panel-default issue',

	initialize: function() {
	  _.bindAll(this, 'render');
		this.listenTo(this.model, 'change', this.render);
	},

	render: function() {
		var that = this;
		that.$el.html(that.template({
		  model: that.model,
		}));
		that.el.issue = that.model;
		return that;
	},

});


