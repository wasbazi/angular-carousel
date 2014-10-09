/**
 * Angular Carousel - Mobile friendly touch carousel for AngularJS
 * @version v0.2.5 - 2014-10-10
 * @link http://revolunet.github.com/angular-carousel
 * @author Julien Bouquillon <julien@revolunet.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
/*global angular */

/*
Angular touch carousel with CSS GPU accel and slide buffering
http://github.com/revolunet/angular-carousel

*/

angular.module('angular-carousel', [
    'ngTouch'
]);

angular.module('angular-carousel')

.directive('rnCarouselAutoSlide', ['$timeout', function($timeout) {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
        var delay = Math.round(parseFloat(attrs.rnCarouselAutoSlide) * 1000),
            timer = increment = false, slidesCount = element.children().length;

        if(!scope.carouselExposedIndex){
            scope.carouselExposedIndex = 0;
        }
        stopAutoplay = function () {
            if (angular.isDefined(timer)) {
                $timeout.cancel(timer);
            }
            timer = undefined;
        };

        increment = function () {
            if (scope.carouselExposedIndex < slidesCount - 1) {
                scope.carouselExposedIndex =  scope.carouselExposedIndex + 1;
            } else {
                scope.carouselExposedIndex = 0;
            }
        };

        restartTimer = function (){
            stopAutoplay();
            timer = $timeout(increment, delay);
        };

        scope.$watch('carouselIndex', function(){
           restartTimer();
        });

        restartTimer();
        if (attrs.rnCarouselPauseOnHover && attrs.rnCarouselPauseOnHover != 'false'){
            element.on('mouseenter', stopAutoplay);

            element.on('mouseleave', restartTimer);
        }

        scope.$on('$destroy', function(){
            stopAutoplay();
            element.off('mouseenter', stopAutoplay);
            element.off('mouseleave', restartTimer);
        });


    }
  };
}]);
angular.module('angular-carousel')

.directive('rnCarouselControls', [function() {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      items: '=',
      index: '='
    },
    link: function(scope, element, attrs) {
      scope.prev = function() {
        if (scope.index > 0) scope.index--;
      };
      scope.next = function() {
        if (scope.index < scope.items.length-1) scope.index++;
      };
    },
    templateUrl: 'carousel-controls.html'
  };
}]);

angular.module('angular-carousel').run(['$templateCache', function($templateCache) {
  $templateCache.put('carousel-controls.html',
    '<div class="rn-carousel-controls">\n' +
    '  <span class="rn-carousel-control rn-carousel-control-prev" ng-click="prev()" ng-if="index > 0"></span>\n' +
    '  <span class="rn-carousel-control rn-carousel-control-next" ng-click="next()" ng-if="index < items.length - 1"></span>\n' +
    '</div>'
  );
}]);
angular.module('angular-carousel')

.directive('rnCarouselIndicators', [function() {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      items: '=',
      index: '='
    },
    templateUrl: 'carousel-indicators.html'
  };
}]);

angular.module('angular-carousel').run(['$templateCache', function($templateCache) {
  $templateCache.put('carousel-indicators.html',
      '<div class="rn-carousel-indicator">\n' +
      ' <span ng-repeat="item in items" ng-click="$parent.index=$index" ng-class="{active: $index==$parent.index}"></span>\n' +
      '</div>'
  );
}]);





(function() {
    "use strict";

    angular.module('angular-carousel')

    .service('getCapabilities', function() {

        // detect supported CSS property
        function detectTransformProperty() {
            var transformProperty = 'transform';
            ['webkit', 'Moz', 'O', 'ms'].every(function (prefix) {
                var e = prefix + 'Transform';
                if (typeof document.body.style[e] !== 'undefined') {
                    transformProperty = e;
                    return false;
                }
                return true;
            });
            return false;
        }

        //Detect support of translate3d
        function detect3dSupport() {
            var el = document.createElement('p'),
            has3d,
            transforms = {
                'webkitTransform':'-webkit-transform',
                'msTransform':'-ms-transform',
                'transform':'transform'
            };
            // Add it to the body to get the computed style
            document.body.insertBefore(el, null);
            for(var t in transforms){
                if( el.style[t] !== undefined ){
                    el.style[t] = 'translate3d(1px,1px,1px)';
                    has3d = window.getComputedStyle(el).getPropertyValue(transforms[t]);
                }
            }
            document.body.removeChild(el);
            return (has3d !== undefined && has3d.length > 0 && has3d !== "none");
        }

        return {
            has3d: detect3dSupport(),
            transformProperty: detectTransformProperty()
        };

    })

    .service('computeCarouselSlideStyle', function() {
      return function(slideIndex, offset, transitionType) {
        var absoluteLeft = (slideIndex * 100) + (offset);
        var distance = ((100 - Math.abs(absoluteLeft)) / 100);

        if (transitionType == 'slide') {
          return {
            'left': absoluteLeft + '%'
          };
        } else if (transitionType == 'fadeAndSlide') {
          var opacity = 0;
          if (Math.abs(absoluteLeft) < 100) {
              opacity = distance;
          }
          return {
            'left': absoluteLeft + '%',
            'opacity': opacity
          };
        } else if (transitionType == 'hexagon') {
          var transformFrom = 100,
              degrees = 0,
              maxDegrees = 70 * (distance - 1);
        
          transformFrom = offset < (slideIndex * -100)?100:0;
          degrees = offset < (slideIndex * -100)?maxDegrees:-maxDegrees;

          return {
            'transform': 'rotateY(' + degrees + 'deg)',
            'left': absoluteLeft + '%',
            '-webkit-transform-origin': transformFrom + '% 50%'
          };
        }
      };
    })


    .service('getCarouselSlidesStyles', function(computeCarouselSlideStyle) {
      // compute given slides styles and add a 'style' key to the slides objects
      return function(slides, offset, transitionType) {
        var styles = []
        angular.forEach(slides, function(slide, slideIndex) {
          styles.push(computeCarouselSlideStyle(slideIndex, offset, transitionType));
        });
        return styles;
      };
    })

    .service('createStyleString', function() {
        return function(object) {
            var styles = [];
            angular.forEach(object, function(value, key) {
                styles.push(key + ':' + value);
            });
            return styles.join(';');
        };
    })




//                     // detect supported CSS property
//                     transformProperty = 'transform';
//                     ['webkit', 'Moz', 'O', 'ms'].every(function (prefix) {
//                         var e = prefix + 'Transform';
//                         if (typeof document.body.style[e] !== 'undefined') {
//                             transformProperty = e;
//                             return false;
//                         }
//                         return true;
//                     });

//                     //Detect support of translate3d
//                     function detect3dSupport(){
//                         var el = document.createElement('p'),
//                         has3d,
//                         transforms = {
//                             'webkitTransform':'-webkit-transform',
//                             'msTransform':'-ms-transform',
//                             'transform':'transform'
//                         };
//                         // Add it to the body to get the computed style
//                         document.body.insertBefore(el, null);
//                         for(var t in transforms){
//                             if( el.style[t] !== undefined ){
//                                 el.style[t] = 'translate3d(1px,1px,1px)';
//                                 has3d = window.getComputedStyle(el).getPropertyValue(transforms[t]);
//                             }
//                         }
//                         document.body.removeChild(el);
//                         return (has3d !== undefined && has3d.length > 0 && has3d !== "none");
//                     }

//                     var is3dAvailable = detect3dSupport();




    .directive('rnCarousel', ['$swipe', '$window', '$document', '$parse', '$compile', '$rootScope', 'getCapabilities', 'computeCarouselSlideStyle', 'createStyleString', function($swipe, $window, $document, $parse, $compile, $rootScope, getCapabilities, computeCarouselSlideStyle, createStyleString) {
        // internal ids to allow multiple instances
        var carouselId = 0,
            // in container % how much we need to drag to trigger the slide change
            moveTreshold = 0.05,
            // in absolute pixels, at which distance the slide stick to the edge on release
            rubberTreshold = 3;

        var requestAnimationFrame = $window.requestAnimationFrame || $window.webkitRequestAnimationFrame || $window.mozRequestAnimationFrame;

        return {
            restrict: 'A',
            scope: true,
            compile: function(tElement, tAttributes) {
                // use the compile phase to customize the DOM
                var firstChildAttributes = tElement.children()[0].attributes,
                    isRepeatBased = false,
                    isBuffered = false,
                    repeatItem,
                    repeatCollection;

                // add CSS classes
                tElement.addClass('rn-carousel-slides');
                tElement.children().addClass('rn-carousel-slide');

                // try to find an ngRepeat expression
                // at this point, the attributes are not yet normalized so we need to try various syntax
                ['ng-repeat', 'data-ng-repeat', 'ng:repeat', 'x-ng-repeat'].every(function(attr) {
                    var repeatAttribute = firstChildAttributes[attr];
                    if (angular.isDefined(repeatAttribute)) {
                        // ngRepeat regexp extracted from angular 1.2.7 src
                        var exprMatch = repeatAttribute.value.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?\s*$/),
                            trackProperty = exprMatch[3];

                        repeatItem = exprMatch[1];
                        repeatCollection = exprMatch[2];

                        if (repeatItem) {
                            if (angular.isDefined(tAttributes['rnCarouselBuffered'])) {
                                // update the current ngRepeat expression and add a slice operator if buffered
                                isBuffered = true;
                                repeatAttribute.value = repeatItem + ' in ' + repeatCollection + '|carouselSlice:carouselBufferIndex:carouselBufferSize';
                                if (trackProperty) {
                                    repeatAttribute.value += ' track by ' + trackProperty;
                                }
                            }
                            isRepeatBased = true;
                            return false;
                        }
                    }
                    return true;
                });

                return function(scope, iElement, iAttributes, containerCtrl) {

                    carouselId++;

                    var transformProperty,
                        pressed,
                        startX,
                        offset = 0,
                        destination,
                        swipeMoved = false,
                        animOnIndexChange = true,
                        currentSlides,
                        elWidth = null,
                        elX = null;

                    iElement.addClass('rn-carousel');

                    $swipe.bind(iElement, {
                        start: swipeStart,
                        move: swipeMove,
                        end: swipeEnd,
                        cancel: function(event) {
                          swipeEnd({}, event);
                        }
                    });

                    function documentMouseUpEvent(event) {
                        // in case we click outside the carousel, trigger a fake swipeEnd
                        swipeMoved = true;
                        swipeEnd({
                            x: event.clientX,
                            y: event.clientY
                        }, event);
                    }


                    function updateSlidesPosition(offset) {
                        // apply transformation to carousel childrens
                        var style;
                        angular.forEach(iElement.children(), function(child, index) {
                            style = createStyleString(computeCarouselSlideStyle(index, offset, 'slide'));
                            child.setAttribute('style', style);
                        });
                    }

                     function goToSlide(index) {
                        // animate slides transition using Tweenable
                        var tweenable = new Tweenable();
                        tweenable.tween({
                          from:     {
                            'x': offset
                          },
                          to: {
                            'x': index * -100
                          },
                          duration: 300,
                          easing: 'easeTo',
                          step : function (state) {
                            scope.$apply(function() {
                              updateSlidesPosition(state.x);
                            });
                          },
                          finish: function() {
                            scope.$apply(function() {
                                scope.carouselIndex = index;
                                offset = index * -100;
                            });
                          }
                        });
                      }

                    function getContainerWidth() {
                        return iElement[0].getBoundingClientRect().width;
                    }

                    function swipeStart(coords, event) {
                        // console.log('swipeStart', coords, event);
                        $document.bind('mouseup', documentMouseUpEvent);
                        elWidth = getContainerWidth();
                        elX = iElement.children()[0].getBoundingClientRect().left;
                        pressed = true;
                        startX = coords.x;
                        return false;
                    }

                    var delta=0;
                    function swipeMove(coords, event) {
                        //console.log('swipeMove', coords, event);
                        var x;
                        if (pressed) {
                            x = coords.x;
                            delta = startX - x;
                            if (delta > 2 || delta < -2) {
                                swipeMoved = true;
                                var moveOffset = offset + (-delta * 100 / elWidth);
                                updateSlidesPosition(moveOffset);
                            }
                        }
                        return false;
                    }

                    scope.$watchCollection(repeatCollection, function(newValue, oldValue) {
                        updateSlidesPosition(0);
                        currentSlides = newValue;
                    });

                    scope.carouselIndex = 0;

                    function swipeEnd(coords, event, forceAnimation) {
                        console.log('swipeEnd', 'scope.carouselIndex', scope.carouselIndex);

                        // Prevent clicks on buttons inside slider to trigger "swipeEnd" event on touchend/mouseup
                        if(event && !swipeMoved) {
                            return;
                        }

                        $document.unbind('mouseup', documentMouseUpEvent);
                        pressed = false;
                        swipeMoved = false;

                        destination = startX - coords.x;
                        offset += (-destination * 100 / elWidth);

                        var minMove = moveTreshold * elWidth,
                             absMove = -destination,
                             slidesMove = -Math[absMove>=0?'ceil':'floor'](absMove / elWidth),
                             shouldMove = Math.abs(absMove) > minMove;

                        if ((slidesMove + scope.carouselIndex) >= currentSlides.length ) {
                            slidesMove = currentSlides.length - 1 - scope.carouselIndex;
                        }
                        if ((slidesMove + scope.carouselIndex) < 0) {
                            slidesMove = -scope.carouselIndex;
                        }
                        var moveOffset = shouldMove?slidesMove:0;

                        destination = (scope.carouselIndex + moveOffset);

                        goToSlide(destination);

                    }


                };
            }
        };
    }]);
})();




//                     // if indicator or controls, setup the watch
//                     if (angular.isDefined(iAttributes.rnCarouselIndicator) || angular.isDefined(iAttributes.rnCarouselControl)) {
//                         updateIndicatorArray();
//                         scope.$watch('carouselIndex', function(newValue) {
//                             scope.indicatorIndex = newValue;
//                             scope.carouselExposedIndex = newValue;
//                         });
//                         scope.$watch('indicatorIndex', function(newValue) {
//                             goToSlide(newValue, true);
//                         });

//                     }

//                     if (angular.isDefined(iAttributes.rnCarouselPreventAnimation)) {
//                         animOnIndexChange = false;
//                     }

//                     scope.$watch('carouselExposedIndex', function(newValue) {
//                         goToSlide(newValue, true);
//                     });

//                     // enable carousel indicator
//                     if (angular.isDefined(iAttributes.rnCarouselIndicator)) {
//                         var indicator = $compile("<div id='carousel-" + carouselId +"-indicator' index='indicatorIndex' items='carouselIndicatorArray' rn-carousel-indicators class='rn-carousel-indicator'></div>")(scope);
//                         container.append(indicator);
//                     }

//                     // enable carousel controls
//                     if (angular.isDefined(iAttributes.rnCarouselControl)) {
//                         var controls = $compile("<div id='carousel-" + carouselId +"-controls' index='indicatorIndex' items='carouselIndicatorArray' rn-carousel-controls class='rn-carousel-controls'></div>")(scope);
//                         container.append(controls);
//                     }

//                     scope.carouselBufferIndex = 0;
//                     scope.carouselBufferSize = 5;
//                     scope.carouselIndex = 0;

//                     // handle index databinding
//                     if (iAttributes.rnCarouselIndex) {
//                         var updateParentIndex = function(value) {
//                             indexModel.assign(scope.$parent, value);
//                         };
//                         var indexModel = $parse(iAttributes.rnCarouselIndex);
//                         if (angular.isFunction(indexModel.assign)) {
//                             /* check if this property is assignable then watch it */
//                             scope.$watch('carouselIndex', function(newValue) {
//                                 updateParentIndex(newValue);
//                             });
//                             scope.carouselIndex = indexModel(scope);
//                             scope.$parent.$watch(indexModel, function(newValue, oldValue) {
//                                 if (newValue!==undefined) {
//                                     if (newValue >= slidesCount) {
//                                         newValue = slidesCount - 1;
//                                         updateParentIndex(newValue);
//                                     } else if (newValue < 0) {
//                                         newValue = 0;
//                                         updateParentIndex(newValue);
//                                     }
//                                     goToSlide(newValue, animOnIndexChange);
//                                 }
//                             });
//                             isIndexBound = true;
//                         } else if (!isNaN(iAttributes.rnCarouselIndex)) {
//                           /* if user just set an initial number, set it */
//                           scope.carouselIndex = parseInt(iAttributes.rnCarouselIndex, 10);
//                         }
//                     }

//                     // watch the given collection
//                     if (isRepeatBased) {
//                         scope.$watchCollection(repeatCollection, function(newValue, oldValue) {
//                             slidesCount = 0;
//                             if (angular.isArray(newValue)) {
//                                 slidesCount = newValue.length;
//                             } else if (angular.isObject(newValue)) {
//                                 slidesCount = Object.keys(newValue).length;
//                             }
//                             updateIndicatorArray();
//                             if (!containerWidth) updateContainerWidth();
//                             goToSlide(scope.carouselIndex);
//                         });
//                     } else {
//                         slidesCount = iElement.children().length;
//                         updateIndicatorArray();
//                         updateContainerWidth();
//                     }

//                     function updateIndicatorArray() {
//                         // generate an array to be used by the indicators
//                         var items = [];
//                         for (var i = 0; i < slidesCount; i++) items[i] = i;
//                         scope.carouselIndicatorArray = items;
//                     }

//                     function getCarouselWidth() {
//                        // container.css('width', 'auto');
//                         var slides = carousel.children();
//                         if (slides.length === 0) {
//                             containerWidth = carousel[0].getBoundingClientRect().width;
//                         } else {
//                             containerWidth = slides[0].getBoundingClientRect().width;
//                         }
//                         // console.log('getCarouselWidth', containerWidth);
//                         return containerWidth;
//                     }

//                     function updateContainerWidth() {
//                         // force the carousel container width to match the first slide width
//                         container.css('width', '100%');
//                         var width = getCarouselWidth();
//                         if (width) {
//                             container.css('width', width + 'px');
//                         }
//                     }

//                     function scroll(x) {
//                         // use CSS 3D transform to move the carousel
//                         if (isNaN(x)) {
//                             x = scope.carouselIndex * containerWidth;
//                         }

//                         offset = x;
//                         var move = -Math.round(offset);
//                         move += (scope.carouselBufferIndex * containerWidth);

//                         if(!is3dAvailable) {
//                             carousel[0].style[transformProperty] = 'translate(' + move + 'px, 0)';
//                         } else {
//                             carousel[0].style[transformProperty] = 'translate3d(' + move + 'px, 0, 0)';
//                         }
//                     }

//                     function autoScroll() {
//                         // scroll smoothly to "destination" until we reach it
//                         // using requestAnimationFrame
//                         var elapsed, delta;

//                         if (amplitude) {
//                             elapsed = Date.now() - timestamp;
//                             delta = amplitude * Math.exp(-elapsed / timeConstant);
//                             if (delta > rubberTreshold || delta < -rubberTreshold) {
//                                 scroll(destination - delta);
//                                 /* We are using raf.js, a requestAnimationFrame polyfill, so
//                                 this will work on IE9 */
//                                 requestAnimationFrame(autoScroll);
//                             } else {
//                                 goToSlide(destination / containerWidth);
//                             }
//                         }
//                     }

//                     function capIndex(idx) {
//                         // ensure given index it inside bounds
//                         return (idx >= slidesCount) ? slidesCount: (idx <= 0) ? 0 : idx;
//                     }

//                     function updateBufferIndex() {
//                         // update and cap te buffer index
//                         var bufferIndex = 0;
//                         var bufferEdgeSize = (scope.carouselBufferSize - 1) / 2;
//                         if (isBuffered) {
//                             if (scope.carouselIndex <= bufferEdgeSize) {
//                                 bufferIndex = 0;
//                             } else if (slidesCount < scope.carouselBufferSize) {
//                                 bufferIndex = 0;
//                             } else if (scope.carouselIndex > slidesCount - scope.carouselBufferSize) {
//                                 bufferIndex = slidesCount - scope.carouselBufferSize;
//                             } else {
//                                 bufferIndex = scope.carouselIndex - bufferEdgeSize;
//                             }
//                         }
//                         scope.carouselBufferIndex = bufferIndex;
//                     }

//                     function goToSlide(i, animate) {
//                         if (isNaN(i)) {
//                             i = scope.carouselIndex;
//                         }
//                         if (animate) {
//                             // simulate a swipe so we have the standard animation
//                             // used when external binding index is updated or touch canceed
//                             offset = (i * containerWidth);
//                             swipeEnd(null, null, true);
//                             return;
//                         }
//                         scope.carouselIndex = capIndex(i);
//                         updateBufferIndex();
//                         // if outside of angular scope, trigger angular digest cycle
//                         // use local digest only for perfs if no index bound
//                         if ($rootScope.$$phase!=='$apply' && $rootScope.$$phase!=='$digest') {
//                             if (isIndexBound) {
//                                 scope.$apply();
//                             } else {
//                                 scope.$digest();
//                             }
//                         }
//                         scroll();
//                     }

//                     function getAbsMoveTreshold() {
//                         // return min pixels required to move a slide
//                         return moveTreshold * containerWidth;
//                     }

//                     function documentMouseUpEvent(event) {
//                         // in case we click outside the carousel, trigger a fake swipeEnd
//                         swipeMoved = true;
//                         swipeEnd({
//                             x: event.clientX,
//                             y: event.clientY
//                         }, event);
//                     }

//                     function capPosition(x) {
//                         // limit position if start or end of slides
//                         var position = x;
//                         if (scope.carouselIndex===0) {
//                             position = Math.max(-getAbsMoveTreshold(), position);
//                         } else if (scope.carouselIndex===slidesCount-1) {
//                             position = Math.min(((slidesCount-1)*containerWidth + getAbsMoveTreshold()), position);
//                         }
//                         return position;
//                     }

//                     function swipeStart(coords, event) {
//                         //console.log('swipeStart', coords, event);
//                         $document.bind('mouseup', documentMouseUpEvent);
//                         pressed = true;
//                         startX = coords.x;

//                         amplitude = 0;
//                         timestamp = Date.now();

//                         return false;
//                     }

//                     function swipeMove(coords, event) {
//                         //console.log('swipeMove', coords, event);
//                         var x, delta;
//                         if (pressed) {
//                             x = coords.x;
//                             delta = startX - x;
//                             if (delta > 2 || delta < -2) {
//                                 swipeMoved = true;
//                                 startX = x;

//                                 /* We are using raf.js, a requestAnimationFrame polyfill, so
//                                 this will work on IE9 */
//                                 requestAnimationFrame(function() {
//                                     scroll(capPosition(offset + delta));
//                                 });
//                             }
//                         }
//                         return false;
//                     }

//                     function swipeEnd(coords, event, forceAnimation) {
//                         //console.log('swipeEnd', 'scope.carouselIndex', scope.carouselIndex);

//                         // Prevent clicks on buttons inside slider to trigger "swipeEnd" event on touchend/mouseup
//                         if(event && !swipeMoved) {
//                             return;
//                         }

//                         $document.unbind('mouseup', documentMouseUpEvent);
//                         pressed = false;
//                         swipeMoved = false;

//                         destination = offset;

//                         var minMove = getAbsMoveTreshold(),
//                             currentOffset = (scope.carouselIndex * containerWidth),
//                             absMove = currentOffset - destination,
//                             slidesMove = -Math[absMove>=0?'ceil':'floor'](absMove / containerWidth),
//                             shouldMove = Math.abs(absMove) > minMove;

//                         if ((slidesMove + scope.carouselIndex) >= slidesCount ) {
//                             slidesMove = slidesCount - 1 - scope.carouselIndex;
//                         }
//                         if ((slidesMove + scope.carouselIndex) < 0) {
//                             slidesMove = -scope.carouselIndex;
//                         }
//                         var moveOffset = shouldMove?slidesMove:0;

//                         destination = (moveOffset + scope.carouselIndex) * containerWidth;
//                         amplitude = destination - offset;
//                         timestamp = Date.now();
//                         if (forceAnimation) {
//                             amplitude = offset - currentOffset;
//                         }
//                         /* We are using raf.js, a requestAnimationFrame polyfill, so
//                         this will work on IE9 */
//                         requestAnimationFrame(autoScroll);

//                         return false;
//                     }

//                     iAttributes.$observe('rnCarouselSwipe', function(newValue, oldValue) {
//                         // only bind swipe when it's not switched off
//                         if(newValue !== 'false' && newValue !== 'off') {
//                             $swipe.bind(carousel, {
//                                 start: swipeStart,
//                                 move: swipeMove,
//                                 end: swipeEnd,
//                                 cancel: function(event) {
//                                   swipeEnd({}, event);
//                                 }
//                             });
//                         } else {
//                             // unbind swipe when it's switched off
//                             carousel.unbind();
//                         }
//                     });

//                     // initialise first slide only if no binding
//                     // if so, the binding will trigger the first init
//                     if (!isIndexBound) {
//                         goToSlide(scope.carouselIndex);
//                     }

//                     // detect supported CSS property
//                     transformProperty = 'transform';
//                     ['webkit', 'Moz', 'O', 'ms'].every(function (prefix) {
//                         var e = prefix + 'Transform';
//                         if (typeof document.body.style[e] !== 'undefined') {
//                             transformProperty = e;
//                             return false;
//                         }
//                         return true;
//                     });

//                     //Detect support of translate3d
//                     function detect3dSupport(){
//                         var el = document.createElement('p'),
//                         has3d,
//                         transforms = {
//                             'webkitTransform':'-webkit-transform',
//                             'msTransform':'-ms-transform',
//                             'transform':'transform'
//                         };
//                         // Add it to the body to get the computed style
//                         document.body.insertBefore(el, null);
//                         for(var t in transforms){
//                             if( el.style[t] !== undefined ){
//                                 el.style[t] = 'translate3d(1px,1px,1px)';
//                                 has3d = window.getComputedStyle(el).getPropertyValue(transforms[t]);
//                             }
//                         }
//                         document.body.removeChild(el);
//                         return (has3d !== undefined && has3d.length > 0 && has3d !== "none");
//                     }

//                     var is3dAvailable = detect3dSupport();

//                     function onOrientationChange() {
//                         updateContainerWidth();
//                         goToSlide();
//                     }

//                     // handle orientation change
//                     var winEl = angular.element($window);
//                     winEl.bind('orientationchange', onOrientationChange);
//                     winEl.bind('resize', onOrientationChange);

//                     scope.$on('$destroy', function() {
//                         $document.unbind('mouseup', documentMouseUpEvent);
//                         winEl.unbind('orientationchange', onOrientationChange);
//                         winEl.unbind('resize', onOrientationChange);
//                     });

//                 };
//             }
//         };
//     }]);

// })();


(function() {
    "use strict";

    angular.module('angular-carousel')

    .filter('carouselSlice', function() {
        return function(collection, start, size) {
            if (angular.isArray(collection)) {
                return collection.slice(start, start + size);
            } else if (angular.isObject(collection)) {
                // dont try to slice collections :)
                return collection;
            }
        };
    });

})();
