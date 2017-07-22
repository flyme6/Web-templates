// ------- PRELOADER -------//
$(window).load(function(){
    $('.preloader').fadeOut("slow"); // set duration in brackets    
});

/* HTML document is loaded. DOM is ready. 
-------------------------------------------*/
$(function(){

   // --------- HIDE MOBILE MENU AFTER CLIKING ON A LINK ------- //
    $('.navbar-collapse a').click(function(){
        $(".navbar-collapse").collapse('hide');
    });

  // --------- PORTFOLIO IMAGE ----- //
  $('#portfolio a').nivoLightbox({
        effect: 'fadeScale',
    });

  // ------- WOW ANIMATED ------ //
  wow = new WOW(
  {
    mobile: false
  });
  wow.init();

  // ------- GOOGLE MAP ----- //
  loadGoogleMap();

  // ------- JQUERY PARALLAX ---- //
  function initParallax() {
    $('#home').parallax("100%", 0.3);
    $('#team').parallax("100%", 0.3);
    $('#contact').parallax("100%", 0.1);

  }
  initParallax();

});

