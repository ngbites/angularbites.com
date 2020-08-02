---
date: 2019-04-05
title: Writing scalable Typescript
featuredImage: 'https://cdn-images-1.medium.com/max/1600/1*xxzCZ_x7oeKlq_NRTw6GeA.jpeg'
description: Let’s explore in detail how to write clean, safe, enterprise-grade Typescript code
tags:
  - typescript
---

#### Let’s explore in detail how to write clean, safe, enterprise-grade Typescript code

Before we get started, I want to give my checklist for “scalable code”; in the case of this article, Typescript code:

*   it is clean, well-formatted, readable code
*   it is well-designed, consistent and predictable
*   it is easy to extend
*   last but not least, it is bug-free

Since its introduction, Typescript has helped us solve some of the biggest problems with the Javascript ecosystem thanks to its tooling and its powerful static analysis.

In my experience, though, many teams **only leverage a very small part** of the features that Typescript provides us.

Some argue that:

*   it is time-consuming
*   typing our code does not reduce its bugs
*   it’s harder and more difficult for junior developers to get started with

And I am not here to prove them wrong. Cause thing is, they may be right.

But Typescript doesn’t have to be scary, and in my opinion, writing code using it properly largely outweighs the cons mentioned above.

In this article, I want to discuss and explore the best tooling and practices to **make Typescript worth our time**.

## Use Linters and Formatters

As stated above, we want our Typescript code to be clean, well-formatted and readable.

In one [of my previous articles](https://medium.com/r/?url=https%3A%2F%2Fitnext.io%2Fenforce-your-team-coding-style-with-prettier-and-tslint-9faac5016ce7), I wrote a guide for setting up _Prettier_ and _TsLint_ in order to keep our code consistent for the whole team. As I may be repeating myself too often, I won’t go too much in detail in regards to why and how to set up these tools. 

Instead, I want to focus on the impact of the benefits to your team from using these tools.

Whether you’re using EsLint, TsLint, Prettier or all of them, I can’t stress enough that providing consistency to our codebases is one of the most impactful things in terms of productivity for an efficient team. 

A familiar codebase:

*   is easier to read and work with
*   is easier to understand and get started with
*   is easier to modify
*   is easier to review
*   reduces frictions within a team

And anyone who’s worked in this industry long enough knows far too well how important the last point is. 

For a business, frictions, and misunderstandings among colleagues are worst than bad code and worse than bugs. 

And programmers happen to care about formatting quite a lot.

By reducing to the minimum the amount of time spent arguing on code reviews, meetings, and calls, we make the business more efficient as a result. 

The time spent reviewing where a semicolon is positioned is instead spent checking that the business logic of the code is correct, or that the performance of a function is optimal. That’s what a code review should be.

> A happy team is a team is an efficient one. Keep your Typescript clean with linters and formatters.

## Use Strict Compiler options

One of Typescript’s biggest help comes from enabling its strict mode compiler. In order to enable strict mode, you just need to change the compiler options file located in your `tsconfig.json`:

```
"compilerOptions": {
    ... // more
    "strict": true
}
```

By enabling this option, as a result of the other strict options will also be enabled by default.

### Strict Null Checks

A strict compiler will help us catch possible errors that may happen at runtime.

`strictNullChecks` is, in my opinion, the most important option to make your compiler help you prevent such errors. 

In conjunction with correct typing, this option will warn us when we are trying to access a possibly `null` or `undefined` value.

This is probably one of the most common causes of runtime errors in our applications, and we can finally get help to avoid them as much as possible.

If you have a been a Javascript developer for more than 2 hours before reading this article, you may have seen this in your console:

> _Uncaught TypeError: Cannot read property ‘property’ of undefined_

Oh, I have. **Thousands of times**.

But… not so much lately, thanks to Typescript.

So how exactly does `strictNullChecks` help us? 

![](https://cdn-images-1.medium.com/max/1600/1*SuRzMd87h2lH9tqgyNKj_w.png)

Let’s break down this example:

*   we have some boolean called `x`
*   we have a declared function `logger`
*   we want to call `logger` with a variable called `msg`  that could also be undefined

And the compiler is, rightly and gently, letting me know that if `logger` accepts an argument that I type as string, then I can only pass an argument that is only and always a string.

If I type logger’s _msg_ argument  as a string, then I cannot call String’s methods.

![](https://cdn-images-1.medium.com/max/1600/1*kQLu2mtugqhAWYJpM61JiQ.png)

These examples look as trivial and extremely simple, but it’s incredibly common to find similar situations in professional codebases. 

The good thing is, `strictNullChecks` helps us in much more contrived scenarios.

## Type well, Type often

### Honest typing

Some of you may be thinking if the term “honest” is due to my limited English skills or if there’s more to it. What’s honest typing?

*   Say we have a back-end API that returns the price object of a financial product
*   Not all responses contain an _ask price_ or a _bid price_

```typescript
{
    "correlationId": "123",
    "askPrice": 1213.45,
    "bidPrice": undefined
}
```

Let’s create a Typescript interface for this:

```typescript
interface Price {
    correlationId: string;
    askPrice: number;
    bidPrice: number;
}
```

Is that correct? Certainly not. 

I have heard several reasons why programmers won’t fully type nullable values:

> I’m lazy, the compiler will complain

> 98% of times it’s not undefined

> “I have no idea what that does“

We want to tell the compiler that `askPrice` and `bidPrice` might be `undefined`. The compiler, as a result, will warn us when we’re trying to access these properties without checking the type or if they exist beforehand.

```typescript
interface Price {
    correlationId: string;
    askPrice?: number;
    bidPrice?: number;
}

// or

interface Price {
    correlationId: string;
    askPrice: number | undefined;
    bidPrice: number | undefined;
}
```

That means **the compiler helps us avoid runtime errors** when that 2% of times do happen.

Honest typing also helps our new coworkers or users of our libraries to fully understand the domain entities of the application. 

There’s literally no reason why your client-side entities shouldn’t fully and strictly be typed as their back-end counterparts.

### no implicit any

As we have seen in the previous paragraph, honest and rigorous typing plays a fundamental role in ensuring our code behaves in a correct way.

Honest typing is related to the option _noImplicitAny._

Let’s consider the following snippet:

![](https://cdn-images-1.medium.com/max/1600/1*q5cL6jF2ICpRbWkPKWhpFw.png)

The compiler has no idea what `x` and `y` are, and in some situations, it cannot figure it out on its own.

> Don’t be lazy, and **type your code**. 

There are situations where the compiler can figure it out without us explicitly adding a type, but in these cases, you need to consider whether adding the type increases or decreases the readability of your code.

## Clean Typescript Code

### Use predictable naming conventions

While linters and formatters make great allies in ensuring consistency across our codebases, there are some things that they still cannot help with: naming.

Use predictable naming conventions your team can understand is fundamental in ensuring cleanliness, consistency, and clarity.

Consider the following snippet, which is a scenario I encounter far too often:

![](https://cdn-images-1.medium.com/max/1600/1*jAvSp7tyXSfZmhe_ZNzE-Q.png)

Obviously, **I am not saying naming is easy**. It’s not. 

But if you follow the most basic principles, you’re still ahead of many. Some things I’d feel suggesting are:

*   if your method does not return anything, never prefix it with _get_
*   if your method returns something, never prefix it with _set_
*   ideally, don’t set and get in the same method…
*   if your method is returning a boolean, consider prefixing it with _is_ or _should (isThisThingVisible, shouldShowError, etc.)_
*   don’t name your variables with their type
*   if you’re using a DSL from a different library or framework, stick with their conventions. For example, if you declare an observable with _RxJS_, make sure to suffix it with the dollar symbol ($)

### Use Aliases

Let’s be honest, no one likes seeing relative imports all over the place in our Typescript code. Using the paths aliases functionality in Typescript is a great way for making the imports nicer and shorter.

How do aliases work?

We define the `paths` configuration in our `tsconfig.json` . See the below example:

![](https://cdn-images-1.medium.com/max/1600/1*_1zVUzTV4cmAwS_p8Ki9fw.png)

And then, I can access all my interfaces from `@core/interfaces` and (if you prefer even shorter access), all my enums from `enums.`

![](https://cdn-images-1.medium.com/max/1600/1*_VwO_1qoi2i1aoU0mTfaVw.png)

### Prefer horizontal reading

This is someone not everyone may be on the same page with me, but that I greatly believe impacts the overall readability of your code.

I love to keep my lines code between 80 (perfect) and 120 lines of code, depending on how my team feels about it. 

Let’s see the difference with one of my projects’ snippets. In the following image, the horizontal length is set to 120.

![](https://cdn-images-1.medium.com/max/1600/1*HuZwRELp053NnZV_wWChEA.png)

In the image below, it is instead set to 80.

![](https://cdn-images-1.medium.com/max/1600/1*bAg9o5s4LXTRnYLE0zUnjw.png)

Which one would you say it is easier to read and modify?

> 💡**Pro tip**: Use Prettier to automatically wrap code for you

### Arrow functions are cool but don’t overuse them

I love arrow-functions. And I use them pretty often too. But I see them abused from time to time.

Arrow functions are perfect for small expressions, but for longer and more complex ones, I’d much rather create a function block. 

Sometimes I see pretty convoluted expressions just for the sake of using an arrow function. 

Let’s see the difference between a long expression with an arrow function:

![](https://cdn-images-1.medium.com/max/1600/1*SX0FtvRe_HRsUAWcMTBs6g.png)

And without an arrow function:

![](https://cdn-images-1.medium.com/max/1600/1*EzXx8gQCcuhglxaQl2vAbQ.png)

It is totally possible to still use an arrow function and wrap the expression on the next line, but I feel it adds complexity when I happen to refactor the code, for example, if I need to add a variable in the expression. 

If you wrap it with an arrow function which is perfectly fine, make sure that the piece of code is unlikely to be changed anytime soon.

### Use logical spacing

Just like in Medium, white space, although not too much, can impact readability. 

The same happens with our code: we want to add spacing where it makes sense.

Some code just feels like a wall of text without any logical separation. This is not an easy task, as everyone might just feel different about it, and a lot of it probably depends on everyone’s preferences.

I’d say there are two main reasons for adding spaces:

*   logical reasons, as it concerns the logic behind our code
*   design reasons, as it concerns how easy the code is to read

I won’t talk about the design reasons behind it as this just feels too subjective. Personally, I just try to follow these simple guidelines:

*   group variables declarations logically
*   keep one white space between your return statement and the function body

If we are building two different objects with two separate groups of constants, chances are we want to add a space between them. For example:

```typescript
const name = "..";
const surname = "..";
const player = { name, surname };

// logical break
const teamName = "..";
const teamId = "..";
const team = { teamName, teamId };

return { player, team };
```

### Break complex expressions down

It is pretty easy to end up with various long and complex expressions in our code. 

I‘d recommend to break down long expressions into groups of variables and separate methods. 

*   If a condition has more than 2 or 3 expressions, you should consider to break it down
*   if a condition contains magic strings and numbers, you should consider extracting the expression into a method

Let’s see a scenario where we have two possibly undefined objects that I am sure you see every day:

```typescript
execute() {
    if (price && price.canExecute && user && user.hasPermissions && service.status === 1) {
    return priceService.execute(price);
    }
}
```

Maybe it’s my poor sight, but I can’t read that! Let’s refactor this:

```typescript
execute() {
    const STATUS_CODE_UP = 1;
    const isServiceDown = service.status !== STATUS_CODE_UP;

    if (isServiceDown) {
        return;
    }

    if (!price.canExecute || !user.hasPermissions) {
        return;
    }

    return priceService.execute(price);
}
```

Ok, I can read this, but now just feels too long. Let’s refactor again:

```typescript
const STATUS_CODE_UP = 1; // ideally imported from another file

get isServiceUp() {
    return service.status === STATUS_CODE_UP;
}

get canExecute() {
    if (!price || !user) {
        return;
    }

    return price.canExecute && user.hasPermissions;
}

execute() {
   const canExecute = this.isServiceUp && this.canExecute;
   return canExecute && priceService.execute(price);
}
```

That feels better!

## Takeaways

*   Lint and Format your code before it gets pushed
*   Be rigorous with your code, enable `strict` mode
*   Type well, and type often. Don’t use _any,_ use generics and _unknown_ instead
*   Make sure your code is as readable as possible by following industry standards
