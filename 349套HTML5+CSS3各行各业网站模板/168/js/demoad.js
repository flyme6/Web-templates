var filename='http://tympanus.net/codrops/adpacks/demoadpacks.css?' + new Date().getTime();		
var fileref=document.createElement("link");
fileref.setAttribute("rel", "stylesheet");
fileref.setAttribute("type", "text/css");
fileref.setAttribute("href", filename);
document.getElementsByTagName("head")[0].appendChild(fileref);

var demoad = document.createElement('div');
demoad.id = 'cdawrap';
demoad.innerHTML = '<span id="cda-remove"></span>';
document.getElementsByTagName('body')[0].appendChild(demoad);

document.getElementById('cda-remove').addEventListener('click',function(e){
	demoad.style.display = 'none';
	e.preventDefault();
});

var bsa = document.createElement('script');
bsa.type = 'text/javascript';
bsa.async = true;
bsa.id = '_adpacks_js';
bsa.src = '//cdn.adpacks.com/adpacks.js?zoneid=1386&serve=C6SI42Y&placement=tympanusnet';
demoad.appendChild(bsa);


