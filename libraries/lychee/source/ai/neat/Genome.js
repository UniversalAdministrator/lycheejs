
lychee.define('lychee.ai.neat.Genome').exports(function(lychee, global, attachments) {

	const _MAX_NODES     = 1000000;
	const _MUTATION_RATE = {
		bias:        0.4,
		connections: 0.25,
		links:       2.0,
		nodes:       0.5,
		steps:       0.1,
		// XXX: WTF?
		enable:      0.5,
		disable:     0.2
	};

	const _sigmoid = function(x) {
		return 2 / (1 + Math.exp(-4.9 * x)) - 1;
	};

	const _Neuron = function() {

		this.incoming = [];
		this.value    = 0.0;

	};


	const Composite = function(data) {

		let settings = Object.assign({}, data);

		// this.genes   = [];
		this.fitness = 0;
		this.adjustFitness = 0;
		// this.network = {};
		// this.maxneuron = 0;
		this.globalRank = 0;

		settings = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			return {
				'constructor': 'lychee.ai.neat.Genome',
				'arguments':   []
			};

		},



		/*
		 * CUSTOM API
		 */

		copyGenome: function() {

			let clone = new Composite();

			clone.genes     = this.genes.map(gene => gene.copyGene());
			clone.maxneuron = this.maxneuron;


			return clone;

		},

		randomNeuron: function(nonInput, inputs, outputs) {

			let neurons = [];

			if (nonInput === false) {

				inputs.forEach(function(input, i) {
					neurons.push(i);
				});

				this.genes.forEach(gene => {

					if (neurons.indexOf(gene.into) === -1) {
						neurons.push(gene.into);
					}

					if (neurons.indexOf(gene.out) === -1) {
						neurons.push(gene.out);
					}

				});

			} else {

				this.genes.forEach(gene => {

					if (neurons.indexOf(gene.into) === -1 && gene.into > inputs.length) {
						neurons.push(gene.into);
					}

					if (neurons.indexOf(gene.out) === -1 && gene.out > inputs.length) {
						neurons.push(gene.out);
					}

				});

			}

			outputs.forEach(function(output, o) {
				neurons.push(_MAX_NODES + o);
			});


			let neuron = neurons[(Math.random() * neurons.length) | 0] || null;
			if (neuron === null) {
				return neurons[0];
			}

			return neuron;

		}

	};


	return Composite;

});

