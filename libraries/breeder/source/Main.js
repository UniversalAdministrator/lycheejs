
lychee.define('breeder.Main').requires([
	'breeder.Template'
]).includes([
	'lychee.event.Emitter'
]).exports(function(lychee, global, attachments) {

	const _lychee   = lychee.import('lychee');
	const _Emitter  = lychee.import('lychee.event.Emitter');
	const _Template = lychee.import('breeder.Template');



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(settings) {

		this.settings = _lychee.assignunlink({
			action:  null,
			project: null,
			library: null
		}, settings);

		this.defaults = _lychee.assignunlink({
			action:  null,
			project: null,
			library: null
		}, this.settings);


		_Emitter.call(this);

		settings = null;



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

				console.error('breeder: FAILURE ("' + project + '") at "load" event');


				this.destroy(1);

			}

		}, this, true);

		this.bind('init', function(project, action) {

			let template = new _Template({
				sandbox:  project,
				settings: this.settings
			});


			template.then(action);

			template.bind('complete', function() {

				if (lychee.debug === true) {
					console.info('breeder: SUCCESS ("' + project + '")');
				}

				this.destroy();

			}, this);

			template.bind('error', function(event) {

				if (lychee.debug === true) {
					console.error('breeder: FAILURE ("' + project + '") at "' + event + '" template event');
				}

				this.destroy();

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
			data['constructor'] = 'breeder.Main';


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

