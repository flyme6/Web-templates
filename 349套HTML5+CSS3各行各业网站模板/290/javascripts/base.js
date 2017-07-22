$(document).ready(function() {
	
	// elastislide
	$( '#gallery_slider' ).elastislide();
	
	$( '#venue_slider' ).elastislide({
		minItems : 1
	});
	
	$( '#airport_slider' ).elastislide({
		minItems : 1
	});
	
	$( '#registry_slider' ).elastislide({
		minItems : 2
	});
		
	// Tooltips
	$('a[rel=tipsy]').tipsy({fade: true, gravity: 's', offset: 2});
	
	$("label").inFieldLabels({ fadeOpacity: 0.4 });
	
	// Navigation links
	$("header nav ul").onePageNav({
			changeHash: false,
			filter: 'a[href^=#]',
			scrollOffset: 100,
			scrollThreshold: 0.1,
			begin: function() {
	        //Hack so you can click other menu items after the initial click
	        $('body').append('<div id="device-dummy" style="height: 1px;"></div>');
	    },
	    end: function() {
	        $('#device-dummy').remove();
	    }
	});
	
	// Fancybox 
	$("a.fancybox").fancybox({
		"padding":					0,
		"speedIn":      		500,
		"speedOut": 				500,
		"hideOnContentClick":	"true",
		"overlayShow":        true
	});

	// Testimonials
	function showBios(elem) {
		var bio = $("a", elem);

		$(elem).parent().find("li").removeClass("current");		
		var bio_content = "";
		if(bio.data("bio")) {
			bio_content += '<p>'+bio.data("bio")+'</p>';
		}
		$(elem).parent().next("div.bio").html(bio_content);
		$(elem).addClass("current")
	}
	
	$("ul.people li.current").each(function() {
		showBios($(this));
	});
	
	$("ul.people li").hover(function() {
		showBios($(this));
	});

	// Tabs
		$(".tabs").find(".pane:first").show().end().find("ul.nav li:first").addClass("current");
		$(".tabs ul.nav li a").click(function() {
			var tab_container = $(this).parent().parent().parent();
			$(this).parent().parent().find("li").removeClass("current");
			$(this).parent().addClass("current");
			$(".pane", tab_container).hide();
			$("#"+$(this).attr("class")+".pane", tab_container).show();
		});

		// Toggle lists
		$(".toggle_list ul li .title").click(function() {
			var content_container = $(this).parent().find(".content");
			if(content_container.is(":visible")) {
				content_container.slideUp("fast");
				$(this).find("a.toggle_link").text($(this).find("a.toggle_link").data("open_text"));
			} else {
				content_container.slideDown("fast");
				$(this).find("a.toggle_link").text($(this).find("a.toggle_link").data("close_text"));
			}
		});

		$(".toggle_list ul li .title").each(function() {
			$(this).find("a.toggle_link").text($(this).find("a.toggle_link").data("open_text"));
			if($(this).parent().hasClass("opened")) {
				$(this).parent().find(".content").show();
			}
		});

	// Remove margin from last page
	$("section#pages .page:last").addClass("last");

	// Contact form
	$("form#contact_form").submit(function() {
  	var this_form = $(this);
  	$.ajax({
  		type: 'post',
  		data: this_form.serialize(),
  		url: 'send_email.php',
  		success: function(res) {
  			if(res == "true") {
  				this_form.fadeOut("fast");
					$(".success").fadeIn("fast");
					$(".validation").fadeOut("fast");
  			} else {
  				$(".validation").fadeIn("fast");
  				this_form.find(".text").removeClass("error");
  				$.each(res.split(","), function() {
  					this_form.find("#"+this).addClass("error");
  				});
  			}
  		}
  	});
  });

});