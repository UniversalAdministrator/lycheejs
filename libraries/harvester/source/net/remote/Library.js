
lychee.define('harvester.net.remote.Library').requires([
	'harvester.mod.Server'
]).includes([
	'lychee.net.Service'
]).exports(function(lychee, global, attachments) {

	const _Service = lychee.import('lychee.net.Service');
	const _Server  = lychee.import('harvester.mod.Server');



	/*
	 * HELPERS
	 */

	const _serialize = function(library) {

		let filesystem = null;
		let server     = null;

		if (library.filesystem !== null) {
			filesystem = library.filesystem.root;
		}

		if (library.server !== null) {

			server = {
				host: library.server.host,
				port: library.server.port
			};

		}


		return {
			identifier: library.identifier,
			details:    library.details || null,
			filesystem: filesystem,
			server:     server,
			harvester:  library.harvester
		};

	};

	const _on_start = function(data) {

		let identifier = data.identifier || null;
		let main       = global.MAIN     || null;

		if (identifier !== null && main !== null) {

			let library = main._libraries[identifier] || null;
			if (library !== null && library.server === null) {

				_Server.process(library);

				this.accept('Server started ("' + identifier + '")');

			} else {

				this.reject('No server ("' + identifier + '")');

			}

		} else {

			this.reject('No Identifier');

		}

	};

	const _on_stop = function(data) {

		let identifier = data.identifier || null;
		let main       = global.MAIN     || null;

		if (identifier !== null && main !== null) {

			let library = main._libraries[identifier] || null;
			if (library !== null && library.server !== null) {

				library.server.destroy();
				library.server = null;

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

		_Service.call(this, 'library', remote, _Service.TYPE.remote);


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
			data['constructor'] = 'harvester.net.remote.Library';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		index: function() {

			let main   = global.MAIN || null;
			let tunnel = this.tunnel;

			if (main !== null && tunnel !== null) {

				let result = tunnel.send(Object.values(main._libraries).map(_serialize), {
					id:    this.id,
					event: 'sync'
				});

				if (result === true) {
					return true;
				}

			}


			return false;

		}

	};


	return Composite;

});

