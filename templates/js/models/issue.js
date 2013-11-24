window.Issue = Backbone.Model.extend({

	urlRoot: 'https://api.github.com/issues',

	state: function() {
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

});



