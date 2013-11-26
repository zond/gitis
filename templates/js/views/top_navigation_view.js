window.TopNavigationView = BaseView.extend({

	template: _.template($('#top_navigation_underscore').html()),

	initialize: function() {
	  _.bindAll(this, 'render');
		this.path = [
		];
		this.collaborators = [
		];
		this.listenTo(window.session.user, 'change', this.render);
	},

	setPath: function(path) {
	  this.path = path;
		this.render();
	},

	setCollaborators: function(coll) {
	  this.collaborators = coll;
		this.render();
	},

	render: function() {
		var that = this;
		that.$el.html(that.template({}));
		var path = '/';
    var last_li = $('<li><a class="navigate" href="/"><span class="glyphicon glyphicon-list"></span></a></li>');
		that.$('.breadcrumb').append(last_li);
		_.each(that.path, function(el) {
		  path = path + '/' + el.label;
		  last_li = $('<li><a class="navigate" href="' + el.path + '">' + el.label + '</a></li>');
			that.$('.breadcrumb').append(last_li);
		});
		last_li.addClass('active');
		_.each(that.collaborators, function(c) {
		  that.$('.collaborators').prepend('<img title="' + _.escape(c.get('login')) + '" data-login="' + c.get('login') + '" class="avatar" src="' + c.get('avatar_url') + '">');
		});
		if (window.session.user.loggedIn()) {
		  that.$('.login-button').html('<a class="btn btn-default" href="/logout">Sign out</a>');
		} else {
		  that.$('.login-button').html('<a class="btn btn-default" href="/login">Sign in</a>');
		}
		$('#content').css('margin-top', that.$el.height());
		that.$('.avatar').draggable({
		  helper: 'clone',
		});
		return that;
	},

});


