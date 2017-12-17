
lychee.specify('lychee.Definition').exports(function(lychee, sandbox) {

	const _Definition = lychee.import('lychee.Definition');
	const _Config     = lychee.import('Config');
	const _Font       = lychee.import('Font');
	const _Music      = lychee.import('Music');
	const _Sound      = lychee.import('Sound');
	const _Texture    = lychee.import('Texture');
	const _Stuff      = lychee.import('Stuff');


	sandbox.add('id', 12, function(expect, await) {

		let id1 = 'foo.Bar';
		let id2 = 'foo.bar.Qux';

		let def1 = new lychee.Definition();
		let def2 = new lychee.Definition({
			id: id1
		});

		expect(def1.id,                    '');
		expect(def1.setId(''),             false);
		expect(def1.setId('not.$Allowed'), false);
		expect(def1.setId(id1),            true);
		expect(def1.id,                    id1);
		expect(def1.setId(id2),            true);
		expect(def1.id,                    id2);

		expect(def2.id,                    id1);
		expect(def2.setId(''),             false);
		expect(def2.setId('not.$Allowed'), false);
		expect(def2.setId(id2),            true);
		expect(def2.id,                    id2);

	});

	sandbox.add('url', 17, function(expect, await) {

		let prefix = lychee.environment.packages.find(function(pkg) {
			return pkg.id === 'sandbox';
		}) || '/tmp/sandbox';

		let url1 = prefix + '/source/foo/Bar.js';
		let url2 = prefix + '/source/foo/bar/Qux.js';

		let def1 = new lychee.Definition();
		let def2 = new lychee.Definition({
			url: url1
		});

		expect(def1.id, '');
		expect(def1.url, null);
		expect(def1.setUrl(''), false);
		expect(def1.setUrl(url1), true);
		expect(def1.url,          url1);
		expect(def1.setId(''),    true);
		expect(def1.id,           'sandbox.foo.Bar');
		expect(def1.setUrl(url2), true);
		expect(def1.setId(''),    true);
		expect(def1.id,           'sandbox.foo.bar.Qux');

		expect(def2.id,           'sandbox.foo.Bar');
		expect(def2.url,          url1);
		expect(def2.setUrl(''),   true);
		expect(def2.url,          '');
		expect(def2.setUrl(url2), true);
		expect(def2.setId(''),    true);
		expect(def2.id,           'sandbox.foo.bar.Qux');

	});


	sandbox.add('attaches()', 6, function(expect, await) {

		let definition = new lychee.Definition({
			id: 'Dummy'
		});


		let config = new Config();

		config.onload = function() {

			definition.attaches({
				'json': config
			});

			definition.exports(function(lychee, global, attachments) {
				expect(attachments['msc'], config);
			});

			definition.export(sandbox);

		};

		config.load();


		let font = new Font();

		font.onload = function() {

			definition.attaches({
				'fnt': font
			});

			definition.exports(function(lychee, global, attachments) {
				expect(attachments['msc'], config);
			});

			definition.export(sandbox);

		};

		font.load();


		let music = new Music();

		music.onload = function() {

			definition.attaches({
				'msc': music
			});

			definition.exports(function(lychee, global, attachments) {
				expect(attachments['msc'], music);
			});

			definition.export(sandbox);

		};

		music.load();


		let sound = new Sound();

		sound.onload = function() {

			definition.attaches({
				'snd': sound
			});

			definition.exports(function(lychee, global, attachments) {
				expect(attachments['snd'], sound);
			});

			definition.export(sandbox);

		};

		sound.load();


		let texture = new Texture();

		texture.onload = function() {

			definition.attaches({
				'png': texture
			});

			definition.exports(function(lychee, global, attachments) {
				expect(attachments['png'], texture);
			});

			definition.export(sandbox);

		};


		let stuff = new Stuff();

		stuff.onload = function() {

			definition.attaches({
				'foo.js': stuff
			});

			definition.exports(function(lychee, global, attachments) {
				expect(attachments['foo.js'], stuff);
			});

			definition.export(sandbox);

		};

		stuff.load();

	});

});

