
lychee.define('lychee.net.socket.HTTP').tags({
	platform: 'nidium'
}).requires([
	'lychee.net.protocol.HTTP'
]).includes([
	'lychee.event.Emitter'
]).supports(function(lychee, global) {

	if (typeof global.Socket === 'function') {
		return true;
	}


	return false;

}).exports(function(lychee, global, attachments) {

	const _Emitter  = lychee.import('lychee.event.Emitter');
	const _Protocol = lychee.import('lychee.net.protocol.HTTP');
	const _Socket   = global.Socket;



	/*
	 * HELPERS
	 */

	const _to_arraybuffer = function(buffer) {

		let bytes = new ArrayBuffer(buffer.length);
		let array = new Uint8Array(buffer.length);

		for (let b = 0, bl = buffer.length; b < bl; b++) {
			array[b] = buffer[b];
		}

		return bytes;

	};

	const _to_buffer = function(bytes) {

		let buffer = new Buffer(bytes.byteLength);
		let array  = new Uint8Array(bytes);

		for (let b = 0; b < buffer.length; b++) {
			buffer[b] = array[b];
		}

		return buffer;

	};

	const _connect_socket = function(socket, protocol) {

		let that = this;
		if (that.__connection !== socket) {

			socket.onread = function(data) {

				let blob = null;
				if (typeof data === 'string') {
					blob = new Buffer(data, 'utf8');
				} else {
					blob = _to_buffer(data);
				}

				let chunks = protocol.receive(blob);
				if (chunks.length > 0) {

					for (let c = 0, cl = chunks.length; c < cl; c++) {
						that.trigger('receive', [ chunks[c].payload, chunks[c].headers ]);
					}

				}

			};

			socket.onconnect = function() {
				that.trigger('connect');
			};

			socket.ondisconnect = function() {
				that.disconnect();
			};


			that.__connection = socket;
			that.__protocol   = protocol;

		}


	};

	const _disconnect_socket = function(socket, protocol) {

		let that = this;
		if (that.__connection === socket) {

			socket.onconnect    = function() {};
			socket.ondisconnect = function() {};
			socket.onread       = function() {};

			socket.close();
			protocol.close();


			that.__connection = null;
			that.__socket     = null;

			that.trigger('disconnect');

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function() {

		this.__connection = null;
		this.__protocol   = null;


		_Emitter.call(this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Emitter.prototype.serialize.call(this);
			data['constructor'] = 'lychee.net.socket.HTTP';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		connect: function(host, port, connection) {

			host       = typeof host === 'string'       ? host       : null;
			port       = typeof port === 'number'       ? (port | 0) : null;
			connection = typeof connection === 'object' ? connection : null;


			let that     = this;
			let protocol = null;


			if (host !== null && port !== null) {

				if (connection !== null) {

					protocol = new _Protocol({
						type: _Protocol.TYPE.remote
					});


					// TODO: Allow half open
					// TODO: setTimeout(0)
					// TODO: setNoDelay(true)
					// TODO: setKeepAlive(true, 0)
					// TODO: removeAllListeners('timeout')

					_connect_socket.call(that, connection, protocol);

					// TODO: connection.resume();

				} else {

					protocol   = new _Protocol({
						type: _Protocol.TYPE.client
					});
					connection = new _Socket(host, port);

					// TODO: Like above

					_connect_socket.call(that, connection, protocol);

					connection.connect();

				}


				return true;

			}


			return false;

		},

		send: function(payload, headers, binary) {

			payload = payload instanceof Buffer ? payload : null;
			headers = headers instanceof Object ? headers : null;
			binary  = binary === true;


			if (payload !== null) {

				let connection = this.__connection;
				let protocol   = this.__protocol;

				if (connection !== null && protocol !== null) {

					let chunk = protocol.send(payload, headers, binary);
					if (chunk !== null) {

						if (binary === true) {

							connection.write(_to_arraybuffer(chunk));

						} else {

							connection.write(chunk.toString('utf8'));

						}


						return true;

					}

				}

			}


			return false;

		},

		disconnect: function() {

			let connection = this.__connection;
			let protocol   = this.__protocol;

			if (connection !== null && protocol !== null) {

				_disconnect_socket.call(this, connection, protocol);


				return true;

			}


			return false;

		}

	};


	return Composite;

});

