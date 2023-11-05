# @lume/cli

A command line tool for building, testing, and publishing JavaScript/TypeScript packages.

Write source code (with tests) and don't worry about the specifics of package
management.

`@lume/cli` is designed with ES Modules (ESM), i.e. JavaScript modules, in mind. CommonJS is not supported.

#### `npm install @lume/cli --global`

## Current Features

The following is a brief overview of LUME cli's features. For more details,
see `lume --help`.

- Build a project's [TypeScript](https://www.typescriptlang.org) source code
  from its `src/` folder to a `dist/` output folder.
  - The output code is in standard ES Module format.
- Formats all code in a project with [`prettier`](https://prettier.io).
- Run a project's tests (any files ending with `.test.ts` in the project's src/
  folder) with the excellent
  [`@web/test-runner`](https://modern-web.dev/docs/test-runner/overview/).
  - Tests use [Mocha](https://mochajs.org)'s `describe()`/`it()` functions for describing unit tests.
  - Tests use Jest's [`expect()`](https://jestjs.io/docs/expect) library for assertions (`expect` is global, don't `import` it, TODO: type definition for `expect()`)
  - Tests run in Google Chrome (TODO: `@web/test-runner` has more browser launchers, expose more options).
- Publish a project to NPM.

## Future Features

- Allow more configuration overrides (f.e. `@web/test-runner` options).
- Scaffold LUME-based applications.
- Scaffold LUME elements.
- Scaffold generic packages.
- Ensure full support of plain JavaScript (untested, as Lume packages are all
  TypeScript, but if it doesn't already work, it probably requires minimal
  changes)

## Projects using LUME CLI

[lume/element](https://github.com/lume/element),
[lume/variable](https://github.com/lume/variable),
[lume/element-behaviors](https://github.com/lume/element-behaviors),
[lume/lume](https://github.com/lume/lume),
[trusktr/lowclass](https://github.com/trusktr/lowclass),
[trusktr/perfect](https://github.com/trusktr/perfect)

Notice in those projects that they have no dependencies on any build tools directly
and no build configurations; they use `lume` commands for building, testing,
formatting, and publishing in a common way.

> [!Note]
> This project initially meets needs for LUME packages, and as such may not
> be a perfect fit for everyone's needs.
>
> I'd like to make this easy to extend and even more generic to fit any needs, so that only few
> modifications are needed in order to adopt its use for more specific cases (f.e. adding Babel
> or `@web/test-runner` plugins). See [TODO](#todos).

## Requirements

- Linux or macOS if publishing commands will be used, otherwise any OS for all other commands.
- One of the latest two LTS versions of Node.js (might work with lower versions, not tested)
- One of the lataest two versions of NPM (might work with lower versions, not tested)

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

Install the `lume` command globally so it is available in any shell:

**`npm install @lume/cli --global`**

If the above fails with permissions errors, you may need to run it with `sudo` in Linux/macOS or Admin priviliges in Windows:

**`sudo npm install @lume/cli --global`**

Then run the cli and show the help menu:

**`lume --help`**

> [!Important]
> Installing `lume` globally may work up to a certain point (at least
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

> [!Important]
> This poses a problem similar to the global install option: the latest
> version of the cli downloaded by `npx` may not be the version of LUME cli
> that your project works with. In the future, the LUME cli may have internal
> version management.

## Project setup

### File structure

The general structure of a project mananaged with the `lume` cli is as follows:

```sh
src/               # All source files go here, as well as `.test.ts` files.
  index.ts         # The project's entry point.
  index.test.ts    # A co-located test file.
  ...              # Other files imported by entry point, and associated test files.
dist/              # The folder where build output goes (you might ignore this folder in your version control system).
.gitignore         # Things to ignore, like the `dist/` output folder, are listed in here.
package.json       # The project meta file, listing dependencies, scripts, etc.
lume.config.cjs    # Optional config options read by `lume` cli, see below.
tsconfig.json      # Optional, TypeScript configuration overrides. Extend from ./node_modules/@lume/cli/config/ts.config.json.
```

The `lume build` command will compile `.ts` files from the `src/` folder,
outputting them as `.js` files along with `.js.map` [source map
files](https://developer.mozilla.org/en-US/docs/Tools/Debugger/How_to/Use_a_source_map)
into the `dist/` folder. It will also output `.d.ts` and `.d.ts.map` files for
type definitions and mapping from type definitions back to `.ts` sources files.

### Set up files

Let's set up `package.json`, `.gitignore`, `src/index.ts`, and `src/index.test.ts`.

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
dist/ # build output (unless you want to commit output JS files)
*.log # log files in case of errors, etc
```

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
import {isAwesome} from './index.js'

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

## Configuration

The `lume.config.cjs` and `tsconfig.json` files can be used for
configuration.

**`lume.config.cjs`**

Various parts of the build/test/publish process can be configured with a
`lume.config.cjs` file at the root of the project. The following example
shows the available options (so far) with their defaults.

```js
module.exports = {
	// Run all tests 6 times instead of just once, each time using one of the
	// six possible TypeScript and Babel decorator configurations. Packages that
	// export decorators should set this to true to ensure that the decorators
	// will work in every TS/Babel build configuration in which the code may be
	// possibly imported.
	//
	// Default: false
	testWithAllTSAndBabelDecoratorBuildConfigurations: true,

  // EXPERIMENTAL
	// Whether or not to run the TypeScript compiler in project reference mode
	// (--build) for incremental compilation. This requires some advanced
	// configuration of tsconfig.json.
	//
	// Default: false
	tsProjectReferenceMode: true,

	// The figlet font to use when your project's name is displayed at the
	// beginning of `lume build`. Info: https://www.npmjs.com/package/figlet
  //
	// Example:
	//   _   _      _ _        __        __         _     _ _ _
	//  | | | | ___| | | ___   \ \      / /__  _ __| | __| | | |
	//  | |_| |/ _ \ | |/ _ \   \ \ /\ / / _ \| '__| |/ _` | | |
	//  |  _  |  __/ | | (_) |   \ V  V / (_) | |  | | (_| |_|_|
	//  |_| |_|\___|_|_|\___/     \_/\_/ \___/|_|  |_|\__,_(_|_)
	//
	// Default: 'ICL-1900'
	figletFont: 'Ghost',

	// If true, transpile TypeScript code with Babel instead of TypeScript. The
	// `tsc` command will be used only for type checking, while the actual code
	// transpilation will be done with `babel`.
	//
	// This can be useful, for example, when TypeScript doesn't support a feature
	// Babel does. For example, at the time of writing this, Babel had Stage 3
	// decorators, while TypeScript did not.
	//
	// NOTE! If you do not use this option, the legacy version of decorators will
	// be used. This option must be `true` if you wish to use the current
	// decorator spec.
	//
	// Default: true
	useBabelForTypeScript: false,

	// A path (if not absolute, then relative to the working directory) to a file
	// that has ignore rules in it. This is useful for cases when we want `lume
	// prettier` to use a specific ignore file, but otherwise (for example) want
	// our IDE to use the default .prettierignore file. In the `lume` repo, we
	// want the IDE to format on save in any file we are editing, even in
	// sub-workspaces, but we want `lume prettier` to format only files in the top
	// level workspace.
	//
	// Default: The `.prettierignore` in your project if it exists, otherwise "./node_modules/@lume/cli/.prettierignore".
	prettierIgnorePath: './path/to/.some-other-ignore-file',

	// The import map to use for `@web/test-runner`, which runs tests as native
	// JavaScript modules in a browser. The import map is needed for mapping
	// import specifiers to URLs from which to get those imports. Learn about import maps here:
	// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap
	//
	// Default: {}
	importMap: {
		imports: {
			// If we `npm install`ed `some-package`, then we tell web test-runner where to get it from:
			'some-package': '/node_modules/some-package/dist/index.js',
		},
	},
}
```

**`tsconfig.json`**

To configure (override) TypeScript compiler options, create a `tsconfig.json`
file at the root of the project that extends from
`./node_modules/@lume/cli/config/ts.config.json`, and override any settings
as needed (to see what LUME cli's default settings are, see
[./config/ts.config.ts](./config/ts.config.json)).

> [!Note]
> If you don't wish to override anything, then `tsconfig.json` is not necessary,
> Lume cli will automatically use its own config during `lume build`. However,
> IDEs by default look for `tsconfig.json` for configuration, so if you want your
> IDE to use the same configuration, you can make an empty config that only
> `extends` from Lume's.

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

## Managing a project

Now that we've bootstrapped our project, the following are the basic commands
we'll want to run to manage the life cycle of our project.
For sake of
simplicity, the following examples assume that `lume` was installed globally
as per the "Global Install" option above.

- `lume dev`
  - "dev" for "development mode"
  - Builds all code, and rebuilds it automatically if any file changes.
  - This is useful while developing a project, so that any time we edit
    files, the project will automatically rebuild.
- `lume prettierCheck`
  - Check that files are formatted well.
  - Exits with a non-zero error code if any files don't pass, showing failed files in the output.
- `lume prettier`
  - Format all files.
- `lume test`
  - Run tests (all `.test.js` files in `dist/`). Run `lume build` first if you are not already running `lume dev`.
  - Exits with a non-zero error code if any test fails, showing failed tests in the output.
- `lume test --watch`
  - Run tests in watch mode. This is useful while running `lume dev` so that
    tests automatically re-run as soon as `dist/` is updated.
- `lume build`
  - Does a production build, and does not watch for file changes.
  - Currently this doesn't do anything except _not watch_ files to rebuild on
    file changes. In the future, we might decide to minify output modules, etc.
- `lume releasePatch`, `lume releaseMinor`, `lume releaseMajor`, etc
  - Updates the version of the project in `package.json` and `src/index.ts`.
  - It runs `lume clean && lume build && lume test` to ensure code is in
    working condition.
  - Publishes the project to NPM using the new version number only if build and
    tests pass.
  - Pushes a version commit and tag to the remote git repo, including updated
    `dist/` which exports the new version number in `dist/index.js`.

For more commands and details, run `lume --help`.

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
- [ ] Allow overriding of Babel config.
- [x] Source maps! Important!
- [x] Important! Don't run `git stash` during version script if there's nothing to stash,
      otherwise it will pop a previous stash after `npm version` is done.
- [ ] Ability to scaffold applications.
- [ ] Ability to scaffold packages.
- [x] Testing (we're using `@web/test-runner`)
- [ ] Code coverage (configure web test-runner, https://modern-web.dev/docs/test-runner/writing-tests/code-coverage/)
- [ ] Enable visual regression testing (https://github.com/modernweb-dev/web/tree/master/packages/test-runner-visual-regression)
- [ ] Switch to a separate `src/version.ts` file for the version number
      export. Skip updating it if it doesn't exist instead of crashing.
