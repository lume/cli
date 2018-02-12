
builder-js-package
========================

A generic build setup for JavaScript packages.

#### `npm i builder-js-package --save-dev`

**Short version:** Write source code and don't worry about how make it work
everywhere.

**Long version:** A [Builder
archetype](https://github.com/FormidableLabs/builder) (i.e. shared project
structure, shared build configuration, and shared tasks and procedures) for
making, building, and publishing JS-only packages in a way that makes them:

- compatible in many different build systems and environments (f.e.
  Webpack, Rollup, Babel, Meteor, RequireJS, globals, Node.js)
- consumable in with different module formats like AMD, UMD, CommonJS, and ES
  Modules
- publishable to different registries like NPM, Bower, and JSPM

Example projects using this Builder archetype are:

- [trusktr/perfect](https://github.com/trusktr/perfect)

Notice in those projects that they have no dependencies on any build tools and
no build configurations, and that they reference only this shared Builder
archetype.

> **NOTE:** This project initially meets needs for my own JavaScript packages,
> and as such may not be a perfect fit for your needs.
> 
> I'd like to make this easy to extend and even more generic to fit any needs,
> so that only few modifications are needed in order to adopt its use for more
> specific cases (f.e. adding babel plugins or webpack loaders and configs).
> See [TODO](#todos).

Project Structure
=================

(**Note!** This part is TODO, but shared configs and procedures work. For now,
see the above example projects, which all share a similar structure, to get an
idea of how to structure a project in order to use this Builder archetype)

`build-init builder-js-package` will create a new project with the following
structure. If you have an existing package that you'd like to use this on, then
you will have to modify it to follow the following structure.

```js
src              # all source files go here
  index.js       # entry point
  index.test.js  # co-located test files
  ...            # any other files imported by entry point, and associated test files
dist             # will contain build output
package.json
.builderrc
```

The name field in package.json (the published npm package name) is assumed to
be the desired file name of the distribution files and dash-cased.

So, if a package.json has:

```json
{
  "name": "my-awesome-lib"
}
```

The distribution files to output are:

```
dist/my-awesome-lib.js
dist/my-awesome-lib.js.map
dist/my-awesome-lib.min.js
dist/my-awesome-lib.min.js.map
```

Caveat
======

This Builder archetype uses a combination of Buble + Babel to build code.
Specifically, it transpiles `for..of` loops with Buble, which means the result
is not spec compliant, but leaner and faster in many cases although it will not
work with Iterators and Generators.

See [here in the Buble
docs](https://buble.surge.sh/guide/#unsupported-features) for more details.

This means, in projects built with this Builder archetype, you'll have to
either not iterate on things like `Map` or `Set` using `for..of` directly (f.e.
use `Array`s instead), or use `Array.from`. For example:

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

TODOs
====

- [ ] Source maps! Important! Coming very soon...
- [ ] A project template for generating new projects with `builder-init`. (then
  update the Project Structure section above)
- [ ] Testing configs and procedures
- [ ] Code coverage
- [ ] Continuous integration
- [ ] Fix the previous caveat in a way that can build for both old and new
  browsers to that at least new browsers don't have a ton of unnecessary
  overhead in build output. We'll probably use `@babel/preset-env` for this.
- [ ] Maybe we can offer a dev and production server that can automatically
  detect browsers and serve appropriate builds.
