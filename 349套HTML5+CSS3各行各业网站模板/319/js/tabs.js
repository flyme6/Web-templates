/* ------------------------------------------------------------------------
	Do it when you're ready dawg!
------------------------------------------------------------------------- */

	

	tabs = {
  init : function(){
   $('.tabs').each(function(){

    var th=$(this),
     tContent=$('.tab-content',th),
     navA=$('ul.nav a',th)

    tContent.not(tContent.eq(0)).hide()

    navA.click(function(){
     var th=$(this),
      tmp=th.attr('href')
     tContent.not($(tmp.slice(tmp.indexOf('#'))).fadeIn(600)).hide()
	 $(th).parent().addClass('selected').siblings().removeClass('selected');
     return false;
    });
   });

  }
 }
 tabs2 = {
  init : function(){
   $('.tabs2').each(function(){

    var th=$(this),
     tContent=$('.tab-content',th),
     navA=$('ul.nav a',th)

    tContent.not(tContent.eq(0)).hide()

    navA.click(function(){
     var th=$(this),
      tmp=th.attr('href')
     tContent.not($(tmp.slice(tmp.indexOf('#'))).fadeIn(600)).hide()
	 $(th).parent().addClass('selected').siblings().removeClass('selected');
     return false;
    });
   });

  }
 }