
lychee.specify('lychee.Definition').exports(function(lychee, sandbox) {

	const _Definition = lychee.import('lychee.Definition');
	const _Config     = lychee.import('Config');
	const _Font       = lychee.import('Font');
	const _Music      = lychee.import('Music');
	const _Sound      = lychee.import('Sound');
	const _Texture    = lychee.import('Texture');
	const _Stuff      = lychee.import('Stuff');



	/*
	 * TESTS
	 */

	sandbox.setSettings({
		id:  'sandbox.foo.bar.Qux',
		url: '/tmp/sandbox/source/foo/bar/Qux.js',
		attaches: {
			json: new Config(),
			fnt:  new Font(),
			snd:  new Sound()
		}
	});

	sandbox.setProperty('id', function(assert, expect) {

		let id    = 'sandbox.foo.Bar';
		let check = 'not.Allowed$';

		assert(this.id, sandbox.settings.id);

		assert(this.setId(id), true);
		assert(this.id,        id);

		assert(this.setId(check), false);
		assert(this.id,           id);

	});

	sandbox.setProperty('url', function(assert, expect) {

		let url = '/tmp/sandbox/source/foo/Bar.js';

		assert(this.url, '/tmp/sandbox/source/foo/bar/Qux.js');

		assert(this.setUrl(url), true);
		assert(this.url,         url);

		assert(this.setId(''), true);
		assert(this.id,        'sandbox.foo.Bar');

	});

	sandbox.setMethod('attaches', function(assert, expect) {

		let config = new _Config();


		assert(this._attaches.json instanceof _Config, true);
		assert(this._attaches.json === config,         false);

		assert(this.attaches({
			json: config
		}), true);

		assert(this._attaches.json, config);


		expect(assert => {

			this.export(function(lychee, global, attachments) {
				assert(attachments['msc'], config);
			});

		});

	});

});

