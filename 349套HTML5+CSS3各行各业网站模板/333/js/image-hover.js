jQuery(document).ready(function($){
	$('.proj-img').hover(function() {
		$(this).find('i').stop().animate({
			opacity: 0.3
		}, 'fast');
		$(this).find('a').stop().animate({
			"top": "50%"
		});
	}, function() {
		$(this).find('i').stop().animate({
			opacity: 0
		}, 'fast');
		$(this).find('a').stop().animate({
			"top": "-30px"
		});
	});

});