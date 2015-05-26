# MeteorFlux Dispatcher


### What is Flux and why do I need it?

Most people using Meteor today come from what Matt DeBergalis (Meteor co-founder) calls *server side* or *page-based* websites. Back on those days, our servers returned different pages depending on the url. MVC was great with that.

But now we don't want server side *page-based* websites anymore. We want apps. Client side, *state-based* apps.

Meteor is a great step forward in that direction, but it doesn't impose you any architecture. A lot of people is using Iron Router and it's great, but it feels like creating *page-based* websites all over again.

**Flux** is a variation of MVC created by Facebook for reactive applications.

Coming from Facebook you might think Flux is something complex and hard to use, but it is not. It was created to make things simpler:

  1. Decouple data/logic and views using a message bus.
  - Get rid of any logic in the views.
  - Organize your data/logic by common domains (stores).
  - Manage a more complex app state (not only database and url).
  - Make the data flow simpler: one-way-data-flow and forbid cascading effects.

### Flux official documentation

The first time they talked about it was in the F8 conference and this YouTube video became quite popular:
https://www.youtube.com/watch?list=PLb0IAmt7-GS188xDYE-u1ShQmFFGbrk0v&t=621&v=nYkdrAPrdcw

Then they released the official documentation which is here:
https://facebook.github.io/flux

The official documentation is probably not the best thing ever, but there are dozens of good posts talking about Flux:

  - [(TODO)]()

Be aware that they all use JavaScript and React (don't expect Meteor).

### Can Flux be used in Meteor?

Yes it can. Flux is just an architecture, a set of principles. Actually, it can be a great idea if you are looking for a modern architecture to organize your code.

### And why Meteor and not only Flux?

Flux is the architecture Faceook designed for [React](https://facebook.github.io/react/) apps, but React is only a front end framework. Right now, Facebook is working on other parts with things like [Relay & GraphQL](https://facebook.github.io/react/blog/2015/02/20/introducing-relay-and-graphql.html) or integrating libraries like [Baobab](https://github.com/Yomguithereal/baobab).

It looks like these new approaches are trying to solve the same issues that Meteor is already solving in such a great way. There are many other implementations from people or companies using Flux, but none of them has a framework as complete as Meteor.

### Do I need React?

No, you don't. [React](https://facebook.github.io/react/) is just a frontend framework and Flux is an architecture. You can use it if you like, but the Flux principles can be applied even if you use [Blaze](https://www.meteor.com/blaze), [Angular](https://angularjs.org/), [ViewModel](http://viewmodel.meteor.com/), [Blaze Components](http://components.meteor.com/), [Flow Components](https://github.com/meteorhacks/flow-components) or whatever comes out next month.

### Is Flux the final architecture for everything?

I don't think so. But it can be useful for sure. I find Flux apps easy to understand and reason about. A lot of Meteor apps lack architecture. Logic and state are spread among the views and other parts of the app and there's no way to know where is what. Debugging, scaling and testing becomes difficult.

When you use an architecture you spend less time thinking "where do I put this" and more time just coding because it is clear where things belong. In the long run, it helps you make your app easier to reason about, easier to test and easier to scale.

There are many different implementations of Flux, just like there are many different implementations of MVC or any other architecture. That is a good sign, as you can adapt Flux to your particular needs.

### Different Flux Implementations

There are dozens of implementations out there and even other big companies have open sourced their owns as well:

  - [Fluxible (Yahoo)](http://fluxible.io/)
  - [NuclearJS (Optimizely)](https://github.com/optimizely/nuclear-js)
  - [ReFlux](https://github.com/spoike/refluxjs)
  - [Alt](http://alt.js.org/)
  - [Flummox](http://acdlite.github.io/flummox)
  - [Marty](http://martyjs.org/)
  - [Fluxxor](http://fluxxor.com/)

All these implementations are good examples of what people is doing with the Flux principles. None of them include the use Meteor so far.

### What about this "MeteorFlux" implementation?

This **MeteorFlux** implementation is a port of the official Facebook's [**Dispatcher**](https://github.com/facebook/flux), which is the only code related to Flux that Facebook has released so far.

Actually, it is the only thing you need to create a Flux application. You can create all the other stuff with plain javascript using objects, prototypes, classes, modules. Whatever you feel comfortable with. You can create your own implementation on top of this **Dispatcher** if you want.

I will keep it in sync with the Facebook Dispatcher, but it seems pretty stable right now.

There is a more complex implementation in Meteor called [space-ui](https://github.com/CodeAdventure/space-ui).
I recommend to take a look and adopt it if you feel comfortable with its concepts, like commands or mediators.


# The Dispatcher API

The dispatcher is very simple and only have two important methods.

### Dispatcher.dispatch():

Dispatches an **Action**:

```javascript
Dispatcher.dispatch( payload );
```

Normally, the payload contains an **Action** identifier. The standard name is `actionType` but you can use whatever you want.

```javascript
Dispatcher.dispatch( { actionType: "SOMETHING_HAPPENED" } );
```

It may contain more data as well.

```javascript
Dispatcher.dispatch( { actionType: "SOMETHING_HAPPENED", usefulData: "some data" } );
```

### Dispatcher.register():

Register a callback. Normally used by the **Stores**.

```javascript
Dispatcher.register(function(payload){
   switch( payload.actionType ){
       case "SOMETHING_HAPPENED":
           doSomething(payload.usefulData);
           break;
       case "OTHER_THING_HAPPENED":
           doOtherThing(payload.otherData);
           break;  
    }
});
```

# Installing the Dispatcher

Just open the terminal and write:

```bash
meteor add meteorflux:dispatcher
```

Then you can use `Dispatcher` inside your Meteor app.

`Dispatcher` is a singleton but if you need to create another independent dispatcher (i.e. for testing purposes) you can do it with:

```javascript
var otherDispatcher = new MeteorFlux.Dispatcher();

```

# Flux concepts and principles

1. Decouple **Views** and **Stores** using a message bus (**Dispatcher**).
- All changes follow a **one way data flow**.
- **Views** can't have any logic or change the **App State**. They can only dispatch **Actions**.
- **Stores** are the only ones which have logic and can modify the **App State**.
- The **App State** represents the only truth of the app. It should not be duplicated anywhere.
- **Views** and **Stores** are allowed to retrieve the **App State**.
- **Dispatcher** can't dispatch in a middle of a dispatch to avoid cascading effects.

One of the main Flux principles is the **one way data flow**:

![Meteor Flux](MeteorFlux.jpg)

Normally, Flux diagrams don't include **App State** but we are using **Meteor** to store our **App State** in *Collections and Reactive Variables*, so I wanted to include it here.

### What is that "one way data flow"?

All external changes must dispatch an **Action**. Those changes are normally triggered by the **View**, when the user interacts with the app, but an API or a Cron Job can dispatch **Actions** as well.

**Views** (Templates in Meteor) can't have logic and can't change the **App State**. All they can do is dispatching an **Action** like this:

```javascript
Template.someView.events({
  'click button': function(){
    Dispatcher.dispatch( { actionType: "SOMETHING_HAPPENED", data: { value: "some data" } );
  };
});
```

**Actions** must be declarative and not imperative. For example, use `SOMETHING_HAPPENED` and not `SET_THAT_VARIABLE_TO_FALSE`.

**Stores** are in charge of logic and updating the **App State**. They are divided by *domain* and they register to the actions they want to act upon. For example:

```javascript
// YourStore.js
SomeData = new Mongo.Collection('somedata');
var something = new ReactiveVar(null);

var changeSomething = function(newValue){
  something.set(newValue);
};

var changeOtherThing = function(newValue){
  SomeData.insert({value: newValue});
};

// Do stuff when actions happen
Dispatcher.register(function(payload){
   switch( payload.actionType ){
       case "SOMETHING_HAPPENED":
           changeSomething(payload.data.value);
           break;
      case "OTHER_THING_HAPPENED":
           changeOtherThing(payload.data.value);
           break;
    }
});

// We can use public methods to retrieve local data later on the View or other Stores
YourStore = {
  getSomething: function(){
    return something.get();
  },
  getSomeData: function(){
    return SomeData.find();
  }
}
```

**Stores** can't dispatch another **Actions** in the middle of a dispatch, to avoid complex cascading of events.

That means they must do whatever your app needs to do in response to the original action, without triggering anything else.

At first, this may appear very restrictive, but it is very useful. Coming from a [PureMVC](http://puremvc.org/content/view/67/178/) world (event based MVC) I know cascading events can be a hell to debug.

The good news is that each time you want to use cascading events you have to think twice and come out with a simpler design.

**Stores** are the only ones which can modify the **App State** and they can  do it only in response to an **Action**. They don't have setters. Actually, there are no setters at all in a Flux application.

**Store** methods should be easily testable with unit tests. When they get complex they can (and should) use libraries to simplify their logic.

**App State** should not be duplicated. That means, all the state of your app must be in only one place. **Views** should not contain their own state. With one **App State** we should be able to render one final **View** consistently.

Finally, **Views** can retrieve data from the **App State**. We are in Meteor, so we can do that reactively:

```javascript
Template.someView.helpers({
  'something': function(){
    return YourStore.getSomething(); // reactive
  },
  'someData': function(){
    return YourStore.getSomeData(); // reactive
  }
});
```

Or you can access the **App State** directly if you prefer:

```javascript
Template.someView.helpers({
  'someData': function(){
    return SomeData.find({}); // reactive
  }
});

```

---

If we have done things right, we have followed the Flux one-way flow:

External Trigger (View) -> Action-> Dispatcher -> Store -> App State -> View.

I have done a more complex graph to show how a Meteor app can be used following the Flux principles:

![MeteorFluxGraph](MeteorFluxGraph.jpg)

### Async Operations

The **one way data flow** of Flux is designed to be synchronous. If we want to use async operations we must create an **Action Creator** like this:

```javascript
UserActions = {
  logIn: function(user, password){
    Meteor.loginWithPassword(user, password, function(error){
      if (error) {
        Dispatcher.dispatch({ actionType: "LOG_IN_FAILED" });
      } else {
        Dispatcher.dispatch({ actionType: "LOG_IN_SUCCEED" });
      }
    });
  }
};

Dispatcher.register(function(payload){
  switch(payload.actionType){
    case "LOG_IN":
      UserActions.logIn(payload.user, payload.password);
      break;
  }
});
```

Then, **Stores** can listen to the `LOG_IN_FAILED` and `LOG_IN_SUCCEED` events and act accordingly.

### The third Dispatcher method: `waitFor()`

The original Facebook's Dispatcher has a third method called `waitFor()`. It can be used when a **Store** needs to wait until other **Store** has finished updating.

It looks like in Meteor (and in other implementations like [NuclearJS](https://github.com/optimizely/nuclear-js)) it is not needed anymore. Probably not needed when Facebook adopts some sort of reactive model like [Baobab](https://github.com/Yomguithereal/baobab) as well.

Facebook uses this simple example to show the use of `waitFor()`:

```javascript
// For example, consider this hypothetical flight destination form, which
// selects a default city when a country is selected:

// Keeps track of which country is selected
var CountryStore = {country: null};
// Keeps track of which city is selected
var CityStore = {city: null};
// Keeps track of the base flight price of the selected city
var FlightPriceStore = {price: null}


// When a user changes the selected city, we dispatch the payload:
Dispatcher.dispatch({
  actionType: 'city-update',
  selectedCity: 'paris'
});

// This payload is digested by `CityStore`:
Dispatcher.register(function(payload) {
  if (payload.actionType === 'city-update') {
    CityStore.city = payload.selectedCity;
  }
});

// When the user selects a country, we dispatch the payload:
Dispatcher.dispatch({
  actionType: 'country-update',
  selectedCountry: 'australia'
});

// This payload is digested by both stores:
CountryStore.dispatchToken = Dispatcher.register(function(payload) {
  if (payload.actionType === 'country-update') {
    CountryStore.country = payload.selectedCountry;
  }
});

// When the callback to update `CountryStore` is registered, we save a
// reference to the returned token. Using this token with `waitFor()`,
// we can guarantee that `CountryStore` is updated before the callback
// that updates `CityStore` needs to query its data.
CityStore.dispatchToken = Dispatcher.register(function(payload) {
  if (payload.actionType === 'country-update') {
    // `CountryStore.country` may not be updated.
    flightDispatcher.waitFor([CountryStore.dispatchToken]);
    // `CountryStore.country` is now guaranteed to be updated.

    // Select the default city for the new country
    CityStore.city = getDefaultCityForCountry(CountryStore.country);
  }
});
```

But in Meteor we can use reactivity like this:
```javascript
// Keeps track of what is selected, but we use reactive variables.
var CountryStore     = {country: new ReactiveVar(null)};
var CityStore        = {city:    new ReactiveVar(null)};
var FlightPriceStore = {price:   new ReactiveVar(null)}

// When the user selects a country, we dispatch the payload:
Dispatcher.dispatch({
  actionType: 'country-update',
  selectedCountry: 'australia'
});

// This payload is only digested by the country store:
Dispatcher.register(function(payload) {
  if (payload.actionType === 'country-update') {
    CountryStore.country.set(payload.selectedCountry);
  }
});

// We don't need to listen for all the actions which may change the country,
// to keep our city in sync. We can just use reactivity.
Tracker.autorun(function(){
  var newCountry  = CountryStore.country.get();
  var defaultCity = getDefaultCityForCountry(newCountry);
  CityStore.city.set(defaultCity);
});
```

Anyway, the `waitFor()` method is part of this MeteorFlux Dispatcher, so you
feel free to use it if you want.

### Flux and the routing

Of course, most apps created with Meteor are still designed to be used in a browser, so we need urls:

  - People expect url changes when the layout/page changes.
  - People are used to share urls when they want to show something to other person.
  - People expect to hit the back button of their browser and go back to the last layout/page.

(TODO...)

### Flux testing

(TODO...)

# Examples

(TODO...)
