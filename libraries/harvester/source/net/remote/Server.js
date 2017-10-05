
lychee.define('harvester.net.remote.Server').includes([
	'lychee.net.Service'
]).exports(function(lychee, global, attachments) {

	const _Service = lychee.import('lychee.net.Service');



	/*
	 * HELPERS
	 */

	const _serialize_remotes = function(project) {

		let remotes = [];

		let info = project.filesystem.info('/lychee.store');
		if (info !== null) {

			let database = JSON.parse(project.filesystem.read('/lychee.store'));
			if (database instanceof Object) {

				if (database['server'] instanceof Object) {

					let objects = database['server']['@objects'] || null;
					if (objects instanceof Object) {

						remotes = Object.values(objects).map(function(remote) {

							return {
								id:   remote.id,
								type: remote.type,
								host: remote.host,
								port: remote.port
							};

						});

					}

				}

			}

		}

		return remotes;

	};

	const _serialize = function(project) {

		project = project instanceof Object ? project : null;


		if (project !== null) {

			let main        = global.MAIN || null;
			let remotes     = _serialize_remotes(project);
			let server_host = null;
			let server_port = null;

			if (project.server !== null) {
				server_host = project.server.host;
				server_port = project.server.port;
			}


			if (main !== null && server_host === null) {
				server_host = main.server.host;
			}

			if (server_host === null) {
				server_host = 'localhost';
			}


			return {
				identifier: project.identifier,
				host:       server_host,
				port:       server_port,
				remotes:    remotes
			};

		}


		return null;

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(remote) {

		_Service.call(this, 'server', remote, _Service.TYPE.remote);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Service.prototype.serialize.call(this);
			data['constructor'] = 'harvester.net.remote.Server';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		index: function(data) {

			data = data instanceof Object ? data : null;


			if (data !== null) {

				let host   = data['@host'] || null;
				let main   = global.MAIN   || null;
				let tunnel = this.tunnel;

				if (host !== null) {

					if (host.endsWith(':4848')) {
						host = host.substr(0, host.length - 5);
					}

				}

				if (main !== null && tunnel !== null) {

					let all       = [];
					let projects  = Object.values(main._projects);
					let libraries = Object.values(main._libraries);

					for (let p = 0, pl = projects.length; p < pl; p++) {
						all.push(projects[p]);
					}

					for (let l = 0, ll = libraries.length; l < ll; l++) {
						all.push(libraries[l]);
					}


					all.forEach(function(project) {
						project.host = project.host !== 'localhost' ? project.host : host;
					});


					let result = tunnel.send(all.map(_serialize), {
						id:    this.id,
						event: 'sync'
					});

					if (result === true) {
						return true;
					}

				}

			}


			return false;

		},

		connect: function(data) {

			data = data instanceof Object ? data : null;


			if (data !== null) {

				let host       = data['@host']   || null;
				let identifier = data.identifier || null;
				let main       = global.MAIN     || null;
				let tunnel     = this.tunnel;

				if (host !== null) {

					if (host.endsWith(':4848')) {
						host = host.substr(0, host.length - 5);
					}

				}

				if (identifier !== null && main !== null && tunnel !== null) {

					let project = _serialize(main._libraries[identifier] || main._projects[identifier]);
					if (project !== null) {

						project.host = project.host !== 'localhost' ? project.host : host;

						let result = tunnel.send(project, {
							id:    this.id,
							event: 'connect'
						});

						if (result === true) {
							return result;
						}

					} else {

						this.reject('No Server ("' + identifier + '")');

					}

				} else {

					this.reject('No Identifier');

				}

			}


			return false;

		}

	};


	return Composite;

});

