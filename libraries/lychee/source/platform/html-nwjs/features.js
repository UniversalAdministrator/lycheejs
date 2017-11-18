
(function(lychee, global) {

	// XXX: This is an incremental platform of 'html'

	const _FEATURES = {

		require: function(id) {

			if (id === 'child_process') return {};
			if (id === 'fs')            return {};
			if (id === 'http')          return {};
			if (id === 'https')         return {};
			if (id === 'net')           return {};
			if (id === 'path')          return {};


			throw new Error('Cannot find module \'' + id + '\'');

		}

	};

	Object.defineProperty(lychee.Environment._FEATURES, 'html-nwjs', {

		get: function() {
			return _FEATURES;
		},

		set: function(value) {
			return false;
		}

	});

})(lychee, typeof global !== 'undefined' ? global : this);

