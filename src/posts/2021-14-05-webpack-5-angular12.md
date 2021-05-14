---
title: "Benchmarking Angular 12 with Webpack 5"
date: 2021-05-14
featuredImage: /assets/images/posts/benchmarking-webpack-5.png
description: Angular 12 has been released and with it the much awaited Webpack 5 upgrade. In this post I benchmarked the bundle-size and compilation speed against the previous version.
tags:
- angular
---

Angular 12 has just been released! Yay!

This is a particularly long-awaited release due to the CLI using Webpack 5 by default, which comes with improved performance and tree-shaking.

That means, faster and smaller builds. Who doesn't like that?

I took the time to benchmark 2 apps I work on, one small and another medium-sized: read on to see the results.

**Notice:**: The results can differ wildly given your setup and applications, so please don't take this benchmarks too seriously.

Actually, I'd love to know what your results will end up being!

### Setup

The tests have been done on a Macbook Pro 2018 i7 2.2Ghz 32Gb RAM - using Node v16.

## Webpack 5 vs Webpack 4: Small Application benchmark

### Development Build Time

The following graph shows the results for the **initial** development build time.

```bar-chart
---
width: 700
height: 300
---
Version, Time in Seconds
Webpack 4,30.1
Webpack 5,32.9
```

- Webpack 4: 30.1 seconds
- Webpack 5: 32.9 seconds

As you can see, the new Webpack version falls behind nearly 3 seconds - which is a bit of a bummer.

### Production Build Time

The following graph shows the results for the production build time. The version 5 makes up for falling behind in the development build.

```bar-chart
---
width: 700
height: 300
---
Version, Time in Seconds
Webpack 4,58.1
Webpack 5,51.8
```

- Webpack 4: 58.1 seconds
- Webpack 5: 51.8 seconds

I was positively impressed by this one, 7 seconds is pretty noticeable.

### Production Bundle Size

The following graph shows the results for the total production bundle size.

That means, we take into account the total size of all the initial assets (main, styles, polyfills, runtime).

The total size is **not** gzipped.

```bar-chart
---
width: 700
height: 300
---
Version, Size in kb
Webpack 4,833.29
Webpack 5,830.19
```

- Webpack 4: 833.29kb
- Webpack 5: 830.19kb

Webpack 5 wins the production race - although maybe not by as much as we'd all hoped!

## Webpack 5 vs Webpack 4: Large Application benchmark

### Development Build Time

```bar-chart
---
width: 700
height: 300
---
Version, Time in Seconds
Webpack 4,74
Webpack 5,84.5
```

- Webpack 4: 74 seconds
- Webpack 5: 84.5 seconds

10 seconds longer for starting the development build is unfortunately a lot more.

### Production Build Time

The following graph shows the results for the production build time. The version 5 makes up for falling behind in the development build.

```bar-chart
---
width: 700
height: 300
---
Version, Time in Seconds
Webpack 4,137.2
Webpack 5,134.1
```

- Webpack 4: 1 minute 37 seconds
- Webpack 5: 1 minute 34 seconds

### Production Bundle Size

```bar-chart
---
width: 700
height: 300
---
Version, Size in Mb
Webpack 4,1.961
Webpack 5,1.970
```

- Webpack 4: 1.961Mb
- Webpack 5: 1.970Mb

***

If you want, do shoot me an email and let me know what your results will look like!

_If you enjoyed this article, follow me on [Twitter](https://twitter.com/gc_psk)_
