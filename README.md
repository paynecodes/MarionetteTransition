# Common Region Methods

show                      // native show
showTransition        // shows a newView w/ transition, and closes the oldView
close                       // native close
closeTransition         // closes the currentView w/ transition
hideTransition          // hides the currentView w/ transition
push                        // shows a newView w/ transition, adds it to a stack of views and keeps the oldView
pop                          // closes the currentView w/ transition, revealing the underlying (previous) view in the stack


Examples require use of `bower link`. Here's [the guide][bower-link] I used.

[bower-link]: https://oncletom.io/2013/live-development-bower-component/
