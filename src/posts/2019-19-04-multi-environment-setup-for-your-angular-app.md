---
date: 2019-04-19
title: Multi-environment setup for your Angular app
featuredImage: https://miro.medium.com/fit/c/1400/420/1*Uf_LkjpQHAd4qDpAnqpwpQ.png
tags:
  - angular
---

One of the most welcome additions to our tooling as Angular developers is certainly the Angular CLI. The CLI allows us to bootstrap an Angular app and also manage it through all its lifecycle. 

One of the best features I enjoyed using is setting up multiple environments for my projects. Most applications will probably use at the very least two environments: production and development. Most likely, larger applications will be running several environments, such as QA, RC, pre-prod, and so on.

## Configurations

The Angular CLI bootstraps a new project with two files within the folder `environments`: `environments.ts` and `environments.prod.ts.` . 

*   _environment.prod.ts_ is the configuration file that the CLI injects for us when the app is built using the production configuration
*   _environment.ts_ is the configuration file we reference in our application, and the CLI will take care of getting the correct configuration at build time

What do these files look like? They’re just a simple constant object exported as “environment”, which initially looks like this:

```
// environment.ts
export const environment = {
  production: false
};

----------------------------

// environment.prod.ts
export const environment = {
  production: true
};
```

> ⚠️ As you may have guessed, these values are injected into the client at build time. So be aware — don’t pass sensitive values to this object.

The CLI allows us to define multiple custom configurations which we will align with our infrastructure’s environments. So, for example, we can define two more environments — _dev_ and _qa_.

Let’s go ahead and create two more files in the same folder which we will call _environment.dev.ts_ and _environment.qa.ts._

In order to set up the environments correctly, we also need to let Angular know by adding these to the configuration file _angular.json._ We will do this by extending the _configurations_ object:

```
... // angular.json
configurations": {
    "production" {...} // leave as it is,

    "qa": {
        "fileReplacements": [
            {
                "replace": "src/environments/environment.ts",
                "with": "src/environments/environment.qa.ts"
            }
        ]
    },
    "dev": {
        "fileReplacements": [
            {
                "replace": "src/environments/environment.ts",
                "with": "src/environments/environment.dev.ts"
            }
        ]
    }
}
```

And finally, we update the _serve_ object:
```
"serve": {
    "builder": "@angular-devkit/build-angular:dev-server",
    "options": {
        "browserTarget": "<appname>:build"
    },
    "configurations": {
        "production": ... // leave as it is
        "dev": {
            "browserTarget": "<appname>:build:dev"
        },
        "qa": {
            "browserTarget": "<appname>:build:qa"
        }
    }
},
```

## Default Values

When dealing with multiple environments, it’s common to have the same value for some of the environments. Something I normally do is to have defaults values for all environments, and I do that by creating a file called _enviroment.defaults.ts_ and adding to it the values I want an environment to have by default:

```typescript
// environment.defaults.ts
export const environmment = {
   production: false,
   log: true,
   flags: {
      useNewHeader: true
   }
}
```

All other environments (except e_nvironment.ts_) will need to be merged with the object _defaultEnvironment:_

```typescript
// environment.dev.ts
import { defaultEnvironment } from './environment.defaults.ts';

export const environment = {
    ...defaultEnvironment,
}
```

```typescript
// environment.qa.ts
import { defaultEnvironment } from './environment.defaults.ts';

export const environment = {
    ...defaultEnvironment,
    production: true
}
```

Obviously, I don’t want logging or an untested component in production! So we overwrite the production environment configuration:

```typescript
// environment.prod.ts
import { defaultEnvironment } from './environment.defaults.ts';

export const environment = {
    ...defaultEnvironment,

    production: true,
    log: false,
    flags: {
      useNewHeader: false
   }
}
```

> 💡 As this is a naive approach for merging objects, you may want to use a better way to merge deeply nested objects so you won’t have to repeat the same values.

## Adding Npm scripts for each environment

Now that we defined our custom environments, it’s time to set up an NPM script for serving our app with a custom environment. 

The parameter we’re interested in is `-c` or `—-configuration` . Let’s extend our npm scripts with two parameters:

*   `-c` which will be used to define the environment used
*   `—-port` which will be used to assign a different port for each environment, so we can run them in parallel

```
// package.json

{
... // more stuff
"scripts": {
   "start:dev": "ng serve -c=dev --port=4201"
   "start:qa": "ng serve -c=qa --port=4202"
   ...
   }
}
```

In order to start one of the environments, simply run its relative command:
```
npm run start:dev
npm run start:qa --aot // will run qa configuration using AOT mode
```

## Importing using an alias 🤓

As the environments file is located in the root folder, it can become cumbersome having to import it using its relative path. Something I’d suggest is to create an alias path using thanks to Typescript. 

In order to do that, locate and open the _tsconfig.json_ in your root folder and add to the object _compilerOptions_ the following object:

```
"paths": {
    "@environment": \["./src/environments/environment.ts"\]
}
```

And now, we will import the environment object by simply referencing “@environment” as path:

```typescript
import { Component } from '@angular/core';
import { environment } from '@environment'; // nice!

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
})
export class AppComponent {
    environment = environment;
}
```

> 💡 It is possible your IDE will mark ‘@environment’ as not found, which is likely due to the file not being indexed by the IDE. If you’re using Webstorm, simply restart and invalidate the cache

## Using a proxy for every environment 

Last but not least, we need to take into account our remote environments will be running at different addresses, which means we want to define the correct address for each environment. The CLI helps us by letting us pass the correct proxy configuration at build time.

My suggestion is to create a folder named `proxy` in the root, and then proceed by adding files named`<env>-proxy.conf.json` which looks like this:

```
{
  "/api": {
    "target": "http://my.dev.env.com",
    "secure": false,
    "pathRewrite": {
      "^/api": ""
    }
  }
}
```

In the previous file, we’re telling Angular to redirect calls prefix with `api`to target specified in the configuration.

Now, we proceed by adding the correct proxy config to the configurations we created previously.

```
// package.json

{
... // more stuff
"scripts": {
   "start:dev": "ng serve -c=dev --port=4201 --proxy-config=proxy/dev-proxy.conf.json"
   "start:qa": "ng serve -c=qa --port=4202 --proxy-config=proxy/qa-proxy.conf.json"
   ...
   }
}
```

> 💡 You could also do the same by changing it in the angular.json file, but it’s up to you.

I find this solution particularly important as many codebases still reference endpoints paths using code logic, which in my opinion is not as safe and clean. 

## Takeaways ⭐

*   Setting up multi-environments with the Angular CLI is pretty easy and powerful, add as many as you need
*   Adding configuration objects at build-time is powerful, but don’t add sensitive information
*   Adding proxies to our environments helps us avoid logic living in the code which also results in added security and simplicity
