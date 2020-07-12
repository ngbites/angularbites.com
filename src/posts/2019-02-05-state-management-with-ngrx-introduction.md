---
date: 2019-05-02
title: State Management with NGRX - Introduction
---

## State Management with NGRX — Introduction

In this article, I want to introduce you to the concepts that make up the NGRX platform and all its pieces to fully understand how it helps us create better applications.

_NGRX_, for those who don’t know yet, is a _Redux_ library for _Angular_. It helps us with state management, which is arguably the hardest part to manage for modern, large scale, client-side applications.

Compared to _Redux_, which only provides the layer for the store, _NGRX_ comes with quite a few powerful features.

* * *

This is the first part of a 4-part articles series that will cover:

*   Pillars of NGRX
*   How to architect our Store using reducers and entities
*   Managing and testing side effects
*   Connecting our UI to a Facade Service, with pros and cos

## Why NGRX, or any state management solution

NGRX, and other state management libraries for Angular (NGXS, Akita) have become important pieces in the architecture of complex web apps.

An unpopular opinion of mine is that every Angular application should use some sort of state management, be it RX-powered services, MobX, or different Redux implementations.

I found several pitfalls with large (and even small) projects using local state within components, such as:

*   difficulty in passing data between routes
*   difficulty in caching data already fetched
*   repeated logic and requests
*   no conventions

This list could be much longer, but this is enough to convince me that some sort of state management is essential for not refactoring a new application any time soon.

## NGRX Pillars

Let’s see how the platform around _NGRX_ is structured:

*   `store` — which a central repository from which we can _select_ the state from every component and service within the Angular DI
*   `effects` — which as the name suggests are side effects that happen when an action is dispatched
*   `entity` — an entity framework to help reduce the usual boilerplate

Let’s now take a more detailed look at all the concepts we’re going to explore in the next steps.

## Store

A store is a central repository where we store our data.

It’s our application database and the only source of truth in our client. Technically speaking, it’s simply a nested object that we use to select and store data.

As the _Store_ service is accessible via the Angular DI, the data in our store is accessible by all components and services from everywhere in our application.

Any information regarding state, unless isolated to one single part of the application (ex. forms, popups, transient state), should probably be stored in the store.

## Actions

In NGRX-speak — actions are classes that hold information that gets passed to reducers or that trigger side effects.

Actions have two parameters:

*   a unique identifier we name `type` (make sure you mark it as `readonly`)
*   an optional `payload` property that represents the data being passed to the action

```typescript
export enum LoginActionTypes {
    LoginButtonClicked = '[Login Button] LOGIN_BUTTON_CLICKED',
    LoginRequestStarted = '[Login API] LOGIN_REQUEST_STARTED'
}

export class LoginButtonClicked {
   public readonly type = LoginActionTypes.LoginButtonClicked;

   constructor(public payload: LoginRequestPayload) {}
}

export class LoginRequestStarted {
   public readonly type = LoginActionTypes.LoginRequestStarted;

   constructor(public payload: LoginRequestPayload) {}
}

export type UserActions = LoginButtonClicked | LoginRequestStarted;
```

Conventions for naming the `type` parameter:

*   you will usually see the type being written using the format `[prefix] NAME`
*   the prefix is useful to declare where the request is originated from, as recommended by the NGRX team

💡**Pro Tip:** write many granular actions and always write what originated them. It doesn’t really matter if you rewrite some action that does the same thing. 

## Reducers

Reducers are simply pure functions responsible for updating the state object in an immutable manner. 

A reducer is a function that receives two parameters: the current state object and an action class, and returns the new state as output. 

The new state is **always a newly built object**, and **we never mutate the state**.

```typescript
export function loginReducer(
    state: UserState = {},
    action: UserActions
): UserState {
    switch (action.type) {
        case UserActionTypes.LoginSuccess:
            return action.payload;
        default:
            return state;
}
```

This is a dead-simple reducer that simply returns the current state if no action is matched, or returns the action’s payload as the next state. In a real application, your reducers will end up being much bigger than the example. 

There are loads of libraries around to simplify using reducers, but to me, they are rarely worth using.

For more complex reducers, I’d recommend to create functions and **keep the reducer functions simple and small**.

In fact, we can refactor the switch statement by simply using an object and match the action type with the object’s keys.

Let’s rewrite that:

```typescript
interface LoginReducerActions {
    [key: UserActionTypes]: (
        state: UserState,
        action: UserActions
    ): UserState;
};

const loginReducerActions: LoginReducerActions = {
    [UserActionTypes.LoginSuccess]: (
       state: UserState,
       action: LoginSuccess
    ) => action.payload
};

export function loginReducer(
    state: UserState = {},
    action: UserActions
): UserState {
    if (loginReducerActions.hasOwnProperty(action.type)) {
       return loginReducerActions[action.type](state, action);
    }

    return state;
}
```

## Selectors

Selectors are simply functions we define to select information from the store’s object. 

Before we can introduce selectors, let’s see how we would normally select data from the store within a service: 

```typescript
interface DashboardState {
   widgets: Widget[];
}

export class DashboardRepository {
    widgets$ = this.store.select((state: DashboardState) => {
        return state.widgets;
    });

    constructor(private store: Store<DashboardState>) {}
}
```

Why is this approach not ideal?

*   it’s not DRY
*   if the store’s structure will change (and believe me, it will), we need to change the selection everywhere
*   the service itself knows about the structure of the store
*   No caching 

Let’s introduce the utility provided by `@ngrx/store` called `createSelector` which was inspired by the React library `reselect`. 

For simplicity, I will keep the snippets unified, but you should assume that selectors are created in a separate file and they get exported.

```typescript
// selectors
import { createSelector, createFeatureSelector } from '@ngrx/store';

const selectDashboardState = createFeatureSelector('dashboard');

export const selectAllWidgets = createSelector(
    selectDashboardState,
    (state: DashboardState) => state.widgets
);

// service
export class DashboardRepository {
    widgets$ = this.store.select(selectAllWidgets);

    constructor(private store: Store<DashboardState>) {}
}
```

💡**Pro Tip:** selectors are super useful, always write granular selectors and try to encapsulate logic within selectors rather than in your services or components

## Entities

Entities are added by the package `@ngrx/entity` .

As you may have seen if you ever used Redux, the boilerplate for common CRUD operations is time-consuming and redundant.

NGRX Entity helps us by providing out of the box a set of common operations and selectors that help to reduce the size of our reducers.

What does our state look like by using this Entity framework?

```typescript
interface EntityState<V> {
  ids: string[] | number[];
  entities: {
      [id: string | id: number]: V
  };
}
```

I normally start by creating an adapter, in a separate file, so we can import it from different files such as the reducer and the selectors’ files.

![](https://cdn-images-1.medium.com/max/1600/1*v9EpQXnp-aNUhDNb1oVMSQ.png)

export const adapter: EntityAdapter<Widget> = createEntityAdapter<Widget>();

Let’s use the adapter in our reducer. How does the adapter interact with it?

*   it creates an initial state (see the interface `EntityState` above)
*   it gives us a series of _CRUD_ operations methods to write reducers on the fly

```typescript
const initialState: DashboardState = adapter.getInitialState();

export const dashboardReducer(
    state = initialState,
    action: DashboardActions
): DashboardState {
   switch (action.type) {
       case DashbordActionTypes.AddWidget:
          const widget: Widget = action.payload;
          return adapter.addOne(action.payload, state);
   }

   // more ...
   }
}
```

💡 **Pro Tip**: [Take a look at all the methods available in NGRX Entity](https://medium.com/r/?url=https%3A%2F%2Fngrx.io%2Fguide%2Fentity%2Fadapter%23adapter-collection-methods)

The entity adapter also allows us to kickstart a collection of selectors to query the store.

Here’s an example for selecting all the widgets in our dashboard’s state:

```typescript
const { selectAll } = adapter.getSelectors();

export const selectDashboardState = createFeatureSelector<DashboardState>('dashboard');

export const selectAllWidgets = createSelector(
  selectDashboardState,
  selectAll
);
```

💡 **Pro Tip**: [Take a look at all the selectors available in NGRX Entity](https://medium.com/r/?url=https%3A%2F%2Fngrx.io%2Fguide%2Fentity%2Fadapter%23entity-selectors)

## Effects

Finally, my number one favorite feature in NGRX: _Effects_.

As the name suggests, we use effects to manage side-effects in our application. NGRX implements effects as streams emitted by actions, that in most cases return new actions.

Let’s consider the diagram below:

![](https://cdn-images-1.medium.com/max/1600/1*zucA-8bRWyhrhxkdMBOpLA.png)

*   an action gets dispatched from somewhere in the application (ex: UI, WebSocket, Timers, etc.)
*   the effects intercept the action, for which a side-effect has been defined. The side-effect gets executed
*   The side effect, with exceptions, returns a new action
*   The action goes through a reducer and updates the store

As I mentioned, not all side effects will return a new action. We can configure an effect not to dispatch any action if it is not needed, but it’s important that you understand that in most cases we do want to dispatch new actions as a result. 

The most practical use-case for effects in _NGRX_ is making _HTTP_ requests:

```typescript
export class WidgetsEffects {
    constructor(
        private actions$: Actions,
        private api: WidgetApiService
    ) {}

    @Effect()
    createWidget$: Observable<AddWidgetAction> =
        this.actions$.pipe(
            ofType(WidgetsActionTypes.CreateWidgetRequestStarted),
            mergeMap((action: CreateWidgetAction) => {
                return this.api.createWidget(action.payload);
            }),
            map((widget: Widget) => new AddWidgetAction(widget))
         );

    @Effect({ dispatch: false })
    exportWidgets$: Observable<void> =
        this.actions$.pipe(
            ofType(WidgetsActionTypes.ExportWidgets),
            tap((action: ExportWidgets) => {
                return this.api.exportWidgets();
            }),
         );
}
```

Let’s break the above snippet down.

*   we created a class called `WidgetsEffects`
*   we import two providers: `Actions` and `WidgetsApiService`
*   `Actions` is a stream of actions. We use the operator `ofType` that helps us filter the actions to only the one we want to listen to
*   We create a property on the class and decorate it with `Effect`
*   This effect is called when an action called `CREATE_WIDGET_REQUEST` is dispatched
*   We get the payload from the action and execute a call with our API service
*   Once that has successfully been executed, we map it the action `AddWidgetAction` which can be picked up by the reducer and update our store
*   In the second effect called `exportWidgets$` , we receive an action `ExportWidgets` , we use the `tap` operator to execute a side-effect, and then… well, nothing! As we passed the configuration `{ dispatch: false }` we don’t have to return any action

## Takeaways

*   A state-management solution, be it a library or your own implementation, should always be preferred to local state 
*   A single source of truth such as the store helps us managing the state of our application, with a few exceptions such as when the state is transient
*   we briefly explored the concept of store, actions, reducers, entities, selectors, and effects, but in the next steps we will go into details into each of these with some more advanced examples

In the next article, we're going to the store of the application and the state’s entities. You can find it at the link below:
[Architecting the Store in NGRX](https://medium.com/r/?url=https%3A%2F%2Fitnext.io%2Farchitecting-the-store-in-ngrx-e4955641d746)

Hope you enjoyed this article and stay tuned for the next part of this series!
