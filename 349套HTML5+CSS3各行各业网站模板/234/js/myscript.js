$(document).ready(function() {
	 var navoffeset=$("nav").offset().top;
	 $(window).scroll(function(){
	 	var scrollpos=$(window).scrollTop(); 
	 	if(scrollpos >=navoffeset){
	 		$("nav").addClass("fixed");
	 	}else{
	 		$("nav").removeClass("fixed");
	 	}
	 });
	 
});
$(document).ready(function(){
	$("nav ul li a").click(function(){
		$(this).parent().addClass("active");
		$(this).parent().siblings().removeClass("active");
	});
});
