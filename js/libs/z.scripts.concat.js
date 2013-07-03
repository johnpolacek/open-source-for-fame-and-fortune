/**
 * imageFill.js
 * Author & copyright (c) 2013: John Polacek
 * Dual MIT & GPL license
 *
 * Page: http://johnpolacek.github.com/fitimages.js
 * Repo: https://github.com/johnpolacek/imageFill.js/
 *
 * The jQuery plugin for making an image fill its container (and be centered)
 * 
 * EXAMPLE
 * Given this html:
 * <div class="container"><img src="myawesomeimage" /></div>
 * $('.container').imageFill(); // image stretches to fill container
 *
 * REQUIRES:
 * imagesLoaded - https://github.com/desandro/imagesloaded
 * smartresize - http://www.paulirish.com/2009/throttled-smartresize-jquery-event-handler/
 *
 */
;(function($) {

  $.fn.imageFill = function() {

    var $container = this,
        $img = $container.find('img').css({'position':'absolute'}),
        imageAspect = 1/1;

    // make sure container isn't position:static
    var containerPos = $container.css('position');
    $container.css({'overflow':'hidden','position':(containerPos === 'static') ? 'relative' : containerPos})

    // wait for image to load, then fit it inside the container
    $('.content-center-img-fill').imagesLoaded().done(function($img) {
      imageAspect = $img.width() / $img.height();
      fitImage($img);
    });

    function fitImage() {
      var containerW = $container.width();
      var containerH = $container.height();
      var containerAspect = containerW/containerH;
      if (containerAspect < imageAspect) {
        // taller
        $img.css({
            width: 'auto',
            height: containerH,
            top:0,
            left:-(containerH*imageAspect-containerW)/2
          });
      } else {
        // wider
        $img.css({
            width: containerW,
            height: 'auto',
            top:-(containerW/imageAspect-containerH)/2,
            left:0
          });
      }
    }

    $(window).smartresize(function(){
      fitImage();
    });
  };

}(jQuery));
/*!
 * jQuery imagesLoaded plugin v2.1.1
 * http://github.com/desandro/imagesloaded
 *
 * MIT License. by Paul Irish et al.
 */

/*jshint curly: true, eqeqeq: true, noempty: true, strict: true, undef: true, browser: true */
/*global jQuery: false */

;(function($, undefined) {
'use strict';

// blank image data-uri bypasses webkit log warning (thx doug jones)
var BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

$.fn.imagesLoaded = function( callback ) {
  var $this = this,
    deferred = $.isFunction($.Deferred) ? $.Deferred() : 0,
    hasNotify = $.isFunction(deferred.notify),
    $images = $this.find('img').add( $this.filter('img') ),
    loaded = [],
    proper = [],
    broken = [];

  // Register deferred callbacks
  if ($.isPlainObject(callback)) {
    $.each(callback, function (key, value) {
      if (key === 'callback') {
        callback = value;
      } else if (deferred) {
        deferred[key](value);
      }
    });
  }

  function doneLoading() {
    var $proper = $(proper),
      $broken = $(broken);

    if ( deferred ) {
      if ( broken.length ) {
        deferred.reject( $images, $proper, $broken );
      } else {
        deferred.resolve( $images );
      }
    }

    if ( $.isFunction( callback ) ) {
      callback.call( $this, $images, $proper, $broken );
    }
  }

  function imgLoadedHandler( event ) {
    imgLoaded( event.target, event.type === 'error' );
  }

  function imgLoaded( img, isBroken ) {
    // don't proceed if BLANK image, or image is already loaded
    if ( img.src === BLANK || $.inArray( img, loaded ) !== -1 ) {
      return;
    }

    // store element in loaded images array
    loaded.push( img );

    // keep track of broken and properly loaded images
    if ( isBroken ) {
      broken.push( img );
    } else {
      proper.push( img );
    }

    // cache image and its state for future calls
    $.data( img, 'imagesLoaded', { isBroken: isBroken, src: img.src } );

    // trigger deferred progress method if present
    if ( hasNotify ) {
      deferred.notifyWith( $(img), [ isBroken, $images, $(proper), $(broken) ] );
    }

    // call doneLoading and clean listeners if all images are loaded
    if ( $images.length === loaded.length ) {
      setTimeout( doneLoading );
      $images.unbind( '.imagesLoaded', imgLoadedHandler );
    }
  }

  // if no images, trigger immediately
  if ( !$images.length ) {
    doneLoading();
  } else {
    $images.bind( 'load.imagesLoaded error.imagesLoaded', imgLoadedHandler )
    .each( function( i, el ) {
      var src = el.src;

      // find out if this image has been already checked for status
      // if it was, and src has not changed, call imgLoaded on it
      var cached = $.data( el, 'imagesLoaded' );
      if ( cached && cached.src === src ) {
        imgLoaded( el, cached.isBroken );
        return;
      }

      // if complete is true and browser supports natural sizes, try
      // to check for image status manually
      if ( el.complete && el.naturalWidth !== undefined ) {
        imgLoaded( el, el.naturalWidth === 0 || el.naturalHeight === 0 );
        return;
      }

      // cached images don't fire load sometimes, so we reset src, but only when
      // dealing with IE, or image is complete (loaded) and failed manual check
      // webkit hack from http://groups.google.com/group/jquery-dev/browse_thread/thread/eee6ab7b2da50e1f
      if ( el.readyState || el.complete ) {
        el.src = BLANK;
        el.src = src;
      }
    });
  }

  return deferred ? deferred.promise( $this ) : $this;
};

})(jQuery);

/*! Hammer.JS - v1.0.6dev - 2013-05-04
 * http://eightmedia.github.com/hammer.js
 *
 * Copyright (c) 2013 Jorik Tangelder <j.tangelder@gmail.com>;
 * Licensed under the MIT license */

(function(window, undefined) {
    'use strict';

/**
 * Hammer
 * use this to create instances
 * @param   {HTMLElement}   element
 * @param   {Object}        options
 * @returns {Hammer.Instance}
 * @constructor
 */
var Hammer = function(element, options) {
    return new Hammer.Instance(element, options || {});
};

// default settings
Hammer.defaults = {
    // add styles and attributes to the element to prevent the browser from doing
    // its native behavior. this doesnt prevent the scrolling, but cancels
    // the contextmenu, tap highlighting etc
    // set to false to disable this
    stop_browser_behavior: {
		// this also triggers onselectstart=false for IE
        userSelect: 'none',
		// this makes the element blocking in IE10 >, you could experiment with the value
		// see for more options this issue; https://github.com/EightMedia/hammer.js/issues/241
        touchAction: 'none',
		touchCallout: 'none',
        contentZooming: 'none',
        userDrag: 'none',
        tapHighlightColor: 'rgba(0,0,0,0)'
    }

    // more settings are defined per gesture at gestures.js
};

// detect touchevents
Hammer.HAS_POINTEREVENTS = navigator.pointerEnabled || navigator.msPointerEnabled;
Hammer.HAS_TOUCHEVENTS = ('ontouchstart' in window);

// dont use mouseevents on mobile devices
Hammer.MOBILE_REGEX = /mobile|tablet|ip(ad|hone|od)|android/i;
Hammer.NO_MOUSEEVENTS = Hammer.HAS_TOUCHEVENTS && navigator.userAgent.match(Hammer.MOBILE_REGEX);

// eventtypes per touchevent (start, move, end)
// are filled by Hammer.event.determineEventTypes on setup
Hammer.EVENT_TYPES = {};

// direction defines
Hammer.DIRECTION_DOWN = 'down';
Hammer.DIRECTION_LEFT = 'left';
Hammer.DIRECTION_UP = 'up';
Hammer.DIRECTION_RIGHT = 'right';

// pointer type
Hammer.POINTER_MOUSE = 'mouse';
Hammer.POINTER_TOUCH = 'touch';
Hammer.POINTER_PEN = 'pen';

// touch event defines
Hammer.EVENT_START = 'start';
Hammer.EVENT_MOVE = 'move';
Hammer.EVENT_END = 'end';

// hammer document where the base events are added at
Hammer.DOCUMENT = document;

// plugins namespace
Hammer.plugins = {};

// if the window events are set...
Hammer.READY = false;

/**
 * setup events to detect gestures on the document
 */
function setup() {
    if(Hammer.READY) {
        return;
    }

    // find what eventtypes we add listeners to
    Hammer.event.determineEventTypes();

    // Register all gestures inside Hammer.gestures
    for(var name in Hammer.gestures) {
        if(Hammer.gestures.hasOwnProperty(name)) {
            Hammer.detection.register(Hammer.gestures[name]);
        }
    }

    // Add touch events on the document
    Hammer.event.onTouch(Hammer.DOCUMENT, Hammer.EVENT_MOVE, Hammer.detection.detect);
    Hammer.event.onTouch(Hammer.DOCUMENT, Hammer.EVENT_END, Hammer.detection.detect);

    // Hammer is ready...!
    Hammer.READY = true;
}

/**
 * create new hammer instance
 * all methods should return the instance itself, so it is chainable.
 * @param   {HTMLElement}       element
 * @param   {Object}            [options={}]
 * @returns {Hammer.Instance}
 * @constructor
 */
Hammer.Instance = function(element, options) {
    var self = this;

    // setup HammerJS window events and register all gestures
    // this also sets up the default options
    setup();

    this.element = element;

    // start/stop detection option
    this.enabled = true;

    // merge options
    this.options = Hammer.utils.extend(
        Hammer.utils.extend({}, Hammer.defaults),
        options || {});

    // add some css to the element to prevent the browser from doing its native behavoir
    if(this.options.stop_browser_behavior) {
        Hammer.utils.stopDefaultBrowserBehavior(this.element, this.options.stop_browser_behavior);
    }

    // start detection on touchstart
    Hammer.event.onTouch(element, Hammer.EVENT_START, function(ev) {
        if(self.enabled) {
            Hammer.detection.startDetect(self, ev);
        }
    });

    // return instance
    return this;
};


Hammer.Instance.prototype = {
    /**
     * bind events to the instance
     * @param   {String}      gesture
     * @param   {Function}    handler
     * @returns {Hammer.Instance}
     */
    on: function onEvent(gesture, handler){
        var gestures = gesture.split(' ');
        for(var t=0; t<gestures.length; t++) {
            this.element.addEventListener(gestures[t], handler, false);
        }
        return this;
    },


    /**
     * unbind events to the instance
     * @param   {String}      gesture
     * @param   {Function}    handler
     * @returns {Hammer.Instance}
     */
    off: function offEvent(gesture, handler){
        var gestures = gesture.split(' ');
        for(var t=0; t<gestures.length; t++) {
            this.element.removeEventListener(gestures[t], handler, false);
        }
        return this;
    },


    /**
     * trigger gesture event
     * @param   {String}      gesture
     * @param   {Object}      eventData
     * @returns {Hammer.Instance}
     */
    trigger: function triggerEvent(gesture, eventData){
        // create DOM event
        var event = Hammer.DOCUMENT.createEvent('Event');
		event.initEvent(gesture, true, true);
		event.gesture = eventData;

        // trigger on the target if it is in the instance element,
        // this is for event delegation tricks
        var element = this.element;
        if(Hammer.utils.hasParent(eventData.target, element)) {
            element = eventData.target;
        }

        element.dispatchEvent(event);
        return this;
    },


    /**
     * enable of disable hammer.js detection
     * @param   {Boolean}   state
     * @returns {Hammer.Instance}
     */
    enable: function enable(state) {
        this.enabled = state;
        return this;
    }
};

/**
 * this holds the last move event,
 * used to fix empty touchend issue
 * see the onTouch event for an explanation
 * @type {Object}
 */
var last_move_event = null;


/**
 * when the mouse is hold down, this is true
 * @type {Boolean}
 */
var enable_detect = false;


/**
 * when touch events have been fired, this is true
 * @type {Boolean}
 */
var touch_triggered = false;


Hammer.event = {
    /**
     * simple addEventListener
     * @param   {HTMLElement}   element
     * @param   {String}        type
     * @param   {Function}      handler
     */
    bindDom: function(element, type, handler) {
        var types = type.split(' ');
        for(var t=0; t<types.length; t++) {
            element.addEventListener(types[t], handler, false);
        }
    },


    /**
     * touch events with mouse fallback
     * @param   {HTMLElement}   element
     * @param   {String}        eventType        like Hammer.EVENT_MOVE
     * @param   {Function}      handler
     */
    onTouch: function onTouch(element, eventType, handler) {
		var self = this;

        this.bindDom(element, Hammer.EVENT_TYPES[eventType], function bindDomOnTouch(ev) {
            var sourceEventType = ev.type.toLowerCase();

            // onmouseup, but when touchend has been fired we do nothing.
            // this is for touchdevices which also fire a mouseup on touchend
            if(sourceEventType.match(/mouse/) && touch_triggered) {
                return;
            }

            // mousebutton must be down or a touch event
            else if( sourceEventType.match(/touch/) ||   // touch events are always on screen
                sourceEventType.match(/pointerdown/) || // pointerevents touch
                (sourceEventType.match(/mouse/) && ev.which === 1)   // mouse is pressed
            ){
                enable_detect = true;
            }

            // mouse isn't pressed
            else if(sourceEventType.match(/mouse/) && ev.which !== 1) {
                enable_detect = false;
            }


            // we are in a touch event, set the touch triggered bool to true,
            // this for the conflicts that may occur on ios and android
            if(sourceEventType.match(/touch|pointer/)) {
                touch_triggered = true;
            }

            // count the total touches on the screen
            var count_touches = 0;

            // when touch has been triggered in this detection session
            // and we are now handling a mouse event, we stop that to prevent conflicts
            if(enable_detect) {
                // update pointerevent
                if(Hammer.HAS_POINTEREVENTS && eventType != Hammer.EVENT_END) {
                    count_touches = Hammer.PointerEvent.updatePointer(eventType, ev);
                }
                // touch
                else if(sourceEventType.match(/touch/)) {
                    count_touches = ev.touches.length;
                }
                // mouse
                else if(!touch_triggered) {
                    count_touches = sourceEventType.match(/up/) ? 0 : 1;
                }

                // if we are in a end event, but when we remove one touch and
                // we still have enough, set eventType to move
                if(count_touches > 0 && eventType == Hammer.EVENT_END) {
                    eventType = Hammer.EVENT_MOVE;
                }
                // no touches, force the end event
                else if(!count_touches) {
                    eventType = Hammer.EVENT_END;
                }

                // because touchend has no touches, and we often want to use these in our gestures,
                // we send the last move event as our eventData in touchend
                if(!count_touches && last_move_event !== null) {
                    ev = last_move_event;
                }
                // store the last move event
                else {
                    last_move_event = ev;
                }

                // trigger the handler
                handler.call(Hammer.detection, self.collectEventData(element, eventType, ev));

                // remove pointerevent from list
                if(Hammer.HAS_POINTEREVENTS && eventType == Hammer.EVENT_END) {
                    count_touches = Hammer.PointerEvent.updatePointer(eventType, ev);
                }
            }

            //debug(sourceEventType +" "+ eventType);

            // on the end we reset everything
            if(!count_touches) {
                last_move_event = null;
                enable_detect = false;
                touch_triggered = false;
                Hammer.PointerEvent.reset();
            }
        });
    },


    /**
     * we have different events for each device/browser
     * determine what we need and set them in the Hammer.EVENT_TYPES constant
     */
    determineEventTypes: function determineEventTypes() {
        // determine the eventtype we want to set
        var types;

        // pointerEvents magic
        if(Hammer.HAS_POINTEREVENTS) {
            types = Hammer.PointerEvent.getEvents();
        }
        // on Android, iOS, blackberry, windows mobile we dont want any mouseevents
        else if(Hammer.NO_MOUSEEVENTS) {
            types = [
                'touchstart',
                'touchmove',
                'touchend touchcancel'];
        }
        // for non pointer events browsers and mixed browsers,
        // like chrome on windows8 touch laptop
        else {
            types = [
                'touchstart mousedown',
                'touchmove mousemove',
                'touchend touchcancel mouseup'];
        }

        Hammer.EVENT_TYPES[Hammer.EVENT_START]  = types[0];
        Hammer.EVENT_TYPES[Hammer.EVENT_MOVE]   = types[1];
        Hammer.EVENT_TYPES[Hammer.EVENT_END]    = types[2];
    },


    /**
     * create touchlist depending on the event
     * @param   {Object}    ev
     * @param   {String}    eventType   used by the fakemultitouch plugin
     */
    getTouchList: function getTouchList(ev/*, eventType*/) {
        // get the fake pointerEvent touchlist
        if(Hammer.HAS_POINTEREVENTS) {
            return Hammer.PointerEvent.getTouchList();
        }
        // get the touchlist
        else if(ev.touches) {
            return ev.touches;
        }
        // make fake touchlist from mouse position
        else {
            return [{
                identifier: 1,
                pageX: ev.pageX,
                pageY: ev.pageY,
                target: ev.target
            }];
        }
    },


    /**
     * collect event data for Hammer js
     * @param   {HTMLElement}   element
     * @param   {String}        eventType        like Hammer.EVENT_MOVE
     * @param   {Object}        eventData
     */
    collectEventData: function collectEventData(element, eventType, ev) {
        var touches = this.getTouchList(ev, eventType);

        // find out pointerType
        var pointerType = Hammer.POINTER_TOUCH;
        if(ev.type.match(/mouse/) || Hammer.PointerEvent.matchType(Hammer.POINTER_MOUSE, ev)) {
            pointerType = Hammer.POINTER_MOUSE;
        }

        return {
            center      : Hammer.utils.getCenter(touches),
            timeStamp   : new Date().getTime(),
            target      : ev.target,
            touches     : touches,
            eventType   : eventType,
            pointerType : pointerType,
            srcEvent    : ev,

            /**
             * prevent the browser default actions
             * mostly used to disable scrolling of the browser
             */
            preventDefault: function() {
                if(this.srcEvent.preventManipulation) {
                    this.srcEvent.preventManipulation();
                }

                if(this.srcEvent.preventDefault) {
                    this.srcEvent.preventDefault();
                }
            },

            /**
             * stop bubbling the event up to its parents
             */
            stopPropagation: function() {
                this.srcEvent.stopPropagation();
            },

            /**
             * immediately stop gesture detection
             * might be useful after a swipe was detected
             * @return {*}
             */
            stopDetect: function() {
                return Hammer.detection.stopDetect();
            }
        };
    }
};

Hammer.PointerEvent = {
    /**
     * holds all pointers
     * @type {Object}
     */
    pointers: {},

    /**
     * get a list of pointers
     * @returns {Array}     touchlist
     */
    getTouchList: function() {
        var self = this;
        var touchlist = [];

        // we can use forEach since pointerEvents only is in IE10
        Object.keys(self.pointers).sort().forEach(function(id) {
            touchlist.push(self.pointers[id]);
        });
        return touchlist;
    },

    /**
     * update the position of a pointer
     * @param   {String}   type             Hammer.EVENT_END
     * @param   {Object}   pointerEvent
     */
    updatePointer: function(type, pointerEvent) {
        if(type == Hammer.EVENT_END) {
            this.pointers = {};
        }
        else {
            pointerEvent.identifier = pointerEvent.pointerId;
            this.pointers[pointerEvent.pointerId] = pointerEvent;
        }

        return Object.keys(this.pointers).length;
    },

    /**
     * check if ev matches pointertype
     * @param   {String}        pointerType     Hammer.POINTER_MOUSE
     * @param   {PointerEvent}  ev
     */
    matchType: function(pointerType, ev) {
        if(!ev.pointerType) {
            return false;
        }

        var types = {};
        types[Hammer.POINTER_MOUSE] = (ev.pointerType == ev.MSPOINTER_TYPE_MOUSE || ev.pointerType == Hammer.POINTER_MOUSE);
        types[Hammer.POINTER_TOUCH] = (ev.pointerType == ev.MSPOINTER_TYPE_TOUCH || ev.pointerType == Hammer.POINTER_TOUCH);
        types[Hammer.POINTER_PEN] = (ev.pointerType == ev.MSPOINTER_TYPE_PEN || ev.pointerType == Hammer.POINTER_PEN);
        return types[pointerType];
    },


    /**
     * get events
     */
    getEvents: function() {
        return [
            'pointerdown MSPointerDown',
            'pointermove MSPointerMove',
            'pointerup pointercancel MSPointerUp MSPointerCancel'
        ];
    },

    /**
     * reset the list
     */
    reset: function() {
        this.pointers = {};
    }
};


Hammer.utils = {
    /**
     * extend method,
     * also used for cloning when dest is an empty object
     * @param   {Object}    dest
     * @param   {Object}    src
	 * @parm	{Boolean}	merge		do a merge
     * @returns {Object}    dest
     */
    extend: function extend(dest, src, merge) {
        for (var key in src) {
			if(dest[key] !== undefined && merge) {
				continue;
			}
            dest[key] = src[key];
        }
        return dest;
    },


    /**
     * find if a node is in the given parent
     * used for event delegation tricks
     * @param   {HTMLElement}   node
     * @param   {HTMLElement}   parent
     * @returns {boolean}       has_parent
     */
    hasParent: function(node, parent) {
        while(node){
            if(node == parent) {
                return true;
            }
            node = node.parentNode;
        }
        return false;
    },


    /**
     * get the center of all the touches
     * @param   {Array}     touches
     * @returns {Object}    center
     */
    getCenter: function getCenter(touches) {
        var valuesX = [], valuesY = [];

        for(var t= 0,len=touches.length; t<len; t++) {
            valuesX.push(touches[t].pageX);
            valuesY.push(touches[t].pageY);
        }

        return {
            pageX: ((Math.min.apply(Math, valuesX) + Math.max.apply(Math, valuesX)) / 2),
            pageY: ((Math.min.apply(Math, valuesY) + Math.max.apply(Math, valuesY)) / 2)
        };
    },


    /**
     * calculate the velocity between two points
     * @param   {Number}    delta_time
     * @param   {Number}    delta_x
     * @param   {Number}    delta_y
     * @returns {Object}    velocity
     */
    getVelocity: function getVelocity(delta_time, delta_x, delta_y) {
        return {
            x: Math.abs(delta_x / delta_time) || 0,
            y: Math.abs(delta_y / delta_time) || 0
        };
    },


    /**
     * calculate the angle between two coordinates
     * @param   {Touch}     touch1
     * @param   {Touch}     touch2
     * @returns {Number}    angle
     */
    getAngle: function getAngle(touch1, touch2) {
        var y = touch2.pageY - touch1.pageY,
            x = touch2.pageX - touch1.pageX;
        return Math.atan2(y, x) * 180 / Math.PI;
    },


    /**
     * angle to direction define
     * @param   {Touch}     touch1
     * @param   {Touch}     touch2
     * @returns {String}    direction constant, like Hammer.DIRECTION_LEFT
     */
    getDirection: function getDirection(touch1, touch2) {
        var x = Math.abs(touch1.pageX - touch2.pageX),
            y = Math.abs(touch1.pageY - touch2.pageY);

        if(x >= y) {
            return touch1.pageX - touch2.pageX > 0 ? Hammer.DIRECTION_LEFT : Hammer.DIRECTION_RIGHT;
        }
        else {
            return touch1.pageY - touch2.pageY > 0 ? Hammer.DIRECTION_UP : Hammer.DIRECTION_DOWN;
        }
    },


    /**
     * calculate the distance between two touches
     * @param   {Touch}     touch1
     * @param   {Touch}     touch2
     * @returns {Number}    distance
     */
    getDistance: function getDistance(touch1, touch2) {
        var x = touch2.pageX - touch1.pageX,
            y = touch2.pageY - touch1.pageY;
        return Math.sqrt((x*x) + (y*y));
    },


    /**
     * calculate the scale factor between two touchLists (fingers)
     * no scale is 1, and goes down to 0 when pinched together, and bigger when pinched out
     * @param   {Array}     start
     * @param   {Array}     end
     * @returns {Number}    scale
     */
    getScale: function getScale(start, end) {
        // need two fingers...
        if(start.length >= 2 && end.length >= 2) {
            return this.getDistance(end[0], end[1]) /
                this.getDistance(start[0], start[1]);
        }
        return 1;
    },


    /**
     * calculate the rotation degrees between two touchLists (fingers)
     * @param   {Array}     start
     * @param   {Array}     end
     * @returns {Number}    rotation
     */
    getRotation: function getRotation(start, end) {
        // need two fingers
        if(start.length >= 2 && end.length >= 2) {
            return this.getAngle(end[1], end[0]) -
                this.getAngle(start[1], start[0]);
        }
        return 0;
    },


    /**
     * boolean if the direction is vertical
     * @param    {String}    direction
     * @returns  {Boolean}   is_vertical
     */
    isVertical: function isVertical(direction) {
        return (direction == Hammer.DIRECTION_UP || direction == Hammer.DIRECTION_DOWN);
    },


    /**
     * stop browser default behavior with css props
     * @param   {HtmlElement}   element
     * @param   {Object}        css_props
     */
    stopDefaultBrowserBehavior: function stopDefaultBrowserBehavior(element, css_props) {
        var prop,
            vendors = ['webkit','khtml','moz','ms','o',''];

        if(!css_props || !element.style) {
            return;
        }

        // with css properties for modern browsers
        for(var i = 0; i < vendors.length; i++) {
            for(var p in css_props) {
                if(css_props.hasOwnProperty(p)) {
                    prop = p;

                    // vender prefix at the property
                    if(vendors[i]) {
                        prop = vendors[i] + prop.substring(0, 1).toUpperCase() + prop.substring(1);
                    }

                    // set the style
                    element.style[prop] = css_props[p];
                }
            }
        }

        // also the disable onselectstart
        if(css_props.userSelect == 'none') {
            element.onselectstart = function() {
                return false;
            };
        }
    }
};

Hammer.detection = {
    // contains all registred Hammer.gestures in the correct order
    gestures: [],

    // data of the current Hammer.gesture detection session
    current: null,

    // the previous Hammer.gesture session data
    // is a full clone of the previous gesture.current object
    previous: null,

    // when this becomes true, no gestures are fired
    stopped: false,


    /**
     * start Hammer.gesture detection
     * @param   {Hammer.Instance}   inst
     * @param   {Object}            eventData
     */
    startDetect: function startDetect(inst, eventData) {
        // already busy with a Hammer.gesture detection on an element
        if(this.current) {
            return;
        }

        this.stopped = false;

        this.current = {
            inst        : inst, // reference to HammerInstance we're working for
            startEvent  : Hammer.utils.extend({}, eventData), // start eventData for distances, timing etc
            lastEvent   : false, // last eventData
            name        : '' // current gesture we're in/detected, can be 'tap', 'hold' etc
        };

        this.detect(eventData);
    },


    /**
     * Hammer.gesture detection
     * @param   {Object}    eventData
     * @param   {Object}    eventData
     */
    detect: function detect(eventData) {
        if(!this.current || this.stopped) {
            return;
        }

        // extend event data with calculations about scale, distance etc
        eventData = this.extendEventData(eventData);

        // instance options
        var inst_options = this.current.inst.options;

        // call Hammer.gesture handlers
        for(var g=0,len=this.gestures.length; g<len; g++) {
            var gesture = this.gestures[g];

            // only when the instance options have enabled this gesture
            if(!this.stopped && inst_options[gesture.name] !== false) {
                // if a handler returns false, we stop with the detection
                if(gesture.handler.call(gesture, eventData, this.current.inst) === false) {
                    this.stopDetect();
                    break;
                }
            }
        }

        // store as previous event event
        if(this.current) {
            this.current.lastEvent = eventData;
        }

        // endevent, but not the last touch, so dont stop
        if(eventData.eventType == Hammer.EVENT_END && !eventData.touches.length-1) {
            this.stopDetect();
        }

        return eventData;
    },


    /**
     * clear the Hammer.gesture vars
     * this is called on endDetect, but can also be used when a final Hammer.gesture has been detected
     * to stop other Hammer.gestures from being fired
     */
    stopDetect: function stopDetect() {
        // clone current data to the store as the previous gesture
        // used for the double tap gesture, since this is an other gesture detect session
        this.previous = Hammer.utils.extend({}, this.current);

        // reset the current
        this.current = null;

        // stopped!
        this.stopped = true;
    },


    /**
     * extend eventData for Hammer.gestures
     * @param   {Object}   ev
     * @returns {Object}   ev
     */
    extendEventData: function extendEventData(ev) {
        var startEv = this.current.startEvent;

        // if the touches change, set the new touches over the startEvent touches
        // this because touchevents don't have all the touches on touchstart, or the
        // user must place his fingers at the EXACT same time on the screen, which is not realistic
        // but, sometimes it happens that both fingers are touching at the EXACT same time
        if(startEv && (ev.touches.length != startEv.touches.length || ev.touches === startEv.touches)) {
            // extend 1 level deep to get the touchlist with the touch objects
            startEv.touches = [];
            for(var i=0,len=ev.touches.length; i<len; i++) {
                startEv.touches.push(Hammer.utils.extend({}, ev.touches[i]));
            }
        }

        var delta_time = ev.timeStamp - startEv.timeStamp,
            delta_x = ev.center.pageX - startEv.center.pageX,
            delta_y = ev.center.pageY - startEv.center.pageY,
            velocity = Hammer.utils.getVelocity(delta_time, delta_x, delta_y);

        Hammer.utils.extend(ev, {
            deltaTime   : delta_time,

            deltaX      : delta_x,
            deltaY      : delta_y,

            velocityX   : velocity.x,
            velocityY   : velocity.y,

            distance    : Hammer.utils.getDistance(startEv.center, ev.center),
            angle       : Hammer.utils.getAngle(startEv.center, ev.center),
            direction   : Hammer.utils.getDirection(startEv.center, ev.center),

            scale       : Hammer.utils.getScale(startEv.touches, ev.touches),
            rotation    : Hammer.utils.getRotation(startEv.touches, ev.touches),

            startEvent  : startEv
        });

        return ev;
    },


    /**
     * register new gesture
     * @param   {Object}    gesture object, see gestures.js for documentation
     * @returns {Array}     gestures
     */
    register: function register(gesture) {
        // add an enable gesture options if there is no given
        var options = gesture.defaults || {};
        if(options[gesture.name] === undefined) {
            options[gesture.name] = true;
        }

        // extend Hammer default options with the Hammer.gesture options
        Hammer.utils.extend(Hammer.defaults, options, true);

        // set its index
        gesture.index = gesture.index || 1000;

        // add Hammer.gesture to the list
        this.gestures.push(gesture);

        // sort the list by index
        this.gestures.sort(function(a, b) {
            if (a.index < b.index) {
                return -1;
            }
            if (a.index > b.index) {
                return 1;
            }
            return 0;
        });

        return this.gestures;
    }
};


Hammer.gestures = Hammer.gestures || {};

/**
 * Custom gestures
 * ==============================
 *
 * Gesture object
 * --------------------
 * The object structure of a gesture:
 *
 * { name: 'mygesture',
 *   index: 1337,
 *   defaults: {
 *     mygesture_option: true
 *   }
 *   handler: function(type, ev, inst) {
 *     // trigger gesture event
 *     inst.trigger(this.name, ev);
 *   }
 * }

 * @param   {String}    name
 * this should be the name of the gesture, lowercase
 * it is also being used to disable/enable the gesture per instance config.
 *
 * @param   {Number}    [index=1000]
 * the index of the gesture, where it is going to be in the stack of gestures detection
 * like when you build an gesture that depends on the drag gesture, it is a good
 * idea to place it after the index of the drag gesture.
 *
 * @param   {Object}    [defaults={}]
 * the default settings of the gesture. these are added to the instance settings,
 * and can be overruled per instance. you can also add the name of the gesture,
 * but this is also added by default (and set to true).
 *
 * @param   {Function}  handler
 * this handles the gesture detection of your custom gesture and receives the
 * following arguments:
 *
 *      @param  {Object}    eventData
 *      event data containing the following properties:
 *          timeStamp   {Number}        time the event occurred
 *          target      {HTMLElement}   target element
 *          touches     {Array}         touches (fingers, pointers, mouse) on the screen
 *          pointerType {String}        kind of pointer that was used. matches Hammer.POINTER_MOUSE|TOUCH
 *          center      {Object}        center position of the touches. contains pageX and pageY
 *          deltaTime   {Number}        the total time of the touches in the screen
 *          deltaX      {Number}        the delta on x axis we haved moved
 *          deltaY      {Number}        the delta on y axis we haved moved
 *          velocityX   {Number}        the velocity on the x
 *          velocityY   {Number}        the velocity on y
 *          angle       {Number}        the angle we are moving
 *          direction   {String}        the direction we are moving. matches Hammer.DIRECTION_UP|DOWN|LEFT|RIGHT
 *          distance    {Number}        the distance we haved moved
 *          scale       {Number}        scaling of the touches, needs 2 touches
 *          rotation    {Number}        rotation of the touches, needs 2 touches *
 *          eventType   {String}        matches Hammer.EVENT_START|MOVE|END
 *          srcEvent    {Object}        the source event, like TouchStart or MouseDown *
 *          startEvent  {Object}        contains the same properties as above,
 *                                      but from the first touch. this is used to calculate
 *                                      distances, deltaTime, scaling etc
 *
 *      @param  {Hammer.Instance}    inst
 *      the instance we are doing the detection for. you can get the options from
 *      the inst.options object and trigger the gesture event by calling inst.trigger
 *
 *
 * Handle gestures
 * --------------------
 * inside the handler you can get/set Hammer.detection.current. This is the current
 * detection session. It has the following properties
 *      @param  {String}    name
 *      contains the name of the gesture we have detected. it has not a real function,
 *      only to check in other gestures if something is detected.
 *      like in the drag gesture we set it to 'drag' and in the swipe gesture we can
 *      check if the current gesture is 'drag' by accessing Hammer.detection.current.name
 *
 *      @readonly
 *      @param  {Hammer.Instance}    inst
 *      the instance we do the detection for
 *
 *      @readonly
 *      @param  {Object}    startEvent
 *      contains the properties of the first gesture detection in this session.
 *      Used for calculations about timing, distance, etc.
 *
 *      @readonly
 *      @param  {Object}    lastEvent
 *      contains all the properties of the last gesture detect in this session.
 *
 * after the gesture detection session has been completed (user has released the screen)
 * the Hammer.detection.current object is copied into Hammer.detection.previous,
 * this is usefull for gestures like doubletap, where you need to know if the
 * previous gesture was a tap
 *
 * options that have been set by the instance can be received by calling inst.options
 *
 * You can trigger a gesture event by calling inst.trigger("mygesture", event).
 * The first param is the name of your gesture, the second the event argument
 *
 *
 * Register gestures
 * --------------------
 * When an gesture is added to the Hammer.gestures object, it is auto registered
 * at the setup of the first Hammer instance. You can also call Hammer.detection.register
 * manually and pass your gesture object as a param
 *
 */

/**
 * Hold
 * Touch stays at the same place for x time
 * @events  hold
 */
Hammer.gestures.Hold = {
    name: 'hold',
    index: 10,
    defaults: {
        hold_timeout	: 500,
        hold_threshold	: 1
    },
    timer: null,
    handler: function holdGesture(ev, inst) {
        switch(ev.eventType) {
            case Hammer.EVENT_START:
                // clear any running timers
                clearTimeout(this.timer);

                // set the gesture so we can check in the timeout if it still is
                Hammer.detection.current.name = this.name;

                // set timer and if after the timeout it still is hold,
                // we trigger the hold event
                this.timer = setTimeout(function() {
                    if(Hammer.detection.current.name == 'hold') {
                        inst.trigger('hold', ev);
                    }
                }, inst.options.hold_timeout);
                break;

            // when you move or end we clear the timer
            case Hammer.EVENT_MOVE:
                if(ev.distance > inst.options.hold_threshold) {
                    clearTimeout(this.timer);
                }
                break;

            case Hammer.EVENT_END:
                clearTimeout(this.timer);
                break;
        }
    }
};


/**
 * Tap/DoubleTap
 * Quick touch at a place or double at the same place
 * @events  tap, doubletap
 */
Hammer.gestures.Tap = {
    name: 'tap',
    index: 100,
    defaults: {
        tap_max_touchtime	: 250,
        tap_max_distance	: 10,
		tap_always			: true,
        doubletap_distance	: 20,
        doubletap_interval	: 300
    },
    handler: function tapGesture(ev, inst) {
        if(ev.eventType == Hammer.EVENT_END) {
            // previous gesture, for the double tap since these are two different gesture detections
            var prev = Hammer.detection.previous,
				did_doubletap = false;

            // when the touchtime is higher then the max touch time
            // or when the moving distance is too much
            if(ev.deltaTime > inst.options.tap_max_touchtime ||
                ev.distance > inst.options.tap_max_distance) {
                return;
            }

            // check if double tap
            if(prev && prev.name == 'tap' &&
                (ev.timeStamp - prev.lastEvent.timeStamp) < inst.options.doubletap_interval &&
                ev.distance < inst.options.doubletap_distance) {
				inst.trigger('doubletap', ev);
				did_doubletap = true;
            }

			// do a single tap
			if(!did_doubletap || inst.options.tap_always) {
				Hammer.detection.current.name = 'tap';
				inst.trigger(Hammer.detection.current.name, ev);
			}
        }
    }
};


/**
 * Swipe
 * triggers swipe events when the end velocity is above the threshold
 * @events  swipe, swipeleft, swiperight, swipeup, swipedown
 */
Hammer.gestures.Swipe = {
    name: 'swipe',
    index: 40,
    defaults: {
        // set 0 for unlimited, but this can conflict with transform
        swipe_max_touches  : 1,
        swipe_velocity     : 0.7
    },
    handler: function swipeGesture(ev, inst) {
        if(ev.eventType == Hammer.EVENT_END) {
            // max touches
            if(inst.options.swipe_max_touches > 0 &&
                ev.touches.length > inst.options.swipe_max_touches) {
                return;
            }

            // when the distance we moved is too small we skip this gesture
            // or we can be already in dragging
            if(ev.velocityX > inst.options.swipe_velocity ||
                ev.velocityY > inst.options.swipe_velocity) {
                // trigger swipe events
                inst.trigger(this.name, ev);
                inst.trigger(this.name + ev.direction, ev);
            }
        }
    }
};


/**
 * Drag
 * Move with x fingers (default 1) around on the page. Blocking the scrolling when
 * moving left and right is a good practice. When all the drag events are blocking
 * you disable scrolling on that area.
 * @events  drag, drapleft, dragright, dragup, dragdown
 */
Hammer.gestures.Drag = {
    name: 'drag',
    index: 50,
    defaults: {
        drag_min_distance : 10,
        // Set correct_for_drag_min_distance to true to make the starting point of the drag
        // be calculated from where the drag was triggered, not from where the touch started.
        // Useful to avoid a jerk-starting drag, which can make fine-adjustments
        // through dragging difficult, and be visually unappealing.
        correct_for_drag_min_distance : true,
        // set 0 for unlimited, but this can conflict with transform
        drag_max_touches  : 1,
        // prevent default browser behavior when dragging occurs
        // be careful with it, it makes the element a blocking element
        // when you are using the drag gesture, it is a good practice to set this true
        drag_block_horizontal   : false,
        drag_block_vertical     : false,
        // drag_lock_to_axis keeps the drag gesture on the axis that it started on,
        // It disallows vertical directions if the initial direction was horizontal, and vice versa.
        drag_lock_to_axis       : false,
        // drag lock only kicks in when distance > drag_lock_min_distance
        // This way, locking occurs only when the distance has become large enough to reliably determine the direction
        drag_lock_min_distance : 25
    },
    triggered: false,
    handler: function dragGesture(ev, inst) {
        // current gesture isnt drag, but dragged is true
        // this means an other gesture is busy. now call dragend
        if(Hammer.detection.current.name != this.name && this.triggered) {
            inst.trigger(this.name +'end', ev);
            this.triggered = false;
            return;
        }

        // max touches
        if(inst.options.drag_max_touches > 0 &&
            ev.touches.length > inst.options.drag_max_touches) {
            return;
        }

        switch(ev.eventType) {
            case Hammer.EVENT_START:
                this.triggered = false;
                break;

            case Hammer.EVENT_MOVE:
                // when the distance we moved is too small we skip this gesture
                // or we can be already in dragging
                if(ev.distance < inst.options.drag_min_distance &&
                    Hammer.detection.current.name != this.name) {
                    return;
                }

                // we are dragging!
                if(Hammer.detection.current.name != this.name) {
                    Hammer.detection.current.name = this.name;
                    if (inst.options.correct_for_drag_min_distance) {
                        // When a drag is triggered, set the event center to drag_min_distance pixels from the original event center.
                        // Without this correction, the dragged distance would jumpstart at drag_min_distance pixels instead of at 0.
                        // It might be useful to save the original start point somewhere
                        var factor = Math.abs(inst.options.drag_min_distance/ev.distance);
                        Hammer.detection.current.startEvent.center.pageX += ev.deltaX * factor;
                        Hammer.detection.current.startEvent.center.pageY += ev.deltaY * factor;

                        // recalculate event data using new start point
                        ev = Hammer.detection.extendEventData(ev);
                    }
                }

                // lock drag to axis?
                if(Hammer.detection.current.lastEvent.drag_locked_to_axis || (inst.options.drag_lock_to_axis && inst.options.drag_lock_min_distance<=ev.distance)) {
                    ev.drag_locked_to_axis = true;
                }
                var last_direction = Hammer.detection.current.lastEvent.direction;
                if(ev.drag_locked_to_axis && last_direction !== ev.direction) {
                    // keep direction on the axis that the drag gesture started on
                    if(Hammer.utils.isVertical(last_direction)) {
                        ev.direction = (ev.deltaY < 0) ? Hammer.DIRECTION_UP : Hammer.DIRECTION_DOWN;
                    }
                    else {
                        ev.direction = (ev.deltaX < 0) ? Hammer.DIRECTION_LEFT : Hammer.DIRECTION_RIGHT;
                    }
                }

                // first time, trigger dragstart event
                if(!this.triggered) {
                    inst.trigger(this.name +'start', ev);
                    this.triggered = true;
                }

                // trigger normal event
                inst.trigger(this.name, ev);

                // direction event, like dragdown
                inst.trigger(this.name + ev.direction, ev);

                // block the browser events
                if( (inst.options.drag_block_vertical && Hammer.utils.isVertical(ev.direction)) ||
                    (inst.options.drag_block_horizontal && !Hammer.utils.isVertical(ev.direction))) {
                    ev.preventDefault();
                }
                break;

            case Hammer.EVENT_END:
                // trigger dragend
                if(this.triggered) {
                    inst.trigger(this.name +'end', ev);
                }

                this.triggered = false;
                break;
        }
    }
};


/**
 * Transform
 * User want to scale or rotate with 2 fingers
 * @events  transform, pinch, pinchin, pinchout, rotate
 */
Hammer.gestures.Transform = {
    name: 'transform',
    index: 45,
    defaults: {
        // factor, no scale is 1, zoomin is to 0 and zoomout until higher then 1
        transform_min_scale     : 0.01,
        // rotation in degrees
        transform_min_rotation  : 1,
        // prevent default browser behavior when two touches are on the screen
        // but it makes the element a blocking element
        // when you are using the transform gesture, it is a good practice to set this true
        transform_always_block  : false
    },
    triggered: false,
    handler: function transformGesture(ev, inst) {
        // current gesture isnt drag, but dragged is true
        // this means an other gesture is busy. now call dragend
        if(Hammer.detection.current.name != this.name && this.triggered) {
            inst.trigger(this.name +'end', ev);
            this.triggered = false;
            return;
        }

        // atleast multitouch
        if(ev.touches.length < 2) {
            return;
        }

        // prevent default when two fingers are on the screen
        if(inst.options.transform_always_block) {
            ev.preventDefault();
        }

        switch(ev.eventType) {
            case Hammer.EVENT_START:
                this.triggered = false;
                break;

            case Hammer.EVENT_MOVE:
                var scale_threshold = Math.abs(1-ev.scale);
                var rotation_threshold = Math.abs(ev.rotation);

                // when the distance we moved is too small we skip this gesture
                // or we can be already in dragging
                if(scale_threshold < inst.options.transform_min_scale &&
                    rotation_threshold < inst.options.transform_min_rotation) {
                    return;
                }

                // we are transforming!
                Hammer.detection.current.name = this.name;

                // first time, trigger dragstart event
                if(!this.triggered) {
                    inst.trigger(this.name +'start', ev);
                    this.triggered = true;
                }

                inst.trigger(this.name, ev); // basic transform event

                // trigger rotate event
                if(rotation_threshold > inst.options.transform_min_rotation) {
                    inst.trigger('rotate', ev);
                }

                // trigger pinch event
                if(scale_threshold > inst.options.transform_min_scale) {
                    inst.trigger('pinch', ev);
                    inst.trigger('pinch'+ ((ev.scale < 1) ? 'in' : 'out'), ev);
                }
                break;

            case Hammer.EVENT_END:
                // trigger dragend
                if(this.triggered) {
                    inst.trigger(this.name +'end', ev);
                }

                this.triggered = false;
                break;
        }
    }
};


/**
 * Touch
 * Called as first, tells the user has touched the screen
 * @events  touch
 */
Hammer.gestures.Touch = {
    name: 'touch',
    index: -Infinity,
    defaults: {
        // call preventDefault at touchstart, and makes the element blocking by
        // disabling the scrolling of the page, but it improves gestures like
        // transforming and dragging.
        // be careful with using this, it can be very annoying for users to be stuck
        // on the page
        prevent_default: false,

        // disable mouse events, so only touch (or pen!) input triggers events
        prevent_mouseevents: false
    },
    handler: function touchGesture(ev, inst) {
        if(inst.options.prevent_mouseevents && ev.pointerType == Hammer.POINTER_MOUSE) {
            ev.stopDetect();
            return;
        }

        if(inst.options.prevent_default) {
            ev.preventDefault();
        }

        if(ev.eventType ==  Hammer.EVENT_START) {
            inst.trigger(this.name, ev);
        }
    }
};


/**
 * Release
 * Called as last, tells the user has released the screen
 * @events  release
 */
Hammer.gestures.Release = {
    name: 'release',
    index: Infinity,
    handler: function releaseGesture(ev, inst) {
        if(ev.eventType ==  Hammer.EVENT_END) {
            inst.trigger(this.name, ev);
        }
    }
};

// Based off Lo-Dash's excellent UMD wrapper (slightly modified) - https://github.com/bestiejs/lodash/blob/master/lodash.js#L5515-L5543
// some AMD build optimizers, like r.js, check for specific condition patterns like the following:
if(typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    // Expose Hammer to the global object even when an AMD loader is present in
    // case Hammer was injected by a third-party script and not intended to be
    // loaded as a module.
    window.Hammer = Hammer;

    // define as an anonymous module
    define(function() {
        return Hammer;
    });
}
// check for `exports` after `define` in case a build optimizer adds an `exports` object
else if(typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = Hammer;
}
else {
    window.Hammer = Hammer;
}
})(this);


(function($, undefined) {
    'use strict';

    // no jQuery or Zepto!
    if($ === undefined) {
        return;
    }

    /**
     * bind dom events
     * this overwrites addEventListener
     * @param   {HTMLElement}   element
     * @param   {String}        eventTypes
     * @param   {Function}      handler
     */
    Hammer.event.bindDom = function(element, eventTypes, handler) {
        $(element).on(eventTypes, function(ev) {
            var data = ev.originalEvent || ev;

            // IE pageX fix
            if(data.pageX === undefined) {
                data.pageX = ev.pageX;
                data.pageY = ev.pageY;
            }

            // IE target fix
            if(!data.target) {
                data.target = ev.target;
            }

            // IE button fix
            if(data.which === undefined) {
                data.which = data.button;
            }

            // IE preventDefault
            if(!data.preventDefault) {
                data.preventDefault = ev.preventDefault;
            }

            // IE stopPropagation
            if(!data.stopPropagation) {
                data.stopPropagation = ev.stopPropagation;
            }

            handler.call(this, data);
        });
    };

    /**
     * the methods are called by the instance, but with the jquery plugin
     * we use the jquery event methods instead.
     * @this    {Hammer.Instance}
     * @return  {jQuery}
     */
    Hammer.Instance.prototype.on = function(types, handler) {
        return $(this.element).on(types, handler);
    };
    Hammer.Instance.prototype.off = function(types, handler) {
        return $(this.element).off(types, handler);
    };


    /**
     * trigger events
     * this is called by the gestures to trigger an event like 'tap'
     * @this    {Hammer.Instance}
     * @param   {String}    gesture
     * @param   {Object}    eventData
     * @return  {jQuery}
     */
    Hammer.Instance.prototype.trigger = function(gesture, eventData){
        var el = $(this.element);
        if(el.has(eventData.target).length) {
            el = $(eventData.target);
        }

        return el.trigger({
            type: gesture,
            gesture: eventData
        });
    };


    /**
     * jQuery plugin
     * create instance of Hammer and watch for gestures,
     * and when called again you can change the options
     * @param   {Object}    [options={}]
     * @return  {jQuery}
     */
    $.fn.hammer = function(options) {
        return this.each(function() {
            var el = $(this);
            var inst = el.data('hammer');
            // start new hammer instance
            if(!inst) {
                el.data('hammer', new Hammer(this, options || {}));
            }
            // change the options
            else if(inst && options) {
                Hammer.utils.extend(inst.options, options);
            }
        });
    };

})(window.jQuery || window.Zepto);

/*global jQuery */
/*!	
* Lettering.JS 0.6.1
*
* Copyright 2010, Dave Rupert http://daverupert.com
* Released under the WTFPL license 
* http://sam.zoy.org/wtfpl/
*
* Thanks to Paul Irish - http://paulirish.com - for the feedback.
*
* Date: Mon Sep 20 17:14:00 2010 -0600
*/
(function($){
	function injector(t, splitter, klass, after) {
		var a = t.text().split(splitter), inject = '';
		if (a.length) {
			$(a).each(function(i, item) {
				inject += '<span class="'+klass+(i+1)+'">'+item+'</span>'+after;
			});	
			t.empty().append(inject);
		}
	}
	
	var methods = {
		init : function() {

			return this.each(function() {
				injector($(this), '', 'char', '');
			});

		},

		words : function() {

			return this.each(function() {
				injector($(this), ' ', 'word', ' ');
			});

		},
		
		lines : function() {

			return this.each(function() {
				var r = "eefec303079ad17405c889e092e105b0";
				// Because it's hard to split a <br/> tag consistently across browsers,
				// (*ahem* IE *ahem*), we replaces all <br/> instances with an md5 hash 
				// (of the word "split").  If you're trying to use this plugin on that 
				// md5 hash string, it will fail because you're being ridiculous.
				injector($(this).children("br").replaceWith(r).end(), r, 'line', '');
			});

		}
	};

	$.fn.lettering = function( method ) {
		// Method calling logic
		if ( method && methods[method] ) {
			return methods[ method ].apply( this, [].slice.call( arguments, 1 ));
		} else if ( method === 'letters' || ! method ) {
			return methods.init.apply( this, [].slice.call( arguments, 0 ) ); // always pass an array
		}
		$.error( 'Method ' +  method + ' does not exist on jQuery.lettering' );
		return this;
	};

})(jQuery);
/*! Copyright (c) 2013 Brandon Aaron (http://brandonaaron.net)
 * Licensed under the MIT License (LICENSE.txt).
 *
 * Thanks to: http://adomas.org/javascript-mouse-wheel/ for some pointers.
 * Thanks to: Mathias Bank(http://www.mathias-bank.de) for a scope bug fix.
 * Thanks to: Seamus Leahy for adding deltaX and deltaY
 *
 * Version: 3.1.3
 *
 * Requires: 1.2.2+
 */

(function (factory) {
    if ( typeof define === 'function' && define.amd ) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node/CommonJS style for Browserify
        module.exports = factory;
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {

    var toFix = ['wheel', 'mousewheel', 'DOMMouseScroll', 'MozMousePixelScroll'];
    var toBind = 'onwheel' in document || document.documentMode >= 9 ? ['wheel'] : ['mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'];
    var lowestDelta, lowestDeltaXY;

    if ( $.event.fixHooks ) {
        for ( var i = toFix.length; i; ) {
            $.event.fixHooks[ toFix[--i] ] = $.event.mouseHooks;
        }
    }

    $.event.special.mousewheel = {
        setup: function() {
            if ( this.addEventListener ) {
                for ( var i = toBind.length; i; ) {
                    this.addEventListener( toBind[--i], handler, false );
                }
            } else {
                this.onmousewheel = handler;
            }
        },

        teardown: function() {
            if ( this.removeEventListener ) {
                for ( var i = toBind.length; i; ) {
                    this.removeEventListener( toBind[--i], handler, false );
                }
            } else {
                this.onmousewheel = null;
            }
        }
    };

    $.fn.extend({
        mousewheel: function(fn) {
            return fn ? this.bind("mousewheel", fn) : this.trigger("mousewheel");
        },

        unmousewheel: function(fn) {
            return this.unbind("mousewheel", fn);
        }
    });


    function handler(event) {
        var orgEvent = event || window.event,
            args = [].slice.call(arguments, 1),
            delta = 0,
            deltaX = 0,
            deltaY = 0,
            absDelta = 0,
            absDeltaXY = 0,
            fn;
        event = $.event.fix(orgEvent);
        event.type = "mousewheel";

        // Old school scrollwheel delta
        if ( orgEvent.wheelDelta ) { delta = orgEvent.wheelDelta; }
        if ( orgEvent.detail )     { delta = orgEvent.detail * -1; }

        // New school wheel delta (wheel event)
        if ( orgEvent.deltaY ) {
            deltaY = orgEvent.deltaY * -1;
            delta  = deltaY;
        }
        if ( orgEvent.deltaX ) {
            deltaX = orgEvent.deltaX;
            delta  = deltaX * -1;
        }

        // Webkit
        if ( orgEvent.wheelDeltaY !== undefined ) { deltaY = orgEvent.wheelDeltaY; }
        if ( orgEvent.wheelDeltaX !== undefined ) { deltaX = orgEvent.wheelDeltaX * -1; }

        // Look for lowest delta to normalize the delta values
        absDelta = Math.abs(delta);
        if ( !lowestDelta || absDelta < lowestDelta ) { lowestDelta = absDelta; }
        absDeltaXY = Math.max(Math.abs(deltaY), Math.abs(deltaX));
        if ( !lowestDeltaXY || absDeltaXY < lowestDeltaXY ) { lowestDeltaXY = absDeltaXY; }

        // Get a whole value for the deltas
        fn = delta > 0 ? 'floor' : 'ceil';
        delta  = Math[fn](delta / lowestDelta);
        deltaX = Math[fn](deltaX / lowestDeltaXY);
        deltaY = Math[fn](deltaY / lowestDeltaXY);

        // Add event and delta to the front of the arguments
        args.unshift(event, delta, deltaX, deltaY);

        return ($.event.dispatch || $.event.handle).apply(this, args);
    }

}));

(function($,sr){

  // debouncing function from John Hann
  // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
  var debounce = function (func, threshold, execAsap) {
      var timeout;

      return function debounced () {
          var obj = this, args = arguments;
          function delayed () {
              if (!execAsap)
                  func.apply(obj, args);
              timeout = null;
          };

          if (timeout)
              clearTimeout(timeout);
          else if (execAsap)
              func.apply(obj, args);

          timeout = setTimeout(delayed, threshold || 100);
      };
  }
  // smartresize 
  jQuery.fn[sr] = function(fn){  return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr); };

})(jQuery,'smartresize');
/*
	TweenDeck - For making animated presentation decks with Greensock
	by John Polacek (@johnpolacek) - with some help from @greensock himself

	Powered by the Greensock Tweening Platform
	http://www.greensock.com
	Greensock License info at http://www.greensock.com/licensing/

	Dual licensed under MIT and GPL.
*/

(function($) {

	$.tweendeck = function(timeline, options) {

		var tweendeck = this;
		var positions = [];
		var positionIndex = 1;
		var timeScale = 0;
		var defaults = {
			allowSkip:true
		};
		tweendeck.settings = $.extend({}, defaults, options);

		// Record the start time of each child tween/timeline
		$.each(timeline.getChildren(false), function() {
			positions.push(this.startTime());
		});
		positions.push(timeline.duration()); // add end of timeline to the positions

        timeline.tweenTo(positions[1]); //animate to the first deck

		// Keyboard events
		$(document).on('keydown', function(e){
			// down/right arrow, pagedown, space = play forward
			if ((e.keyCode === 34 || e.keyCode === 39 || e.keyCode === 32 || e.keyCode === 40) && positionIndex < positions.length) {
				tweendeck.next();
			}
			// up/left arrow, pageup = rewind
			else if ((e.keyCode === 33 || e.keyCode === 37 || e.keyCode === 38) && positionIndex > 1) {
				tweendeck.prev();
			}
		});

		// Move the playhead to the appropriate position (based on the index)
		function tweenTo(i) {
			if (tweendeck.settings.allowSkip) {
				timeScale++; //speed up if the user keeps pushing the button.
			} else if (timeScale !== 0) {
				// If the timeScale isn't 0, that means we're mid-tween, and since allowSkip is false, we should ignore the request.
				return;
			} else {
				timeScale = 1;
			}
			positionIndex = i;
			// Tween the "time" (playhead) to the new position using a linear ease. We could have used timeline.tweenTo() if we knew the timeline would always be a TimelineMax, but this code makes it compatible with TimelineLite too.
			TweenLite.to(timeline, Math.abs(positions[i] - timeline.time()), {time:positions[i], ease:Linear.easeNone, onComplete:function() {
					// Reset the timeScale when the tween is done
					timeScale = 0;
				}
			}).timeScale(timeScale);
		}

		// Public Functions
		tweendeck.next = function() {
			tweenTo(positionIndex+1);
		};
		tweendeck.prev = function() {
			tweenTo(positionIndex-1);
		};

		return tweendeck;
	};

})(jQuery);

/**
 * scripts.js
 */
/*global TimelineMax: true,TimelineLite: true,TweenMax: true,Bounce:true, Back:true, Quad:true, Expo:true, Elastic:true */

(function($) {

  // requires parent container to have absolute or relative positioning and overflow:hidden
  function fitImage($container) {
    $container.imageFill();
  }

  // create a timeline
  var tl = new TimelineMax();


  // ---------------------------------------
  // Add animation for each step
  // ---------------------------------------

  var i;

  // INTRO (plays automatically, pauses at end)
  $('#slide-title h1').lettering();
  var intro = new TimelineMax();
  intro.add(TweenMax.to($('#slide-title'),0,{immediateRender:false,css:{display:'block'}}));
  intro.add(TweenMax.fromTo($('body'),0.5,{backgroundColor:'#fff'},{delay:0.5,backgroundColor:'#99cee2'}));
  $('#slide-title h1 span').css({position:'relative'}).each(function() {
    intro.add(TweenMax.from(this, 2, {css:{top: Math.random()*200+600, left: (Math.random()*1000)-500, rotation:Math.random()*720-360}, ease:Back.easeOut}),1.25);
  });
  intro.add(TweenMax.from($('#fork-ribbon'), 0.5, {top:-200,right:-200, ease:Expo.easeOut}));
  intro.add(TweenMax.from($('#author,.instructions'), 0.5, {opacity:0}));
  tl.add(intro);


  // SLIDE ======================================================================== //

  // each slide gets a timeline
  var slideGithub = new TimelineMax();

  // for each slide, animate out the previous content
  $('#slide-title h1 span').css({position:'relative'}).each(function() {
    slideGithub.add(TweenMax.to(this, 1.5, {css:{opacity:0, top: Math.random()*-200-400, left: (Math.random()*1000)-500, rotation:Math.random()*720-360}, ease:Expo.easeIn}),0);
  });
  slideGithub.add(TweenMax.to($('#author,.instructions').css({position:'relative'}), 0.5, {opacity:0}),0);
  slideGithub.add(TweenMax.to($('#fork-ribbon'), 0.5, {top:-200,right:-200, ease:Expo.easeIn}),0);
  slideGithub.add(TweenMax.to($('#slide-title'),0,{immediateRender:false,css:{display:'none'}}));

  // then animate in the new slide content
  slideGithub.add(TweenMax.to($('#slide-github'),0,{immediateRender:false,css:{display:'block'}}),1);
  slideGithub.add(TweenMax.to($('body'),0.5,{backgroundColor:'#4183c4'}),1);
  slideGithub.add(TweenMax.from($('#slide-github .step1'),0.5,{opacity:0}));
  slideGithub.add(TweenMax.from($('#slide-github .step2'),0.5,{opacity:0,rotationY:720, transformOrigin:"50% 50%", perspective:2000,delay:-0.25}));
  slideGithub.add(TweenMax.from($('#octocat'),0.25,{left:-300,delay:0.75}));
  slideGithub.add(TweenMax.from($('#slide-github .step3'),0.375,{opacity:0,top:160,ease:Back.easeOut,delay:-0.25}));
  tl.add(slideGithub);


  // SLIDE ======================================================================== //
  var slideWhy = new TimelineMax();
  // outro prev slide
  slideWhy.add(TweenMax.to($('#octocat'),0.25,{left:-300, ease:Expo.easeIn}),0);
  slideWhy.add(TweenMax.to($('#slide-github .step1'),0.25,{left:'100%', ease:Expo.easeIn}),0);
  slideWhy.add(TweenMax.to($('#slide-github .step2'),0.25,{left:'100%', ease:Expo.easeIn}),0);
  slideWhy.add(TweenMax.to($('#slide-github .step3'),0.25,{left:'100%', ease:Expo.easeIn}),0);
  slideWhy.add(TweenMax.to($('#slide-github'),0,{immediateRender:false,css:{display:'none'}}));

  // set initial state
  $('#slide-why .step').css({position:'absolute',top:125});
  $('#slide-why .step5').css({position:'absolute',top:240});

  // intro
  slideWhy.add(TweenMax.to($('#slide-why'),0,{immediateRender:false,css:{display:'block'}}));
  slideWhy.add(TweenMax.to($('body'),0.5,{backgroundColor:'#fff2d0'}));
  slideWhy.add(TweenMax.fromTo($('#slide-why .step1'),0.5,{top:240},{top:120}),0);
  slideWhy.add(TweenMax.fromTo($('#slide-why .step1 h1'),0.5,{fontSize:'0px'},{fontSize:'160px'}),0);

  var slideWhy1 = new TimelineMax();
  slideWhy1.add(TweenMax.to($('#slide-why .step1 h1'),0.25,{fontSize:'120px'}));
  slideWhy1.add(TweenMax.to($('#slide-why .step1'),0.25,{top:30}),0);
  slideWhy1.add(TweenMax.from($('#slide-why .step2'),0.5,{opacity:0}));
  slideWhy1.add(TweenMax.from($('#slide-why .step2 .step-a'),0.5,{right:-400,ease:Bounce.easeOut}),0);
  slideWhy1.add(TweenMax.from($('#slide-why .step2 .img-left'),0.5,{rotationY:-720, transformOrigin:"50% 50%", perspective:2000, ease:Expo.easeOut}),0);

  var slideWhy2 = new TimelineMax();
  slideWhy2.add(TweenMax.to($('#slide-why .step2'),0.25,{opacity:0}));
  slideWhy2.add(TweenMax.to($('#slide-why .step2 .img-left'),0.5,{rotationY:720, transformOrigin:"50% 50%", perspective:2000, ease:Expo.easeInOut}),0);
  slideWhy2.add(TweenMax.from($('#slide-why .step3 .img-left'),0.5,{rotationY:-720, transformOrigin:"50% 50%", perspective:2000, ease:Expo.easeInOut}),0);
  slideWhy2.add(TweenMax.from($('#slide-why .step3 .step-a'),0.5,{right:-400,ease:Bounce.easeOut}),0);
  slideWhy2.add(TweenMax.from($('#slide-why .step3'),0.5,{opacity:0}),0);

  var slideWhy3 = new TimelineMax();
  slideWhy3.add(TweenMax.to($('#slide-why .step3'),0.25,{opacity:0}));
  slideWhy3.add(TweenMax.to($('#slide-why .step3 .img-left'),0.5,{rotationY:720, transformOrigin:"50% 50%", perspective:2000, ease:Expo.easeInOut}),0);
  slideWhy3.add(TweenMax.from($('#slide-why .step4 .img-left'),0.5,{rotationY:-720, transformOrigin:"50% 50%", perspective:2000, ease:Expo.easeInOut}),0);
  slideWhy3.add(TweenMax.from($('#slide-why .step4 .step-a'),0.5,{right:-400,ease:Bounce.easeOut}),0);
  slideWhy3.add(TweenMax.from($('#slide-why .step4'),0.5,{opacity:0}),0);

  var slideWhy4 = new TimelineMax();
  slideWhy4.add(TweenMax.to($('#slide-why .step4'),0.25,{opacity:0}));
  slideWhy4.add(TweenMax.from($('#slide-why .step5'),0.5,{opacity:0,left:-400,ease:Expo.easeOut}));

  // add all steps, one at a time to keep pauses
  tl.add(slideWhy);
  tl.add(slideWhy1);
  tl.add(slideWhy2);
  tl.add(slideWhy3);
  tl.add(slideWhy4);


  // SLIDE ======================================================================== //
  var slideEpic = new TimelineMax();
  // outro prev slide
  slideEpic.add(TweenMax.to($('#slide-why .step5'),0.25,{left:400,ease:Expo.easeIn}));
  slideEpic.add(TweenMax.to($('#slide-why'),0.25,{opacity:0}),0);
  slideEpic.add(TweenMax.to($('#slide-why'),0,{immediateRender:false,css:{display:'none'}}));

  // intro
  slideEpic.add(TweenMax.to($('#slide-epic'),0,{immediateRender:false,css:{display:'block'}}));
  slideEpic.add(TweenMax.to($('body'),0.5,{backgroundColor:'#c00000'}));
  slideEpic.add(TweenMax.from($('#slide-epic img').css('position','relative'),0.75,{opacity:0,top:150,rotationY:450, delay:-0.25,transformOrigin:"50% 50%", perspective:2000,ease:Expo.easeOut}));
  tl.add(slideEpic);


  // SLIDE ======================================================================== //
  var slideSuck = new TimelineMax();
  // outro prev slide
  slideSuck.add(TweenMax.to($('#slide-epic'),0.25,{opacity:0}));
  slideSuck.add(TweenMax.to($('#slide-epic'),0,{immediateRender:false,css:{display:'none'}}));

  // intro
  slideSuck.add(TweenMax.to($('#slide-suck'),0,{immediateRender:false,css:{display:'block'}}));
  slideSuck.add(TweenMax.to($('body'),1,{backgroundColor:'#c9d787'}),0);
  $('#slide-suck .step').lettering();
  slideSuck.add(TweenMax.from($('#slide-suck .step1'),0.25,{opacity:0}));
  $('#slide-suck .step1').find('span').css({position:'relative'}).each(function() {
    slideSuck.add(TweenMax.from($(this),0.25+Math.random(),{
      top:Math.random()*400-200, ease:Expo.easeOut
    }),1);
  });

  var slideSuck1 = new TimelineMax();
  slideSuck1.add(TweenMax.from($('#slide-suck .step2'),0.25,{opacity:0}));
  $('#slide-suck .step2').find('span').css({position:'relative'}).each(function() {
    slideSuck1.add(TweenMax.from($(this),0.25,{
      left:Math.random()*1440-720, ease:Expo.easeOut
    }),0);
  });

  tl.add(slideSuck);
  tl.add(slideSuck1);


  // SLIDE ======================================================================== //
  var slideLearning = new TimelineMax();
  // outro prev slide
  slideLearning.add(TweenMax.to($('#slide-suck'),0.25,{opacity:0}));
  slideLearning.add(TweenMax.to($('#slide-suck'),0,{immediateRender:false,css:{display:'none'}}));

  // intro
  $('#slide-learning .step1').lettering();
  slideLearning.add(TweenMax.to($('#slide-learning'),0,{immediateRender:false,css:{display:'block'}}));
  slideLearning.add(TweenMax.from($('#slide-learning .step1'),0.5,{opacity:0,letterSpacing:'50px',ease:Back.easeOut}));
  slideLearning.add(TweenMax.from($('#slide-learning .step2'),1,{opacity:0,rotationX:90, transformOrigin:"50% bottom", perspective:1000,ease:Elastic.easeOut}),0);
  slideLearning.add(TweenMax.to($('body'),1,{backgroundColor:'#284e4f'}),0);

  var slideLearning1 = new TimelineMax();
  slideLearning1.add(TweenMax.to($('#slide-learning .step2'),0.2,{opacity:0,rotationX:90, transformOrigin:"50% bottom", perspective:1000}));
  slideLearning1.add(TweenMax.from($('#slide-learning .step3'),1,{opacity:0,rotationX:90, transformOrigin:"50% bottom", perspective:1000,ease:Elastic.easeOut}));

  var slideLearning2 = new TimelineMax();
  slideLearning2.add(TweenMax.to($('#slide-learning .step3'),0.2,{opacity:0,rotationX:90, transformOrigin:"50% bottom", perspective:1000}));
  slideLearning2.add(TweenMax.from($('#slide-learning .step4'),1,{opacity:0,rotationX:90, transformOrigin:"50% bottom", perspective:1000,ease:Elastic.easeOut}));

  tl.add(slideLearning);
  tl.add(slideLearning1);
  tl.add(slideLearning2);


  // SLIDE ======================================================================== //
  var slideMe = new TimelineMax();
  // outro prev slide
  slideMe.add(TweenMax.to($('#slide-learning'),0.25,{opacity:0}));
  slideMe.add(TweenMax.to($('#slide-learning'),0,{immediateRender:false,css:{display:'none'}}));

  // intro
  slideMe.add(TweenMax.to($('#slide-me'),0,{immediateRender:false,css:{display:'block'}}));
  slideMe.add(TweenMax.from($('#slide-me'),0.25,{opacity:0}));
  slideMe.add(TweenMax.from($('#slide-me .step1'),0.25,{opacity:0,rotation:-720,fontSize:'1px',ease:Expo.easeOut}));
  slideMe.add(TweenMax.to($('body'),1,{backgroundColor:'#363942'}),0);
  tl.add(slideMe);

  var slideMe1 = new TimelineMax();
  slideMe1.add(TweenMax.to($('#slide-me .step1'),0.25,{rotation:720,fontSize:'2px',opacity:0,ease:Expo.easeIn}));
  slideMe1.add(TweenMax.from($('#slide-me .step2'),0.25,{rotation:-720,fontSize:'2px',opacity:0,ease:Expo.easeOut}));

  var slideMe2 = new TimelineMax();
  slideMe2.add(TweenMax.to($('#slide-me .step2'),0.25,{rotation:720,fontSize:'2px',opacity:0,ease:Expo.easeIn}));
  slideMe2.add(TweenMax.from($('#slide-me .step3'),0.25,{rotation:-720,fontSize:'2px',opacity:0,ease:Expo.easeOut}));

  tl.add(slideMe);
  tl.add(slideMe1);
  tl.add(slideMe2);
  

  // SLIDE ======================================================================== //
  var slideSuccess = new TimelineMax();
  // outro prev slide
  slideSuccess.add(TweenMax.to($('#slide-me'),0.25,{opacity:0}));
  slideSuccess.add(TweenMax.to($('#slide-me'),0,{immediateRender:false,css:{display:'none'}}));

  // intro
  slideSuccess.add(TweenMax.to($('body'),1,{backgroundColor:'#959fb2'}),0);
  slideSuccess.add(TweenMax.to($('#slide-success'),0,{immediateRender:false,css:{display:'block'}}),0.25);
  slideSuccess.add(TweenMax.from($('#slide-success .step1'),0.25,{opacity:0,rotationX:Math.random()*90,rotationY:Math.random()*90, transformOrigin:Math.round(Math.random()*100)+'% '+Math.round(Math.random()*100)+'%'+' '+(Math.round(Math.random()*400)-200), perspective:2000}),0.25);
  tl.add(slideSuccess);

  var slideSuccess1 = new TimelineMax();
  slideSuccess1.add(TweenMax.to($('#slide-success .step1'),0.25,{opacity:0,rotationX:Math.random()*90,rotationY:Math.random()*90, transformOrigin:Math.round(Math.random()*100)+'% '+Math.round(Math.random()*100)+'%'+' '+(Math.round(Math.random()*400)-200), perspective:2000}));
  slideSuccess1.add(TweenMax.from($('#slide-success .step2'),0.25,{opacity:0,rotationX:Math.random()*90,rotationY:Math.random()*90, transformOrigin:Math.round(Math.random()*100)+'% '+Math.round(Math.random()*100)+'%'+' '+(Math.round(Math.random()*400)-200), perspective:2000}),0);
  tl.add(slideSuccess1);

  var slideSuccess2 = new TimelineMax();
  slideSuccess2.add(TweenMax.to($('#slide-success .step2'),0.25,{opacity:0,rotationX:Math.random()*90,rotationY:Math.random()*90, transformOrigin:Math.round(Math.random()*100)+'% '+Math.round(Math.random()*100)+'%'+' '+(Math.round(Math.random()*400)-200), perspective:2000}));
  slideSuccess2.add(TweenMax.from($('#slide-success .step3'),0.25,{opacity:0,rotationX:Math.random()*90,rotationY:Math.random()*90, transformOrigin:Math.round(Math.random()*100)+'% '+Math.round(Math.random()*100)+'%'+' '+(Math.round(Math.random()*400)-200), perspective:2000}),0);
  tl.add(slideSuccess2);


  // SLIDE ======================================================================== //
  var slideHotsnot = new TimelineMax();
  // outro prev slide
  slideHotsnot.add(TweenMax.to($('#slide-success'),0.25,{opacity:0}));
  slideHotsnot.add(TweenMax.to($('#slide-success'),0,{immediateRender:false,css:{display:'none'}}));

  // intro
  slideHotsnot.add(TweenMax.to($('#slide-hotsnot'),0,{immediateRender:false,css:{display:'block'}}));
  slideHotsnot.add(TweenMax.from($('#slide-hotsnot .step1a'),0.5,{opacity:0,rotationY:-90,left:-400,ease:Expo.easeOut}),0.25);
  slideHotsnot.add(TweenMax.from($('#slide-hotsnot .step1b'),0.5,{opacity:0,rotationY:90,right:-400,ease:Expo.easeOut}),0.25);
  slideHotsnot.add(TweenMax.to($('body'),1,{backgroundColor:'#7d8a2e'}),0);
  tl.add(slideHotsnot);

  var slideHotsnot1 = new TimelineMax();
  slideHotsnot1.add(TweenMax.to($('#slide-hotsnot .step1a'),0.5,{opacity:0,rotationY:-90,right:-400,ease:Expo.easeOut}),0.25);
  slideHotsnot1.add(TweenMax.to($('#slide-hotsnot .step1b'),0.5,{opacity:0,rotationY:90,left:-400,ease:Expo.easeOut}),0.25);
  slideHotsnot1.add(TweenMax.from($('#slide-hotsnot .step2a'),0.5,{opacity:0,rotationY:-90,right:-400,ease:Expo.easeOut}),0.25);
  slideHotsnot1.add(TweenMax.from($('#slide-hotsnot .step2b'),0.5,{opacity:0,rotationY:90,left:-400,ease:Expo.easeOut}),0.25);
  slideHotsnot1.add(TweenMax.to($('body'),1,{backgroundColor:'#91aa9d'}),0);
  tl.add(slideHotsnot1);

  var slideHotsnot2 = new TimelineMax();
  slideHotsnot2.add(TweenMax.to($('#slide-hotsnot .step2a'),0.5,{opacity:0,rotationY:-90,right:-400,ease:Expo.easeOut}),0.25);
  slideHotsnot2.add(TweenMax.to($('#slide-hotsnot .step2b'),0.5,{opacity:0,rotationY:90,left:-400,ease:Expo.easeOut}),0.25);
  slideHotsnot2.add(TweenMax.from($('#slide-hotsnot .step3'),0.5,{opacity:0,rotationX:90,bottom:-400,ease:Expo.easeOut}),0.25);
  slideHotsnot2.add(TweenMax.to($('body'),1,{backgroundColor:'#c7d93d'}),0);
  tl.add(slideHotsnot2);

  var slideHotsnot3 = new TimelineMax();
  slideHotsnot3.add(TweenMax.to($('#slide-hotsnot .step3'),0.5,{opacity:0,rotationX:90,bottom:-400,ease:Expo.easeOut}),0.25);
  slideHotsnot3.add(TweenMax.from($('#slide-hotsnot .step4'),0.5,{opacity:0,rotationX:90,bottom:-400,ease:Expo.easeOut}),0.25);
  slideHotsnot3.add(TweenMax.to($('body'),1,{backgroundColor:'#d9a73d'}),0);
  tl.add(slideHotsnot3);


  // SLIDE ======================================================================== //
  var slideHero = new TimelineMax();
  // outro prev slide
  slideHero.add(TweenMax.to($('#slide-hotsnot'),0.25,{opacity:0}));
  slideHero.add(TweenMax.to($('#slide-hotsnot'),0,{immediateRender:false,css:{display:'none'}}));

  // intro
  slideHero.add(TweenMax.to($('#slide-hero'),0,{immediateRender:false,css:{display:'block'}}));
  slideHero.add(TweenMax.from($('#slide-hero'),0.5,{opacity:0,top:-30}));
  slideHero.add(TweenMax.from($('#slide-hero .octocats img').eq(0),1.5,{opacity:0,rotationX:90, transformOrigin:"50% top", perspective:2000,ease:Elastic.easeOut}),0.5);
  slideHero.add(TweenMax.from($('#slide-hero .octocats img').eq(1),1.5,{opacity:0,rotationX:90, transformOrigin:"50% top", perspective:2000,ease:Elastic.easeOut}),0.75);
  slideHero.add(TweenMax.from($('#slide-hero .octocats img').eq(2),1.5,{opacity:0,rotationX:90, transformOrigin:"50% top", perspective:2000,ease:Elastic.easeOut}),1);
  slideHero.add(TweenMax.from($('#slide-hero .octocats img').eq(3),1.5,{opacity:0,rotationX:90, transformOrigin:"50% top", perspective:2000,ease:Elastic.easeOut}),1.25);
  slideHero.add(TweenMax.from($('#slide-hero .octocats img').eq(4),1.5,{opacity:0,rotationX:90, transformOrigin:"50% top", perspective:2000,ease:Elastic.easeOut}),1.375);
  slideHero.add(TweenMax.to($('body'),1,{backgroundColor:'#d9f1f7'}),0);
  tl.add(slideHero);


  // SLIDE ======================================================================== //
  var slideHow = new TimelineMax();

  $('#slide-how .step').find('.step-a,.step-b').lettering();

  // outro prev slide
  slideHow.add(TweenMax.to($('#slide-hero'),0.25,{opacity:0,top:-100,ease:Expo.easeIn}));
  slideHow.add(TweenMax.to($('#slide-hero'),0,{immediateRender:false,css:{display:'none'}}));

  // intro
  slideHow.add(TweenMax.to($('#slide-how'),0,{immediateRender:false,css:{display:'block'}}));
  slideHow.add(TweenMax.from($('#slide-how'),0.25,{opacity:0,top:40,ease:Expo.easeOut}));
  $('#slide-how .step').eq(0).find('.step-a span').css('position','relative').each(function(index) {
    slideHow.add(TweenMax.from($(this),0.25,{opacity:0,left:Math.random()*800-400,top:-50,ease:Back.easeOut}),0.25+index*0.025);
  });
  $('#slide-how .step').eq(0).find('.step-b span').css('position','relative').each(function(index) {
    slideHow.add(TweenMax.from($(this),0.25,{opacity:0,left:Math.random()*800-400,top:200,ease:Back.easeOut}),0.25+index*0.025);
  });
  tl.add(slideHow);

  var slideHow1 = new TimelineMax();
  slideHow1.add(TweenMax.to($('#slide-how .step').eq(0),0.25,{opacity:0}));
  $('#slide-how .step').eq(1).find('.step-a span').css('position','relative').each(function(index) {
    slideHow1.add(TweenMax.from($(this),0.25,{opacity:0,left:Math.random()*800-400,top:-50,ease:Back.easeOut}),0.25+index*0.025);
  });
  $('#slide-how .step').eq(1).find('.step-b span').css('position','relative').each(function(index) {
    slideHow1.add(TweenMax.from($(this),0.25,{opacity:0,left:Math.random()*800-400,top:200,ease:Back.easeOut}),0.25+index*0.025);
  });
  tl.add(slideHow1);

  var slideHow2 = new TimelineMax();
  slideHow2.add(TweenMax.to($('#slide-how .step').eq(1),0.25,{opacity:0}));
  $('#slide-how .step').eq(2).find('.step-a span').css('position','relative').each(function(index) {
    slideHow2.add(TweenMax.from($(this),0.25,{opacity:0,left:Math.random()*800-400,top:-50,ease:Back.easeOut}),0.25+index*0.025);
  });
  $('#slide-how .step').eq(2).find('.step-b span').css('position','relative').each(function(index) {
    slideHow2.add(TweenMax.from($(this),0.25,{opacity:0,left:Math.random()*800-400,top:200,ease:Back.easeOut}),0.25+index*0.025);
  });
  tl.add(slideHow2);

  var slideHow3 = new TimelineMax();
  slideHow3.add(TweenMax.to($('#slide-how .step').eq(2),0.25,{opacity:0}));
  $('#slide-how .step').eq(3).find('.step-a span').css('position','relative').each(function(index) {
    slideHow3.add(TweenMax.from($(this),0.25,{opacity:0,left:Math.random()*800-400,top:-50,ease:Back.easeOut}),0.25+index*0.025);
  });
  $('#slide-how .step').eq(3).find('.step-b span').css('position','relative').each(function(index) {
    slideHow3.add(TweenMax.from($(this),0.25,{opacity:0,left:Math.random()*800-400,top:200,ease:Back.easeOut}),0.25+index*0.025);
  });
  tl.add(slideHow3);

  var slideHow4 = new TimelineMax();
  slideHow4.add(TweenMax.to($('#slide-how .step').eq(3),0.25,{opacity:0}));
  $('#slide-how .step').eq(4).find('.step-a span').css('position','relative').each(function(index) {
    slideHow4.add(TweenMax.from($(this),0.25,{opacity:0,left:Math.random()*800-400,top:-50,ease:Back.easeOut}),0.25+index*0.025);
  });
  $('#slide-how .step').eq(4).find('.step-b span').css('position','relative').each(function(index) {
    slideHow4.add(TweenMax.from($(this),0.2,{opacity:0,left:Math.random()*800-400,top:200,ease:Back.easeOut}),0.2+index*0.0125);
  });
  tl.add(slideHow4);


  // SLIDE ======================================================================== //
  var slideExample = new TimelineMax();
  // outro prev slide
  slideExample.add(TweenMax.to($('#slide-how'),0.25,{opacity:0}));
  slideExample.add(TweenMax.to($('#slide-how'),0,{immediateRender:false,css:{display:'none'}}));

  // intro
  slideExample.add(TweenMax.to($('#slide-example'),0,{immediateRender:false,css:{display:'block'}}));
  slideExample.add(TweenMax.from($('#slide-example'),1.5,{opacity:0,rotationY:720, transformOrigin:"50% 50%", perspective:1000, ease:Elastic.easeOut}));
  slideExample.add(TweenMax.to($('body'),1,{backgroundColor:'#99cee2'}),0);
  tl.add(slideExample);


  // SLIDE ======================================================================== //
  var slideDemo = new TimelineMax();
  // outro prev slide
  slideDemo.add(TweenMax.to($('#slide-example'),0.25,{opacity:0}));
  slideDemo.add(TweenMax.to($('#slide-example'),0,{immediateRender:false,css:{display:'none'}}));

  // intro
  slideDemo.add(TweenMax.to($('#slide-demo'),0,{immediateRender:false,css:{display:'block'}}));
  slideDemo.add(TweenMax.from($('#slide-demo'),0.25,{opacity:0,top:-600,ease:Expo.easeOut}));
  slideDemo.add(TweenMax.to($('body'),1,{backgroundColor:'#e9f2a0'}),0);
  tl.add(slideDemo);

  var slideDemo1 = new TimelineMax();
  slideDemo1.add(TweenMax.to($('#slide-demo .step').eq(0),0.125,{opacity:0,top:-600,ease:Expo.easeOut}));
  slideDemo1.add(TweenMax.from($('#slide-demo .step').eq(1),0.25,{opacity:0,top:-600,ease:Expo.easeOut}));
  tl.add(slideDemo1);

  var slideDemo2 = new TimelineMax();
  slideDemo2.add(TweenMax.to($('#slide-demo .step').eq(1),0.125,{opacity:0,top:-600,ease:Expo.easeOut}));
  slideDemo2.add(TweenMax.from($('#slide-demo .step').eq(2),0.25,{opacity:0,top:-600,ease:Expo.easeOut}));
  tl.add(slideDemo2);

  var slideDemo3 = new TimelineMax();
  slideDemo3.add(TweenMax.to($('#slide-demo .step').eq(2),0.125,{opacity:0,top:-600,ease:Expo.easeOut}));
  slideDemo3.add(TweenMax.from($('#slide-demo .step').eq(3),0.25,{opacity:0,top:-600,ease:Expo.easeOut}));
  tl.add(slideDemo3);

  var slideDemo4 = new TimelineMax();
  slideDemo4.add(TweenMax.to($('#slide-demo .step').eq(3),0.125,{opacity:0,top:-600,ease:Expo.easeOut}));
  slideDemo4.add(TweenMax.from($('#slide-demo .step').eq(4),0.25,{opacity:0,top:-600,ease:Expo.easeOut}));
  tl.add(slideDemo4);

  var slideDemo5 = new TimelineMax();
  slideDemo5.add(TweenMax.to($('#slide-demo .step').eq(4),0.125,{opacity:0,top:-600,ease:Expo.easeOut}));
  slideDemo5.add(TweenMax.from($('#slide-demo .step').eq(5),0.25,{opacity:0,top:-600,ease:Expo.easeOut}));
  tl.add(slideDemo5);


  // SLIDE ======================================================================== //
  var slideTips = new TimelineMax();
  // outro prev slide
  slideTips.add(TweenMax.to($('#slide-demo'),0.25,{opacity:0}));
  slideTips.add(TweenMax.to($('#slide-demo'),0,{immediateRender:false,css:{display:'none'}}));

  // intro
  slideTips.add(TweenMax.to($('#slide-tips'),0,{immediateRender:false,css:{display:'block'}}));
  slideTips.add(TweenMax.from($('#slide-tips'),0.25,{opacity:0}));
  slideTips.add(TweenMax.from($('#slide-tips .step').eq(0),0.25,{opacity:0,fontSize:'1px',ease:Quad.easeOut}));
  slideTips.add(TweenMax.to($('body'),0.5,{backgroundColor:'#615aa3'}),0);
  tl.add(slideTips);

  var slideTips1 = new TimelineMax();
  slideTips1.add(TweenMax.to($('#slide-tips .step').eq(0),0.25,{opacity:0}));
  slideTips1.add(TweenMax.from($('#slide-tips .step').eq(1),0.25,{opacity:0,fontSize:'1px',ease:Quad.easeOut}));
  tl.add(slideTips1);

  var slideTips2 = new TimelineMax();
  slideTips2.add(TweenMax.to($('#slide-tips .step').eq(1),0.25,{opacity:0}));
  slideTips2.add(TweenMax.from($('#slide-tips .step').eq(2),0.25,{opacity:0,fontSize:'1px',ease:Quad.easeOut}));
  tl.add(slideTips2);


  // SLIDE ======================================================================== //
  var slideTimid = new TimelineMax();
  // outro prev slide
  slideTimid.add(TweenMax.to($('#slide-tips'),0.25,{opacity:0}));
  slideTimid.add(TweenMax.to($('#slide-tips'),0,{immediateRender:false,css:{display:'none'}}));

  // intro
  slideTimid.add(TweenMax.to($('#slide-timid'),0,{immediateRender:false,css:{display:'block'}}));
  slideTimid.add(TweenMax.from($('#slide-timid'),0.25,{opacity:0,top:-600,ease:Back.easeOut}));
  slideTimid.add(TweenMax.to($('body'),1,{backgroundColor:'#e74c3c'}),0);
  tl.add(slideTimid);

  var slideTimid1 = new TimelineMax();
  slideTimid1.add(TweenMax.to($('#slide-timid .step').eq(0),0.125,{opacity:0,top:-600}));
  slideTimid1.add(TweenMax.from($('#slide-timid .step').eq(1),0.25,{opacity:0,top:600,ease:Back.easeOut}));
  tl.add(slideTimid1);

  var slideTimid2 = new TimelineMax();
  slideTimid2.add(TweenMax.to($('#slide-timid .step').eq(1),0.125,{opacity:0,top:600}));
  slideTimid2.add(TweenMax.from($('#slide-timid .step').eq(2),0.25,{opacity:0,top:-600,ease:Back.easeOut}));
  tl.add(slideTimid2);


  // SLIDE ======================================================================== //
  var slideOpen = new TimelineMax();
  // outro prev slide
  slideOpen.add(TweenMax.to($('#slide-timid'),0.25,{opacity:0}));
  slideOpen.add(TweenMax.to($('#slide-timid'),0,{immediateRender:false,css:{display:'none'}}));

  // intro
  $('#slide-open .step').css({display:'none'}).eq(0).css({display:'block'});
  slideOpen.add(TweenMax.to($('#slide-open'),0,{immediateRender:false,css:{display:'block'}}));
  slideOpen.add(TweenMax.to($('body'),1,{backgroundColor:'#DDFF8C'}),0);
  slideOpen.add(TweenMax.from($('#slide-open .step').eq(0),0.5,{opacity:0,rotationX:Math.random()*360,rotationY:Math.random()*360, transformOrigin:Math.round(Math.random()*100)+'% '+Math.round(Math.random()*100)+'%'+' '+(Math.round(Math.random()*400)-200), perspective:2000,ease:Back.easeOut}),0.5);
  tl.add(slideOpen);

  var slideOpen1 = new TimelineMax();
  slideOpen1.add(TweenMax.to($('#slide-open .step').eq(0),0.2,{opacity:0}));
  slideOpen1.add(TweenMax.to($('#slide-open .step').eq(0),0.01,{immediateRender:false,css:{display:'none'}}));
  slideOpen1.add(TweenMax.to($('#slide-open .step').eq(1),0.01,{immediateRender:false,css:{display:'block'},delay:0.01}));
  slideOpen1.add(TweenMax.from($('#slide-open .step').eq(1),0.5,{opacity:0,left:Math.random()*1280-640,rotationX:Math.random()*360,rotationY:Math.random()*360, transformOrigin:Math.round(Math.random()*100)+'% '+Math.round(Math.random()*100)+'%'+' '+(Math.round(Math.random()*400)-200), perspective:2000,ease:Back.easeOut}));
  tl.add(slideOpen1);

  var slideOpen2 = new TimelineMax();
  slideOpen2.add(TweenMax.to($('#slide-open .step').eq(1),0.2,{opacity:0}));
  slideOpen2.add(TweenMax.to($('#slide-open .step').eq(1),0.01,{immediateRender:false,css:{display:'none'}}));
  slideOpen2.add(TweenMax.to($('#slide-open .step').eq(2),0.01,{immediateRender:false,css:{display:'block'},delay:0.01}));
  slideOpen2.add(TweenMax.from($('#slide-open .step').eq(2),0.5,{opacity:0,left:Math.random()*1280-640,rotationX:Math.random()*360,rotationY:Math.random()*360, transformOrigin:Math.round(Math.random()*100)+'% '+Math.round(Math.random()*100)+'%'+' '+(Math.round(Math.random()*400)-200), perspective:2000,ease:Back.easeOut}));
  tl.add(slideOpen2);

  var slideOpen3 = new TimelineMax();
  slideOpen3.add(TweenMax.to($('#slide-open .step').eq(2),0.2,{opacity:0}));
  slideOpen3.add(TweenMax.to($('#slide-open .step').eq(2),0.01,{immediateRender:false,css:{display:'none'}}));
  slideOpen3.add(TweenMax.to($('#slide-open .step').eq(3),0.01,{immediateRender:false,css:{display:'block'},delay:0.01}));
  slideOpen3.add(TweenMax.from($('#slide-open .step').eq(3),0.5,{opacity:0,left:Math.random()*1280-640,rotationX:Math.random()*360,rotationY:Math.random()*360, transformOrigin:Math.round(Math.random()*100)+'% '+Math.round(Math.random()*100)+'%'+' '+(Math.round(Math.random()*400)-200), perspective:2000,ease:Back.easeOut}));
  tl.add(slideOpen3);

  var slideOpen4 = new TimelineMax();
  slideOpen4.add(TweenMax.to($('#slide-open .step').eq(3),0.2,{opacity:0}));
  slideOpen4.add(TweenMax.to($('#slide-open .step').eq(3),0.01,{immediateRender:false,css:{display:'none'}}));
  slideOpen1.add(TweenMax.to($('#slide-open .step').eq(4),0.01,{immediateRender:false,css:{display:'block'},delay:0.01}));
  slideOpen4.add(TweenMax.from($('#slide-open .step').eq(4),0.5,{opacity:0,left:Math.random()*1280-640,rotationX:Math.random()*360,rotationY:Math.random()*360, transformOrigin:Math.round(Math.random()*100)+'% '+Math.round(Math.random()*100)+'%'+' '+(Math.round(Math.random()*400)-200), perspective:2000,ease:Back.easeOut}));
  tl.add(slideOpen4);


  // SLIDE ======================================================================== //
  var slideAction = new TimelineMax();
  // outro prev slide
  slideAction.add(TweenMax.to($('#slide-open'),0.25,{opacity:0}));
  slideAction.add(TweenMax.to($('#slide-open'),0,{immediateRender:false,css:{display:'none'}}));

  // intro
  slideAction.add(TweenMax.to($('#slide-action'),0,{immediateRender:false,css:{display:'block'}}));
  tl.add(slideAction);
  slideAction.add(TweenMax.to($('body'),1,{backgroundColor:'#08a689'}),0);

  var slideAction1 = new TimelineMax();
  slideAction1.add(TweenMax.from($('#slide-action .step').eq(0),0.5,{opacity:0, top:600, ease:Bounce.easeOut}));
  tl.add(slideAction1);

  var slideAction2 = new TimelineMax();
  slideAction2.add(TweenMax.from($('#slide-action .step').eq(1),0.5,{opacity:0, top:600, ease:Bounce.easeOut}));
  tl.add(slideAction2);

  var slideAction3 = new TimelineMax();
  slideAction3.add(TweenMax.from($('#slide-action .step').eq(2),0.5,{opacity:0, top:600, ease:Bounce.easeOut}));
  tl.add(slideAction3);

  var slideAction4 = new TimelineMax();
  slideAction4.add(TweenMax.from($('#slide-action .step').eq(3),0.5,{opacity:0, top:600, ease:Bounce.easeOut}));
  tl.add(slideAction4);


  // SLIDE ======================================================================== //
  var slideEnd = new TimelineMax();
  // outro prev slide
  slideEnd.add(TweenMax.to($('#slide-action'),0.25,{opacity:0}));
  slideEnd.add(TweenMax.to($('#slide-action'),0,{immediateRender:false,css:{display:'none'}}));

  // intro
  $('#slide-end h1').lettering();
  slideEnd.add(TweenMax.to($('#slide-end'),0,{immediateRender:false,css:{display:'block'}}));
  $('#slide-end span').each(function(index) {
    slideEnd.add(TweenMax.from($(this).css('position','relative'),0.5,{opacity:0,top:Math.random()*800-400,left:Math.random()*800-400,ease:Expo.easeInOut}),0.5+(0.05*index*Math.random()));
  });
  slideEnd.add(TweenMax.to($('body'),0.75,{backgroundColor:'#4183c4'}),0);

  tl.add(slideEnd);

  // SLIDE ======================================================================== //
  var slideAppendix = new TimelineMax();
  // outro prev slide
  slideAppendix.add(TweenMax.to($('#slide-end'),0.25,{opacity:0}));
  slideAppendix.add(TweenMax.to($('#slide-end'),0,{immediateRender:false,css:{display:'none'}}));

  // intro
  slideAppendix.add(TweenMax.to($('#slide-appendix'),0,{immediateRender:false,css:{display:'block'}}));
  slideAppendix.add(TweenMax.from($('#slide-appendix'),0.5,{opacity:0}));

  tl.add(slideAppendix);


  // send the timeline into TweenDeck - DONE!
  var deck = $.tweendeck(tl);

  // add scroll event control via jQuery mousewheel - https://github.com/brandonaaron/jquery-mousewheel#readme
  var mwThrottle = false;
  $('body').mousewheel(function(event, delta, deltaX, deltaY) {
    if (!mwThrottle) {
      setTimeout(function() { mwThrottle = false; }, 1000);
      mwThrottle = true;
      if (delta > 0) {
        deck.prev();
      } else {
        deck.next();
      }
    }
  });

  $('#btn-prev').on('click',function() {
    deck.prev();
  });
  $('#btn-next').on('click',function() {
    deck.next();
  });


}(jQuery));
