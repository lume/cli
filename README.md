# @lume/cli

A command line tool for building, testing, and publishing JavaScript/TypeScript packages.

Write source code (with tests) and don't worry about the specifics of package
management.

NOTE! This is designed with Node.js native ES Modules (ESM) in mind.

#### `npm install @lume/cli --global`

## Current Features

The following is a brief overview of LUME cli's features. For more details,
see `lume --help`.

- Build a project's [TypeScript](https://www.typescriptlang.org) source code
  from its `src/` folder to a `dist/` output folder.
  - The output code is in standard ES Module format.
- Ability to bundle a project's output code into `dist/global.js` for use in
  browser script tags.
  - The `dist/global.js` file assings the exports of the project entrypoint
    onto a global object with the same name as the project, but camelCased, and
    without the package scope. For example, a package named
    `@foo/something-useful` would result in a global variable named
    `somethingUseful` containing the package exports.
  - Allows for multiple global entry points to be specified (outputs multiple
    global scripts for use with script tags in `dist/global/`). See config
    options below.
- Formats all code in a project with [`prettier`](https://prettier.io).
- Run a project's tests (any files ending with `.test.ts` in the project's src/ folder).
  - Tests use [Jasmine](https://jasmine.github.io)'s `describe()`/`it()` functions for describing unit tests.
  - Tests run in Karma with karma-chrome-launcher, so all tests have access Chrome Browser APIs.
  - If global scripts were built, it allows for testing those separately to
    ensure global builds works like with regularly-imported code.
- Publish a project to NPM.

## Future Features

- Specify configuration overrides (Webpack options, Karma
  options, etc).
- Scaffold LUME-based applications.
- Scaffold LUME elements.
- Scaffold generic TypeScript packages.
- Support plain JavaScript, not just TypeScript.

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

> **NOTE:** This project initially meets needs for LUME packages, and as such may not
> be a perfect fit for everyone's needs.
>
> I'd like to make this easy to extend and even more generic to fit any needs, so that only few
> modifications are needed in order to adopt its use for more specific cases (f.e. adding babel
> plugins or webpack loaders and configs). See [TODO](#todos).

## Requirements

- A Unix-like OS (not tested in Windows).
- Node v12.4+ or v13.2+ (might work with lower versions, not tested)
- NPM v5+ (might work with lower versions, not tested)
- If you don't have a graphical display (f.e. in Linux without a desktop on a
  continuous integration server) install xvfb for tests to run headlessly
  without issues

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
		"prepare": "npm run build"
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
> find this line at the bottom of the entrypoint. We'll make this optional in
> the near future.

Lets write a test file to test our nifty `isAwesome` function.

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

This is enough to get a project bootstrapped. To learn more on how to
configure build and test settings with `lume.config.cjs` and `tsconfig.json`
files, see [Configuration](#configuration) below.

We may want to test that the global build of our package works too. For
this, we can specify a `src/global.test.ts` file, or `.test.ts` files in
`src/global/`.

For example, we can ensure that our global build loads our `isAwesome` API
globally in a global variable without any issues by writing the following
`src/global.test.js` file, assuming that we've chosen our package's name to be
`AwesomeLib` (by replacing `PACKAGE-NAME` in the above example with
`AwesomeLib`):

```ts
// Note! In this file, we do not import our lib, it will be loaded globally
// (the test setup will automatically load the global file).

describe('AwesomeLib global build', () => {
	it('provides the AwesomeLib API as a global variable', () => {
		expect(window.AwesomeLib).toBeInstanceOf(Object)
		expect(AwesomeLib.isAwesome).toBeInstanceOf(Function)
	})
})
```

We can specify the name of the global variable to be different than the
pacakge name (see [Configuration](#configuration) below).

## Managing a project

Now that we've bootstrapped our project, the following are the basic commands
we'll want to run to manage the life cycle of our project. For sake of
simplicity, the following examples assume that `lume` was installed globally
as per the "Global Install" option above.

- `lume test`
  - Run tests (all `.test.ts` files).
  - Exits with a non-zero error code if any test fails
  - If there are any `dist/global.test.js` or `dist/global/*.test.js`
    files, they will be ran in a separate test run. This allows for testing
    the global build of a package independently.
- `lume dev`
  - "dev" for "development mode"
  - Builds all code, and rebuilds it automatically if any file changes.
  - This is useful while developing a project, so that any time we edit
    files, the project will automatically rebuild.
- `lume build`
  - Does a production build, and does not watch for file changes.
  - Generally you don't need to run this unless you need to debug production
    code, which isn't common but sometimes there can be issues with
    minification.
- `lume releasePatch`, `lume releaseMinor`, `lume releaseMajor`
  - Updates the version of the project in `package.json` and `src/index.ts`.
  - Publishes the project to NPM under the new version number only if build
    and tests pass. It basically runs `lume build` and `lume test`
    internally.
  - Pushes the a version commit and tag to the remote git repo.

For more commands and details, run `lume --help`.

## Configuration

The `lume.config.cjs` and `tsconfig.json` files can be used for
configuration.

**`lume.config.cjs`**

Various parts of the build/test/publish process can be configured with a
`lume.config.cjs` file at the root of the project. The following example
shows the available options (so far) with their defaults.

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

	// If provided, this will be called with the final array of Webpack configs
	// that the cli created, providing an opportunity to make custom
	// modifications to the webpack configs on top of what the cli already made.
	webpackConfigs(configs) {
		// modify configs
	},

	// Run all tests 6 times instead of just once, each time using one of the
	// six possible TypeScript and Babel decorator configurations. Packages that
	// export decorators should set this to true to ensure that the decorators
	// will work in every TS/Babel build configuration in which the code may be
	// possibly imported.
	//
	// Default: false
	testWithAllTSAndBabelDecoratorBuildConfigurations: true,
}
```

**`tsconfig.json`**

To configure (override) TypeScript compiler options, create a `tsconfig.json`
file at the root of the project that extends from
`./node_modules/@lume/cli/config/ts.config.json`, and override any settings
as needed (to see what LUME cli's default settings are, see that
[./config/lume.config.ts](./config/ts.config.json)).

See the [TypeScript compiler
options](https://www.typescriptlang.org/docs/handbook/compiler-options.html)
For TypeScript-specific build and type-checking configuration.

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

- [ ] Add support for JSX (specifically Solid JSX expressions which requires Babel).
- [ ] Allow overriding of Webpack config.
- [ ] Allow overriding of Babel config.
- [x] Don't commit global.js (and its map) on version changes, we can tell people to get it from
      unpkg, GitHub, and how to build it.
- [ ] Output both a global.js and global.min.js
- [x] Source maps! Important!
- [x] Important! Don't run `git stash` during version script if there's nothing to stash,
      otherwise it will pop a previous stash after `npm version` is done.
- [ ] Ability to scaffold applications.
- [ ] Ability to scaffold packages.
- [x] Testing (added Karma)
- [ ] Code coverage (Karma is in place, we just need to hook up a code coverage tool)
- [ ] GitHub Actions configuration for scaffolded apps and packages.
- [ ] Switch to a separate `src/version.ts` file for the version number
      export. Skip updating it if it doesn't exist.
