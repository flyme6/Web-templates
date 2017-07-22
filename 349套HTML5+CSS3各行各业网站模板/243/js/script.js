$(function(){
	$(".nav-button").click(function () {
		$(".nav-button,.menu").toggleClass("open");
		});    
		$(".color_wrap .btn_skin").click(function () {
		$(".color_wrap").toggleClass("color_wrap_open");
	});    
})

//===========================Session
function get_theme(name)
{
	$.session("theme_name", name);
	$("head link:eq(3)").attr("href","css/"+$.session("theme_name")+".css");
}


$(function(){
	if($.session("theme_name") == null)
	{
		$.session("theme_name", "style");
	}
})
$(function(){
	get_theme($.session("theme_name"));
	
	var viewportmeta = document.querySelector && document.querySelector('meta[name="viewport"]'),
    ua = navigator.userAgent,
 
    gestureStart = function () {
        viewportmeta.content = "width=device-width, minimum-scale=0.25, maximum-scale=1.6";
    },
 
    scaleFix = function () {
      if (viewportmeta && /iPhone|iPad/.test(ua) && !/Opera Mini/.test(ua)) {
        viewportmeta.content = "width=device-width, minimum-scale=1.0, maximum-scale=1.0";
        document.addEventListener("gesturestart", gestureStart, false);
      }
    };
scaleFix();
});