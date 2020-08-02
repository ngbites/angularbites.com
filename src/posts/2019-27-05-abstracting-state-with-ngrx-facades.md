---
date: 2019-05-27
title: Abstracting State with NGRX Facades
featuredImage: 'https://cdn-images-1.medium.com/max/1600/1*TggmpinSAPh1ndMBoTj0bw.png'
description: Using Ngrx facades to connect your components with your state
tags:
  - angular
  - ngrx
---

This is the fourth and last article of a series that aims to explain in detail a step-by-step approach to building an Angular application with NGRX.

*   In [the first article of this series](https://medium.com/r/?url=https%3A%2F%2Fitnext.io%2Fstate-management-with-ngrx-introduction-1aae0803e988), I wrote a small overview of all the concepts surrounding the NGRX platform.
*   In [the second article of this series](https://medium.com/r/?url=https%3A%2F%2Fitnext.io%2Farchitecting-the-store-in-ngrx-e4955641d746), I started writing the store of the application and the state’s entities.
*   In [the third article of this series](https://medium.com/r/?url=https%3A%2F%2Fitnext.io%2Fbuilding-side-effects-in-ngrx-deb0d856096d), we built the effects that are responsible for fetching assets and prices from Coincap’s API

### Summary

Just to summarise what I introduced in the previous articles, we have an application that aims to display a dashboard with cryptocurrencies prices.

The application’s logic is built using three service modules, each module manages a different feature of our store.

These are:

*   **dashboard**, that manages the logic of the dashboard and its tiles
*   **assets,** a list of assets fetched from [Coincap’s](https://medium.com/r/?url=https%3A%2F%2Fcoincap.io) API
*   **prices,** a stream of prices from Coincap’s WebSocket API

**What the app will look like:**

![](https://cdn-images-1.medium.com/max/1600/1*R3-0VFvXB2rq-rAtWyNwxA.gif)

Type caption for image (optional)

### In this article we will be learning:

*   what a Facade service is and how we apply it to NGRX
*   creating lean UI components that are connected with the _Store_ using **Facades**

## What’s a Facade?

A _Facade_, in terms of software engineering, is implemented as an object that offers a unified and simpler interface behind a more complex system. 

In other terms, it abstracts the complex system (_NGRX_) behind a single _Service_.

How is that useful for us?

*   we abstract UI components from the State Management used
*   we simplify the interfaces using clear, small methods
*   we minimize the number of dependencies used by a component
*   we provide a central service to fetch data and dispatch commands

### Advantages

*   **Abstraction**
    Let’s say we start this project using _NGRX_ and one day we decide to switch to _NGXS_, _Akita_, or some other State Management tooling. By using facades, we never have to refactor components and services that rely on the library used.
*   **Simplicity**
    A facade will hide away the technicalities and implementation of the library we use from the consumers, which result in components being lean and simple.
*   **Reusability**
    A facade will help with reusing some of the code used to dispatch and create actions, or select fragments from the store, as you never need to write that twice.

Of course, there are also some disadvantages to using Facade Services with NGRX, and I’d recommend you to the article [NgRx Facades: Pros and Cons](https://medium.com/r/?url=https%3A%2F%2Fauth0.com%2Fblog%2Fngrx-facades-pros-and-cons%2F) for a great explanation.

## Facade Services in Practice

But now, let’s get back to our application and apply what we learned about Facades.

We will be implementing a Facade Service for each of our Store Modules we built in the previous articles. 

The Facade Service will be the interface between the modules that import the Store Modules and their internal smart components.

The only Feature Module we need to build is going to be the Dashboard Feature Module that will take care of defining the UI containers and components that will be connected via our Facade Services exported from the Store Modules. 

We will build 4 components:

*   **Dashboard component,** that will query the store for the assets that have been subscribed. Initially, no asset is selected.
*   **Tile component,** that will  contain an asset selector if no asset for that tile has been subscribed, otherwise, it will display an asset pricer if instead the user subscribed to an asset
*   **Asset selector,** that the user can use to select an asset (ex. Bitcoin)
*   **Asset pricer,** that will display the prices of the asset selected

A few things before we start:

*   These components will be powered by [Angular Material](https://medium.com/r/?url=https%3A%2F%2Fmaterial.angular.io%2F)
*   All imports are omitted for brevity, but the link to the source code will be provided

### Dashboard Component

The Dashboard component will be responsible for 2 things:

*   loading the assets when initialized, using the _Assets Facade_
*   querying and displaying all the tiles from the store, using the _Dashboard Facade_

Before we build the component, let’s take a look at the Facades. 

We first create the **Dashboard Facade**:

```typescript
@Injectable()
export class DashboardFacadeServiceImpl implements DashboardFacadeService {
    public tiles$: Observable<Tile[]> = this.store.select(selectAllTiles);

    constructor(private store: Store<EntityAdapter<Tile>>) {}

    addTile(payload: Tile) {
        this.store.dispatch(addTile({ payload }));
    }

    updateTileAsset(id: string, assetId: string) {
        this.store.dispatch(updateTileAsset({ payload: { id, assetId } }));
    }
}
```

Let’s break it down:

*   **tiles$** is an Observable that selects all the tiles from the store
*   we have two methods, **addTile,** and **updateTileAsset,** that will dispatch actions to the store for adding and updating a tile

We first create the **Assets Facade**:

```typescript
@Injectable()
export class AssetsFacadeImplService implements AssetsFacadeService {
    public assets$ = this.store.select(selectAllAssets);

    constructor(private store: Store<EntityState<Asset>>) {}

    getAssets() {
        this.store.dispatch(
            getAssetsRequestStarted({
                payload: []
            })
        );
    }
}
```

This one is very simple, we have:

*   the list of assets selected from the store
*   an action dispatched to the effects to fetch the assets using the API

And now on to the UI side of things. We define the Dashboard Component’s controller, which will use the two Facades we defined above:

```typescript
@Component({
    selector: 'cf-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
    public tiles$ = this.dashboardFacade.tiles$;

    constructor(
        private dashboardFacade: DashboardFacadeService,
        private assetsFacade: AssetsFacadeService
    ) {}

    ngOnInit() {
        this.assetsFacade.getAssets();
    }

    addTile() {
        this.dashboardFacade.addTile(new Tile(undefined));
    }
}
```

*   The template of the component will display the tiles using a Grid List component from Angular Material
*   Every tile’s state is passed to the component **cf-tile**
*   A button (`mat-icon-button`) is displayed in its own tile and is used to add a new empty tile

```html
<mat-grid-list
    cols="4"
    rowHeight="2:1"
    gutterSize="15px"
    *ngIf="tiles$ | async as tiles"
>
    <ng-container *ngFor="let tile of tiles">
        <mat-grid-tile class="pricer">
            <cf-tile [tile]="tile"></cf-tile>
        </mat-grid-tile>
    </ng-container>

    <mat-grid-tile>
        <button mat-icon-button (click)="addTile()">
            <mat-icon color="accent">add</mat-icon>
        </button>
    </mat-grid-tile>
</mat-grid-list>
```

### Tile Component

The tile component is responsible for displaying either the assets dropdown or the asset price if any has been subscribed. This component is going to need two facades:

*   the dashboard facade, that we defined earlier
*   the prices facade, in order to create a subscription once an asset has been selected

Let’s move on and define the Pricer Facade:

```typescript
@Injectable()
export class PricesFacadeServiceImpl implements PricesFacadeService {
    subscribedAssets$: Observable<string[]> = this.store.select(
        selectSubscribedAssets
    );

    constructor(private store: Store<EntityState<PriceState>>) {}

    public createPriceSubscription(assetId: string) {
        this.addInitialPrice(assetId);
        this.createSubscription(assetId);
    }

    public getPriceForAsset(assetId: string): Observable<string> {
        return this.store.select(selectPriceForAsset(assetId));
    }

    private addInitialPrice(assetId: string) {
        this.store.dispatch(addPrice({ payload: { [assetId]: '' } }));
    }

    private createSubscription(assetId: string) {
        this.store.dispatch(createPriceSubscription({ payload: assetId }));
    }
}
```

Now, let’s break what we’ve defined down:

*   we define two private methods for dispatching actions: the method `addInitalPrice` will create the initial price for the asset subscribed, which is initially empty; the other method `createSubscription` will start the WebSocket subscription, as we’ve seen [in the previous article](https://medium.com/r/?url=https%3A%2F%2Fitnext.io%2Fbuilding-side-effects-in-ngrx-deb0d856096d) when we defined the effects.

The Tile component is very simple: 

```typescript
@Component({
    selector: 'cf-tile',
    templateUrl: './tile.component.html',
    styleUrls: ['./tile.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TileComponent {
    @Input() tile: Tile;

    constructor(
        private dashboardFacade: DashboardFacadeService,
        private pricesFacade: PricesFacadeService
    ) {}

    updateTile(assetId: string) {
        this.dashboardFacade.updateTileAsset(this.tile.id, assetId);
        this.pricesFacade.createPriceSubscription(assetId);
    }
}
```

In the template, we simply use an `ngSwitch` to either display the price if the `assetId` is defined, or the selector if it is undefined.

```html
<div [ngSwitch]="tile.assetId" fxLayout="column">
    <div class="tile-header">
        <div class="tile-heading" *ngSwitchDefault>
            {{ tile.assetId | titlecase }}
        </div>

        <cf-asset-selector
            *ngSwitchCase="undefined"
            (assetSelected)="updateTile($event)"
        ></cf-asset-selector>
    </div>

   <div class="tile-content" fxFlexAlign="center center">
       <cf-asset-pricer
           *ngSwitchDefault
           [asset]="tile.assetId">
       </cf-asset-pricer>
   </div>
</div>
```

The component `cf-asset-selector` will dispatch an output when an asset is selected by the user, and the output will call the method `updateTile` , which will update the tile by assigning it an `assetId`, and then will call the method to create the price subscription and start streaming the asset prices.

### Asset Selector Component

The Asset Selector component is simply a dropdown with the available assets that will dispatch an output when an asset has been selected. The assets are queried from the Assets Facade. Simple, right?

```typescript
@Component({
    selector: 'cf-asset-selector',
    templateUrl: './asset-selector.component.html',
    styleUrls: ['./asset-selector.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssetSelectorComponent {
    @Output() assetSelected = new EventEmitter<string>();

    public assets$ = this.assetsFacade.assets$;

    constructor(private assetsFacade: AssetsFacadeService) {}
}
```

The template is powered by the `mat-select` component from Angular Material, although a simple select would have done the job. We simply create a select and iterate the assets to create the available option. 

When an option gets selected, the output `assetSelected` will emit a new event.

```html
<mat-form-field>
    <mat-label>
        Select Asset
    </mat-label>

    <mat-select (selectionChange)="assetSelected.next($event.value)">
        <mat-option *ngFor="let asset of (assets$ | async)" [value]="asset.id">
            {{ asset.name }}
        </mat-option>
    </mat-select>
</mat-form-field>
```

### Asset Pricer Component

The Asset Pricer component is responsible for displaying the prices, and also show when a price went up or down for 2 seconds. 

As you may have noticed, this component is the cool one. We receive an asset ID as input, and we create a subscription to the store for streaming the prices to our component.

> Technically this is a smart component and should have passed the data down to dumb components, but for brevity, I thought it’d be better to show all the code in one single component

```typescript
@Component({
    selector: 'cf-asset-pricer',
    templateUrl: './asset-pricer.component.html',
    styleUrls: ['./asset-pricer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssetPricerComponent implements OnInit {
    @Input()
    public asset: string;

    public price$: Observable<string>;
    public trend$: Observable<Trend>;

    public readonly trends = Trend;

    constructor(private pricesFacade: PricesFacadeService) {}

    ngOnInit() {
        this.price$ = this.pricesFacade.getPriceForAsset(this.asset).pipe(
            filter(Boolean),
            map((price: string) => {
                return parseFloat(price).toFixed(2);
            }),
            shareReplay(1)
        );

        const timer$ = this.price$.pipe(
            switchMap(() => timer(2000)),
            mapTo(Trend.Stale)
        );

        const trend$ = this.price$.pipe(
            pairwise(),
            filter((prices: string[]) => prices[0] !== prices[1]),
            map((prices: string[]) => prices.map(parseFloat)),
            map(([previous, current]: number[]) => {
                return current > previous ? Trend.Up : Trend.Down;
            })
        );

        this.trend$ = merge(trend$, timer$);
    }
}
```

This component is a little bit more complex so we may want to break this down. Our goal is to:

*    display a red price when a price goes down
*   display a green price when the price goes up
*   return the price to a normal state (white) after 2 seconds

This is what happens:

*   we get a price via the facade method `getPriceForAsset` and we simply map to its formatted version
*   we store in memory the latest price received with `shareReplay(1)` so we can reuse the subscription to calculate the trend
*   every time we get a new price, we create a timer that maps the price state to `Stale` 
*   we use the operator `pairwise` that gives us the current and the previous value for the current subscription, and thanks to that we can figure out if the price went up or down
*   The trend is an observable emitted when a price changes, and is obtained by merging the timer and the trend result. Every time we have a price change, it first becomes red or green, and then goes back to its normal state after 2 seconds when the observable `timer$` emits a value

```html
<div class="price-container">
    <div class="price"
         *ngIf="(price$ | async) as price; else showEmptyState"
         [ngClass]="{
            'trend-up': (trend$ | async) === trends.Up,
            'trend-down': (trend$ | async) === trends.Down
         }"
    >
        ${{ price }}
    </div>

    <ng-template #showEmptyState>
        <mat-spinner></mat-spinner>
    </ng-template>
</div>
```

The template is very simply the price obtained by the store, replaced by a spinner while the price is undefined, meaning the subscription is still ongoing. 

The classes `trend-up` and `trend-down` are added to style the price’s color.

## Final words

NGRX is a very powerful tool. Certainly, sometimes it may require some in-depth knowledge of RxJS, but with a little bit of patience, it can really revolutionize the way you’ve been writing software. 

I hope this tutorial has helped you understand how to set up a basic (yet scalable) folder structure and the basics to start writing powerful reactive applications with Angular and NGRX.

For any clarifications or if there are things you’d do differently, feel free to send me an email or comment below.

### Source Code

The full source code of the project can be seen at [https://github.com/Gbuomprisco/cryptofolio](https://medium.com/r/?url=https%3A%2F%2Fgithub.com%2FGbuomprisco%2Fcryptofolio)

* * *

Hope you enjoyed the article and leave a message if you agree, disagree, or if you would do anything differently!

* * *

_If you enjoyed this article, follow me on_ [_Medium_](https://medium.com/@.gc) _or_ [_Twitter_](https://medium.com/r/?url=https%3A%2F%2Ftwitter.com%2Fhome) _for more articles about Angular, RxJS, Typescript and more!_
