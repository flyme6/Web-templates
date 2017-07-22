
// Isotop Gallery 
// ==============

var $container = $('#isotope-container');
    $container.isotope({
    itemSelector : '.isotope-item',
});
$('#filters a').click(function(){
    var selector = $(this).attr('data-filter');
    $container.isotope({ filter: selector });
    return false;
});