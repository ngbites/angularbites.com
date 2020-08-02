---
title: Build Typescript libraries for the browser with Nx
date: 2020-07-25
featuredImage: /assets/images/posts/typescript-libraries-with-nx.png
tags:
  - typescript
  - nx
---

I have quite a few libraries in my Nx workspaces, and most of them are built using their tooling (Angular, Stencil).

Also, I have a few vanilla Typescript libraries that need to be consumed within a Browser environment. Originally, I used to bundle them with the builder `@nrwl/web:bundle` - which got deprecated with Nx 9.

I needed to find another way.

The best way I found to achieve an even better result is by using the builder `@nrwl/node:build`, extended with a Webpack configuration.

## Configuration

Here's the configuration that I use to build browser-compatible distributions of my library `sdk`:

```json
"sdk": {
  "root": "libs/sdk",
  "sourceRoot": "libs/sdk/src",
  "projectType": "library",
  "schematics": {},
  "architect": {
    "build": {
      "builder": "@nrwl/node:build",
      "options": {
        "outputPath": "dist/sdk",
        "main": "libs/sdk/src/index.ts",
        "tsConfig": "libs/sdk/tsconfig.lib.json",
        "project": "libs/sdk/package.json",
        "webpackConfig": "libs/sdk/webpack.config.js"
      },
      "configurations": {
        "production": {
          "fileReplacements": [
            {
              "replace": "libs/sdk/src/environments/environment.ts",
              "with": "libs/sdk/src/environments/environment.prod.ts"
            }
          ]
        }
      }
    }
  }
}

```

### Webpack configuration
As you may have noticed, I have also supplied a Webpack configuration file. It's needed, as we want to tell Webpack to produce a browser bundle.

Also, we can extend the configuration with any plugin we want. For example, I used Terser to optimize the size of the output.


```javascript
const TerserPlugin = require('terser-webpack-plugin')

module.exports = (config) => {
  return {
    ...config,
    externals: [],
    target: "web",
    plugins: [
      ...config.plugins,
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          ecma: 6,
        },
      }),
    ],
    devtool: false,
    output: {
      ...config.output,
      filename: 'sdk.umd.js',
      libraryTarget: 'umd',
    },
  };
};
```

### Bundling the Typescript library

In order to bundle the library, I run the following command:

```
> ng run sdk:build
Starting type checking service...
Using 10 workers with 2048MB memory limit
Hash: c02b92c803ac182c3da8
Built at: 07/26/2020 1:00:34 AM
Entrypoint main = sdk.umd.js
chunk    {0} sdk.umd.js (main) 35.3 KiB [entry] [rendered]

———————————————————————————————————————————————

>  NX   SUCCESS  Running target "build" succeeded
```


***

_If you enjoyed this article, follow me on [Twitter](https://twitter.com/gc_psk)_
