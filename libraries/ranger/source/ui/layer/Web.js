
lychee.define('ranger.ui.layer.Web').includes([
	'lychee.ui.Layer'
]).requires([
	'lychee.ui.entity.Helper'
]).exports(function(lychee, global, attachments) {

	const _Helper = lychee.import('lychee.ui.entity.Helper');
	const _Layer  = lychee.import('lychee.ui.Layer');



	/*
	 * HELPERS
	 */

	const _on_relayout = function() {

		let label = this.label;
		let value = this.value;

		if (label.length === value.length) {

			if (this.entities.length !== label.length) {

				this.entities = [];

				for (let l = 0, ll = label.length; l < ll; l++) {
					this.entities.push(new _Helper());
				}

			}


			let x1         = -1 / 2 * this.width;
			let y1         = -1 / 2 * this.height;
			let horizontal = this.width > this.height;
			let offset     = 0;


			for (let v = 0, vl = value.length; v < vl; v++) {

				let entity = this.entities[v];

				entity.setLabel(label[v]);
				entity.setValue(value[v]);


				if (horizontal === true) {

					entity.width      = 48;
					entity.position.x = x1 + offset + entity.width / 2;
					entity.position.y = 0;
					offset += entity.width + 8;

				} else {

					entity.width      = 48;
					entity.position.x = 0;
					entity.position.y = y1 + offset + entity.height / 2;
					offset += entity.height + 8;

				}

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);


		this.label = [];
		this.value = [];


		settings.relayout = false;


		_Layer.call(this, settings);

		settings = null;



		/*
		 * INITIALIZATION
		 */

		this.unbind('relayout');
		this.bind('relayout', _on_relayout, this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Layer.prototype.serialize.call(this);
			data['constructor'] = 'ranger.ui.layer.Web';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		setLabel: function(label) {

			label = label instanceof Array ? label : null;


			if (label !== null) {

				this.label = label.filter(function(val) {
					return '' + val;
				});
				this.trigger('relayout');


				return true;

			}


			return false;

		},

		setValue: function(value) {

			value = value instanceof Array ? value : null;


			if (value !== null) {

				this.value = value.filter(function(val) {
					return '' + val;
				});
				this.trigger('relayout');


				return true;

			}


			return false;

		}

	};


	return Composite;

});

