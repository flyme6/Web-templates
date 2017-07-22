(function($) {
	/*
		jquery.twitter.js v1.5
		Last updated: 08 July 2009

		Created by Damien du Toit
		http://coda.co.za/blog/2008/10/26/jquery-plugin-for-twitter

		Licensed under a Creative Commons Attribution-Non-Commercial 3.0 Unported License
		http://creativecommons.org/licenses/by-nc/3.0/
	*/

	$.fn.getTwitter = function(options) {

		$.fn.getTwitter.defaults = {
			userName: null,
			numTweets: 5,
			loaderText: "Loading tweets...",
			slideIn: true,
			slideDuration: 750,
			showHeading: true,
			headingText: "Latest Tweets",
			showProfileLink: true,
			showTimestamp: true
		};

		var o = $.extend({}, $.fn.getTwitter.defaults, options);

		return this.each(function() {
			var c = $(this);

			// hide container element, remove alternative content, and add class
			c.hide().empty().addClass("twitted");

			// add heading to container element
			if (o.showHeading) {
				c.append("<h2>"+o.headingText+"</h2>");
			}

			// add twitter list to container element
			var twitterListHTML = "<ul id=\"twitter_update_list\"><li></li></ul>";
			c.append(twitterListHTML);

			var tl = $("#twitter_update_list");

			// hide twitter list
			tl.hide();

			// add preLoader to container element
			var preLoaderHTML = $("<p class=\"preLoader\">"+o.loaderText+"</p>");
			c.append(preLoaderHTML);

			// add Twitter profile link to container element
			if (o.showProfileLink) {
				var profileLinkHTML = "<p class=\"profileLink\"><a href=\"http://twitter.com/"+o.userName+"\">http://twitter.com/"+o.userName+"</a></p>";
				c.append(profileLinkHTML);
			}

			// show container element
			c.show();

			$.getScript("../../twitter.com/javascripts/blogger.js");
			$.getScript("http://twitter.com/statuses/user_timeline/"+o.userName+".json?callback=twitterCallback2&count="+o.numTweets, function() {
				// remove preLoader from container element
				$(preLoaderHTML).remove();

				// remove timestamp and move to title of list item
				if (!o.showTimestamp) {
					tl.find("li").each(function() {
						var timestampHTML = $(this).children("a");
						var timestamp = timestampHTML.html();
						timestampHTML.remove();
						$(this).attr("title", timestamp);
					});
				}

				// show twitter list
				if (o.slideIn) {
					// a fix for the jQuery slide effect
					// Hat-tip: http://blog.pengoworks.com/index.cfm/2009/4/21/Fixing-jQuerys-slideDown-effect-ie-Jumpy-Animation
					var tlHeight = tl.data("originalHeight");

					// get the original height
					if (!tlHeight) {
						tlHeight = tl.show().height();
						tl.data("originalHeight", tlHeight);
						tl.hide().css({height: 0});
					}

					tl.show().animate({height: tlHeight}, o.slideDuration);
				}
				else {
					tl.show();
				}

				// add unique class to first list item
				tl.find("li:first").addClass("firstTweet");

				// add unique class to last list item
				tl.find("li:last").addClass("lastTweet");
			});
		});
	};
})(jQuery);