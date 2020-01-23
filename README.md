# Carrerasel

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### Developer-friendly responsive carousel

index.html shows a demo carousel, that's responsive. Try changing the size of your browser window, to view the carousel at various breakpoints.

* At small sizes, it's a vertical carousel slider with arrows but no dots.
* Between 768px and 1024px, it's not a carousel &mdash; slides are arbitrarily shown in a grid.
* Between 1024px and 1500px, it's a horizontal slider having 2 slides per panel, with arrows and dots, and it auto-advances and loops.
* Above 1500px, it's a horizontal slider having 2 slides per panel, with arrows and dots, but it doesn't auto-advance or loop.

## Instructions:
First, mark up a container element with a class `class="c2_placeholder"`, and an ID, e.g. `id="demoCarousel"`.

Within this container element, place the slides, having any classnames you like. Each direct child will be converted to a slide.

You'll want to define a height for the carousel at different breakpoints, using CSS and @media queries. Use the selector `.c2_placeholder .carrerasel2`.

Carrerasel looks for a JavaScript object named `carrerasel2,` having a property that corresponds to the container's ID:

<pre>var carrerasel2 = {
	demoCarousel: { ... }
}</pre>

If you have multiple carousels on the page, you can define multiple properties herein.

This property should have a prop `sizes:` that's an array of objects, each defining properties above a certain breakpoint. For example, here's how the above carousel is defined above breakpoint 1024(px):
<pre>
demoCarousel: {
	sizes:[
		{
			breakpoint:1024,
			carWidth:'38%',
			carMargin:'36px',
			transDuration:'700ms',
			transType:'slide',
			panelCount:2,
			bulbStep:1,
			autoplay:2500,
			pauseOnHover:true,
		},
		...]
</pre>
		
### The options for each breakpoint are:

* `breakpoint`: Minimum window width (in pixels) for which these properties take effect. If omitted, then these define the carousel for the smallest width.
* `carBreadth` (or `carWidth`): Width of each slide (or height if it's a vertical carousel). Either a number (% is assumed) or a string like '320px' (default 72).
* `carBreadthUnits`: Optionally set carBreadth to a number, and set this to 'px' if you prefer it to '%' (default '%').
* `carMargin`: Margin between slides, either a number (% is assumed) or a string like '16px' (default 8).
* `carMarginUnits`: Optionally set carMargin to a number, and set this to 'px' if you prefer it to '%' (default '%').
* `panelCount`: Number of slides you intend to fit on a single panel. Though display is calculated by the `carBreadth`, other properties take their cues from this number (default 1).
* `clickAdvance`: Number of slides to advance when arrows are clicked (default 1).
* `bulbStep`: Number of slides represented by each dot (default 1).
* `transType`: Can be 'slide', 'fade' or 'slidev' (default 'slide').
* `transDuration`: String like '500ms' or '1.5s' (default 400ms).
* `autoplay`: Whether to autoplay the slide transitions (default false).
* `pauseOnHover`: Pause autoplay when the mouse hovers over the carousel (default true).
* `hideArrows`: Set true to hide the left+right arrows on the carousel (default false).
* `hideDots`: Set true to hide the nav dots beneath the carousel (default false).
* `noLoop`: Set true to disable infinite looping on the carousel (default false).
* `carouselOff`: If you want to disable the carousel entirely at this breakpoint, set this to true (default false).

		
### Classes

Carrerasel adds helpful classes to the carousel elements:

__Slides:__

When looping is enabled (by default), Carrerasel clones the slides and repeats them before and after the primary slides.

* `.real-car`: assigned to the "primary" slides.
* `.fake-car`: assigned to the cloned slides.
* `.fake-car-left` and `.fake-car-right`: all the cloned slides before ("left" of) and after ("right" of) the primary slides.
* `.car-prime`: the current visible slide. When the panel has more than one slide, it's the first slide on the panel.
* `.car-neighbor`: the slides adjacent to the .car-prime.
* `.car-panel`: the slide(s) on the panel.
* `.car-panel-neighbor`: the slides adjacent to the panel.
* All slides are given a numbered class, `.car-n`, corresponding to the slide's index.
* All slides, real and "fake," are given a class `.car-car`.

__Wrapper:__

In addition to `sizes`, you can add a property `innerClassName` to help you style the carousel elements; this class is added to the container `div` that wraps all the slides.

This wrapper has a class `transing`, while the transition is occurring.

If looping is disabled, the wrapper has a class `end-reached` when the carousel reaches the beginning or end. When it reaches the beginning, the class `end-reached-min` is added; when it reaches the end, the class `end-reached-max` is added.

### Events

Alongside `sizes` you can define a `callbacks` object, with keys defining a function that receives a meaningful `data` argument, e.g.
<pre>
	callbacks: {
		init: function( data ) {
			console.log( 'initted' );
			console.log( data );
		}
	...
</pre>

For example, you can retrieve the current slide index from `data.carIndex`.

These callback keys are listed below. For all keys ending in "Before," function can return false to abort the action:

* `init`: Carousel is initialized.
* `carTransitionBefore`: Prior to performing the transition.
* `carTransitionAfter`: After the transition is done.
* `breakpointCrossedBefore`: Prior to making adjustments when the window size changes and crosses a breakpoint.
* `breakpointCrossedAfter`: After breakpoint adjustments are made.
* `touchstartBefore`: Before touchstart event is processed.
* `touchstartAfter`: After touchstart event is processed.
* `touchendBefore`: Before touchend event is processed.
* `touchendAfter`: After touchend event is processed.
* `checkCarouselityBefore`: Before conditions are evaluated to determined if carousel is active or not.
* `checkCarouselityAfter`: After determining if carousel is active. Can also return `false` to abort carousel.

