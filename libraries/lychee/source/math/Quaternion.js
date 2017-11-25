
lychee.define('lychee.math.Quaternion').requires([
	'lychee.math.Vector4'
]).exports(function(lychee, global, attachments) {

	const _Vector4 = lychee.import('lychee.math.Vector4');



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let settings = Object.assign({}, data);


		this.data = new Float32Array(4);
		this.set.call(this, Composite.IDENTITY);


		this.setData(settings.data);

		settings = null;

	};


	Composite.IDENTITY = new Float32Array([
		0, 0, 0, 1
	]);


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let settings = {};


			if (this.data !== null) settings.data = this.data.slice(0);


			return {
				'constructor': 'lychee.math.Quaternion',
				'arguments':   [ settings ],
				'blob':        null
			};

		},



		/*
		 * CUSTOM API
		 */

		clone: function() {

			return new Composite(this.data.slice(0));

		},

		copy: function(quaternion) {

			quaternion = quaternion instanceof Composite ? quaternion : null;


			if (quaternion !== null) {

				let d = this.data;
				let q = quaternion.data;


				q[0] = d[0];
				q[1] = d[1];
				q[2] = d[2];
				q[3] = d[3];

			}


			return this;

		},

		set: function(x, y, z, w) {

			x = typeof x === 'number' ? x : 0;
			y = typeof y === 'number' ? y : 0;
			z = typeof z === 'number' ? z : 0;
			w = typeof w === 'number' ? w : 0;


			let d = this.data;


			d[0] = x;
			d[1] = y;
			d[2] = z;
			d[3] = w;


			return this;

		},

		add: function(quaternion) {

			quaternion = quaternion instanceof Composite ? quaternion : null;


			if (quaternion !== null) {

				let d = this.data;
				let q = quaternion.data;


				d[0] += q[0];
				d[1] += q[1];
				d[2] += q[2];
				d[3] += q[3];

			}


			return this;

		},

		subtract: function(quaternion) {

			quaternion = quaternion instanceof Composite ? quaternion : null;


			if (quaternion !== null) {

				let d = this.data;
				let q = quaternion.data;


				d[0] -= q[0];
				d[1] -= q[1];
				d[2] -= q[2];
				d[3] -= q[3];

			}


			return this;

		},

		multiply: function(quaternion) {

			quaternion = quaternion instanceof Composite ? quaternion : null;


			if (quaternion !== null) {

				let d = this.data;
				let q = quaternion.data;

				let ax = d[0], ay = d[1], az = d[2], aw = d[3];
				let bx = q[0], by = q[1], bz = q[2], bw = q[3];


				d[0] = ax * bw + aw * bx + ay * bz - az * by;
				d[1] = ay * bw + aw * by + az * bx - ax * bz;
				d[2] = az * bw + aw * bz + ax * by - ay * bx;
				d[3] = aw * bw - ax * bx - ay * by - az * bz;

			}


			return this;

		},

		min: function(quaternion) {

			quaternion = quaternion instanceof Composite ? quaternion : null;


			if (quaternion !== null) {

				let d = this.data;
				let q = quaternion.data;


				d[0] = Math.min(d[0], q[0]);
				d[1] = Math.min(d[1], q[1]);
				d[2] = Math.min(d[2], q[2]);
				d[3] = Math.min(d[3], q[3]);

			}


			return this;

		},

		max: function(quaternion) {

			quaternion = quaternion instanceof Composite ? quaternion : null;


			if (quaternion !== null) {

				let d = this.data;
				let q = quaternion.data;


				d[0] = Math.max(d[0], q[0]);
				d[1] = Math.max(d[1], q[1]);
				d[2] = Math.max(d[2], q[2]);
				d[3] = Math.max(d[3], q[3]);

			}


			return this;

		},

		scale: function(scale) {

			scale = typeof scale === 'number' ? scale : null;


			if (scale !== null) {

				let d = this.data;


				d[0] *= scale;
				d[1] *= scale;
				d[2] *= scale;
				d[3] *= scale;

			}


			return this;

		},

		length: function() {

			let d = this.data;
			let x = d[0];
			let y = d[1];
			let z = d[2];
			let w = d[3];


			return Math.sqrt(x * x + y * y + z * z + w * w);

		},

		squaredLength: function() {

			let d = this.data;
			let x = d[0];
			let y = d[1];
			let z = d[2];
			let w = d[3];


			return (x * x + y * y + z * z + w * w);

		},

		invert: function() {

			let d = 0;
			let x = d[0];
			let y = d[1];
			let z = d[2];
			let w = d[3];


			let dot = (x * x + y * y + z * z + w * w);
			if (dot > 0) {

				let inv_dot = 1.0 / dot;

				d[0] = -x * inv_dot;
				d[1] = -y * inv_dot;
				d[2] = -z * inv_dot;
				d[3] =  w * inv_dot;

			}


			return this;

		},

		normalize: function() {

			let d = this.data;
			let x = d[0];
			let y = d[1];
			let z = d[2];
			let w = d[3];


			let length = (x * x + y * y + z * z + w * w);
			if (length > 0) {

				length = 1 / Math.sqrt(length);

				d[0] *= length;
				d[1] *= length;
				d[2] *= length;
				d[3] *= length;

			}


			return this;

		},

		scalar: function(quaternion) {

			quaternion = quaternion instanceof Composite ? quaternion : null;


			if (quaternion !== null) {

				let d = this.data;
				let q = quaternion.data;


				return (d[0] * q[0] + d[1] * q[1] + d[2] * q[2] + d[3] * q[3]);

			}


			return 0;

		},

		interpolate: function(vector, t) {

			vector = vector instanceof _Vector4 ? vector : null;
			t      = typeof t === 'number'      ? t      : null;


			if (vector !== null && t !== null) {

				let d = this.data;


				d[0] += t * (vector.x - d[0]);
				d[1] += t * (vector.y - d[1]);
				d[2] += t * (vector.z - d[2]);
				d[3] += t * (vector.w - d[3]);

			}


			return this;

		},

		interpolateAdd: function(vector, t) {

			vector = vector instanceof _Vector4 ? vector : null;
			t      = typeof t === 'number'      ? t      : null;


			if (vector !== null && t !== null) {

				let d = this.data;


				d[0] += t * vector.x;
				d[1] += t * vector.y;
				d[2] += t * vector.z;
				d[3] += t * vector.w;

			}


			return this;

		},

		interpolateSet: function(vector, t) {

			vector = vector instanceof _Vector4 ? vector : null;
			t      = typeof t === 'number'      ? t      : null;


			if (vector !== null && t !== null) {

				let d = this.data;


				d[0] = t * vector.x;
				d[1] = t * vector.y;
				d[2] = t * vector.z;
				d[3] = t * vector.w;

			}


			return this;

		},

		rotateX: function(radian) {

			radian = typeof radian === 'number' ? radian : null;


			if (radian !== null) {

				let sin = Math.sin(radian * 0.5);
				let cos = Math.cos(radian * 0.5);

				let d = this.data;
				let x = d[0];
				let y = d[1];
				let z = d[2];
				let w = d[3];


				d[0] = x * cos + w * sin;
				d[1] = y * cos + z * sin;
				d[2] = z * cos - y * sin;
				d[3] = w * cos - x * sin;

			}


			return this;

		},

		rotateY: function(radian) {

			radian = typeof radian === 'number' ? radian : null;


			if (radian !== null) {

				let sin = Math.sin(radian * 0.5);
				let cos = Math.cos(radian * 0.5);

				let d = this.data;
				let x = d[0];
				let y = d[1];
				let z = d[2];
				let w = d[3];


				d[0] = x * cos - z * sin;
				d[1] = y * cos + w * sin;
				d[2] = z * cos + x * sin;
				d[3] = w * cos - y * sin;

			}


			return this;

		},

		rotateZ: function(radian) {

			radian = typeof radian === 'number' ? radian : null;


			if (radian !== null) {

				let sin = Math.sin(radian * 0.5);
				let cos = Math.cos(radian * 0.5);

				let d = this.data;
				let x = d[0];
				let y = d[1];
				let z = d[2];
				let w = d[3];


				d[0] = x * cos + y * sin;
				d[1] = y * cos - x * sin;
				d[2] = z * cos + w * sin;
				d[3] = w * cos - z * sin;

			}


			return this;

		},

		rotateAxis: function(vector, radian) {

			vector = vector instanceof _Vector4 ? vector : null;
			radian = typeof radian === 'number' ? radian : null;


			if (vector !== null && radian !== null) {

				let sin = Math.sin(radian * 0.5);
				let cos = Math.cos(radian * 0.5);

				let d = this.data;


				d[0] = sin * vector.x;
				d[1] = sin * vector.y;
				d[2] = sin * vector.z;
				d[3] = cos;

			}


			return this;

		},

		calculateW: function() {

			let d = this.data;
			let x = d[0];
			let y = d[1];
			let z = d[2];


			d[3] = -Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z));


			return this;

		},

		setData: function(data) {

			data = data instanceof Array ? data : null;


			if (data !== null) {

				this.set.call(this, data);

				return true;

			}


			return false;

		}

	};


	return Composite;

});

