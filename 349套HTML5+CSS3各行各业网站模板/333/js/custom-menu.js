$(document).ready(function(){

	$(".topnav li").addClass("nav");
	$("ul.topnav li a").hover(function() { 
		$(this).parent().find(".subnav").slideDown('fast').show(); 
	}).hover(function() { 
			$(this).addClass("active"); 
		}, function(){	//On Hover Out
			$(this).removeClass("subhover");
	});
	
$(".subnav div").hover(function() {
	}, function(){
		$(this).parent(".subnav").slideUp("normal");
});
	
$("ul.topnav li .subnav").parents("li").removeClass("nav");
	
	$("ul.topnav li").hover(function() { 
	
		}, function(){
			$(".subnav").slideUp("normal");
	});
	
	$("ul.topnav li.nav").hover(function() {
		$(".subnav").slideUp("normal"); 
	
		}, function(){
			
	});


});
