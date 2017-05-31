
lychee.define('harvester.mod.Harvester').requires([
	'harvester.data.Git',
	'harvester.net.Client'
]).exports(function(lychee, global, attachments) {

	const _Client   = lychee.import('harvester.net.Client');
	const _Git      = lychee.import('harvester.data.Git');
	const _git      = new _Git();
	let   _CLIENT   = null;
	const _TIMEOUTS = {};
	let   _TIMEOUT  = null;



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
				'reference': 'harvester.mod.Harvester',
				'arguments': []
			};

		},



		/*
		 * CUSTOM API
		 */

		can: function(project) {

			if (_CLIENT === null) {

				_CLIENT = new _Client({
					host: 'harvester.artificial.engineering',
					port: 4848
				});

				_CLIENT.bind('connect', function() {

					let service = _CLIENT.getService('harvester');
					if (service !== null) {
						service.connect();
					}

				});

				_CLIENT.bind('disconnect', function() {

					console.log('\n');
					console.warn('+--------------------------------------------------------+');
					console.warn('| No connection to harvester.artificial.engineering:4848 |');
					console.warn('| Cannot synchronize the AI\'s api, knowledge or training |');
					console.warn('+--------------------------------------------------------+');
					console.log('\n');

				});

			}


			let id  = project.identifier;
			let pkg = project.package;

			if (id.indexOf('__') === -1 && pkg !== null) {

				let timeout = _TIMEOUTS[id] || null;
				if (timeout === null || Date.now() > timeout) {

					let diff = _git.diff(project.identifier);
					if (diff === null) {

						let service = _CLIENT.getService('harvester');
						if (service !== null) {
							return true;
						}

					}

				}

			}


			return false;

		},

		process: function(project) {

			let id  = project.identifier;
			let pkg = project.package;

			if (id.indexOf('__') === -1 && pkg !== null) {

				let report = _git.report(id);
				if (report.status === _Git.STATUS.update) {

					_TIMEOUTS[id] = Date.now() + 24 * 60 * 60 * 1000;


					// XXX: lychee.js Libraries / Projects are not
					// shipped in their own repositories.

					let timeout = _TIMEOUT || null;
					if (timeout === null || Date.now() > timeout) {

						let result = _git.fetch(report.branch);
						if (result === true) {
							console.info('harvester.mod.Harvester: FETCH ("' + report.branch + '")');
						}

						timeout = _TIMEOUT = Date.now() + 24 * 60 * 60 * 1000;

					}


					// XXX: This filters unnecessary checkouts

					if (timeout !== null) {

						if (report.branch === 'master' || report.branch === 'development') {

							let result = _git.checkout(report.branch, id);
							if (result === true) {
								console.info('harvester.mod.Harvester: CHECKOUT ("' + report.branch + '", "' + id + '")');
							} else {
								console.error('harvester.mod.Harvester: CHECKOUT ("' + report.branch + '", "' + id + '")');
							}

						}

					}

				}

			}

		}

	};


	return Module;

});

