---
date: 2019-04-29 00:00:00
title: "Understanding Angular Modules"
featuredImage: 'https://cdn-images-1.medium.com/max/1600/1*gpPfP-mWGZ7Ad6KRDAeKGw.jpeg'
description: A quick but comprehensive guide for understanding the different types of Angular Modules
tags:
    - angular
---

Understanding the different types of [Angular modules](https://angular.io/guide/module-types) is a key factor for architecting or refactoring an application.

The concept of Angular modules has matured since they were first introduced in the framework in a late RC release.

But as years have passed, both the Angular team and the community have come up with guidelines that explain what the different types of modules are, and what they are for.

## Anatomy of an Angular Module

Angular modules are made of a simple set of properties and one lifecycle hook. In order to fully understand modules, we want to first inspect each property and what they are for.

Let’s have an overview of the _NgModule_ interface:

```typescript
export interface NgModule {
    providers?: Provider[];
    declarations?: Array<Type<any> | any[]>;
    imports?: Array<Type<any> | ModuleWithProviders<{}> | any[]>;
    exports?: Array<Type<any> | any[]>;
    entryComponents?: Array<Type<any> | any[]>;
    bootstrap?: Array<Type<any> | any[]>;
    id?: string;
    schemas?: Array<SchemaMetadata | any[]>;
    jit?: true;
}
```

### Declarations

Maybe the simplest and most used property, we use the _declarations_ array for importing _components_, _directives,_ and _pipes_.

### Providers

Another commonly known property, we use the array providers for defining services that have been decorated with the _Injectable_ decorator, which makes them accessible via the Angular DI.

### Imports

We use the _imports_ array for importing other modules.

### Exports

By default, everything defined in a module is private_. Exports_ is an array that allows the declarations and the declarations within a module accessible from the modules that import the module where these are defined.

### EntryComponents

EntryComponents specifies the list of components compiled when the module is bootstrapped. These components are not components defined in a template but are normally loaded imperatively, for example using _ViewContainerRef.createComponent()._

An example is routing components, but the framework adds them to _entryComponents_ automatically.

### Bootstrap

Bootstrap also specifies components compiled when the module is bootstrapped and automatically adds them to _entryComponents._

### Id

A name that identifies the module

### Schemas

The allowed values for this property are NO\_ERRORS\_SCHEMA or CUSTOM\_ELEMENTS\_SCHEMA that you may want to use when using, for instance, a web component.

I recommend using this with care, as components that you may have left undefined will not throw an error.

It’s something that can be normally used when testing when you do not want to test components you haven’t defined in the module. But always use being aware of what is actually being skipped by the compiler.

### JIT

This property will make the framework always compile the module using JIT rather than AOT.

* * *

Before we start diving into each of them, let’s first say that we have 5 different types of modules:

*   Domain Modules
*   Routed Modules
*   Routing Modules
*   Service Modules
*   Widget Modules

To these, I feel like we need to also mention 3 _extra_ modules_: AppModule, AppServerModule,_ and _SharedModule_.

## AppModule

Let’s start with the most common module you’ll see, the so-called _AppModule_.

AppModule, also often referred to as the root module, is the module responsible for bootstrapping the whole application, that means we need to import into the AppModule all the modules and providers that are required for running the application.

This module usually imports core Angular modules, shared modules, domain modules, service modules, and _AppRoutingModule_ (the root routing module which we will introduce later).

Also, it bootstraps the root component, usually called _AppComponent_.

```typescript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
    declarations: [
        AppComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
    exports: []
})
export class AppModule {
}
```

Remember, anything that can be lazy-loaded should not be imported in this module. That means — if we only need a service contained in a module in a lazy-loaded route, **we only import it in that route’s module**.

### Checklist

*   declares and bootstraps only root component (mandatory)
*   imports other modules (Angular modules, domain modules, _SharedModule_)
*   can declare providers
*   doesn’t export anything

## AppServerModule

AppServerModule is only used if you’re using server-side rendering for your app.

I would have called it the server counterpart of _AppModule,_ but the [Angular documentation](https://medium.com/r/?url=https%3A%2F%2Fangular.io%2Fguide%2Funiversal) has probably a better definition for it:

> _It’s the bridge between the Universal server-side renderer and the Angular application_.

## SharedModule

A _SharedModule_ is a module responsible for hosting all shared entities that will be provided to every module of the application.

A _SharedModule_ is usually made up of entities that are shared across different modules within a project — but aren’t normally needed outside of it.

It’s important to understand what should be built in a SharedModule and what should be built in a library: when you find that services or components can be reused across different teams and projects and that ideally don’t change very often, you may want to build an _Angular Library_ instead than hosting your files locally.

The _SharedModule_ is normally imported by _AppModule_.

A more in-depth explanation about this can be found in my previous article for [creating enterprise-grade project structures](https://medium.com/r/?url=https%3A%2F%2Fitnext.io%2Fbuilding-an-enterprise-grade-angular-project-structure-f5be32533ba3).

## Domain Modules

Domain modules are module pertaining features of your application. For instance, e-commerce apps may contain the following domain modules:

*   Shopping cart — that exports _shopping-cart.component.ts_
*   Check-out that — exports _check-out.component.ts_
*   Product detail view — that exports _product-detail-view.component.ts_

Depending on the complexity of a module, which is up to you to evaluate, a domain module can be broken down into smaller domain modules.

For instance, the Product detail view module could import smaller modules such as product comments, product description, or product reviews.

This does make sense when each module is a complex collection of components, or if you think that in the future a certain component will be more and more complex.

### Checklist

Domain modules:

*   only export the top component
*   rarely declare providers
*   can be imported by AppModule or other Domain modules

## Routing Modules

Routing modules are responsible for declaring the routes of a domain module (including AppModule), passing the configuration to the module, and for defining guards and resolvers services. This also includes referencing the modules that will load lazy-loaded routes that we will show in the next section.

Let’s see an example of a Routing module for a profile page domain module:

```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Route, RouterModule } from '@angular/router';

// top component
import { ProfilePageComponent } from './profile-page/profile-page.component';

const route: Route = {
    component: ProfilePageComponent,
    path: ''
};

@NgModule({
    declarations: [ProfilePageComponent],
    imports: [
        CommonModule,
        RouterModule.forChild([route]),
    ],
    providers: [],
    exports: [RouterModule]
})
export class ProfilePageModule {}
```

Difference between AppRoutingModule and Children Routing Modules:

*   AppRoutingModule will define routes using the _forRoot_ property on RouterModule, while all others should use the property _forChild._ As you can see in the example above_, we’re using forChild_

### Checklist

Routing Modules:

*   import the routing configuration with _forRoot_ or _forChild_
*   can declare resolvers and guards as providers — and not any other service
*   always export _RouterModule_
*   do not declare anything

## Routed Modules

Routed modules are very simply defined as the modules hosting a lazy-loaded route, which are referenced by a _Routing Module_ imported by a _Domain Module_ or _AppModule_. Let’s see a simple example:

We first define a routed module for the lazy-loaded route _ProfilePage_ called _ProfilePageModule:_

And then we reference (rather than import) ProfilePageModule in the module _AppRoutingModule_:

```typescript
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
    {
        path: 'profile-page',
        loadChildren: './profile-page/profile-page.module#ProfilePageModule'
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {}
```

Always make sure the path to your module is correct, and that the name of the module is exactly the same as the one referenced in the path. Also, watch out for the extension: as you can see in the example above, it’s omitted.

### Checklist

Routed modules:

*   can declare components, pipes, and directives
*   rarely declares providers
*   exports _RouterModule_
*   are never imported! Importing it won’t make it lazy-loaded. It is, instead, referenced by the relative routing module

## Service Modules

As the name suggests, Service modules are modules that only define services. Good examples of these are _HttpClientModule._

They are normally useful in a variety of situations:

*   only handling logic without any references to UI that leads to highly-reusable pieces of logic that can be used by different domain modules
*   messaging
*   state management

### Checklist

Service modules:

*   only define providers
*   are imported by Domain Modules

## Widget Modules

Widgets Modules are modules that collect and export declarations. An example of _WidgetModule_ is 3rd party UI libraries that provide components and directives.

If you or your company are building a UI library, it can probably be classified as such.

### Checklist

Widget modules:

*   only declare declarations
*   rarely have providers
*   only export declarations
*   are imported by Domain Modules

### Signs you may need a _Widget Module_:

*   declarations are highly reusable
*   declarations are not specific to any domain module
*   a component is not a container

## Final Words

As the community keeps growing and getting more expert at writing Angular applications, I believe it’s still possible that the list of module types can be different or expand in the future.

Even if you do not remember all the rules, ask yourself these questions when writing a module which will help you architect modules according to the guidelines:

*   should this particular component/service be imported? 
*   should these declarations be private/public?
*   should these declarations be part of a separate Widget Module?
*   should these services be defined here, or should they live in a Service Module?
*   should this group of components be a smaller domain module?

As always, my recommendation is to keep architecture matters a team issue, and not a one-man issue. 

By asking and following these questions, you also provide your team with a clear guideline to follow, which should also result in a smooth and consistent way that the whole team can understand and abides by.
