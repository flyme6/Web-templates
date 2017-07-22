$(function() {
	$(document).on('focusin', '.field, textarea', function() {
		if(this.title==this.value) {
			this.value = '';
		}
	}).on('focusout', '.field, textarea', function(){
		if(this.value=='') {
			this.value = this.title;
		}
	});
});

$(window).load(function() {
	$('.flexslider').flexslider({
		animation: "slide",
		slideshowSpeed: 5000,
		directionNav: false,
		controlNav: false,
		animationDuration: 900
	});
});