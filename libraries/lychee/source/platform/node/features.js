
(function(lychee, global) {

	const _FEATURES = {

		require: function(id) {

			if (id === 'child_process') return {};
			if (id === 'fs')            return {};
			if (id === 'http')          return {};
			if (id === 'https')         return {};
			if (id === 'net')           return {};
			if (id === 'path')          return {};


			throw new Error('Cannot find module \'' + id + '\'');

		},

		process: {
			env: {
				APPDATA: null,
				HOME:    '/home/dev'
			},
			stdin: {
				on: function() {}
			},
			stdout: {
				on:    function() {},
				write: function() {}
			}
		},

		clearInterval: function() {},
		clearTimeout:  function() {},
		setInterval:   function() {},
		setTimeout:    function() {}

	};


	Object.defineProperty(lychee.Environment._FEATURES, 'node', {

		get: function() {
			return _FEATURES;
		},

		set: function(value) {
			return false;
		}

	});

})(lychee, typeof global !== 'undefined' ? global : this);

