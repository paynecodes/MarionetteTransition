# Common Region Methods

show                      // native show
showTransition        // shows a newView w/ transition, and closes the oldView
close                       // native close
closeTransition         // closes the currentView w/ transition
hideTransition          // hides the currentView w/ transition
push                        // shows a newView w/ transition, adds it to a stack of views and keeps the oldView
pop                          // closes the currentView w/ transition, revealing the underlying (previous) view in the stack

# Required CSS Properties

```scss
.mt-view {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 1;
    -webkit-backface-visibility: hidden;
    -moz-backface-visibility: hidden;
    -ms-backface-visibility: hidden;
    -o-backface-visibility: hidden;
    backface-visibility: hidden;
    -webkit-perspective: 1000;
    -moz-perspective: 1000;
    -ms-perspective: 1000;
    -o-perspective: 1000;
    perspective: 1000;
}

.mt-region, .region {
    position: relative;
    overflow: hidden;
    width: 100%;
    height: 100%;
    -webkit-transform-style: preserve-3d;
    -moz-transform-style: preserve-3d;
    -ms-transform-style: preserve-3d;
    -o-transform-style: preserve-3d;
    transform-style: preserve-3d;

    > div {
        @extend .mt-view;
    }
}
```

As you can see given the scss code above, there are 3 classes used. `.mt-view` and `.mt-region` are added automatically by this library. `.region` should be added to your regions you wish to animate. This provides immediate hardware accelleration to your region transitions in case some browsers take too much time recognizing the newly added `.mt-region` and `.mt-view` classes.

Also, please note that `height: 100%` isn't required, but you'll have to adjust this for your app. The reason it exists now, is so that it will be easy to get up and running quickly without coming across a blank region due to the `overflow: hidden` property. I didn't ship this CSS with the lib because I would like to leave it up to you to find what works best for your app without having to override styles I've forced on you.

# Examples

Examples require use of `bower link`. Here's [the guide][bower-link] I used.

## Setup the examples

From the root of this project in your command line:

1. `bower link`

    > This sets up a symbolic link to the lib.

2. `cd examples`
3. `npm install`
4. `bower install`
5. `bower link MarionetteTransition`

    > This uses that symbolic link created with bower, and adds it to the `bower_components` dir.

    > This allows you to work on the lib from project root without having to constantly release a new version.

    > If you know a better way, do tell or submit a PR.
6. `grunt serve`

[bower-link]: https://oncletom.io/2013/live-development-bower-component/
