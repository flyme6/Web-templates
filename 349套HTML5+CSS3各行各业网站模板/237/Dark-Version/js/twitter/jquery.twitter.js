(function($) {
	/*
		jquery.twitter.js v1.6
		Last updated: 16 October 2012

		Created by Damien du Toit
		http://coda.co.za/content/projects/jquery.twitter/

		Licensed under a Creative Commons Attribution-Non-Commercial 3.0 Unported License
		http://creativecommons.org/licenses/by-nc/3.0/
	*/

	$.fn.getTwitter = function(options) {

		$.fn.getTwitter.defaults = {
			userName: null,
			numTweets: 1,
			/*loaderText: "Loading tweets...",*/
			slideIn: true,
			slideDuration: 750,
			showHeading: true,
			/*headingText: "Latest Tweets",*/
			showProfileLink: true,
			showTimestamp: true,
			includeRetweets: false,
			excludeReplies: true
		};

		var o = $.extend({}, $.fn.getTwitter.defaults, options);

		return this.each(function() {
			var c = $(this);

			// hide container element, remove alternative content, and add class
			c.hide().empty().addClass("twitted");

			// add heading to container element
			/*if (o.showHeading) {
				c.append("<h2>"+o.headingText+"</h2>");
			}*/

			// add twitter list to container element
			var twitterListHTML = "<ul id=\"twitter_update_list\"></ul>";
			c.append(twitterListHTML);

			var tl = $("#twitter_update_list");

			// hide twitter list
			tl.hide();

			// add preLoader to container element
			var preLoaderHTML = $("<p class=\"preLoader\"></p>");
			c.append(preLoaderHTML);

			// add Twitter profile link to container element
			/*if (o.showProfileLink) {
				var profileLinkHTML = "<p class=\"profileLink\"><a href=\"https://twitter.com/"+o.userName+"\">https://twitter.com/"+o.userName+"</a></p>";
				c.append(profileLinkHTML);
			}*/

			// show container element
			c.show();

			// request (o.numTweets + 20) to avoid not having enough tweets if includeRetweets = false and/or excludeReplies = true
			window.jsonTwitterFeed = "https://api.twitter.com/1/statuses/user_timeline.json?include_rts="+o.includeRetweets+"&excludeReplies="+o.excludeReplies+"&screen_name="+o.userName+"&count="+(o.numTweets + 20);

			$.ajax({
				url: jsonTwitterFeed,
				data: {},
				dataType: "jsonp",
				callbackParameter: "callback",
				timeout: 50000,
				success: function(data) {
					window.count = 0;

					$.each(data, function(key, val) {
						var tweetHTML = "<li><h3>" + replaceURLWithHTMLLinks(val.text) + "";

						if (o.showTimestamp) tweetHTML += " <br><a href=\"https://twitter.com/" + o.userName + "/statuses/" + val.id_str + "\">" + relative_time(val.created_at) + "</a>";
					
						tweetHTML += "</h3></li>";

						$("#twitter_update_list").append(tweetHTML);

						count++;

						if (count == o.numTweets) {
							// remove preLoader from container element
							$(preLoaderHTML).remove();

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

							return false;
						}
					});
				},
				error: function(XHR, textStatus, errorThrown) {
					//alert("Error: " + textStatus);
					//alert("Error: " + errorThrown);
				}
			});
		});

		function replaceURLWithHTMLLinks(text) {
			var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
			return text.replace(exp, "<br><a href=\"$1\">$1</a>");
		}

		// sourced from https://twitter.com/javascripts/blogger.js
		function relative_time(time_value) {
			var values = time_value.split(" ");
			time_value = values[1] + " " + values[2] + ", " + values[5] + " " + values[3];
			var parsed_date = Date.parse(time_value);
			var relative_to = (arguments.length > 1) ? arguments[1] : new Date();
			var delta = parseInt((relative_to.getTime() - parsed_date) / 1000);
			delta = delta + (relative_to.getTimezoneOffset() * 60);
			
			if (delta < 60) {
				return "less than a minute ago";
			}
			else if (delta < 120) {
				return "about a minute ago";
			}
			else if (delta < (60*60)) {
				return (parseInt(delta / 60)).toString() + " minutes ago";
			}
			else if (delta < (120*60)) {
				return "about an hour ago";
			}
			else if (delta < (24*60*60)) {
				return "about " + (parseInt(delta / 3600)).toString() + " hours ago";
			}
			else if (delta < (48*60*60)) {
				return "1 day ago";
			}
			else {
				return (parseInt(delta / 86400)).toString() + " days ago";
			}
		}
	};
})(jQuery);