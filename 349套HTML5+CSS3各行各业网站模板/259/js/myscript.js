/*----- this my first code for Jqurey ------*/
/*-----varible-decratrion ------*/
$(document).ready(function(){
	$(".top-links li a").click(function(){
		$(this).parent().addClass("active");
		$(this).parent().siblings().removeClass("active");
	});
});	
