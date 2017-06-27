
lychee.define('Viewport').tags({
	platform: 'nidium'
}).includes([
	'lychee.event.Emitter'
]).supports(function(lychee, global) {

	if (
		typeof global.innerWidth === 'number'
		&& typeof global.innerHeight === 'number'
	) {

		return true;

	}


	return false;

}).exports(function(lychee, global, attachments) {

	const _Emitter   = lychee.import('lychee.event.Emitter');
	const _INSTANCES = [];



	/*
	 * EVENTS
	 */

	let _focusactive   = true;
	let _reshapewidth  = global.innerWidth;
	let _reshapeheight = global.innerHeight;

	const _reshape_viewport = function() {

		if (_reshapewidth === global.innerWidth && _reshapeheight === global.innerHeight) {
			return false;
		}

		for (let i = 0, l = _INSTANCES.length; i < l; i++) {
			_process_reshape.call(_INSTANCES[i], global.innerWidth, global.innerHeight);
		}

		_reshapewidth  = global.innerWidth;
		_reshapeheight = global.innerHeight;

	};

	const _listeners = {

		focus: function() {

			if (_focusactive === false) {

				for (let i = 0, l = _INSTANCES.length; i < l; i++) {
					_process_show.call(_INSTANCES[i]);
				}

				_focusactive = true;

			}

		},

		blur: function() {

			if (_focusactive === true) {

				for (let i = 0, l = _INSTANCES.length; i < l; i++) {
					_process_hide.call(_INSTANCES[i]);
				}

				_focusactive = false;

			}

		}

	};



	/*
	 * FEATURE DETECTION
	 */

	(function() {

		let focus = '_onfocus' in global;
		let blur  = '_onblur' in global;

		if (focus) global._onfocus = _listeners.focus;
		if (blur)  global._onblur  = _listeners.blur;


		if (lychee.debug === true) {

			let methods = [];

			if (focus) methods.push('Focus');
			if (blur)  methods.push('Blur');

			if (methods.length === 0) {
				console.error('lychee.Viewport: Supported methods are NONE');
			} else {
				console.info('lychee.Viewport: Supported methods are ' + methods.join(', '));
			}

		}

	})();



	/*
	 * HELPERS
	 */

	const _process_show = function() {

		return this.trigger('show');

	};

	const _process_hide = function() {

		return this.trigger('hide');

	};

	const _process_reshape = function(width, height) {

		if (width === this.width && height === this.height) {
			return false;
		}


		this.width  = width;
		this.height = height;


		let orientation = null;
		let rotation    = null;


		if (width > height) {

			orientation = 'landscape';
			rotation    = 'landscape';

		} else {

			orientation = 'portrait';
			rotation    = 'portrait';

		}


		return this.trigger('reshape', [ orientation, rotation, width, height ]);

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);


		this.fullscreen = false;
		this.width      = global.innerWidth;
		this.height     = global.innerHeight;


		_Emitter.call(this);

		_INSTANCES.push(this);


		this.setFullscreen(settings.fullscreen);



		/*
		 * INITIALIZATION
		 */

		setTimeout(function() {

			this.width  = 0;
			this.height = 0;

			_process_reshape.call(this, global.innerWidth, global.innerHeight);

		}.bind(this), 100);


		settings = null;

	};


	Composite.prototype = {

		destroy: function() {

			let found = false;

			for (let i = 0, il = _INSTANCES.length; i < il; i++) {

				if (_INSTANCES[i] === this) {
					_INSTANCES.splice(i, 1);
					found = true;
					il--;
					i--;
				}

			}

			this.unbind();


			return found;

		},



		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Emitter.prototype.serialize.call(this);
			data['constructor'] = 'lychee.Viewport';

			let settings = {};


			if (this.fullscreen !== false) settings.fullscreen = this.fullscreen;


			data['arguments'][0] = settings;


			return data;

		},



		/*
		 * CUSTOM API
		 */

		setFullscreen: function(fullscreen) {

			// XXX: No Fullscreen support
			// https://github.com/nidium/Nidium/issues/65

			return false;

		}

	};


	return Composite;

});

