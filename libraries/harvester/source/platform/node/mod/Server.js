
lychee.define('harvester.mod.Server').tags({
	platform: 'node'
}).requires([
	'harvester.data.Project',
	'harvester.data.Server'
]).supports(function(lychee, global) {

	if (typeof global.require === 'function') {

		try {

			global.require('child_process');
			global.require('net');

			return true;

		} catch (err) {

		}

	}


	return false;

}).exports(function(lychee, global, attachments) {

	const _child_process = global.require('child_process');
	const _net           = global.require('net');
	const _Project       = lychee.import('harvester.data.Project');
	const _Server        = lychee.import('harvester.data.Server');
	const _BINARY        = process.execPath;
	const _MIN_PORT      = 49152;
	let   _CUR_PORT      = _MIN_PORT;
	const _MAX_PORT      = 65534;
	let   _LOG_PROJECT   = null;
	const _ROOT          = lychee.ROOT.lychee;



	/*
	 * HELPERS
	 */

	const _report_error = function(text) {

		let lines   = text.split('\n');
		let line    = null;
		let file    = null;
		let message = null;


		if (lines.length > 0) {

			if (lines[0].indexOf(':') !== -1) {

				file = lines[0].split(':')[0];
				line = lines[0].split(':')[1];

			}


			lines.forEach(function(line) {

				let err = line.substr(0, line.indexOf(':'));
				if (/Error/g.test(err)) {
					message = line.trim();
				}

			});

		}


		if (file !== null && line !== null) {
			console.error('harvester.mod.Server: Report from ' + file + '#L' + line + ':');
			console.error('                      "' + message + '"');
		}

	};

	const _scan_port = function(callback, scope) {

		callback = callback instanceof Function ? callback : null;
		scope    = scope !== undefined          ? scope    : this;


		if (callback !== null) {

			let socket = new _net.Socket();
			let status = null;
			let port   = _CUR_PORT++;


			socket.setTimeout(100);

			socket.on('connect', function() {
				status = 'used';
				socket.destroy();
			});

			socket.on('timeout', function(err) {
				status = 'free';
				socket.destroy();
			});

			socket.on('error', function(err) {

				if (err.code === 'ECONNREFUSED') {
					status = 'free';
				} else {
					status = 'used';
				}

				socket.destroy();

			});

			socket.on('close', function(err) {

				if (status === 'free') {
					callback.call(scope, port);
				} else if (status === 'used') {
					_scan_port(callback, scope);
				} else {
					callback.call(scope, null);
				}

			});


			socket.connect(port, '127.0.0.1');

		}

	};

	const _serve = function(project, host, port) {

		console.info('harvester.mod.Server: BOOTUP ("' + project + ' | ' + host + ':' + port + '")');


		let server = null;

		try {

			// XXX: Alternative is (_ROOT + '/bin/helper.sh', [ 'env:node', file, port, host ])
			server = _child_process.execFile(_BINARY, [
				_ROOT + project + '/harvester.js',
				port,
				host
			], {
				cwd: _ROOT + project
			}, function(error, stdout, stderr) {

				stderr = (stderr.trim() || '').toString();


				if (error !== null && error.signal !== 'SIGTERM') {

					_LOG_PROJECT = project;
					console.error('harvester.mod.Server: FAILURE ("' + project + ' | ' + host + ':' + port + '")');
					console.error(stderr);

				} else if (stderr !== '') {

					_LOG_PROJECT = project;
					console.error('harvester.mod.Server: FAILURE ("' + project + ' | ' + host + ':' + port + '")');
					_report_error(stderr);

				}

			});

			server.stdout.on('data', function(lines) {

				lines = lines.trim().split('\n').filter(function(message) {

					if (message.charAt(0) !== '\u001b') {
						return true;
					}

					return false;

				});

				if (lines.length > 0) {

					if (_LOG_PROJECT !== project) {
						console.log('harvester.mod.Server: LOG ("' + project + '")');
						_LOG_PROJECT = project;
					}

					lines.forEach(function(message) {

						let type = message.trim().substr(0, 3);
						let line = message.trim().substr(3).trim();

						if (type === '(L)') {
							console.log('                      ' + line);
						} else {
							console.log('                      ' + message.trim());
						}

					});

				}

			});

			server.stderr.on('data', function(lines) {

				lines = lines.trim().split('\n').filter(function(message) {

					if (message.charAt(0) === '\u001b') {
						return true;
					}

					return false;

				}).map(function(message) {

					if (message.charAt(0) === '\u001b') {
						message = message.substr(12);

						if (message.charAt(message.length - 1) === 'm') {
							message = message.substr(0, message.length - 12);
						}

					}

					return message;

				});


				if (lines.length > 0) {

					if (_LOG_PROJECT !== project) {
						console.error('harvester.mod.Server: ERROR ("' + project + '")');
						_LOG_PROJECT = project;
					}

					lines.forEach(function(message) {

						let type = message.trim().substr(0, 3);
						let line = message.trim().substr(3).trim();

						if (type === '(I)') {
							console.info('                      ' + line);
						} else if (type === '(W)') {
							console.warn('                      ' + line);
						} else if (type === '(E)') {
							console.error('                      ' + line);
						} else {
							console.error('                      ' + message.trim());
						}

					});

				}

			});

			server.on('error', function() {

				console.warn('harvester.mod.Server: SHUTDOWN ("' + project + ' | ' + host + ':' + port + '")');

				this.kill('SIGTERM');

			});

			server.on('exit', function() {
			});

			server.destroy = function() {

				console.warn('harvester.mod.Server: SHUTDOWN ("' + project + ' | ' + host + ':' + port + '")');

				this.kill('SIGTERM');

			};

		} catch (err) {

			server = null;

		}

		return server;

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
				'reference': 'harvester.mod.Server',
				'arguments': []
			};

		},



		/*
		 * CUSTOM API
		 */

		can: function(project) {

			project = project instanceof _Project ? project : null;


			if (project !== null) {

				if (project.identifier.indexOf('__') === -1 && project.server === null) {

					let info = project.filesystem.info('/harvester.js');
					if (info !== null && info.type === 'file') {
						return true;
					}

				}

			}


			return false;

		},

		process: function(project) {

			project = project instanceof _Project ? project : null;


			if (project !== null) {

				if (project.server === null) {

					let info = project.filesystem.info('/harvester.js');
					if (info !== null && info.type === 'file') {

						_scan_port(function(port) {

							if (port >= _MIN_PORT && port <= _MAX_PORT) {

								let server = _serve(project.identifier, null, port);
								if (server !== null) {

									project.setServer(new _Server({
										process: server,
										host:    null,
										port:    port
									}));

								} else {

									console.error('harvester.mod.Server: FAILURE ("' + project.identifier + ' | null:' + port + '") (chmod +x missing?)');

								}

							}

						}, this);


						return true;

					}

				}

			}


			return false;

		}

	};


	return Module;

});

