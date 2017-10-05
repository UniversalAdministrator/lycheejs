
lychee.define('strainer.Main').requires([
	'lychee.Input',
	'strainer.flow.Check'
]).includes([
	'lychee.event.Emitter'
]).exports(function(lychee, global, attachments) {

	const _lychee  = lychee.import('lychee');
	const _Emitter = lychee.import('lychee.event.Emitter');
	const _Input   = lychee.import('lychee.Input');
	const _flow    = lychee.import('strainer.flow');



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(settings) {

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

			let flow = null;
			let name = action.charAt(0).toUpperCase() + action.substr(1);

			if (_flow[name] !== undefined) {

				flow = new _flow[name]({
					sandbox:  project,
					settings: this.settings
				});

			}


			if (flow !== null) {

				flow.bind('complete', function() {

					if (flow.errors.length === 0) {

						console.info('strainer: SUCCESS ("' + project + '")');

						this.destroy(0);

					} else {

						flow.errors.forEach(function(err) {

							let path = err.url;
							let rule = err.rule    || 'parser-error';
							let line = err.line    || 0;
							let col  = err.column  || 0;
							let msg  = err.message || 'Parsing error: unknown';
							if (msg.endsWith('.') === false) {
								msg = msg.trim() + '.';
							}


							let message = '';

							message += path;
							message += ':' + line;
							message += ':' + col;
							message += ': ' + msg;
							message += ' [' + rule + ']';

							if (err.rule.startsWith('unguessable-')) {
								console.warn('strainer: ' + message);
							} else {
								console.error('strainer: ' + message);
							}

						});

						console.error('strainer: FAILURE ("' + project + '")');

						this.destroy(1);

					}

				}, this);

				flow.bind('error', function(event) {

					console.error('strainer: FAILURE ("' + project + '") at "' + event + '" event');

					this.destroy(1);

				}, this);


				flow.init();

			}


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

