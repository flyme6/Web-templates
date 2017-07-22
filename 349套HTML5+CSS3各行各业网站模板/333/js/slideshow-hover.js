jQuery(document).ready(function(){
 
    //Set opacity to 0%
	 jQuery(".text_1_1").css({'opacity':'0'});

	jQuery('#slider').hover(
		function() {
			jQuery(this).find('.text_1_1').stop().fadeTo(200, 1);
		},
		function() {
			jQuery(this).find('.text_1_1').stop().fadeTo(200, 0);
		}
	)
	
	 
});		