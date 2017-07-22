$(document).ready(function () {
	"use strict";
	
	var 
		classAttrToCfgArr = function (elem, re) {
			if	(elem.length > 0) {
				return elem.attr('class').match(re);
			}
		},
		accordionInit = function (elem) {
			//console.log('accordionInit')
			var
				$button = elem.children('.multi-title'),
				$content = elem.children('.content');

			$content.hide();
			/*$content.css({display: 'none'})*/
			$button.each(function () {
				//console.log($(this))
				if ($(this).hasClass('current')) {

					$(this).next().stop(true)/*.css({display: 'block'})*/.show(250);
				}
			});

			if (elem.hasClass('constrain-0')) {
				$button.click(function () {
					$(this)
						.toggleClass('current')
							.next()
								.toggle(250)
				});
			}
			else {
				$button.click(function () {
					$(this)
						.addClass('current')
						.siblings().removeClass('current').end()
							.next()
								/*.css({display: 'block'})*/.show(250)
								.siblings('.content')
									/*.css({display: 'none'})*/.hide(250);
				});
			}
		//console.log('acc initialized');
		},

		tabsInit = function (elem) {
			var 
				href = document.location.href,
				re = new RegExp(/(#tab=)(\w+)/),
				re2 = new RegExp(/(#tabdd=)(\w+)/);
				
			
			$('<div class="ctrl-tabs-1"></div>').insertBefore(elem.children(':first'));
			var
				$title = elem.children('.multi-title'),
				$content = elem.children('.content'),
				$ctrl = elem.find('.ctrl-tabs-1');
				
			$title
				.addClass('ref')
				.appendTo($ctrl);
			$content
				.hide();
				
			if(href.match(re) !== null) {
				var 
					id = elem.find('#' + href.match(re)[2]).index() - 1;
				$title.removeClass('current').eq(id).addClass('current');
				$content.hide(250).eq(id).show(250);
			}
			else {
				$title.each(function(id) {
					if ($(this).hasClass('current')) {
						$content.eq(id).show();
					}
				});
			}
			$title.click(function () {
				document.location.href = '#tab=' + $content.eq($(this).index()).attr('id');
				$(this).addClass('current')
					.siblings().removeClass('current');
				$content.eq($(this).index()).show(250).siblings('.content').hide(250);
			});
			
			
		},

		multiCompInit = function () {
			//console.log("multiCompInit");
			var
				a,
				multiComp = $('.comp-multi-1'),
				multiCompSet = function (elem) {
					var
						//re = /(\w+|-(?!((\d+|\w+)(\s|$))))+/g,
						re = /(?:type)-(\w+)/,
						type = classAttrToCfgArr(elem, re)[1];
					if (type === 'acc') {
						accordionInit(elem);
					}
					else if (type === 'tabs') {
						tabsInit(elem);
					}
				};
			multiComp.each(function() {
				multiCompSet($(this));
			})
		},
		ie7GridFix = function (elem) {
			elem
				.addClass('ie7-grid-fix')
				.find('.col').each(function () {
					$(this)
						.children()
							.wrapAll('<div></div>');
				});
		};
		
	
	$('.services-1').gridSlider({cols: 4, rows: 1, transition: 'random', scroll_axis: 'random', scroll_speed: 1000})
	$('.comp-quotes-1').gridSlider({cols: 2, rows: 1, col_spacing_enable: true, col_spacing_size: 20, transition: 'slideOut', scroll_axis: 'x', scroll_speed: 1000, ctrl_pag: false});
	$('.target-gallery-1').gridSlider({ cols: 2, rows: 2, col_spacing_size: 2, col_spacing_enable: true, transition: 'slide', scroll_axis: 'z', scroll_speed: 1500, grid_height: 'constrain', autoplay_shift_dir: 1, image_stretch_mode: 'x' });
	$('.target-gallery-2').gridSlider({ cols: 1, rows: 1, col_spacing_enable: false, transition: 'slide', scroll_axis: 'random', scroll_speed: 500, autoplay_enable: true, grid_height: 350, autoplay_shift_dir: 1, image_stretch_mode: 'x', autoplay_interval: 3});
	$('.target-gallery-3').gridSlider({ cols: 10, col_spacing_size: 2, scroll_speed: 1000, grid_height: 'constrain', ctrl_pag: false, image_stretch_mode: 'x', autoplay_enable: true, autoplay_interval: 5, align: 'center', width: '600px'});
	$('.target-gallery-4').gridSlider({ cols: 3, rows: 3, col_spacing_size: 10, scroll_speed: 1000, grid_height: 'constrain', ctrl_pag: false, image_stretch_mode: 'x', scroll_axis: 'y', align: 'left', width: '300px'});
	
	$('.clients-1').gridSlider({ cols: 3, rows: 1, col_spacing_enable: true, transition: 'slide', scroll_axis: 'y', scroll_speed: 500, autoplay_enable: true, autoplay_shift_dir: 1, autoplay_interval: 3, ctrl_pag: false});
	$('.clients-2').gridSlider({ cols: 1, rows: 1, col_spacing_enable: true, transition: 'slide', scroll_axis: 'z', scroll_speed: 500, autoplay_enable: true, autoplay_shift_dir: 1, autoplay_interval: 1, ctrl_pag: false });
	
	if ($.browser.msie && parseInt($.browser.version, 10) === 7 && $('.cols-wrap').length > 0) {
		ie7GridFix($('.cols-wrap'));
	}
	if ($('.comp-multi-1').length > 0 ) {
		multiCompInit();
	}
 });