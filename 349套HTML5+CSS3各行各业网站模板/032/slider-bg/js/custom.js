/*
  * @package Droplet
  * @subpackage Droplet HTML
  * 
  * Template Scripts
  * Created by Themeturn

  
*/


$(window).load(function() { // makes sure the whole site is loaded
  "use strict";

  /* ==============================================
      Menu toggle
    =============================================== */ 
    $(window).bind('scroll', function() {
        var navHeight = $(window).height() - 40;
        if ($(window).scrollTop() > navHeight) {
            $('.navbar-default').addClass('on');
        } else {
            $('.navbar-default').removeClass('on');
        }
    });

    $('body').scrollspy({ 
        target: '.navbar-default',
        offset: 70
    })
 

});

  

$(document).ready(function(){
  
  "use strict";
  
  $("a[data-rel^='prettyPhoto']").prettyPhoto();

 /* ==============================================
       Testimonialcarousel
    =============================================== */ 

  $("#testimonial-carousel").owlCarousel({
 
      navigation : false, // Show next and prev buttons
      slideSpeed : 600,
      pagination:true,
      itemsDesktop : [1199,3],
      itemsDesktopSmall : [979,3],
      singleItem:true
 
    });

    // Custom Navigation Events
    var owl = $("#testimonial-carousel");


    // Custom Navigation Events
    $(".next").click(function(){
      owl.trigger('owl.next');
    })
    $(".prev").click(function(){
      owl.trigger('owl.prev');
    })
    $(".play").click(function(){
      owl.trigger('owl.play',1000); //owl.play event accept autoPlay speed as second parameter
    })
    $(".stop").click(function(){
      owl.trigger('owl.stop');
    })
   

    /* ==============================================
     Client carousel
    =============================================== */ 

 $("#client-carousel").owlCarousel({
      navigation : false, // Show next and prev buttons
      slideSpeed : 400,
      pagination:false,
      items : 5,
      rewindNav: true,
      itemsDesktop : [1199,3],
      itemsDesktopSmall : [979,3],
      stopOnHover:true,
      autoPlay:true

   });


  /* ----------------------------------------------------------- */
  /*  Main slideshow
  /* ----------------------------------------------------------- */

  $('#slider-carousel').carousel({
    pause: true,
    interval: 1000000,
  });

   
    $('#app-carousel').carousel({
        interval: 100000
    })



       /* ==============================================
    Bactstretch js
=============================================== */
      $.backstretch([
          "images/bg/bg1.jpg",
          "images/bg/bg2.jpg",
          "images/bg/bg3.jpg"
        ], {
            fade: 950,
            duration: 10000
        });  

    
 


/* ==============================================
Back To Top Button
=============================================== */  
 
  $(window).scroll(function () {
            if ($(this).scrollTop() > 50) {
                $('#back-top').fadeIn();
            } else {
                $('#back-top').fadeOut();
            }
        });
      // scroll body to 0px on click
      $('#back-top').click(function () {
          $('#back-top a').tooltip('hide');
          $('body,html').animate({
              scrollTop: 0
          }, 800);
          return false;
      });
      
      $('#back-top').tooltip('hide');

  

});