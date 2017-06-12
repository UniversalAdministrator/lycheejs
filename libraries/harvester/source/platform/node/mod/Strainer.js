
lychee.define('harvester.mod.Strainer').tags({
	platform: 'node'
}).supports(function(lychee, global) {

	if (typeof global.require === 'function') {

		try {

			global.require('child_process');
			global.require('fs');

			return true;

		} catch (err) {

		}

	}


	return false;

}).exports(function(lychee, global, attachments) {

	const _child_process = global.require('child_process');
	const _fs            = global.require('fs');
	const _CACHE         = {};



	/*
	 * HELPERS
	 */

	const _read_cache = function(project) {

		let buffer = project.filesystem.read('/api/index.json');
		if (buffer !== null) {

			let data = null;

			try {
				data = JSON.parse(buffer.toString('utf8'));
			} catch (err) {
			}


			if (data !== null) {
				return data;
			}

		}


		return [];

	};

	const _save_cache = function(project) {

		// TODO: Save cache to /api/index.json

	};



	/*
	 * IMPLEMENTATION
	 */

	const Module = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			return {
				'reference': 'harvester.mod.Strainer',
				'arguments': []
			};

		},



		/*
		 * CUSTOM API
		 */

		can: function(project) {

			if (project.identifier.indexOf('__') === -1 && project.package !== null && project.filesystem !== null) {

				let cache = _CACHE[project.identifier] || null;
				if (cache === null) {
					cache = _CACHE[project.identifier] = _read_cache(project);
				}


				let result = false;

				for (let c = 0, cl = cache.length; c < cl; c++) {

					let entry = cache[c];
					let mtime = entry.header.mtime;
					let info  = project.filesystem.info(entry.path);

					if (info !== null && info.mtime > mtime) {
						result = true;
						break;
					}

				}

				return result;

			}


			return false;

		},

		process: function(project) {

			// XXX: Implement Me

		}

	};


	return Module;

});

