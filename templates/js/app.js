
window.session = {};

$(window).load(function() {

	$(document).on('click', 'a.navigate', function(ev) {
	  ev.preventDefault();
	  window.session.router.navigate($(ev.target).attr('href'), { trigger: true });
	});

	var AppRouter = Backbone.Router.extend({
	
		routes: {
			"projects/:id/issues": "showIssues",
			"projects/:id": "showProject",
			"": "projects",
			"*all": "projects",
		},

		projects: function() {
		  new ProjectsView({
			  el: $('#content'),
			});
		},

		showIssues: function(id) {
			var that = this;
		  var project = new Project({ Id: id });
			project.fetch({
			  success: function() {
					new ProjectIssuesView({
					  el: $('#content'),
					  model: project,
					});
				},
			});
		},

		showProject: function(id) {
			var that = this;
		  var project = new Project({ Id: id });
			project.fetch({
			  success: function() {
					new ProjectDetailsView({
					  el: $('#content'),
					  model: project,
					});
				},
			});
		},
	});	
	
	window.session.user = new User();
	window.session.user.fetch();

	$.ajaxPrefilter(function(options, originalOptions, jqXHR) {
	  if (options.type == 'GET') {
			if (options.url.indexOf("?") == -1) {
				options.url += '?cacheKiller=' + new Date().getTime();
			} else {
				options.url += '&cacheKiller=' + new Date().getTime();
			}
		}
	  var token = window.session.user.get('access_token');
	  if (token != null && token != '') {
			if (options.headers == null) {
				options.headers = {};
			}
			if (options.headers['Authorization'] == null) {
				options.headers['Authorization'] = 'token ' + token;
			}
		}
	});

  var oldSync = Backbone.sync;
  Backbone.sync = function(method, model, opts) {
	  if (method == 'read' && typeof model.models == 'object') {
		  var getNextLink = function(req) {
				var linkHeader = req.getResponseHeader('Link');
				if (linkHeader == null) {
				  return null;
				}
				var rels = linkHeader.split(',');
				var result = null;
				_.each(rels, function(rel) {
					var parts = rel.split(';');
					if (parts[1].trim() == 'rel="next"') {
						var match = /^<(.*)>$/.exec(parts[0].trim());
						if (match != null) {
							result = match[1];
						}
					}
				});
				return result;
			};
			var req = null;
			var oldSuccess = opts.success;
			var sum = [];
			opts.success = function(values) {
			  sum = sum.concat(values);
			  var nextLink = getNextLink(req);
				if (nextLink == null) {
				  return oldSuccess(sum);
				}
				req = $.ajax(nextLink, {
					success: opts.success,
				});
			};
			req = oldSync(method, model, opts);
			return req;
		}
		return oldSync(method, model, opts);
	};

	window.session.nav = new TopNavigationView({
		el: $('nav'),
	}).doRender();

	window.session.router = new AppRouter();
	Backbone.history.start({ 
		pushState: true,
	});

	window.session.router.navigate(Backbone.history.fragment || '/');
});


