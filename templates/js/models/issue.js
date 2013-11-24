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

	getDeps: function(states) {
	  var match = /Deps: (\S+)/.exec(this.get('body'));
		if (match == null) {
		  return [];
		}
		return _.collect(match[1].split(/,/), function(dep) {
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
    if (/State: Ready/.exec(this.get('body')) != null) {
		  return 'Ready';
		} else if (/State: Doing/.exec(this.get('body')) != null) {
		  return 'Doing';
		} else if (/State: Done/.exec(this.get('body')) != null) {
		  return 'Done';
		} else {
		  return 'Backlog';
		}
	},

	getPrio: function() {
	  var match = /Prio: ([\d-.]+)/.exec(this.get('body'));
		if (match == null) {
		  return 0;
		}
		return parseFloat(match[1]);
	},

	update: function() {
		var that = this;
		$.ajax(that.get('url'), {
			type: 'PATCH',
			data: JSON.stringify({
				body: that.get('body'),
			}),
		});
	},

	setPrio: function(p) {
	  var that = this;
		if (that.getPrio() != p) {
			var match = /([\s\S]*)Prio: [\d-.]+([\s\S]*)/.exec(that.get('body'));
			if (match != null) {
				that.set('body', match[1] + 'Prio: ' + p + match[2], { silent: true });
			} else {
				that.set('body', that.get('body') + '\nPrio: ' + p, { silent: true });
			}
			return true;
		}
		return false;
	},

	setState: function(s) {
	  var that = this;
		if (that.getState() != s) {
			var match = /([\s\S]*)State: \w+([\s\S]*)/.exec(that.get('body'));
			if (match != null) {
				that.set('body', match[1] + 'State: ' + s + match[2], { silent: true });
			} else {
				that.set('body', that.get('body') + '\nState: ' + s, { silent: true });
			}
			return true;
		}
		return false;
	},

});



