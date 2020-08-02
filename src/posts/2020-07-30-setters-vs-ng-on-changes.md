---
title: 'Setters vs ngOnChanges: which one is better?'
date: 2020-07-30
featuredImage: /assets/images/posts/setters-vs-on-changes.png
tags:
  - angular
---

Getting notified about an Angular component's property changes is normally done in 2 ways:

- adding a setter to the property
- using the `ngOnChanges` lifecycle hook

But... is there a best practice?

This discussion recently came up with my colleagues while trying to establish a standard practice in our codebase. We tried to find objective arguments to understand which one is better.

As usual, the answer depends on the scenario.

## Style

Style is very much a subjective factor, but using a setter is hands-down my favorite approach. Let's take a look at a common scenario:

```typescript
class MyComponent {
  private subject$ = new Subject<string>();

  @Input()
  set name(name: string) {
    this.subject$.next(name);
  }
}
```

It's succinct, type-safe, and encourages the usage of Observables. Not much to dislike, imho.

But can you **not** add a getter?

Yes. It turns out, Angular does not check the previous value by invoking the getter on the property, but stores its value in its component's logical view.

If you're interested in reading the source code where this happens, [check this out](https://github.com/angular/angular/blob/d1ea1f4c7f3358b730b0d94e65b00bc28cae279c/packages/core/src/render3/bindings.ts#L50).

```typescript
class MyComponent implements OnChanges {
  @Input() name: string;

  private subject$ = new Subject<string>();

  ngOnChanges(changes: SimpleChanges) {
    // changes.name.currentValue is typed as `any`
    this.subject$.next(changes.name.currentValue);
  }
}
```

The `ngOnChanges` lifecycle hook, on the contrary, it's not as nice (in my opinion) - and most importantly, is weakly typed.

Also - it's worth to mention that using setters usually takes less code, which is always a good thing.

## Performance

Does performance change much? At first, we thought that `ngOnChanges` would be more efficient as being part of Angular's lifecycle hooks, and therefore being aware of when a property changed.

It turns out, though, that Angular **does only change a property when the binding is a new instance**. Of course, we're taking into account the change detection being `OnPush`.

Performance-wise, according to my tests, there isn't a better way, and shouldn't be a factor when deciding which way to go with.

## Dealing with multiple Inputs

The situation changes when taking into account changes on multiple inputs:

```typescript
class MyComponent implements OnChanges {
  @Input() name: string;
  @Input() email: string;

  private username$ = new Subject<string>();

  ngOnChanges({ name, email }: SimpleChanges) {
    const username = name.currentValue || email.currentValue;
    this.username$.next(username);
  }
}
```

In this case, it's fairly straightforward and simpler to receive all the inputs at once.

But because this situation is pretty uncommon, and sometimes a sign of a _code-smell_, you'll find yourselves wanting to use the setter the majority of the time.

At the end of the day, remember that this decision is always up to you and your team's preferences.

_Thank you for reading, I hope you enjoyed this article. If you did, consider follow me on [Twitter](https://twitter.com/gc_psk) or sign up to the Newsletter using the form below!_
