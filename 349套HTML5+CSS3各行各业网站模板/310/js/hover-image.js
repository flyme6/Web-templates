$(function(){
	// lightbox image
	$(".lightbox-image").append("<span></span>");
	
	$(".lightbox-image").hover(function(){
		$(this).find("img").stop().animate({opacity:0.5}, "normal")
	}, function(){
		$(this).find("img").stop().animate({opacity:1}, "normal")
	});
});