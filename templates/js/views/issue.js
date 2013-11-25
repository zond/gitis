window.IssueView = Backbone.View.extend({

	template: _.template($('#issue_underscore').html()),

	className: 'panel panel-default issue',

	initialize: function(options) {
	  _.bindAll(this, 'render');
		this.project = options.project;
		this.listenTo(this.model, 'change', this.render);
		this.listenTo(this.project, 'updated_states', this.render);
	},

	render: function() {
		var that = this;
		var deps = that.model.getDeps(that.project.states);
		var done = _.filter(deps, function(dep) {
		  return dep == true;
		});
		that.$el.html(that.template({
			assignee: that.model.get('assignee'),
			deps: deps,
			done: done,
		  model: that.model,
		}));
		that.el.issue = that.model;
		that.$el.droppable({
		  accept: '.avatar',
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
		return that;
	},

});


