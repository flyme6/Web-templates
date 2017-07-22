

// If JavaScript is enabled remove 'no-js' class and give 'js' class
jQuery('html').removeClass('no-js').addClass('js');

// Add .osx class to html if on Os/x
if (navigator.appVersion.indexOf("Mac") !== -1) {
	jQuery('html').addClass('osx');
}
// When DOM is fully loaded
jQuery(document).ready(function($) {

/* External links */  
	(function() {
	    $(window).load(function() {
			$('a[rel=external]').attr('target','_blank');	
		});                                            
	})(); 
    
/* Tooltips	*/	
	(function() {
    $('body').tooltip({
        delay: { show: 300, hide: 0 },
        selector: '[data-toggle=tooltip]:not([disabled])'
    });
  })(); 
  
/* 	PRETTYPHOTO */
$('a[data-rel]').each(function() {
			$(this).attr('rel', $(this).data('rel'));
		});


$("a[data-rel^='prettyPhotoComment']").prettyPhoto({social_tools: false, theme: 'dark_square', deeplinking:false});


/* Accordion */

$(function() {

    $('.accordion').on('show', function (e) {
         $(e.target).prev('.accordion-heading').find('.accordion-toggle').addClass('accordion-active');
    });
    
    $('.accordion').on('hide', function (e) {
        $(this).find('.accordion-toggle').not($(e.target)).removeClass('accordion-active');
    });
        
});


/* Portfolio Overlay	*/	

$(function() {
    $(".portfolio").hover(
        function () {
            $(this).find('.overlay').fadeIn();
        }, 
        function () {
            $(this).find('.overlay').stop().fadeOut();
        }
        );
});


/* banner overlay hide/show text */

$(function() {
    $(".banner-out-about").hover(
        function () {
            $(this).find('.small-text-2').slideDown();
}, 
function () {
            $(this).find('.small-text-2').stop().slideUp();
}
);
});


/* FlexSlider */

  $(window).load(function() {

  //home page v1
    $('.slider1').flexslider({
    slideshow: true,
    animation: 'fade',
		pauseOnHover: true,
    controlNav: true
	});
 
  
  $('.slider2').flexslider({
    slideshow: false,
    animation: "slide",
    prevText: "&lsaquo;&mdash;&nbsp;&nbsp;&nbsp;Previous",
    nextText: "Next&nbsp;&nbsp;&nbsp;&mdash;&rsaquo;",
    animationLoop: false    
  });

    $('.slider4').flexslider({
		controlNav: true,
    directNav: false,
    slideshow: false,
		animation: 'slide',
		pauseOnHover: true
	});  
});   



  /* Masonry */
$(window).load(function() {  
$('.blog').masonry({
  itemSelector: '.post',
  gutterWidth: 1
});
}); 

$(window).resize(function() {  
$('.blog').masonry({
  itemSelector: '.post',
  gutterWidth: 1
});
  }); 


/* Mobile menu */
	$('.navbar .nav').mobileMenu({
    	defaultText: 'Navigate to...',
    	className: 'select-menu',
    	subMenuDash: '&ndash;'
	});

/* scrollable content */
$(window).load(function(){
				$(".scrollable").mCustomScrollbar({
          scrollButtons:{
						enable:false
					},
		
          advanced:{
        updateOnContentResize: true
    }   
				});
        
        $(".scrollable-2").mCustomScrollbar({
        theme: "dark",
          scrollButtons:{
						enable:false
					},
		
          advanced:{
        updateOnContentResize: true
    }   
				});
        
              $(".scrollable-3").mCustomScrollbar({
        theme: "dark",
          scrollButtons:{
						enable:false
					},
		
          advanced:{
        updateOnContentResize: true
    }   
				}); 
        
        $(".scrollable-4").mCustomScrollbar({
        theme: "dark",
          scrollButtons:{
						enable:false
					},
		
          advanced:{
        updateOnContentResize: true
    }   
				}); 

        $(".scrollable-5").mCustomScrollbar({
        theme: "dark",
          scrollButtons:{
						enable:false
					},
		
          advanced:{
        updateOnContentResize: true
    }   
				});        
        
			});


/* Newsletter	*/	
	$('#submit').click(function() {
		$.ajax({
			type : 'POST',
			url : 'php/newsletter.php',
			dataType : 'json',
			data: {
				email : $('#nlemail').val()
			},
			success : function(data){

				$('#nlmessage').removeClass().addClass((data.error === true) ? 'nlerror' : 'nlsuccess')
					.text(data.msg).show(500);
        $('#nlmessage').delay(4000);
        $('#nlmessage').animate({
          height: 'toggle'  
        }, 500, function() {
          // Animation complete.
        });

				if (data.error === true){}  
			},
			error : function(XMLHttpRequest, textStatus, errorThrown) {

				$('#nlmessage').removeClass().addClass('error')
					.text('There was an error.').show(500);
			}
		});		
		return false;
	});

/* Contact Form	*/	
	$('#send').click(function(){ // when the button is clicked the code executes
		$('.error').fadeOut('slow'); // reset the error messages (hides them)

		var error = false; // we will set this true if the form isn't valid

		var name = $('input#name').val(); // get the value of the input field
		if(name == "" || name == " " || name == "Name") {
    $('#err-name').show(500);
    $('#err-name').delay(4000);
    $('#err-name').animate({
      height: 'toggle'  
    }, 500, function() {
      // Animation complete.
    }); 
      error = true; // change the error state to true
		}

		var email_compare = /^([a-z0-9_.-]+)@([da-z.-]+).([a-z.]{2,6})$/; // Syntax to compare against input
		var email = $('input#email').val().toLowerCase(); // get the value of the input field
		if (email == "" || email == " " || email == "E-mail") { // check if the field is empty
			$('#err-email').fadeIn('slow'); // error - empty
			error = true;
		}else if (!email_compare.test(email)) { // if it's not empty check the format against our email_compare variable

    $('#err-emailvld').show(500);
    $('#err-emailvld').delay(4000);
    $('#err-emailvld').animate({
      height: 'toggle'  
    }, 500, function() {
      // Animation complete.
    });         
			error = true;
		}
    
		var message = $('textarea#message').val(); // get the value of the input field
		if(message == "" || message == " " || message == "Message") {

      
    $('#err-message').show(500);
    $('#err-message').delay(4000);
    $('#err-message').animate({
      height: 'toggle'  
    }, 500, function() {
      // Animation complete.
    });            
			error = true; // change the error state to true
		} 

		if(error == true) {

    $('#err-form').show(500);
    $('#err-form').delay(4000);
    $('#err-form').animate({
      height: 'toggle'  
    }, 500, function() {
      // Animation complete.
    });         
			return false;
		}

		var data_string = $('#ajax-form').serialize(); // Collect data from form
		//alert(data_string);

		$.ajax({
			type: "POST",
			url: $('#ajax-form').attr('action'),
			data: data_string,
			timeout: 6000,
			error: function(request,error) {
				if (error == "timeout") {
					$('#err-timedout').slideDown('slow');
				}
				else {
					$('#err-state').slideDown('slow');
					$("#err-state").html('An error occurred: ' + error + '');
				}
			},
			success: function() {

        
    $('#ajaxsuccess').show(500);
    $('#ajaxsuccess').delay(4000);
    $('#ajaxsuccess').animate({
      height: 'toggle'  
    }, 500, function() {
    });           

        $("#name").val('');
        $("#email").val('');
        $("#message").val('');
			}
		});

		return false; // stops user browser being directed to the php file
	}); // end click function

}); 