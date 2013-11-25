window.Issue = Backbone.Model.extend({

	urlRoot: 'https://api.github.com/issues',

	fullName: function() {
	  var match = /^https:\/\/api\.github\.com\/repos\/(.*)\/issues\/(\d+)$/.exec(this.get('url'));
		if (match == null) {
		  return 'unknown';
		}
		return match[1] + '#' + match[2];
	},

	htmlBody: function() {
		return _.collect(_.escape(this.get('body').trim()).split('\n'), function(line) {
		  return '<p>' + line + '</p>';
		}).join("");
	},

	getMeta: function() {
	  var match = /<!--@gitis:(.*)-->/.exec(this.get('body'));
		if (match == null) {
		  return {};
		}
		return JSON.parse(match[1]);
	},

	setMeta: function(m) {
	  var match = /^([\s\S]*<!--@gitis:).*(-->[\s\S]*)$/.exec(this.get('body'));
		if (match == null) {
		  this.set('body', this.get('body') + '\n<!--@gitis:' + JSON.stringify(m) + '-->', { silent: true });
		} else {
		  this.set('body', match[1] + JSON.stringify(m) + match[2], { silent: true });
		}
	},

	getDeps: function(states) {
	  var deps = this.getMeta().deps;
		if (deps == null) {
		  return [];
		}
		return _.collect(deps, function(dep) {
		  var state = states[dep];
			if (state == null) {
				return true;
			} else if (state == 'Done') {
				return true;
			} else {
				return false;
			}
		});
	},

	getState: function() {
	  var state = this.getMeta().state;
		if (state == null) {
		  return 'Backlog';
		}
		return state;
	},

	getPrio: function() {
	  var prio = this.getMeta().prio;
		if (prio == null) {
		  return 0;
		}
		return parseFloat(prio);
	},

	setAssignee: function(a) {
	  var that = this;
	  that.set('assignee', a, { silent: true });
		$.ajax(that.get('url'), {
		  type: 'PATCH',
			data: JSON.stringify({
			  assignee: that.get('assignee'),
			}),
			success: function(data) {
			  that.set(data);
			},
		});
	},

	updateBody: function() {
		var that = this;
		$.ajax(that.get('url'), {
			type: 'PATCH',
			data: JSON.stringify({
				body: that.get('body'),
			}),
		});
	},

	setPrio: function(p) {
	  if (this.getPrio() != p) {
			var meta = this.getMeta()
			meta.prio = p;
			this.setMeta(meta);
			return true;
		}
		return false;
	},

	setState: function(s) {
		if (this.getState() != s) {
		  var meta = this.getMeta();
			meta.state = s;
			this.setMeta(meta);
			return true;
		}
		return false;
	},

});



