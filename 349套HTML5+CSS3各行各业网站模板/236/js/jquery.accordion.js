/**
*	@name							accordionNew
*	@descripton						This Jquery plugin makes creating accordionNews pain free
*	@version						1.4
*	@requires						Jquery 1.2.6+
*
*	@author							Jan Jarfalk
*	@author-email					jan.jarfalk@unwrongest.com
*	@author-website					http://www.unwrongest.com
*
*	@licens							MIT License - http://www.opensource.org/licenses/mit-license.php
*/

(function(jQuery){
     jQuery.fn.extend({
         accordionNew: function() {       
            return this.each(function() {
            	
            	var jQueryul						= jQuery(this),
					elementDataKey			= 'accordiated',
					activeClassName			= 'active',
					activationEffect 		= 'slideToggle',
					panelSelector			= 'ul, div',
					activationEffectSpeed 	= 'fast',
					itemSelector			= 'li';
            	
				if(jQueryul.data(elementDataKey))
					return false;
													
				jQuery.each(jQueryul.find('ul, li>div'), function(){
					jQuery(this).data(elementDataKey, true);
					jQuery(this).hide();
				});
				
				jQuery.each(jQueryul.find('em.open-close'), function(){
					jQuery(this).click(function(e){
						activate(this, activationEffect);
						return void(0);
					});
					
					jQuery(this).bind('activate-node', function(){
						jQueryul.find( panelSelector ).not(jQuery(this).parents()).not(jQuery(this).siblings()).slideUp( activationEffectSpeed );
						activate(this,'slideDown');
					});
				});
				
				var active = (location.hash)?jQueryul.find('a[href=' + location.hash + ']')[0]:jQueryul.find('li.current a')[0];

				if(active){
					activate(active, false);
				}
				
				function activate(el,effect){
					
					jQuery(el).parent( itemSelector ).siblings().removeClass(activeClassName).children( panelSelector ).slideUp( activationEffectSpeed );
					
					jQuery(el).siblings( panelSelector )[(effect || activationEffect)](((effect == "show")?activationEffectSpeed:false),function(){
						
						if(jQuery(el).siblings( panelSelector ).is(':visible')){
							jQuery(el).parents( itemSelector ).not(jQueryul.parents()).addClass(activeClassName);
						} else {
							jQuery(el).parent( itemSelector ).removeClass(activeClassName);
						}
						
						if(effect == 'show'){
							jQuery(el).parents( itemSelector ).not(jQueryul.parents()).addClass(activeClassName);
						}
					
						jQuery(el).parents().show();
					
					});
					
				}
				
            });
        }
    }); 
})(jQuery);
jQuery(document).ready(function () {
	
	jQuery("ul.accordion li.parent").each(function(){
        jQuery(this).append('<em class="open-close">&nbsp;</em>');
      });
	
	jQuery('ul.accordion').accordionNew();
	
	jQuery("ul.accordion li.active").each(function(){
		jQuery(this).children().next("ul").css('display', 'block');
	});
});