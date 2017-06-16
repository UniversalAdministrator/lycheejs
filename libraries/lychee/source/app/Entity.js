
lychee.define('lychee.app.Entity').exports(function(lychee, global, attachments) {

	/*
	 * HELPERS
	 */

	const _sphere_sphere = function(a, b) {

		let dx  = Math.sqrt(Math.pow(b.position.x - a.position.x, 2));
		let dy  = Math.sqrt(Math.pow(b.position.y - a.position.y, 2));
		let dz  = Math.sqrt(Math.pow(b.position.z - a.position.z, 2));

		let rxy = 0;
		let rxz = 0;

		if (a.shape === Composite.SHAPE.sphere) {
			rxy += a.radius;
			rxz += a.radius;
		}

		if (b.shape === Composite.SHAPE.sphere) {
			rxy += b.radius;
			rxz += b.radius;
		}

		return ((dx + dy) <= rxy && (dx + dz) <= rxz);

	};

	const _sphere_cuboid = function(a, b) {

		let r  = a.radius;
		let hw = b.width  / 2;
		let hh = b.height / 2;
		let hd = b.depth  / 2;

		let ax = a.position.x;
		let ay = a.position.y;
		let az = a.position.z;

		let bx = b.position.x;
		let by = b.position.y;
		let bz = b.position.z;

		let colx = (ax + r >= bx - hw) && (ax - r <= bx + hw);
		let coly = (ay + r >= by - hh) && (ay - r <= by + hh);

		if (a.shape === Composite.SHAPE.circle) {
			r = 0;
		}

		let colz = (az + r >= bz - hd) && (az - r <= bz + hd);

		return (colx && coly && colz);

	};

	const _cuboid_cuboid = function(a, b) {

		let dx = Math.abs(b.position.x - a.position.x);
		let dy = Math.abs(b.position.y - a.position.y);
		let dz = Math.abs(b.position.z - a.position.z);

		let hw = (a.width  + b.width)  / 2;
		let hh = (a.height + b.height) / 2;
		let hd = (a.depth  + b.depth)  / 2;

		return (dx <= hw && dy <= hh && dz <= hd);

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);


		this.width  = typeof settings.width === 'number'  ? settings.width  : 0;
		this.height = typeof settings.height === 'number' ? settings.height : 0;
		this.depth  = typeof settings.depth === 'number'  ? settings.depth  : 0;
		this.radius = typeof settings.radius === 'number' ? settings.radius : 0;

		this.alpha     = 1;
		this.collision = Composite.COLLISION.none;
		this.effects   = [];
		this.shape     = Composite.SHAPE.rectangle;
		this.state     = 'default';
		this.states    = { 'default': null };
		this.position  = { x: 0, y: 0, z: 0 };
		this.velocity  = { x: 0, y: 0, z: 0 };


		this.setAlpha(settings.alpha);
		this.setCollision(settings.collision);
		this.setShape(settings.shape);
		this.setStates(settings.states);
		this.setState(settings.state);
		this.setPosition(settings.position);
		this.setVelocity(settings.velocity);


		settings = null;

	};


	// Same ENUM values as lychee.ui.Entity
	Composite.COLLISION = {
		none: 0,
		A:    1,
		B:    2,
		C:    3,
		D:    4
	};


	// Same ENUM values as lychee.ui.Entity
	Composite.SHAPE = {
		circle:    0,
		rectangle: 1,
		sphere:    2,
		cuboid:    3
	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let settings = {};


			if (this.width  !== 0) settings.width  = this.width;
			if (this.height !== 0) settings.height = this.height;
			if (this.depth  !== 0) settings.depth  = this.depth;
			if (this.radius !== 0) settings.radius = this.radius;

			if (this.alpha !== 1)                            settings.alpha     = this.alpha;
			if (this.collision !== Composite.COLLISION.none) settings.collision = this.collision;
			if (this.shape !== Composite.SHAPE.rectangle)    settings.shape     = this.shape;
			if (this.state !== 'default')                    settings.state     = this.state;
			if (Object.keys(this.states).length > 1)         settings.states    = this.states;


			if (this.position.x !== 0 || this.position.y !== 0 || this.position.z !== 0) {

				settings.position = {};

				if (this.position.x !== 0) settings.position.x = this.position.x;
				if (this.position.y !== 0) settings.position.y = this.position.y;
				if (this.position.z !== 0) settings.position.z = this.position.z;

			}


			if (this.velocity.x !== 0 || this.velocity.y !== 0 || this.velocity.z !== 0) {

				settings.velocity = {};

				if (this.velocity.x !== 0) settings.velocity.x = this.velocity.x;
				if (this.velocity.y !== 0) settings.velocity.y = this.velocity.y;
				if (this.velocity.z !== 0) settings.velocity.z = this.velocity.z;

			}


			return {
				'constructor': 'lychee.app.Entity',
				'arguments':   [ settings ],
				'blob':        null
			};

		},

		render: function(renderer, offsetX, offsetY) {

			let effects = this.effects;
			for (let e = 0, el = effects.length; e < el; e++) {
				effects[e].render(renderer, offsetX, offsetY);
			}

		},

		update: function(clock, delta) {

			let velocity = this.velocity;

			if (velocity.x !== 0 || velocity.y !== 0 || velocity.z !== 0) {

				let x = this.position.x;
				let y = this.position.y;
				let z = this.position.z;


				let vt = delta / 1000;

				if (velocity.x !== 0) {
					x += velocity.x * vt;
				}

				if (velocity.y !== 0) {
					y += velocity.y * vt;
				}

				if (velocity.z !== 0) {
					z += velocity.z * vt;
				}


				this.position.x = x;
				this.position.y = y;
				this.position.z = z;

			}


			let effects = this.effects;
			for (let e = 0, el = effects.length; e < el; e++) {

				let effect = effects[e];
				if (effect.update(this, clock, delta) === false) {
					this.removeEffect(effect);
					el--;
					e--;
				}

			}

		},



		/*
		 * CUSTOM API
		 */

		isAtPosition: function(position) {

			position = position instanceof Object ? position : null;


			if (position !== null) {

				if (typeof position.x === 'number' && typeof position.y === 'number') {

					let ax = position.x;
					let ay = position.y;
					let az = position.z;
					let bx = this.position.x;
					let by = this.position.y;
					let bz = this.position.z;


					let shape = this.shape;
					if (shape === Composite.SHAPE.circle) {

						let dist = Math.sqrt(Math.pow(ax - bx, 2) + Math.pow(ay - by, 2));
						if (dist < this.radius) {
							return true;
						}

					} else if (shape === Composite.SHAPE.sphere) {

						let dist = Math.sqrt(Math.pow(ax - bx, 2) + Math.pow(ay - by, 2) + Math.pow(az - bz, 2));
						if (dist < this.radius) {
							return true;
						}

					} else if (shape === Composite.SHAPE.rectangle) {

						let hwidth  = this.width  / 2;
						let hheight = this.height / 2;
						let colX    = (ax >= bx - hwidth)  && (ax <= bx + hwidth);
						let colY    = (ay >= by - hheight) && (ay <= by + hheight);


						return colX && colY;

					} else if (shape === Composite.SHAPE.cuboid) {

						let hwidth  = this.width  / 2;
						let hheight = this.height / 2;
						let hdepth  = this.depth  / 2;
						let colX    = (ax >= bx - hwidth)  && (ax <= bx + hwidth);
						let colY    = (ay >= by - hheight) && (ay <= by + hheight);
						let colZ    = (az >= bz - hdepth)  && (az <= bz + hdepth);


						return colX && colY && colZ;

					}

				}

			}


			return false;

		},

		collidesWith: function(entity) {

			entity = lychee.interfaceof(lychee.app.Entity, entity) ? entity : null;


			if (entity !== null) {

				let none = Composite.COLLISION.none;
				if (this.collision !== entity.collision || this.collision === none || entity.collision === none) {
					return false;
				}


				let circle    = Composite.SHAPE.circle;
				let sphere    = Composite.SHAPE.sphere;
				let rectangle = Composite.SHAPE.rectangle;
				let cuboid    = Composite.SHAPE.cuboid;

				let shapeA    = this.shape;
				let shapeB    = entity.shape;

				let issphereA = shapeA === circle    || shapeA === sphere;
				let issphereB = shapeB === circle    || shapeB === sphere;
				let iscuboidA = shapeA === rectangle || shapeA === cuboid;
				let iscuboidB = shapeB === rectangle || shapeB === cuboid;

				if (issphereA && issphereB) {
					return _sphere_sphere(this, entity);
				} else if (iscuboidA && iscuboidB) {
					return _cuboid_cuboid(this, entity);
				} else if (issphereA && iscuboidB) {
					return _sphere_cuboid(this, entity);
				} else if (iscuboidA && issphereB) {
					return _sphere_cuboid(entity, this);
				}

			}


			return false;

		},

		setAlpha: function(alpha) {

			alpha = typeof alpha === 'number' ? alpha : null;


			if (alpha !== null) {

				this.alpha = Math.min(Math.max(alpha, 0), 1);

				return true;

			}


			return false;

		},

		setCollision: function(collision) {

			collision = lychee.enumof(Composite.COLLISION, collision) ? collision : null;


			if (collision !== null) {

				this.collision = collision;

				return true;

			}


			return false;

		},

		addEffect: function(effect) {

			effect = effect instanceof Object && typeof effect.update === 'function' ? effect : null;


			if (effect !== null) {

				let index = this.effects.indexOf(effect);
				if (index === -1) {

					this.effects.push(effect);

					return true;

				}

			}


			return false;

		},

		removeEffect: function(effect) {

			effect = effect instanceof Object && typeof effect.update === 'function' ? effect : null;


			if (effect !== null) {

				let index = this.effects.indexOf(effect);
				if (index !== -1) {

					this.effects.splice(index, 1);

					return true;

				}

			}


			return false;

		},

		removeEffects: function() {

			let effects = this.effects;

			for (let e = 0, el = effects.length; e < el; e++) {

				effects[e].update(this, Infinity, 0);
				this.removeEffect(effects[e]);

				el--;
				e--;

			}


			return true;

		},

		setPosition: function(position) {

			position = position instanceof Object ? position : null;


			if (position !== null) {

				this.position.x = typeof position.x === 'number' ? position.x : this.position.x;
				this.position.y = typeof position.y === 'number' ? position.y : this.position.y;
				this.position.z = typeof position.z === 'number' ? position.z : this.position.z;

				return true;

			}


			return false;

		},

		setShape: function(shape) {

			shape = lychee.enumof(Composite.SHAPE, shape) ? shape : null;


			if (shape !== null) {

				this.shape = shape;

				return true;

			}


			return false;

		},

		setStates: function(states) {

			states = states instanceof Object ? states : null;


			if (states !== null) {

				this.states = {
					'default': null
				};

				for (let id in states) {

					if (states.hasOwnProperty(id)) {

						let state = states[id];
						if (state instanceof Object) {
							this.states[id] = states[id];
						}

					}

				}

				return true;

			}


			return false;

		},

		setState: function(id) {

			id = typeof id === 'string' ? id : null;


			if (id !== null && this.states[id] !== undefined) {

				this.state = id;

				return true;

			}


			return false;

		},

		setVelocity: function(velocity) {

			velocity = velocity instanceof Object ? velocity : null;


			if (velocity !== null) {

				this.velocity.x = typeof velocity.x === 'number' ? velocity.x : this.velocity.x;
				this.velocity.y = typeof velocity.y === 'number' ? velocity.y : this.velocity.y;
				this.velocity.z = typeof velocity.z === 'number' ? velocity.z : this.velocity.z;

				return true;

			}


			return false;

		}

	};


	return Composite;

});

