
lychee.define('strainer.Main').requires([
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
			action:  null,
			project: null
		}, settings);

		this.defaults = _lychee.assignunlink({
			action:  null,
			project: null
		}, this.settings);


		_Emitter.call(this);



		/*
		 * INITIALIZATION
		 */

		this.bind('load', function() {

			let action  = this.settings.action  || null;
			let project = this.settings.project || null;

			if (action !== null && project !== null) {

				lychee.ROOT.project                           = _lychee.ROOT.lychee + project;
				lychee.environment.global.lychee.ROOT.project = _lychee.ROOT.lychee + project;


				this.trigger('init', [ project, action ]);

			} else {

				console.error('strainer: FAILURE ("' + project + '") at "load" event');

				this.destroy(1);

			}

		}, this, true);

		this.bind('init', function(project, action) {

			let template = new _Template({
				sandbox:  project,
				settings: this.settings
			});


			if (action === 'check') {

				template.then('read');

				template.then('check-eslint');
				template.then('check-api');

				template.then('write-eslint');
				template.then('write-api');
				template.then('write-pkg');

			} else if (action === 'stage') {

				template.then('read');

				template.then('check-eslint');
				template.then('check-api');

				template.then('write-eslint');
				template.then('write-api');
				template.then('write-pkg');

				template.then('stage-eslint');
				template.then('stage-api');

			}


			template.bind('complete', function() {

				if (template.errors.length === 0) {

					console.info('strainer: SUCCESS ("' + project + '")');

					this.destroy(0);

				} else {

					template.errors.forEach(function(err) {
						console.error('strainer: ' + err.header);
						console.error('          ' + err.message);
					});

					console.error('strainer: FAILURE ("' + project + '")');

					this.destroy(1);

				}

			}, this);

			template.bind('error', function(event) {

				console.error('strainer: FAILURE ("' + project + '") at "' + event + '" template event');

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
			data['constructor'] = 'strainer.Main';


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

