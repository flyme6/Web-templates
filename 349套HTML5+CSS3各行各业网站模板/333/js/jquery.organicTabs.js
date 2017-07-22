/*
 * Copyright (c) 2010 Olivier Lance
 * Free to use and abuse under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */

(function($) {

    $.organicTabs = function(el, options) {
    
        var base = this;
        base.$el = $(el);
                
        base.init = function() {
        
            base.options = $.extend({},$.organicTabs.defaultOptions, options);
            
            base.$nav = base.$el.find(base.options.headingsSelector);
            base.$nav.delegate("li > a", "click", function() {
            
                // Figure out current list via CSS class
                var curList = base.$el.find("a.current").attr("href").substring(1),
                
                // List moving to
                    $newList = $(this),
                    
                // Figure out ID of new list
                    listID = $newList.attr("href").substring(1),
                
                // Set outer wrapper height to (static) height of current inner list
                    $allListWrap = base.$el.find(base.options.contentsSelector),
                    curListHeight = $allListWrap.height();
                $allListWrap.height(curListHeight);
                                        
                if ((curList.length > 0) && (listID.length > 0) && (listID != curList) && ( base.$el.find(":animated").length === 0)) {
                                            
                    // Fade out current list
                    base.$el.find("#"+curList).fadeOut(base.options.fadingSpeed, base.options.fadingEasing, function() {
                        
                        // Fade in new list on callback
                        base.$el.find("#"+listID).fadeIn(base.options.fadingSpeed, base.options.fadingEasing);
                        
                        // Adjust outer wrapper to fit new list snuggly
                        var newHeight = base.$el.find("#"+listID).height();
                        $allListWrap.animate({
                            height: newHeight
                        }, base.options.sizingSpeed, base.options.sizingEasing);

						if(base.options.updateAlong !== null) {
							$(base.options.updateAlong).each(function(index, el) {
								$(el).animate({
									height: $(el).height() - curListHeight + newHeight
								}, base.options.sizingSpeed,base.options.sizingEasing);
							});
						}

                        // Remove highlighting - Add to just-clicked tab
                        base.$el.find(base.options.headingsSelector + " li a").removeClass("current");
                        $newList.addClass("current");
                            
                    });
                    
                }   
                
                // Don't behave like a regular link
                // Stop propagation and bubbling
                return false;
            });
            
        };
        base.init();
    };
    
    $.organicTabs.defaultOptions = {
        headingsSelector: ".nav",        // jQuery selector string to find headings list(s) inside the target element
        contentsSelector: ".list-wrap",  // jQuery selector string to find contents container(s) inside the target element

        updateAlong: null,	      			 // Provide elements to be updated along with the regular wrapper. It's useful in
				                    						 // nesting cases when you want a parent element to be resized correctly
      
        fadingSpeed: 300,                // Speed of fading animations
        fadingEasing: "swing",           // Easing used for fading animations
        
        sizingSpeed: 300,                // Speed of resizing animations
        sizingEasing: "swing"            // Easing used for resizing animations
    };
    
    $.fn.organicTabs = function(options) {
        return this.each(function() {
            (new $.organicTabs(this, options));
        });
    };
    
})(jQuery);