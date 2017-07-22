jQuery(document).ready(function ($) {

    $('.services_nav_list li').click(function() {
	    
	    var selected = $(this).data('service');
	    
	    if (!$('.view[data-service="' + selected + '"]').hasClass("active")) {
	    
	    	$('.services_nav_list').find('li.active').removeClass("active");
	    	$('.view.active').removeClass("active");
		    $('.services_nav_list li[data-service="' + selected + '"]').addClass("active");
		    $('.view[data-service="' + selected + '"]').addClass("active");
		    
	    } else {
	    
		    return false;
		    
	    }
		
		$('.service_wrapper').css("height", height);
	     
    });
    
    $('.next').click(function(e) {
        e.preventDefault();
        
    	var active = $('.service_wrapper').find('.view.active');
    	var selected = active.data("service");
		
		if (selected >= 5) {
			return false;
		} else {
			active.removeClass("active");
			$('.view[data-service="' + (selected+1) + '"]').addClass("active");
		}
		
		var height = $('.view.active').height();
		
		$('.service_wrapper').css("height", height);
		
    });
    
     $('.previous').click(function(e) {
        e.preventDefault();
        
    	var active = $('.service_wrapper').find('.view.active');
    	var selected = active.data("service");
		
		if (selected <= 1) {
			return false;
		} else {
			active.removeClass("active");
			$('.view[data-service="' + (selected-1) + '"]').addClass("active");
		}
		
		var height = $('.view.active').height();
		
		$('.service_wrapper').css("height", height);
		
    });
    
    $('.selectors_wrapper li').click(function() {
	    
	    var selected = $(this).data('selector');
	    
	    if (!$('.standard[data-selector="' + selected + '"]').hasClass("active")) {
	    
	    	$('.selectors_wrapper').find('li.active').removeClass("active");
	    	$('.standard.active').removeClass("active");
		    $('.selectors_wrapper li[data-selector="' + selected + '"]').addClass("active");
		    $('.standard[data-selector="' + selected + '"]').addClass("active");
		    
			var height2 = $('.standard.active').height();
		    $('.standard_content').css("height", height2);
		    
	    } else {
	    
		    return false;
		    
	    }
	     
    });
    
    
    $(function() {
    
		var height = $('.view.active').height();
	    	height2 = $('.standard.active').height();
		
		$('.service_wrapper').css("height", height);
		$('.standard_content').css("height", height2);
    
    });
    
    $(window).resize(function() {
    
		var height = $('.view.active').height();
	    	height2 = $('.standard.active').height();
		
		$('.service_wrapper').css("height", height);
		$('.standard_content').css("height", height2);
		
	});
	
	// Check if browser supports HTML5 input placeholder
	function supports_input_placeholder() {
		var i = document.createElement('input');
		return 'placeholder' in i;
		
		var x = document.createElement('textarea');
		return 'placeholder' in x;
	}
	
	// Change input text on focus
	if (!supports_input_placeholder()) {
		jQuery('.wpcf7-text').each(function() {
	    	var self = jQuery(this);
			var value = jQuery.trim(self.val());
			if(value == '') self.val(self.attr('placeholder'));
	    });
		jQuery('.wpcf7-text').focus(function(){
			var self = jQuery(this);
			if (self.val() == self.attr('placeholder')) self.val('');
		}).blur(function(){
			var self = jQuery(this);
			var value = jQuery.trim(self.val());
			if(value == '') self.val(self.attr('placeholder'));
		});
		
		jQuery('.wpcf7-textarea').each(function() {
	    	var self = jQuery(this);
			var value = jQuery.trim(self.val());
			if(value == '') self.val(self.attr('placeholder'));
	    });
		jQuery('.wpcf7-textarea').focus(function(){
			var self = jQuery(this);
			if (self.val() == self.attr('placeholder')) self.val('');
		}).blur(function(){
			var self = jQuery(this);
			var value = jQuery.trim(self.val());
			if(value == '') self.val(self.attr('placeholder'));
		});
		
		
	}

});