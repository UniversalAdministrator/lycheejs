#!/usr/local/bin/lycheejs-helper env:node


const _fs   = require('fs');
const _path = require('path');
const _CWD  = process.env.STRAINER_PWD  || process.cwd();
const _ROOT = process.env.LYCHEEJS_ROOT || '/opt/lycheejs';



/*
 * USAGE
 */

const _print_help = function() {

	console.log('                                                                 ');
	console.info('lychee.js ' + lychee.VERSION + ' Strainer (Fixer)');
	console.log('                                                                 ');
	console.log('Usage: lycheejs-strainer-fixer [File]                            ');
	console.log('                                                                 ');
	console.log('                                                                 ');
	console.log('Available Flags:                                                 ');
	console.log('                                                                 ');
	console.log('   --debug          Debug Mode with debug messages               ');
	console.log('                                                                 ');
	console.log('Examples:                                                        ');
	console.log('                                                                 ');
	console.log('    # cwd has to be /opt/lycheejs                                ');
	console.log('    lycheejs-strainer-fixer projects/boilerplate/source/Main.js; ');
	console.log('                                                                 ');

};

const _bootup = function(settings) {

	// XXX: Quickfix Mode doesn't allow
	// console log/info/warn or pretty
	// color codes, so strip them out.

	if (settings.debug === false) {

		console.log   = function() {};
		console.info  = function() {};
		console.warn  = function() {};
		console.error = function() {

			let al   = arguments.length;
			let args = [];
			for (let a = 0; a < al; a++) {
				args.push(arguments[a]);
			}

			process.stdout.write(args.join(' ') + '\n');

		};

	}


	lychee.ROOT.project = lychee.ROOT.lychee + '/libraries/strainer';

	lychee.pkg('build', 'node/fixer', function(environment) {

		lychee.init(environment, {
			debug:   false,
			sandbox: true
		}, function(sandbox) {

			if (sandbox !== null) {

				let lychee   = sandbox.lychee;
				let strainer = sandbox.strainer;


				// This allows using #MAIN in JSON files
				sandbox.MAIN = new strainer.Fixer(settings);

				sandbox.MAIN.bind('destroy', function(code) {
					process.exit(code);
				});

				sandbox.MAIN.init();


				const _on_process_error = function() {
					sandbox.MAIN.destroy();
					process.exit(1);
				};

				process.on('SIGHUP',  _on_process_error);
				process.on('SIGINT',  _on_process_error);
				process.on('SIGQUIT', _on_process_error);
				process.on('SIGABRT', _on_process_error);
				process.on('SIGTERM', _on_process_error);
				process.on('error',   _on_process_error);
				process.on('exit',    function() {});

			} else {

				process.exit(1);

			}

		});

	});

};



/*
 * XXX: Quickfix Mode doesn't need console.info() calls.
 * This strips out all bootstrap info
 */

const lychee = (function() {

	let _old_write = process.stdout.write;
	process.stdout.write = function() {};

	if (_fs.existsSync(_ROOT + '/libraries/lychee/build/node/core.js') === false) {
		require(_ROOT + '/bin/configure.js');
	}

	let lychee = require(_ROOT + '/libraries/lychee/build/node/core.js')(_ROOT);
	process.stdout.write = _old_write;


	return lychee;

})();



const _SETTINGS = (function() {

	let args     = process.argv.slice(2).filter(val => val !== '');
	let settings = {
		cwd:     _CWD,
		file:    null,
		project: null,
		debug:   false
	};


	let debug_flag = args.find(val => /--([debug]{5})/g.test(val));


	let file = args[0];
	if (file !== undefined) {

		if (file.startsWith('./')) {
			file = _CWD + '/' + file.substr(2);
		} else if (file.startsWith('/') === false) {
			file = _CWD + '/' + file;
		}

		try {

			let stat = _fs.lstatSync(file);
			if (stat.isFile()) {
				settings.file = file;
			}

		} catch (err) {

			settings.file = null;

		}


		if (settings.file !== null) {

			let path   = settings.file.split('/');
			let check1 = path.findIndex(val => /^(projects|libraries)$/g.test(val));
			let check2 = path.findIndex(val => val === 'source');

			// XXX: Allow /tmp/lycheejs usage
			if (check1 !== -1) {

				let project = '/' + path.slice(3, 5).join('/');

				try {

					let stat1 = _fs.lstatSync(_ROOT + project);
					let stat2 = _fs.lstatSync(_ROOT + project + '/lychee.pkg');
					if (stat1.isDirectory() && stat2.isFile()) {
						settings.project = project;
					}

				} catch (err) {

					settings.project = null;

				}


				if (settings.project !== null) {

					let index = settings.file.indexOf(settings.project);
					if (index !== -1) {
						settings.file = settings.file.substr(index + settings.project.length + 1);
					}

				}

			// XXX: Allow /home/whatever/my-project usage
			} else if (check2 !== -1) {

				let project = path.slice(0, check2).join('/');

                try {

					let stat1 = _fs.lstatSync(project);
					let stat2 = _fs.lstatSync(project + '/lychee.pkg');
					if (stat1.isDirectory() && stat2.isFile()) {
						settings.project = project;
					}

				} catch (err) {

					settings.project = null;

				}


				if (settings.project !== null) {

					let index = settings.file.indexOf(settings.project);
					if (index !== -1) {
						settings.file = settings.file.substr(index + settings.project.length + 1);
					}

				}

			}

		}

	}


	if (debug_flag !== undefined) {
		settings.debug = true;
	}


	return settings;

})();



(function(settings) {

	/*
	 * IMPLEMENTATION
	 */

	let has_file    = settings.file !== null;
	let has_project = settings.project !== null;


	if (has_file && has_project) {

		_bootup({
			cwd:     settings.cwd,
			debug:   settings.debug === true,
			file:    settings.file,
			project: settings.project
		});

	} else {

		console.error('PARAMETERS FAILURE');

		_print_help();

		process.exit(1);

	}

})(_SETTINGS);

