// Login Form
$(function() {
    var button = $('#loginButton');
    var box = $('#loginBox');
    var form = $('#loginForm');
    button.removeAttr('href');
    button.mouseup(function(login) {
        box.toggle();
        button.toggleClass('active');
    });
    form.mouseup(function() { 
        return false;
    });
    $(this).mouseup(function(login) {
        if(!($(login.target).parent('#loginButton').length > 0)) {
            button.removeClass('active');
            box.hide();
        }
    });
});

										/************ Magnifying Popup ***************/
													$(document).ready(function() {
														$('.popup-with-zoom-anim').magnificPopup({
															type: 'inline',
													
															fixedContentPos: false,
															fixedBgPos: true,
													
															overflowY: 'auto',
													
															closeBtnInside: true,
															preloader: false,
															
															midClick: true,
															removalDelay: 300,
															mainClass: 'my-mfp-zoom-in'
														});
																					
													});
   /*********** slider	**************/	
		jQuery(document).ready(function($) {
			$(".scroll").click(function(event){		
				event.preventDefault();
				$('html,body').animate({scrollTop:$(this.hash).offset().top},1200);
			});
		});
		