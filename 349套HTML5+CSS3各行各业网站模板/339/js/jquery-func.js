$( document ).ready( function(){
	
	var IS_IE_6 = $.browser.msie && $.browser.version < 7;
	
	$('.buttons a').hover(
		function(){
			$(this).find('span')
				.css({'display' : 'block', 'opacity':0, 'left': '-10px' })
				.animate({ 'left':0, 'opacity': 1 }, 250)
		},
		function(){
			$(this).find('span').fadeOut('fast');
		}
	);
	
	$('.buttons a').click(function(){
		var to = $(this).attr('href');
		
		$.scrollTo(to, 1200);
		
		return false;
	});
	
	
	
	/** Animation **/
	for( var i in items) {
		$(items[i]).hide();
	}
	//_animate(0, 700);
	
	
	$('.island').fadeIn( 'slow', function(){ 
		$('.ships').fadeIn( function(){
			$('.about-link, .portfolio-link, .contact-link').fadeIn();
			
			if(IS_IE_6) {
				$('.dir').show();
			}else {
				$('.dir')
					.css({'display' : 'block', 'opacity':0, 'left': '800px' })
					.animate({ 'left':540, 'opacity': 1 }, 800, function(){
						$('.dir').show();
					});	
			}
		});
	});
	
	
	$('.projects').jcarousel({ scroll: 1, wrap: 'both' });
	
});

var items = ['.island', '.ships', '.dir', '.about-link', '.portfolio-link', '.contact-link'];

