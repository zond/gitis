window.CommentView = BaseView.extend({

	template: _.template($('#comment_underscore').html()),

	tagName: 'li',

	className: 'list-group-item',

	render: function() {
		var that = this;
		that.$el.html(that.template({
		  model: that.model,
		}));
		return that;
	},

});


