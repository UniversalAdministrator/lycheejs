
lychee.define('lychee.ui.entity.List').includes([
	'lychee.ui.Entity'
]).exports(function(lychee, global, attachments) {

	const _Entity = lychee.import('lychee.ui.Entity');
	const _FONT   = attachments["fnt"];



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);


		this.font    = _FONT;
		this.options = [];
		this.value   = {};

		this.__cursor = {
			active:   false,
			alpha:    0.0,
			duration: 600,
			previous: null,
			start:    null,
			pingpong: false
		};


		this.setFont(settings.font);
		this.setOptions(settings.options);
		this.setValue(settings.value);

		delete settings.font;
		delete settings.options;
		delete settings.value;


		settings.width  = typeof settings.width === 'number'  ? settings.width  : 128;
		settings.height = typeof settings.height === 'number' ? settings.height :  32;
		settings.shape  = _Entity.SHAPE.rectangle;


		_Entity.call(this, settings);

		settings = null;


		if (this.options.length > 1) {
			this.height = this.options.length * this.height;
		}



		/*
		 * INITIALIZATION
		 */

		this.bind('touch', function(id, position, delta) {

			if (this.options.length === 0) return;


			let lh  = this.height / this.options.length;
			let pos = (position.y + this.height / 2);

			let q = (pos / lh) | 0;
			if (q >= 0) {

				let tmp = {};
				let option = this.options[q] || null;
				if (option !== null) {

					tmp[option] = !(this.value[option]);

					let result = this.setValue(tmp);
					if (result === true) {
						this.trigger('change', [ this.value ]);
					}

				}

			}

		}, this);

		this.bind('key', function(key, name, delta) {

			if (this.options.length === 0) return;


			if (this.state === 'active') {

				let option = this.__cursor.previous;
				let q      = this.options.indexOf(option);

				if (key === 'w' || key === 'arrow-up')   option = this.options[--q] || this.options[0];
				if (key === 's' || key === 'arrow-down') option = this.options[++q] || this.options[this.options.length - 1];


				if (key === 'space' || key === 'enter') {

					let tmp = {};
					tmp[option] = !(this.value[option]);


					let result = this.setValue(tmp);
					if (result === true) {
						this.trigger('change', [ this.value ]);
					}

				} else {

					this.__cursor.previous = option;

				}

			}

		}, this);

		this.bind('focus', function() {
			this.setState('active');
		}, this);

		this.bind('blur', function() {
			this.setState('default');
		}, this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			let font = lychee.deserialize(blob.font);
			if (font !== null) {
				this.setFont(font);
			}

		},

		serialize: function() {

			let data = _Entity.prototype.serialize.call(this);
			data['constructor'] = 'lychee.ui.entity.List';

			let settings = data['arguments'][0];
			let blob     = (data['blob'] || {});


			if (this.options.length !== 0)          settings.options = [].slice.call(this.options, 0);
			if (Object.keys(this.value).length > 0) settings.value   = this.value;


			if (this.font !== null) blob.font = lychee.serialize(this.font);


			data['blob'] = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},

		update: function(clock, delta) {

			let cursor = this.__cursor;
			if (cursor.active === true) {

				if (cursor.start === null) {
					cursor.start = clock;
				}


				let ct = (clock - cursor.start) / cursor.duration;
				if (ct <= 1) {
					cursor.alpha = cursor.pingpong === true ? (1 - ct) : ct;
				} else {
					cursor.start    = clock;
					cursor.pingpong = !cursor.pingpong;
				}

			}


			_Entity.prototype.update.call(this, clock, delta);

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;


			let alpha    = this.alpha;
			let position = this.position;
			let cursor   = this.__cursor;
			let font     = this.font;
			let value    = this.value;
			let x        = position.x + offsetX;
			let y        = position.y + offsetY;
			let hwidth   = this.width  / 2;
			let hheight  = this.height / 2;


			if (alpha !== 1) {
				renderer.setAlpha(alpha);
			}


			let x1 = x - hwidth;
			let lh = this.height / this.options.length;

			for (let o = 0, ol = this.options.length; o < ol; o++) {

				let option = this.options[o];
				let y1     = y - hheight + o * lh;
				let val    = value[option];

				if (val === true) {

					renderer.drawCircle(
						x1 + 16,
						y1 + 16,
						11,
						'#32afe5',
						false,
						2
					);

				} else {

					renderer.drawCircle(
						x1 + 16,
						y1 + 16,
						11,
						'#545454',
						false,
						2
					);

				}


				if (cursor.active === true && option === cursor.previous) {

					renderer.drawCircle(
						x1 + 16,
						y1 + 16,
						11,
						val === true ? '#32afe5' : '#545454',
						false,
						2
					);

					renderer.setAlpha(cursor.alpha);

					renderer.drawCircle(
						x1 + 16,
						y1 + 16,
						12,
						'#32afe5',
						true
					);

					renderer.setAlpha(alpha);


				}


				renderer.drawText(
					x1 + 36,
					y1 + (font.lineheight / 2),
					option,
					font,
					false
				);

			}


			if (alpha !== 1) {
				renderer.setAlpha(1.0);
			}

		},



		/*
		 * CUSTOM API
		 */

		setFont: function(font) {

			font = font instanceof Font ? font : null;


			if (font !== null) {

				this.font = font;

				return true;

			}


			return false;

		},

		setOptions: function(options) {

			options = options instanceof Array ? options.unique() : null;


			if (options !== null) {

				let height = this.height || null;
				if (height !== null) {

					if (this.options.length > 0) {
						this.height = (height / this.options.length) * options.length;
					} else {
						this.height = height * options.length;
					}

				}

				this.options = options.map(function(option) {
					return '' + option;
				});

				this.options.forEach(function(option) {
					this.value[option] = this.value[option] === true;
				}.bind(this));


				return true;

			}


			return false;

		},

		setState: function(id) {

			id = typeof id === 'string' ? id : null;


			if (id !== null) {

				let result = _Entity.prototype.setState.call(this, id);
				if (result === true) {

					let cursor = this.__cursor;


					if (id === 'active') {

						cursor.start  = null;
						cursor.active = true;

					} else {

						cursor.active = false;

					}


					return true;

				}

			}


			return false;

		},

		setValue: function(value) {

			value = value instanceof Object ? value : null;


			if (value !== null) {

				let cursor = this.__cursor;
				let prev   = Object.keys(value)[0] || null;


				this.options.forEach(function(option) {
					value[option] = value[option] !== undefined ? value[option] === true : this.value[option];
				}.bind(this));

				cursor.previous = prev;
				this.value      = value;


				return true;

			}


			return false;

		}

	};


	return Composite;

});

