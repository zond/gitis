window.Issues = Backbone.Collection.extend({

	model: Issue,

	url: 'https://api.github.com/issues',

	comparator: function(a, b) { 
	  var prioA = a.getPrio();
		var prioB = b.getPrio();
		if (prioA == prioB) {
		  var createdA = Date.parse(a.get('created_at'));
			var createdB = Date.parse(b.get('created_at'));
			if (createdA > createdB) {
			  return 1;
			}
			return -1;
		}
		if (prioA < prioB) {
		  return -1;
		}
		return 1;
	},

});




