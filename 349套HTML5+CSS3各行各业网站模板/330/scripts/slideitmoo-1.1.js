/**
	SlideItMoo v1.1 - Image slider
	(c) 2007-2008 Constantin Boiangiu <http://www.php-help.ro>
	MIT-style license.
	
	Changes from version 1.0
	- added continuous navigation
	- changed the navigation from Fx.Scroll to Fx.Morph
	- added new parameters: itemsSelector: pass the CSS class for divs
	- itemWidth: for elements with margin/padding pass their width including margin/padding
	
	Updates ( August 4'th 2009 )
	- added new parameter 'elemsSlide'. When this is set to a value lower that the actual number of elements in HTML, it will slide at once that number of elements when navigation clicked. Default: null
**/
var SlideItMoo = new Class({
	
	Implements: [Options],
	options: {
		overallContainer: null,
		elementScrolled: null,
		thumbsContainer: null,		
		itemsVisible:5,
		elemsSlide: null,
		itemsSelector: null,
		itemWidth: null,
		showControls:1,
		transition: Fx.Transitions.linear,
		duration: 800,
		direction: 1,
		autoSlide: false,
		mouseWheelNav: false
	},
	
	initialize: function(options){
		this.setOptions(options);
		/* all elements are identified on CSS selector (itemsSelector) */
		this.elements = $(this.options.thumbsContainer).getElements(this.options.itemsSelector);
		this.totalElements = this.elements.length;
		if( this.totalElements <= this.options.itemsVisible ) return;
		// width of thumbsContainer children
		this.elementWidth = this.options.itemWidth || this.elements[0].getSize().x;
		this.currentElement = 0;
		this.direction = this.options.direction;
		this.autoSlideTotal = this.options.autoSlide + this.options.duration;
		this.begin();
	},
		
	begin: function(){	
		// resizes the container div's according to the number of itemsVisible thumbnails
		this.setContainersSize();
		
		this.myFx = new Fx.Morph(this.options.thumbsContainer, { 
			wait: true, 
			transition: this.options.transition,
			duration: this.options.duration
		});		
				
		/* if navigation is needed and enabled, add it */
		this.addControls();
		/* if autoSlide is not set, scoll on mouse wheel */
		if( this.options.mouseWheelNav && !this.options.autoSlide ){
			$(this.options.thumbsContainer).addEvent('mousewheel', function(ev){
				new Event(ev).stop();
				this.slide(-ev.wheel);								
			}.bind(this));
		}
		
		if( this.options.autoSlide )
			this.startAutoSlide();		
	},
	
	setContainersSize: function(){
		$(this.options.overallContainer).set({
			styles:{
				'width': this.options.itemsVisible * this.elementWidth + 50 * this.options.showControls
			}
		});
		$(this.options.elementScrolled).set({
			styles:{
				'width': this.options.itemsVisible * this.elementWidth
			}
		});
		$(this.options.thumbsContainer).set({
			styles:{
				'width': this.totalElements * (this.elementWidth + 10)	
			}
		});
	},
	
	addControls: function(){
		if( !this.options.showControls ) return;
		
		this.fwd = new Element('div', {
			'class': 'SlideItMoo_forward',
			'events':{
				'click':this.slide.pass(1, this)
			}
		});
		this.bkwd = new Element('div', {
			'class': 'SlideItMoo_back',
			'events':{
				'click': this.slide.pass(-1, this)
			}
		});
		$(this.options.overallContainer).adopt(this.fwd, this.bkwd);		
	},
	
	slide: function( direction ){
		
		if(this.started) return;
		this.direction = direction;
		var currentIndex = this.currentIndex();
		
		if( this.options.elemsSlide && this.options.elemsSlide>1 && this.endingElem==null ){
			this.endingElem = this.currentElement;			
			for(var i = 0; i < this.options.elemsSlide; i++ ){
				this.endingElem += direction;
				if( this.endingElem >= this.totalElements ) this.endingElem = 0;
				if( this.endingElem < 0 ) this.endingElem = this.totalElements-1;
			}
		}	
		
		if( this.direction == -1 ){
			this.rearange();
			$(this.options.thumbsContainer).setStyle('margin-left', -this.elementWidth);			
		}
		this.started = true;
		this.myFx.start({ 
			'margin-left': this.direction == 1 ? -this.elementWidth : 0 
		}).chain( function(){			
			this.rearange(true);			
			if(this.options.elemsSlide){
				if( this.endingElem !== this.currentElement ) this.slide(this.direction);
				else this.endingElem=null;	
			}
		}.bind(this)  );
	},
	
	rearange: function( rerun ){
		
		if(rerun) this.started = false;
		if( rerun && this.direction == -1 ) {
			return;
		}
		this.currentElement = this.currentIndex( this.direction );
		//$('debug').innerHTML+= this.currentElement+'<br>';
		
		$(this.options.thumbsContainer).setStyle('margin-left',0);
		
		if( this.currentElement == 1 && this.direction == 1 ){
			this.elements[0].injectAfter(this.elements[this.totalElements-1]);
			return;
		}
		if( (this.currentElement == 0 && this.direction ==1) || (this.direction==-1 && this.currentElement == this.totalElements-1) ){
			this.rearrangeElement( this.elements.getLast(), this.direction == 1 ? this.elements[this.totalElements-2] : this.elements[0]);
			return;
		}
		
		if( this.direction == 1 ){
			this.rearrangeElement( this.elements[this.currentElement-1], this.elements[this.currentElement-2]);
		}
		else{
			this.rearrangeElement( this.elements[this.currentElement], this.elements[this.currentElement+1]);
		}		
	},
	
	rearrangeElement: function( element , indicator ){
		this.direction == 1 ? element.injectAfter(indicator) : element.injectBefore(indicator);
	},
	
	currentIndex: function(){
		var elemIndex = null;
		switch( this.direction ){
			/* forward */
			case 1:
				elemIndex = this.currentElement >= this.totalElements-1 ? 0 : this.currentElement + this.direction;				
			break;
			/* backwards */
			case -1:
				elemIndex = this.currentElement == 0 ? this.totalElements - 1 : this.currentElement + this.direction;
			break;
		}
		return elemIndex;
	},
	
	startAutoSlide: function(){
		this.startIt = this.slide.bind(this).pass(this.direction||1);
		this.autoSlide = this.startIt.periodical(this.autoSlideTotal, this);
		this.elements.addEvents({
			'mouseover':function(){
				$clear(this.autoSlide);						
			}.bind(this),
			'mouseout':function(){
				this.autoSlide = this.startIt.periodical(this.autoSlideTotal, this);
			}.bind(this)
		})
	}
})