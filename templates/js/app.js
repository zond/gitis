
window.session = {};

$(window).load(function() {
  
	$(document).on('click', 'a.navigate', function(ev) {
	  ev.preventDefault();
	  window.session.router.navigate($(ev.target).attr('href'), { trigger: true });
	});

	var AppRouter = Backbone.Router.extend({
	
		currentView: null,

		render: function(view) {
			if (this.currentView != null) {
			  this.currentView.remove();
			}
			$('#content').append(view.render().el);
			this.currentView = view;
		},

		routes: {
			"projects/:id": "showProject",
			"": "projects",
			"*all": "projects",
		},

		projects: function() {
		  this.render(new ProjectsView({}));
		},

		showProject: function(id) {
			var that = this;
		  var project = new Project({ Id: id });
			project.fetch({
			  success: function() {
					that.render(new ProjectDetailsView({
					  model: project,
					}));
				},
			});
		},
	});	
	
	window.session.user = new User();
	window.session.user.fetch();

	$.ajaxPrefilter(function(options, originalOptions, jqXHR) {
	  var token = window.session.user.get('AccessToken');
	  if (token != null && token != '') {
			if (options.headers == null) {
				options.headers = {};
			}
			if (options.headers['Authorization'] == null) {
				options.headers['Authorization'] = 'token ' + token;
			}
		}
	});

	window.session.nav = new TopNavigationView({
		el: $('nav'),
	}).render();

	window.session.router = new AppRouter();
	Backbone.history.start({ 
		pushState: true,
	});

	window.session.router.navigate(Backbone.history.fragment || '/');
});


