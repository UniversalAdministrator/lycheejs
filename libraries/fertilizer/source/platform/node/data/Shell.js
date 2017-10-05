
lychee.define('fertilizer.data.Shell').tags({
	platform: 'node'
}).supports(function(lychee, global) {

	if (typeof global.require === 'function') {

		try {

			global.require('child_process');
			global.require('path');

			return true;

		} catch (err) {
		}

	}


	return false;

}).exports(function(lychee, global, attachments) {

	const _child_process = require('child_process');
	const _ROOT          = lychee.ROOT.lychee;



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function() {

		this.__stack = [];

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			if (blob.stack instanceof Array) {

				for (let s = 0, sl = blob.stack.length; s < sl; s++) {
					this.__stack.push(blob.stack[s]);
				}

			}

		},

		serialize: function() {

			let blob = {};


			if (this.__stack.length > 0) {
				blob.stack = this.__stack.map(lychee.serialize);
			}


			return {
				'constructor': 'fertilizer.data.Shell',
				'arguments':   [],
				'blob':        Object.keys(blob).length > 0 ? blob : null
			};

		},



		/*
		 * CUSTOM API
		 */

		exec: function(command, callback, scope) {

			command  = typeof command === 'string'  ? command  : null;
			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : this;


			if (command !== null) {

				let that = this;
				let args = command.split(' ').slice(1);
				let cmd  = command.split(' ')[0];
				let file = _ROOT + (cmd.charAt(0) !== '/' ? '/' : '') + cmd;
				let ext  = file.split('.').pop();
				let path = file.split('/').slice(0, -1).join('/');
				if (path.split('/').pop() === 'bin') {
					path = path.split('/').slice(0, -1).join('/');
				}


				if (ext === 'js') {

					args.reverse();
					args.push(file);
					args.push('env:node');
					args.reverse();

					file = _ROOT + '/bin/helper.sh';

				}


				if (callback !== null) {

					try {

						_child_process.execFile(file, args, {
							cwd: path
						}, function(error, stdout, stderr) {

							that.__stack.push({
								args:   args,
								file:   file,
								path:   path,
								stdout: stdout.toString(),
								stderr: stderr.toString()
							});


							if (error) {
								callback.call(scope, false);
							} else {
								callback.call(scope, true);
							}

						});

					} catch (err) {

						callback.call(scope, false);

					}


					return true;

				}

			}


			return false;

		},

		trace: function(limit) {

			limit = typeof limit === 'number' ? (limit | 0) : null;


			let stack = this.__stack;
			if (limit !== null) {
				stack = stack.slice(stack.length - limit, limit);
			}


			stack.forEach(function(context) {

				let dir = context.path;
				let cmd = context.file;
				let out = context.stdout.trim();
				let err = context.stderr.trim();

				if (cmd.substr(0, dir.length) === dir) {
					cmd = '.' + cmd.substr(dir.length);
				}

				if (context.args.length > 0) {
					cmd += ' ';
					cmd += context.args.join(' ');
				}

				console.log('');
				console.log('cd ' + dir + ';');
				console.log(cmd + ';');
				console.log('');

				if (out.length > 0) {
					console.log(out);
				}

				if (err.length > 0) {
					console.error(err);
				}

				console.log('');

			});


			return true;

		}

	};


	return Composite;

});

