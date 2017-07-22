(function ( $ ) {

	$.fn.progressTracker = function( options ) {

		var settings = $.extend({
			//default values
			linking: true,
			tooltip: "constant",
			positiveTolerance: 0,
			negativeTolerance: 0,
			displayWhenActive: true,
			disableBelow: 0,
			tracking: "tracker"
		}, options);

		//Create progress tracker element and list
		$('body').append('<div class="progress-tracker"><ul></ul></div>');

		//Create mark-up based on marked sections
		$('.pt-section').each(function(index) {
			var $this = $(this),
				sectionId = $this.attr('id'),
				sectionName = $this.data('name'),
				itemLink = "",
				itemDescription = "";

			if(settings.linking) {
				itemLink = '<a class="pt-circle" href="#' + sectionId + '"></a>';
			}

			if(settings.tooltip) {
				itemDescription = "<span class='pt-description'><span>" + sectionName + "</span></span>";
			}

			$('.progress-tracker ul').append(
				'<li class="section-' + sectionId + '">' + itemLink + itemDescription + '</li>'
    		);

    		//Offset top margin against height of tracker now the elements are in there
    		$('.progress-tracker').css({'margin-top':('-' + $('.progress-tracker').height()/2) + 'px'});
		});

		//Set up scrollTo linking if linking is true
		if(settings.linking) {
			$('.progress-tracker ul li a.pt-circle').on('click', function(e) {
				e.preventDefault();
				var targetElem = $(this).attr('href');
				$('html, body').animate({
					//Addition of 1 pixel to offset against Chrome's interpretation of scrollTop
			        scrollTop: $(targetElem).offset().top + 1
			    }, 1000);
			});
		}

		//Set up hover visibility if tooltips are enabled
		if(settings.tooltip == "hover") {
			$('.progress-tracker ul li').hover(function() {
				$(this).find('.pt-description').show();
			}, function() {
				$(this).find('.pt-description').hide();
			});
		} else if(settings.tooltip == "constant") {
			$('.progress-tracker').addClass('constant');
		}

		function activeSectionCheck () {

			if(settings.tracking == "viewport") {
				var scroll = $(window).scrollTop();
			} else {
				var scroll = $('.progress-tracker').offset().top;
			}

			$('.pt-section').each(function(index) {

				var $this = $(this),
					sectionTop = $this.offset().top,
					sectionBottom = sectionTop + $this.outerHeight(),
					sectionTitle = $this.attr('id');

				//Check if positiveTolerance is an integer and, if so, add to section Top & Bottom
				if($.isNumeric(settings.positiveTolerance)) {
					sectionTop += settings.positiveTolerance;
					sectionBottom += settings.positiveTolerance;
				}

				//Check if negativeTolerance is an integer and, if so, add to section Top & Bottom
				if($.isNumeric(settings.negativeTolerance)) {
					sectionTop -= settings.negativeTolerance;
					sectionBottom -= settings.negativeTolerance;
				}

				if(scroll >= sectionTop && scroll <= sectionBottom) {
					$('.progress-tracker ul li').removeClass('active');
					$('.progress-tracker ul li.section-' + sectionTitle).addClass('active');
				}

			});
		}

		function activeTrackerCheck () {
			if(!settings.displayWhenActive) {
				return false;
			}

			var	progressTracker = $('.progress-tracker'),
				firstTop = $('.pt-section:first').offset().top,
				lastBottom = $('.pt-section:last').offset().top + ($('.pt-section:last').outerHeight());
			if(progressTracker.offset().top >= firstTop && progressTracker.offset().top <= lastBottom) {
				progressTracker.removeClass('hide');
			} else {
				progressTracker.addClass('hide');
			}
		}

		$( window ).scroll(function() {
			activeSectionCheck();
			activeTrackerCheck();
		});

		$(document).ready(function() {
			activeSectionCheck();
			activeTrackerCheck();
		});
		
		//Hide below a certain width if specified
		if(settings.disableBelow > 0 && $.isNumeric(settings.disableBelow)) {
			var resizeTimer;
    		function resizeFunction() {
	   			if($(window).width() <= settings.disableBelow) {
	   				$('.progress-tracker').hide();
	   			} else {
	   				$('.progress-tracker').show();
	   			}
	   		}

			$(window).resize(function() {
		        clearTimeout(resizeTimer);
		        resizeTimer = setTimeout(resizeFunction, 150);
		    });
		    resizeFunction();
		}

	};

}( jQuery ));