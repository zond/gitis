window.TopNavigationView = Backbone.View.extend({

	template: _.template($('#top_navigation_underscore').html()),

	initialize: function() {
	  _.bindAll(this, 'render');
		this.path = [
		];
		this.listenTo(window.session.user, 'change', this.render);
	},

	navigate: function(url) {
	  window.session.router.navigate(url, { trigger: true });
		this.path = _.reject(url.split('/'), function(el) {
		  return el == '';
		});
		this.render();
	},

	render: function() {
		var that = this;
		that.$el.html(that.template({}));
		var path = '/';
    var last_li = $('<li><a href="/"><span class="glyphicon glyphicon-list"></span></a></li>');
		that.$('.breadcrumb').append(last_li);
		_.each(that.path, function(el) {
		  path = path + '/' + el;
		  last_li = $('<li><a href="' + path + '">' + el + '</a></li>');
			that.$('.breadcrumb').append(last_li);
		});
		last_li.addClass('active');
		if (window.session.user.loggedIn()) {
		  that.$('ul.navbar-right').append('<li><a href="/logout">Sign out</a></li>');
		} else {
		  that.$('ul.navbar-right').append('<li><a href="/login">Sign in</a></li>');
		}
		$('#content').css('margin-top', that.$el.height());
		return that;
	},

});


