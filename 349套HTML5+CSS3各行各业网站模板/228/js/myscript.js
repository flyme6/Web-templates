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
