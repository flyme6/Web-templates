function noSpam() {
    if (document.getElementById) {
		var at = "@";
	  	var links = document.getElementsByTagName('a');
	  
	  	for (var i = 0; i < links.length; i++) {
		  	var linkElem = links[i];
			
		  	if (linkElem.className == 'escape') {
		  		var mail = linkElem.firstChild; var domain = linkElem.lastChild;
		  		mail.nextSibling.firstChild.innerHTML = at;
		  		linkElem.href = "mailto:" + mail.data + at + domain.data;
		  	}
			
	  	} // End for
	  
    } // End if
}

window.addEventListener?window.addEventListener('load',noSpam,false):window.attachEvent('onload',noSpam);