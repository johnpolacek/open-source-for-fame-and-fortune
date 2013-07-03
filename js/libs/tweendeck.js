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
