/*
 * 	loopedSlider 0.5.1 - jQuery plugin
 *	written by Nathan Searles	
 *	http://nathansearles.com/loopedslider/
 *
 *	Copyright (c) 2009 Nathan Searles (http://nathansearles.com/)
 *	Dual licensed under the MIT (MIT-LICENSE.txt)
 *	and GPL (GPL-LICENSE.txt) licenses.
 *
 *	Built for jQuery library
 *	http://jquery.com
 *
 */

/*
 *	markup example for $("#loopedSlider").loopedSlider();
 *
 *	<div id="loopedSlider">	
 *		<div class="container">
 *			<div class="slides">
 *				<div><img src="01.jpg" alt="" /></div>
 *				<div><img src="02.jpg" alt="" /></div>
 *				<div><img src="03.jpg" alt="" /></div>
 *				<div><img src="04.jpg" alt="" /></div>
 *			</div>
 *		</div>
 *		<a href="#" class="previous">previous</a>
 *		<a href="#" class="next">next</a>
 *		<ul class="pagination">
 *			<li><a href="#">1</a></li>
 *			<li><a href="#">2</a></li>
 *			<li><a href="#">3</a></li>
 *			<li><a href="#">4</a></li>
 *		</ul>	
 *	</div>
 *
*/

(function($) {
	$.fn.loopedSlider = function(options) {
		
	var defaults = {			
		container: '.container',
		slides: '.slides',
		pagination: '.pagination',
		containerClick: true, // Click container for next slide
		autoStart: 0, // Set to positive number for auto interval and interval time
		slidespeed: 300, // Speed of slide animation
		fadespeed: 300, // Speed of fade animation
		autoHeight: false // Set to positive number for auto height and animation speed
	};
		
	this.each(function() {
		
		var obj = $(this);
		var o = $.extend(defaults, options);
		var pagination = $(o.pagination+' li a',obj);
		var m = 0;
		var t = 1;
		var s = $(o.slides,obj).children().size();
		var w = $(o.slides,obj).children().outerWidth();
		var p = 0;
		var u = false;
		var n = 0;
		
		$(o.slides,obj).css({width:(s*w)});
		
		$(o.slides,obj).children().each(function(){
			$(this).css({position:'absolute',left:p,display:'block'});
			p=p+w;
		});
		
		$(pagination,obj).each(function(){
			n=n+1;
			$(this).attr('rel',n);
			$(pagination.eq(0),obj).parent().addClass('active');
		});
		
		$(o.slides,obj).children(':eq('+(s-1)+')').css({position:'absolute',left:-w});
		
		if(o.autoHeight){autoHeight(t);}
		
		$('.next',obj).click(function(){
			if(u===false) {
				animate('next',true);
				if(o.autoStart){clearInterval(sliderIntervalID);}
			} return false;
		});
		
		$('.previous',obj).click(function(){
			if(u===false) {	
				animate('prev',true);
				if(o.autoStart){clearInterval(sliderIntervalID);}
			} return false;
		});
		
		if (o.containerClick) {
			$(o.container ,obj).click(function(){
				if(u===false) {
					animate('next',true);
					if(o.autoStart){clearInterval(sliderIntervalID);}
				} return false;
			});
		}
		
		$(pagination,obj).click(function(){
			if ($(this).parent().hasClass('active')) {return false;}
			else {
				t = $(this).attr('rel');
				$(pagination,obj).parent().siblings().removeClass('active');
				$(this).parent().addClass('active');
				animate('fade',t);
				if(o.autoStart){clearInterval(sliderIntervalID);}
			} return false;
		});
		
		if (o.autoStart) {
			sliderIntervalID = setInterval(function(){
				if(u===false) {animate('next',true);}
			}, o.autoStart);
		}
		
		function current(t) {
			if(t===s+1){t=1;}
			if(t===0){t=s;}
			$(pagination,obj).parent().siblings().removeClass('active');
			$(pagination+'[rel="' + (t) + '"]',obj).parent().addClass('active');
		};
		
		function autoHeight(t) {
			if(t===s+1){t=1;}
			if(t===0){t=s;}	
			var getHeight = $(o.slides,obj).children(':eq('+(t-1)+')',obj).outerHeight();
			$(o.container,obj).animate({height: getHeight},o.autoHeight);					
		};		
		
		function animate(dir,clicked){	
			u = true;	
			switch(dir){
				case 'next':
					t = t+1;
					m = (-(t*w-w));
					current(t);
					if(o.autoHeight){autoHeight(t);}
					$(o.slides,obj).animate({left: m}, o.slidespeed,function(){
						if (t===s+1) {
							t = 1;
							$(o.slides,obj).css({left:0},function(){$(o.slides,obj).animate({left:m})});							
							$(o.slides,obj).children(':eq(0)').css({left: 0});
							$(o.slides,obj).children(':eq('+(s-1)+')').css({ position:'absolute',left:-w});				
						}
						if (t===s) $(o.slides,obj).children(':eq(0)').css({left:(s*w)});
						if (t===s-1) $(o.slides,obj).children(':eq('+(s-1)+')').css({left:s*w-w});
						u = false;
					});					
					break; 
				case 'prev':
					t = t-1;
					m = (-(t*w-w));
					current(t);
					if(o.autoHeight){autoHeight(t);}
					$(o.slides,obj).animate({left: m}, o.slidespeed,function(){
						if (t===0) {
							t = s;
							$(o.slides,obj).children(':eq('+(s-1)+')').css({position:'absolute',left:(s*w-w)});
							$(o.slides,obj).css({left: -(s*w-w)});
							$(o.slides,obj).children(':eq(0)').css({left:(s*w)});
						}
						if (t===2 ) $(o.slides,obj).children(':eq(0)').css({position:'absolute',left:0});
						if (t===1) $(o.slides,obj).children(':eq('+ (s-1) +')').css({position:'absolute',left:-w});
						u = false;
					});
					break;
				case 'fade':
					t = [t]*1;
					m = (-(t*w-w));
					current(t);
					if(o.autoHeight){autoHeight(t);}
					$(o.slides,obj).children().fadeOut(o.fadespeed, function(){
						$(o.slides,obj).css({left: m});
						$(o.slides,obj).children(':eq('+(s-1)+')').css({left:s*w-w});
						$(o.slides,obj).children(':eq(0)').css({left:0});
						if(t===s){$(o.slides,obj).children(':eq(0)').css({left:(s*w)});}
						if(t===1){$(o.slides,obj).children(':eq('+(s-1)+')').css({ position:'absolute',left:-w});}
						$(o.slides,obj).children().fadeIn(o.fadespeed);
						u = false;
					});
					break; 
				default:
					break;
				}					
			};
		});
	};
})(jQuery);