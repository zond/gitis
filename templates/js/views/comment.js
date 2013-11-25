window.CommentView = Backbone.View.extend({

	template: _.template($('#comment_underscore').html()),

	tagName: 'li',

	className: 'list-group-item',

	initialize: function(options) {
	  _.bindAll(this, 'render');
	},

	render: function() {
		var that = this;
		that.$el.html(that.template({
		  model: that.model,
		}));
		return that;
	},

});


