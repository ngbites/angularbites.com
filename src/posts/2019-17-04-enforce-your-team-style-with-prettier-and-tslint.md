---
date: 2019-04-17
title: Enforce your team coding style with Prettier and TsLint
featuredImage: https://miro.medium.com/max/1400/1*DisWkrhZ8V6Hhi522eOu0g.gif
tags:
  - typescript
---

A project’s coding style is the first and most noticeable trait that a new senior hire will be looking at while browsing the codebase for the first time. 

On the surface, that’s because it is probably the simplest way to evaluate a codebase at a glance. On a deeper level, that’s because good programmers just simply love tidiness, simplicity and coherence. These three simple aspects will make or break your hire first impression with your project and company as a whole.

Obviously, while attracting people who will be excited to work on your codebase is important, keeping your codebase clean and coherent goes a long way for a project’s overall longevity and success. 

The list of reasons of why having a clean and consistent codebase is paramount is simply fairly known and documented, but to me these are the most important ones:

*   working with a familiar codebase means working faster and better
*   having a consistent codebase helps new hires get up to speed faster
*   having a consistent codebase makes refactoring and maintenance easier
*   …

## Developer Experience (DX) Matters 🤓

Never more than today, developers can enjoy an unparalleled developer experience. Especially in the Front End world, the improvements to DX have been too important to ignore: static checking, conditional typing, smarter IDEs, linters, automated testing frameworks, and so on. 

If there is something that makes a team inefficient and unmotivated, that is definitely a bad DX.

It is an architect/manager’s job to make DX a critical part of the development processes of a team for a number of reasons:

*   keep technology stack clean and performant for the current team, and new hires
*   keep team happy and motivated. Your team’s morale is as important as the quality of your product

While a good DX is a broad and vast topic, what I what to talk about in this article is one of the pillars of good code: coding guidelines. 

While community-wide guidelines are important and serve as a standard indicator of best practices — I tend to give more importance to what a team thinks of a certain style, and not the community as a whole. The team always comes first — but in the same time every decision taken against community standards should be logical and documented. A (good) new hire will eventually question such decisions.

To me, **coding guidelines are a set of rules every member of the team agrees to follow and respect**. As this is certainly most important in the beginning of a project, the tools available today, like Prettier and TsLint, allow a project to be conformant to a coding guideline at any stage.

## Prettier + TsLint = tidiness, simplicity & coherence

As I pointed out before, tidiness, simplicity and coherence are 3 things every developer cares about. How do Prettier and TsLint help with that?

*   Tidiness: thanks to TsLint rules (or EsLint if you use JS), which are ideally agreed by all your team, developers will be warned when a rule is violated
*   Simplicity: by adding Prettier as a pre-commit hook, you remove the responsibility of taking care of certain formatting details from developers, who can instead focus on the stuff that matters
*   Coherence: thanks to automatic formatting, all the codebase looks the same, no matter who writes it

As nowadays most teams use _PR_ and code reviews, another important thing to mention is that, in my experience, most of the comments often regard code-style rather than actual potential mistakes or bugs. This is frustrating, because not only it is time lost to review it, but also to fix it.

The issue is, code reviewers **should** point those mistakes out, but ideally they **shouldn’t have to**.

And the only way to avoid time lost on trivial matters, is to having an effortless set-up that takes almost all formatting responsibility from the committers.

### How to set up Prettier and TsLint ⚙️

Setting up Prettier and TsLint is quite straightforward. First of all, we install these two packages:

npm install --save-dev prettier tslint-config-prettier

If you kickstarted your project using your framework’s CLI, then you will likely already have created a _tslint.json_ file in your project. If you don’t, create it and simply add the following content:

```json
{
  "extends": ["tslint:recommended", "tslint-config-prettier"]
}
```

If you instead have do have it already, simply “tslint-config-prettier” to the _extends_ property just like in the above snippet. This is needed in order to make Prettier and TsLint work nicely together.

After that — it’s time to setup Prettier. In order to create the configuration file, we can use various file formats such as _JSON_, _JS_, _YAML_ or _TOML_ — but I like _YAML_, so go ahead and create a file in your root (i.e. where your _package.json_ is located) and name it _.prettierrc. _

Here is a simple _.prettierrc_ file with options I tend to use:

```yaml
tabWidth: 4
singleQuote: _true
_bracketSpacing: _true
_printWidth: 80
```

For the list of all the available options, head to [Prettier’s website](https://medium.com/r/?url=https%3A%2F%2Fprettier.io%2Fdocs%2Fen%2Foptions.html).

This is great, but how exactly is this simple? It’s not, so let’s simplify this for your team.

You have 3 options:

*   create a [pre-commit hook](https://medium.com/r/?url=https%3A%2F%2Fprettier.io%2Fdocs%2Fen%2Fprecommit.html) as described on Prettier’s website
*   set up your IDE (if you use WebStorm [use a watcher](https://medium.com/r/?url=https%3A%2F%2Fprettier.io%2Fdocs%2Fen%2Fwebstorm.html), or if you use VSCode [use a plugin](https://medium.com/r/?url=https%3A%2F%2Fprettier.io%2Fdocs%2Fen%2Feditors.html))
*   … something even better, use both! It’s a great feeling for a developer to have the feeling of always committing something correct, but also to have instant feedback of a clean, formatted file.

### Takeaways ⭐️

*   DX is important — make sure your team is happy
*   Coding style is important — make sure your whole team agrees with it
*   Use Prettier and TsLint (or EsLint) for working better and faster
