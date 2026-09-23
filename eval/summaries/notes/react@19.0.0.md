Below is a list of all new features, APIs, deprecations, and breaking changes. Read [React 19 release post](https://react.dev/blog/2024/04/25/react-19) and [React 19 upgrade guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide) for more information.

> Note: To help make the upgrade to React 19 easier, we’ve published a react@18.3 release that is identical to 18.2 but adds warnings for deprecated APIs and other changes that are needed for React 19. We recommend upgrading to React 18.3.1 first to help identify any issues before upgrading to React 19.

### New Features

#### React

* Actions: `startTransition` can now accept async functions. Functions passed to `startTransition` are called “Actions”. A given Transition can include one or more Actions which update state in the background and update the UI with one commit. In addition to updating state, Actions can now perform side effects including async requests, and the Action will wait for the work to finish before finishing the Transition. This feature allows Transitions to include side effects like `fetch()` in the pending state, and provides support for error handling, and optimistic updates.  
* `useActionState`: is a new hook to order Actions inside of a Transition with access to the state of the action, and the pending state. It accepts a reducer that can call Actions, and the initial state used for first render. It also accepts an optional string that is used if the action is passed to a form `action` prop to support progressive enhancement in forms.  
* `useOptimistic`: is a new hook to update state while a Transition is in progress. It returns the state, and a set function that can be called inside a transition to “optimistically” update the state to expected final value immediately while the Transition completes in the background. When the transition finishes, the state is updated to the new value.  
* `use`: is a new API that allows reading resources in render. In React 19, `use` accepts a promise or Context. If provided a promise, `use` will suspend until a value is resolved. `use` can only be used in render but can be called conditionally.  
* `ref` as a prop: Refs can now be used as props, removing the need for `forwardRef`.  
* **Suspense sibling pre-warming**: When a component suspends, React will immediately commit the fallback of the nearest Suspense boundary, without waiting for the entire sibling tree to render. After the fallback commits, React will schedule another render for the suspended siblings to “pre-warm” lazy requests.

#### React DOM Client

* `<form> action` prop: Form Actions allow you to manage forms automatically and integrate with `useFormStatus`. When a `<form> action` succeeds, React will automatically reset the form for uncontrolled components. The form can be reset manually with the new `requestFormReset` API.  
* `<button> and <input> formAction` prop: Actions can be passed to the `formAction` prop to configure form submission behavior. This allows using different Actions depending on the input.  
* `useFormStatus`: is a new hook that provides the status of the parent `<form> action`, as if the form was a Context provider. The hook returns the values: `pending`, `data`, `method`, and `action`.  
* Support for Document Metadata: We’ve added support for rendering document metadata tags in components natively. React will automatically hoist them into the `<head>` section of the document.  
* Support for Stylesheets: React 19 will ensure stylesheets are inserted into the `<head>` on the client before revealing the content of a Suspense boundary that depends on that stylesheet.  
* Support for async scripts: Async scripts can be rendered anywhere in the component tree and React will handle ordering and deduplication.  
* Support for preloading resources: React 19 ships with `preinit`, `preload`, `prefetchDNS`, and `preconnect` APIs to optimize initial page loads by moving discovery of additional resources like fonts out of stylesheet loading. They can also be used to prefetch resources used by an anticipated navigation.

#### React DOM Server

* Added `prerender` and `prerenderToNodeStream` APIs for static site generation. They are designed to work with streaming environments like Node.js Streams and Web Streams. Unlike `renderToString`, they wait for data to load for HTML generation.

#### React Server Components

* RSC features such as directives, server components, and server functions are now stable. This means libraries that ship with Server Components can now target React 19 as a peer dependency with a react-server export condition for use in frameworks that support the Full-stack React Architecture. The underlying APIs used to implement a React Server Components bundler or framework do not follow semver and may break between minors in React 19.x. See [docs](https://19.react.dev/reference/rsc/server-components) for how to support React Server Components.

### Deprecations

* Deprecated: `element.ref` access: React 19 supports ref as a prop, so we’re deprecating `element.ref` in favor of `element.props.ref`. Accessing will result in a warning.  
* `react-test-renderer`: In React 19, react-test-renderer logs a deprecation warning and has switched to concurrent rendering for web usage. We recommend migrating your tests to  [@testing-library/react](https://testing-library.com/docs/react-testing-library/intro/) or [@testing-library/react-native](https://testing-library.com/docs/react-native-testing-library/intro)

### Breaking Changes

React 19 brings in a number of breaking changes, including the removals of long-deprecated APIs. We recommend first upgrading to `18.3.1`, where we've added additional deprecation warnings. Check out the [upgrade guide](https://19.react.dev/blog/2024/04/25/react-19-upgrade-guide) for more details and guidance on codemodding.

### React

* New JSX Transform is now required: We introduced [a new JSX transform](https://legacy.reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html) in 2020 to improve bundle size and use JSX without importing React. In React 19, we’re adding additional improvements like using ref as a prop and JSX speed improvements that require the new transform.  
* Errors in render are not re-thrown: Errors that are not caught by an Error Boundary are now reported to window.reportError. Errors that are caught by an Error Boundary are reported to console.error. We’ve introduced `onUncaughtError` and `onCaughtError` methods to `createRoot` and `hydrateRoot` to customize this error handling.  
* Removed: `propTypes`: Using `propTypes` will now be silently ignored. If required, we recommend migrating to TypeScript or another type-checking solution.  
* Removed: `defaultProps` for functions: ES6 default parameters can be used in place. Class components continue to support `defaultProps` since there is no ES6 alternative.  
* Removed: `contextTypes` and `getChildContext`: Legacy Context for class components has been removed in favor of the `contextType` API.  
* Removed: string refs: Any usage of string refs need to be migrated to ref callbacks.   
* Removed: Module pattern factories: A rarely used pattern that can be migrated to regular functions.  
* Removed: `React.createFactory`: Now that JSX is broadly supported, all `createFactory` usage can be migrated to JSX components.  
* Removed: `react-test-renderer/shallow`: This has been a re-export of [react-shallow-renderer](https://github.com/enzymejs/react-shallow-renderer) since React 18\. If needed, you can continue to use the third-party package directly. We recommend using [@testing-library/react](https://testing-library.com/docs/react-testing-library/intro/) or [@testing-library/react-native](https://testing-library.com/docs/react-native-testing-library/intro) instead.

#### React DOM

* Removed: `react-dom/test-utils`: We’ve moved `act` from `react-dom/test-utils` to react. All other utilities have been removed.   
* Removed: `ReactDOM`.`render`, `ReactDOM`.`hydrate`: These have been removed in favor of the concurrent equivalents: `ReactDOM`.`createRoot` and `ReactDOM.hydrateRoot`.  
* Removed: `unmountComponentAtNode`: Removed in favor of `root.unmount()`.  
* Removed: `ReactDOM`.`findDOMNode`: You can replace `ReactDOM`.`findDOMNode` with DOM Refs.

### Notable Changes

#### React

* `<Context>` as a provider: You can now render `<Context>` as a provider instead of `<Context.Provider>`.  
* Cleanup functions for refs: When the component unmounts, React will call the cleanup function returned from the ref callback.  
* `useDeferredValue` initial value argument: When provided, `useDeferredValue` will return the initial value for the initial render of a component, then schedule a re-render in the background with the `deferredValue` returned.  
* Support for Custom Elements: React 19 now passes all tests on [Custom Elements Everywhere](https://custom-elements-everywhere.com/).  
* StrictMode changes: `useMemo` and `useCallback` will now reuse the memoized results from the first render, during the second render. Additionally, StrictMode will now double-invoke ref callback functions on initial mount.  
* UMD builds removed: To load React 19 with a script tag, we recommend using an ESM-based CDN such as [esm.sh](http://esm.sh).

#### React DOM

* Diffs for hydration errors: In the case of a mismatch, React 19 logs a single error with a diff of the mismatched content.  
* Compatibility with third-party scripts and extensions: React will now force a client re-render to fix up any mismatched content caused by elements inserted by third-party JS. 

### TypeScript Changes

The most common changes can be codemodded with `npx types-react-codemod@latest preset-19 ./path-to-your-react-ts-files`.

* Removed deprecated TypeScript types:   
  * `ReactChild` (replacement: `React.ReactElement | number | string)`  
  * `ReactFragment` (replacement: `Iterable<React.ReactNode>`)  
  * `ReactNodeArray` (replacement: `ReadonlyArray<React.ReactNode>`)  
  * `ReactText` (replacement: `number | string`)  
  * `VoidFunctionComponent` (replacement: `FunctionComponent`)  
  * `VFC` (replacement: `FC`)  
  * Moved to `prop-types`: `Requireable`, `ValidationMap`, `Validator`, `WeakValidationMap`  
  * Moved to `create-react-class`: `ClassicComponentClass`, `ClassicComponent`, `ClassicElement`, `ComponentSpec`, `Mixin`, `ReactChildren`, `ReactHTML`, `ReactSVG`, `SFCFactory`  
* Disallow implicit return in refs: refs can now accept cleanup functions. When you return something else, we can’t tell if you intentionally returned something not meant to clean up or returned the wrong value. Implicit returns of anything but functions will now error.   
* Require initial argument to `useRef`: The initial argument is now required to match `useState`, `createContext` etc  
* Refs are mutable by default: Ref objects returned from `useRef()` are now always mutable instead of sometimes being immutable. This feature was too confusing for users and conflicted with legit cases where refs were managed by React and manually written to.  
* Strict `ReactElement` typing: The props of React elements now default to `unknown` instead of `any` if the element is typed as `ReactElement`  
* JSX namespace in TypeScript: The global `JSX` namespace is removed to improve interoperability with other libraries using JSX. Instead, the JSX namespace is available from the React package: `import { JSX } from 'react'`  
* Better `useReducer` typings: Most `useReducer` usage should not require explicit type arguments.  
  For example,  
  ```diff
  -useReducer<React.Reducer<State, Action>>(reducer)
  +useReducer(reducer)
  ```
  or
  ```diff
  -useReducer<React.Reducer<State, Action>>(reducer)
  +useReducer<State, Action>(reducer)
  ```

### All Changes

#### React

* Add support for async Actions ([\#26621](https://github.com/facebook/react/pull/26621), [\#26726](https://github.com/facebook/react/pull/26726), [\#28078](https://github.com/facebook/react/pull/28078), [\#28097](https://github.com/facebook/react/pull/28097), [\#29226](https://github.com/facebook/react/pull/29226), [\#29618](https://github.com/facebook/react/pull/29618), [\#29670](https://github.com/facebook/react/pull/29670), [\#26716](https://github.com/facebook/react/pull/26716) by [@acdlite](https://github.com/acdlite) and [@sebmarkbage](https://github.com/sebmarkbage))  
* Add `useActionState()` hook to update state based on the result of a Form Action ([\#27270](https://github.com/facebook/react/pull/27270), [\#27278](https://github.com/facebook/react/pull/27278), [\#27309](https://github.com/facebook/react/pull/27309), [\#27302](https://github.com/facebook/react/pull/27302), [\#27307](https://github.com/facebook/react/pull/27307), [\#27366](https://github.com/facebook/react/pull/27366), [\#27370](https://github.com/facebook/react/pull/27370), [\#27321](https://github.com/facebook/react/pull/27321), [\#27374](https://github.com/facebook/react/pull/27374), [\#27372](https://github.com/facebook/react/pull/27372), [\#27397](https://github.com/facebook/react/pull/27397), [\#27399](https://github.com/facebook/react/pull/27399), [\#27460](https://github.com/facebook/react/pull/27460), [\#28557](https://github.com/facebook/react/pull/28557), [\#27570](https://github.com/facebook/react/pull/27570), [\#27571](https://github.com/facebook/react/pull/27571), [\#28631](https://github.com/facebook/react/pull/28631), [\#28788](https://github.com/facebook/react/pull/28788), [\#29694](https://github.com/facebook/react/pull/29694), [\#29695](https://github.com/facebook/react/pull/29695), [\#29694](https://github.com/facebook/react/pull/29694), [\#29665](https://github.com/facebook/react/pull/29665), [\#28232](https://github.com/facebook/react/pull/28232), [\#28319](https://github.com/facebook/react/pull/28319) by [@acdlite](https://github.com/acdlite), [@eps1lon](https://github.com/eps1lon), and [@rickhanlonii](https://github.com/rickhanlonii))  
* Add `use()` API to read resources in render ([\#25084](https://github.com/facebook/react/pull/25084), [\#25202](https://github.com/facebook/react/pull/25202), [\#25207](https://github.com/facebook/react/pull/25207), [\#25214](https://github.com/facebook/react/pull/25214), [\#25226](https://github.com/facebook/react/pull/25226), [\#25247](https://github.com/facebook/react/pull/25247), [\#25539](https://github.com/facebook/react/pull/25539), [\#25538](https://github.com/facebook/react/pull/25538), [\#25537](https://github.com/facebook/react/pull/25537), [\#25543](https://github.com/facebook/react/pull/25543), [\#25561](https://github.com/facebook/react/pull/25561), [\#25620](https://github.com/facebook/react/pull/25620), [\#25615](https://github.com/facebook/react/pull/25615), [\#25922](https://github.com/facebook/react/pull/25922), [\#25641](https://github.com/facebook/react/pull/25641), [\#25634](https://github.com/facebook/react/pull/25634), [\#26232](https://github.com/facebook/react/pull/26232), [\#26536](https://github.com/facebook/react/pull/26535), [\#26739](https://github.com/facebook/react/pull/26739), [\#28233](https://github.com/facebook/react/pull/28233) by [@acdlite](https://github.com/acdlite), [@MofeiZ](https://github.com/mofeiZ), [@sebmarkbage](https://github.com/sebmarkbage), [@sophiebits](https://github.com/sophiebits), [@eps1lon](https://github.com/eps1lon), and [@hansottowirtz](https://github.com/hansottowirtz))  
* Add `useOptimistic()` hook to display mutated state optimistically during an async mutation ([\#26740](https://github.com/facebook/react/pull/26740), [\#26772](https://github.com/facebook/react/pull/26772), [\#27277](https://github.com/facebook/react/pull/27277), [\#27453](https://github.com/facebook/react/pull/27453), [\#27454](https://github.com/facebook/react/pull/27454), [\#27936](https://github.com/facebook/react/pull/27936) by [@acdlite](https://github.com/acdlite))  
* Added an `initialValue` argument to `useDeferredValue()` hook ([\#27500](https://github.com/facebook/react/pull/27500), [\#27509](https://github.com/facebook/react/pull/27509), [\#27512](https://github.com/facebook/react/pull/27512), [\#27888](https://github.com/facebook/react/pull/27888), [\#27550](https://github.com/facebook/react/pull/27550) by [@acdlite](https://github.com/acdlite))  
* Support refs as props, warn on `element.ref` access ([\#28348](https://github.com/facebook/react/pull/28348), [\#28464](https://github.com/facebook/react/pull/28464), [\#28731](https://github.com/facebook/react/pull/28731) by [@acdlite](https://github.com/acdlite))  
* Support Custom Elements ([\#22184](https://github.com/facebook/react/pull/22184), [\#26524](https://github.com/facebook/react/pull/26524), [\#26523](https://github.com/facebook/react/pull/26523), [\#27511](https://github.com/facebook/react/pull/27511), [\#24541](https://github.com/facebook/react/pull/24541) by [@josepharhar](https://github.com/josepharhar), [@sebmarkbage](https://github.com/sebmarkbage), [@gnoff](https://github.com/gnoff) and [@eps1lon](https://github.com/eps1lon))  
* Add ref cleanup function ([\#25686](https://github.com/facebook/react/pull/25686), [\#28883](https://github.com/facebook/react/pull/28883), [\#28910](https://github.com/facebook/react/pull/28910)  by [@sammy-SC](https://github.com/sammy-SC), [@jackpope](https://github.com/jackpope), and [@kassens](https://github.com/kassens))  
* Sibling pre-rendering replaced by sibling pre-warming ([\#26380](https://github.com/facebook/react/pull/26380), [\#26549](https://github.com/facebook/react/pull/26549), [\#30761](https://github.com/facebook/react/pull/30761), [\#30800](https://github.com/facebook/react/pull/30800), [\#30762](https://github.com/facebook/react/pull/30762), [\#30879](https://github.com/facebook/react/pull/30879), [\#30934](https://github.com/facebook/react/pull/30934), [\#30952](https://github.com/facebook/react/pull/30952), [\#31056](https://github.com/facebook/react/pull/31056), [\#31452](https://github.com/facebook/react/pull/31452) by [@sammy-SC](https://github.com/sammy-SC), [@acdlite](https://github.com/acdlite), [@gnoff](https://github.com/gnoff), [@jackpope](https://github.com/jackpope), [@rickhanlonii](https://github.com/rickhanlonii))  
* Don’t rethrow errors at the root ([\#28627](https://github.com/facebook/react/pull/28627), [\#28641](https://github.com/facebook/react/pull/28641) by [@sebmarkbage](https://github.com/sebmarkbage))  
* Batch sync discrete, continuous, and default lanes ([\#25700](https://github.com/facebook/react/pull/25700) by [@tyao1](https://github.com/tyao1))  
* Switch `<Context>` to mean `<Context.Provider>` ([\#28226](https://github.com/facebook/react/pull/28226) by [@gaearon](https://github.com/gaearon))  
* Changes to *StrictMode*  
  * Handle `info`, `group`, and `groupCollapsed` in *StrictMode* logging ([\#25172](https://github.com/facebook/react/pull/25172) by [@timneutkens](https://github.com/timneutkens))  
  * Refs are now attached/detached/attached in *StrictMode* ([\#25049](https://github.com/facebook/react/pull/25049) by [@sammy-SC](https://github.com/sammy-SC))  
  * Fix `useSyncExternalStore()` hydration in *StrictMode* ([\#26791](https://github.com/facebook/react/pull/26791) by [@sophiebits](https://github.com/sophiebits))  
  * Always trigger `componentWillUnmount()` in *StrictMode* ([\#26842](https://github.com/facebook/react/pull/26842) by [@tyao1](https://github.com/tyao1))  
  * Restore double invoking `useState()` and `useReducer()` initializer functions in *StrictMode* ([\#28248](https://github.com/facebook/react/pull/28248) by [@eps1lon](https://github.com/eps1lon))  
  * Reuse memoized result from first pass ([\#25583](https://github.com/facebook/react/pull/25583) by [@acdlite](https://github.com/acdlite))  
  * Fix `useId()` in *StrictMode* ([\#25713](https://github.com/facebook/react/pull/25713) by [@gnoff](https://github.com/gnoff))  
  * Add component name to *StrictMode* error messages ([\#25718](https://github.com/facebook/react/pull/25718) by [@sammy-SC](https://github.com/sammy-SC))  
* Add support for rendering BigInt ([\#24580](https://github.com/facebook/react/pull/24580) by [@eps1lon](https://github.com/eps1lon))  
* `act()` no longer checks `shouldYield` which can be inaccurate in test environments ([\#26317](https://github.com/facebook/react/pull/26317) by [@acdlite](https://github.com/acdlite))  
* Warn when keys are spread with props ([\#25697](https://github.com/facebook/react/pull/25697), [\#26080](https://github.com/facebook/react/pull/26080) by [@sebmarkbage](https://github.com/sebmarkbage) and [@kassens](https://github.com/kassens))  
* Generate sourcemaps for production build artifacts ([\#26446](https://github.com/facebook/react/pull/26446) by [@markerikson](https://github.com/markerikson))  
* Improve stack diffing algorithm ([\#27132](https://github.com/facebook/react/pull/27132) by [@KarimP](https://github.com/KarimP))  
* Suspense throttling lowered from 500ms to 300ms ([\#26803](https://github.com/facebook/react/pull/26803) by [@acdlite](https://github.com/acdlite))  
* Lazily propagate context changes ([\#20890](https://github.com/facebook/react/pull/20890) by [@acdlite](https://github.com/acdlite) and [@gnoff](https://github.com/gnoff))  
* Immediately rerender pinged fiber ([\#25074](https://github.com/facebook/react/pull/25074) by [@acdlite](https://github.com/acdlite))  
* Move update scheduling to microtask ([\#26512](https://github.com/facebook/react/pull/26512) by [@acdlite](https://github.com/acdlite))  
* Consistently apply throttled retries ([\#26611](https://github.com/facebook/react/pull/26611), [\#26802](https://github.com/facebook/react/pull/26802) by [@acdlite](https://github.com/acdlite))  
* Suspend Thenable/Lazy if it's used in React.Children ([\#28284](https://github.com/facebook/react/pull/28284) by [@sebmarkbage](https://github.com/sebmarkbage))  
* Detect infinite update loops caused by render phase updates ([\#26625](https://github.com/facebook/react/pull/26625) by [@acdlite](https://github.com/acdlite))  
* Update conditional hooks warning ([\#29626](https://github.com/facebook/react/pull/29626) by [@sophiebits](https://github.com/sophiebits))  
* Update error URLs to go to new docs ([\#27240](https://github.com/facebook/react/pull/27240) by [@rickhanlonii](https://github.com/rickhanlonii))  
* Rename the `react.element` symbol to `react.transitional.element` ([\#28813](https://github.com/facebook/react/pull/28813) by [@sebmarkbage](https://github.com/sebmarkbage))  
* Fix crash when suspending in shell during `useSyncExternalStore()` re-render ([\#27199](https://github.com/facebook/react/pull/27199) by [@acdlite](https://github.com/acdlite))  
* Fix incorrect “detected multiple renderers" error in tests ([\#22797](https://github.com/facebook/react/pull/22797) by [@eps1lon](https://github.com/eps1lon))  
* Fix bug where effect cleanup may be called twice after bailout ([\#26561](https://github.com/facebook/react/pull/26561) by [@acdlite](https://github.com/acdlite))  
* Fix suspending in shell during discrete update ([\#25495](https://github.com/facebook/react/pull/25495) by [@acdlite](https://github.com/acdlite))  
* Fix memory leak after repeated setState bailouts ([\#25309](https://github.com/facebook/react/pull/25309) by [@acdlite](https://github.com/acdlite))  
* Fix `useSyncExternalStore()` dropped update when state is dispatched in render phase ([\#25578](https://github.com/facebook/react/pull/25578) by [@pandaiolo](https://github.com/pandaiolo))  
* Fix logging when rendering a lazy fragment ([\#30372](https://github.com/facebook/react/pull/30372) by [@tom-sherman](https://github.com/tom-sherman))  
* Remove string refs ([\#25383](https://github.com/facebook/react/pull/25383), [\#28322](https://github.com/facebook/react/pull/28322) by [@eps1lon](https://github.com/eps1lon) and [@acdlite](https://github.com/acdlite))  
* Remove Legacy Context (\#30319 by [@kassens](https://github.com/kassens))  
* Remove `RefreshRuntime.findAffectedHostInstances` ([\#30538](https://github.com/facebook/react/pull/30538) by [@gaearon](https://github.com/gaearon))  
* Remove client caching from `cache()` API ([\#27977](https://github.com/facebook/react/pull/27977), [\#28250](https://github.com/facebook/react/pull/28250) by [@acdlite](https://github.com/acdlite) and [@gnoff](https://github.com/gnoff))  
* Remove `propTypes` ([\#28324](https://github.com/facebook/react/pull/28324), [\#28326](https://github.com/facebook/react/pull/28326) by [@gaearon](https://github.com/gaearon))  
* Remove `defaultProps` support, except for classes ([\#28733](https://github.com/facebook/react/pull/28733) by [@acdlite](https://github.com/acdlite))  
* Remove UMD builds ([\#28735](https://github.com/facebook/react/pull/28735) by [@gnoff](https://github.com/gnoff))  
* Remove delay for non-transition updates ([\#26597](https://github.com/facebook/react/pull/26597) by [@acdlite](https://github.com/acdlite))  
* Remove `createFactory` ([\#27798](https://github.com/facebook/react/pull/27798) by [@kassens](https://github.com/kassens))

#### React DOM

* Adds Form Actions to handle form submission ([\#26379](https://github.com/facebook/react/pull/26379), [\#26674](https://github.com/facebook/react/pull/26674), [\#26689](https://github.com/facebook/react/pull/26689), [\#26708](https://github.com/facebook/react/pull/26708), [\#26714](https://github.com/facebook/react/pull/26714),  [\#26735](https://github.com/facebook/react/pull/26735), [\#26846](https://github.com/facebook/react/pull/26846), [\#27358](https://github.com/facebook/react/pull/27358),  [\#28056](https://github.com/facebook/react/pull/28056) by [@sebmarkbage](https://github.com/sebmarkbage), [@acdlite](https://github.com/acdlite), and [@jupapios](https://github.com/jupapios))  
* Add `useFormStatus()` hook to provide status information of the last form submission ([\#26719](https://github.com/facebook/react/pull/26719), [\#26722](https://github.com/facebook/react/pull/26722), [\#26788](https://github.com/facebook/react/pull/26788),  [\#29019](https://github.com/facebook/react/pull/29019), [\#28728](https://github.com/facebook/react/pull/28728), [\#28413](https://github.com/facebook/react/pull/28413) by [@acdlite](https://github.com/acdlite) and [@eps1lon](https://github.com/eps1lon))  
* Support for Document Metadata. Adds `preinit`, `preinitModule`, `preconnect`, `prefetchDNS`, `preload`, and `preloadModule` APIs.  
  * [\#25060](https://github.com/facebook/react/pull/25060), [\#25243](https://github.com/facebook/react/pull/25243), [\#25388](https://github.com/facebook/react/pull/25388), [\#25432](https://github.com/facebook/react/pull/25432), [\#25436](https://github.com/facebook/react/pull/25436), [\#25426](https://github.com/facebook/react/pull/25426), [\#25500](https://github.com/facebook/react/pull/25500), [\#25480](https://github.com/facebook/react/pull/25480), [\#25508](https://github.com/facebook/react/pull/25508), [\#25515](https://github.com/facebook/react/pull/25515), [\#25514](https://github.com/facebook/react/pull/25514), [\#25532](https://github.com/facebook/react/pull/25532), [\#25536](https://github.com/facebook/react/pull/25536), [\#25534](https://github.com/facebook/react/pull/25534), [\#25546](https://github.com/facebook/react/pull/25546), [\#25559](https://github.com/facebook/react/pull/25559), [\#25569](https://github.com/facebook/react/pull/25569), [\#25599](https://github.com/facebook/react/pull/25599), [\#25689](https://github.com/facebook/react/pull/25689), [\#26106](https://github.com/facebook/react/pull/26106), [\#26152](https://github.com/facebook/react/pull/26152), [\#26239](https://github.com/facebook/react/pull/26239), [\#26237](https://github.com/facebook/react/pull/26237), [\#26280](https://github.com/facebook/react/pull/26280), [\#26154](https://github.com/facebook/react/pull/26154), [\#26256](https://github.com/facebook/react/pull/26256), [\#26353](https://github.com/facebook/react/pull/26353), [\#26427](https://github.com/facebook/react/pull/26427), [\#26450](https://github.com/facebook/react/pull/26450), [\#26502](https://github.com/facebook/react/pull/26502),  [\#26514](https://github.com/facebook/react/pull/26514), [\#26531](https://github.com/facebook/react/pull/26531), [\#26532](https://github.com/facebook/react/pull/26532), [\#26557](https://github.com/facebook/react/pull/26557), [\#26871](https://github.com/facebook/react/pull/26871), [\#26881](https://github.com/facebook/react/pull/26881), [\#26877](https://github.com/facebook/react/pull/26877), [\#26873](https://github.com/facebook/react/pull/26873), [\#26880](https://github.com/facebook/react/pull/26880), [\#26942](https://github.com/facebook/react/pull/26942), [\#26938](https://github.com/facebook/react/pull/26938), [\#26940](https://github.com/facebook/react/pull/26940), [\#26939](https://github.com/facebook/react/pull/26939), [\#27030](https://github.com/facebook/react/pull/27030), [\#27201](https://github.com/facebook/react/pull/27201), [\#27212](https://github.com/facebook/react/pull/27212), [\#27217](https://github.com/facebook/react/pull/27217), [\#27218](https://github.com/facebook/react/pull/27218), [\#27220](https://github.com/facebook/react/pull/27220), [\#27224](https://github.com/facebook/react/pull/27224), [\#27223](https://github.com/facebook/react/pull/27223), [\#27269](https://github.com/facebook/react/pull/27269), [\#27260](https://github.com/facebook/react/pull/27260), [\#27347](https://github.com/facebook/react/pull/27347), [\#27346](https://github.com/facebook/react/pull/27346), [\#27361](https://github.com/facebook/react/pull/27361), [\#27400](https://github.com/facebook/react/pull/27400), [\#27541](https://github.com/facebook/react/pull/27541), [\#27610](https://github.com/facebook/react/pull/27610), [\#28110](https://github.com/facebook/react/pull/28110), [\#29693](https://github.com/facebook/react/pull/29693), [\#29732](https://github.com/facebook/react/pull/29732), [\#29811](https://github.com/facebook/react/pull/29811), [\#27586](https://github.com/facebook/react/pull/27586), [\#28069](https://github.com/facebook/react/pull/28069) by [@gnoff](https://github.com/gnoff), [@sebmarkbage](https://github.com/sebmarkbage), [@acdlite](https://github.com/acdlite), [@kassens](https://github.com/kassens), [@sokra](https://github.com/sokra), [@sweetliquid](https://github.com/sweetliquid)  
* Add `fetchPriority` to `<img>` and `<link>` ([\#25927](https://github.com/facebook/react/pull/25927) by [@styfle](https://github.com/styfle))  
* Add support for SVG `transformOrigin` prop ([\#26130](https://github.com/facebook/react/pull/26130) by [@arav-ind](https://github.com/arav-ind))  
* Add support for `onScrollEnd` event ([\#26789](https://github.com/facebook/react/pull/26789) by [@devongovett](https://github.com/devongovett))  
* Allow `<hr>` as child of `<select>` ([\#27632](https://github.com/facebook/react/pull/27632) by [@SouSingh](https://github.com/SouSingh))  
* Add support for Popover API ([\#27981](https://github.com/facebook/react/pull/27981) by [@eps1lon](https://github.com/eps1lon))  
* Add support for `inert` ([\#24730](https://github.com/facebook/react/pull/24730) by [@eps1lon](https://github.com/eps1lon))  
* Add support for `imageSizes` and `imageSrcSet` ([\#22550](https://github.com/facebook/react/pull/22550) by [@eps1lon](https://github.com/eps1lon))  
* Synchronously flush transitions in popstate events ([\#26025](https://github.com/facebook/react/pull/26025), [\#27559](https://github.com/facebook/react/pull/27559), [\#27505](https://github.com/facebook/react/pull/27505), [\#30759](https://github.com/facebook/react/pull/30759) by [@tyao1](https://github.com/tyao1) and [@acdlite](https://github.com/acdlite))  
* `flushSync` exhausts queue even if something throws ([\#26366](https://github.com/facebook/react/pull/26366) by [@acdlite](https://github.com/acdlite))  
* Throw error if `react` and `react-dom` versions don’t match ([\#29236](https://github.com/facebook/react/pull/29236) by [@acdlite](https://github.com/acdlite))  
* Ensure `srcset` and `src` are assigned last on `<img>` instances ([\#30340](https://github.com/facebook/react/pull/30340) by [@gnoff](https://github.com/gnoff))  
* Javascript URLs are replaced with functions that throw errors ([\#26507](https://github.com/facebook/react/pull/26507), [\#29808](https://github.com/facebook/react/pull/29808) by [@sebmarkbage](https://github.com/sebmarkbage) and [@kassens](https://github.com/kassens))  
* Treat toggle and beforetoggle as discrete events ([\#29176](https://github.com/facebook/react/pull/29176) by [@eps1lon](https://github.com/eps1lon))  
* Filter out empty `src` and `href` attributes (unless for `<a href=”” />`) ([\#18513](https://github.com/facebook/react/pull/18513), [\#28124](https://github.com/facebook/react/pull/28124) by [@bvaughn](https://github.com/bvaughn) and [@eps1lon](https://github.com/eps1lon))  
* Fix unitless `scale` style property ([\#25601](https://github.com/facebook/react/pull/25601) by [@JonnyBurger](https://github.com/JonnyBurger))  
* Fix `onChange` error message for controlled `<select>` ([\#27740](https://github.com/facebook/react/pull/27740) by [@Biki-das](https://github.com/Biki-das))  
* Fix focus restore in child windows after element reorder ([\#30951](https://github.com/facebook/react/pull/30951) by [@ling1726](https://github.com/ling1726))  
* Remove `render`, `hydrate`, `findDOMNode`, `unmountComponentAtNode`, `unstable_createEventHandle`, `unstable_renderSubtreeIntoContainer`, and `unstable_runWithPriority`. Move `createRoot` and `hydrateRoot` to `react-dom/client`. ([\#28271](https://github.com/facebook/react/pull/28271) by [@gnoff](https://github.com/gnoff))  
* Remove `test-utils` ([\#28541](https://github.com/facebook/react/pull/28541) by [@eps1lon](https://github.com/eps1lon))  
* Remove `unstable_flushControlled` ([\#26397](https://github.com/facebook/react/pull/26397) by [@kassens](https://github.com/kassens))  
* Remove legacy mode ([\#28468](https://github.com/facebook/react/pull/28468) by [@gnoff](https://github.com/gnoff))  
* Remove `renderToStaticNodeStream()` ([\#28873](https://github.com/facebook/react/pull/28873) by @gnoff)  
* Remove `unstable_renderSubtreeIntoContainer` ([\#29771](https://github.com/facebook/react/pull/29771) by [@kassens](https://github.com/kassens))

#### React DOM Server

* Stable release of React Server Components ([Many, many PRs](https://github.com/facebook/react/pulls?q=is%3Apr+is%3Aclosed+%5BFlight%5D+in%3Atitle+created%3A%3C2024-12-01+) by [@sebmarkbage](https://github.com/sebmarkbage), [@acdlite](https://github.com/acdlite), [@gnoff](https://github.com/gnoff), [@sammy-SC](https://github.com/sammy-SC), [@gaearon](https://github.com/gaearon), [@sophiebits](https://github.com/sophiebits), [@unstubbable](https://github.com/unstubbable), [@lubieowoce](https://github.com/lubieowoce))
* Support Server Actions ([\#26124](https://github.com/facebook/react/pull/26124), [\#26632](https://github.com/facebook/react/pull/26632), [\#27459](https://github.com/facebook/react/pull/27459) by [@sebmarkbage](https://github.com/sebmarkbage) and [@acdlite](https://github.com/acdlite))  
* Changes to SSR  
  * Add external runtime which bootstraps hydration on the client for binary transparency ([\#25437](https://github.com/facebook/react/pull/25437), [\#26169](https://github.com/facebook/react/pull/26169), [\#25499](https://github.com/facebook/react/pull/25499) by [@MofeiZ](https://github.com/mofeiZ) and [@acdlite](https://github.com/acdlite))  
  * Support subresource integrity for `bootstrapScripts` and `bootstrapModules` ([\#25104](https://github.com/facebook/react/pull/25104) by [@gnoff](https://github.com/gnoff))  
  * Fix null bytes written at text chunk boundaries ([\#26228](https://github.com/facebook/react/pull/26228) by [@sophiebits](https://github.com/sophiebits))  
  * Fix logic around attribute serialization ([\#26526](https://github.com/facebook/react/pull/26526) by [@gnoff](https://github.com/gnoff))  
  * Fix precomputed chunk cleared on Node 18 ([\#25645](https://github.com/facebook/react/pull/25645) by [@feedthejim](https://github.com/feedthejim))  
  * Optimize end tag chunks ([\#27522](https://github.com/facebook/react/pull/27522) by [@yujunjung](https://github.com/yujunjung))  
  * Gracefully handle suspending in DOM configs ([\#26768](https://github.com/facebook/react/pull/26768) by [@sebmarkbage](https://github.com/sebmarkbage))  
  * Check for nullish values on ReactCustomFormAction ([\#26770](https://github.com/facebook/react/pull/26770) by [@sebmarkbage](https://github.com/sebmarkbage))  
  * Preload `bootstrapModules`, `bootstrapScripts`, and update priority queue ([\#26754](https://github.com/facebook/react/pull/26754), [\#26753](https://github.com/facebook/react/pull/26753), [\#27190](https://github.com/facebook/react/pull/27190), [\#27189](https://github.com/facebook/react/pull/27189) by [@gnoff](https://github.com/gnoff))  
  * Client render the nearest child or parent suspense boundary if replay errors or is aborted ([\#27386](https://github.com/facebook/react/pull/27386) by [@sebmarkbage](https://github.com/sebmarkbage))  
  * Don't bail out of flushing if we still have pending root tasks ([\#27385](https://github.com/facebook/react/pull/27385) by [@sebmarkbage](https://github.com/sebmarkbage))  
  * Ensure Resumable State is Serializable ([\#27388](https://github.com/facebook/react/pull/27388) by [@sebmarkbage](https://github.com/sebmarkbage))  
  * Remove extra render pass when reverting to client render ([\#26445](https://github.com/facebook/react/pull/26445) by [@acdlite](https://github.com/acdlite))  
  * Fix unwinding context during selective hydration ([\#25876](https://github.com/facebook/react/pull/25876) by [@tyao1](https://github.com/tyao1))  
  * Stop flowing and then abort if a stream is cancelled ([\#27405](https://github.com/facebook/react/pull/27405) by [@sebmarkbage](https://github.com/sebmarkbage))  
  * Pass cancellation reason to abort ([\#27536](https://github.com/facebook/react/pull/27536) by [@sebmarkbage](https://github.com/sebmarkbage))  
  * Add `onHeaders` entrypoint option ([\#27641](https://github.com/facebook/react/pull/27641), [\#27712](https://github.com/facebook/react/pull/27712) by [@gnoff](https://github.com/gnoff))  
  * Escape `<style>` and `<script>` textContent to enable rendering inner content without dangerouslySetInnerHTML ([\#28870](https://github.com/facebook/react/pull/28870), [\#28871](https://github.com/facebook/react/pull/28871) by [@gnoff](https://github.com/gnoff))  
  * Fallback to client replaying actions for Blob serialization ([\#28987](https://github.com/facebook/react/pull/28987) by [@sebmarkbage](https://github.com/sebmarkbage))  
  * Render Suspense fallback if boundary contains new stylesheet during sync update ([\#28965](https://github.com/facebook/react/pull/28965) by [@gnoff](https://github.com/gnoff))  
  * Fix header length tracking (\#30327 by [@gnoff](https://github.com/gnoff))  
  * Use `srcset` to trigger load event on mount (\#30351 by [@gnoff](https://github.com/gnoff))  
  * Don't perform work when closing stream (\#30497 by [@gnoff](https://github.com/gnoff))  
  * Allow aborting during render (\#30488, [\#30730](https://github.com/facebook/react/pull/30730) by [@gnoff](https://github.com/gnoff))  
  * Start initial work immediately (\#31079 by [@gnoff](https://github.com/gnoff))  
  * A transition flowing into a dehydrated boundary no longer suspends when showing fallback ([\#27230](https://github.com/facebook/react/pull/27230) by [@acdlite](https://github.com/acdlite))  
  * Fix selective hydration triggers false update loop error ([\#27439](https://github.com/facebook/react/pull/27439) by [@acdlite](https://github.com/acdlite))  
  * Warn for Child Iterator of all types but allow Generator Components ([\#28853](https://github.com/facebook/react/pull/28853) by [@sebmarkbage](https://github.com/sebmarkbage))  
  * Include regular stack trace in serialized errors ([\#28684](https://github.com/facebook/react/pull/28684), [\#28738](https://github.com/facebook/react/pull/28738) by [@sebmarkbage](https://github.com/sebmarkbage))  
  * Aborting early no longer infinitely suspends ([\#24751](https://github.com/facebook/react/pull/24751) by [@sebmarkbage](https://github.com/sebmarkbage))  
  * Fix hydration warning suppression in text comparisons ([\#24784](https://github.com/facebook/react/pull/24784) by [@gnoff](https://github.com/gnoff))  
  * Changes to error handling in SSR
    * Add diffs to hydration warnings ([\#28502](https://github.com/facebook/react/pull/28502), [\#28512](https://github.com/facebook/react/pull/28512) by [@sebmarkbage](https://github.com/sebmarkbage))  
    * Make Error creation lazy ([\#24728](https://github.com/facebook/react/pull/24728) by [@sebmarkbage](https://github.com/sebmarkbage))  
    * Remove recoverable error when a sync update flows into a dehydrated boundary ([\#25692](https://github.com/facebook/react/pull/25692) by [@sebmarkbage](https://github.com/sebmarkbage))  
    * Don't "fix up" mismatched text content with suppressedHydrationWarning ([\#26391](https://github.com/facebook/react/pull/26391) by [@sebmarkbage](https://github.com/sebmarkbage))  
    * Fix component stacks in errors ([\#27456](https://github.com/facebook/react/pull/27456) by [@sebmarkbage](https://github.com/sebmarkbage))  
    * Add component stacks to `onError` ([\#27761](https://github.com/facebook/react/pull/27761), [\#27850](https://github.com/facebook/react/pull/27850) by [@gnoff](https://github.com/gnoff) and [@sebmarkbage](https://github.com/sebmarkbage))  
    * Throw hydration mismatch errors once ([\#28502](https://github.com/facebook/react/pull/28502) by [@sebmarkbage](https://github.com/sebmarkbage))  
* Add Bun streaming server renderer ([\#25597](https://github.com/facebook/react/pull/25597) by [@colinhacks](https://github.com/colinhacks))  
* Add nonce support to bootstrap scripts ([\#26738](https://github.com/facebook/react/pull/26738) by [@danieltott](https://github.com/danieltott))  
* Add `crossorigin` support to bootstrap scripts ([\#26844](https://github.com/facebook/react/pull/26844) by [@HenriqueLimas](https://github.com/HenriqueLimas))  
* Support `nonce` and `fetchpriority` in preload links ([\#26826](https://github.com/facebook/react/pull/26826) by [@liuyenwei](https://github.com/liuyenwei))  
* Add `referrerPolicy` to `ReactDOM.preload()` ([\#27096](https://github.com/facebook/react/pull/27096) by [@styfle](https://github.com/styfle))  
* Add server condition for `react/jsx-dev-runtime` ([\#28921](https://github.com/facebook/react/pull/28921) by [@himself65](https://github.com/himself65))   
* Export version ([\#29596](https://github.com/facebook/react/pull/29596) by [@unstubbable](https://github.com/unstubbable))  
* Rename the secret export of Client and Server internals ([\#28786](https://github.com/facebook/react/pull/28786), [\#28789](https://github.com/facebook/react/pull/28789) by [@sebmarkbage](https://github.com/sebmarkbage))  
* Remove layout effect warning on server ([\#26395](https://github.com/facebook/react/pull/26395) by [@rickhanlonii](https://github.com/rickhanlonii))  
* Remove `errorInfo.digest` from `onRecoverableError` ([\#28222](https://github.com/facebook/react/pull/28222) by [@gnoff](https://github.com/gnoff))

#### ReactTestRenderer

* Add deprecation error to `react-test-renderer` on web ([\#27903](https://github.com/facebook/react/pull/27903), [\#28904](https://github.com/facebook/react/pull/28904) by [@jackpope](https://github.com/jackpope) and [@acdlite](https://github.com/acdlite))  
* Render with ConcurrentRoot on web ([\#28498](https://github.com/facebook/react/pull/28498) by [@jackpope](https://github.com/jackpope))  
* Remove `react-test-renderer/shallow` export ([\#25475](https://github.com/facebook/react/pull/25475), [\#28497](https://github.com/facebook/react/pull/28497) by [@sebmarkbage](https://github.com/sebmarkbage) and [@jackpope](https://github.com/jackpope))

#### React Reconciler

* Enable suspending commits without blocking render ([\#26398](https://github.com/facebook/react/pull/26398), [\#26427](https://github.com/facebook/react/pull/26427) by [@acdlite](https://github.com/acdlite))  
* Remove `prepareUpdate` ([\#26583](https://github.com/facebook/react/pull/26583), [\#27409](http://github.com/facebook/react/pull/27409) by [@sebmarkbage](https://github.com/sebmarkbage) and [@sophiebits](https://github.com/sophiebits))

#### React-Is

* Enable tree shaking ([\#27701](https://github.com/facebook/react/pull/27701) by [@markerikson](https://github.com/markerikson))  
* Remove `isConcurrentMode` and `isAsyncMode` methods ([\#28224](https://github.com/facebook/react/pull/28224) by @gaearon)

#### useSyncExternalStore

* Remove React internals access ([\#29868](https://github.com/facebook/react/pull/29868) by [@phryneas](https://github.com/phryneas))  
* Fix stale selectors keeping previous store references ([\#25969](https://github.com/facebook/react/pull/25968) by [@jellevoost](https://github.com/jellevoost))
