
lychee.define('harvester.mod.Strainer').tags({
	platform: 'node'
}).requires([
	'harvester.data.Project'
]).supports(function(lychee, global) {

	if (typeof global.require === 'function') {

		try {

			global.require('child_process');

			return true;

		} catch (err) {

		}

	}


	return false;

}).exports(function(lychee, global, attachments) {

	const _child_process = global.require('child_process');
	const _setInterval   = global.setInterval;
	const _Project       = lychee.import('harvester.data.Project');
	let   _ACTIVE        = false;
	const _QUEUE         = [];



	/*
	 * FEATURE DETECTION
	 */

	(function() {

		_setInterval(function() {

			if (_ACTIVE === false) {

				let tmp = _QUEUE.splice(0, 1);
				if (tmp.length === 1) {

					_ACTIVE = true;
					_strain(tmp[0].project);

				}

			}

		}, 1000);

	})();



	/*
	 * HELPERS
	 */

	const _is_queued = function(id) {

		let entry = _QUEUE.find(function(entry) {
			return entry.project === id;
		}) || null;

		if (entry !== null) {
			return true;
		}

		return false;

	};

	const _strain = function(project) {

		_child_process.execFile(lychee.ROOT.lychee + '/libraries/strainer/bin/strainer.sh', [
			'check',
			project
		], {
			cwd: lychee.ROOT.lychee
		}, function(error, stdout, stderr) {

			_ACTIVE = false;


			let tmp = stderr.trim();
			if (error || tmp.indexOf('(E)') !== -1) {

				console.error('harvester.mod.Strainer: FAILURE ("' + project + '")');

				let lines = tmp.split('\n');

				for (let l = 0, ll = lines.length; l < ll; l++) {

					let line = lines[l];
					let tmp1 = line.substr(15, line.length - 29);

					console.warn(tmp1.trim());

				}

			} else {

				console.info('harvester.mod.Strainer: SUCCESS ("' + project + '")');

			}

		});

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

			project = project instanceof _Project ? project : null;


			if (project !== null) {

				let id  = project.identifier;
				let fs  = project.filesystem;
				let pkg = project.package;

				if (id.indexOf('__') === -1 && pkg !== null && fs !== null) {

					let buffer = fs.read('/api/strainer.pkg');
					let data   = [];

					try {
						data = JSON.parse(buffer.toString('utf8'));
					} catch (err) {
						data = [];
					}


					let needs_check = false;

					if (data.length > 0) {

						for (let d = 0, dl = data.length; d < dl; d++) {

							if (data[d] < Date.now()) {
								needs_check = true;
								break;
							}

						}

					} else {

						needs_check = true;

					}

					return needs_check;

				}

			}


			return false;

		},

		process: function(project) {

			project = project instanceof _Project ? project : null;


			if (project !== null) {

				let id  = project.identifier;
				let fs  = project.filesystem;
				let pkg = project.package;

				if (fs !== null && pkg !== null) {

					if (_is_queued(id) === false) {

						_QUEUE.push({
							project: id
						});


						return true;

					}

				}

			}


			return false;

		}

	};


	return Module;

});

