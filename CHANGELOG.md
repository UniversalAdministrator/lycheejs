
# lychee.js CHANGELOG

All lychee.js versions are released in a quarterly release cycle.

At the end of each quarter, a new release is automatically 
generated, tagged and pushed to GitHub.

We do NOT use semantic versioning as it is assumed to always use
at least the latest quarterly release on the `master` branch or
the `development` branch.

As we cannot influence decisions of our Artificial Intelligence,
some things might break temporarily on the `development` and
`humansneednotapply` branch.

The update behaviour is changed as explained in the
[RELEASE Guide](./guides/RELEASE.md). All entries in the changelog
are listed in this specific order: `changed`, `removed`, `added`
and `fixed`.


## [2017-Q4] - UNRELEASED

- Added: `lychee.blobof(template, blob)` to allow validation of deserializations without memory usage.


## [2017-Q3] - 2017-09-28

- **Changed**: harvester.mod.Harvester supports proper git flow.
- **Changed**: lychee.Definition supports Composite syntax.
- **Removed**: Legacy Cultivator Projects.
- **Added**: lychee.js Strainer supports Static Code Analysis, Memory Tracing and Knowledge Tracing.
- Changed: lychee.codec.BENCODE support special primitives (undefined, Infinity, NaN).
- Changed: lychee.codec.BITON supports special primitives (undefined, Infinity, NaN).
- Changed: lychee.codec.JSON support special primitives (undefined, Infinity, NaN).
- Added: lychee.js Helper supports cached builds.
- Fixed: Harvester Mods use sandboxed node.js binaries.
- Fixed: lychee.ai.bnn.Brain correctly boosts gradients.


## [2017-Q2] - 2017-06-28

- **Changed**: Libraries and Projects refactor to match lychee.js Strainer's expectations.
- **Changed**: lychee.js Strainer supports mutations, traces and dynamic memory lookups.
- **Changed**: All helper scripts support `--autocomplete` syntax.
- **Changed**: lychee.js Harvester synchronizes platform tags.
- **Added**: lychee.js Harvester supports `git fetch` and `git checkout`.
- **Added**: lychee.js Studio supports Font and Sprite generation.
- **Added**: lychee.js Helper supports bash autocompletion.
- **Added**: Integration of `nidium` platform.
- Changed: lychee.app.Entity supports `setStates()` method.
- Changed: lychee.ui.Entity supports `setStates()` method.
- Changed: lychee.app.State `query()` handles invalid queries correctly.
- Changed: lychee.Renderer `drawBuffer()` handles `map` and rotations.
- Changed: lychee.net.protocol.WS detects fragments dynamically.
- Removed: lychee.app.Entity deprecates `getStateMap()` method.
- Removed: lychee.ui.Entity deprecates `getStateMap()` method.
- Removed: lychee.app.Sprite deprecates `getMap()` method.
- Removed: lychee.ui.Sprite deprecates `getMap()` method.
- Added: lychee.js Fertilizer supports `*/target` and `platform/*` syntax.
- Added: lychee.js Strainer supports `quickfix mode` syntax.
- Added: lychee.app.Main supports auto-sync of Stash and Storage instances.
- Added: Project Immune as an RTS Game demo.
- Added: lychee.app.Layer `query()` method.
- Added: `lychee.data.tree` Stack implementation.
- Fixed: `lychee.inject()` and `lychee.define()` supports proper mappings of packages.
- Fixed: `lychee.ui.entity.Upload` supports file dialog correctly (Browser-Bug).
- Fixed: `Font.prototype.measure()` improves cache usage and temporary usage.


## [2017-Q1] - 2017-03-28

- **Changed**: Each Project and Library can have binaries (`./bin`).
- **Changed**: All helper scripts support the `LYCHEEJS_ROOT` environment variable.
- **Added**: lychee.js Helper supports `run:platform/identifier` syntax.
- **Added**: lychee.js Legacy Library as `/libraries/legacy`.
- **Fixed**: `lychee.app.Sprite` and `lychee.ui.Sprite` renders effects correctly.
- Changed: Project Pong refactor to fit AI-relevant requirements.
- Added: `lychee.ai` Stack refactor to fit `NEAT` requirements.
- Added: `lychee.policy` Stack implements feature vectorization adapters.
- Added: Project Pong-BNN as a Backpropagated NN demo.
- Added: Project Flappy-ENN as an Evolutionary NN demo.
- Added: lychee.js Harvester synchronizes to `harvester.artificial.engineering`.
- Added: lychee.js Harvester beautifies JSON files.
- Fixed: `lychee.Stash` creates recursive directories correctly.
- Fixed: `html` platform plays `Music` and `Sound` correctly via (new) Promise API.


## [2016-Q4] - 2016-12-28

- **Changed**: `lychee.Environment.__FEATURES` represents Feature Prediction (by `bootstrap.js`).
- **Added**: `lychee.assimilate(target)` to include non-packaged non-lychee Assets and Implementations.
- Changed: ES6 Migration for integration scripts (`./bin`).
- Changed: Performance improvements for `lychee.interfaceof` using a cache.
- Added: lychee.js Strainer supports ESLint and automated code-refactoring features.
- Added: lychee.js Strainer understands `Callback`, `Composite` or `Module` API.
- Added: lychee.js Harvester uses a Watcher and faster bootup cycle.
- Added: `lychee.ai.enn` Stack implements a feed-forward NN architecture.
- Added: `lychee.ai.bnn` Stack implements a backpropagated NN architecture.
- Fixed: lychee.js Fertilizer supports `html` Application Cache manifests.
- Fixed: lychee.app.Main `changeState()` handles invalid states correctly.
- Fixed: `html-nwjs` platform has correct peer-to-peer Networking.


## [2016-Q3] - 2016-09-28

- Changed: Integration of [@humansneednotapply](https://github.com/humansneednotapply) Account.
- Changed: Integration of `.github/TOKEN` file.
- Changed: License to MIT/GPL3/CC4-BY-SA.
- Changed: New Welcome Page for easier Project-based workflow.
- Removed: fyto.js was deprecated, lycheejs-legacy is embraced.
- Added: lychee.js Editor allows `project` changes.
- Fixed: lychee.ui Entities.
- Fixed: lychee.effect Stack is completely delay-compatible.


## [2016-Q2] - 2016-06-27

- **Changed**: ES6 Migration for all lychee.js Definitions (`/libraries` and `/projects`).
- Changed: lychee.js Harvester uses event/socket-driven API.
- Changed: lychee.Definition sandbox with Feature Detection.
- Changed: lychee.Environment sandbox with Feature Prediction.
- Changed: lychee.js Harvester uses lychee.net.protocol.HTTP.
- Changed: lychee.js Ranger uses new Harvester API.
- Changed: lychee.codec Stack replaces lychee.data Stack.
- Added: Maintenance scripts (`/bin/maintenance/`).
- Added: lychee.js Fertilizer supports `html` Applications and Libraries.
- Added: lychee.js Breeder supports `init`, `fork` and `pull` actions.
- Added: lychee.ui Stack automates UI/UX Flow (Blueprint and Element).
- Added: lychee.net Stack supports all platform tags peer-to-peer.
- Added: lychee.Stash adapter allows Asset-compatible storage.
- Added: lychee.Storage adapter allows Key/Value storage.


## [2016-Q1] - 2016-03-25

- **Changed**: Migrated all Libraries to `/libraries` folder.
- **Changed**: Migrated all Projects to `/projects` folder.
- **Changed**: lychee.game renamed to lychee.app Stack.
- Changed: Renamed `sorbet` Project to lychee.js Harvester`.
- Changed: Project Lethalmaze as multiplayer tank game.
- Changed: Project Boilerplate is compatible with AI.
- Added: lychee.js Harvester is a reusable library and project.
- Added: GNU/Linux, OSX and BSD Development Host support.


## [2015-Q4] - 2015-11-30

- **Removed**: Windows Development Host support.
- Changed: Major Redesign of lychee.ui Stack.
- Changed: Better Guides to `/guides` folder.
- Added: Project Over-There (NASA hackathon).
- Added: Platform support for `node`, `html-nwjs` and `html-webview`.
- Added: lychee.ui and lychee.effect Stack.


# GIT CHANGELOG

- [Unreleased](https://github.com/Artificial-Engineering/lycheejs/compare/2017-Q3...HEAD)
- [2017-Q3](https://github.com/Artificial-Engineering/lycheejs/compare/2017-Q2...2017-Q3)
- [2017-Q2](https://github.com/Artificial-Engineering/lycheejs/compare/2017-Q1...2017-Q2)
- [2017-Q1](https://github.com/Artificial-Engineering/lycheejs/compare/2016-Q4...2017-Q1)
- [2016-Q4](https://github.com/Artificial-Engineering/lycheejs/compare/2016-Q3...2016-Q4)
- [2016-Q3](https://github.com/Artificial-Engineering/lycheejs/compare/2016-Q2...2016-Q3)
- [2016-Q2](https://github.com/Artificial-Engineering/lycheejs/compare/2016-Q1...2016-Q2)
- [2016-Q1](https://github.com/Artificial-Engineering/lycheejs/compare/2015-Q4...2016-Q1)
- [2015-Q4](https://github.com/Artificial-Engineering/lycheejs/compare/a285915ac5ac541b622fece52a039fbf2051f469...2015-Q4)

