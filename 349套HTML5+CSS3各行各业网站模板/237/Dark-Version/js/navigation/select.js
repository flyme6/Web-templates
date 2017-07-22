// DOM ready
	 $(function() {
	   
      // Create the dropdown base
      $("<select />").appendTo("#navigation");
      
      // Create default option "Go to..."
      $("<option />", {
         "selected": "selected",
         "value"   : "",
         "text"    : "MENU"
      }).appendTo("#navigation select");
      
      // Populate dropdown with menu items
      $("#navigation a").each(function() {
       var el = $(this);
       $("<option />", {
           "value"   : el.attr("href"),
           "text"    : el.text()
       }).appendTo("#navigation select");
	 
      });
      
	   // To make dropdown actually work
	   // To make more unobtrusive: http://css-tricks.com/4064-unobtrusive-page-changer/
      $("#navigation select").change(function() {
        window.location = $(this).find("option:selected").val();
	  
	  
      });
	 
	 });