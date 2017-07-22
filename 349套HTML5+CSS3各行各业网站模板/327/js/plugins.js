/*
 * jQuery FlexSlider v2.2.0
 * Copyright 2012 WooThemes
 * Contributing Author: Tyler Smith
 */
;
(function ($) {

  //FlexSlider: Object Instance
  $.flexslider = function(el, options) {
    var slider = $(el);

    // making variables public
    slider.vars = $.extend({}, $.flexslider.defaults, options);

    var namespace = slider.vars.namespace,
        msGesture = window.navigator && window.navigator.msPointerEnabled && window.MSGesture,
        touch = (( "ontouchstart" in window ) || msGesture || window.DocumentTouch && document instanceof DocumentTouch) && slider.vars.touch,
        // depricating this idea, as devices are being released with both of these events
        //eventType = (touch) ? "touchend" : "click",
        eventType = "click touchend MSPointerUp",
        watchedEvent = "",
        watchedEventClearTimer,
        vertical = slider.vars.direction === "vertical",
        reverse = slider.vars.reverse,
        carousel = (slider.vars.itemWidth > 0),
        fade = slider.vars.animation === "fade",
        asNav = slider.vars.asNavFor !== "",
        methods = {},
        focused = true;

    // Store a reference to the slider object
    $.data(el, "flexslider", slider);

    // Private slider methods
    methods = {
      init: function() {
        slider.animating = false;
        // Get current slide and make sure it is a number
        slider.currentSlide = parseInt( ( slider.vars.startAt ? slider.vars.startAt : 0) );
        if ( isNaN( slider.currentSlide ) ) slider.currentSlide = 0;
        slider.animatingTo = slider.currentSlide;
        slider.atEnd = (slider.currentSlide === 0 || slider.currentSlide === slider.last);
        slider.containerSelector = slider.vars.selector.substr(0,slider.vars.selector.search(' '));
        slider.slides = $(slider.vars.selector, slider);
        slider.container = $(slider.containerSelector, slider);
        slider.count = slider.slides.length;
        // SYNC:
        slider.syncExists = $(slider.vars.sync).length > 0;
        // SLIDE:
        if (slider.vars.animation === "slide") slider.vars.animation = "swing";
        slider.prop = (vertical) ? "top" : "marginLeft";
        slider.args = {};
        // SLIDESHOW:
        slider.manualPause = false;
        slider.stopped = false;
        //PAUSE WHEN INVISIBLE
        slider.started = false;
        slider.startTimeout = null;
        // TOUCH/USECSS:
        slider.transitions = !slider.vars.video && !fade && slider.vars.useCSS && (function() {
          var obj = document.createElement('div'),
              props = ['perspectiveProperty', 'WebkitPerspective', 'MozPerspective', 'OPerspective', 'msPerspective'];
          for (var i in props) {
            if ( obj.style[ props[i] ] !== undefined ) {
              slider.pfx = props[i].replace('Perspective','').toLowerCase();
              slider.prop = "-" + slider.pfx + "-transform";
              return true;
            }
          }
          return false;
        }());
        // CONTROLSCONTAINER:
        if (slider.vars.controlsContainer !== "") slider.controlsContainer = $(slider.vars.controlsContainer).length > 0 && $(slider.vars.controlsContainer);
        // MANUAL:
        if (slider.vars.manualControls !== "") slider.manualControls = $(slider.vars.manualControls).length > 0 && $(slider.vars.manualControls);

        // RANDOMIZE:
        if (slider.vars.randomize) {
          slider.slides.sort(function() { return (Math.round(Math.random())-0.5); });
          slider.container.empty().append(slider.slides);
        }

        slider.doMath();

        // INIT
        slider.setup("init");

        // CONTROLNAV:
        if (slider.vars.controlNav) methods.controlNav.setup();

        // DIRECTIONNAV:
        if (slider.vars.directionNav) methods.directionNav.setup();

        // KEYBOARD:
        if (slider.vars.keyboard && ($(slider.containerSelector).length === 1 || slider.vars.multipleKeyboard)) {
          $(document).bind('keyup', function(event) {
            var keycode = event.keyCode;
            if (!slider.animating && (keycode === 39 || keycode === 37)) {
              var target = (keycode === 39) ? slider.getTarget('next') :
                           (keycode === 37) ? slider.getTarget('prev') : false;
              slider.flexAnimate(target, slider.vars.pauseOnAction);
            }
          });
        }
        // MOUSEWHEEL:
        if (slider.vars.mousewheel) {
          slider.bind('mousewheel', function(event, delta, deltaX, deltaY) {
            event.preventDefault();
            var target = (delta < 0) ? slider.getTarget('next') : slider.getTarget('prev');
            slider.flexAnimate(target, slider.vars.pauseOnAction);
          });
        }

        // PAUSEPLAY
        if (slider.vars.pausePlay) methods.pausePlay.setup();

        //PAUSE WHEN INVISIBLE
        if (slider.vars.slideshow && slider.vars.pauseInvisible) methods.pauseInvisible.init();

        // SLIDSESHOW
        if (slider.vars.slideshow) {
          if (slider.vars.pauseOnHover) {
            slider.hover(function() {
              if (!slider.manualPlay && !slider.manualPause) slider.pause();
            }, function() {
              if (!slider.manualPause && !slider.manualPlay && !slider.stopped) slider.play();
            });
          }
          // initialize animation
          //If we're visible, or we don't use PageVisibility API
          if(!slider.vars.pauseInvisible || !methods.pauseInvisible.isHidden()) {
            (slider.vars.initDelay > 0) ? slider.startTimeout = setTimeout(slider.play, slider.vars.initDelay) : slider.play();
          }
        }

        // ASNAV:
        if (asNav) methods.asNav.setup();

        // TOUCH
        if (touch && slider.vars.touch) methods.touch();

        // FADE&&SMOOTHHEIGHT || SLIDE:
        if (!fade || (fade && slider.vars.smoothHeight)) $(window).bind("resize orientationchange focus", methods.resize);

        slider.find("img").attr("draggable", "false");

        // API: start() Callback
        setTimeout(function(){
          slider.vars.start(slider);
        }, 200);
      },
      asNav: {
        setup: function() {
          slider.asNav = true;
          slider.animatingTo = Math.floor(slider.currentSlide/slider.move);
          slider.currentItem = slider.currentSlide;
          slider.slides.removeClass(namespace + "active-slide").eq(slider.currentItem).addClass(namespace + "active-slide");
          if(!msGesture){
              slider.slides.click(function(e){
                e.preventDefault();
                var $slide = $(this),
                    target = $slide.index();
                var posFromLeft = $slide.offset().left - $(slider).scrollLeft(); // Find position of slide relative to left of slider container
                if( posFromLeft <= 0 && $slide.hasClass( namespace + 'active-slide' ) ) {
                  slider.flexAnimate(slider.getTarget("prev"), true);
                } else if (!$(slider.vars.asNavFor).data('flexslider').animating && !$slide.hasClass(namespace + "active-slide")) {
                  slider.direction = (slider.currentItem < target) ? "next" : "prev";
                  slider.flexAnimate(target, slider.vars.pauseOnAction, false, true, true);
                }
              });
          }else{
              el._slider = slider;
              slider.slides.each(function (){
                  var that = this;
                  that._gesture = new MSGesture();
                  that._gesture.target = that;
                  that.addEventListener("MSPointerDown", function (e){
                      e.preventDefault();
                      if(e.currentTarget._gesture)
                          e.currentTarget._gesture.addPointer(e.pointerId);
                  }, false);
                  that.addEventListener("MSGestureTap", function (e){
                      e.preventDefault();
                      var $slide = $(this),
                          target = $slide.index();
                      if (!$(slider.vars.asNavFor).data('flexslider').animating && !$slide.hasClass('active')) {
                          slider.direction = (slider.currentItem < target) ? "next" : "prev";
                          slider.flexAnimate(target, slider.vars.pauseOnAction, false, true, true);
                      }
                  });
              });
          }
        }
      },
      controlNav: {
        setup: function() {
          if (!slider.manualControls) {
            methods.controlNav.setupPaging();
          } else { // MANUALCONTROLS:
            methods.controlNav.setupManual();
          }
        },
        setupPaging: function() {
          var type = (slider.vars.controlNav === "thumbnails") ? 'control-thumbs' : 'control-paging',
              j = 1,
              item,
              slide;

          slider.controlNavScaffold = $('<ol class="'+ namespace + 'control-nav ' + namespace + type + '"></ol>');

          if (slider.pagingCount > 1) {
            for (var i = 0; i < slider.pagingCount; i++) {
              slide = slider.slides.eq(i);
              item = (slider.vars.controlNav === "thumbnails") ? '<img src="' + slide.attr( 'data-thumb' ) + '"/>' : '<a>' + j + '</a>';
              if ( 'thumbnails' === slider.vars.controlNav && true === slider.vars.thumbCaptions ) {
                var captn = slide.attr( 'data-thumbcaption' );
                if ( '' != captn && undefined != captn ) item += '<span class="' + namespace + 'caption">' + captn + '</span>';
              }
              slider.controlNavScaffold.append('<li>' + item + '</li>');
              j++;
            }
          }

          // CONTROLSCONTAINER:
          (slider.controlsContainer) ? $(slider.controlsContainer).append(slider.controlNavScaffold) : slider.append(slider.controlNavScaffold);
          methods.controlNav.set();

          methods.controlNav.active();

          slider.controlNavScaffold.delegate('a, img', eventType, function(event) {
            event.preventDefault();

            if (watchedEvent === "" || watchedEvent === event.type) {
              var $this = $(this),
                  target = slider.controlNav.index($this);

              if (!$this.hasClass(namespace + 'active')) {
                slider.direction = (target > slider.currentSlide) ? "next" : "prev";
                slider.flexAnimate(target, slider.vars.pauseOnAction);
              }
            }

            // setup flags to prevent event duplication
            if (watchedEvent === "") {
              watchedEvent = event.type;
            }
            methods.setToClearWatchedEvent();

          });
        },
        setupManual: function() {
          slider.controlNav = slider.manualControls;
          methods.controlNav.active();

          slider.controlNav.bind(eventType, function(event) {
            event.preventDefault();

            if (watchedEvent === "" || watchedEvent === event.type) {
              var $this = $(this),
                  target = slider.controlNav.index($this);

              if (!$this.hasClass(namespace + 'active')) {
                (target > slider.currentSlide) ? slider.direction = "next" : slider.direction = "prev";
                slider.flexAnimate(target, slider.vars.pauseOnAction);
              }
            }

            // setup flags to prevent event duplication
            if (watchedEvent === "") {
              watchedEvent = event.type;
            }
            methods.setToClearWatchedEvent();
          });
        },
        set: function() {
          var selector = (slider.vars.controlNav === "thumbnails") ? 'img' : 'a';
          slider.controlNav = $('.' + namespace + 'control-nav li ' + selector, (slider.controlsContainer) ? slider.controlsContainer : slider);
        },
        active: function() {
          slider.controlNav.removeClass(namespace + "active").eq(slider.animatingTo).addClass(namespace + "active");
        },
        update: function(action, pos) {
          if (slider.pagingCount > 1 && action === "add") {
            slider.controlNavScaffold.append($('<li><a>' + slider.count + '</a></li>'));
          } else if (slider.pagingCount === 1) {
            slider.controlNavScaffold.find('li').remove();
          } else {
            slider.controlNav.eq(pos).closest('li').remove();
          }
          methods.controlNav.set();
          (slider.pagingCount > 1 && slider.pagingCount !== slider.controlNav.length) ? slider.update(pos, action) : methods.controlNav.active();
        }
      },
      directionNav: {
        setup: function() {
          var directionNavScaffold = $('<ul class="' + namespace + 'direction-nav"><li><a class="' + namespace + 'prev" href="#">' + slider.vars.prevText + '</a></li><li><a class="' + namespace + 'next" href="#">' + slider.vars.nextText + '</a></li></ul>');

          // CONTROLSCONTAINER:
          if (slider.controlsContainer) {
            $(slider.controlsContainer).append(directionNavScaffold);
            slider.directionNav = $('.' + namespace + 'direction-nav li a', slider.controlsContainer);
          } else {
            slider.append(directionNavScaffold);
            slider.directionNav = $('.' + namespace + 'direction-nav li a', slider);
          }

          methods.directionNav.update();

          slider.directionNav.bind(eventType, function(event) {
            event.preventDefault();
            var target;

            if (watchedEvent === "" || watchedEvent === event.type) {
              target = ($(this).hasClass(namespace + 'next')) ? slider.getTarget('next') : slider.getTarget('prev');
              slider.flexAnimate(target, slider.vars.pauseOnAction);
            }

            // setup flags to prevent event duplication
            if (watchedEvent === "") {
              watchedEvent = event.type;
            }
            methods.setToClearWatchedEvent();
          });
        },
        update: function() {
          var disabledClass = namespace + 'disabled';
          if (slider.pagingCount === 1) {
            slider.directionNav.addClass(disabledClass).attr('tabindex', '-1');
          } else if (!slider.vars.animationLoop) {
            if (slider.animatingTo === 0) {
              slider.directionNav.removeClass(disabledClass).filter('.' + namespace + "prev").addClass(disabledClass).attr('tabindex', '-1');
            } else if (slider.animatingTo === slider.last) {
              slider.directionNav.removeClass(disabledClass).filter('.' + namespace + "next").addClass(disabledClass).attr('tabindex', '-1');
            } else {
              slider.directionNav.removeClass(disabledClass).removeAttr('tabindex');
            }
          } else {
            slider.directionNav.removeClass(disabledClass).removeAttr('tabindex');
          }
        }
      },
      pausePlay: {
        setup: function() {
          var pausePlayScaffold = $('<div class="' + namespace + 'pauseplay"><a></a></div>');

          // CONTROLSCONTAINER:
          if (slider.controlsContainer) {
            slider.controlsContainer.append(pausePlayScaffold);
            slider.pausePlay = $('.' + namespace + 'pauseplay a', slider.controlsContainer);
          } else {
            slider.append(pausePlayScaffold);
            slider.pausePlay = $('.' + namespace + 'pauseplay a', slider);
          }

          methods.pausePlay.update((slider.vars.slideshow) ? namespace + 'pause' : namespace + 'play');

          slider.pausePlay.bind(eventType, function(event) {
            event.preventDefault();

            if (watchedEvent === "" || watchedEvent === event.type) {
              if ($(this).hasClass(namespace + 'pause')) {
                slider.manualPause = true;
                slider.manualPlay = false;
                slider.pause();
              } else {
                slider.manualPause = false;
                slider.manualPlay = true;
                slider.play();
              }
            }

            // setup flags to prevent event duplication
            if (watchedEvent === "") {
              watchedEvent = event.type;
            }
            methods.setToClearWatchedEvent();
          });
        },
        update: function(state) {
          (state === "play") ? slider.pausePlay.removeClass(namespace + 'pause').addClass(namespace + 'play').html(slider.vars.playText) : slider.pausePlay.removeClass(namespace + 'play').addClass(namespace + 'pause').html(slider.vars.pauseText);
        }
      },
      touch: function() {
        var startX,
          startY,
          offset,
          cwidth,
          dx,
          startT,
          scrolling = false,
          localX = 0,
          localY = 0,
          accDx = 0;

        if(!msGesture){
            el.addEventListener('touchstart', onTouchStart, false);

            function onTouchStart(e) {
              if (slider.animating) {
                e.preventDefault();
              } else if ( ( window.navigator.msPointerEnabled ) || e.touches.length === 1 ) {
                slider.pause();
                // CAROUSEL:
                cwidth = (vertical) ? slider.h : slider. w;
                startT = Number(new Date());
                // CAROUSEL:

                // Local vars for X and Y points.
                localX = e.touches[0].pageX;
                localY = e.touches[0].pageY;

                offset = (carousel && reverse && slider.animatingTo === slider.last) ? 0 :
                         (carousel && reverse) ? slider.limit - (((slider.itemW + slider.vars.itemMargin) * slider.move) * slider.animatingTo) :
                         (carousel && slider.currentSlide === slider.last) ? slider.limit :
                         (carousel) ? ((slider.itemW + slider.vars.itemMargin) * slider.move) * slider.currentSlide :
                         (reverse) ? (slider.last - slider.currentSlide + slider.cloneOffset) * cwidth : (slider.currentSlide + slider.cloneOffset) * cwidth;
                startX = (vertical) ? localY : localX;
                startY = (vertical) ? localX : localY;

                el.addEventListener('touchmove', onTouchMove, false);
                el.addEventListener('touchend', onTouchEnd, false);
              }
            }

            function onTouchMove(e) {
              // Local vars for X and Y points.

              localX = e.touches[0].pageX;
              localY = e.touches[0].pageY;

              dx = (vertical) ? startX - localY : startX - localX;
              scrolling = (vertical) ? (Math.abs(dx) < Math.abs(localX - startY)) : (Math.abs(dx) < Math.abs(localY - startY));

              var fxms = 500;

              if ( ! scrolling || Number( new Date() ) - startT > fxms ) {
                e.preventDefault();
                if (!fade && slider.transitions) {
                  if (!slider.vars.animationLoop) {
                    dx = dx/((slider.currentSlide === 0 && dx < 0 || slider.currentSlide === slider.last && dx > 0) ? (Math.abs(dx)/cwidth+2) : 1);
                  }
                  slider.setProps(offset + dx, "setTouch");
                }
              }
            }

            function onTouchEnd(e) {
              // finish the touch by undoing the touch session
              el.removeEventListener('touchmove', onTouchMove, false);

              if (slider.animatingTo === slider.currentSlide && !scrolling && !(dx === null)) {
                var updateDx = (reverse) ? -dx : dx,
                    target = (updateDx > 0) ? slider.getTarget('next') : slider.getTarget('prev');

                if (slider.canAdvance(target) && (Number(new Date()) - startT < 550 && Math.abs(updateDx) > 50 || Math.abs(updateDx) > cwidth/2)) {
                  slider.flexAnimate(target, slider.vars.pauseOnAction);
                } else {
                  if (!fade) slider.flexAnimate(slider.currentSlide, slider.vars.pauseOnAction, true);
                }
              }
              el.removeEventListener('touchend', onTouchEnd, false);

              startX = null;
              startY = null;
              dx = null;
              offset = null;
            }
        }else{
            el.style.msTouchAction = "none";
            el._gesture = new MSGesture();
            el._gesture.target = el;
            el.addEventListener("MSPointerDown", onMSPointerDown, false);
            el._slider = slider;
            el.addEventListener("MSGestureChange", onMSGestureChange, false);
            el.addEventListener("MSGestureEnd", onMSGestureEnd, false);

            function onMSPointerDown(e){
                e.stopPropagation();
                if (slider.animating) {
                    e.preventDefault();
                }else{
                    slider.pause();
                    el._gesture.addPointer(e.pointerId);
                    accDx = 0;
                    cwidth = (vertical) ? slider.h : slider. w;
                    startT = Number(new Date());
                    // CAROUSEL:

                    offset = (carousel && reverse && slider.animatingTo === slider.last) ? 0 :
                        (carousel && reverse) ? slider.limit - (((slider.itemW + slider.vars.itemMargin) * slider.move) * slider.animatingTo) :
                            (carousel && slider.currentSlide === slider.last) ? slider.limit :
                                (carousel) ? ((slider.itemW + slider.vars.itemMargin) * slider.move) * slider.currentSlide :
                                    (reverse) ? (slider.last - slider.currentSlide + slider.cloneOffset) * cwidth : (slider.currentSlide + slider.cloneOffset) * cwidth;
                }
            }

            function onMSGestureChange(e) {
                e.stopPropagation();
                var slider = e.target._slider;
                if(!slider){
                    return;
                }
                var transX = -e.translationX,
                    transY = -e.translationY;

                //Accumulate translations.
                accDx = accDx + ((vertical) ? transY : transX);
                dx = accDx;
                scrolling = (vertical) ? (Math.abs(accDx) < Math.abs(-transX)) : (Math.abs(accDx) < Math.abs(-transY));

                if(e.detail === e.MSGESTURE_FLAG_INERTIA){
                    setImmediate(function (){
                        el._gesture.stop();
                    });

                    return;
                }

                if (!scrolling || Number(new Date()) - startT > 500) {
                    e.preventDefault();
                    if (!fade && slider.transitions) {
                        if (!slider.vars.animationLoop) {
                            dx = accDx / ((slider.currentSlide === 0 && accDx < 0 || slider.currentSlide === slider.last && accDx > 0) ? (Math.abs(accDx) / cwidth + 2) : 1);
                        }
                        slider.setProps(offset + dx, "setTouch");
                    }
                }
            }

            function onMSGestureEnd(e) {
                e.stopPropagation();
                var slider = e.target._slider;
                if(!slider){
                    return;
                }
                if (slider.animatingTo === slider.currentSlide && !scrolling && !(dx === null)) {
                    var updateDx = (reverse) ? -dx : dx,
                        target = (updateDx > 0) ? slider.getTarget('next') : slider.getTarget('prev');

                    if (slider.canAdvance(target) && (Number(new Date()) - startT < 550 && Math.abs(updateDx) > 50 || Math.abs(updateDx) > cwidth/2)) {
                        slider.flexAnimate(target, slider.vars.pauseOnAction);
                    } else {
                        if (!fade) slider.flexAnimate(slider.currentSlide, slider.vars.pauseOnAction, true);
                    }
                }

                startX = null;
                startY = null;
                dx = null;
                offset = null;
                accDx = 0;
            }
        }
      },
      resize: function() {
        if (!slider.animating && slider.is(':visible')) {
          if (!carousel) slider.doMath();

          if (fade) {
            // SMOOTH HEIGHT:
            methods.smoothHeight();
          } else if (carousel) { //CAROUSEL:
            slider.slides.width(slider.computedW);
            slider.update(slider.pagingCount);
            slider.setProps();
          }
          else if (vertical) { //VERTICAL:
            slider.viewport.height(slider.h);
            slider.setProps(slider.h, "setTotal");
          } else {
            // SMOOTH HEIGHT:
            if (slider.vars.smoothHeight) methods.smoothHeight();
            slider.newSlides.width(slider.computedW);
            slider.setProps(slider.computedW, "setTotal");
          }
        }
      },
      smoothHeight: function(dur) {
        if (!vertical || fade) {
          var $obj = (fade) ? slider : slider.viewport;
          (dur) ? $obj.animate({"height": slider.slides.eq(slider.animatingTo).height()}, dur) : $obj.height(slider.slides.eq(slider.animatingTo).height());
        }
      },
      sync: function(action) {
        var $obj = $(slider.vars.sync).data("flexslider"),
            target = slider.animatingTo;

        switch (action) {
          case "animate": $obj.flexAnimate(target, slider.vars.pauseOnAction, false, true); break;
          case "play": if (!$obj.playing && !$obj.asNav) { $obj.play(); } break;
          case "pause": $obj.pause(); break;
        }
      },
      pauseInvisible: {
        visProp: null,
        init: function() {
          var prefixes = ['webkit','moz','ms','o'];

          if ('hidden' in document) return 'hidden';
          for (var i = 0; i < prefixes.length; i++) {
            if ((prefixes[i] + 'Hidden') in document) 
            methods.pauseInvisible.visProp = prefixes[i] + 'Hidden';
          }
          if (methods.pauseInvisible.visProp) {
            var evtname = methods.pauseInvisible.visProp.replace(/[H|h]idden/,'') + 'visibilitychange';
            document.addEventListener(evtname, function() {
              if (methods.pauseInvisible.isHidden()) {
                if(slider.startTimeout) clearTimeout(slider.startTimeout); //If clock is ticking, stop timer and prevent from starting while invisible
                else slider.pause(); //Or just pause
              }
              else {
                if(slider.started) slider.play(); //Initiated before, just play
                else (slider.vars.initDelay > 0) ? setTimeout(slider.play, slider.vars.initDelay) : slider.play(); //Didn't init before: simply init or wait for it
              }
            });
          }       
        },
        isHidden: function() {
          return document[methods.pauseInvisible.visProp] || false;
        }
      },
      setToClearWatchedEvent: function() {
        clearTimeout(watchedEventClearTimer);
        watchedEventClearTimer = setTimeout(function() {
          watchedEvent = "";
        }, 3000);
      }
    }

    // public methods
    slider.flexAnimate = function(target, pause, override, withSync, fromNav) {
      if (!slider.vars.animationLoop && target !== slider.currentSlide) {
        slider.direction = (target > slider.currentSlide) ? "next" : "prev";
      }

      if (asNav && slider.pagingCount === 1) slider.direction = (slider.currentItem < target) ? "next" : "prev";

      if (!slider.animating && (slider.canAdvance(target, fromNav) || override) && slider.is(":visible")) {
        if (asNav && withSync) {
          var master = $(slider.vars.asNavFor).data('flexslider');
          slider.atEnd = target === 0 || target === slider.count - 1;
          master.flexAnimate(target, true, false, true, fromNav);
          slider.direction = (slider.currentItem < target) ? "next" : "prev";
          master.direction = slider.direction;

          if (Math.ceil((target + 1)/slider.visible) - 1 !== slider.currentSlide && target !== 0) {
            slider.currentItem = target;
            slider.slides.removeClass(namespace + "active-slide").eq(target).addClass(namespace + "active-slide");
            target = Math.floor(target/slider.visible);
          } else {
            slider.currentItem = target;
            slider.slides.removeClass(namespace + "active-slide").eq(target).addClass(namespace + "active-slide");
            return false;
          }
        }

        slider.animating = true;
        slider.animatingTo = target;

        // SLIDESHOW:
        if (pause) slider.pause();

        // API: before() animation Callback
        slider.vars.before(slider);

        // SYNC:
        if (slider.syncExists && !fromNav) methods.sync("animate");

        // CONTROLNAV
        if (slider.vars.controlNav) methods.controlNav.active();

        // !CAROUSEL:
        // CANDIDATE: slide active class (for add/remove slide)
        if (!carousel) slider.slides.removeClass(namespace + 'active-slide').eq(target).addClass(namespace + 'active-slide');

        // INFINITE LOOP:
        // CANDIDATE: atEnd
        slider.atEnd = target === 0 || target === slider.last;

        // DIRECTIONNAV:
        if (slider.vars.directionNav) methods.directionNav.update();

        if (target === slider.last) {
          // API: end() of cycle Callback
          slider.vars.end(slider);
          // SLIDESHOW && !INFINITE LOOP:
          if (!slider.vars.animationLoop) slider.pause();
        }

        // SLIDE:
        if (!fade) {
          var dimension = (vertical) ? slider.slides.filter(':first').height() : slider.computedW,
              margin, slideString, calcNext;

          // INFINITE LOOP / REVERSE:
          if (carousel) {
            //margin = (slider.vars.itemWidth > slider.w) ? slider.vars.itemMargin * 2 : slider.vars.itemMargin;
            margin = slider.vars.itemMargin;
            calcNext = ((slider.itemW + margin) * slider.move) * slider.animatingTo;
            slideString = (calcNext > slider.limit && slider.visible !== 1) ? slider.limit : calcNext;
          } else if (slider.currentSlide === 0 && target === slider.count - 1 && slider.vars.animationLoop && slider.direction !== "next") {
            slideString = (reverse) ? (slider.count + slider.cloneOffset) * dimension : 0;
          } else if (slider.currentSlide === slider.last && target === 0 && slider.vars.animationLoop && slider.direction !== "prev") {
            slideString = (reverse) ? 0 : (slider.count + 1) * dimension;
          } else {
            slideString = (reverse) ? ((slider.count - 1) - target + slider.cloneOffset) * dimension : (target + slider.cloneOffset) * dimension;
          }
          slider.setProps(slideString, "", slider.vars.animationSpeed);
          if (slider.transitions) {
            if (!slider.vars.animationLoop || !slider.atEnd) {
              slider.animating = false;
              slider.currentSlide = slider.animatingTo;
            }
            slider.container.unbind("webkitTransitionEnd transitionend");
            slider.container.bind("webkitTransitionEnd transitionend", function() {
              slider.wrapup(dimension);
            });
          } else {
            slider.container.animate(slider.args, slider.vars.animationSpeed, slider.vars.easing, function(){
              slider.wrapup(dimension);
            });
          }
        } else { // FADE:
          if (!touch) {
            //slider.slides.eq(slider.currentSlide).fadeOut(slider.vars.animationSpeed, slider.vars.easing);
            //slider.slides.eq(target).fadeIn(slider.vars.animationSpeed, slider.vars.easing, slider.wrapup);

            slider.slides.eq(slider.currentSlide).css({"zIndex": 1}).animate({"opacity": 0}, slider.vars.animationSpeed, slider.vars.easing);
            slider.slides.eq(target).css({"zIndex": 2}).animate({"opacity": 1}, slider.vars.animationSpeed, slider.vars.easing, slider.wrapup);

          } else {
            slider.slides.eq(slider.currentSlide).css({ "opacity": 0, "zIndex": 1 });
            slider.slides.eq(target).css({ "opacity": 1, "zIndex": 2 });
            slider.wrapup(dimension);
          }
        }
        // SMOOTH HEIGHT:
        if (slider.vars.smoothHeight) methods.smoothHeight(slider.vars.animationSpeed);
      }
    }
    slider.wrapup = function(dimension) {
      // SLIDE:
      if (!fade && !carousel) {
        if (slider.currentSlide === 0 && slider.animatingTo === slider.last && slider.vars.animationLoop) {
          slider.setProps(dimension, "jumpEnd");
        } else if (slider.currentSlide === slider.last && slider.animatingTo === 0 && slider.vars.animationLoop) {
          slider.setProps(dimension, "jumpStart");
        }
      }
      slider.animating = false;
      slider.currentSlide = slider.animatingTo;
      // API: after() animation Callback
      slider.vars.after(slider);
    }

    // SLIDESHOW:
    slider.animateSlides = function() {
      if (!slider.animating && focused ) slider.flexAnimate(slider.getTarget("next"));
    }
    // SLIDESHOW:
    slider.pause = function() {
      clearInterval(slider.animatedSlides);
      slider.animatedSlides = null;
      slider.playing = false;
      // PAUSEPLAY:
      if (slider.vars.pausePlay) methods.pausePlay.update("play");
      // SYNC:
      if (slider.syncExists) methods.sync("pause");
    }
    // SLIDESHOW:
    slider.play = function() {
      if (slider.playing) clearInterval(slider.animatedSlides);
      slider.animatedSlides = slider.animatedSlides || setInterval(slider.animateSlides, slider.vars.slideshowSpeed);
      slider.started = slider.playing = true;
      // PAUSEPLAY:
      if (slider.vars.pausePlay) methods.pausePlay.update("pause");
      // SYNC:
      if (slider.syncExists) methods.sync("play");
    }
    // STOP:
    slider.stop = function () {
      slider.pause();
      slider.stopped = true;
    }
    slider.canAdvance = function(target, fromNav) {
      // ASNAV:
      var last = (asNav) ? slider.pagingCount - 1 : slider.last;
      return (fromNav) ? true :
             (asNav && slider.currentItem === slider.count - 1 && target === 0 && slider.direction === "prev") ? true :
             (asNav && slider.currentItem === 0 && target === slider.pagingCount - 1 && slider.direction !== "next") ? false :
             (target === slider.currentSlide && !asNav) ? false :
             (slider.vars.animationLoop) ? true :
             (slider.atEnd && slider.currentSlide === 0 && target === last && slider.direction !== "next") ? false :
             (slider.atEnd && slider.currentSlide === last && target === 0 && slider.direction === "next") ? false :
             true;
    }
    slider.getTarget = function(dir) {
      slider.direction = dir;
      if (dir === "next") {
        return (slider.currentSlide === slider.last) ? 0 : slider.currentSlide + 1;
      } else {
        return (slider.currentSlide === 0) ? slider.last : slider.currentSlide - 1;
      }
    }

    // SLIDE:
    slider.setProps = function(pos, special, dur) {
      var target = (function() {
        var posCheck = (pos) ? pos : ((slider.itemW + slider.vars.itemMargin) * slider.move) * slider.animatingTo,
            posCalc = (function() {
              if (carousel) {
                return (special === "setTouch") ? pos :
                       (reverse && slider.animatingTo === slider.last) ? 0 :
                       (reverse) ? slider.limit - (((slider.itemW + slider.vars.itemMargin) * slider.move) * slider.animatingTo) :
                       (slider.animatingTo === slider.last) ? slider.limit : posCheck;
              } else {
                switch (special) {
                  case "setTotal": return (reverse) ? ((slider.count - 1) - slider.currentSlide + slider.cloneOffset) * pos : (slider.currentSlide + slider.cloneOffset) * pos;
                  case "setTouch": return (reverse) ? pos : pos;
                  case "jumpEnd": return (reverse) ? pos : slider.count * pos;
                  case "jumpStart": return (reverse) ? slider.count * pos : pos;
                  default: return pos;
                }
              }
            }());

            return (posCalc * -1) + "px";
          }());

      if (slider.transitions) {
        target = (vertical) ? "translate3d(0," + target + ",0)" : "translate3d(" + target + ",0,0)";
        dur = (dur !== undefined) ? (dur/1000) + "s" : "0s";
        slider.container.css("-" + slider.pfx + "-transition-duration", dur);
      }

      slider.args[slider.prop] = target;
      if (slider.transitions || dur === undefined) slider.container.css(slider.args);
    }

    slider.setup = function(type) {
      // SLIDE:
      if (!fade) {
        var sliderOffset, arr;

        if (type === "init") {
          slider.viewport = $('<div class="' + namespace + 'viewport"></div>').css({"overflow": "hidden", "position": "relative"}).appendTo(slider).append(slider.container);
          // INFINITE LOOP:
          slider.cloneCount = 0;
          slider.cloneOffset = 0;
          // REVERSE:
          if (reverse) {
            arr = $.makeArray(slider.slides).reverse();
            slider.slides = $(arr);
            slider.container.empty().append(slider.slides);
          }
        }
        // INFINITE LOOP && !CAROUSEL:
        if (slider.vars.animationLoop && !carousel) {
          slider.cloneCount = 2;
          slider.cloneOffset = 1;
          // clear out old clones
          if (type !== "init") slider.container.find('.clone').remove();
          slider.container.append(slider.slides.first().clone().addClass('clone').attr('aria-hidden', 'true')).prepend(slider.slides.last().clone().addClass('clone').attr('aria-hidden', 'true'));
        }
        slider.newSlides = $(slider.vars.selector, slider);

        sliderOffset = (reverse) ? slider.count - 1 - slider.currentSlide + slider.cloneOffset : slider.currentSlide + slider.cloneOffset;
        // VERTICAL:
        if (vertical && !carousel) {
          slider.container.height((slider.count + slider.cloneCount) * 200 + "%").css("position", "absolute").width("100%");
          setTimeout(function(){
            slider.newSlides.css({"display": "block"});
            slider.doMath();
            slider.viewport.height(slider.h);
            slider.setProps(sliderOffset * slider.h, "init");
          }, (type === "init") ? 100 : 0);
        } else {
          slider.container.width((slider.count + slider.cloneCount) * 200 + "%");
          slider.setProps(sliderOffset * slider.computedW, "init");
          setTimeout(function(){
            slider.doMath();
            slider.newSlides.css({"width": slider.computedW, "float": "left", "display": "block"});
            // SMOOTH HEIGHT:
            if (slider.vars.smoothHeight) methods.smoothHeight();
          }, (type === "init") ? 100 : 0);
        }
      } else { // FADE:
        slider.slides.css({"width": "100%", "float": "left", "marginRight": "-100%", "position": "relative"});
        if (type === "init") {
          if (!touch) {
            //slider.slides.eq(slider.currentSlide).fadeIn(slider.vars.animationSpeed, slider.vars.easing);
            slider.slides.css({ "opacity": 0, "display": "block", "zIndex": 1 }).eq(slider.currentSlide).css({"zIndex": 2}).animate({"opacity": 1},slider.vars.animationSpeed,slider.vars.easing);
          } else {
            slider.slides.css({ "opacity": 0, "display": "block", "webkitTransition": "opacity " + slider.vars.animationSpeed / 1000 + "s ease", "zIndex": 1 }).eq(slider.currentSlide).css({ "opacity": 1, "zIndex": 2});
          }
        }
        // SMOOTH HEIGHT:
        if (slider.vars.smoothHeight) methods.smoothHeight();
      }
      // !CAROUSEL:
      // CANDIDATE: active slide
      if (!carousel) slider.slides.removeClass(namespace + "active-slide").eq(slider.currentSlide).addClass(namespace + "active-slide");
    }


    slider.doMath = function() {
      var slide = slider.slides.first(),
          slideMargin = slider.vars.itemMargin,
          minItems = slider.vars.minItems,
          maxItems = slider.vars.maxItems;

      slider.w = (slider.viewport===undefined) ? slider.width() : slider.viewport.width();
      slider.h = slide.height();
      slider.boxPadding = slide.outerWidth() - slide.width();

      // CAROUSEL:
      if (carousel) {
        slider.itemT = slider.vars.itemWidth + slideMargin;
        slider.minW = (minItems) ? minItems * slider.itemT : slider.w;
        slider.maxW = (maxItems) ? (maxItems * slider.itemT) - slideMargin : slider.w;
        slider.itemW = (slider.minW > slider.w) ? (slider.w - (slideMargin * (minItems - 1)))/minItems :
                       (slider.maxW < slider.w) ? (slider.w - (slideMargin * (maxItems - 1)))/maxItems :
                       (slider.vars.itemWidth > slider.w) ? slider.w : slider.vars.itemWidth;

        slider.visible = Math.floor(slider.w/(slider.itemW));
        slider.move = (slider.vars.move > 0 && slider.vars.move < slider.visible ) ? slider.vars.move : slider.visible;
        slider.pagingCount = Math.ceil(((slider.count - slider.visible)/slider.move) + 1);
        slider.last =  slider.pagingCount - 1;
        slider.limit = (slider.pagingCount === 1) ? 0 :
                       (slider.vars.itemWidth > slider.w) ? (slider.itemW * (slider.count - 1)) + (slideMargin * (slider.count - 1)) : ((slider.itemW + slideMargin) * slider.count) - slider.w - slideMargin;
      } else {
        slider.itemW = slider.w;
        slider.pagingCount = slider.count;
        slider.last = slider.count - 1;
      }
      slider.computedW = slider.itemW - slider.boxPadding;
    }


    slider.update = function(pos, action) {
      slider.doMath();

      // update currentSlide and slider.animatingTo if necessary
      if (!carousel) {
        if (pos < slider.currentSlide) {
          slider.currentSlide += 1;
        } else if (pos <= slider.currentSlide && pos !== 0) {
          slider.currentSlide -= 1;
        }
        slider.animatingTo = slider.currentSlide;
      }

      // update controlNav
      if (slider.vars.controlNav && !slider.manualControls) {
        if ((action === "add" && !carousel) || slider.pagingCount > slider.controlNav.length) {
          methods.controlNav.update("add");
        } else if ((action === "remove" && !carousel) || slider.pagingCount < slider.controlNav.length) {
          if (carousel && slider.currentSlide > slider.last) {
            slider.currentSlide -= 1;
            slider.animatingTo -= 1;
          }
          methods.controlNav.update("remove", slider.last);
        }
      }
      // update directionNav
      if (slider.vars.directionNav) methods.directionNav.update();

    }

    slider.addSlide = function(obj, pos) {
      var $obj = $(obj);

      slider.count += 1;
      slider.last = slider.count - 1;

      // append new slide
      if (vertical && reverse) {
        (pos !== undefined) ? slider.slides.eq(slider.count - pos).after($obj) : slider.container.prepend($obj);
      } else {
        (pos !== undefined) ? slider.slides.eq(pos).before($obj) : slider.container.append($obj);
      }

      // update currentSlide, animatingTo, controlNav, and directionNav
      slider.update(pos, "add");

      // update slider.slides
      slider.slides = $(slider.vars.selector + ':not(.clone)', slider);
      // re-setup the slider to accomdate new slide
      slider.setup();

      //FlexSlider: added() Callback
      slider.vars.added(slider);
    }
    slider.removeSlide = function(obj) {
      var pos = (isNaN(obj)) ? slider.slides.index($(obj)) : obj;

      // update count
      slider.count -= 1;
      slider.last = slider.count - 1;

      // remove slide
      if (isNaN(obj)) {
        $(obj, slider.slides).remove();
      } else {
        (vertical && reverse) ? slider.slides.eq(slider.last).remove() : slider.slides.eq(obj).remove();
      }

      // update currentSlide, animatingTo, controlNav, and directionNav
      slider.doMath();
      slider.update(pos, "remove");

      // update slider.slides
      slider.slides = $(slider.vars.selector + ':not(.clone)', slider);
      // re-setup the slider to accomdate new slide
      slider.setup();

      // FlexSlider: removed() Callback
      slider.vars.removed(slider);
    }

    //FlexSlider: Initialize
    methods.init();
  }

  // Ensure the slider isn't focussed if the window loses focus.
  $( window ).blur( function ( e ) {
    focused = false;
  }).focus( function ( e ) {
    focused = true;
  });

  //FlexSlider: Default Settings
  $.flexslider.defaults = {
    namespace: "flex-",             //{NEW} String: Prefix string attached to the class of every element generated by the plugin
    selector: ".slides > li",       //{NEW} Selector: Must match a simple pattern. '{container} > {slide}' -- Ignore pattern at your own peril
    animation: "fade",              //String: Select your animation type, "fade" or "slide"
    easing: "swing",                //{NEW} String: Determines the easing method used in jQuery transitions. jQuery easing plugin is supported!
    direction: "horizontal",        //String: Select the sliding direction, "horizontal" or "vertical"
    reverse: false,                 //{NEW} Boolean: Reverse the animation direction
    animationLoop: true,            //Boolean: Should the animation loop? If false, directionNav will received "disable" classes at either end
    smoothHeight: false,            //{NEW} Boolean: Allow height of the slider to animate smoothly in horizontal mode
    startAt: 0,                     //Integer: The slide that the slider should start on. Array notation (0 = first slide)
    slideshow: true,                //Boolean: Animate slider automatically
    slideshowSpeed: 7000,           //Integer: Set the speed of the slideshow cycling, in milliseconds
    animationSpeed: 600,            //Integer: Set the speed of animations, in milliseconds
    initDelay: 0,                   //{NEW} Integer: Set an initialization delay, in milliseconds
    randomize: false,               //Boolean: Randomize slide order
    thumbCaptions: false,           //Boolean: Whether or not to put captions on thumbnails when using the "thumbnails" controlNav.

    // Usability features
    pauseOnAction: true,            //Boolean: Pause the slideshow when interacting with control elements, highly recommended.
    pauseOnHover: false,            //Boolean: Pause the slideshow when hovering over slider, then resume when no longer hovering
    pauseInvisible: true,           //{NEW} Boolean: Pause the slideshow when tab is invisible, resume when visible. Provides better UX, lower CPU usage.
    useCSS: true,                   //{NEW} Boolean: Slider will use CSS3 transitions if available
    touch: true,                    //{NEW} Boolean: Allow touch swipe navigation of the slider on touch-enabled devices
    video: false,                   //{NEW} Boolean: If using video in the slider, will prevent CSS3 3D Transforms to avoid graphical glitches

    // Primary Controls
    controlNav: true,               //Boolean: Create navigation for paging control of each clide? Note: Leave true for manualControls usage
    directionNav: true,             //Boolean: Create navigation for previous/next navigation? (true/false)
    prevText: "Previous",           //String: Set the text for the "previous" directionNav item
    nextText: "Next",               //String: Set the text for the "next" directionNav item

    // Secondary Navigation
    keyboard: true,                 //Boolean: Allow slider navigating via keyboard left/right keys
    multipleKeyboard: false,        //{NEW} Boolean: Allow keyboard navigation to affect multiple sliders. Default behavior cuts out keyboard navigation with more than one slider present.
    mousewheel: false,              //{UPDATED} Boolean: Requires jquery.mousewheel.js (https://github.com/brandonaaron/jquery-mousewheel) - Allows slider navigating via mousewheel
    pausePlay: false,               //Boolean: Create pause/play dynamic element
    pauseText: "Pause",             //String: Set the text for the "pause" pausePlay item
    playText: "Play",               //String: Set the text for the "play" pausePlay item

    // Special properties
    controlsContainer: "",          //{UPDATED} jQuery Object/Selector: Declare which container the navigation elements should be appended too. Default container is the FlexSlider element. Example use would be $(".flexslider-container"). Property is ignored if given element is not found.
    manualControls: "",             //{UPDATED} jQuery Object/Selector: Declare custom control navigation. Examples would be $(".flex-control-nav li") or "#tabs-nav li img", etc. The number of elements in your controlNav should match the number of slides/tabs.
    sync: "",                       //{NEW} Selector: Mirror the actions performed on this slider with another slider. Use with care.
    asNavFor: "",                   //{NEW} Selector: Internal property exposed for turning the slider into a thumbnail navigation for another slider

    // Carousel Options
    itemWidth: 0,                   //{NEW} Integer: Box-model width of individual carousel items, including horizontal borders and padding.
    itemMargin: 0,                  //{NEW} Integer: Margin between carousel items.
    minItems: 1,                    //{NEW} Integer: Minimum number of carousel items that should be visible. Items will resize fluidly when below this.
    maxItems: 0,                    //{NEW} Integer: Maxmimum number of carousel items that should be visible. Items will resize fluidly when above this limit.
    move: 0,                        //{NEW} Integer: Number of carousel items that should move on animation. If 0, slider will move all visible items.
    allowOneSlide: true,           //{NEW} Boolean: Whether or not to allow a slider comprised of a single slide

    // Callback API
    start: function(){},            //Callback: function(slider) - Fires when the slider loads the first slide
    before: function(){},           //Callback: function(slider) - Fires asynchronously with each slider animation
    after: function(){},            //Callback: function(slider) - Fires after each slider animation completes
    end: function(){},              //Callback: function(slider) - Fires when the slider reaches the last slide (asynchronous)
    added: function(){},            //{NEW} Callback: function(slider) - Fires after a slide is added
    removed: function(){}           //{NEW} Callback: function(slider) - Fires after a slide is removed
  }


  //FlexSlider: Plugin Function
  $.fn.flexslider = function(options) {
    if (options === undefined) options = {};

    if (typeof options === "object") {
      return this.each(function() {
        var $this = $(this),
            selector = (options.selector) ? options.selector : ".slides > li",
            $slides = $this.find(selector);

      if ( ( $slides.length === 1 && options.allowOneSlide === true ) || $slides.length === 0 ) {
          $slides.fadeIn(400);
          if (options.start) options.start($this);
        } else if ($this.data('flexslider') === undefined) {
          new $.flexslider(this, options);
        }
      });
    } else {
      // Helper strings to quickly perform functions on the slider
      var $slider = $(this).data('flexslider');
      switch (options) {
        case "play": $slider.play(); break;
        case "pause": $slider.pause(); break;
        case "stop": $slider.stop(); break;
        case "next": $slider.flexAnimate($slider.getTarget("next"), true); break;
        case "prev":
        case "previous": $slider.flexAnimate($slider.getTarget("prev"), true); break;
        default: if (typeof options === "number") $slider.flexAnimate(options, true);
      }
    }
  }
})(jQuery);


/**!
 * MixItUp v2.1.4
 *
 * @copyright Copyright 2014 KunkaLabs Limited.
 * @author    KunkaLabs Limited.
 * @link      https://mixitup.kunkalabs.com
 *
 * @license   Commercial use requires a commercial license.
 *            https://mixitup.kunkalabs.com/licenses/
 *
 *            Non-commercial use permitted under terms of CC-BY-NC license.
 *            http://creativecommons.org/licenses/by-nc/3.0/
 */

(function($, undf){
    
    /**
     * MixItUp Constructor Function
     * @constructor
     * @extends jQuery
     */
    
    $.MixItUp = function(){
        var self = this;
        
        self._execAction('_constructor', 0);
        
        $.extend(self, {
            
            /* Public Properties
            ---------------------------------------------------------------------- */
            
            selectors: {
                target: '.mix',
                filter: '.filter',
                sort: '.sort'
            },
                
            animation: {
                enable: true,
                effects: 'fade scale',
                duration: 600,
                easing: 'ease',
                perspectiveDistance: '3000',
                perspectiveOrigin: '50% 50%',
                queue: true,
                queueLimit: 1,
                animateChangeLayout: false,
                animateResizeContainer: true,
                animateResizeTargets: false,
                staggerSequence: false,
                reverseOut: false
            },
                
            callbacks: {
                onMixLoad: false,
                onMixStart: false,
                onMixBusy: false,
                onMixEnd: false,
                onMixFail: false,
                _user: false
            },
                
            controls: {
                enable: true,
                live: false,
                toggleFilterButtons: false,
                toggleLogic: 'or',
                activeClass: 'active'
            },

            layout: {
                display: 'inline-block',
                containerClass: '',
                containerClassFail: 'fail'
            },
            
            load: {
                filter: 'all',
                sort: false
            },
            
            /* Private Properties
            ---------------------------------------------------------------------- */
                
            _$body: null,
            _$container: null,
            _$targets: null,
            _$parent: null,
            _$sortButtons: null,
            _$filterButtons: null,
        
            _suckMode: false,
            _mixing: false,
            _sorting: false,
            _clicking: false,
            _loading: true,
            _changingLayout: false,
            _changingClass: false,
            _changingDisplay: false,
            
            _origOrder: [],
            _startOrder: [],
            _newOrder: [],
            _activeFilter: null,
            _toggleArray: [],
            _toggleString: '',
            _activeSort: 'default:asc',
            _newSort: null,
            _startHeight: null,
            _newHeight: null,
            _incPadding: true,
            _newDisplay: null,
            _newClass: null,
            _targetsBound: 0,
            _targetsDone: 0,
            _queue: [],
                
            _$show: $(),
            _$hide: $() 
        });
    
        self._execAction('_constructor', 1);
    };
    
    /**
     * MixItUp Prototype
     * @override
     */
    
    $.MixItUp.prototype = {
        constructor: $.MixItUp,
        
        /* Static Properties
        ---------------------------------------------------------------------- */
        
        _instances: {},
        _handled: {
            _filter: {},
            _sort: {}
        },
        _bound: {
            _filter: {},
            _sort: {}
        },
        _actions: {},
        _filters: {},
        
        /* Static Methods
        ---------------------------------------------------------------------- */
        
        /**
         * Extend
         * @since 2.1.0
         * @param {object} new properties/methods
         * @extends {object} prototype
         */
        
        extend: function(extension){
            for(var key in extension){
                $.MixItUp.prototype[key] = extension[key];
            }
        },
        
        /**
         * Add Action
         * @since 2.1.0
         * @param {string} hook name
         * @param {string} namespace
         * @param {function} function to execute
         * @param {number} priority
         * @extends {object} $.MixItUp.prototype._actions
         */
        
        addAction: function(hook, name, func, priority){
            $.MixItUp.prototype._addHook('_actions', hook, name, func, priority);
        },
        
        /**
         * Add Filter
         * @since 2.1.0
         * @param {string} hook name
         * @param {string} namespace
         * @param {function} function to execute
         * @param {number} priority
         * @extends {object} $.MixItUp.prototype._filters
         */
        
        addFilter: function(hook, name, func, priority){
            $.MixItUp.prototype._addHook('_filters', hook, name, func, priority);
        },
        
        /**
         * Add Hook
         * @since 2.1.0
         * @param {string} type of hook
         * @param {string} hook name
         * @param {function} function to execute
         * @param {number} priority
         * @extends {object} $.MixItUp.prototype._filters
         */
        
        _addHook: function(type, hook, name, func, priority){
            var collection = $.MixItUp.prototype[type],
                obj = {};
                
            priority = (priority === 1 || priority === 'post') ? 'post' : 'pre';
                
            obj[hook] = {};
            obj[hook][priority] = {};
            obj[hook][priority][name] = func;

            $.extend(true, collection, obj);
        },
        
        
        /* Private Methods
        ---------------------------------------------------------------------- */
        
        /**
         * Initialise
         * @since 2.0.0
         * @param {object} domNode
         * @param {object} config
         */
        
        _init: function(domNode, config){
            var self = this;
            
            self._execAction('_init', 0, arguments);
            
            config && $.extend(true, self, config);
            
            self._$body = $('body');
            self._domNode = domNode;
            self._$container = $(domNode);
            self._$container.addClass(self.layout.containerClass);
            self._id = domNode.id;
            
            self._platformDetect();
            
            self._brake = self._getPrefixedCSS('transition', 'none');
            
            self._refresh(true);
            
            self._$parent = self._$targets.parent().length ? self._$targets.parent() : self._$container;
            
            if(self.load.sort){
                self._newSort = self._parseSort(self.load.sort);
                self._newSortString = self.load.sort;
                self._activeSort = self.load.sort;
                self._sort();
                self._printSort();
            }
            
            self._activeFilter = self.load.filter === 'all' ? 
                self.selectors.target : 
                self.load.filter === 'none' ?
                    '' :
                    self.load.filter;
            
            self.controls.enable && self._bindHandlers();
            
            if(self.controls.toggleFilterButtons){
                self._buildToggleArray();
                
                for(var i = 0; i < self._toggleArray.length; i++){
                    self._updateControls({filter: self._toggleArray[i], sort: self._activeSort}, true);
                };
            } else if(self.controls.enable){
                self._updateControls({filter: self._activeFilter, sort: self._activeSort});
            }
            
            self._filter();
            
            self._init = true;
            
            self._$container.data('mixItUp',self);
            
            self._execAction('_init', 1, arguments);
            
            self._buildState();
            
            self._$targets.css(self._brake);
        
            self._goMix(self.animation.enable);
        },
        
        /**
         * Platform Detect
         * @since 2.0.0
         */
        
        _platformDetect: function(){
            var self = this,
                vendorsTrans = ['Webkit', 'Moz', 'O', 'ms'],
                vendorsRAF = ['webkit', 'moz'],
                chrome = window.navigator.appVersion.match(/Chrome\/(\d+)\./) || false,
                ff = typeof InstallTrigger !== 'undefined',
                prefix = function(el){
                    for (var i = 0; i < vendorsTrans.length; i++){
                        if (vendorsTrans[i] + 'Transition' in el.style){
                            return {
                                prefix: '-'+vendorsTrans[i].toLowerCase()+'-',
                                vendor: vendorsTrans[i]
                            };
                        };
                    }; 
                    return 'transition' in el.style ? '' : false;
                },
                transPrefix = prefix(self._domNode);
                
            self._execAction('_platformDetect', 0);
            
            self._chrome = chrome ? parseInt(chrome[1], 10) : false;
            self._ff = ff ? parseInt(window.navigator.userAgent.match(/rv:([^)]+)\)/)[1]) : false;
            self._prefix = transPrefix.prefix;
            self._vendor = transPrefix.vendor;
            self._suckMode = window.atob && self._prefix ? false : true;

            self._suckMode && (self.animation.enable = false);
            (self._ff && self._ff <= 4) && (self.animation.enable = false);
            
            /* Polyfills
            ---------------------------------------------------------------------- */
            
            /**
             * window.requestAnimationFrame
             */
            
            for(var x = 0; x < vendorsRAF.length && !window.requestAnimationFrame; x++){
                window.requestAnimationFrame = window[vendorsRAF[x]+'RequestAnimationFrame'];
            }

            /**
             * Object.getPrototypeOf
             */

            if(typeof Object.getPrototypeOf !== 'function'){
                if(typeof 'test'.__proto__ === 'object'){
                    Object.getPrototypeOf = function(object){
                        return object.__proto__;
                    };
                } else {
                    Object.getPrototypeOf = function(object){
                        return object.constructor.prototype;
                    };
                }
            }

            /**
             * Element.nextElementSibling
             */
            
            if(self._domNode.nextElementSibling === undf){
                Object.defineProperty(Element.prototype, 'nextElementSibling',{
                    get: function(){
                        var el = this.nextSibling;
                        
                        while(el){
                            if(el.nodeType ===1){
                                return el;
                            }
                            el = el.nextSibling;
                        }
                        return null;
                    }
                }); 
            }
            
            self._execAction('_platformDetect', 1);
        },
        
        /**
         * Refresh
         * @since 2.0.0
         * @param {boolean} init
         * @param {boolean} force
         */
        
        _refresh: function(init, force){
            var self = this;
                
            self._execAction('_refresh', 0, arguments);

            self._$targets = self._$container.find(self.selectors.target);
            
            for(var i = 0;  i < self._$targets.length; i++){
                var target = self._$targets[i];
                    
                if(target.dataset === undf || force){
                        
                    target.dataset = {};
                    
                    for(var j = 0; j < target.attributes.length; j++){
                        
                        var attr =  target.attributes[j],
                            name = attr.name,
                            val = attr.nodeValue;
                            
                        if(name.indexOf('data-') > -1){
                            var dataName = self._helpers._camelCase(name.substring(5,name.length));
                            target.dataset[dataName] = val;
                        }
                    }
                }
                
                if(target.mixParent === undf){
                    target.mixParent = self._id;
                }
            }
            
            if(
                (self._$targets.length && init) ||
                (!self._origOrder.length && self._$targets.length)
            ){
                self._origOrder = [];
                
                for(var i = 0;  i < self._$targets.length; i++){
                    var target = self._$targets[i];
                    
                    self._origOrder.push(target);
                }
            }
            
            self._execAction('_refresh', 1, arguments);
        },
        
        /**
         * Bind Handlers
         * @since 2.0.0
         */
        
        _bindHandlers: function(){
            var self = this,
                filters = $.MixItUp.prototype._bound._filter,
                sorts = $.MixItUp.prototype._bound._sort;
            
            self._execAction('_bindHandlers', 0);
            
            if(self.controls.live){
                self._$body
                    .on('click.mixItUp.'+self._id, self.selectors.sort, function(){
                        self._processClick($(this), 'sort');
                    })
                    .on('click.mixItUp.'+self._id, self.selectors.filter, function(){
                        self._processClick($(this), 'filter');
                    });
            } else {
                self._$sortButtons = $(self.selectors.sort);
                self._$filterButtons = $(self.selectors.filter);
                
                self._$sortButtons.on('click.mixItUp.'+self._id, function(){
                    self._processClick($(this), 'sort');
                });
                
                self._$filterButtons.on('click.mixItUp.'+self._id, function(){
                    self._processClick($(this), 'filter');
                });
            }

            filters[self.selectors.filter] = (filters[self.selectors.filter] === undf) ? 1 : filters[self.selectors.filter] + 1;
            sorts[self.selectors.sort] = (sorts[self.selectors.sort] === undf) ? 1 : sorts[self.selectors.sort] + 1;
            
            self._execAction('_bindHandlers', 1);
        },
        
        /**
         * Process Click
         * @since 2.0.0
         * @param {object} $button
         * @param {string} type
         */
        
        _processClick: function($button, type){
            var self = this,
                trackClick = function($button, type, off){
                    var proto = $.MixItUp.prototype;
                        
                    proto._handled['_'+type][self.selectors[type]] = (proto._handled['_'+type][self.selectors[type]] === undf) ? 
                        1 : 
                        proto._handled['_'+type][self.selectors[type]] + 1;

                    if(proto._handled['_'+type][self.selectors[type]] === proto._bound['_'+type][self.selectors[type]]){
                        $button[(off ? 'remove' : 'add')+'Class'](self.controls.activeClass);
                        delete proto._handled['_'+type][self.selectors[type]];
                    }
                };
            
            self._execAction('_processClick', 0, arguments);
            
            if(!self._mixing || (self.animation.queue && self._queue.length < self.animation.queueLimit)){
                self._clicking = true;
                
                if(type === 'sort'){
                    var sort = $button.attr('data-sort');
                    
                    if(!$button.hasClass(self.controls.activeClass) || sort.indexOf('random') > -1){
                        $(self.selectors.sort).removeClass(self.controls.activeClass);
                        trackClick($button, type);
                        self.sort(sort);
                    }
                }
                
                if(type === 'filter') {
                    var filter = $button.attr('data-filter'),
                        ndx,
                        seperator = self.controls.toggleLogic === 'or' ? ',' : '';
                    
                    if(!self.controls.toggleFilterButtons){
                        if(!$button.hasClass(self.controls.activeClass)){
                            $(self.selectors.filter).removeClass(self.controls.activeClass);
                            trackClick($button, type);
                            self.filter(filter);
                        }
                    } else {
                        self._buildToggleArray();
                        
                        if(!$button.hasClass(self.controls.activeClass)){
                            trackClick($button, type);
                            
                            self._toggleArray.push(filter);
                        } else {
                            trackClick($button, type, true);
                            ndx = self._toggleArray.indexOf(filter);
                            self._toggleArray.splice(ndx, 1);
                        }
                        
                        self._toggleArray = $.grep(self._toggleArray,function(n){return(n);});
                        
                        self._toggleString = self._toggleArray.join(seperator);

                        self.filter(self._toggleString);
                    }
                }
                
                self._execAction('_processClick', 1, arguments);
            } else {
                if(typeof self.callbacks.onMixBusy === 'function'){
                    self.callbacks.onMixBusy.call(self._domNode, self._state, self);
                }
                self._execAction('_processClickBusy', 1, arguments);
            }
        },
        
        /**
         * Build Toggle Array
         * @since 2.0.0
         */
        
        _buildToggleArray: function(){
            var self = this,
                activeFilter = self._activeFilter.replace(/\s/g, '');
            
            self._execAction('_buildToggleArray', 0, arguments);
            
            if(self.controls.toggleLogic === 'or'){
                self._toggleArray = activeFilter.split(',');
            } else {
                self._toggleArray = activeFilter.split('.');
                
                !self._toggleArray[0] && self._toggleArray.shift();
                
                for(var i = 0, filter; filter = self._toggleArray[i]; i++){
                    self._toggleArray[i] = '.'+filter;
                }
            }
            
            self._execAction('_buildToggleArray', 1, arguments);
        },
        
        /**
         * Update Controls
         * @since 2.0.0
         * @param {object} command
         * @param {boolean} multi
         */
        
        _updateControls: function(command, multi){
            var self = this,
                output = {
                    filter: command.filter,
                    sort: command.sort
                },
                update = function($el, filter){
                    (multi && type == 'filter' && !(output.filter === 'none' || output.filter === '')) ?
                        $el.filter(filter).addClass(self.controls.activeClass) :
                        $el.removeClass(self.controls.activeClass).filter(filter).addClass(self.controls.activeClass);
                },
                type = 'filter',
                $el = null;
                
            self._execAction('_updateControls', 0, arguments);  
                
            (command.filter === undf) && (output.filter = self._activeFilter);
            (command.sort === undf) && (output.sort = self._activeSort);
            (output.filter === self.selectors.target) && (output.filter = 'all');
            
            for(var i = 0; i < 2; i++){
                $el = self.controls.live ? $(self.selectors[type]) : self['_$'+type+'Buttons'];
                $el && update($el, '[data-'+type+'="'+output[type]+'"]');
                type = 'sort';
            }
            
            self._execAction('_updateControls', 1, arguments);
        },
        
        /**
         * Filter (private)
         * @since 2.0.0
         */
        
        _filter: function(){
            var self = this;
            
            self._execAction('_filter', 0); 
            
            for(var i = 0; i < self._$targets.length; i++){
                var $target = $(self._$targets[i]);
                
                if($target.is(self._activeFilter)){
                    self._$show = self._$show.add($target);
                } else {
                    self._$hide = self._$hide.add($target);
                }
            }
            
            self._execAction('_filter', 1); 
        },
        
        /**
         * Sort (private)
         * @since 2.0.0
         */
        
        _sort: function(){
            var self = this,
                arrayShuffle = function(oldArray){
                    var newArray = oldArray.slice(),
                        len = newArray.length,
                        i = len;

                    while(i--){
                        var p = parseInt(Math.random()*len);
                        var t = newArray[i];
                        newArray[i] = newArray[p];
                        newArray[p] = t;
                    };
                    return newArray; 
                };
                
            self._execAction('_sort', 0);   
            
            self._startOrder = [];
            
            for(var i = 0; i < self._$targets.length; i++){
                var target = self._$targets[i];
                
                self._startOrder.push(target);
            }
            
            switch(self._newSort[0].sortBy){
                case 'default':
                    self._newOrder = self._origOrder;
                    break;
                case 'random':
                    self._newOrder = arrayShuffle(self._startOrder);
                    break;
                case 'custom':
                    self._newOrder = self._newSort[0].order;
                    break;
                default:
                    self._newOrder = self._startOrder.concat().sort(function(a, b){
                        return self._compare(a, b);
                    });
            }
            
            self._execAction('_sort', 1);   
        },
        
        /**
         * Compare Algorithm
         * @since 2.0.0
         * @param {string|number} a
         * @param {string|number} b
         * @param {number} depth (recursion)
         * @return {number}
         */
        
        _compare: function(a, b, depth){
            depth = depth ? depth : 0;
        
            var self = this,
                order = self._newSort[depth].order,
                getData = function(el){
                    return el.dataset[self._newSort[depth].sortBy] || 0;
                },
                attrA = isNaN(getData(a) * 1) ? getData(a).toLowerCase() : getData(a) * 1,
                attrB = isNaN(getData(b) * 1) ? getData(b).toLowerCase() : getData(b) * 1;
                
            if(attrA < attrB)
                return order == 'asc' ? -1 : 1;
            if(attrA > attrB)
                return order == 'asc' ? 1 : -1;
            if(attrA == attrB && self._newSort.length > depth+1)
                return self._compare(a, b, depth+1);

            return 0;
        },
        
        /**
         * Print Sort
         * @since 2.0.0
         * @param {boolean} reset
         */
        
        _printSort: function(reset){
            var self = this,
                order = reset ? self._startOrder : self._newOrder,
                targets = self._$parent[0].querySelectorAll(self.selectors.target),
                nextSibling = targets[targets.length -1].nextElementSibling,
                frag = document.createDocumentFragment();
                
            self._execAction('_printSort', 0, arguments);
            
            for(var i = 0; i < targets.length; i++){
                var target = targets[i],
                    whiteSpace = target.nextSibling;

                if(target.style.position === 'absolute') continue;
            
                if(whiteSpace && whiteSpace.nodeName == '#text'){
                    self._$parent[0].removeChild(whiteSpace);
                }
                
                self._$parent[0].removeChild(target);
            }
            
            for(var i = 0; i < order.length; i++){
                var el = order[i];

                if(self._newSort[0].sortBy == 'default' && self._newSort[0].order == 'desc' && !reset){
                    var firstChild = frag.firstChild;
                    frag.insertBefore(el, firstChild);
                    frag.insertBefore(document.createTextNode(' '), el);
                } else {
                    frag.appendChild(el);
                    frag.appendChild(document.createTextNode(' '));
                }
            }
            
            nextSibling ? 
                self._$parent[0].insertBefore(frag, nextSibling) :
                self._$parent[0].appendChild(frag);
                
            self._execAction('_printSort', 1, arguments);
        },
        
        /**
         * Parse Sort
         * @since 2.0.0
         * @param {string} sortString
         * @return {array} newSort
         */
        
        _parseSort: function(sortString){
            var self = this,
                rules = typeof sortString === 'string' ? sortString.split(' ') : [sortString],
                newSort = [];
                
            for(var i = 0; i < rules.length; i++){
                var rule = typeof sortString === 'string' ? rules[i].split(':') : ['custom', rules[i]],
                    ruleObj = {
                        sortBy: self._helpers._camelCase(rule[0]),
                        order: rule[1] || 'asc'
                    };
                    
                newSort.push(ruleObj);
                
                if(ruleObj.sortBy == 'default' || ruleObj.sortBy == 'random') break;
            }
            
            return self._execFilter('_parseSort', newSort, arguments);
        },
        
        /**
         * Parse Effects
         * @since 2.0.0
         * @return {object} effects
         */
        
        _parseEffects: function(){
            var self = this,
                effects = {
                    opacity: '',
                    transformIn: '',
                    transformOut: '',
                    filter: ''
                },
                parse = function(effect, extract, reverse){
                    if(self.animation.effects.indexOf(effect) > -1){
                        if(extract){
                            var propIndex = self.animation.effects.indexOf(effect+'(');
                            if(propIndex > -1){
                                var str = self.animation.effects.substring(propIndex),
                                    match = /\(([^)]+)\)/.exec(str),
                                    val = match[1];

                                    return {val: val};
                            }
                        }
                        return true;
                    } else {
                        return false;
                    }
                },
                negate = function(value, invert){
                    if(invert){
                        return value.charAt(0) === '-' ? value.substr(1, value.length) : '-'+value;
                    } else {
                        return value;
                    }
                },
                buildTransform = function(key, invert){
                    var transforms = [
                        ['scale', '.01'],
                        ['translateX', '20px'],
                        ['translateY', '20px'],
                        ['translateZ', '20px'],
                        ['rotateX', '90deg'],
                        ['rotateY', '90deg'],
                        ['rotateZ', '180deg'],
                    ];
                    
                    for(var i = 0; i < transforms.length; i++){
                        var prop = transforms[i][0],
                            def = transforms[i][1],
                            inverted = invert && prop !== 'scale';
                            
                        effects[key] += parse(prop) ? prop+'('+negate(parse(prop, true).val || def, inverted)+') ' : '';
                    }
                };
            
            effects.opacity = parse('fade') ? parse('fade',true).val || '0' : '';
            
            buildTransform('transformIn');
            
            self.animation.reverseOut ? buildTransform('transformOut', true) : (effects.transformOut = effects.transformIn);

            effects.transition = {};
            
            effects.transition = self._getPrefixedCSS('transition','all '+self.animation.duration+'ms '+self.animation.easing+', opacity '+self.animation.duration+'ms linear');
        
            self.animation.stagger = parse('stagger') ? true : false;
            self.animation.staggerDuration = parseInt(parse('stagger') ? (parse('stagger',true).val ? parse('stagger',true).val : 100) : 100);

            return self._execFilter('_parseEffects', effects);
        },
        
        /**
         * Build State
         * @since 2.0.0
         * @param {boolean} future
         * @return {object} futureState
         */
        
        _buildState: function(future){
            var self = this,
                state = {};
            
            self._execAction('_buildState', 0);
            
            state = {
                activeFilter: self._activeFilter === '' ? 'none' : self._activeFilter,
                activeSort: future && self._newSortString ? self._newSortString : self._activeSort,
                fail: !self._$show.length && self._activeFilter !== '',
                $targets: self._$targets,
                $show: self._$show,
                $hide: self._$hide,
                totalTargets: self._$targets.length,
                totalShow: self._$show.length,
                totalHide: self._$hide.length,
                display: future && self._newDisplay ? self._newDisplay : self.layout.display
            };
            
            if(future){
                return self._execFilter('_buildState', state);
            } else {
                self._state = state;
                
                self._execAction('_buildState', 1);
            }
        },
        
        /**
         * Go Mix
         * @since 2.0.0
         * @param {boolean} animate
         */
        
        _goMix: function(animate){
            var self = this,
                phase1 = function(){
                    if(self._chrome && (self._chrome === 31)){
                        chromeFix(self._$parent[0]);
                    }
                    
                    self._setInter();
                    
                    phase2();
                },
                phase2 = function(){
                    var scrollTop = window.pageYOffset,
                        scrollLeft = window.pageXOffset,
                        docHeight = document.documentElement.scrollHeight;

                    self._getInterMixData();
                    
                    self._setFinal();

                    self._getFinalMixData();

                    (window.pageYOffset !== scrollTop) && window.scrollTo(scrollLeft, scrollTop);

                    self._prepTargets();
                    
                    if(window.requestAnimationFrame){
                        requestAnimationFrame(phase3);
                    } else {
                        setTimeout(function(){
                            phase3();
                        },20);
                    }
                },
                phase3 = function(){
                    self._animateTargets();

                    if(self._targetsBound === 0){
                        self._cleanUp();
                    }
                },
                chromeFix = function(grid){
                    var parent = grid.parentElement,
                        placeholder = document.createElement('div'),
                        frag = document.createDocumentFragment();

                    parent.insertBefore(placeholder, grid);
                    frag.appendChild(grid);
                    parent.replaceChild(grid, placeholder);
                },
                futureState = self._buildState(true);
                
            self._execAction('_goMix', 0, arguments);
                
            !self.animation.duration && (animate = false);

            self._mixing = true;
            
            self._$container.removeClass(self.layout.containerClassFail);
            
            if(typeof self.callbacks.onMixStart === 'function'){
                self.callbacks.onMixStart.call(self._domNode, self._state, futureState, self);
            }
            
            self._$container.trigger('mixStart', [self._state, futureState, self]);
            
            self._getOrigMixData();
            
            if(animate && !self._suckMode){
            
                window.requestAnimationFrame ?
                    requestAnimationFrame(phase1) :
                    phase1();
            
            } else {
                self._cleanUp();
            }
            
            self._execAction('_goMix', 1, arguments);
        },
        
        /**
         * Get Target Data
         * @since 2.0.0
         */
        
        _getTargetData: function(el, stage){
            var self = this,
                elStyle;
            
            el.dataset[stage+'PosX'] = el.offsetLeft;
            el.dataset[stage+'PosY'] = el.offsetTop;

            if(self.animation.animateResizeTargets){
                elStyle = window.getComputedStyle(el);
            
                el.dataset[stage+'MarginBottom'] = parseInt(elStyle.marginBottom);
                el.dataset[stage+'MarginRight'] = parseInt(elStyle.marginRight);
                el.dataset[stage+'Width'] = el.offsetWidth;
                el.dataset[stage+'Height'] = el.offsetHeight;
            }
        },
        
        /**
         * Get Original Mix Data
         * @since 2.0.0
         */
        
        _getOrigMixData: function(){
            var self = this,
                parentStyle = !self._suckMode ? window.getComputedStyle(self._$parent[0]) : {boxSizing: ''},
                parentBS = parentStyle.boxSizing || parentStyle[self._vendor+'BoxSizing'];
    
            self._incPadding = (parentBS === 'border-box');
            
            self._execAction('_getOrigMixData', 0);
            
            !self._suckMode && (self.effects = self._parseEffects());
        
            self._$toHide = self._$hide.filter(':visible');
            self._$toShow = self._$show.filter(':hidden');
            self._$pre = self._$targets.filter(':visible');

            self._startHeight = self._incPadding ? 
                self._$parent.outerHeight() : 
                self._$parent.height();
                
            for(var i = 0; i < self._$pre.length; i++){
                var el = self._$pre[i];
                
                self._getTargetData(el, 'orig');
            }
            
            self._execAction('_getOrigMixData', 1);
        },
        
        /**
         * Set Intermediate Positions
         * @since 2.0.0
         */
        
        _setInter: function(){
            var self = this;
            
            self._execAction('_setInter', 0);
            
            if(self._changingLayout && self.animation.animateChangeLayout){
                self._$toShow.css('display',self._newDisplay);

                if(self._changingClass){
                    self._$container
                        .removeClass(self.layout.containerClass)
                        .addClass(self._newClass);
                }
            } else {
                self._$toShow.css('display', self.layout.display);
            }
            
            self._execAction('_setInter', 1);
        },
        
        /**
         * Get Intermediate Mix Data
         * @since 2.0.0
         */
        
        _getInterMixData: function(){
            var self = this;
            
            self._execAction('_getInterMixData', 0);
            
            for(var i = 0; i < self._$toShow.length; i++){
                var el = self._$toShow[i];
                    
                self._getTargetData(el, 'inter');
            }
            
            for(var i = 0; i < self._$pre.length; i++){
                var el = self._$pre[i];
                    
                self._getTargetData(el, 'inter');
            }
            
            self._execAction('_getInterMixData', 1);
        },
        
        /**
         * Set Final Positions
         * @since 2.0.0
         */
        
        _setFinal: function(){
            var self = this;
            
            self._execAction('_setFinal', 0);
            
            self._sorting && self._printSort();

            self._$toHide.removeStyle('display');
            
            if(self._changingLayout && self.animation.animateChangeLayout){
                self._$pre.css('display',self._newDisplay);
            }
            
            self._execAction('_setFinal', 1);
        },
        
        /**
         * Get Final Mix Data
         * @since 2.0.0
         */
        
        _getFinalMixData: function(){
            var self = this;
            
            self._execAction('_getFinalMixData', 0);
    
            for(var i = 0; i < self._$toShow.length; i++){
                var el = self._$toShow[i];
                    
                self._getTargetData(el, 'final');
            }
            
            for(var i = 0; i < self._$pre.length; i++){
                var el = self._$pre[i];
                    
                self._getTargetData(el, 'final');
            }
            
            self._newHeight = self._incPadding ? 
                self._$parent.outerHeight() : 
                self._$parent.height();

            self._sorting && self._printSort(true);
    
            self._$toShow.removeStyle('display');
            
            self._$pre.css('display',self.layout.display);
            
            if(self._changingClass && self.animation.animateChangeLayout){
                self._$container
                    .removeClass(self._newClass)
                    .addClass(self.layout.containerClass);
            }
            
            self._execAction('_getFinalMixData', 1);
        },
        
        /**
         * Prepare Targets
         * @since 2.0.0
         */
        
        _prepTargets: function(){
            var self = this,
                transformCSS = {
                    _in: self._getPrefixedCSS('transform', self.effects.transformIn),
                    _out: self._getPrefixedCSS('transform', self.effects.transformOut)
                };

            self._execAction('_prepTargets', 0);
            
            if(self.animation.animateResizeContainer){
                self._$parent.css('height',self._startHeight+'px');
            }
            
            for(var i = 0; i < self._$toShow.length; i++){
                var el = self._$toShow[i],
                    $el = $(el);
                
                el.style.opacity = self.effects.opacity;
                el.style.display = (self._changingLayout && self.animation.animateChangeLayout) ?
                    self._newDisplay :
                    self.layout.display;
                    
                $el.css(transformCSS._in);
                
                if(self.animation.animateResizeTargets){
                    el.style.width = el.dataset.finalWidth+'px';
                    el.style.height = el.dataset.finalHeight+'px';
                    el.style.marginRight = -(el.dataset.finalWidth - el.dataset.interWidth) + (el.dataset.finalMarginRight * 1)+'px';
                    el.style.marginBottom = -(el.dataset.finalHeight - el.dataset.interHeight) + (el.dataset.finalMarginBottom * 1)+'px';
                }   
            }

            for(var i = 0; i < self._$pre.length; i++){
                var el = self._$pre[i],
                    $el = $(el),
                    translate = {
                        x: el.dataset.origPosX - el.dataset.interPosX,
                        y: el.dataset.origPosY - el.dataset.interPosY
                    },
                    transformCSS = self._getPrefixedCSS('transform','translate('+translate.x+'px,'+translate.y+'px)');

                $el.css(transformCSS);
                
                if(self.animation.animateResizeTargets){        
                    el.style.width = el.dataset.origWidth+'px';
                    el.style.height = el.dataset.origHeight+'px';
                    
                    if(el.dataset.origWidth - el.dataset.finalWidth){
                        el.style.marginRight = -(el.dataset.origWidth - el.dataset.interWidth) + (el.dataset.origMarginRight * 1)+'px';
                    }
                    
                    if(el.dataset.origHeight - el.dataset.finalHeight){
                        el.style.marginBottom = -(el.dataset.origHeight - el.dataset.interHeight) + (el.dataset.origMarginBottom * 1) +'px';
                    }
                }
            }
            
            self._execAction('_prepTargets', 1);
        },
        
        /**
         * Animate Targets
         * @since 2.0.0
         */
        
        _animateTargets: function(){
            var self = this;

            self._execAction('_animateTargets', 0);
            
            self._targetsDone = 0;
            self._targetsBound = 0;
            
            self._$parent
                .css(self._getPrefixedCSS('perspective', self.animation.perspectiveDistance+'px'))
                .css(self._getPrefixedCSS('perspective-origin', self.animation.perspectiveOrigin));
            
            if(self.animation.animateResizeContainer){
                self._$parent
                    .css(self._getPrefixedCSS('transition','height '+self.animation.duration+'ms ease'))
                    .css('height',self._newHeight+'px');
            }
            
            for(var i = 0; i < self._$toShow.length; i++){
                var el = self._$toShow[i],
                    $el = $(el),
                    translate = {
                        x: el.dataset.finalPosX - el.dataset.interPosX,
                        y: el.dataset.finalPosY - el.dataset.interPosY
                    },
                    delay = self._getDelay(i),
                    toShowCSS = {};
                
                el.style.opacity = '';
                
                for(var j = 0; j < 2; j++){
                    var a = j === 0 ? a = self._prefix : '';
                    
                    if(self._ff && self._ff <= 20){
                        toShowCSS[a+'transition-property'] = 'all';
                        toShowCSS[a+'transition-timing-function'] = self.animation.easing+'ms';
                        toShowCSS[a+'transition-duration'] = self.animation.duration+'ms';
                    }
                    
                    toShowCSS[a+'transition-delay'] = delay+'ms';
                    toShowCSS[a+'transform'] = 'translate('+translate.x+'px,'+translate.y+'px)';
                }
                
                if(self.effects.transform || self.effects.opacity){
                    self._bindTargetDone($el);
                }
                
                (self._ff && self._ff <= 20) ? 
                    $el.css(toShowCSS) : 
                    $el.css(self.effects.transition).css(toShowCSS);
            }
            
            for(var i = 0; i < self._$pre.length; i++){
                var el = self._$pre[i],
                    $el = $(el),
                    translate = {
                        x: el.dataset.finalPosX - el.dataset.interPosX,
                        y: el.dataset.finalPosY - el.dataset.interPosY
                    },
                    delay = self._getDelay(i);
                    
                if(!(
                    el.dataset.finalPosX === el.dataset.origPosX &&
                    el.dataset.finalPosY === el.dataset.origPosY
                )){
                    self._bindTargetDone($el);
                }
                
                $el.css(self._getPrefixedCSS('transition', 'all '+self.animation.duration+'ms '+self.animation.easing+' '+delay+'ms'));
                $el.css(self._getPrefixedCSS('transform', 'translate('+translate.x+'px,'+translate.y+'px)'));
                
                if(self.animation.animateResizeTargets){
                    if(el.dataset.origWidth - el.dataset.finalWidth && el.dataset.finalWidth * 1){
                        el.style.width = el.dataset.finalWidth+'px';
                        el.style.marginRight = -(el.dataset.finalWidth - el.dataset.interWidth)+(el.dataset.finalMarginRight * 1)+'px';
                    }
                    
                    if(el.dataset.origHeight - el.dataset.finalHeight && el.dataset.finalHeight * 1){
                        el.style.height = el.dataset.finalHeight+'px';
                        el.style.marginBottom = -(el.dataset.finalHeight - el.dataset.interHeight)+(el.dataset.finalMarginBottom * 1) +'px';
                    }   
                }
            }
            
            if(self._changingClass){
                self._$container
                    .removeClass(self.layout.containerClass)
                    .addClass(self._newClass);
            }
            
            for(var i = 0; i < self._$toHide.length; i++){
                var el = self._$toHide[i],
                    $el = $(el),
                    delay = self._getDelay(i),
                    toHideCSS = {};

                for(var j = 0; j<2; j++){
                    var a = j === 0 ? a = self._prefix : '';

                    toHideCSS[a+'transition-delay'] = delay+'ms';
                    toHideCSS[a+'transform'] = self.effects.transformOut;
                    toHideCSS.opacity = self.effects.opacity;
                }
                
                $el.css(self.effects.transition).css(toHideCSS);
            
                if(self.effects.transform || self.effects.opacity){
                    self._bindTargetDone($el);
                };
            }
            
            self._execAction('_animateTargets', 1);

        },
        
        /**
         * Bind Targets TransitionEnd
         * @since 2.0.0
         * @param {object} $el
         */
        
        _bindTargetDone: function($el){
            var self = this,
                el = $el[0];
                
            self._execAction('_bindTargetDone', 0, arguments);
            
            if(!el.dataset.bound){
                
                el.dataset.bound = true;
                self._targetsBound++;
            
                $el.on('webkitTransitionEnd.mixItUp transitionend.mixItUp',function(e){
                    if(
                        (e.originalEvent.propertyName.indexOf('transform') > -1 || 
                        e.originalEvent.propertyName.indexOf('opacity') > -1) &&
                        $(e.originalEvent.target).is(self.selectors.target)
                    ){
                        $el.off('.mixItUp');
                        delete el.dataset.bound;
                        self._targetDone();
                    }
                });
            }
            
            self._execAction('_bindTargetDone', 1, arguments);
        },
        
        /**
         * Target Done
         * @since 2.0.0
         */
        
        _targetDone: function(){
            var self = this;
            
            self._execAction('_targetDone', 0);
            
            self._targetsDone++;
            
            (self._targetsDone === self._targetsBound) && self._cleanUp();
            
            self._execAction('_targetDone', 1);
        },
        
        /**
         * Clean Up
         * @since 2.0.0
         */
        
        _cleanUp: function(){
            var self = this,
                targetStyles = self.animation.animateResizeTargets ? 'transform opacity width height margin-bottom margin-right' : 'transform opacity';
                unBrake = function(){
                    self._$targets.removeStyle('transition', self._prefix);
                };
                
            self._execAction('_cleanUp', 0);
            
            !self._changingLayout ?
                self._$show.css('display',self.layout.display) :
                self._$show.css('display',self._newDisplay);
            
            self._$targets.css(self._brake);
            
            self._$targets
                .removeStyle(targetStyles, self._prefix)
                .removeAttr('data-inter-pos-x data-inter-pos-y data-final-pos-x data-final-pos-y data-orig-pos-x data-orig-pos-y data-orig-height data-orig-width data-final-height data-final-width data-inter-width data-inter-height data-orig-margin-right data-orig-margin-bottom data-inter-margin-right data-inter-margin-bottom data-final-margin-right data-final-margin-bottom');
                
            self._$hide.removeStyle('display');
            
            self._$parent.removeStyle('height transition perspective-distance perspective perspective-origin-x perspective-origin-y perspective-origin perspectiveOrigin', self._prefix);
            
            if(self._sorting){
                self._printSort();
                self._activeSort = self._newSortString;
                self._sorting = false;
            }
            
            if(self._changingLayout){
                if(self._changingDisplay){
                    self.layout.display = self._newDisplay;
                    self._changingDisplay = false;
                }
                
                if(self._changingClass){
                    self._$parent.removeClass(self.layout.containerClass).addClass(self._newClass);
                    self.layout.containerClass = self._newClass;
                    self._changingClass = false;
                }
                
                self._changingLayout = false;
            }
            
            self._refresh();
            
            self._buildState();
            
            if(self._state.fail){
                self._$container.addClass(self.layout.containerClassFail);
            }
            
            self._$show = $();
            self._$hide = $();
            
            if(window.requestAnimationFrame){
                requestAnimationFrame(unBrake);
            }
            
            self._mixing = false;
            
            if(typeof self.callbacks._user === 'function'){
                self.callbacks._user.call(self._domNode, self._state, self);
            }
            
            if(typeof self.callbacks.onMixEnd === 'function'){
                self.callbacks.onMixEnd.call(self._domNode, self._state, self);
            }
            
            self._$container.trigger('mixEnd', [self._state, self]);
            
            if(self._state.fail){
                (typeof self.callbacks.onMixFail === 'function') && self.callbacks.onMixFail.call(self._domNode, self._state, self);
                self._$container.trigger('mixFail', [self._state, self]);
            }
            
            if(self._loading){
                (typeof self.callbacks.onMixLoad === 'function') && self.callbacks.onMixLoad.call(self._domNode, self._state, self);
                self._$container.trigger('mixLoad', [self._state, self]);
            }
            
            if(self._queue.length){
                self._execAction('_queue', 0);
                
                self.multiMix(self._queue[0][0],self._queue[0][1],self._queue[0][2]);
                self._queue.splice(0, 1);
            }
            
            self._execAction('_cleanUp', 1);
            
            self._loading = false;
        },
        
        /**
         * Get Prefixed CSS
         * @since 2.0.0
         * @param {string} property
         * @param {string} value
         * @param {boolean} prefixValue
         * @return {object} styles
         */
        
        _getPrefixedCSS: function(property, value, prefixValue){
            var self = this,
                styles = {};
        
            for(i = 0; i < 2; i++){
                var prefix = i === 0 ? self._prefix : '';
                prefixValue ? styles[prefix+property] = prefix+value : styles[prefix+property] = value;
            }
            
            return self._execFilter('_getPrefixedCSS', styles, arguments);
        },
        
        /**
         * Get Delay
         * @since 2.0.0
         * @param {number} i
         * @return {number} delay
         */
        
        _getDelay: function(i){
            var self = this,
                n = typeof self.animation.staggerFunction === 'function' ? self.animation.staggerFunction.call(self._domNode, i, self._state) : i,
                delay = self.animation.stagger ?  n * self.animation.staggerDuration : 0;
                
            return self._execFilter('_getDelay', delay, arguments);
        },
        
        /**
         * Parse MultiMix Arguments
         * @since 2.0.0
         * @param {array} args
         * @return {object} output
         */
        
        _parseMultiMixArgs: function(args){
            var self = this,
                output = {
                    command: null,
                    animate: self.animation.enable,
                    callback: null
                };
                
            for(var i = 0; i < args.length; i++){
                var arg = args[i];

                if(arg !== null){   
                    if(typeof arg === 'object' || typeof arg === 'string'){
                        output.command = arg;
                    } else if(typeof arg === 'boolean'){
                        output.animate = arg;
                    } else if(typeof arg === 'function'){
                        output.callback = arg;
                    }
                }
            }
            
            return self._execFilter('_parseMultiMixArgs', output, arguments);
        },
        
        /**
         * Parse Insert Arguments
         * @since 2.0.0
         * @param {array} args
         * @return {object} output
         */
        
        _parseInsertArgs: function(args){
            var self = this,
                output = {
                    index: 0,
                    $object: $(),
                    multiMix: {filter: self._state.activeFilter},
                    callback: null
                };
            
            for(var i = 0; i < args.length; i++){
                var arg = args[i];
                
                if(typeof arg === 'number'){
                    output.index = arg;
                } else if(typeof arg === 'object' && arg instanceof $){
                    output.$object = arg;
                } else if(typeof arg === 'object' && self._helpers._isElement(arg)){
                    output.$object = $(arg);
                } else if(typeof arg === 'object' && arg !== null){
                    output.multiMix = arg;
                } else if(typeof arg === 'boolean' && !arg){
                    output.multiMix = false;
                } else if(typeof arg === 'function'){
                    output.callback = arg;
                }
            }
            
            return self._execFilter('_parseInsertArgs', output, arguments);
        },
        
        /**
         * Execute Action
         * @since 2.0.0
         * @param {string} methodName
         * @param {boolean} isPost
         * @param {array} args
         */
        
        _execAction: function(methodName, isPost, args){
            var self = this,
                context = isPost ? 'post' : 'pre';

            if(!self._actions.isEmptyObject && self._actions.hasOwnProperty(methodName)){
                for(var key in self._actions[methodName][context]){
                    self._actions[methodName][context][key].call(self, args);
                }
            }
        },
        
        /**
         * Execute Filter
         * @since 2.0.0
         * @param {string} methodName
         * @param {mixed} value
         * @return {mixed} value
         */
        
        _execFilter: function(methodName, value, args){
            var self = this;
            
            if(!self._filters.isEmptyObject && self._filters.hasOwnProperty(methodName)){
                for(var key in self._filters[methodName]){
                    return self._filters[methodName][key].call(self, args);
                }
            } else {
                return value;
            }
        },
        
        /* Helpers
        ---------------------------------------------------------------------- */

        _helpers: {
            
            /**
             * CamelCase
             * @since 2.0.0
             * @param {string}
             * @return {string}
             */

            _camelCase: function(string){
                return string.replace(/-([a-z])/g, function(g){
                        return g[1].toUpperCase();
                });
            },
            
            /**
             * Is Element
             * @since 2.1.3
             * @param {object} element to test
             * @return {boolean}
             */
            
            _isElement: function(el){
                if(window.HTMLElement){
                    return el instanceof HTMLElement;
                } else {
                    return (
                        el !== null && 
                        el.nodeType === 1 &&
                        el.nodeName === 'string'
                    );
                }
            }
        },
        
        /* Public Methods
        ---------------------------------------------------------------------- */
        
        /**
         * Is Mixing
         * @since 2.0.0
         * @return {boolean}
         */
        
        isMixing: function(){
            var self = this;
            
            return self._execFilter('isMixing', self._mixing);
        },
        
        /**
         * Filter (public)
         * @since 2.0.0
         * @param {array} arguments
         */
        
        filter: function(){ 
            var self = this,
                args = self._parseMultiMixArgs(arguments);

            self._clicking && (self._toggleString = '');
            
            self.multiMix({filter: args.command}, args.animate, args.callback);
        },
        
        /**
         * Sort (public)
         * @since 2.0.0
         * @param {array} arguments
         */
        
        sort: function(){
            var self = this,
                args = self._parseMultiMixArgs(arguments);

            self.multiMix({sort: args.command}, args.animate, args.callback);
        },

        /**
         * Change Layout (public)
         * @since 2.0.0
         * @param {array} arguments
         */
        
        changeLayout: function(){
            var self = this,
                args = self._parseMultiMixArgs(arguments);
                
            self.multiMix({changeLayout: args.command}, args.animate, args.callback);
        },
        
        /**
         * MultiMix
         * @since 2.0.0
         * @param {array} arguments
         */     
        
        multiMix: function(){
            var self = this,
                args = self._parseMultiMixArgs(arguments);

            self._execAction('multiMix', 0, arguments);

            if(!self._mixing){
                if(self.controls.enable && !self._clicking){
                    self.controls.toggleFilterButtons && self._buildToggleArray();
                    self._updateControls(args.command, self.controls.toggleFilterButtons);
                }
                
                (self._queue.length < 2) && (self._clicking = false);
            
                delete self.callbacks._user;
                if(args.callback) self.callbacks._user = args.callback;
            
                var sort = args.command.sort,
                    filter = args.command.filter,
                    changeLayout = args.command.changeLayout;

                self._refresh();

                if(sort){
                    self._newSort = self._parseSort(sort);
                    self._newSortString = sort;
                    
                    self._sorting = true;
                    self._sort();
                }
                
                if(filter !== undf){
                    filter = (filter === 'all') ? self.selectors.target : filter;
    
                    self._activeFilter = filter;
                }
                
                self._filter();
                
                if(changeLayout){
                    self._newDisplay = (typeof changeLayout === 'string') ? changeLayout : changeLayout.display || self.layout.display;
                    self._newClass = changeLayout.containerClass || '';

                    if(
                        self._newDisplay !== self.layout.display ||
                        self._newClass !== self.layout.containerClass
                    ){
                        self._changingLayout = true;
                        
                        self._changingClass = (self._newClass !== self.layout.containerClass);
                        self._changingDisplay = (self._newDisplay !== self.layout.display);
                    }
                }
                
                self._$targets.css(self._brake);
                
                self._goMix(args.animate ^ self.animation.enable ? args.animate : self.animation.enable);
                
                self._execAction('multiMix', 1, arguments);
                
            } else {
                if(self.animation.queue && self._queue.length < self.animation.queueLimit){
                    self._queue.push(arguments);
                    
                    (self.controls.enable && !self._clicking) && self._updateControls(args.command);
                    
                    self._execAction('multiMixQueue', 1, arguments);
                    
                } else {
                    if(typeof self.callbacks.onMixBusy === 'function'){
                        self.callbacks.onMixBusy.call(self._domNode, self._state, self);
                    }
                    self._$container.trigger('mixBusy', [self._state, self]);
                    
                    self._execAction('multiMixBusy', 1, arguments);
                }
            }
        },
        
        /**
         * Insert
         * @since 2.0.0
         * @param {array} arguments
         */     
        
        insert: function(){
            var self = this,
                args = self._parseInsertArgs(arguments),
                callback = (typeof args.callback === 'function') ? args.callback : null,
                frag = document.createDocumentFragment(),
                target = (function(){
                    self._refresh();
                    
                    if(self._$targets.length){
                        return (args.index < self._$targets.length || !self._$targets.length) ? 
                            self._$targets[args.index] :
                            self._$targets[self._$targets.length-1].nextElementSibling;
                    } else {
                        return self._$parent[0].children[0];
                    }
                })();
                        
            self._execAction('insert', 0, arguments);
                
            if(args.$object){
                for(var i = 0; i < args.$object.length; i++){
                    var el = args.$object[i];
                    
                    frag.appendChild(el);
                    frag.appendChild(document.createTextNode(' '));
                }

                self._$parent[0].insertBefore(frag, target);
            }
            
            self._execAction('insert', 1, arguments);
            
            if(typeof args.multiMix === 'object'){
                self.multiMix(args.multiMix, callback);
            }
        },

        /**
         * Prepend
         * @since 2.0.0
         * @param {array} arguments
         */     
        
        prepend: function(){
            var self = this,
                args = self._parseInsertArgs(arguments);
                
            self.insert(0, args.$object, args.multiMix, args.callback);
        },
        
        /**
         * Append
         * @since 2.0.0
         * @param {array} arguments
         */
        
        append: function(){
            var self = this,
                args = self._parseInsertArgs(arguments);
        
            self.insert(self._state.totalTargets, args.$object, args.multiMix, args.callback);
        },
        
        /**
         * Get Option
         * @since 2.0.0
         * @param {string} string
         * @return {mixed} value
         */     
        
        getOption: function(string){
            var self = this,
                getProperty = function(obj, prop){
                    var parts = prop.split('.'),
                        last = parts.pop(),
                        l = parts.length,
                        i = 1,
                        current = parts[0] || prop;

                    while((obj = obj[current]) && i < l){
                        current = parts[i];
                        i++;
                    }

                    if(obj !== undf){
                        return obj[last] !== undf ? obj[last] : obj;
                    }
                };

            return string ? self._execFilter('getOption', getProperty(self, string), arguments) : self;
        },
        
        /**
         * Set Options
         * @since 2.0.0
         * @param {object} config
         */
        
        setOptions: function(config){
            var self = this;
            
            self._execAction('setOptions', 0, arguments);
            
            typeof config === 'object' && $.extend(true, self, config);
            
            self._execAction('setOptions', 1, arguments);
        },
        
        /**
         * Get State
         * @since 2.0.0
         * @return {object} state
         */
        
        getState: function(){
            var self = this;
            
            return self._execFilter('getState', self._state, self);
        },
        
        /**
         * Force Refresh
         * @since 2.1.2
         */
        
        forceRefresh: function(){
            var self = this;
            
            self._refresh(false, true);
        },
        
        /**
         * Destroy
         * @since 2.0.0
         * @param {boolean} hideAll
         */
        
        destroy: function(hideAll){
            var self = this;
            
            self._execAction('destroy', 0, arguments);
        
            self._$body
                .add($(self.selectors.sort))
                .add($(self.selectors.filter))
                .off('.mixItUp');
            
            for(var i = 0; i < self._$targets.length; i++){
                var target = self._$targets[i];

                hideAll && (target.style.display = '');

                delete target.mixParent;
            }
            
            self._execAction('destroy', 1, arguments);
            
            delete $.MixItUp.prototype._instances[self._id];
        }
        
    };
    
    /* jQuery Methods
    ---------------------------------------------------------------------- */
    
    /**
     * jQuery .mixItUp() method
     * @since 2.0.0
     * @extends $.fn
     */
    
    $.fn.mixItUp = function(){
        var args = arguments,
            dataReturn = [],
            eachReturn,
            _instantiate = function(domNode, settings){
                var instance = new $.MixItUp(),
                    rand = function(){
                        return ('00000'+(Math.random()*16777216<<0).toString(16)).substr(-6).toUpperCase();
                    };
                    
                instance._execAction('_instantiate', 0, arguments);

                domNode.id = !domNode.id ? 'MixItUp'+rand() : domNode.id;
                
                if(!instance._instances[domNode.id]){
                    instance._instances[domNode.id] = instance;
                    instance._init(domNode, settings);
                }
                
                instance._execAction('_instantiate', 1, arguments);
            };
            
        eachReturn = this.each(function(){
            if(args && typeof args[0] === 'string'){
                var instance = $.MixItUp.prototype._instances[this.id];
                if(args[0] == 'isLoaded'){
                    dataReturn.push(instance ? true : false);
                } else {
                    var data = instance[args[0]](args[1], args[2], args[3]);
                    if(data !== undf)dataReturn.push(data);
                }
            } else {
                _instantiate(this, args[0]);
            }
        });
        
        if(dataReturn.length){
            return dataReturn.length > 1 ? dataReturn : dataReturn[0];
        } else {
            return eachReturn;
        }
    };
    
    /**
     * jQuery .removeStyle() method
     * @since 2.0.0
     * @extends $.fn
     */
    
    $.fn.removeStyle = function(style, prefix){
        prefix = prefix ? prefix : '';
    
        return this.each(function(){
            var el = this,
                styles = style.split(' ');
                
            for(var i = 0; i < styles.length; i++){ 
                for(var j = 0; j < 2; j++){
                    var prop = j ? styles[i] : prefix+styles[i];
                    if(
                        el.style[prop] !== undf && 
                        typeof el.style[prop] !== 'unknown' &&
                        el.style[prop].length > 0
                    ){
                        el.style[prop] = '';
                    }
                    if(!prefix)break;
                }
            }
            
            if(el.attributes && el.attributes.style && el.attributes.style !== undf && el.attributes.style.nodeValue === ''){
                el.attributes.removeNamedItem('style');
            }
        });
    };
    
})(jQuery);

/*!
 * fancyBox - jQuery Plugin
 * version: 2.1.5 (Fri, 14 Jun 2013)
 * @requires jQuery v1.6 or later
 *
 * Examples at http://fancyapps.com/fancybox/
 * License: www.fancyapps.com/fancybox/#license
 *
 * Copyright 2012 Janis Skarnelis - janis@fancyapps.com
 *
 */

(function (window, document, $, undefined) {
    "use strict";

    var H = $("html"),
        W = $(window),
        D = $(document),
        F = $.fancybox = function () {
            F.open.apply( this, arguments );
        },
        IE =  navigator.userAgent.match(/msie/i),
        didUpdate   = null,
        isTouch     = document.createTouch !== undefined,

        isQuery = function(obj) {
            return obj && obj.hasOwnProperty && obj instanceof $;
        },
        isString = function(str) {
            return str && $.type(str) === "string";
        },
        isPercentage = function(str) {
            return isString(str) && str.indexOf('%') > 0;
        },
        isScrollable = function(el) {
            return (el && !(el.style.overflow && el.style.overflow === 'hidden') && ((el.clientWidth && el.scrollWidth > el.clientWidth) || (el.clientHeight && el.scrollHeight > el.clientHeight)));
        },
        getScalar = function(orig, dim) {
            var value = parseInt(orig, 10) || 0;

            if (dim && isPercentage(orig)) {
                value = F.getViewport()[ dim ] / 100 * value;
            }

            return Math.ceil(value);
        },
        getValue = function(value, dim) {
            return getScalar(value, dim) + 'px';
        };

    $.extend(F, {
        // The current version of fancyBox
        version: '2.1.5',

        defaults: {
            padding : 15,
            margin  : 20,

            width     : 800,
            height    : 600,
            minWidth  : 100,
            minHeight : 100,
            maxWidth  : 9999,
            maxHeight : 9999,
            pixelRatio: 1, // Set to 2 for retina display support

            autoSize   : true,
            autoHeight : false,
            autoWidth  : false,

            autoResize  : true,
            autoCenter  : !isTouch,
            fitToView   : true,
            aspectRatio : false,
            topRatio    : 0.5,
            leftRatio   : 0.5,

            scrolling : 'auto', // 'auto', 'yes' or 'no'
            wrapCSS   : '',

            arrows     : true,
            closeBtn   : true,
            closeClick : false,
            nextClick  : false,
            mouseWheel : true,
            autoPlay   : false,
            playSpeed  : 3000,
            preload    : 3,
            modal      : false,
            loop       : true,

            ajax  : {
                dataType : 'html',
                headers  : { 'X-fancyBox': true }
            },
            iframe : {
                scrolling : 'auto',
                preload   : true
            },
            swf : {
                wmode: 'transparent',
                allowfullscreen   : 'true',
                allowscriptaccess : 'always'
            },

            keys  : {
                next : {
                    13 : 'left', // enter
                    34 : 'up',   // page down
                    39 : 'left', // right arrow
                    40 : 'up'    // down arrow
                },
                prev : {
                    8  : 'right',  // backspace
                    33 : 'down',   // page up
                    37 : 'right',  // left arrow
                    38 : 'down'    // up arrow
                },
                close  : [27], // escape key
                play   : [32], // space - start/stop slideshow
                toggle : [70]  // letter "f" - toggle fullscreen
            },

            direction : {
                next : 'left',
                prev : 'right'
            },

            scrollOutside  : true,

            // Override some properties
            index   : 0,
            type    : null,
            href    : null,
            content : null,
            title   : null,

            // HTML templates
            tpl: {
                wrap     : '<div class="fancybox-wrap" tabIndex="-1"><div class="fancybox-skin"><div class="fancybox-outer"><div class="fancybox-inner"></div></div></div></div>',
                image    : '<img class="fancybox-image" src="{href}" alt="" />',
                iframe   : '<iframe id="fancybox-frame{rnd}" name="fancybox-frame{rnd}" class="fancybox-iframe" frameborder="0" vspace="0" hspace="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen' + (IE ? ' allowtransparency="true"' : '') + '></iframe>',
                error    : '<p class="fancybox-error">The requested content cannot be loaded.<br/>Please try again later.</p>',
                closeBtn : '<a title="Close" class="fancybox-item fancybox-close" href="javascript:;"></a>',
                next     : '<a title="Next" class="fancybox-nav fancybox-next" href="javascript:;"><span></span></a>',
                prev     : '<a title="Previous" class="fancybox-nav fancybox-prev" href="javascript:;"><span></span></a>'
            },

            // Properties for each animation type
            // Opening fancyBox
            openEffect  : 'fade', // 'elastic', 'fade' or 'none'
            openSpeed   : 250,
            openEasing  : 'swing',
            openOpacity : true,
            openMethod  : 'zoomIn',

            // Closing fancyBox
            closeEffect  : 'fade', // 'elastic', 'fade' or 'none'
            closeSpeed   : 250,
            closeEasing  : 'swing',
            closeOpacity : true,
            closeMethod  : 'zoomOut',

            // Changing next gallery item
            nextEffect : 'elastic', // 'elastic', 'fade' or 'none'
            nextSpeed  : 250,
            nextEasing : 'swing',
            nextMethod : 'changeIn',

            // Changing previous gallery item
            prevEffect : 'elastic', // 'elastic', 'fade' or 'none'
            prevSpeed  : 250,
            prevEasing : 'swing',
            prevMethod : 'changeOut',

            // Enable default helpers
            helpers : {
                overlay : true,
                title   : true
            },

            // Callbacks
            onCancel     : $.noop, // If canceling
            beforeLoad   : $.noop, // Before loading
            afterLoad    : $.noop, // After loading
            beforeShow   : $.noop, // Before changing in current item
            afterShow    : $.noop, // After opening
            beforeChange : $.noop, // Before changing gallery item
            beforeClose  : $.noop, // Before closing
            afterClose   : $.noop  // After closing
        },

        //Current state
        group    : {}, // Selected group
        opts     : {}, // Group options
        previous : null,  // Previous element
        coming   : null,  // Element being loaded
        current  : null,  // Currently loaded element
        isActive : false, // Is activated
        isOpen   : false, // Is currently open
        isOpened : false, // Have been fully opened at least once

        wrap  : null,
        skin  : null,
        outer : null,
        inner : null,

        player : {
            timer    : null,
            isActive : false
        },

        // Loaders
        ajaxLoad   : null,
        imgPreload : null,

        // Some collections
        transitions : {},
        helpers     : {},

        /*
         *  Static methods
         */

        open: function (group, opts) {
            if (!group) {
                return;
            }

            if (!$.isPlainObject(opts)) {
                opts = {};
            }

            // Close if already active
            if (false === F.close(true)) {
                return;
            }

            // Normalize group
            if (!$.isArray(group)) {
                group = isQuery(group) ? $(group).get() : [group];
            }

            // Recheck if the type of each element is `object` and set content type (image, ajax, etc)
            $.each(group, function(i, element) {
                var obj = {},
                    href,
                    title,
                    content,
                    type,
                    rez,
                    hrefParts,
                    selector;

                if ($.type(element) === "object") {
                    // Check if is DOM element
                    if (element.nodeType) {
                        element = $(element);
                    }

                    if (isQuery(element)) {
                        obj = {
                            href    : element.data('fancybox-href') || element.attr('href'),
                            title   : element.data('fancybox-title') || element.attr('title'),
                            isDom   : true,
                            element : element
                        };

                        if ($.metadata) {
                            $.extend(true, obj, element.metadata());
                        }

                    } else {
                        obj = element;
                    }
                }

                href  = opts.href  || obj.href || (isString(element) ? element : null);
                title = opts.title !== undefined ? opts.title : obj.title || '';

                content = opts.content || obj.content;
                type    = content ? 'html' : (opts.type  || obj.type);

                if (!type && obj.isDom) {
                    type = element.data('fancybox-type');

                    if (!type) {
                        rez  = element.prop('class').match(/fancybox\.(\w+)/);
                        type = rez ? rez[1] : null;
                    }
                }

                if (isString(href)) {
                    // Try to guess the content type
                    if (!type) {
                        if (F.isImage(href)) {
                            type = 'image';

                        } else if (F.isSWF(href)) {
                            type = 'swf';

                        } else if (href.charAt(0) === '#') {
                            type = 'inline';

                        } else if (isString(element)) {
                            type    = 'html';
                            content = element;
                        }
                    }

                    // Split url into two pieces with source url and content selector, e.g,
                    // "/mypage.html #my_id" will load "/mypage.html" and display element having id "my_id"
                    if (type === 'ajax') {
                        hrefParts = href.split(/\s+/, 2);
                        href      = hrefParts.shift();
                        selector  = hrefParts.shift();
                    }
                }

                if (!content) {
                    if (type === 'inline') {
                        if (href) {
                            content = $( isString(href) ? href.replace(/.*(?=#[^\s]+$)/, '') : href ); //strip for ie7

                        } else if (obj.isDom) {
                            content = element;
                        }

                    } else if (type === 'html') {
                        content = href;

                    } else if (!type && !href && obj.isDom) {
                        type    = 'inline';
                        content = element;
                    }
                }

                $.extend(obj, {
                    href     : href,
                    type     : type,
                    content  : content,
                    title    : title,
                    selector : selector
                });

                group[ i ] = obj;
            });

            // Extend the defaults
            F.opts = $.extend(true, {}, F.defaults, opts);

            // All options are merged recursive except keys
            if (opts.keys !== undefined) {
                F.opts.keys = opts.keys ? $.extend({}, F.defaults.keys, opts.keys) : false;
            }

            F.group = group;

            return F._start(F.opts.index);
        },

        // Cancel image loading or abort ajax request
        cancel: function () {
            var coming = F.coming;

            if (!coming || false === F.trigger('onCancel')) {
                return;
            }

            F.hideLoading();

            if (F.ajaxLoad) {
                F.ajaxLoad.abort();
            }

            F.ajaxLoad = null;

            if (F.imgPreload) {
                F.imgPreload.onload = F.imgPreload.onerror = null;
            }

            if (coming.wrap) {
                coming.wrap.stop(true, true).trigger('onReset').remove();
            }

            F.coming = null;

            // If the first item has been canceled, then clear everything
            if (!F.current) {
                F._afterZoomOut( coming );
            }
        },

        // Start closing animation if is open; remove immediately if opening/closing
        close: function (event) {
            F.cancel();

            if (false === F.trigger('beforeClose')) {
                return;
            }

            F.unbindEvents();

            if (!F.isActive) {
                return;
            }

            if (!F.isOpen || event === true) {
                $('.fancybox-wrap').stop(true).trigger('onReset').remove();

                F._afterZoomOut();

            } else {
                F.isOpen = F.isOpened = false;
                F.isClosing = true;

                $('.fancybox-item, .fancybox-nav').remove();

                F.wrap.stop(true, true).removeClass('fancybox-opened');

                F.transitions[ F.current.closeMethod ]();
            }
        },

        // Manage slideshow:
        //   $.fancybox.play(); - toggle slideshow
        //   $.fancybox.play( true ); - start
        //   $.fancybox.play( false ); - stop
        play: function ( action ) {
            var clear = function () {
                    clearTimeout(F.player.timer);
                },
                set = function () {
                    clear();

                    if (F.current && F.player.isActive) {
                        F.player.timer = setTimeout(F.next, F.current.playSpeed);
                    }
                },
                stop = function () {
                    clear();

                    D.unbind('.player');

                    F.player.isActive = false;

                    F.trigger('onPlayEnd');
                },
                start = function () {
                    if (F.current && (F.current.loop || F.current.index < F.group.length - 1)) {
                        F.player.isActive = true;

                        D.bind({
                            'onCancel.player beforeClose.player' : stop,
                            'onUpdate.player'   : set,
                            'beforeLoad.player' : clear
                        });

                        set();

                        F.trigger('onPlayStart');
                    }
                };

            if (action === true || (!F.player.isActive && action !== false)) {
                start();
            } else {
                stop();
            }
        },

        // Navigate to next gallery item
        next: function ( direction ) {
            var current = F.current;

            if (current) {
                if (!isString(direction)) {
                    direction = current.direction.next;
                }

                F.jumpto(current.index + 1, direction, 'next');
            }
        },

        // Navigate to previous gallery item
        prev: function ( direction ) {
            var current = F.current;

            if (current) {
                if (!isString(direction)) {
                    direction = current.direction.prev;
                }

                F.jumpto(current.index - 1, direction, 'prev');
            }
        },

        // Navigate to gallery item by index
        jumpto: function ( index, direction, router ) {
            var current = F.current;

            if (!current) {
                return;
            }

            index = getScalar(index);

            F.direction = direction || current.direction[ (index >= current.index ? 'next' : 'prev') ];
            F.router    = router || 'jumpto';

            if (current.loop) {
                if (index < 0) {
                    index = current.group.length + (index % current.group.length);
                }

                index = index % current.group.length;
            }

            if (current.group[ index ] !== undefined) {
                F.cancel();

                F._start(index);
            }
        },

        // Center inside viewport and toggle position type to fixed or absolute if needed
        reposition: function (e, onlyAbsolute) {
            var current = F.current,
                wrap    = current ? current.wrap : null,
                pos;

            if (wrap) {
                pos = F._getPosition(onlyAbsolute);

                if (e && e.type === 'scroll') {
                    delete pos.position;

                    wrap.stop(true, true).animate(pos, 200);

                } else {
                    wrap.css(pos);

                    current.pos = $.extend({}, current.dim, pos);
                }
            }
        },

        update: function (e) {
            var type = (e && e.type),
                anyway = !type || type === 'orientationchange';

            if (anyway) {
                clearTimeout(didUpdate);

                didUpdate = null;
            }

            if (!F.isOpen || didUpdate) {
                return;
            }

            didUpdate = setTimeout(function() {
                var current = F.current;

                if (!current || F.isClosing) {
                    return;
                }

                F.wrap.removeClass('fancybox-tmp');

                if (anyway || type === 'load' || (type === 'resize' && current.autoResize)) {
                    F._setDimension();
                }

                if (!(type === 'scroll' && current.canShrink)) {
                    F.reposition(e);
                }

                F.trigger('onUpdate');

                didUpdate = null;

            }, (anyway && !isTouch ? 0 : 300));
        },

        // Shrink content to fit inside viewport or restore if resized
        toggle: function ( action ) {
            if (F.isOpen) {
                F.current.fitToView = $.type(action) === "boolean" ? action : !F.current.fitToView;

                // Help browser to restore document dimensions
                if (isTouch) {
                    F.wrap.removeAttr('style').addClass('fancybox-tmp');

                    F.trigger('onUpdate');
                }

                F.update();
            }
        },

        hideLoading: function () {
            D.unbind('.loading');

            $('#fancybox-loading').remove();
        },

        showLoading: function () {
            var el, viewport;

            F.hideLoading();

            el = $('<div id="fancybox-loading"><div></div></div>').click(F.cancel).appendTo('body');

            // If user will press the escape-button, the request will be canceled
            D.bind('keydown.loading', function(e) {
                if ((e.which || e.keyCode) === 27) {
                    e.preventDefault();

                    F.cancel();
                }
            });

            if (!F.defaults.fixed) {
                viewport = F.getViewport();

                el.css({
                    position : 'absolute',
                    top  : (viewport.h * 0.5) + viewport.y,
                    left : (viewport.w * 0.5) + viewport.x
                });
            }
        },

        getViewport: function () {
            var locked = (F.current && F.current.locked) || false,
                rez    = {
                    x: W.scrollLeft(),
                    y: W.scrollTop()
                };

            if (locked) {
                rez.w = locked[0].clientWidth;
                rez.h = locked[0].clientHeight;

            } else {
                // See http://bugs.jquery.com/ticket/6724
                rez.w = isTouch && window.innerWidth  ? window.innerWidth  : W.width();
                rez.h = isTouch && window.innerHeight ? window.innerHeight : W.height();
            }

            return rez;
        },

        // Unbind the keyboard / clicking actions
        unbindEvents: function () {
            if (F.wrap && isQuery(F.wrap)) {
                F.wrap.unbind('.fb');
            }

            D.unbind('.fb');
            W.unbind('.fb');
        },

        bindEvents: function () {
            var current = F.current,
                keys;

            if (!current) {
                return;
            }

            // Changing document height on iOS devices triggers a 'resize' event,
            // that can change document height... repeating infinitely
            W.bind('orientationchange.fb' + (isTouch ? '' : ' resize.fb') + (current.autoCenter && !current.locked ? ' scroll.fb' : ''), F.update);

            keys = current.keys;

            if (keys) {
                D.bind('keydown.fb', function (e) {
                    var code   = e.which || e.keyCode,
                        target = e.target || e.srcElement;

                    // Skip esc key if loading, because showLoading will cancel preloading
                    if (code === 27 && F.coming) {
                        return false;
                    }

                    // Ignore key combinations and key events within form elements
                    if (!e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey && !(target && (target.type || $(target).is('[contenteditable]')))) {
                        $.each(keys, function(i, val) {
                            if (current.group.length > 1 && val[ code ] !== undefined) {
                                F[ i ]( val[ code ] );

                                e.preventDefault();
                                return false;
                            }

                            if ($.inArray(code, val) > -1) {
                                F[ i ] ();

                                e.preventDefault();
                                return false;
                            }
                        });
                    }
                });
            }

            if ($.fn.mousewheel && current.mouseWheel) {
                F.wrap.bind('mousewheel.fb', function (e, delta, deltaX, deltaY) {
                    var target = e.target || null,
                        parent = $(target),
                        canScroll = false;

                    while (parent.length) {
                        if (canScroll || parent.is('.fancybox-skin') || parent.is('.fancybox-wrap')) {
                            break;
                        }

                        canScroll = isScrollable( parent[0] );
                        parent    = $(parent).parent();
                    }

                    if (delta !== 0 && !canScroll) {
                        if (F.group.length > 1 && !current.canShrink) {
                            if (deltaY > 0 || deltaX > 0) {
                                F.prev( deltaY > 0 ? 'down' : 'left' );

                            } else if (deltaY < 0 || deltaX < 0) {
                                F.next( deltaY < 0 ? 'up' : 'right' );
                            }

                            e.preventDefault();
                        }
                    }
                });
            }
        },

        trigger: function (event, o) {
            var ret, obj = o || F.coming || F.current;

            if (!obj) {
                return;
            }

            if ($.isFunction( obj[event] )) {
                ret = obj[event].apply(obj, Array.prototype.slice.call(arguments, 1));
            }

            if (ret === false) {
                return false;
            }

            if (obj.helpers) {
                $.each(obj.helpers, function (helper, opts) {
                    if (opts && F.helpers[helper] && $.isFunction(F.helpers[helper][event])) {
                        F.helpers[helper][event]($.extend(true, {}, F.helpers[helper].defaults, opts), obj);
                    }
                });
            }

            D.trigger(event);
        },

        isImage: function (str) {
            return isString(str) && str.match(/(^data:image\/.*,)|(\.(jp(e|g|eg)|gif|png|bmp|webp|svg)((\?|#).*)?$)/i);
        },

        isSWF: function (str) {
            return isString(str) && str.match(/\.(swf)((\?|#).*)?$/i);
        },

        _start: function (index) {
            var coming = {},
                obj,
                href,
                type,
                margin,
                padding;

            index = getScalar( index );
            obj   = F.group[ index ] || null;

            if (!obj) {
                return false;
            }

            coming = $.extend(true, {}, F.opts, obj);

            // Convert margin and padding properties to array - top, right, bottom, left
            margin  = coming.margin;
            padding = coming.padding;

            if ($.type(margin) === 'number') {
                coming.margin = [margin, margin, margin, margin];
            }

            if ($.type(padding) === 'number') {
                coming.padding = [padding, padding, padding, padding];
            }

            // 'modal' propery is just a shortcut
            if (coming.modal) {
                $.extend(true, coming, {
                    closeBtn   : false,
                    closeClick : false,
                    nextClick  : false,
                    arrows     : false,
                    mouseWheel : false,
                    keys       : null,
                    helpers: {
                        overlay : {
                            closeClick : false
                        }
                    }
                });
            }

            // 'autoSize' property is a shortcut, too
            if (coming.autoSize) {
                coming.autoWidth = coming.autoHeight = true;
            }

            if (coming.width === 'auto') {
                coming.autoWidth = true;
            }

            if (coming.height === 'auto') {
                coming.autoHeight = true;
            }

            /*
             * Add reference to the group, so it`s possible to access from callbacks, example:
             * afterLoad : function() {
             *     this.title = 'Image ' + (this.index + 1) + ' of ' + this.group.length + (this.title ? ' - ' + this.title : '');
             * }
             */

            coming.group  = F.group;
            coming.index  = index;

            // Give a chance for callback or helpers to update coming item (type, title, etc)
            F.coming = coming;

            if (false === F.trigger('beforeLoad')) {
                F.coming = null;

                return;
            }

            type = coming.type;
            href = coming.href;

            if (!type) {
                F.coming = null;

                //If we can not determine content type then drop silently or display next/prev item if looping through gallery
                if (F.current && F.router && F.router !== 'jumpto') {
                    F.current.index = index;

                    return F[ F.router ]( F.direction );
                }

                return false;
            }

            F.isActive = true;

            if (type === 'image' || type === 'swf') {
                coming.autoHeight = coming.autoWidth = false;
                coming.scrolling  = 'visible';
            }

            if (type === 'image') {
                coming.aspectRatio = true;
            }

            if (type === 'iframe' && isTouch) {
                coming.scrolling = 'scroll';
            }

            // Build the neccessary markup
            coming.wrap = $(coming.tpl.wrap).addClass('fancybox-' + (isTouch ? 'mobile' : 'desktop') + ' fancybox-type-' + type + ' fancybox-tmp ' + coming.wrapCSS).appendTo( coming.parent || 'body' );

            $.extend(coming, {
                skin  : $('.fancybox-skin',  coming.wrap),
                outer : $('.fancybox-outer', coming.wrap),
                inner : $('.fancybox-inner', coming.wrap)
            });

            $.each(["Top", "Right", "Bottom", "Left"], function(i, v) {
                coming.skin.css('padding' + v, getValue(coming.padding[ i ]));
            });

            F.trigger('onReady');

            // Check before try to load; 'inline' and 'html' types need content, others - href
            if (type === 'inline' || type === 'html') {
                if (!coming.content || !coming.content.length) {
                    return F._error( 'content' );
                }

            } else if (!href) {
                return F._error( 'href' );
            }

            if (type === 'image') {
                F._loadImage();

            } else if (type === 'ajax') {
                F._loadAjax();

            } else if (type === 'iframe') {
                F._loadIframe();

            } else {
                F._afterLoad();
            }
        },

        _error: function ( type ) {
            $.extend(F.coming, {
                type       : 'html',
                autoWidth  : true,
                autoHeight : true,
                minWidth   : 0,
                minHeight  : 0,
                scrolling  : 'no',
                hasError   : type,
                content    : F.coming.tpl.error
            });

            F._afterLoad();
        },

        _loadImage: function () {
            // Reset preload image so it is later possible to check "complete" property
            var img = F.imgPreload = new Image();

            img.onload = function () {
                this.onload = this.onerror = null;

                F.coming.width  = this.width / F.opts.pixelRatio;
                F.coming.height = this.height / F.opts.pixelRatio;

                F._afterLoad();
            };

            img.onerror = function () {
                this.onload = this.onerror = null;

                F._error( 'image' );
            };

            img.src = F.coming.href;

            if (img.complete !== true) {
                F.showLoading();
            }
        },

        _loadAjax: function () {
            var coming = F.coming;

            F.showLoading();

            F.ajaxLoad = $.ajax($.extend({}, coming.ajax, {
                url: coming.href,
                error: function (jqXHR, textStatus) {
                    if (F.coming && textStatus !== 'abort') {
                        F._error( 'ajax', jqXHR );

                    } else {
                        F.hideLoading();
                    }
                },
                success: function (data, textStatus) {
                    if (textStatus === 'success') {
                        coming.content = data;

                        F._afterLoad();
                    }
                }
            }));
        },

        _loadIframe: function() {
            var coming = F.coming,
                iframe = $(coming.tpl.iframe.replace(/\{rnd\}/g, new Date().getTime()))
                    .attr('scrolling', isTouch ? 'auto' : coming.iframe.scrolling)
                    .attr('src', coming.href);

            // This helps IE
            $(coming.wrap).bind('onReset', function () {
                try {
                    $(this).find('iframe').hide().attr('src', '//about:blank').end().empty();
                } catch (e) {}
            });

            if (coming.iframe.preload) {
                F.showLoading();

                iframe.one('load', function() {
                    $(this).data('ready', 1);

                    // iOS will lose scrolling if we resize
                    if (!isTouch) {
                        $(this).bind('load.fb', F.update);
                    }

                    // Without this trick:
                    //   - iframe won't scroll on iOS devices
                    //   - IE7 sometimes displays empty iframe
                    $(this).parents('.fancybox-wrap').width('100%').removeClass('fancybox-tmp').show();

                    F._afterLoad();
                });
            }

            coming.content = iframe.appendTo( coming.inner );

            if (!coming.iframe.preload) {
                F._afterLoad();
            }
        },

        _preloadImages: function() {
            var group   = F.group,
                current = F.current,
                len     = group.length,
                cnt     = current.preload ? Math.min(current.preload, len - 1) : 0,
                item,
                i;

            for (i = 1; i <= cnt; i += 1) {
                item = group[ (current.index + i ) % len ];

                if (item.type === 'image' && item.href) {
                    new Image().src = item.href;
                }
            }
        },

        _afterLoad: function () {
            var coming   = F.coming,
                previous = F.current,
                placeholder = 'fancybox-placeholder',
                current,
                content,
                type,
                scrolling,
                href,
                embed;

            F.hideLoading();

            if (!coming || F.isActive === false) {
                return;
            }

            if (false === F.trigger('afterLoad', coming, previous)) {
                coming.wrap.stop(true).trigger('onReset').remove();

                F.coming = null;

                return;
            }

            if (previous) {
                F.trigger('beforeChange', previous);

                previous.wrap.stop(true).removeClass('fancybox-opened')
                    .find('.fancybox-item, .fancybox-nav')
                    .remove();
            }

            F.unbindEvents();

            current   = coming;
            content   = coming.content;
            type      = coming.type;
            scrolling = coming.scrolling;

            $.extend(F, {
                wrap  : current.wrap,
                skin  : current.skin,
                outer : current.outer,
                inner : current.inner,
                current  : current,
                previous : previous
            });

            href = current.href;

            switch (type) {
                case 'inline':
                case 'ajax':
                case 'html':
                    if (current.selector) {
                        content = $('<div>').html(content).find(current.selector);

                    } else if (isQuery(content)) {
                        if (!content.data(placeholder)) {
                            content.data(placeholder, $('<div class="' + placeholder + '"></div>').insertAfter( content ).hide() );
                        }

                        content = content.show().detach();

                        current.wrap.bind('onReset', function () {
                            if ($(this).find(content).length) {
                                content.hide().replaceAll( content.data(placeholder) ).data(placeholder, false);
                            }
                        });
                    }
                break;

                case 'image':
                    content = current.tpl.image.replace('{href}', href);
                break;

                case 'swf':
                    content = '<object id="fancybox-swf" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="100%" height="100%"><param name="movie" value="' + href + '"></param>';
                    embed   = '';

                    $.each(current.swf, function(name, val) {
                        content += '<param name="' + name + '" value="' + val + '"></param>';
                        embed   += ' ' + name + '="' + val + '"';
                    });

                    content += '<embed src="' + href + '" type="application/x-shockwave-flash" width="100%" height="100%"' + embed + '></embed></object>';
                break;
            }

            if (!(isQuery(content) && content.parent().is(current.inner))) {
                current.inner.append( content );
            }

            // Give a chance for helpers or callbacks to update elements
            F.trigger('beforeShow');

            // Set scrolling before calculating dimensions
            current.inner.css('overflow', scrolling === 'yes' ? 'scroll' : (scrolling === 'no' ? 'hidden' : scrolling));

            // Set initial dimensions and start position
            F._setDimension();

            F.reposition();

            F.isOpen = false;
            F.coming = null;

            F.bindEvents();

            if (!F.isOpened) {
                $('.fancybox-wrap').not( current.wrap ).stop(true).trigger('onReset').remove();

            } else if (previous.prevMethod) {
                F.transitions[ previous.prevMethod ]();
            }

            F.transitions[ F.isOpened ? current.nextMethod : current.openMethod ]();

            F._preloadImages();
        },

        _setDimension: function () {
            var viewport   = F.getViewport(),
                steps      = 0,
                canShrink  = false,
                canExpand  = false,
                wrap       = F.wrap,
                skin       = F.skin,
                inner      = F.inner,
                current    = F.current,
                width      = current.width,
                height     = current.height,
                minWidth   = current.minWidth,
                minHeight  = current.minHeight,
                maxWidth   = current.maxWidth,
                maxHeight  = current.maxHeight,
                scrolling  = current.scrolling,
                scrollOut  = current.scrollOutside ? current.scrollbarWidth : 0,
                margin     = current.margin,
                wMargin    = getScalar(margin[1] + margin[3]),
                hMargin    = getScalar(margin[0] + margin[2]),
                wPadding,
                hPadding,
                wSpace,
                hSpace,
                origWidth,
                origHeight,
                origMaxWidth,
                origMaxHeight,
                ratio,
                width_,
                height_,
                maxWidth_,
                maxHeight_,
                iframe,
                body;

            // Reset dimensions so we could re-check actual size
            wrap.add(skin).add(inner).width('auto').height('auto').removeClass('fancybox-tmp');

            wPadding = getScalar(skin.outerWidth(true)  - skin.width());
            hPadding = getScalar(skin.outerHeight(true) - skin.height());

            // Any space between content and viewport (margin, padding, border, title)
            wSpace = wMargin + wPadding;
            hSpace = hMargin + hPadding;

            origWidth  = isPercentage(width)  ? (viewport.w - wSpace) * getScalar(width)  / 100 : width;
            origHeight = isPercentage(height) ? (viewport.h - hSpace) * getScalar(height) / 100 : height;

            if (current.type === 'iframe') {
                iframe = current.content;

                if (current.autoHeight && iframe.data('ready') === 1) {
                    try {
                        if (iframe[0].contentWindow.document.location) {
                            inner.width( origWidth ).height(9999);

                            body = iframe.contents().find('body');

                            if (scrollOut) {
                                body.css('overflow-x', 'hidden');
                            }

                            origHeight = body.outerHeight(true);
                        }

                    } catch (e) {}
                }

            } else if (current.autoWidth || current.autoHeight) {
                inner.addClass( 'fancybox-tmp' );

                // Set width or height in case we need to calculate only one dimension
                if (!current.autoWidth) {
                    inner.width( origWidth );
                }

                if (!current.autoHeight) {
                    inner.height( origHeight );
                }

                if (current.autoWidth) {
                    origWidth = inner.width();
                }

                if (current.autoHeight) {
                    origHeight = inner.height();
                }

                inner.removeClass( 'fancybox-tmp' );
            }

            width  = getScalar( origWidth );
            height = getScalar( origHeight );

            ratio  = origWidth / origHeight;

            // Calculations for the content
            minWidth  = getScalar(isPercentage(minWidth) ? getScalar(minWidth, 'w') - wSpace : minWidth);
            maxWidth  = getScalar(isPercentage(maxWidth) ? getScalar(maxWidth, 'w') - wSpace : maxWidth);

            minHeight = getScalar(isPercentage(minHeight) ? getScalar(minHeight, 'h') - hSpace : minHeight);
            maxHeight = getScalar(isPercentage(maxHeight) ? getScalar(maxHeight, 'h') - hSpace : maxHeight);

            // These will be used to determine if wrap can fit in the viewport
            origMaxWidth  = maxWidth;
            origMaxHeight = maxHeight;

            if (current.fitToView) {
                maxWidth  = Math.min(viewport.w - wSpace, maxWidth);
                maxHeight = Math.min(viewport.h - hSpace, maxHeight);
            }

            maxWidth_  = viewport.w - wMargin;
            maxHeight_ = viewport.h - hMargin;

            if (current.aspectRatio) {
                if (width > maxWidth) {
                    width  = maxWidth;
                    height = getScalar(width / ratio);
                }

                if (height > maxHeight) {
                    height = maxHeight;
                    width  = getScalar(height * ratio);
                }

                if (width < minWidth) {
                    width  = minWidth;
                    height = getScalar(width / ratio);
                }

                if (height < minHeight) {
                    height = minHeight;
                    width  = getScalar(height * ratio);
                }

            } else {
                width = Math.max(minWidth, Math.min(width, maxWidth));

                if (current.autoHeight && current.type !== 'iframe') {
                    inner.width( width );

                    height = inner.height();
                }

                height = Math.max(minHeight, Math.min(height, maxHeight));
            }

            // Try to fit inside viewport (including the title)
            if (current.fitToView) {
                inner.width( width ).height( height );

                wrap.width( width + wPadding );

                // Real wrap dimensions
                width_  = wrap.width();
                height_ = wrap.height();

                if (current.aspectRatio) {
                    while ((width_ > maxWidth_ || height_ > maxHeight_) && width > minWidth && height > minHeight) {
                        if (steps++ > 19) {
                            break;
                        }

                        height = Math.max(minHeight, Math.min(maxHeight, height - 10));
                        width  = getScalar(height * ratio);

                        if (width < minWidth) {
                            width  = minWidth;
                            height = getScalar(width / ratio);
                        }

                        if (width > maxWidth) {
                            width  = maxWidth;
                            height = getScalar(width / ratio);
                        }

                        inner.width( width ).height( height );

                        wrap.width( width + wPadding );

                        width_  = wrap.width();
                        height_ = wrap.height();
                    }

                } else {
                    width  = Math.max(minWidth,  Math.min(width,  width  - (width_  - maxWidth_)));
                    height = Math.max(minHeight, Math.min(height, height - (height_ - maxHeight_)));
                }
            }

            if (scrollOut && scrolling === 'auto' && height < origHeight && (width + wPadding + scrollOut) < maxWidth_) {
                width += scrollOut;
            }

            inner.width( width ).height( height );

            wrap.width( width + wPadding );

            width_  = wrap.width();
            height_ = wrap.height();

            canShrink = (width_ > maxWidth_ || height_ > maxHeight_) && width > minWidth && height > minHeight;
            canExpand = current.aspectRatio ? (width < origMaxWidth && height < origMaxHeight && width < origWidth && height < origHeight) : ((width < origMaxWidth || height < origMaxHeight) && (width < origWidth || height < origHeight));

            $.extend(current, {
                dim : {
                    width   : getValue( width_ ),
                    height  : getValue( height_ )
                },
                origWidth  : origWidth,
                origHeight : origHeight,
                canShrink  : canShrink,
                canExpand  : canExpand,
                wPadding   : wPadding,
                hPadding   : hPadding,
                wrapSpace  : height_ - skin.outerHeight(true),
                skinSpace  : skin.height() - height
            });

            if (!iframe && current.autoHeight && height > minHeight && height < maxHeight && !canExpand) {
                inner.height('auto');
            }
        },

        _getPosition: function (onlyAbsolute) {
            var current  = F.current,
                viewport = F.getViewport(),
                margin   = current.margin,
                width    = F.wrap.width()  + margin[1] + margin[3],
                height   = F.wrap.height() + margin[0] + margin[2],
                rez      = {
                    position: 'absolute',
                    top  : margin[0],
                    left : margin[3]
                };

            if (current.autoCenter && current.fixed && !onlyAbsolute && height <= viewport.h && width <= viewport.w) {
                rez.position = 'fixed';

            } else if (!current.locked) {
                rez.top  += viewport.y;
                rez.left += viewport.x;
            }

            rez.top  = getValue(Math.max(rez.top,  rez.top  + ((viewport.h - height) * current.topRatio)));
            rez.left = getValue(Math.max(rez.left, rez.left + ((viewport.w - width)  * current.leftRatio)));

            return rez;
        },

        _afterZoomIn: function () {
            var current = F.current;

            if (!current) {
                return;
            }

            F.isOpen = F.isOpened = true;

            F.wrap.css('overflow', 'visible').addClass('fancybox-opened');

            F.update();

            // Assign a click event
            if ( current.closeClick || (current.nextClick && F.group.length > 1) ) {
                F.inner.css('cursor', 'pointer').bind('click.fb', function(e) {
                    if (!$(e.target).is('a') && !$(e.target).parent().is('a')) {
                        e.preventDefault();

                        F[ current.closeClick ? 'close' : 'next' ]();
                    }
                });
            }

            // Create a close button
            if (current.closeBtn) {
                $(current.tpl.closeBtn).appendTo(F.skin).bind('click.fb', function(e) {
                    e.preventDefault();

                    F.close();
                });
            }

            // Create navigation arrows
            if (current.arrows && F.group.length > 1) {
                if (current.loop || current.index > 0) {
                    $(current.tpl.prev).appendTo(F.outer).bind('click.fb', F.prev);
                }

                if (current.loop || current.index < F.group.length - 1) {
                    $(current.tpl.next).appendTo(F.outer).bind('click.fb', F.next);
                }
            }

            F.trigger('afterShow');

            // Stop the slideshow if this is the last item
            if (!current.loop && current.index === current.group.length - 1) {
                F.play( false );

            } else if (F.opts.autoPlay && !F.player.isActive) {
                F.opts.autoPlay = false;

                F.play();
            }
        },

        _afterZoomOut: function ( obj ) {
            obj = obj || F.current;

            $('.fancybox-wrap').trigger('onReset').remove();

            $.extend(F, {
                group  : {},
                opts   : {},
                router : false,
                current   : null,
                isActive  : false,
                isOpened  : false,
                isOpen    : false,
                isClosing : false,
                wrap   : null,
                skin   : null,
                outer  : null,
                inner  : null
            });

            F.trigger('afterClose', obj);
        }
    });

    /*
     *  Default transitions
     */

    F.transitions = {
        getOrigPosition: function () {
            var current  = F.current,
                element  = current.element,
                orig     = current.orig,
                pos      = {},
                width    = 50,
                height   = 50,
                hPadding = current.hPadding,
                wPadding = current.wPadding,
                viewport = F.getViewport();

            if (!orig && current.isDom && element.is(':visible')) {
                orig = element.find('img:first');

                if (!orig.length) {
                    orig = element;
                }
            }

            if (isQuery(orig)) {
                pos = orig.offset();

                if (orig.is('img')) {
                    width  = orig.outerWidth();
                    height = orig.outerHeight();
                }

            } else {
                pos.top  = viewport.y + (viewport.h - height) * current.topRatio;
                pos.left = viewport.x + (viewport.w - width)  * current.leftRatio;
            }

            if (F.wrap.css('position') === 'fixed' || current.locked) {
                pos.top  -= viewport.y;
                pos.left -= viewport.x;
            }

            pos = {
                top     : getValue(pos.top  - hPadding * current.topRatio),
                left    : getValue(pos.left - wPadding * current.leftRatio),
                width   : getValue(width  + wPadding),
                height  : getValue(height + hPadding)
            };

            return pos;
        },

        step: function (now, fx) {
            var ratio,
                padding,
                value,
                prop       = fx.prop,
                current    = F.current,
                wrapSpace  = current.wrapSpace,
                skinSpace  = current.skinSpace;

            if (prop === 'width' || prop === 'height') {
                ratio = fx.end === fx.start ? 1 : (now - fx.start) / (fx.end - fx.start);

                if (F.isClosing) {
                    ratio = 1 - ratio;
                }

                padding = prop === 'width' ? current.wPadding : current.hPadding;
                value   = now - padding;

                F.skin[ prop ](  getScalar( prop === 'width' ?  value : value - (wrapSpace * ratio) ) );
                F.inner[ prop ]( getScalar( prop === 'width' ?  value : value - (wrapSpace * ratio) - (skinSpace * ratio) ) );
            }
        },

        zoomIn: function () {
            var current  = F.current,
                startPos = current.pos,
                effect   = current.openEffect,
                elastic  = effect === 'elastic',
                endPos   = $.extend({opacity : 1}, startPos);

            // Remove "position" property that breaks older IE
            delete endPos.position;

            if (elastic) {
                startPos = this.getOrigPosition();

                if (current.openOpacity) {
                    startPos.opacity = 0.1;
                }

            } else if (effect === 'fade') {
                startPos.opacity = 0.1;
            }

            F.wrap.css(startPos).animate(endPos, {
                duration : effect === 'none' ? 0 : current.openSpeed,
                easing   : current.openEasing,
                step     : elastic ? this.step : null,
                complete : F._afterZoomIn
            });
        },

        zoomOut: function () {
            var current  = F.current,
                effect   = current.closeEffect,
                elastic  = effect === 'elastic',
                endPos   = {opacity : 0.1};

            if (elastic) {
                endPos = this.getOrigPosition();

                if (current.closeOpacity) {
                    endPos.opacity = 0.1;
                }
            }

            F.wrap.animate(endPos, {
                duration : effect === 'none' ? 0 : current.closeSpeed,
                easing   : current.closeEasing,
                step     : elastic ? this.step : null,
                complete : F._afterZoomOut
            });
        },

        changeIn: function () {
            var current   = F.current,
                effect    = current.nextEffect,
                startPos  = current.pos,
                endPos    = { opacity : 1 },
                direction = F.direction,
                distance  = 200,
                field;

            startPos.opacity = 0.1;

            if (effect === 'elastic') {
                field = direction === 'down' || direction === 'up' ? 'top' : 'left';

                if (direction === 'down' || direction === 'right') {
                    startPos[ field ] = getValue(getScalar(startPos[ field ]) - distance);
                    endPos[ field ]   = '+=' + distance + 'px';

                } else {
                    startPos[ field ] = getValue(getScalar(startPos[ field ]) + distance);
                    endPos[ field ]   = '-=' + distance + 'px';
                }
            }

            // Workaround for http://bugs.jquery.com/ticket/12273
            if (effect === 'none') {
                F._afterZoomIn();

            } else {
                F.wrap.css(startPos).animate(endPos, {
                    duration : current.nextSpeed,
                    easing   : current.nextEasing,
                    complete : F._afterZoomIn
                });
            }
        },

        changeOut: function () {
            var previous  = F.previous,
                effect    = previous.prevEffect,
                endPos    = { opacity : 0.1 },
                direction = F.direction,
                distance  = 200;

            if (effect === 'elastic') {
                endPos[ direction === 'down' || direction === 'up' ? 'top' : 'left' ] = ( direction === 'up' || direction === 'left' ? '-' : '+' ) + '=' + distance + 'px';
            }

            previous.wrap.animate(endPos, {
                duration : effect === 'none' ? 0 : previous.prevSpeed,
                easing   : previous.prevEasing,
                complete : function () {
                    $(this).trigger('onReset').remove();
                }
            });
        }
    };

    /*
     *  Overlay helper
     */

    F.helpers.overlay = {
        defaults : {
            closeClick : true,      // if true, fancyBox will be closed when user clicks on the overlay
            speedOut   : 200,       // duration of fadeOut animation
            showEarly  : true,      // indicates if should be opened immediately or wait until the content is ready
            css        : {},        // custom CSS properties
            locked     : !isTouch,  // if true, the content will be locked into overlay
            fixed      : true       // if false, the overlay CSS position property will not be set to "fixed"
        },

        overlay : null,      // current handle
        fixed   : false,     // indicates if the overlay has position "fixed"
        el      : $('html'), // element that contains "the lock"

        // Public methods
        create : function(opts) {
            opts = $.extend({}, this.defaults, opts);

            if (this.overlay) {
                this.close();
            }

            this.overlay = $('<div class="fancybox-overlay"></div>').appendTo( F.coming ? F.coming.parent : opts.parent );
            this.fixed   = false;

            if (opts.fixed && F.defaults.fixed) {
                this.overlay.addClass('fancybox-overlay-fixed');

                this.fixed = true;
            }
        },

        open : function(opts) {
            var that = this;

            opts = $.extend({}, this.defaults, opts);

            if (this.overlay) {
                this.overlay.unbind('.overlay').width('auto').height('auto');

            } else {
                this.create(opts);
            }

            if (!this.fixed) {
                W.bind('resize.overlay', $.proxy( this.update, this) );

                this.update();
            }

            if (opts.closeClick) {
                this.overlay.bind('click.overlay', function(e) {
                    if ($(e.target).hasClass('fancybox-overlay')) {
                        if (F.isActive) {
                            F.close();
                        } else {
                            that.close();
                        }

                        return false;
                    }
                });
            }

            this.overlay.css( opts.css ).show();
        },

        close : function() {
            var scrollV, scrollH;

            W.unbind('resize.overlay');

            if (this.el.hasClass('fancybox-lock')) {
                $('.fancybox-margin').removeClass('fancybox-margin');

                scrollV = W.scrollTop();
                scrollH = W.scrollLeft();

                this.el.removeClass('fancybox-lock');

                W.scrollTop( scrollV ).scrollLeft( scrollH );
            }

            $('.fancybox-overlay').remove().hide();

            $.extend(this, {
                overlay : null,
                fixed   : false
            });
        },

        // Private, callbacks

        update : function () {
            var width = '100%', offsetWidth;

            // Reset width/height so it will not mess
            this.overlay.width(width).height('100%');

            // jQuery does not return reliable result for IE
            if (IE) {
                offsetWidth = Math.max(document.documentElement.offsetWidth, document.body.offsetWidth);

                if (D.width() > offsetWidth) {
                    width = D.width();
                }

            } else if (D.width() > W.width()) {
                width = D.width();
            }

            this.overlay.width(width).height(D.height());
        },

        // This is where we can manipulate DOM, because later it would cause iframes to reload
        onReady : function (opts, obj) {
            var overlay = this.overlay;

            $('.fancybox-overlay').stop(true, true);

            if (!overlay) {
                this.create(opts);
            }

            if (opts.locked && this.fixed && obj.fixed) {
                if (!overlay) {
                    this.margin = D.height() > W.height() ? $('html').css('margin-right').replace("px", "") : false;
                }

                obj.locked = this.overlay.append( obj.wrap );
                obj.fixed  = false;
            }

            if (opts.showEarly === true) {
                this.beforeShow.apply(this, arguments);
            }
        },

        beforeShow : function(opts, obj) {
            var scrollV, scrollH;

            if (obj.locked) {
                if (this.margin !== false) {
                    $('*').filter(function(){
                        return ($(this).css('position') === 'fixed' && !$(this).hasClass("fancybox-overlay") && !$(this).hasClass("fancybox-wrap") );
                    }).addClass('fancybox-margin');

                    this.el.addClass('fancybox-margin');
                }

                scrollV = W.scrollTop();
                scrollH = W.scrollLeft();

                this.el.addClass('fancybox-lock');

                W.scrollTop( scrollV ).scrollLeft( scrollH );
            }

            this.open(opts);
        },

        onUpdate : function() {
            if (!this.fixed) {
                this.update();
            }
        },

        afterClose: function (opts) {
            // Remove overlay if exists and fancyBox is not opening
            // (e.g., it is not being open using afterClose callback)
            //if (this.overlay && !F.isActive) {
            if (this.overlay && !F.coming) {
                this.overlay.fadeOut(opts.speedOut, $.proxy( this.close, this ));
            }
        }
    };

    /*
     *  Title helper
     */

    F.helpers.title = {
        defaults : {
            type     : 'float', // 'float', 'inside', 'outside' or 'over',
            position : 'bottom' // 'top' or 'bottom'
        },

        beforeShow: function (opts) {
            var current = F.current,
                text    = current.title,
                type    = opts.type,
                title,
                target;

            if ($.isFunction(text)) {
                text = text.call(current.element, current);
            }

            if (!isString(text) || $.trim(text) === '') {
                return;
            }

            title = $('<div class="fancybox-title fancybox-title-' + type + '-wrap">' + text + '</div>');

            switch (type) {
                case 'inside':
                    target = F.skin;
                break;

                case 'outside':
                    target = F.wrap;
                break;

                case 'over':
                    target = F.inner;
                break;

                default: // 'float'
                    target = F.skin;

                    title.appendTo('body');

                    if (IE) {
                        title.width( title.width() );
                    }

                    title.wrapInner('<span class="child"></span>');

                    //Increase bottom margin so this title will also fit into viewport
                    F.current.margin[2] += Math.abs( getScalar(title.css('margin-bottom')) );
                break;
            }

            title[ (opts.position === 'top' ? 'prependTo'  : 'appendTo') ](target);
        }
    };

    // jQuery plugin initialization
    $.fn.fancybox = function (options) {
        var index,
            that     = $(this),
            selector = this.selector || '',
            run      = function(e) {
                var what = $(this).blur(), idx = index, relType, relVal;

                if (!(e.ctrlKey || e.altKey || e.shiftKey || e.metaKey) && !what.is('.fancybox-wrap')) {
                    relType = options.groupAttr || 'data-fancybox-group';
                    relVal  = what.attr(relType);

                    if (!relVal) {
                        relType = 'rel';
                        relVal  = what.get(0)[ relType ];
                    }

                    if (relVal && relVal !== '' && relVal !== 'nofollow') {
                        what = selector.length ? $(selector) : that;
                        what = what.filter('[' + relType + '="' + relVal + '"]');
                        idx  = what.index(this);
                    }

                    options.index = idx;

                    // Stop an event from bubbling if everything is fine
                    if (F.open(what, options) !== false) {
                        e.preventDefault();
                    }
                }
            };

        options = options || {};
        index   = options.index || 0;

        if (!selector || options.live === false) {
            that.unbind('click.fb-start').bind('click.fb-start', run);

        } else {
            D.undelegate(selector, 'click.fb-start').delegate(selector + ":not('.fancybox-item, .fancybox-nav')", 'click.fb-start', run);
        }

        this.filter('[data-fancybox-start=1]').trigger('click');

        return this;
    };

    // Tests that need a body at doc ready
    D.ready(function() {
        var w1, w2;

        if ( $.scrollbarWidth === undefined ) {
            // http://benalman.com/projects/jquery-misc-plugins/#scrollbarwidth
            $.scrollbarWidth = function() {
                var parent = $('<div style="width:50px;height:50px;overflow:auto"><div/></div>').appendTo('body'),
                    child  = parent.children(),
                    width  = child.innerWidth() - child.height( 99 ).innerWidth();

                parent.remove();

                return width;
            };
        }

        if ( $.support.fixedPosition === undefined ) {
            $.support.fixedPosition = (function() {
                var elem  = $('<div style="position:fixed;top:20px;"></div>').appendTo('body'),
                    fixed = ( elem[0].offsetTop === 20 || elem[0].offsetTop === 15 );

                elem.remove();

                return fixed;
            }());
        }

        $.extend(F.defaults, {
            scrollbarWidth : $.scrollbarWidth(),
            fixed  : $.support.fixedPosition,
            parent : $('body')
        });

        //Get real width of page scroll-bar
        w1 = $(window).width();

        H.addClass('fancybox-lock-test');

        w2 = $(window).width();

        H.removeClass('fancybox-lock-test');

        $("<style type='text/css'>.fancybox-margin{margin-right:" + (w2 - w1) + "px;}</style>").appendTo("head");
    });

}(window, document, jQuery));
