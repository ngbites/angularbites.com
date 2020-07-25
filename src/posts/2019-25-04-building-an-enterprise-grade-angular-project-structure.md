---
date: 2019-04-25
title: Building an enterprise-grade Angular project structure
tags:
  - angular
---

An important task in setting up a modern front-end project is to define a scalable, long-term and future-proof folders structure, and the naming guidelines for each different programming entity.

While some think of this as a simple and secondary aspect — it often hides more complexities than it seems. Even though most times there is no perfect solution — we can explore some of the industry best practices, and some of the things that in my experience made the most sense.

In this article we’ll go through:

*   defining the entities that make up our project at each level of the stack
*   distributing our Angular and Typescript entities in folders
*   state management as a collection of service modules

## Angular entities

The first thing I often do when setting up a new codebase is to think and define the programming entities that make up my stack. As Angular developers, we know some of them pretty well already:

*   modules, components, directives, services, pipes, and guards

As suggested by the framework’s documentation, every time we create each one of these entities we will suffix the filename with the name of the entity.

Therefore — if we create a pipe whose class is called _HighlightPipe,_ we will name its file _highlight.pipe.ts,_ and if we have a component called _DropdownComponent_ we want to its files _dropdown.component.ts, dropdown.component.html_ and _dropdown.component.scss._

### Feature Modules

We cannot talk about an Angular project’s structure without first talking about Angular Modules.

As Angular apps are made of modules that can import other modules, they naturally become the root folders that make up an Angular project. Each module will contain all other Angular entities contained in their own folders.

Let’s say we’re building an e-commerce application, and we create a shopping cart feature module, this is what its structure could look like:

![](https://cdn-images-1.medium.com/max/1600/1*ehG_arBxpW0L2_MfzLC11w.png)

> 💡As you may notice, I tend to differentiate between _containers_ (smart)  and _components_ (dumb) so I place them in different folders, but it’s not something I necessarily advocate

A _Feature Module_ is not supposed to export anything except the top component, so anything we define within it will not be used elsewhere.

### Shared Modules

What if something needs to be reused elsewhere, though?

In this case, we create a shared module _SharedModule_ that will host all shared entities that will be provided to every module of the project.

A _SharedModule_ is usually made up of entities that are shared across different modules within a project — but aren’t normally needed outside of it. When we do encounter services or components that can be reused across different teams and projects, and that ideally don’t change very often, we may want to build an _Angular Library_.

> 💡For a detailed overview of all the different module types, you can check that out on [Angular’s official website](https://medium.com/r/?url=https%3A%2F%2Fangular.io%2Fguide%2Fmodule-types).

![](https://cdn-images-1.medium.com/max/1600/1*4yJiLhCEV4RNKN_7dw5PBA.png)

### Libraries, Monorepos and Microfrontends

When you are using highly-reusable services or components, which can be classified as _Service Modules_ and _Widget Modules,_ you may want to build these modules as _Angular Libraries,_ which can be either be created in their own repository or in a larger _monorepo_.

Thanks to the powerful CLI, we can easily generate Angular libraries that will be built in a folder called _projects_ with this simple command_:_

    ng generate library my-lib

For a complete description regarding Angular libraries, have a look at the [official documentation on Angular.io](https://medium.com/r/?url=https%3A%2F%2Fangular.io%2Fguide%2Fcreating-libraries).

Using libraries has a few advantages over local modules:

*   we think and build these modules with reusability in mind
*   we can easily publish and share these libraries with other teams/projects

With also some cons:

*   you’d need to link your library to your main project and rebuild it for every change
*   if this is distributed via NPM and built outside your main project, you’d need to keep syncing your project with the latest version of the library

**Example:** Let’s say _BigCompany_ uses a messaging system all teams use — we may want to share our abstraction to avoid many libraries essentially doing the usual groundwork.

So we create a library called _messaging,_ and we publish it to NPM as _@big-company/messaging._

![](https://cdn-images-1.medium.com/max/2400/1*AcTvEFBvGrCjo3yFsMc5rQ.png)

But what about _monorepos_? and _microfrontends_?

This would probably need a larger article, but we can’t talk about enterprise-grade projects without mentioning these other two ways:

*   A _monorepo_ is a proven strategy to work with large (or even giant) codebases so that all code can be reused, where essentially all the codebase lives in the same repository. All projects will always use the latest version of the code
*   A _microfrontend_ allows large applications to be split into smaller apps in their own codebase, maybe using a totally different stack, that can be composed. For example, your login page could be written in _Vue_ and the rest of the app in _Angular_ and _React_. It is worth mentioning that _Nx Workspaces_ also allow using different technology stacks, such as _React_

> 💡 You may want to take a look at [Nx Workspace](https://medium.com/r/?url=https%3A%2F%2Fnx.dev%2Fgetting-started%2Fgetting-started)s

Building an Angular project as a _monorepo_ containing more projects and libraries is an appealing solution, but practically difficult to undertake for massive technology companies, where many teams and projects are separate and far away from each other.

So where should be libraries built?

*   If all developers of a company are set to work on the same main project, no matter how large, a monorepo could be a good solution
*   If instead developers are set to work on different projects, in different teams, locations, and more importantly codebases, you may want to build each library in their own repository

## Typescript entities

If you are using Angular with Typescript — and I assume you are, you also have to take into account Typescript’s own powerful entities that we can leverage to make a structured, well-written codebase.

Here is a list of Typescript entities that you’ll be using the most in your project:

*   classes
*   enums
*   interfaces (and types)

I like to group these entities in their own folder within a module, which I reluctantly call _core,_ but this is very much up to you and your team to decide.

I recommend creating a matching Typescript file for each back-end entity. This includes enums, DTOs (for both requests and responses), and data classes.

![](https://cdn-images-1.medium.com/max/2400/1*RlTkHY3DfZo7bMrWI6eHgA.png)

Sometimes, for example, we are going to be developing against a microservice shared by several teams within a company. In similar cases, I think it makes sense to build an angular library that will be hosting the matching classes, interfaces, and enums rather than developing the module locally.

## State Management

Whatever state management library you’re planning on using, one thing I’d recommend is to keep the business logic separated from domain modules. We can leverage the _Service Modules_ pattern  and import it in its relative feature module.

A State Management service module only needs to export two things:

*   the module itself in order to register its providers
*   a facade service that acts as a bridge between the UI components of our feature module and the store

What advantages does this pattern have?

*   if we import the module from a lazy loaded route — this will be imported only when the route is loaded. Sometimes, you may need multiple feature modules in a specific route — in which case you may be forced to import them from _AppModule_ as well
*   Better separation/encapsulation from the UI. The components don’t need to know what state-management you’re using
*   We can refactor/change the state-management 

I like to keep the state separate from feature modules, which is a practice particularly popular but that still keeps the Angular community fairly divided:

*   let’s say we have a routed module called _Dashboard_ at root level  that contained all its UI components 
*   again at root level — we have a folder called _store_ that contains all the state service modules that will handle the state

### NGRX programming entities

What programming entities does NGRX have?
- reducers
- actions
- selectors
- effects (from @ngrx/effects)
- adapter (from @ngrx/entity)

Let’s look at a brief example in the image below using NGRX, which I will be explaining in detail in a separate article.

![](https://cdn-images-1.medium.com/max/2400/1*XAewyZhX58E-BmuSFxi2dw.png)

*   The dashboard module imports the dashboard store module
*   The components within the _dashboard_ module will only communicate with the store through the service _DashboardFacadeService_


> 💡 If we create a test for each file we create, it's a good idea to place them in a separate folder

## Takeaways ⭐

*   One of the first things to think about when setting up a new project, regardless of which stack you’re using, is to think about the programming entities you are going to use
*   Some modules that are highly-reusable should probably live outside of your main app: leverage Angular libraries 💪
*   Think about splitting your feature modules from their state by creating state-management service modules
