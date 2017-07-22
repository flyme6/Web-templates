/*
 *	jQuery Full Page width slider
 *	written using jQuery 1.6.2
 *	
 */


(function($) {

	$.fn.fwslider = function(options){
	  
		// default configuration properties
		var defaults = {			
			auto:			true,
			speed: 		800,
			pause:		2000,
			panels: 	3,
			width:  	960,
			height:  	490,
			nav: 			true 
		}; 
		
		var options = $.extend(defaults, options);  
				
		this.each(function() {
			var obj = $(this);
			var n = $('div', obj).length;
			var w = options.width;
			var h = options.height;
			var animating = false;
			
			if(n<options.panels)adjust();
			obj.wrapInner('<div id="fw-wrapper"><div id="fw-slider"></div></div>');
			obj.css({'width':'100%','overflow':'hidden','height':h,'position':'relative'});
			$('#fw-wrapper', obj).css('width',w);
			$('#fw-slider', obj).css({'width':(options.panels+1)*w,'left':w*Math.floor(options.panels/2)*-1});
			
			if(options.nav) {
				obj.append('<div id="fw-nav-next"><a href="javascript:void(0);">next</a></div>');
				obj.append('<div id="fw-nav-prev"><a href="javascript:void(0);">prev</a></div>');
				
				$('#fw-nav-next a', obj).click(function(){		
					animate("next",true);
				});
				$('#fw-nav-prev a', obj).click(function(){		
					animate("prev",true);
				});
				
				$('#fw-nav-next', obj).hover(
				  function () {
				    $(this).fadeTo('fast',0.7);
				  }, 
				  function () {
				    $(this).fadeTo('fast',0.5);
				  }
				);
				$('#fw-nav-prev', obj).hover(
				  function () {
				    $(this).fadeTo('fast',0.7);
				  }, 
				  function () {
				    $(this).fadeTo('fast',0.5);
				  }
				);
			}
			
			function adjust(){
				for(i=n;i<options.panels;i++) {
					$("div", obj).slice(i-n,i-n+1).clone().appendTo(obj);
				}
			};
			
			function animate(dir,clicked){
				if(!animating) {
					animating=true;
					switch(dir){
						case "next":
							var begin = $('#fw-slider div', obj).first();
							begin.clone().appendTo('#fw-slider');
							begin.animate(
								{ marginLeft: w*-1 }, 
								{ queue:false, duration:options.speed, complete:function(){
									begin.remove();
									animating=false;
									}
								});
							break;
						case "prev":
							var end = $('#fw-slider div', obj).last();
							end.clone().css('margin-left',w*-1).prependTo('#fw-slider').animate(
								{ marginLeft: 0 }, 
								{ queue:false, duration:options.speed, complete:function(){
									end.remove();
									animating=false;
									}
								});
							break;
					}
				}
				
				if(clicked) clearTimeout(timeout);
				if(options.auto && dir=="next" && !clicked){;
					timeout = setTimeout(function(){
						animate("next",false);
					},options.pause+options.speed);
				};
			};
			
			// init, start once all the images have been loaded
			$('#fw-slider img').last().load(function(){
				var timeout;
				if(options.auto){
					timeout = setTimeout(function(){
						animate("next",false);
					},options.pause);
				};		
			});
		});
	  
	};

})(jQuery);



