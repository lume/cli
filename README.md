# @lume/cli

A command line tool for building, testing, and publishing JavaScript/TypeScript packages.

Write source code (with tests) and don't worry about the specifics of package
management.

NOTE! This is designed with Node.js 13 and native ES Modules in mind.

#### `npm install @lume/cli --global`

## Current Features

-   Build a project's [TypeScript](https://www.typescriptlang.org) source code
    its `src/` folder to a `dist/` output folder.
    -   The output code is in standard ES Module format.
-   Bundle a project's output code into `dist/global.js` for use in
    browser script tags.
    -   The `dist/global.js` file assings the exports of the project entrypoint
        onto a global object with the same name as the project, but camelCased, and
        without the package scope. For example, a package named
        `@foo/something-useful` would result in a global variable named
        `somethingUseful` containing the package exports.
-   Format all code in a project with [`prettier`](https://prettier.io).
-   Run a project's tests (any files ending with `.test.ts` in the project's src/ folder).
    -   Tests use [Jasmine](https://jasmine.github.io)'s `describe()`/`it()` functions for describing unit tests.
    -   Tests run in Karma with karma-electron, so all tests have access to
        Node.js, Electron, and Browser APIs.
-   Publish a project to NPM.

For more details, see `lume --help`.

## Future Features

-   Specify configuration overrides (Webpack options, Karma
    options, etc).
-   Scaffold LUME-based applications.
-   Scaffold LUME elements.
-   Scaffold generic TypeScript packages.
-   Support plain JavaScript, not just TypeScript.

## Projects using LUME CLI

[lume/element](https://github.com/lume/element),
[lume/variable](https://github.com/lume/variable),
[lume/element-behaviors](https://github.com/lume/element-behaviors),
[lume/lume](https://github.com/lume/lume),
[trusktr/lowclass](https://github.com/trusktr/lowclass),
[trusktr/perfect](https://github.com/trusktr/perfect)

Notice in those projects that they have no dependencies on any build tools
and no build configurations; they use `lume` commands for building, testing,
formatting, and publishing packages.

> **NOTE:** This project initially meets needs for my own packages, and as such may not
> be a perfect fit for your needs.
>
> I'd like to make this easy to extend and even more generic to fit any needs, so that only few
> modifications are needed in order to adopt its use for more specific cases (f.e. adding babel
> plugins or webpack loaders and configs). See [TODO](#todos).

## Requirements

-   A Unix-like OS (not tested in Windows).
-   Node v13.2+ (might work with lower versions, not tested)
-   NPM v5+ (might work with lower versions, not tested)
-   If you don't have a graphical display (f.e. in Linux without a desktop on a
    continuous integration server) install xvfb for tests to run headlessly
    without issues - see
    https://github.com/electron/electron/blob/v1.4.10/docs/tutorial/testing-on-headless-ci.md

## Getting Started

There are two ways to install LUME cli.

### Local Install (recommended)

Install the cli as a dev dependency of your project, so you can rely on a
specific version of it with confidence.

**`npm install @lume/cli --save-dev`**

Then use the `npx` command (which ships with `npm` and is used to run local
executables) to run the cli and show the help menu:

**`npx lume --help`**

### Global Install

Install the `lume` command to globally so it is available in any shell:

**`npm install @lume/cli --global`**

If the above fails with permissions errors, you may need to run it with `sudo` (depending on your OS):

**`sudo npm install @lume/cli --global`**

Then run the cli and show the help menu:

**`lume --help`**

> NOTE! Installing `lume` globally may work up to a certain point (at least
> the way the cli currently works, where it does not yet manage internal
> versioning). If you have multiple projects that depend on different versions
> of the `lume` cli with differing and incompatible features, you'll want to
> install specific versions locally in each project instead. In the future,
> the LUME cli will have internal version management.

### No Install (easiest)

Using `npx`, we can also skip installing the LUME cli at all. If `npx` does
not detect a locally-installed version of an executable in a project, it will
default to downloading the latest version of the executable and running it.

Use the `npx` command (which ships with `npm` and is used to run local
executables) to run the cli and show the help menu:

**`npx lume --help`**

> NOTE! This poses a problem similar to the global install option: the latest
> version of the cli downloaded by `npx` may not be the version of LUME cli
> that your project works with. In the future, the LUME cli will have internal
> version management.

## Project setup

### File structure

The general structure of a project mananaged with the `lume` cli is as follows:

```sh
src/               # All source files go here, as well as `.test.ts` files.
  index.ts         # The project's entry point.
  index.test.ts    # A co-located test file.
  ...              # Other files imported by entry point, and associated test files.
dist/              # The folder where build output goes, ignored by version control.
.gitignore         # Things to ignore, like the `dist/` output folder, are listed in here.
package.json       # The project meta file, listing dependencies, scripts, etc.
lume.config.cjs # Optional config options read by `lume` cli, see below.
tsconfig.json      # Optional, TypeScript configuration overrides. Extend from ./node_modules/@lume/cli/config/ts.config.json.
.npmrc             # Used to configure NPM to not use package-lock.json (see why below)
```

The `lume build` command will compile `.ts` files from the `src/` folder,
outputting them as `.js` files along with `.js.map` [source map
files](https://developer.mozilla.org/en-US/docs/Tools/Debugger/How_to/Use_a_source_map)
into the `dist/` folder.

A `dist/global.js` (and its source map file) is also outputted, containing
the global version of the lib that can be easily loaded on a website using a
script tag.

### Set up files

Let's set up `package.json`, `.gitignore`, `.npmrc`, `src/index.ts`, and `src/index.test.ts`.

> NOTE, in the near future we'll add command to LUME cli to scaffold these
> files.

We'll want to have the following things in our `package.json` (not all
`scripts` are required, but this makes them convenient to call with `npm run`
and documents their existence to anyone looking in `package.json` to
understand available actions).

**`package.json`**

```json
{
	"name": "PACKAGE-NAME",
	"version": "0.0.0",
	"license": "MIT",
	"type": "module",
	"main": "dist/index.js",
	"types": "src/index.ts",
	"exports COMMENT:": "This removes 'dist' from import statements, as well as replaces the 'main' field. See https://github.com/nodejs/node/issues/14970#issuecomment-571887546",
	"exports": {
		".": "./dist/index.js",
		"./": "./dist/"
	},
	"scripts": {
		"clean": "lume clean",
		"build": "lume build",
		"dev": "lume dev",
		"typecheck": "lume typecheck",
		"typecheck:watch": "lume typecheckWatch",
		"test": "lume test",
		"test:debug": "lume testDebug",
		"prettier": "lume prettier",
		"prettier:check": "lume prettierCheck",
		"release:patch": "lume releasePatch",
		"release:minor": "lume releaseMinor",
		"release:major": "lume releaseMajor",
		"version": "lume versionHook",
		"postversion": "lume postVersionHook",
		"prepack": "npm run build"
	}
}
```

Where `PACKAGE-NAME` would be the actual name of our package.

We should ignore some things in a `.gitignore` file.

**`.gitignore`**

```sh
node_modules/ # project dependencies
package-lock.json # ignore package-lock.json files.
dist/ # build output
*.log # log files in case of errors, etc
```

If we're making a package, and not an application, then we'll make sure
`.npmrc` tells `npm` not to create `package-lock.json` files. NPM packages do
not use package-lock files (`npm publish` will not publish them), while
applications do. By not having lock files during package development, it
becomes easier to catch in-range breaking changes that may affect end users,
and we'll be more prepared to act on it.

**`.npmrc`**

```conf
package-lock=false
```

Note, although this `.npmrc` config causes `npm` not to make the files, we
still add it to `.gitignore` because popular tools like
[Lerna](https://lerna.js.org) still output lock files regardless.

Lastly, let's create `src/index.ts` with some sample code and ensure that it
exports the project's version number at the very bottom:

**`src/index.ts`**

```ts
export function isAwesome(thing: string) {
	return `${thing} is awesome.`
}

export const version = '0.0.0'
```

The `lume release*` commands will automatically update both the exported
`version` variable in `src/index.ts` and the `version` field in
`package.json`.

> NOTE! At the moment the release commands will throw an error if they don't
> find this line at the bottom of the entrypoint.

Finally lets write a test file to test our nifty `isAwesome` function.

**`src/index.test.ts`**

```ts
import {isAwesome} from './index'

describe('isAwesome', () => {
	it('is a function', () => {
		expect(isAwesome).toBeInstanceOf(Function)
	})

	it('says things are awesome', () => {
		expect(isAwesome('Code')).toBe('Code is awesome.')
	})
})
```

This is enough to get a project bootstrapped. There will be more on how to
configure build and test settings below using `lume.config.cjs` and
`tsconfig.json` files.

## Managing a project

Now that we've bootstrapped our project, the following are the basic commands
we'll want to run to manage the life cycle of our project. For sake of
simplicity, the following examples assume that `lume` was installed globally
as per the "Global Install" option above.

-   `lume test`
    -   Run tests (all `.test.ts` files).
    -   Exits with a non-zero error code if any test fails
-   `lume dev`
    -   "dev" for "development mode"
    -   Builds all code, and rebuilds it automatically if any file changes.
    -   This is useful while developing a project, so that any time we edit
        files, the project will automatically rebuild.
-   `lume build`
    -   Does a production build, and does not watch for file changes.
    -   Generally you don't need to run this unless you need to debug production
        code, which isn't common but sometimes there can be issues with
        minification.
-   `lume releasePatch`, `lume releaseMinor`, `lume releaseMajor`
    -   Updates the version of the project in `package.json` and `src/index.ts`.
    -   Publishes the project to NPM under the new version number only if build
        and tests pass. It basically runs `lume build` and `lume test`
        internally.
    -   Pushes the a version commit and tag to the remote git repo.

For more commands and details, run `lume --help`.

## Configuration

The `lume.config.cjs` and `tsconfig.json` files can be used for
configuration.

Various parts of the build/test/publish process can be configured with a
`lume.config.cjs` file at the root of the project. The following example
shows the available options (so far) with their defaults.

**`lume.config.cjs`**

```js
module.exports = {
	// If set to a truthy value, the global build will be skipped. This is
	// useful for packages that are meant only for Node.js and not intended for
	// use in brosers.
	//
	// Default: false
	skipGlobal: false,

	// If set to `false` or an empty string, then the global build will not add
	// a global variable into the environment, which is useful for libraries
	// that may instead expose their own globals in a custom way, or some other
	// sideeffects.
	//
	// Otherwise, the library's exports will be assigned onto a global variable
	// of the name defined here.
	//
	// If omitted, this defaults to the name of the package (minus the @scope/
	// part if the package name is scoped and converted to camelCase if the name
	// has dashes).
	//
	// Default: undefined (uses the name of the package)
	globalName: 'example', // A string, `false`, or `undefined`

	// This is an array of entrypoints that global builds will be made from, and
	// the output bundles will be placed in `dist/global/`. These should
	// correspond to files at the top level of src. For example, the following
	// will build a take `src/one.ts` and `src/two.ts` and output
	// `dist/global/one.js` and `dist/global/two.js`
	//
	// These entry points are built into global scripts in addition to the
	// default one built from `src/index.ts`.
	//
	// Default: []
	globalEntrypoints: ['one', 'two'],

	// Run all tests 6 times instead of once, each time using one of the six
	// possible TypeScript and Babel decorator configurations. Packages that
	// export decorators would want to use this option to ensure that the
	// decorators work in every TS/Babel build configuration.
	//
	// Default: false
	testWithAllTSAndBabelDecoratorBuildConfigurations: true,
}
```

To configure (override) TypeScript compiler options, create a `tsconfig.json`
file at the root of your project that extends from
`./node_modules/@lume/cli/config/ts.config.json`, and override any settings as
needed (to know the default settings see that
[file](./config/ts.config.json)).

**`tsconfig.json`**

```jsonc
{
	"extends": "./node_modules/@lume/cli/config/ts.config.json",
	"compilerOptions": {
		"target": "es5"
	}
}
```

## Caveats

This uses TypeScript for transpiling all code. To customize build options,
you will need to get familiar with TypeScript's [compiler
options](https://www.typescriptlang.org/docs/handbook/compiler-options.html).

If you lower TypeScript's compiler `target` to ES5 or lower, you may need to
enable the `downlevelIteration` option if you need spec-compliant for..of
loops (for example if you depend on in-place modification of iterables like
Set while iterating on them, etc).

## TODOs

-   [ ] Add support for JSX (specifically Solid JSX expressions which requires Babel).
-   [ ] Allow override of Webpack config
-   [x] Don't commit global.js (and its map) on version changes, we can tell people to get it from
        unpkg, GitHub, and how to build it.
-   [ ] Output both a global.js and global.min.js
-   [x] Source maps! Important!
-   [x] Important! Don't run `git stash` during version script if there's nothing to stash,
        otherwise it will pop a previous stash after `npm version` is done.
-   [ ] Ability to scaffold applications.
-   [ ] Ability to scaffold packages.
-   [x] Testing (added Karma)
-   [ ] Code coverage (Karma is in place, we just need to hook up a code coverage tool)
-   [ ] GitHub Actions configuration for scaffolded apps and packages.
-   [ ] Detect the entrypoint's `version` export, and skip updating it if not
        found (instead of exiting with an error).
