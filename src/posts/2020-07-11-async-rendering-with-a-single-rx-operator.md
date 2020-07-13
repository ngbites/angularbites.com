---
title: Async Rendering with a single Rx Operator
date: 2020-07-11
---

The concept of async rendering, in the way I mean it, is simple: the process of rendering items on screen is scattered so that the browser won't block until all items have been rendered.

So here's how it works: I render item one, then I wait a little bit, then render the next item, and so on. In between, the browser can execute all the other scheduled events in the loop before we let it render again.

### When and Why you should use it, sometimes

When does this work (particularly) well?

- In case we are rendering particularly long and heavy lists
- In case each item of the list takes a lot of space on the page

Why? Your app will "look" faster. It's not going to be *actually* faster, but your users will perceive it as being so. Good enough.

### A single-operator approach

In the past I've solved this in various ways, as I described in [How to Render Large Lists in Angular](https://blog.bitsrc.io/3-ways-to-render-large-lists-in-angular-9f4dcb9b65).

This time I thought of a single operator that would sequentially scatter the rendering process of a subset of the array.

We'll call this operator `lazyArray`. It supports two arguments:

- `delayMs` = how long the browser should wait before it renders the next array
- `concurrency` = how many items to render at once

Just show me the code, Giancarlo!

Alright, here it is:

```typescript
export function lazyArray<T>(
  delayMs = 0,
  concurrency = 2
) {
  let isFirstEmission = true;

  return (source$: Observable<T[]>) => {
    return source$.pipe(
      mergeMap((items) => {
        if (!isFirstEmission) {
          return of(items);
        }

        const items$ = from(items);

        return items$.pipe(
          bufferCount(concurrency),
          concatMap((value, index) => {
            const delayed = delay(index * delayMs);

            return scheduled(of(value), animationFrameScheduler).pipe(delayed);
          }),
          scan((acc: T[], steps: T[]) => {
            return [ ...acc, ...steps ];
          }, []),
          tap((scannedItems: T[]) => {
            const scanDidComplete = scannedItems.length === items.length;

            if (scanDidComplete) {
              isFirstEmission = false;
            }
          }),
        );
      }),
    );
  };
}
```

### Usage

Using it is pretty simple, use it just like any other operator:

```typescript
@Component({ ... })
export class MyComponent {
   items$ = this.service.items$.pipe(
     lazyArray()
   );
}
```

### Let's break it down, shall we?

We want to keep track whether it's the first emission, or not. We only want to render lazily the first time:

```typescript
let isFirstEmission = true;
```


We transform the array into a stream of items:

```typescript
const items$ = from(items);
```

We collect the amount of items into an array based on the concurrency:

```typescript
bufferCount(concurrency),
```

We scheduled the rendering based on the delay, and then progressively increase the delay based on the item's index:

```typescript
concatMap((value, index) => {
  const delayed = delay(index * delayMs);

  return scheduled(of(value), animationFrameScheduler).pipe(delayed);
})
```

We keep collecting the processed items into a single array:

```typescript
scan((acc: T[], steps: T[]) => {
  return [ ...acc, ...steps ];
}, [])
```

Finally, we check if the amount of processed items is as long as the initial list. In this way, we can understand if the first emission is complete, and in case we set the flag to `false`:

```typescript
tap((scannedItems: T[]) => {
  const scanDidComplete = scannedItems.length === items.length;

  if (scanDidComplete) {
    isFirstEmission = false;
  }
})
```

## Demo

I came up with this because my application, Formtoro, loads quite a bit of data at startup that renders lots of Stencil components at once.

It did not work well, it was laggy. I didn't like it, so I found a way to solve it. I'll show you the differences:

Without `lazyArray` operator:

![Without Lazy Array](/assets/images/posts/no-lazy-array.gif)


With `lazyArray` operator:

![With Lazy Array](/assets/images/posts/lazy-array.gif)

This approach works very well in my case - and may not in yours. Shoot me an email if you want help implementing it. Ciao!

***

_If you enjoyed this article, follow me on [Twitter](https://twitter.com/gc_psk)_
