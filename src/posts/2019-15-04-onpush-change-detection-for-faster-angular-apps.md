---
date: 2019-04-15
title: OnPush change detection for faster Angular apps
featuredImage: https://miro.medium.com/fit/c/960/288/1*VKY-Ldkt-iHobItql7G_5w.png
description: Increasing your application's performance using OnPush change detection
tags:
  - angular
  - performance
---

While not the fastest, by default Angular is one of the most performant frameworks around.

Even if the majority of applications will run just fine without having to make any advanced optimizations, running complex applications even on older browsers and slower devices can still be a daunting task.

## ChangeDetectionStrategy 🔥

The first and probably most important tweak we can do is changing the detection strategy Angular uses by default in order to minimize the amount of times the change detection will run, which will as a result make your app perform smoother and faster.

By default, you guessed it, Angular uses the strategy `ChangeDetectionStrategy.Default`. This means that the component will be always checked. Not efficient, right?

Why do that, if most components did not need to get updated? Enter `ChangeDetectionStrategy.OnPush`, which will instruct the change detection to skip a component except when any of the following situations happens:

-   Input reference of the component changes
-   DOM Event within a component has been dispatched (ex. click)
-   Emission of an observable event subscribed with Async pipe
-   change detection is manually run

This practice is even more important for large and complex applications as the amount of components skipped by the change detection is substantial. A simple way to see the differences between the two approaches is to use Chrome's rendering dev tools. Check the "Paint flashing" option and see for yourself how many times your components are needlessly re-rendered.

In the following example, our component will _not_ be updating the view:

```typescript
@Component({
  ...,
  template: '{{ count }}',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChangeDetectionComponent implements OnInit {
  count = 0;

  ngOnInit() {
    setInterval(() => ++this.count, 1000);
  }
}
```

### RxJS to the rescue

Developers coming from Angular 1.x may finding this confusing and difficult to use: admittedly, using OnPush without RxJS is not always easy.

With that said, I like to argue that using OnPush offers a way for better coding practices. For example, by promoting the usage of RxJS and the `async` pipe, we get a predictable and declarative codebase which also happens to be super-performant.

Here are some advantages to using the `async` pipe:

-   automatically subscribes to observables
-   automatically unsubscribes when the component gets destroyed
-   effortless cooperation with ChangeStrategyStrategy.OnPush
-   reduced LOC in our components

In short, RxJS + OnPush = win-win.

Let's refactor the previous example using an `Observable`:

```typescript
@Component({
  ...,
  template: '{{ count$ | async }}',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChangeDetectionComponent implements OnInit {
  count$: Observable<number>;

  ngOnInit() {
    this.count$ = interval(1000)
        .pipe(
            map((count: number) => ++count)
        );
  }
}
```

We now have an elegant, declarative and performant solution!

### NGRX

When dealing with a large-scale application, I would suggest to use a state-management library. Not only because it helps manage state, but also because Angular state management libraries treat Observables as first-class citizens, just like the framework does. While there's a bunch of great libraries out there, I highly recommend NGRX.

NGRX makes working with pure Angular components effortlessly by using RxJS for pulling data from the store, which means all the data held in components are observables.

If you don't know NGRX yet, then you should probably you give it a read.

In order to read the following example, all you need to know is that we're retrieveing data from the store (think of it as our database) as an observable, and that we're displaying it in our template by subscribing via the `async` pipe.

```typescript
@Component({
    ...,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div *ngFor="let todo of (todos$ | async)">
            {{ todo.name }}
        </div>
    `
})
export class TodosComponent {
    constructor(private store: Store<AppState>) {}

    ngOnInit() {
        this.todos$ = this.store.select((state) => state.todos);
    }
}
```

The framework will render the template every time `todos$` emits a new value.

### When does not _not_ make sense to use OnPush?

Never! OnPush is a simple way for making your applications _way_ faster, and personally see no reasons for not using it every time.

## Refactoring a codebase for performance 🚀

Most legacy Angular codebases I worked with were all using the default change detection, and the performance of the application was highly affected by that. Most developers were also not keen on the idea of using it, simply because it seems intimidating at first. But, well, it doesn't have to be.

The first thing to know if you are planning on refactoring a codebase by also using the OnPush change detection, is that you never start from the parent components. The reason is, when changeDetection is added to a parent component, as a result all its components tree will be affected.

My recommendation is to start from the leaves and working your way up to the parent components. Dumb components, if written well, shouldn't normally be affected because they simply receive inputs and render it, so they're the first you should be refactoring.
Once all the tree of a container has been refactored, it's time for the container.

What's the container responsible for?

-   Retreieving the data and passing it down to other components
-   Putting together the layout of 1 or more components

Managing the data is arguably the most difficult task front-end developers face today, which is why well-designed containers are key to the overall architecture of a project.

I recommend two alternatives:

-   use your own RxJS state management by using Subjects within services, and exposing data via Observables, if you don't feel like using third parties
-   Use NGRX, NGXS, Akita, etc.?

## Takeaways

-   Use `OnPush` change detection strategy, your app will be faster
-   Use `async` pipe, it will make `OnPush` easier to work with
-   Use a state management library, alternatively leverage RxJS within your services
-   Refactoring is hard(ish): start from your leaves components and work your way up until all components use `OnPush`
