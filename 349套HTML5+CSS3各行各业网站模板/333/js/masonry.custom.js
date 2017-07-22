$(window).load(function(){
    
    var $container = $('.masonry-container');
    
    $container.masonry({
      itemSelector: '.box',
      isAnimated: true
    });
    
    $('a.filter').click(function(event){
      event.preventDefault();
      
		var filter = $(this).attr('href');
		filter = filter.replace('#','');
		
		if(filter == 'all') {
			
			$container.find('.masonry')
				.addClass('box')
				.removeClass('last')
				.each(function(index,element){
					index = index+1;
					if(index%3 == 0) { $(this).addClass('last'); }
				})
				.fadeIn(100,function(){
					$container.masonry('reload');
				});
			
			
		}else{
		
			$container
				.find('.masonry.'+filter)
				.removeClass('last')
				.each(function(index,element){
					index = index+1;
					if(index%3 == 0) { $(this).addClass('last'); }
				})
				.addClass('box')
				.fadeIn(100);
			
			$container
				.find('.masonry:not(.'+filter+')')
				.removeClass('box')
				.removeClass('last')
				.fadeOut(100,function(){
					$container.masonry( 'reload' );
				});
			
			
		}
    });
  
  });