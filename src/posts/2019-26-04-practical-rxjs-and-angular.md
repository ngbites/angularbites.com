---
date: 2019-04-26
title: 'Practical RxJS and Angular'
tags:
  - angular
  - ngrx
---

Working with RxJS **is a little bit like having superpowers**: your powers allow you to do extraordinary things, but they’re easy to misuse, and when that happens - it can be quite dangerous!

In this article, I want to talk about practical scenarios that I found useful while working with Angular and RxJS, going through useful patterns you may use and what to look out for.

Starting from a basic situation which only involves displaying a list, we will move on to more complex situations such as stopping ongoing requests, delaying user’s input and storing data with _Subjects_.

## The Basics of RxJS

### Getting and Displaying data with HTTP Client

In this example, we will be fetching repositories from Github’s API with Angular’s HTTP Client and we will display it as a list. This is what the component will look like:

![](https://cdn-images-1.medium.com/max/1600/1*V_yVBwZ0AluJFmDf2kxzxQ.png)

Told ya it was simple!

Let’s assume we have a functioning Angular workspace created with the CLI, and that we created a new route called _GithubRepositoriesComponent._ This is what it looks like initially:

```typescript
@Component({
    selector: 'app-github-repositories',
    templateUrl: './github-repositories.component.html',
    styleUrls: ['./github-repositories.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GithubRepositoriesComponent {}
```

> For simplicity’s sake — we will code all the logic within the component. Not something I’d recommend though!

Next, we do the following things:

*   we import _HttpClient_ via Dependency Injection
*   we declare two methods: _onTextChange,_ which is simply a handler for the input element, and _fetchRepositories,_ which is responsible for performing the request to the API
*   we assign the observable returned by the HTTP client to _searchResult$_

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RepositorySearchResponse } from '../../shared/models/repository-search-response.interface';

const GITHUB_URL = 'https://api.github.com/search/repositories';

@Component({
    selector: 'app-github-repositories',
    templateUrl: './github-repositories.component.html',
    styleUrls: ['./github-repositories.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GithubRepositoriesComponent {
    searchResult$: Observable<RepositorySearchResponse>;

    constructor(private http: HttpClient) {
    }

    onTextChange(query: string) {
        this.searchResult$ = this.fetchRepositories(query);
    }

    private fetchRepositories(query: string): Observable<RepositorySearchResponse> {
        const params = { q: query };
        return this.http.get<RepositorySearchResponse>(GITHUB_URL, { params });
    }
}
```

Then, we subscribe to _searchResult$ *not* in the component but in the template thanks to the _async_ pipe. Yes — instead of subscribing within the component and assigning the resulting value to a local property, we let the async pipe subscribe to it.

```html
<h1>Github Repositories Search</h1>

<label class="mt-2">
    <span>Repository name:</span>

    <input type="text"
           class="ml-2"
           [ngModel]="''"
           (ngModelChange)="onTextChange($event)"
    />
</label>

<div *ngIf="(searchResult$ | async) as searchResult">
    <h2>Repositories</h2>

    <ng-container [ngSwitch]="searchResult.items.length">
        <ng-container *ngSwitchCase="0">
            No results found
        </ng-container>

        <ng-container *ngSwitchDefault>
            <div *ngFor="let result of searchResult.items">
                {{ result.name }}
            </div>
        </ng-container>
    </ng-container>
</div>
```

But as you may have noticed, this is very basic and a pretty rusty search form. Let’s improve it a little thanks to some RxJS magic.

> The templates are using some helpful Bootstrap classes for styling

### Skipping requests

We want to be nice programmers, therefore we try to never consume precious resources from our services. RxJS helps us thanks to its powerful operators, but unfortunately, our initial solution has some problems:

*   if we enter a white-space, the request gets made again
*   requests run as soon as the model gets changed
*   if the user types something before the request has finished, the request keeps running

We can use a few new operators to avoid these issues, but we also need to refactor our code a little. 

This is what we will do next:

*   instead of re-assigning our observable every time the model changes, we create a single stream created when the component is initiated. To do this, we introduce a _Subject_, that is a stream of queries
*   we trim and normalize our queries stream, so we can **filter** empty queries
*   we add the operator _debounceTime(500)_ in order to **debounce** the queries every 500 milliseconds
*   we add _distinctUntilChanged,_ which will **skip** requests if the query was entered consecutively
*   we **map** the queries stream to a stream of requests with _switchMap_

Consider the following changes to our initial solution:


_Why switchMap?_ switchMap not only map queries to HTTP requests but will also cancel any ongoing request. See the following:

![](https://cdn-images-1.medium.com/max/1600/1*QOncAKIrICia9bNZPCh10A.gif)

I entered a search term likely to take a lot of time, so I had enough time to re-enter a term while the search request was running. 

As you can see in the network tab, the first three requests were canceled!

Yay! 🎉

* * *

Next thing our app could be doing is to show the owner’s information when we hover a repository’s name. We can show the name, avatar, bio, and the organizations the owner belongs to, for which we will need to make an additional request.

What do we need to do?

*   Creating a handler when the user hovers and leaves a repository item
*   Fetching organizations when hovering a repository, and resetting when the mouse leaves it
*   Because it does not make sense to keep repositories belonging to organizations in our list, we will filter it thanks to a powerful custom operator!
*   Refactor our initial code a little bit for simplification

### Custom Operators

Creating custom operators is a very useful technique that could be useful for reusing some of the logic that sometimes we end up using in similar situations, or when readability may benefit by making generic operators more declarative by mixing it with our domain business logic.

For example, in our application, we want to add an operator can filter an observable of repositories with only repositories belonging to a user, and not to an organization.

This is what the code could look like:

```typescript
import { map } from 'rxjs/operators';

import { OwnerType } from '../enums/owner-type.enum';
import { Repository } from '../models/repository.interface';

export const filterByOwnerType = (type: OwnerType) => {
    const filterFn = (repository: Repository) => repository.owner.type === type;

    return map((repositories: Repository[]) => {
        return repositories.filter(filterFn);
    });
};
```

This code simply applies a filter function to the array of repositories and maps it as an observable.

### Complete Example

The rest of the code should be fairly straightforward:

*   we replaced _searchResult$_ with _repositories$_
*   we added the _organizations$_ observable and the _selectedRepository$_ subject
*   the handler _onRepositoryMouseEvent_ takes care of updating _selectedRepository$_
*   the custom operator _filterByUOwnerType_ is added to the _repositories$_ stream
*   in the template, we added the organizations' list and the owner section appearing when a repository gets hovered


```typescript
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// Rx
import { Observable, of, Subject } from 'rxjs';

import {
    debounceTime,
    distinctUntilChanged,
    filter,
    map,
    switchMap,
} from 'rxjs/operators';

import { filterByOwnerType } from '../../shared/operators/filter-by-owner-type';

// interfaces
import { RepositorySearchResponse } from '../../shared/models/repository-search-response.interface';
import { Organization } from '../../shared/models/organization.interface';
import { Repository } from '../../shared/models/repository.interface';
import { OwnerType } from '../../shared/enums/owner-type.enum';

const GITHUB_URL = 'https://api.github.com/search/repositories';

@Component({
    selector: 'app-github-repositories',
    templateUrl: './github-repositories.component.html',
    styleUrls: ['./github-repositories.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GithubRepositoriesComponent implements OnInit {
    queries$ = new Subject<string>();
    selectedRepository$ = new Subject<Repository | undefined>();
    repositories$: Observable<Repository[]>;
    organizations$: Observable<Organization[]>;

    constructor(private http: HttpClient) {
    }

    ngOnInit() {
        this.repositories$ = this.queries$.pipe(
            map((query: string) => query ? query.trim() : ''),
            filter(Boolean),
            debounceTime(500),
            distinctUntilChanged(),
            switchMap((query: string) => this.fetchRepositories(query)),
            filterByOwnerType(OwnerType.User)
        );

        this.organizations$ = this.selectedRepository$.pipe(
            map((repository) => repository && repository.owner.organizations_url),
            switchMap((url: string | false) => {
                return url ? this.fetchUserOrganizations(url) : of(undefined);
            }),
        );
    }

    onTextChange(query: string) {
        this.queries$.next(query);
    }

    onRepositoryMouseEvent(repository: Repository | undefined) {
        this.selectedRepository$.next(repository);
    }

    private fetchRepositories(query: string): Observable<Repository[]> {
        const params = { q: query };

        return this.http
            .get<RepositorySearchResponse>(GITHUB_URL, { params })
            .pipe(
                map((response: RepositorySearchResponse) => response.items)
            );
    }

    private fetchUserOrganizations(url: string): Observable<Organization[]> {
        return this.http.get<Organization[]>(url);
    }
}
```

```html
<h1>Github Repositories Search</h1>

<label class="mt-2">
    <span>Repository name:</span>

    <input type="text"
           class="ml-2"
           [ngModel]="''"
           (ngModelChange)="onTextChange($event)"
    />
</label>

<div class="row">
    <div class="col-md-6" *ngIf="(repositories$ | async) as repositories">
        <h2>Repositories</h2>

        <ng-container [ngSwitch]="repositories.length">
            <ng-container *ngSwitchCase="0">
                No results found
            </ng-container>

            <div class="d-flex justify-content-between row" *ngSwitchDefault>
                <div class="col-md-6">
                    <!-- REPOS LIST -->
                    <div
                        *ngFor="let repository of repositories"
                        (mouseover)="onRepositoryMouseEvent(repository)"
                        (mouseleave)="onRepositoryMouseEvent(undefined)"
                    >
                        {{ repository.name }}
                    </div>
                </div>

                <div>
                    <!-- OWNER -->
                    <div *ngIf="(selectedRepository$ | async) as selectedRepository">
                        <h4>{{ selectedRepository.owner.login }}</h4>

                        <img [attr.src]="selectedRepository.owner.avatar_url"
                             width="200"
                             height="auto"
                             alt="avatar"
                        />
                    </div>

                    <!-- ORGANIZATIONS -->
                    <div *ngIf="(organizations$ | async) as organizations" class="mt-2">
                        <h6>Organizations</h6>

                        <div *ngFor="let org of organizations" class="d-inline-flex mr-2">
                            <img [attr.src]="org.avatar_url"
                                 width="50"
                                 height="50"
                                 alt="org avatar"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </ng-container>
    </div>
</div>
```

And this is what it looks like:

![](https://cdn-images-1.medium.com/max/1600/1*ukvZnxzqT3yTKitCVjvVJQ.gif)

Oh yeah, that was me by the way! 🙄

## State Management

No, this is not another explanation about _NGRX_, or _Redux_.

I want to show you some issues when we deal with getting the current state from our Observables and Subjects.

Let’s say we want to retrieve the latest information received without going through the template, which as we’ve seen is fairly easy.

Let’s add a button that would allow the user to export the current list of repositories (of course, we won’t implement the functionality, but we will just log the list).

Easy, right?

Let’s create the export function:

```typescript
exportRepos() {
    this.repositories$.subscribe(repos => {
        console.log(repos);
        // export function here });
    });
}
```
And see how it behaves:

![](https://cdn-images-1.medium.com/max/2400/1*0QLd2zSp8Dg6iXRUhYEtQw.gif)

As you may have seen, the logs did not appear until the observable emitted a new value! The reason is the observable was subscribed **after it emitted a value**.

In order to fix this, we introduce another operator called _shareReplay. _

This operator will keep a memory of the emissions that we can subscribe at a later time. Under the hood, it uses a _ReplaySubject_ to keep the state. Because we only want it to hold the latest emission, which is our current state, we need to pass an argument called _bufferSize_ and we set it to _1,_ which in plain English means only “please keep the latest 1 emission(s) in your memory”.

And this is how our final stream looks like:

![](https://cdn-images-1.medium.com/max/1600/1*EkvWjPMk8eNWXJPbTXrFWw.png)

Let’s see how our application will work!

![](https://cdn-images-1.medium.com/max/2400/1*-otqLWTJJ5g1L3iipnE03Q.gif)

Wait, what? Did you notice that when I entered “react” as search term, the repositories were logged again without us having to click on the button? That does sound like a bug, a very common one if I may add.

Very simply — we forgot to change the export function, which should subscribe to the observable, but close the subscription right away! Do we unsubscribe manually? Maybe that’s not needed. Let’s use the operator _take,_ which will unsubscribe from the observable once it emits the number of times equal to the number we give it as an argument.

Let’s fix that! We pipe our observable with the operator _take(1):_

![](https://cdn-images-1.medium.com/max/1600/1*eSCkhW5u6RH0vjhh1OKNxw.png)

#### Why is this important?

*   it’s a common cause of logic bugs, ex. methods being called when they shouldn’t
*   it’s a common cause of memory leaks, as the subscriptions are not cleaned up!
*   the more often the observable emits, the bigger the issue. Try absolutely avid this with observables emitting from real-time sources!
*   it’s quite common when using _store.select()_ from NGRX, so watch out when using that

## Final Words

As you may have seen - we accomplished with a few RxJS lines what could have taken hundreds without.
It is a powerful tool, that if understood well and used correctly, can really make your code beautiful and easy to read.

As you may also have seen, it doesn't take much to make mistakes with it as well. A small misunderstanding of a certain behaviour can lead to bugs and memory leaks.
This is something to take into account if your team is starting to use it - but be assured - it will be worth it.
