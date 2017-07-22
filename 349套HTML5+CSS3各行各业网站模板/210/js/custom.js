/***************************************************
			Nivo Slider
***************************************************/
jQuery.noConflict()(function($){
$(document).ready(function() {
            $('#slider').nivoSlider({
                pauseTime:5000,
                pauseOnHover:false
            });        
    });
});
/***************************************************
			SuperFish Menu
***************************************************/	
// initialise plugins
	jQuery.noConflict()(function(){
		jQuery('ul.sf-menu').superfish();
	});

/***************************************************
			PRETTY PHOTO
***************************************************/
jQuery.noConflict()(function($){
$(document).ready(function() {  

$("a[rel^='prettyPhoto']").prettyPhoto({opacity:0.80,default_width:500,default_height:344,theme:'light_rounded',hideflash:false,modal:false});

});
});
/***************************************************
			LIST SLIDER
***************************************************/
jQuery.noConflict()(function($){
		$(document).ready(function() {

			$.featureList(
				$("#tabs li a"),
				$("#output li"), {
					start_item	:	1
				}
			);
		});
});

/***************************************************
			ACCORDION SLIDER
***************************************************/
jQuery.noConflict()(function($){
				$('.kwicks').kwicks({
					max : 900,
					spacing : 0
				});
			});
			
			
/***************************************************
			MOSAIC
***************************************************/
jQuery.noConflict()(function($){
				
				$('.circle').mosaic({
					opacity		:	0.8			//Opacity for overlay (0-1)
				});
				
				$('.fade').mosaic();
				
				$('.bar').mosaic({
					animation	:	'slide'		//fade or slide
				});
				
				$('.bar2').mosaic({
					animation	:	'slide'		//fade or slide
				});
				
				$('.bar3').mosaic({
					animation	:	'slide',	//fade or slide
					anchor_y	:	'top'		//Vertical anchor position
				});
				
				$('.cover').mosaic({
					animation	:	'slide',	//fade or slide
					hover_x		:	'400px'		//Horizontal position on hover
				});
				
				$('.cover2').mosaic({
					animation	:	'slide',	//fade or slide
					anchor_y	:	'top',		//Vertical anchor position
					hover_y		:	'100px'		//Vertical position on hover
				});
				
				$('.cover3').mosaic({
					animation	:	'slide',	//fade or slide
					hover_x		:	'400px',	//Horizontal position on hover
					hover_y		:	'300px'		//Vertical position on hover
				});
		    
		    });			
/***************************************************
			IMAGE HOVER
***************************************************/
jQuery.noConflict()(function($){
$(document).ready(function() {  
            $('.img-preview').each(function() {
                $(this).hover(
                    function() {
                        $(this).stop().animate({ opacity: 0.5 }, 400);
                    },
                   function() {
                       $(this).stop().animate({ opacity: 1.0 }, 400);
                   })
                });
});
});
jQuery.noConflict()(function($){
			$('#slides').slides({
				preload: true,
				generateNextPrev: false
			});
			$('#slides2').slides({
				preload: true,
				generateNextPrev: false,
				generatePagination: true
			});
		});