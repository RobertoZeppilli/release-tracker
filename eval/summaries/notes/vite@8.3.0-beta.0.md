### Features

* accept Rolldown watch options in `server.watch` ([#23133](https://github.com/vitejs/vite/issues/23133)) ([1b5cfe3](https://github.com/vitejs/vite/commit/1b5cfe3d3777d4ceb7f35fcee9d3c4279316a084))
* add closeServer and closePreviewServer hooks ([#23110](https://github.com/vitejs/vite/issues/23110)) ([e17d2d5](https://github.com/vitejs/vite/commit/e17d2d565b0288f169c7995adb2b192f917548e7))
* add top-level `tsconfig` option ([#23310](https://github.com/vitejs/vite/issues/23310)) ([93164c3](https://github.com/vitejs/vite/commit/93164c3530a7b4fc7bbedfb986d6afa9546cdef3))
* add warning for unsupported hooks in plugin returned from `applyToEnvironment` hook ([#23191](https://github.com/vitejs/vite/issues/23191)) ([fdef04f](https://github.com/vitejs/vite/commit/fdef04f112aadfea40ad3c448d96a49a04c168bd))
* **cli:** support naming the CPU profile via --profile [name] ([#23042](https://github.com/vitejs/vite/issues/23042)) ([a500dee](https://github.com/vitejs/vite/commit/a500deeb6f52d93ca501a0fc612a5392b939f2f5))
* **config:** warn on named imports from JSON modules ([#23378](https://github.com/vitejs/vite/issues/23378)) ([472385e](https://github.com/vitejs/vite/commit/472385e6ec4b21e3167c7abf9769883d1c9675f8))
* **css:** minify style tag ([#23183](https://github.com/vitejs/vite/issues/23183)) ([8156684](https://github.com/vitejs/vite/commit/8156684572bdcf73e9d8568ed67971f0467fab60))
* searched params attached to workers are now preserved ([#22280](https://github.com/vitejs/vite/issues/22280)) ([517b97f](https://github.com/vitejs/vite/commit/517b97f57ab9473e7417da856eb641d76870a56e))
* support subpath imports in dynamic import statements ([#23185](https://github.com/vitejs/vite/issues/23185)) ([b78e2f1](https://github.com/vitejs/vite/commit/b78e2f1bc1cba404c4bd9faf518d26ec85e89fc7))
* use `import.meta.ROLLDOWN_FILE_URL_*` for assets in JS ([#22888](https://github.com/vitejs/vite/issues/22888)) ([4366ac4](https://github.com/vitejs/vite/commit/4366ac468343252df6d5706361a6348afa66f9cc))
* use `import.meta.ROLLDOWN_FILE_URL_*` for other plugins ([#22894](https://github.com/vitejs/vite/issues/22894)) ([e38f29e](https://github.com/vitejs/vite/commit/e38f29ee48bea5ea3178faec5b78708e86f38afb))
* **worker:** remove worker chunk if it's detected that it's not referenced ([#22473](https://github.com/vitejs/vite/issues/22473)) ([924997a](https://github.com/vitejs/vite/commit/924997a4bdda9115faee9bdb622fcec4fc8357f0))

### Bug Fixes

* **config:** close bundles when generation fails ([#23256](https://github.com/vitejs/vite/issues/23256)) ([6bacc95](https://github.com/vitejs/vite/commit/6bacc956df5a76cc5653b9de4493453b953439fd))
* **css:** keep newline-separated srcset candidates intact ([#23265](https://github.com/vitejs/vite/issues/23265)) ([4f9d2f4](https://github.com/vitejs/vite/commit/4f9d2f4dadc83191200de7d2154c957a711e8c3d))
* **deps:** update all non-major dependencies ([#23337](https://github.com/vitejs/vite/issues/23337)) ([d550815](https://github.com/vitejs/vite/commit/d55081581ddd4d55667fef38e85d02ab7f879f15))
* **deps:** update all non-major dependencies ([#23404](https://github.com/vitejs/vite/issues/23404)) ([238ad81](https://github.com/vitejs/vite/commit/238ad811c7fb9e4730cbd317d0657867ed3447b3))
* **deps:** update rolldown-related dependencies ([#23338](https://github.com/vitejs/vite/issues/23338)) ([76e8082](https://github.com/vitejs/vite/commit/76e8082c56a2872dc8017c5672bc36cba8dcf75d))
* **deps:** update rolldown-related dependencies ([#23405](https://github.com/vitejs/vite/issues/23405)) ([b882566](https://github.com/vitejs/vite/commit/b88256607e3a051b7bcb0b338b3c4665926b55a8))
* **dev:** run closeBundle after buildEnd failure ([#23165](https://github.com/vitejs/vite/issues/23165)) ([8cb872e](https://github.com/vitejs/vite/commit/8cb872e7fb65b03f6068923c6aa7fcf3e71baf21))
* **hmr:** handle `import.meta.hot.invalidate` in virtual module ([#23171](https://github.com/vitejs/vite/issues/23171)) ([6162968](https://github.com/vitejs/vite/commit/616296895bd135386d35069a479a5f188c7de298))
* **utils:** handle dot in srcset density descriptor ([#23346](https://github.com/vitejs/vite/issues/23346)) ([b50e1b4](https://github.com/vitejs/vite/commit/b50e1b4a3d66128a4076e19769b2e29657985516))
* **utils:** match timestamp query parameter with proper delimiters ([#23364](https://github.com/vitejs/vite/issues/23364)) ([41f3c6f](https://github.com/vitejs/vite/commit/41f3c6fff88ade015669cac5c42db946e0b6f5c9))

### Miscellaneous Chores

* delete unused `PluginContainerOptions` ([#23382](https://github.com/vitejs/vite/issues/23382)) ([ee64401](https://github.com/vitejs/vite/commit/ee644014aab61e546742b862a7d7b0d6c7d67a7b))
* use oxfmt `sortImports` ([#23319](https://github.com/vitejs/vite/issues/23319)) ([97ad042](https://github.com/vitejs/vite/commit/97ad042170f4c71b518239723b733dd98e8e3e76))

### Code Refactoring

* delete unused `esbuildPlugin` ([#23381](https://github.com/vitejs/vite/issues/23381)) ([f40efef](https://github.com/vitejs/vite/commit/f40efefbb3630cdb7235286bc2b51673d9fbfc27))
* exclude postfix from `__VITE_ASSET__` ([#22886](https://github.com/vitejs/vite/issues/22886)) ([a6c08e1](https://github.com/vitejs/vite/commit/a6c08e10a624bd89b78683ff1b0e8cfa1d89aa45))
* remove HmrUrl concept ([#23172](https://github.com/vitejs/vite/issues/23172)) ([67a6807](https://github.com/vitejs/vite/commit/67a680767317f8e2cb28b6b0500192f993a567cf))
* use `urlId` of `import.meta.ROLLDOWN_FILE_URL` in wasm plugin ([#22962](https://github.com/vitejs/vite/issues/22962)) ([92bd2a7](https://github.com/vitejs/vite/commit/92bd2a7f325ed102349cdc6c1ad4b5cd25e1d72f))

### Tests

* add `renderBuiltUrl` change changes hash ([#23118](https://github.com/vitejs/vite/issues/23118)) ([0291408](https://github.com/vitejs/vite/commit/0291408b8443129ce6f6d1d440be8facabe9683b))

