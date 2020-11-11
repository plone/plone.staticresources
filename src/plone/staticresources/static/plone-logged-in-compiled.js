/* Inline Validation pattern.
 *
 * Options:
 *    type(string): The type of form generating library. Either z3c.form, formlib or archetypes
 *
 * Documentation:
 *
 *    # z3c.form
 *
 *    {{ example-1 }}
 *
 * Example: example-1
 *    <div class="pat-inlinevalidation" data-pat-upload='{"type": "z3c.form"}'>
 *      <input id="form-widgets-IDublinCore-title"
 *             name="form.widgets.IDublinCore.title"
 *             class="text-widget required textline-field"
 *             value="Welcome to Plone" type="text">
 *    </div>
 */

define('mockup-patterns-inlinevalidation',[
  'jquery',
  'pat-base'
], function ($, Base) {
  'use strict';

  var InlineValidation = Base.extend({
    name: 'inlinevalidation',
    trigger: '.pat-inlinevalidation',
    parser: 'mockup',

    render_error: function ($field, errmsg) {
       var $errbox = $('div.fieldErrorBox', $field);
       if (errmsg !== '') {
           $field.addClass('error');
           $errbox.html(errmsg);
       } else {
           $field.removeClass('error');
           $errbox.html('');
       }
    },

    render_error_bootstrap: function ($field, errmsg) {
        var $input = $('input', $field), $errbox = $('.invalid-feedback', $field);
        if (errmsg !== '') {
            $input.addClass('is-invalid');
            if($errbox.length) {
                $errbox.html(errmsg);
            } else {
                $('<div class="invalid-feedback">' + errmsg + '</div>').insertAfter($input);
            }
        } else {
            $input.removeClass('is-invalid');
            if($errbox.length) {
                $errbox.remove();
            }
        }
    },

    append_url_path: function (url, extra) {
        // Add '/extra' on to the end of the URL, respecting querystring
        var i, ret, urlParts = url.split(/\?/);
        ret = urlParts[0];
        if (ret[ret.length - 1] !== '/') { ret += '/'; }
        ret += extra;
        for (i = 1; i < urlParts.length; i+=1) {
            ret += '?' + urlParts[i];
        }
        return ret;
    },

    queue: function (queueName, callback) {
        if (typeof callback === 'undefined') {
          callback = queueName;
          queueName = 'fx';  // 'fx' autoexecutes by default
        }
        $(window).queue(queueName, callback);
    },

    validate_archetypes_field: function (input) {
        var $input = $(input),
            $field = $input.closest('.field'),
            uid = $field.attr('data-uid'),
            fname = $field.attr('data-fieldname'),
            value = $input.val();

        // value is null for empty multiSelection select, turn it into a [] instead
        // so it does not break at_validate_field
        if ($input.prop('multiple') && value === null) {
            value = $([]).serialize();
        }

        // if value is an Array, it will be send as value[]=value1&value[]=value2 by $.post
        // turn it into something that will be useable or value will be omitted from the request
        var traditional;
        var params = $.param({uid: uid, fname: fname, value: value}, traditional = true);
        if ($field && uid && fname) {
            this.queue($.proxy(function(next) {
                $.ajax({
                    type: 'POST',
                    url: $('base').attr('href') + '/at_validate_field?' + params,
                    iframe: false,
                    success: $.proxy(function (data) {
                      this.render_error($field, data.errmsg);
                      next();
                    }, this),
                    error: function () { next(); },
                    dataType: 'json'
                });
            }, this));
        }
    },

    validate_formlib_field: function (input) {
        var $input = $(input),
            $field = $input.closest('.field'),
            $form = $field.closest('form'),
            $cloned_form = $form.clone(),
            fname = $field.attr('data-fieldname');

        // XXX: Remove binary files so they are not uploaded to server
        $cloned_form.find("input[type=file]").remove();
        this.queue($.proxy(function(next) {
            $cloned_form.ajaxSubmit({
                url: this.append_url_path($cloned_form.attr('action'), '@@formlib_validate_field'),
                data: {fname: fname},
                iframe: false,
                success: $.proxy(function (data) {
                    this.render_error($field, data.errmsg);
                    next();
                }, this),
                error: function () { next(); },
                dataType: 'json'
            });
        }, this));
    },

    validate_z3cform_field: function (input) {
        var $input = $(input),
            $field = $input.closest('.field'),
            $form = $field.closest('form'),
            $cloned_form = $form.clone(),
            fset = $input.closest('fieldset').attr('data-fieldset'),
            fname = $field.attr('data-fieldname');

        // XXX: When cloning a form, values from 'select' elements are not kept
        //      so we copy them from the original form here.
        $.each( $("select", $form), function ( k, v ) {
          $('select[name="'+v.name+'"]', $cloned_form).val($(v).val());
        } );

        // XXX: Remove binary files so they are not uploaded to server
        $cloned_form.find("input[type=file]").remove();
        if (fname) {
          this.queue($.proxy(function(next) {
              $cloned_form.ajaxSubmit({
                  url: this.append_url_path($cloned_form.attr('action'), '@@z3cform_validate_field'),
                  data: {fname: fname, fset: fset},
                  iframe: false,
                  success: $.proxy(function (data) {
                      if($field.hasClass('form-group')) {
                          this.render_error_bootstrap($field, data.errmsg);
                      } else {
                          this.render_error($field, data.errmsg);
                      }
                      next();
                  }, this),
                  error: function () { next(); },
                  dataType: 'json'
              });
          }, this));
        }
    },

    init: function () {

      this.$el.find(
          'input[type="text"], ' +
          'input[type="password"], ' +
          'input[type="checkbox"], ' +
          'select, ' +
          'textarea').on('blur',

          $.proxy(function (ev) {
            if (this.options.type === 'archetypes') {
              this.validate_archetypes_field(ev.target);
            } else if (this.options.type === 'z3c.form') {
              this.validate_z3cform_field(ev.target);
            } else if (this.options.type === 'formlib') {
              this.validate_formlib_field(ev.target);
            }
          }, this));
      },
  });
  return InlineValidation;
});

(function(root) {
define("resource-plone-app-jquerytools-js", ["jquery"], function() {
  return (function() {
/**
 * @license 
 * jQuery Tools @VERSION Overlay - Overlay base. Extend it.
 * 
 * NO COPYRIGHTS OR LICENSES. DO WHAT YOU LIKE.
 * 
 * http://flowplayer.org/tools/overlay/
 *
 * Since: March 2008
 * Date: @DATE 
 */
(function($) { 

	// static constructs
	$.tools = $.tools || {version: '@VERSION'};
	
	$.tools.overlay = {
		
		addEffect: function(name, loadFn, closeFn) {
			effects[name] = [loadFn, closeFn];	
		},
	
		conf: {  
			close: null,	
			closeOnClick: true,
			closeOnEsc: true,			
			closeSpeed: 'fast',
			effect: 'default',
			
			// since 1.2. fixed positioning not supported by IE6
			fixed: !/msie/.test(navigator.userAgent.toLowerCase()) || navigator.appVersion > 6, 
			
			left: 'center',		
			load: false, // 1.2
			mask: null,  
			oneInstance: true,
			speed: 'normal',
			target: null, // target element to be overlayed. by default taken from [rel]
			top: '10%'
		}
	};

	
	var instances = [], effects = {};
		
	// the default effect. nice and easy!
	$.tools.overlay.addEffect('default', 
		
		/* 
			onLoad/onClose functions must be called otherwise none of the 
			user supplied callback methods won't be called
		*/
		function(pos, onLoad) {
			
			var conf = this.getConf(),
				 w = $(window);				 
				
			if (!conf.fixed)  {
				pos.top += w.scrollTop();
				pos.left += w.scrollLeft();
			} 
				
			pos.position = conf.fixed ? 'fixed' : 'absolute';
			this.getOverlay().css(pos).fadeIn(conf.speed, onLoad); 
			
		}, function(onClose) {
			this.getOverlay().fadeOut(this.getConf().closeSpeed, onClose); 			
		}		
	);		

	
	function Overlay(trigger, conf) {		
		
		// private variables
		var self = this,
			 fire = trigger.add(self),
			 w = $(window), 
			 closers,            
			 overlay,
			 opened,
			 maskConf = $.tools.expose && (conf.mask || conf.expose),
			 uid = Math.random().toString().slice(10);		
		
			 
		// mask configuration
		if (maskConf) {			
			if (typeof maskConf == 'string') { maskConf = {color: maskConf}; }
			maskConf.closeOnClick = maskConf.closeOnEsc = false;
		}			 
		 
		// get overlay and trigger
		var jq = conf.target || trigger.attr("rel");
		overlay = jq ? $(jq) : null || trigger;	
		
		// overlay not found. cannot continue
		if (!overlay.length) { throw "Could not find Overlay: " + jq; }
		
		// trigger's click event
		if (trigger && trigger.index(overlay) == -1) {
			trigger.click(function(e) {				
				self.load(e);
				return e.preventDefault();
			});
		}   			
		
		// API methods  
		$.extend(self, {

			load: function(e) {
				
				// can be opened only once
				if (self.isOpened()) { return self; }
				
				// find the effect
		 		var eff = effects[conf.effect];
		 		if (!eff) { throw "Overlay: cannot find effect : \"" + conf.effect + "\""; }
				
				// close other instances?
				if (conf.oneInstance) {
					$.each(instances, function() {
						this.close(e);
					});
				}
				
				// onBeforeLoad
				e = e || $.Event();
				e.type = "onBeforeLoad";
				fire.trigger(e);				
				if (e.isDefaultPrevented()) { return self; }				

				// opened
				opened = true;
				
				// possible mask effect
				if (maskConf) { $(overlay).expose(maskConf); }				
				
				// position & dimensions 
				var top = conf.top,					
					 left = conf.left,
					 oWidth = overlay.outerWidth(true),
					 oHeight = overlay.outerHeight(true); 
				
				if (typeof top == 'string')  {
					top = top == 'center' ? Math.max((w.height() - oHeight) / 2, 0) : 
						parseInt(top, 10) / 100 * w.height();			
				}				
				
				if (left == 'center') { left = Math.max((w.width() - oWidth) / 2, 0); }

				
		 		// load effect  		 		
				eff[0].call(self, {top: top, left: left}, function() {					
					if (opened) {
						e.type = "onLoad";
						fire.trigger(e);
					}
				}); 				

				// mask.click closes overlay
				if (maskConf && conf.closeOnClick) {
					$.mask.getMask().one("click", self.close); 
				}
				
				// when window is clicked outside overlay, we close
				if (conf.closeOnClick) {
					$(document).on("click." + uid, function(e) { 
						if (!$(e.target).parents(overlay).length) { 
							self.close(e); 
						}
					});						
				}						
			
				// keyboard::escape
				if (conf.closeOnEsc) { 

					// one callback is enough if multiple instances are loaded simultaneously
					$(document).on("keydown." + uid, function(e) {
						if (e.keyCode == 27) { 
							self.close(e);	 
						}
					});			
				}

				
				return self; 
			}, 
			
			close: function(e) {

				if (!self.isOpened()) { return self; }
				
				e = e || $.Event();
				e.type = "onBeforeClose";
				fire.trigger(e);				
				if (e.isDefaultPrevented()) { return; }				
				
				opened = false;
				
				// close effect
				effects[conf.effect][1].call(self, function() {
					e.type = "onClose";
					fire.trigger(e); 
				});
				
				// unbind the keyboard / clicking actions
				$(document).off("click." + uid + " keydown." + uid);		  
				
				if (maskConf) {
					$.mask.close();		
				}
				 
				return self;
			}, 
			
			getOverlay: function() {
				return overlay;	
			},
			
			getTrigger: function() {
				return trigger;	
			},
			
			getClosers: function() {
				return closers;	
			},			

			isOpened: function()  {
				return opened;
			},
			
			// manipulate start, finish and speeds
			getConf: function() {
				return conf;	
			}			
			
		});
		
		// callbacks	
		$.each("onBeforeLoad,onStart,onLoad,onBeforeClose,onClose".split(","), function(i, name) {
				
			// configuration
			if ($.isFunction(conf[name])) { 
				$(self).on(name, conf[name]); 
			}

			// API
			self[name] = function(fn) {
				if (fn) { $(self).on(name, fn); }
				return self;
			};
		});
		
		// close button
		closers = overlay.find(conf.close || ".close");		
		
		if (!closers.length && !conf.close) {
			closers = $('<a class="close"></a>');
			overlay.prepend(closers);	
		}		
		
		closers.click(function(e) { 
			self.close(e);  
		});	
		
		// autoload
		if (conf.load) { self.load(); }
		
	}
	
	// jQuery plugin initialization
	$.fn.overlay = function(conf) {   
		
		// already constructed --> return API
		var el = this.data("overlay");
		if (el) { return el; }	  		 
		
		if ($.isFunction(conf)) {
			conf = {onBeforeLoad: conf};	
		}

		conf = $.extend(true, {}, $.tools.overlay.conf, conf);
		
		this.each(function() {		
			el = new Overlay($(this), conf);
			instances.push(el);
			$(this).data("overlay", el);	
		});
		
		return conf.api ? el: this;		
	}; 
	
})(jQuery);



/**
 * @license 
 * jQuery Tools @VERSION Scrollable - New wave UI design
 * 
 * NO COPYRIGHTS OR LICENSES. DO WHAT YOU LIKE.
 * 
 * http://flowplayer.org/tools/scrollable.html
 *
 * Since: March 2008
 * Date: @DATE 
 */
(function($) { 

	// static constructs
	$.tools = $.tools || {version: '@VERSION'};
	
	$.tools.scrollable = {
		
		conf: {	
			activeClass: 'active',
			circular: false,
			clonedClass: 'cloned',
			disabledClass: 'disabled',
			easing: 'swing',
			initialIndex: 0,
			item: '> *',
			items: '.items',
			keyboard: true,
			mousewheel: false,
			next: '.next',   
			prev: '.prev', 
			size: 1,
			speed: 400,
			vertical: false,
			touch: true,
			wheelSpeed: 0
		} 
	};
					
	// get hidden element's width or height even though it's hidden
	function dim(el, key) {
		var v = parseInt(el.css(key), 10);
		if (v) { return v; }
		var s = el[0].currentStyle; 
		return s && s.width && parseInt(s.width, 10);	
	}

	function find(root, query) { 
		var el = $(query);
		return el.length < 2 ? el : root.parent().find(query);
	}
	
	var current;		
	
	// constructor
	function Scrollable(root, conf) {   
		
		// current instance
		var self = this, 
			 fire = root.add(self),
			 itemWrap = root.children(),
			 index = 0,
			 vertical = conf.vertical;
				
		if (!current) { current = self; } 
		if (itemWrap.length > 1) { itemWrap = $(conf.items, root); }
		
		
		// in this version circular not supported when size > 1
		if (conf.size > 1) { conf.circular = false; } 
		
		// methods
		$.extend(self, {
				
			getConf: function() {
				return conf;	
			},			
			
			getIndex: function() {
				return index;	
			}, 

			getSize: function() {
				return self.getItems().size();	
			},

			getNaviButtons: function() {
				return prev.add(next);	
			},
			
			getRoot: function() {
				return root;	
			},
			
			getItemWrap: function() {
				return itemWrap;	
			},
			
			getItems: function() {
				return itemWrap.find(conf.item).not("." + conf.clonedClass);	
			},
							
			move: function(offset, time) {
				return self.seekTo(index + offset, time);
			},
			
			next: function(time) {
				return self.move(conf.size, time);	
			},
			
			prev: function(time) {
				return self.move(-conf.size, time);	
			},
			
			begin: function(time) {
				return self.seekTo(0, time);	
			},
			
			end: function(time) {
				return self.seekTo(self.getSize() -1, time);	
			},	
			
			focus: function() {
				current = self;
				return self;
			},
			
			addItem: function(item) {
				item = $(item);
				
				if (!conf.circular)  {
					itemWrap.append(item);
					next.removeClass("disabled");
					
				} else {
					itemWrap.children().last().before(item);
					itemWrap.children().first().replaceWith(item.clone().addClass(conf.clonedClass)); 						
				}
				
				fire.trigger("onAddItem", [item]);
				return self;
			},
			
			
			/* all seeking functions depend on this */		
			seekTo: function(i, time, fn) {	
				
				// ensure numeric index
				if (!i.jquery) { i *= 1; }
				
				// avoid seeking from end clone to the beginning
				if (conf.circular && i === 0 && index == -1 && time !== 0) { return self; }
				
				// check that index is sane				
				if (!conf.circular && i < 0 || i > self.getSize() || i < -1) { return self; }
				
				var item = i;
			
				if (i.jquery) {
					i = self.getItems().index(i);	
					
				} else {
					item = self.getItems().eq(i);
				}  
				
				// onBeforeSeek
				var e = $.Event("onBeforeSeek"); 
				if (!fn) {
					fire.trigger(e, [i, time]);				
					if (e.isDefaultPrevented() || !item.length) { return self; }			
				}  
	
				var props = vertical ? {top: -item.position().top} : {left: -item.position().left};  
				
				index = i;
				current = self;  
				if (time === undefined) { time = conf.speed; }   
				
				itemWrap.animate(props, time, conf.easing, fn || function() { 
					fire.trigger("onSeek", [i]);		
				});	 
				
				return self; 
			}					
			
		});
				
		// callbacks	
		$.each(['onBeforeSeek', 'onSeek', 'onAddItem'], function(i, name) {
				
			// configuration
			if ($.isFunction(conf[name])) { 
				$(self).on(name, conf[name]); 
			}
			
			self[name] = function(fn) {
				if (fn) { $(self).on(name, fn); }
				return self;
			};
		});  
		
		// circular loop
		if (conf.circular) {
			
			var cloned1 = self.getItems().slice(-1).clone().prependTo(itemWrap),
				 cloned2 = self.getItems().eq(1).clone().appendTo(itemWrap);

			cloned1.add(cloned2).addClass(conf.clonedClass);
			
			self.onBeforeSeek(function(e, i, time) {
				
				if (e.isDefaultPrevented()) { return; }
				
				/*
					1. animate to the clone without event triggering
					2. seek to correct position with 0 speed
				*/
				if (i == -1) {
					self.seekTo(cloned1, time, function()  {
						self.end(0);		
					});          
					return e.preventDefault();
					
				} else if (i == self.getSize()) {
					self.seekTo(cloned2, time, function()  {
						self.begin(0);		
					});	
				}
				
			});

			// seek over the cloned item

			// if the scrollable is hidden the calculations for seekTo position
			// will be incorrect (eg, if the scrollable is inside an overlay).
			// ensure the elements are shown, calculate the correct position,
			// then re-hide the elements. This must be done synchronously to
			// prevent the hidden elements being shown to the user.

			// See: https://github.com/jquerytools/jquerytools/issues#issue/87

			var hidden_parents = root.parents().add(root).filter(function () {
				if ($(this).css('display') === 'none') {
					return true;
				}
			});
			if (hidden_parents.length) {
				hidden_parents.show();
				self.seekTo(0, 0, function() {});
				hidden_parents.hide();
			}
			else {
				self.seekTo(0, 0, function() {});
			}

		}
		
		// next/prev buttons
		var prev = find(root, conf.prev).click(function(e) { e.stopPropagation(); self.prev(); }),
			 next = find(root, conf.next).click(function(e) { e.stopPropagation(); self.next(); }); 
		
		if (!conf.circular) {
			self.onBeforeSeek(function(e, i) {
				setTimeout(function() {
					if (!e.isDefaultPrevented()) {
						prev.toggleClass(conf.disabledClass, i <= 0);
						next.toggleClass(conf.disabledClass, i >= self.getSize() -1);
					}
				}, 1);
			});
			
			if (!conf.initialIndex) {
				prev.addClass(conf.disabledClass);	
			}			
		}
			
		if (self.getSize() < 2) {
			prev.add(next).addClass(conf.disabledClass);	
		}
			
		// mousewheel support
		if (conf.mousewheel && $.fn.mousewheel) {
			root.mousewheel(function(e, delta)  {
				if (conf.mousewheel) {
					self.move(delta < 0 ? 1 : -1, conf.wheelSpeed || 50);
					return false;
				}
			});			
		}
		
		// touch event
		if (conf.touch) {
			var touch = {};
			
			itemWrap[0].ontouchstart = function(e) {
				var t = e.touches[0];
				touch.x = t.clientX;
				touch.y = t.clientY;
			};
			
			itemWrap[0].ontouchmove = function(e) {
				
				// only deal with one finger
				if (e.touches.length == 1 && !itemWrap.is(":animated")) {			
					var t = e.touches[0],
						 deltaX = touch.x - t.clientX,
						 deltaY = touch.y - t.clientY;
	
					self[vertical && deltaY > 0 || !vertical && deltaX > 0 ? 'next' : 'prev']();				
					e.preventDefault();
				}
			};
		}
		
		if (conf.keyboard)  {
			
			$(document).on("keydown.scrollable", function(evt) {

				// skip certain conditions
				if (!conf.keyboard || evt.altKey || evt.ctrlKey || evt.metaKey || $(evt.target).is(":input")) { 
					return; 
				}
				
				// does this instance have focus?
				if (conf.keyboard != 'static' && current != self) { return; }
					
				var key = evt.keyCode;
			
				if (vertical && (key == 38 || key == 40)) {
					self.move(key == 38 ? -1 : 1);
					return evt.preventDefault();
				}
				
				if (!vertical && (key == 37 || key == 39)) {					
					self.move(key == 37 ? -1 : 1);
					return evt.preventDefault();
				}	  
				
			});  
		}
		
		// initial index
		if (conf.initialIndex) {
			self.seekTo(conf.initialIndex, 0, function() {});
		}
	} 

		
	// jQuery plugin implementation
	$.fn.scrollable = function(conf) { 
			
		// already constructed --> return API
		var el = this.data("scrollable");
		if (el) { return el; }		 

		conf = $.extend({}, $.tools.scrollable.conf, conf); 
		
		this.each(function() {			
			el = new Scrollable($(this), conf);
			$(this).data("scrollable", el);	
		});
		
		return conf.api ? el: this; 
		
	};
			
	
})(jQuery);


/**
 * @license 
 * jQuery Tools @VERSION Tabs- The basics of UI design.
 * 
 * NO COPYRIGHTS OR LICENSES. DO WHAT YOU LIKE.
 * 
 * http://flowplayer.org/tools/tabs/
 *
 * Since: November 2008
 * Date: @DATE 
 */  
(function($) {
		
	// static constructs
	$.tools = $.tools || {version: '@VERSION'};
	
	$.tools.tabs = {
		
		conf: {
			tabs: 'a',
			current: 'current',
			onBeforeClick: null,
			onClick: null, 
			effect: 'default',
			initialEffect: false,   // whether or not to show effect in first init of tabs
			initialIndex: 0,			
			event: 'click',
			rotate: false,
			
      // slide effect
      slideUpSpeed: 400,
      slideDownSpeed: 400,
			
			// 1.2
			history: false
		},
		
		addEffect: function(name, fn) {
			effects[name] = fn;
		}
		
	};
	
	var effects = {
		
		// simple "toggle" effect
		'default': function(i, done) { 
			this.getPanes().hide().eq(i).show();
			done.call();
		}, 
		
		/*
			configuration:
				- fadeOutSpeed (positive value does "crossfading")
				- fadeInSpeed
		*/
		fade: function(i, done) {		
			
			var conf = this.getConf(),
				 speed = conf.fadeOutSpeed,
				 panes = this.getPanes();
			
			if (speed) {
				panes.fadeOut(speed);	
			} else {
				panes.hide();	
			}

			panes.eq(i).fadeIn(conf.fadeInSpeed, done);	
		},
		
		// for basic accordions
		slide: function(i, done) {
		  var conf = this.getConf();
		  
			this.getPanes().slideUp(conf.slideUpSpeed);
			this.getPanes().eq(i).slideDown(conf.slideDownSpeed, done);			 
		}, 

		/**
		 * AJAX effect
		 */
		ajax: function(i, done)  {			
			this.getPanes().eq(0).load(this.getTabs().eq(i).attr("href"), done);	
		}		
	};   	
	
	/**
	 * Horizontal accordion
	 * 
	 * @deprecated will be replaced with a more robust implementation
	*/
	
	var
	  /**
	  *   @type {Boolean}
	  *
	  *   Mutex to control horizontal animation
	  *   Disables clicking of tabs while animating
	  *   They mess up otherwise as currentPane gets set *after* animation is done
	  */
	  animating,
	  /**
	  *   @type {Number}
	  *   
	  *   Initial width of tab panes
	  */
	  w;
	 
	$.tools.tabs.addEffect("horizontal", function(i, done) {
	  if (animating) return;    // don't allow other animations
	  
	  var nextPane = this.getPanes().eq(i),
	      currentPane = this.getCurrentPane();
	      
		// store original width of a pane into memory
		w || ( w = this.getPanes().eq(0).width() );
		animating = true;
		
		nextPane.show(); // hidden by default
		
		// animate current pane's width to zero
    // animate next pane's width at the same time for smooth animation
    currentPane.animate({width: 0}, {
      step: function(now){
        nextPane.css("width", w-now);
      },
      complete: function(){
        $(this).hide();
        done.call();
        animating = false;
     }
    });
    // Dirty hack...  onLoad, currentPant will be empty and nextPane will be the first pane
    // If this is the case, manually run callback since the animation never occured, and reset animating
    if (!currentPane.length){ 
      done.call(); 
      animating = false;
    }
	});	

	
	function Tabs(root, paneSelector, conf) {
		
		var self = this,
        trigger = root.add(this),
        tabs = root.find(conf.tabs),
        panes = paneSelector.jquery ? paneSelector : root.children(paneSelector),
        current;
			 
		
		// make sure tabs and panes are found
		if (!tabs.length)  { tabs = root.children(); }
		if (!panes.length) { panes = root.parent().find(paneSelector); }
		if (!panes.length) { panes = $(paneSelector); }
		
		
		// public methods
		$.extend(this, {				
			click: function(i, e) {
			  
				var tab = tabs.eq(i),
				    firstRender = !root.data('tabs');
				
				if (typeof i == 'string' && i.replace("#", "")) {
					tab = tabs.filter("[href*=\"" + i.replace("#", "") + "\"]");
					i = Math.max(tabs.index(tab), 0);
				}
								
				if (conf.rotate) {
					var last = tabs.length -1; 
					if (i < 0) { return self.click(last, e); }
					if (i > last) { return self.click(0, e); }						
				}
				
				if (!tab.length) {
					if (current >= 0) { return self; }
					i = conf.initialIndex;
					tab = tabs.eq(i);
				}				
				
				// current tab is being clicked
				if (i === current) { return self; }
				
				// possibility to cancel click action				
				e = e || $.Event();
				e.type = "onBeforeClick";
				trigger.trigger(e, [i]);				
				if (e.isDefaultPrevented()) { return; }
				
        // if firstRender, only run effect if initialEffect is set, otherwise default
				var effect = firstRender ? conf.initialEffect && conf.effect || 'default' : conf.effect;

				// call the effect
				effects[effect].call(self, i, function() {
					current = i;
					// onClick callback
					e.type = "onClick";
					trigger.trigger(e, [i]);
				});			
				
				// default behaviour
				tabs.removeClass(conf.current);	
				tab.addClass(conf.current);				
				
				return self;
			},
			
			getConf: function() {
				return conf;	
			},

			getTabs: function() {
				return tabs;	
			},
			
			getPanes: function() {
				return panes;	
			},
			
			getCurrentPane: function() {
				return panes.eq(current);	
			},
			
			getCurrentTab: function() {
				return tabs.eq(current);	
			},
			
			getIndex: function() {
				return current;	
			}, 
			
			next: function() {
				return self.click(current + 1);
			},
			
			prev: function() {
				return self.click(current - 1);	
			},
			
			destroy: function() {
				tabs.off(conf.event).removeClass(conf.current);
				panes.find("a[href^=\"#\"]").off("click.T"); 
				return self;
			}
		
		});

		// callbacks	
		$.each("onBeforeClick,onClick".split(","), function(i, name) {
				
			// configuration
			if ($.isFunction(conf[name])) {
				$(self).on(name, conf[name]); 
			}

			// API
			self[name] = function(fn) {
				if (fn) { $(self).on(name, fn); }
				return self;	
			};
		});
	
		
		if (conf.history && $.fn.history) {
			$.tools.history.init(tabs);
			conf.event = 'history';
		}	
		
		// setup click actions for each tab
		tabs.each(function(i) { 				
			$(this).on(conf.event, function(e) {
				self.click(i, e);
				return e.preventDefault();
			});			
		});
		
		// cross tab anchor link
		panes.find("a[href^=\"#\"]").on("click.T", function(e) {
			self.click($(this).attr("href"), e);		
		}); 
		
		// open initial tab
		if (location.hash && conf.tabs == "a" && root.find("[href=\"" +location.hash+ "\"]").length) {
			self.click(location.hash);

		} else {
			if (conf.initialIndex === 0 || conf.initialIndex > 0) {
				self.click(conf.initialIndex);
			}
		}				
		
	}
	
	
	// jQuery plugin implementation
	$.fn.tabs = function(paneSelector, conf) {
		
		// return existing instance
		var el = this.data("tabs");
		if (el) { 
			el.destroy();	
			this.removeData("tabs");
		}

		if ($.isFunction(conf)) {
			conf = {onBeforeClick: conf};
		}
		
		// setup conf
		conf = $.extend({}, $.tools.tabs.conf, conf);		
		
		
		this.each(function() {				
			el = new Tabs($(this), paneSelector, conf);
			$(this).data("tabs", el); 
		});		
		
		return conf.api ? el: this;		
	};		
		
}) (jQuery); 




/**
 * @license 
 * jQuery Tools @VERSION History "Back button for AJAX apps"
 * 
 * NO COPYRIGHTS OR LICENSES. DO WHAT YOU LIKE.
 * 
 * http://flowplayer.org/tools/toolbox/history.html
 * 
 * Since: Mar 2010
 * Date: @DATE 
 */
(function($) {
		
	var hash, iframe, links, inited;		
	
	$.tools = $.tools || {version: '@VERSION'};
	
	$.tools.history = {
	
		init: function(els) {
			
			if (inited) { return; }
			
			// IE
			if ($.browser.msie && $.browser.version < '8') {
				
				// create iframe that is constantly checked for hash changes
				if (!iframe) {
					iframe = $("<iframe/>").attr("src", "javascript:false;").hide().get(0);
					$("body").append(iframe);
									
					setInterval(function() {
						var idoc = iframe.contentWindow.document, 
							 h = idoc.location.hash;
					
						if (hash !== h) {						
							$(window).trigger("hash", h);
						}
					}, 100);
					
					setIframeLocation(location.hash || '#');
				}

				
			// other browsers scans for location.hash changes directly without iframe hack
			} else { 
				setInterval(function() {
					var h = location.hash;
					if (h !== hash) {
						$(window).trigger("hash", h);
					}						
				}, 100);
			}

			links = !links ? els : links.add(els);
			
			els.click(function(e) {
				var href = $(this).attr("href");
				if (iframe) { setIframeLocation(href); }
				
				// handle non-anchor links
				if (href.slice(0, 1) != "#") {
					location.href = "#" + href;
					return e.preventDefault();		
				}
				
			}); 
			
			inited = true;
		}	
	};  
	

	function setIframeLocation(h) {
		if (h) {
			var doc = iframe.contentWindow.document;
			doc.open().close();	
			doc.location.hash = h;
		}
	} 
		 
	// global histroy change listener
	$(window).on("hash", function(e, h)  { 
		if (h) {
			links.filter(function() {
			  var href = $(this).attr("href");
			  return href == h || href == h.replace("#", ""); 
			}).trigger("history", [h]);	
		} else {
			links.eq(0).trigger("history", [h]);	
		}

		hash = h;

	});
		
	
	// jQuery plugin implementation
	$.fn.history = function(fn) {
			
		$.tools.history.init(this);

		// return jQuery
		return this.on("history", fn);		
	};	
		
})(jQuery); 



/**
 * @license 
 * jQuery Tools @VERSION / Expose - Dim the lights
 * 
 * NO COPYRIGHTS OR LICENSES. DO WHAT YOU LIKE.
 * 
 * http://flowplayer.org/tools/toolbox/expose.html
 *
 * Since: Mar 2010
 * Date: @DATE 
 */
(function($) { 	

	// static constructs
	$.tools = $.tools || {version: '@VERSION'};
	
	var tool;
	
	tool = $.tools.expose = {
		
		conf: {	
			maskId: 'exposeMask',
			loadSpeed: 'slow',
			closeSpeed: 'fast',
			closeOnClick: true,
			closeOnEsc: true,
			
			// css settings
			zIndex: 9998,
			opacity: 0.8,
			startOpacity: 0,
			color: '#fff',
			
			// callbacks
			onLoad: null,
			onClose: null
		}
	};

	/* one of the greatest headaches in the tool. finally made it */
	function viewport() {
				
		// the horror case
		if (/msie/.test(navigator.userAgent.toLowerCase())) {
			
			// if there are no scrollbars then use window.height
			var d = $(document).height(), w = $(window).height();
			
			return [
				window.innerWidth || 							// ie7+
				document.documentElement.clientWidth || 	// ie6  
				document.body.clientWidth, 					// ie6 quirks mode
				d - w < 20 ? w : d
			];
		} 
		
		// other well behaving browsers
		return [$(document).width(), $(document).height()]; 
	} 
	
	function call(fn) {
		if (fn) { return fn.call($.mask); }
	}
	
	var mask, exposed, loaded, config, overlayIndex;		
	
	
	$.mask = {
		
		load: function(conf, els) {
			
			// already loaded ?
			if (loaded) { return this; }			
			
			// configuration
			if (typeof conf == 'string') {
				conf = {color: conf};	
			}
			
			// use latest config
			conf = conf || config;
			
			config = conf = $.extend($.extend({}, tool.conf), conf);

			// get the mask
			mask = $("#" + conf.maskId);
				
			// or create it
			if (!mask.length) {
				mask = $('<div/>').attr("id", conf.maskId);
				$("body").append(mask);
			}
			
			// set position and dimensions 			
			var size = viewport();
				
			mask.css({				
				position:'absolute', 
				top: 0, 
				left: 0,
				width: size[0],
				height: size[1],
				display: 'none',
				opacity: conf.startOpacity,					 		
				zIndex: conf.zIndex 
			});
			
			if (conf.color) {
				mask.css("backgroundColor", conf.color);	
			}			
			
			// onBeforeLoad
			if (call(conf.onBeforeLoad) === false) {
				return this;
			}
			
			// esc button
			if (conf.closeOnEsc) {						
				$(document).on("keydown.mask", function(e) {							
					if (e.keyCode == 27) {
						$.mask.close(e);	
					}		
				});			
			}
			
			// mask click closes
			if (conf.closeOnClick) {
				mask.on("click.mask", function(e)  {
					$.mask.close(e);		
				});					
			}			
			
			// resize mask when window is resized
			$(window).on("resize.mask", function() {
				$.mask.fit();
			});
			
			// exposed elements
			if (els && els.length) {
				
				overlayIndex = els.eq(0).css("zIndex");

				// make sure element is positioned absolutely or relatively
				$.each(els, function() {
					var el = $(this);
					if (!/relative|absolute|fixed/i.test(el.css("position"))) {
						el.css("position", "relative");		
					}					
				});
			 
				// make elements sit on top of the mask
				exposed = els.css({ zIndex: Math.max(conf.zIndex + 1, overlayIndex == 'auto' ? 0 : overlayIndex)});			
			}	
			
			// reveal mask
			mask.css({display: 'block'}).fadeTo(conf.loadSpeed, conf.opacity, function() {
				$.mask.fit(); 
				call(conf.onLoad);
				loaded = "full";
			});
			
			loaded = true;			
			return this;				
		},
		
		close: function() {
			if (loaded) {
				
				// onBeforeClose
				if (call(config.onBeforeClose) === false) { return this; }
					
				mask.fadeOut(config.closeSpeed, function()  {										
					if (exposed) {
						exposed.css({zIndex: overlayIndex});						
					}				
					loaded = false;
					call(config.onClose);
				});				
				
				// unbind various event listeners
				$(document).off("keydown.mask");
				mask.off("click.mask");
				$(window).off("resize.mask");  
			}
			
			return this; 
		},
		
		fit: function() {
			if (loaded) {
				var size = viewport();				
				mask.css({width: size[0], height: size[1]});
			}				
		},
		
		getMask: function() {
			return mask;	
		},
		
		isLoaded: function(fully) {
			return fully ? loaded == 'full' : loaded;	
		}, 
		
		getConf: function() {
			return config;	
		},
		
		getExposed: function() {
			return exposed;	
		}		
	};
	
	$.fn.mask = function(conf) {
		$.mask.load(conf);
		return this;		
	};			
	
	$.fn.expose = function(conf) {
		$.mask.load(conf, this);
		return this;			
	};


})(jQuery);


/**
 * @license 
 * jQuery Tools @VERSION Tooltip - UI essentials
 * 
 * NO COPYRIGHTS OR LICENSES. DO WHAT YOU LIKE.
 * 
 * http://flowplayer.org/tools/tooltip/
 *
 * Since: November 2008
 * Date: @DATE 
 */
(function($) { 	
	// static constructs
	$.tools = $.tools || {version: '@VERSION'};
	
	$.tools.tooltip = {
		
		conf: { 
			
			// default effect variables
			effect: 'toggle',			
			fadeOutSpeed: "fast",
			predelay: 0,
			delay: 30,
			opacity: 1,			
			tip: 0,
            fadeIE: false, // enables fade effect in IE
			
			// 'top', 'bottom', 'right', 'left', 'center'
			position: ['top', 'center'], 
			offset: [0, 0],
			relative: false,
			cancelDefault: true,
			
			// type to event mapping 
			events: {
				def: 			"mouseenter,mouseleave",
				input: 		"focus,blur",
				widget:		"focus mouseenter,blur mouseleave",
				tooltip:		"mouseenter,mouseleave"
			},
			
			// 1.2
			layout: '<div/>',
			tipClass: 'tooltip'
		},
		
		addEffect: function(name, loadFn, hideFn) {
			effects[name] = [loadFn, hideFn];	
		} 
	};
	
	
	var effects = { 
		toggle: [ 
			function(done) { 
				var conf = this.getConf(), tip = this.getTip(), o = conf.opacity;
				if (o < 1) { tip.css({opacity: o}); }
				tip.show();
				done.call();
			},
			
			function(done) { 
				this.getTip().hide();
				done.call();
			} 
		],
		
		fade: [
			function(done) {
				var conf = this.getConf();
				if (!/msie/.test(navigator.userAgent.toLowerCase()) || conf.fadeIE) {
					this.getTip().fadeTo(conf.fadeInSpeed, conf.opacity, done);
				}
				else {
					this.getTip().show();
					done();
				}
			},
			function(done) {
				var conf = this.getConf();
				if (!/msie/.test(navigator.userAgent.toLowerCase()) || conf.fadeIE) {
					this.getTip().fadeOut(conf.fadeOutSpeed, done);
				}
				else {
					this.getTip().hide();
					done();
				}
			}
		]		
	};   

		
	/* calculate tip position relative to the trigger */  	
	function getPosition(trigger, tip, conf) {	

		
		// get origin top/left position 
		var top = conf.relative ? trigger.position().top : trigger.offset().top, 
			 left = conf.relative ? trigger.position().left : trigger.offset().left,
			 pos = conf.position[0];

		top  -= tip.outerHeight() - conf.offset[0];
		left += trigger.outerWidth() + conf.offset[1];
		
		// iPad position fix
		if (/iPad/i.test(navigator.userAgent)) {
			top -= $(window).scrollTop();
		}
		
		// adjust Y		
		var height = tip.outerHeight() + trigger.outerHeight();
		if (pos == 'center') 	{ top += height / 2; }
		if (pos == 'bottom') 	{ top += height; }
		
		
		// adjust X
		pos = conf.position[1]; 	
		var width = tip.outerWidth() + trigger.outerWidth();
		if (pos == 'center') 	{ left -= width / 2; }
		if (pos == 'left')   	{ left -= width; }	 
		
		return {top: top, left: left};
	}		

	
	
	function Tooltip(trigger, conf) {

		var self = this, 
			 fire = trigger.add(self),
			 tip,
			 timer = 0,
			 pretimer = 0, 
			 title = trigger.attr("title"),
			 tipAttr = trigger.attr("data-tooltip"),
			 effect = effects[conf.effect],
			 shown,
				 
			 // get show/hide configuration
			 isInput = trigger.is(":input"), 
			 isWidget = isInput && trigger.is(":checkbox, :radio, select, :button, :submit"),			
			 type = trigger.attr("type"),
			 evt = conf.events[type] || conf.events[isInput ? (isWidget ? 'widget' : 'input') : 'def']; 
		
		
		// check that configuration is sane
		if (!effect) { throw "Nonexistent effect \"" + conf.effect + "\""; }					
		
		evt = evt.split(/,\s*/); 
		if (evt.length != 2) { throw "Tooltip: bad events configuration for " + type; } 
		
		
		// trigger --> show  
		trigger.on(evt[0], function(e) {

			clearTimeout(timer);
			if (conf.predelay) {
				pretimer = setTimeout(function() { self.show(e); }, conf.predelay);	
				
			} else {
				self.show(e);	
			}
			
		// trigger --> hide
		}).on(evt[1], function(e)  {
			clearTimeout(pretimer);
			if (conf.delay)  {
				timer = setTimeout(function() { self.hide(e); }, conf.delay);	
				
			} else {
				self.hide(e);		
			}
			
		}); 
		
		
		// remove default title
		if (title && conf.cancelDefault) { 
			trigger.removeAttr("title");
			trigger.data("title", title);			
		}		
		
		$.extend(self, {
				
			show: function(e) {  

				// tip not initialized yet
				if (!tip) {
					
					// data-tooltip 
					if (tipAttr) {
						tip = $(tipAttr);

					// single tip element for all
					} else if (conf.tip) { 
						tip = $(conf.tip).eq(0);
						
					// autogenerated tooltip
					} else if (title) { 
						tip = $(conf.layout).addClass(conf.tipClass).appendTo(document.body)
							.hide().append(title);

					// manual tooltip
					} else {	
						tip = trigger.find('.' + conf.tipClass);
						if (!tip.length) { tip = trigger.next(); }
						if (!tip.length) { tip = trigger.parent().next(); } 	 
					}
					
					if (!tip.length) { throw "Cannot find tooltip for " + trigger;	}
				} 
			 	
			 	if (self.isShown()) { return self; }  
				
			 	// stop previous animation
			 	tip.stop(true, true); 			 	
			 	
				// get position
				var pos = getPosition(trigger, tip, conf);			
		
				// restore title for single tooltip element
				if (conf.tip) {
					tip.html(trigger.data("title"));
				}

				// onBeforeShow
				e = $.Event();
				e.type = "onBeforeShow";
				fire.trigger(e, [pos]);				
				if (e.isDefaultPrevented()) { return self; }
		
				
				// onBeforeShow may have altered the configuration
				pos = getPosition(trigger, tip, conf);
				
				// set position
				tip.css({position:'absolute', top: pos.top, left: pos.left});					
				
				shown = true;
				
				// invoke effect 
				effect[0].call(self, function() {
					e.type = "onShow";
					shown = 'full';
					fire.trigger(e);		 
				});					

	 	
				// tooltip events       
				var event = conf.events.tooltip.split(/,\s*/);

				if (!tip.data("__set")) {
					
					tip.off(event[0]).on(event[0], function() { 
						clearTimeout(timer);
						clearTimeout(pretimer);
					});
					
					if (event[1] && !trigger.is("input:not(:checkbox, :radio), textarea")) { 					
						tip.off(event[1]).on(event[1], function(e) {
	
							// being moved to the trigger element
							if (e.relatedTarget != trigger[0]) {
								trigger.trigger(evt[1].split(" ")[0]);
							}
						}); 
					} 
					
					// bind agein for if same tip element
					if (!conf.tip) tip.data("__set", true);
				}
				
				return self;
			},
			
			hide: function(e) {

				if (!tip || !self.isShown()) { return self; }
			
				// onBeforeHide
				e = $.Event();
				e.type = "onBeforeHide";
				fire.trigger(e);				
				if (e.isDefaultPrevented()) { return; }
	
				shown = false;
				
				effects[conf.effect][1].call(self, function() {
					e.type = "onHide";
					fire.trigger(e);		 
				});
				
				return self;
			},
			
			isShown: function(fully) {
				return fully ? shown == 'full' : shown;	
			},
				
			getConf: function() {
				return conf;	
			},
				
			getTip: function() {
				return tip;	
			},
			
			getTrigger: function() {
				return trigger;	
			}		

		});		

		// callbacks	
		$.each("onHide,onBeforeShow,onShow,onBeforeHide".split(","), function(i, name) {
				
			// configuration
			if ($.isFunction(conf[name])) { 
				$(self).on(name, conf[name]); 
			}

			// API
			self[name] = function(fn) {
				if (fn) { $(self).on(name, fn); }
				return self;
			};
		});
		
	}
		
	
	// jQuery plugin implementation
	$.fn.tooltip = function(conf) {
		
		// return existing instance
		var api = this.data("tooltip");
		if (api) { return api; }

		conf = $.extend(true, {}, $.tools.tooltip.conf, conf);
		
		// position can also be given as string
		if (typeof conf.position == 'string') {
			conf.position = conf.position.split(/,?\s/);	
		}
		
		// install tooltip for each entry in jQuery object
		this.each(function() {
			api = new Tooltip($(this), conf); 
			$(this).data("tooltip", api); 
		});
		
		return conf.api ? api: this;		 
	};
		
}) (jQuery);

		



  }).apply(root, arguments);
});
}(this));

(function(root) {
define("resource-plone-app-jquerytools-dateinput-js", ["jquery"], function() {
  return (function() {
!function($,undefined){function dayAm(year,month){return new Date(year,month+1,0).getDate()}function zeropad(val,len){for(val=""+val,len=len||2;val.length<len;)val="0"+val;return val}function format(formatter,date,text,lang){var d=date.getDate(),D=date.getDay(),m=date.getMonth(),y=date.getFullYear(),flags={d:d,dd:zeropad(d),ddd:LABELS[lang].shortDays[D],dddd:LABELS[lang].days[D],m:m+1,mm:zeropad(m+1),mmm:LABELS[lang].shortMonths[m],mmmm:LABELS[lang].months[m],yy:String(y).slice(2),yyyy:y},ret=formatters[formatter](text,date,flags,lang);return tmpTag.html(ret).html()}function integer(val){return parseInt(val,10)}function isSameDay(d1,d2){return d1.getFullYear()===d2.getFullYear()&&d1.getMonth()==d2.getMonth()&&d1.getDate()==d2.getDate()}function parseDate(val){if(val!==undefined){if(val.constructor==Date)return val;if("string"==typeof val){var els=val.split("-");if(3==els.length)return new Date(integer(els[0]),integer(els[1])-1,integer(els[2]));if(!/^-?\d+$/.test(val))return;val=integer(val)}var date=new Date;return date.setDate(date.getDate()+val),date}}function Dateinput(input,conf){function select(date,conf,e){return input.attr("readonly")?void self.hide(e):(value=date,currYear=date.getFullYear(),currMonth=date.getMonth(),currDay=date.getDate(),e||(e=$.Event("api")),"click"!=e.type||/msie/.test(navigator.userAgent.toLowerCase())||input.focus(),e.type="beforeChange",fire.trigger(e,[date]),void(e.isDefaultPrevented()||(input.val(format(conf.formatter,date,conf.format,conf.lang)),e.type="change",e.target=input[0],fire.trigger(e),input.data("date",date),self.hide(e))))}function onShow(ev){ev.type="onShow",fire.trigger(ev),$(document).on("keydown.d",function(e){if(e.ctrlKey)return!0;var key=e.keyCode;if(8==key||46==key)return input.val(""),self.hide(e);if(27==key||9==key)return self.hide(e);if($(KEYS).index(key)>=0){if(!opened)return self.show(e),e.preventDefault();var days=$("#"+css.weeks+" a"),el=$("."+css.focus),index=days.index(el);return el.removeClass(css.focus),74==key||40==key?index+=7:75==key||38==key?index-=7:76==key||39==key?index+=1:(72==key||37==key)&&(index-=1),index>41?(self.addMonth(),el=$("#"+css.weeks+" a:eq("+(index-42)+")")):0>index?(self.addMonth(-1),el=$("#"+css.weeks+" a:eq("+(index+42)+")")):el=days.eq(index),el.addClass(css.focus),e.preventDefault()}return 34==key?self.addMonth():33==key?self.addMonth(-1):36==key?self.today():(13==key&&($(e.target).is("select")||$("."+css.focus).click()),$([16,17,18,9]).index(key)>=0)}),$(document).on("click.d",function(e){var el=e.target;el.id==css.root||$(el).parents("#"+css.root).length||el==input[0]||trigger&&el==trigger[0]||self.hide(e)})}var trigger,pm,nm,currYear,currMonth,currDay,opened,original,self=this,now=new Date,yearNow=now.getFullYear(),css=conf.css,labels=LABELS[conf.lang],root=$("#"+css.root),title=root.find("#"+css.title),value=input.attr("data-value")||conf.value||input.val(),min=input.attr("min")||conf.min,max=input.attr("max")||conf.max;if(0===min&&(min="0"),value=parseDate(value)||now,min=parseDate(min||new Date(yearNow+conf.yearRange[0],1,1)),max=parseDate(max||new Date(yearNow+conf.yearRange[1]+1,1,-1)),!labels)throw"Dateinput: invalid language: "+conf.lang;if("date"==input.attr("type")){var original=input.clone(),def=original.wrap("<div/>").parent().html(),clone=$(def.replace(/type/i,"type=text data-orig-type"));conf.value&&clone.val(conf.value),input.replaceWith(clone),input=clone}input.addClass(css.input);var fire=input.add(self);if(!root.length){if(root=$("<div><div><a/><div/><a/></div><div><div/><div/></div></div>").hide().css({position:"absolute"}).attr("id",css.root),root.children().eq(0).attr("id",css.head).end().eq(1).attr("id",css.body).children().eq(0).attr("id",css.days).end().eq(1).attr("id",css.weeks).end().end().end().find("a").eq(0).attr("id",css.prev).end().eq(1).attr("id",css.next),title=root.find("#"+css.head).find("div").attr("id",css.title),conf.selectors){var monthSelector=$("<select/>").attr("id",css.month),yearSelector=$("<select/>").attr("id",css.year);title.html(monthSelector.add(yearSelector))}for(var days=root.find("#"+css.days),d=0;7>d;d++)days.append($("<span/>").text(labels.shortDays[(d+conf.firstDay)%7]));$("body").append(root)}conf.trigger&&(trigger=$("<a/>").attr("href","#").addClass(css.trigger).click(function(e){return conf.toggle?self.toggle():self.show(),e.preventDefault()}).insertAfter(input));var weeks=root.find("#"+css.weeks);yearSelector=root.find("#"+css.year),monthSelector=root.find("#"+css.month),$.extend(self,{show:function(e){if(!input.attr("disabled")&&!opened&&(e=e||$.Event(),e.type="onBeforeShow",fire.trigger(e),!e.isDefaultPrevented())){$.each(instances,function(){this.hide()}),opened=!0,monthSelector.off("change").change(function(){self.setValue(integer(yearSelector.val()),integer($(this).val()))}),yearSelector.off("change").change(function(){self.setValue(integer($(this).val()),integer(monthSelector.val()))}),pm=root.find("#"+css.prev).off("click").click(function(){return pm.hasClass(css.disabled)||self.addMonth(-1),!1}),nm=root.find("#"+css.next).off("click").click(function(){return nm.hasClass(css.disabled)||self.addMonth(),!1}),self.setValue(value);var pos=input.offset();return/iPad/i.test(navigator.userAgent)&&(pos.top-=$(window).scrollTop()),root.css({top:pos.top+input.outerHeight(!0)+conf.offset[0],left:pos.left+conf.offset[1]}),conf.speed?root.show(conf.speed,function(){onShow(e)}):(root.show(),onShow(e)),self}},setValue:function(year,month,day){var date=integer(month)>=-1?new Date(integer(year),integer(month),integer(day==undefined||isNaN(day)?1:day)):year||value;if(min>date?date=min:date>max&&(date=max),"string"==typeof year&&(date=parseDate(year)),year=date.getFullYear(),month=date.getMonth(),day=date.getDate(),-1==month?(month=11,year--):12==month&&(month=0,year++),!opened)return select(date,conf),self;currMonth=month,currYear=year,currDay=day;var week,tmp=new Date(year,month,1-conf.firstDay),begin=tmp.getDay(),days=dayAm(year,month),prevDays=dayAm(year,month-1);if(conf.selectors){monthSelector.empty(),$.each(labels.months,function(i,m){min<new Date(year,i+1,1)&&max>new Date(year,i,0)&&monthSelector.append($("<option/>").html(m).attr("value",i))}),yearSelector.empty();for(var yearNow=now.getFullYear(),i=yearNow+conf.yearRange[0];i<yearNow+conf.yearRange[1];i++)min<new Date(i+1,0,1)&&max>new Date(i,0,0)&&yearSelector.append($("<option/>").text(i));monthSelector.val(month),yearSelector.val(year)}else title.html(labels.months[month]+" "+year);weeks.empty(),pm.add(nm).removeClass(css.disabled);for(var a,num,j=begin?0:-7;(begin?42:35)>j;j++)a=$("<a/>"),j%7===0&&(week=$("<div/>").addClass(css.week),weeks.append(week)),begin>j?(a.addClass(css.off),num=prevDays-begin+j+1,date=new Date(year,month-1,num)):j>=begin+days?(a.addClass(css.off),num=j-days-begin+1,date=new Date(year,month+1,num)):(num=j-begin+1,date=new Date(year,month,num),isSameDay(value,date)?a.attr("id",css.current).addClass(css.focus):isSameDay(now,date)&&a.attr("id",css.today)),min&&min>date&&a.add(pm).addClass(css.disabled),max&&date>max&&a.add(nm).addClass(css.disabled),a.attr("href","#"+num).text(num).data("date",date),week.append(a);return weeks.find("a").click(function(e){var el=$(this);return el.hasClass(css.disabled)||($("#"+css.current).removeAttr("id"),el.attr("id",css.current),select(el.data("date"),conf,e)),!1}),css.sunday&&weeks.find("."+css.week).each(function(){var beg=conf.firstDay?7-conf.firstDay:0;$(this).children().slice(beg,beg+1).addClass(css.sunday)}),self},setMin:function(val,fit){return min=parseDate(val),fit&&min>value&&self.setValue(min),self},setMax:function(val,fit){return max=parseDate(val),fit&&value>max&&self.setValue(max),self},today:function(){return self.setValue(now)},addDay:function(amount){return this.setValue(currYear,currMonth,currDay+(amount||1))},addMonth:function(amount){var targetMonth=currMonth+(amount||1),daysInTargetMonth=dayAm(currYear,targetMonth),targetDay=daysInTargetMonth>=currDay?currDay:daysInTargetMonth;return this.setValue(currYear,targetMonth,targetDay)},addYear:function(amount){return this.setValue(currYear+(amount||1),currMonth,currDay)},destroy:function(){input.add(document).off("click.d keydown.d"),root.add(trigger).remove(),input.removeData("dateinput").removeClass(css.input),original&&input.replaceWith(original)},hide:function(e){if(opened){if(e=$.Event(),e.type="onHide",fire.trigger(e),e.isDefaultPrevented())return;$(document).off("click.d keydown.d"),root.hide(),opened=!1}return self},toggle:function(){return self.isOpen()?self.hide():self.show()},getConf:function(){return conf},getInput:function(){return input},getCalendar:function(){return root},getValue:function(dateFormat){return dateFormat?format(conf.formatter,value,dateFormat,conf.lang):value},isOpen:function(){return opened}}),$.each(["onBeforeShow","onShow","change","onHide"],function(i,name){$.isFunction(conf[name])&&$(self).on(name,conf[name]),self[name]=function(fn){return fn&&$(self).on(name,fn),self}}),conf.editable||input.on("focus.d click.d",self.show).keydown(function(e){var key=e.keyCode;return!opened&&$(KEYS).index(key)>=0?(self.show(e),e.preventDefault()):((8==key||46==key)&&input.val(""),e.shiftKey||e.ctrlKey||e.altKey||9==key?!0:e.preventDefault())}),parseDate(input.val())&&select(value,conf)}$.tools=$.tools||{version:"@VERSION"};var tool,instances=[],formatters={},KEYS=[75,76,38,39,74,72,40,37],LABELS={};tool=$.tools.dateinput={conf:{format:"mm/dd/yy",formatter:"default",selectors:!1,yearRange:[-5,5],lang:"en",offset:[0,0],speed:0,firstDay:0,min:undefined,max:undefined,trigger:0,toggle:0,editable:0,css:{prefix:"cal",input:"date",root:0,head:0,title:0,prev:0,next:0,month:0,year:0,days:0,body:0,weeks:0,today:0,current:0,week:0,off:0,sunday:0,focus:0,disabled:0,trigger:0}},addFormatter:function(name,fn){formatters[name]=fn},localize:function(language,labels){$.each(labels,function(key,val){labels[key]=val.split(",")}),LABELS[language]=labels}},tool.localize("en",{months:"January,February,March,April,May,June,July,August,September,October,November,December",shortMonths:"Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec",days:"Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday",shortDays:"Sun,Mon,Tue,Wed,Thu,Fri,Sat"});var tmpTag=$("<a/>");tool.addFormatter("default",function(text,date,flags){return text.replace(/d{1,4}|m{1,4}|yy(?:yy)?|"[^"]*"|'[^']*'/g,function($0){return $0 in flags?flags[$0]:$0})}),tool.addFormatter("prefixed",function(text,date,flags){return text.replace(/%(d{1,4}|m{1,4}|yy(?:yy)?|"[^"]*"|'[^']*')/g,function($0,$1){return $1 in flags?flags[$1]:$0})}),$.expr[":"].date=function(el){var type=el.getAttribute("type");return type&&"date"==type||!!$(el).data("dateinput")},$.fn.dateinput=function(conf){if(this.data("dateinput"))return this;conf=$.extend(!0,{},tool.conf,conf),$.each(conf.css,function(key,val){val||"prefix"==key||(conf.css[key]=(conf.css.prefix||"")+(val||key))});var els;return this.each(function(){var el=new Dateinput($(this),conf);instances.push(el);var input=el.getInput().data("dateinput",el);els=els?els.add(input):input}),els?els:this}}(jQuery);

  }).apply(root, arguments);
});
}(this));

(function(root) {
define("jquery.tmpl", ["jquery"], function() {
  return (function() {
/*
 * jQuery Templating Plugin
 * Copyright 2010, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */
(function( jQuery, undefined ){
	var oldManip = jQuery.fn.domManip, tmplItmAtt = "_tmplitem", htmlExpr = /^[^<]*(<[\w\W]+>)[^>]*$|\{\{\! /,
		newTmplItems = {}, wrappedItems = {}, appendToTmplItems, topTmplItem = { key: 0, data: {} }, itemKey = 0, cloneIndex = 0, stack = [];

	function newTmplItem( options, parentItem, fn, data ) {
		// Returns a template item data structure for a new rendered instance of a template (a 'template item').
		// The content field is a hierarchical array of strings and nested items (to be
		// removed and replaced by nodes field of dom elements, once inserted in DOM).
		var newItem = {
			data: data || (parentItem ? parentItem.data : {}),
			_wrap: parentItem ? parentItem._wrap : null,
			tmpl: null,
			parent: parentItem || null,
			nodes: [],
			calls: tiCalls,
			nest: tiNest,
			wrap: tiWrap,
			html: tiHtml,
			update: tiUpdate
		};
		if ( options ) {
			jQuery.extend( newItem, options, { nodes: [], parent: parentItem } );
		}
		if ( fn ) {
			// Build the hierarchical content to be used during insertion into DOM
			newItem.tmpl = fn;
			newItem._ctnt = newItem._ctnt || newItem.tmpl( jQuery, newItem );
			newItem.key = ++itemKey;
			// Keep track of new template item, until it is stored as jQuery Data on DOM element
			(stack.length ? wrappedItems : newTmplItems)[itemKey] = newItem;
		}
		return newItem;
	}

	// Override appendTo etc., in order to provide support for targeting multiple elements. (This code would disappear if integrated in jquery core).
	jQuery.each({
		appendTo: "append",
		prependTo: "prepend",
		insertBefore: "before",
		insertAfter: "after",
		replaceAll: "replaceWith"
	}, function( name, original ) {
		jQuery.fn[ name ] = function( selector ) {
			var ret = [], insert = jQuery( selector ), elems, i, l, tmplItems,
				parent = this.length === 1 && this[0].parentNode;

			appendToTmplItems = newTmplItems || {};
			if ( parent && parent.nodeType === 11 && parent.childNodes.length === 1 && insert.length === 1 ) {
				insert[ original ]( this[0] );
				ret = this;
			} else {
				for ( i = 0, l = insert.length; i < l; i++ ) {
					cloneIndex = i;
					elems = (i > 0 ? this.clone(true) : this).get();
					jQuery.fn[ original ].apply( jQuery(insert[i]), elems );
					ret = ret.concat( elems );
				}
				cloneIndex = 0;
				ret = this.pushStack( ret, name, insert.selector );
			}
			tmplItems = appendToTmplItems;
			appendToTmplItems = null;
			jQuery.tmpl.complete( tmplItems );
			return ret;
		};
	});

	jQuery.fn.extend({
		// Use first wrapped element as template markup.
		// Return wrapped set of template items, obtained by rendering template against data.
		tmpl: function( data, options, parentItem ) {
			return jQuery.tmpl( this[0], data, options, parentItem );
		},

		// Find which rendered template item the first wrapped DOM element belongs to
		tmplItem: function() {
			return jQuery.tmplItem( this[0] );
		},

		// Consider the first wrapped element as a template declaration, and get the compiled template or store it as a named template.
		template: function( name ) {
			return jQuery.template( name, this[0] );
		},

		domManip: function( args, table, callback, options ) {
			// This appears to be a bug in the appendTo, etc. implementation
			// it should be doing .call() instead of .apply(). See #6227
			if ( args[0] && args[0].nodeType ) {
				var dmArgs = jQuery.makeArray( arguments ), argsLength = args.length, i = 0, tmplItem;
				while ( i < argsLength && !(tmplItem = jQuery.data( args[i++], "tmplItem" ))) {}
				if ( argsLength > 1 ) {
					dmArgs[0] = [jQuery.makeArray( args )];
				}
				if ( tmplItem && cloneIndex ) {
					dmArgs[2] = function( fragClone ) {
						// Handler called by oldManip when rendered template has been inserted into DOM.
						jQuery.tmpl.afterManip( this, fragClone, callback );
					};
				}
				oldManip.apply( this, dmArgs );
			} else {
				oldManip.apply( this, arguments );
			}
			cloneIndex = 0;
			if ( !appendToTmplItems ) {
				jQuery.tmpl.complete( newTmplItems );
			}
			return this;
		}
	});

	jQuery.extend({
		// Return wrapped set of template items, obtained by rendering template against data.
		tmpl: function( tmpl, data, options, parentItem ) {
			var ret, topLevel = !parentItem;
			if ( topLevel ) {
				// This is a top-level tmpl call (not from a nested template using {{tmpl}})
				parentItem = topTmplItem;
				tmpl = jQuery.template[tmpl] || jQuery.template( null, tmpl );
				wrappedItems = {}; // Any wrapped items will be rebuilt, since this is top level
			} else if ( !tmpl ) {
				// The template item is already associated with DOM - this is a refresh.
				// Re-evaluate rendered template for the parentItem
				tmpl = parentItem.tmpl;
				newTmplItems[parentItem.key] = parentItem;
				parentItem.nodes = [];
				if ( parentItem.wrapped ) {
					updateWrapped( parentItem, parentItem.wrapped );
				}
				// Rebuild, without creating a new template item
				return jQuery( build( parentItem, null, parentItem.tmpl( jQuery, parentItem ) ));
			}
			if ( !tmpl ) {
				return []; // Could throw...
			}
			if ( typeof data === "function" ) {
				data = data.call( parentItem || {} );
			}
			if ( options && options.wrapped ) {
				updateWrapped( options, options.wrapped );
			}
			ret = jQuery.isArray( data ) ? 
				jQuery.map( data, function( dataItem ) {
					return dataItem ? newTmplItem( options, parentItem, tmpl, dataItem ) : null;
				}) :
				[ newTmplItem( options, parentItem, tmpl, data ) ];
			return topLevel ? jQuery( build( parentItem, null, ret ) ) : ret;
		},

		// Return rendered template item for an element.
		tmplItem: function( elem ) {
			var tmplItem;
			if ( elem instanceof jQuery ) {
				elem = elem[0];
			}
			while ( elem && elem.nodeType === 1 && !(tmplItem = jQuery.data( elem, "tmplItem" )) && (elem = elem.parentNode) ) {}
			return tmplItem || topTmplItem;
		},

		// Set:
		// Use $.template( name, tmpl ) to cache a named template,
		// where tmpl is a template string, a script element or a jQuery instance wrapping a script element, etc.
		// Use $( "selector" ).template( name ) to provide access by name to a script block template declaration.

		// Get:
		// Use $.template( name ) to access a cached template.
		// Also $( selectorToScriptBlock ).template(), or $.template( null, templateString )
		// will return the compiled template, without adding a name reference.
		// If templateString includes at least one HTML tag, $.template( templateString ) is equivalent
		// to $.template( null, templateString )
		template: function( name, tmpl ) {
			if (tmpl) {
				// Compile template and associate with name
				if ( typeof tmpl === "string" ) {
					// This is an HTML string being passed directly in.
					tmpl = buildTmplFn( tmpl )
				} else if ( tmpl instanceof jQuery ) {
					tmpl = tmpl[0] || {};
				}
				if ( tmpl.nodeType ) {
					// If this is a template block, use cached copy, or generate tmpl function and cache.
					tmpl = jQuery.data( tmpl, "tmpl" ) || jQuery.data( tmpl, "tmpl", buildTmplFn( tmpl.innerHTML ));
				}
				return typeof name === "string" ? (jQuery.template[name] = tmpl) : tmpl;
			}
			// Return named compiled template
			return name ? (typeof name !== "string" ? jQuery.template( null, name ): 
				(jQuery.template[name] || 
					// If not in map, treat as a selector. (If integrated with core, use quickExpr.exec) 
					jQuery.template( null, htmlExpr.test( name ) ? name : jQuery( name )))) : null; 
		},

		encode: function( text ) {
			// Do HTML encoding replacing < > & and ' and " by corresponding entities.
			return ("" + text).split("<").join("&lt;").split(">").join("&gt;").split('"').join("&#34;").split("'").join("&#39;");
		}
	});

	jQuery.extend( jQuery.tmpl, {
		tag: {
			"tmpl": {
				_default: { $2: "null" },
				open: "if($notnull_1){_=_.concat($item.nest($1,$2));}"
				// tmpl target parameter can be of type function, so use $1, not $1a (so not auto detection of functions)
				// This means that {{tmpl foo}} treats foo as a template (which IS a function). 
				// Explicit parens can be used if foo is a function that returns a template: {{tmpl foo()}}.
			},
			"wrap": {
				_default: { $2: "null" },
				open: "$item.calls(_,$1,$2);_=[];",
				close: "call=$item.calls();_=call._.concat($item.wrap(call,_));"
			},
			"each": {
				_default: { $2: "$index, $value" },
				open: "if($notnull_1){$.each($1a,function($2){with(this){",
				close: "}});}"
			},
			"if": {
				open: "if(($notnull_1) && $1a){",
				close: "}"
			},
			"else": {
				_default: { $1: "true" },
				open: "}else if(($notnull_1) && $1a){"
			},
			"html": {
				// Unecoded expression evaluation. 
				open: "if($notnull_1){_.push($1a);}"
			},
			"=": {
				// Encoded expression evaluation. Abbreviated form is ${}.
				_default: { $1: "$data" },
				open: "if($notnull_1){_.push($.encode($1a));}"
			},
			"!": {
				// Comment tag. Skipped by parser
				open: ""
			}
		},

		// This stub can be overridden, e.g. in jquery.tmplPlus for providing rendered events
		complete: function( items ) {
			newTmplItems = {};
		},

		// Call this from code which overrides domManip, or equivalent
		// Manage cloning/storing template items etc.
		afterManip: function afterManip( elem, fragClone, callback ) {
			// Provides cloned fragment ready for fixup prior to and after insertion into DOM
			var content = fragClone.nodeType === 11 ?
				jQuery.makeArray(fragClone.childNodes) :
				fragClone.nodeType === 1 ? [fragClone] : [];

			// Return fragment to original caller (e.g. append) for DOM insertion
			callback.call( elem, fragClone );

			// Fragment has been inserted:- Add inserted nodes to tmplItem data structure. Replace inserted element annotations by jQuery.data.
			storeTmplItems( content );
			cloneIndex++;
		}
	});

	//========================== Private helper functions, used by code above ==========================

	function build( tmplItem, nested, content ) {
		// Convert hierarchical content into flat string array 
		// and finally return array of fragments ready for DOM insertion
		var frag, ret = content ? jQuery.map( content, function( item ) {
			return (typeof item === "string") ? 
				// Insert template item annotations, to be converted to jQuery.data( "tmplItem" ) when elems are inserted into DOM.
				(tmplItem.key ? item.replace( /(<\w+)(?=[\s>])(?![^>]*_tmplitem)([^>]*)/g, "$1 " + tmplItmAtt + "=\"" + tmplItem.key + "\" $2" ) : item) :
				// This is a child template item. Build nested template.
				build( item, tmplItem, item._ctnt );
		}) : 
		// If content is not defined, insert tmplItem directly. Not a template item. May be a string, or a string array, e.g. from {{html $item.html()}}. 
		tmplItem;
		if ( nested ) {
			return ret;
		}

		// top-level template
		ret = ret.join("");

		// Support templates which have initial or final text nodes, or consist only of text
		// Also support HTML entities within the HTML markup.
		ret.replace( /^\s*([^<\s][^<]*)?(<[\w\W]+>)([^>]*[^>\s])?\s*$/, function( all, before, middle, after) {
			frag = jQuery( middle ).get();

			storeTmplItems( frag );
			if ( before ) {
				frag = unencode( before ).concat(frag);
			}
			if ( after ) {
				frag = frag.concat(unencode( after ));
			}
		});
		return frag ? frag : unencode( ret );
	}

	function unencode( text ) {
		// Use createElement, since createTextNode will not render HTML entities correctly
		var el = document.createElement( "div" );
		el.innerHTML = text;
		return jQuery.makeArray(el.childNodes);
	}

	// Generate a reusable function that will serve to render a template against data
	function buildTmplFn( markup ) {
		return new Function("jQuery","$item",
			"var $=jQuery,call,_=[],$data=$item.data;" +

			// Introduce the data as local variables using with(){}
			"with($data){_.push('" +

			// Convert the template into pure JavaScript
			jQuery.trim(markup)
				.replace( /([\\'])/g, "\\$1" )
				.replace( /[\r\t\n]/g, " " )
				.replace( /\$\{([^\}]*)\}/g, "{{= $1}}" )
				.replace( /\{\{(\/?)(\w+|.)(?:\(((?:[^\}]|\}(?!\}))*?)?\))?(?:\s+(.*?)?)?(\(((?:[^\}]|\}(?!\}))*?)\))?\s*\}\}/g,
				function( all, slash, type, fnargs, target, parens, args ) {
					var tag = jQuery.tmpl.tag[ type ], def, expr, exprAutoFnDetect;
					if ( !tag ) {
						throw "Template command not found: " + type;
					}
					def = tag._default || [];
					if ( parens && !/\w$/.test(target)) {
						target += parens;
						parens = "";
					}
					if ( target ) {
						target = unescape( target ); 
						args = args ? ("," + unescape( args ) + ")") : (parens ? ")" : "");
						// Support for target being things like a.toLowerCase();
						// In that case don't call with template item as 'this' pointer. Just evaluate...
						expr = parens ? (target.indexOf(".") > -1 ? target + parens : ("(" + target + ").call($item" + args)) : target;
						exprAutoFnDetect = parens ? expr : "(typeof(" + target + ")==='function'?(" + target + ").call($item):(" + target + "))";
					} else {
						exprAutoFnDetect = expr = def.$1 || "null";
					}
					fnargs = unescape( fnargs );
					return "');" + 
						tag[ slash ? "close" : "open" ]
							.split( "$notnull_1" ).join( target ? "typeof(" + target + ")!=='undefined' && (" + target + ")!=null" : "true" )
							.split( "$1a" ).join( exprAutoFnDetect )
							.split( "$1" ).join( expr )
							.split( "$2" ).join( fnargs ?
								fnargs.replace( /\s*([^\(]+)\s*(\((.*?)\))?/g, function( all, name, parens, params ) {
									params = params ? ("," + params + ")") : (parens ? ")" : "");
									return params ? ("(" + name + ").call($item" + params) : all;
								})
								: (def.$2||"")
							) +
						"_.push('";
				}) +
			"');}return _;"
		);
	}
	function updateWrapped( options, wrapped ) {
		// Build the wrapped content. 
		options._wrap = build( options, true, 
			// Suport imperative scenario in which options.wrapped can be set to a selector or an HTML string.
			jQuery.isArray( wrapped ) ? wrapped : [htmlExpr.test( wrapped ) ? wrapped : jQuery( wrapped ).html()]
		).join("");
	}

	function unescape( args ) {
		return args ? args.replace( /\\'/g, "'").replace(/\\\\/g, "\\" ) : null;
	}
	function outerHtml( elem ) {
		var div = document.createElement("div");
		div.appendChild( elem.cloneNode(true) );
		return div.innerHTML;
	}

	// Store template items in jQuery.data(), ensuring a unique tmplItem data data structure for each rendered template instance.
	function storeTmplItems( content ) {
		var keySuffix = "_" + cloneIndex, elem, elems, newClonedItems = {}, i, l, m;
		for ( i = 0, l = content.length; i < l; i++ ) {
			if ( (elem = content[i]).nodeType !== 1 ) {
				continue;
			}
			elems = elem.getElementsByTagName("*");
			for ( m = elems.length - 1; m >= 0; m-- ) {
				processItemKey( elems[m] );
			}
			processItemKey( elem );
		}
		function processItemKey( el ) {
			var pntKey, pntNode = el, pntItem, tmplItem, key;
			// Ensure that each rendered template inserted into the DOM has its own template item,
			if ( (key = el.getAttribute( tmplItmAtt ))) {
				while ( pntNode.parentNode && (pntNode = pntNode.parentNode).nodeType === 1 && !(pntKey = pntNode.getAttribute( tmplItmAtt ))) { }
				if ( pntKey !== key ) {
					// The next ancestor with a _tmplitem expando is on a different key than this one.
					// So this is a top-level element within this template item
					// Set pntNode to the key of the parentNode, or to 0 if pntNode.parentNode is null, or pntNode is a fragment.
					pntNode = pntNode.parentNode ? (pntNode.nodeType === 11 ? 0 : (pntNode.getAttribute( tmplItmAtt ) || 0)) : 0;
					if ( !(tmplItem = newTmplItems[key]) ) {
						// The item is for wrapped content, and was copied from the temporary parent wrappedItem.
						tmplItem = wrappedItems[key];
						tmplItem = newTmplItem( tmplItem, newTmplItems[pntNode]||wrappedItems[pntNode], null, true );
						tmplItem.key = ++itemKey;
						newTmplItems[itemKey] = tmplItem;
					}
					if ( cloneIndex ) {
						cloneTmplItem( key );
					}
				}
				el.removeAttribute( tmplItmAtt );
			} else if ( cloneIndex && (tmplItem = jQuery.data( el, "tmplItem" )) ) {
				// This was a rendered element, cloned during append or appendTo etc.
				// TmplItem stored in jQuery data has already been cloned in cloneCopyEvent. We must replace it with a fresh cloned tmplItem.
				cloneTmplItem( tmplItem.key );
				newTmplItems[tmplItem.key] = tmplItem;
				pntNode = jQuery.data( el.parentNode, "tmplItem" );
				pntNode = pntNode ? pntNode.key : 0;
			}
			if ( tmplItem ) {
				pntItem = tmplItem;
				// Find the template item of the parent element. 
				// (Using !=, not !==, since pntItem.key is number, and pntNode may be a string)
				while ( pntItem && pntItem.key != pntNode ) { 
					// Add this element as a top-level node for this rendered template item, as well as for any
					// ancestor items between this item and the item of its parent element
					pntItem.nodes.push( el );
					pntItem = pntItem.parent;
				}
				// Delete content built during rendering - reduce API surface area and memory use, and avoid exposing of stale data after rendering...
				delete tmplItem._ctnt;
				delete tmplItem._wrap;
				// Store template item as jQuery data on the element
				jQuery.data( el, "tmplItem", tmplItem );
			}
			function cloneTmplItem( key ) {
				key = key + keySuffix;
				tmplItem = newClonedItems[key] = 
					(newClonedItems[key] || newTmplItem( tmplItem, newTmplItems[tmplItem.parent.key + keySuffix] || tmplItem.parent, null, true ));
			}
		}
	}

	//---- Helper functions for template item ----

	function tiCalls( content, tmpl, data, options ) {
		if ( !content ) {
			return stack.pop();
		}
		stack.push({ _: content, tmpl: tmpl, item:this, data: data, options: options });
	}

	function tiNest( tmpl, data, options ) {
		// nested template, using {{tmpl}} tag
		return jQuery.tmpl( jQuery.template( tmpl ), data, options, this );
	}

	function tiWrap( call, wrapped ) {
		// nested template, using {{wrap}} tag
		var options = call.options || {};
		options.wrapped = wrapped;
		// Apply the template, which may incorporate wrapped content, 
		return jQuery.tmpl( jQuery.template( call.tmpl ), call.data, options, call.item );
	}

	function tiHtml( filter, textOnly ) {
		var wrapped = this._wrap;
		return jQuery.map(
			jQuery( jQuery.isArray( wrapped ) ? wrapped.join("") : wrapped ).filter( filter || "*" ),
			function(e) {
				return textOnly ?
					e.innerText || e.textContent :
					e.outerHTML || outerHtml(e);
			});
	}

	function tiUpdate() {
		var coll = this.nodes;
		jQuery.tmpl( null, null, null, this).insertBefore( coll[0] );
		jQuery( coll ).remove();
	}
})( jQuery );


  }).apply(root, arguments);
});
}(this));

(function(root) {
define("jquery.recurrenceinput", ["jquery","resource-plone-app-jquerytools-js","resource-plone-app-jquerytools-dateinput-js","jquery.tmpl"], function() {
  return (function() {
/*jslint regexp: false, continue: true, indent: 4 */
/*global $, alert, jQuery */


(function ($) {
    $.tools = $.tools || {version: '@VERSION'};

    var tool;
    var LABELS = {};

    tool = $.tools.recurrenceinput = {
        conf: {
            lang: 'en',
            readOnly: false,
            firstDay: 0,

            // "REMOTE" FIELD
            startField: null,
            startFieldYear: null,
            startFieldMonth: null,
            startFieldDay: null,
            ajaxURL: null,
            ajaxContentType: 'application/json; charset=utf8',
            ributtonExtraClass: '',

            // INPUT CONFIGURATION
            hasRepeatForeverButton: true,

            // FORM OVERLAY
            formOverlay: {
                speed: 'fast',
                fixed: false
            },

            // JQUERY TEMPLATE NAMES
            template: {
                form: '#jquery-recurrenceinput-form-tmpl',
                display: '#jquery-recurrenceinput-display-tmpl'
            },

            // RECURRENCE TEMPLATES
            rtemplate: {
                daily: {
                    rrule: 'FREQ=DAILY',
                    fields: [
                        'ridailyinterval',
                        'rirangeoptions'
                    ]
                },
                mondayfriday: {
                    rrule: 'FREQ=WEEKLY;BYDAY=MO,FR',
                    fields: [
                        'rirangeoptions'
                    ]
                },
                weekdays: {
                    rrule: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR',
                    fields: [
                        'rirangeoptions'
                    ]
                },
                weekly: {
                    rrule: 'FREQ=WEEKLY',
                    fields: [
                        'riweeklyinterval',
                        'riweeklyweekdays',
                        'rirangeoptions'
                    ]
                },
                monthly: {
                    rrule: 'FREQ=MONTHLY',
                    fields: [
                        'rimonthlyinterval',
                        'rimonthlyoptions',
                        'rirangeoptions'
                    ]
                },
                yearly: {
                    rrule: 'FREQ=YEARLY',
                    fields: [
                        'riyearlyinterval',
                        'riyearlyoptions',
                        'rirangeoptions'
                    ]
                }
            }
        },

        localize: function (language, labels) {
            LABELS[language] = labels;
        },

        setTemplates: function (templates, titles) {
            var lang, template;
            tool.conf.rtemplate = templates;
            for (lang in titles) {
                if (titles.hasOwnProperty(lang)) {
                    for (template in titles[lang]) {
                        if (titles[lang].hasOwnProperty(template)) {
                            LABELS[lang].rtemplate[template] = titles[lang][template];
                        }
                    }
                }
            }
        }

    };

    tool.localize("en", {
        displayUnactivate: 'Does not repeat',
        displayActivate: 'Repeats every',
        add_rules: 'Add',
        edit_rules: 'Edit',
        delete_rules: 'Delete',
        add:  'Add',
        refresh: 'Refresh',

        title: 'Repeat',
        preview: 'Selected dates',
        addDate: 'Add date',

        recurrenceType: 'Repeats:',

        dailyInterval1: 'Repeat every:',
        dailyInterval2: 'days',

        weeklyInterval1: 'Repeat every:',
        weeklyInterval2: 'week(s)',
        weeklyWeekdays: 'Repeat on:',
        weeklyWeekdaysHuman: 'on:',

        monthlyInterval1: 'Repeat every:',
        monthlyInterval2: 'month(s)',
        monthlyDayOfMonth1: 'Day',
        monthlyDayOfMonth1Human: 'on day',
        monthlyDayOfMonth2: 'of the month',
        monthlyDayOfMonth3: 'month(s)',
        monthlyWeekdayOfMonth1: 'The',
        monthlyWeekdayOfMonth1Human: 'on the',
        monthlyWeekdayOfMonth2: '',
        monthlyWeekdayOfMonth3: 'of the month',
        monthlyRepeatOn: 'Repeat on:',

        yearlyInterval1: 'Repeat every:',
        yearlyInterval2: 'year(s)',
        yearlyDayOfMonth1: 'Every',
        yearlyDayOfMonth1Human: 'on',
        yearlyDayOfMonth2: '',
        yearlyDayOfMonth3: '',
        yearlyWeekdayOfMonth1: 'The',
        yearlyWeekdayOfMonth1Human: 'on the',
        yearlyWeekdayOfMonth2: '',
        yearlyWeekdayOfMonth3: 'of',
        yearlyWeekdayOfMonth4: '',
        yearlyRepeatOn: 'Repeat on:',

        range: 'End recurrence:',
        rangeNoEnd: 'Never',
        rangeByOccurrences1: 'After',
        rangeByOccurrences1Human: 'ends after',
        rangeByOccurrences2: 'occurrence(s)',
        rangeByEndDate: 'On',
        rangeByEndDateHuman: 'ends on',

        including: ', and also',
        except: ', except for',

        cancel: 'Cancel',
        save: 'Save',

        recurrenceStart: 'Start of the recurrence',
        additionalDate: 'Additional date',
        include: 'Include',
        exclude: 'Exclude',
        remove: 'Remove',

        orderIndexes: ['first', 'second', 'third', 'fourth', 'last'],
        months: [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'],
        shortMonths: [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        weekdays: [
            'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday',
            'Friday', 'Saturday'],
        shortWeekdays: [
            'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],

        longDateFormat: 'mmmm dd, yyyy',
        shortDateFormat: 'mm/dd/yyyy',

        unsupportedFeatures: 'Warning: This event uses recurrence features not ' +
                              'supported by this widget. Saving the recurrence ' +
                              'may change the recurrence in unintended ways:',
        noTemplateMatch: 'No matching recurrence template',
        multipleDayOfMonth: 'This widget does not support multiple days in monthly or yearly recurrence',
        bysetpos: 'BYSETPOS is not supported',
        noRule: 'No RRULE in RRULE data',
        noRepeatEvery: 'Error: The "Repeat every"-field must be between 1 and 1000',
        noEndDate: 'Error: End date is not set. Please set a correct value',
        noRepeatOn: 'Error: "Repeat on"-value must be selected',
        pastEndDate: 'Error: End date cannot be before start date',
        noEndAfterNOccurrences: 'Error: The "After N occurrences"-field must be between 1 and 1000',
        alreadyAdded: 'This date was already added',

        rtemplate: {
            daily: 'Daily',
            mondayfriday: 'Monday and Friday',
            weekdays: 'Weekday',
            weekly: 'Weekly',
            monthly: 'Monthly',
            yearly: 'Yearly'
        }
    });


    var OCCURRENCETMPL = ['<div class="rioccurrences">',
        '{{each occurrences}}',
            '<div class="occurrence ${occurrences[$index].type}">',
                '<span>',
                    '${occurrences[$index].formattedDate}',
                    '{{if occurrences[$index].type === "start"}}',
                        '<span class="rlabel">${i18n.recurrenceStart}</span>',
                    '{{/if}}',
                    '{{if occurrences[$index].type === "rdate"}}',
                        '<span class="rlabel">${i18n.additionalDate}</span>',
                    '{{/if}}',
                '</span>',
                '{{if !readOnly}}',
                    '<span class="action">',
                        '{{if occurrences[$index].type === "rrule"}}',
                            '<a date="${occurrences[$index].date}" href="#"',
                               'class="${occurrences[$index].type}" title="${i18n.exclude}">',
                                '${i18n.exclude}',
                            '</a>',
                        '{{/if}}',
                        '{{if occurrences[$index].type === "rdate"}}',
                            '<a date="${occurrences[$index].date}" href="#"',
                               'class="${occurrences[$index].type}" title="${i18n.remove}" >',
                                '${i18n.remove}',
                            '</a>',
                        '{{/if}}',
                        '{{if occurrences[$index].type === "exdate"}}',
                            '<a date="${occurrences[$index].date}" href="#"',
                               'class="${occurrences[$index].type}" title="${i18n.include}">',
                                '${i18n.include}',
                            '</a>',
                        '{{/if}}',
                    '</span>',
                '{{/if}}',
            '</div>',
        '{{/each}}',
        '<div class="batching">',
            '{{each batch.batches}}',
                '{{if $index === batch.currentBatch}}<span class="current">{{/if}}',
                    '<a href="#" start="${batch.batches[$index][0]}">[${batch.batches[$index][0]} - ${batch.batches[$index][1]}]</a>',
                '{{if $index === batch.currentBatch}}</span>{{/if}}',
            '{{/each}}',
        '</div></div>'].join('\n');

    $.template('occurrenceTmpl', OCCURRENCETMPL);

    var DISPLAYTMPL = ['<div class="ridisplay">',
        '<div class="rimain">',
            '{{if !readOnly}}',
                '<button name="riedit">${i18n.add_rules}</button>',
                '<button name="ridelete" style="display:none">${i18n.delete_rules}</button>',
            '{{/if}}',
            '<label class="ridisplay">${i18n.displayUnactivate}</label>',
        '</div>',
        '<div class="rioccurrences" style="display:none" /></div>'].join('\n');

    $.template('displayTmpl', DISPLAYTMPL);

    var FORMTMPL = ['<div class="riform">',
            '<form>',
                '<h1>${i18n.title}</h1>',
                '<div id="messagearea" style="display: none;">',
                '</div>',
                '<div id="rirtemplate">',
                    '<label for="${name}rtemplate" class="label">',
                        '${i18n.recurrenceType}',
                    '</label>',
                    '<select id="rirtemplate" name="rirtemplate" class="field">',
                        '{{each rtemplate}}',
                            '<option value="${$index}">${i18n.rtemplate[$index]}</value>',
                        '{{/each}}',
                    '</select>',
                '<div>',
                '<div id="riformfields">',
                    '<div id="ridailyinterval" class="rifield">',
                        '<label for="${name}dailyinterval" class="label">',
                            '${i18n.dailyInterval1}',
                        '</label>',
                        '<div class="field">',
                            '<input type="text" size="2"',
                                'value="1"',
                                'name="ridailyinterval"',
                                'id="${name}dailyinterval" />',
                            '${i18n.dailyInterval2}',
                        '</div>',
                    '</div>',
                    '<div id="riweeklyinterval" class="rifield">',
                        '<label for="${name}weeklyinterval" class="label">',
                            '${i18n.weeklyInterval1}',
                        '</label>',
                        '<div class="field">',
                            '<input type="text" size="2"',
                                'value="1"',
                                'name="riweeklyinterval"',
                                'id="${name}weeklyinterval"/>',
                            '${i18n.weeklyInterval2}',
                        '</div>',
                    '</div>',
                    '<div id="riweeklyweekdays" class="rifield">',
                        '<label for="${name}weeklyinterval" class="label">${i18n.weeklyWeekdays}</label>',
                        '<div class="field">',
                            '{{each orderedWeekdays}}',
                                '<div class="riweeklyweekday">',
                                    '<input type="checkbox"',
                                        'name="riweeklyweekdays${weekdays[$value]}"',
                                        'id="${name}weeklyWeekdays${weekdays[$value]}"',
                                        'value="${weekdays[$value]}" />',
                                    '<label for="${name}weeklyWeekdays${weekdays[$value]}">${i18n.shortWeekdays[$value]}</label>',
                                '</div>',
                            '{{/each}}',
                        '</div>',
                    '</div>',
                    '<div id="rimonthlyinterval" class="rifield">',
                        '<label for="rimonthlyinterval" class="label">${i18n.monthlyInterval1}</label>',
                        '<div class="field">',
                            '<input type="text" size="2"',
                                'value="1" ',
                                'name="rimonthlyinterval"/>',
                            '${i18n.monthlyInterval2}',
                        '</div>',
                    '</div>',
                    '<div id="rimonthlyoptions" class="rifield">',
                        '<label for="rimonthlytype" class="label">${i18n.monthlyRepeatOn}</label>',
                        '<div class="field">',
                            '<div>',
                                '<input',
                                    'type="radio"',
                                    'value="DAYOFMONTH"',
                                    'name="rimonthlytype"',
                                    'id="${name}monthlytype:DAYOFMONTH" />',
                                '<label for="${name}monthlytype:DAYOFMONTH">',
                                    '${i18n.monthlyDayOfMonth1}',
                                '</label>',
                                '<select name="rimonthlydayofmonthday"',
                                    'id="${name}monthlydayofmonthday">',
                                '{{each [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,',
                                        '18,19,20,21,22,23,24,25,26,27,28,29,30,31]}}',
                                    '<option value="${$value}">${$value}</option>',
                                '{{/each}}',
                                '</select>',
                                '${i18n.monthlyDayOfMonth2}',
                            '</div>',
                            '<div>',
                                '<input',
                                    'type="radio"',
                                    'value="WEEKDAYOFMONTH"',
                                    'name="rimonthlytype"',
                                    'id="${name}monthlytype:WEEKDAYOFMONTH" />',
                                '<label for="${name}monthlytype:WEEKDAYOFMONTH">',
                                    '${i18n.monthlyWeekdayOfMonth1}',
                                '</label>',
                                '<select name="rimonthlyweekdayofmonthindex">',
                                    '{{each i18n.orderIndexes}}',
                                        '<option value="${orderIndexes[$index]}">${$value}</option>',
                                    '{{/each}}',
                                '</select>',
                                '${i18n.monthlyWeekdayOfMonth2}',
                                '<select name="rimonthlyweekdayofmonth">',
                                    '{{each orderedWeekdays}}',
                                        '<option value="${weekdays[$value]}">${i18n.weekdays[$value]}</option>',
                                    '{{/each}}',
                                '</select>',
                                '${i18n.monthlyWeekdayOfMonth3}',
                            '</div>',
                        '</div>',
                    '</div>',
                    '<div id="riyearlyinterval" class="rifield">',
                        '<label for="riyearlyinterval" class="label">${i18n.yearlyInterval1}</label>',
                        '<div class="field">',
                            '<input type="text" size="2"',
                                'value="1" ',
                                'name="riyearlyinterval"/>',
                            '${i18n.yearlyInterval2}',
                        '</div>',
                    '</div>',
                    '<div id="riyearlyoptions" class="rifield">',
                        '<label for="riyearlyType" class="label">${i18n.yearlyRepeatOn}</label>',
                        '<div class="field">',
                            '<div>',
                                '<input',
                                    'type="radio"',
                                    'value="DAYOFMONTH"',
                                    'name="riyearlyType"',
                                    'id="${name}yearlytype:DAYOFMONTH" />',
                                '<label for="${name}yearlytype:DAYOFMONTH">',
                                    '${i18n.yearlyDayOfMonth1}',
                                '</label>',
                                '<select name="riyearlydayofmonthmonth">',
                                '{{each i18n.months}}',
                                    '<option value="${$index+1}">${$value}</option>',
                                '{{/each}}',
                                '</select>',
                                '${i18n.yearlyDayOfMonth2}',
                                '<select name="riyearlydayofmonthday">',
                                '{{each [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,',
                                        '18,19,20,21,22,23,24,25,26,27,28,29,30,31]}}',
                                    '<option value="${$value}">${$value}</option>',
                                '{{/each}}',
                                '</select>',
                                '${i18n.yearlyDayOfMonth3}',
                            '</div>',
                            '<div>',
                                '<input',
                                    'type="radio"',
                                    'value="WEEKDAYOFMONTH"',
                                    'name="riyearlyType"',
                                    'id="${name}yearlytype:WEEKDAYOFMONTH"/>',
                                '<label for="${name}yearlytype:WEEKDAYOFMONTH">',
                                    '${i18n.yearlyWeekdayOfMonth1}',
                                '</label>',
                                '<select name="riyearlyweekdayofmonthindex">',
                                '{{each i18n.orderIndexes}}',
                                    '<option value="${orderIndexes[$index]}">${$value}</option>',
                                '{{/each}}',
                                '</select>',
                                '<label for="${name}yearlytype:WEEKDAYOFMONTH">',
                                    '${i18n.yearlyWeekdayOfMonth2}',
                                '</label>',
                                '<select name="riyearlyweekdayofmonthday">',
                                '{{each orderedWeekdays}}',
                                    '<option value="${weekdays[$value]}">${i18n.weekdays[$value]}</option>',
                                '{{/each}}',
                                '</select>',
                                '${i18n.yearlyWeekdayOfMonth3}',
                                '<select name="riyearlyweekdayofmonthmonth">',
                                '{{each i18n.months}}',
                                    '<option value="${$index+1}">${$value}</option>',
                                '{{/each}}',
                                '</select>',
                                '${i18n.yearlyWeekdayOfMonth4}',
                            '</div>',
                        '</div>',
                    '</div>',
                    '<div id="rirangeoptions" class="rifield">',
                        '<label class="label">${i18n.range}</label>',
                        '<div class="field">',
                          '{{if hasRepeatForeverButton}}',
                            '<div>',
                                '<input',
                                    'type="radio"',
                                    'value="NOENDDATE"',
                                    'name="rirangetype"',
                                    'id="${name}rangetype:NOENDDATE"/>',
                                '<label for="${name}rangetype:NOENDDATE">',
                                    '${i18n.rangeNoEnd}',
                                '</label>',
                            '</div>',
                          '{{/if}}',
                            '<div>',
                                '<input',
                                    'type="radio"',
                                    'checked="checked"',
                                    'value="BYOCCURRENCES"',
                                    'name="rirangetype"',
                                    'id="${name}rangetype:BYOCCURRENCES"/>',
                                '<label for="${name}rangetype:BYOCCURRENCES">',
                                    '${i18n.rangeByOccurrences1}',
                                '</label>',
                                '<input',
                                    'type="text" size="3"',
                                    'value="7"',
                                    'name="rirangebyoccurrencesvalue" />',
                                '${i18n.rangeByOccurrences2}',
                            '</div>',
                            '<div>',
                                '<input',
                                    'type="radio"',
                                    'value="BYENDDATE"',
                                    'name="rirangetype"',
                                    'id="${name}rangetype:BYENDDATE"/>',
                                '<label for="${name}rangetype:BYENDDATE">',
                                    '${i18n.rangeByEndDate}',
                                '</label>',
                                '<input',
                                    'type="date"',
                                    'name="rirangebyenddatecalendar" />',
                            '</div>',
                        '</div>',
                    '</div>',
                '</div>',
                '<div class="rioccurrencesactions">',
                    '<div class="rioccurancesheader">',
                        '<h2>${i18n.preview}</h2>',
                        '<span class="refreshbutton action">',
                            '<a class="rirefreshbutton" href="#" title="${i18n.refresh}">',
                                '${i18n.refresh}',
                            '</a>',
                        '</span>',
                    '</div>',
                '</div>',
                '<div class="rioccurrences">',
                '</div>',
                '<div class="rioccurrencesactions">',
                    '<div class="rioccurancesheader">',
                        '<h2>${i18n.addDate}</h2>',
                    '</div>',
                    '<div class="riaddoccurrence">',
                        '<div class="errorarea"></div>',
                        '<input type="date" name="adddate" id="adddate" />',
                        '<input type="button" name="addaction" id="addaction" value="${i18n.add}">',
                    '</div>',
                '</div>',

                '<div class="ributtons">',
                    '<input',
                        'type="submit"',
                        'class="ricancelbutton ${ributtonExtraClass}"',
                        'value="${i18n.cancel}" />',
                    '<input',
                        'type="submit"',
                        'class="risavebutton ${ributtonExtraClass}"',
                        'value="${i18n.save}" />',
                '</div>',
            '</form></div>'].join('\n');

    $.template('formTmpl', FORMTMPL);

    // Formatting function (mostly) from jQueryTools dateinput
    var Re = /d{1,4}|m{1,4}|yy(?:yy)?|"[^"]*"|'[^']*'/g;

    function zeropad(val, len) {
        val = val.toString();
        len = len || 2;
        while (val.length < len) { val = "0" + val; }
        return val;
    }

    function format(date, fmt, conf) {
        var d = date.getDate(),
            D = date.getDay(),
            m = date.getMonth(),
            y = date.getFullYear(),

            flags = {
                d:    d,
                dd:   zeropad(d),
                ddd:  conf.i18n.shortWeekdays[D],
                dddd: conf.i18n.weekdays[D],
                m:    m + 1,
                mm:   zeropad(m + 1),
                mmm:  conf.i18n.shortMonths[m],
                mmmm: conf.i18n.months[m],
                yy:   String(y).slice(2),
                yyyy: y
            };

        var result = fmt.replace(Re, function ($0) {
            return flags.hasOwnProperty($0) ? flags[$0] : $0.slice(1, $0.length - 1);
        });

        return result;

    }

    /**
     * Parsing RFC5545 from widget
     */
    function widgetSaveToRfc5545(form, conf, tz) {
        var value = form.find('select[name=rirtemplate]').val();
        var rtemplate = conf.rtemplate[value];
        var result = rtemplate.rrule;
        var human = conf.i18n.rtemplate[value];
        var field, input, weekdays, i18nweekdays, i, j, index, tmp;
        var day, month, year, interval, yearlyType, occurrences, date;

        for (i = 0; i < rtemplate.fields.length; i++) {
            field = form.find('#' + rtemplate.fields[i]);

            switch (field.attr('id')) {

            case 'ridailyinterval':
                interval = field.find('input[name=ridailyinterval]').val();
                if (interval !== '1') {
                    result += ';INTERVAL=' + interval;
                }
                human = interval + ' ' + conf.i18n.dailyInterval2;
                break;

            case 'riweeklyinterval':
                interval = field.find('input[name=riweeklyinterval]').val();
                if (interval !== '1') {
                    result += ';INTERVAL=' + interval;
                }
                human = interval + ' ' + conf.i18n.weeklyInterval2;
                break;

            case 'riweeklyweekdays':
                weekdays = '';
                i18nweekdays = '';
                for (j = 0; j < conf.weekdays.length; j++) {
                    input = field.find('input[name=riweeklyweekdays' + conf.weekdays[j] + ']');
                    if (input.is(':checked')) {
                        if (weekdays) {
                            weekdays += ',';
                            i18nweekdays += ', ';
                        }
                        weekdays += conf.weekdays[j];
                        i18nweekdays += conf.i18n.weekdays[j];
                    }
                }
                if (weekdays) {
                    result += ';BYDAY=' + weekdays;
                    human += ' ' + conf.i18n.weeklyWeekdaysHuman + ' ' + i18nweekdays;
                }
                break;

            case 'rimonthlyinterval':
                interval = field.find('input[name=rimonthlyinterval]').val();
                if (interval !== '1') {
                    result += ';INTERVAL=' + interval;
                }
                human = interval + ' ' + conf.i18n.monthlyInterval2;
                break;

            case 'rimonthlyoptions':
                var monthlyType = $('input[name=rimonthlytype]:checked', form).val();
                switch (monthlyType) {

                case 'DAYOFMONTH':
                    day = $('select[name=rimonthlydayofmonthday]', form).val();
                    result += ';BYMONTHDAY=' + day;
                    human += ', ' + conf.i18n.monthlyDayOfMonth1Human + ' ' + day + ' ' + conf.i18n.monthlyDayOfMonth2;
                    break;
                case 'WEEKDAYOFMONTH':
                    index = $('select[name=rimonthlyweekdayofmonthindex]', form).val();
                    day = $('select[name=rimonthlyweekdayofmonth]', form).val();
                    if ($.inArray(day, ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']) > -1) {
                        result += ';BYDAY=' + index + day;
                        human += ', ' + conf.i18n.monthlyWeekdayOfMonth1Human + ' ';
                        human += ' ' + conf.i18n.orderIndexes[$.inArray(index, conf.orderIndexes)];
                        human += ' ' + conf.i18n.monthlyWeekdayOfMonth2;
                        human += ' ' + conf.i18n.weekdays[$.inArray(day, conf.weekdays)];
                        human += ' ' + conf.i18n.monthlyDayOfMonth2;
                    }
                    break;
                }
                break;

            case 'riyearlyinterval':
                interval = field.find('input[name=riyearlyinterval]').val();
                if (interval !== '1') {
                    result += ';INTERVAL=' + interval;
                }
                human = interval + ' ' + conf.i18n.yearlyInterval2;
                break;

            case 'riyearlyoptions':
                yearlyType = $('input[name=riyearlyType]:checked', form).val();
                switch (yearlyType) {

                case 'DAYOFMONTH':
                    month = $('select[name=riyearlydayofmonthmonth]', form).val();
                    day = $('select[name=riyearlydayofmonthday]', form).val();
                    result += ';BYMONTH=' + month;
                    result += ';BYMONTHDAY=' + day;
                    human += ', ' + conf.i18n.yearlyDayOfMonth1Human + ' ' + conf.i18n.months[month - 1] + ' ' + day;
                    break;
                case 'WEEKDAYOFMONTH':
                    index = $('select[name=riyearlyweekdayofmonthindex]', form).val();
                    day = $('select[name=riyearlyweekdayofmonthday]', form).val();
                    month = $('select[name=riyearlyweekdayofmonthmonth]', form).val();
                    result += ';BYMONTH=' + month;
                    if ($.inArray(day, ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']) > -1) {
                        result += ';BYDAY=' + index + day;
                        human += ', ' + conf.i18n.yearlyWeekdayOfMonth1Human;
                        human += ' ' + conf.i18n.orderIndexes[$.inArray(index, conf.orderIndexes)];
                        human += ' ' + conf.i18n.yearlyWeekdayOfMonth2;
                        human += ' ' + conf.i18n.weekdays[$.inArray(day, conf.weekdays)];
                        human += ' ' + conf.i18n.yearlyWeekdayOfMonth3;
                        human += ' ' + conf.i18n.months[month - 1];
                        human += ' ' + conf.i18n.yearlyWeekdayOfMonth4;
                    }
                    break;
                }
                break;

            case 'rirangeoptions':
                var rangeType = form.find('input[name=rirangetype]:checked').val();
                switch (rangeType) {

                case 'BYOCCURRENCES':
                    occurrences = form.find('input[name=rirangebyoccurrencesvalue]').val();
                    result += ';COUNT=' + occurrences;
                    human += ', ' + conf.i18n.rangeByOccurrences1Human;
                    human += ' ' + occurrences;
                    human += ' ' + conf.i18n.rangeByOccurrences2;
                    break;
                case 'BYENDDATE':
                    field = form.find('input[name=rirangebyenddatecalendar]');
                    date = field.data('dateinput').getValue('yyyymmdd');
                    result += ';UNTIL=' + date + 'T000000';
                    if (tz === true) {
                        // Make it UTC:
                        result += 'Z';
                    }
                    human += ', ' + conf.i18n.rangeByEndDateHuman;
                    human += ' ' + field.data('dateinput').getValue(conf.i18n.longDateFormat);
                    break;
                }
                break;
            }
        }

        if (form.ical.RDATE !== undefined && form.ical.RDATE.length > 0) {
            form.ical.RDATE.sort();
            tmp = [];
            for (i = 0; i < form.ical.RDATE.length; i++) {
                if (form.ical.RDATE[i] !== '') {
                    year = parseInt(form.ical.RDATE[i].substring(0, 4), 10);
                    month = parseInt(form.ical.RDATE[i].substring(4, 6), 10) - 1;
                    day = parseInt(form.ical.RDATE[i].substring(6, 8), 10);
                    tmp.push(format(new Date(year, month, day), conf.i18n.longDateFormat, conf));
                }
            }
            if (tmp.length !== 0) {
                human = human + conf.i18n.including + ' ' + tmp.join('; ');
            }
        }

        if (form.ical.EXDATE !== undefined && form.ical.EXDATE.length > 0) {
            form.ical.EXDATE.sort();
            tmp = [];
            for (i = 0; i < form.ical.EXDATE.length; i++) {
                if (form.ical.EXDATE[i] !== '') {
                    year = parseInt(form.ical.EXDATE[i].substring(0, 4), 10);
                    month = parseInt(form.ical.EXDATE[i].substring(4, 6), 10) - 1;
                    day = parseInt(form.ical.EXDATE[i].substring(6, 8), 10);
                    tmp.push(format(new Date(year, month, day), conf.i18n.longDateFormat, conf));
                }
            }
            if (tmp.length !== 0) {
                human = human + conf.i18n.except + ' ' + tmp.join('; ');
            }
        }
        result = 'RRULE:' + result;
        if (form.ical.EXDATE !== undefined && form.ical.EXDATE.join() !== "") {
            tmp = $.map(form.ical.EXDATE, function (x) {
                if (x.length === 8) { // DATE format. Make it DATE-TIME
                    x += 'T000000';
                }
                if (tz === true) {
                    // Make it UTC:
                    x += 'Z';
                }
                return x;
            });
            result = result + '\nEXDATE:' + tmp;
        }
        if (form.ical.RDATE !== undefined && form.ical.RDATE.join() !== "") {
            tmp = $.map(form.ical.RDATE, function (x) {
                if (x.length === 8) { // DATE format. Make it DATE-TIME
                    x += 'T000000';
                }
                if (tz === true) {
                    // Make it UTC:
                    x += 'Z';
                }
                return x;
            });
            result = result + '\nRDATE:' + tmp;
        }
        return {result: result, description: human};
    }

    function parseLine(icalline) {
        var result = {};
        var pos = icalline.indexOf(':');
        var property = icalline.substring(0, pos);
        result.value = icalline.substring(pos + 1);

        if (property.indexOf(';') !== -1) {
            pos = property.indexOf(';');
            result.parameters = property.substring(pos + 1);
            result.property = property.substring(0, pos);
        } else {
            result.parameters = null;
            result.property = property;
        }
        return result;
    }

    function cleanDates(dates) {
        // Get rid of timezones
        // TODO: We could parse dates and range here, maybe?
        var result = [];
        var splitDates = dates.split(',');
        var date;

        for (date in splitDates) {
            if (splitDates.hasOwnProperty(date)) {
                if (splitDates[date].indexOf('Z') !== -1) {
                    result.push(splitDates[date].substring(0, 15));
                } else {
                    result.push(splitDates[date]);
                }
            }
        }
        return result;
    }

    function parseIcal(icaldata) {
        var lines = [];
        var result = {};
        var propAndValue = [];
        var line = null;
        var nextline;

        lines = icaldata.split('\n');
        lines.reverse();
        while (true) {
            if (lines.length > 0) {
                nextline = lines.pop();
                if (nextline.charAt(0) === ' ' || nextline.charAt(0) === '\t') {
                    // Line continuation:
                    line = line + nextline;
                    continue;
                }
            } else {
                nextline = '';
            }

            // New line; the current one is finished, add it to the result.
            if (line !== null) {
                line = parseLine(line);
                 // We ignore properties for now
                if (line.property === 'RDATE' || line.property === 'EXDATE') {
                    result[line.property] = cleanDates(line.value);
                } else {
                    result[line.property] = line.value;
                }
            }

            line = nextline;
            if (line === '') {
                break;
            }
        }
        return result;
    }

    function widgetLoadFromRfc5545(form, conf, icaldata, force) {
        var unsupportedFeatures = [];
        var i, matches, match, matchIndex, rtemplate, d, input, index;
        var selector, selectors, field, radiobutton, start, end;
        var interval, byday, bymonth, bymonthday, count, until;
        var day, month, year, weekday, ical;

        form.ical = parseIcal(icaldata);
        if (form.ical.RRULE === undefined) {
            unsupportedFeatures.push(conf.i18n.noRule);
            if (!force) {
                return -1; // Fail!
            }
        } else {


            matches = /INTERVAL=([0-9]+);?/.exec(form.ical.RRULE);
            if (matches) {
                interval = matches[1];
            } else {
                interval = '1';
            }

            matches = /BYDAY=([^;]+);?/.exec(form.ical.RRULE);
            if (matches) {
                byday = matches[1];
            } else {
                byday = '';
            }

            matches = /BYMONTHDAY=([^;]+);?/.exec(form.ical.RRULE);
            if (matches) {
                bymonthday = matches[1].split(",");
            } else {
                bymonthday = null;
            }

            matches = /BYMONTH=([^;]+);?/.exec(form.ical.RRULE);
            if (matches) {
                bymonth = matches[1].split(",");
            } else {
                bymonth = null;
            }

            matches = /COUNT=([0-9]+);?/.exec(form.ical.RRULE);
            if (matches) {
                count = matches[1];
            } else {
                count = null;
            }

            matches = /UNTIL=([0-9T]+);?/.exec(form.ical.RRULE);
            if (matches) {
                until = matches[1];
            } else {
                until = null;
            }

            matches = /BYSETPOS=([^;]+);?/.exec(form.ical.RRULE);
            if (matches) {
                unsupportedFeatures.push(conf.i18n.bysetpos);
            }

            // Find the best rule:
            match = '';
            matchIndex = null;
            for (i in conf.rtemplate) {
                if (conf.rtemplate.hasOwnProperty(i)) {
                    rtemplate = conf.rtemplate[i];
                    if (form.ical.RRULE.indexOf(rtemplate.rrule) === 0) {
                        if (form.ical.RRULE.length > match.length) {
                            // This is the best match so far
                            match = form.ical.RRULE;
                            matchIndex = i;
                        }
                    }
                }
            }

            if (match) {
                rtemplate = conf.rtemplate[matchIndex];
                // Set the selector:
                selector = form.find('select[name=rirtemplate]').val(matchIndex);
            } else {
                for (rtemplate in conf.rtemplate) {
                    if (conf.rtemplate.hasOwnProperty(rtemplate)) {
                        rtemplate = conf.rtemplate[rtemplate];
                        break;
                    }
                }
                unsupportedFeatures.push(conf.i18n.noTemplateMatch);
            }

            for (i = 0; i < rtemplate.fields.length; i++) {
                field = form.find('#' + rtemplate.fields[i]);
                switch (field.attr('id')) {

                case 'ridailyinterval':
                    field.find('input[name=ridailyinterval]').val(interval);
                    break;

                case 'riweeklyinterval':
                    field.find('input[name=riweeklyinterval]').val(interval);
                    break;

                case 'riweeklyweekdays':
                    byday = byday.split(",");
                    for (d = 0; d < conf.weekdays.length; d++) {
                        day = conf.weekdays[d];
                        input = field.find('input[name=riweeklyweekdays' + day + ']');
                        input.attr('checked', $.inArray(day, byday) !== -1);
                    }
                    break;

                case 'rimonthlyinterval':
                    field.find('input[name=rimonthlyinterval]').val(interval);
                    break;

                case 'rimonthlyoptions':
                    var monthlyType = 'DAYOFMONTH'; // Default to using BYMONTHDAY

                    if (bymonthday) {
                        monthlyType = 'DAYOFMONTH';
                        if (bymonthday.length > 1) {
                            // No support for multiple days in one month
                            unsupportedFeatures.push(conf.i18n.multipleDayOfMonth);
                            // Just keep the first
                            bymonthday = bymonthday[0];
                        }
                        field.find('select[name=rimonthlydayofmonthday]').val(bymonthday);
                    }

                    if (byday) {
                        monthlyType = 'WEEKDAYOFMONTH';

                        if (byday.indexOf(',') !== -1) {
                            // No support for multiple days in one month
                            unsupportedFeatures.push(conf.i18n.multipleDayOfMonth);
                            byday = byday.split(",")[0];
                        }
                        index = byday.slice(0, -2);
                        if (index.charAt(0) !== '+' && index.charAt(0) !== '-') {
                            index = '+' + index;
                        }
                        weekday = byday.slice(-2);
                        field.find('select[name=rimonthlyweekdayofmonthindex]').val(index);
                        field.find('select[name=rimonthlyweekdayofmonth]').val(weekday);
                    }

                    selectors = field.find('input[name=rimonthlytype]');
                    for (index = 0; index < selectors.length; index++) {
                        radiobutton = selectors[index];
                        $(radiobutton).attr('checked', radiobutton.value === monthlyType);
                    }
                    break;

                case 'riyearlyinterval':
                    field.find('input[name=riyearlyinterval]').val(interval);
                    break;

                case 'riyearlyoptions':
                    var yearlyType = 'DAYOFMONTH'; // Default to using BYMONTHDAY

                    if (bymonthday) {
                        yearlyType = 'DAYOFMONTH';
                        if (bymonthday.length > 1) {
                            // No support for multiple days in one month
                            unsupportedFeatures.push(conf.i18n.multipleDayOfMonth);
                            bymonthday = bymonthday[0];
                        }
                        field.find('select[name=riyearlydayofmonthmonth]').val(bymonth);
                        field.find('select[name=riyearlydayofmonthday]').val(bymonthday);
                    }

                    if (byday) {
                        yearlyType = 'WEEKDAYOFMONTH';

                        if (byday.indexOf(',') !== -1) {
                            // No support for multiple days in one month
                            unsupportedFeatures.push(conf.i18n.multipleDayOfMonth);
                            byday = byday.split(",")[0];
                        }
                        index = byday.slice(0, -2);
                        if (index.charAt(0) !== '+' && index.charAt(0) !== '-') {
                            index = '+' + index;
                        }
                        weekday = byday.slice(-2);
                        field.find('select[name=riyearlyweekdayofmonthindex]').val(index);
                        field.find('select[name=riyearlyweekdayofmonthday]').val(weekday);
                        field.find('select[name=riyearlyweekdayofmonthmonth]').val(bymonth);
                    }

                    selectors = field.find('input[name=riyearlyType]');
                    for (index = 0; index < selectors.length; index++) {
                        radiobutton = selectors[index];
                        $(radiobutton).attr('checked', radiobutton.value === yearlyType);
                    }
                    break;

                case 'rirangeoptions':
                    var rangeType = 'NOENDDATE';

                    if (count) {
                        rangeType = 'BYOCCURRENCES';
                        field.find('input[name=rirangebyoccurrencesvalue]').val(count);
                    }

                    if (until) {
                        rangeType = 'BYENDDATE';
                        input = field.find('input[name=rirangebyenddatecalendar]');
                        year = until.slice(0, 4);
                        month = until.slice(4, 6);
                        month = parseInt(month, 10) - 1;
                        day = until.slice(6, 8);
                        input.data('dateinput').setValue(new Date(year, month, day));
                    }

                    selectors = field.find('input[name=rirangetype]');
                    for (index = 0; index <  selectors.length; index++) {
                        radiobutton = selectors[index];
                        $(radiobutton).attr('checked', radiobutton.value === rangeType);
                    }
                    break;
                }
            }
        }

        var messagearea = form.find('#messagearea');
        if (unsupportedFeatures.length !== 0) {
            messagearea.text(conf.i18n.unsupportedFeatures + ' ' + unsupportedFeatures.join('; '));
            messagearea.show();
            return 1;
        } else {
            messagearea.text('');
            messagearea.hide();
            return 0;
        }

    }

    /**
     * RecurrenceInput - form, display and tools for recurrenceinput widget
     */
    function RecurrenceInput(conf, textarea) {

        var self = this;
        var form, display;

        // Extend conf with non-configurable data used by templates.
        var orderedWeekdays = [];
        var index, i;
        for (i = 0; i < 7; i++) {
            index = i + conf.firstDay;
            if (index > 6) {
                index = index - 7;
            }
            orderedWeekdays.push(index);
        }

        $.extend(conf, {
            orderIndexes: ['+1', '+2', '+3', '+4', '-1'],
            weekdays: ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'],
            orderedWeekdays: orderedWeekdays
        });

        // The recurrence type dropdown should show certain fields depending
        // on selection:
        function displayFields(selector) {
            var i;
            // First hide all the fields
            form.find('.rifield').hide();
            // Then show the ones that should be shown.
            var value = selector.val();
            if (value) {
                var rtemplate = conf.rtemplate[value];
                for (i = 0; i < rtemplate.fields.length; i++) {
                    form.find('#' + rtemplate.fields[i]).show();
                }
            }
        }

        function occurrenceExclude(event) {
            event.preventDefault();
            if (form.ical.EXDATE === undefined) {
                form.ical.EXDATE = [];
            }
            form.ical.EXDATE.push(this.attributes.date.value);
            var $this = $(this);
            $this.attr('class', 'exdate');
            $this.parent().parent().addClass('exdate');
            $this.unbind(event);
            $this.click(occurrenceInclude); // Jslint warns here, but that's OK.
        }

        function occurrenceInclude(event) {
            event.preventDefault();
            form.ical.EXDATE.splice($.inArray(this.attributes.date.value, form.ical.EXDATE), 1);
            var $this = $(this);
            $this.attr('class', 'rrule');
            $this.parent().parent().removeClass('exdate');
            $this.unbind(event);
            $this.click(occurrenceExclude);
        }

        function occurrenceDelete(event) {
            event.preventDefault();
            form.ical.RDATE.splice($.inArray(this.attributes.date.value, form.ical.RDATE), 1);
            $(this).parent().parent().hide('slow', function () {
                $(this).remove();
            });
        }

        function occurrenceAdd(event) {
            event.preventDefault();
            var dateinput = form
                .find('.riaddoccurrence input#adddate')
                .data('dateinput');
            var datevalue = dateinput.getValue('yyyymmddT000000');
            if (form.ical.RDATE === undefined) {
                form.ical.RDATE = [];
            }
            var errorarea = form.find('.riaddoccurrence div.errorarea');
            errorarea.text('');
            errorarea.hide();

            // Add date only if it is not already in RDATE
            if ($.inArray(datevalue, form.ical.RDATE) === -1) {
                form.ical.RDATE.push(datevalue);
                var html = ['<div class="occurrence rdate" style="display: none;">',
                        '<span class="rdate">',
                            dateinput.getValue(conf.i18n.longDateFormat),
                            '<span class="rlabel">' + conf.i18n.additionalDate + '</span>',
                        '</span>',
                        '<span class="action">',
                            '<a date="' + datevalue + '" href="#" class="rdate" >',
                                'Include',
                            '</a>',
                        '</span>',
                        '</div>'].join('\n');
                form.find('div.rioccurrences').prepend(html);
                $(form.find('div.rioccurrences div')[0]).slideDown();
                $(form.find('div.rioccurrences .action a.rdate')[0]).click(occurrenceDelete);
            } else {
                errorarea.text(conf.i18n.alreadyAdded).show();
            }
        }

        // element is where to find the tag in question. Can be the form
        // or the display widget. Defaults to the form.
        function loadOccurrences(startdate, rfc5545, start, readonly) {
            var element, occurrenceDiv;

            if (!readonly) {
                element = form;
            } else {
                element = display;
            }

            occurrenceDiv = element.find('.rioccurrences');
            occurrenceDiv.hide();

            var year, month, day;
            year = startdate.getFullYear();
            month = startdate.getMonth() + 1;
            day = startdate.getDate();

            var data = {year: year,
                       month: month, // Sending January as 0? I think not.
                       day: day,
                       rrule: rfc5545,
                       format: conf.i18n.longDateFormat,
                       start: start};

            var dict = {
                url: conf.ajaxURL,
                async: false, // Can't be tested if it's asynchronous, annoyingly.
                type: 'post',
                dataType: 'json',
                contentType: conf.ajaxContentType,
                cache: false,
                data: data,
                success: function (data, status, jqXHR) {
                    var result, element;

                    if (!readonly) {
                        element = form;
                    } else {
                        element = display;
                    }
                    data.readOnly = readonly;
                    data.i18n = conf.i18n;

                    // Format dates:
                    var occurrence, date, y, m, d, each;
                    for (each in data.occurrences) {
                        if (data.occurrences.hasOwnProperty(each)) {
                            occurrence = data.occurrences[each];
                            date = occurrence.date;
                            y = parseInt(date.substring(0, 4), 10);
                            m = parseInt(date.substring(4, 6), 10) - 1; // jan=0
                            d = parseInt(date.substring(6, 8), 10);
                            occurrence.formattedDate = format(new Date(y, m, d), conf.i18n.longDateFormat, conf);
                        }
                    }

                    result = $.tmpl('occurrenceTmpl', data);
                    occurrenceDiv = element.find('.rioccurrences');
                    occurrenceDiv.replaceWith(result);

                    // Add the batch actions:
                    element.find('.rioccurrences .batching a').click(
                        function (event) {
                            event.preventDefault();
                            loadOccurrences(startdate, rfc5545, this.attributes.start.value, readonly);
                        }
                    );

                    // Add the delete/undelete actions:
                    if (!readonly) {
                        element.find('.rioccurrences .action a.rrule').click(occurrenceExclude);
                        element.find('.rioccurrences .action a.exdate').click(occurrenceInclude);
                        element.find('.rioccurrences .action a.rdate').click(occurrenceDelete);
                    }
                    // Show the new div
                    element.find('.rioccurrences').show();
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    alert(textStatus);
                }
            };

            $.ajax(dict);
        }

        function getField(field) {
            // See if it is a field already
            var realField = $(field);
            if (!realField.length) {
                // Otherwise, we assume it's an id:
                realField = $('#' + field);
            }
            if (!realField.length) {
                // Still not? Then it's a name.
                realField = $("input[name='" + field + "']");
            }
            return realField;
        }
        function findStartDate() {
            var startdate = null;
            var startField, startFieldYear, startFieldMonth, startFieldDay;

            // Find the default byday and bymonthday from the start date, if any:
            if (conf.startField) {
                startField = getField(conf.startField);
                if (!startField.length) {
                    // Field not found
                    return null;
                }
                // Now we have a field, see if it is a dateinput field:
                startdate = startField.data('dateinput');
                if (!startdate) {
                    //No, it wasn't, just try to interpret it with Date()
                    startdate = startField.val();
                    if (startdate === "") {
                        // Probably not an input at all. Try to see if it contains a date
                        startdate = startField.text();
                    }
                } else {
                    // Yes it was, get the date:
                    startdate = startdate.getValue();
                }

                if (typeof startdate === 'string') {
                    // convert human readable, non ISO8601 dates, like
                    // '2014-04-24 19:00', where the 'T' separator is missing.
                    startdate = startdate.replace(' ', 'T');
                }

                startdate = new Date(startdate);
            } else if (conf.startFieldYear &&
                       conf.startFieldMonth &&
                       conf.startFieldDay) {
                startFieldYear = getField(conf.startFieldYear);
                startFieldMonth = getField(conf.startFieldMonth);
                startFieldDay = getField(conf.startFieldDay);
                if (!startFieldYear.length &&
                    !startFieldMonth.length &&
                    !startFieldDay.length) {
                    // Field not found
                    return null;
                }
                startdate = new Date(startFieldYear.val(),
                                     startFieldMonth.val() - 1,
                                     startFieldDay.val());
            }
            if (startdate === null) {
                return null;
            }
            // We have some sort of startdate:
            if (isNaN(startdate)) {
                return null;
            }
            return startdate;
        }
        function findEndDate(form) {
            var endField, enddate;

            endField = form.find('input[name=rirangebyenddatecalendar]');

            // Now we have a field, see if it is a dateinput field:
            enddate = endField.data('dateinput');
            if (!enddate) {
                //No, it wasn't, just try to interpret it with Date()
                enddate = endField.val();
            } else {
                // Yes it was, get the date:
                enddate = enddate.getValue();
            }
            enddate = new Date(enddate);

            // if the end date is incorrect or the field is left empty
            if (isNaN(enddate) || endField.val() === "") {
                return null;
            }
            return enddate;
        }
        function findIntField(fieldName, form) {
            var field, num, isInt;

            field = form.find('input[name=' + fieldName + ']');

            num = field.val();

            // if it's not a number or the field is left empty
            if (isNaN(num) || (num.toString().indexOf('.') !== -1) || field.val() === "") {
                return null;
            }
            return num;
        }

        // Loading (populating) display and form widget with
        // passed RFC5545 string (data)
        function loadData(rfc5545) {
            var selector, format, startdate, dayindex, day;

            if (rfc5545) {
                widgetLoadFromRfc5545(form, conf, rfc5545, true);
            }

            startdate = findStartDate();

            if (startdate !== null) {
                // If the date is a real date, set the defaults in the form
                form.find('select[name=rimonthlydayofmonthday]').val(startdate.getDate());
                dayindex = conf.orderIndexes[Math.floor((startdate.getDate() - 1) / 7)];
                day = conf.weekdays[startdate.getDay()];
                form.find('select[name=rimonthlyweekdayofmonthindex]').val(dayindex);
                form.find('select[name=rimonthlyweekdayofmonth]').val(day);

                form.find('select[name=riyearlydayofmonthmonth]').val(startdate.getMonth() + 1);
                form.find('select[name=riyearlydayofmonthday]').val(startdate.getDate());
                form.find('select[name=riyearlyweekdayofmonthindex]').val(dayindex);
                form.find('select[name=riyearlyweekdayofmonthday]').val(day);
                form.find('select[name=riyearlyweekdayofmonthmonth]').val(startdate.getMonth() + 1);

                // Now when we have a start date, we can also do an ajax call to calculate occurrences:
                loadOccurrences(startdate, widgetSaveToRfc5545(form, conf, false).result, 0, false);

                // Show the add and refresh buttons:
                form.find('div.rioccurrencesactions').show();

            } else {
                // No EXDATE/RDATE support
                form.find('div.rioccurrencesactions').hide();
            }


            selector = form.find('select[name=rirtemplate]');
            displayFields(selector);
        }

        function recurrenceOn() {
            var RFC5545 = widgetSaveToRfc5545(form, conf, false);
            var label = display.find('label[class=ridisplay]');
            label.text(conf.i18n.displayActivate + ' ' + RFC5545.description);
            textarea.val(RFC5545.result).change();
            var startdate = findStartDate();
            if (startdate !== null) {
                loadOccurrences(startdate, widgetSaveToRfc5545(form, conf, false).result, 0, true);
            }
            display.find('button[name="riedit"]').text(conf.i18n.edit_rules);
            display.find('button[name="ridelete"]').show();
        }

        function recurrenceOff() {
            var label = display.find('label[class=ridisplay]');
            label.text(conf.i18n.displayUnactivate);
            textarea.val('').change();  // Clear the textarea.
            display.find('.rioccurrences').hide();
            display.find('button[name="riedit"]').text(conf.i18n.add_rules);
            display.find('button[name="ridelete"]').hide();
        }

        function checkFields(form) {
            var startDate, endDate, num, messagearea;
            startDate = findStartDate();

            // Hide any error message from before
            messagearea = form.find('#messagearea');
            messagearea.text('');
            messagearea.hide();

            // Hide add field errors
            form.find('.riaddoccurrence div.errorarea').text('').hide();

            // Repeats Daily
            if (form.find('#ridailyinterval').css('display') === 'block') {
                // Check repeat every field
                num = findIntField('ridailyinterval', form);
                if (!num || num < 1 || num > 1000) {
                    messagearea.text(conf.i18n.noRepeatEvery).show();
                    return false;
                }
            }

            // Repeats Weekly
            if (form.find('#riweeklyinterval').css('display') === 'block') {
                // Check repeat every field
                num = findIntField('riweeklyinterval', form);
                if (!num || num < 1 || num > 1000) {
                    messagearea.text(conf.i18n.noRepeatEvery).show();
                    return false;
                }
            }

            // Repeats Monthly
            if (form.find('#rimonthlyinterval').css('display') === 'block') {
                // Check repeat every field
                num = findIntField('rimonthlyinterval', form);
                if (!num || num < 1 || num > 1000) {
                    messagearea.text(conf.i18n.noRepeatEvery).show();
                    return false;
                }

                // Check repeat on
                if (form.find('#rimonthlyoptions input:checked').length === 0) {
                    messagearea.text(conf.i18n.noRepeatOn).show();
                    return false;
                }
            }

            // Repeats Yearly
            if (form.find('#riyearlyinterval').css('display') === 'block') {
                // Check repeat every field
                num = findIntField('riyearlyinterval', form);
                if (!num || num < 1 || num > 1000) {
                    messagearea.text(conf.i18n.noRepeatEvery).show();
                    return false;
                }

                // Check repeat on
                if (form.find('#riyearlyoptions input:checked').length === 0) {
                    messagearea.text(conf.i18n.noRepeatOn).show();
                    return false;
                }
            }

            // End recurrence fields

            // If after N occurences is selected, check its value
            if (form.find('input[value="BYOCCURRENCES"]:visible:checked').length > 0) {
                num = findIntField('rirangebyoccurrencesvalue', form);
                if (!num || num < 1 || num > 1000) {
                    messagearea.text(conf.i18n.noEndAfterNOccurrences).show();
                    return false;
                }
            }

            // If end date is selected, check its value
            if (form.find('input[value="BYENDDATE"]:visible:checked').length > 0) {
                endDate = findEndDate(form);
                if (!endDate) {
                    // if endDate is null that means the field is empty
                    messagearea.text(conf.i18n.noEndDate).show();
                    return false;
                } else if (endDate < startDate) {
                    // the end date cannot be before start date
                    messagearea.text(conf.i18n.pastEndDate).show();
                    return false;
                }
            }

            return true;
        }

        function save(event) {
            event.preventDefault();
            // if no field errors, process the request
            if (checkFields(form)) {
                // close overlay
                form.overlay().close();
                recurrenceOn();
            }
        }

        function cancel(event) {
            event.preventDefault();
            // close overlay
            form.overlay().close();
        }

        function updateOccurances() {
            var startDate;
            startDate = findStartDate();

            // if no field errors, process the request
            if (checkFields(form)) {
                loadOccurrences(startDate,
                    widgetSaveToRfc5545(form, conf, false).result,
                    0,
                    false);
            }
        }

        /*
          Load the templates
        */

        display = $.tmpl('displayTmpl', conf);
        form = $.tmpl('formTmpl', conf);

        // Make an overlay and hide it
        form.overlay(conf.formOverlay).hide();
        form.ical = {RDATE: [], EXDATE: []};

        $.tools.dateinput.localize(conf.lang,  {
            months:      LABELS[conf.lang].months.join(),
            shortMonths: LABELS[conf.lang].shortMonths.join(),
            days:        LABELS[conf.lang].weekdays.join(),
            shortDays:   LABELS[conf.lang].shortWeekdays.join()
        });

        // Make the date input into a calendar dateinput()
        form.find('input[name=rirangebyenddatecalendar]').dateinput({
            selectors: true,
            lang: conf.lang,
            format: conf.i18n.shortDateFormat,
            firstDay: conf.firstDay,
            yearRange: [-5, 10]
        }).data('dateinput').setValue(new Date());

        if (textarea.val()) {
            var result = widgetLoadFromRfc5545(form, conf, textarea.val(), false);
            if (result === -1) {
                var label = display.find('label[class=ridisplay]');
                label.text(conf.i18n.noRule);
            } else {
                recurrenceOn();
            }
        }

        /*
          Do all the GUI stuff:
        */

        // When you click "Delete...", the recurrence rules should be cleared.
        display.find('button[name=ridelete]').click(function (e) {
            e.preventDefault();
            recurrenceOff();
        });

        // Show form overlay when you click on the "Edit..." link
        display.find('button[name=riedit]').click(
            function (e) {
                // Load the form to set up the right fields to show, etc.
                loadData(textarea.val());
                e.preventDefault();
                form.overlay().load();
            }
        );

        // Pop up the little add form when clicking "Add"
        form.find('div.riaddoccurrence input#adddate').dateinput({
            selectors: true,
            lang: conf.lang,
            format: conf.i18n.shortDateFormat,
            firstDay: conf.firstDay,
            yearRange: [-5, 10]
        }).data('dateinput').setValue(new Date());
        form.find('input#addaction').click(occurrenceAdd);

        // When the reload button is clicked, reload
        form.find('a.rirefreshbutton').click(
            function (event) {
                event.preventDefault();
                updateOccurances();
            }
        );

        // When selecting template, update what fieldsets are visible.
        form.find('select[name=rirtemplate]').change(
            function (e) {
                displayFields($(this));
            }
        );

        // When focus goes to a drop-down, select the relevant radiobutton.
        form.find('select').change(
            function (e) {
                $(this).parent().find('> input').click().change();
            }
        );
        form.find('input[name=rirangebyoccurrencesvalue]').change(
            function (e) {
                $(this).parent().find('input[name=rirangetype]').click().change();
            }
        );
        form.find('input[name=rirangebyenddatecalendar]').change(function () {
            // Update only if the occurances are shown
            $(this).parent().find('input[name=rirangetype]').click();
            if (form.find('.rioccurrencesactions:visible').length !== 0) {
                updateOccurances();
            }
        });
        // Update the selected dates section
        form.find('input:radio, .riweeklyweekday > input, input[name=ridailyinterval], input[name=riweeklyinterval], input[name=rimonthlyinterval], input[name=riyearlyinterval]').change(
            function (e) {
                // Update only if the occurances are shown
                if (form.find('.rioccurrencesactions:visible').length !== 0) {
                    updateOccurances();
                }
            }
        );

        /*
          Save and cancel methods:
        */
        form.find('.ricancelbutton').click(cancel);
        form.find('.risavebutton').click(save);

        /*
         * Public API of RecurrenceInput
         */

        $.extend(self, {
            display: display,
            form: form,
            loadData: loadData, //Used by tests.
            save: save //Used by tests.
        });

    }


    /*
     * jQuery plugin implementation
     */
    $.fn.recurrenceinput = function (conf) {
        if (this.data('recurrenceinput')) {
            // plugin already installed
            return this.data('recurrenceinput');
        }

        // "compile" configuration for widget
        var config = $.extend({}, tool.conf);
        $.extend(config, conf);
        $.extend(config, {i18n: LABELS[config.lang], name: this.attr('name')});

        // our recurrenceinput widget instance
        var recurrenceinput = new RecurrenceInput(config, this);
        // hide textarea and place display widget after textarea
        recurrenceinput.form.appendTo('body');
        this.after(recurrenceinput.display);

        // hide the textarea
        this.hide();

        // save the data for next call
        this.data('recurrenceinput', recurrenceinput);
        return recurrenceinput;
    };

}(jQuery));


  }).apply(root, arguments);
});
}(this));

/* Recurrence pattern.
 *
 * Options:
 *    localization(object): Customizations to locatizations. Default to null
 *    configuration(object): recurrent input widget configuration
 *
 * Documentation:
 *
 *    # Simple
 *
 *    {{ example-1 }}
 *
 * Example: example-1
 *    <textarea class="pat-recurrence"></textarea>
 *
 *
 */


define('mockup-patterns-recurrence',[
  'jquery',
  'pat-base',
  'jquery.recurrenceinput'
], function($, Base) {
  'use strict';

  var Recurrence = Base.extend({
    name: 'recurrence',
    trigger: '.pat-recurrence',
    parser: 'mockup',
    defaults: {
      // just passed onto the widget
      language: 'en',
      localization: null,
      configuration: {}
    },
    init: function() {
      this.$el.addClass('recurrence-widget');
      if (this.options.localization) {
        $.tools.recurrenceinput.localize(this.options.language, this.options.localization);
      }
      this.$el.recurrenceinput(this.options.configuration);
    }
  });

  return Recurrence;

});

(function(root) {
define("select2", [], function() {
  return (function() {
/*
Copyright 2012 Igor Vaynberg

Version: 3.5.4 Timestamp: Sun Aug 30 13:30:32 EDT 2015

This software is licensed under the Apache License, Version 2.0 (the "Apache License") or the GNU
General Public License version 2 (the "GPL License"). You may choose either license to govern your
use of this software only upon the condition that you accept all of the terms of either the Apache
License or the GPL License.

You may obtain a copy of the Apache License and the GPL License at:

    http://www.apache.org/licenses/LICENSE-2.0
    http://www.gnu.org/licenses/gpl-2.0.html

Unless required by applicable law or agreed to in writing, software distributed under the
Apache License or the GPL License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
CONDITIONS OF ANY KIND, either express or implied. See the Apache License and the GPL License for
the specific language governing permissions and limitations under the Apache License and the GPL License.
*/
(function ($) {
    if(typeof $.fn.each2 == "undefined") {
        $.extend($.fn, {
            /*
            * 4-10 times faster .each replacement
            * use it carefully, as it overrides jQuery context of element on each iteration
            */
            each2 : function (c) {
                var j = $([0]), i = -1, l = this.length;
                while (
                    ++i < l
                    && (j.context = j[0] = this[i])
                    && c.call(j[0], i, j) !== false //"this"=DOM, i=index, j=jQuery object
                );
                return this;
            }
        });
    }
})(jQuery);

(function ($, undefined) {
    "use strict";
    /*global document, window, jQuery, console */

    if (window.Select2 !== undefined) {
        return;
    }

    var AbstractSelect2, SingleSelect2, MultiSelect2, nextUid, sizer,
        lastMousePosition={x:0,y:0}, $document, scrollBarDimensions,

    KEY = {
        TAB: 9,
        ENTER: 13,
        ESC: 27,
        SPACE: 32,
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40,
        SHIFT: 16,
        CTRL: 17,
        ALT: 18,
        PAGE_UP: 33,
        PAGE_DOWN: 34,
        HOME: 36,
        END: 35,
        BACKSPACE: 8,
        DELETE: 46,
        isArrow: function (k) {
            k = k.which ? k.which : k;
            switch (k) {
            case KEY.LEFT:
            case KEY.RIGHT:
            case KEY.UP:
            case KEY.DOWN:
                return true;
            }
            return false;
        },
        isControl: function (e) {
            var k = e.which;
            switch (k) {
            case KEY.SHIFT:
            case KEY.CTRL:
            case KEY.ALT:
                return true;
            }

            if (e.metaKey) return true;

            return false;
        },
        isFunctionKey: function (k) {
            k = k.which ? k.which : k;
            return k >= 112 && k <= 123;
        }
    },
    MEASURE_SCROLLBAR_TEMPLATE = "<div class='select2-measure-scrollbar'></div>",

    DIACRITICS = {"\u24B6":"A","\uFF21":"A","\u00C0":"A","\u00C1":"A","\u00C2":"A","\u1EA6":"A","\u1EA4":"A","\u1EAA":"A","\u1EA8":"A","\u00C3":"A","\u0100":"A","\u0102":"A","\u1EB0":"A","\u1EAE":"A","\u1EB4":"A","\u1EB2":"A","\u0226":"A","\u01E0":"A","\u00C4":"A","\u01DE":"A","\u1EA2":"A","\u00C5":"A","\u01FA":"A","\u01CD":"A","\u0200":"A","\u0202":"A","\u1EA0":"A","\u1EAC":"A","\u1EB6":"A","\u1E00":"A","\u0104":"A","\u023A":"A","\u2C6F":"A","\uA732":"AA","\u00C6":"AE","\u01FC":"AE","\u01E2":"AE","\uA734":"AO","\uA736":"AU","\uA738":"AV","\uA73A":"AV","\uA73C":"AY","\u24B7":"B","\uFF22":"B","\u1E02":"B","\u1E04":"B","\u1E06":"B","\u0243":"B","\u0182":"B","\u0181":"B","\u24B8":"C","\uFF23":"C","\u0106":"C","\u0108":"C","\u010A":"C","\u010C":"C","\u00C7":"C","\u1E08":"C","\u0187":"C","\u023B":"C","\uA73E":"C","\u24B9":"D","\uFF24":"D","\u1E0A":"D","\u010E":"D","\u1E0C":"D","\u1E10":"D","\u1E12":"D","\u1E0E":"D","\u0110":"D","\u018B":"D","\u018A":"D","\u0189":"D","\uA779":"D","\u01F1":"DZ","\u01C4":"DZ","\u01F2":"Dz","\u01C5":"Dz","\u24BA":"E","\uFF25":"E","\u00C8":"E","\u00C9":"E","\u00CA":"E","\u1EC0":"E","\u1EBE":"E","\u1EC4":"E","\u1EC2":"E","\u1EBC":"E","\u0112":"E","\u1E14":"E","\u1E16":"E","\u0114":"E","\u0116":"E","\u00CB":"E","\u1EBA":"E","\u011A":"E","\u0204":"E","\u0206":"E","\u1EB8":"E","\u1EC6":"E","\u0228":"E","\u1E1C":"E","\u0118":"E","\u1E18":"E","\u1E1A":"E","\u0190":"E","\u018E":"E","\u24BB":"F","\uFF26":"F","\u1E1E":"F","\u0191":"F","\uA77B":"F","\u24BC":"G","\uFF27":"G","\u01F4":"G","\u011C":"G","\u1E20":"G","\u011E":"G","\u0120":"G","\u01E6":"G","\u0122":"G","\u01E4":"G","\u0193":"G","\uA7A0":"G","\uA77D":"G","\uA77E":"G","\u24BD":"H","\uFF28":"H","\u0124":"H","\u1E22":"H","\u1E26":"H","\u021E":"H","\u1E24":"H","\u1E28":"H","\u1E2A":"H","\u0126":"H","\u2C67":"H","\u2C75":"H","\uA78D":"H","\u24BE":"I","\uFF29":"I","\u00CC":"I","\u00CD":"I","\u00CE":"I","\u0128":"I","\u012A":"I","\u012C":"I","\u0130":"I","\u00CF":"I","\u1E2E":"I","\u1EC8":"I","\u01CF":"I","\u0208":"I","\u020A":"I","\u1ECA":"I","\u012E":"I","\u1E2C":"I","\u0197":"I","\u24BF":"J","\uFF2A":"J","\u0134":"J","\u0248":"J","\u24C0":"K","\uFF2B":"K","\u1E30":"K","\u01E8":"K","\u1E32":"K","\u0136":"K","\u1E34":"K","\u0198":"K","\u2C69":"K","\uA740":"K","\uA742":"K","\uA744":"K","\uA7A2":"K","\u24C1":"L","\uFF2C":"L","\u013F":"L","\u0139":"L","\u013D":"L","\u1E36":"L","\u1E38":"L","\u013B":"L","\u1E3C":"L","\u1E3A":"L","\u0141":"L","\u023D":"L","\u2C62":"L","\u2C60":"L","\uA748":"L","\uA746":"L","\uA780":"L","\u01C7":"LJ","\u01C8":"Lj","\u24C2":"M","\uFF2D":"M","\u1E3E":"M","\u1E40":"M","\u1E42":"M","\u2C6E":"M","\u019C":"M","\u24C3":"N","\uFF2E":"N","\u01F8":"N","\u0143":"N","\u00D1":"N","\u1E44":"N","\u0147":"N","\u1E46":"N","\u0145":"N","\u1E4A":"N","\u1E48":"N","\u0220":"N","\u019D":"N","\uA790":"N","\uA7A4":"N","\u01CA":"NJ","\u01CB":"Nj","\u24C4":"O","\uFF2F":"O","\u00D2":"O","\u00D3":"O","\u00D4":"O","\u1ED2":"O","\u1ED0":"O","\u1ED6":"O","\u1ED4":"O","\u00D5":"O","\u1E4C":"O","\u022C":"O","\u1E4E":"O","\u014C":"O","\u1E50":"O","\u1E52":"O","\u014E":"O","\u022E":"O","\u0230":"O","\u00D6":"O","\u022A":"O","\u1ECE":"O","\u0150":"O","\u01D1":"O","\u020C":"O","\u020E":"O","\u01A0":"O","\u1EDC":"O","\u1EDA":"O","\u1EE0":"O","\u1EDE":"O","\u1EE2":"O","\u1ECC":"O","\u1ED8":"O","\u01EA":"O","\u01EC":"O","\u00D8":"O","\u01FE":"O","\u0186":"O","\u019F":"O","\uA74A":"O","\uA74C":"O","\u01A2":"OI","\uA74E":"OO","\u0222":"OU","\u24C5":"P","\uFF30":"P","\u1E54":"P","\u1E56":"P","\u01A4":"P","\u2C63":"P","\uA750":"P","\uA752":"P","\uA754":"P","\u24C6":"Q","\uFF31":"Q","\uA756":"Q","\uA758":"Q","\u024A":"Q","\u24C7":"R","\uFF32":"R","\u0154":"R","\u1E58":"R","\u0158":"R","\u0210":"R","\u0212":"R","\u1E5A":"R","\u1E5C":"R","\u0156":"R","\u1E5E":"R","\u024C":"R","\u2C64":"R","\uA75A":"R","\uA7A6":"R","\uA782":"R","\u24C8":"S","\uFF33":"S","\u1E9E":"S","\u015A":"S","\u1E64":"S","\u015C":"S","\u1E60":"S","\u0160":"S","\u1E66":"S","\u1E62":"S","\u1E68":"S","\u0218":"S","\u015E":"S","\u2C7E":"S","\uA7A8":"S","\uA784":"S","\u24C9":"T","\uFF34":"T","\u1E6A":"T","\u0164":"T","\u1E6C":"T","\u021A":"T","\u0162":"T","\u1E70":"T","\u1E6E":"T","\u0166":"T","\u01AC":"T","\u01AE":"T","\u023E":"T","\uA786":"T","\uA728":"TZ","\u24CA":"U","\uFF35":"U","\u00D9":"U","\u00DA":"U","\u00DB":"U","\u0168":"U","\u1E78":"U","\u016A":"U","\u1E7A":"U","\u016C":"U","\u00DC":"U","\u01DB":"U","\u01D7":"U","\u01D5":"U","\u01D9":"U","\u1EE6":"U","\u016E":"U","\u0170":"U","\u01D3":"U","\u0214":"U","\u0216":"U","\u01AF":"U","\u1EEA":"U","\u1EE8":"U","\u1EEE":"U","\u1EEC":"U","\u1EF0":"U","\u1EE4":"U","\u1E72":"U","\u0172":"U","\u1E76":"U","\u1E74":"U","\u0244":"U","\u24CB":"V","\uFF36":"V","\u1E7C":"V","\u1E7E":"V","\u01B2":"V","\uA75E":"V","\u0245":"V","\uA760":"VY","\u24CC":"W","\uFF37":"W","\u1E80":"W","\u1E82":"W","\u0174":"W","\u1E86":"W","\u1E84":"W","\u1E88":"W","\u2C72":"W","\u24CD":"X","\uFF38":"X","\u1E8A":"X","\u1E8C":"X","\u24CE":"Y","\uFF39":"Y","\u1EF2":"Y","\u00DD":"Y","\u0176":"Y","\u1EF8":"Y","\u0232":"Y","\u1E8E":"Y","\u0178":"Y","\u1EF6":"Y","\u1EF4":"Y","\u01B3":"Y","\u024E":"Y","\u1EFE":"Y","\u24CF":"Z","\uFF3A":"Z","\u0179":"Z","\u1E90":"Z","\u017B":"Z","\u017D":"Z","\u1E92":"Z","\u1E94":"Z","\u01B5":"Z","\u0224":"Z","\u2C7F":"Z","\u2C6B":"Z","\uA762":"Z","\u24D0":"a","\uFF41":"a","\u1E9A":"a","\u00E0":"a","\u00E1":"a","\u00E2":"a","\u1EA7":"a","\u1EA5":"a","\u1EAB":"a","\u1EA9":"a","\u00E3":"a","\u0101":"a","\u0103":"a","\u1EB1":"a","\u1EAF":"a","\u1EB5":"a","\u1EB3":"a","\u0227":"a","\u01E1":"a","\u00E4":"a","\u01DF":"a","\u1EA3":"a","\u00E5":"a","\u01FB":"a","\u01CE":"a","\u0201":"a","\u0203":"a","\u1EA1":"a","\u1EAD":"a","\u1EB7":"a","\u1E01":"a","\u0105":"a","\u2C65":"a","\u0250":"a","\uA733":"aa","\u00E6":"ae","\u01FD":"ae","\u01E3":"ae","\uA735":"ao","\uA737":"au","\uA739":"av","\uA73B":"av","\uA73D":"ay","\u24D1":"b","\uFF42":"b","\u1E03":"b","\u1E05":"b","\u1E07":"b","\u0180":"b","\u0183":"b","\u0253":"b","\u24D2":"c","\uFF43":"c","\u0107":"c","\u0109":"c","\u010B":"c","\u010D":"c","\u00E7":"c","\u1E09":"c","\u0188":"c","\u023C":"c","\uA73F":"c","\u2184":"c","\u24D3":"d","\uFF44":"d","\u1E0B":"d","\u010F":"d","\u1E0D":"d","\u1E11":"d","\u1E13":"d","\u1E0F":"d","\u0111":"d","\u018C":"d","\u0256":"d","\u0257":"d","\uA77A":"d","\u01F3":"dz","\u01C6":"dz","\u24D4":"e","\uFF45":"e","\u00E8":"e","\u00E9":"e","\u00EA":"e","\u1EC1":"e","\u1EBF":"e","\u1EC5":"e","\u1EC3":"e","\u1EBD":"e","\u0113":"e","\u1E15":"e","\u1E17":"e","\u0115":"e","\u0117":"e","\u00EB":"e","\u1EBB":"e","\u011B":"e","\u0205":"e","\u0207":"e","\u1EB9":"e","\u1EC7":"e","\u0229":"e","\u1E1D":"e","\u0119":"e","\u1E19":"e","\u1E1B":"e","\u0247":"e","\u025B":"e","\u01DD":"e","\u24D5":"f","\uFF46":"f","\u1E1F":"f","\u0192":"f","\uA77C":"f","\u24D6":"g","\uFF47":"g","\u01F5":"g","\u011D":"g","\u1E21":"g","\u011F":"g","\u0121":"g","\u01E7":"g","\u0123":"g","\u01E5":"g","\u0260":"g","\uA7A1":"g","\u1D79":"g","\uA77F":"g","\u24D7":"h","\uFF48":"h","\u0125":"h","\u1E23":"h","\u1E27":"h","\u021F":"h","\u1E25":"h","\u1E29":"h","\u1E2B":"h","\u1E96":"h","\u0127":"h","\u2C68":"h","\u2C76":"h","\u0265":"h","\u0195":"hv","\u24D8":"i","\uFF49":"i","\u00EC":"i","\u00ED":"i","\u00EE":"i","\u0129":"i","\u012B":"i","\u012D":"i","\u00EF":"i","\u1E2F":"i","\u1EC9":"i","\u01D0":"i","\u0209":"i","\u020B":"i","\u1ECB":"i","\u012F":"i","\u1E2D":"i","\u0268":"i","\u0131":"i","\u24D9":"j","\uFF4A":"j","\u0135":"j","\u01F0":"j","\u0249":"j","\u24DA":"k","\uFF4B":"k","\u1E31":"k","\u01E9":"k","\u1E33":"k","\u0137":"k","\u1E35":"k","\u0199":"k","\u2C6A":"k","\uA741":"k","\uA743":"k","\uA745":"k","\uA7A3":"k","\u24DB":"l","\uFF4C":"l","\u0140":"l","\u013A":"l","\u013E":"l","\u1E37":"l","\u1E39":"l","\u013C":"l","\u1E3D":"l","\u1E3B":"l","\u017F":"l","\u0142":"l","\u019A":"l","\u026B":"l","\u2C61":"l","\uA749":"l","\uA781":"l","\uA747":"l","\u01C9":"lj","\u24DC":"m","\uFF4D":"m","\u1E3F":"m","\u1E41":"m","\u1E43":"m","\u0271":"m","\u026F":"m","\u24DD":"n","\uFF4E":"n","\u01F9":"n","\u0144":"n","\u00F1":"n","\u1E45":"n","\u0148":"n","\u1E47":"n","\u0146":"n","\u1E4B":"n","\u1E49":"n","\u019E":"n","\u0272":"n","\u0149":"n","\uA791":"n","\uA7A5":"n","\u01CC":"nj","\u24DE":"o","\uFF4F":"o","\u00F2":"o","\u00F3":"o","\u00F4":"o","\u1ED3":"o","\u1ED1":"o","\u1ED7":"o","\u1ED5":"o","\u00F5":"o","\u1E4D":"o","\u022D":"o","\u1E4F":"o","\u014D":"o","\u1E51":"o","\u1E53":"o","\u014F":"o","\u022F":"o","\u0231":"o","\u00F6":"o","\u022B":"o","\u1ECF":"o","\u0151":"o","\u01D2":"o","\u020D":"o","\u020F":"o","\u01A1":"o","\u1EDD":"o","\u1EDB":"o","\u1EE1":"o","\u1EDF":"o","\u1EE3":"o","\u1ECD":"o","\u1ED9":"o","\u01EB":"o","\u01ED":"o","\u00F8":"o","\u01FF":"o","\u0254":"o","\uA74B":"o","\uA74D":"o","\u0275":"o","\u01A3":"oi","\u0223":"ou","\uA74F":"oo","\u24DF":"p","\uFF50":"p","\u1E55":"p","\u1E57":"p","\u01A5":"p","\u1D7D":"p","\uA751":"p","\uA753":"p","\uA755":"p","\u24E0":"q","\uFF51":"q","\u024B":"q","\uA757":"q","\uA759":"q","\u24E1":"r","\uFF52":"r","\u0155":"r","\u1E59":"r","\u0159":"r","\u0211":"r","\u0213":"r","\u1E5B":"r","\u1E5D":"r","\u0157":"r","\u1E5F":"r","\u024D":"r","\u027D":"r","\uA75B":"r","\uA7A7":"r","\uA783":"r","\u24E2":"s","\uFF53":"s","\u00DF":"s","\u015B":"s","\u1E65":"s","\u015D":"s","\u1E61":"s","\u0161":"s","\u1E67":"s","\u1E63":"s","\u1E69":"s","\u0219":"s","\u015F":"s","\u023F":"s","\uA7A9":"s","\uA785":"s","\u1E9B":"s","\u24E3":"t","\uFF54":"t","\u1E6B":"t","\u1E97":"t","\u0165":"t","\u1E6D":"t","\u021B":"t","\u0163":"t","\u1E71":"t","\u1E6F":"t","\u0167":"t","\u01AD":"t","\u0288":"t","\u2C66":"t","\uA787":"t","\uA729":"tz","\u24E4":"u","\uFF55":"u","\u00F9":"u","\u00FA":"u","\u00FB":"u","\u0169":"u","\u1E79":"u","\u016B":"u","\u1E7B":"u","\u016D":"u","\u00FC":"u","\u01DC":"u","\u01D8":"u","\u01D6":"u","\u01DA":"u","\u1EE7":"u","\u016F":"u","\u0171":"u","\u01D4":"u","\u0215":"u","\u0217":"u","\u01B0":"u","\u1EEB":"u","\u1EE9":"u","\u1EEF":"u","\u1EED":"u","\u1EF1":"u","\u1EE5":"u","\u1E73":"u","\u0173":"u","\u1E77":"u","\u1E75":"u","\u0289":"u","\u24E5":"v","\uFF56":"v","\u1E7D":"v","\u1E7F":"v","\u028B":"v","\uA75F":"v","\u028C":"v","\uA761":"vy","\u24E6":"w","\uFF57":"w","\u1E81":"w","\u1E83":"w","\u0175":"w","\u1E87":"w","\u1E85":"w","\u1E98":"w","\u1E89":"w","\u2C73":"w","\u24E7":"x","\uFF58":"x","\u1E8B":"x","\u1E8D":"x","\u24E8":"y","\uFF59":"y","\u1EF3":"y","\u00FD":"y","\u0177":"y","\u1EF9":"y","\u0233":"y","\u1E8F":"y","\u00FF":"y","\u1EF7":"y","\u1E99":"y","\u1EF5":"y","\u01B4":"y","\u024F":"y","\u1EFF":"y","\u24E9":"z","\uFF5A":"z","\u017A":"z","\u1E91":"z","\u017C":"z","\u017E":"z","\u1E93":"z","\u1E95":"z","\u01B6":"z","\u0225":"z","\u0240":"z","\u2C6C":"z","\uA763":"z","\u0386":"\u0391","\u0388":"\u0395","\u0389":"\u0397","\u038A":"\u0399","\u03AA":"\u0399","\u038C":"\u039F","\u038E":"\u03A5","\u03AB":"\u03A5","\u038F":"\u03A9","\u03AC":"\u03B1","\u03AD":"\u03B5","\u03AE":"\u03B7","\u03AF":"\u03B9","\u03CA":"\u03B9","\u0390":"\u03B9","\u03CC":"\u03BF","\u03CD":"\u03C5","\u03CB":"\u03C5","\u03B0":"\u03C5","\u03C9":"\u03C9","\u03C2":"\u03C3"};

    $document = $(document);

    nextUid=(function() { var counter=1; return function() { return counter++; }; }());


    function reinsertElement(element) {
        var placeholder = $(document.createTextNode(''));

        element.before(placeholder);
        placeholder.before(element);
        placeholder.remove();
    }

    function stripDiacritics(str) {
        // Used 'uni range + named function' from http://jsperf.com/diacritics/18
        function match(a) {
            return DIACRITICS[a] || a;
        }

        return str.replace(/[^\u0000-\u007E]/g, match);
    }

    function indexOf(value, array) {
        var i = 0, l = array.length;
        for (; i < l; i = i + 1) {
            if (equal(value, array[i])) return i;
        }
        return -1;
    }

    function measureScrollbar () {
        var $template = $( MEASURE_SCROLLBAR_TEMPLATE );
        $template.appendTo(document.body);

        var dim = {
            width: $template.width() - $template[0].clientWidth,
            height: $template.height() - $template[0].clientHeight
        };
        $template.remove();

        return dim;
    }

    /**
     * Compares equality of a and b
     * @param a
     * @param b
     */
    function equal(a, b) {
        if (a === b) return true;
        if (a === undefined || b === undefined) return false;
        if (a === null || b === null) return false;
        // Check whether 'a' or 'b' is a string (primitive or object).
        // The concatenation of an empty string (+'') converts its argument to a string's primitive.
        if (a.constructor === String) return a+'' === b+''; // a+'' - in case 'a' is a String object
        if (b.constructor === String) return b+'' === a+''; // b+'' - in case 'b' is a String object
        return false;
    }

    /**
     * Splits the string into an array of values, transforming each value. An empty array is returned for nulls or empty
     * strings
     * @param string
     * @param separator
     */
    function splitVal(string, separator, transform) {
        var val, i, l;
        if (string === null || string.length < 1) return [];
        val = string.split(separator);
        for (i = 0, l = val.length; i < l; i = i + 1) val[i] = transform(val[i]);
        return val;
    }

    function getSideBorderPadding(element) {
        return element.outerWidth(false) - element.width();
    }

    function installKeyUpChangeEvent(element) {
        var key="keyup-change-value";
        element.on("keydown", function () {
            if ($.data(element, key) === undefined) {
                $.data(element, key, element.val());
            }
        });
        element.on("keyup", function () {
            var val= $.data(element, key);
            if (val !== undefined && element.val() !== val) {
                $.removeData(element, key);
                element.trigger("keyup-change");
            }
        });
    }


    /**
     * filters mouse events so an event is fired only if the mouse moved.
     *
     * filters out mouse events that occur when mouse is stationary but
     * the elements under the pointer are scrolled.
     */
    function installFilteredMouseMove(element) {
        element.on("mousemove", function (e) {
            var lastpos = lastMousePosition;
            if (lastpos === undefined || lastpos.x !== e.pageX || lastpos.y !== e.pageY) {
                $(e.target).trigger("mousemove-filtered", e);
            }
        });
    }

    /**
     * Debounces a function. Returns a function that calls the original fn function only if no invocations have been made
     * within the last quietMillis milliseconds.
     *
     * @param quietMillis number of milliseconds to wait before invoking fn
     * @param fn function to be debounced
     * @param ctx object to be used as this reference within fn
     * @return debounced version of fn
     */
    function debounce(quietMillis, fn, ctx) {
        ctx = ctx || undefined;
        var timeout;
        return function () {
            var args = arguments;
            window.clearTimeout(timeout);
            timeout = window.setTimeout(function() {
                fn.apply(ctx, args);
            }, quietMillis);
        };
    }

    function installDebouncedScroll(threshold, element) {
        var notify = debounce(threshold, function (e) { element.trigger("scroll-debounced", e);});
        element.on("scroll", function (e) {
            if (indexOf(e.target, element.get()) >= 0) notify(e);
        });
    }

    function focus($el) {
        if ($el[0] === document.activeElement) return;

        /* set the focus in a 0 timeout - that way the focus is set after the processing
            of the current event has finished - which seems like the only reliable way
            to set focus */
        window.setTimeout(function() {
            var el=$el[0], pos=$el.val().length, range;

            $el.focus();

            /* make sure el received focus so we do not error out when trying to manipulate the caret.
                sometimes modals or others listeners may steal it after its set */
            var isVisible = (el.offsetWidth > 0 || el.offsetHeight > 0);
            if (isVisible && el === document.activeElement) {

                /* after the focus is set move the caret to the end, necessary when we val()
                    just before setting focus */
                if(el.setSelectionRange)
                {
                    el.setSelectionRange(pos, pos);
                }
                else if (el.createTextRange) {
                    range = el.createTextRange();
                    range.collapse(false);
                    range.select();
                }
            }
        }, 0);
    }

    function getCursorInfo(el) {
        el = $(el)[0];
        var offset = 0;
        var length = 0;
        if ('selectionStart' in el) {
            offset = el.selectionStart;
            length = el.selectionEnd - offset;
        } else if ('selection' in document) {
            el.focus();
            var sel = document.selection.createRange();
            length = document.selection.createRange().text.length;
            sel.moveStart('character', -el.value.length);
            offset = sel.text.length - length;
        }
        return { offset: offset, length: length };
    }

    function killEvent(event) {
        event.preventDefault();
        event.stopPropagation();
    }
    function killEventImmediately(event) {
        event.preventDefault();
        event.stopImmediatePropagation();
    }

    function measureTextWidth(e) {
        if (!sizer){
            var style = e[0].currentStyle || window.getComputedStyle(e[0], null);
            sizer = $(document.createElement("div")).css({
                position: "absolute",
                left: "-10000px",
                top: "-10000px",
                display: "none",
                fontSize: style.fontSize,
                fontFamily: style.fontFamily,
                fontStyle: style.fontStyle,
                fontWeight: style.fontWeight,
                letterSpacing: style.letterSpacing,
                textTransform: style.textTransform,
                whiteSpace: "nowrap"
            });
            sizer.attr("class","select2-sizer");
            $(document.body).append(sizer);
        }
        sizer.text(e.val());
        return sizer.width();
    }

    function syncCssClasses(dest, src, adapter) {
        var classes, replacements = [], adapted;

        classes = $.trim(dest.attr("class"));

        if (classes) {
            classes = '' + classes; // for IE which returns object

            $(classes.split(/\s+/)).each2(function() {
                if (this.indexOf("select2-") === 0) {
                    replacements.push(this);
                }
            });
        }

        classes = $.trim(src.attr("class"));

        if (classes) {
            classes = '' + classes; // for IE which returns object

            $(classes.split(/\s+/)).each2(function() {
                if (this.indexOf("select2-") !== 0) {
                    adapted = adapter(this);

                    if (adapted) {
                        replacements.push(adapted);
                    }
                }
            });
        }

        dest.attr("class", replacements.join(" "));
    }


    function markMatch(text, term, markup, escapeMarkup) {
        var match=stripDiacritics(text.toUpperCase()).indexOf(stripDiacritics(term.toUpperCase())),
            tl=term.length;

        if (match<0) {
            markup.push(escapeMarkup(text));
            return;
        }

        markup.push(escapeMarkup(text.substring(0, match)));
        markup.push("<span class='select2-match'>");
        markup.push(escapeMarkup(text.substring(match, match + tl)));
        markup.push("</span>");
        markup.push(escapeMarkup(text.substring(match + tl, text.length)));
    }

    function defaultEscapeMarkup(markup) {
        var replace_map = {
            '\\': '&#92;',
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            "/": '&#47;'
        };

        return String(markup).replace(/[&<>"'\/\\]/g, function (match) {
            return replace_map[match];
        });
    }

    /**
     * Produces an ajax-based query function
     *
     * @param options object containing configuration parameters
     * @param options.params parameter map for the transport ajax call, can contain such options as cache, jsonpCallback, etc. see $.ajax
     * @param options.transport function that will be used to execute the ajax request. must be compatible with parameters supported by $.ajax
     * @param options.url url for the data
     * @param options.data a function(searchTerm, pageNumber, context) that should return an object containing query string parameters for the above url.
     * @param options.dataType request data type: ajax, jsonp, other datatypes supported by jQuery's $.ajax function or the transport function if specified
     * @param options.quietMillis (optional) milliseconds to wait before making the ajaxRequest, helps debounce the ajax function if invoked too often
     * @param options.results a function(remoteData, pageNumber, query) that converts data returned form the remote request to the format expected by Select2.
     *      The expected format is an object containing the following keys:
     *      results array of objects that will be used as choices
     *      more (optional) boolean indicating whether there are more results available
     *      Example: {results:[{id:1, text:'Red'},{id:2, text:'Blue'}], more:true}
     */
    function ajax(options) {
        var timeout, // current scheduled but not yet executed request
            handler = null,
            quietMillis = options.quietMillis || 100,
            ajaxUrl = options.url,
            self = this;

        return function (query) {
            window.clearTimeout(timeout);
            timeout = window.setTimeout(function () {
                var data = options.data, // ajax data function
                    url = ajaxUrl, // ajax url string or function
                    transport = options.transport || $.fn.select2.ajaxDefaults.transport,
                    // deprecated - to be removed in 4.0  - use params instead
                    deprecated = {
                        type: options.type || 'GET', // set type of request (GET or POST)
                        cache: options.cache || false,
                        jsonpCallback: options.jsonpCallback||undefined,
                        dataType: options.dataType||"json"
                    },
                    params = $.extend({}, $.fn.select2.ajaxDefaults.params, deprecated);

                data = data ? data.call(self, query.term, query.page, query.context) : null;
                url = (typeof url === 'function') ? url.call(self, query.term, query.page, query.context) : url;

                if (handler && typeof handler.abort === "function") { handler.abort(); }

                if (options.params) {
                    if ($.isFunction(options.params)) {
                        $.extend(params, options.params.call(self));
                    } else {
                        $.extend(params, options.params);
                    }
                }

                $.extend(params, {
                    url: url,
                    dataType: options.dataType,
                    data: data,
                    success: function (data) {
                        // TODO - replace query.page with query so users have access to term, page, etc.
                        // added query as third paramter to keep backwards compatibility
                        var results = options.results(data, query.page, query);
                        query.callback(results);
                    },
                    error: function(jqXHR, textStatus, errorThrown){
                        var results = {
                            hasError: true,
                            jqXHR: jqXHR,
                            textStatus: textStatus,
                            errorThrown: errorThrown
                        };

                        query.callback(results);
                    }
                });
                handler = transport.call(self, params);
            }, quietMillis);
        };
    }

    /**
     * Produces a query function that works with a local array
     *
     * @param options object containing configuration parameters. The options parameter can either be an array or an
     * object.
     *
     * If the array form is used it is assumed that it contains objects with 'id' and 'text' keys.
     *
     * If the object form is used it is assumed that it contains 'data' and 'text' keys. The 'data' key should contain
     * an array of objects that will be used as choices. These objects must contain at least an 'id' key. The 'text'
     * key can either be a String in which case it is expected that each element in the 'data' array has a key with the
     * value of 'text' which will be used to match choices. Alternatively, text can be a function(item) that can extract
     * the text.
     */
    function local(options) {
        var data = options, // data elements
            dataText,
            tmp,
            text = function (item) { return ""+item.text; }; // function used to retrieve the text portion of a data item that is matched against the search

         if ($.isArray(data)) {
            tmp = data;
            data = { results: tmp };
        }

         if ($.isFunction(data) === false) {
            tmp = data;
            data = function() { return tmp; };
        }

        var dataItem = data();
        if (dataItem.text) {
            text = dataItem.text;
            // if text is not a function we assume it to be a key name
            if (!$.isFunction(text)) {
                dataText = dataItem.text; // we need to store this in a separate variable because in the next step data gets reset and data.text is no longer available
                text = function (item) { return item[dataText]; };
            }
        }

        return function (query) {
            var t = query.term, filtered = { results: [] }, process;
            if (t === "") {
                query.callback(data());
                return;
            }

            process = function(datum, collection) {
                var group, attr;
                datum = datum[0];
                if (datum.children) {
                    group = {};
                    for (attr in datum) {
                        if (datum.hasOwnProperty(attr)) group[attr]=datum[attr];
                    }
                    group.children=[];
                    $(datum.children).each2(function(i, childDatum) { process(childDatum, group.children); });
                    if (group.children.length || query.matcher(t, text(group), datum)) {
                        collection.push(group);
                    }
                } else {
                    if (query.matcher(t, text(datum), datum)) {
                        collection.push(datum);
                    }
                }
            };

            $(data().results).each2(function(i, datum) { process(datum, filtered.results); });
            query.callback(filtered);
        };
    }

    // TODO javadoc
    function tags(data) {
        var isFunc = $.isFunction(data);
        return function (query) {
            var t = query.term, filtered = {results: []};
            var result = isFunc ? data(query) : data;
            if ($.isArray(result)) {
                $(result).each(function () {
                    var isObject = this.text !== undefined,
                        text = isObject ? this.text : this;
                    if (t === "" || query.matcher(t, text)) {
                        filtered.results.push(isObject ? this : {id: this, text: this});
                    }
                });
                query.callback(filtered);
            }
        };
    }

    /**
     * Checks if the formatter function should be used.
     *
     * Throws an error if it is not a function. Returns true if it should be used,
     * false if no formatting should be performed.
     *
     * @param formatter
     */
    function checkFormatter(formatter, formatterName) {
        if ($.isFunction(formatter)) return true;
        if (!formatter) return false;
        if (typeof(formatter) === 'string') return true;
        throw new Error(formatterName +" must be a string, function, or falsy value");
    }

  /**
   * Returns a given value
   * If given a function, returns its output
   *
   * @param val string|function
   * @param context value of "this" to be passed to function
   * @returns {*}
   */
    function evaluate(val, context) {
        if ($.isFunction(val)) {
            var args = Array.prototype.slice.call(arguments, 2);
            return val.apply(context, args);
        }
        return val;
    }

    function countResults(results) {
        var count = 0;
        $.each(results, function(i, item) {
            if (item.children) {
                count += countResults(item.children);
            } else {
                count++;
            }
        });
        return count;
    }

    /**
     * Default tokenizer. This function uses breaks the input on substring match of any string from the
     * opts.tokenSeparators array and uses opts.createSearchChoice to create the choice object. Both of those
     * two options have to be defined in order for the tokenizer to work.
     *
     * @param input text user has typed so far or pasted into the search field
     * @param selection currently selected choices
     * @param selectCallback function(choice) callback tho add the choice to selection
     * @param opts select2's opts
     * @return undefined/null to leave the current input unchanged, or a string to change the input to the returned value
     */
    function defaultTokenizer(input, selection, selectCallback, opts) {
        var original = input, // store the original so we can compare and know if we need to tell the search to update its text
            dupe = false, // check for whether a token we extracted represents a duplicate selected choice
            token, // token
            index, // position at which the separator was found
            i, l, // looping variables
            separator; // the matched separator

        if (!opts.createSearchChoice || !opts.tokenSeparators || opts.tokenSeparators.length < 1) return undefined;

        while (true) {
            index = -1;

            for (i = 0, l = opts.tokenSeparators.length; i < l; i++) {
                separator = opts.tokenSeparators[i];
                index = input.indexOf(separator);
                if (index >= 0) break;
            }

            if (index < 0) break; // did not find any token separator in the input string, bail

            token = input.substring(0, index);
            input = input.substring(index + separator.length);

            if (token.length > 0) {
                token = opts.createSearchChoice.call(this, token, selection);
                if (token !== undefined && token !== null && opts.id(token) !== undefined && opts.id(token) !== null) {
                    dupe = false;
                    for (i = 0, l = selection.length; i < l; i++) {
                        if (equal(opts.id(token), opts.id(selection[i]))) {
                            dupe = true; break;
                        }
                    }

                    if (!dupe) selectCallback(token);
                }
            }
        }

        if (original!==input) return input;
    }

    function cleanupJQueryElements() {
        var self = this;

        $.each(arguments, function (i, element) {
            self[element].remove();
            self[element] = null;
        });
    }

    /**
     * Creates a new class
     *
     * @param superClass
     * @param methods
     */
    function clazz(SuperClass, methods) {
        var constructor = function () {};
        constructor.prototype = new SuperClass;
        constructor.prototype.constructor = constructor;
        constructor.prototype.parent = SuperClass.prototype;
        constructor.prototype = $.extend(constructor.prototype, methods);
        return constructor;
    }

    AbstractSelect2 = clazz(Object, {

        // abstract
        bind: function (func) {
            var self = this;
            return function () {
                func.apply(self, arguments);
            };
        },

        // abstract
        init: function (opts) {
            var results, search, resultsSelector = ".select2-results";

            // prepare options
            this.opts = opts = this.prepareOpts(opts);

            this.id=opts.id;

            // destroy if called on an existing component
            if (opts.element.data("select2") !== undefined &&
                opts.element.data("select2") !== null) {
                opts.element.data("select2").destroy();
            }

            this.container = this.createContainer();

            this.liveRegion = $('.select2-hidden-accessible');
            if (this.liveRegion.length == 0) {
                this.liveRegion = $("<span>", {
                        role: "status",
                        "aria-live": "polite"
                    })
                    .addClass("select2-hidden-accessible")
                    .appendTo(document.body);
            }

            this.containerId="s2id_"+(opts.element.attr("id") || "autogen"+nextUid());
            this.containerEventName= this.containerId
                .replace(/([.])/g, '_')
                .replace(/([;&,\-\.\+\*\~':"\!\^#$%@\[\]\(\)=>\|])/g, '\\$1');
            this.container.attr("id", this.containerId);

            this.container.attr("title", opts.element.attr("title"));

            this.body = $(document.body);

            syncCssClasses(this.container, this.opts.element, this.opts.adaptContainerCssClass);

            this.container.attr("style", opts.element.attr("style"));
            this.container.css(evaluate(opts.containerCss, this.opts.element));
            this.container.addClass(evaluate(opts.containerCssClass, this.opts.element));

            this.elementTabIndex = this.opts.element.attr("tabindex");

            // swap container for the element
            this.opts.element
                .data("select2", this)
                .attr("tabindex", "-1")
                .before(this.container)
                .on("click.select2", killEvent); // do not leak click events

            this.container.data("select2", this);

            this.dropdown = this.container.find(".select2-drop");

            syncCssClasses(this.dropdown, this.opts.element, this.opts.adaptDropdownCssClass);

            this.dropdown.addClass(evaluate(opts.dropdownCssClass, this.opts.element));
            this.dropdown.data("select2", this);
            this.dropdown.on("click", killEvent);

            this.results = results = this.container.find(resultsSelector);
            this.search = search = this.container.find("input.select2-input");

            this.queryCount = 0;
            this.resultsPage = 0;
            this.context = null;

            // initialize the container
            this.initContainer();

            this.container.on("click", killEvent);

            installFilteredMouseMove(this.results);

            this.dropdown.on("mousemove-filtered", resultsSelector, this.bind(this.highlightUnderEvent));
            this.dropdown.on("touchstart touchmove touchend", resultsSelector, this.bind(function (event) {
                this._touchEvent = true;
                this.highlightUnderEvent(event);
            }));
            this.dropdown.on("touchmove", resultsSelector, this.bind(this.touchMoved));
            this.dropdown.on("touchstart touchend", resultsSelector, this.bind(this.clearTouchMoved));

            // Waiting for a click event on touch devices to select option and hide dropdown
            // otherwise click will be triggered on an underlying element
            this.dropdown.on('click', this.bind(function (event) {
                if (this._touchEvent) {
                    this._touchEvent = false;
                    this.selectHighlighted();
                }
            }));

            installDebouncedScroll(80, this.results);
            this.dropdown.on("scroll-debounced", resultsSelector, this.bind(this.loadMoreIfNeeded));

            // do not propagate change event from the search field out of the component
            $(this.container).on("change", ".select2-input", function(e) {e.stopPropagation();});
            $(this.dropdown).on("change", ".select2-input", function(e) {e.stopPropagation();});

            // if jquery.mousewheel plugin is installed we can prevent out-of-bounds scrolling of results via mousewheel
            if ($.fn.mousewheel) {
                results.mousewheel(function (e, delta, deltaX, deltaY) {
                    var top = results.scrollTop();
                    if (deltaY > 0 && top - deltaY <= 0) {
                        results.scrollTop(0);
                        killEvent(e);
                    } else if (deltaY < 0 && results.get(0).scrollHeight - results.scrollTop() + deltaY <= results.height()) {
                        results.scrollTop(results.get(0).scrollHeight - results.height());
                        killEvent(e);
                    }
                });
            }

            installKeyUpChangeEvent(search);
            search.on("keyup-change input paste", this.bind(this.updateResults));
            search.on("focus", function () { search.addClass("select2-focused"); });
            search.on("blur", function () { search.removeClass("select2-focused");});

            this.dropdown.on("mouseup", resultsSelector, this.bind(function (e) {
                if ($(e.target).closest(".select2-result-selectable").length > 0) {
                    this.highlightUnderEvent(e);
                    this.selectHighlighted(e);
                }
            }));

            // trap all mouse events from leaving the dropdown. sometimes there may be a modal that is listening
            // for mouse events outside of itself so it can close itself. since the dropdown is now outside the select2's
            // dom it will trigger the popup close, which is not what we want
            // focusin can cause focus wars between modals and select2 since the dropdown is outside the modal.
            this.dropdown.on("click mouseup mousedown touchstart touchend focusin", function (e) { e.stopPropagation(); });

            this.lastSearchTerm = undefined;

            if ($.isFunction(this.opts.initSelection)) {
                // initialize selection based on the current value of the source element
                this.initSelection();

                // if the user has provided a function that can set selection based on the value of the source element
                // we monitor the change event on the element and trigger it, allowing for two way synchronization
                this.monitorSource();
            }

            if (opts.maximumInputLength !== null) {
                this.search.attr("maxlength", opts.maximumInputLength);
            }

            var disabled = opts.element.prop("disabled");
            if (disabled === undefined) disabled = false;
            this.enable(!disabled);

            var readonly = opts.element.prop("readonly");
            if (readonly === undefined) readonly = false;
            this.readonly(readonly);

            // Calculate size of scrollbar
            scrollBarDimensions = scrollBarDimensions || measureScrollbar();

            this.autofocus = opts.element.prop("autofocus");
            opts.element.prop("autofocus", false);
            if (this.autofocus) this.focus();

            this.search.attr("placeholder", opts.searchInputPlaceholder);
        },

        // abstract
        destroy: function () {
            var element=this.opts.element, select2 = element.data("select2"), self = this;

            this.close();

            if (element.length && element[0].detachEvent && self._sync) {
                element.each(function () {
                    if (self._sync) {
                        this.detachEvent("onpropertychange", self._sync);
                    }
                });
            }
            if (this.propertyObserver) {
                this.propertyObserver.disconnect();
                this.propertyObserver = null;
            }
            this._sync = null;

            if (select2 !== undefined) {
                select2.container.remove();
                select2.liveRegion.remove();
                select2.dropdown.remove();
                element.removeData("select2")
                    .off(".select2");
                if (!element.is("input[type='hidden']")) {
                    element
                        .show()
                        .prop("autofocus", this.autofocus || false);
                    if (this.elementTabIndex) {
                        element.attr({tabindex: this.elementTabIndex});
                    } else {
                        element.removeAttr("tabindex");
                    }
                    element.show();
                } else {
                    element.css("display", "");
                }
            }

            cleanupJQueryElements.call(this,
                "container",
                "liveRegion",
                "dropdown",
                "results",
                "search"
            );
        },

        // abstract
        optionToData: function(element) {
            if (element.is("option")) {
                return {
                    id:element.prop("value"),
                    text:element.text(),
                    element: element.get(),
                    css: element.attr("class"),
                    disabled: element.prop("disabled"),
                    locked: equal(element.attr("locked"), "locked") || equal(element.data("locked"), true)
                };
            } else if (element.is("optgroup")) {
                return {
                    text:element.attr("label"),
                    children:[],
                    element: element.get(),
                    css: element.attr("class")
                };
            }
        },

        // abstract
        prepareOpts: function (opts) {
            var element, select, idKey, ajaxUrl, self = this;

            element = opts.element;

            if (element.get(0).tagName.toLowerCase() === "select") {
                this.select = select = opts.element;
            }

            if (select) {
                // these options are not allowed when attached to a select because they are picked up off the element itself
                $.each(["id", "multiple", "ajax", "query", "createSearchChoice", "initSelection", "data", "tags"], function () {
                    if (this in opts) {
                        throw new Error("Option '" + this + "' is not allowed for Select2 when attached to a <select> element.");
                    }
                });
            }

            opts.debug = opts.debug || $.fn.select2.defaults.debug;

            // Warnings for options renamed/removed in Select2 4.0.0
            // Only when it's enabled through debug mode
            if (opts.debug && console && console.warn) {
                // id was removed
                if (opts.id != null) {
                    console.warn(
                        'Select2: The `id` option has been removed in Select2 4.0.0, ' +
                        'consider renaming your `id` property or mapping the property before your data makes it to Select2. ' +
                        'You can read more at https://select2.github.io/announcements-4.0.html#changed-id'
                    );
                }

                // text was removed
                if (opts.text != null) {
                    console.warn(
                        'Select2: The `text` option has been removed in Select2 4.0.0, ' +
                        'consider renaming your `text` property or mapping the property before your data makes it to Select2. ' +
                        'You can read more at https://select2.github.io/announcements-4.0.html#changed-id'
                    );
                }

                // sortResults was renamed to results
                if (opts.sortResults != null) {
                    console.warn(
                        'Select2: the `sortResults` option has been renamed to `sorter` in Select2 4.0.0. '
                    );
                }

                // selectOnBlur was renamed to selectOnClose
                if (opts.selectOnBlur != null) {
                    console.warn(
                        'Select2: The `selectOnBlur` option has been renamed to `selectOnClose` in Select2 4.0.0.'
                    );
                }

                // ajax.results was renamed to ajax.processResults
                if (opts.ajax != null && opts.ajax.results != null) {
                    console.warn(
                        'Select2: The `ajax.results` option has been renamed to `ajax.processResults` in Select2 4.0.0.'
                    );
                }

                // format* options were renamed to language.*
                if (opts.formatNoResults != null) {
                    console.warn(
                        'Select2: The `formatNoResults` option has been renamed to `language.noResults` in Select2 4.0.0.'
                    );
                }
                if (opts.formatSearching != null) {
                    console.warn(
                        'Select2: The `formatSearching` option has been renamed to `language.searching` in Select2 4.0.0.'
                    );
                }
                if (opts.formatInputTooShort != null) {
                    console.warn(
                        'Select2: The `formatInputTooShort` option has been renamed to `language.inputTooShort` in Select2 4.0.0.'
                    );
                }
                if (opts.formatInputTooLong != null) {
                    console.warn(
                        'Select2: The `formatInputTooLong` option has been renamed to `language.inputTooLong` in Select2 4.0.0.'
                    );
                }
                if (opts.formatLoading != null) {
                    console.warn(
                        'Select2: The `formatLoading` option has been renamed to `language.loadingMore` in Select2 4.0.0.'
                    );
                }
                if (opts.formatSelectionTooBig != null) {
                    console.warn(
                        'Select2: The `formatSelectionTooBig` option has been renamed to `language.maximumSelected` in Select2 4.0.0.'
                    );
                }

                if (opts.element.data('select2Tags')) {
                    console.warn(
                        'Select2: The `data-select2-tags` attribute has been renamed to `data-tags` in Select2 4.0.0.'
                    );
                }
            }

            // Aliasing options renamed in Select2 4.0.0

            // data-select2-tags -> data-tags
            if (opts.element.data('tags') != null) {
                var elemTags = opts.element.data('tags');

                // data-tags should actually be a boolean
                if (!$.isArray(elemTags)) {
                    elemTags = [];
                }

                opts.element.data('select2Tags', elemTags);
            }

            // sortResults -> sorter
            if (opts.sorter != null) {
                opts.sortResults = opts.sorter;
            }

            // selectOnBlur -> selectOnClose
            if (opts.selectOnClose != null) {
                opts.selectOnBlur = opts.selectOnClose;
            }

            // ajax.results -> ajax.processResults
            if (opts.ajax != null) {
                if ($.isFunction(opts.ajax.processResults)) {
                    opts.ajax.results = opts.ajax.processResults;
                }
            }

            // Formatters/language options
            if (opts.language != null) {
                var lang = opts.language;

                // formatNoMatches -> language.noMatches
                if ($.isFunction(lang.noMatches)) {
                    opts.formatNoMatches = lang.noMatches;
                }

                // formatSearching -> language.searching
                if ($.isFunction(lang.searching)) {
                    opts.formatSearching = lang.searching;
                }

                // formatInputTooShort -> language.inputTooShort
                if ($.isFunction(lang.inputTooShort)) {
                    opts.formatInputTooShort = lang.inputTooShort;
                }

                // formatInputTooLong -> language.inputTooLong
                if ($.isFunction(lang.inputTooLong)) {
                    opts.formatInputTooLong = lang.inputTooLong;
                }

                // formatLoading -> language.loadingMore
                if ($.isFunction(lang.loadingMore)) {
                    opts.formatLoading = lang.loadingMore;
                }

                // formatSelectionTooBig -> language.maximumSelected
                if ($.isFunction(lang.maximumSelected)) {
                    opts.formatSelectionTooBig = lang.maximumSelected;
                }
            }

            opts = $.extend({}, {
                populateResults: function(container, results, query) {
                    var populate, id=this.opts.id, liveRegion=this.liveRegion;

                    populate=function(results, container, depth) {

                        var i, l, result, selectable, disabled, compound, node, label, innerContainer, formatted;

                        results = opts.sortResults(results, container, query);

                        // collect the created nodes for bulk append
                        var nodes = [];
                        for (i = 0, l = results.length; i < l; i = i + 1) {

                            result=results[i];

                            disabled = (result.disabled === true);
                            selectable = (!disabled) && (id(result) !== undefined);

                            compound=result.children && result.children.length > 0;

                            node=$("<li></li>");
                            node.addClass("select2-results-dept-"+depth);
                            node.addClass("select2-result");
                            node.addClass(selectable ? "select2-result-selectable" : "select2-result-unselectable");
                            if (disabled) { node.addClass("select2-disabled"); }
                            if (compound) { node.addClass("select2-result-with-children"); }
                            node.addClass(self.opts.formatResultCssClass(result));
                            node.attr("role", "presentation");

                            label=$(document.createElement("div"));
                            label.addClass("select2-result-label");
                            label.attr("id", "select2-result-label-" + nextUid());
                            label.attr("role", "option");

                            formatted=opts.formatResult(result, label, query, self.opts.escapeMarkup);
                            if (formatted!==undefined) {
                                label.html(formatted);
                                node.append(label);
                            }


                            if (compound) {
                                innerContainer=$("<ul></ul>");
                                innerContainer.addClass("select2-result-sub");
                                populate(result.children, innerContainer, depth+1);
                                node.append(innerContainer);
                            }

                            node.data("select2-data", result);
                            nodes.push(node[0]);
                        }

                        // bulk append the created nodes
                        container.append(nodes);
                        liveRegion.text(opts.formatMatches(results.length));
                    };

                    populate(results, container, 0);
                }
            }, $.fn.select2.defaults, opts);

            if (typeof(opts.id) !== "function") {
                idKey = opts.id;
                opts.id = function (e) { return e[idKey]; };
            }

            if ($.isArray(opts.element.data("select2Tags"))) {
                if ("tags" in opts) {
                    throw "tags specified as both an attribute 'data-select2-tags' and in options of Select2 " + opts.element.attr("id");
                }
                opts.tags=opts.element.data("select2Tags");
            }

            if (select) {
                opts.query = this.bind(function (query) {
                    var data = { results: [], more: false },
                        term = query.term,
                        children, placeholderOption, process;

                    process=function(element, collection) {
                        var group;
                        if (element.is("option")) {
                            if (query.matcher(term, element.text(), element)) {
                                collection.push(self.optionToData(element));
                            }
                        } else if (element.is("optgroup")) {
                            group=self.optionToData(element);
                            element.children().each2(function(i, elm) { process(elm, group.children); });
                            if (group.children.length>0) {
                                collection.push(group);
                            }
                        }
                    };

                    children=element.children();

                    // ignore the placeholder option if there is one
                    if (this.getPlaceholder() !== undefined && children.length > 0) {
                        placeholderOption = this.getPlaceholderOption();
                        if (placeholderOption) {
                            children=children.not(placeholderOption);
                        }
                    }

                    children.each2(function(i, elm) { process(elm, data.results); });

                    query.callback(data);
                });
                // this is needed because inside val() we construct choices from options and their id is hardcoded
                opts.id=function(e) { return e.id; };
            } else {
                if (!("query" in opts)) {
                    if ("ajax" in opts) {
                        ajaxUrl = opts.element.data("ajax-url");
                        if (ajaxUrl && ajaxUrl.length > 0) {
                            opts.ajax.url = ajaxUrl;
                        }
                        opts.query = ajax.call(opts.element, opts.ajax);
                    } else if ("data" in opts) {
                        opts.query = local(opts.data);
                    } else if ("tags" in opts) {
                        opts.query = tags(opts.tags);
                        if (opts.createSearchChoice === undefined) {
                            opts.createSearchChoice = function (term) { return {id: $.trim(term), text: $.trim(term)}; };
                        }
                        if (opts.initSelection === undefined) {
                            opts.initSelection = function (element, callback) {
                                var data = [];
                                $(splitVal(element.val(), opts.separator, opts.transformVal)).each(function () {
                                    var obj = { id: this, text: this },
                                        tags = opts.tags;
                                    if ($.isFunction(tags)) tags=tags();
                                    $(tags).each(function() { if (equal(this.id, obj.id)) { obj = this; return false; } });
                                    data.push(obj);
                                });

                                callback(data);
                            };
                        }
                    }
                }
            }
            if (typeof(opts.query) !== "function") {
                throw "query function not defined for Select2 " + opts.element.attr("id");
            }

            if (opts.createSearchChoicePosition === 'top') {
                opts.createSearchChoicePosition = function(list, item) { list.unshift(item); };
            }
            else if (opts.createSearchChoicePosition === 'bottom') {
                opts.createSearchChoicePosition = function(list, item) { list.push(item); };
            }
            else if (typeof(opts.createSearchChoicePosition) !== "function")  {
                throw "invalid createSearchChoicePosition option must be 'top', 'bottom' or a custom function";
            }

            return opts;
        },

        /**
         * Monitor the original element for changes and update select2 accordingly
         */
        // abstract
        monitorSource: function () {
            var el = this.opts.element, observer, self = this;

            el.on("change.select2", this.bind(function (e) {
                if (this.opts.element.data("select2-change-triggered") !== true) {
                    this.initSelection();
                }
            }));

            this._sync = this.bind(function () {

                // sync enabled state
                var disabled = el.prop("disabled");
                if (disabled === undefined) disabled = false;
                this.enable(!disabled);

                var readonly = el.prop("readonly");
                if (readonly === undefined) readonly = false;
                this.readonly(readonly);

                if (this.container) {
                    syncCssClasses(this.container, this.opts.element, this.opts.adaptContainerCssClass);
                    this.container.addClass(evaluate(this.opts.containerCssClass, this.opts.element));
                }

                if (this.dropdown) {
                    syncCssClasses(this.dropdown, this.opts.element, this.opts.adaptDropdownCssClass);
                    this.dropdown.addClass(evaluate(this.opts.dropdownCssClass, this.opts.element));
                }

            });

            // IE8-10 (IE9/10 won't fire propertyChange via attachEventListener)
            if (el.length && el[0].attachEvent) {
                el.each(function() {
                    this.attachEvent("onpropertychange", self._sync);
                });
            }

            // safari, chrome, firefox, IE11
            observer = window.MutationObserver || window.WebKitMutationObserver|| window.MozMutationObserver;
            if (observer !== undefined) {
                if (this.propertyObserver) { delete this.propertyObserver; this.propertyObserver = null; }
                this.propertyObserver = new observer(function (mutations) {
                    $.each(mutations, self._sync);
                });
                this.propertyObserver.observe(el.get(0), { attributes:true, subtree:false });
            }
        },

        // abstract
        triggerSelect: function(data) {
            var evt = $.Event("select2-selecting", { val: this.id(data), object: data, choice: data });
            this.opts.element.trigger(evt);
            return !evt.isDefaultPrevented();
        },

        /**
         * Triggers the change event on the source element
         */
        // abstract
        triggerChange: function (details) {

            details = details || {};
            details= $.extend({}, details, { type: "change", val: this.val() });
            // prevents recursive triggering
            this.opts.element.data("select2-change-triggered", true);
            this.opts.element.trigger(details);
            this.opts.element.data("select2-change-triggered", false);

            // some validation frameworks ignore the change event and listen instead to keyup, click for selects
            // so here we trigger the click event manually
            this.opts.element.click();

            // ValidationEngine ignores the change event and listens instead to blur
            // so here we trigger the blur event manually if so desired
            if (this.opts.blurOnChange)
                this.opts.element.blur();
        },

        //abstract
        isInterfaceEnabled: function()
        {
            return this.enabledInterface === true;
        },

        // abstract
        enableInterface: function() {
            var enabled = this._enabled && !this._readonly,
                disabled = !enabled;

            if (enabled === this.enabledInterface) return false;

            this.container.toggleClass("select2-container-disabled", disabled);
            this.close();
            this.enabledInterface = enabled;

            return true;
        },

        // abstract
        enable: function(enabled) {
            if (enabled === undefined) enabled = true;
            if (this._enabled === enabled) return;
            this._enabled = enabled;

            this.opts.element.prop("disabled", !enabled);
            this.enableInterface();
        },

        // abstract
        disable: function() {
            this.enable(false);
        },

        // abstract
        readonly: function(enabled) {
            if (enabled === undefined) enabled = false;
            if (this._readonly === enabled) return;
            this._readonly = enabled;

            this.opts.element.prop("readonly", enabled);
            this.enableInterface();
        },

        // abstract
        opened: function () {
            return (this.container) ? this.container.hasClass("select2-dropdown-open") : false;
        },

        // abstract
        positionDropdown: function() {
            var $dropdown = this.dropdown,
                container = this.container,
                offset = container.offset(),
                height = container.outerHeight(false),
                width = container.outerWidth(false),
                dropHeight = $dropdown.outerHeight(false),
                $window = $(window),
                windowWidth = $window.width(),
                windowHeight = $window.height(),
                viewPortRight = $window.scrollLeft() + windowWidth,
                viewportBottom = $window.scrollTop() + windowHeight,
                dropTop = offset.top + height,
                dropLeft = offset.left,
                enoughRoomBelow = dropTop + dropHeight <= viewportBottom,
                enoughRoomAbove = (offset.top - dropHeight) >= $window.scrollTop(),
                dropWidth = $dropdown.outerWidth(false),
                enoughRoomOnRight = function() {
                    return dropLeft + dropWidth <= viewPortRight;
                },
                enoughRoomOnLeft = function() {
                    return offset.left + viewPortRight + container.outerWidth(false)  > dropWidth;
                },
                aboveNow = $dropdown.hasClass("select2-drop-above"),
                bodyOffset,
                above,
                changeDirection,
                css,
                resultsListNode;

            // always prefer the current above/below alignment, unless there is not enough room
            if (aboveNow) {
                above = true;
                if (!enoughRoomAbove && enoughRoomBelow) {
                    changeDirection = true;
                    above = false;
                }
            } else {
                above = false;
                if (!enoughRoomBelow && enoughRoomAbove) {
                    changeDirection = true;
                    above = true;
                }
            }

            //if we are changing direction we need to get positions when dropdown is hidden;
            if (changeDirection) {
                $dropdown.hide();
                offset = this.container.offset();
                height = this.container.outerHeight(false);
                width = this.container.outerWidth(false);
                dropHeight = $dropdown.outerHeight(false);
                viewPortRight = $window.scrollLeft() + windowWidth;
                viewportBottom = $window.scrollTop() + windowHeight;
                dropTop = offset.top + height;
                dropLeft = offset.left;
                dropWidth = $dropdown.outerWidth(false);
                $dropdown.show();

                // fix so the cursor does not move to the left within the search-textbox in IE
                this.focusSearch();
            }

            if (this.opts.dropdownAutoWidth) {
                resultsListNode = $('.select2-results', $dropdown)[0];
                $dropdown.addClass('select2-drop-auto-width');
                $dropdown.css('width', '');
                // Add scrollbar width to dropdown if vertical scrollbar is present
                dropWidth = $dropdown.outerWidth(false) + (resultsListNode.scrollHeight === resultsListNode.clientHeight ? 0 : scrollBarDimensions.width);
                dropWidth > width ? width = dropWidth : dropWidth = width;
                dropHeight = $dropdown.outerHeight(false);
            }
            else {
                this.container.removeClass('select2-drop-auto-width');
            }

            //console.log("below/ droptop:", dropTop, "dropHeight", dropHeight, "sum", (dropTop+dropHeight)+" viewport bottom", viewportBottom, "enough?", enoughRoomBelow);
            //console.log("above/ offset.top", offset.top, "dropHeight", dropHeight, "top", (offset.top-dropHeight), "scrollTop", this.body.scrollTop(), "enough?", enoughRoomAbove);

            // fix positioning when body has an offset and is not position: static
            if (this.body.css('position') !== 'static') {
                bodyOffset = this.body.offset();
                dropTop -= bodyOffset.top;
                dropLeft -= bodyOffset.left;
            }

            if (!enoughRoomOnRight() && enoughRoomOnLeft()) {
                dropLeft = offset.left + this.container.outerWidth(false) - dropWidth;
            }

            css =  {
                left: dropLeft,
                width: width
            };

            if (above) {
                this.container.addClass("select2-drop-above");
                $dropdown.addClass("select2-drop-above");
                dropHeight = $dropdown.outerHeight(false);
                css.top = offset.top - dropHeight;
                css.bottom = 'auto';
            }
            else {
                css.top = dropTop;
                css.bottom = 'auto';
                this.container.removeClass("select2-drop-above");
                $dropdown.removeClass("select2-drop-above");
            }
            css = $.extend(css, evaluate(this.opts.dropdownCss, this.opts.element));

            $dropdown.css(css);
        },

        // abstract
        shouldOpen: function() {
            var event;

            if (this.opened()) return false;

            if (this._enabled === false || this._readonly === true) return false;

            event = $.Event("select2-opening");
            this.opts.element.trigger(event);
            return !event.isDefaultPrevented();
        },

        // abstract
        clearDropdownAlignmentPreference: function() {
            // clear the classes used to figure out the preference of where the dropdown should be opened
            this.container.removeClass("select2-drop-above");
            this.dropdown.removeClass("select2-drop-above");
        },

        /**
         * Opens the dropdown
         *
         * @return {Boolean} whether or not dropdown was opened. This method will return false if, for example,
         * the dropdown is already open, or if the 'open' event listener on the element called preventDefault().
         */
        // abstract
        open: function () {

            if (!this.shouldOpen()) return false;

            this.opening();

            // Only bind the document mousemove when the dropdown is visible
            $document.on("mousemove.select2Event", function (e) {
                lastMousePosition.x = e.pageX;
                lastMousePosition.y = e.pageY;
            });

            return true;
        },

        /**
         * Performs the opening of the dropdown
         */
        // abstract
        opening: function() {
            var cid = this.containerEventName,
                scroll = "scroll." + cid,
                resize = "resize."+cid,
                orient = "orientationchange."+cid,
                mask;

            this.container.addClass("select2-dropdown-open").addClass("select2-container-active");

            this.clearDropdownAlignmentPreference();

            if(this.dropdown[0] !== this.body.children().last()[0]) {
                this.dropdown.detach().appendTo(this.body);
            }

            // create the dropdown mask if doesn't already exist
            mask = $("#select2-drop-mask");
            if (mask.length === 0) {
                mask = $(document.createElement("div"));
                mask.attr("id","select2-drop-mask").attr("class","select2-drop-mask");
                mask.hide();
                mask.appendTo(this.body);
                mask.on("mousedown touchstart click", function (e) {
                    // Prevent IE from generating a click event on the body
                    reinsertElement(mask);

                    var dropdown = $("#select2-drop"), self;
                    if (dropdown.length > 0) {
                        self=dropdown.data("select2");
                        if (self.opts.selectOnBlur) {
                            self.selectHighlighted({noFocus: true});
                        }
                        self.close();
                        e.preventDefault();
                        e.stopPropagation();
                    }
                });
            }

            // ensure the mask is always right before the dropdown
            if (this.dropdown.prev()[0] !== mask[0]) {
                this.dropdown.before(mask);
            }

            // move the global id to the correct dropdown
            $("#select2-drop").removeAttr("id");
            this.dropdown.attr("id", "select2-drop");

            // show the elements
            mask.show();

            this.positionDropdown();
            this.dropdown.show();
            this.positionDropdown();

            this.dropdown.addClass("select2-drop-active");

            // attach listeners to events that can change the position of the container and thus require
            // the position of the dropdown to be updated as well so it does not come unglued from the container
            var that = this;
            this.container.parents().add(window).each(function () {
                $(this).on(resize+" "+scroll+" "+orient, function (e) {
                    if (that.opened()) that.positionDropdown();
                });
            });


        },

        // abstract
        close: function () {
            if (!this.opened()) return;

            var cid = this.containerEventName,
                scroll = "scroll." + cid,
                resize = "resize."+cid,
                orient = "orientationchange."+cid;

            // unbind event listeners
            this.container.parents().add(window).each(function () { $(this).off(scroll).off(resize).off(orient); });

            this.clearDropdownAlignmentPreference();

            $("#select2-drop-mask").hide();
            this.dropdown.removeAttr("id"); // only the active dropdown has the select2-drop id
            this.dropdown.hide();
            this.container.removeClass("select2-dropdown-open").removeClass("select2-container-active");
            this.results.empty();

            // Now that the dropdown is closed, unbind the global document mousemove event
            $document.off("mousemove.select2Event");

            this.clearSearch();
            this.search.removeClass("select2-active");

            // Remove the aria active descendant for highlighted element
            this.search.removeAttr("aria-activedescendant");
            this.opts.element.trigger($.Event("select2-close"));
        },

        /**
         * Opens control, sets input value, and updates results.
         */
        // abstract
        externalSearch: function (term) {
            this.open();
            this.search.val(term);
            this.updateResults(false);
        },

        // abstract
        clearSearch: function () {

        },

        /**
         * @return {Boolean} Whether or not search value was changed.
         * @private
         */
        prefillNextSearchTerm: function () {
            // initializes search's value with nextSearchTerm (if defined by user)
            // ignore nextSearchTerm if the dropdown is opened by the user pressing a letter
            if(this.search.val() !== "") {
                return false;
            }

            var nextSearchTerm = this.opts.nextSearchTerm(this.data(), this.lastSearchTerm);
            if(nextSearchTerm !== undefined){
                this.search.val(nextSearchTerm);
                this.search.select();
                return true;
            }

            return false;
        },

        //abstract
        getMaximumSelectionSize: function() {
            return evaluate(this.opts.maximumSelectionSize, this.opts.element);
        },

        // abstract
        ensureHighlightVisible: function () {
            var results = this.results, children, index, child, hb, rb, y, more, topOffset;

            index = this.highlight();

            if (index < 0) return;

            if (index == 0) {

                // if the first element is highlighted scroll all the way to the top,
                // that way any unselectable headers above it will also be scrolled
                // into view

                results.scrollTop(0);
                return;
            }

            children = this.findHighlightableChoices().find('.select2-result-label');

            child = $(children[index]);

            topOffset = (child.offset() || {}).top || 0;

            hb = topOffset + child.outerHeight(true);

            // if this is the last child lets also make sure select2-more-results is visible
            if (index === children.length - 1) {
                more = results.find("li.select2-more-results");
                if (more.length > 0) {
                    hb = more.offset().top + more.outerHeight(true);
                }
            }

            rb = results.offset().top + results.outerHeight(false);
            if (hb > rb) {
                results.scrollTop(results.scrollTop() + (hb - rb));
            }
            y = topOffset - results.offset().top;

            // make sure the top of the element is visible
            if (y < 0 && child.css('display') != 'none' ) {
                results.scrollTop(results.scrollTop() + y); // y is negative
            }
        },

        // abstract
        findHighlightableChoices: function() {
            return this.results.find(".select2-result-selectable:not(.select2-disabled):not(.select2-selected)");
        },

        // abstract
        moveHighlight: function (delta) {
            var choices = this.findHighlightableChoices(),
                index = this.highlight();

            while (index > -1 && index < choices.length) {
                index += delta;
                var choice = $(choices[index]);
                if (choice.hasClass("select2-result-selectable") && !choice.hasClass("select2-disabled") && !choice.hasClass("select2-selected")) {
                    this.highlight(index);
                    break;
                }
            }
        },

        // abstract
        highlight: function (index) {
            var choices = this.findHighlightableChoices(),
                choice,
                data;

            if (arguments.length === 0) {
                return indexOf(choices.filter(".select2-highlighted")[0], choices.get());
            }

            if (index >= choices.length) index = choices.length - 1;
            if (index < 0) index = 0;

            this.removeHighlight();

            choice = $(choices[index]);
            choice.addClass("select2-highlighted");

            // ensure assistive technology can determine the active choice
            this.search.attr("aria-activedescendant", choice.find(".select2-result-label").attr("id"));

            this.ensureHighlightVisible();

            this.liveRegion.text(choice.text());

            data = choice.data("select2-data");
            if (data) {
                this.opts.element.trigger({ type: "select2-highlight", val: this.id(data), choice: data });
            }
        },

        removeHighlight: function() {
            this.results.find(".select2-highlighted").removeClass("select2-highlighted");
        },

        touchMoved: function() {
            this._touchMoved = true;
        },

        clearTouchMoved: function() {
          this._touchMoved = false;
        },

        // abstract
        countSelectableResults: function() {
            return this.findHighlightableChoices().length;
        },

        // abstract
        highlightUnderEvent: function (event) {
            var el = $(event.target).closest(".select2-result-selectable");
            if (el.length > 0 && !el.is(".select2-highlighted")) {
                var choices = this.findHighlightableChoices();
                this.highlight(choices.index(el));
            } else if (el.length == 0) {
                // if we are over an unselectable item remove all highlights
                this.removeHighlight();
            }
        },

        // abstract
        loadMoreIfNeeded: function () {
            var results = this.results,
                more = results.find("li.select2-more-results"),
                below, // pixels the element is below the scroll fold, below==0 is when the element is starting to be visible
                page = this.resultsPage + 1,
                self=this,
                term=this.search.val(),
                context=this.context;

            if (more.length === 0) return;
            below = more.offset().top - results.offset().top - results.height();

            if (below <= this.opts.loadMorePadding) {
                more.addClass("select2-active");
                this.opts.query({
                        element: this.opts.element,
                        term: term,
                        page: page,
                        context: context,
                        matcher: this.opts.matcher,
                        callback: this.bind(function (data) {

                    // ignore a response if the select2 has been closed before it was received
                    if (!self.opened()) return;


                    self.opts.populateResults.call(this, results, data.results, {term: term, page: page, context:context});
                    self.postprocessResults(data, false, false);

                    if (data.more===true) {
                        more.detach().appendTo(results).html(self.opts.escapeMarkup(evaluate(self.opts.formatLoadMore, self.opts.element, page+1)));
                        window.setTimeout(function() { self.loadMoreIfNeeded(); }, 10);
                    } else {
                        more.remove();
                    }
                    self.positionDropdown();
                    self.resultsPage = page;
                    self.context = data.context;
                    this.opts.element.trigger({ type: "select2-loaded", items: data });
                })});
            }
        },

        /**
         * Default tokenizer function which does nothing
         */
        tokenize: function() {

        },

        /**
         * @param initial whether or not this is the call to this method right after the dropdown has been opened
         */
        // abstract
        updateResults: function (initial) {
            var search = this.search,
                results = this.results,
                opts = this.opts,
                data,
                self = this,
                input,
                term = search.val(),
                lastTerm = $.data(this.container, "select2-last-term"),
                // sequence number used to drop out-of-order responses
                queryNumber;

            // prevent duplicate queries against the same term
            if (initial !== true && lastTerm && equal(term, lastTerm)) return;

            $.data(this.container, "select2-last-term", term);

            // if the search is currently hidden we do not alter the results
            if (initial !== true && (this.showSearchInput === false || !this.opened())) {
                return;
            }

            function postRender() {
                search.removeClass("select2-active");
                self.positionDropdown();
                if (results.find('.select2-no-results,.select2-selection-limit,.select2-searching').length) {
                    self.liveRegion.text(results.text());
                }
                else {
                    self.liveRegion.text(self.opts.formatMatches(results.find('.select2-result-selectable:not(".select2-selected")').length));
                }
            }

            function render(html) {
                results.html(html);
                postRender();
            }

            queryNumber = ++this.queryCount;

            var maxSelSize = this.getMaximumSelectionSize();
            if (maxSelSize >=1) {
                data = this.data();
                if ($.isArray(data) && data.length >= maxSelSize && checkFormatter(opts.formatSelectionTooBig, "formatSelectionTooBig")) {
                    render("<li class='select2-selection-limit'>" + evaluate(opts.formatSelectionTooBig, opts.element, maxSelSize) + "</li>");
                    return;
                }
            }

            if (search.val().length < opts.minimumInputLength) {
                if (checkFormatter(opts.formatInputTooShort, "formatInputTooShort")) {
                    render("<li class='select2-no-results'>" + evaluate(opts.formatInputTooShort, opts.element, search.val(), opts.minimumInputLength) + "</li>");
                } else {
                    render("");
                }
                if (initial && this.showSearch) this.showSearch(true);
                return;
            }

            if (opts.maximumInputLength && search.val().length > opts.maximumInputLength) {
                if (checkFormatter(opts.formatInputTooLong, "formatInputTooLong")) {
                    render("<li class='select2-no-results'>" + evaluate(opts.formatInputTooLong, opts.element, search.val(), opts.maximumInputLength) + "</li>");
                } else {
                    render("");
                }
                return;
            }

            if (opts.formatSearching && this.findHighlightableChoices().length === 0) {
                render("<li class='select2-searching'>" + evaluate(opts.formatSearching, opts.element) + "</li>");
            }

            search.addClass("select2-active");

            this.removeHighlight();

            // give the tokenizer a chance to pre-process the input
            input = this.tokenize();
            if (input != undefined && input != null) {
                search.val(input);
            }

            this.resultsPage = 1;

            opts.query({
                element: opts.element,
                    term: search.val(),
                    page: this.resultsPage,
                    context: null,
                    matcher: opts.matcher,
                    callback: this.bind(function (data) {
                var def; // default choice

                // ignore old responses
                if (queryNumber != this.queryCount) {
                  return;
                }

                // ignore a response if the select2 has been closed before it was received
                if (!this.opened()) {
                    this.search.removeClass("select2-active");
                    return;
                }

                // handle ajax error
                if(data.hasError !== undefined && checkFormatter(opts.formatAjaxError, "formatAjaxError")) {
                    render("<li class='select2-ajax-error'>" + evaluate(opts.formatAjaxError, opts.element, data.jqXHR, data.textStatus, data.errorThrown) + "</li>");
                    return;
                }

                // save context, if any
                this.context = (data.context===undefined) ? null : data.context;
                // create a default choice and prepend it to the list
                if (this.opts.createSearchChoice && search.val() !== "") {
                    def = this.opts.createSearchChoice.call(self, search.val(), data.results);
                    if (def !== undefined && def !== null && self.id(def) !== undefined && self.id(def) !== null) {
                        if ($(data.results).filter(
                            function () {
                                return equal(self.id(this), self.id(def));
                            }).length === 0) {
                            this.opts.createSearchChoicePosition(data.results, def);
                        }
                    }
                }

                if (data.results.length === 0 && checkFormatter(opts.formatNoMatches, "formatNoMatches")) {
                    render("<li class='select2-no-results'>" + evaluate(opts.formatNoMatches, opts.element, search.val()) + "</li>");
                    if(this.showSearch){
                        this.showSearch(search.val());
                    }
                    return;
                }

                results.empty();
                self.opts.populateResults.call(this, results, data.results, {term: search.val(), page: this.resultsPage, context:null});

                if (data.more === true && checkFormatter(opts.formatLoadMore, "formatLoadMore")) {
                    results.append("<li class='select2-more-results'>" + opts.escapeMarkup(evaluate(opts.formatLoadMore, opts.element, this.resultsPage)) + "</li>");
                    window.setTimeout(function() { self.loadMoreIfNeeded(); }, 10);
                }

                this.postprocessResults(data, initial);

                postRender();

                this.opts.element.trigger({ type: "select2-loaded", items: data });
            })});
        },

        // abstract
        cancel: function () {
            this.close();
        },

        // abstract
        blur: function () {
            // if selectOnBlur == true, select the currently highlighted option
            if (this.opts.selectOnBlur)
                this.selectHighlighted({noFocus: true});

            this.close();
            this.container.removeClass("select2-container-active");
            // synonymous to .is(':focus'), which is available in jquery >= 1.6
            if (this.search[0] === document.activeElement) { this.search.blur(); }
            this.clearSearch();
            this.selection.find(".select2-search-choice-focus").removeClass("select2-search-choice-focus");
        },

        // abstract
        focusSearch: function () {
            focus(this.search);
        },

        // abstract
        selectHighlighted: function (options) {
            if (this._touchMoved) {
              this.clearTouchMoved();
              return;
            }
            var index=this.highlight(),
                highlighted=this.results.find(".select2-highlighted"),
                data = highlighted.closest('.select2-result').data("select2-data");

            if (data) {
                this.highlight(index);
                this.onSelect(data, options);
            } else if (options && options.noFocus) {
                this.close();
            }
        },

        // abstract
        getPlaceholder: function () {
            var placeholderOption;
            return this.opts.element.attr("placeholder") ||
                this.opts.element.attr("data-placeholder") || // jquery 1.4 compat
                this.opts.element.data("placeholder") ||
                this.opts.placeholder ||
                ((placeholderOption = this.getPlaceholderOption()) !== undefined ? placeholderOption.text() : undefined);
        },

        // abstract
        getPlaceholderOption: function() {
            if (this.select) {
                var firstOption = this.select.children('option').first();
                if (this.opts.placeholderOption !== undefined ) {
                    //Determine the placeholder option based on the specified placeholderOption setting
                    return (this.opts.placeholderOption === "first" && firstOption) ||
                           (typeof this.opts.placeholderOption === "function" && this.opts.placeholderOption(this.select));
                } else if ($.trim(firstOption.text()) === "" && firstOption.val() === "") {
                    //No explicit placeholder option specified, use the first if it's blank
                    return firstOption;
                }
            }
        },

        /**
         * Get the desired width for the container element.  This is
         * derived first from option `width` passed to select2, then
         * the inline 'style' on the original element, and finally
         * falls back to the jQuery calculated element width.
         */
        // abstract
        initContainerWidth: function () {
            function resolveContainerWidth() {
                var style, attrs, matches, i, l, attr;

                if (this.opts.width === "off") {
                    return null;
                } else if (this.opts.width === "element"){
                    return this.opts.element.outerWidth(false) === 0 ? 'auto' : this.opts.element.outerWidth(false) + 'px';
                } else if (this.opts.width === "copy" || this.opts.width === "resolve") {
                    // check if there is inline style on the element that contains width
                    style = this.opts.element.attr('style');
                    if (typeof(style) === "string") {
                        attrs = style.split(';');
                        for (i = 0, l = attrs.length; i < l; i = i + 1) {
                            attr = attrs[i].replace(/\s/g, '');
                            matches = attr.match(/^width:(([-+]?([0-9]*\.)?[0-9]+)(px|em|ex|%|in|cm|mm|pt|pc))/i);
                            if (matches !== null && matches.length >= 1)
                                return matches[1];
                        }
                    }

                    if (this.opts.width === "resolve") {
                        // next check if css('width') can resolve a width that is percent based, this is sometimes possible
                        // when attached to input type=hidden or elements hidden via css
                        style = this.opts.element.css('width');
                        if (style.indexOf("%") > 0) return style;

                        // finally, fallback on the calculated width of the element
                        return (this.opts.element.outerWidth(false) === 0 ? 'auto' : this.opts.element.outerWidth(false) + 'px');
                    }

                    return null;
                } else if ($.isFunction(this.opts.width)) {
                    return this.opts.width();
                } else {
                    return this.opts.width;
               }
            };

            var width = resolveContainerWidth.call(this);
            if (width !== null) {
                this.container.css("width", width);
            }
        }
    });

    SingleSelect2 = clazz(AbstractSelect2, {

        // single

        createContainer: function () {
            var container = $(document.createElement("div")).attr({
                "class": "select2-container"
            }).html([
                "<a href='javascript:void(0)' class='select2-choice' tabindex='-1'>",
                "   <span class='select2-chosen'>&#160;</span><abbr class='select2-search-choice-close'></abbr>",
                "   <span class='select2-arrow' role='presentation'><b role='presentation'></b></span>",
                "</a>",
                "<label for='' class='select2-offscreen'></label>",
                "<input class='select2-focusser select2-offscreen' type='text' aria-haspopup='true' role='button' />",
                "<div class='select2-drop select2-display-none'>",
                "   <div class='select2-search'>",
                "       <label for='' class='select2-offscreen'></label>",
                "       <input type='text' autocomplete='off' autocorrect='off' autocapitalize='off' spellcheck='false' class='select2-input' role='combobox' aria-expanded='true'",
                "       aria-autocomplete='list' />",
                "   </div>",
                "   <ul class='select2-results' role='listbox'>",
                "   </ul>",
                "</div>"].join(""));
            return container;
        },

        // single
        enableInterface: function() {
            if (this.parent.enableInterface.apply(this, arguments)) {
                this.focusser.prop("disabled", !this.isInterfaceEnabled());
            }
        },

        // single
        opening: function () {
            var el, range, len;

            if (this.opts.minimumResultsForSearch >= 0) {
                this.showSearch(true);
            }

            this.parent.opening.apply(this, arguments);

            if (this.showSearchInput !== false) {
                // IE appends focusser.val() at the end of field :/ so we manually insert it at the beginning using a range
                // all other browsers handle this just fine

                this.search.val(this.focusser.val());
            }
            if (this.opts.shouldFocusInput(this)) {
                this.search.focus();
                // move the cursor to the end after focussing, otherwise it will be at the beginning and
                // new text will appear *before* focusser.val()
                el = this.search.get(0);
                if (el.createTextRange) {
                    range = el.createTextRange();
                    range.collapse(false);
                    range.select();
                } else if (el.setSelectionRange) {
                    len = this.search.val().length;
                    el.setSelectionRange(len, len);
                }
            }

            this.prefillNextSearchTerm();

            this.focusser.prop("disabled", true).val("");
            this.updateResults(true);
            this.opts.element.trigger($.Event("select2-open"));
        },

        // single
        close: function () {
            if (!this.opened()) return;
            this.parent.close.apply(this, arguments);

            this.focusser.prop("disabled", false);

            if (this.opts.shouldFocusInput(this)) {
                this.focusser.focus();
            }
        },

        // single
        focus: function () {
            if (this.opened()) {
                this.close();
            } else {
                this.focusser.prop("disabled", false);
                if (this.opts.shouldFocusInput(this)) {
                    this.focusser.focus();
                }
            }
        },

        // single
        isFocused: function () {
            return this.container.hasClass("select2-container-active");
        },

        // single
        cancel: function () {
            this.parent.cancel.apply(this, arguments);
            this.focusser.prop("disabled", false);

            if (this.opts.shouldFocusInput(this)) {
                this.focusser.focus();
            }
        },

        // single
        destroy: function() {
            $("label[for='" + this.focusser.attr('id') + "']")
                .attr('for', this.opts.element.attr("id"));
            this.parent.destroy.apply(this, arguments);

            cleanupJQueryElements.call(this,
                "selection",
                "focusser"
            );
        },

        // single
        initContainer: function () {

            var selection,
                container = this.container,
                dropdown = this.dropdown,
                idSuffix = nextUid(),
                elementLabel;

            if (this.opts.minimumResultsForSearch < 0) {
                this.showSearch(false);
            } else {
                this.showSearch(true);
            }

            this.selection = selection = container.find(".select2-choice");

            this.focusser = container.find(".select2-focusser");

            // add aria associations
            selection.find(".select2-chosen").attr("id", "select2-chosen-"+idSuffix);
            this.focusser.attr("aria-labelledby", "select2-chosen-"+idSuffix);
            this.results.attr("id", "select2-results-"+idSuffix);
            this.search.attr("aria-owns", "select2-results-"+idSuffix);

            // rewrite labels from original element to focusser
            this.focusser.attr("id", "s2id_autogen"+idSuffix);

            elementLabel = $("label[for='" + this.opts.element.attr("id") + "']");
            this.opts.element.on('focus.select2', this.bind(function () { this.focus(); }));

            this.focusser.prev()
                .text(elementLabel.text())
                .attr('for', this.focusser.attr('id'));

            // Ensure the original element retains an accessible name
            var originalTitle = this.opts.element.attr("title");
            this.opts.element.attr("title", (originalTitle || elementLabel.text()));

            this.focusser.attr("tabindex", this.elementTabIndex);

            // write label for search field using the label from the focusser element
            this.search.attr("id", this.focusser.attr('id') + '_search');

            this.search.prev()
                .text($("label[for='" + this.focusser.attr('id') + "']").text())
                .attr('for', this.search.attr('id'));

            this.search.on("keydown", this.bind(function (e) {
                if (!this.isInterfaceEnabled()) return;

                // filter 229 keyCodes (input method editor is processing key input)
                if (229 == e.keyCode) return;

                if (e.which === KEY.PAGE_UP || e.which === KEY.PAGE_DOWN) {
                    // prevent the page from scrolling
                    killEvent(e);
                    return;
                }

                switch (e.which) {
                    case KEY.UP:
                    case KEY.DOWN:
                        this.moveHighlight((e.which === KEY.UP) ? -1 : 1);
                        killEvent(e);
                        return;
                    case KEY.ENTER:
                        this.selectHighlighted();
                        killEvent(e);
                        return;
                    case KEY.TAB:
                        this.selectHighlighted({noFocus: true});
                        return;
                    case KEY.ESC:
                        this.cancel(e);
                        killEvent(e);
                        return;
                }
            }));

            this.search.on("blur", this.bind(function(e) {
                // a workaround for chrome to keep the search field focussed when the scroll bar is used to scroll the dropdown.
                // without this the search field loses focus which is annoying
                if (document.activeElement === this.body.get(0)) {
                    window.setTimeout(this.bind(function() {
                        if (this.opened() && this.results && this.results.length > 1) {
                            this.search.focus();
                        }
                    }), 0);
                }
            }));

            this.focusser.on("keydown", this.bind(function (e) {
                if (!this.isInterfaceEnabled()) return;

                if (e.which === KEY.TAB || KEY.isControl(e) || KEY.isFunctionKey(e) || e.which === KEY.ESC) {
                    return;
                }

                if (this.opts.openOnEnter === false && e.which === KEY.ENTER) {
                    killEvent(e);
                    return;
                }

                if (e.which == KEY.DOWN || e.which == KEY.UP
                    || (e.which == KEY.ENTER && this.opts.openOnEnter)) {

                    if (e.altKey || e.ctrlKey || e.shiftKey || e.metaKey) return;

                    this.open();
                    killEvent(e);
                    return;
                }

                if (e.which == KEY.DELETE || e.which == KEY.BACKSPACE) {
                    if (this.opts.allowClear) {
                        this.clear();
                    }
                    killEvent(e);
                    return;
                }
            }));


            installKeyUpChangeEvent(this.focusser);
            this.focusser.on("keyup-change input", this.bind(function(e) {
                if (this.opts.minimumResultsForSearch >= 0) {
                    e.stopPropagation();
                    if (this.opened()) return;
                    this.open();
                }
            }));

            selection.on("mousedown touchstart", "abbr", this.bind(function (e) {
                if (!this.isInterfaceEnabled()) {
                    return;
                }

                this.clear();
                killEventImmediately(e);
                this.close();

                if (this.selection) {
                    this.selection.focus();
                }
            }));

            selection.on("mousedown touchstart", this.bind(function (e) {
                // Prevent IE from generating a click event on the body
                reinsertElement(selection);

                if (!this.container.hasClass("select2-container-active")) {
                    this.opts.element.trigger($.Event("select2-focus"));
                }

                if (this.opened()) {
                    this.close();
                } else if (this.isInterfaceEnabled()) {
                    this.open();
                }

                killEvent(e);
            }));

            dropdown.on("mousedown touchstart", this.bind(function() {
                if (this.opts.shouldFocusInput(this)) {
                    this.search.focus();
                }
            }));

            selection.on("focus", this.bind(function(e) {
                killEvent(e);
            }));

            this.focusser.on("focus", this.bind(function(){
                if (!this.container.hasClass("select2-container-active")) {
                    this.opts.element.trigger($.Event("select2-focus"));
                }
                this.container.addClass("select2-container-active");
            })).on("blur", this.bind(function() {
                if (!this.opened()) {
                    this.container.removeClass("select2-container-active");
                    this.opts.element.trigger($.Event("select2-blur"));
                }
            }));
            this.search.on("focus", this.bind(function(){
                if (!this.container.hasClass("select2-container-active")) {
                    this.opts.element.trigger($.Event("select2-focus"));
                }
                this.container.addClass("select2-container-active");
            }));

            this.initContainerWidth();
            this.opts.element.hide();
            this.setPlaceholder();

        },

        // single
        clear: function(triggerChange) {
            var data=this.selection.data("select2-data");
            if (data) { // guard against queued quick consecutive clicks
                var evt = $.Event("select2-clearing");
                this.opts.element.trigger(evt);
                if (evt.isDefaultPrevented()) {
                    return;
                }
                var placeholderOption = this.getPlaceholderOption();
                this.opts.element.val(placeholderOption ? placeholderOption.val() : "");
                this.selection.find(".select2-chosen").empty();
                this.selection.removeData("select2-data");
                this.setPlaceholder();

                if (triggerChange !== false){
                    this.opts.element.trigger({ type: "select2-removed", val: this.id(data), choice: data });
                    this.triggerChange({removed:data});
                }
            }
        },

        /**
         * Sets selection based on source element's value
         */
        // single
        initSelection: function () {
            var selected;
            if (this.isPlaceholderOptionSelected()) {
                this.updateSelection(null);
                this.close();
                this.setPlaceholder();
            } else {
                var self = this;
                this.opts.initSelection.call(null, this.opts.element, function(selected){
                    if (selected !== undefined && selected !== null) {
                        self.updateSelection(selected);
                        self.close();
                        self.setPlaceholder();
                        self.lastSearchTerm = self.search.val();
                    }
                });
            }
        },

        isPlaceholderOptionSelected: function() {
            var placeholderOption;
            if (this.getPlaceholder() === undefined) return false; // no placeholder specified so no option should be considered
            return ((placeholderOption = this.getPlaceholderOption()) !== undefined && placeholderOption.prop("selected"))
                || (this.opts.element.val() === "")
                || (this.opts.element.val() === undefined)
                || (this.opts.element.val() === null);
        },

        // single
        prepareOpts: function () {
            var opts = this.parent.prepareOpts.apply(this, arguments),
                self=this;

            if (opts.element.get(0).tagName.toLowerCase() === "select") {
                // install the selection initializer
                opts.initSelection = function (element, callback) {
                    var selected = element.find("option").filter(function() { return this.selected && !this.disabled });
                    // a single select box always has a value, no need to null check 'selected'
                    callback(self.optionToData(selected));
                };
            } else if ("data" in opts) {
                // install default initSelection when applied to hidden input and data is local
                opts.initSelection = opts.initSelection || function (element, callback) {
                    var id = element.val();
                    //search in data by id, storing the actual matching item
                    var match = null;
                    opts.query({
                        matcher: function(term, text, el){
                            var is_match = equal(id, opts.id(el));
                            if (is_match) {
                                match = el;
                            }
                            return is_match;
                        },
                        callback: !$.isFunction(callback) ? $.noop : function() {
                            callback(match);
                        }
                    });
                };
            }

            return opts;
        },

        // single
        getPlaceholder: function() {
            // if a placeholder is specified on a single select without a valid placeholder option ignore it
            if (this.select) {
                if (this.getPlaceholderOption() === undefined) {
                    return undefined;
                }
            }

            return this.parent.getPlaceholder.apply(this, arguments);
        },

        // single
        setPlaceholder: function () {
            var placeholder = this.getPlaceholder();

            if (this.isPlaceholderOptionSelected() && placeholder !== undefined) {

                // check for a placeholder option if attached to a select
                if (this.select && this.getPlaceholderOption() === undefined) return;

                this.selection.find(".select2-chosen").html(this.opts.escapeMarkup(placeholder));

                this.selection.addClass("select2-default");

                this.container.removeClass("select2-allowclear");
            }
        },

        // single
        postprocessResults: function (data, initial, noHighlightUpdate) {
            var selected = 0, self = this, showSearchInput = true;

            // find the selected element in the result list

            this.findHighlightableChoices().each2(function (i, elm) {
                if (equal(self.id(elm.data("select2-data")), self.opts.element.val())) {
                    selected = i;
                    return false;
                }
            });

            // and highlight it
            if (noHighlightUpdate !== false) {
                if (initial === true && selected >= 0) {
                    this.highlight(selected);
                } else {
                    this.highlight(0);
                }
            }

            // hide the search box if this is the first we got the results and there are enough of them for search

            if (initial === true) {
                var min = this.opts.minimumResultsForSearch;
                if (min >= 0) {
                    this.showSearch(countResults(data.results) >= min);
                }
            }
        },

        // single
        showSearch: function(showSearchInput) {
            if (this.showSearchInput === showSearchInput) return;

            this.showSearchInput = showSearchInput;

            this.dropdown.find(".select2-search").toggleClass("select2-search-hidden", !showSearchInput);
            this.dropdown.find(".select2-search").toggleClass("select2-offscreen", !showSearchInput);
            //add "select2-with-searchbox" to the container if search box is shown
            $(this.dropdown, this.container).toggleClass("select2-with-searchbox", showSearchInput);
        },

        // single
        onSelect: function (data, options) {

            if (!this.triggerSelect(data)) { return; }

            var old = this.opts.element.val(),
                oldData = this.data();

            this.opts.element.val(this.id(data));
            this.updateSelection(data);

            this.opts.element.trigger({ type: "select2-selected", val: this.id(data), choice: data });

            this.lastSearchTerm = this.search.val();
            this.close();

            if ((!options || !options.noFocus) && this.opts.shouldFocusInput(this)) {
                this.focusser.focus();
            }

            if (!equal(old, this.id(data))) {
                this.triggerChange({ added: data, removed: oldData });
            }
        },

        // single
        updateSelection: function (data) {

            var container=this.selection.find(".select2-chosen"), formatted, cssClass;

            this.selection.data("select2-data", data);

            container.empty();
            if (data !== null) {
                formatted=this.opts.formatSelection(data, container, this.opts.escapeMarkup);
            }
            if (formatted !== undefined) {
                container.append(formatted);
            }
            cssClass=this.opts.formatSelectionCssClass(data, container);
            if (cssClass !== undefined) {
                container.addClass(cssClass);
            }

            this.selection.removeClass("select2-default");

            if (this.opts.allowClear && this.getPlaceholder() !== undefined) {
                this.container.addClass("select2-allowclear");
            }
        },

        // single
        val: function () {
            var val,
                triggerChange = false,
                data = null,
                self = this,
                oldData = this.data();

            if (arguments.length === 0) {
                return this.opts.element.val();
            }

            val = arguments[0];

            if (arguments.length > 1) {
                triggerChange = arguments[1];

                if (this.opts.debug && console && console.warn) {
                    console.warn(
                        'Select2: The second option to `select2("val")` is not supported in Select2 4.0.0. ' +
                        'The `change` event will always be triggered in 4.0.0.'
                    );
                }
            }

            if (this.select) {
                if (this.opts.debug && console && console.warn) {
                    console.warn(
                        'Select2: Setting the value on a <select> using `select2("val")` is no longer supported in 4.0.0. ' +
                        'You can use the `.val(newValue).trigger("change")` method provided by jQuery instead.'
                    );
                }

                this.select
                    .val(val)
                    .find("option").filter(function() { return this.selected }).each2(function (i, elm) {
                        data = self.optionToData(elm);
                        return false;
                    });
                this.updateSelection(data);
                this.setPlaceholder();
                if (triggerChange) {
                    this.triggerChange({added: data, removed:oldData});
                }
            } else {
                // val is an id. !val is true for [undefined,null,'',0] - 0 is legal
                if (!val && val !== 0) {
                    this.clear(triggerChange);
                    return;
                }
                if (this.opts.initSelection === undefined) {
                    throw new Error("cannot call val() if initSelection() is not defined");
                }
                this.opts.element.val(val);
                this.opts.initSelection(this.opts.element, function(data){
                    self.opts.element.val(!data ? "" : self.id(data));
                    self.updateSelection(data);
                    self.setPlaceholder();
                    if (triggerChange) {
                        self.triggerChange({added: data, removed:oldData});
                    }
                });
            }
        },

        // single
        clearSearch: function () {
            this.search.val("");
            this.focusser.val("");
        },

        // single
        data: function(value) {
            var data,
                triggerChange = false;

            if (arguments.length === 0) {
                data = this.selection.data("select2-data");
                if (data == undefined) data = null;
                return data;
            } else {
                if (this.opts.debug && console && console.warn) {
                    console.warn(
                        'Select2: The `select2("data")` method can no longer set selected values in 4.0.0, ' +
                        'consider using the `.val()` method instead.'
                    );
                }

                if (arguments.length > 1) {
                    triggerChange = arguments[1];
                }
                if (!value) {
                    this.clear(triggerChange);
                } else {
                    data = this.data();
                    this.opts.element.val(!value ? "" : this.id(value));
                    this.updateSelection(value);
                    if (triggerChange) {
                        this.triggerChange({added: value, removed:data});
                    }
                }
            }
        }
    });

    MultiSelect2 = clazz(AbstractSelect2, {

        // multi
        createContainer: function () {
            var container = $(document.createElement("div")).attr({
                "class": "select2-container select2-container-multi"
            }).html([
                "<ul class='select2-choices'>",
                "  <li class='select2-search-field'>",
                "    <label for='' class='select2-offscreen'></label>",
                "    <input type='text' autocomplete='off' autocorrect='off' autocapitalize='off' spellcheck='false' class='select2-input'>",
                "  </li>",
                "</ul>",
                "<div class='select2-drop select2-drop-multi select2-display-none'>",
                "   <ul class='select2-results'>",
                "   </ul>",
                "</div>"].join(""));
            return container;
        },

        // multi
        prepareOpts: function () {
            var opts = this.parent.prepareOpts.apply(this, arguments),
                self=this;

            // TODO validate placeholder is a string if specified
            if (opts.element.get(0).tagName.toLowerCase() === "select") {
                // install the selection initializer
                opts.initSelection = function (element, callback) {

                    var data = [];

                    element.find("option").filter(function() { return this.selected && !this.disabled }).each2(function (i, elm) {
                        data.push(self.optionToData(elm));
                    });
                    callback(data);
                };
            } else if ("data" in opts) {
                // install default initSelection when applied to hidden input and data is local
                opts.initSelection = opts.initSelection || function (element, callback) {
                    var ids = splitVal(element.val(), opts.separator, opts.transformVal);
                    //search in data by array of ids, storing matching items in a list
                    var matches = [];
                    opts.query({
                        matcher: function(term, text, el){
                            var is_match = $.grep(ids, function(id) {
                                return equal(id, opts.id(el));
                            }).length;
                            if (is_match) {
                                matches.push(el);
                            }
                            return is_match;
                        },
                        callback: !$.isFunction(callback) ? $.noop : function() {
                            // reorder matches based on the order they appear in the ids array because right now
                            // they are in the order in which they appear in data array
                            var ordered = [];
                            for (var i = 0; i < ids.length; i++) {
                                var id = ids[i];
                                for (var j = 0; j < matches.length; j++) {
                                    var match = matches[j];
                                    if (equal(id, opts.id(match))) {
                                        ordered.push(match);
                                        matches.splice(j, 1);
                                        break;
                                    }
                                }
                            }
                            callback(ordered);
                        }
                    });
                };
            }

            return opts;
        },

        // multi
        selectChoice: function (choice) {

            var selected = this.container.find(".select2-search-choice-focus");
            if (selected.length && choice && choice[0] == selected[0]) {

            } else {
                if (selected.length) {
                    this.opts.element.trigger("choice-deselected", selected);
                }
                selected.removeClass("select2-search-choice-focus");
                if (choice && choice.length) {
                    this.close();
                    choice.addClass("select2-search-choice-focus");
                    this.opts.element.trigger("choice-selected", choice);
                }
            }
        },

        // multi
        destroy: function() {
            $("label[for='" + this.search.attr('id') + "']")
                .attr('for', this.opts.element.attr("id"));
            this.parent.destroy.apply(this, arguments);

            cleanupJQueryElements.call(this,
                "searchContainer",
                "selection"
            );
        },

        // multi
        initContainer: function () {

            var selector = ".select2-choices", selection;

            this.searchContainer = this.container.find(".select2-search-field");
            this.selection = selection = this.container.find(selector);

            var _this = this;
            this.selection.on("click", ".select2-container:not(.select2-container-disabled) .select2-search-choice:not(.select2-locked)", function (e) {
                _this.search[0].focus();
                _this.selectChoice($(this));
            });

            // rewrite labels from original element to focusser
            this.search.attr("id", "s2id_autogen"+nextUid());

            this.search.prev()
                .text($("label[for='" + this.opts.element.attr("id") + "']").text())
                .attr('for', this.search.attr('id'));
            this.opts.element.on('focus.select2', this.bind(function () { this.focus(); }));

            this.search.on("input paste", this.bind(function() {
                if (this.search.attr('placeholder') && this.search.val().length == 0) return;
                if (!this.isInterfaceEnabled()) return;
                if (!this.opened()) {
                    this.open();
                }
            }));

            this.search.attr("tabindex", this.elementTabIndex);

            this.keydowns = 0;
            this.search.on("keydown", this.bind(function (e) {
                if (!this.isInterfaceEnabled()) return;

                ++this.keydowns;
                var selected = selection.find(".select2-search-choice-focus");
                var prev = selected.prev(".select2-search-choice:not(.select2-locked)");
                var next = selected.next(".select2-search-choice:not(.select2-locked)");
                var pos = getCursorInfo(this.search);

                if (selected.length &&
                    (e.which == KEY.LEFT || e.which == KEY.RIGHT || e.which == KEY.BACKSPACE || e.which == KEY.DELETE || e.which == KEY.ENTER)) {
                    var selectedChoice = selected;
                    if (e.which == KEY.LEFT && prev.length) {
                        selectedChoice = prev;
                    }
                    else if (e.which == KEY.RIGHT) {
                        selectedChoice = next.length ? next : null;
                    }
                    else if (e.which === KEY.BACKSPACE) {
                        if (this.unselect(selected.first())) {
                            this.search.width(10);
                            selectedChoice = prev.length ? prev : next;
                        }
                    } else if (e.which == KEY.DELETE) {
                        if (this.unselect(selected.first())) {
                            this.search.width(10);
                            selectedChoice = next.length ? next : null;
                        }
                    } else if (e.which == KEY.ENTER) {
                        selectedChoice = null;
                    }

                    this.selectChoice(selectedChoice);
                    killEvent(e);
                    if (!selectedChoice || !selectedChoice.length) {
                        this.open();
                    }
                    return;
                } else if (((e.which === KEY.BACKSPACE && this.keydowns == 1)
                    || e.which == KEY.LEFT) && (pos.offset == 0 && !pos.length)) {

                    this.selectChoice(selection.find(".select2-search-choice:not(.select2-locked)").last());
                    killEvent(e);
                    return;
                } else {
                    this.selectChoice(null);
                }

                if (this.opened()) {
                    switch (e.which) {
                    case KEY.UP:
                    case KEY.DOWN:
                        this.moveHighlight((e.which === KEY.UP) ? -1 : 1);
                        killEvent(e);
                        return;
                    case KEY.ENTER:
                        this.selectHighlighted();
                        killEvent(e);
                        return;
                    case KEY.TAB:
                        this.selectHighlighted({noFocus:true});
                        this.close();
                        return;
                    case KEY.ESC:
                        this.cancel(e);
                        killEvent(e);
                        return;
                    }
                }

                if (e.which === KEY.TAB || KEY.isControl(e) || KEY.isFunctionKey(e)
                 || e.which === KEY.BACKSPACE || e.which === KEY.ESC) {
                    return;
                }

                if (e.which === KEY.ENTER) {
                    if (this.opts.openOnEnter === false) {
                        return;
                    } else if (e.altKey || e.ctrlKey || e.shiftKey || e.metaKey) {
                        return;
                    }
                }

                this.open();

                if (e.which === KEY.PAGE_UP || e.which === KEY.PAGE_DOWN) {
                    // prevent the page from scrolling
                    killEvent(e);
                }

                if (e.which === KEY.ENTER) {
                    // prevent form from being submitted
                    killEvent(e);
                }

            }));

            this.search.on("keyup", this.bind(function (e) {
                this.keydowns = 0;
                this.resizeSearch();
            })
            );

            this.search.on("blur", this.bind(function(e) {
                this.container.removeClass("select2-container-active");
                this.search.removeClass("select2-focused");
                this.selectChoice(null);
                if (!this.opened()) this.clearSearch();
                e.stopImmediatePropagation();
                this.opts.element.trigger($.Event("select2-blur"));
            }));

            this.container.on("click", selector, this.bind(function (e) {
                if (!this.isInterfaceEnabled()) return;
                if ($(e.target).closest(".select2-search-choice").length > 0) {
                    // clicked inside a select2 search choice, do not open
                    return;
                }
                this.selectChoice(null);
                this.clearPlaceholder();
                if (!this.container.hasClass("select2-container-active")) {
                    this.opts.element.trigger($.Event("select2-focus"));
                }
                this.open();
                this.focusSearch();
                e.preventDefault();
            }));

            this.container.on("focus", selector, this.bind(function () {
                if (!this.isInterfaceEnabled()) return;
                if (!this.container.hasClass("select2-container-active")) {
                    this.opts.element.trigger($.Event("select2-focus"));
                }
                this.container.addClass("select2-container-active");
                this.dropdown.addClass("select2-drop-active");
                this.clearPlaceholder();
            }));

            this.initContainerWidth();
            this.opts.element.hide();

            // set the placeholder if necessary
            this.clearSearch();
        },

        // multi
        enableInterface: function() {
            if (this.parent.enableInterface.apply(this, arguments)) {
                this.search.prop("disabled", !this.isInterfaceEnabled());
            }
        },

        // multi
        initSelection: function () {
            var data;
            if (this.opts.element.val() === "" && this.opts.element.text() === "") {
                this.updateSelection([]);
                this.close();
                // set the placeholder if necessary
                this.clearSearch();
            }
            if (this.select || this.opts.element.val() !== "") {
                var self = this;
                this.opts.initSelection.call(null, this.opts.element, function(data){
                    if (data !== undefined && data !== null) {
                        self.updateSelection(data);
                        self.close();
                        // set the placeholder if necessary
                        self.clearSearch();
                    }
                });
            }
        },

        // multi
        clearSearch: function () {
            var placeholder = this.getPlaceholder(),
                maxWidth = this.getMaxSearchWidth();

            if (placeholder !== undefined  && this.getVal().length === 0 && this.search.hasClass("select2-focused") === false) {
                this.search.val(placeholder).addClass("select2-default");
                // stretch the search box to full width of the container so as much of the placeholder is visible as possible
                // we could call this.resizeSearch(), but we do not because that requires a sizer and we do not want to create one so early because of a firefox bug, see #944
                this.search.width(maxWidth > 0 ? maxWidth : this.container.css("width"));
            } else {
                this.search.val("").width(10);
            }
        },

        // multi
        clearPlaceholder: function () {
            if (this.search.hasClass("select2-default")) {
                this.search.val("").removeClass("select2-default");
            }
        },

        // multi
        opening: function () {
            this.clearPlaceholder(); // should be done before super so placeholder is not used to search
            this.resizeSearch();

            this.parent.opening.apply(this, arguments);

            this.focusSearch();

            this.prefillNextSearchTerm();
            this.updateResults(true);

            if (this.opts.shouldFocusInput(this)) {
                this.search.focus();
            }
            this.opts.element.trigger($.Event("select2-open"));
        },

        // multi
        close: function () {
            if (!this.opened()) return;
            this.parent.close.apply(this, arguments);
        },

        // multi
        focus: function () {
            this.close();
            this.search.focus();
        },

        // multi
        isFocused: function () {
            return this.search.hasClass("select2-focused");
        },

        // multi
        updateSelection: function (data) {
            var ids = {}, filtered = [], self = this;

            // filter out duplicates
            $(data).each(function () {
                if (!(self.id(this) in ids)) {
                    ids[self.id(this)] = 0;
                    filtered.push(this);
                }
            });

            this.selection.find(".select2-search-choice").remove();
            this.addSelectedChoice(filtered);
            self.postprocessResults();
        },

        // multi
        tokenize: function() {
            var input = this.search.val();
            input = this.opts.tokenizer.call(this, input, this.data(), this.bind(this.onSelect), this.opts);
            if (input != null && input != undefined) {
                this.search.val(input);
                if (input.length > 0) {
                    this.open();
                }
            }

        },

        // multi
        onSelect: function (data, options) {

            if (!this.triggerSelect(data) || data.text === "") { return; }

            this.addSelectedChoice(data);

            this.opts.element.trigger({ type: "selected", val: this.id(data), choice: data });

            // keep track of the search's value before it gets cleared
            this.lastSearchTerm = this.search.val();

            this.clearSearch();
            this.updateResults();

            if (this.select || !this.opts.closeOnSelect) this.postprocessResults(data, false, this.opts.closeOnSelect===true);

            if (this.opts.closeOnSelect) {
                this.close();
                this.search.width(10);
            } else {
                if (this.countSelectableResults()>0) {
                    this.search.width(10);
                    this.resizeSearch();
                    if (this.getMaximumSelectionSize() > 0 && this.val().length >= this.getMaximumSelectionSize()) {
                        // if we reached max selection size repaint the results so choices
                        // are replaced with the max selection reached message
                        this.updateResults(true);
                    } else {
                        // initializes search's value with nextSearchTerm and update search result
                        if (this.prefillNextSearchTerm()) {
                            this.updateResults();
                        }
                    }
                    this.positionDropdown();
                } else {
                    // if nothing left to select close
                    this.close();
                    this.search.width(10);
                }
            }

            // since its not possible to select an element that has already been
            // added we do not need to check if this is a new element before firing change
            this.triggerChange({ added: data });

            if (!options || !options.noFocus)
                this.focusSearch();
        },

        // multi
        cancel: function () {
            this.close();
            this.focusSearch();
        },

        addSelectedChoice: function (data) {
            var val = this.getVal(), self = this;
            $(data).each(function () {
                val.push(self.createChoice(this));
            });
            this.setVal(val);
        },

        createChoice: function (data) {
            var enableChoice = !data.locked,
                enabledItem = $(
                    "<li class='select2-search-choice'>" +
                    "    <div></div>" +
                    "    <a href='#' class='select2-search-choice-close' tabindex='-1'></a>" +
                    "</li>"),
                disabledItem = $(
                    "<li class='select2-search-choice select2-locked'>" +
                    "<div></div>" +
                    "</li>");
            var choice = enableChoice ? enabledItem : disabledItem,
                id = this.id(data),
                formatted,
                cssClass;

            formatted=this.opts.formatSelection(data, choice.find("div"), this.opts.escapeMarkup);
            if (formatted != undefined) {
                choice.find("div").replaceWith($("<div></div>").html(formatted));
            }
            cssClass=this.opts.formatSelectionCssClass(data, choice.find("div"));
            if (cssClass != undefined) {
                choice.addClass(cssClass);
            }

            if(enableChoice){
              choice.find(".select2-search-choice-close")
                  .on("mousedown", killEvent)
                  .on("click dblclick", this.bind(function (e) {
                  if (!this.isInterfaceEnabled()) return;

                  this.unselect($(e.target));
                  this.selection.find(".select2-search-choice-focus").removeClass("select2-search-choice-focus");
                  killEvent(e);
                  this.close();
                  this.focusSearch();
              })).on("focus", this.bind(function () {
                  if (!this.isInterfaceEnabled()) return;
                  this.container.addClass("select2-container-active");
                  this.dropdown.addClass("select2-drop-active");
              }));
            }

            choice.data("select2-data", data);
            choice.insertBefore(this.searchContainer);

            return id;
        },

        // multi
        unselect: function (selected) {
            var val = this.getVal(),
                data,
                index;
            selected = selected.closest(".select2-search-choice");

            if (selected.length === 0) {
                throw "Invalid argument: " + selected + ". Must be .select2-search-choice";
            }

            data = selected.data("select2-data");

            if (!data) {
                // prevent a race condition when the 'x' is clicked really fast repeatedly the event can be queued
                // and invoked on an element already removed
                return;
            }

            var evt = $.Event("select2-removing");
            evt.val = this.id(data);
            evt.choice = data;
            this.opts.element.trigger(evt);

            if (evt.isDefaultPrevented()) {
                return false;
            }

            while((index = indexOf(this.id(data), val)) >= 0) {
                val.splice(index, 1);
                this.setVal(val);
                if (this.select) this.postprocessResults();
            }

            selected.remove();

            this.opts.element.trigger({ type: "select2-removed", val: this.id(data), choice: data });
            this.triggerChange({ removed: data });

            return true;
        },

        // multi
        postprocessResults: function (data, initial, noHighlightUpdate) {
            var val = this.getVal(),
                choices = this.results.find(".select2-result"),
                compound = this.results.find(".select2-result-with-children"),
                self = this;

            choices.each2(function (i, choice) {
                var id = self.id(choice.data("select2-data"));
                if (indexOf(id, val) >= 0) {
                    choice.addClass("select2-selected");
                    // mark all children of the selected parent as selected
                    choice.find(".select2-result-selectable").addClass("select2-selected");
                }
            });

            compound.each2(function(i, choice) {
                // hide an optgroup if it doesn't have any selectable children
                if (!choice.is('.select2-result-selectable')
                    && choice.find(".select2-result-selectable:not(.select2-selected)").length === 0) {
                    choice.addClass("select2-selected");
                }
            });

            if (this.highlight() == -1 && noHighlightUpdate !== false && this.opts.closeOnSelect === true){
                self.highlight(0);
            }

            //If all results are chosen render formatNoMatches
            if(!this.opts.createSearchChoice && !choices.filter('.select2-result:not(.select2-selected)').length > 0){
                if(!data || data && !data.more && this.results.find(".select2-no-results").length === 0) {
                    if (checkFormatter(self.opts.formatNoMatches, "formatNoMatches")) {
                        this.results.append("<li class='select2-no-results'>" + evaluate(self.opts.formatNoMatches, self.opts.element, self.search.val()) + "</li>");
                    }
                }
            }

        },

        // multi
        getMaxSearchWidth: function() {
            return this.selection.width() - getSideBorderPadding(this.search);
        },

        // multi
        resizeSearch: function () {
            var minimumWidth, left, maxWidth, containerLeft, searchWidth,
                sideBorderPadding = getSideBorderPadding(this.search);

            minimumWidth = measureTextWidth(this.search) + 10;

            left = this.search.offset().left;

            maxWidth = this.selection.width();
            containerLeft = this.selection.offset().left;

            searchWidth = maxWidth - (left - containerLeft) - sideBorderPadding;

            if (searchWidth < minimumWidth) {
                searchWidth = maxWidth - sideBorderPadding;
            }

            if (searchWidth < 40) {
                searchWidth = maxWidth - sideBorderPadding;
            }

            if (searchWidth <= 0) {
              searchWidth = minimumWidth;
            }

            this.search.width(Math.floor(searchWidth));
        },

        // multi
        getVal: function () {
            var val;
            if (this.select) {
                val = this.select.val();
                return val === null ? [] : val;
            } else {
                val = this.opts.element.val();
                return splitVal(val, this.opts.separator, this.opts.transformVal);
            }
        },

        // multi
        setVal: function (val) {
            if (this.select) {
                this.select.val(val);
            } else {
                var unique = [], valMap = {};
                // filter out duplicates
                $(val).each(function () {
                    if (!(this in valMap)) {
                        unique.push(this);
                        valMap[this] = 0;
                    }
                });
                this.opts.element.val(unique.length === 0 ? "" : unique.join(this.opts.separator));
            }
        },

        // multi
        buildChangeDetails: function (old, current) {
            var current = current.slice(0),
                old = old.slice(0);

            // remove intersection from each array
            for (var i = 0; i < current.length; i++) {
                for (var j = 0; j < old.length; j++) {
                    if (equal(this.opts.id(current[i]), this.opts.id(old[j]))) {
                        current.splice(i, 1);
                        i--;
                        old.splice(j, 1);
                        break;
                    }
                }
            }

            return {added: current, removed: old};
        },


        // multi
        val: function (val, triggerChange) {
            var oldData, self=this;

            if (arguments.length === 0) {
                return this.getVal();
            }

            oldData=this.data();
            if (!oldData.length) oldData=[];

            // val is an id. !val is true for [undefined,null,'',0] - 0 is legal
            if (!val && val !== 0) {
                this.opts.element.val("");
                this.updateSelection([]);
                this.clearSearch();
                if (triggerChange) {
                    this.triggerChange({added: this.data(), removed: oldData});
                }
                return;
            }

            // val is a list of ids
            this.setVal(val);

            if (this.select) {
                this.opts.initSelection(this.select, this.bind(this.updateSelection));
                if (triggerChange) {
                    this.triggerChange(this.buildChangeDetails(oldData, this.data()));
                }
            } else {
                if (this.opts.initSelection === undefined) {
                    throw new Error("val() cannot be called if initSelection() is not defined");
                }

                this.opts.initSelection(this.opts.element, function(data){
                    var ids=$.map(data, self.id);
                    self.setVal(ids);
                    self.updateSelection(data);
                    self.clearSearch();
                    if (triggerChange) {
                        self.triggerChange(self.buildChangeDetails(oldData, self.data()));
                    }
                });
            }
            this.clearSearch();
        },

        // multi
        onSortStart: function() {
            if (this.select) {
                throw new Error("Sorting of elements is not supported when attached to <select>. Attach to <input type='hidden'/> instead.");
            }

            // collapse search field into 0 width so its container can be collapsed as well
            this.search.width(0);
            // hide the container
            this.searchContainer.hide();
        },

        // multi
        onSortEnd:function() {

            var val=[], self=this;

            // show search and move it to the end of the list
            this.searchContainer.show();
            // make sure the search container is the last item in the list
            this.searchContainer.appendTo(this.searchContainer.parent());
            // since we collapsed the width in dragStarted, we resize it here
            this.resizeSearch();

            // update selection
            this.selection.find(".select2-search-choice").each(function() {
                val.push(self.opts.id($(this).data("select2-data")));
            });
            this.setVal(val);
            this.triggerChange();
        },

        // multi
        data: function(values, triggerChange) {
            var self=this, ids, old;
            if (arguments.length === 0) {
                 return this.selection
                     .children(".select2-search-choice")
                     .map(function() { return $(this).data("select2-data"); })
                     .get();
            } else {
                old = this.data();
                if (!values) { values = []; }
                ids = $.map(values, function(e) { return self.opts.id(e); });
                this.setVal(ids);
                this.updateSelection(values);
                this.clearSearch();
                if (triggerChange) {
                    this.triggerChange(this.buildChangeDetails(old, this.data()));
                }
            }
        }
    });

    $.fn.select2 = function () {

        var args = Array.prototype.slice.call(arguments, 0),
            opts,
            select2,
            method, value, multiple,
            allowedMethods = ["val", "destroy", "opened", "open", "close", "focus", "isFocused", "container", "dropdown", "onSortStart", "onSortEnd", "enable", "disable", "readonly", "positionDropdown", "data", "search"],
            valueMethods = ["opened", "isFocused", "container", "dropdown"],
            propertyMethods = ["val", "data"],
            methodsMap = { search: "externalSearch" };

        this.each(function () {
            if (args.length === 0 || typeof(args[0]) === "object") {
                opts = args.length === 0 ? {} : $.extend({}, args[0]);
                opts.element = $(this);

                if (opts.element.get(0).tagName.toLowerCase() === "select") {
                    multiple = opts.element.prop("multiple");
                } else {
                    multiple = opts.multiple || false;
                    if ("tags" in opts) {opts.multiple = multiple = true;}
                }

                select2 = multiple ? new window.Select2["class"].multi() : new window.Select2["class"].single();
                select2.init(opts);
            } else if (typeof(args[0]) === "string") {

                if (indexOf(args[0], allowedMethods) < 0) {
                    throw "Unknown method: " + args[0];
                }

                value = undefined;
                select2 = $(this).data("select2");
                if (select2 === undefined) return;

                method=args[0];

                if (method === "container") {
                    value = select2.container;
                } else if (method === "dropdown") {
                    value = select2.dropdown;
                } else {
                    if (methodsMap[method]) method = methodsMap[method];

                    value = select2[method].apply(select2, args.slice(1));
                }
                if (indexOf(args[0], valueMethods) >= 0
                    || (indexOf(args[0], propertyMethods) >= 0 && args.length == 1)) {
                    return false; // abort the iteration, ready to return first matched value
                }
            } else {
                throw "Invalid arguments to select2 plugin: " + args;
            }
        });
        return (value === undefined) ? this : value;
    };

    // plugin defaults, accessible to users
    $.fn.select2.defaults = {
        debug: false,
        width: "copy",
        loadMorePadding: 0,
        closeOnSelect: true,
        openOnEnter: true,
        containerCss: {},
        dropdownCss: {},
        containerCssClass: "",
        dropdownCssClass: "",
        formatResult: function(result, container, query, escapeMarkup) {
            var markup=[];
            markMatch(this.text(result), query.term, markup, escapeMarkup);
            return markup.join("");
        },
        transformVal: function(val) {
            return $.trim(val);
        },
        formatSelection: function (data, container, escapeMarkup) {
            return data ? escapeMarkup(this.text(data)) : undefined;
        },
        sortResults: function (results, container, query) {
            return results;
        },
        formatResultCssClass: function(data) {return data.css;},
        formatSelectionCssClass: function(data, container) {return undefined;},
        minimumResultsForSearch: 0,
        minimumInputLength: 0,
        maximumInputLength: null,
        maximumSelectionSize: 0,
        id: function (e) { return e == undefined ? null : e.id; },
        text: function (e) {
          if (e && this.data && this.data.text) {
            if ($.isFunction(this.data.text)) {
              return this.data.text(e);
            } else {
              return e[this.data.text];
            }
          } else {
            return e.text;
          }
        },
        matcher: function(term, text) {
            return stripDiacritics(''+text).toUpperCase().indexOf(stripDiacritics(''+term).toUpperCase()) >= 0;
        },
        separator: ",",
        tokenSeparators: [],
        tokenizer: defaultTokenizer,
        escapeMarkup: defaultEscapeMarkup,
        blurOnChange: false,
        selectOnBlur: false,
        adaptContainerCssClass: function(c) { return c; },
        adaptDropdownCssClass: function(c) { return null; },
        nextSearchTerm: function(selectedObject, currentSearchTerm) { return undefined; },
        searchInputPlaceholder: '',
        createSearchChoicePosition: 'top',
        shouldFocusInput: function (instance) {
            // Attempt to detect touch devices
            var supportsTouchEvents = (('ontouchstart' in window) ||
                                       (navigator.msMaxTouchPoints > 0));

            // Only devices which support touch events should be special cased
            if (!supportsTouchEvents) {
                return true;
            }

            // Never focus the input if search is disabled
            if (instance.opts.minimumResultsForSearch < 0) {
                return false;
            }

            return true;
        }
    };

    $.fn.select2.locales = [];

    $.fn.select2.locales['en'] = {
         formatMatches: function (matches) { if (matches === 1) { return "One result is available, press enter to select it."; } return matches + " results are available, use up and down arrow keys to navigate."; },
         formatNoMatches: function () { return "No matches found"; },
         formatAjaxError: function (jqXHR, textStatus, errorThrown) { return "Loading failed"; },
         formatInputTooShort: function (input, min) { var n = min - input.length; return "Please enter " + n + " or more character" + (n == 1 ? "" : "s"); },
         formatInputTooLong: function (input, max) { var n = input.length - max; return "Please delete " + n + " character" + (n == 1 ? "" : "s"); },
         formatSelectionTooBig: function (limit) { return "You can only select " + limit + " item" + (limit == 1 ? "" : "s"); },
         formatLoadMore: function (pageNumber) { return "Loading more results…"; },
         formatSearching: function () { return "Searching…"; }
    };

    $.extend($.fn.select2.defaults, $.fn.select2.locales['en']);

    $.fn.select2.ajaxDefaults = {
        transport: $.ajax,
        params: {
            type: "GET",
            cache: false,
            dataType: "json"
        }
    };

    // exports
    window.Select2 = {
        query: {
            ajax: ajax,
            local: local,
            tags: tags
        }, util: {
            debounce: debounce,
            markMatch: markMatch,
            escapeMarkup: defaultEscapeMarkup,
            stripDiacritics: stripDiacritics
        }, "class": {
            "abstract": AbstractSelect2,
            "single": SingleSelect2,
            "multi": MultiSelect2
        }
    };

}(jQuery));


  }).apply(root, arguments);
});
}(this));

(function(root) {
define("jquery.event.drag", ["jquery"], function() {
  return (function() {
/*!
 * jquery.event.drag - v 2.2
 * Copyright (c) 2010 Three Dub Media - http://threedubmedia.com
 * Open Source MIT License - http://threedubmedia.com/code/license
 */
// Created: 2008-06-04
// Updated: 2012-05-21
// REQUIRES: jquery 1.7.x

// UPDATED FROM https://github.com/sutoiku/jquery.event.drag-drop

;(function( $ ){

// add the jquery instance method
$.fn.drag = function( str, arg, opts ){
	// figure out the event type
	var type = typeof str == "string" ? str : "",
	// figure out the event handler...
	fn = $.isFunction( str ) ? str : $.isFunction( arg ) ? arg : null;
	// fix the event type
	if ( type.indexOf("drag") !== 0 )
		type = "drag"+ type;
	// were options passed
	opts = ( str == fn ? arg : opts ) || {};
	// trigger or bind event handler
	return fn ? this.bind( type, opts, fn ) : this.trigger( type );
};

// local refs (increase compression)
var $event = $.event,
$special = $event.special,
// configure the drag special event
drag = $special.drag = {

	// these are the default settings
	defaults: {
		which: 1, // mouse button pressed to start drag sequence
		distance: 0, // distance dragged before dragstart
		not: ':input', // selector to suppress dragging on target elements
		handle: null, // selector to match handle target elements
		relative: false, // true to use "position", false to use "offset"
		drop: true, // false to suppress drop events, true or selector to allow
		click: false // false to suppress click events after dragend (no proxy)
	},

	// the key name for stored drag data
	datakey: "dragdata",

	// prevent bubbling for better performance
	noBubble: true,

	// count bound related events
	add: function( obj ){
		// read the interaction data
		var data = $.data( this, drag.datakey ),
		// read any passed options
		opts = obj.data || {};
		// count another realted event
		data.related += 1;
		// extend data options bound with this event
		// don't iterate "opts" in case it is a node
		$.each( drag.defaults, function( key, def ){
			if ( opts[ key ] !== undefined )
				data[ key ] = opts[ key ];
		});
	},

	// forget unbound related events
	remove: function(){
		$.data( this, drag.datakey ).related -= 1;
	},

	// configure interaction, capture settings
	setup: function(){
		// check for related events
		if ( $.data( this, drag.datakey ) )
			return;
		// initialize the drag data with copied defaults
		var data = $.extend({ related:0 }, drag.defaults );
		// store the interaction data
		$.data( this, drag.datakey, data );
		// bind the mousedown event, which starts drag interactions
		$event.add( this, "touchstart mousedown", drag.init, data );
		// prevent image dragging in IE...
		if ( this.attachEvent )
			this.attachEvent("ondragstart", drag.dontstart );
	},

	// destroy configured interaction
	teardown: function(){
		var data = $.data( this, drag.datakey ) || {};
		// check for related events
		if ( data.related )
			return;
		// remove the stored data
		$.removeData( this, drag.datakey );
		// remove the mousedown event
		$event.remove( this, "touchstart mousedown", drag.init );
		// enable text selection
		drag.textselect( true );
		// un-prevent image dragging in IE...
		if ( this.detachEvent )
			this.detachEvent("ondragstart", drag.dontstart );
	},

	// initialize the interaction
	init: function( event ){
		// sorry, only one touch at a time
		if ( drag.touched )
			return;
		// the drag/drop interaction data
		var dd = event.data, results;
		// check the which directive
		if ( event.which != 0 && dd.which > 0 && event.which != dd.which )
			return;
		// check for suppressed selector
		if ( $( event.target ).is( dd.not ) )
			return;
		// check for handle selector
		if ( dd.handle && !$( event.target ).closest( dd.handle, event.currentTarget ).length )
			return;

		drag.touched = event.type == 'touchstart' ? this : null;
		dd.propagates = 1;
		dd.mousedown = this;
		dd.interactions = [ drag.interaction( this, dd ) ];
		dd.target = event.target;
		dd.pageX = event.pageX;
		dd.pageY = event.pageY;
		dd.dragging = null;
		// handle draginit event...
		results = drag.hijack( event, "draginit", dd );
		// early cancel
		if ( !dd.propagates )
			return;
		// flatten the result set
		results = drag.flatten( results );
		// insert new interaction elements
		if ( results && results.length ){
			dd.interactions = [];
			$.each( results, function(){
				dd.interactions.push( drag.interaction( this, dd ) );
			});
		}
		// remember how many interactions are propagating
		dd.propagates = dd.interactions.length;
		// locate and init the drop targets
		if ( dd.drop !== false && $special.drop )
			$special.drop.handler( event, dd );
		// disable text selection
		drag.textselect( false );
		// bind additional events...
		if ( drag.touched )
			$event.add( drag.touched, "touchmove touchend", drag.handler, dd );
		else
			$event.add( document, "mousemove mouseup", drag.handler, dd );
		// helps prevent text selection or scrolling
		if ( !drag.touched || dd.live )
			return false;
	},

	// returns an interaction object
	interaction: function( elem, dd ){
		var offset = $( elem )[ dd.relative ? "position" : "offset" ]() || { top:0, left:0 };
		return {
			drag: elem,
			callback: new drag.callback(),
			droppable: [],
			offset: offset
		};
	},

	// handle drag-releatd DOM events
	handler: function( event ){
		// read the data before hijacking anything
		var dd = event.data;
		// handle various events
		switch ( event.type ){
			// mousemove, check distance, start dragging
			case !dd.dragging && 'touchmove':
				event.preventDefault();
			case !dd.dragging && 'mousemove':
				//  drag tolerance, x² + y² = distance²
				if ( Math.pow(  event.pageX-dd.pageX, 2 ) + Math.pow(  event.pageY-dd.pageY, 2 ) < Math.pow( dd.distance, 2 ) )
					break; // distance tolerance not reached
				event.target = dd.target; // force target from "mousedown" event (fix distance issue)
				drag.hijack( event, "dragstart", dd ); // trigger "dragstart"
				if ( dd.propagates ) // "dragstart" not rejected
					dd.dragging = true; // activate interaction
			// mousemove, dragging
			case 'touchmove':
				event.preventDefault();
			case 'mousemove':
				if ( dd.dragging ){
					// trigger "drag"
					drag.hijack( event, "drag", dd );
					if ( dd.propagates ){
						// manage drop events
						if ( dd.drop !== false && $special.drop )
							$special.drop.handler( event, dd ); // "dropstart", "dropend"
						break; // "drag" not rejected, stop
					}
					event.type = "mouseup"; // helps "drop" handler behave
				}
			// mouseup, stop dragging
			case 'touchend':
			case 'mouseup':
			default:
				if ( drag.touched )
					$event.remove( drag.touched, "touchmove touchend", drag.handler ); // remove touch events
				else
					$event.remove( document, "mousemove mouseup", drag.handler ); // remove page events
				if ( dd.dragging ){
					if ( dd.drop !== false && $special.drop )
						$special.drop.handler( event, dd ); // "drop"
					drag.hijack( event, "dragend", dd ); // trigger "dragend"
				}
				drag.textselect( true ); // enable text selection
				// if suppressing click events...
				if ( dd.click === false && dd.dragging )
					$.data( dd.mousedown, "suppress.click", new Date().getTime() + 5 );
				dd.dragging = drag.touched = false; // deactivate element
				break;
		}
	},

	// re-use event object for custom events
	hijack: function( event, type, dd, x, elem ){
		// not configured
		if ( !dd )
			return;
		// remember the original event and type
		var orig = { event:event.originalEvent, type:event.type },
		// is the event drag related or drog related?
		mode = type.indexOf("drop") ? "drag" : "drop",
		// iteration vars
		result, i = x || 0, ia, $elems, callback,
		len = !isNaN( x ) ? x : dd.interactions.length;
		// modify the event type
		event.type = type;
		// remove the original event
		event.originalEvent = null;
		// initialize the results
		dd.results = [];
		// handle each interacted element
		do if ( ia = dd.interactions[ i ] ){
			// validate the interaction
			if ( type !== "dragend" && ia.cancelled )
				continue;
			// set the dragdrop properties on the event object
			callback = drag.properties( event, dd, ia );
			// prepare for more results
			ia.results = [];
			// handle each element
			$( elem || ia[ mode ] || dd.droppable ).each(function( p, subject ){
				// identify drag or drop targets individually
				callback.target = subject;
				// force propagtion of the custom event
				event.isPropagationStopped = function(){ return false; };
				// handle the event
				result = subject ? $event.dispatch.call( subject, event, callback ) : null;
				// stop the drag interaction for this element
				if ( result === false ){
					if ( mode == "drag" ){
						ia.cancelled = true;
						dd.propagates -= 1;
					}
					if ( type == "drop" ){
						ia[ mode ][p] = null;
					}
				}
				// assign any dropinit elements
				else if ( type == "dropinit" )
					ia.droppable.push( drag.element( result ) || subject );
				// accept a returned proxy element
				if ( type == "dragstart" )
					ia.proxy = $( drag.element( result ) || ia.drag )[0];
				// remember this result
				ia.results.push( result );
				// forget the event result, for recycling
				delete event.result;
				// break on cancelled handler
				if ( type !== "dropinit" )
					return result;
			});
			// flatten the results
			dd.results[ i ] = drag.flatten( ia.results );
			// accept a set of valid drop targets
			if ( type == "dropinit" )
				ia.droppable = drag.flatten( ia.droppable );
			// locate drop targets
			if ( type == "dragstart" && !ia.cancelled )
				callback.update();
		}
		while ( ++i < len )
		// restore the original event & type
		event.type = orig.type;
		event.originalEvent = orig.event;
		// return all handler results
		return drag.flatten( dd.results );
	},

	// extend the callback object with drag/drop properties...
	properties: function( event, dd, ia ){
		var obj = ia.callback;
		// elements
		obj.drag = ia.drag;
		obj.proxy = ia.proxy || ia.drag;
		// starting mouse position
		obj.startX = dd.pageX;
		obj.startY = dd.pageY;
		// current distance dragged
		obj.deltaX = event.pageX - dd.pageX;
		obj.deltaY = event.pageY - dd.pageY;
		// original element position
		obj.originalX = ia.offset.left;
		obj.originalY = ia.offset.top;
		// adjusted element position
		obj.offsetX = obj.originalX + obj.deltaX;
		obj.offsetY = obj.originalY + obj.deltaY;
		// assign the drop targets information
		obj.drop = drag.flatten( ( ia.drop || [] ).slice() );
		obj.available = drag.flatten( ( ia.droppable || [] ).slice() );
		return obj;
	},

	// determine is the argument is an element or jquery instance
	element: function( arg ){
		if ( arg && ( arg.jquery || arg.nodeType == 1 ) )
			return arg;
	},

	// flatten nested jquery objects and arrays into a single dimension array
	flatten: function( arr ){
		return $.map( arr, function( member ){
			return member && member.jquery ? $.makeArray( member ) :
				member && member.length ? drag.flatten( member ) : member;
		});
	},

	// toggles text selection attributes ON (true) or OFF (false)
	textselect: function( bool ){
		$( document )[ bool ? "unbind" : "bind" ]("selectstart", drag.dontstart )
			.css("MozUserSelect", bool ? "" : "none" );
		// .attr("unselectable", bool ? "off" : "on" )
		document.unselectable = bool ? "off" : "on";
	},

	// suppress "selectstart" and "ondragstart" events
	dontstart: function(){
		return false;
	},

	// a callback instance contructor
	callback: function(){}

};

// callback methods
drag.callback.prototype = {
	update: function(){
		if ( $special.drop && this.available.length )
			$.each( this.available, function( i ){
				$special.drop.locate( this, i );
			});
	}
};

// patch $.event.$dispatch to allow suppressing clicks
var $dispatch = $event.dispatch;
$event.dispatch = function( event ){
	if ( $.data( this, "suppress."+ event.type ) - new Date().getTime() > 0 ){
		$.removeData( this, "suppress."+ event.type );
		return;
	}
	return $dispatch.apply( this, arguments );
};

// event fix hooks for touch events...
var touchHooks =
$event.fixHooks.touchstart =
$event.fixHooks.touchmove =
$event.fixHooks.touchend =
$event.fixHooks.touchcancel = {
	props: "clientX clientY pageX pageY screenX screenY".split( " " ),
	filter: function( event, orig ) {
		if ( orig ){
			var touched = ( orig.touches && orig.touches[0] )
				|| ( orig.changedTouches && orig.changedTouches[0] )
				|| null;
			// iOS webkit: touchstart, touchmove, touchend
			if ( touched )
				$.each( touchHooks.props, function( i, prop ){
					event[ prop ] = touched[ prop ];
				});
		}
		return event;
	}
};

// share the same special event configuration with related events...
//$special.draginit = $special.dragstart = $special.dragend = drag;

})( jQuery );


  }).apply(root, arguments);
});
}(this));

(function(root) {
define("jquery.event.drop", ["jquery"], function() {
  return (function() {
/*! 
 * jquery.event.drop - v 2.2
 * Copyright (c) 2010 Three Dub Media - http://threedubmedia.com
 * Open Source MIT License - http://threedubmedia.com/code/license
 */
// Created: 2008-06-04 
// Updated: 2012-05-21
// REQUIRES: jquery 1.7.x, event.drag 2.2

;(function($){ // secure $ jQuery alias

// Events: drop, dropstart, dropend

// add the jquery instance method
$.fn.drop = function( str, arg, opts ){
	// figure out the event type
	var type = typeof str == "string" ? str : "",
	// figure out the event handler...
	fn = $.isFunction( str ) ? str : $.isFunction( arg ) ? arg : null;
	// fix the event type
	if ( type.indexOf("drop") !== 0 ) 
		type = "drop"+ type;
	// were options passed
	opts = ( str == fn ? arg : opts ) || {};
	// trigger or bind event handler
	return fn ? this.bind( type, opts, fn ) : this.trigger( type );
};

// DROP MANAGEMENT UTILITY
// returns filtered drop target elements, caches their positions
$.drop = function( opts ){ 
	opts = opts || {};
	// safely set new options...
	drop.multi = opts.multi === true ? Infinity : 
		opts.multi === false ? 1 : !isNaN( opts.multi ) ? opts.multi : drop.multi;
	drop.delay = opts.delay || drop.delay;
	drop.tolerance = $.isFunction( opts.tolerance ) ? opts.tolerance : 
		opts.tolerance === null ? null : drop.tolerance;
	drop.mode = opts.mode || drop.mode || 'intersect';
};

// local refs (increase compression)
var $event = $.event, 
$special = $event.special,
// configure the drop special event
drop = $.event.special.drop = {

	// these are the default settings
	multi: 1, // allow multiple drop winners per dragged element
	delay: 20, // async timeout delay
	mode: 'overlap', // drop tolerance mode
		
	// internal cache
	targets: [], 
	
	// the key name for stored drop data
	datakey: "dropdata",
		
	// prevent bubbling for better performance
	noBubble: true,
	
	// count bound related events
	add: function( obj ){ 
		// read the interaction data
		var data = $.data( this, drop.datakey );
		// count another realted event
		data.related += 1;
	},
	
	// forget unbound related events
	remove: function(){
		$.data( this, drop.datakey ).related -= 1;
	},
	
	// configure the interactions
	setup: function(){
		// check for related events
		if ( $.data( this, drop.datakey ) ) 
			return;
		// initialize the drop element data
		var data = { 
			related: 0,
			active: [],
			anyactive: 0,
			winner: 0,
			location: {}
		};
		// store the drop data on the element
		$.data( this, drop.datakey, data );
		// store the drop target in internal cache
		drop.targets.push( this );
	},
	
	// destroy the configure interaction	
	teardown: function(){ 
		var data = $.data( this, drop.datakey ) || {};
		// check for related events
		if ( data.related ) 
			return;
		// remove the stored data
		$.removeData( this, drop.datakey );
		// reference the targeted element
		var element = this;
		// remove from the internal cache
		drop.targets = $.grep( drop.targets, function( target ){ 
			return ( target !== element ); 
		});
	},
	
	// shared event handler
	handler: function( event, dd ){ 
		// local vars
		var results, $targets;
		// make sure the right data is available
		if ( !dd ) 
			return;
		// handle various events
		switch ( event.type ){
			// draginit, from $.event.special.drag
			case 'mousedown': // DROPINIT >>
			case 'touchstart': // DROPINIT >>
				// collect and assign the drop targets
				$targets =  $( drop.targets );
				if ( typeof dd.drop == "string" )
					$targets = $targets.filter( dd.drop );
				// reset drop data winner properties
				$targets.each(function(){
					var data = $.data( this, drop.datakey );
					data.active = [];
					data.anyactive = 0;
					data.winner = 0;
				});
				// set available target elements
				dd.droppable = $targets;
				// activate drop targets for the initial element being dragged
				$special.drag.hijack( event, "dropinit", dd ); 
				break;
			// drag, from $.event.special.drag
			case 'mousemove': // TOLERATE >>
			case 'touchmove': // TOLERATE >>
				drop.event = event; // store the mousemove event
				if ( !drop.timer )
					// monitor drop targets
					drop.tolerate( dd ); 
				break;
			// dragend, from $.event.special.drag
			case 'mouseup': // DROP >> DROPEND >>
			case 'touchend': // DROP >> DROPEND >>
				drop.timer = clearTimeout( drop.timer ); // delete timer	
				if ( dd.propagates ){
					$special.drag.hijack( event, "drop", dd ); 
					$special.drag.hijack( event, "dropend", dd ); 
				}
				break;
				
		}
	},
		
	// returns the location positions of an element
	locate: function( elem, index ){ 
		var data = $.data( elem, drop.datakey ),
		$elem = $( elem ), 
		posi = $elem.offset() || {}, 
		height = $elem.outerHeight(), 
		width = $elem.outerWidth(),
		location = { 
			elem: elem, 
			width: width, 
			height: height,
			top: posi.top, 
			left: posi.left, 
			right: posi.left + width, 
			bottom: posi.top + height
		};
		// drag elements might not have dropdata
		if ( data ){
			data.location = location;
			data.index = index;
			data.elem = elem;
		}
		return location;
	},
	
	// test the location positions of an element against another OR an X,Y coord
	contains: function( target, test ){ // target { location } contains test [x,y] or { location }
		return ( ( test[0] || test.left ) >= target.left && ( test[0] || test.right ) <= target.right
			&& ( test[1] || test.top ) >= target.top && ( test[1] || test.bottom ) <= target.bottom ); 
	},
	
	// stored tolerance modes
	modes: { // fn scope: "$.event.special.drop" object 
		// target with mouse wins, else target with most overlap wins
		'intersect': function( event, proxy, target ){
			return this.contains( target, [ event.pageX, event.pageY ] ) ? // check cursor
				1e9 : this.modes.overlap.apply( this, arguments ); // check overlap
		},
		// target with most overlap wins	
		'overlap': function( event, proxy, target ){
			// calculate the area of overlap...
			return Math.max( 0, Math.min( target.bottom, proxy.bottom ) - Math.max( target.top, proxy.top ) )
				* Math.max( 0, Math.min( target.right, proxy.right ) - Math.max( target.left, proxy.left ) );
		},
		// proxy is completely contained within target bounds	
		'fit': function( event, proxy, target ){
			return this.contains( target, proxy ) ? 1 : 0;
		},
		// center of the proxy is contained within target bounds	
		'middle': function( event, proxy, target ){
			return this.contains( target, [ proxy.left + proxy.width * .5, proxy.top + proxy.height * .5 ] ) ? 1 : 0;
		}
	},	
	
	// sort drop target cache by by winner (dsc), then index (asc)
	sort: function( a, b ){
		return ( b.winner - a.winner ) || ( a.index - b.index );
	},
		
	// async, recursive tolerance execution
	tolerate: function( dd ){		
		// declare local refs
		var i, drp, drg, data, arr, len, elem,
		// interaction iteration variables
		x = 0, ia, end = dd.interactions.length,
		// determine the mouse coords
		xy = [ drop.event.pageX, drop.event.pageY ],
		// custom or stored tolerance fn
		tolerance = drop.tolerance || drop.modes[ drop.mode ];
		// go through each passed interaction...
		do if ( ia = dd.interactions[x] ){
			// check valid interaction
			if ( !ia )
				return; 
			// initialize or clear the drop data
			ia.drop = [];
			// holds the drop elements
			arr = []; 
			len = ia.droppable.length;
			// determine the proxy location, if needed
			if ( tolerance )
				drg = drop.locate( ia.proxy ); 
			// reset the loop
			i = 0;
			// loop each stored drop target
			do if ( elem = ia.droppable[i] ){ 
				data = $.data( elem, drop.datakey );
				drp = data.location;
				if ( !drp ) continue;
				// find a winner: tolerance function is defined, call it
				data.winner = tolerance ? tolerance.call( drop, drop.event, drg, drp ) 
					// mouse position is always the fallback
					: drop.contains( drp, xy ) ? 1 : 0; 
				arr.push( data );	
			} while ( ++i < len ); // loop 
			// sort the drop targets
			arr.sort( drop.sort );			
			// reset the loop
			i = 0;
			// loop through all of the targets again
			do if ( data = arr[ i ] ){
				// winners...
				if ( data.winner && ia.drop.length < drop.multi ){
					// new winner... dropstart
					if ( !data.active[x] && !data.anyactive ){
						// check to make sure that this is not prevented
						if ( $special.drag.hijack( drop.event, "dropstart", dd, x, data.elem )[0] !== false ){ 	
							data.active[x] = 1;
							data.anyactive += 1;
						}
						// if false, it is not a winner
						else
							data.winner = 0;
					}
					// if it is still a winner
					if ( data.winner )
						ia.drop.push( data.elem );
				}
				// losers... 
				else if ( data.active[x] && data.anyactive == 1 ){
					// former winner... dropend
					$special.drag.hijack( drop.event, "dropend", dd, x, data.elem ); 
					data.active[x] = 0;
					data.anyactive -= 1;
				}
			} while ( ++i < len ); // loop 		
		} while ( ++x < end ) // loop
		// check if the mouse is still moving or is idle
		if ( drop.last && xy[0] == drop.last.pageX && xy[1] == drop.last.pageY ) 
			delete drop.timer; // idle, don't recurse
		else  // recurse
			drop.timer = setTimeout(function(){ 
				drop.tolerate( dd ); 
			}, drop.delay );
		// remember event, to compare idleness
		drop.last = drop.event; 
	}
	
};

// share the same special event configuration with related events...
$special.dropinit = $special.dropstart = $special.dropend = drop;

})(jQuery); // confine scope	
;
return $.drop;
  }).apply(root, arguments);
});
}(this));

/* Select2 pattern.
 *
 * Options:
 *    separator(string): Analagous to the separator constructor parameter from Select2. Defines a custom separator used to distinguish the tag values. Ex: a value of ";" will allow tags and initialValues to have values separated by ";" instead of the default ",". (',')
 *    initialValues(string): This can be a json encoded string, or a list of id:text values. Ex: Red:The Color Red,Orange:The Color Orange  This is used inside the initSelection method, if AJAX options are NOT set. (null)
 *    vocabularyUrl(string): This is a URL to a JSON-formatted file used to populate the list (null)
 *    allowNewItems(string): All new items to be entered into the widget(true)
 *    onSelecting(string|function): Name of global function or function to call when value is selecting (null)
 *    onSelected(string|function): Name of global function or function to call when value has been selected (null)
 *    onDeselecting(string|function): Name of global function or function to call when value is deselecting (null)
 *    onDeselected(string|function): Name of global function or function to call when value has been deselected (null)
 *    OTHER OPTIONS(): For more options on select2 go to http://ivaynberg.github.io/select2/#documentation ()
 *
 * Documentation:
 *    # Autocomplete with search (single select)
 *
 *    {{ example-1 }}
 *
 *    # Tagging
 *
 *    {{ example-2 }}
 *
 *    # Orderable tags
 *
 *    {{ example-3 }}
 *
 *    # AJAX tags
 *
 *    {{ example-4 }}
 *
 * Example: example-1
 *    <select class="pat-select2" data-pat-select2="width:20em">
 *      <option value="Acholi">Acholi</option>
 *      <option value="Afrikaans">Afrikaans</option>
 *      <option value="Akan">Akan</option>
 *      <option value="Albanian">Albanian</option>
 *      <option value="Amharic">Amharic</option>
 *      <option value="Arabic">Arabic</option>
 *      <option value="Ashante">Ashante</option>
 *      <option value="Asl">Asl</option>
 *      <option value="Assyrian">Assyrian</option>
 *      <option value="Azerbaijani">Azerbaijani</option>
 *      <option value="Azeri">Azeri</option>
 *    </select>
 *
 * Example: example-2
 *    <input type="text" class="pat-select2"
 *           data-pat-select2="separator:,;
 *                             tags:Red,Yellow,Green,Orange,Purple;
 *                             width:20em;
 *                             initialValues:Red:The Color Red,Orange:The Color Orange"
 *           value="Red,Orange"/>
 *
 * Example: example-3
 *    <input type="text" class="pat-select2"
 *           data-pat-select2="orderable:true;
 *                             tags:Red,Yellow,Green;
 *                             width:20em" />
 * Example: example-4
 *    <input type="hidden" class="pat-select2"
 *           data-pat-select2="placeholder:Search for a Value;
 *                             vocabularyUrl:select2-test.json;
 *                             width:20em" />
 *
 */


define('mockup-patterns-select2',[
  'jquery',
  'pat-base',
  'mockup-utils',
  'select2',
  'jquery.event.drag',
  'jquery.event.drop'
], function($, Base, utils) {
  'use strict';

  var Select2 = Base.extend({
    name: 'select2',
    trigger: '.pat-select2',
    parser: 'mockup',
    defaults: {
      separator: ','
    },
    initializeValues: function() {
      var self = this;
      // Init Selection ---------------------------------------------
      if (self.options.initialValues) {
        self.options.id = function(term) {
          return term.id;
        };
        self.options.initSelection = function ($el, callback) {
          var data = [],
              value = $el.val(),
              seldefaults = self.options.initialValues;

          // Create the initSelection value that contains the default selection,
          // but in a javascript object
          if (typeof(self.options.initialValues) === 'string' && self.options.initialValues !== '') {
            // if default selection value starts with a '{', then treat the value as
            // a JSON object that needs to be parsed
            if (self.options.initialValues[0] === '{') {
              seldefaults = JSON.parse(self.options.initialValues);
            }
            // otherwise, treat the value as a list, separated by the defaults.separator value of
            // strings in the format "id:text", and convert it to an object
            else {
              seldefaults = {};
              $(self.options.initialValues.split(self.options.separator)).each(function() {
                var selection = this.split(':');
                var id = $.trim(selection[0]);
                var text = $.trim(selection[1]);
                seldefaults[id] = text;
              });
            }
          }

          $(value.split(self.options.separator)).each(function() {
            var text = this;
            if (seldefaults[this]) {
              text = seldefaults[this];
            }
            data.push({id: utils.removeHTML(this), text: utils.removeHTML(text)});
          });
          callback(data);
        };
      }
    },
    initializeTags: function() {
      var self = this;
      if (self.options.tags && typeof(self.options.tags) === 'string') {
        if (self.options.tags.substr(0, 1) === '[') {
          self.options.tags = JSON.parse(self.options.tags);
        } else {
          self.options.tags = self.options.tags.split(self.options.separator);
        }
      }

      if (self.options.tags && !self.options.allowNewItems) {
        self.options.data = $.map (self.options.tags, function (value, i) {
          return { id: value, text: value };
        });
        self.options.multiple = true;
        delete self.options.tags;
      }
    },
    initializeOrdering: function() {
      var self = this;
      if (self.options.orderable) {
        var formatSelection = function(data, $container) {
          return data ? data.text : undefined;
        };
        if (self.options.formatSelection) {
          formatSelection = self.options.formatSelection;
        }

        self.options.formatSelection = function(data, $container) {
          $container.parents('li')
            .drag('start', function(e, dd) {
              $(this).addClass('select2-choice-dragging');
              self.$el.select2('onSortStart');
              $.drop({
                tolerance: function(event, proxy, target) {
                  var test = event.pageY > (target.top + target.height / 2);
                  $.data(target.elem, 'drop+reorder', test ? 'insertAfter' : 'insertBefore' );
                  return this.contains(target, [event.pageX, event.pageY]);
                }
              });
              return $( this ).clone().
                addClass('dragging').
                css({opacity: 0.75, position: 'absolute'}).
                appendTo(document.body);
            })
            .drag(function(e, dd) {
              /*jshint eqeqeq:false */
              $( dd.proxy ).css({
                top: dd.offsetY,
                left: dd.offsetX
              });
              var drop = dd.drop[0],
                  method = $.data(drop || {}, 'drop+reorder');

              /* XXX Cannot use triple equals here */
              if (drop && (drop != dd.current || method != dd.method)) {
                $(this)[method](drop);
                dd.current = drop;
                dd.method = method;
                dd.update();
              }
            })
            .drag('end', function(e, dd) {
              $(this).removeClass('select2-choice-dragging');
              self.$el.select2('onSortEnd');
              $( dd.proxy ).remove();
            })
            .drop('init', function(e, dd ) {
              /*jshint eqeqeq:false */
              /* XXX Cannot use triple equals here */
              return (this == dd.drag) ? false: true;
            });
          return formatSelection(data, $container);
        };
      }
    },
    initializeSelect2: function() {
      var self = this;
      self.options.formatResultCssClass = function(ob){
        if(ob.id){
          return 'select2-option-' + ob.id.toLowerCase().replace(/[ \:\)\(\[\]\{\}\_\+\=\&\*\%\#]/g, '-');
        }
      };

      function callback(action, e) {
        if (!!action) {
          if (self.options.debug) {
            console.debug('callback', action, e)
          }
          if (typeof action === 'string') {
            action = window[action];
          }
          return action(e);
        } else {
          return action;
        }
      }

      self.$el.select2(self.options);
      self.$el.on('select2-selected', function(e) {
          callback(self.options.onSelected, e);
      });
      self.$el.on('select2-selecting', function(e) {
          callback(self.options.onSelecting, e);
      });
      self.$el.on('select2-deselecting', function(e) {
          callback(self.options.onDeselecting, e);
      });
      self.$el.on('select2-deselected', function(e) {
          callback(self.options.onDeselected, e);
      });
      self.$select2 = self.$el.parent().find('.select2-container');
      self.$el.parent().off('close.plone-modal.patterns');
      if (self.options.orderable) {
        self.$select2.addClass('select2-orderable');
      }
    },
    opened: function () {
      var self = this;
      var isOpen = $('.select2-dropdown-open', self.$el.parent()).length === 1;
      return isOpen;
    },
    init: function() {
      var self = this;

      self.options.allowNewItems = self.options.hasOwnProperty ('allowNewItems') ?
            JSON.parse(self.options.allowNewItems) : true;

      if (self.options.ajax || self.options.vocabularyUrl) {
        if (self.options.vocabularyUrl) {
          self.options.multiple = self.options.multiple === undefined ? true : self.options.multiple;
          self.options.ajax = self.options.ajax || {};
          self.options.ajax.url = self.options.vocabularyUrl;
          // XXX removing the following function does'nt break tests. dead code?
          self.options.initSelection = function ($el, callback) {
            var data = [], value = $el.val();
            $(value.split(self.options.separator)).each(function () {
              var val = utils.removeHTML(this);
              data.push({id: val, text: val});
            });
            callback(data);
          };
        }

        var queryTerm = '';
        self.options.ajax = $.extend({
          quietMillis: 300,
          data: function (term, page) {
            queryTerm = term;
            return {
              query: term,
              'page_limit': 10,
              page: page
            };
          },
          results: function (data, page) {
            var results = data.results;
            if (self.options.vocabularyUrl) {
              var dataIds = [];
              $.each(data.results, function(i, item) {
                dataIds.push(item.id);
              });
              results = [];

              var haveResult = queryTerm === '' || $.inArray(queryTerm, dataIds) >= 0;
              if (self.options.allowNewItems && !haveResult) {
                queryTerm = utils.removeHTML(queryTerm);
                results.push({id: queryTerm, text: queryTerm});
              }

              $.each(data.results, function(i, item) {
                results.push(item);
              });
            }
            return { results: results };
          }
        }, self.options.ajax);
      } else if (self.options.multiple && self.$el.is('select')) {
        // Multiselects need to be converted to input[type=hidden]
        // for Select2
        var vals = self.$el.val() || [];
        var options = $.map(self.$el.find('option'), function (o) { return {text: $(o).html(), id: o.value}; });
        var $hidden = $('<input type="hidden" />');
        $hidden.val(vals.join(self.options.separator));
        $hidden.attr('class', self.$el.attr('class'));
        $hidden.attr('name', self.$el.attr('name'));
        $hidden.attr('id', self.$el.attr('id'));
        self.$orig = self.$el;
        self.$el.replaceWith($hidden);
        self.$el = $hidden;
        self.options.data = options;
      }

      self.initializeValues();
      self.initializeTags();
      self.initializeOrdering();
      self.initializeSelect2();
    }
  });

  return Select2;

});

define('mockup-ui-url/views/base',[
  'jquery',
  'underscore',
  'backbone',
  'translate'
], function($, _, Backbone, _t) {
  'use strict';

  var BaseView = Backbone.View.extend({
    isUIView: true,
    eventPrefix: 'ui',
    template: null,
    idPrefix: 'base-',
    appendInContainer: true,
    initialize: function(options) {
      this.options = options;
      for (var key in this.options) {
        this[key] = this.options[key];
      }
      this.options._t = _t;
    },
    render: function() {
      this.applyTemplate();

      this.trigger('render', this);
      this.afterRender();

      if (this.options.id) {
        // apply id to element
        this.$el.attr('id', this.idPrefix + this.options.id);
      }
      return this;
    },
    afterRender: function() {

    },
    serializedModel: function() {
      return this.options;
    },
    applyTemplate: function() {
      if (this.template !== null) {
        var data = $.extend({_t: _t}, this.options, this.serializedModel());
        var template = this.template;
        if(typeof(template) === 'string'){
          template = _.template(template);
        }
        this.$el.html(template(data));
      }
    },
    propagateEvent: function(eventName) {
      if (eventName.indexOf(':') > 0) {
        var eventId = eventName.split(':')[0];
        if (this.eventPrefix !== '') {
          if (eventId === this.eventPrefix ||
              eventId === this.eventPrefix + '.' + this.id) { return true; }
        }
      }
      return false;
    },
    uiEventTrigger: function(name) {
      var args = [].slice.call(arguments, 0);

      if (this.eventPrefix !== '') {
        args[0] = this.eventPrefix + ':' + name;
        Backbone.View.prototype.trigger.apply(this, args);
        if (this.id) {
          args[0] =  this.eventPrefix + '.' + this.id + ':' + name;
          Backbone.View.prototype.trigger.apply(this, args);
        }
      }
    }
  });

  return BaseView;
});

/* Tooltip pattern.
 *
 * Options:
 *    enterEvent(string): Event used to trigger tooltip. ('mouseenter')
 *    exitEvent(string): Event used to dismiss tooltip. ('mouseleave')
 *
 * data-pat-tooltip Configuration
 *    ajaxUrl(string): the ajax source of tooltip content (null). if null, tooltip displays content of title
 *    contentSelector(string): selects a subset of content (null)
 *    class(string): add one or several (white space separated) class to tooltip, at the .tooltip.mockup-tooltip level
 *    style(object): add css styles to tooltip, at the .tooltip.mockup-tooltip level
 *    innerStyle(object): add css styles to tooltip, at the .tooltip-inner level
 *
 * Documentation:
 *    # Directions
 *
 *    You can use this inside Plone or on any static page. Please check below
 *    for additional directions for non-Plone sites as there are some lines
 *    of code you need to add to the header of your webpage.
 *
 *    # Adding tooltip using Plone
 *
 *    - Make sure your viewing the page you want to add the tool tip too.
 *    - Log in
 *    - Create some text that you want to be the link that will reveal the
 *      tooltip.
 *    - Select the view html button
 *    - Find your text, and surround it with an HTML tag. Any normal tag works fine.
 *    - It should look like:
 *      <span class="pat-tooltip" data-toggle="tooltip" title="Tooltip text">My link text</span>
 *    - Choose Save
 *
 *    # Example
 *
 *    {{ example-1 }}
 *
 * Example: example-1
 *      <a href="#" data-toggle="tooltip" class="pat-tooltip"
 *            title="Setting the data-toggle and title makes this show up">
 *            Hover over this line to see a tooltip
 *      </a>
 *
 */

define('mockup-patterns-tooltip',[
  'jquery',
  'pat-base'
], function($, Base, undefined) {
  'use strict';

  //This is pulled almost directly from the Bootstrap Tooltip
  //extension. We rename it just to differentiate from the pattern.
  var bootstrapTooltip = function (element, options) {
    this.type       =
    this.options    =
    this.enabled    =
    this.timeout    =
    this.hoverState =
    this.$element   = null

    this.init('tooltip', element, options)
  }

  bootstrapTooltip.VERSION  = '3.2.0'

  bootstrapTooltip.DEFAULTS = {
    animation: true,
    placement: 'auto',
    selector: false,
    template: '<div class="tooltip mockup-tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
    trigger: 'hover focus',
    title: '',
    delay: 0,
    html: true,  // TODO: fix bug, where this setting overwrites whatever is set in options
    container: false,
    viewport: {
      selector: 'body',
      padding: 0
    }
  }

  bootstrapTooltip.prototype.init = function (type, element, options) {
    this.enabled   = true
    this.type      = type
    this.$element  = $(element)
    this.options   = this.getOptions(options)
    this.$viewport = this.options.viewport && $(this.options.viewport.selector || this.options.viewport)

    var triggers = this.options.trigger.split(' ')

    for (var i = triggers.length; i--;) {
      var trigger = triggers[i]

      if (trigger == 'click') {
        this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
      } else if (trigger != 'manual') {
        var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focusin'
        var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout'

        this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
        this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
      }
    }

    this.options.selector ?
      (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
      this.fixTitle()
  }

  bootstrapTooltip.prototype.getDefaults = function () {
    return bootstrapTooltip.DEFAULTS
  }

  bootstrapTooltip.prototype.getOptions = function (options) {
    options = $.extend({}, this.getDefaults(), this.$element.data(), options)

    if (options.delay && typeof options.delay == 'number') {
      options.delay = {
        show: options.delay,
        hide: options.delay
      }
    }

    return options
  }

  bootstrapTooltip.prototype.getDelegateOptions = function () {
    var options  = {}
    var defaults = this.getDefaults()

    this._options && $.each(this._options, function (key, value) {
      if (defaults[key] != value) options[key] = value
    })

    return options
  }

  bootstrapTooltip.prototype.enter = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget).data('bs.' + this.type)

    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
      $(obj.currentTarget).data('bs.' + this.type, self)
    }

    self.leaving = false;

    clearTimeout(self.timeout)

    self.hoverState = 'in'

    if (!self.options.delay || !self.options.delay.show) return self.show()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'in') self.show()
    }, self.options.delay.show)
  }

  bootstrapTooltip.prototype.leave = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget).data('bs.' + this.type)
    self.leaving = true;

    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
      $(obj.currentTarget).data('bs.' + this.type, self)
    }

    clearTimeout(self.timeout)

    self.hoverState = 'out'

    if (!self.options.delay || !self.options.delay.hide) return self.hide()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'out') self.hide()
    }, self.options.delay.hide)
  }

  bootstrapTooltip.prototype.show = function () {
    var e = $.Event('show.bs.' + this.type)

    if (this.hasContent() && this.enabled) {
      this.$element.trigger(e)
      var inDom = $.contains(document.documentElement, this.$element[0])
      if (e.isDefaultPrevented() || !inDom) return

      var $tip = this.tip()

      var tipId = this.getUID(this.type)
      var self = this;
      this.setContent().then(function() {
      $tip.attr('id', tipId)
      self.$element.attr('aria-describedby', tipId)

      if (self.options.animation) $tip.addClass('fade')

      var placement = typeof self.options.placement == 'function' ?
        self.options.placement.call(self, $tip[0], self.$element[0]) :
        self.options.placement

      var autoToken = /\s?auto?\s?/i
      var autoPlace = autoToken.test(placement)
      if (autoPlace) placement = placement.replace(autoToken, '') || 'top'

      $tip
        .detach()
        .css({ top: 0, left: 0, display: 'block' })
        .addClass(placement)
        .data('bs.' + self.type, self)

      self.options.container ? $tip.appendTo(self.options.container) : $tip.insertAfter(self.$element)

      var pos          = self.getPosition()
      var actualWidth  = $tip[0].offsetWidth
      var actualHeight = $tip[0].offsetHeight

      if (autoPlace) {
        var orgPlacement = placement
        var $parent      = self.$element.parent()
        var parentDim    = self.getPosition($parent)

        placement = placement == 'bottom' && pos.top   + pos.height       + actualHeight - parentDim.scroll > parentDim.height ? 'top'    :
                    placement == 'top'    && pos.top   - parentDim.scroll - actualHeight < 0                                   ? 'bottom' :
                    placement == 'right'  && pos.right + actualWidth      > parentDim.width                                    ? 'left'   :
                    placement == 'left'   && pos.left  - actualWidth      < parentDim.left                                     ? 'right'  :
                    placement

        $tip
          .removeClass(orgPlacement)
          .addClass(placement)
      }

      var calculatedOffset = self.getCalculatedOffset(placement, pos, actualWidth, actualHeight)

      self.applyPlacement(calculatedOffset, placement)

      var complete = function () {
        self.$element.trigger('shown.bs.' + self.type);
        self.hoverState = null;
        if (self.leaving) {  // prevent a race condition bug when user has leaved before complete
          self.leave(self);
        }
      }

      $.support.transition && self.$tip.hasClass('fade') ?
        $tip
          .one('bsTransitionEnd', complete)
          .emulateTransitionEnd(150) :
        complete()
      })
    }
  };

  bootstrapTooltip.prototype.applyPlacement = function (offset, placement) {
    var $tip   = this.tip()
    var width  = $tip[0].offsetWidth
    var height = $tip[0].offsetHeight

    // manually read margins because getBoundingClientRect includes difference
    var marginTop = parseInt($tip.css('margin-top'), 10)
    var marginLeft = parseInt($tip.css('margin-left'), 10)

    // we must check for NaN for ie 8/9
    if (isNaN(marginTop))  marginTop  = 0
    if (isNaN(marginLeft)) marginLeft = 0

    offset.top  = offset.top  + marginTop
    offset.left = offset.left + marginLeft

    // $.fn.offset doesn't round pixel values
    // so we use setOffset directly with our own function B-0
    $.offset.setOffset($tip[0], $.extend({
      using: function (props) {
        $tip.css({
          top: Math.round(props.top),
          left: Math.round(props.left)
        })
      }
    }, offset), 0)

    $tip.addClass('in')

    // check to see if placing tip in new offset caused the tip to resize itself
    var actualWidth  = $tip[0].offsetWidth
    var actualHeight = $tip[0].offsetHeight

    if (placement == 'top' && actualHeight != height) {
      offset.top = offset.top + height - actualHeight
    }

    var delta = this.getViewportAdjustedDelta(placement, offset, actualWidth, actualHeight)

    if (delta.left) offset.left += delta.left
    else offset.top += delta.top

    var arrowDelta          = delta.left ? delta.left * 2 - width + actualWidth : delta.top * 2 - height + actualHeight
    var arrowPosition       = delta.left ? 'left'        : 'top'
    var arrowOffsetPosition = delta.left ? 'offsetWidth' : 'offsetHeight'

    $tip.offset(offset)
    this.replaceArrow(arrowDelta, $tip[0][arrowOffsetPosition], arrowPosition)
  }

  bootstrapTooltip.prototype.replaceArrow = function (delta, dimension, position) {
    this.arrow().css(position, delta ? (50 * (1 - delta / dimension) + '%') : '')
  }

  bootstrapTooltip.prototype.setContent = function () {
    var $tip  = this.tip();
    var type = this.options.html ? 'html' : 'text';
    var selector = this.options.patTooltip ? this.options.patTooltip.contentSelector : null;

    function setContent(content) {
      if (type === 'html' && !!selector) {
        content = $(content).find(selector).html();
      }
      $tip.find('.tooltip-inner')[type](content);
    }
    function removeClasses() {
      $tip.removeClass('fade in top bottom left right')
    }
    var title = this.getTitle();
    var url = this.getUrl();
      if (!!url) {
        removeClasses();
        return $.get(url).then(function(content) {
          setContent(content);
        });
      } else {
        removeClasses();
        setContent(title);
        return new Promise(function(resolve, reject) {
          resolve(title)
        });
      }

  };

  bootstrapTooltip.prototype.getUrl = function () {
    return this.options.patTooltip ? this.options.patTooltip.ajaxUrl : null;
  };

  bootstrapTooltip.prototype.hide = function () {
    var that = this
    var $tip = this.tip()
    var e    = $.Event('hide.bs.' + this.type)

    this.$element.removeAttr('aria-describedby')

    function complete() {
      if (that.hoverState != 'in') $tip.detach()
      that.$element.trigger('hidden.bs.' + that.type)
    }

    this.$element.trigger(e)

    if (e.isDefaultPrevented()) return

    $tip.removeClass('in')

    $.support.transition && this.$tip.hasClass('fade') ?
      $tip
        .one('bsTransitionEnd', complete)
        .emulateTransitionEnd(150) :
      complete()

    this.hoverState = null

    return this
  }

  bootstrapTooltip.prototype.fixTitle = function () {
    var $e = this.$element
    if ($e.attr('title') || typeof ($e.attr('data-original-title')) != 'string') {
      $e.attr('data-original-title', $e.attr('title') || '').attr('title', '')
    }
  }

  bootstrapTooltip.prototype.hasContent = function () {
    return this.getTitle() || this.getUrl();
  };

  bootstrapTooltip.prototype.getPosition = function ($element) {
    $element   = $element || this.$element
    var el     = $element[0]
    var isBody = el.tagName == 'BODY'
    return $.extend({}, (typeof el.getBoundingClientRect == 'function') ? el.getBoundingClientRect() : null, {
      scroll: isBody ? document.documentElement.scrollTop || document.body.scrollTop : $element.scrollTop(),
      width:  isBody ? $(window).width()  : $element.outerWidth(),
      height: isBody ? $(window).height() : $element.outerHeight()
    }, isBody ? { top: 0, left: 0 } : $element.offset())
  }

  bootstrapTooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
    return placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth / 2  } :
           placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2  } :
           placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
        /* placement == 'right' */ { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width   }

  }

  bootstrapTooltip.prototype.getViewportAdjustedDelta = function (placement, pos, actualWidth, actualHeight) {
    var delta = { top: 0, left: 0 }
    if (!this.$viewport) return delta

    var viewportPadding = this.options.viewport && this.options.viewport.padding || 0
    var viewportDimensions = this.getPosition(this.$viewport)

    if (/right|left/.test(placement)) {
      var topEdgeOffset    = pos.top - viewportPadding - viewportDimensions.scroll
      var bottomEdgeOffset = pos.top + viewportPadding - viewportDimensions.scroll + actualHeight
      if (topEdgeOffset < viewportDimensions.top) { // top overflow
        delta.top = viewportDimensions.top - topEdgeOffset
      } else if (bottomEdgeOffset > viewportDimensions.top + viewportDimensions.height) { // bottom overflow
        delta.top = viewportDimensions.top + viewportDimensions.height - bottomEdgeOffset
      }
    } else {
      var leftEdgeOffset  = pos.left - viewportPadding
      var rightEdgeOffset = pos.left + viewportPadding + actualWidth
      if (leftEdgeOffset < viewportDimensions.left) { // left overflow
        delta.left = viewportDimensions.left - leftEdgeOffset
      } else if (rightEdgeOffset > viewportDimensions.width) { // right overflow
        delta.left = viewportDimensions.left + viewportDimensions.width - rightEdgeOffset
      }
    }

    return delta
  }

  bootstrapTooltip.prototype.getTitle = function () {
    var title
    var $e = this.$element
    var o  = this.options
    title = $e.attr('data-original-title')
      || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)

    return title
  }

  bootstrapTooltip.prototype.getUID = function (prefix) {
    do prefix += ~~(Math.random() * 1000000)
    while (document.getElementById(prefix))
    return prefix
  }

  bootstrapTooltip.prototype.tip = function () {
    if (!!this.$tip) {
      return this.$tip;
    }
    var $tip = this.$tip || $(this.options.template);
    if (this.options.patTooltip) {

    if (this.options.patTooltip.style) {
      $tip.css(this.options.patTooltip.style)
    }
    if (this.options.patTooltip['class']) {
      $tip.addClass(this.options.patTooltip['class'])
    }
    if (this.options.patTooltip.innerStyle) {
      $tip.find('.tooltip-inner').css(this.options.patTooltip.innerStyle)
    }
    }
    this.$tip = $tip;
    return $tip;
  }

  bootstrapTooltip.prototype.arrow = function () {
    return (this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow'))
  }

  bootstrapTooltip.prototype.validate = function () {
    if (!this.$element[0].parentNode) {
      this.hide()
      this.$element = null
      this.options  = null
    }
  }

  bootstrapTooltip.prototype.enable = function () {
    this.enabled = true
  }

  bootstrapTooltip.prototype.disable = function () {
    this.enabled = false
  }

  bootstrapTooltip.prototype.toggleEnabled = function () {
    this.enabled = !this.enabled
  }

  bootstrapTooltip.prototype.toggle = function (e) {
    var self = this
    if (e) {
      self = $(e.currentTarget).data('bs.' + this.type)
      if (!self) {
        self = new this.constructor(e.currentTarget, this.getDelegateOptions())
        $(e.currentTarget).data('bs.' + this.type, self)
      }
    }

    self.tip().hasClass('in') ? self.leave(self) : self.enter(self)
  }

  bootstrapTooltip.prototype.destroy = function () {
    clearTimeout(this.timeout)
    this.hide().$element.off('.' + this.type).removeData('bs.' + this.type)
  }

  var Tooltip = Base.extend({
    name: 'tooltip',
    trigger: '.pat-tooltip',
    parser: 'mockup',
    defaults: {
      html: false,
      placement: 'top'
    },
    init: function() {
        if (this.options.html === 'true' || this.options.html === true) {
          // TODO: fix the parser!
          this.options.html = true;
        } else {
          this.options.html = false;
        }
        this.data = new bootstrapTooltip(this.$el[0], this.options);
      },
  });

  return Tooltip;

});

define('mockup-ui-url/views/button',[
  'underscore',
  'mockup-ui-url/views/base',
  'mockup-patterns-tooltip'
], function(_, BaseView, Tooltip) {
  'use strict';

  var ButtonView = BaseView.extend({
    tagName: 'a',
    className: 'btn',
    eventPrefix: 'button',
    context: 'default',
    idPrefix: 'btn-',
    attributes: {
      'href': '#'
    },
    extraClasses: [],
    tooltip: null,
    template: '<% if (icon) { %><span class="glyphicon glyphicon-<%= icon %>"></span><% } %> <%= title %>',
    events: {
      'click': 'handleClick'
    },
    initialize: function(options) {
      if (!options.id) {
        var title = options.title || '';
        options.id = title !== '' ? title.toLowerCase().replace(' ', '-') : this.cid;
      }
      BaseView.prototype.initialize.apply(this, [options]);

      this.on('render', function() {
        this.$el.attr('title', this.options.title || '');
        this.$el.attr('aria-label', this.options.title || this.options.tooltip || '');
        if (this.context !== null) {
          this.$el.addClass('btn-' + this.context);
        }
        _.each(this.extraClasses, function(klass){
          this.$el.addClass(klass);
        }.bind(this));

        if (this.tooltip !== null) {

          this.$el.attr('title', this.tooltip);
          var tooltipPattern = new Tooltip(this.$el);
          // XXX since tooltip triggers hidden
          // suppress so it plays nice with modals, backdrops, etc
          this.$el.on('hidden', function(e) {
            if (e.type === 'hidden') {
              e.stopPropagation();
            }
          });
        }
      }, this);
    },
    handleClick: function(e) {
      e.preventDefault();
      if (!this.$el.is('.disabled')) {
        this.uiEventTrigger('click', this, e);
      }
    },
    serializedModel: function() {
      return _.extend({'icon': '', 'title': ''}, this.options);
    },
    disable: function() {
      this.$el.addClass('disabled');
    },
    enable: function() {
      this.$el.removeClass('disabled');
    }
  });

  return ButtonView;
});

/**
 * @license text 2.0.15 Copyright jQuery Foundation and other contributors.
 * Released under MIT license, http://github.com/requirejs/text/LICENSE
 */
/*jslint regexp: true */
/*global require, XMLHttpRequest, ActiveXObject,
  define, window, process, Packages,
  java, location, Components, FileUtils */

define('text',['module'], function (module) {
    'use strict';

    var text, fs, Cc, Ci, xpcIsWindows,
        progIds = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'],
        xmlRegExp = /^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im,
        bodyRegExp = /<body[^>]*>\s*([\s\S]+)\s*<\/body>/im,
        hasLocation = typeof location !== 'undefined' && location.href,
        defaultProtocol = hasLocation && location.protocol && location.protocol.replace(/\:/, ''),
        defaultHostName = hasLocation && location.hostname,
        defaultPort = hasLocation && (location.port || undefined),
        buildMap = {},
        masterConfig = (module.config && module.config()) || {};

    function useDefault(value, defaultValue) {
        return value === undefined || value === '' ? defaultValue : value;
    }

    //Allow for default ports for http and https.
    function isSamePort(protocol1, port1, protocol2, port2) {
        if (port1 === port2) {
            return true;
        } else if (protocol1 === protocol2) {
            if (protocol1 === 'http') {
                return useDefault(port1, '80') === useDefault(port2, '80');
            } else if (protocol1 === 'https') {
                return useDefault(port1, '443') === useDefault(port2, '443');
            }
        }
        return false;
    }

    text = {
        version: '2.0.15',

        strip: function (content) {
            //Strips <?xml ...?> declarations so that external SVG and XML
            //documents can be added to a document without worry. Also, if the string
            //is an HTML document, only the part inside the body tag is returned.
            if (content) {
                content = content.replace(xmlRegExp, "");
                var matches = content.match(bodyRegExp);
                if (matches) {
                    content = matches[1];
                }
            } else {
                content = "";
            }
            return content;
        },

        jsEscape: function (content) {
            return content.replace(/(['\\])/g, '\\$1')
                .replace(/[\f]/g, "\\f")
                .replace(/[\b]/g, "\\b")
                .replace(/[\n]/g, "\\n")
                .replace(/[\t]/g, "\\t")
                .replace(/[\r]/g, "\\r")
                .replace(/[\u2028]/g, "\\u2028")
                .replace(/[\u2029]/g, "\\u2029");
        },

        createXhr: masterConfig.createXhr || function () {
            //Would love to dump the ActiveX crap in here. Need IE 6 to die first.
            var xhr, i, progId;
            if (typeof XMLHttpRequest !== "undefined") {
                return new XMLHttpRequest();
            } else if (typeof ActiveXObject !== "undefined") {
                for (i = 0; i < 3; i += 1) {
                    progId = progIds[i];
                    try {
                        xhr = new ActiveXObject(progId);
                    } catch (e) {}

                    if (xhr) {
                        progIds = [progId];  // so faster next time
                        break;
                    }
                }
            }

            return xhr;
        },

        /**
         * Parses a resource name into its component parts. Resource names
         * look like: module/name.ext!strip, where the !strip part is
         * optional.
         * @param {String} name the resource name
         * @returns {Object} with properties "moduleName", "ext" and "strip"
         * where strip is a boolean.
         */
        parseName: function (name) {
            var modName, ext, temp,
                strip = false,
                index = name.lastIndexOf("."),
                isRelative = name.indexOf('./') === 0 ||
                             name.indexOf('../') === 0;

            if (index !== -1 && (!isRelative || index > 1)) {
                modName = name.substring(0, index);
                ext = name.substring(index + 1);
            } else {
                modName = name;
            }

            temp = ext || modName;
            index = temp.indexOf("!");
            if (index !== -1) {
                //Pull off the strip arg.
                strip = temp.substring(index + 1) === "strip";
                temp = temp.substring(0, index);
                if (ext) {
                    ext = temp;
                } else {
                    modName = temp;
                }
            }

            return {
                moduleName: modName,
                ext: ext,
                strip: strip
            };
        },

        xdRegExp: /^((\w+)\:)?\/\/([^\/\\]+)/,

        /**
         * Is an URL on another domain. Only works for browser use, returns
         * false in non-browser environments. Only used to know if an
         * optimized .js version of a text resource should be loaded
         * instead.
         * @param {String} url
         * @returns Boolean
         */
        useXhr: function (url, protocol, hostname, port) {
            var uProtocol, uHostName, uPort,
                match = text.xdRegExp.exec(url);
            if (!match) {
                return true;
            }
            uProtocol = match[2];
            uHostName = match[3];

            uHostName = uHostName.split(':');
            uPort = uHostName[1];
            uHostName = uHostName[0];

            return (!uProtocol || uProtocol === protocol) &&
                   (!uHostName || uHostName.toLowerCase() === hostname.toLowerCase()) &&
                   ((!uPort && !uHostName) || isSamePort(uProtocol, uPort, protocol, port));
        },

        finishLoad: function (name, strip, content, onLoad) {
            content = strip ? text.strip(content) : content;
            if (masterConfig.isBuild) {
                buildMap[name] = content;
            }
            onLoad(content);
        },

        load: function (name, req, onLoad, config) {
            //Name has format: some.module.filext!strip
            //The strip part is optional.
            //if strip is present, then that means only get the string contents
            //inside a body tag in an HTML string. For XML/SVG content it means
            //removing the <?xml ...?> declarations so the content can be inserted
            //into the current doc without problems.

            // Do not bother with the work if a build and text will
            // not be inlined.
            if (config && config.isBuild && !config.inlineText) {
                onLoad();
                return;
            }

            masterConfig.isBuild = config && config.isBuild;

            var parsed = text.parseName(name),
                nonStripName = parsed.moduleName +
                    (parsed.ext ? '.' + parsed.ext : ''),
                url = req.toUrl(nonStripName),
                useXhr = (masterConfig.useXhr) ||
                         text.useXhr;

            // Do not load if it is an empty: url
            if (url.indexOf('empty:') === 0) {
                onLoad();
                return;
            }

            //Load the text. Use XHR if possible and in a browser.
            if (!hasLocation || useXhr(url, defaultProtocol, defaultHostName, defaultPort)) {
                text.get(url, function (content) {
                    text.finishLoad(name, parsed.strip, content, onLoad);
                }, function (err) {
                    if (onLoad.error) {
                        onLoad.error(err);
                    }
                });
            } else {
                //Need to fetch the resource across domains. Assume
                //the resource has been optimized into a JS module. Fetch
                //by the module name + extension, but do not include the
                //!strip part to avoid file system issues.
                req([nonStripName], function (content) {
                    text.finishLoad(parsed.moduleName + '.' + parsed.ext,
                                    parsed.strip, content, onLoad);
                });
            }
        },

        write: function (pluginName, moduleName, write, config) {
            if (buildMap.hasOwnProperty(moduleName)) {
                var content = text.jsEscape(buildMap[moduleName]);
                write.asModule(pluginName + "!" + moduleName,
                               "define(function () { return '" +
                                   content +
                               "';});\n");
            }
        },

        writeFile: function (pluginName, moduleName, req, write, config) {
            var parsed = text.parseName(moduleName),
                extPart = parsed.ext ? '.' + parsed.ext : '',
                nonStripName = parsed.moduleName + extPart,
                //Use a '.js' file name so that it indicates it is a
                //script that can be loaded across domains.
                fileName = req.toUrl(parsed.moduleName + extPart) + '.js';

            //Leverage own load() method to load plugin value, but only
            //write out values that do not have the strip argument,
            //to avoid any potential issues with ! in file names.
            text.load(nonStripName, req, function (value) {
                //Use own write() method to construct full module value.
                //But need to create shell that translates writeFile's
                //write() to the right interface.
                var textWrite = function (contents) {
                    return write(fileName, contents);
                };
                textWrite.asModule = function (moduleName, contents) {
                    return write.asModule(moduleName, fileName, contents);
                };

                text.write(pluginName, nonStripName, textWrite, config);
            }, config);
        }
    };

    if (masterConfig.env === 'node' || (!masterConfig.env &&
            typeof process !== "undefined" &&
            process.versions &&
            !!process.versions.node &&
            !process.versions['node-webkit'] &&
            !process.versions['atom-shell'])) {
        //Using special require.nodeRequire, something added by r.js.
        fs = require.nodeRequire('fs');

        text.get = function (url, callback, errback) {
            try {
                var file = fs.readFileSync(url, 'utf8');
                //Remove BOM (Byte Mark Order) from utf8 files if it is there.
                if (file[0] === '\uFEFF') {
                    file = file.substring(1);
                }
                callback(file);
            } catch (e) {
                if (errback) {
                    errback(e);
                }
            }
        };
    } else if (masterConfig.env === 'xhr' || (!masterConfig.env &&
            text.createXhr())) {
        text.get = function (url, callback, errback, headers) {
            var xhr = text.createXhr(), header;
            xhr.open('GET', url, true);

            //Allow plugins direct access to xhr headers
            if (headers) {
                for (header in headers) {
                    if (headers.hasOwnProperty(header)) {
                        xhr.setRequestHeader(header.toLowerCase(), headers[header]);
                    }
                }
            }

            //Allow overrides specified in config
            if (masterConfig.onXhr) {
                masterConfig.onXhr(xhr, url);
            }

            xhr.onreadystatechange = function (evt) {
                var status, err;
                //Do not explicitly handle errors, those should be
                //visible via console output in the browser.
                if (xhr.readyState === 4) {
                    status = xhr.status || 0;
                    if (status > 399 && status < 600) {
                        //An http 4xx or 5xx error. Signal an error.
                        err = new Error(url + ' HTTP status: ' + status);
                        err.xhr = xhr;
                        if (errback) {
                            errback(err);
                        }
                    } else {
                        callback(xhr.responseText);
                    }

                    if (masterConfig.onXhrComplete) {
                        masterConfig.onXhrComplete(xhr, url);
                    }
                }
            };
            xhr.send(null);
        };
    } else if (masterConfig.env === 'rhino' || (!masterConfig.env &&
            typeof Packages !== 'undefined' && typeof java !== 'undefined')) {
        //Why Java, why is this so awkward?
        text.get = function (url, callback) {
            var stringBuffer, line,
                encoding = "utf-8",
                file = new java.io.File(url),
                lineSeparator = java.lang.System.getProperty("line.separator"),
                input = new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream(file), encoding)),
                content = '';
            try {
                stringBuffer = new java.lang.StringBuffer();
                line = input.readLine();

                // Byte Order Mark (BOM) - The Unicode Standard, version 3.0, page 324
                // http://www.unicode.org/faq/utf_bom.html

                // Note that when we use utf-8, the BOM should appear as "EF BB BF", but it doesn't due to this bug in the JDK:
                // http://bugs.sun.com/bugdatabase/view_bug.do?bug_id=4508058
                if (line && line.length() && line.charAt(0) === 0xfeff) {
                    // Eat the BOM, since we've already found the encoding on this file,
                    // and we plan to concatenating this buffer with others; the BOM should
                    // only appear at the top of a file.
                    line = line.substring(1);
                }

                if (line !== null) {
                    stringBuffer.append(line);
                }

                while ((line = input.readLine()) !== null) {
                    stringBuffer.append(lineSeparator);
                    stringBuffer.append(line);
                }
                //Make sure we return a JavaScript string and not a Java string.
                content = String(stringBuffer.toString()); //String
            } finally {
                input.close();
            }
            callback(content);
        };
    } else if (masterConfig.env === 'xpconnect' || (!masterConfig.env &&
            typeof Components !== 'undefined' && Components.classes &&
            Components.interfaces)) {
        //Avert your gaze!
        Cc = Components.classes;
        Ci = Components.interfaces;
        Components.utils['import']('resource://gre/modules/FileUtils.jsm');
        xpcIsWindows = ('@mozilla.org/windows-registry-key;1' in Cc);

        text.get = function (url, callback) {
            var inStream, convertStream, fileObj,
                readData = {};

            if (xpcIsWindows) {
                url = url.replace(/\//g, '\\');
            }

            fileObj = new FileUtils.File(url);

            //XPCOM, you so crazy
            try {
                inStream = Cc['@mozilla.org/network/file-input-stream;1']
                           .createInstance(Ci.nsIFileInputStream);
                inStream.init(fileObj, 1, 0, false);

                convertStream = Cc['@mozilla.org/intl/converter-input-stream;1']
                                .createInstance(Ci.nsIConverterInputStream);
                convertStream.init(inStream, "utf-8", inStream.available(),
                Ci.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);

                convertStream.readString(inStream.available(), readData);
                convertStream.close();
                inStream.close();
                callback(readData.value);
            } catch (e) {
                throw new Error((fileObj && fileObj.path || '') + ': ' + e);
            }
        };
    }
    return text;
});


define('text!mockup-patterns-relateditems-url/templates/breadcrumb.xml',[],function () { return '<span class="separator">/<span>\n<a href="<%- path %>" class="crumb"><%- text %></a>\n';});


define('text!mockup-patterns-relateditems-url/templates/favorite.xml',[],function () { return '<li><a href="<%- path %>" class="fav" aria-labelledby="blip"><%- title %></a></li>\n';});


define('text!mockup-patterns-relateditems-url/templates/recentlyused.xml',[],function () { return '<li class="pattern-relateditems-recentlyused">\n  <a class="pattern-relateditems-recentlyused-select" data-uid="<%- UID %>">\n    <div class="pattern-relateditems-recentlyused-info">\n      <span\n        class="pattern-relateditems-recentlyused-title <%- portal_type ? \'contenttype-\' + portal_type.toLowerCase() : \'\' %> <%- review_state ? \'state-\' + review_state : \'\' %>"\n        title="<%- portal_type %>">\n        <%- Title %>\n      </span>\n      <span class="pattern-relateditems-recentlyused-path"><%- path %></span>\n    </div>\n    <% if (getURL && (getIcon || portal_type === "Image")) { %>\n      <div class="pattern-relateditems-recentlyused-image">\n        <img src="<%- getURL %>/@@images/image/tile" />\n      </div>\n    <% } %>\n  </a>\n</li>\n';});


define('text!mockup-patterns-relateditems-url/templates/result.xml',[],function () { return '<div class="pattern-relateditems-result <%- oneLevelUp ? \'one-level-up\' : \'\' %>">\n  <div class="pattern-relateditems-result-browse-wrapper">\n  <% if (!oneLevelUp) { %>\n    <a\n      class="pattern-relateditems-result-select<%- selectable ? \' selectable\' : \'\' %><%- oneLevelUp ? \' one-level-up\' : \'\' %>"\n      data-path="<%- path %>">\n  <% } %>\n      <div class="pattern-relateditems-result-info">\n        <span\n          class="pattern-relateditems-result-title <%- portal_type ? \'contenttype-\' + portal_type.toLowerCase() : \'\' %> <%- review_state ? \'state-\' + review_state : \'\' %>"\n          title="<%- portal_type %>">\n          <%- Title %>\n        </span>\n        <span class="pattern-relateditems-result-path"><%- oneLevelUp ? currentPath : path %></span>\n      </div>\n      <% if (is_folderish) { %>\n        <a\n          class="pattern-relateditems-result-browse"\n          data-path="<%- path %>"\n          title="<%- oneLevelUp ? one_level_up : open_folder %>">\n          <span class="<%- oneLevelUp ? \'icon-left-circle\' : \'icon-right-circle\' %>"></span>\n        </a>\n      <% } %>\n  <% if (!oneLevelUp) { %>\n    </a>\n  <% } %>\n  </div>\n  <% if (getURL && (getIcon || portal_type === "Image")) { %>\n    <% if (!oneLevelUp) { %>\n    <a\n      class="pattern-relateditems-result-select<%- selectable ? \' selectable\' : \'\' %><%- oneLevelUp ? \' one-level-up\' : \'\' %>"\n      data-path="<%- path %>">\n    <% } %>\n    <div class="pattern-relateditems-result-image">\n      <img src="<%- getURL %>/@@images/image/thumb" />\n    </div>\n    <% if (!oneLevelUp) { %>\n    </a>\n    <% } %>\n  <% } %>\n</div>\n';});


define('text!mockup-patterns-relateditems-url/templates/selection.xml',[],function () { return '<div class="pattern-relateditems-item">\n  <div class="pattern-relateditems-result-info">\n    <span\n      class="pattern-relateditems-item-title <%- portal_type ? \'contenttype-\' + portal_type.toLowerCase() : \'\' %> <%- review_state ? \'state-\' + review_state : \'\' %>"\n      title="<%- portal_type %>">\n      <%- Title %>\n    </span>\n    <span class="pattern-relateditems-item-path"><%- path %></span>\n  </div>\n  <% if (getURL && (getIcon || portal_type === "Image")) { %>\n    <div class="pattern-relateditems-item-image">\n      <img src="<%- getURL %>/@@images/image/thumb" />\n    </div>\n  <% } %>\n</div>\n';});


define('text!mockup-patterns-relateditems-url/templates/toolbar.xml',[],function () { return '<% if (mode!==\'auto\') { %>\n<div class="btn-group mode-selector" role="group">\n  <button type="button" class="mode search btn <% if (mode==\'search\') { %>btn-primary<% } else {%>btn-default<% } %>"><%- searchModeText %></button>\n  <button type="button" class="mode browse btn <% if (mode==\'browse\') { %>btn-primary<% } else {%>btn-default<% } %>"><%- browseModeText %></button>\n</div>\n<% } %>\n<div class="path-wrapper">\n  <span class="pattern-relateditems-path-label"><%- searchText %></span>\n  <a class="crumb" href="/"><span class="glyphicon glyphicon-home"/></a>\n  <%= items %>\n</div>\n<div class="controls pull-right">\n\n  <% if (recentlyUsedItems) { %>\n  <div class="recentlyUsed dropdown pull-right">\n    <button type="button" class="recentlyUsed dropdown-toggle btn btn-primary" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">\n      <span class="glyphicon glyphicon-time"/>\n      <%- recentlyUsedText %>\n      <span class="caret"/>\n    </button>\n    <ul class="dropdown-menu">\n      <%= recentlyUsedItems %>\n    </ul>\n  </div>\n  <% } %>\n\n  <% if (favorites.length > 0) { %>\n  <div class="favorites dropdown pull-right">\n    <button type="button" class="favorites dropdown-toggle btn btn-primary" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">\n      <span class="glyphicon glyphicon-star"/>\n      <%- favText %>\n      <span class="caret"/>\n    </button>\n    <ul class="dropdown-menu">\n      <%= favItems %>\n    </ul>\n  </div>\n  <% } %>\n</div>\n';});

/* Related items pattern.
 *
 * Options:
 *    vocabularyUrl(string): This is a URL to a JSON-formatted file used to populate the list (null)
 *    attributes(array): This list is passed to the server during an AJAX request to specify the attributes which should be included on each item. (['UID', 'Title', 'portal_type', 'path'])
 *    basePath(string): Start browse/search in this path. Default: set to rootPath.
 *    contextPath(string): Path of the object, which is currently edited. If this path is given, this object will not be selectable.
 *    closeOnSelect(boolean): Select2 option. Whether or not the drop down should be closed when an item is selected. (true)
 *    dropdownCssClass(string): Select2 option. CSS class to add to the drop down element. ('pattern-relateditems-dropdown')
 *    favorites(array): Array of objects. These are favorites, which can be used to quickly jump to different locations. Objects have the attributes "title" and "path". Default: []
 *    maximumSelectionSize(integer): The maximum number of items that can be selected in a multi-select control. If this number is less than 1 selection is not limited. (-1)
 *    minimumInputLength: Select2 option. Number of characters necessary to start a search. Default: 0.
 *    mode(string): Initial widget mode. Possible values: are 'auto', 'search' and 'browse'. If set to 'search', the catalog is searched for a searchterm. If set to 'browse', browsing starts at basePath. Default: 'auto', which means the combination of both.
 *    orderable(boolean): Whether or not items should be drag-and-drop sortable. (true)
 *    pageSize(int): Batch size to break down big result sets into multiple pages. (10).
 *    recentlyUsed(boolean): Show the recently used items dropdown (false).
 *    recentlyUsedMaxItems(integer): Maximum items to keep in recently used list. 0: no restriction. (20).
 *    rootPath(string): Only display breadcrumb path elements deeper than this path. Default: "/"
 *    rootUrl(string): Visible URL up to the rootPath. This is prepended to the currentPath to generate submission URLs.
 *    scanSelection(boolean): Scan the list of selected elements for other patterns.
 *    selectableTypes(array): If the value is null all types are selectable. Otherwise, provide a list of strings to match item types that are selectable. (null)
 *    separator(string): Select2 option. String which separates multiple items. (',')
 *    sortOn(string): Index on which to sort on. If null, will default to term relevance (no sort) when searching and folder order (getObjPositionInParent) when browsing. (null)
 *    sortOrder(string): Sort ordering. ('ascending')
 *    tokenSeparators(array): Select2 option, refer to select2 documentation. ([",", " "])
 *    upload(boolen): Allow file and image uploads from within the related items widget.
 *    uploadAllowView(string): View, which returns a JSON response in the form of {allowUpload: true}, if upload is allowed in the current context.
 *    width(string): Specify a width for the widget. ('100%')
 *    breadcrumbTemplate(string): Template to use for a single item in the breadcrumbs.
 *    breadcrumbTemplateSelector(string): Select an element from the DOM from which to grab the breadcrumbTemplate. (null)
 *    toolbarTemplate(string): Template for element to which toolbar items will be appended.
 *    toolbarTemplateSelector(string): Select an element from the DOM from which to grab the toolbarTemplate. (null)
 *    resultTemplate(string): Template for an item in the in the list of results. Refer to source for default. (Refer to source)
 *    resultTemplateSelector(string): Select an element from the DOM from which to grab the resultTemplate. (null)
 *    selectionTemplate(string): Template for element that will be used to construct a selected item. (Refer to source)
 *    selectionTemplateSelector(string): Select an element from the DOM from which to grab the selectionTemplate. (null)
 *
 * Documentation:
 *    The Related Items pattern is based on Select2 so many of the same options will work here as well.
 *
 *    # Default, mode "search"
 *
 *    {{ example-1 }}
 *
 *    # Default, mode "browse"
 *
 *    {{ example-2 }}
 *
 *    # Existing values, some bad
 *
 *    {{ example-3 }}
 *
 *    # Selectable Types
 *
 *    {{ example-4 }}
 *
 *    # Select a single item
 *
 *    {{ example-5 }}
 *
 *    # Mode "browse", Upload
 *
 *    {{ example-6 }}
 *
 * Example: example-1
 *    <input type="text" class="pat-relateditems"
 *           data-pat-relateditems="width:30em;
 *                                  mode:search;
 *                                  vocabularyUrl:/relateditems-test.json" />
 *
 * Example: example-2
 *    <input type="text" class="pat-relateditems"
 *           data-pat-relateditems="width:30em;
 *                                  mode:browse;
 *                                  vocabularyUrl:/relateditems-test.json" />
 *
 * Example: example-3
 *    <input type="text" class="pat-relateditems"
 *           value="asdf1234gsad,sdfbsfdh345,asdlfkjasdlfkjasdf,kokpoius98"
 *           data-pat-relateditems="width:30em; vocabularyUrl:/relateditems-test.json" />
 *
 * Example: example-4
 *    <input type="text" class="pat-relateditems"
 *           data-pat-relateditems='{"selectableTypes": ["Document"], "vocabularyUrl": "/relateditems-test.json"}' />
 *
 * Example: example-5
 *    <input type="text" class="pat-relateditems"
 *           data-pat-relateditems='{"selectableTypes": ["Document"], "vocabularyUrl": "/relateditems-test.json", "maximumSelectionSize": 1}' />
 *
 * Example: example-6
 *    <input type="text" class="pat-relateditems"
 *           data-pat-relateditems='{"selectableTypes": ["Image", "File"], "vocabularyUrl": "/relateditems-test.json", "upload": true}' />
 *
 */

define('mockup-patterns-relateditems',[
  'jquery',
  'underscore',
  'pat-base',
  'mockup-patterns-select2',
  'mockup-ui-url/views/button',
  'mockup-utils',
  'pat-registry',
  'translate',
  'text!mockup-patterns-relateditems-url/templates/breadcrumb.xml',
  'text!mockup-patterns-relateditems-url/templates/favorite.xml',
  'text!mockup-patterns-relateditems-url/templates/recentlyused.xml',
  'text!mockup-patterns-relateditems-url/templates/result.xml',
  'text!mockup-patterns-relateditems-url/templates/selection.xml',
  'text!mockup-patterns-relateditems-url/templates/toolbar.xml',
  'bootstrap-dropdown'
], function($, _, Base, Select2, ButtonView, utils, registry, _t,
            BreadcrumbTemplate,
            FavoriteTemplate,
            RecentlyUsedTemplate,
            ResultTemplate,
            SelectionTemplate,
            ToolbarTemplate
) {
  'use strict';

  var KEY = {
    LEFT: 37,
    RIGHT: 39
  };

  var RelatedItems = Base.extend({
    name: 'relateditems',
    trigger: '.pat-relateditems',
    parser: 'mockup',
    currentPath: undefined,
    selectedUIDs: [],
    openAfterInit: undefined,
    defaults: {
      // main option
      vocabularyUrl: null,  // must be set to work

      // more options
      attributes: ['UID', 'Title', 'portal_type', 'path', 'getURL', 'getIcon', 'is_folderish', 'review_state'],  // used by utils.QueryHelper
      basePath: '',
      pageSize: 10,
      browsing: undefined,
      closeOnSelect: true,
      contextPath: undefined,
      dropdownCssClass: 'pattern-relateditems-dropdown',
      favorites: [],
      recentlyUsed: false,
      recentlyUsedMaxItems: 20,
      recentlyUsedKey: 'relateditems_recentlyused',
      maximumSelectionSize: -1,
      minimumInputLength: 0,
      mode: 'auto', // possible values are 'auto', 'search' and 'browse'.
      orderable: true,  // mockup-patterns-select2
      pathOperator: 'plone.app.querystring.operation.string.path',
      rootPath: '/',
      rootUrl: '',  // default to be relative.
      scanSelection: false,  // False, to no unnecessarily use CPU time on this.
      selectableTypes: null, // null means everything is selectable, otherwise a list of strings to match types that are selectable
      separator: ',',
      sortOn: null,
      sortOrder: 'ascending',
      tokenSeparators: [',', ' '],
      upload: false,
      uploadAllowView: undefined,
      width: '100%',

      // templates
      breadcrumbTemplate: BreadcrumbTemplate,
      breadcrumbTemplateSelector: null,
      favoriteTemplate: FavoriteTemplate,
      favoriteTemplateSelector: null,
      recentlyusedTemplate: RecentlyUsedTemplate,
      recentlyusedTemplateSelector: null,
      resultTemplate: ResultTemplate,
      resultTemplateSelector: null,
      selectionTemplate: SelectionTemplate,
      selectionTemplateSelector: null,
      toolbarTemplate: ToolbarTemplate,
      toolbarTemplateSelector: null,

      // needed
      multiple: true,

    },

    recentlyUsed: function (filterSelectable) {
      var ret = utils.storage.get(this.options.recentlyUsedKey) || [];
      // hard-limit to 1000 entries
      ret = ret.slice(ret.length-1000, ret.length);
      if (filterSelectable) {
        // Filter out only selectable items.
        // This is used only to create the list of items to be displayed.
        // the list to be stored is unfiltered and can be reused among
        // different instances of this widget with different settings.
        ret.filter(this.isSelectable.bind(this));
      }
      // max is applied AFTER filtering selectable items.
      var max = parseInt(this.options.recentlyUsedMaxItems, 10);
      if (max) {
        // return the slice from the end, as we want to display newest items first.
        ret = ret.slice(ret.length-max, ret.length);
      }
      return ret;
    },

    applyTemplate: function(tpl, item) {
      var self = this;
      var template;
      if (self.options[tpl + 'TemplateSelector']) {
        template = $(self.options[tpl + 'TemplateSelector']).html();
        if (!template) {
          template = self.options[tpl + 'Template'];
        }
      } else {
        template = self.options[tpl + 'Template'];
      }
      // let's give all the options possible to the template generation
      var options = $.extend(true, {}, self.options, item, {
        'browsing': self.browsing,
        'open_folder': _t('Open folder'),
        'current_directory': _t('current directory:'),
        'one_level_up': _t('Go one level up')
      });
      options._item = item;
      return _.template(template)(options);
    },

    setAjax: function () {
      var ajax = {

        url: this.options.vocabularyUrl,
        dataType: 'JSON',
        quietMillis: 500,

        data: function (term, page) {

          var criterias = [];
          if (term) {
            term = '*' + term + '*';
            criterias.push({
              i: 'SearchableText',
              o: 'plone.app.querystring.operation.string.contains',
              v: term
            });
          }

          // We don't restrict for selectable types while browsing...
          if (!this.browsing && this.options.selectableTypes) {
            criterias.push({
              i: 'portal_type',
              o: 'plone.app.querystring.operation.selection.any',
              v: this.options.selectableTypes
            });
          }

          criterias.push({
            i: 'path',
            o: this.options.pathOperator,
            v: this.options.rootPath + this.currentPath + (this.browsing ? '::1' : '')
          });

          var sort_on = this.options.sortOn;
          var sort_order = sort_on ? this.options.sortOrder : null;
          if (this.browsing && sort_on === null) {
            sort_on = 'getObjPositionInParent';
            sort_order = 'ascending';
          }

          var data = {
            query: JSON.stringify({
              criteria: criterias,
              sort_on: sort_on,
              sort_order: sort_order
            }),
            attributes: JSON.stringify(this.options.attributes),
            batch: JSON.stringify({
              page: page ? page : 1,
              size: this.options.pageSize
            })
          };
          return data;
        }.bind(this),

        results: function (data, page) {

          var more = (page * this.options.pageSize) < data.total;
          var results = data.results;

          this.selectedUIDs = (this.$el.select2('data') || []).map(function (el) {
            // populate current selection. Reuse in formatResult
            return el.UID;
          });

          // Filter out items:
          // While browsing: always include folderish items
          // Browsing and searching: Only include selectable items which are not already selected, and all folders
          // even if they're selected, as we need them available for browsing/selecting their children
          results = results.filter(
            function (item) {
              if (
                (this.browsing && item.is_folderish) ||
                (this.isSelectable(item) && this.selectedUIDs.indexOf(item.UID) === -1)
              ) {
                return true;
              }
              return false;
            }.bind(this)
          );

          // Extend ``data`` with a ``oneLevelUp`` item when browsing
          var path = this.currentPath.split('/');
          if (page === 1 &&           // Show level up only on top.
            this.browsing  &&         // only level up when browsing
            path.length > 1 &&        // do not try to level up one level under root.
            this.currentPath !== '/'  // do not try to level up beyond root
          ) {
            results = [{
              'oneLevelUp': true,
              'Title': _t('One level up'),
              'path': path.slice(0, path.length - 1).join('/') || '/',
              'currentPath': this.currentPath,
              'is_folderish': true,
              'selectable': false
            }].concat(results);
          }
          return {
            results: results,
            more: more
          };
        }.bind(this)

      };
      this.options.ajax = ajax;
    },

    renderToolbar: function () {
      var self = this;
      var path = self.currentPath;
      var html;

      var paths = path.split('/');
      var itemPath = '';
      var itemsHtml = '';
      _.each(paths, function(node) {
        if (node !== '') {
          var item = {};
          item.path = itemPath = itemPath + '/' + node;
          item.text = node;
          itemsHtml = itemsHtml + self.applyTemplate('breadcrumb', item);
        }
      });

      // favorites
      var favoritesHtml = '';
      _.each(self.options.favorites, function (item) {
        var item_copy = _.clone(item);
        item_copy.path = item_copy.path.substr(self.options.rootPath.length) || '/';
        favoritesHtml = favoritesHtml + self.applyTemplate('favorite', item_copy);
      });

      var recentlyUsedHtml = '';
      if (self.options.recentlyUsed) {
        var recentlyUsed = self.recentlyUsed(true);  // filter out only those items which can actually be selected
        _.each(recentlyUsed.reverse(), function (item) {  // reverse to get newest first.
          recentlyUsedHtml = recentlyUsedHtml + self.applyTemplate('recentlyused', item);
        });
      }

      html = self.applyTemplate('toolbar', {
        items: itemsHtml,
        favItems: favoritesHtml,
        favText: _t('Favorites'),
        searchText: _t('Current path:'),
        searchModeText: _t('Search'),
        browseModeText: _t('Browse'),
        recentlyUsedItems: recentlyUsedHtml,
        recentlyUsedText: _t('Recently Used'),
      });

      self.$toolbar.html(html);

      $('.dropdown-toggle', self.$toolbar).dropdown();

      // unbind mouseup event from select2 to override the behavior:
      $(".pattern-relateditems-dropdown").unbind("mouseup");
      $(".pattern-relateditems-dropdown").bind("mouseup", function(e) {
          e.stopPropagation();
      });

      $('button.mode.search', self.$toolbar).on('click', function(e) {
        e.preventDefault();
        if (self.browsing) {
          $('button.mode.search', self.$toolbar).toggleClass('btn-primary btn-default');
          $('button.mode.browse', self.$toolbar).toggleClass('btn-primary btn-default');
          self.browsing = false;
          if (self.$el.select2('data').length > 0) {
            // Have to call after initialization
            self.openAfterInit = true;
          }
          if (!self.openAfterInit) {
            self.$el.select2('close');
            self.$el.select2('open');
          }
        } else {
          // just open result list
          self.$el.select2('close');
          self.$el.select2('open');
        }
      });

      $('button.mode.browse', self.$toolbar).on('click', function(e) {
        e.preventDefault();
        if (!self.browsing) {
          $('button.mode.search', self.$toolbar).toggleClass('btn-primary btn-default');
          $('button.mode.browse', self.$toolbar).toggleClass('btn-primary btn-default');
          self.browsing = true;
          if (self.$el.select2('data').length > 0) {
            // Have to call after initialization
            self.openAfterInit = true;
          }
          if (!self.openAfterInit) {
            self.$el.select2('close');
            self.$el.select2('open');
          }
        } else {
          // just open result list
          self.$el.select2('close');
          self.$el.select2('open');
        }
      });

      $('a.crumb', self.$toolbar).on('click', function(e) {
        e.preventDefault();
        self.browseTo($(this).attr('href'));
      });

      $('a.fav', self.$toolbar).on('click', function(e) {
        e.preventDefault();
        self.browseTo($(this).attr('href'));
      });

      if (self.options.recentlyUsed) {
        $('.pattern-relateditems-recentlyused-select', self.$toolbar).on('click', function(event) {
          event.preventDefault();
          var uid = $(this).data('uid');
          var item = self.recentlyUsed().filter(function (it) { return it.UID === uid; });
          if (item.length > 0) {
            item = item[0];
          } else {
            return;
          }
          self.selectItem(item);
          if (self.options.maximumSelectionSize > 0) {
            var items = self.$el.select2('data');
            if (items.length >= self.options.maximumSelectionSize) {
              return;
            }
          }
        });
      }

      function initUploadView(UploadView, disabled) {
        var uploadButtonId = 'upload-' + utils.generateId();
        var uploadButton = new ButtonView({
          id:  uploadButtonId,
          title: _t('Upload'),
          tooltip: _t('Upload files'),
          icon: 'upload',
        });
        if (disabled) {
          uploadButton.disable();
        }
        $('.controls', self.$toolbar).prepend(uploadButton.render().el);
        self.uploadView = new UploadView({
          triggerView: uploadButton,
          app: self
        });
        $('#btn-' +  uploadButtonId, self.$toolbar).append(self.uploadView.render().el);
      }

      // upload
      if (self.options.upload && utils.featureSupport.dragAndDrop() && utils.featureSupport.fileApi()) {

        require(['mockup-patterns-relateditems-upload'], function (UploadView) {
          if (self.options.uploadAllowView) {
            // Check, if uploads are allowed in current context
            $.ajax({
              url: self.options.uploadAllowView,
              // url: self.currentUrl() + self.options.uploadAllowView,  // not working yet
              dataType: 'JSON',
              data: {
                path: self.options.rootPath + self.currentPath
              },
              type: 'GET',
              success: function (result) {
                initUploadView(UploadView, !result.allowUpload);
              }
            });
          } else {
            // just initialize upload view without checking, if uploads are allowed.
            initUploadView(UploadView);
          }
        });

      }

    },

    browseTo: function (path) {
      var self = this;
      self.emit('before-browse');
      self.currentPath = path;
      self.$el.select2('close');
      self.renderToolbar();
      self.$el.select2('open');
      self.emit('after-browse');
    },

    selectItem: function(item) {
      var self = this;
      self.emit('selecting');
      var data = self.$el.select2('data');
      data.push(item);
      self.$el.select2('data', data, true);

      if (self.options.recentlyUsed) {
        // add to recently added items
        var recentlyUsed = self.recentlyUsed();  // do not filter for selectable but get all. append to that list the new item.
        var alreadyPresent = recentlyUsed.filter(function (it) { return it.UID === item.UID; });
        if (alreadyPresent.length > 0) {
          recentlyUsed.splice(recentlyUsed.indexOf(alreadyPresent[0]), 1);
        }
        recentlyUsed.push(item);
        utils.storage.set(self.options.recentlyUsedKey, recentlyUsed);
      }

      self.emit('selected');
    },

    deselectItem: function(item) {
      var self = this;
      self.emit('deselecting');
      var data = self.$el.select2('data');
      _.each(data, function(obj, i) {
        if (obj.UID === item.UID) {
          data.splice(i, 1);
        }
      });
      self.$el.select2('data', data, true);
      self.emit('deselected');
    },

    isSelectable: function(item) {
      var self = this;
      if (item.selectable === false) {
        return false;
      }
      if (self.options.selectableTypes === null) {
        return true;
      } else {
        return self.options.selectableTypes.indexOf(item.portal_type) !== -1;
      }
    },

    init: function() {
      var self = this;

      self.browsing = self.options.mode !== 'search';

      // Remove trailing slash
      self.options.rootPath = self.options.rootPath.replace(/\/$/, '');
      // Substract rootPath from basePath with is the relative currentPath. Has a leading slash. Or use '/'
      self.currentPath = self.options.basePath.substr(self.options.rootPath.length) || '/';

      self.setAjax();

      self.$el.wrap('<div class="pattern-relateditems-container" />');
      self.$container = self.$el.parents('.pattern-relateditems-container');
      self.$container.width(self.options.width);

      Select2.prototype.initializeValues.call(self);
      Select2.prototype.initializeTags.call(self);

      self.options.formatSelection = function(item) {

        item = $.extend(true, {
            'Title': '',
            'getIcon': '',
            'getURL': '',
            'path': '',
            'portal_type': '',
            'review_state': ''
        }, item);

        // activate petterns on the result set.
        var $selection = $(self.applyTemplate('selection', item));
        if (self.options.scanSelection) {
          registry.scan($selection);
        }
        if (self.options.maximumSelectionSize == 1){
          // If this related field accepts only 1 item, the breadcrumbs should
          // reflect the location for this particular item
          var itemPath = item.path;
          var path_split = itemPath.split('/');
          path_split = path_split.slice(0,-1);  // Remove last part of path, we always want the parent path
          itemPath = path_split.join('/');
          self.currentPath = itemPath;
          self.renderToolbar();
        }
        return $selection;
      };

      Select2.prototype.initializeOrdering.call(self);



      self.options.formatResult = function(item) {
        item.selectable = self.isSelectable(item);

        item = $.extend(true, {
            'Title': '',
            'getIcon': '',
            'getURL': '',
            'is_folderish': false,
            'oneLevelUp': false,
            'path': '',
            'portal_type': '',
            'review_state': '',
            'selectable': false,
        }, item);

        if (self.selectedUIDs.indexOf(item.UID) !== -1) {
            // do not allow already selected items to be selected again.
            item.selectable = false;
        }

        var result = $(self.applyTemplate('result', item));

        $('.pattern-relateditems-result-select', result).on('click', function(event) {
          event.preventDefault();
          // event.stopPropagation();
          if ($(this).is('.selectable')) {
            var $parent = $(this).parents('.pattern-relateditems-result');
            if ($parent.is('.pattern-relateditems-active')) {
              $parent.removeClass('pattern-relateditems-active');
              self.deselectItem(item);
            } else {
              if (self.options.maximumSelectionSize > 0) {
                var items = self.$el.select2('data');
                if (items.length >= self.options.maximumSelectionSize) {
                  self.$el.select2('close');
                }
              }
              self.selectItem(item);
              $parent.addClass('pattern-relateditems-active');
              if (self.options.closeOnSelect) {
                self.$el.select2('close');
              }
            }
          }
        });

        $('.pattern-relateditems-result-browse', result).on('click', function(event) {
          event.preventDefault();
          event.stopPropagation();
          var path = $(this).data('path');
          self.browseTo(path);
        });

        return $(result);
      };

      self.options.initSelection = function(element, callback) {
        var value = $(element).val();
        if (value !== '') {
          var ids = value.split(self.options.separator);
          var query = new utils.QueryHelper(
            $.extend(true, {}, self.options, {
              pattern: self
            })
          );
          query.search(
            'UID', 'plone.app.querystring.operation.list.contains', ids,
            function(data) {
              var results = data.results.reduce(function(prev, item) {
                prev[item.UID] = item;
                return prev;
              }, {});

              try {
                callback(
                  ids
                  .map(function(uid) {
                    return results[uid];
                  })
                  .filter(function(item) {
                    return item !== undefined;
                  })
                );
              } catch (e) {
                // Select2 3.5.4 throws an error in some cases in
                // updateSelection, ``this.selection.find(".select2-search-choice").remove();``
                // No idea why, hard to track.
              }

              if (self.openAfterInit) {
                // open after initialization
                self.$el.select2('open');
                self.openAfterInit = undefined;
              }

            },
            false
          );
        }
      };

      self.options.tokenizer = function (input) {
        if (this.options.mode === 'auto') {
          this.browsing = input ? false : true;
        }
      }.bind(this);

      self.options.id = function(item) {
        return item.UID;
      };

      Select2.prototype.initializeSelect2.call(self);

      self.$toolbar = $('<div class="toolbar ui-offset-parent" />');
      self.$container.prepend(self.$toolbar);
      self.$el.on('select2-selecting', function(event) {
        if (!self.isSelectable(event.choice)) {
          event.preventDefault();
        }
      });
      self.renderToolbar();

      $(document).on('keyup', self.$el, function(event) {
        var isOpen = Select2.prototype.opened.call(self);

        if (!isOpen) {
          return;
        }

        if ((event.which === KEY.LEFT) || (event.which === KEY.RIGHT)) {
          event.stopPropagation();

          var selectorContext =
            event.which === KEY.LEFT
              ? '.pattern-relateditems-result.one-level-up'
              : '.select2-highlighted';

          var browsableItemSelector = '.pattern-relateditems-result-browse';
          var browsableItem = $(browsableItemSelector, selectorContext);

          if (browsableItem.length !== 1) {
            return;
          }

          var path = browsableItem.data('path');

          self.browseTo(path);
        }
      });
    }
  });

  return RelatedItems;

});

/*!
 * pickadate.js v3.6.4, 2019/05/25
 * By Amsul, http://amsul.ca
 * Hosted on http://amsul.github.io/pickadate.js
 * Licensed under MIT
 */

(function ( factory ) {

    // AMD.
    if ( typeof define == 'function' && define.amd )
        define( 'picker', ['jquery'], factory )

    // Node.js/browserify.
    else if ( typeof exports == 'object' )
        module.exports = factory( require('jquery') )

    // Browser globals.
    else if ( typeof window == 'object' )
        window.Picker = factory( jQuery )
    
    else this.Picker = factory( jQuery )

}(function( $ ) {

var $window = $( window )
var $document = $( document )
var $html = $( document.documentElement )
var supportsTransitions = document.documentElement.style.transition != null


/**
 * The picker constructor that creates a blank picker.
 */
function PickerConstructor( ELEMENT, NAME, COMPONENT, OPTIONS ) {

    // If there’s no element, return the picker constructor.
    if ( !ELEMENT ) return PickerConstructor


    var
        IS_DEFAULT_THEME = false,


        // The state of the picker.
        STATE = {
            id: ELEMENT.id || 'P' + Math.abs( ~~(Math.random() * new Date()) ),
            handlingOpen: false,
        },


        // Merge the defaults and options passed.
        SETTINGS = COMPONENT ? $.extend( true, {}, COMPONENT.defaults, OPTIONS ) : OPTIONS || {},


        // Merge the default classes with the settings classes.
        CLASSES = $.extend( {}, PickerConstructor.klasses(), SETTINGS.klass ),


        // The element node wrapper into a jQuery object.
        $ELEMENT = $( ELEMENT ),


        // Pseudo picker constructor.
        PickerInstance = function() {
            return this.start()
        },


        // The picker prototype.
        P = PickerInstance.prototype = {

            constructor: PickerInstance,

            $node: $ELEMENT,


            /**
             * Initialize everything
             */
            start: function() {

                // If it’s already started, do nothing.
                if ( STATE && STATE.start ) return P


                // Update the picker states.
                STATE.methods = {}
                STATE.start = true
                STATE.open = false
                STATE.type = ELEMENT.type


                // Confirm focus state, convert into text input to remove UA stylings,
                // and set as readonly to prevent keyboard popup.
                ELEMENT.autofocus = ELEMENT == getActiveElement()
                ELEMENT.readOnly = !SETTINGS.editable
                ELEMENT.id = ELEMENT.id || STATE.id
                if ( ELEMENT.type != 'text' ) {
                    ELEMENT.type = 'text'
                }


                // Create a new picker component with the settings.
                P.component = new COMPONENT(P, SETTINGS)


                // Create the picker root and then prepare it.
                P.$root = $( '<div class="' + CLASSES.picker + '" id="' + ELEMENT.id + '_root" />' )
                prepareElementRoot()


                // Create the picker holder and then prepare it.
                P.$holder = $( createWrappedComponent() ).appendTo( P.$root )
                prepareElementHolder()


                // If there’s a format for the hidden input element, create the element.
                if ( SETTINGS.formatSubmit ) {
                    prepareElementHidden()
                }


                // Prepare the input element.
                prepareElement()


                // Insert the hidden input as specified in the settings.
                if ( SETTINGS.containerHidden ) $( SETTINGS.containerHidden ).append( P._hidden )
                else $ELEMENT.after( P._hidden )


                // Insert the root as specified in the settings.
                if ( SETTINGS.container ) $( SETTINGS.container ).append( P.$root )
                else $ELEMENT.after( P.$root )


                // Bind the default component and settings events.
                P.on({
                    start: P.component.onStart,
                    render: P.component.onRender,
                    stop: P.component.onStop,
                    open: P.component.onOpen,
                    close: P.component.onClose,
                    set: P.component.onSet
                }).on({
                    start: SETTINGS.onStart,
                    render: SETTINGS.onRender,
                    stop: SETTINGS.onStop,
                    open: SETTINGS.onOpen,
                    close: SETTINGS.onClose,
                    set: SETTINGS.onSet
                })


                // Once we’re all set, check the theme in use.
                IS_DEFAULT_THEME = isUsingDefaultTheme( P.$holder[0] )


                // If the element has autofocus, open the picker.
                if ( ELEMENT.autofocus ) {
                    P.open()
                }


                // Trigger queued the “start” and “render” events.
                return P.trigger( 'start' ).trigger( 'render' )
            }, //start


            /**
             * Render a new picker
             */
            render: function( entireComponent ) {

                // Insert a new component holder in the root or box.
                if ( entireComponent ) {
                    P.$holder = $( createWrappedComponent() )
                    prepareElementHolder()
                    P.$root.html( P.$holder )
                }
                else P.$root.find( '.' + CLASSES.box ).html( P.component.nodes( STATE.open ) )

                // Trigger the queued “render” events.
                return P.trigger( 'render' )
            }, //render


            /**
             * Destroy everything
             */
            stop: function() {

                // If it’s already stopped, do nothing.
                if ( !STATE.start ) return P

                // Then close the picker.
                P.close()

                // Remove the hidden field.
                if ( P._hidden ) {
                    P._hidden.parentNode.removeChild( P._hidden )
                }

                // Remove the root.
                P.$root.remove()

                // Remove the input class, remove the stored data, and unbind
                // the events (after a tick for IE - see `P.close`).
                $ELEMENT.removeClass( CLASSES.input ).removeData( NAME )
                setTimeout( function() {
                    $ELEMENT.off( '.' + STATE.id )
                }, 0)

                // Restore the element state
                ELEMENT.type = STATE.type
                ELEMENT.readOnly = false

                // Trigger the queued “stop” events.
                P.trigger( 'stop' )

                // Reset the picker states.
                STATE.methods = {}
                STATE.start = false

                return P
            }, //stop


            /**
             * Open up the picker
             */
            open: function( dontGiveFocus ) {

                // If it’s already open, do nothing.
                if ( STATE.open ) return P

                // Add the “active” class.
                $ELEMENT.addClass( CLASSES.active )
                aria( ELEMENT, 'expanded', true )

                // * A Firefox bug, when `html` has `overflow:hidden`, results in
                //   killing transitions :(. So add the “opened” state on the next tick.
                //   Bug: https://bugzilla.mozilla.org/show_bug.cgi?id=625289
                setTimeout( function() {

                    // Add the “opened” class to the picker root.
                    P.$root.addClass( CLASSES.opened )
                    aria( P.$root[0], 'hidden', false )

                }, 0 )

                // If we have to give focus, bind the element and doc events.
                if ( dontGiveFocus !== false ) {

                    // Set it as open.
                    STATE.open = true

                    // Prevent the page from scrolling.
                    if ( IS_DEFAULT_THEME ) {
                        $('body').
                            css( 'overflow', 'hidden' ).
                            css( 'padding-right', '+=' + getScrollbarWidth() )
                    }

                    // Pass focus to the root element’s jQuery object.
                    focusPickerOnceOpened()

                    // Bind the document events.
                    $document.on( 'click.' + STATE.id + ' focusin.' + STATE.id, function( event ) {
                        // If the picker is currently midway through processing
                        // the opening sequence of events then don't handle clicks
                        // on any part of the DOM. This is caused by a bug in Chrome 73
                        // where a click event is being generated with the incorrect
                        // path in it.
                        // In short, if someone does a click that finishes after the
                        // new element is created then the path contains only the
                        // parent element and not the input element itself.
                        if (STATE.handlingOpen) {
                          return;
                        }

                        var target = getRealEventTarget( event, ELEMENT )

                        // If the target of the event is not the element, close the picker picker.
                        // * Don’t worry about clicks or focusins on the root because those don’t bubble up.
                        //   Also, for Firefox, a click on an `option` element bubbles up directly
                        //   to the doc. So make sure the target wasn't the doc.
                        // * In Firefox stopPropagation() doesn’t prevent right-click events from bubbling,
                        //   which causes the picker to unexpectedly close when right-clicking it. So make
                        //   sure the event wasn’t a right-click.
                        // * In Chrome 62 and up, password autofill causes a simulated focusin event which
                        //   closes the picker.
                        if ( ! event.isSimulated && target != ELEMENT && target != document && event.which != 3 ) {

                            // If the target was the holder that covers the screen,
                            // keep the element focused to maintain tabindex.
                            P.close( target === P.$holder[0] )
                        }

                    }).on( 'keydown.' + STATE.id, function( event ) {

                        var
                            // Get the keycode.
                            keycode = event.keyCode,

                            // Translate that to a selection change.
                            keycodeToMove = P.component.key[ keycode ],

                            // Grab the target.
                            target = getRealEventTarget( event, ELEMENT )


                        // On escape, close the picker and give focus.
                        if ( keycode == 27 ) {
                            P.close( true )
                        }


                        // Check if there is a key movement or “enter” keypress on the element.
                        else if ( target == P.$holder[0] && ( keycodeToMove || keycode == 13 ) ) {

                            // Prevent the default action to stop page movement.
                            event.preventDefault()

                            // Trigger the key movement action.
                            if ( keycodeToMove ) {
                                PickerConstructor._.trigger( P.component.key.go, P, [ PickerConstructor._.trigger( keycodeToMove ) ] )
                            }

                            // On “enter”, if the highlighted item isn’t disabled, set the value and close.
                            else if ( !P.$root.find( '.' + CLASSES.highlighted ).hasClass( CLASSES.disabled ) ) {
                                P.set( 'select', P.component.item.highlight )
                                if ( SETTINGS.closeOnSelect ) {
                                    P.close( true )
                                }
                            }
                        }


                        // If the target is within the root and “enter” is pressed,
                        // prevent the default action and trigger a click on the target instead.
                        else if ( $.contains( P.$root[0], target ) && keycode == 13 ) {
                            event.preventDefault()
                            target.click()
                        }
                    })
                }

                // Trigger the queued “open” events.
                return P.trigger( 'open' )
            }, //open


            /**
             * Close the picker
             */
            close: function( giveFocus ) {

                // If we need to give focus, do it before changing states.
                if ( giveFocus ) {
                    if ( SETTINGS.editable ) {
                        ELEMENT.focus()
                    }
                    else {
                        // ....ah yes! It would’ve been incomplete without a crazy workaround for IE :|
                        // The focus is triggered *after* the close has completed - causing it
                        // to open again. So unbind and rebind the event at the next tick.
                        P.$holder.off( 'focus.toOpen' ).focus()
                        setTimeout( function() {
                            P.$holder.on( 'focus.toOpen', handleFocusToOpenEvent )
                        }, 0 )
                    }
                }

                // Remove the “active” class.
                $ELEMENT.removeClass( CLASSES.active )
                aria( ELEMENT, 'expanded', false )

                // * A Firefox bug, when `html` has `overflow:hidden`, results in
                //   killing transitions :(. So remove the “opened” state on the next tick.
                //   Bug: https://bugzilla.mozilla.org/show_bug.cgi?id=625289
                setTimeout( function() {

                    // Remove the “opened” and “focused” class from the picker root.
                    P.$root.removeClass( CLASSES.opened + ' ' + CLASSES.focused )
                    aria( P.$root[0], 'hidden', true )

                }, 0 )

                // If it’s already closed, do nothing more.
                if ( !STATE.open ) return P

                // Set it as closed.
                STATE.open = false

                // Allow the page to scroll.
                if ( IS_DEFAULT_THEME ) {
                    $('body').
                        css( 'overflow', '' ).
                        css( 'padding-right', '-=' + getScrollbarWidth() )
                }

                // Unbind the document events.
                $document.off( '.' + STATE.id )

                // Trigger the queued “close” events.
                return P.trigger( 'close' )
            }, //close


            /**
             * Clear the values
             */
            clear: function( options ) {
                return P.set( 'clear', null, options )
            }, //clear


            /**
             * Set something
             */
            set: function( thing, value, options ) {

                var thingItem, thingValue,
                    thingIsObject = $.isPlainObject( thing ),
                    thingObject = thingIsObject ? thing : {}

                // Make sure we have usable options.
                options = thingIsObject && $.isPlainObject( value ) ? value : options || {}

                if ( thing ) {

                    // If the thing isn’t an object, make it one.
                    if ( !thingIsObject ) {
                        thingObject[ thing ] = value
                    }

                    // Go through the things of items to set.
                    for ( thingItem in thingObject ) {

                        // Grab the value of the thing.
                        thingValue = thingObject[ thingItem ]

                        // First, if the item exists and there’s a value, set it.
                        if ( thingItem in P.component.item ) {
                            if ( thingValue === undefined ) thingValue = null
                            P.component.set( thingItem, thingValue, options )
                        }

                        // Then, check to update the element value and broadcast a change.
                        if ( ( thingItem == 'select' || thingItem == 'clear' ) && SETTINGS.updateInput ) {
                            $ELEMENT.
                                val( thingItem == 'clear' ? '' : P.get( thingItem, SETTINGS.format ) ).
                                trigger( 'change' )
                        }
                    }

                    // Render a new picker.
                    P.render()
                }

                // When the method isn’t muted, trigger queued “set” events and pass the `thingObject`.
                return options.muted ? P : P.trigger( 'set', thingObject )
            }, //set


            /**
             * Get something
             */
            get: function( thing, format ) {

                // Make sure there’s something to get.
                thing = thing || 'value'

                // If a picker state exists, return that.
                if ( STATE[ thing ] != null ) {
                    return STATE[ thing ]
                }

                // Return the submission value, if that.
                if ( thing == 'valueSubmit' ) {
                    if ( P._hidden ) {
                        return P._hidden.value
                    }
                    thing = 'value'
                }

                // Return the value, if that.
                if ( thing == 'value' ) {
                    return ELEMENT.value
                }

                // Check if a component item exists, return that.
                if ( thing in P.component.item ) {
                    if ( typeof format == 'string' ) {
                        var thingValue = P.component.get( thing )
                        return thingValue ?
                            PickerConstructor._.trigger(
                                P.component.formats.toString,
                                P.component,
                                [ format, thingValue ]
                            ) : ''
                    }
                    return P.component.get( thing )
                }
            }, //get



            /**
             * Bind events on the things.
             */
            on: function( thing, method, internal ) {

                var thingName, thingMethod,
                    thingIsObject = $.isPlainObject( thing ),
                    thingObject = thingIsObject ? thing : {}

                if ( thing ) {

                    // If the thing isn’t an object, make it one.
                    if ( !thingIsObject ) {
                        thingObject[ thing ] = method
                    }

                    // Go through the things to bind to.
                    for ( thingName in thingObject ) {

                        // Grab the method of the thing.
                        thingMethod = thingObject[ thingName ]

                        // If it was an internal binding, prefix it.
                        if ( internal ) {
                            thingName = '_' + thingName
                        }

                        // Make sure the thing methods collection exists.
                        STATE.methods[ thingName ] = STATE.methods[ thingName ] || []

                        // Add the method to the relative method collection.
                        STATE.methods[ thingName ].push( thingMethod )
                    }
                }

                return P
            }, //on



            /**
             * Unbind events on the things.
             */
            off: function() {
                var i, thingName,
                    names = arguments;
                for ( i = 0, namesCount = names.length; i < namesCount; i += 1 ) {
                    thingName = names[i]
                    if ( thingName in STATE.methods ) {
                        delete STATE.methods[thingName]
                    }
                }
                return P
            },


            /**
             * Fire off method events.
             */
            trigger: function( name, data ) {
                var _trigger = function( name ) {
                    var methodList = STATE.methods[ name ]
                    if ( methodList ) {
                        methodList.map( function( method ) {
                            PickerConstructor._.trigger( method, P, [ data ] )
                        })
                    }
                }
                _trigger( '_' + name )
                _trigger( name )
                return P
            } //trigger
        } //PickerInstance.prototype


    /**
     * Wrap the picker holder components together.
     */
    function createWrappedComponent() {

        // Create a picker wrapper holder
        return PickerConstructor._.node( 'div',

            // Create a picker wrapper node
            PickerConstructor._.node( 'div',

                // Create a picker frame
                PickerConstructor._.node( 'div',

                    // Create a picker box node
                    PickerConstructor._.node( 'div',

                        // Create the components nodes.
                        P.component.nodes( STATE.open ),

                        // The picker box class
                        CLASSES.box
                    ),

                    // Picker wrap class
                    CLASSES.wrap
                ),

                // Picker frame class
                CLASSES.frame
            ),

            // Picker holder class
            CLASSES.holder,

            'tabindex="-1"'
        ) //endreturn
    } //createWrappedComponent

    /**
     * Prepare the input element with all bindings.
     */
    function prepareElement() {

        $ELEMENT.

            // Store the picker data by component name.
            data(NAME, P).

            // Add the “input” class name.
            addClass(CLASSES.input).

            // If there’s a `data-value`, update the value of the element.
            val( $ELEMENT.data('value') ?
                P.get('select', SETTINGS.format) :
                ELEMENT.value
            ).

            // On focus/click, open the picker.
            on( 'focus.' + STATE.id + ' click.' + STATE.id,
                function(event) {
                    event.preventDefault()
                    P.open()
                }
            )

            // Mousedown handler to capture when the user starts interacting
            // with the picker. This is used in working around a bug in Chrome 73.
            .on('mousedown', function() {
              STATE.handlingOpen = true;
              var handler = function() {
                // By default mouseup events are fired before a click event.
                // By using a timeout we can force the mouseup to be handled
                // after the corresponding click event is handled.
                setTimeout(function() {
                  $(document).off('mouseup', handler);
                  STATE.handlingOpen = false;
                }, 0);
              };
              $(document).on('mouseup', handler);
            });


        // Only bind keydown events if the element isn’t editable.
        if ( !SETTINGS.editable ) {

            $ELEMENT.

                // Handle keyboard event based on the picker being opened or not.
                on( 'keydown.' + STATE.id, handleKeydownEvent )
        }


        // Update the aria attributes.
        aria(ELEMENT, {
            haspopup: true,
            expanded: false,
            readonly: false,
            owns: ELEMENT.id + '_root'
        })
    }


    /**
     * Prepare the root picker element with all bindings.
     */
    function prepareElementRoot() {
        aria( P.$root[0], 'hidden', true )
    }


     /**
      * Prepare the holder picker element with all bindings.
      */
    function prepareElementHolder() {

        P.$holder.

            on({

                // For iOS8.
                keydown: handleKeydownEvent,

                'focus.toOpen': handleFocusToOpenEvent,

                blur: function() {
                    // Remove the “target” class.
                    $ELEMENT.removeClass( CLASSES.target )
                },

                // When something within the holder is focused, stop from bubbling
                // to the doc and remove the “focused” state from the root.
                focusin: function( event ) {
                    P.$root.removeClass( CLASSES.focused )
                    event.stopPropagation()
                },

                // When something within the holder is clicked, stop it
                // from bubbling to the doc.
                'mousedown click': function( event ) {

                    var target = getRealEventTarget( event, ELEMENT )

                    // Make sure the target isn’t the root holder so it can bubble up.
                    if ( target != P.$holder[0] ) {

                        event.stopPropagation()

                        // * For mousedown events, cancel the default action in order to
                        //   prevent cases where focus is shifted onto external elements
                        //   when using things like jQuery mobile or MagnificPopup (ref: #249 & #120).
                        //   Also, for Firefox, don’t prevent action on the `option` element.
                        if ( event.type == 'mousedown' && !$( target ).is( 'input, select, textarea, button, option' )) {

                            event.preventDefault()

                            // Re-focus onto the holder so that users can click away
                            // from elements focused within the picker.
                            P.$holder.eq(0).focus()
                        }
                    }
                }

            }).

            // If there’s a click on an actionable element, carry out the actions.
            on( 'click', '[data-pick], [data-nav], [data-clear], [data-close]', function() {

                var $target = $( this ),
                    targetData = $target.data(),
                    targetDisabled = $target.hasClass( CLASSES.navDisabled ) || $target.hasClass( CLASSES.disabled ),

                    // * For IE, non-focusable elements can be active elements as well
                    //   (http://stackoverflow.com/a/2684561).
                    activeElement = getActiveElement()
                    activeElement = activeElement && ( (activeElement.type || activeElement.href ) ? activeElement : null);

                // If it’s disabled or nothing inside is actively focused, re-focus the element.
                if ( targetDisabled || activeElement && !$.contains( P.$root[0], activeElement ) ) {
                    P.$holder.eq(0).focus()
                }

                // If something is superficially changed, update the `highlight` based on the `nav`.
                if ( !targetDisabled && targetData.nav ) {
                    P.set( 'highlight', P.component.item.highlight, { nav: targetData.nav } )
                }

                // If something is picked, set `select` then close with focus.
                else if ( !targetDisabled && 'pick' in targetData ) {
                    P.set( 'select', targetData.pick )
                    if ( SETTINGS.closeOnSelect ) {
                        P.close( true )
                    }
                }

                // If a “clear” button is pressed, empty the values and close with focus.
                else if ( targetData.clear ) {
                    P.clear()
                    if ( SETTINGS.closeOnClear ) {
                        P.close( true )
                    }
                }

                else if ( targetData.close ) {
                    P.close( true )
                }

            }) //P.$holder

    }


     /**
      * Prepare the hidden input element along with all bindings.
      */
    function prepareElementHidden() {

        var name

        if ( SETTINGS.hiddenName === true ) {
            name = ELEMENT.name
            ELEMENT.name = ''
        }
        else {
            name = [
                typeof SETTINGS.hiddenPrefix == 'string' ? SETTINGS.hiddenPrefix : '',
                typeof SETTINGS.hiddenSuffix == 'string' ? SETTINGS.hiddenSuffix : '_submit'
            ]
            name = name[0] + ELEMENT.name + name[1]
        }

        P._hidden = $(
            '<input ' +
            'type=hidden ' +

            // Create the name using the original input’s with a prefix and suffix.
            'name="' + name + '"' +

            // If the element has a value, set the hidden value as well.
            (
                $ELEMENT.data('value') || ELEMENT.value ?
                    ' value="' + P.get('select', SETTINGS.formatSubmit) + '"' :
                    ''
            ) +
            '>'
        )[0]

        $ELEMENT.

            // If the value changes, update the hidden input with the correct format.
            on('change.' + STATE.id, function() {
                P._hidden.value = ELEMENT.value ?
                    P.get('select', SETTINGS.formatSubmit) :
                    ''
            })
    }


    // Wait for transitions to end before focusing the holder. Otherwise, while
    // using the `container` option, the view jumps to the container.
    function focusPickerOnceOpened() {

        if (IS_DEFAULT_THEME && supportsTransitions) {
            P.$holder.find('.' + CLASSES.frame).one('transitionend', function() {
                P.$holder.eq(0).focus()
            })
        }
        else {
            setTimeout(function() {
                P.$holder.eq(0).focus()
            }, 0)
        }
    }


    function handleFocusToOpenEvent(event) {

        // Stop the event from propagating to the doc.
        event.stopPropagation()

        // Add the “target” class.
        $ELEMENT.addClass( CLASSES.target )

        // Add the “focused” class to the root.
        P.$root.addClass( CLASSES.focused )

        // And then finally open the picker.
        P.open()
    }


    // For iOS8.
    function handleKeydownEvent( event ) {

        var keycode = event.keyCode,

            // Check if one of the delete keys was pressed.
            isKeycodeDelete = /^(8|46)$/.test(keycode)

        // For some reason IE clears the input value on “escape”.
        if ( keycode == 27 ) {
            P.close( true )
            return false
        }

        // Check if `space` or `delete` was pressed or the picker is closed with a key movement.
        if ( keycode == 32 || isKeycodeDelete || !STATE.open && P.component.key[keycode] ) {

            // Prevent it from moving the page and bubbling to doc.
            event.preventDefault()
            event.stopPropagation()

            // If `delete` was pressed, clear the values and close the picker.
            // Otherwise open the picker.
            if ( isKeycodeDelete ) { P.clear().close() }
            else { P.open() }
        }
    }


    // Return a new picker instance.
    return new PickerInstance()
} //PickerConstructor



/**
 * The default classes and prefix to use for the HTML classes.
 */
PickerConstructor.klasses = function( prefix ) {
    prefix = prefix || 'picker'
    return {

        picker: prefix,
        opened: prefix + '--opened',
        focused: prefix + '--focused',

        input: prefix + '__input',
        active: prefix + '__input--active',
        target: prefix + '__input--target',

        holder: prefix + '__holder',

        frame: prefix + '__frame',
        wrap: prefix + '__wrap',

        box: prefix + '__box'
    }
} //PickerConstructor.klasses



/**
 * Check if the default theme is being used.
 */
function isUsingDefaultTheme( element ) {

    var theme,
        prop = 'position'

    // For IE.
    if ( element.currentStyle ) {
        theme = element.currentStyle[prop]
    }

    // For normal browsers.
    else if ( window.getComputedStyle ) {
        theme = getComputedStyle( element )[prop]
    }

    return theme == 'fixed'
}



/**
 * Get the width of the browser’s scrollbar.
 * Taken from: https://github.com/VodkaBears/Remodal/blob/master/src/jquery.remodal.js
 */
function getScrollbarWidth() {

    if ( $html.height() <= $window.height() ) {
        return 0
    }

    var $outer = $( '<div style="visibility:hidden;width:100px" />' ).
        appendTo( 'body' )

    // Get the width without scrollbars.
    var widthWithoutScroll = $outer[0].offsetWidth

    // Force adding scrollbars.
    $outer.css( 'overflow', 'scroll' )

    // Add the inner div.
    var $inner = $( '<div style="width:100%" />' ).appendTo( $outer )

    // Get the width with scrollbars.
    var widthWithScroll = $inner[0].offsetWidth

    // Remove the divs.
    $outer.remove()

    // Return the difference between the widths.
    return widthWithoutScroll - widthWithScroll
}



/**
 * Get the target element from the event.
 * If ELEMENT is supplied and present in the event path (ELEMENT is ancestor of the target),
 * returns ELEMENT instead
 */
function getRealEventTarget( event, ELEMENT ) {

    var path = []

    if ( event.path ) {
        path = event.path
    }

    if ( event.originalEvent && event.originalEvent.path ) {
        path = event.originalEvent.path
    }

    if ( path && path.length > 0 ) {
        if ( ELEMENT && path.indexOf( ELEMENT ) >= 0 ) {
            return ELEMENT
        } else {
            return path[0]
        }
    }

    return event.target
}

/**
 * PickerConstructor helper methods.
 */
PickerConstructor._ = {

    /**
     * Create a group of nodes. Expects:
     * `
        {
            min:    {Integer},
            max:    {Integer},
            i:      {Integer},
            node:   {String},
            item:   {Function}
        }
     * `
     */
    group: function( groupObject ) {

        var
            // Scope for the looped object
            loopObjectScope,

            // Create the nodes list
            nodesList = '',

            // The counter starts from the `min`
            counter = PickerConstructor._.trigger( groupObject.min, groupObject )


        // Loop from the `min` to `max`, incrementing by `i`
        for ( ; counter <= PickerConstructor._.trigger( groupObject.max, groupObject, [ counter ] ); counter += groupObject.i ) {

            // Trigger the `item` function within scope of the object
            loopObjectScope = PickerConstructor._.trigger( groupObject.item, groupObject, [ counter ] )

            // Splice the subgroup and create nodes out of the sub nodes
            nodesList += PickerConstructor._.node(
                groupObject.node,
                loopObjectScope[ 0 ],   // the node
                loopObjectScope[ 1 ],   // the classes
                loopObjectScope[ 2 ]    // the attributes
            )
        }

        // Return the list of nodes
        return nodesList
    }, //group


    /**
     * Create a dom node string
     */
    node: function( wrapper, item, klass, attribute ) {

        // If the item is false-y, just return an empty string
        if ( !item ) return ''

        // If the item is an array, do a join
        item = $.isArray( item ) ? item.join( '' ) : item

        // Check for the class
        klass = klass ? ' class="' + klass + '"' : ''

        // Check for any attributes
        attribute = attribute ? ' ' + attribute : ''

        // Return the wrapped item
        return '<' + wrapper + klass + attribute + '>' + item + '</' + wrapper + '>'
    }, //node


    /**
     * Lead numbers below 10 with a zero.
     */
    lead: function( number ) {
        return ( number < 10 ? '0': '' ) + number
    },


    /**
     * Trigger a function otherwise return the value.
     */
    trigger: function( callback, scope, args ) {
        return typeof callback == 'function' ? callback.apply( scope, args || [] ) : callback
    },


    /**
     * If the second character is a digit, length is 2 otherwise 1.
     */
    digits: function( string ) {
        return ( /\d/ ).test( string[ 1 ] ) ? 2 : 1
    },


    /**
     * Tell if something is a date object.
     */
    isDate: function( value ) {
        return {}.toString.call( value ).indexOf( 'Date' ) > -1 && this.isInteger( value.getDate() )
    },


    /**
     * Tell if something is an integer.
     */
    isInteger: function( value ) {
        return {}.toString.call( value ).indexOf( 'Number' ) > -1 && value % 1 === 0
    },


    /**
     * Create ARIA attribute strings.
     */
    ariaAttr: ariaAttr
} //PickerConstructor._



/**
 * Extend the picker with a component and defaults.
 */
PickerConstructor.extend = function( name, Component ) {

    // Extend jQuery.
    $.fn[ name ] = function( options, action ) {

        // Grab the component data.
        var componentData = this.data( name )

        // If the picker is requested, return the data object.
        if ( options == 'picker' ) {
            return componentData
        }

        // If the component data exists and `options` is a string, carry out the action.
        if ( componentData && typeof options == 'string' ) {
            return PickerConstructor._.trigger( componentData[ options ], componentData, [ action ] )
        }

        // Otherwise go through each matched element and if the component
        // doesn’t exist, create a new picker using `this` element
        // and merging the defaults and options with a deep copy.
        return this.each( function() {
            var $this = $( this )
            if ( !$this.data( name ) ) {
                new PickerConstructor( this, name, Component, options )
            }
        })
    }

    // Set the defaults.
    $.fn[ name ].defaults = Component.defaults
} //PickerConstructor.extend



function aria(element, attribute, value) {
    if ( $.isPlainObject(attribute) ) {
        for ( var key in attribute ) {
            ariaSet(element, key, attribute[key])
        }
    }
    else {
        ariaSet(element, attribute, value)
    }
}
function ariaSet(element, attribute, value) {
    element.setAttribute(
        (attribute == 'role' ? '' : 'aria-') + attribute,
        value
    )
}
function ariaAttr(attribute, data) {
    if ( !$.isPlainObject(attribute) ) {
        attribute = { attribute: data }
    }
    data = ''
    for ( var key in attribute ) {
        var attr = (key == 'role' ? '' : 'aria-') + key,
            attrVal = attribute[key]
        data += attrVal == null ? '' : attr + '="' + attribute[key] + '"'
    }
    return data
}

// IE8 bug throws an error for activeElements within iframes.
function getActiveElement() {
    try {
        return document.activeElement
    } catch ( err ) { }
}



// Expose the picker constructor.
return PickerConstructor


}));

/*!
 * Date picker for pickadate.js v3.6.4
 * http://amsul.github.io/pickadate.js/date.htm
 */

(function ( factory ) {

    // AMD.
    if ( typeof define == 'function' && define.amd )
        define( 'picker.date',['./picker', 'jquery'], factory )

    // Node.js/browserify.
    else if ( typeof exports == 'object' )
        module.exports = factory( require('./picker.js'), require('jquery') )

    // Browser globals.
    else factory( Picker, jQuery )

}(function( Picker, $ ) {


/**
 * Globals and constants
 */
var DAYS_IN_WEEK = 7,
    WEEKS_IN_CALENDAR = 6,
    _ = Picker._



/**
 * The date picker constructor
 */
function DatePicker( picker, settings ) {

    var calendar = this,
        element = picker.$node[ 0 ],
        elementValue = element.value,
        elementDataValue = picker.$node.data( 'value' ),
        valueString = elementDataValue || elementValue,
        formatString = elementDataValue ? settings.formatSubmit : settings.format,
        isRTL = function() {

            return element.currentStyle ?

                // For IE.
                element.currentStyle.direction == 'rtl' :

                // For normal browsers.
                getComputedStyle( picker.$root[0] ).direction == 'rtl'
        }

    calendar.settings = settings
    calendar.$node = picker.$node

    // The queue of methods that will be used to build item objects.
    calendar.queue = {
        min: 'measure create',
        max: 'measure create',
        now: 'now create',
        select: 'parse create validate',
        highlight: 'parse navigate create validate',
        view: 'parse create validate viewset',
        disable: 'deactivate',
        enable: 'activate'
    }

    // The component's item object.
    calendar.item = {}

    calendar.item.clear = null
    calendar.item.disable = ( settings.disable || [] ).slice( 0 )
    calendar.item.enable = -(function( collectionDisabled ) {
        return collectionDisabled[ 0 ] === true ? collectionDisabled.shift() : -1
    })( calendar.item.disable )

    calendar.
        set( 'min', settings.min ).
        set( 'max', settings.max ).
        set( 'now' )

    // When there’s a value, set the `select`, which in turn
    // also sets the `highlight` and `view`.
    if ( valueString ) {
        calendar.set( 'select', valueString, {
            format: formatString,
            defaultValue: true
        })
    }

    // If there’s no value, default to highlighting “today”.
    else {
        calendar.
            set( 'select', null ).
            set( 'highlight', calendar.item.now )
    }


    // The keycode to movement mapping.
    calendar.key = {
        40: 7, // Down
        38: -7, // Up
        39: function() { return isRTL() ? -1 : 1 }, // Right
        37: function() { return isRTL() ? 1 : -1 }, // Left
        go: function( timeChange ) {
            var highlightedObject = calendar.item.highlight,
                targetDate = new Date( highlightedObject.year, highlightedObject.month, highlightedObject.date + timeChange )
            calendar.set(
                'highlight',
                targetDate,
                { interval: timeChange }
            )
            this.render()
        }
    }


    // Bind some picker events.
    picker.
        on( 'render', function() {
            picker.$root.find( '.' + settings.klass.selectMonth ).on( 'change', function() {
                var value = this.value
                if ( value ) {
                    picker.set( 'highlight', [ picker.get( 'view' ).year, value, picker.get( 'highlight' ).date ] )
                    picker.$root.find( '.' + settings.klass.selectMonth ).trigger( 'focus' )
                }
            })
            picker.$root.find( '.' + settings.klass.selectYear ).on( 'change', function() {
                var value = this.value
                if ( value ) {
                    picker.set( 'highlight', [ value, picker.get( 'view' ).month, picker.get( 'highlight' ).date ] )
                    picker.$root.find( '.' + settings.klass.selectYear ).trigger( 'focus' )
                }
            })
        }, 1 ).
        on( 'open', function() {
            var includeToday = ''
            if ( calendar.disabled( calendar.get('now') ) ) {
                includeToday = ':not(.' + settings.klass.buttonToday + ')'
            }
            picker.$root.find( 'button' + includeToday + ', select' ).attr( 'disabled', false )
        }, 1 ).
        on( 'close', function() {
            picker.$root.find( 'button, select' ).attr( 'disabled', true )
        }, 1 )

} //DatePicker


/**
 * Set a datepicker item object.
 */
DatePicker.prototype.set = function( type, value, options ) {

    var calendar = this,
        calendarItem = calendar.item

    // If the value is `null` just set it immediately.
    if ( value === null ) {
        if ( type == 'clear' ) type = 'select'
        calendarItem[ type ] = value
        return calendar
    }

    // Otherwise go through the queue of methods, and invoke the functions.
    // Update this as the time unit, and set the final value as this item.
    // * In the case of `enable`, keep the queue but set `disable` instead.
    //   And in the case of `flip`, keep the queue but set `enable` instead.
    calendarItem[ ( type == 'enable' ? 'disable' : type == 'flip' ? 'enable' : type ) ] = calendar.queue[ type ].split( ' ' ).map( function( method ) {
        value = calendar[ method ]( type, value, options )
        return value
    }).pop()

    // Check if we need to cascade through more updates.
    if ( type == 'select' ) {
        calendar.set( 'highlight', calendarItem.select, options )
    }
    else if ( type == 'highlight' ) {
        calendar.set( 'view', calendarItem.highlight, options )
    }
    else if ( type.match( /^(flip|min|max|disable|enable)$/ ) ) {
        if ( calendarItem.select && calendar.disabled( calendarItem.select ) ) {
            calendar.set( 'select', calendarItem.select, options )
        }
        if ( calendarItem.highlight && calendar.disabled( calendarItem.highlight ) ) {
            calendar.set( 'highlight', calendarItem.highlight, options )
        }
    }

    return calendar
} //DatePicker.prototype.set


/**
 * Get a datepicker item object.
 */
DatePicker.prototype.get = function( type ) {
    return this.item[ type ]
} //DatePicker.prototype.get


/**
 * Create a picker date object.
 */
DatePicker.prototype.create = function( type, value, options ) {

    var isInfiniteValue,
        calendar = this

    // If there’s no value, use the type as the value.
    value = value === undefined ? type : value


    // If it’s infinity, update the value.
    if ( value == -Infinity || value == Infinity ) {
        isInfiniteValue = value
    }

    // If it’s an object, use the native date object.
    else if ( $.isPlainObject( value ) && _.isInteger( value.pick ) ) {
        value = value.obj
    }

    // If it’s an array, convert it into a date and make sure
    // that it’s a valid date – otherwise default to today.
    else if ( $.isArray( value ) ) {
        value = new Date( value[ 0 ], value[ 1 ], value[ 2 ] )
        value = _.isDate( value ) ? value : calendar.create().obj
    }

    // If it’s a number or date object, make a normalized date.
    else if ( _.isInteger( value ) || _.isDate( value ) ) {
        value = calendar.normalize( new Date( value ), options )
    }

    // If it’s a literal true or any other case, set it to now.
    else /*if ( value === true )*/ {
        value = calendar.now( type, value, options )
    }

    // Return the compiled object.
    return {
        year: isInfiniteValue || value.getFullYear(),
        month: isInfiniteValue || value.getMonth(),
        date: isInfiniteValue || value.getDate(),
        day: isInfiniteValue || value.getDay(),
        obj: isInfiniteValue || value,
        pick: isInfiniteValue || value.getTime()
    }
} //DatePicker.prototype.create


/**
 * Create a range limit object using an array, date object,
 * literal “true”, or integer relative to another time.
 */
DatePicker.prototype.createRange = function( from, to ) {

    var calendar = this,
        createDate = function( date ) {
            if ( date === true || $.isArray( date ) || _.isDate( date ) ) {
                return calendar.create( date )
            }
            return date
        }

    // Create objects if possible.
    if ( !_.isInteger( from ) ) {
        from = createDate( from )
    }
    if ( !_.isInteger( to ) ) {
        to = createDate( to )
    }

    // Create relative dates.
    if ( _.isInteger( from ) && $.isPlainObject( to ) ) {
        from = [ to.year, to.month, to.date + from ];
    }
    else if ( _.isInteger( to ) && $.isPlainObject( from ) ) {
        to = [ from.year, from.month, from.date + to ];
    }

    return {
        from: createDate( from ),
        to: createDate( to )
    }
} //DatePicker.prototype.createRange


/**
 * Check if a date unit falls within a date range object.
 */
DatePicker.prototype.withinRange = function( range, dateUnit ) {
    range = this.createRange(range.from, range.to)
    return dateUnit.pick >= range.from.pick && dateUnit.pick <= range.to.pick
}


/**
 * Check if two date range objects overlap.
 */
DatePicker.prototype.overlapRanges = function( one, two ) {

    var calendar = this

    // Convert the ranges into comparable dates.
    one = calendar.createRange( one.from, one.to )
    two = calendar.createRange( two.from, two.to )

    return calendar.withinRange( one, two.from ) || calendar.withinRange( one, two.to ) ||
        calendar.withinRange( two, one.from ) || calendar.withinRange( two, one.to )
}


/**
 * Get the date today.
 */
DatePicker.prototype.now = function( type, value, options ) {
    value = new Date()
    if ( options && options.rel ) {
        value.setDate( value.getDate() + options.rel )
    }
    return this.normalize( value, options )
}


/**
 * Navigate to next/prev month.
 */
DatePicker.prototype.navigate = function( type, value, options ) {

    var targetDateObject,
        targetYear,
        targetMonth,
        targetDate,
        isTargetArray = $.isArray( value ),
        isTargetObject = $.isPlainObject( value ),
        viewsetObject = this.item.view/*,
        safety = 100*/


    if ( isTargetArray || isTargetObject ) {

        if ( isTargetObject ) {
            targetYear = value.year
            targetMonth = value.month
            targetDate = value.date
        }
        else {
            targetYear = +value[0]
            targetMonth = +value[1]
            targetDate = +value[2]
        }

        // If we’re navigating months but the view is in a different
        // month, navigate to the view’s year and month.
        if ( options && options.nav && viewsetObject && viewsetObject.month !== targetMonth ) {
            targetYear = viewsetObject.year
            targetMonth = viewsetObject.month
        }

        // Figure out the expected target year and month.
        targetDateObject = new Date( targetYear, targetMonth + ( options && options.nav ? options.nav : 0 ), 1 )
        targetYear = targetDateObject.getFullYear()
        targetMonth = targetDateObject.getMonth()

        // If the month we’re going to doesn’t have enough days,
        // keep decreasing the date until we reach the month’s last date.
        while ( /*safety &&*/ new Date( targetYear, targetMonth, targetDate ).getMonth() !== targetMonth ) {
            targetDate -= 1
            /*safety -= 1
            if ( !safety ) {
                throw 'Fell into an infinite loop while navigating to ' + new Date( targetYear, targetMonth, targetDate ) + '.'
            }*/
        }

        value = [ targetYear, targetMonth, targetDate ]
    }

    return value
} //DatePicker.prototype.navigate


/**
 * Normalize a date by setting the hours to midnight.
 */
DatePicker.prototype.normalize = function( value/*, options*/ ) {
    value.setHours( 0, 0, 0, 0 )
    return value
}


/**
 * Measure the range of dates.
 */
DatePicker.prototype.measure = function( type, value/*, options*/ ) {

    var calendar = this
    
    // If it's an integer, get a date relative to today.
    if ( _.isInteger( value ) ) {
        value = calendar.now( type, value, { rel: value } )
    }

    // If it’s anything false-y, remove the limits.
    else if ( !value ) {
        value = type == 'min' ? -Infinity : Infinity
    }

    // If it’s a string, parse it.
    else if ( typeof value == 'string' ) {
        value = calendar.parse( type, value )
    }

    return value
} ///DatePicker.prototype.measure


/**
 * Create a viewset object based on navigation.
 */
DatePicker.prototype.viewset = function( type, dateObject/*, options*/ ) {
    return this.create([ dateObject.year, dateObject.month, 1 ])
}


/**
 * Validate a date as enabled and shift if needed.
 */
DatePicker.prototype.validate = function( type, dateObject, options ) {

    var calendar = this,

        // Keep a reference to the original date.
        originalDateObject = dateObject,

        // Make sure we have an interval.
        interval = options && options.interval ? options.interval : 1,

        // Check if the calendar enabled dates are inverted.
        isFlippedBase = calendar.item.enable === -1,

        // Check if we have any enabled dates after/before now.
        hasEnabledBeforeTarget, hasEnabledAfterTarget,

        // The min & max limits.
        minLimitObject = calendar.item.min,
        maxLimitObject = calendar.item.max,

        // Check if we’ve reached the limit during shifting.
        reachedMin, reachedMax,

        // Check if the calendar is inverted and at least one weekday is enabled.
        hasEnabledWeekdays = isFlippedBase && calendar.item.disable.filter( function( value ) {

            // If there’s a date, check where it is relative to the target.
            if ( $.isArray( value ) ) {
                var dateTime = calendar.create( value ).pick
                if ( dateTime < dateObject.pick ) hasEnabledBeforeTarget = true
                else if ( dateTime > dateObject.pick ) hasEnabledAfterTarget = true
            }

            // Return only integers for enabled weekdays.
            return _.isInteger( value )
        }).length/*,

        safety = 100*/



    // Cases to validate for:
    // [1] Not inverted and date disabled.
    // [2] Inverted and some dates enabled.
    // [3] Not inverted and out of range.
    //
    // Cases to **not** validate for:
    // • Navigating months.
    // • Not inverted and date enabled.
    // • Inverted and all dates disabled.
    // • ..and anything else.
    if ( !options || (!options.nav && !options.defaultValue) ) if (
        /* 1 */ ( !isFlippedBase && calendar.disabled( dateObject ) ) ||
        /* 2 */ ( isFlippedBase && calendar.disabled( dateObject ) && ( hasEnabledWeekdays || hasEnabledBeforeTarget || hasEnabledAfterTarget ) ) ||
        /* 3 */ ( !isFlippedBase && (dateObject.pick <= minLimitObject.pick || dateObject.pick >= maxLimitObject.pick) )
    ) {


        // When inverted, flip the direction if there aren’t any enabled weekdays
        // and there are no enabled dates in the direction of the interval.
        if ( isFlippedBase && !hasEnabledWeekdays && ( ( !hasEnabledAfterTarget && interval > 0 ) || ( !hasEnabledBeforeTarget && interval < 0 ) ) ) {
            interval *= -1
        }


        // Keep looping until we reach an enabled date.
        while ( /*safety &&*/ calendar.disabled( dateObject ) ) {

            /*safety -= 1
            if ( !safety ) {
                throw 'Fell into an infinite loop while validating ' + dateObject.obj + '.'
            }*/


            // If we’ve looped into the next/prev month with a large interval, return to the original date and flatten the interval.
            if ( Math.abs( interval ) > 1 && ( dateObject.month < originalDateObject.month || dateObject.month > originalDateObject.month ) ) {
                dateObject = originalDateObject
                interval = interval > 0 ? 1 : -1
            }


            // If we’ve reached the min/max limit, reverse the direction, flatten the interval and set it to the limit.
            if ( dateObject.pick <= minLimitObject.pick ) {
                reachedMin = true
                interval = 1
                dateObject = calendar.create([
                    minLimitObject.year,
                    minLimitObject.month,
                    minLimitObject.date + (dateObject.pick === minLimitObject.pick ? 0 : -1)
                ])
            }
            else if ( dateObject.pick >= maxLimitObject.pick ) {
                reachedMax = true
                interval = -1
                dateObject = calendar.create([
                    maxLimitObject.year,
                    maxLimitObject.month,
                    maxLimitObject.date + (dateObject.pick === maxLimitObject.pick ? 0 : 1)
                ])
            }


            // If we’ve reached both limits, just break out of the loop.
            if ( reachedMin && reachedMax ) {
                break
            }


            // Finally, create the shifted date using the interval and keep looping.
            dateObject = calendar.create([ dateObject.year, dateObject.month, dateObject.date + interval ])
        }

    } //endif


    // Return the date object settled on.
    return dateObject
} //DatePicker.prototype.validate


/**
 * Check if a date is disabled.
 */
DatePicker.prototype.disabled = function( dateToVerify ) {

    var
        calendar = this,

        // Filter through the disabled dates to check if this is one.
        isDisabledMatch = calendar.item.disable.filter( function( dateToDisable ) {

            // If the date is a number, match the weekday with 0index and `firstDay` check.
            if ( _.isInteger( dateToDisable ) ) {
                return dateToVerify.day === ( calendar.settings.firstDay ? dateToDisable : dateToDisable - 1 ) % 7
            }

            // If it’s an array or a native JS date, create and match the exact date.
            if ( $.isArray( dateToDisable ) || _.isDate( dateToDisable ) ) {
                return dateToVerify.pick === calendar.create( dateToDisable ).pick
            }

            // If it’s an object, match a date within the “from” and “to” range.
            if ( $.isPlainObject( dateToDisable ) ) {
                return calendar.withinRange( dateToDisable, dateToVerify )
            }
        })

    // If this date matches a disabled date, confirm it’s not inverted.
    isDisabledMatch = isDisabledMatch.length && !isDisabledMatch.filter(function( dateToDisable ) {
        return $.isArray( dateToDisable ) && dateToDisable[3] == 'inverted' ||
            $.isPlainObject( dateToDisable ) && dateToDisable.inverted
    }).length

    // Check the calendar “enabled” flag and respectively flip the
    // disabled state. Then also check if it’s beyond the min/max limits.
    return calendar.item.enable === -1 ? !isDisabledMatch : isDisabledMatch ||
        dateToVerify.pick < calendar.item.min.pick ||
        dateToVerify.pick > calendar.item.max.pick

} //DatePicker.prototype.disabled


/**
 * Parse a string into a usable type.
 */
DatePicker.prototype.parse = function( type, value, options ) {

    var calendar = this,
        parsingObject = {}

    // If it’s already parsed, we’re good.
    if ( !value || typeof value != 'string' ) {
        return value
    }

    // We need a `.format` to parse the value with.
    if ( !( options && options.format ) ) {
        options = options || {}
        options.format = calendar.settings.format
    }

    // Convert the format into an array and then map through it.
    calendar.formats.toArray( options.format ).map( function( label ) {

        var
            // Grab the formatting label.
            formattingLabel = calendar.formats[ label ],

            // The format length is from the formatting label function or the
            // label length without the escaping exclamation (!) mark.
            formatLength = formattingLabel ? _.trigger( formattingLabel, calendar, [ value, parsingObject ] ) : label.replace( /^!/, '' ).length

        // If there's a format label, split the value up to the format length.
        // Then add it to the parsing object with appropriate label.
        if ( formattingLabel ) {
            parsingObject[ label ] = value.substr( 0, formatLength )
        }

        // Update the value as the substring from format length to end.
        value = value.substr( formatLength )
    })

    // Compensate for month 0index.
    return [
        parsingObject.yyyy || parsingObject.yy,
        +( parsingObject.mm || parsingObject.m ) - 1,
        parsingObject.dd || parsingObject.d
    ]
} //DatePicker.prototype.parse


/**
 * Various formats to display the object in.
 */
DatePicker.prototype.formats = (function() {

    // Return the length of the first word in a collection.
    function getWordLengthFromCollection( string, collection, dateObject ) {

        // Grab the first word from the string.
        // Regex pattern from http://stackoverflow.com/q/150033
        var word = string.match( /[^\x00-\x7F]+|\w+/ )[ 0 ]

        // If there's no month index, add it to the date object
        if ( !dateObject.mm && !dateObject.m ) {
            dateObject.m = collection.indexOf( word ) + 1
        }

        // Return the length of the word.
        return word.length
    }

    // Get the length of the first word in a string.
    function getFirstWordLength( string ) {
        return string.match( /\w+/ )[ 0 ].length
    }

    return {

        d: function( string, dateObject ) {

            // If there's string, then get the digits length.
            // Otherwise return the selected date.
            return string ? _.digits( string ) : dateObject.date
        },
        dd: function( string, dateObject ) {

            // If there's a string, then the length is always 2.
            // Otherwise return the selected date with a leading zero.
            return string ? 2 : _.lead( dateObject.date )
        },
        ddd: function( string, dateObject ) {

            // If there's a string, then get the length of the first word.
            // Otherwise return the short selected weekday.
            return string ? getFirstWordLength( string ) : this.settings.weekdaysShort[ dateObject.day ]
        },
        dddd: function( string, dateObject ) {

            // If there's a string, then get the length of the first word.
            // Otherwise return the full selected weekday.
            return string ? getFirstWordLength( string ) : this.settings.weekdaysFull[ dateObject.day ]
        },
        m: function( string, dateObject ) {

            // If there's a string, then get the length of the digits
            // Otherwise return the selected month with 0index compensation.
            return string ? _.digits( string ) : dateObject.month + 1
        },
        mm: function( string, dateObject ) {

            // If there's a string, then the length is always 2.
            // Otherwise return the selected month with 0index and leading zero.
            return string ? 2 : _.lead( dateObject.month + 1 )
        },
        mmm: function( string, dateObject ) {

            var collection = this.settings.monthsShort

            // If there's a string, get length of the relevant month from the short
            // months collection. Otherwise return the selected month from that collection.
            return string ? getWordLengthFromCollection( string, collection, dateObject ) : collection[ dateObject.month ]
        },
        mmmm: function( string, dateObject ) {

            var collection = this.settings.monthsFull

            // If there's a string, get length of the relevant month from the full
            // months collection. Otherwise return the selected month from that collection.
            return string ? getWordLengthFromCollection( string, collection, dateObject ) : collection[ dateObject.month ]
        },
        yy: function( string, dateObject ) {

            // If there's a string, then the length is always 2.
            // Otherwise return the selected year by slicing out the first 2 digits.
            return string ? 2 : ( '' + dateObject.year ).slice( 2 )
        },
        yyyy: function( string, dateObject ) {

            // If there's a string, then the length is always 4.
            // Otherwise return the selected year.
            return string ? 4 : dateObject.year
        },

        // Create an array by splitting the formatting string passed.
        toArray: function( formatString ) { return formatString.split( /(d{1,4}|m{1,4}|y{4}|yy|!.)/g ) },

        // Format an object into a string using the formatting options.
        toString: function ( formatString, itemObject ) {
            var calendar = this
            return calendar.formats.toArray( formatString ).map( function( label ) {
                return _.trigger( calendar.formats[ label ], calendar, [ 0, itemObject ] ) || label.replace( /^!/, '' )
            }).join( '' )
        }
    }
})() //DatePicker.prototype.formats




/**
 * Check if two date units are the exact.
 */
DatePicker.prototype.isDateExact = function( one, two ) {

    var calendar = this

    // When we’re working with weekdays, do a direct comparison.
    if (
        ( _.isInteger( one ) && _.isInteger( two ) ) ||
        ( typeof one == 'boolean' && typeof two == 'boolean' )
     ) {
        return one === two
    }

    // When we’re working with date representations, compare the “pick” value.
    if (
        ( _.isDate( one ) || $.isArray( one ) ) &&
        ( _.isDate( two ) || $.isArray( two ) )
    ) {
        return calendar.create( one ).pick === calendar.create( two ).pick
    }

    // When we’re working with range objects, compare the “from” and “to”.
    if ( $.isPlainObject( one ) && $.isPlainObject( two ) ) {
        return calendar.isDateExact( one.from, two.from ) && calendar.isDateExact( one.to, two.to )
    }

    return false
}


/**
 * Check if two date units overlap.
 */
DatePicker.prototype.isDateOverlap = function( one, two ) {

    var calendar = this,
        firstDay = calendar.settings.firstDay ? 1 : 0

    // When we’re working with a weekday index, compare the days.
    if ( _.isInteger( one ) && ( _.isDate( two ) || $.isArray( two ) ) ) {
        one = one % 7 + firstDay
        return one === calendar.create( two ).day + 1
    }
    if ( _.isInteger( two ) && ( _.isDate( one ) || $.isArray( one ) ) ) {
        two = two % 7 + firstDay
        return two === calendar.create( one ).day + 1
    }

    // When we’re working with range objects, check if the ranges overlap.
    if ( $.isPlainObject( one ) && $.isPlainObject( two ) ) {
        return calendar.overlapRanges( one, two )
    }

    return false
}


/**
 * Flip the “enabled” state.
 */
DatePicker.prototype.flipEnable = function(val) {
    var itemObject = this.item
    itemObject.enable = val || (itemObject.enable == -1 ? 1 : -1)
}


/**
 * Mark a collection of dates as “disabled”.
 */
DatePicker.prototype.deactivate = function( type, datesToDisable ) {

    var calendar = this,
        disabledItems = calendar.item.disable.slice(0)


    // If we’re flipping, that’s all we need to do.
    if ( datesToDisable == 'flip' ) {
        calendar.flipEnable()
    }

    else if ( datesToDisable === false ) {
        calendar.flipEnable(1)
        disabledItems = []
    }

    else if ( datesToDisable === true ) {
        calendar.flipEnable(-1)
        disabledItems = []
    }

    // Otherwise go through the dates to disable.
    else {

        datesToDisable.map(function( unitToDisable ) {

            var matchFound

            // When we have disabled items, check for matches.
            // If something is matched, immediately break out.
            for ( var index = 0; index < disabledItems.length; index += 1 ) {
                if ( calendar.isDateExact( unitToDisable, disabledItems[index] ) ) {
                    matchFound = true
                    break
                }
            }

            // If nothing was found, add the validated unit to the collection.
            if ( !matchFound ) {
                if (
                    _.isInteger( unitToDisable ) ||
                    _.isDate( unitToDisable ) ||
                    $.isArray( unitToDisable ) ||
                    ( $.isPlainObject( unitToDisable ) && unitToDisable.from && unitToDisable.to )
                ) {
                    disabledItems.push( unitToDisable )
                }
            }
        })
    }

    // Return the updated collection.
    return disabledItems
} //DatePicker.prototype.deactivate


/**
 * Mark a collection of dates as “enabled”.
 */
DatePicker.prototype.activate = function( type, datesToEnable ) {

    var calendar = this,
        disabledItems = calendar.item.disable,
        disabledItemsCount = disabledItems.length

    // If we’re flipping, that’s all we need to do.
    if ( datesToEnable == 'flip' ) {
        calendar.flipEnable()
    }

    else if ( datesToEnable === true ) {
        calendar.flipEnable(1)
        disabledItems = []
    }

    else if ( datesToEnable === false ) {
        calendar.flipEnable(-1)
        disabledItems = []
    }

    // Otherwise go through the disabled dates.
    else {

        datesToEnable.map(function( unitToEnable ) {

            var matchFound,
                disabledUnit,
                index,
                isExactRange

            // Go through the disabled items and try to find a match.
            for ( index = 0; index < disabledItemsCount; index += 1 ) {

                disabledUnit = disabledItems[index]

                // When an exact match is found, remove it from the collection.
                if ( calendar.isDateExact( disabledUnit, unitToEnable ) ) {
                    matchFound = disabledItems[index] = null
                    isExactRange = true
                    break
                }

                // When an overlapped match is found, add the “inverted” state to it.
                else if ( calendar.isDateOverlap( disabledUnit, unitToEnable ) ) {
                    if ( $.isPlainObject( unitToEnable ) ) {
                        unitToEnable.inverted = true
                        matchFound = unitToEnable
                    }
                    else if ( $.isArray( unitToEnable ) ) {
                        matchFound = unitToEnable
                        if ( !matchFound[3] ) matchFound.push( 'inverted' )
                    }
                    else if ( _.isDate( unitToEnable ) ) {
                        matchFound = [ unitToEnable.getFullYear(), unitToEnable.getMonth(), unitToEnable.getDate(), 'inverted' ]
                    }
                    break
                }
            }

            // If a match was found, remove a previous duplicate entry.
            if ( matchFound ) for ( index = 0; index < disabledItemsCount; index += 1 ) {
                if ( calendar.isDateExact( disabledItems[index], unitToEnable ) ) {
                    disabledItems[index] = null
                    break
                }
            }

            // In the event that we’re dealing with an exact range of dates,
            // make sure there are no “inverted” dates because of it.
            if ( isExactRange ) for ( index = 0; index < disabledItemsCount; index += 1 ) {
                if ( calendar.isDateOverlap( disabledItems[index], unitToEnable ) ) {
                    disabledItems[index] = null
                    break
                }
            }

            // If something is still matched, add it into the collection.
            if ( matchFound ) {
                disabledItems.push( matchFound )
            }
        })
    }

    // Return the updated collection.
    return disabledItems.filter(function( val ) { return val != null })
} //DatePicker.prototype.activate


/**
 * Create a string for the nodes in the picker.
 */
DatePicker.prototype.nodes = function( isOpen ) {

    var
        calendar = this,
        settings = calendar.settings,
        calendarItem = calendar.item,
        nowObject = calendarItem.now,
        selectedObject = calendarItem.select,
        highlightedObject = calendarItem.highlight,
        viewsetObject = calendarItem.view,
        disabledCollection = calendarItem.disable,
        minLimitObject = calendarItem.min,
        maxLimitObject = calendarItem.max,


        // Create the calendar table head using a copy of weekday labels collection.
        // * We do a copy so we don't mutate the original array.
        tableHead = (function( collection, fullCollection ) {

            // If the first day should be Monday, move Sunday to the end.
            if ( settings.firstDay ) {
                collection.push( collection.shift() )
                fullCollection.push( fullCollection.shift() )
            }

            // Create and return the table head group.
            return _.node(
                'thead',
                _.node(
                    'tr',
                    _.group({
                        min: 0,
                        max: DAYS_IN_WEEK - 1,
                        i: 1,
                        node: 'th',
                        item: function( counter ) {
                            return [
                                collection[ counter ],
                                settings.klass.weekdays,
                                'scope=col title="' + fullCollection[ counter ] + '"'
                            ]
                        }
                    })
                )
            ) //endreturn
        })( ( settings.showWeekdaysFull ? settings.weekdaysFull : settings.weekdaysShort ).slice( 0 ), settings.weekdaysFull.slice( 0 ) ), //tableHead


        // Create the nav for next/prev month.
        createMonthNav = function( next ) {

            // Otherwise, return the created month tag.
            return _.node(
                'div',
                ' ',
                settings.klass[ 'nav' + ( next ? 'Next' : 'Prev' ) ] + (

                    // If the focused month is outside the range, disabled the button.
                    ( next && viewsetObject.year >= maxLimitObject.year && viewsetObject.month >= maxLimitObject.month ) ||
                    ( !next && viewsetObject.year <= minLimitObject.year && viewsetObject.month <= minLimitObject.month ) ?
                    ' ' + settings.klass.navDisabled : ''
                ),
                'data-nav=' + ( next || -1 ) + ' ' +
                _.ariaAttr({
                    role: 'button',
                    controls: calendar.$node[0].id + '_table'
                }) + ' ' +
                'title="' + (next ? settings.labelMonthNext : settings.labelMonthPrev ) + '"'
            ) //endreturn
        }, //createMonthNav


        // Create the month label.
        createMonthLabel = function() {

            var monthsCollection = settings.showMonthsShort ? settings.monthsShort : settings.monthsFull

            // If there are months to select, add a dropdown menu.
            if ( settings.selectMonths ) {

                return _.node( 'select',
                    _.group({
                        min: 0,
                        max: 11,
                        i: 1,
                        node: 'option',
                        item: function( loopedMonth ) {

                            return [

                                // The looped month and no classes.
                                monthsCollection[ loopedMonth ], 0,

                                // Set the value and selected index.
                                'value=' + loopedMonth +
                                ( viewsetObject.month == loopedMonth ? ' selected' : '' ) +
                                (
                                    (
                                        ( viewsetObject.year == minLimitObject.year && loopedMonth < minLimitObject.month ) ||
                                        ( viewsetObject.year == maxLimitObject.year && loopedMonth > maxLimitObject.month )
                                    ) ?
                                    ' disabled' : ''
                                )
                            ]
                        }
                    }),
                    settings.klass.selectMonth,
                    ( isOpen ? '' : 'disabled' ) + ' ' +
                    _.ariaAttr({ controls: calendar.$node[0].id + '_table' }) + ' ' +
                    'title="' + settings.labelMonthSelect + '"'
                )
            }

            // If there's a need for a month selector
            return _.node( 'div', monthsCollection[ viewsetObject.month ], settings.klass.month )
        }, //createMonthLabel


        // Create the year label.
        createYearLabel = function() {

            var focusedYear = viewsetObject.year,

            // If years selector is set to a literal "true", set it to 5. Otherwise
            // divide in half to get half before and half after focused year.
            numberYears = settings.selectYears === true ? 5 : ~~( settings.selectYears / 2 )

            // If there are years to select, add a dropdown menu.
            if ( numberYears ) {

                var
                    minYear = minLimitObject.year,
                    maxYear = maxLimitObject.year,
                    lowestYear = focusedYear - numberYears,
                    highestYear = focusedYear + numberYears

                // If the min year is greater than the lowest year, increase the highest year
                // by the difference and set the lowest year to the min year.
                if ( minYear > lowestYear ) {
                    highestYear += minYear - lowestYear
                    lowestYear = minYear
                }

                // If the max year is less than the highest year, decrease the lowest year
                // by the lower of the two: available and needed years. Then set the
                // highest year to the max year.
                if ( maxYear < highestYear ) {

                    var availableYears = lowestYear - minYear,
                        neededYears = highestYear - maxYear

                    lowestYear -= availableYears > neededYears ? neededYears : availableYears
                    highestYear = maxYear
                }

                return _.node( 'select',
                    _.group({
                        min: lowestYear,
                        max: highestYear,
                        i: 1,
                        node: 'option',
                        item: function( loopedYear ) {
                            return [

                                // The looped year and no classes.
                                loopedYear, 0,

                                // Set the value and selected index.
                                'value=' + loopedYear + ( focusedYear == loopedYear ? ' selected' : '' )
                            ]
                        }
                    }),
                    settings.klass.selectYear,
                    ( isOpen ? '' : 'disabled' ) + ' ' + _.ariaAttr({ controls: calendar.$node[0].id + '_table' }) + ' ' +
                    'title="' + settings.labelYearSelect + '"'
                )
            }

            // Otherwise just return the year focused
            return _.node( 'div', focusedYear, settings.klass.year )
        } //createYearLabel


    // Create and return the entire calendar.
    return _.node(
        'div',
        ( settings.selectYears ? createYearLabel() + createMonthLabel() : createMonthLabel() + createYearLabel() ) +
        createMonthNav() + createMonthNav( 1 ),
        settings.klass.header
    ) + _.node(
        'table',
        tableHead +
        _.node(
            'tbody',
            _.group({
                min: 0,
                max: WEEKS_IN_CALENDAR - 1,
                i: 1,
                node: 'tr',
                item: function( rowCounter ) {

                    // If Monday is the first day and the month starts on Sunday, shift the date back a week.
                    var shiftDateBy = settings.firstDay && calendar.create([ viewsetObject.year, viewsetObject.month, 1 ]).day === 0 ? -7 : 0

                    return [
                        _.group({
                            min: DAYS_IN_WEEK * rowCounter - viewsetObject.day + shiftDateBy + 1, // Add 1 for weekday 0index
                            max: function() {
                                return this.min + DAYS_IN_WEEK - 1
                            },
                            i: 1,
                            node: 'td',
                            item: function( targetDate ) {

                                // Convert the time date from a relative date to a target date.
                                targetDate = calendar.create([ viewsetObject.year, viewsetObject.month, targetDate + ( settings.firstDay ? 1 : 0 ) ])

                                var isSelected = selectedObject && selectedObject.pick == targetDate.pick,
                                    isHighlighted = highlightedObject && highlightedObject.pick == targetDate.pick,
                                    isDisabled = disabledCollection && calendar.disabled( targetDate ) || targetDate.pick < minLimitObject.pick || targetDate.pick > maxLimitObject.pick,
                                    formattedDate = _.trigger( calendar.formats.toString, calendar, [ settings.format, targetDate ] )

                                return [
                                    _.node(
                                        'div',
                                        targetDate.date,
                                        (function( klasses ) {

                                            // Add the `infocus` or `outfocus` classes based on month in view.
                                            klasses.push( viewsetObject.month == targetDate.month ? settings.klass.infocus : settings.klass.outfocus )

                                            // Add the `today` class if needed.
                                            if ( nowObject.pick == targetDate.pick ) {
                                                klasses.push( settings.klass.now )
                                            }

                                            // Add the `selected` class if something's selected and the time matches.
                                            if ( isSelected ) {
                                                klasses.push( settings.klass.selected )
                                            }

                                            // Add the `highlighted` class if something's highlighted and the time matches.
                                            if ( isHighlighted ) {
                                                klasses.push( settings.klass.highlighted )
                                            }

                                            // Add the `disabled` class if something's disabled and the object matches.
                                            if ( isDisabled ) {
                                                klasses.push( settings.klass.disabled )
                                            }

                                            return klasses.join( ' ' )
                                        })([ settings.klass.day ]),
                                        'data-pick=' + targetDate.pick + ' ' + _.ariaAttr({
                                            role: 'gridcell',
                                            label: formattedDate,
                                            selected: isSelected && calendar.$node.val() === formattedDate ? true : null,
                                            activedescendant: isHighlighted ? true : null,
                                            disabled: isDisabled ? true : null
                                        })
                                    ),
                                    '',
                                    _.ariaAttr({ role: 'presentation' })
                                ] //endreturn
                            }
                        })
                    ] //endreturn
                }
            })
        ),
        settings.klass.table,
        'id="' + calendar.$node[0].id + '_table' + '" ' + _.ariaAttr({
            role: 'grid',
            controls: calendar.$node[0].id,
            readonly: true
        })
    ) +

    // * For Firefox forms to submit, make sure to set the buttons’ `type` attributes as “button”.
    _.node(
        'div',
        _.node( 'button', settings.today, settings.klass.buttonToday,
            'type=button data-pick=' + nowObject.pick +
            ( isOpen && !calendar.disabled(nowObject) ? '' : ' disabled' ) + ' ' +
            _.ariaAttr({ controls: calendar.$node[0].id }) ) +
        _.node( 'button', settings.clear, settings.klass.buttonClear,
            'type=button data-clear=1' +
            ( isOpen ? '' : ' disabled' ) + ' ' +
            _.ariaAttr({ controls: calendar.$node[0].id }) ) +
        _.node('button', settings.close, settings.klass.buttonClose,
            'type=button data-close=true ' +
            ( isOpen ? '' : ' disabled' ) + ' ' +
            _.ariaAttr({ controls: calendar.$node[0].id }) ),
        settings.klass.footer
    ) //endreturn
} //DatePicker.prototype.nodes




/**
 * The date picker defaults.
 */
DatePicker.defaults = (function( prefix ) {

    return {

        // The title label to use for the month nav buttons
        labelMonthNext: 'Next month',
        labelMonthPrev: 'Previous month',

        // The title label to use for the dropdown selectors
        labelMonthSelect: 'Select a month',
        labelYearSelect: 'Select a year',

        // Months and weekdays
        monthsFull: [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ],
        monthsShort: [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ],
        weekdaysFull: [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ],
        weekdaysShort: [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ],

        // Today and clear
        today: 'Today',
        clear: 'Clear',
        close: 'Close',

        // Picker close behavior
        closeOnSelect: true,
        closeOnClear: true,

        // Update input value on select/clear
        updateInput: true,

        // The format to show on the `input` element
        format: 'd mmmm, yyyy',

        // Classes
        klass: {

            table: prefix + 'table',

            header: prefix + 'header',

            navPrev: prefix + 'nav--prev',
            navNext: prefix + 'nav--next',
            navDisabled: prefix + 'nav--disabled',

            month: prefix + 'month',
            year: prefix + 'year',

            selectMonth: prefix + 'select--month',
            selectYear: prefix + 'select--year',

            weekdays: prefix + 'weekday',

            day: prefix + 'day',
            disabled: prefix + 'day--disabled',
            selected: prefix + 'day--selected',
            highlighted: prefix + 'day--highlighted',
            now: prefix + 'day--today',
            infocus: prefix + 'day--infocus',
            outfocus: prefix + 'day--outfocus',

            footer: prefix + 'footer',

            buttonClear: prefix + 'button--clear',
            buttonToday: prefix + 'button--today',
            buttonClose: prefix + 'button--close'
        }
    }
})( Picker.klasses().picker + '__' )





/**
 * Extend the picker to add the date picker.
 */
Picker.extend( 'pickadate', DatePicker )


}));




/*!
 * Time picker for pickadate.js v3.6.4
 * http://amsul.github.io/pickadate.js/time.htm
 */

(function ( factory ) {

    // AMD.
    if ( typeof define == 'function' && define.amd )
        define( 'picker.time',['./picker', 'jquery'], factory )

    // Node.js/browserify.
    else if ( typeof exports == 'object' )
        module.exports = factory( require('./picker.js'), require('jquery') )

    // Browser globals.
    else factory( Picker, jQuery )

}(function( Picker, $ ) {


/**
 * Globals and constants
 */
var HOURS_IN_DAY = 24,
    MINUTES_IN_HOUR = 60,
    HOURS_TO_NOON = 12,
    MINUTES_IN_DAY = HOURS_IN_DAY * MINUTES_IN_HOUR,
    _ = Picker._



/**
 * The time picker constructor
 */
function TimePicker( picker, settings ) {

    var clock = this,
        elementValue = picker.$node[ 0 ].value,
        elementDataValue = picker.$node.data( 'value' ),
        valueString = elementDataValue || elementValue,
        formatString = elementDataValue ? settings.formatSubmit : settings.format

    clock.settings = settings
    clock.$node = picker.$node

    // The queue of methods that will be used to build item objects.
    clock.queue = {
        interval: 'i',
        min: 'measure create',
        max: 'measure create',
        now: 'now create',
        select: 'parse create validate',
        highlight: 'parse create validate',
        view: 'parse create validate',
        disable: 'deactivate',
        enable: 'activate'
    }

    // The component's item object.
    clock.item = {}

    clock.item.clear = null
    clock.item.interval = settings.interval || 30
    clock.item.disable = ( settings.disable || [] ).slice( 0 )
    clock.item.enable = -(function( collectionDisabled ) {
        return collectionDisabled[ 0 ] === true ? collectionDisabled.shift() : -1
    })( clock.item.disable )

    clock.
        set( 'min', settings.min ).
        set( 'max', settings.max ).
        set( 'now' )

    // When there’s a value, set the `select`, which in turn
    // also sets the `highlight` and `view`.
    if ( valueString ) {
        clock.set( 'select', valueString, {
            format: formatString
        })
    }

    // If there’s no value, default to highlighting “today”.
    else {
        clock.
            set( 'select', null ).
            set( 'highlight', clock.item.now )
    }

    // The keycode to movement mapping.
    clock.key = {
        40: 1, // Down
        38: -1, // Up
        39: 1, // Right
        37: -1, // Left
        go: function( timeChange ) {
            clock.set(
                'highlight',
                clock.item.highlight.pick + timeChange * clock.item.interval,
                { interval: timeChange * clock.item.interval }
            )
            this.render()
        }
    }


    // Bind some picker events.
    picker.
        on( 'render', function() {
            var $pickerHolder = picker.$root.children(),
                $viewset = $pickerHolder.find( '.' + settings.klass.viewset ),
                vendors = function( prop ) {
                    return ['webkit', 'moz', 'ms', 'o', ''].map(function( vendor ) {
                        return ( vendor ? '-' + vendor + '-' : '' ) + prop
                    })
                },
                animations = function( $el, state ) {
                    vendors( 'transform' ).map(function( prop ) {
                        $el.css( prop, state )
                    })
                    vendors( 'transition' ).map(function( prop ) {
                        $el.css( prop, state )
                    })
                }
            if ( $viewset.length ) {
                animations( $pickerHolder, 'none' )
                $pickerHolder[ 0 ].scrollTop = ~~$viewset.position().top - ( $viewset[ 0 ].clientHeight * 2 )
                animations( $pickerHolder, '' )
            }
        }, 1 ).
        on( 'open', function() {
            picker.$root.find( 'button' ).attr( 'disabled', false )
        }, 1 ).
        on( 'close', function() {
            picker.$root.find( 'button' ).attr( 'disabled', true )
        }, 1 )

} //TimePicker


/**
 * Set a timepicker item object.
 */
TimePicker.prototype.set = function( type, value, options ) {

    var clock = this,
        clockItem = clock.item

    // If the value is `null` just set it immediately.
    if ( value === null ) {
        if ( type == 'clear' ) type = 'select'
        clockItem[ type ] = value
        return clock
    }

    // Otherwise go through the queue of methods, and invoke the functions.
    // Update this as the time unit, and set the final value as this item.
    // * In the case of `enable`, keep the queue but set `disable` instead.
    //   And in the case of `flip`, keep the queue but set `enable` instead.
    clockItem[ ( type == 'enable' ? 'disable' : type == 'flip' ? 'enable' : type ) ] = clock.queue[ type ].split( ' ' ).map( function( method ) {
        value = clock[ method ]( type, value, options )
        return value
    }).pop()

    // Check if we need to cascade through more updates.
    if ( type == 'select' ) {
        clock.set( 'highlight', clockItem.select, options )
    }
    else if ( type == 'highlight' ) {
        clock.set( 'view', clockItem.highlight, options )
    }
    else if ( type == 'interval' ) {
        clock.
            set( 'min', clockItem.min, options ).
            set( 'max', clockItem.max, options )
    }
    else if ( type.match( /^(flip|min|max|disable|enable)$/ ) ) {
        if ( clockItem.select && clock.disabled( clockItem.select ) ) {
            clock.set( 'select', value, options )
        }
        if ( clockItem.highlight && clock.disabled( clockItem.highlight ) ) {
            clock.set( 'highlight', value, options )
        }
        if ( type == 'min' ) {
            clock.set( 'max', clockItem.max, options )
        }
    }

    return clock
} //TimePicker.prototype.set


/**
 * Get a timepicker item object.
 */
TimePicker.prototype.get = function( type ) {
    return this.item[ type ]
} //TimePicker.prototype.get


/**
 * Create a picker time object.
 */
TimePicker.prototype.create = function( type, value, options ) {

    var clock = this

    // If there’s no value, use the type as the value.
    value = value === undefined ? type : value

    // If it’s a date object, convert it into an array.
    if ( _.isDate( value ) ) {
        value = [ value.getHours(), value.getMinutes() ]
    }

    // If it’s an object, use the “pick” value.
    if ( $.isPlainObject( value ) && _.isInteger( value.pick ) ) {
        value = value.pick
    }

    // If it’s an array, convert it into minutes.
    else if ( $.isArray( value ) ) {
        value = +value[ 0 ] * MINUTES_IN_HOUR + (+value[ 1 ])
    }

    // If no valid value is passed, set it to “now”.
    else if ( !_.isInteger( value ) ) {
        value = clock.now( type, value, options )
    }

    // If we’re setting the max, make sure it’s greater than the min.
    if ( type == 'max' && value < clock.item.min.pick ) {
        value += MINUTES_IN_DAY
    }

    // If the value doesn’t fall directly on the interval,
    // add one interval to indicate it as “passed”.
    if ( type != 'min' && type != 'max' && (value - clock.item.min.pick) % clock.item.interval !== 0 ) {
        value += clock.item.interval
    }

    // Normalize it into a “reachable” interval.
    value = clock.normalize( type, value, options )

    // Return the compiled object.
    return {

        // Divide to get hours from minutes.
        hour: ~~( HOURS_IN_DAY + value / MINUTES_IN_HOUR ) % HOURS_IN_DAY,

        // The remainder is the minutes.
        mins: ( MINUTES_IN_HOUR + value % MINUTES_IN_HOUR ) % MINUTES_IN_HOUR,

        // The time in total minutes.
        time: ( MINUTES_IN_DAY + value ) % MINUTES_IN_DAY,

        // Reference to the “relative” value to pick.
        pick: value % MINUTES_IN_DAY
    }
} //TimePicker.prototype.create


/**
 * Create a range limit object using an array, date object,
 * literal “true”, or integer relative to another time.
 */
TimePicker.prototype.createRange = function( from, to ) {

    var clock = this,
        createTime = function( time ) {
            if ( time === true || $.isArray( time ) || _.isDate( time ) ) {
                return clock.create( time )
            }
            return time
        }

    // Create objects if possible.
    if ( !_.isInteger( from ) ) {
        from = createTime( from )
    }
    if ( !_.isInteger( to ) ) {
        to = createTime( to )
    }

    // Create relative times.
    if ( _.isInteger( from ) && $.isPlainObject( to ) ) {
        from = [ to.hour, to.mins + ( from * clock.settings.interval ) ];
    }
    else if ( _.isInteger( to ) && $.isPlainObject( from ) ) {
        to = [ from.hour, from.mins + ( to * clock.settings.interval ) ];
    }

    return {
        from: createTime( from ),
        to: createTime( to )
    }
} //TimePicker.prototype.createRange


/**
 * Check if a time unit falls within a time range object.
 */
TimePicker.prototype.withinRange = function( range, timeUnit ) {
    range = this.createRange(range.from, range.to)
    return timeUnit.pick >= range.from.pick && timeUnit.pick <= range.to.pick
}


/**
 * Check if two time range objects overlap.
 */
TimePicker.prototype.overlapRanges = function( one, two ) {

    var clock = this

    // Convert the ranges into comparable times.
    one = clock.createRange( one.from, one.to )
    two = clock.createRange( two.from, two.to )

    return clock.withinRange( one, two.from ) || clock.withinRange( one, two.to ) ||
        clock.withinRange( two, one.from ) || clock.withinRange( two, one.to )
}


/**
 * Get the time relative to now.
 */
TimePicker.prototype.now = function( type, value/*, options*/ ) {

    var interval = this.item.interval,
        date = new Date(),
        nowMinutes = date.getHours() * MINUTES_IN_HOUR + date.getMinutes(),
        isValueInteger = _.isInteger( value ),
        isBelowInterval

    // Make sure “now” falls within the interval range.
    nowMinutes -= nowMinutes % interval

    // Check if the difference is less than the interval itself.
    isBelowInterval = value < 0 && interval * value + nowMinutes <= -interval

    // Add an interval because the time has “passed”.
    nowMinutes += type == 'min' && isBelowInterval ? 0 : interval

    // If the value is a number, adjust by that many intervals.
    if ( isValueInteger ) {
        nowMinutes += interval * (
            isBelowInterval && type != 'max' ?
                value + 1 :
                value
            )
    }

    // Return the final calculation.
    return nowMinutes
} //TimePicker.prototype.now


/**
 * Normalize minutes to be “reachable” based on the min and interval.
 */
TimePicker.prototype.normalize = function( type, value/*, options*/ ) {

    var interval = this.item.interval,
        minTime = this.item.min && this.item.min.pick || 0

    // If setting min time, don’t shift anything.
    // Otherwise get the value and min difference and then
    // normalize the difference with the interval.
    value -= type == 'min' ? 0 : ( value - minTime ) % interval

    // Return the adjusted value.
    return value
} //TimePicker.prototype.normalize


/**
 * Measure the range of minutes.
 */
TimePicker.prototype.measure = function( type, value, options ) {

    var clock = this

    // If it’s anything false-y, set it to the default.
    if ( !value ) {
        value = type == 'min' ? [ 0, 0 ] : [ HOURS_IN_DAY - 1, MINUTES_IN_HOUR - 1 ]
    }

    // If it’s a string, parse it.
    if ( typeof value == 'string' ) {
        value = clock.parse( type, value )
    }

    // If it’s a literal true, or an integer, make it relative to now.
    else if ( value === true || _.isInteger( value ) ) {
        value = clock.now( type, value, options )
    }

    // If it’s an object already, just normalize it.
    else if ( $.isPlainObject( value ) && _.isInteger( value.pick ) ) {
        value = clock.normalize( type, value.pick, options )
    }

    return value
} ///TimePicker.prototype.measure


/**
 * Validate an object as enabled.
 */
TimePicker.prototype.validate = function( type, timeObject, options ) {

    var clock = this,
        interval = options && options.interval ? options.interval : clock.item.interval

    // Check if the object is disabled.
    if ( clock.disabled( timeObject ) ) {

        // Shift with the interval until we reach an enabled time.
        timeObject = clock.shift( timeObject, interval )
    }

    // Scope the object into range.
    timeObject = clock.scope( timeObject )

    // Do a second check to see if we landed on a disabled min/max.
    // In that case, shift using the opposite interval as before.
    if ( clock.disabled( timeObject ) ) {
        timeObject = clock.shift( timeObject, interval * -1 )
    }

    // Return the final object.
    return timeObject
} //TimePicker.prototype.validate


/**
 * Check if an object is disabled.
 */
TimePicker.prototype.disabled = function( timeToVerify ) {

    var clock = this,

        // Filter through the disabled times to check if this is one.
        isDisabledMatch = clock.item.disable.filter( function( timeToDisable ) {

            // If the time is a number, match the hours.
            if ( _.isInteger( timeToDisable ) ) {
                return timeToVerify.hour == timeToDisable
            }

            // If it’s an array, create the object and match the times.
            if ( $.isArray( timeToDisable ) || _.isDate( timeToDisable ) ) {
                return timeToVerify.pick == clock.create( timeToDisable ).pick
            }

            // If it’s an object, match a time within the “from” and “to” range.
            if ( $.isPlainObject( timeToDisable ) ) {
                return clock.withinRange( timeToDisable, timeToVerify )
            }
        })

    // If this time matches a disabled time, confirm it’s not inverted.
    isDisabledMatch = isDisabledMatch.length && !isDisabledMatch.filter(function( timeToDisable ) {
        return $.isArray( timeToDisable ) && timeToDisable[2] == 'inverted' ||
            $.isPlainObject( timeToDisable ) && timeToDisable.inverted
    }).length

    // If the clock is "enabled" flag is flipped, flip the condition.
    return clock.item.enable === -1 ? !isDisabledMatch : isDisabledMatch ||
        timeToVerify.pick < clock.item.min.pick ||
        timeToVerify.pick > clock.item.max.pick
} //TimePicker.prototype.disabled


/**
 * Shift an object by an interval until we reach an enabled object.
 */
TimePicker.prototype.shift = function( timeObject, interval ) {

    var clock = this,
        minLimit = clock.item.min.pick,
        maxLimit = clock.item.max.pick/*,
        safety = 1000*/

    interval = interval || clock.item.interval

    // Keep looping as long as the time is disabled.
    while ( /*safety &&*/ clock.disabled( timeObject ) ) {

        /*safety -= 1
        if ( !safety ) {
            throw 'Fell into an infinite loop while shifting to ' + timeObject.hour + ':' + timeObject.mins + '.'
        }*/

        // Increase/decrease the time by the interval and keep looping.
        timeObject = clock.create( timeObject.pick += interval )

        // If we've looped beyond the limits, break out of the loop.
        if ( timeObject.pick <= minLimit || timeObject.pick >= maxLimit ) {
            break
        }
    }

    // Return the final object.
    return timeObject
} //TimePicker.prototype.shift


/**
 * Scope an object to be within range of min and max.
 */
TimePicker.prototype.scope = function( timeObject ) {
    var minLimit = this.item.min.pick,
        maxLimit = this.item.max.pick
    return this.create( timeObject.pick > maxLimit ? maxLimit : timeObject.pick < minLimit ? minLimit : timeObject )
} //TimePicker.prototype.scope


/**
 * Parse a string into a usable type.
 */
TimePicker.prototype.parse = function( type, value, options ) {

    var hour, minutes, isPM, item, parseValue,
        clock = this,
        parsingObject = {}

    // If it’s already parsed, we’re good.
    if ( !value || typeof value != 'string' ) {
        return value
    }

    // We need a `.format` to parse the value with.
    if ( !( options && options.format ) ) {
        options = options || {}
        options.format = clock.settings.format
    }

    // Convert the format into an array and then map through it.
    clock.formats.toArray( options.format ).map( function( label ) {

        var
            substring,

            // Grab the formatting label.
            formattingLabel = clock.formats[ label ],

            // The format length is from the formatting label function or the
            // label length without the escaping exclamation (!) mark.
            formatLength = formattingLabel ?
                _.trigger( formattingLabel, clock, [ value, parsingObject ] ) :
                label.replace( /^!/, '' ).length

        // If there's a format label, split the value up to the format length.
        // Then add it to the parsing object with appropriate label.
        if ( formattingLabel ) {
            substring = value.substr( 0, formatLength )
            parsingObject[ label ] = substring.match(/^\d+$/) ? +substring : substring
        }

        // Update the time value as the substring from format length to end.
        value = value.substr( formatLength )
    })

    // Grab the hour and minutes from the parsing object.
    for ( item in parsingObject ) {
        parseValue = parsingObject[item]
        if ( _.isInteger(parseValue) ) {
            if ( item.match(/^(h|hh)$/i) ) {
                hour = parseValue
                if ( item == 'h' || item == 'hh' ) {
                    hour %= 12
                }
            }
            else if ( item == 'i' ) {
                minutes = parseValue
            }
        }
        else if ( item.match(/^a$/i) && parseValue.match(/^p/i) && ('h' in parsingObject || 'hh' in parsingObject) ) {
            isPM = true
        }
    }

    // Calculate it in minutes and return.
    return (isPM ? hour + 12 : hour) * MINUTES_IN_HOUR + minutes
} //TimePicker.prototype.parse


/**
 * Various formats to display the object in.
 */
TimePicker.prototype.formats = {

    h: function( string, timeObject ) {

        // If there's string, then get the digits length.
        // Otherwise return the selected hour in "standard" format.
        return string ? _.digits( string ) : timeObject.hour % HOURS_TO_NOON || HOURS_TO_NOON
    },
    hh: function( string, timeObject ) {

        // If there's a string, then the length is always 2.
        // Otherwise return the selected hour in "standard" format with a leading zero.
        return string ? 2 : _.lead( timeObject.hour % HOURS_TO_NOON || HOURS_TO_NOON )
    },
    H: function( string, timeObject ) {

        // If there's string, then get the digits length.
        // Otherwise return the selected hour in "military" format as a string.
        return string ? _.digits( string ) : '' + ( timeObject.hour % 24 )
    },
    HH: function( string, timeObject ) {

        // If there's string, then get the digits length.
        // Otherwise return the selected hour in "military" format with a leading zero.
        return string ? _.digits( string ) : _.lead( timeObject.hour % 24 )
    },
    i: function( string, timeObject ) {

        // If there's a string, then the length is always 2.
        // Otherwise return the selected minutes.
        return string ? 2 : _.lead( timeObject.mins )
    },
    a: function( string, timeObject ) {

        // If there's a string, then the length is always 4.
        // Otherwise check if it's more than "noon" and return either am/pm.
        return string ? 4 : MINUTES_IN_DAY / 2 > timeObject.time % MINUTES_IN_DAY ? 'a.m.' : 'p.m.'
    },
    A: function( string, timeObject ) {

        // If there's a string, then the length is always 2.
        // Otherwise check if it's more than "noon" and return either am/pm.
        return string ? 2 : MINUTES_IN_DAY / 2 > timeObject.time % MINUTES_IN_DAY ? 'AM' : 'PM'
    },

    // Create an array by splitting the formatting string passed.
    toArray: function( formatString ) { return formatString.split( /(h{1,2}|H{1,2}|i|a|A|!.)/g ) },

    // Format an object into a string using the formatting options.
    toString: function ( formatString, itemObject ) {
        var clock = this
        return clock.formats.toArray( formatString ).map( function( label ) {
            return _.trigger( clock.formats[ label ], clock, [ 0, itemObject ] ) || label.replace( /^!/, '' )
        }).join( '' )
    }
} //TimePicker.prototype.formats




/**
 * Check if two time units are the exact.
 */
TimePicker.prototype.isTimeExact = function( one, two ) {

    var clock = this

    // When we’re working with minutes, do a direct comparison.
    if (
        ( _.isInteger( one ) && _.isInteger( two ) ) ||
        ( typeof one == 'boolean' && typeof two == 'boolean' )
     ) {
        return one === two
    }

    // When we’re working with time representations, compare the “pick” value.
    if (
        ( _.isDate( one ) || $.isArray( one ) ) &&
        ( _.isDate( two ) || $.isArray( two ) )
    ) {
        return clock.create( one ).pick === clock.create( two ).pick
    }

    // When we’re working with range objects, compare the “from” and “to”.
    if ( $.isPlainObject( one ) && $.isPlainObject( two ) ) {
        return clock.isTimeExact( one.from, two.from ) && clock.isTimeExact( one.to, two.to )
    }

    return false
}


/**
 * Check if two time units overlap.
 */
TimePicker.prototype.isTimeOverlap = function( one, two ) {

    var clock = this

    // When we’re working with an integer, compare the hours.
    if ( _.isInteger( one ) && ( _.isDate( two ) || $.isArray( two ) ) ) {
        return one === clock.create( two ).hour
    }
    if ( _.isInteger( two ) && ( _.isDate( one ) || $.isArray( one ) ) ) {
        return two === clock.create( one ).hour
    }

    // When we’re working with range objects, check if the ranges overlap.
    if ( $.isPlainObject( one ) && $.isPlainObject( two ) ) {
        return clock.overlapRanges( one, two )
    }

    return false
}


/**
 * Flip the “enabled” state.
 */
TimePicker.prototype.flipEnable = function(val) {
    var itemObject = this.item
    itemObject.enable = val || (itemObject.enable == -1 ? 1 : -1)
}


/**
 * Mark a collection of times as “disabled”.
 */
TimePicker.prototype.deactivate = function( type, timesToDisable ) {

    var clock = this,
        disabledItems = clock.item.disable.slice(0)


    // If we’re flipping, that’s all we need to do.
    if ( timesToDisable == 'flip' ) {
        clock.flipEnable()
    }

    else if ( timesToDisable === false ) {
        clock.flipEnable(1)
        disabledItems = []
    }

    else if ( timesToDisable === true ) {
        clock.flipEnable(-1)
        disabledItems = []
    }

    // Otherwise go through the times to disable.
    else {

        timesToDisable.map(function( unitToDisable ) {

            var matchFound

            // When we have disabled items, check for matches.
            // If something is matched, immediately break out.
            for ( var index = 0; index < disabledItems.length; index += 1 ) {
                if ( clock.isTimeExact( unitToDisable, disabledItems[index] ) ) {
                    matchFound = true
                    break
                }
            }

            // If nothing was found, add the validated unit to the collection.
            if ( !matchFound ) {
                if (
                    _.isInteger( unitToDisable ) ||
                    _.isDate( unitToDisable ) ||
                    $.isArray( unitToDisable ) ||
                    ( $.isPlainObject( unitToDisable ) && unitToDisable.from && unitToDisable.to )
                ) {
                    disabledItems.push( unitToDisable )
                }
            }
        })
    }

    // Return the updated collection.
    return disabledItems
} //TimePicker.prototype.deactivate


/**
 * Mark a collection of times as “enabled”.
 */
TimePicker.prototype.activate = function( type, timesToEnable ) {

    var clock = this,
        disabledItems = clock.item.disable,
        disabledItemsCount = disabledItems.length

    // If we’re flipping, that’s all we need to do.
    if ( timesToEnable == 'flip' ) {
        clock.flipEnable()
    }

    else if ( timesToEnable === true ) {
        clock.flipEnable(1)
        disabledItems = []
    }

    else if ( timesToEnable === false ) {
        clock.flipEnable(-1)
        disabledItems = []
    }

    // Otherwise go through the disabled times.
    else {

        timesToEnable.map(function( unitToEnable ) {

            var matchFound,
                disabledUnit,
                index,
                isRangeMatched

            // Go through the disabled items and try to find a match.
            for ( index = 0; index < disabledItemsCount; index += 1 ) {

                disabledUnit = disabledItems[index]

                // When an exact match is found, remove it from the collection.
                if ( clock.isTimeExact( disabledUnit, unitToEnable ) ) {
                    matchFound = disabledItems[index] = null
                    isRangeMatched = true
                    break
                }

                // When an overlapped match is found, add the “inverted” state to it.
                else if ( clock.isTimeOverlap( disabledUnit, unitToEnable ) ) {
                    if ( $.isPlainObject( unitToEnable ) ) {
                        unitToEnable.inverted = true
                        matchFound = unitToEnable
                    }
                    else if ( $.isArray( unitToEnable ) ) {
                        matchFound = unitToEnable
                        if ( !matchFound[2] ) matchFound.push( 'inverted' )
                    }
                    else if ( _.isDate( unitToEnable ) ) {
                        matchFound = [ unitToEnable.getFullYear(), unitToEnable.getMonth(), unitToEnable.getDate(), 'inverted' ]
                    }
                    break
                }
            }

            // If a match was found, remove a previous duplicate entry.
            if ( matchFound ) for ( index = 0; index < disabledItemsCount; index += 1 ) {
                if ( clock.isTimeExact( disabledItems[index], unitToEnable ) ) {
                    disabledItems[index] = null
                    break
                }
            }

            // In the event that we’re dealing with an overlap of range times,
            // make sure there are no “inverted” times because of it.
            if ( isRangeMatched ) for ( index = 0; index < disabledItemsCount; index += 1 ) {
                if ( clock.isTimeOverlap( disabledItems[index], unitToEnable ) ) {
                    disabledItems[index] = null
                    break
                }
            }

            // If something is still matched, add it into the collection.
            if ( matchFound ) {
                disabledItems.push( matchFound )
            }
        })
    }

    // Return the updated collection.
    return disabledItems.filter(function( val ) { return val != null })
} //TimePicker.prototype.activate


/**
 * The division to use for the range intervals.
 */
TimePicker.prototype.i = function( type, value/*, options*/ ) {
    return _.isInteger( value ) && value > 0 ? value : this.item.interval
}


/**
 * Create a string for the nodes in the picker.
 */
TimePicker.prototype.nodes = function( isOpen ) {

    var
        clock = this,
        settings = clock.settings,
        selectedObject = clock.item.select,
        highlightedObject = clock.item.highlight,
        viewsetObject = clock.item.view,
        disabledCollection = clock.item.disable

    return _.node(
        'ul',
        _.group({
            min: clock.item.min.pick,
            max: clock.item.max.pick,
            i: clock.item.interval,
            node: 'li',
            item: function( loopedTime ) {
                loopedTime = clock.create( loopedTime )
                var timeMinutes = loopedTime.pick,
                    isSelected = selectedObject && selectedObject.pick == timeMinutes,
                    isHighlighted = highlightedObject && highlightedObject.pick == timeMinutes,
                    isDisabled = disabledCollection && clock.disabled( loopedTime ),
                    formattedTime = _.trigger( clock.formats.toString, clock, [ settings.format, loopedTime ] )
                return [
                    _.trigger( clock.formats.toString, clock, [ _.trigger( settings.formatLabel, clock, [ loopedTime ] ) || settings.format, loopedTime ] ),
                    (function( klasses ) {

                        if ( isSelected ) {
                            klasses.push( settings.klass.selected )
                        }

                        if ( isHighlighted ) {
                            klasses.push( settings.klass.highlighted )
                        }

                        if ( viewsetObject && viewsetObject.pick == timeMinutes ) {
                            klasses.push( settings.klass.viewset )
                        }

                        if ( isDisabled ) {
                            klasses.push( settings.klass.disabled )
                        }

                        return klasses.join( ' ' )
                    })( [ settings.klass.listItem ] ),
                    'data-pick=' + loopedTime.pick + ' ' + _.ariaAttr({
                        role: 'option',
                        label: formattedTime,
                        selected: isSelected && clock.$node.val() === formattedTime ? true : null,
                        activedescendant: isHighlighted ? true : null,
                        disabled: isDisabled ? true : null
                    })
                ]
            }
        }) +

        // * For Firefox forms to submit, make sure to set the button’s `type` attribute as “button”.
        _.node(
            'li',
            _.node(
                'button',
                settings.clear,
                settings.klass.buttonClear,
                'type=button data-clear=1' + ( isOpen ? '' : ' disabled' ) + ' ' +
                _.ariaAttr({ controls: clock.$node[0].id })
            ),
            '', _.ariaAttr({ role: 'presentation' })
        ),
        settings.klass.list,
        _.ariaAttr({ role: 'listbox', controls: clock.$node[0].id })
    )
} //TimePicker.prototype.nodes







/**
 * Extend the picker to add the component with the defaults.
 */
TimePicker.defaults = (function( prefix ) {

    return {

        // Clear
        clear: 'Clear',

        // The format to show on the `input` element
        format: 'h:i A',

        // The interval between each time
        interval: 30,

        // Picker close behavior
        closeOnSelect: true,
        closeOnClear: true,

        // Update input value on select/clear
        updateInput: true,

        // Classes
        klass: {

            picker: prefix + ' ' + prefix + '--time',
            holder: prefix + '__holder',

            list: prefix + '__list',
            listItem: prefix + '__list-item',

            disabled: prefix + '__list-item--disabled',
            selected: prefix + '__list-item--selected',
            highlighted: prefix + '__list-item--highlighted',
            viewset: prefix + '__list-item--viewset',
            now: prefix + '__list-item--now',

            buttonClear: prefix + '__button--clear'
        }
    }
})( Picker.klasses().picker )





/**
 * Extend the picker to add the time picker.
 */
Picker.extend( 'pickatime', TimePicker )


}));




/* PickADate pattern.
 *
 * Options:
 *    date(object): Date widget options described here. If false is selected date picker wont be shown. ({{selectYears: true, selectMonths: true })
 *    time(object): Time widget options described here. If false is selected time picker wont be shown. ({})
 *    today(String/Boolean): Title text for today button. Set to a falsy value to hide the button ("Today").
 *    clear(String/Boolean): Title text for the clear button. Set to a falsy value to hide the button ("Clear").
 *    autoSetTimeOnDateChange(string): Automatically set the time when a date is set. You can specify an offset with a special syntax - a stringified JSON Array in the form of "[H,M]" will set it to hour:minute. If you prepend an "+" or "-", this will added or subscracted to the current time. It does not go beyond 12:00am. ("+[0,0]").
 *    separator(string): Separator between date and time if both are enabled.
 *    (' ')
 *    classClearName(string): Class applied to clear button. ('pattern-pickadate-clear')
 *    classDateName(string): Class applied to date input. ('pattern-pickadate-date')
 *    classDateWrapperName(string): Class applied to extra wrapper div around date input. ('pattern-pickadate-date-wrapper')
 *    classNowName(string): Class applied to now button. ('pattern-pickadate-now')
 *    classSeparatorName(string): Class applied to separator. ('pattern-pickadate-separator')
 *    classTimeName(string): Class applied to time input. ('pattern-pickadate-time')
 *    classTimeWrapperName(string): Class applied to wrapper div around time input. ('pattern-pickadate-time-wrapper')
 *    classTimezoneName(string): Class applied to timezone input. ('pattern-pickadate-timezone')
 *    classTimezoneWrapperName(string): Class applied to wrapper div around timezone input. ('pattern-pickadate-timezone-wrapper')
 *    classWrapperName(string): Class name of element that is generated by pattern. ('pattern-pickadate-wrapper')
 *
 * Documentation:
 *    # Date and Time
 *
 *    {{ example-1 }}
 *
 *    # Date and Time with initial data
 *
 *    {{ example-2 }}
 *
 *    # Date
 *
 *    {{ example-3 }}
 *
 *    # Date with initial date
 *
 *    {{ example-4 }}
 *
 *    # Time
 *
 *    {{ example-5 }}
 *
 *    # Time with initial time
 *
 *    {{ example-6 }}
 *
 *    # Date and time with timezone
 *
 *    {{ example-7 }}
 *
 *    # Date and time with timezone and default value
 *
 *    {{ example-8 }}
 *
 *    # Date and time with one timezone and no today and clear buttons
 *
 *    {{ example-9 }}
 *
 * Example: example-1
 *    <input class="pat-pickadate"/>
 *
 * Example: example-2
 *    <input class="pat-pickadate" value="2010-12-31 00:45" />
 *
 * Example: example-3
 *    <input class="pat-pickadate" data-pat-pickadate="time:false"/>
 *
 * Example: example-4
 *    <input class="pat-pickadate" value="2010-12-31" data-pat-pickadate="time:false"/>
 *
 * Example: example-5
 *    <input class="pat-pickadate" data-pat-pickadate="date:false"/>
 *
 * Example: example-6
 *    <input class="pat-pickadate" value="00:00" data-pat-pickadate="date:false"/>
 *
 * Example: example-7
 *    <input class="pat-pickadate" data-pat-pickadate='{"timezone": {"data": [{"id":"Europe/Berlin","text":"Europe/Berlin"},{"id":"Europe/Vienna","text":"Europe/Vienna"}]}}'/>
 *
 * Example: example-8
 *    <input class="pat-pickadate" data-pat-pickadate='{"timezone": {"default": "Europe/Vienna", "data": [{"id":"Europe/Berlin","text":"Europe/Berlin"},{"id":"Europe/Vienna","text":"Europe/Vienna"}]}}'/>
 *
 * Example: example-9
 *    <input class="pat-pickadate" data-pat-pickadate='{"timezone": {"data": [{"id":"Europe/Berlin","text":"Europe/Berlin"}]}, "today": false, "clear": false}'/>
 *
 */

define(
  'mockup-patterns-pickadate',[
    'jquery',
    'pat-base',
    'mockup-utils',
    'translate',
    'picker',
    'picker.date',
    'picker.time',
    'mockup-patterns-select2'
  ],
  function($, Base, utils, _t) {
    'use strict';

    var PickADate = Base.extend({
      name: 'pickadate',
      trigger: '.pat-pickadate',
      parser: 'mockup',
      defaults: {
        separator: ' ',
        date: {
          selectYears: true,
          selectMonths: true,
          formatSubmit: 'yyyy-mm-dd',
          format: 'yyyy-mm-dd',
          labelMonthNext: _t('Next month'),
          labelMonthPrev: _t('Previous month'),
          labelMonthSelect: _t('Select a month'),
          labelYearSelect: _t('Select a year'),
          // hide buttons
          clear: false,
          close: false,
          today: false
        },
        time: {
          clear: false // hide button
        },
        today: _t('Today'),
        clear: _t('Clear'),
        timezone: null,
        autoSetTimeOnDateChange: '+[0,0]',
        classWrapperName: 'pattern-pickadate-wrapper',
        classSeparatorName: 'pattern-pickadate-separator',
        classDateName: 'pattern-pickadate-date',
        classDateWrapperName: 'pattern-pickadate-date-wrapper',
        classTimeName: 'pattern-pickadate-time',
        classTimeWrapperName: 'pattern-pickadate-time-wrapper',
        classTimezoneName: 'pattern-pickadate-timezone',
        classTimezoneWrapperName: 'pattern-pickadate-timezone-wrapper',
        classClearName: 'pattern-pickadate-clear',
        classNowName: 'pattern-pickadate-now',
        placeholderDate: _t('Enter date...'),
        placeholderTime: _t('Enter time...'),
        placeholderTimezone: _t('Enter timezone...')
      },
      parseTimeOffset: function(timeOffset) {
        var op = undefined;
        if (timeOffset.indexOf('+') === 0) {
          op = '+';
          timeOffset = timeOffset.split('+')[1];
        } else if (timeOffset.indexOf('-') === 0) {
          op = '-';
          timeOffset = timeOffset.split('-')[1];
        }
        try {
          timeOffset = JSON.parse(timeOffset);
        } catch (e) {
          timeOffset = undefined;
        }
        if (timeOffset === false) {
          return false;
        } else if (timeOffset === true || Array.isArray(timeOffset) !== true) {
          return [0, 0];
        }

        var hours = parseInt(timeOffset[0], 10) || 0,
          mins = parseInt(timeOffset[1], 10) || 0;

        if (op === '+' || op === '-') {
          var offset = new Date(),
            curHours = offset.getHours(),
            curMins = offset.getMinutes();

          if (op === '+') {
            hours = curHours + hours;
            if (hours > 23) {
              hours = 23;
            }
            mins = curMins + mins;
            if (mins > 59) {
              mins = 59;
            }
          } else if (op === '-') {
            hours = curHours - hours;
            if (hours < 0) {
              hours = 0;
            }
            mins = curMins - mins;
            if (mins < 0) {
              mins = 0;
            }
          }
        }
        return [hours, mins];
      },
      init: function() {
        var self = this,
          value = self.$el.val().split(' '),
          dateValue = value[0] || '',
          timeValue = value[1] || '';

        if (utils.bool(self.options.date) === false) {
          self.options.date = false;
        }
        if (utils.bool(self.options.time) === false) {
          self.options.time = false;
        }
        self.options.autoSetTimeOnDateChange = self.parseTimeOffset(
          self.options.autoSetTimeOnDateChange
        );

        if (self.options.date === false) {
          timeValue = value[0];
        }

        self.$el.hide();

        self.$wrapper = $('<div/>')
          .addClass(self.options.classWrapperName)
          .insertAfter(self.$el);

        if (self.options.date !== false) {
          self.$date = $('<input type="text"/>')
            .attr('placeholder', self.options.placeholderDate)
            .attr('data-value', dateValue)
            .addClass(self.options.classDateName)
            .appendTo(
              $('<div/>')
                .addClass(self.options.classDateWrapperName)
                .appendTo(self.$wrapper)
            )
            .pickadate(
              $.extend(true, {}, self.options.date, {
                onSet: function(e) {
                  if (e.select !== undefined) {
                    self.$date.attr('data-value', e.select);
                    if (
                      self.options.autoSetTimeOnDateChange !== false &&
                      self.$time
                    ) {
                      if (!self.$time.pickatime('picker').get('select')) {
                        self.$time
                          .pickatime('picker')
                          .set('select', self.options.autoSetTimeOnDateChange);
                      }
                    }
                    if (
                      self.options.time === false ||
                      self.$time.attr('data-value') !== ''
                    ) {
                      self.updateValue.call(self);
                    }
                  }
                  if (e.hasOwnProperty('clear')) {
                    self.$el.val('');
                    self.$date.attr('data-value', '');
                  }
                }
              })
            );
        }

        if (self.options.time !== false) {
          self.options.time.formatSubmit = 'HH:i';
          self.$time = $('<input type="text"/>')
            .attr('placeholder', self.options.placeholderTime)
            .attr('data-value', timeValue)
            .addClass(self.options.classTimeName)
            .appendTo(
              $('<div/>')
                .addClass(self.options.classTimeWrapperName)
                .appendTo(self.$wrapper)
            )
            .pickatime(
              $.extend(true, {}, self.options.time, {
                onSet: function(e) {
                  if (e.select !== undefined) {
                    self.$time.attr('data-value', e.select);
                    if (
                      self.options.date === false ||
                      self.$date.attr('data-value') !== ''
                    ) {
                      self.updateValue.call(self);
                    }
                  }
                  if (e.hasOwnProperty('clear')) {
                    self.$el.val('');
                    self.$time.attr('data-value', '');
                  }
                }
              })
            );

          // XXX: bug in pickatime
          // work around pickadate bug loading 00:xx as value
          if (
            typeof timeValue === 'string' &&
            timeValue.substring(0, 2) === '00'
          ) {
            self.$time.pickatime('picker').set('select', timeValue.split(':'));
            self.$time.attr('data-value', timeValue);
          }
        }

        if (
          self.options.date !== false &&
          self.options.time !== false &&
          self.options.timezone
        ) {
          self.$separator = $('<span/>')
            .addClass(self.options.classSeparatorName)
            .html(
              self.options.separator === ' ' ? '&nbsp;' : self.options.separator
            )
            .appendTo(self.$wrapper);
        }

        if (self.options.timezone !== null) {
          self.$timezone = $('<input type="text"/>')
            .addClass(self.options.classTimezoneName)
            .appendTo(
              $('<div/>')
                .addClass(self.options.classTimezoneWrapperName)
                .appendTo(self.$wrapper)
            )
            .patternSelect2(
              $.extend(
                true,
                {
                  placeholder: self.options.placeholderTimezone,
                  width: '10em'
                },
                self.options.timezone,
                { multiple: false }
              )
            )
            .on('change', function(e) {
              if (e.val !== undefined) {
                self.$timezone.attr('data-value', e.val);
                if (
                  (self.options.date === false ||
                    self.$date.attr('data-value') !== '') &&
                  (self.options.time === false ||
                    self.$time.attr('data-value') !== '')
                ) {
                  self.updateValue.call(self);
                }
              }
            });
          var defaultTimezone = self.options.timezone.default;
          // if timezone has a default value included
          if (defaultTimezone) {
            var isInList;
            // the timezone list contains the default value
            self.options.timezone.data.some(function(obj) {
              isInList =
                obj.text === self.options.timezone.default ? true : false;
              return isInList;
            });
            if (isInList) {
              self.$timezone.attr('data-value', defaultTimezone);
              self.$timezone
                .parent()
                .find('.select2-chosen')
                .text(defaultTimezone);
            }
          }
          // if data contains only one timezone this value will be chosen
          // and the timezone dropdown list will be disabled and
          if (self.options.timezone.data.length === 1) {
            self.$timezone.attr(
              'data-value',
              self.options.timezone.data[0].text
            );
            self.$timezone
              .parent()
              .find('.select2-chosen')
              .text(self.options.timezone.data[0].text);
            self.$timezone.select2('enable', false);
          }
        }

        if (utils.bool(self.options.today)) {
          self.$now = $(
            '<button type="button" class="btn btn-xs btn-info" title="' +
              self.options.today +
              '"><span class="glyphicon glyphicon-time"></span></button>'
          )
            .addClass(self.options.classNowName)
            .on('click', function(e) {
              e.preventDefault();
              var now = new Date();
              if (self.$date) {
                self.$date.data('pickadate').set('select', now);
              }
              if (self.$time) {
                self.$time.data('pickatime').set('select', now);
              }
              self.emit('updated');
            })
            .appendTo(self.$wrapper);
        }

        if (utils.bool(self.options.clear)) {
          self.$clear = $(
            '<button type="button" class="btn btn-xs btn-danger" title="' +
              self.options.clear +
              '"><span class="glyphicon glyphicon-trash"></span></button>'
          )
            .addClass(self.options.classClearName)
            .on('click', function(e) {
              e.preventDefault();
              if (self.$date) {
                self.$date.data('pickadate').clear();
              }
              if (self.$time) {
                self.$time.data('pickatime').clear();
              }
              self.emit('updated');
            })
            .appendTo(self.$wrapper);
        }
      },
      updateValue: function() {
        var self = this,
          value = '';

        if (self.options.date !== false) {
          var date = self.$date.data('pickadate').component,
            dateValue = self.$date.data('pickadate').get('select'),
            formatDate = date.formats.toString;
          if (dateValue) {
            value += formatDate.apply(date, [
              self.options.date.formatSubmit,
              dateValue
            ]);
          }
        }

        if (self.options.date !== false && self.options.time !== false) {
          value += ' ';
        }

        if (self.options.time !== false) {
          var time = self.$time.data('pickatime').component,
            timeValue = self.$time.data('pickatime').get('select'),
            formatTime = time.formats.toString;
          if (timeValue) {
            value += formatTime.apply(time, ['HH:i', timeValue]);
          }
        }

        if (self.options.timezone !== null) {
          var timezone = ' ' + self.$timezone.attr('data-value');
          if (timezone) {
            value += timezone;
          }
        }

        self.$el.val(value);

        self.emit('updated');
      }
    });

    return PickADate;
  }
);

// Copyright (C) 2010 Plone Foundation
//
// This program is free software; you can redistribute it and/or modify it
// under the terms of the GNU General Public License as published by the Free
// Software Foundation; either version 2 of the License.
//
// This program is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
// FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
// more details.
//
// You should have received a copy of the GNU General Public License along with
// this program; if not, write to the Free Software Foundation, Inc., 51
// Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
//

require([
  'mockup-patterns-inlinevalidation',
  'mockup-patterns-recurrence',
  'mockup-patterns-relateditems',
  'mockup-patterns-pickadate',
  'mockup-patterns-select2',
], function() {
  'use strict';
});

define("/Users/maurits/community/plone-coredev/5.2/src/plone.staticresources/src/plone/staticresources/static/plone-logged-in.js", function(){});

