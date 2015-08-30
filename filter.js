/*
 * filter.js v0.1.0
 * An approach to aspect-oriented programming (AOP) in javascript
 *
 * Copyright 2015, Ali Farhadi
 * Released under the MIT license.
 */
'use strict';

(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        // CommonJS-like environments that support module.exports, like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.Filter = factory();
	}
}(this, function() {

	function Filter(obj, fn, filter) {
		this.obj = obj;
		this.fn = fn;
		this.filter = filter;
		filter.disabled = false;

		if (obj[fn].chain) {
			this.chain = obj[fn].chain;
			this.chain.push(filter);
			return;
		}

		var chain = [obj[fn], filter];
		obj[fn] = function() {
			var i = chain.length;
			var self = this;
			var next = function(args) {
				while (chain[--i].disabled);
				if (i) {
					return chain[i].call(self, args, next);
				} else {
					return chain[0].apply(self, args);
				}
			};
			return next([].slice.call(arguments));
		};

		this.chain = obj[fn].chain = chain;
	}

	Filter.prototype.remove = function() {
		if (this.chain.length == 2) {
			this.obj[this.fn] = this.chain[0];
			return;
		}
		this.chain.splice(this.chain.indexOf(this.filter), 1);
	};

	Filter.prototype.off = function() {
		this.filter.disabled = true;
	};

	Filter.prototype.on = function() {
		this.filter.disabled = false;
	};

    return Filter;
}));
