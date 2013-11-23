window.TopNavigationView = Backbone.View.extend({

	template: _.template($('#top_navigation_underscore').html()),

	initialize: function() {
	  _.bindAll(this, 'render');
		this.path = [
		];
		this.listenTo(window.session.user, 'change', this.render);
	},

	setPath: function(path) {
	  this.path = path;
		this.render();
	},

	render: function() {
		var that = this;
		that.$el.html(that.template({}));
		var path = '/';
    var last_li = $('<li><a class="navigate" href="/"><span class="glyphicon glyphicon-list"></span></a></li>');
		that.$('.breadcrumb').append(last_li);
		_.each(that.path, function(el) {
		  path = path + '/' + el;
		  last_li = $('<li><a href="' + path + '">' + el + '</a></li>');
			that.$('.breadcrumb').append(last_li);
		});
		last_li.addClass('active');
		if (window.session.user.loggedIn()) {
		  that.$('.navbar-right').append('<a class="btn btn-default" href="/logout">Sign out</a>');
		} else {
		  that.$('.navbar-right').append('<a class="btn btn-default" href="/login">Sign in</a>');
		}
		$('#content').css('margin-top', that.$el.height());
		return that;
	},

});


