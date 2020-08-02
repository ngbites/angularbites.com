---
date: 2019-05-05
title: Architecting the Store in NGRX
featuredImage: 'https://cdn-images-1.medium.com/max/1600/1*CYmnppaZkh7OcF1IRH15jQ.png'
tags:
  - ngrx
  - angular
---

This is the second article of a series that aims to explain in detail a step-by-step approach to building an Angular application with NGRX.

In [the first article of this series](https://medium.com/r/?url=https%3A%2F%2Fitnext.io%2Fstate-management-with-ngrx-introduction-1aae0803e988), I wrote a small overview of all the concepts surrounding the NGRX platform.

If you have never worked with NGRX, or have never done something in-depth with, I’d really recommend you read it.

### NGRX 8

In the previous article, the concepts were explained using the current NGRX version. In order to keep the articles up to date, from now on I will introduce and explain the same concepts using the latest features released in NGRX version 8. There’s some really cool stuff out!

In particular, we will look at how to create:

*   actions with `createAction`
*   reducers with `createReducer`
*   effects with `createEffect` (in the next article)

### What is this article about?

In this article instead, we will explore the process of building the entities that make up our store and will be setting up the entity adapter, the actions, and the reducers for each entity.

As a follow up to one of my previous articles about [creating a scalable folders structure](https://medium.com/r/?url=https%3A%2F%2Fitnext.io%2Fbuilding-an-enterprise-grade-angular-project-structure-f5be32533ba3), we will see an example of creating store modules as service modules imported by our domain module.

We will build an application that retrieves live crypto prices from [Coincap](https://medium.com/r/?url=https%3A%2F%2Fcoincap.io)\*\* and displays them in a customizable dashboard.

We will call this demo application _Cryptofolio,_ which I hope to publish at the end of this series.

_\*\* I explored various websites for fetching live prices and Coincap was by far the easiest and clearer provider. Kudos to the team!_

## Setting up Angular and NGRX

Let’s see how to set up an Angular application and NGRX.

### Angular CLI Workspace

The first thing you may want to do is to create a new application with Angular CLI and add the routing and style parameters.

`ng new <app> --routing --style=scss`

### NGRX

Let’s install all the libraries needed to work with NGRX:

`npm i @ngrx/store @ngrx/effects @ngrx/entity`

And you’re pretty much all set!

## Project’s Folder Structure

Let’s take a brief look at the project structure I opted for:

![](https://cdn-images-1.medium.com/max/1600/1*ZTWoVjCnGCJMMNUzxcdcUw.png)

*   **What’s in store**?
    Every folder in `store` is an Angular Service Module that simply sets up the NGRX store and effects for the Dashboard Module, which is a domain module where our application’s smart components are placed.

Let’s take a look at the `DashboardStoreModule` which is still very simple:

```typescript
@NgModule({
    imports: [
        StoreModule.forFeature('dashboard', dashboardReducer),
        // will import effects
    ],
    providers: [
       // will import providers
    ]
})
export class DashboardStoreModule {}
```

The `DashboardModule` will then import `DashboardStoreModule` and the other store modules:

```typescript
@NgModule({
    declarations: [
       // components
    ],
    imports: [
        // store service modules_ DashboardStoreModule,
        PricesStoreModule,
        AssetsStoreModule,

        // other modules
    ],
    exports: [RouterModule]
})
export class DashboardModule {}
```

*   **Where is DashboardModule imported?**
The `DashboardModule` is a lazy-loaded module, so we do not import it from anywhere in our application, but instead, we reference it in our routing module configuration.

In order to make lazy-loaded feature modules work with NGRX, we need to call the forRoot method, although with empty values, for both the `StoreModule` and the `EffectsModule`.

```typescript
@NgModule({
    declarations: [AppComponent],
    imports: [
        // other modules,
        StoreModule.forRoot({}, { metaReducers }),
        EffectsModule.forRoot([]),
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
```

## Store Entities

In order to architect the store, we need to first analyze our data structures.

As I mentioned above, the application will feature a **dashboard** with **tiles**, and each widget will contain cryptocurrency price tickers. In order to retrieve to display the **prices**, we first need to load the **assets (cryptocurrencies)**.

We then have 4 different entities that we will use to build our fairly simple store:

*   a dashboard that contains tiles (or widgets)
*   a list of assets (cryptocurrencies)
*   a price (for each asset subscribed)

### Flat vs Nested Store

We have two ways of building the store:

*   a nested structure, by directly adding prices to the assets store
*   a flat structure, where assets and prices are separated into two separate objects and are only related based on the asset ID

I personally prefer a flat structure. 

**Why?** I have, mistakenly, opted for nested structures in the past and I found the following issues:

*   by adding a price directly to an asset, we’d be changing the original interface of the entity
*   deeper, nested structures are more difficult to query

In this simple example, it doesn’t really affect greatly performance or complexity. However, if you plan on building a big application with a complex state, you will quickly see how the selectors and the store complexity creeping up as a result of a nested structure.

My advice is to keep the store as a flat structure of objects and keep the relations between them using unique values.

## Dashboard Store

For simplicity, we will keep the dashboard fairly minimal. We only need two things from a widget:

*   a tile ID
*   an asset ID

In order to build this part of the store, we will use `@ngrx/entity` .

### Tile class

Let’s first create a class named `Tile` that represents the model of our state:

```typescript
export class Tile {
    public readonly id = uuid();

    constructor(public assetId?: string) {}
}
```

Of course, unless a tile is preloaded with an asset ID, the asset ID won’t be defined until the user decides which asset to display, which is why we mark as possibly `undefined`.

### Dashboard Adapter

We move on and proceed to create the adapter for our state. Our state will simply be an entity state with a collection of tiles:

```typescript
export const dashboardAdapter: EntityAdapter<Tile> = createEntityAdapter<
    Tile
>();
```

### Dashboard Actions

In order to create our actions, we will be using the new factory provided by NGRX 8 called `createAction` .

```typescript
export enum DashboardActionTypes {
    AddTile = '[Dashboard] ADD_TILE',
    RemoveTile = '[Dashboard] REMOVE_TILE',
    UpdateTile = '[Dashboard] UPDATE_TILE'
}

export const addTile = createAction(
    DashboardActionTypes.AddTile, // action name
    props<{ payload: Tile }>() // action payload type
);

export const removeTile = createAction(
    DashboardActionTypes.RemoveTile,
    props<{ payload: string }>()
);

export const updateTile = createAction(
    DashboardActionTypes.UpdateTile,
    props<{ payload: Tile }>()
);
```

To summarise the code, we have created 3 actions:

*   `addTile` whose payload is a `Tile` class
*   `removeTile` which only receives a string as payload, which is the ID
*   `updateTile` which also receives a `Tile` class

Notice that `props` is a function that gets imported from `@ngrx/store` and gets called as a second argument.

### Dashboard Reducer

In order to build the dashboard reducer, we will use the new factory method called `createReducer` that takes the following arguments:

*   the first argument is the initial state, that we created using the entity adapter
*   all the following arguments are the reducer functions for each action, that we define using the function `on` also imported from `@ngrx/store` 
*   we use the entity adapter methods in order to add, remove and update the dashboard’s tiles

```typescript
// we create the state by adding an empty tile_

const emptyTile = new Tile(undefined);
const initialState = dashboardAdapter.addOne(
    emptyTile,
    dashboardAdapter.getInitialState()
);

export const dashboardReducerFn = createReducer(
    initialState,
    on(addTile, (state, { payload }) => {
        return dashboardAdapter.addOne(payload, state);
    }),
    on(removeTile, (state, { payload }) => {
        return dashboardAdapter.removeOne(payload, state);
    }),
    on(updateTile, (state, { payload }: { payload: Tile }) => {
        return dashboardAdapter.updateOne(
            { id: payload.id, changes: { assetId: payload.assetId } },
            state
        );
    })
);

export function dashboardReducer(
    state = initialState,
    action: Action
): EntityState<Tile> {
    return dashboardReducerFn(state, action);
}
```

We import the reducer in the `DashboardStoreModule` :

```typescript
@NgModule({
    imports: [
         StoreModule.forFeature('dashboard', dashboardReducer),
    ]
// more
```

## Assets Store

As we are going to receive the list of assets using Coincap’s API, we’re just going to replicate their interface:

```typescript
export interface Asset {
    id: string;
    rank: string;
    symbol: string;
    name: string;
    supply: string;
    maxSupply: string | null;
    marketCapUsd: string;
    volumeUsd24Hr: string;
    priceUsd: string;
    changePercent24Hr: string;
    vwap24Hr: string;
}
```

### Assets Actions

In order to fetch the assets, we will need to perform an HTTP request to Coincap’s API. The HTTP action will be going through the effect method we’re going to define in the next article. 

What’s important to notice here is the way I’ve broken up the assets’ _actions_:

*   **getAssetsRequestStarted:**
    action that gets dispatched when the request starts
*   **getAssetsRequestSuccess:**
    action that gets dispatched when the request succeeded (no error actions in this case for simplicity, but you should always create them)
*   **addAssets:**
    action that will only be used by the reducer, which is a command to add assets to the store

```typescript
export enum AssetsActionsTypes {
    GetAssetsRequestStarted = '[Assets API] GET_ASSETS_REQUEST_STARTED',
    GetAssetsRequestSuccess = '[Assets API] GET_ASSETS_REQUEST_SUCCESS',
    AddAssets = '[Assets] ADD_ASSETS'
}

export const getAssetsRequestStarted = createAction(
    AssetsActionsTypes.GetAssetsRequestStarted,
    props<{ payload: string[] }>()
);

export const getAssetsRequestSuccess = createAction(
    AssetsActionsTypes.GetAssetsRequestSuccess,
    props<{ payload: Asset[] }>()
);

export const addAssets = createAction(
    AssetsActionsTypes.AddAssets,
    props<{ payload: Asset[] }>()
);
```

### Assets Reducer and Adapter

The only reducer function reacting to the _addAssets_ action will simply add all the assets to the store once they get fetched.

```typescript
// adapter
export const assetsAdapter: EntityAdapter<Asset> = createEntityAdapter<Asset>({
    selectId: (asset: Asset) => asset.id
});

// reducer
const initialState = assetsAdapter.getInitialState();

export const assetsReducerFn = createReducer(
    initialState,
    on(addAssets, (state, { payload }) => {
        return assetsAdapter.addAll(payload, state);
    })
);

export function assetsReducer(
    state: EntityState<Asset> | undefined,
    action: Action
) {
    return assetsReducerFn(state, action);
}
```

## Prices Store

The prices returned by Coincap’s API are very simple and are just objects with the key of an asset and its relative price. As such, we have a very simple store for prices.

### Prices Actions

We will be creating 3 actions:

*   **addPrice**:
    action for updating the store once a price is received
*   **createPriceSubscription**:
    action for creating a subscription
*   **closePriceSubscription**:
    action for closing a subscription

```typescript
export enum PricesActionsTypes {
    AddPrice = '[Prices Store] ADD_PRICE',
    CreatePriceSubscription = '[Prices Stream] CREATE_PRICE_SUBSCRIPTION',
    ClosePriceSubscription = '[Prices Stream] CLOSE_PRICE_SUBSCRIPTION',
    PriceReceived = '[Prices Stream] PRICE_RECEIVED'
}

export const addPrice = createAction(
    PricesActionsTypes.AddPrice,
    props<{ payload: Price }>()
);

export const createPriceSubscription = createAction(
    PricesActionsTypes.CreatePriceSubscription,
    props<{ payload: string }>()
);

export const closePriceSubscription = createAction(
    PricesActionsTypes.ClosePriceSubscription
);

export const priceReceived = createAction(
    PricesActionsTypes.PriceReceived,
    props<{ payload: Price }>()
);
```

### Prices Reducer

As the prices returned by Coincap’s real-time API are simply a key with the asset and its price, we really don’t need to do much with the entity framework.

Indeed, for each price received, we simply set the key with the asset ID in our store and its price by spreading the price objects with the new payload.

If it doesn’t exist, it gets created, otherwise, it gets overwritten with its newest value.

Imagine our state is:

```
{ "bitcoin": "some price" };
```

And our payload from the WebSocket’s stream is:
```
{ "ethereum": "another price" }
```
This will simply become:
```
{
    "bitcoin": "some price",
    "ethereum": "another price"
};
```

And here is the code with one simple action:

```typescript
const initialState: PriceState = {};

export const pricesReducerFn = createReducer(
    initialState,
    on(addPrice, (state, { payload }) => {
        return { ...state, ...payload };
    })
);

export function pricesReducer(
    state = initialState,
    action: Action
): PriceState {
    return pricesReducerFn(state, action);
}
```
## An overview of the Store

Let’s take a look at the store with some data:

![](https://cdn-images-1.medium.com/max/2400/1*3U_DkFj1rvw_cCxWyAph4g.png)

Type caption for image (optional)

*   We have fetched 5 assets
*   We have one, empty tile
*   We have no prices, as the tile has not been subscribed to an asset

## Takeaways

*   Lay out your application entities and analyze how they relate between each other in order to have a clear understanding of what the store’s structure could look like
*   Use NGRX Entity! It’s a great tool to reduce the boilerplate of your reducers
*   Separate your UI modules from the store using Store Service Modules
*   Prefer a flat structure over a nested one
*   Keep actions clear and granular, distinguish between commands and events

---

In the next article, we're going to build the effects that are responsible for fetching assets and prices from Coincap’s API.

Read it at the link below:
[Building Side Effects in NGRX](https://medium.com/r/?url=https%3A%2F%2Fitnext.io%2Fbuilding-side-effects-in-ngrx-deb0d856096d)

---

Hope you enjoyed the article and send me a message if you agree, disagree, or would do anything differently!
