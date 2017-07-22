/* jQuery Session vars v.0.4
* by Jay Salvat
* http://www.jaysalvat.com
* -----------------------------------------------
* Inspired by an idea from Mario Heiderich
* http://code.google.com/p/quipt/
* -----------------------------------------------
* Requires jquery.json.js by DeadWisdom
* http://code.google.com/p/jquery-json/
* -----------------------------------------------
* CHANGELOG
* 0.4 -- 13-AUG-08
* sessionKill() added
* 0.3 -- 11-JUL-08
* Security improvements
* Calling manually sessionStart and sessionStop is not required anymore
* Window.name is keept between pages
* 0.2 -- 10-JUL-08
* Now works with functions, objects and arrays
* 0.1 -- 08-JUL-08
* First draft
* -----------------------------------------------
* USAGE
* - To Store
*       $.session("myVar, "value");
* 
* - To Read
*       alert( $.session("myVar") );     
*/
(function($) {
        var sessionData         = {};
        var windowName          = '';
        var domain                      = location.href.match(/\w+:\/\/[^\/]+/)[0];
        var referrer            = (document.referrer) ? document.referrer.match(/\w+:\/\/[^\/]+/)[0] : '';
        var token                       = '##JQS:'+domain+'##';
        
        if(referrer !== domain) {
                window.name = window.name.replace(/#JQS:(.*)/, '');
        }
                
        function loadData() {
                stored = window.name.split(token);
                windowName = window.name = stored[0];
                if (data = stored[1]) { 
                        $.each(data.split(';'), function(i, data) {
                                                parts           = data.split('=');
                                                varName         = parts[0];
                                                varValue        = unescape(parts[1]);
                                                sessionData[varName] = varValue;
                        });
                }
        }
        
        function saveData() {
                var dataToStore = windowName+token;
                $.each(sessionData, function(varName, varValue) {               
                                if (varName && varValue) {
                                        dataToStore += ( varName + '=' + escape( varValue ) + ';' );
                                }
                });
                window.name = dataToStore;
        }
        
        $.session = function(name, value) {
                if (value) {
                        if ($.isFunction(value)) {
                                value = value();
                        }
                        if ( typeof $.toJSON == 'function' ) {
                                sessionData[name] = $.toJSON(value);
                        } else {
                                sessionData[name] = value;
                        }
                } else {
                        if ( typeof $.evalJSON == 'function' ) {
                                return $.evalJSON(sessionData[name]);
                        } else {
                                return sessionData[name];
                        }
                }
        }
        
        $.sessionStop = function() {
                saveData();
        }               
        
        $.sessionStart = function() {
                loadData();
        }

        $.sessionKill = function() {
                sessionData = {};
                window.name = windowName;
        }

        $.sessionStart();
        window.onunload = function() { $.sessionStop(); };
        
})(jQuery);