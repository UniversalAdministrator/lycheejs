
lychee.define('harvester.data.Git').requires([
	'harvester.data.Filesystem'
]).exports(function(lychee, global, attachments) {

	const _Filesystem = lychee.import('harvester.data.Filesystem');



	/*
	 * HELPERS
	 */

	const _parse_log = function(content) {

		return content.split('\n').map(function(line) {
			return line.substr(line.indexOf(' ') + 1).trim();
		}).filter(function(line) {
			return line !== '';
		}).map(function(line) {

			let hash = line.substr(0, line.indexOf(' '));
			line = line.substr(hash.length + 1);

			let name = line.substr(0, line.indexOf('<') - 1);
			line = line.substr(name.length + 1);

			let email = line.substr(1, line.indexOf('>') - 1);
			line = line.substr(email.length + 3);

			let timestamp = line.substr(0, line.indexOf('\t'));
			line = line.substr(timestamp.length + 1);

			let message = line.trim();


			return {
				hash:      hash,
				name:      name,
				email:     email,
				timestamp: timestamp,
				message:   message
			};

		});

	};


	const _get_log = function() {

		let development = _parse_log((this.filesystem.read('/logs/refs/remotes/origin/development') || '').toString('utf8'));
		let master      = _parse_log((this.filesystem.read('/logs/refs/remotes/origin/master')      || '').toString('utf8'));
		let branch      = _parse_log((this.filesystem.read('/logs/HEAD')                            || '').toString('utf8'));
		let diff        = branch.filter(function(commit) {

			let is_master = master.find(function(other) {
				return other.hash === commit.hash;
			});
			let is_development = development.find(function(other) {
				return other.hash === commit.hash;
			});

			if (is_master === false && is_development === false) {
				return true;
			}

			return false;

		});


		return {
			master:      master,
			development: development,
			branch:      branch,
			diff:        diff
		};

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(identifier) {

		identifier = typeof identifier === 'string' ? identifier : '';


		this.identifier = identifier;
		this.filesystem = new _Filesystem(identifier + '/.git');

	};


	Composite.STATUS = {
		ignore: 0,
		update: 1,
		manual: 2
	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let blob = {};


			if (this.filesystem !== null) blob.filesystem = lychee.serialize(this.filesystem);


			return {
				'constructor': 'harvester.data.Git',
				'arguments':   [ this.identifier ],
				'blob':        Object.keys(blob).length > 0 ? blob : null
			};

		},



		/*
		 * CUSTOM API
		 */

		info: function(path) {

			path = typeof path === 'string' ? path : null;


			// TODO: Find path in tree and return hash for it

		},

		report: function() {

			let head       = (this.filesystem.read('/HEAD')       || '').toString().trim();
			let fetch_head = (this.filesystem.read('/FETCH_HEAD') || '').toString().trim();
			let orig_head  = (this.filesystem.read('/ORIG_HEAD')  || '').toString().trim();
			let branch     = 'master';


			if (head.startsWith('ref: ')) {

				if (head.startsWith('ref: refs/heads/')) {
					branch = head.substr(16).trim();
				}

				let ref = this.filesystem.read('/' + head.substr(5));
				if (ref !== null) {
					head = ref.toString().trim();
				}

			}

			if (fetch_head.includes('\t')) {
				fetch_head = fetch_head.split('\t')[0];
			}


			let log    = _get_log.call(this);
			let status = Composite.STATUS.manual;

			if (log.length === 0) {

				if (head === fetch_head) {

					status = Composite.STATUS.ignore;

				} else {

					let check = log.development.find(function(other) {
						return other.hash === head;
					});

					if (check !== undefined) {
						status = Composite.STATUS.update;
					} else {
						status = Composite.STATUS.manual;
					}

				}


				// XXX: User broke their git history
				if (fetch_head !== orig_head) {
					status = Composite.STATUS.manual;
				}

			}


			return {
				branch: branch,
				status: status,
				head: {
					branch: head,
					fetch:  fetch_head,
					origin: orig_head
				},
				log: log
			};

		}

	};


	return Composite;

});

