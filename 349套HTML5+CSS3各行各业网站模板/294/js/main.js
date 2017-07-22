jQuery(document).ready(function($) {

	'use strict';

		$(".our-listing").owlCarousel({
			items: 4,
			navigation: true,
			navigationText: ["&larr;","&rarr;"],
		});


		$('.flexslider').flexslider({
		    animation: "fade",
		    controlNav: false,
		    prevText: "&larr;",
		    nextText: "&rarr;"
		});


		$('.toggle-menu').click(function(){
	        $('.menu-responsive').slideToggle();
	        return false;
	    });


});









