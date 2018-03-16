
lychee.define('game.logic.Pathfinder').requires([
	'game.app.entity.Cell'
]).exports(function(lychee, global, attachments) {

	const _Cell = lychee.import('game.app.entity.Cell');



	/*
	 * IMPLEMENTATION
	 */

	const Module = {

		// deserialize: function() {},

		// deserialize: function(blob) {},

		serialize: function() {

			return {
				'reference': 'game.logic.Pathfinder',
				'arguments': []
			};

		},

		generate: function(entities) {

			entities = entities instanceof Array ? entities : null;


			let map = {
				paths:    {},
				vesicles: {}
			};

			if (entities !== null) {

				let cells = entities.filter(function(entity) {
					return entity instanceof _Cell;
				});


				cells.forEach(function(cella) {

					cells.filter(function(cell) {
						return cell !== cella;
					}).forEach(function(cellb) {

						let vesiclea = cella.getVesicle(null, cellb.position);
						let vesicleb = cellb.getVesicle(null, cella.position);

						if (vesiclea !== null && vesicleb !== null) {

							cells.filter(function(cell) {
								return cell !== cella && cell !== cellb;
							}).forEach(function(cell) {

								if (cell.collidesWith(vesiclea) === true) {
									vesiclea = null;
								}

								if (cell.collidesWith(vesicleb) === true) {
									vesicleb = null;
								}

							});

						}

						if (vesiclea !== null && vesicleb !== null) {

							if (map.vesicles[vesiclea.id] === undefined) {
								map.vesicles[vesiclea.id] = {
									position: {
										x: cella.position.x + vesiclea.position.x,
										y: cella.position.y + vesiclea.position.y
									},
									vesicle: vesiclea
								};
							}

							if (map.vesicles[vesicleb.id] === undefined) {
								map.vesicles[vesicleb.id] = {
									position: {
										x: cellb.position.x + vesicleb.position.x,
										y: cellb.position.y + vesicleb.position.y
									},
									vesicle: vesicleb
								};
							}


							if (map.paths[vesiclea.id] === undefined) {
								map.paths[vesiclea.id] = [ vesicleb.id ];
							} else if (map.paths[vesiclea.id].includes(vesicleb.id) === false) {
								map.paths[vesiclea.id].push(vesicleb.id);
							}

							if (map.paths[vesicleb.id] === undefined) {
								map.paths[vesicleb.id] = [ vesiclea.id ];
							} else if (map.paths[vesicleb.id].includes(vesiclea.id) === false) {
								map.paths[vesicleb.id].push(vesiclea.id);
							}

						}

					});

				});

			}

			return map;

		}

	};


	return Module;

});

