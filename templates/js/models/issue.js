window.Issue = Backbone.Model.extend({

	urlRoot: 'https://api.github.com/issues',

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
	  var match = /Prio: ([\d.]+)/.exec(this.get('body'));
		if (match == null) {
		  return 0;
		}
		return parseFloat(match[1]);
	},

	setPrio: function(p) {
	  var that = this;
		if (that.getPrio() != p) {
			var match = /([\s\S]*)Prio: [\d.]+([\s\S]*)/.exec(that.get('body'));
			if (match != null) {
				that.set('body', match[1] + 'Prio: ' + p + match[2], { silent: true });
			} else {
				that.set('body', that.get('body') + '\nPrio: ' + p, { silent: true });
			}
			$.ajax(that.get('url'), {
				type: 'PATCH',
				data: JSON.stringify({
					body: that.get('body'),
				}),
			});
		}
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
			$.ajax(that.get('url'), {
				type: 'PATCH',
				data: JSON.stringify({
					body: that.get('body'),
				}),
			});
		}
	},

});



