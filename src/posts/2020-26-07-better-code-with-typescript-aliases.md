---
title: Better code with Typescript aliases
date: 2020-07-26
tags:
  - typescript
  - programming
---

If you've ever worked with Typescript, you surely know what `type aliases` are for. They helps us create aliases of more complex types, for example arrays of interfaces, union types, etc.

One less-known way they can be leveraged is by simply describing values of primitive types based on their format.

This can accelerate the understanding of a codebase reduce confusion, and deepen the insights gathered from just reading the types of your code.

For example, we have a DTO with two properties. This is how it would normally be written:

```typescript
class MyDto {
  id: string;
  lastEdited: number;
}
```

### Limitations of simple typing

And that's OK, understandable. But not perfect: suppose it's your first day on a new codebase, and you know nothing about it.

You see this DTO, but you're trying to understand what it is and what actual formats it expects from you:

- you don't know what's the format of `ID`
- you don't know the format of `lastEdited`. Is it a Unix timestamp, or a Julian day? Or the amount of days since Earth was created? Who knows.

So why not describe what theses values are with `type aliases`?

### Aliasing primitive types based on their format

We can define the types in a global typings file, so they can be reused across the project.

Let's assume that the fields above are, as commonly happen to be, a UUID and a Unix timestamp.

```typescript
interface UUID = string;
interface UnixTimestamp = number;
```

And then, we can assign them to our DTO:

```typescript
class MyDto {
  id: UUID;
  lastEdited: UnixTimestamp;
}
```

In my opinion, the above conveys a lot more information than before, and it's certainly more useful to both existing members and newcomers.

### Type Aliases as shortcuts
Type aliases are also useful to shortcut some common type combinations:

Converting inline interfaces to the `Record` alias:

```typescript
const myObject: { [key: string]: string } = { property: 'key' };

// can also be written
const myObject: Record<string, string> = { property: 'key' };
```

The `Record` type aliases can also be aliased into more granular types:

```typescript
type StringObject = Record<string, string>;
type UnknownObject = Record<string, unknown>;
type AnyObject = Record<any, any>;

const stringObject: StringObject = { property: 'key' };
const anyObject: AnyObject = {
  1: "3",
  hello: "world"
};
```


Aliases are great, sometime forgotten feature in  Typescript. Hopefully, this will article will give you some ideas of how you can leverage them in your project!
***

_If you enjoyed this article, follow me on [Twitter](https://twitter.com/gc_psk)_
