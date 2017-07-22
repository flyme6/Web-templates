/**	
	* Template Name: WpF Medinova - Ultra Modern Responsive Bootstrap Educational Html5 Template
	* Version: 1.0	
	* Template Scripts
	* Author: WpFreeware Team
	* Author URI: http://wpfreeware.com/

	Custom JS
	
	1. DROPDOWN MENU
	2. FIXED TOP MENU BAR
	3. TOP SLIDER
	4. WHY CHOOSE SLIER(SLICK SLIDER)
	5. COUNTER
	6. DOCTORS TEAM SLIDER(SLICK SLIDER)
	7. TESTIMONIAL SLIDER(SLICK SLIDER)
	8. PRELOADER
	9. SCROLL TOP BUTTON
	10. ACCORDION	 	
	
**/

jQuery(function($){


  /* ----------------------------------------------------------- */
  /*  1. DROPDOWN MENU
  /* ----------------------------------------------------------- */

   // for hover dropdown menu
  $('ul.nav li.dropdown').hover(function() {
      $(this).find('.dropdown-menu').stop(true, true).delay(200).fadeIn(200);
    }, function() {
      $(this).find('.dropdown-menu').stop(true, true).delay(200).fadeOut(200);
    });

	/* ----------------------------------------------------------- */
	/*  2. Fixed Top Menubar
	/* ----------------------------------------------------------- */

	// For fixed top bar
       $(window).scroll(function(){
        if($(window).scrollTop() >50 /*or $(window).height()*/){
            $(".navbar-fixed-top").addClass('past-main');
            $(".navbar-right .dropdown-menu").css('top','70px');   
        }
    else{    	
      $(".navbar-fixed-top").removeClass('past-main');
      $(".navbar-right .dropdown-menu").css('top','75px');
      }
    });
    

    /* ----------------------------------------------------------- */
	/*  3. Top Slider
	/* ----------------------------------------------------------- */     
	     $('.top-slider').slick({
		  dots: false,
		  arrows:true,
		  autoplay: true,
		  speed: 500,
		  fade: true,
		  cssEase: 'linear'
		});
    /* ----------------------------------------------------------- */
	/*  4. Why Choose Slider(Slick Slider)
	/* ----------------------------------------------------------- */ 

	$('.whychoose-slider').slick({
	  dots: false,
      infinite: true,      
      speed: 800,
      arrows:true,      
      slidesToShow: 1,
      slide: 'div',
      autoplay: true,
      fade: false,
      autoplaySpeed: 5000,
      cssEase: 'linear'
	});

	/* ----------------------------------------------------------- */
	/*  5. Counter
	/* ----------------------------------------------------------- */ 

	  $('.counter').counterUp({
            delay: 10,
            time: 1000
        });


	/* ----------------------------------------------------------- */
	/*  6. DOCTORS TEAM SLIDER
	/* ----------------------------------------------------------- */

		$('.doctors-nav').slick({
		  dots: false,
		  infinite: true,
		  speed: 300,
		  slide: 'li',
		  // autoplay: true,
		  slidesToShow: 4,
		  slidesToScroll: 4,
		  responsive: [
		    {
		      breakpoint: 1024,
		      settings: {
		        slidesToShow: 3,
		        slidesToScroll: 3,
		        infinite: true,
		        dots: true
		      }
		    },
		    {
		      breakpoint: 600,
		      settings: {
		        slidesToShow: 2,
		        slidesToScroll: 2
		      }
		    },
		    {
		      breakpoint: 480,
		      settings: {
		        slidesToShow: 1,
		        slidesToScroll: 1
		      }
		    }
		  ]
		}); 

	/* ----------------------------------------------------------- */
	/*  7. Testimonial Slider 
	/* ----------------------------------------------------------- */ 

	$('.testimonial-nav').slick({
	  dots: true,
      infinite: true,      
      speed: 800,
      arrows:false,      
      slidesToShow: 1,
      slide: 'li',
      autoplay: true,
      fade: true,
      autoplaySpeed: 5000,
      cssEase: 'linear'
	});

	/* ----------------------------------------------------------- */
	/*  8. PRELOADER 
	/* ----------------------------------------------------------- */ 

	  jQuery(window).load(function() { // makes sure the whole site is loaded
      $('#status').fadeOut(); // will first fade out the loading animation
      $('#preloader').delay(100).fadeOut('slow'); // will fade out the white DIV that covers the website.
      $('body').delay(100).css({'overflow':'visible'});
    })
	  
	/* ----------------------------------------------------------- */
	/*  9. SCROLL TOP BUTTON
	/* ----------------------------------------------------------- */

	//Check to see if the window is top if not then display button

	  $(window).scroll(function(){
	    if ($(this).scrollTop() > 300) {
	      $('.scrollToTop').fadeIn();
	    } else {
	      $('.scrollToTop').fadeOut();
	    }
	  });
	   
	  //Click event to scroll to top

	  $('.scrollToTop').click(function(){
	    $('html, body').animate({scrollTop : 0},800);
	    return false;
	  });

	/* ----------------------------------------------------------- */
	/*  10. Bootstrap Accordion
	/* ----------------------------------------------------------- */  

	
	$('#accordion .panel-collapse').on('shown.bs.collapse', function () {
	$(this).prev().find(".fa").removeClass("fa-plus").addClass("fa-minus");
	});
	
	//The reverse of the above on hidden event:
	
	$('#accordion .panel-collapse').on('hidden.bs.collapse', function () {
	$(this).prev().find(".fa").removeClass("fa-minus").addClass("fa-plus");
	});	
	
});