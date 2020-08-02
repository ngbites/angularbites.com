---
title: Using the Intersection Observer API with Angular
date: 2020-08-01
featuredImage: /assets/images/posts/intersection-observer.png
description: This article shows how to build a directive with Angular that uses the Intersection Observer API to check when an element becomes visible on the page
tags:
  - angular
  - performance
---

## Intersection Observer: what is it?

The `Intersection Observer` API is a relatively new functionality in web browsers that can allows us to listen to events when an element’s visibility on the page changes.

Thanks to Angular's directives, we can create a reusable way to use this API in a declarative and easy way.

### Use-Cases of the Intersection Observer
Why would you want to use this API?

- Improving performance by instantiating only the objects that that are visible to the users
- Improving efficiency by only loading the assets (images, fonts, etc.) used by the visible items
- Implement parallax effects and much, much more

Personally, I'm very intrigued by the possible performance and efficiency gains enabled by the API - which is what led me to make this directive in the first place.

### Debouncing

The `directive` we will be using will also enable an important factor not supported by the API: debouncing.

Imagine your user is scrolling a list very quickly, and your `Intersection Observer` emits the element as "visible". Was it, though?

In my specific scenario, I was loading fonts from Google Fonts when an item was visible for more than 250ms: that tells me the user may have stopped scrolling.

## Creating a directive that uses an Intersection Observer

Let's create this directive, step by step. We will call this directive `ObserveVisibilityDirective`.

### Inputs & Outputs
First, we define our inputs and outputs:

```typescript
@Input() debounceTime = 0;
@Input() threshold = 1;

@Output() visible = new EventEmitter<HTMLElement>();
```

- `debounceTime`: we've already introduced what debounceTime is, but you should know that by default it is 0, as it is how the API would work
- `threshold`: the threshold property indicates at what percentage the callback should be executed. By default, right away.
- `visible`: we will use the output to notify the parent when an element is visible

### Creating the Observer

First, we save an instance of the Observer on our class:

```typescript
private observer: IntersectionObserver | undefined;
```

Additionally, we also want to create an instance of a Subject which will act as an intermediate messaging bus which we will use to debounce the items' emissions:

```typescript
private subject$ = new Subject<{
  entry: IntersectionObserverEntry;
  observer: IntersectionObserver;
}>();
```

When the component is initialized, we instantiate the Observer.

The following will:
- instantiate the `Observer`
- for each items called in the callback, we check if the item is "intersecting"
- if yes - then emit the entry via the `Subject`

```typescript
private createObserver() {
    const options = {
      rootMargin: '0px',
      threshold: this.threshold,
    };

    const isIntersecting = (entry: IntersectionObserverEntry) =>
      entry.isIntersecting || entry.intersectionRatio > 0;

    this.observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (isIntersecting(entry)) {
          this.subject$.next({ entry, observer });
        }
      });
    }, options);
  }
```

When the view is initialized, we call the method `startObservingElements`.

- We use the observer to observe the `host element` of the directive
- We subscribe to the `Subject` and delay the emission using the `debounceTime` input's value
- When the Subject emits, we check again if the element is visible using a one-off Intersection Observer promise
- If the element is still visible, then we emit the Output and notify the listeners that the element is visible and has been visible for the specified `debounceTime` time

```typescript
private isVisible(element: HTMLElement) {
  return new Promise(resolve => {
    const observer = new IntersectionObserver(([entry]) => {
      resolve(entry.intersectionRatio === 1);
      observer.disconnect();
    });

    observer.observe(element);
  });
}

private startObservingElements() {
  if (!this.observer) {
    return;
  }

  this.observer.observe(this.element.nativeElement);

  this.subject$
    .pipe(delay(this.debounceTime), filter(Boolean))
    .subscribe(async ({ entry, observer }) => {
      const target = entry.target as HTMLElement;
      const isStillVisible = await this.isVisible(target);

      if (isStillVisible) {
        this.visible.emit(target);
        observer.unobserve(target);
      }
    });
}
```

### Using the directive

Here's an example of how you could use the directive with a very very long list.

The `visible` output will tell you when the item is finally visible for at least 300ms - which could mean the user isn't scrolling anymore. In some cases you may want this number to be lower.

```html
<ng-container *ngFor="let item of longList">
    <app-item
        observeVisibility
        [debounceTime]="300"
        (visible)="onVisible(font)"
    ></app-item>
</ng-container>

```

### The full directive's code

Here's the full source code of the Directive:

```typescript
@Directive({
  selector: '[observeVisibility]',
})
export class ObserveVisibilityDirective
  implements OnDestroy, OnInit, AfterViewInit {
  @Input() debounceTime = 0;
  @Input() threshold = 1;

  @Output() visible = new EventEmitter<HTMLElement>();

  private observer: IntersectionObserver | undefined;
  private subject$ = new Subject<{
    entry: IntersectionObserverEntry;
    observer: IntersectionObserver;
  }>();

  constructor(private element: ElementRef) {}

  ngOnInit() {
    this.createObserver();
  }

  ngAfterViewInit() {
    this.startObservingElements();
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = undefined;
    }

    this.subject$.next();
    this.subject$.complete();
  }

  private isVisible(element: HTMLElement) {
    return new Promise(resolve => {
      const observer = new IntersectionObserver(([entry]) => {
        resolve(entry.intersectionRatio === 1);
        observer.disconnect();
      });

      observer.observe(element);
    });
  }

  private createObserver() {
    const options = {
      rootMargin: '0px',
      threshold: this.threshold,
    };

    const isIntersecting = (entry: IntersectionObserverEntry) =>
      entry.isIntersecting || entry.intersectionRatio > 0;

    this.observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (isIntersecting(entry)) {
          this.subject$.next({ entry, observer });
        }
      });
    }, options);
  }

  private startObservingElements() {
    if (!this.observer) {
      return;
    }

    this.observer.observe(this.element.nativeElement);

    this.subject$
      .pipe(delay(this.debounceTime), filter(Boolean))
      .subscribe(async ({ entry, observer }) => {
        const target = entry.target as HTMLElement;
        const isStillVisible = await this.isVisible(target);

        if (isStillVisible) {
          this.visible.emit(target);
          observer.unobserve(target);
        }
      });
  }
}
```

_Thank you for reading, I hope you enjoyed this article. If you did, consider follow me on [Twitter](https://twitter.com/gc_psk) or sign up to the Newsletter using the form below!_
