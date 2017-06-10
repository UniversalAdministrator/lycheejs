
lychee.define('game.app.entity.Unit').requires([
	'lychee.effect.Color',
	'lychee.effect.Position'
]).includes([
	'lychee.app.Entity'
]).exports(function(lychee, global, attachments) {

	const _Color    = lychee.import('lychee.effect.Color');
	const _Entity   = lychee.import('lychee.app.Entity');
	const _Position = lychee.import('lychee.effect.Position');
	let   _id       = 0;
	const _PALETTE  = {
		immune:  '#32afe5',
		virus:   '#d0494b',
		neutral: '#efefef'
	};
	const _SOUNDS   = {
		attack: attachments["attack.snd"],
		move:   attachments["move.snd"]
	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);

		this.id     = 'unit-' + _id++;
		this.color  = _PALETTE.neutral;
		this.team   = 'neutral';
		this.damage = 0;
		this.health = 100;
		this.speed  = 100;

		this.__attacker = null;
		this.__enemy    = null;
		this.__health   = this.health;
		this.__wobble   = {
			start: null,
			x: 0,
			y: 0
		};


		this.setDamage(settings.damage);
		this.setHealth(settings.health);
		this.setSpeed(settings.speed);
		this.setTeam(settings.team);

		delete settings.damage;
		delete settings.health;
		delete settings.speed;
		delete settings.team;


		settings.collision = _Entity.COLLISION.A;
		settings.shape     = _Entity.SHAPE.circle;


		_Entity.call(this, settings);

		settings = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			if (typeof blob.attacker === 'string') {
				this.__attacker = blob.attacker;
			}

			if (typeof blob.health === 'number') {
				this.__health = blob.health;
			}

		},

		serialize: function() {

			let data = _Entity.prototype.serialize.call(this);
			data['constructor'] = 'game.app.entity.Unit';

			let settings = data['arguments'][0];
			let blob     = (data['blob'] || {});


			if (this.damage !== 0)       settings.damage = this.damage;
			if (this.health !== 100)     settings.health = this.health;
			if (this.speed !== 100)      settings.speed  = this.speed;
			if (this.team !== 'neutral') settings.team   = this.team;


			if (this.__attacker !== null) blob.attacker = this.__attacker;
			if (this.__health !== 100)    blob.health   = this.__health;


			data['arguments'][0] = settings;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},

		render: function(renderer, offsetX, offsetY) {

			let position = this.position;
			let radius   = this.radius;
			let wobble   = this.__wobble;
			let color    = this.color;


			renderer.drawCircle(
				position.x + wobble.x + offsetX,
				position.y + wobble.y + offsetY,
				radius,
				color,
				true
			);

		},

		update: function(clock, delta) {

			_Entity.prototype.update.call(this, clock, delta);


			let enemy = this.__enemy;
			let team  = this.team;

			if (enemy !== null) {

				if (enemy.health > 0) {

					let damage = delta * this.damage / 1000;
					if (!isNaN(damage)) {
						enemy.damage(team, damage);
					}

				} else if (enemy.team === team) {

					this.__enemy = null;

				}

			}


			let wobble = this.__wobble;
			if (wobble.start !== null) {

				let wt = (clock % 1000 / 300) + wobble.start;

				wobble.x = Math.sin(wt * Math.PI * 2);
				wobble.y = Math.cos(wt * Math.PI * 2);

			} else {

				wobble.start = clock;

			}

		},



		/*
		 * CUSTOM API
		 */

		attack: function(enemy) {

			enemy = enemy instanceof Object ? enemy : null;


			if (enemy !== null && this.effects.length === 0) {

				_SOUNDS.attack.play();
				this.__enemy = enemy;

				return true;

			}


			return false;

		},

		damage: function(team, damage) {

			team   = typeof team === 'string'   ? team         : null;
			damage = typeof damage === 'number' ? (damage | 0) : null;


			if (team !== null && damage !== null) {

				if (team !== this.team) {

					this.health     = Math.max(0, this.health - damage);
					this.__attacker = team;

					return true;

				}

			}


			return false;

		},

		move: function(position) {

			position = position instanceof Object ? position : null;


			if (position !== null && this.effects.length === 0) {

				let px = typeof position.x === 'number' ? position.x : this.position.x;
				let py = typeof position.y === 'number' ? position.y : this.position.y;
				let dx = px - this.position.x;
				let dy = py - this.position.y;


				let dist = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
				let time = 1000 * dist / this.speed;

				if (time !== Infinity && time > 0) {

					_SOUNDS.move.play();

					this.addEffect(new _Position({
						duration: time,
						position: {
							x: px,
							y: py
						}
					}));


					return true;

				}

			}


			return false;

		},

		stop: function() {

			this.__enemy = null;
			this.removeEffects();

			return true;

		},

		setDamage: function(damage) {

			damage = typeof damage === 'number' ? (damage | 0) : null;


			if (damage !== null) {

				this.damage = damage;

				return true;

			}


			return false;

		},

		setHealth: function(health) {

			health = typeof health === 'number' ? (health | 0) : null;


			if (health !== null) {

				this.health   = health;
				this.__health = health;

				return true;

			}


			return false;

		},

		setSpeed: function(speed) {

			speed = typeof speed === 'number' ? (speed | 0) : null;


			if (speed !== null) {

				this.speed = speed;

				return true;

			}


			return false;

		},

		setTeam: function(team) {

			team = typeof team === 'string' ? team : null;


			if (team !== null) {

				if (team !== this.team) {

					this.addEffect(new _Color({
						type:     _Color.TYPE.easeout,
						color:    _PALETTE[team],
						delay:    0,
						duration: 1000
					}));

				}

				this.team = team;



				return true;

			}


			return false;

		},

		isIdle: function() {

			if (this.__enemy === null && this.effects.length === 0) {
				return true;
			}


			return false;

		}

	};


	return Composite;

});

