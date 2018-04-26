
lychee.define('harvester.mod.Packager').requires([
	'harvester.data.Package',
	'harvester.data.Project'
]).exports(function(lychee, global, attachments) {

	const _Package = lychee.import('harvester.data.Package');
	const _Project = lychee.import('harvester.data.Project');



	/*
	 * HELPERS
	 */

	const _get_reasons = function(aobject, bobject, reasons, path) {

		path = typeof path === 'string' ? path : '';


		let akeys = Object.keys(aobject);
		let bkeys = Object.keys(bobject);

		if (akeys.length !== bkeys.length) {

			for (let a = 0, al = akeys.length; a < al; a++) {

				let aval = akeys[a];
				let bval = bkeys.find(function(val) {
					return val === aval;
				});

				if (bval === undefined) {
					reasons.push(path + '/' + aval);
				}

			}

			for (let b = 0, bl = bkeys.length; b < bl; b++) {

				let bval = bkeys[b];
				let aval = akeys.find(function(val) {
					return val === bval;
				});

				if (aval === undefined) {
					reasons.push(path + '/' + bval);
				}

			}

		} else {

			for (let a = 0, al = akeys.length; a < al; a++) {

				let key = akeys[a];

				if (bobject[key] !== undefined) {

					if (aobject[key] !== null && bobject[key] !== null) {

						if (aobject[key] instanceof Object && bobject[key] instanceof Object) {
							_get_reasons(aobject[key], bobject[key], reasons, path + '/' + key);
						} else if (typeof aobject[key] !== typeof bobject[key]) {
							reasons.push(path + '/' + key);
						}

					}

				} else {
					reasons.push(path + '/' + key);
				}

			}

		}

	};

	const _serialize = function(project) {

		let json = {};
		let tmp  = {};


		try {

			json = JSON.parse(project.filesystem.read('/lychee.pkg'));

		} catch (err) {

			console.error('harvester.mod.Packager: FAILURE ("' + project.identifier + '")');

			try {
				json = JSON.parse(JSON.stringify(project.package.json));
			} catch (err) {
			}

		}


		if (json === null) json = {};

		if (typeof json.api === 'undefined')                 json.api       = {};
		if (typeof json.api.files === 'undefined')           json.api.files = {};
		if (typeof json.api.environments !== 'undefined')    delete json.api.environments;
		if (typeof json.api.simulations !== 'undefined')     delete json.api.simulations;
		if (typeof json.api.tags !== 'undefined')            delete json.api.tags;

		if (typeof json.build  === 'undefined')              json.build              = {};
		if (typeof json.build.environments === 'undefined')  json.build.environments = {};
		if (typeof json.build.files === 'undefined')         json.build.files        = {};
		if (typeof json.build.simulations !== 'undefined')   delete json.build.simulations;
		if (typeof json.build.tags !== 'undefined')          delete json.build.tags;

		if (typeof json.review === 'undefined')              json.review             = {};
		if (typeof json.review.simulations === 'undefined')  json.review.simulations = {};
		if (typeof json.review.files === 'undefined')        json.review.files       = {};
		if (typeof json.review.environments !== 'undefined') delete json.review.environments;
		if (typeof json.review.tags !== 'undefined')         delete json.review.tags;

		if (typeof json.source === 'undefined')              json.source       = {};
		if (typeof json.source.files === 'undefined')        json.source.files = {};
		if (typeof json.source.tags === 'undefined')         json.source.tags  = {};
		if (typeof json.source.environments !== 'undefined') delete json.source.environments;
		if (typeof json.source.simulations !== 'undefined')  delete json.source.simulations;


		json.api.files = {};
		_walk_directory.call(project.filesystem, tmp, '/api');
		json.api.files = _sort_recursive(tmp.api);

		json.build.files = {};
		_walk_directory.call(project.filesystem, tmp, '/build');
		json.build.environments = _sort_recursive(json.build.environments);
		json.build.files        = _sort_recursive(tmp.build);

		json.review.files = {};
		_walk_directory.call(project.filesystem, tmp, '/review');
		json.review.simulations = _sort_recursive(json.review.simulations);
		json.review.files       = _sort_recursive(tmp.review);

		json.source.files = {};
		_walk_directory.call(project.filesystem, tmp, '/source');
		json.source.files       = _sort_recursive(tmp.source);
		json.source.tags        = _walk_tags(json.source.files);


		return {
			api:    json.api,
			build:  json.build,
			review: json.review,
			source: json.source
		};

	};

	const _sort_recursive = function(obj, name) {

		if (obj instanceof Array) {

			if (name === 'platform') {

				// XXX: platform: [ 'html-webview', 'html' ] is wanted
				return obj.sort(function(a, b) {
					if (a.includes('-') && !b.includes('-')) return -1;
					if (b.includes('-') && !a.includes('-')) return  1;
					return 0;
				});

			} else {

				return obj.sort();

			}

		} else if (obj instanceof Object) {

			for (let prop in obj) {
				obj[prop] = _sort_recursive(obj[prop], prop);
			}

			return Object.sort(obj);

		} else {

			return obj;

		}

	};

	const _walk_tags = function(files) {

		let tags = {};

		if (files.platform instanceof Object) {

			tags.platform = {};

			for (let id in files.platform) {
				tags.platform[id] = 'platform/' + id;
			}

		}

		return tags;

	};

	const _walk_directory = function(pointer, path) {

		let that = this;
		let name = path.split('/').pop();

		let info = this.info(path);
		if (info !== null && name.startsWith('.') === false) {

			if (info.type === 'file') {

				let identifier = name.split('.')[0];
				let attachment = name.split('.').slice(1).join('.');

				// Music and Sound asset have a trailing mp3 or ogg
				// extension which is dynamically chosen at runtime
				let ext = attachment.split('.').pop();
				if (/(mp3|ogg)$/.test(ext)) {
					attachment = attachment.split('.').slice(0, -1).join('.');
					ext        = attachment.split('.').pop();
				}

				if (/(fnt|html|js|json|md|msc|png|snd|tpl)$/g.test(ext)) {

					if (pointer[identifier] instanceof Array) {

						if (pointer[identifier].indexOf(attachment) === -1) {
							pointer[identifier].push(attachment);
						}

					} else {

						pointer[identifier] = [ attachment ];

					}

				}

			} else if (info.type === 'directory') {

				pointer[name] = {};

				this.dir(path).forEach(function(child) {
					_walk_directory.call(that, pointer[name], path + '/' + child);
				});

			}

		}

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
				'reference': 'harvester.mod.Packager',
				'arguments': []
			};

		},



		/*
		 * CUSTOM API
		 */

		can: function(project) {

			project = project instanceof _Project ? project : null;


			if (project !== null) {

				if (project.identifier.indexOf('__') === -1 && project.package !== null && project.filesystem !== null) {

					let diff_a = JSON.stringify(project.package.json);
					let diff_b = JSON.stringify(_serialize(project));
					if (diff_a !== diff_b) {
						return true;
					}

				}

			}


			return false;

		},

		process: function(project) {

			project = project instanceof _Project ? project : null;


			let reasons = [];

			if (project !== null) {

				if (project.package !== null) {

					let data = _serialize(project);
					let blob = JSON.stringify(data, null, '\t');


					_get_reasons(data, project.package.json, reasons);


					if (blob !== null) {

						project.filesystem.write('/lychee.pkg', blob);
						project.package = null;
						project.package = new _Package({
							buffer: new Buffer(blob, 'utf8')
						});

					}

				}

			}

			return reasons;

		}

	};


	return Module;

});

