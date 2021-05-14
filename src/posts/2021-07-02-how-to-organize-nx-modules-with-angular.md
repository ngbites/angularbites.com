---
title: Principles for creating libraries with Nx and Angular
date: 2021-02-07
featuredImage: /assets/images/posts/organize-nx-modules-ngrx.png
description: Working with Nx may be confusing. This article explains how I create Nx libraries and the principles behind my motivations.
tags:
 - nx
 - angular
---

If you've worked with both Nx at least once, you probably know it's quite complex to figure out the best way to organize your code into modules a scalable way, and that makes sense.

When you're adding some additional code, have you ever thought about where to add it?

- An app?
- A new module within an app?
- The library where it's used?
- Maybe a separate library?

Yeah - I've been there too.

After lots of trial and error, I've settled on a way that seems clean, and that plays nicely
with the Nx philosophy - but that can only work by following other principles.

This is still very much a work in progress and may change in the future, but in this article, I want to lay down some principles I follow (and intend to test further) when creating Nx libraries. I will try to dig deeper into each of these and describe them with clearer and more specific details.

## Why do we use Nx to separate code into libraries?

This is the first point to consider: why are we using Nx to split our code into different libraries in the first place?

There are multiple reasons, but here are some that come to mind:

- I want to be able to reuse code across applications
- I want each library to be a unit of the platform which is developed, changed and tested individually
- I want to restrict the code my applications are allowed to know or use

Nx also provides smart and efficient caching, which means we do not need to rebuild or re-test stuff that hasn't changed, but this is not of interest given this article's scope.

### Principle 1: Splitting by Responsibility

I usually follow the Module type approach - but I apply it at the library-level. With the fact the Angular modules *may* go one day, I feel this is also the most future-proof way to think about it.

For example, I don't recommend writing your State Management and any UI components code within the same library. A State Management library is a Services Module and should not contain any declarations.

Indeed, the scope of the State Management library is to manipulate and handle the state of a particular slice of the store. By separating the two, we can build and test them independently and swap the implementations if necessary.

You will also want to access state from different parts of the application (or from multiple applications), and you don't want to bring needless declarations with you along the way.

Let's assume your company is an enterprise that makes software for writing Tasks (yet another!). What could your libraries look like?

```typescript
// state management
import { TasksStateModule, TasksStateService } from '@enterprise/tasks/state';

// DTOs - these are very likely shared with your API!
import { CreateTaskDto, DeleteTaskDto, UpdateTaskDto } from '@enterprise/tasks/dto';

// Domain
import { Task } from '@enterprise/tasks/domain';

// API
import { TasksApiModule } from '@enterprise/tasks/api';

// common UI components and containers
import { TasksUiModule } from '@enterprise/tasks/ui';

// Tasks Page / Routed Component
import { TasksPageModule } from '@enterprise/tasks/page';

// routing (rarely needed, only use for overly complex configurations)
import { TasksPageRoutingModule } from '@enterprise/tasks/routing';

// specific features of the domain, mostly UI components, services tha facilitate their work
import { CreateTaskFeatureModule } from '@enterprise/tasks/features/create-task';
import { DeleteTaskFeatureModule } from '@enterprise/tasks/features/delete-task';
import { NewTaskFormFeatureModule } from '@enterprise/tasks/features/new-task-form';
```

The above should give you a good idea of this approach to a decently sized enterprise application.

You may want to initialize and handle state related to "tasks" even outside the "Tasks page". This is why it's useful to separate the business domain from the UI components.

If you're wondering how to create sub-libraries, you can use the "directory" parameter when creating a library:

```
nx generate library ui --directory tasks
```

### Principle 2: libraries should limit the number of exported entities

For example, in the case of a state library, only export state-related entities. That is *mostly actions and selectors*, or a Facade service that hides actions and events from the consumer if you're using one.

If you're finding yourself exporting any other entity, such as a client service, an interface (that is not the state), they can likely be placed in another common library, because chances are, these may be used elsewhere.

This suggests your library *may* be containing more than it should.

```typescript
// index.ts

export { TasksStateModule } from './tasks-state.module';

// consumers can interact and retrieve the state using the Facade
export { TasksFacadeService } from './services/tasks-facade.service';
export { MockTasksFacadeService } from './services/mock-tasks-facade.service';
```

### Principle 3: Libraries should change for one reason and one only

We can apply the Single Responsibility Principle to Nx libraries: if a library changes for multiple reasons, then it could (should?) be split.

This is nothing new, and it's well-described in *Clean Architecture* by Uncle Bob. With that said - it's also really hard to do well in practical terms.

What exactly is a single "reason"? This is a pretty tricky question you should answer when architecting a library.

What does your library do?

- Does it define the logic of a particular domain of your application(s)?
- Does it define a set of reusable UI components?
- Does it define a set of specific components related to the business domain?

If there is an "and" somewhere in your answer, then it's an indicator that you should separate the functionalities into another library.


### Final Words

Nx is relatively new, and while I've seen many projects which approached it pretty well, I still have not seen one that I was entirely satisfied with.

I have personally made loads of mistakes with it - it's really not as easy as it seems to lay down a perfect architecture for complex applications.

As this is still something I'm trying to completely figure out, I cannot 100% recommend you follow it. If you enjoyed it, please do shoot me an email and let me know what you think of it.

***

_If you enjoyed this article, follow me on [Twitter](https://twitter.com/gc_psk)_
