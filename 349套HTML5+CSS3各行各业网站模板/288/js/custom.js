
/* ---------------------------------------------------------------------- */
/*	DOM READY
/* ---------------------------------------------------------------------- */

jQuery(document).ready(function($) {
	
	/* ---------------------------------------------------- */
	/*	Main Navigation
	/* ---------------------------------------------------- */

	(function() {

		var	arrowimages = {
			down: 'downarrowclass',
			right: 'rightarrowclass'
		};
		var $mainNav    = $('#navigation').find('> ul'),
			optionsList = '<option value="" selected>Navigation</option>';

			var $submenu = $mainNav.find("ul").parent();
			$submenu.each(function (i) {
				var $curobj = $(this);
					this.istopheader = $curobj.parents("ul").length == 1 ? true : false;
				$curobj.children("a").append('<span class="' + (this.istopheader ? arrowimages.down : arrowimages.right) +'"></span>');
			});

		$mainNav.on('mouseenter', 'li', function() {
			var $this    = $(this),
				$subMenu = $this.children('ul');
			if($subMenu.length) $this.addClass('hover');
			$subMenu.hide().stop(true, true).fadeIn(200);
		}).on('mouseleave', 'li', function() {
			$(this).removeClass('hover').children('ul').stop(true, true).fadeOut(50);
		});

		// Navigation Responsive

		$mainNav.find('li').each(function() {
			var $this   = $(this),
				$anchor = $this.children('a'),
				depth   = $this.parents('ul').length - 1,
				dash  = '';

			if(depth) {
				while(depth > 0) {
					dash += '--';
					depth--;
				}
			}

			optionsList += '<option value="' + $anchor.attr('href') + '">' + dash + ' ' + $anchor.text() + '</option>';

		}).end()
			.after('<select class="nav-responsive">' + optionsList + '</select>');

		$('.nav-responsive').on('change', function() {
			window.location = $(this).val();
		});

	})();

	/* end Main Navigation */
		
	/* ---------------------------------------------------------------------- */
	/*	Revolution Slider
	/* ---------------------------------------------------------------------- */
	
	(function(){
				
		if($('.fullwidthbanner').length) {
			
			$('.fullwidthbanner').revolution({	
				delay: 5000,												
				startwidth:890,
				startheight:490,

				onHoverStop:"on",						// Stop Banner Timet at Hover on Slide on/off

				thumbWidth:100,							// Thumb With and Height and Amount (only if navigation Tyope set to thumb !)
				thumbHeight:50,
				thumbAmount:4,

				hideThumbs:200,
				navigationType:"none",					//bullet, thumb, none, both	 (No Shadow in Fullwidth Version !)
				navigationArrows:"verticalcentered",		//nexttobullets, verticalcentered, none
				navigationStyle:"square",				//round,square,navbar

				touchenabled:"on",						// Enable Swipe Function : on/off

				navOffsetHorizontal:0,
				navOffsetVertical:20,

				fullWidth:"on",

				shadow:0								//0 = no Shadow, 1,2,3 = 3 Different Art of Shadows -  (No Shadow in Fullwidth Version !)

			});		
			
		}


	})();
	
	/* end Revolution Slider */	
	
	/* ---------------------------------------------------------------------- */
	/*	MediaElement
	/* ---------------------------------------------------------------------- */

	(function() {

		var $player = $('audio');

		if($player.length) {

			$player.mediaelementplayer({
				audioWidth  : '100%',
				audioHeight : '34px',
				videoWidth  : '100%',
				videoHeight : '100%'
			});
		}

	})();

	/* end MediaElement */
	
	/* ---------------------------------------------------- */
	/*	jQuery Cookie
	/* ---------------------------------------------------- */

	jQuery.cookie = function (name, value, options) {
		if (typeof value != 'undefined') {
			options = options || {};
			if (value === null) {
				value = '';
				options.expires = -1
			}
			var expires = '';
			if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
				var date;
				if (typeof options.expires == 'number') {
					date = new Date();
					date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000))
				} else {
					date = options.expires
				}
				expires = '; expires=' + date.toUTCString()
			}
			var path = options.path ? '; path=' + (options.path) : '';
			var domain = options.domain ? '; domain=' + (options.domain) : '';
			var secure = options.secure ? '; secure' : '';
			document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('')
		} else {
			var cookieValue = null;
			if (document.cookie && document.cookie != '') {
				var cookies = document.cookie.split(';');
				for (var i = 0; i < cookies.length; i++) {
					var cookie = jQuery.trim(cookies[i]);
					if (cookie.substring(0, name.length + 1) == (name + '=')) {
						cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
						break
					}
				}
			}
			return cookieValue
		}
	};

	/* end jQuery Cookie */

	/* ---------------------------------------------------------------------- */
	/*	Image Post Slider
	/* ---------------------------------------------------------------------- */
	
	(function() {
	
		// Fixed scrollHorz effect
		$.fn.cycle.transitions.fixedScrollHorz = function($cont, $slides, opts) {

			$('.image-gallery-slider-nav a').on('click', function(e) {
				$cont.data('dir', '')
				if( e.target.className.indexOf('prev') > -1 ) $cont.data('dir', 'prev');
			});

			$cont.css('overflow', 'hidden');
			opts.before.push($.fn.cycle.commonReset);
			var w = $cont.width();
			opts.cssFirst.left = 0;
			opts.cssBefore.left = w;
			opts.cssBefore.top = 0;
			opts.animIn.left = 0;
			opts.animOut.left = 0-w;

			if( $cont.data('dir') === 'prev' ) {
				opts.cssBefore.left = -w;
				opts.animOut.left = w;
			}
			
		};

		var $slider = $('.image-post-slider ul');

		if($slider.length) {

			// Run slider when all images are fully loaded
			$(window).load(function() {

				$slider.each(function() {
					var $this = $(this);

					$this.css('height', $this.find('li:first img').height())
						.after('<div class="image-gallery-slider-nav"> <a class="prev">Prev</a> <a class="next">Next</a> </div>')
						.cycle({
							before: function(curr, next, opts) {
								var $this = $(this);
								$this.parent().stop().animate({height: $this.height()}, opts.speed);
							},
							containerResize : false,
							easing          : 'easeInOutExpo',
							fx              : 'fixedScrollHorz',
							fit             : true,
							next            : '.next' ,
							pause           : true,
							prev            : '.prev',
							slideExpr       : 'li',
							slideResize     : true,
							speed           : 600,
							timeout         : 5000,
							width           : '100%'
						});
				});

				// Pause on nav hover
				$('.image-gallery-slider-nav a').on('mouseenter', function() {
					$(this).parent().prev().cycle('pause');
				}).on('mouseleave', function() {
					$(this).parent().prev().cycle('resume');
				})

			});

			// Resize
			$(window).on('resize', function() {
				$slider.css('height', $slider.find('li:visible img').height() );
			});

			// Include swipe touch
			if(Modernizr.touch) {

				function swipe(e, dir) {

					var $slider = $(e.currentTarget);

					$slider.data('dir', '')

					if(dir === 'left') {
						$slider.cycle('next');
					}

					if(dir === 'right') {
						$slider.data('dir', 'prev')
						$slider.cycle('prev');
					}

				}

				$slider.swipe({
					swipeLeft       : swipe,
					swipeRight      : swipe,
					allowPageScroll : 'auto'
				});

			}
		}
		
	})();
	
	/* ---------------------------------------------------------------------- */
	/*	Twitter
	/* ---------------------------------------------------------------------- */

	(function() {
		
		if($("#tweet").length) {

			if ($('#tweet').length) {
				twitterFetcher.fetch('345111976353091584', 'tweet', 2, true);
			}
			
		}

	})();
	
	/* end Twitter */	
	
	/* ---------------------------------------------------------------------- */
	/*	Flickr
	/* ---------------------------------------------------------------------- */

	(function() {
		
		if($("#flickr-badge").length) {
			
			jQuery('#flickr-badge').jflickrfeed({
				limit: 6,
				qstrings: {},
				itemTemplate: '<li><div class="bordered"><figure class="add-border"><a class="single-image" target="_blank" href="{{image_b}}" href="#"><img src="{{image_s}}" alt="{{title}}" /><span class="curtain">&nbsp;</span></a></figure></div></li>'
			}, function() {
				$('#flickr-badge li:nth-child(3n)').addClass('last');
			});
			
		}

	})();
	
	/* end Flickr */	
	
	/* ---------------------------------------------------------------------- */
	/*	Google Maps
	/* ---------------------------------------------------------------------- */

	(function() {

		if($('#map').length) {
			$('#map').gMap({ 
				address: 'New York, USA',
				zoom: 14,
				markers: [
					{'address' : 'Grand St, New York'}
				]
			});  
		}

	})();
	
	/* end Google Maps */	
	
	/* ---------------------------------------------------------------------- */
	/*	Contact Form
	/* ---------------------------------------------------------------------- */

	(function() {

		if($('#contactform').length) {

			var $form = $('#contactform'),
			$loader = '<img src="images/preloader.gif" alt="Loading..." />';
			$form.append('<div class="hidden" id="contact_form_responce">');

			var $response = $('#contact_form_responce');
			$response.append('<p></p>');

			$form.submit(function(e){

				$response.find('p').html($loader);

				var data = {
					action: "contact_form_request",
					values: $("#contactform").serialize()
				};

				//send data to server
				$.post("php/contact-send.php", data, function(response) {

					response = $.parseJSON(response);
					
					$(".wrong-data").removeClass("wrong-data");
					$response.find('img').remove();

					if(response.is_errors){

						$response.find('p').removeClass().addClass("error type-2");
						$.each(response.info,function(input_name, input_label) {

							$("[name="+input_name+"]").addClass("wrong-data");
							$response.find('p').append('Please enter correctly "'+input_label+'"!'+ '</br>');
						});

					} else {

						$response.find('p').removeClass().addClass('success type-2');

						if(response.info == 'success'){

							$response.find('p').append('Your email has been sent!');
							$form.find('input:not(input[type="submit"], button), textarea, select').val('').attr( 'checked', false );
							$response.delay(1500).hide(400);
						}

						if(response.info == 'server_fail'){
							$response.find('p').append('Server failed. Send later!');
						}
					}

					// Scroll to bottom of the form to show respond message
					var bottomPosition = $form.offset().top + $form.outerHeight() - $(window).height();

					if($(document).scrollTop() < bottomPosition) {
						$('html, body').animate({
							scrollTop : bottomPosition
						});
					}

					if(!$('#contact_form_responce').css('display') == 'block') {
						$response.show(450);
					}

				});

				e.preventDefault();

			});				

		}

	})();

	/* end Contact Form */	
	
	/* ---------------------------------------------------------------------- */
	/*	Toggle
	/* ---------------------------------------------------------------------- */

	(function() {
		
		if($('.box-toggle').length) {	
			$(".toggle-container").hide(); 
			$(".trigger").click(function(e){
				$(this).toggleClass("active").next().slideToggle("slow");
				e.preventDefault();
			});
		}

	})();

	/* end Toggle */

	/* ---------------------------------------------------- */
	/*	Entry Tabs
	/* ---------------------------------------------------- */

	(function() {

		if($('.content-tabs').length) {
			
			$('ul.tabs-nav').delegate('li:not(.active)', 'click', function(e) {
				$(this).addClass('active').siblings().removeClass('active')
				.parent().next('.tabs-container').find(".tab-content").hide().eq($(this).index()).fadeIn(150);  
				e.preventDefault();
			});

			$('ul.tabs-nav').find("> li:first").addClass("active");
			$('.tab-content:first-child').show();			
			
		}

	})();

	/* end Content Tabs */

	/* ---------------------------------------------------- */
	/*	Back to Top
	/* ---------------------------------------------------- */

	(function() {

		var extend = {
				button      : '#back-top',
				bt			: '.divider-top a',
				text        : 'Back to Top',
				min         : 200,
				fadeIn      : 400,
				fadeOut     : 400,
				speed		: 800,
				easing		: 'easeOutQuint'
			}
			,
			oldiOS     = false,
			oldAndroid = false;

		// Detect if older iOS device, which doesn't support fixed position
		if( /(iPhone|iPod|iPad)\sOS\s[0-4][_\d]+/i.test(navigator.userAgent) )
			oldiOS = true;

		// Detect if older Android device, which doesn't support fixed position
		if( /Android\s+([0-2][\.\d]+)/i.test(navigator.userAgent) )
			oldAndroid = true;

		$('body').append('<a href="#" id="' + extend.button.substring(1) + '" title="' + extend.text + '">' + extend.text + '</a>');

		$(window).scroll(function() {
			var pos = $(window).scrollTop();
			
			if(oldiOS || oldAndroid) {
				$(settings.button).css({
					'position' : 'absolute',
					'top'      : pos + $(window).height()
				});
			}

			if (pos > extend.min) 
				$(extend.button).fadeIn(extend.fadeIn);
			else 
				$(extend.button).fadeOut (extend.fadeOut);
		});
		
		$(extend.button).add(extend.bt).click(function(e){
			$('html, body').animate({scrollTop : 0}, extend.speed, extend.easing);
			e.preventDefault();
		});

	})();

	/* end Back to Top */

	/* ---------------------------------------------------- */
	/*	Media
	/* ---------------------------------------------------- */
	
	(function() {
		
		if($('audio, video').length) {
			$('audio,video').mediaelementplayer();
		}		
			
	})();

	/* end Media --> End */

	/* ---------------------------------------------------- */
	/*	Fancybox
	/* ---------------------------------------------------- */
	
	(function() {
		
		if($('.single-image').length) {
			
			$('.single-image.picture-icon, .single-image.video-icon').fancybox({
				'titlePosition' : 'over',
				'transitionIn'  : 'fade',
				'transitionOut' : 'fade'
			})
			
			$('.single-image').each(function() {
				$(this).append('<span class="curtain">&nbsp;</span>');
			});
			
			if($('a.video-icon').length) {
				
				$('a.video-icon').on('click',function() {
					$.fancybox({
						'type' : 'iframe',
						'href' : this.href.replace(new RegExp('watch\\?v=', 'i'), 'embed/') + '&autoplay=1',
						'overlayShow' : true,
						'centerOnScroll' : true,
						'speedIn' : 100,
						'speedOut' : 50,
						'width' : 640,
						'height' : 480
					});
					return false;
				});
			}	
			
		}
		
	})();

	/* end fancybox --> End */

	/* ---------------------------------------------------- */
	/*	Portfolio
	/* ---------------------------------------------------- */

	(function() {

		var $cont = $('#portfolio-items, #gallery');

		if($cont.length) {

			var $itemsFilter = $('#portfolio-filter'),
				mouseOver;

			// Copy categories to item classes
			$('article', $cont).each(function(i) {
				var $this = $(this);
				$this.addClass( $this.attr('data-categories') );
			});

			// Run Isotope when all images are fully loaded
			$(window).on('load', function() {

				$cont.isotope({
					itemSelector : 'article',
					layoutMode   : 'fitRows'
				});

			});
			
			// Filter projects
			$itemsFilter.on('click', 'a', function(e) {
				var $this         = $(this),
					currentOption = $this.attr('data-categories');
					
				$itemsFilter.find('a').removeClass('active');
				$this.addClass('active');

				if(currentOption) {
					if(currentOption !== '*') currentOption = currentOption.replace(currentOption, '.' + currentOption)

					$cont.isotope({filter : currentOption});
				}

				e.preventDefault();
			});

			$itemsFilter.find('a').first().addClass('active');
		}

	})();

	/* end Portfolio  */
				
/************************************************************************/
});/* DOM READY --> End													*/
/************************************************************************/
