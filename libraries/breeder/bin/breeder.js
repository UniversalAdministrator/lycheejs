#!/usr/local/bin/lycheejs-helper env:node


const _fs   = require('fs');
const _path = require('path');
const _ROOT = process.env.LYCHEEJS_ROOT || '/opt/lycheejs';



/*
 * USAGE
 */

const _print_autocomplete = function(action, project, flag) {

	let actions   = [ 'init', 'fork', 'pull', 'push' ];
	let flags     = [ '--debug' ];
	let libraries = _fs.readdirSync(_ROOT + '/libraries')
		.sort()
		.map(val => '/libraries/' + val)
		.filter(val => _fs.existsSync(_ROOT + val + '/lychee.pkg'));
	let projects  = _fs.readdirSync(_ROOT + '/projects')
		.sort()
		.map(val => '/projects/' + val)
		.filter(val => _fs.existsSync(_ROOT + val + '/lychee.pkg'));


	let suggestions = [];
	let has_action  = actions.find(a => a === action);
	let has_project = libraries.find(l => l === project) || projects.find(p => p === project);
	let has_flag    = flags.find(f => f === flag);

	if (has_action && has_project && has_flag) {
		// Nothing to suggest
	} else if (has_action && has_project && flag) {
		suggestions = flags.filter(f => f.startsWith(flag));
	} else if (has_action && has_project) {
		suggestions = flags;
	} else if (has_action !== 'init' && project) {
		suggestions.push.apply(suggestions, libraries.filter(l => l.startsWith(project)));
		suggestions.push.apply(suggestions, projects.filter(p => p.startsWith(project)));
	} else if (has_action && action === 'init') {
		// Nothing to suggest
	} else if (has_action && action) {
		suggestions.push.apply(suggestions, libraries);
		suggestions.push.apply(suggestions, projects);
	} else if (action) {
		suggestions = actions.filter(a => a.startsWith(action));
	} else {
		suggestions = actions;
	}

	return suggestions.sort();

};

const _print_help = function() {

	let libraries = _fs.readdirSync(_ROOT + '/libraries')
		.sort()
		.filter(val => _fs.existsSync(_ROOT + '/libraries/' + val + '/lychee.pkg'))
		.map(val => '/libraries/' + val);
	let projects  = _fs.readdirSync(_ROOT + '/projects')
		.sort()
		.filter(val => _fs.existsSync(_ROOT + '/projects/' + val + '/lychee.pkg'))
		.map(val => '/projects/' + val);


	console.log('                                                   ');
	console.info('lychee.js ' + lychee.VERSION + ' Breeder');
	console.log('                                                   ');
	console.log('Usage: lycheejs-breeder [Action] [Library/Project] ');
	console.log('                                                   ');
	console.log('                                                   ');
	console.log('Available Actions:                                 ');
	console.log('                                                   ');
	console.log('    init, fork, pull, push                         ');
	console.log('                                                   ');
	console.log('Available Libraries:                                ');
	console.log('                                                    ');
	libraries.forEach(function(library) {
		let diff = ('                                                ').substr(library.length);
		console.log('    ' + library + diff);
	});
	console.log('                                                    ');
	console.log('Available Projects:                                 ');
	console.log('                                                    ');
	projects.forEach(function(project) {
		let diff = ('                                                ').substr(project.length);
		console.log('    ' + project + diff);
	});
	console.log('                                                   ');
	console.log('Available Flags:                                   ');
	console.log('                                                   ');
	console.log('   --debug          Debug Mode with debug messages ');
	console.log('                                                   ');
	console.log('Examples:                                          ');
	console.log('                                                   ');
	console.log('    cd /projects/my-project;                       ');
	console.log('                                                   ');
	console.log('    # Use either init or fork to start             ');
	console.log('    lycheejs-breeder init;                         ');
	console.log('    lycheejs-breeder fork /projects/boilerplate;   ');
	console.log('                                                   ');
	console.log('    lycheejs-breeder pull /libraries/harvester;    ');
	console.log('    lycheejs-breeder push;                         ');
	console.log('                                                   ');

};

const _bootup = function(settings) {

	console.info('BOOTUP (' + process.pid + ')');

	let environment = new lychee.Environment({
		id:       'breeder',
		debug:    settings.debug === true,
		sandbox:  settings.debug === true ? false : true,
		build:    'breeder.Main',
		timeout:  5000,
		packages: [
			new lychee.Package('lychee',     '/libraries/lychee/lychee.pkg'),
			new lychee.Package('fertilizer', '/libraries/fertilizer/lychee.pkg'),
			new lychee.Package('breeder',    '/libraries/breeder/lychee.pkg')
		],
		tags:     {
			platform: [ 'node' ]
		}
	});


	lychee.setEnvironment(environment);


	environment.init(function(sandbox) {

		if (sandbox !== null) {

			let lychee  = sandbox.lychee;
			let breeder = sandbox.breeder;


			// Show less debug messages
			lychee.debug = true;


			// This allows using #MAIN in JSON files
			sandbox.MAIN = new breeder.Main(settings);

			sandbox.MAIN.bind('destroy', function() {
				process.exit(0);
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


			new lychee.Input({
				key:         true,
				keymodifier: true
			}).bind('escape', function() {

				console.warn('breeder: [ESC] pressed, exiting ...');
				sandbox.MAIN.destroy();

			}, this);

		} else {

			console.error('BOOTUP FAILURE');

			process.exit(1);

		}

	});

};



if (process.argv.includes('--autocomplete')) {

	let tmp1   = process.argv.indexOf('--autocomplete');
	let words  = process.argv.slice(tmp1 + 1);
	let result = _print_autocomplete.apply(null, words);

	process.stdout.write(result.join(' '));

	process.exit(0);
	return;

}



if (_fs.existsSync(_ROOT + '/libraries/lychee/build/node/core.js') === false) {
	require(_ROOT + '/bin/configure.js');
}

const lychee    = require(_ROOT + '/libraries/lychee/build/node/core.js')(_ROOT);
const _SETTINGS = (function() {

	let args     = process.argv.slice(2).filter(val => val !== '');
	let settings = {
		action:  null,
		project: null,
		library: null,
		debug:   false
	};


	let action     = args.find(val => /^(init|fork|pull|push)/g.test(val));
	let library    = args.find(val => /^\/(libraries|projects)\/([A-Za-z0-9-_\/]+)$/g.test(val));
	let project    = args.find(val => /--project=\/(libraries|projects)\/([A-Za-z0-9-_\/]+)/g.test(val));
	let debug_flag = args.find(val => /--([debug]{5})/g.test(val));


	if (project !== undefined) {

		let tmp = project.substr(10);
		if (tmp.indexOf('.') === -1) {

			try {

				let stat1 = _fs.lstatSync(_ROOT + tmp);
				if (stat1.isDirectory()) {
					settings.project = tmp;
				}

			} catch (err) {

				settings.project = null;

			}

		}

	}


	if (action === 'pull' || action === 'fork') {

		if (library !== undefined) {

			settings.action = action;


			try {

				let stat1 = _fs.lstatSync(_ROOT + library);
				let stat2 = _fs.lstatSync(_ROOT + library + '/lychee.pkg');
				if (stat1.isDirectory() && stat2.isFile()) {
					settings.library = library;
				}

			} catch (err) {

				settings.library = null;

			}

		}

	} else if (action !== undefined) {

		settings.action = action;

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

	let action      = settings.action;
	let has_project = settings.project !== null;
	let has_library = settings.library !== null;


	if (action === 'init' && has_project) {

		_bootup({
			action:  'init',
			debug:   settings.debug === true,
			project: settings.project
		});


	} else if (action === 'fork' && has_project && has_library) {

		_bootup({
			action:  'fork',
			debug:   settings.debug === true,
			project: settings.project,
			library: settings.library
		});

	} else if (action === 'pull' && has_project && has_library) {

		_bootup({
			action:  'pull',
			debug:   settings.debug === true,
			project: settings.project,
			library: settings.library
		});

	} else if (action === 'push' && has_project) {

		_bootup({
			action:  'push',
			debug:   settings.debug === true,
			project: settings.project
		});

	} else {

		console.error('PARAMETERS FAILURE');

		_print_help();

		process.exit(1);

	}

})(_SETTINGS);

