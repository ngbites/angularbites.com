---
date: 2019-08-25
title: Building Scalable Multi-Platform Projects with Angular and Nx
featuredImage: 'https://cdn-images-1.medium.com/max/1600/0*erZf_hQ4V3MLHSyf'
description: Building a scalable multi-platform monorepo application with Angular and Nx
tags:
  - nx
  - angular
  - ionic
---

This article is a follow-up from my previous thought that I wrote on [building enterprise-scale projects in Angular](https://medium.com/r/?url=https%3A%2F%2Fitnext.io%2Fbuilding-an-enterprise-grade-angular-project-structure-f5be32533ba3%3Fsource%3D---------19------------------).

In the previous article, monorepos and Nx were mentioned but I had not yet had the pleasure to try them out. It was clear, that although the structure mentioned was decent enough for a single project targeting a single platform, it would have fallen short for sharing code with other projects.

### Monorepos to the rescue

In the past few months, I have been working on multiple projects — some with a high degree of complexity; one of my projects required me to **write an application that needs to be able to run on multiple platforms**, which is one of the reasons why I felt the previous article needed an update:

*   I want to ship a single project for multiple devices (mobile, desktop) sharing as much code as possible
*   I want my project’s _API_ to share models with the client applications, in the same workspace
*   I want _SSR_ (Server-Side Rendering) because, well, it’s 2019

### What this article is about

Let’s face it - Building scalable projects is hard. I’m sure you had a similar conversation at least once in your career: 

*   **You**: Hey, where should we place these functions? It’s getting messy 🤔
*   **Colleague**: Oh, just create (yet another) folder “utils” and put it there 😐
*   **You**: Okay… 🙄

In the first part of this article, **we’re going to discuss how Nx helps structure your applications**, and how we can leverage it to build insanely scalable projects.

In the second part, we take a more hands-on approach: **a step-by-step guide on setting up an Angular application** that is server-side rendered with NestJS, sharing code with a mobile Ionic application. It took some time for me to get it all right, so I want to help you (and future me) to do it effortlessly.

## Tech Stack

In order to do this, I will be using the following technologies:

*   [**Nx Workspaces**](https://medium.com/r/?url=https%3A%2F%2Fnx.dev%2Fangular): without a doubt the best tool to manage monorepos with _Angular_ projects. _Nx_ augments the CLI and allows us to easily build multiple apps in the same repository with ease
*   **Ionic/xplat:** Ionic is an awesome mobile framework for building cross-platform apps. Thanks to [xPlat](https://medium.com/r/?url=https%3A%2F%2Fnstudio.io%2Fxplat), we will be able to easily create an Ionic app that integrates with _Nx_
*   [**NestJS**](https://medium.com/r/?url=https%3A%2F%2Fnestjs.com%2F): a progressive _NodeJS_ framework inspired by _Angular_

## Introduction to Nx Workspaces

There are two reasons why you may want to use _Nx_: 

*   you work with multiple teams and multiple projects that can share code together
*   or, you are obsessed with code organization like I am!

Jokes aside, _Nx_ is a wonderful tool that **helps to organize code in a scalable fashion**; even if you’re not planning on writing the next Facebook, the goodies provided by the [Nrwl](https://medium.com/r/?url=https%3A%2F%2Fnrwl.io) team are enough of a reason for me to kickstart my projects with _Nx_.

### Applications

Nx is a tool to create extensible mono-repository projects. If you have used the Angular CLI, _Nx_ will look familiar, but with some differences.

Every application will be created within a folder called `/apps`, including your e2e tests project. For example, you may create apps written in _Angular_, _React_, _Ionic_, _Nativescript_, _Express_, _NestJS_, etc.

Or, **all of them at once**, sharing code!

### Libraries

Your libraries, instead, will be placed within the folder `/libs`.

What exactly are they, though? Of course, small reusable pieces of code than any application within our workspace can use; but as _Nx_ also says, **libraries are smaller units of code with a well-defined API**.

Libraries are ideal for sharing **Angular Entities** and **Typescript Entities.** For example:

*   It is likely that you will want to share the same interfaces between front-end and back-end. Creating a lib called `models` will allow all your applications to access the same models without having to rewrite them twice
*   Your applications will likely make use of lots of components, pipes, directives, and services that will be common between all your applications: tests, mobile, front-office, back-office, etc.

### Anatomy of an Nx Workspace

The project structure below is the starting point of any Nx project:
```
<workspace name>/
├── apps/
│   ├── myapp/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── assets/
│   │   │   ├── environments/
│   │   │   ├── favicon.ico
│   │   │   ├── index.html
│   │   │   ├── main.ts
│   │   │   ├── polyfills.ts
│   │   │   ├── styles.scss
│   │   │   └── test.ts
│   │   ├── browserslist
│   │   ├── jest.config.js
│   │   ├── tsconfig.app.json
│   │   ├── tsconfig.json
│   │   ├── tsconfig.spec.json
│   │   └── tslint.json
│   └── myapp-e2e/
│       ├── src/
│       │   ├── fixtures/
│       │   │   └── example.json
│       │   ├── integration/
│       │   │   └── app.spec.ts
│       │   ├── plugins/
│       │   │   └── index.ts
│       │   └── support/
│       │       ├── app.po.ts
│       │       ├── commands.ts
│       │       └── index.ts
│       ├── cypress.json
│       ├── tsconfig.e2e.json
│       ├── tsconfig.json
│       └── tslint.json
├── libs/
├── tools/
├── README.md
├── angular.json
├── nx.json
├── package.json
├── tsconfig.json
└── tslint.json
```

## Working with Nx: Creating Applications

Now that I (may have) convinced you to use _Nx_ and _Angular_, I am going to show you, step-by-step, how to set up a dream tech-stack that I described above.

### Creating a new Nx Workspace with Angular and Nest

We will start with a few commands that will kickstart our project structure thanks to _Nx_ until we will have a working monorepo project with the latest Angular version and _NestJS_ as _NodeJs_ framework.

The following command will generate a working monorepo project with the latest Angular version and NestJS as Server-Side Node framework:

![](https://cdn-images-1.medium.com/max/2400/1*uhEP6aleLqbeyXYuptXvWg.png)


```
$ new workspace --preset="angular-nest" --appName="nx-angular-ssr" --style="scss" --collection=[@nrwl/workspace](https://medium.com/r/?url=http%3A%2F%2Ftwitter.com%2Fnrwl%2Fworkspace "Twitter profile for @nrwl/workspace")
```

The command line will prompt what style preprocessor you like, I’d recommend choosing _SCSS_. 
Sit tight, it will take a while. Nx will create a workspace in a folder named `workspace`.

## API and Server-Side Rendering

NestJS provides an awesome CLI plugin in order to automatically prepare the application for server-side rendering.

![](https://cdn-images-1.medium.com/max/1600/1*4A3J6f6vjWzOPYGtfijqKQ.png)

Run the following command in the Nx workspace:

```
$ ng add @nestjs/ng-universal
```

When the command line prompts for the application name, enter `nx-angular-ssr`. The plugin will create a folder named `server`, but we already have a server application, so we will ignore that (that means, you can delete it). As expected, we need to do some changes.

### Importing Angular’s Universal Module

The first thing to do is to import Angular Universal in our Nest application: to do that, we open the file `apps/api/app/app.module.ts` and we paste the following code to the imports array of the `AppModule` class:

```typescript
AngularUniversalModule.forRoot({
  viewsPath: join(process.cwd(), 'dist/browser'),
  bundle: require('../server/main'),
  liveReload: true
})
```

Of course, don’t forget to import `AngularUniversalModule` and `join`.

### Fixing the environments` path

We need to apply a small change to the `angular.json` configuration. Unfortunately, the path to the environments files is incorrect, so we patch it according to the real path, which is `apps/nx-angular-ssr/src/environments` as shown in the image below:

![](https://cdn-images-1.medium.com/max/1600/1*BJqLeuogbRK5Er5qzy6Tug.png)

### Adjust Webpack’s configuration

The last thing we need to adjust is the server’s Webpack configuration. Open the file `webpack.server.config` and replace the content with the following snippet:

And at this point, it’s all done! We only need to build and run our application.

### Run the Server-Rendered Angular app Wih Nest JS

The NestJS plugin added some useful command to build and run the application. We first need to build the SSR application by running:

```
$ npm run build:ssr
```

And then, we’re able to serve it:

```
$ npm run serve:ssr
```

Open your browser at `http://localhost:3333` and there is your server-rendered _Angular_ application powered by _NestJS_!

## Adding an Ionic application with xPlat

[xPlat](https://medium.com/r/?url=https%3A%2F%2Fnstudio.io%2Fxplat%2Fgetting-started%2Fgetting-started) is a tool that extends Nx Workspaces with a set of generators that help kickstart projects written in _Electron_, _NativeScript_, and _Ionic_. In our case, we want to use it for generating a mobile application written using Ionic.

### Generating an Ionic app

In order to generate applications using xPlat, we need to install it first. Run this CLI command in your workspace root:

```
ng add @nstudio/xplat
```

You will be prompted what sort of application you want to use:

```
[] Electron
[] NativeScript
[-] Ionic
```

In our case, we will choose Ionic for Angular projects (which will be asked in the next step).

We will then generate our application using the following command:

```
$ ng generate app
```

The CLI will prompt us for some configuration. Here are my choices below:

![](https://cdn-images-1.medium.com/max/1600/1*vUwvmpVe47N9wcoIV-ehAA.png)

When the CLI asks for the folder where the app will be located, enter an empty space, and it will be automatically placed within `apps`.

### Adding Capacitor

_Capacitor_ is _Ionic’s_ framework to build cross-platform applications. For some reason, it did not automatically get added, so we install it manually:

```
$ npm i --save-dev @capacitor/core
```

### Running the app

We will run the application in the same way we run any other CLI application. The only thing to notice is that _xPlat_ prefixed the name of our application with the prefix `ionic-`.

Run the following command in order to run the Ionic app in the browser:

```
$ ng serve ionic-mobile
```

![](https://cdn-images-1.medium.com/max/1600/1*nrXO1F4fbIGGgTP_95RsEA.png)

### Sharing Code

Now that the app is set-up and running, we want to start sharing code between our applications. An example of ideal code-sharing would be our state-management modules or a UI component library.

As we said earlier, all the code that we plan to share across the applications will be added as a library under the folder `libs`. The application generated by xPlat already sets up the paths for us to import libraries using virtual paths, but I wasn’t too happy with it.

The default virtual path in the tsconfig.json is set-up as follows:

```
"@workspace/*": ["../../libs/*"]
```

Unfortunately, this makes us have to also write the whole path to the `src/lib/index.ts` barrel file, which is inconvenient. As a result, I decided to add the following paths in order to access the UI library more quickly:

```
"paths": {
    ...other paths,
    "@workspace/ui": ["../../libs/ui/src/index.ts"],
    "@workspace/ui/*": ["../../libs/ui/src/*"]
}
```

Once that’s done, I open the file `home.module.ts` in our mobile application and import the UI library’s module:

```
// other imports...
import { UiModule } from '@workspace/ui';

@NgModule({
  imports: [SharedModule, HomeRoutingModule, UiModule],
  declarations: [HomeComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomeModule {}
```

Our home route in the Ionic application has now access to the components developed in parallel with the other platforms!

### Not just Ionic

As we said, _xPlat_ also allows you to build for other platforms, such as _NativeScript_ and _Electron_ (and who know what else in the future!). 

As a result, the code could be shared between even more applications.

## Final Words

Building a large project, able to share code and scale across multiple teams is surely no easy feat.

Monorepo architectures allow us to work in parallel and easily share code, and Nx makes managing the monorepo a much easier job than it would be otherwise.

This article showed you an example of how we can achieve a dream tech-stack with awesome technologies such as _NestJS_ and _Ionic_, accelerate processes, maximize code reusability and organize a scalable project structure thanks to _Nx._

### References and Related Reading

*   [Nx](https://medium.com/r/?url=https%3A%2F%2Fnx.dev%2Fangular)
*   [XPlat](https://medium.com/r/?url=https%3A%2F%2Fnstudio.io%2Fxplat)
*   [Misconceptions about Monorepos: Monorepo != Monolith](https://medium.com/r/?url=https%3A%2F%2Fblog.nrwl.io%2Fmisconceptions-about-monorepos-monorepo-monolith-df1250d4b03c) by Victor Savkin

If you need any clarifications, or if you think something is unclear or wrong, do please leave a comment!
