---
date: 2019-06-05
title: Building Side Effects in NGRXs
---
* * *

### Building Side Effects in NGRX

This is the third article of a series that aims to explain in detail a step-by-step approach to building an Angular application with NGRX.

*   In [the first article of this series](https://medium.com/r/?url=https%3A%2F%2Fitnext.io%2Fstate-management-with-ngrx-introduction-1aae0803e988), I wrote a small overview of all the concepts surrounding the NGRX platform.
*   In [the second article of this series](https://medium.com/r/?url=https%3A%2F%2Fitnext.io%2Farchitecting-the-store-in-ngrx-e4955641d746), I started writing the store of the application and the state’s entities.

If you have never worked with NGRX, or have never done something in-depth with, I’d really recommend you read it.

### Summary

Just to summarise what I introduced in the previous articles, we have an application that aims to display a dashboard with cryptocurrencies prices.

The application’s logic is built using three service modules, each module manages a different feature of our store.

These are:

*   **dashboard**, that manages the logic of the dashboard and its tiles
*   **assets,** a list of assets fetched from [Coincap’s](https://medium.com/r/?url=https%3A%2F%2Fcoincap.io) API
*   **prices,** a stream of prices from Coincap’s WebSocket API 

### In this article we will be learning:

*   how to build effects in NGRX 8
*   how to build an effect that fetches the assets list from the API
*   how to build an effect that connects to a WebSocket and listens for messages that will be stored in our application’s state

### Coincap’s API Service

In order to fetch data from Coincap, we create a service that we’re going to use in our Effects classes:

```typescript
@Injectable()
export class CoincapService {
    constructor(private http: HttpClient) {}

    public getAssets(
        search: string[],
        ids: string[] = [],
        limit = 5
    ): Observable<GetAssetsResponseDto> {
        return this.http.get<GetAssetsResponseDto>(EndPoints.Assets, {
            params: { search, ids, limit: limit.toString() }
        });
    }
}
```

At the moment, we have one single method:

*   **getAssets**, that by default will be fetching the first top 5 assets

This method will be returning `GetAssetsResponseDto` which is simply:

```typescript
interface GetAssetsResponseDto {
    data: Asset[];
    timestamp: number;
}
```

## Assets Effects

Let’s now create the effects for the _Assets_ store. As we have seen in the previous article, we have created three actions:

*   getAssetsRequestStarted
*   getAssetsRequestSuccess
*   addAssets

### Private API

Let’s summarize what our actions will be doing:

*   we want to react to a _getAssetsRequestStarted_ action and dispatch a _getAssetsRequestSuccess_ action
*   once _getAssetsRequestSuccess_ action is received, we will dispatch _addAssets_ that gets picked up by the reducer function and add the assets to the store

Let’s first create the effect that will be responsible for fetching the assets:

```typescript
private getAllAssets() {
    return createEffect(() =>
        this.actions.pipe(
            ofType(getAssetsRequestStarted.type),
            mergeMap(({ payload }: { payload: string[] }) =>
                this.coincap.getAssets(payload).pipe(
                    map((response: GetAssetsResponseDto) => response.data),
                    catchError(() => of(undefined))
                )
            ),
            filter(Boolean),
            map((payload: Asset[]) => {
                return getAssetsRequestSuccess({ payload });
            })
        )
    );
}
```

**Let’s break this effect down**

*   instead of using the decorator `@Effect` , we simply import the function `createEffect` from `@ngrx/effects` 
*   we receive an action `getAssetsRequestStarted` 
*   we call the `getAssets` method we defined earlier in the Coincap service, and we map the stream to the result of this request
*   if there’s an error, we simply return `undefined` which will be filtered in the stream thanks to `filter(Boolean)`
*   we then map the stream to the action `getAssetsRequestSuccess` 

The second effect will be responsible for intercepting `getAssetsRequestSuccess` and simply map it to `addAssets` 

```typescript
private addAssets() {
    return createEffect(() =>
        this.actions.pipe(
            ofType(getAssetsRequestSuccess.type),
            map(({ payload }: { payload: Asset[] }) =>
                addAssets({ payload })
            )
        )
    );
}
```

### Public API

Finally, we expose the public API:

```typescript
public getAllAssets$ = this.getAllAssets();
public addAssets$ = this.addAssets();
```

And this is the complete snippet:

```typescript
@Injectable()
export class AssetsEffects {
    constructor(private actions: Actions, private coincap: CoincapService) {}

    public getAllAssets$ = this.getAllAssets();
    public addAssets$ = this.addAssets();

    private addAssets() {
        return createEffect(() =>
            this.actions.pipe(
                ofType(getAssetsRequestSuccess.type),
                map(({ payload }: { payload: Asset[] }) =>
                    addAssets({ payload })
                )
            )
        );
    }

    private getAllAssets() {
        return createEffect(() =>
            this.actions.pipe(
                ofType(getAssetsRequestStarted.type),
                mergeMap(({ payload }: { payload: string[] }) =>
                    this.coincap.getAssets(payload).pipe(
                        map((response: GetAssetsResponseDto) => response.data),
                        catchError(() => of(undefined))
                    )
                ),
                filter(Boolean),
                map((payload: Asset[]) => {
                    return getAssetsRequestSuccess({ payload });
                })
            )
        );
    }
}
```

## Prices Effects

In order to fetch the prices from the Coincap’s WebSocket API, we extend the Coincap service we created earlier and add a new method responsible for connecting to the price streams and returning an Observable that emits price ticks.

### WebSocket Connection 

In order to do this, we:

*   create a connection by calling `WebSocket(url)`
*   we create a new Observable, and inside this, we emit an event every time the WebSocket connection receives a message using the `onmessage` hook
*   we define the `unsubscribe` method, which will simply close the WebSocket connection

```typescript
export class CoincapService {
    // .. other methods

    webSocket: WebSocket;

    public connectToPriceStream(assets: string[]): Observable<PriceState> {
        this.createConnection(assets);

        return new Observable(observer => {
            const webSocket = this.webSocket;

            webSocket.onmessage = (msg: MessageEvent) => {
                observer.next(JSON.parse(msg.data));
            };

            return {
                unsubscribe(): void {
                    webSocket.close();
                }
            };
        });
    }

    private createConnection(assets: string[]) {
        if (this.webSocket) {
            this.webSocket.close();
        }

        this.webSocket = new WebSocket(
            EndPoints.WebSocket + `?assets=${assets}`
        );
    }
}
```

### API

We have created three actions:

*   createPriceSubscription
*   closePriceSubscription
*   addPrice

And this is what the effects look like:

```typescript
@Injectable()
export class PricesEffects {
    constructor(
        private actions: Actions,
        private coincap: CoincapService,
        private pricesFacade: PricesFacadeService
    ) {}

    createPriceSubscription$ = this.createPriceSubscription();
    prices$ = this.getPrices();

    private createPriceSubscription() {
        return createEffect(() =>
            this.actions.pipe(
                ofType(createPriceSubscription.type),
                map(({ payload }) => payload),
                withLatestFrom(this.pricesFacade.getSubscribedAssets()),
                mergeMap(([payload, assets]: [string, string[]]) => {
                    return this.connectPriceStream([...assets, payload]);
                }),
                map((price: PriceState) => priceReceived({ payload: price }))
            )
        );
    }

    private getPrices() {
        return createEffect(() =>
            this.actions.pipe(
                ofType(priceReceived.type),
                map(({ payload }) => addPrice({ payload }))
            )
        );
    }

    private connectPriceStream(assets: string[]) {
        return this.coincap
            .connectToPriceStream(assets)
            .pipe(
                takeUntil(
                    this.actions.pipe(ofType(closePriceSubscription.type))
                )
            );
    }
}
```

Let’s break down the `createPriceSubscription$` effect:

*   we receive an action `createPriceSubscription` 
*   we connect to the stream via the Coincap service, which will return an _Observable_ that will emit prices
*   every price will create an action `priceReceived` 
*   we add a `takeUntil` operator to the price stream observable, so that every time an action `closePriceSubscription` is received, the observable will automatically be unsubscribed

The `prices$` effect is fairly simple:

*   we receive an action `priceReceived` and we map it to an action `addPrice` that will be handled by the reducer and will add the price to the store

### Updating the Store Modules

Lastly, we need to update both the store service modules by adding the effects using the method `EffectsModule.forFeature([EffectsClass])` . 

The prices store module looks something like this:

```typescript
@NgModule({
    imports: [
        StoreModule.forFeature('prices', pricesReducer),
        EffectsModule.forFeature([PricesEffects])
    ],
    providers: [
        // still empty!
    ]
})
export class PricesStoreModule {}
```

## Final Words

In this walkthrough, we create a few very simple effects that do some very common tasks, such as talking to an API endpoint, creating streams of Observables from real-time messaging systems, and updating the reducer as a result of dispatching actions.

In the next article, we will finally build some components and connect the store to the UI using a Facade Service.

Hope you enjoyed the article and leave a message if you agree, disagree, or if you would do anything differently!

* * *

_If you enjoyed this article, follow me on_ [_Medium_](https://medium.com/@.gc) _or_ [_Twitter_](https://medium.com/r/?url=https%3A%2F%2Ftwitter.com%2Fhome) _for more articles about Angular, RxJS, Typescript and more!_
