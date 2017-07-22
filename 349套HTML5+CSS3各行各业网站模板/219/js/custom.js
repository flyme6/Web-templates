jQuery(document).ready(function() {



    // Cache selectors
    var lastId,
        topMenu = $(".navbar-nav"),
        topMenuHeight = topMenu.outerHeight()+15,
        // All list items
        menuItems = topMenu.find("a"),
        // Anchors corresponding to menu items
        scrollItems = menuItems.map(function(){
          var item = $($(this).attr("href"));
          if (item.length) { return item; }
        });

    // Bind click handler to menu items
    // so we can get a fancy scroll animation
    menuItems.click(function(e){
      var href = $(this).attr("href"),
          offsetTop = href === "#" ? 0 : $(href).offset().top-topMenuHeight+1;
      $('html, body').stop().animate({ 
          scrollTop: offsetTop
      }, 300);
      e.preventDefault();
    });

    // Bind to scroll
    $(window).scroll(function(){
       // Get container scroll position
       var fromTop = $(this).scrollTop()+topMenuHeight;
       
       // Get id of current scroll item
       var cur = scrollItems.map(function(){
         if ($(this).offset().top < fromTop)
           return this;
       });
       // Get the id of the current element
       cur = cur[cur.length-1];
       var id = cur && cur.length ? cur[0].id : "";
       
       if (lastId !== id) {
           lastId = id;
           // Set/remove active class
           menuItems
             .parent().removeClass("active")
             .end().filter("[href=#"+id+"]").parent().addClass("active");
       }                   
    });


    
	// Back to top smooth
	$('.back-to-top, .navbar-brand').click(function() {
        $('html, body').animate({ scrollTop: 0 }, 'slow');
        return false;
    });


	// Testimonial (Clients words)
	$('.client-slide').bxSlider({
		controls : false,
	});



	// Header animation
	$(window).scroll(function(){
        $('.navbar-fixed-top').toggleClass('scrolled', $(this).scrollTop() > 1);
    });



    // Counte for Fun Facts
    if (jQuery(window).width() > 760) {
        jQuery('.counter-item').waypoint(function(){                           
            var set_count = $(this).find('.start-count').attr('data-count');
            $(this).find('.end-count').stop().animate({width: set_count}, {duration: 3000, step: function(now) {
                    var data = Math.floor(now);
                    $(this).parents('.counter-inner').find('.start-count').html(data);
                }
            });
            $(this).find('.start-count');
        },{offset: 'bottom-in-view', triggerOnce: true});
    } else {
        jQuery('.counter-item').each(function(){                           
            var set_count = $(this).find('.start-count').attr('data-count');
            $(this).find('.end-count').animate({width: set_count}, {duration: 3000, step: function(now) {
                    var data = Math.floor(now);
                    $(this).parents('.counter-inner').find('.start-count').html(data);
                }
            });
            $(this).find('.start-count');
        }); 
    }

});
  