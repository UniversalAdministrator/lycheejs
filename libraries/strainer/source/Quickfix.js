
lychee.define('strainer.Quickfix').requires([
	'lychee.Input',
	'strainer.Template'
]).includes([
	'lychee.event.Emitter'
]).exports(function(lychee, global, attachments) {

	const _lychee   = lychee.import('lychee');
	const _Emitter  = lychee.import('lychee.event.Emitter');
	const _Input    = lychee.import('lychee.Input');
	const _Template = lychee.import('strainer.Template');



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(settings) {

		this.settings = _lychee.assignunlink({
			cwd:     lychee.ROOT.lychee,
			file:    null,
			project: null
		}, settings);

		this.defaults = _lychee.assignunlink({
			cwd:     lychee.ROOT.lychee,
			file:    null,
			project: null
		}, this.settings);


		_Emitter.call(this);



		/*
		 * INITIALIZATION
		 */

		this.bind('load', function() {

			let file    = this.settings.file    || null;
			let project = this.settings.project || null;

			if (file !== null && project !== null) {

				lychee.ROOT.project                           = _lychee.ROOT.lychee + project;
				lychee.environment.global.lychee.ROOT.project = _lychee.ROOT.lychee + project;


				this.trigger('init', [ project, file ]);

			} else {

				this.destroy(1);

			}

		}, this, true);

		this.bind('init', function(project, file) {

			let template = new _Template({
				sandbox:  project,
				settings: this.settings
			});


			template.unbind('read');
			template.bind('read', function(oncomplete) {

				let file    = this.settings.file;
				let project = this.settings.project;
				let sandbox = this.sandbox;
				let stash   = this.stash;

				if (sandbox !== '' && stash !== null) {

					console.log('strainer: READ ' + project);


					let that  = this;
					let asset = new Stuff(sandbox + '/' + file, true);
					let pkg   = new Config(sandbox + '/lychee.pkg');


					pkg.onload = function(result) {

						if (result === true) {

							asset.onload = function(result) {

								if (result === true) {

									that.codes = [ asset ];
									oncomplete(true);

								} else {

									oncomplete(false);

								}

							};

							asset.load();

						} else {

							oncomplete(false);

						}

					};

					pkg.load();

				} else {

					oncomplete(false);

				}


			}, template);

			template.then('read');

			template.then('check-eslint');
			template.then('check-api');

			template.then('write-eslint');
			template.then('write-api');

			template.bind('complete', function() {

				let cwd = this.settings.cwd;


				let length = template.errors.length;
				if (length === 0) {

					console.error('\n0 problems');

					this.destroy(0);

				} else {

					template.errors.forEach(function(err) {

						let path = '/opt/lycheejs' + err.error.fileName;
						let rule = err.error.ruleId  || 'parser-error';
						let line = err.error.line    || 0;
						let col  = err.error.column  || 0;
						let msg  = err.error.message || 'Parsing error: unknown';
						if (msg.endsWith('.') === false) {
							msg = msg.trim() + '.';
						}


						let message = '';

						message += path.substr(cwd.length + 1);
						message += ':' + line;
						message += ':' + col;
						message += ': ' + msg;
						message += ' [' + rule + ']';

						console.error(message);

					});

					console.error('\n' + length + ' ' + (length === 1 ? 'problem' : 'problems'));

					this.destroy(1);

				}

			}, this);

			template.bind('error', function(event) {

				this.destroy(1);

			}, this);


			template.init();


			return true;

		}, this, true);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Emitter.prototype.serialize.call(this);
			data['constructor'] = 'strainer.Quickfix';


			let settings = _lychee.assignunlink({}, this.settings);
			let blob     = data['blob'] || {};


			data['arguments'][0] = settings;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},



		/*
		 * MAIN API
		 */

		init: function() {

			this.trigger('load');

			return true;

		},

		destroy: function(code) {

			code = typeof code === 'number' ? code : 0;


			this.trigger('destroy', [ code ]);

			return true;

		}

	};


	return Composite;

});

