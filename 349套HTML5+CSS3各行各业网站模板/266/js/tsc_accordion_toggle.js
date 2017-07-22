(function($) {

/* ------------------------------------------------------------------------
Fire up Functions on Page Load
* ------------------------------------------------------------------------- */
jQuery(document).ready(function () {
	doAccordion();
});

/* ------------------------------------------------------------------------
Accordions
* ------------------------------------------------------------------------- */
function doAccordion(){
	var accordions = jQuery('.tsc_accordion2');
	if(accordions.length < 1){
		return;
	}
	accordions.each(function(){
		var self = jQuery(this);
		var handlers = self.children('dt');
		handlers.click(function(){
			var self = jQuery(this);
			self.children('dt.current').removeClass('current').next().slideUp();
			self.toggleClass('current');
			self.next('dd').slideToggle();
		});
	});
}

}(jQuery));






// <![CDATA[
$(function() {

  /* show or hide gadget */
  $('.tsc_toggle').addClass('tsc_hide');
  $('.tsc_toggle.tsc_show').removeClass('tsc_hide');
  $('.tsc_toggle.tsc_show').children('.tsc_toggle_box').css({'display':'block'});
  $('a.tsc_toggle_link').click(function(){
	$(this).parents('.tsc_toggle').children('.tsc_toggle_box').slideToggle('fast');
    if ($(this).parents('.tsc_toggle').hasClass('tsc_hide'))
	  { $(this).parents('.tsc_toggle').removeClass('tsc_hide'); $(this).parents('.tsc_toggle').addClass('tsc_show');}
	else
	  { $(this).parents('.tsc_toggle').addClass('tsc_hide'); $(this).parents('.tsc_toggle').removeClass('tsc_show');}
	return false;
  });

  /* accordion gadget */
  
  $('.tsc_acc_box').addClass('tsc_hide');
  $('.tsc_acc_box.tsc_show').removeClass('tsc_hide');
  $('.tsc_acc_box.tsc_show').children('.tsc_toggle_box').css({'display':'block'});
  $('a.tsc_acc_link').click(function(){
	if ($(this).parents('.tsc_acc_box').hasClass('tsc_show')) { return false;}
	$(this).parents('.tsc_acc').children('.tsc_show').children('.tsc_toggle_box').slideToggle('fast');
	$(this).parents('.tsc_acc').children('.tsc_show').addClass('tsc_hide');
	$(this).parents('.tsc_acc').children('.tsc_show').removeClass('tsc_show');
	$(this).parents('.tsc_acc_box').children('.tsc_toggle_box').slideToggle('fast');
	$(this).parents('.tsc_acc_box').addClass('tsc_show');
	$(this).parents('.tsc_acc_box').removeClass('tsc_hide');
	return false;
  });

});	


$(document).ready(function(){
	$('.toggleCollapse').on("click",function(){
		var selector="."+$(this).attr("rel");
		if($(this).text()=="expand all"){
			$(selector).each(function(){			
				if($(this).hasClass("tsc_hide"))
					$(this).find("a.tsc_toggle_link").click();
			});				
			$(this).text("shrink all")
		}
		else{
			$(selector).each(function(){
				if($(this).hasClass("tsc_show"))
					$(this).find("a.tsc_toggle_link").click();					
			});		
			$(this).text("expand all")
		}	
	});
	
});



// ]]>


