---
title: Where to put your Angular models?
date: 2020-08-03
featuredImage: /assets/images/posts/where-put-angular-models.png
description: Organizing entities and models in your Angular app may be hard. This article explains where to pur your entities and what mistakes to watch out for.
tags:
  - angular
  - architecture
---

Before we go into detail - it's worth to understand what we mean by models:

- entity classes?
- enums?
- interfaces?

Could be all of them - depending on who you ask.

I personally like to differentiate between interfaces and models as two distinct things:

- `interfaces` are used to define the shape of my Typescript entities
- `models` are used as to define the actual value of my interfaces

### How to organize your models in your Angular Project Structure

Every module may have a set of entities (models, enums, etc.) that are either private or public to the module itself.

Let's assume we have a module called `UsersModule`. We want to define, for every entity, a sensible folder structure:

```
- users
    - components
    - services
    - enums
        - roles.enum.ts
    - interfaces
        - user.interface.ts
    - models
```

As you may have noticed, enums, interfaces and models all have their own folder, and it's important not to mix them to keep them well-organized.

## Entities Visibility

There are a few rules that I tend to follow to make sure my project is well-organized.

### Use a shared library for entities used outside of your modules

It's important to notice that a module should only contain the entities that are not shared with other modules, and hence that are private to that module.

But - Why?

Imagine we have a mono-repo with other applications or libraries written in different technologies (ex. Express, Stencil, React, etc.): you may not want to import your types from a different technology.

#### 💡 Solution
Create a separate library (for example, called `@enterprise/interfaces`) that exposes your global entities. This is particularly recommended if you're using `Nx` to structure your project.

Otherwise, consider creating a typescript repository to expose your global entities to different repositories.

Admittedly, this is not great - but if you have a large team of teams using the same interfaces, it could be really important to keep them in sync.

### Never export an interface from a Service

This is a pattern that I quite dislike - and I see used very often.

Defining an interface within a Service (or a Component) is generally fine - although not something I normally do. It's all good - as long as it is not exported.

Why is that?

- A component should not import a service simply to get an Interface
- A component may simply use Typescript inference instead of using that Interface
- If the interface is reused and is used in a way that inference could not work, then it should defined in its own file

Hopefully this answered your questions - but if not, please do send me an [email](mailto:giancarlo@frontend.consulting) and I'd love to expand on the subject.

_Thank you for reading, I hope you enjoyed this article. If you did, consider follow me on [Twitter](https://twitter.com/gc_psk) or sign up to the Newsletter using the form below!_
