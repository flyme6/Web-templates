$(document).ready(function() {
    
    //center_logo();
    
    if ($.browser.mozilla) {
        $('body').addClass('firefox');
    }
    
});



/**
    * SPONSOR LOGOS
    * Vertically centering the logo within container
    * ----
*/
function center_logo(){
	$('img.logo').each(function(i){
	
		var margin_height = $(this).parent().height() - $(this).height();
    	var final_height = margin_height / 2;
    	
    	var gay = $(this).height();
    	
    	//alert(gay);
    	    	
    	$(this).css({marginTop: final_height});
	    
	});
}