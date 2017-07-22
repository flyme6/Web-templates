(function(window){

  var nav = document.querySelector("nav.cmn-tile-nav"),
      nav_toggle = document.querySelector("a.nav-toggle");

  nav_toggle.addEventListener("click", function(e){
    e.preventDefault();
    classie.toggle(nav, "open");
  });

})(window);