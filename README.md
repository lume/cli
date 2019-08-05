## builder-js-package

A generic build setup for JavaScript packages.

#### `npm i builder-js-package --save-dev`

**Short version:** Write source code and don't worry about how make it work everywhere.

**Long version:** A [Builder archetype](https://github.com/FormidableLabs/builder) (i.e. shared
project structure, shared build configuration, and shared tasks and procedures) for making,
building, and publishing JS-only packages in a way that makes them:

-   compatible in many different build systems and environments (f.e. Webpack, Rollup, Babel,
    Meteor, RequireJS, globals, Node.js)
-   consumable in with different module formats like AMD, UMD, CommonJS, and ES Modules
-   publishable to different registries like NPM, Bower, and JSPM

Example projects using this Builder archetype are:

-   [trusktr/lowclass](https://github.com/trusktr/lowclass)
-   [trusktr/perfect](https://github.com/trusktr/perfect)

Notice in those projects that they have no dependencies on any build tools and no build
configurations, and that they reference only this shared Builder archetype.

> **NOTE:** This project initially meets needs for my own JavaScript packages, and as such may not
> be a perfect fit for your needs.
>
> I'd like to make this easy to extend and even more generic to fit any needs, so that only few
> modifications are needed in order to adopt its use for more specific cases (f.e. adding babel
> plugins or webpack loaders and configs). See [TODO](#todos).

## Requirements

-   Node v9+ (might work with lower versions, not tested)
-   NPM v5+ (might work with lower versions, not tested)
-   If you don't have a graphical display (f.e. in Linux without a desktop) install xvfb - see
    https://github.com/electron/electron/blob/v1.4.10/docs/tutorial/testing-on-headless-ci.md

# Project Structure

(**Note!** This part is TODO, but shared configs and procedures work. For now, see the above example
projects, which all share a similar structure, to get an idea of how to structure a project in order
to use this Builder archetype)

`build-init builder-js-package` will create a new project with the following structure. If you have
an existing package that you'd like to use this on, then you will have to modify it to follow the
following structure.

```js
src               # all source files go here, as well as test.js files
  index.js        # entry point
  index.test.js   # co-located test files
  ...             # any other files imported by entry point, and associated test files
tests             # also scanned for test.js files
.gitignore        # things to ignore
package.json
.builderrc        # required, specify this builder archetype in there (see Builder docs).
builder.config.js # optional config options
```

This builder archetype will output compiled `.js` files from `src` along with `.js.map` source maps
into the root of the repo (yes, you read that correctly, you should not have any files at the top
level of `src` that are the same name as files in the root of the repo).

A `global.js` (and source map) is also outputted, containing the global version of the lib that can
be easily loaded on a website using a script tag.

# Config

This archetype can be configured with a `builder.config.js` file at the root of the project.

Options (so far):

```js
module.exports = {
	// If set to `false` or an empty string, then the global build will not add a
	// global variable into the environment. Otherwise, the library's exports will
	// be assigned onto a global variable of the name defined here. Defaults to
	// the name of the package if omitted (minus the @scope/ part if the package
	// names is scoped).
	globalName: '...', // A string, `false`, or `undefined`

	// a list of node modules (by name) that should be compiled.
	nodeModulesToCompile: [
		'some-package',
		// ...
	],

	// TODO babel option
}
```

# Caveat

This Builder archetype uses a combination of Babel to build code. Specifically, it transpiles
`for..of` loops with Babel in "loose" mode, which means the result is not spec compliant, but leaner
and faster in many cases although it will not work with Iterators and Generators.

This means, in projects built with this Builder archetype, you'll have to either not iterate on
things like `Map` or `Set` using `for..of` directly (f.e. use `Array`s instead), or use
`Array.from`. For example:

```js
const items = new Set(...)

// will NOT work
for (const item of items) {
    console.log(item)
}

// works
for (const item of Array.from(items)) {
    console.log(item)
}

const pairs = new Map(...)

// will NOT work
for (const [key, value] of pairs) {
    console.log(key, value)
}

// works
for (const [key, value] of Array.from(pairs)) {
    console.log(ikey, value)
}
```

# TODOs

-   [ ] Allow override of Babel config
-   [ ] Allow override of Webpack config
-   [ ] Don't commit global.js (and its map) on version changes, we can tell people to get it from
        unpkg, GitHub, and how to build it.
-   [ ] Output both a global.js and global.min.js
-   [ ] Source maps! Important! (so far exists for global.js, but not the other files)
-   [x] Important! Don't run `git stash` during version script if there's nothing to stash,
        otherwise it will pop a previous stash after `npm version` is done.
-   [ ] A project template for generating new projects with `builder-init`. Probably a Yeoman
        generator. (update the Project Structure section above accordingly)
-   [x] Testing (added Karma)
-   [ ] Code coverage (Karma is in place, just need to hook up the tasks)
-   [ ] Continuous integration
-   [ ] Fix the previous caveat in a way that can build for both old and new browsers so that at
        least new browsers don't have a ton of unnecessary overhead in build output. We'll probably
        use `@babel/preset-env` for this.
    -   [ ] Maybe we can offer a dev and production server that can automatically detect browsers
            and serve appropriate builds.
-   [ ] Move babel plugins and transforms to a custom babel preset, so we can keep package.json
        dependencies clean? Other benefits?
