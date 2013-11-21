window.AboutView = Backbone.View.extend({

	template: _.template($('#about_underscore').html()),

	render: function() {
		var that = this;
		that.$el.html(that.template({}));
		return that;
	},

});


