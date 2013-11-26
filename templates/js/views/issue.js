window.IssueView = Backbone.View.extend({

	template: _.template($('#issue_underscore').html()),

	className: 'panel panel-default issue',

	events: {
		"click .gitlink": "gitlink",
		"show.bs.collapse .comments": 'showComments',
		"show.bs.collapse": 'expand',
		"hide.bs.collapse": 'collapse',
		"keyup .new-comment": 'keyupComment',
	},

	initialize: function(options) {
	  _.bindAll(this, 'render');
		this.project = options.project;
		this.parent = options.parent;
		this.listenTo(this.model, 'change', this.render);
		this.listenTo(this.project, 'updated_states', this.render);
		this.expanded = false;
		this.shownComments = false;
	},

	showComments: function(ev) {
		var that = this;
		if (!that.shownComments) {
		  that.$('.glyphicon-repeat').removeClass('hidden');
		  that.model.comments(function(coms) {
				that.$('.glyphicon-repeat').addClass('hidden');
				coms.each(function(com) {
					that.$('.comment-list').append(new CommentView({
					  model: com,
					}).render().el);
				});
			});
		}
		that.shownComments = true;
	},

	keyupComment: function(ev) {
	  var that = this;
		if (ev.keyCode == 13) {
	    that.model._comments.create({
			  body: that.$('.new-comment').val(),
			}, {
			  success: function(com) {
					that.$('.new-comment').val('');
					that.$('.comment-list').append(new CommentView({
					  model: com,
					}).render().el);
				},
			});
		}
	},

	gitlink: function(ev) {
	  ev.stopPropagation();
	},

	collapse: function() {
	  this.expanded = false;
	},

	expand: function() {
	  this.expanded = true;
	},

	render: function() {
		var that = this;
		var deps = that.model.getDepStates(that.project.states);
		var done = _.filter(deps, function(dep) {
		  return dep == true;
		});
		that.$el.html(that.template({
		  expanded: that.expanded,
			assignee: that.model.get('assignee'),
			deps: deps,
			done: done,
		  model: that.model,
		}));
		that.el.issue = that.model;
		that.$el.droppable({
		  accept: '.avatar',
			hoverClass: 'dropme',
			drop: function(ev, ui) {
			  that.model.setAssignee($(ev.toElement).attr('data-login'));
			},
		});
		that.$('.avatar').draggable({
		  stop: function(ev, ui) {
			  var el = $(ev.target);
				var top = parseInt(el.css('top'));
				var left = parseInt(el.css('left'));
			  if (top * top > 100 || left * left > 100) {
				  that.model.setAssignee('');
				}
			},
		});
    _.each(that.model.getDeps(), function(dep) {
		  var state = that.project.states[dep];
			if (state == null || state == 'Done') {
			  that.$('.deps .list-group').append('<li class="list-group-item dep" data-issue="' + dep + '"><span class="glyphicon glyphicon-ok-circle"></span> ' + dep + '</li>');
			} else {
			  that.$('.deps .list-group').append('<li class="list-group-item dep" data-issue="' + dep + '">' + dep + '</li>');
			}
		});
		that.$('.dep').draggable({
		  stop: function(ev, ui) {
				var el = $(ev.target).closest('.dep');
				var top = parseInt(el.css('top'));
				var left = parseInt(el.css('left'));
			  if (top * top > 100 || left * left > 100) {
				  that.model.removeDep(el.attr('data-issue'));
					that.model.updateBody();
					that.project.updateStates();
				}
			},
		});
		that.$('.deps').droppable({
		  accept: '.issue',
			hoverClass: 'dropme',
			greedy: true,
			drop: function(ev, ui) {
			  that.parent.ignores += 2;
				var issueElement = $(ev.toElement).closest('.issue');
				that.model.addDep(issueElement.attr('id'));
				that.model.updateBody();
				that.project.updateStates();
			},
		});
		that.$el.attr('id', that.model.fullName());
		return that;
	},

});


