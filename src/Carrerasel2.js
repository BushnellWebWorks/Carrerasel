/**
 * Carrerasel2. Props [THIS INFORMATION IS OBSOLETE]:
 * 		className: className(s) that will be added to the outer container
 *		innerClassName: className(s) that will be added to the inner container
 *		duration: duration ( N.NNs or NNNms ) of transition, including s/ms
 *		carBreadth: Width of each slide as % of container (number only), e.g. carBreadth="72" would be 72% of container
 *		carMargin: Gap between each slide as % of container (number only)
 *		breakpoint: max-width breakpoint above which the carousel is nullified
 *		id: Unique id for this carousel; if omitted then one will be generated randomly
 */
import React, {Component} from 'react';

export default class Carrerasel2 extends React.Component {
	constructor( props ) {
		super(props);

		this.id = props.id ? props.id : `Carrerasel2_${Math.round( Math.random() * 999999 ).toString(16)}`;

    this.hostProps = {};

    this.carouselActive = true;

		this.carIndex = 0;
		this.nextCarIndex = 0;
		this.cars = null;
		this.carsArray = [];
		this.swipeControl = { start: -1, end: -1 };
    this.carRefs = {
      breakpointSniffer: null,
      transitionHelper:null,
      carIndicators: null,
      carExterior: null,
      carInterior: null,
      carStyle1:{}
    }

    this.autoplayTO = null;

		this.styleRef = 'carStyle1';

		this.state = { carCount: 0 }

		this.assignClassNames = this.assignClassNames.bind(this);
    this.transTypeClass = this.transTypeClass.bind(this);
		this.addFakes = this.addFakes.bind(this);
		this.moveCar = this.moveCar.bind(this);
		this.proceedWithMove = this.proceedWithMove.bind(this);
		this.moveCarDone = this.moveCarDone.bind(this);
		this.transAway = this.transAway.bind(this);
		this.transToward = this.transToward.bind(this);
		this.crossedBreakpoint = this.crossedBreakpoint.bind(this);
		this.swipeDetector = this.swipeDetector.bind(this);
		this.checkCarouselity = this.checkCarouselity.bind(this);
    this.populateHostProps = this.populateHostProps.bind(this);
    this.initAutoplay = this.initAutoplay.bind(this);
    this.killAutoplay = this.killAutoplay.bind(this);
    this.handleCarHover = this.handleCarHover.bind(this);
    this.handleCarUnhover = this.handleCarUnhover.bind(this);
    this.callHook = this.callHook.bind(this);
    this.populateHostProps();
	}

	componentDidMount() {
    this.cars = this.carRefs.carInterior.children;
		this.carsArray = Array.prototype.slice.call( this.cars );
		const carCount = this.carsArray.length;
		this.setState({ carCount }, () => {
			this.addFakes();
			this.assignClassNames( this.carIndex );
      this.initAutoplay();
      this.callHook('init');
		});
	}
  componentWillUnmount() {
    this.killAutoplay();
  }

  populateHostProps() {
    if ( this.props.isComponent ) { // false if window.carrerasel2 is defined.
      this.hostProps = this.props;
    } else if (window && window.carrerasel2) {
      this.hostProps = window.carrerasel2[this.props.id];
    } else {
      return;
    }
    if ( !this.hostProps.sizes ) {
      this.hostProps.sizes = [{
        transDuration: '500ms'
      }];
    }
    if ( this.hostProps && this.hostProps.sizes && this.hostProps.sizes.length && this.hostProps.sizes instanceof Array ) {
      if ( this.hostProps.sizes.length > 9 ) {
        console.error(`Carrerasel2 Error: maximum 9 sizes (${this.hostProps.sizes.length} are defined); only the first 9 will be parsed.`);
        this.hostProps.sizes = this.hostProps.sizes.slice(0,9);
      }
      this.hostProps.sizes = this.hostProps.sizes.sort( (a,b) => {
        if ( 'number' !== typeof a.breakpoint ) { return -1; }
        if ( 'number' !== typeof b.breakpoint ) { return 1; }
        return (a.breakpoint < b.breakpoint)? -1 : 1;
      })
      this.hostProps.sizes.forEach( (bp,ix) => {
        const pibp = parseInt(bp.breakpoint);
        let iCarStyle = {
          breakpoint: (pibp) ? pibp : 0,
          minBreakpoint: (pibp) ? pibp : null,
          maxBreakpoint: ( this.hostProps.sizes.length > (ix+1) ) ? parseInt(this.hostProps.sizes[ix+1].breakpoint)-1 : null,
          carouselOff: ( bp.carouselOff ) ? true : false,
          carBreadth:bp.carWidth || bp.carBreadth || 72,
          carBreadthUnits: '%',
          carMargin: (undefined === bp.carMargin)? 8 : bp.carMargin,
          carMarginUnits:'%',
          panelCount: bp.panelCount || 1,
          clickAdvance: bp.clickAdvance || ( bp.panelCount || 1 ),
          bulbStep: bp.bulbStep || ( bp.panelCount || 1 ),
          transType: (bp.transType && (['slide','fade','slidev'].indexOf( bp.transType.toLowerCase() ) >= 0) )? bp.transType.toLowerCase() : 'slide',
          //transType: (bp.transType && bp.transType.toLowerCase() == 'fade' ) ? 'fade' : 'slide',
          //duration:bp.duration || 4000,
          transDuration: bp.transDuration || '400ms',
          autoplay: bp.autoplay || 0,
          pauseOnHover: ('undefined' !== typeof bp.pauseOnHover) ? bp.pauseOnHover : true,
          hideArrows: ( bp.hideArrows ) ? true : false,
          hideDots: ( bp.hideDots ) ? true : false,
          noLoop: ( bp.noLoop ) ? true : false,
          snifferOpacity: (ix+1)/10
        }
        if ( 'string' == typeof iCarStyle.carBreadth && iCarStyle.carBreadth.toLowerCase().indexOf('px') > 0 ) {
          iCarStyle.carBreadth = parseInt( iCarStyle.carBreadth);
          iCarStyle.carBreadthUnits = 'px';
        }
        if ( 'string' == typeof iCarStyle.carMargin && iCarStyle.carMargin.toLowerCase().indexOf('px') > 0 ) {
          iCarStyle.carMargin = parseInt( iCarStyle.carMargin);
          iCarStyle.carMarginUnits = 'px';
        }
        iCarStyle.panelCount = Math.max( 1, iCarStyle.panelCount );
        // on 'fade' trans type we need to force clickAdvance & bulbStep to be panelCount, otherwise a strange UX
        if ( 'fade' == iCarStyle.transType ) {
          iCarStyle.clickAdvance = iCarStyle.panelCount;
          iCarStyle.bulbStep = iCarStyle.panelCount;
        }
        this.hostProps[ `carStyle${ix+1}` ] = iCarStyle;
      })
    }
  }

	addFakes() {
		const firstEl = this.carRefs.carInterior.firstChild;
		for ( let ix=0; ix < this.carsArray.length; ix++ ) {
			const el = this.carsArray[ix];
      el.classList.add( 'car-car' );
			const nClass = `car-${ix}`;
			const cloneLeft = el.cloneNode(true);
			const cloneRight = el.cloneNode(true);
			el.classList.add('real-car', nClass);
			cloneLeft.classList.add('fake-car','fake-car-left', nClass);
			cloneRight.classList.add('fake-car','fake-car-right', nClass);
			this.carRefs.carInterior.insertBefore( cloneLeft, firstEl );
			this.carRefs.carInterior.appendChild( cloneRight );
		}
    if ( this.checkCarouselity() ) {
      this.transToward( this.carIndex );
    }
	}

  transTypeClass( noCar ) {
    var clist = this.carRefs.carExterior.classList;
    clist.forEach( cl => {
      if ( cl.indexOf('car-transtype') == 0 ) {
        clist.remove(cl);
      }
    });
    if ( noCar ) {
      clist.add('car-transtype-none');
    } else {
      clist.add(`car-transtype-${this.hostProps[this.styleRef].transType}`)
    }

  }

	assignClassNames( n=0 ) {
		for ( const el of this.carsArray ) {
			el.classList.remove('car-prime');
		}
		this.carsArray[ n ].classList.add('car-prime');
    if ( n === 0 && this.hostProps[this.styleRef].noLoop ) {
      this.carRefs.carInterior.classList.add('end-reached', 'end-reached-min');
    }
	}

  initAutoplay() {
    this.killAutoplay();
    if ( !this.hostProps[this.styleRef].autoplay ) { return ; }
    if ( !this.carouselActive ) { return; }
    const autoplayVal = parseInt( this.hostProps[this.styleRef].autoplay );
    if ( !autoplayVal || autoplayVal < 60 ) { return; }
    this.autoplayTO = setInterval( ()=>this.moveCar( this.carIndex + parseInt(this.hostProps[this.styleRef].clickAdvance) ), autoplayVal );
  }
  killAutoplay() {
    clearInterval( this.autoplayTO );
  }
  handleCarHover( ev ) {
    if ( !this.hostProps[this.styleRef].pauseOnHover ) { return; }
    this.killAutoplay();
  }
  handleCarUnhover( ev ) {
    if ( !this.hostProps[this.styleRef].pauseOnHover ) { return; }
    this.initAutoplay();
  }

	checkCarouselity() {
		if ( !window || !window.getComputedStyle ) { return false; }
    if ( false === this.callHook( 'checkCarouselityBefore' ) ) { return false; }
		let sniffer = window.getComputedStyle( this.carRefs.breakpointSniffer ).opacity;
		if ( !sniffer ) { return false; }
		sniffer = Math.round( sniffer * 10 );
		if ( sniffer == 0 ) {
      this.transTypeClass(true);
      this.carouselActive = false;
      return false
    }
    this.carouselActive = true;
    this.styleRef = `carStyle${sniffer}`;
    this.transTypeClass();
		return ( false !== this.callHook( 'checkCarouselityAfter' ) );
	}

	moveCar( ix, settling=false ) {
		if ( !this.checkCarouselity() ) { return; }
    if ( false === this.callHook('carTransitionBefore', ix) ) { return; }
    // If no loop, then don't allow navigation beyond the end. This next commented line would allow 'zooming' to the other end:
    //this.nextCarIndex = (this.hostProps[this.styleRef].noLoop) ? (ix+this.state.carCount) % this.state.carCount: ix;
    if ( this.hostProps[this.styleRef].noLoop ) {
      if ( ix < 0 ) {
        ix = 0;
        this.killAutoplay();
      }
      if ( ix >= this.state.carCount ) {
        ix = this.state.carCount-1;
        this.killAutoplay();
      }
    }
    this.nextCarIndex = ix;
		const clName = settling ? 'settling' : 'transing';
		this.carRefs.carInterior.classList.add(clName);
		requestAnimationFrame( this.proceedWithMove );
		this.transAway();
    // bulbs turn off in transAway, if same car then make sure bulb gets lit
    if ( this.carIndex == this.nextCarIndex ) {
      this.carRefs.carIndicators.querySelector(`.bulb_${this.carIndex}`).classList.add('lit');
    }
	}

	proceedWithMove() {
    switch( this.hostProps[this.styleRef].transType ) {
      case 'fade' : {
        // set transforms to 0 (centeroffset) in case they were transformed in another breakpoint:
        this.carRefs.carInterior.style.setProperty('transform',this.carCenterOffsetString);
    		this.carRefs.carInterior.style.setProperty('WebkitTransform',this.carCenterOffsetString);
        const {panelCount} = this.carRefs[this.styleRef];
        this.carIndex = panelCount * Math.floor(( (this.nextCarIndex % this.state.carCount) / panelCount ));
        break;
      }
      case 'slidev':
      default: {
        const newTransString = this.carRefs[this.styleRef].calcTransformString( -this.nextCarIndex );
        this.carRefs.carInterior.style.setProperty('transform',newTransString);
    		this.carRefs.carInterior.style.setProperty('WebkitTransform',newTransString);
        this.carIndex = ( this.nextCarIndex + this.state.carCount ) % this.state.carCount;
      }
    }
		this.transToward( this.carIndex );
    this.carRefs.transitionHelper.style.setProperty('max-width', `${this.carIndex}px`);
	}

	moveCarDone( ev ) {
		if ( ev.target != this.carRefs.transitionHelper ) { return; }
		this.carRefs.carInterior.classList.remove('transing','settling');
    switch( this.hostProps[this.styleRef].transType ) {
      case 'fade' : {
        // set transforms to 0 (centeroffset) in case they were transformed in another breakpoint:
        this.carRefs.carInterior.style.setProperty('transform',this.carCenterOffsetString);
    		this.carRefs.carInterior.style.setProperty('WebkitTransform',this.carCenterOffsetString);
        break;
      }
      case 'slidev':
      default: {
        const newTransString = this.carRefs[this.styleRef].calcTransformString( -this.carIndex );
        this.carRefs.carInterior.style.setProperty('transform',newTransString);
    		this.carRefs.carInterior.style.setProperty('WebkitTransform',newTransString);
      }
    }
		this.carRefs.carIndicators.querySelector(`.bulb_${this.carIndex}`).classList.add('lit');
    this.callHook( 'carTransitionAfter' );
	}

	transToward( n ) {
		const primes = this.carRefs.carInterior.querySelectorAll(`.car-${n}`);
		if ( primes && primes.length ) {
			for ( const el of primes ) {
				el.classList.add('car-prime');
			}
		}
		const neighbors = this.carRefs.carInterior.querySelectorAll(`.car-${ (n+1) % this.state.carCount }, .car-${ (n + this.state.carCount -1) % this.state.carCount }`);
		if ( neighbors && neighbors.length ) {
			for ( const el of neighbors ) {
				el.classList.add('car-neighbor');
			}
		}
    switch( this.hostProps[this.styleRef].transType ) {
      case 'fade': {
        const {panelCount} = this.hostProps[ this.styleRef ];
        const panelStart = Math.floor( n / panelCount ) * panelCount;
        let panelQueries = [];
        for ( let ix=0; ix < panelCount; ix++ ) {
          panelQueries.push( `.car-${ (panelStart+ix) }`)
        }
        const panelOccupants = this.carRefs.carInterior.querySelectorAll( panelQueries.join(', ') );
        if ( panelOccupants && panelOccupants.length ) {
          for ( const el of panelOccupants ) {
            el.classList.add('car-panel');
          }
        }
        break;
      }
      default: {
        let panelQueries = [];
        const {panelCount} = this.hostProps[ this.styleRef ];
        for ( let ix=0; ix < panelCount; ix++ ) {
          panelQueries.push( `.car-${ (n+ix) % this.state.carCount }` );
        }
        const panelOccupants = this.carRefs.carInterior.querySelectorAll( panelQueries.join(', ') );
        if ( panelOccupants && panelOccupants.length ) {
          for ( const el of panelOccupants ) {
            el.classList.add('car-panel');
          }
        }
        const panelNeighbors = this.carRefs.carInterior.querySelectorAll( `.car-${ (n+panelCount) % this.state.carCount }, .car-${ (n + this.state.carCount -1) % this.state.carCount }` );
        if ( panelNeighbors && panelNeighbors.length ) {
          for ( const el of panelNeighbors ) {
            el.classList.add('car-panel-neighbor');
          }
        }
      }
    }

	}

	transAway() {
    if ( this.hostProps[this.styleRef].noLoop ) {
      if ( this.carIndex != this.nextCarIndex ) {
        if ( this.nextCarIndex <= 0 ) {
          this.carRefs.carInterior.classList.add('end-reached', 'end-reached-min');
        } else if ( this.nextCarIndex >= ( this.state.carCount-1) ) {
          this.carRefs.carInterior.classList.add('end-reached', 'end-reached-max');
        } else {
          this.carRefs.carInterior.classList.remove('end-reached', 'end-reached-max', 'end-reached-min');
        }
      }
    }
		const litBulb = this.carRefs.carIndicators.querySelector('.lit');
		if (litBulb && litBulb.classList ) { litBulb.classList.remove('lit') }
		const actives = this.carRefs.carInterior.querySelectorAll('.car-prime, .car-neighbor, .car-panel, .car-panel-neighbor');
		if ( actives && actives.length ) {
			for ( const el of actives ) {
				el.classList.remove('car-prime','car-neighbor', 'car-panel', 'car-panel-neighbor');
			}
		}
	}

	crossedBreakpoint( ev ) {
    if ( false === this.callHook('breakpointCrossedBefore') ) { return; }
		this.moveCar( 0 );
    const litBulb = this.carRefs.carIndicators.querySelector('.lit');
		if (litBulb && litBulb.classList ) { litBulb.classList.remove('lit') }
    this.carRefs.carIndicators.querySelector(`.bulb_0`).classList.add('lit');
    if ( this.hostProps[this.styleRef].noLoop ) {
      this.carRefs.carInterior.classList.add('end-reached', 'end-reached-min');
    }
    this.initAutoplay();
    this.callHook('breakpointCrossedAfter');
	}

	swipeDetector( ev ) {
		ev.stopPropagation();
		switch( ev.type ) {
			case 'touchstart': {
				this.swipeControl.canSwipe = this.checkCarouselity();
				if ( !this.swipeControl.canSwipe ) { return; }

        if ( false === this.callHook('touchstartBefore') ) { return; }
        this.handleCarHover();
				this.swipeControl.startX = this.swipeControl.endX = ev.touches[0].pageX;
				this.swipeControl.startY = this.swipeControl.endY = ev.touches[0].pageY;
				this.swipeControl.swipeDir = null;

        const measureCars = this.carRefs.carInterior.querySelectorAll('.real-car');

				const trMatrix = window.getComputedStyle( this.carRefs.carInterior ).transform || window.getComputedStyle( this.carRefs.carInterior ).WebkitTransform;
        //const trProps = trMatrix.split('(').pop().split(',');
        const trProps = trMatrix.substring( trMatrix.lastIndexOf('(')+1, trMatrix.lastIndexOf(')') ).split(/, */);
        // establish horizontal start touch point
        this.swipeControl.txStart = parseFloat( trProps[4] );
				this.swipeControl.txWidth = measureCars.item(1).offsetLeft - measureCars.item(0).offsetLeft;
				this.swipeControl.txCenterOffset = ( this.carRefs.carInterior.offsetWidth - measureCars.item(0).offsetWidth ) / 2;
        // establish vertical start touch point
        this.swipeControl.tyStart = parseFloat( trProps[5] );
				this.swipeControl.tyHeight = measureCars.item(1).offsetTop - measureCars.item(0).offsetTop;
				this.swipeControl.tyCenterOffset = ( this.carRefs.carInterior.offsetHeight - measureCars.item(0).offsetHeight ) / 2;
        this.callHook('touchstartAfter', this.swipeControl );

  			break;
      }

			case 'touchmove': {
        if ( !this.swipeControl.canSwipe ) { return; }
        this.swipeControl.endX = ev.touches[0].pageX;
        this.swipeControl.endY = ev.touches[0].pageY;
        if ( !this.swipeControl.swipeDir ) {
          this.swipeControl.swipeDir = ( Math.abs( this.swipeControl.endX - this.swipeControl.startX ) > Math.abs( this.swipeControl.endY - this.swipeControl.startY ) ) ? 'h' : 'v';
        }
        switch( this.hostProps[this.styleRef].transType.toLowerCase() ){
          case 'slidev': {

    				if ( this.swipeControl.swipeDir == 'v' ) { ev.preventDefault() }

    				const newTy = this.swipeControl.tyStart + this.swipeControl.endY - this.swipeControl.startY;
    				if ( this.swipeControl.tyHeight && !isNaN( newTy ) ) {
    					const tranString = `matrix(1, 0, 0, 1, 0, ${newTy})`;
    					this.carRefs.carInterior.style.transform = tranString;
    				}
            break;
          }
          default: {
    				if ( this.swipeControl.swipeDir == 'h' ) { ev.preventDefault() }

    				const newTx = this.swipeControl.txStart + this.swipeControl.endX - this.swipeControl.startX;
    				if ( this.swipeControl.txWidth && !isNaN( newTx ) ) {
    					const tranString = `matrix(1, 0, 0, 1, ${newTx}, 0)`;
    					this.carRefs.carInterior.style.transform = tranString;
    				}
          }
        }
  			break;
      }

			case 'touchend': {
        if ( !this.swipeControl.canSwipe ) { return; }
        if ( false === this.callHook('touchendBefore') ) { return; }
        this.swipeControl.swipeDir = null;
        const dx = this.swipeControl.endX - this.swipeControl.startX;
        const dy = this.swipeControl.endY - this.swipeControl.startY;

        switch( this.hostProps[this.styleRef].transType.toLowerCase() ){
          case 'slidev': {
            //if ( this.swipeControl.startY < 0 || this.swipeControl.endY < 0 ) { return; }
            let carGuess = -Math.round((dy + this.swipeControl.tyStart - this.swipeControl.tyCenterOffset) / this.swipeControl.tyHeight) ;
            if ( this.hostProps[this.styleRef].noLoop ) {
              carGuess = Math.max(0, Math.min( this.state.carCount-1, carGuess));
            }
    				this.moveCar( carGuess, ( Math.abs(dy) > 40 ) );
            break;
          }
          case 'fade': {
            if ( Math.abs(dx) < 40 ) { return; }
            let nextIx = this.carIndex;
            nextIx -= Math.sign( dx ) * this.hostProps[this.styleRef].clickAdvance;
            nextIx = (nextIx + this.state.carCount) % this.state.carCount;
            this.moveCar( nextIx )
            break;
          }
          default: { // likely 'slide' (horizontal)
            let carGuess = -Math.round((dx + this.swipeControl.txStart - this.swipeControl.txCenterOffset) / this.swipeControl.txWidth) ;
            if ( this.hostProps[this.styleRef].noLoop ) {
              carGuess = Math.max(0, Math.min( this.state.carCount-1, carGuess));
            }
    				this.moveCar( carGuess, ( Math.abs(dx) > 40 ) );
          }
        }
        this.handleCarUnhover();
        this.callHook('touchendAfter', this.swipeControl );
      }
		}

	}

  callHook(cbName, ...args) {
    if ( !this.hostProps || !this.hostProps.callbacks || 'function' !== typeof this.hostProps.callbacks[cbName] ) { return; }
    let props = {};
    Object.keys( this ).forEach( key => {
      if ( 'function' === typeof this[key] ) { return; }
      if ( ['context','props','refs','state','updater'].indexOf( key ) >= 0 ) { return; }
      if ( key[0] == '_' ) { return; }
      props[key] = this[key];
    });
    props = Object.assign({},props, {currentStyle:this.hostProps[this.styleRef]}, {_args:args});
    return this.hostProps.callbacks[cbName]( props );
  }

	render() {
    if ( !this.hostProps ) { return null; }
    const addlClasses = (this.hostProps.className)? this.hostProps.className : '';
		const addlInnerClasses = ( this.hostProps.innerClassName ) ? this.hostProps.innerClassName : '';

		let maxTotalBreakpoint = 0;
    if ( this.hostProps.sizes instanceof Array ) {
      this.hostProps.sizes.forEach( bp => {
        const ibp = (1+parseInt(bp.breakpoint)) || 0;
        maxTotalBreakpoint = Math.max( maxTotalBreakpoint, ibp );
      })
    }

		return <div
      className={`carrerasel2 ${addlClasses}`}
      onMouseOver={this.handleCarHover}
      onMouseOut={this.handleCarUnhover}
      ref={el => this.carRefs.carExterior = el}
      >
			<div
				className={`car-interior ${addlInnerClasses}`}
				ref={el => this.carRefs.carInterior = el}
				onTouchStart={ this.swipeDetector }
				onTouchMove={ this.swipeDetector }
				onTouchEnd={ this.swipeDetector }
        dangerouslySetInnerHTML={ {__html:this.props.origChildren} }
			></div>
      <div className="transitionHelper"
        ref={el => this.carRefs.transitionHelper = el}
        onTransitionEnd={this.moveCarDone}
      ></div>
			<div className="breakpointSniffer" ref={el => this.carRefs.breakpointSniffer = el} onTransitionEnd={this.crossedBreakpoint} />
			<div className="car-indicators" ref={el => this.carRefs.carIndicators = el}>{
				[...Array(this.state.carCount)].map( (dummy,ix) => (
					<div
						className={`bulb bulb_${ix} ${ix==0? 'lit' : ''}`}
						key={`bulb_${ix}`}
						onClick={ () => this.moveCar( ix ) }
					/>
					)
				)
			}</div>
			<div
				className="turnsignal left"
				onMouseUp={()=>this.moveCar( this.carIndex - this.hostProps[this.styleRef].clickAdvance )}
				onTouchStart={ this.swipeDetector }
				onTouchMove={ this.swipeDetector }
				onTouchEnd={ this.swipeDetector }
			/>
			<div
				className="turnsignal right"
				onMouseUp={()=>this.moveCar( parseInt(this.carIndex) + parseInt(this.hostProps[this.styleRef].clickAdvance) )}
				onTouchStart={ this.swipeDetector }
				onTouchMove={ this.swipeDetector }
				onTouchEnd={ this.swipeDetector }
			/>
			{ maxTotalBreakpoint ? <style>{`
				#${this.id} .carrerasel2 .breakpointSniffer {
					position: absolute;
					width: 1px;
					height: 1px;
					right: 0;
					bottom: 0;
					z-index:0;
					background:transparent;
          opacity:0;
					transition: opacity 70ms linear;
				}
			`}</style> : '' }
      { this.hostProps.sizes.map( (bp, ix ) => {
        return <Carrerasel2Style id={this.id} ref={ el=>this.carRefs[`carStyle${ix+1}`]=el} count={this.state.carCount} {...this.hostProps[`carStyle${ix+1}`]} key={`carerrasel2style${ix}`}/>
      })}
		</div>
	}
}

class Carrerasel2Style extends React.Component {

	constructor( props ) {
		super(props);
		this.breakpoint = this.props.breakpoint ? parseInt(this.props.breakpoint) : 0;
		this.transDuration = props.transDuration ? props.transDuration : '0.4s';
    this.transType = props.transType ? props.transType : 'slide';
		this.carCellBreadth = props.carBreadth ? parseFloat(props.carBreadth) : 72;
    this.carCellBreadthUnits = props.carBreadthUnits || '%';
		this.carCellMargin = props.carMargin ? parseFloat(props.carMargin) : 8;
    this.carCellMarginUnits = props.carMarginUnits || '%';
    this.panelCount = props.panelCount ? parseInt(props.panelCount) : 1;
    this.clickAdvance = props.clickAdvance ? parseInt(props.clickAdvance) : 1;
    this.bulbStep = props.bulbStep ? parseInt( props.bulbStep ) : 1;
    this.noLoop = props.noLoop ? true : false;

    this.cssTransString = ( this.transType == 'slidev' ) ? 'translateY' : 'translateX';

    const panelBreadth = this.panelCount * this.carCellBreadth + ( this.panelCount-1 ) * this.carCellMargin;
    this.carCenterOffset = ( 100 - panelBreadth ) / 2;
    // in a single CSS transform line, you can have multiple translateX() or translateY() values
    this.carCenterOffsets = [
      `${this.cssTransString}( 50% )`,
      `${this.cssTransString}( -${this.panelCount * this.carCellBreadth / 2}${this.carCellBreadthUnits} )`,
    ];
    if ( this.panelCount > 1 ) {
      this.carCenterOffsets.push(
        `${this.cssTransString}( -${(this.panelCount-1) * this.carCellMargin / 2 }${this.carCellMarginUnits} )`
      );
    }
    this.carCenterOffsetString = this.carCenterOffsets.join(' ');
		//this.localCarCellMargin = 100 * this.carCellMargin / this.carCellBreadth;
		//this.carCellCombo = 100 + this.localCarCellMargin;
		this.carCellCombo = this.carCellBreadth + this.carCellMargin;
	}

  // returns a css transform value e.g. `translateX(-60%) translateX(-25px)`
  // n is number of car breadths
  calcTransformString( n ) {
    let transes = [
      `${this.cssTransString}( ${n * this.carCellBreadth}${this.carCellBreadthUnits} )`,
      `${this.cssTransString}( ${n * this.carCellMargin}${this.carCellMarginUnits} )`
    ];
    return [...transes, ...this.carCenterOffsets].join( ' ' );
  }

  transTypeSpecs() {
    let styleDec = '';
    switch( this.transType ) {
      case 'fade': {
        return `
          #${this.props.id} .carrerasel2 .car-interior {
            transform: ${this.carCenterOffsetString};
            -webkit-transform: ${this.carCenterOffsetString});
          }
          #${this.props.id} .carrerasel2 .car-interior .real-car {
            opacity: 0;
            -webkit-transition: opacity linear ${this.transDuration};
            transition: opacity linear ${this.transDuration};
          }
          #${this.props.id} .carrerasel2 .car-interior .real-car.car-panel {
            opacity:1;
          }
          #${this.props.id} .carrerasel2 .car-interior .fake-car {
            display:none;
          }
        `;
      }
      case 'slidev': {
        styleDec = `
        #${this.props.id} .carrerasel2 .car-interior {
          transform: ${this.carCenterOffsetString};
          -webkit-transform: ${this.carCenterOffsetString};
        }
        `;
        break;
      }
      default: {
        styleDec = `
        #${this.props.id} .carrerasel2 .car-interior {
          transform: ${this.carCenterOffsetString};
          -webkit-transform: ${this.carCenterOffsetString};
        }
        `;
        break;
      }
    }
    if ( this.noLoop ) {
      styleDec += `
        #${this.props.id} .carrerasel2 .car-interior .fake-car {
          display:none;
        }
      `;
    }
    return styleDec + `
      #${this.props.id} .carrerasel2 .car-interior.transing {
        transition: transform ease-out ${this.transDuration}, -webkit-transform ease-out ${this.transDuration};
        -webkit-transition: -webkit-transform ease-out ${this.transDuration};
      }
      #${this.props.id} .carrerasel2 .car-interior.settling {
        transition: transform ease-out 0.15s, -webkit-transform ease-out 0.15s;
        -webkit-transition: -webkit-transform ease-out 0.15s;
      }
    `;
  }

  bulbSpecs() {
    if ( !this.bulbStep || this.bulbStep < 2 ) { return ''; }
    let selectors = [];
    for ( let ix=0; ix < this.props.count; ix++ ) {
      if ( ix % this.bulbStep ) {
        selectors.push( `#${this.props.id} .carrerasel2 .car-indicators .bulb_${ix}` )
      }
    }
    if ( !selectors.length ) { return ''; }
    return `${selectors.join(', ')} { display:none; }`;

  }

	carClasses( ix ) {
    let propAlong = 'left';
    let propAcross = 'top';

    switch( this.transType ) {
      case 'fade': {
        const pos = ix % this.panelCount;
        return `
          #${this.props.id} .carrerasel2 .car-interior .real-car.car-${ix} {
            left: calc( ${ pos * this.carCellBreadth }${ this.carCellBreadthUnits } + ${ pos * this.carCellMargin }${ this.carCellMarginUnits } );
          }
        `;
      }
      case 'slidev': {
        propAlong = 'top';
        propAcross = 'left';
        break;
      }
      default: {
        break;
      }
    }
    return `
      #${this.props.id} .carrerasel2 .car-interior .real-car.car-${ix} {
        ${propAcross}: 0;
        ${propAlong}: calc( ${ ix * this.carCellBreadth }${ this.carCellBreadthUnits } + ${ ix * this.carCellMargin }${ this.carCellMarginUnits } );
      }
      #${this.props.id} .carrerasel2 .car-interior .fake-car-left.car-${ix} {
        ${propAcross}:0;
        ${propAlong}: calc( ${ (-this.props.count + ix) * this.carCellBreadth }${ this.carCellBreadthUnits } + ${ (-this.props.count + ix) * this.carCellMargin }${ this.carCellMarginUnits } );
      }
      #${this.props.id} .carrerasel2 .car-interior .fake-car-right.car-${ix} {
        ${propAcross}:0;
        ${propAlong}: calc( ${ (this.props.count + ix) * this.carCellBreadth }${ this.carCellBreadthUnits } + ${ (this.props.count + ix) * this.carCellMargin }${ this.carCellMarginUnits } );
      }
    `;
	}

	render() {
		let nClasses = [];
		for ( let ix=0; ix < this.props.count; ix++ ) {
			nClasses.push ( this.carClasses( ix ) );
		}
		let mqueries = [];
		if ( this.props.minBreakpoint ) {
			mqueries.push( `(min-width: ${this.props.minBreakpoint}px)` );
		}
		if ( this.props.maxBreakpoint ) {
			mqueries.push( `(max-width: ${this.props.maxBreakpoint}px)` );
		}
		const mquery = ( mqueries.length ) ? `@media ${mqueries.join(' and ')} {` : '';

    /* if 'carouselOff' is defined for this size, then hide everything & return: */
    if ( this.props.carouselOff ) {
      return <style>{`
        ${ mqueries.length ? mquery : '' }
					#${this.props.id} .car-indicators, #${this.props.id} .turnsignal { display: none !important; }
					#${this.props.id} .carrerasel2 .car-interior { transform: translateX(0) !important; -webkit-transform: translateX(0) !important; }
          #${this.props.id} .carrerasel2 .car-interior .fake-car { display: none !important; }
          #${this.props.id} .carrerasel2 .transitionHelper { display: none !important; }
					#${this.props.id} .carrerasel2 .breakpointSniffer { opacity: 0; }
				}
        ${ mqueries.length ? ` }` : '' }
        `}</style>
    }

		return <style>{`
${ mqueries.length ? mquery : '' }
#${this.props.id} .carrerasel2 {
	position: relative;
	width: 100%;
	max-width: 100%;
  overflow-x: ${ (this.props.transType != 'slidev') ? 'hidden' : 'visible' };
  overflow-y: ${ (this.props.transType != 'slidev') ? 'visible' : 'hidden' };
	touch-action: manipulation;
}
#${this.props.id} .carrerasel2 .car-interior {
	position: absolute;
	width: auto;
	height: auto;
	top: 0px;
  right: ${ (this.props.transType != 'slidev') ? '0px' : (this.props.hideDots) ? '0px' : '30px' };
  bottom: ${ (this.props.transType != 'slidev') ? (this.props.hideDots) ? '0px' : '30px' : '0px' };
  left:0px;
	overflow: visible;
}
#${this.props.id} .carrerasel2 .car-interior .car-car {
	position: absolute !important;
  width: ${ (this.props.transType != 'slidev') ? `${this.carCellBreadth}${this.carCellBreadthUnits}` : '100%'} !important;
  height: ${ (this.props.transType != 'slidev') ? '100%' : `${this.carCellBreadth}${this.carCellBreadthUnits}`} !important;
	left: 0;
	top: 0;
	z-index: 30;
}
#${this.props.id} .carrerasel2 .transitionHelper {
  background-color: transparent;
  position:absolute;
  z-index:0;
  width:1px;
  height:1px;
  max-width:999px;
  -webkit-transition: max-width linear ${this.transDuration};
  transition: max-width linear ${this.transDuration};
}
#${this.props.id} .turnsignal {
  display: ${ ( this.props.hideArrows ) ? 'none' : 'block' };
}
#${this.props.id} .car-indicators {
  display: ${ ( this.props.hideDots ) ? 'none' : 'block' };
}

${this.bulbSpecs()}
${this.transTypeSpecs()}
${ nClasses.join('') }

#${this.props.id} .carrerasel2 .breakpointSniffer { opacity: ${this.props.snifferOpacity} }

${ mqueries.length ? `
	}` : '' }

		`}</style>;
	}
}
