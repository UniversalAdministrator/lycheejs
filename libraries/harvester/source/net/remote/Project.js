
lychee.define('harvester.net.remote.Project').requires([
	'harvester.mod.Server'
]).includes([
	'lychee.net.Service'
]).exports(function(lychee, global, attachments) {

	const _Service = lychee.import('lychee.net.Service');
	const _Server  = lychee.import('harvester.mod.Server');



	/*
	 * HELPERS
	 */

	const _serialize = function(project) {

		let filesystem = null;
		let server     = null;
		let web        = false;

		if (project.filesystem !== null) {

			filesystem = project.filesystem.root;

			let check = project.filesystem.info('/index.html');
			if (check !== null && check.type === 'file') {
				web = true;
			}

		}

		if (project.server !== null) {

			server = {
				host: project.server.host,
				port: project.server.port
			};

		}


		return {
			identifier: project.identifier,
			details:    project.details || null,
			filesystem: filesystem,
			server:     server,
			harvester:  project.harvester,
			web:        web
		};

	};

	const _on_start = function(data) {

		let identifier = data.identifier || null;
		let main       = global.MAIN     || null;

		if (identifier !== null && main !== null) {

			let project = main._projects[identifier] || null;
			if (project !== null && project.server === null) {

				_Server.process(project);

				this.accept('Server started ("' + identifier + '")');

			} else {

				this.reject('No Server ("' + identifier + '")');

			}

		} else {

			this.reject('No Identifier');

		}

	};

	const _on_stop = function(data) {

		let identifier = data.identifier || null;
		let main       = global.MAIN     || null;

		if (identifier !== null && main !== null) {

			let project = main._projects[identifier] || null;
			if (project !== null && project.server !== null) {

				project.server.destroy();
				project.server = null;

				this.accept('Server stopped ("' + identifier + '")');

			} else {

				this.reject('No Server ("' + identifier + '")');

			}

		} else {

			this.reject('No Identifier');

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(remote) {

		_Service.call(this, 'project', remote, _Service.TYPE.remote);


		this.bind('start', _on_start, this);
		this.bind('stop',  _on_stop,  this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Service.prototype.serialize.call(this);
			data['constructor'] = 'harvester.net.remote.Project';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		index: function() {

			let main   = global.MAIN || null;
			let tunnel = this.tunnel;

			if (main !== null && tunnel !== null) {

				let result = tunnel.send(Object.values(main._projects).map(_serialize), {
					id:    this.id,
					event: 'sync'
				});

				if (result === true) {
					return true;
				}

			}

		},

		sync: function() {
			return this.index();
		}

	};


	return Composite;

});

