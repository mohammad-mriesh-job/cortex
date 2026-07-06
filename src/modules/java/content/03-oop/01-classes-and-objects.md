---
title: Classes & Objects
category: Object-Oriented Programming
categoryOrder: 3
order: 1
level: Beginner
summary: The blueprint-and-instance model — class anatomy, constructors, this, object creation, and the difference between instance and static members.
tags: classes, objects, constructors, this, static
---

A **class** is a blueprint; an **object** is a concrete thing built from that blueprint. The class `Car` describes *what every car has* (a colour, a speed) and *what every car can do* (accelerate, brake). Each actual car you create with `new` is an **object** — an independent instance with its own copy of the data.

```java
Car a = new Car("red");
Car b = new Car("blue");
// a and b are two distinct objects from the same Car class
```

## Anatomy of a class

A class groups **state** (fields) and **behaviour** (methods) behind a single name.

```java
public class Car {
    // 1. Fields (state)
    private String colour;
    private int speed;

    // 2. Constructor (initialises a new object)
    public Car(String colour) {
        this.colour = colour;
        this.speed = 0;
    }

    // 3. Methods (behaviour)
    public void accelerate(int delta) {
        this.speed += delta;
    }

    public int getSpeed() {
        return speed;
    }
}
```

- **Fields** hold an object's data. Each object gets its own set.
- **Constructors** run once, when the object is created, to put it into a valid initial state.
- **Methods** are the operations callers can perform.

## Creating objects with `new`

`new Car("red")` does three things: allocates memory on the **heap**, runs the constructor, and returns a **reference** to the new object. The variable on the left holds that reference, not the object itself.

```java
Car a = new Car("red"); // 'a' references a Car object on the heap
Car c = a;              // c references the SAME object, not a copy
c.accelerate(10);
System.out.println(a.getSpeed()); // 10 — a and c point to one object
```

:::gotcha
Assigning one object variable to another copies the **reference**, not the object. Both names now point to the same instance, so a change through one is visible through the other. To get an independent copy you must clone or construct a new object explicitly.
:::

## `this` — the current object

Inside an instance method or constructor, `this` refers to *the object the method was called on*. Its most common use is disambiguating a field from a parameter of the same name (`this.colour = colour`). It also lets a constructor call another constructor (**constructor chaining**):

```java
public Car(String colour) {
    this(colour, 0);            // delegate to the other constructor
}
public Car(String colour, int speed) {
    this.colour = colour;
    this.speed = speed;
}
```

## The default constructor

If you write **no** constructor at all, Java silently supplies a **default no-argument constructor** that does nothing but call `super()`. The moment you declare *any* constructor, that freebie disappears.

```java
class Point {
    int x, y;
    Point(int x, int y) { this.x = x; this.y = y; }
}
new Point();      // ❌ compile error — no no-arg constructor exists anymore
new Point(1, 2);  // ✅
```

## Instance vs static members

| | Instance member | Static member (`static`) |
|---|---|---|
| Belongs to | each object | the class itself |
| Copies in memory | one per object | exactly one, shared |
| Accessed via | `obj.field` | `ClassName.field` |
| Can use `this` | yes | no |
| Typical use | per-object state | constants, counters, factories, utilities |

```java
class Car {
    static int totalCars = 0;   // shared across ALL cars
    int speed;                  // unique to each car

    Car() { totalCars++; }      // every constructor bumps the shared count
}
```

:::senior
Mutable `static` state is effectively a global variable — it is shared across threads and persists for the JVM's lifetime, making it a frequent source of memory leaks and race conditions. Reserve `static` for true constants (`static final`) and stateless helpers. Prefer dependency injection over static singletons for anything with behaviour.
:::

## Object lifecycle

```mermaid
flowchart LR
    A["new Car()"] --> B[Memory allocated on heap]
    B --> C[Constructor runs]
    C --> D["Object in use - reachable"]
    D --> E["No references left - unreachable"]
    E --> F[Garbage collector reclaims memory]
```

You explicitly **create** objects with `new`, but you never explicitly destroy them. When no live reference points to an object, it becomes eligible for **garbage collection**, and the JVM frees the memory automatically — no manual `free()` as in C++.

```quiz
title: Check yourself
questions:
  - q: 'After `Car a = new Car("red"); Car c = a; c.accelerate(10);` — what is `a.getSpeed()`?'
    options:
      - '`0` — `c` is a copy, so `a` is untouched'
      - text: '`10` — `a` and `c` reference the same object'
        correct: true
      - 'Compile error — a Car cannot be assigned twice'
    explain: 'Assignment copies the **reference**, never the object. Both variables point at one heap object, so mutations through either are visible through both.'
  - q: 'A class declares only `Point(int x, int y)`. What happens on `new Point()`?'
    options:
      - 'It works — Java always provides a no-arg constructor'
      - text: 'Compile error — the default constructor disappears once you declare any constructor'
        correct: true
      - 'It works but leaves `x` and `y` uninitialized'
    explain: 'The compiler only generates the no-arg default constructor when a class declares **no** constructors at all. Declaring one (of any arity) suppresses it; add an explicit `Point()` if you still want one.'
  - q: 'Where does a `static` field live, and how many copies exist?'
    options:
      - 'Inside every object — one copy per instance'
      - text: 'With the class itself — exactly one copy shared by all instances'
        correct: true
      - 'On the stack of whichever thread reads it'
    explain: 'Static members belong to the class, not to instances, so `Car.totalCars` is one shared slot. That sharing is also why mutable static state is a thread-safety and testability hazard.'
```

:::key
A class is a template; objects are instances created with `new`. Variables hold *references* to heap objects, not the objects themselves. `this` is the current object; the default constructor vanishes once you declare your own; and `static` members belong to the class, while instance members belong to each object.
:::
