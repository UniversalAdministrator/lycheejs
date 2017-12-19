
lychee.define('game.ui.layer.Control').requires([
	'lychee.ui.entity.Button',
	'lychee.ui.entity.Joystick'
]).includes([
	'lychee.ui.Layer'
]).exports(function(lychee, global, attachments) {

	const _Button   = lychee.import('lychee.ui.entity.Button');
	const _Joystick = lychee.import('lychee.ui.entity.Joystick');
	const _Layer    = lychee.import('lychee.ui.Layer');



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let settings = Object.assign({}, data);


		settings.relayout = false;


		_Layer.call(this, settings);

		settings = null;



		/*
		 * INITIALIZATION
		 */

		this.unbind('touch');
		this.bind('touch', function(id, position, delta) {

			if (this.visible === false) return null;


			let triggered = null;
			let args      = [ id, {
				x: position.x - this.offset.x,
				y: position.y - this.offset.y
			}, delta ];


			let entity = this.getEntity(null, args[1]);
			if (entity !== null) {

				if (typeof entity.trigger === 'function') {

					args[1].x -= entity.position.x;
					args[1].y -= entity.position.y;

					let result = entity.trigger('touch', args);
					if (result === true) {
						triggered = entity;
					} else if (result !== false) {
						triggered = result;
					}

				}

			}


			if (triggered !== null) {

				if (triggered === this.getEntity('@joystick')) {

					triggered.trigger('focus');

					this.state = 'active';

					return this;

				} else if (triggered === this.getEntity('@button')) {

					triggered.trigger('focus');
					triggered.trigger('blur');

					return this;

				}

			} else {

				this.state = 'default';

				return null;

			}

		}, this);

		this.unbind('swipe');
		this.bind('swipe', function(id, state, position, delta, swipe) {

			if (this.visible === false) return null;


			let triggered = null;
			let args      = [ id, state, {
				x: position.x - this.offset.x,
				y: position.y - this.offset.y
			}, delta, swipe ];


			let entity = this.getEntity(null, args[2]);
			if (entity !== null) {

				if (typeof entity.trigger === 'function') {

					args[2].x -= entity.position.x;
					args[2].y -= entity.position.y;

					let result = entity.trigger('swipe', args);
					if (result === true) {
						triggered = entity;
					} else if (result !== false) {
						triggered = result;
					}

				}

			}


			if (triggered !== null) {

				this.state = 'active';

				return this;

			} else {

				this.getEntity('@joystick').trigger('blur');

				this.state = 'active';

				return false;

			}

		}, this);

		this.unbind('relayout');
		this.bind('relayout', function() {

			let entity = null;
			let x1     = -1 / 2 * this.width;
			let x2     =  1 / 2 * this.width;
			let y2     =  1 / 2 * this.height;


			let joystick_w = 0;
			let joystick_h = 0;

			entity            = this.getEntity('@joystick');
			joystick_w        = entity.width;
			joystick_h        = entity.height;
			entity.position.x = x1 + 16 + entity.width  / 2;
			entity.position.y = y2 - 16 - entity.height / 2;

			entity = this.getEntity('@button');
			entity.position.x = x2 - 16 - joystick_w / 2;
			entity.position.y = y2 - 16 - joystick_h / 2;

		}, this);


		this.bind('key', function(key, name, delta) {

			if (this.visible === false) return null;


			let args = [ key, name, delta ];

			if (key === 'space' || key === 'enter') {

				let button = this.getEntity('@button');

				button.trigger('focus');
				button.trigger('key', args);
				button.trigger('blur');

			} else if (key.match(/w|a|s|d/g) || key.startsWith('arrow')) {

				let joystick = this.getEntity('@joystick');

				joystick.trigger('focus');
				joystick.trigger('key', args);
				joystick.trigger('blur');

			}

		}, this);

		this.bind('reshape', function(orientation, rotation, width, height) {

			if (typeof width === 'number' && typeof height === 'number') {

				this.width  = width;
				this.height = height;

				this.trigger('relayout');

			}

		}, this);


		this.setEntity('@joystick', new _Joystick({
			width:  128,
			height: 128
		}));

		this.getEntity('@joystick').bind('change', function(value) {

			let direction = null;

			if (Math.abs(value.y) < 0.5) {

				if (Math.abs(value.x) > 0.5) {

					if (value.x > 0) direction = 'right';
					if (value.x < 0) direction = 'left';

				}

			} else {

				if (Math.abs(value.y) > 0.5) {

					if (value.y > 0) direction = 'bottom';
					if (value.y < 0) direction = 'top';

				}

			}


			if (direction !== null) {

				this.trigger('change', [{
					action:    'move',
					direction: direction
				}]);

			}

		}, this);

		this.setEntity('@button', new _Button({
			label:  'Shoot',
			value:  'shoot',
			width:  96,
			height: 64
		}));

		this.getEntity('@button').bind('change', function(value) {

			this.trigger('change', [{
				action:    'shoot',
				direction: null
			}]);

		}, this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Layer.prototype.serialize.call(this);
			data['constructor'] = 'game.ui.layer.Control';


			return data;

		}

	};


	return Composite;

});

