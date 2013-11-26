window.BaseView = Backbone.View.extend({
 
	chain: [],

	addChild: function(child) {
		if (this.children == null) {
			this.children = [];
		}
		this.children.push(child);
	},

	renderWithin: function(f) {
	  if (this.chain.length > 0 && this.chain[this.chain.length - 1].cid == this.cid) {
		  f();
		} else {
			this.chain.push(this);
			f();
			this.chain.pop();
		}
	},

	doRender: function() {
	  var that = this;
		that.cleanChildren();
		if (that.chain.length > 0) {
			that.chain[that.chain.length - 1].addChild(that);
		}
		if (that.el != null) {
		  if (that.el.CurrentBaseView != null) {
			  if (that.el.CurrentBaseView.cid == that.cid) {
				  that.cleanChildren();
				} else {
					that.el.CurrentBaseView.clean();
				}
			}
			that.el.CurrentBaseView = that;
		}
		that.renderWithin(function() {
			that.render();
		});
		if (that.rendered) {
		  that.delegateEvents();
		}
	  that.rendered = true;
		return that;
	},

	clean: function(remove) {
		if (typeof(this.onClose) == 'function') {
			this.onClose();
		}
		this.cleanChildren(remove);
		if (remove) {
		  this.remove();
		} else {
			this.stopListening();
		}
	},

	cleanChildren: function(remove) {
		if (this.children != null) {
			_.each(this.children, function(child) {
				child.clean(remove);
			});
		}
		this.children = [];
	},

});



