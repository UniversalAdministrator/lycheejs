
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

	const _MESSAGE = {
		prefixes: [ '(I)', '(W)', '(E)' ],
		consoles: [ console.info, console.warn, console.error ]
	};

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

	const _serve = function(project, port) {

		port = typeof port === 'number' ? port : null;


		let handle = null;

		if (port !== null && port >= _MIN_PORT && port <= _MAX_PORT) {

			let info = '"' + project + '" | "*:' + port + '"';

			console.info('harvester.mod.Server: BOOTUP (' + info + ')');


			try {

				// XXX: Alternative (_ROOT + '/bin/helper.sh', [ 'env:node', file, port, host ])
				handle = _child_process.execFile(_BINARY, [
					_ROOT + project + '/harvester.js',
					port,
					'null'
				], {
					cwd: _ROOT + project
				}, function(error, stdout, stderr) {

					stderr = (stderr.trim() || '').toString();


					if (error !== null && error.signal !== 'SIGTERM') {

						_LOG_PROJECT = project;
						console.error('harvester.mod.Server: FAILURE (' + info + ')');
						console.error(stderr);

					} else if (stderr !== '') {

						_LOG_PROJECT = project;
						console.error('harvester.mod.Server: FAILURE (' + info + ')');
						_report_error(stderr);

					}

				});

				handle.stdout.on('data', function(lines) {

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

				handle.stderr.on('data', function(lines) {

					lines = lines.trim().split('\n').filter(function(message) {

						if (message.charAt(0) === '\u001b') {
							return true;
						}

						return false;

					}).map(function(message) {

						let prefix = '\u001b[41m\u001b[97m';
						let suffix = '\u001b[39m\u001b[49m\u001b[0m';

						if (message.startsWith(prefix)) {
							message = message.substr(prefix.length);
						}

						if (message.endsWith(suffix)) {
							message = message.substr(0, message.length - suffix.length);
						}

						return message;

					});


					if (lines.length > 0) {

						if (_LOG_PROJECT !== project) {
							console.error('harvester.mod.Server: ERROR ("' + project + '")');
							_LOG_PROJECT = project;
						}

						lines.forEach(function(message) {

							let prefix = message.trim().substr(0, 3);
							let index  = _MESSAGE.prefixes.indexOf(prefix);
							if (index !== -1) {

								let tmp = message.trim().substr(3).trim();
								if (tmp.length > 0) {
									_MESSAGE.consoles[index].call(console, '                      ' + tmp);
								}

							} else if (index === -1) {

								let tmp = message.trim();
								if (tmp.length > 0) {
									console.error('                      ' + tmp);
								}

							}

						});

					}

				});

				handle.on('error', function() {

					console.warn('harvester.mod.Server: SHUTDOWN (' + info + ')');

					this.kill('SIGTERM');

				});

				handle.on('exit', function() {
				});

				handle.destroy = function() {

					console.warn('harvester.mod.Server: SHUTDOWN (' + info + ')');

					this.kill('SIGTERM');

				};

			} catch (err) {

				handle = null;

			}

		}


		return handle;

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

							let server = _serve(project.identifier, port);
							if (server !== null) {

								project.setServer(new _Server({
									process: server,
									host:    null,
									port:    port
								}));

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

