
lychee.define('harvester.mod.Harvester').requires([
	'harvester.data.Git',
	'harvester.net.Client'
]).exports(function(lychee, global, attachments) {

	const _Client = lychee.import('harvester.net.Client');
	const _Git    = lychee.import('harvester.data.Git');
	const _git    = new _Git();
	let   _CLIENT = null;



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

			let report = _git.report();
			if (report.status === _Git.STATUS.update) {
				console.info('Can update');
			} else if (report.status === _Git.STATUS.manual) {
				console.warn('Cannot update, history is ahead');
			}


			if (_CLIENT === null) {

				_CLIENT = new _Client({
					host: 'harvester.artificial.engineering',
					port: 4848
				});

				_CLIENT.bind('disconnect', function() {

					console.log('\n');
					console.warn('+--------------------------------------------------------+');
					console.warn('| No connection to harvester.artificial.engineering:4848 |');
					console.warn('| Cannot synchronize data for AI training and knowledge  |');
					console.warn('+--------------------------------------------------------+');
					console.log('\n');

				});

			}


			if (project.identifier.indexOf('__') === -1 && project.package !== null) {

				let service = _CLIENT.getService('harvester');
				if (service !== null) {
					return true;
				}

			}


			return false;

		},

		process: function(project) {

			if (project.package !== null) {

				let service = _CLIENT.getService('harvester');
				if (service !== null) {
					service.connect();
				}

			}

		}

	};


	return Module;

});

