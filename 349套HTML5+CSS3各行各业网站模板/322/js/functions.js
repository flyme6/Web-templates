$(function() {
	$('#navigation ul li:last').addClass('last')
});

$(window).load(function() {
	$('.flexslider').flexslider({
		animation: "slide",
		controlsContainer: ".slider",
		slideshowSpeed: 5000,
		directionNav: false,
		controlNav: true,
		animationDuration: 900
	});
});