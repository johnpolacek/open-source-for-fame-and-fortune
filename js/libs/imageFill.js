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