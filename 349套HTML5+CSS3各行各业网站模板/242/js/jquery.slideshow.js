(function( window, $, undefined ) {
	
	$.Slideshow 				= function( options, element ) {
	
		this.$el			= $( element );
		
		this.$preloader		= $('<div class="cn-loading">Loading...</div>');
		
		// images
		this.$images		= this.$el.find('div.cn-images > img').hide();
		
		// total number of images
		this.imgCount		= this.$images.length;
		
		this.isAnimating	= false;
		
		this._init( options );
		
	};
	
	$.Slideshow.defaults 		= {
		current			: 0
    };
	
	$.Slideshow.prototype 		= {
		_init 				: function( options ) {
			
			this.options 		= $.extend( true, {}, $.Slideshow.defaults, options );
			
			// validate options
			this._validate();
			
			this.current		= this.options.current;
			
			this.$preloader.appendTo( this.$el );
			
			var instance		= this; 
			
			this._preloadImages( function() {
				
				instance.$preloader.hide();
				
				instance.$images.eq( instance.current ).show();
			
				instance.bar	= new $.NavigationBar( instance.imgCount, instance._getStatus() );
				
				instance.bar.getElement().appendTo( instance.$el );
				
				instance._initEvents();
			
			});
			
		},
		_preloadImages		: function( callback ) {
			
			var loaded	= 0, instance = this;
			
			this.$images.each( function(i) {
			
				var $img	= $(this);
					
				// large image
				$('<img/>').load( function() {
					++loaded;
					if( loaded === instance.imgCount * 2 ) callback.call();
				}).attr( 'src', $img.attr('src') );
				// thumb
				$('<img/>').load( function() {
					++loaded;
					if( loaded === instance.imgCount * 2 ) callback.call();
				}).attr( 'src', $img.data('thumb') );
			
			});
			
		},
		_validate			: function() {
		
			if( this.options.current < 0 || this.options.current >= this.imgCount )
				this.options.current = 0;
		
		},
		_getStatus			: function() {
			
			var $currentImg	= this.$images.eq( this.current ), $nextImg, $prevImg;
			
			( this.current === 0 ) ? $prevImg = this.$images.eq( this.imgCount - 1 ) : $prevImg = $currentImg.prev();
			( this.current === this.imgCount - 1 ) ? $nextImg = this.$images.eq( 0 ) : $nextImg = $currentImg.next();
			
			return {
				prevSource		: $prevImg.data( 'thumb' ),
				nextSource		: $nextImg.data( 'thumb' ),
				prevTitle		: $prevImg.attr( 'title' ),
				currentTitle	: $currentImg.attr( 'title' ),
				nextTitle		: $nextImg.attr( 'title' )
			};
			
		},
		_initEvents			: function() {
			
			var instance	= this;
			
			this.bar.$navPrev.bind('click.slideshow', function( event ) {
				
				instance._navigate( 'prev' );
				return false;
				
			});
			
			this.bar.$navNext.bind('click.slideshow', function( event ) {
				
				instance._navigate( 'next' );
				return false;
				
			});
			
		},
		_navigate			: function( dir ) {
			
			if( this.isAnimating ) return false;
			
			this.isAnimating	= true;
			
			var $curr			= this.$images.eq( this.current ).css( 'z-index' , 998 ),
				instance		= this;
			
			( dir === 'prev') 
				? ( this.current === 0 ) ? this.current = this.imgCount - 1 : --this.current
				: ( this.current === this.imgCount - 1 ) ? this.current = 0 : ++this.current;
			
			this.$images.eq( this.current ).show();
			
			$curr.fadeOut( 400, function() {
			
				$(this).css( 'z-index' , 1 );
				instance.isAnimating	= false;
			
			});
			
			this.bar.set( this._getStatus() );
			
		}
	};
	
	$.NavigationBar				= function( imgCount, status ) {
	
		this._init( imgCount, status );
		
	};
	
	$.NavigationBar.prototype 	= {
	
		_init 				: function( imgCount, status ) {
			
			this.$el 			= $('#barTmpl').tmpl( status );
			
			// navigation
			this.$navPrev		= this.$el.find('a.cn-nav-prev');
			this.$thumbPrev		= this.$navPrev.children('div');
			
			this.$navNext		= this.$el.find('a.cn-nav-next');
			this.$thumbNext		= this.$navNext.children('div');
			
			// navigation status
			this.$statusPrev	= this.$el.find('div.cn-nav-content-prev > h3');
			this.$statusCurrent	= this.$el.find('div.cn-nav-content-current > h2');
			this.$statusNext	= this.$el.find('div.cn-nav-content-next > h3');
			
			// just show current image description if only one image
			if( imgCount <= 1) {
			
				this.$navPrev.hide();
				this.$navNext.hide();
				this.$statusPrev.parent().hide();
				this.$statusNext.parent().hide();
				
			}
			
		},
		getElement			: function() {
		
			return this.$el;
		
		},
		// set the current, previous and next descriptions, and also the previous and next thumbs
		set					: function( status ) {
			
			this.$thumbPrev.css( 'background-image', 'url(' + status.prevSource + ')' );
			this.$thumbNext.css( 'background-image', 'url(' + status.nextSource + ')' );
			this.$statusPrev.text( status.prevTitle );
			this.$statusCurrent.text( status.currentTitle );
			this.$statusNext.text( status.nextTitle );
			
		}
	
	};
	
	var logError 				= function( message ) {
		
		if ( this.console ) {
			
			console.error( message );
			
		}
		
	};
	
	$.fn.slideshow 				= function( options ) {
	
		if ( typeof options === 'string' ) {
		
			var args = Array.prototype.slice.call( arguments, 1 );

			this.each(function() {
			
				var instance = $.data( this, 'slideshow' );
				
				if ( !instance ) {
					logError( "cannot call methods on slideshow prior to initialization; " +
					"attempted to call method '" + options + "'" );
					return;
				}
				
				if ( !$.isFunction( instance[options] ) || options.charAt(0) === "_" ) {
					logError( "no such method '" + options + "' for slideshow instance" );
					return;
				}
				
				instance[ options ].apply( instance, args );
			
			});
		
		} 
		else {
		
			this.each(function() {
				var instance = $.data( this, 'slideshow' );
				if ( !instance ) {
					$.data( this, 'slideshow', new $.Slideshow( options, this ) );
				}
			});
		
		}
		
		return this;
		
	};
	
})( window, jQuery );