/* Autotoc pattern.
 *
 * Options:
 *    IDPrefix(string): Prefix used to generate ID. ('autotoc-item-')
 *    classActiveName(string): Class used for active level. ('active')
 *    classLevelPrefixName(string): Class prefix used for the TOC levels. ('autotoc-level-')
 *    classSectionName(string): Class used for section in TOC. ('autotoc-section')
 *    classTOCName(string): Class used for the TOC. ('autotoc-nav')
 *    levels(string): Selectors used to find levels. ('h1,h2,h3')
 *    scrollDuration(string): Speed of scrolling. ('slow')
 *    scrollEasing(string): Easing to use while scrolling. ('swing')
 *    section(string): Tag type to use for TOC. ('section')
 *
 * Documentation:
 *    # TOC
 *    {{ example-1 }}
 *
 *    # Tabs
 *    {{ example-2-tabs }}
 *
 * Example: example-1
 *    <div class="pat-autotoc"
 *          data-pat-autotoc="scrollDuration:slow;levels:h4,h5,h6;">
 *      <h4>Title 1</h4>
 *      <p>Mr. Zuckerkorn, you've been warned about touching. You said
 *         spanking. It walked on my pillow! How about a turtle? I've always
 *         loved those leathery little snappy faces.</p>
 *      <h5>Title 1.1</h5>
 *      <p>Ah coodle doodle do Caw ca caw, caw ca caw. Butterscotch!</p>
 *      <h6>Title 1.1.1</h6>
 *      <p>Want a lick? Okay, Lindsay, are you forgetting that I was
 *         a professional twice over - an analyst and a therapist.</p>
 *      <h4>Title 2</h4>
 *      <p>You boys know how to shovel coal? Don't worry, these young
 *      beauties have been nowhere near the bananas. I thought the two of
 *      us could talk man-on-man.</p>
 *    </div>
 *
 * Example: example-2-tabs
 *    <div class="pat-autotoc autotabs"
 *          data-pat-autotoc="section:fieldset;levels:legend;">
 *        <fieldset>
 *          <legend>Tab 1</legend>
 *          <div>
 *            Lorem ipsum dolor sit amet, ex nam odio ceteros fastidii,
 *            id porro lorem pro, homero facilisis in cum.
 *            At doming voluptua indoctum mel, natum noster similique ne mel.
 *          </div>
 *        </fieldset>
 *        <fieldset>
 *          <legend>Tab 2</legend>
 *          <div>
 *            Reque repudiare eum et. Prompta expetendis percipitur eu eam,
 *            et graece mandamus pro, eu vim harum audire tractatos.
 *            Ad perpetua salutandi mea, soluta delicata aliquando eam ne.
 *            Qui nostrum lucilius perpetua ut, eum suas stet oblique ut.
 *          </div>
 *        </fieldset>
 *        <fieldset>
 *          <legend>Tab 3</legend>
 *          <div>
 *            Vis mazim harum deterruisset ex, duo nemore nostro civibus ad,
 *            eros vituperata id cum. Vim at erat solet soleat,
 *            eum et iuvaret luptatum, pro an esse dolorum maiestatis.
 *          </div>
 *        </fieldset>
 *    </div>
 *
 */

define('mockup-patterns-autotoc',[
  'jquery',
  'pat-base'
], function($, Base) {
  'use strict';

  var AutoTOC = Base.extend({
    name: 'autotoc',
    trigger: '.pat-autotoc',
    parser: 'mockup',
    defaults: {
      section: 'section',
      levels: 'h1,h2,h3',
      IDPrefix: 'autotoc-item-',
      classTOCName: 'autotoc-nav',
      classSectionName: 'autotoc-section',
      classLevelPrefixName: 'autotoc-level-',
      classActiveName: 'active',
      scrollDuration: 'slow',
      scrollEasing: 'swing'
    },
    init: function() {
      var self = this;

      self.$toc = $('<nav/>').addClass(self.options.classTOCName);

      if (self.options.prependTo) {
        self.$toc.prependTo(self.options.prependTo);
      } else if (self.options.appendTo) {
        self.$toc.appendTo(self.options.appendTo);
      } else {
        self.$toc.prependTo(self.$el);
      }

      if (self.options.className) {
        self.$el.addClass(self.options.className);
      }

      $(self.options.section, self.$el).addClass(self.options.classSectionName);

      var asTabs = self.$el.hasClass('autotabs');

      var activeId = null;

      $(self.options.levels, self.$el).each(function(i) {
        var $level = $(this),
            id = $level.prop('id') ? $level.prop('id') :
                 $level.parents(self.options.section).prop('id');
        if (!id || $('#' + id).length > 0) {
          id = self.options.IDPrefix + self.name + '-' + i;
        }
        if(window.location.hash === '#' + id){
          activeId = id;
        }
        if(activeId===null && $level.hasClass(self.options.classActiveName)){
          activeId = id;
        }
        $level.data('navref', id);
        $('<a/>')
          .appendTo(self.$toc)
          .text($level.text())
          .attr('id', id)
          .attr('href', '#' + id)
          .addClass(self.options.classLevelPrefixName + self.getLevel($level))
          .on('click', function(e, options) {
            e.stopPropagation();
            e.preventDefault();
            if(!options){
              options = {
                doScroll: true,
                skipHash: false
              };
            }
            var $el = $(this);
            self.$toc.children('.' + self.options.classActiveName).removeClass(self.options.classActiveName);
            self.$el.children('.' + self.options.classActiveName).removeClass(self.options.classActiveName);
            $(e.target).addClass(self.options.classActiveName);
            $level.parents(self.options.section).addClass(self.options.classActiveName);
            if (options.doScroll !== false &&
                self.options.scrollDuration &&
                $level &&
                !asTabs) {
              $('body,html').animate({
                scrollTop: $level.offset().top
              }, self.options.scrollDuration, self.options.scrollEasing);
            }
            if (self.$el.parents('.plone-modal').size() !== 0) {
              self.$el.trigger('resize.plone-modal.patterns');
            }
            $(this).trigger('clicked');
            if(!options.skipHash){
              if(window.history && window.history.pushState){
                window.history.pushState({}, '', '#' + $el.attr('id'));
              }
            }
          });
        $level.data('autotoc-trigger-id', id);
      });

      if(activeId){
        $('a#' + activeId).trigger('click', {
          doScroll: true,
          skipHash: true
        });
      }else{
        self.$toc.find('a').first().trigger('click', {
          doScroll: false,
          skipHash: true});
      }
    },
    getLevel: function($el) {
      var elementLevel = 0;
      $.each(this.options.levels.split(','), function(level, levelSelector) {
        if ($el.filter(levelSelector).size() === 1) {
          elementLevel = level + 1;
          return false;
        }
      });
      return elementLevel;
    }
  });

  return AutoTOC;

});

/* Pattern utils
 */


define('mockup-utils',[
  'jquery'
], function($) {
  'use strict';

  var QueryHelper = function(options) {
    /* if pattern argument provided, it can implement the interface of:
     *    - browsing: boolean if currently browsing
     *    - currentPath: string of current path to apply to search if browsing
     *    - basePath: default path to provide if no subpath used
     */

    var self = this;
    var defaults = {
      pattern: null, // must be passed in
      vocabularyUrl: null,
      searchParam: 'SearchableText', // query string param to pass to search url
      pathOperator: 'plone.app.querystring.operation.string.path',
      attributes: ['UID', 'Title', 'Description', 'getURL', 'portal_type'],
      batchSize: 10, // number of results to retrive
      baseCriteria: [],
      sort_on: 'is_folderish',
      sort_order: 'reverse',
      pathDepth: 1
    };
    self.options = $.extend({}, defaults, options);

    self.pattern = self.options.pattern;
    if (self.pattern === undefined || self.pattern === null) {
      self.pattern = {
        browsing: false,
        basePath: '/'
      };
    }

    if (self.options.url && !self.options.vocabularyUrl) {
      self.options.vocabularyUrl = self.options.url;
    } else if (self.pattern.vocabularyUrl) {
      self.options.vocabularyUrl = self.pattern.vocabularyUrl;
    }
    self.valid = Boolean(self.options.vocabularyUrl);

    self.getBatch = function(page) {
      return {
        page: page ? page : 1,
        size: self.options.batchSize
      };
    };

    self.getCurrentPath = function() {
      var pattern = self.pattern;
      var currentPath;
      /* If currentPath is set on the QueryHelper object, use that first.
       * Then, check on the pattern.
       * Finally, see if it is a function and call it if it is.
       */
      if (self.currentPath) {
        currentPath = self.currentPath;
      } else {
        currentPath = pattern.currentPath;
      }
      if (typeof currentPath === 'function') {
        currentPath = currentPath();
      }
      var path = currentPath;
      if (!path) {
        if (pattern.basePath) {
          path = pattern.basePath;
        } else if (pattern.options.basePath) {
          path = pattern.options.basePath;
        } else {
          path = '/';
        }
      }
      return path;
    };

    self.getCriterias = function(term, searchOptions) {
      if (searchOptions === undefined) {
        searchOptions = {};
      }
      searchOptions = $.extend({}, {
        useBaseCriteria: true,
        additionalCriterias: []
      }, searchOptions);

      var criterias = [];
      if (searchOptions.useBaseCriteria) {
        criterias = self.options.baseCriteria.slice(0);
      }
      if (term) {
        term += '*';
        criterias.push({
          i: self.options.searchParam,
          o: 'plone.app.querystring.operation.string.contains',
          v: term
        });
      }
      if (searchOptions.searchPath) {
        criterias.push({
          i: 'path',
          o: self.options.pathOperator,
          v: searchOptions.searchPath + '::' + self.options.pathDepth
        });
      } else if (self.pattern.browsing) {
        criterias.push({
          i: 'path',
          o: self.options.pathOperator,
          v: self.getCurrentPath() + '::' + self.options.pathDepth
        });
      }
      criterias = criterias.concat(searchOptions.additionalCriterias);
      return criterias;
    };

    self.getQueryData = function(term, page) {
      var data = {
        query: JSON.stringify({
          criteria: self.getCriterias(term),
          sort_on: self.options.sort_on,
          sort_order: self.options.sort_order
        }),
        attributes: JSON.stringify(self.options.attributes)
      };
      if (page) {
        data.batch = JSON.stringify(self.getBatch(page));
      }
      return data;
    };

    self.getUrl = function() {
      var url = self.options.vocabularyUrl;
      if (url.indexOf('?') === -1) {
        url += '?';
      } else {
        url += '&';
      }
      return url + $.param(self.getQueryData());
    };

    self.selectAjax = function() {
      return {
        url: self.options.vocabularyUrl,
        dataType: 'JSON',
        quietMillis: 100,
        data: function(term, page) {
          return self.getQueryData(term, page);
        },
        results: function(data, page) {
          var more = (page * 10) < data.total; // whether or not there are more results available
          // notice we return the value of more so Select2 knows if more results can be loaded
          return {
            results: data.results,
            more: more
          };
        }
      };
    };

    self.search = function(term, operation, value, callback, useBaseCriteria, type) {
      if (useBaseCriteria === undefined) {
        useBaseCriteria = true;
      }
      if (type === undefined) {
        type = 'GET';
      }
      var criteria = [];
      if (useBaseCriteria) {
        criteria = self.options.baseCriteria.slice(0);
      }
      criteria.push({
        i: term,
        o: operation,
        v: value
      });
      var data = {
        query: JSON.stringify({
          criteria: criteria
        }),
        attributes: JSON.stringify(self.options.attributes)
      };
      $.ajax({
        url: self.options.vocabularyUrl,
        dataType: 'JSON',
        data: data,
        type: type,
        success: callback
      });
    };

    return self;
  };

  var Loading = function(options) {
    /*
     * Options:
     *   backdrop(pattern): if you want to have the progress indicator work
     *                      seamlessly with backdrop pattern
     *   zIndex(integer or function): to override default z-index used
     */
    var self = this;
    self.className = 'plone-loader';
    var defaults = {
      backdrop: null,
      zIndex: 10005 // can be a function
    };
    if (!options) {
      options = {};
    }
    self.options = $.extend({}, defaults, options);

    self.init = function() {
      self.$el = $('.' + self.className);
      if (self.$el.length === 0) {
        self.$el = $('<div><div></div></div>');
        self.$el.addClass(self.className).hide().appendTo('body');
      }
    };

    self.show = function(closable) {
      self.init();
      self.$el.show();
      var zIndex = self.options.zIndex;
      if (typeof(zIndex) === 'function') {
        zIndex = Math.max(zIndex(), 10005);
      } else {
        // go through all modals and backdrops and make sure we have a higher
        // z-index to use
        zIndex = 10005;
        $('.plone-modal-wrapper,.plone-modal-backdrop').each(function() {
          zIndex = Math.max(zIndex, $(this).css('zIndex') || 10005);
        });
        zIndex += 1;
      }
      self.$el.css('zIndex', zIndex);

      if (closable === undefined) {
        closable = true;
      }
      if (self.options.backdrop) {
        self.options.backdrop.closeOnClick = closable;
        self.options.backdrop.closeOnEsc = closable;
        self.options.backdrop.init();
        self.options.backdrop.show();
      }
    };

    self.hide = function() {
      self.init();
      self.$el.hide();
    };

    return self;
  };

  var getAuthenticator = function() {
    var $el = $('input[name="_authenticator"]');
    if ($el.length === 0) {
      $el = $('a[href*="_authenticator"]');
      if ($el.length > 0) {
        return $el.attr('href').split('_authenticator=')[1];
      }
      return '';
    } else {
      return $el.val();
    }
  };

  var generateId = function(prefix) {
    if (prefix === undefined) {
      prefix = 'id';
    }
    return prefix + (Math.floor((1 + Math.random()) * 0x10000)
      .toString(16).substring(1));
  };

  var setId = function($el, prefix) {
    if (prefix === undefined) {
      prefix = 'id';
    }
    var id = $el.attr('id');
    if (id === undefined) {
      id = generateId(prefix);
    } else {
      /* hopefully we don't screw anything up here... changing the id
       * in some cases so we get a decent selector */
      id = id.replace(/\./g, '-');
    }
    $el.attr('id', id);
    return id;
  };

  var getWindow = function() {
    var win = window;
    if (win.parent !== window) {
      win = win.parent;
    }
    return win;
  };

  var parseBodyTag = function(txt) {
    return $((/<body[^>]*>[^]*<\/body>/im).exec(txt)[0]
      .replace('<body', '<div').replace('</body>', '</div>')).eq(0).html();
  };

  var featureSupport = {
    /* Well tested feature support for things we use in mockup.
     * All gathered from: http://diveintohtml5.info/everything.html
     * Alternative to using some form of modernizr.
     */
    dragAndDrop: function() {
      return 'draggable' in document.createElement('span');
    },
    fileApi: function() {
      return typeof FileReader != 'undefined'; // jshint ignore:line
    },
    history: function() {
      return !!(window.history && window.history.pushState);
    }
  };

  var bool = function(val) {
    if (typeof val === 'string') {
      val = $.trim(val).toLowerCase();
    }
    return ['false', false, '0', 0, '', undefined, null].indexOf(val) === -1;
  };

  var escapeHTML = function(val) {
    return $('<div/>').text(val).html();
  };

  var removeHTML = function(val) {
    return val.replace(/<[^>]+>/ig, '');
  };

  var storage = {
    // Simple local storage wrapper, which doesn't break down if it's not available.
    get: function (name) {
        if (window.localStorage) {
          var val = window.localStorage[name];
          return typeof(val) === 'string' ? JSON.parse(val) : undefined;
      }
    },

    set: function (name, val) {
      if (window.localStorage) {
        window.localStorage[name] = JSON.stringify(val);
      }
    }
  };

  var createElementFromHTML = function(htmlString) {
    // From: https://stackoverflow.com/a/494348/1337474
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstChild;
  };

  return {
    bool: bool,
    escapeHTML: escapeHTML,
    removeHTML: removeHTML,
    featureSupport: featureSupport,
    generateId: generateId,
    getAuthenticator: getAuthenticator,
    getWindow: getWindow,
    Loading: Loading,
    loading: new Loading(),  // provide default loader
    parseBodyTag: parseBodyTag,
    QueryHelper: QueryHelper,
    setId: setId,
    storage: storage,
    createElementFromHTML: createElementFromHTML
  };
});

/* Content loader pattern.
 *
 * Options:
 *    content(string): CSS selector for content, which is going to replace the target. Can be a local element already in the DOM tree or come from an AJAX call by using the url option.
 *    target(string): CSS selector of target element, which is being replaced. If it's empty, the pattern element will be replaced.
 *    trigger(string): Event to trigger content loading. Defaults to "click"
 *    url(string): To load content from remote resource. Use 'el' to use with anchor tag href.
 *
 * Documentation:
 *    # With selector
 *    {{ example-1 }}
 *
 *    # With remote content
 *    {{ example-2 }}
 *
 * Example: example-1
 *    <a href="#" class="pat-contentloader" data-pat-contentloader="content:#clexample1;target:#clexample1target;">Load content</a>
 *    <div id="clexample1target">Original Content</div>
 *    <div id="clexample1" style="display:none">Replaced Content</div>
 *
 * Example: example-2
 *    <a href="#" class="pat-contentloader" data-pat-contentloader="url:something.html;">Load content</a>
 *
 *
 */


define('mockup-patterns-contentloader',[
  'jquery',
  'pat-base',
  'pat-logger',
  'pat-registry',
  'mockup-utils',
  'underscore'
], function($, Base, logger, Registry, utils, _) {
  'use strict';
  var log = logger.getLogger('pat-contentloader');

  var ContentLoader = Base.extend({
    name: 'contentloader',
    trigger: '.pat-contentloader',
    parser: 'mockup',
    defaults: {
      url: null,
      content: null,
      trigger: 'click',
      target: null,
      template: null,
      dataType: 'html'
    },
    init: function() {
      var that = this;
      if(that.options.url === 'el' && that.$el[0].tagName === 'A'){
        that.options.url = that.$el.attr('href');
      }
      that.$el.removeClass('loading-content');
      that.$el.removeClass('content-load-error');
      if(that.options.trigger === 'immediate'){
        that._load();
      }else{
        that.$el.on(that.options.trigger, function(e){
          e.preventDefault();
          that._load();
        });
      }
    },
    _load: function(){
      var that = this;
      that.$el.addClass('loading-content');
      if(that.options.url){
        that.loadRemote();
      }else{
        that.loadLocal();
      }
    },
    loadRemote: function(){
      var that = this;
      $.ajax({
        url: that.options.url,
        dataType: that.options.dataType,
        success: function(data){
          var $el;
          if(that.options.dataType === 'html'){
            if(data.indexOf('<html') !== -1){
              data = utils.parseBodyTag(data);
            }
            $el = $('<div>' + data + '</div>');  // jQuery starts to search at the first child element.
          }else if(that.options.dataType.indexOf('json') !== -1){
            // must have template defined with json
            if(data.constructor === Array && data.length === 1){
              // normalize json if it makes sense since some json returns as array with one item
              data = data[0];
            }
            try{
              $el = $(_.template(that.options.template)(data));
            }catch(e){
              that.$el.removeClass('loading-content');
              that.$el.addClass('content-load-error');
              log.warn('error rendering template. pat-contentloader will not work');
              return;
            }
          }
          if(that.options.content !== null){
            $el = $el.find(that.options.content);
          }
          that.loadLocal($el);
        },
        error: function(){
          that.$el.removeClass('loading-content');
          that.$el.addClass('content-load-error');
        }
      });
    },
    loadLocal: function($content){
      var that = this;
      if(!$content && that.options.content === null){
        that.$el.removeClass('loading-content');
        that.$el.addClass('content-load-error');
        log.warn('No selector configured');
        return;
      }
      var $target = that.$el;
      if(that.options.target !== null){
        $target = $(that.options.target);
        if($target.size() === 0){
          that.$el.removeClass('loading-content');
          that.$el.addClass('content-load-error');
          log.warn('No target nodes found');
          return;
        }
      }

      if(!$content){
        $content = $(that.options.content).clone();
      }
      if ($content.length) {
        $content.show();
        $target.replaceWith($content);
        Registry.scan($content);
      } else {
        // empty target node instead of removing it.
        // allows for subsequent content loader calls to work sucessfully.
        $target.empty();
      }

      that.$el.removeClass('loading-content');
      that.emit('loading-done');
    }
  });

  return ContentLoader;

});

/* Cookie Trigger pattern.
 *
 * Show a DOM element if browser cookies are disabled.
 *
 * Documentation:
 *
 *    {{ example-1 }}
 *
 * Example: example-1
 *    <div class="portalMessage error pat-cookietrigger">
 *      Cookies are not enabled. You must enable cookies before you can log in.
 *    </div>
 */

define('mockup-patterns-cookietrigger',[
  'pat-base'
], function (Base) {
  'use strict';

  var CookieTrigger = Base.extend({
    name: 'cookietrigger',
    trigger: '.pat-cookietrigger',
    parser: 'mockup',

    isCookiesEnabled: function() {
      /* Test whether cookies are enabled by attempting to set a cookie
       * and then change its value set test cookie.
       */
      var c = "areYourCookiesEnabled=0";
      document.cookie = c;
      var dc = document.cookie;
      // cookie not set?  fail
      if (dc.indexOf(c) === -1) {
        return 0;
      }
      // change test cookie
      c = "areYourCookiesEnabled=1";
      document.cookie = c;
      dc = document.cookie;
      // cookie not changed?  fail
      if (dc.indexOf(c) === -1) {
        return 0;
      }
      // delete cookie
      document.cookie = "areYourCookiesEnabled=; expires=Thu, 01-Jan-70 00:00:01 GMT";
      return 1;
    },

    showIfCookiesDisabled: function() {
      /* Show the element on which this pattern is defined if cookies are
       * disabled.
       */
      if (this.isCookiesEnabled()) {
        this.$el.hide();
      } else {
        this.$el.show();
      }
    },

    init: function () {
      this.showIfCookiesDisabled();
    },
  });
  return CookieTrigger;
});

/* Formautofocus pattern.
 *
 * Options:
 *    condition(string): TODO ('div.error')
 *    target(string): TODO ("div.error :input:not(.formTabs):visible:first')
 *    always(string): TODO (:input:not(.formTabs):visible:first')
 *
 * Documentation:
 *    # TODO
 *
 * Example: example-1
 *
 */


define('mockup-patterns-formautofocus',[
  'jquery',
  'pat-base'
], function($, Base, undefined) {
  'use strict';

  var FormAutoFocus = Base.extend({
    name: 'formautofocus',
    trigger: '.pat-formautofocus',
    parser: 'mockup',
    defaults: {
      condition: 'div.error',
      target: 'div.error :input:not(.formTabs):visible:first',
      always: ':input:not(.formTabs):visible:first'
    },
    init: function() {
      var self = this;
      if ($(self.options.condition, self.$el).size() !== 0) {
        $(self.options.target, self.$el).focus();
      } else {
        $(self.options.always, self.$el).focus();
      }

    }
  });

  return FormAutoFocus;

});

/* i18n integration. This is forked from jarn.jsi18n
 *
 * This is a singleton.
 * Configuration is done on the body tag data-i18ncatalogurl attribute
 *     <body data-i18ncatalogurl="/plonejsi18n">
 *
 *  Or, it'll default to "/plonejsi18n"
 */
define('mockup-i18n',[
  'jquery'
], function($) {
  'use strict';

  var I18N = function() {
    var self = this;
    self.baseUrl = $('body').attr('data-i18ncatalogurl');
    self.currentLanguage = $('html').attr('lang') || 'en';

    // Fix for country specific languages
    if (self.currentLanguage.split('-').length > 1) {
      self.currentLanguage = self.currentLanguage.split('-')[0] + '_' + self.currentLanguage.split('-')[1].toUpperCase();
    }

    self.storage = null;
    self.catalogs = {};
    self.ttl = 24 * 3600 * 1000;

    // Internet Explorer 8 does not know Date.now() which is used in e.g. loadCatalog, so we "define" it
    if (!Date.now) {
      Date.now = function() {
        return new Date().valueOf();
      };
    }

    try {
      if ('localStorage' in window && window.localStorage !== null && 'JSON' in window && window.JSON !== null) {
        self.storage = window.localStorage;
      }
    } catch (e) {}

    self.configure = function(config) {
      for (var key in config){
        self[key] = config[key];
      }
    };

    self._setCatalog = function (domain, language, catalog) {
      if (domain in self.catalogs) {
        self.catalogs[domain][language] = catalog;
      } else {
        self.catalogs[domain] = {};
        self.catalogs[domain][language] = catalog;
      }
    };

    self._storeCatalog = function (domain, language, catalog) {
      var key = domain + '-' + language;
      if (self.storage !== null && catalog !== null) {
        self.storage.setItem(key, JSON.stringify(catalog));
        self.storage.setItem(key + '-updated', Date.now());
      }
    };

    self.getUrl = function(domain, language) {
      return self.baseUrl + '?domain=' + domain + '&language=' + language;
    };

    self.loadCatalog = function (domain, language) {
      if (language === undefined) {
        language = self.currentLanguage;
      }
      if (self.storage !== null) {
        var key = domain + '-' + language;
        if (key in self.storage) {
          if ((Date.now() - parseInt(self.storage.getItem(key + '-updated'), 10)) < self.ttl) {
            var catalog = JSON.parse(self.storage.getItem(key));
            self._setCatalog(domain, language, catalog);
            return;
          }
        }
      }
      if (!self.baseUrl) {
        return;
      }
      $.getJSON(self.getUrl(domain, language), function (catalog) {
        if (catalog === null) {
          return;
        }
        self._setCatalog(domain, language, catalog);
        self._storeCatalog(domain, language, catalog);
      });
    };

    self.MessageFactory = function (domain, language) {
      language = language || self.currentLanguage;
      return function translate (msgid, keywords) {
        var msgstr;
        if ((domain in self.catalogs) && (language in self.catalogs[domain]) && (msgid in self.catalogs[domain][language])) {
          msgstr = self.catalogs[domain][language][msgid];
        } else {
          msgstr = msgid;
        }
        if (keywords) {
          var regexp, keyword;
          for (keyword in keywords) {
            if (keywords.hasOwnProperty(keyword)) {
              regexp = new RegExp('\\$\\{' + keyword + '\\}', 'g');
              msgstr = msgstr.replace(regexp, keywords[keyword]);
            }
          }
        }
        return msgstr;
      };
    };
  };

  return I18N;
});

/* i18n integration.
 *
 * This is a singleton.
 * Configuration is done on the body tag data-i18ncatalogurl attribute
 *     <body data-i18ncatalogurl="/plonejsi18n">
 *
 *  Or, it'll default to "/plonejsi18n"
 */

define('translate',[
  'mockup-i18n'
], function(I18N) {
  'use strict';

  // we're creating a singleton here so we can potentially
  // delay the initialization of the translate catalog
  // until after the dom is available
  var _t = null;
  return function(msgid, keywords) {
    if (_t === null) {
      var i18n = new I18N();
      i18n.loadCatalog('widgets');
      _t = i18n.MessageFactory('widgets');
    }
    return _t(msgid, keywords);
  };
});

/* Formunloadalert pattern.
 *
 * Options:
 *    changingEvents(string): Events on which to check for changes (space-separated). ('change keyup paste')
 *    changingFields(string): Fields on which to check for changes (comma-separated). ('input,select,textarea,fileupload')
 *    message(string): Confirmation message to display when dirty form is being unloaded. (Discard changes? If you click OK, any changes you have made will be lost.)
 *
 * Documentation:
 *    # Example
 *
 *    {{ example-1 }}
 *
 * Example: example-1
 *    <form class="pat-formunloadalert" onsubmit="javascript:return false;">
 *      <input type="text" value="" />
 *      <select>
 *        <option value="1">value 1</option>
 *        <option value="2">value 2</option>
 *      </select>
 *      <input
 *        class="btn btn-large btn-primary"
 *        type="submit" value="Submit" />
 *      <br />
 *      <a href="/">Click here to go somewhere else</a>
 *    </form>
 *
 */


define('mockup-patterns-formunloadalert',[
  'jquery',
  'pat-base',
  'translate'
], function ($, Base, _t) {
  'use strict';

  var FormUnloadAlert = Base.extend({
    name: 'formunloadalert',
    trigger: '.pat-formunloadalert',
    parser: 'mockup',
    _changed : false,       // Stores a listing of raised changes by their key
    _suppressed : false,     // whether or not warning should be suppressed
    defaults: {
      message :  _t('Discard changes? If you click OK, ' +
                 'any changes you have made will be lost.'),
      // events on which to check for changes
      changingEvents: 'change keyup paste',
      // fields on which to check for changes
      changingFields: 'input,select,textarea,fileupload'
    },
    init: function () {
      var self = this;
      // if this is not a form just return
      if (!self.$el.is('form')) { return; }

      $(self.options.changingFields, self.$el).on(
        self.options.changingEvents,
        function (evt) {
          self._changed = true;
        }
      );

      var $modal = self.$el.parents('.plone-modal');
      if ($modal.size() !== 0) {
        $modal.data('patternPloneModal').on('hide', function(e) {
          var modal = $modal.data('patternPloneModal');
          if (modal) {
            modal._suppressHide = self._handleUnload.call(self, e);
          }
        });
      } else {
        $(window).on('beforeunload', function(e) {
          return self._handleUnload(e);
        });
      }

      self.$el.on('submit', function(e) {
        self._suppressed = true;
      });

    },
    _handleUnload : function (e) {
      var self = this;
      if (self._suppressed) {
        self._suppressed = false;
        return undefined;
      }
      if (self._changed) {
        var msg = self.options.message;
        self._handleMsg(e,msg);
        $(window).trigger('messageset');
        return msg;
      }
    },
    _handleMsg:  function(e,msg) {
      (e || window.event).returnValue = msg;
    }
  });
  return FormUnloadAlert;

});

/* Livesearch
 *
 * Options:
 *    ajaxUrl(string): JSON search url
 *    perPage(integer): results per page, defaults to 7
 *    quietMillis: how long to wait after type stops before sending out request in milliseconds. Defaults to 350
 *    minimumInputLength: miniumum number of letters before doing search. Defaults to 3
 *    inputSelector: css select to input element search is done with. Defaults to input[type="text"]
 *    itemTemplate: override template used to render item results
 *
 * Documentation:
 *   # General
 *
 *   # Default
 *
 *   {{ example-1 }}
 *
 * Example: example-1
 *    <form action="search" class="pat-livesearch" data-pat-livesearch="ajaxUrl:livesearch.json">
 *      <input type="text" />
 *    </form>
 *
 */

define('mockup-patterns-livesearch',[
  'jquery',
  'pat-base',
  'underscore',
  'translate'
], function ($, Base, _, _t) {
  'use strict';

  var Livesearch = Base.extend({
    name: 'livesearch',
    trigger: '.pat-livesearch',
    parser: 'mockup',
    timeout: null,
    active: false,
    results: null,
    selectedItem: -1,
    resultsClass: 'livesearch-results',
    defaults: {
      ajaxUrl: null,
      defaultSortOn: '',
      perPage: 7,
      quietMillis: 350,
      minimumInputLength: 4,
      inputSelector: 'input[type="text"]',
      itemTemplate: '<li class="search-result <%- state %>">' +
        '<h4 class="title"><a href="<%- url %>"><%- title %></a></h4>' +
        '<p class="description"><%- description %></p>' +
      '</li>',
    },
    doSearch: function(page){
      var self = this;
      self.active = true;
      self.render();
      self.$el.addClass('searching');
      var query = self.$el.serialize();
      if(page === undefined){
        page = 1;
      }
      var sort_on = function(){
        var parameters = location.search,
            sorton_position = parameters.indexOf('sort_on');
        if(sorton_position === -1){
          // return default sort
          var $searchResults = $('#search-results');
          if($searchResults.length > 0){
            return $searchResults.attr('data-default-sort');
          }
          return self.options.defaultSortOn;
        }
        // cut string before sort_on parameter
        var sort_on = parameters.substring(sorton_position);
        // cut other parameters
        sort_on = sort_on.split('&')[0];
        // get just the value
        sort_on = sort_on.split('=')[1];
        return sort_on;
      }();

      $.ajax({
        url: self.options.ajaxUrl + '?' + query +
             '&page=' + page +
             '&perPage=' + self.options.perPage +
             '&sort_on=' + sort_on,
        dataType: 'json'
      }).done(function(data){
        self.results = data;
        self.page = page;
        // maybe odd here.. but we're checking to see if the user
        // has typed while a search was being performed. Perhap another search if so
        if(query !== self.$el.serialize()){
          self.doSearch();
        }
      }).fail(function(){
        self.results = {
          items: [{
            url: '',
            title: _t('Error'),
            description: _t('There was an error searching…'),
            state: 'error',
            error: false
          }],
          total: 1
        };
        self.page = 1;
      }).always(function(){
        self.active = false;
        self.selectedItem = -1;
        self.$el.removeClass('searching');
        self.render();
      });
    },
    render: function(){
      var self = this;
      self.$results.empty();

      /* find a status message */

      if(self.active){
        self.$results.append($('<li class="searching">' + _t('searching…') + '</li>'));
      }else if(self.results === null){
        // no results gathered yet
        self.$results.append($('<li class="no-results no-search">' + _t('enter search phrase') + '</li>'));
      } else if(self.results.total === 0){
        self.$results.append($('<li class="no-results">' + _t('no results found') + '</li>'));
      } else{
        self.$results.append($('<li class="results-summary">' + _t('found') +
                               ' ' + self.results.total + ' ' + _t('results') + '</li>'));
      }

      if(self.results !== null){
        var template = _.template(self.options.itemTemplate);
        _.each(self.results.items, function(item, index){
          var $el = $(template($.extend({_t: _t}, item)));
          $el.attr('data-url', item.url).on('click', function(){
            if(!item.error){
              window.location = item.url;
            }
          });
          if(index === self.selectedItem){
            $el.addClass('selected');
          }
          self.$results.append($el);
        });
        var nav = [];
        if(self.page > 1){
          var $prev = $('<a href="#" class="prev">' + _t('Previous') + '</a>');
          $prev.click(function(e){
            self.disableHiding = true;
            e.preventDefault();
            self.doSearch(self.page - 1);
          });
          nav.push($prev);
        }
        if((self.page * self.options.perPage) < self.results.total){
          var $next = $('<a href="#" class="next">' + _t('Next') + '</a>');
          $next.click(function(e){
            self.disableHiding = true;
            e.preventDefault();
            self.doSearch(self.page + 1);
          });
          nav.push($next);
        }
        if(nav.length > 0){
          var $li = $('<li class="load-more"><div class="page">' + self.page + '</div></li>');
          $li.prepend(nav);
          self.$results.append($li);
        }
      }
      self.position();
    },
    position: function(){
      /* we are positioning directly below the
         input box, same width */
      var self = this;

      self.$el.addClass('livesearch-active');
      var pos = self.$input.position();
      self.$results.width(self.$el.outerWidth());
      self.$results.css({
        top: pos.top + self.$input.outerHeight(),
        left: pos.left
      });
      self.$results.show();
    },
    hide: function(){
      this.$results.hide();
      this.$el.removeClass('livesearch-active');
    },
    init: function(){
      var self = this;

      self.$input = self.$el.find(self.options.inputSelector);
      self.$input.off('focusout').on('focusout', function(){
        /* we put this in a timer so click events still
           get trigger on search results */
        setTimeout(function(){
          /* hack, look above, to handle dealing with clicks
             unfocusing element */
          if(!self.disableHiding){
            self.hide();
          }else{
            self.disableHiding = false;
            // and refocus elemtn
            self.$input.focus();
          }
        }, 200);
      }).off('focusin').on('focusin', function(){
        if(!self.onceFocused){
          /* Case: field already filled out but no reasons
             present yet, do ajax search and grab some results */
          self.onceFocused = true;
          if(self.$input.val().length >= self.options.minimumInputLength){
            self.doSearch();
          }
        } else if(!self.$results.is(':visible')){
          self.render();
        }
      }).attr('autocomplete', 'off').off('keyup').on('keyup', function(e){
        var code = e.keyCode || e.which;
        // first off, we're capturing esc presses
        if(code === 27){
          self.$input.val('');
          self.hide();
          return;
        }
        // then, we're capturing up, down and enter key presses
        if(self.results && self.results.items && self.results.items.length > 0){
          if(code === 13){
            /* enter key, check to see if there is a selected item */
            if(self.selectedItem !== -1){
              window.location = self.results.items[self.selectedItem].url;
            }
            return;
          } else if(code === 38){
            /* up key */
            if(self.selectedItem !== -1){
              self.selectedItem -= 1;
              self.render();
            }
            return;
          } else if(code === 40){
            /* down key */
            if(self.selectedItem < self.results.items.length){
              self.selectedItem += 1;
              self.render();
            }
            return;
          }
        }

        /* then, we handle timeouts for doing ajax search */
        if(self.timeout !== null){
          clearTimeout(self.timeout);
          self.timeout = null;
        }
        if(self.active){
          return;
        }
        if(self.$input.val().length >= self.options.minimumInputLength){
          self.timeout = setTimeout(function(){
            self.doSearch();
          }, self.options.quietMillis);
        }else{
          self.results = null;
          self.render();
        }
      });
      $('#sorting-options a').click(function(e){
        e.preventDefault();
        self.onceFocused = false;
      });

      /* create result dom */
      self.$results = $('<ul class="' + self.resultsClass + '"></ul>').hide().insertAfter(self.$input);
    }
  });

  return Livesearch;
});

/* Mark special links
 *
 * Options:
 *    external_links_open_new_window(boolean): Open external links in a new window. (false)
 *    mark_special_links(boolean): Marks external or special protocl links with class. (true)
 *
 * Documentation:
 *   # General
 *
 *   Scan all links in the container and mark external links with class
 *   if they point outside the site, or are special protocols.
 *   Also implements new window opening for external links.
 *   To disable this effect for links on a one-by-one-basis,
 *   give them a class of 'link-plain'
 *
 *   # Default external link example
 *
 *   {{ example-1 }}
 *
 *   # Open external link in new window
 *
 *   {{ example-2 }}
 *
 *   # Open external link in new window, without icons
 *
 *   {{ example-3 }}
 *
 *   # List of all protocol icons
 *
 *   {{ example-4 }}
 *
 * Example: example-1
 *    <div class="pat-markspeciallinks">
 *      <ul>
 *        <li>Find out What's new in <a href="http://www.plone.org">Plone</a>.</li>
 *        <li>Plone is written in <a class="link-plain" href="http://www.python.org">Python</a>.</li>
 *        <li>Plone builds on <a href="http://zope.org">Zope</a>.</li>
 *        <li>Plone uses <a href="/">Mockup</a>.</li>
 *      </ul>
 *    </div>
 *
 * Example: example-2
 *    <div class="pat-markspeciallinks" data-pat-markspeciallinks='{"external_links_open_new_window": "true"}'>
 *      <ul>
 *        <li>Find out What's new in <a href="http://www.plone.org">Plone</a>.</li>
 *        <li>Plone is written in <a class="link-plain" href="http://www.python.org">Python</a>.</li>
 *        <li>Plone builds on <a href="http://zope.org">Zope</a>.</li>
 *        <li>Plone uses <a href="/">Mockup</a>.</li>
 *      </ul>
 *    </div>
 *
 * Example: example-3
 *    <div class="pat-markspeciallinks" data-pat-markspeciallinks='{"external_links_open_new_window": "true", "mark_special_links": "false"}'>
 *      <ul>
 *        <li>Find out What's new in <a href="http://www.plone.org">Plone</a>.</li>
 *        <li>Plone is written in <a class="link-plain" href="http://www.python.org">Python</a>.</li>
 *        <li>Plone builds on <a href="http://zope.org">Zope</a>.</li>
 *        <li>Plone uses <a href="/">Mockup</a>.</li>
 *      </ul>
 *    </div>
 *
 * Example: example-4
 *    <div class="pat-markspeciallinks">
 *        <ul>
 *          <li><a href="http://www.plone.org">http</a></li>
 *          <li><a href="https://www.plone.org">https</a></li>
 *          <li><a href="mailto:info@plone.org">mailto</a></li>
 *          <li><a href="ftp://www.plone.org">ftp</a></li>
 *          <li><a href="news://www.plone.org">news</a></li>
 *          <li><a href="irc://www.plone.org">irc</a></li>
 *          <li><a href="h323://www.plone.org">h323</a></li>
 *          <li><a href="sip://www.plone.org">sip</a></li>
 *          <li><a href="callto://www.plone.org">callto</a></li>
 *          <li><a href="feed://www.plone.org">feed</a></li>
 *          <li><a href="webcal://www.plone.org">webcal</a></li>
 *        </ul>
 *    </div>
 *
 */

define('mockup-patterns-markspeciallinks',[
  'pat-base',
  'jquery'
], function (Base, $) {
  'use strict';

  var MarkSpecialLinks = Base.extend({
    name: 'markspeciallinks',
    trigger: '.pat-markspeciallinks',
    parser: 'mockup',
    defaults: {
      external_links_open_new_window: false,
      mark_special_links: true
    },
    init: function () {
      var self = this, $el = self.$el;

      // first make external links open in a new window, afterwards do the
      // normal plone link wrapping in only the content area
      var elonw,
          msl,
          url,
          protocols,
          contentarea,
          res;

      if (typeof self.options.external_links_open_new_window === 'string') {
          elonw = self.options.external_links_open_new_window.toLowerCase() === 'true';
      } else if (typeof self.options.external_links_open_new_window === 'boolean') {
          elonw = self.options.external_links_open_new_window;
      }

      if (typeof self.options.mark_special_links === 'string') {
          msl = self.options.mark_special_links.toLowerCase() === 'true';
      } else if (typeof self.options.mark_special_links === 'boolean') {
          msl = self.options.mark_special_links;
      }

      url = window.location.protocol + '//' + window.location.host;
      protocols = /^(mailto|ftp|news|irc|h323|sip|callto|https|feed|webcal)/;
      contentarea = $el;

      if (elonw) {
          // all http links (without the link-plain class), not within this site
          contentarea.find('a[href^="http"]:not(.link-plain):not([href^="' + url + '"])')
                     .attr('target', '_blank')
                     .attr('rel', 'noopener');
      }

      if (msl) {
        // All links with an http href (without the link-plain class), not within this site,
        // and no img children should be wrapped in a link-external span
        contentarea.find(
            'a[href^="http:"]:not(.link-plain):not([href^="' + url + '"]):not(:has(img))')
            .before('<i class="glyphicon link-external"></i>');
        // All links without an http href (without the link-plain class), not within this site,
        // and no img children should be wrapped in a link-[protocol] span
        contentarea.find(
            'a[href]:not([href^="http:"]):not(.link-plain):not([href^="' + url + '"]):not(:has(img)):not([href^="#"])')
            .each(function() {
                // those without a http link may have another interesting protocol
                // wrap these in a link-[protocol] span
                res = protocols.exec($(this).attr('href'));
                if (res) {
                    var iconclass = 'glyphicon link-' + res[0];
                    $(this).before('<i class="' + iconclass + '"></i>');
                }
            }
        );
      }
    }
  });
  return MarkSpecialLinks;
});

/* Backdrop pattern.
 *
 * Options:
 *    zIndex(integer): z-index of backdrop element. (null)
 *    opacity(float): opacity level of backdrop element. (0.8)
 *    className(string): class name of backdrop element. ('backdrop')
 *    classActiveName(string): class name when backdrop is active. ('backdrop-active')
 *    closeOnEsc(boolean): should backdrop close when ESC key is pressed. (true)
 *    closeOnClick(boolean): should backdrop close when clicked on it. (true)
 *
 * Documentation:
 *    # TODO: we need example or this is not pattern :)
 *
 * Example: example-1
 *
 */


define('mockup-patterns-backdrop',[
  'jquery',
  'pat-base'
], function($, Base) {
  'use strict';

  var Backdrop = Base.extend({
    name: 'backdrop',
    trigger: '.pat-backdrop',
    parser: 'mockup',
    defaults: {
      zIndex: null,
      opacity: 0.8,
      className: 'plone-backdrop',
      classActiveName: 'plone-backdrop-active',
      closeOnEsc: true,
      closeOnClick: true
    },
    init: function() {
      var self = this;
      self.$backdrop = $('> .' + self.options.className, self.$el);
      if (self.$backdrop.size() === 0) {
        self.$backdrop = $('<div/>')
            .hide()
            .appendTo(self.$el)
            .addClass(self.options.className);
        if (self.options.zIndex !== null) {
          self.$backdrop.css('z-index', self.options.zIndex);
        }
      }
      if (self.options.closeOnEsc === true) {
        $(document).on('keydown', function(e, data) {
          if (self.$el.is('.' + self.options.classActiveName)) {
            if (e.keyCode === 27) {  // ESC key pressed
              self.hide();
            }
          }
        });
      }
      if (self.options.closeOnClick === true) {
        self.$backdrop.on('click', function() {
          if (self.$el.is('.' + self.options.classActiveName)) {
            self.hide();
          }
        });
      }
    },
    show: function() {
      var self = this;
      if (!self.$el.hasClass(self.options.classActiveName)) {
        self.emit('show');
        self.$backdrop.css('opacity', '0').show();
        self.$el.addClass(self.options.classActiveName);
        self.$backdrop.animate({ opacity: self.options.opacity }, 500);
        self.emit('shown');
      }
    },
    hide: function() {
      var self = this;
      if (self.$el.hasClass(self.options.classActiveName)) {
        self.emit('hide');
        self.$backdrop.animate({ opacity: '0' }, 500).hide();
        self.$el.removeClass(self.options.classActiveName);
        self.emit('hidden');
      }
    }
  });

  return Backdrop;

});

//     Backbone.js 1.1.2

//     (c) 2010-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Backbone may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://backbonejs.org

(function(root, factory) {

  // Set up Backbone appropriately for the environment. Start with AMD.
  if (typeof define === 'function' && define.amd) {
    define('backbone',['underscore', 'jquery', 'exports'], function(_, $, exports) {
      // Export global even in AMD case in case this script is loaded with
      // others that may still expect a global Backbone.
      root.Backbone = factory(root, exports, _, $);
    });

  // Next for Node.js or CommonJS. jQuery may not be needed as a module.
  } else if (typeof exports !== 'undefined') {
    var _ = require('underscore');
    factory(root, exports, _);

  // Finally, as a browser global.
  } else {
    root.Backbone = factory(root, {}, root._, (root.jQuery || root.Zepto || root.ender || root.$));
  }

}(this, function(root, Backbone, _, $) {

  // Initial Setup
  // -------------

  // Save the previous value of the `Backbone` variable, so that it can be
  // restored later on, if `noConflict` is used.
  var previousBackbone = root.Backbone;

  // Create local references to array methods we'll want to use later.
  var array = [];
  var push = array.push;
  var slice = array.slice;
  var splice = array.splice;

  // Current version of the library. Keep in sync with `package.json`.
  Backbone.VERSION = '1.1.2';

  // For Backbone's purposes, jQuery, Zepto, Ender, or My Library (kidding) owns
  // the `$` variable.
  Backbone.$ = $;

  // Runs Backbone.js in *noConflict* mode, returning the `Backbone` variable
  // to its previous owner. Returns a reference to this Backbone object.
  Backbone.noConflict = function() {
    root.Backbone = previousBackbone;
    return this;
  };

  // Turn on `emulateHTTP` to support legacy HTTP servers. Setting this option
  // will fake `"PATCH"`, `"PUT"` and `"DELETE"` requests via the `_method` parameter and
  // set a `X-Http-Method-Override` header.
  Backbone.emulateHTTP = false;

  // Turn on `emulateJSON` to support legacy servers that can't deal with direct
  // `application/json` requests ... will encode the body as
  // `application/x-www-form-urlencoded` instead and will send the model in a
  // form param named `model`.
  Backbone.emulateJSON = false;

  // Backbone.Events
  // ---------------

  // A module that can be mixed in to *any object* in order to provide it with
  // custom events. You may bind with `on` or remove with `off` callback
  // functions to an event; `trigger`-ing an event fires all callbacks in
  // succession.
  //
  //     var object = {};
  //     _.extend(object, Backbone.Events);
  //     object.on('expand', function(){ alert('expanded'); });
  //     object.trigger('expand');
  //
  var Events = Backbone.Events = {

    // Bind an event to a `callback` function. Passing `"all"` will bind
    // the callback to all events fired.
    on: function(name, callback, context) {
      if (!eventsApi(this, 'on', name, [callback, context]) || !callback) return this;
      this._events || (this._events = {});
      var events = this._events[name] || (this._events[name] = []);
      events.push({callback: callback, context: context, ctx: context || this});
      return this;
    },

    // Bind an event to only be triggered a single time. After the first time
    // the callback is invoked, it will be removed.
    once: function(name, callback, context) {
      if (!eventsApi(this, 'once', name, [callback, context]) || !callback) return this;
      var self = this;
      var once = _.once(function() {
        self.off(name, once);
        callback.apply(this, arguments);
      });
      once._callback = callback;
      return this.on(name, once, context);
    },

    // Remove one or many callbacks. If `context` is null, removes all
    // callbacks with that function. If `callback` is null, removes all
    // callbacks for the event. If `name` is null, removes all bound
    // callbacks for all events.
    off: function(name, callback, context) {
      var retain, ev, events, names, i, l, j, k;
      if (!this._events || !eventsApi(this, 'off', name, [callback, context])) return this;
      if (!name && !callback && !context) {
        this._events = void 0;
        return this;
      }
      names = name ? [name] : _.keys(this._events);
      for (i = 0, l = names.length; i < l; i++) {
        name = names[i];
        if (events = this._events[name]) {
          this._events[name] = retain = [];
          if (callback || context) {
            for (j = 0, k = events.length; j < k; j++) {
              ev = events[j];
              if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
                  (context && context !== ev.context)) {
                retain.push(ev);
              }
            }
          }
          if (!retain.length) delete this._events[name];
        }
      }

      return this;
    },

    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    trigger: function(name) {
      if (!this._events) return this;
      var args = slice.call(arguments, 1);
      if (!eventsApi(this, 'trigger', name, args)) return this;
      var events = this._events[name];
      var allEvents = this._events.all;
      if (events) triggerEvents(events, args);
      if (allEvents) triggerEvents(allEvents, arguments);
      return this;
    },

    // Tell this object to stop listening to either specific events ... or
    // to every object it's currently listening to.
    stopListening: function(obj, name, callback) {
      var listeningTo = this._listeningTo;
      if (!listeningTo) return this;
      var remove = !name && !callback;
      if (!callback && typeof name === 'object') callback = this;
      if (obj) (listeningTo = {})[obj._listenId] = obj;
      for (var id in listeningTo) {
        obj = listeningTo[id];
        obj.off(name, callback, this);
        if (remove || _.isEmpty(obj._events)) delete this._listeningTo[id];
      }
      return this;
    }

  };

  // Regular expression used to split event strings.
  var eventSplitter = /\s+/;

  // Implement fancy features of the Events API such as multiple event
  // names `"change blur"` and jQuery-style event maps `{change: action}`
  // in terms of the existing API.
  var eventsApi = function(obj, action, name, rest) {
    if (!name) return true;

    // Handle event maps.
    if (typeof name === 'object') {
      for (var key in name) {
        obj[action].apply(obj, [key, name[key]].concat(rest));
      }
      return false;
    }

    // Handle space separated event names.
    if (eventSplitter.test(name)) {
      var names = name.split(eventSplitter);
      for (var i = 0, l = names.length; i < l; i++) {
        obj[action].apply(obj, [names[i]].concat(rest));
      }
      return false;
    }

    return true;
  };

  // A difficult-to-believe, but optimized internal dispatch function for
  // triggering events. Tries to keep the usual cases speedy (most internal
  // Backbone events have 3 arguments).
  var triggerEvents = function(events, args) {
    var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
    switch (args.length) {
      case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
      case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
      case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
      case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
      default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args); return;
    }
  };

  var listenMethods = {listenTo: 'on', listenToOnce: 'once'};

  // Inversion-of-control versions of `on` and `once`. Tell *this* object to
  // listen to an event in another object ... keeping track of what it's
  // listening to.
  _.each(listenMethods, function(implementation, method) {
    Events[method] = function(obj, name, callback) {
      var listeningTo = this._listeningTo || (this._listeningTo = {});
      var id = obj._listenId || (obj._listenId = _.uniqueId('l'));
      listeningTo[id] = obj;
      if (!callback && typeof name === 'object') callback = this;
      obj[implementation](name, callback, this);
      return this;
    };
  });

  // Aliases for backwards compatibility.
  Events.bind   = Events.on;
  Events.unbind = Events.off;

  // Allow the `Backbone` object to serve as a global event bus, for folks who
  // want global "pubsub" in a convenient place.
  _.extend(Backbone, Events);

  // Backbone.Model
  // --------------

  // Backbone **Models** are the basic data object in the framework --
  // frequently representing a row in a table in a database on your server.
  // A discrete chunk of data and a bunch of useful, related methods for
  // performing computations and transformations on that data.

  // Create a new model with the specified attributes. A client id (`cid`)
  // is automatically generated and assigned for you.
  var Model = Backbone.Model = function(attributes, options) {
    var attrs = attributes || {};
    options || (options = {});
    this.cid = _.uniqueId('c');
    this.attributes = {};
    if (options.collection) this.collection = options.collection;
    if (options.parse) attrs = this.parse(attrs, options) || {};
    attrs = _.defaults({}, attrs, _.result(this, 'defaults'));
    this.set(attrs, options);
    this.changed = {};
    this.initialize.apply(this, arguments);
  };

  // Attach all inheritable methods to the Model prototype.
  _.extend(Model.prototype, Events, {

    // A hash of attributes whose current and previous value differ.
    changed: null,

    // The value returned during the last failed validation.
    validationError: null,

    // The default name for the JSON `id` attribute is `"id"`. MongoDB and
    // CouchDB users may want to set this to `"_id"`.
    idAttribute: 'id',

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Return a copy of the model's `attributes` object.
    toJSON: function(options) {
      return _.clone(this.attributes);
    },

    // Proxy `Backbone.sync` by default -- but override this if you need
    // custom syncing semantics for *this* particular model.
    sync: function() {
      return Backbone.sync.apply(this, arguments);
    },

    // Get the value of an attribute.
    get: function(attr) {
      return this.attributes[attr];
    },

    // Get the HTML-escaped value of an attribute.
    escape: function(attr) {
      return _.escape(this.get(attr));
    },

    // Returns `true` if the attribute contains a value that is not null
    // or undefined.
    has: function(attr) {
      return this.get(attr) != null;
    },

    // Set a hash of model attributes on the object, firing `"change"`. This is
    // the core primitive operation of a model, updating the data and notifying
    // anyone who needs to know about the change in state. The heart of the beast.
    set: function(key, val, options) {
      var attr, attrs, unset, changes, silent, changing, prev, current;
      if (key == null) return this;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      options || (options = {});

      // Run validation.
      if (!this._validate(attrs, options)) return false;

      // Extract attributes and options.
      unset           = options.unset;
      silent          = options.silent;
      changes         = [];
      changing        = this._changing;
      this._changing  = true;

      if (!changing) {
        this._previousAttributes = _.clone(this.attributes);
        this.changed = {};
      }
      current = this.attributes, prev = this._previousAttributes;

      // Check for changes of `id`.
      if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

      // For each `set` attribute, update or delete the current value.
      for (attr in attrs) {
        val = attrs[attr];
        if (!_.isEqual(current[attr], val)) changes.push(attr);
        if (!_.isEqual(prev[attr], val)) {
          this.changed[attr] = val;
        } else {
          delete this.changed[attr];
        }
        unset ? delete current[attr] : current[attr] = val;
      }

      // Trigger all relevant attribute changes.
      if (!silent) {
        if (changes.length) this._pending = options;
        for (var i = 0, l = changes.length; i < l; i++) {
          this.trigger('change:' + changes[i], this, current[changes[i]], options);
        }
      }

      // You might be wondering why there's a `while` loop here. Changes can
      // be recursively nested within `"change"` events.
      if (changing) return this;
      if (!silent) {
        while (this._pending) {
          options = this._pending;
          this._pending = false;
          this.trigger('change', this, options);
        }
      }
      this._pending = false;
      this._changing = false;
      return this;
    },

    // Remove an attribute from the model, firing `"change"`. `unset` is a noop
    // if the attribute doesn't exist.
    unset: function(attr, options) {
      return this.set(attr, void 0, _.extend({}, options, {unset: true}));
    },

    // Clear all attributes on the model, firing `"change"`.
    clear: function(options) {
      var attrs = {};
      for (var key in this.attributes) attrs[key] = void 0;
      return this.set(attrs, _.extend({}, options, {unset: true}));
    },

    // Determine if the model has changed since the last `"change"` event.
    // If you specify an attribute name, determine if that attribute has changed.
    hasChanged: function(attr) {
      if (attr == null) return !_.isEmpty(this.changed);
      return _.has(this.changed, attr);
    },

    // Return an object containing all the attributes that have changed, or
    // false if there are no changed attributes. Useful for determining what
    // parts of a view need to be updated and/or what attributes need to be
    // persisted to the server. Unset attributes will be set to undefined.
    // You can also pass an attributes object to diff against the model,
    // determining if there *would be* a change.
    changedAttributes: function(diff) {
      if (!diff) return this.hasChanged() ? _.clone(this.changed) : false;
      var val, changed = false;
      var old = this._changing ? this._previousAttributes : this.attributes;
      for (var attr in diff) {
        if (_.isEqual(old[attr], (val = diff[attr]))) continue;
        (changed || (changed = {}))[attr] = val;
      }
      return changed;
    },

    // Get the previous value of an attribute, recorded at the time the last
    // `"change"` event was fired.
    previous: function(attr) {
      if (attr == null || !this._previousAttributes) return null;
      return this._previousAttributes[attr];
    },

    // Get all of the attributes of the model at the time of the previous
    // `"change"` event.
    previousAttributes: function() {
      return _.clone(this._previousAttributes);
    },

    // Fetch the model from the server. If the server's representation of the
    // model differs from its current attributes, they will be overridden,
    // triggering a `"change"` event.
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      if (options.parse === void 0) options.parse = true;
      var model = this;
      var success = options.success;
      options.success = function(resp) {
        if (!model.set(model.parse(resp, options), options)) return false;
        if (success) success(model, resp, options);
        model.trigger('sync', model, resp, options);
      };
      wrapError(this, options);
      return this.sync('read', this, options);
    },

    // Set a hash of model attributes, and sync the model to the server.
    // If the server returns an attributes hash that differs, the model's
    // state will be `set` again.
    save: function(key, val, options) {
      var attrs, method, xhr, attributes = this.attributes;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (key == null || typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      options = _.extend({validate: true}, options);

      // If we're not waiting and attributes exist, save acts as
      // `set(attr).save(null, opts)` with validation. Otherwise, check if
      // the model will be valid when the attributes, if any, are set.
      if (attrs && !options.wait) {
        if (!this.set(attrs, options)) return false;
      } else {
        if (!this._validate(attrs, options)) return false;
      }

      // Set temporary attributes if `{wait: true}`.
      if (attrs && options.wait) {
        this.attributes = _.extend({}, attributes, attrs);
      }

      // After a successful server-side save, the client is (optionally)
      // updated with the server-side state.
      if (options.parse === void 0) options.parse = true;
      var model = this;
      var success = options.success;
      options.success = function(resp) {
        // Ensure attributes are restored during synchronous saves.
        model.attributes = attributes;
        var serverAttrs = model.parse(resp, options);
        if (options.wait) serverAttrs = _.extend(attrs || {}, serverAttrs);
        if (_.isObject(serverAttrs) && !model.set(serverAttrs, options)) {
          return false;
        }
        if (success) success(model, resp, options);
        model.trigger('sync', model, resp, options);
      };
      wrapError(this, options);

      method = this.isNew() ? 'create' : (options.patch ? 'patch' : 'update');
      if (method === 'patch') options.attrs = attrs;
      xhr = this.sync(method, this, options);

      // Restore attributes.
      if (attrs && options.wait) this.attributes = attributes;

      return xhr;
    },

    // Destroy this model on the server if it was already persisted.
    // Optimistically removes the model from its collection, if it has one.
    // If `wait: true` is passed, waits for the server to respond before removal.
    destroy: function(options) {
      options = options ? _.clone(options) : {};
      var model = this;
      var success = options.success;

      var destroy = function() {
        model.trigger('destroy', model, model.collection, options);
      };

      options.success = function(resp) {
        if (options.wait || model.isNew()) destroy();
        if (success) success(model, resp, options);
        if (!model.isNew()) model.trigger('sync', model, resp, options);
      };

      if (this.isNew()) {
        options.success();
        return false;
      }
      wrapError(this, options);

      var xhr = this.sync('delete', this, options);
      if (!options.wait) destroy();
      return xhr;
    },

    // Default URL for the model's representation on the server -- if you're
    // using Backbone's restful methods, override this to change the endpoint
    // that will be called.
    url: function() {
      var base =
        _.result(this, 'urlRoot') ||
        _.result(this.collection, 'url') ||
        urlError();
      if (this.isNew()) return base;
      return base.replace(/([^\/])$/, '$1/') + encodeURIComponent(this.id);
    },

    // **parse** converts a response into the hash of attributes to be `set` on
    // the model. The default implementation is just to pass the response along.
    parse: function(resp, options) {
      return resp;
    },

    // Create a new model with identical attributes to this one.
    clone: function() {
      return new this.constructor(this.attributes);
    },

    // A model is new if it has never been saved to the server, and lacks an id.
    isNew: function() {
      return !this.has(this.idAttribute);
    },

    // Check if the model is currently in a valid state.
    isValid: function(options) {
      return this._validate({}, _.extend(options || {}, { validate: true }));
    },

    // Run validation against the next complete set of model attributes,
    // returning `true` if all is well. Otherwise, fire an `"invalid"` event.
    _validate: function(attrs, options) {
      if (!options.validate || !this.validate) return true;
      attrs = _.extend({}, this.attributes, attrs);
      var error = this.validationError = this.validate(attrs, options) || null;
      if (!error) return true;
      this.trigger('invalid', this, error, _.extend(options, {validationError: error}));
      return false;
    }

  });

  // Underscore methods that we want to implement on the Model.
  var modelMethods = ['keys', 'values', 'pairs', 'invert', 'pick', 'omit'];

  // Mix in each Underscore method as a proxy to `Model#attributes`.
  _.each(modelMethods, function(method) {
    Model.prototype[method] = function() {
      var args = slice.call(arguments);
      args.unshift(this.attributes);
      return _[method].apply(_, args);
    };
  });

  // Backbone.Collection
  // -------------------

  // If models tend to represent a single row of data, a Backbone Collection is
  // more analagous to a table full of data ... or a small slice or page of that
  // table, or a collection of rows that belong together for a particular reason
  // -- all of the messages in this particular folder, all of the documents
  // belonging to this particular author, and so on. Collections maintain
  // indexes of their models, both in order, and for lookup by `id`.

  // Create a new **Collection**, perhaps to contain a specific type of `model`.
  // If a `comparator` is specified, the Collection will maintain
  // its models in sort order, as they're added and removed.
  var Collection = Backbone.Collection = function(models, options) {
    options || (options = {});
    if (options.model) this.model = options.model;
    if (options.comparator !== void 0) this.comparator = options.comparator;
    this._reset();
    this.initialize.apply(this, arguments);
    if (models) this.reset(models, _.extend({silent: true}, options));
  };

  // Default options for `Collection#set`.
  var setOptions = {add: true, remove: true, merge: true};
  var addOptions = {add: true, remove: false};

  // Define the Collection's inheritable methods.
  _.extend(Collection.prototype, Events, {

    // The default model for a collection is just a **Backbone.Model**.
    // This should be overridden in most cases.
    model: Model,

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // The JSON representation of a Collection is an array of the
    // models' attributes.
    toJSON: function(options) {
      return this.map(function(model){ return model.toJSON(options); });
    },

    // Proxy `Backbone.sync` by default.
    sync: function() {
      return Backbone.sync.apply(this, arguments);
    },

    // Add a model, or list of models to the set.
    add: function(models, options) {
      return this.set(models, _.extend({merge: false}, options, addOptions));
    },

    // Remove a model, or a list of models from the set.
    remove: function(models, options) {
      var singular = !_.isArray(models);
      models = singular ? [models] : _.clone(models);
      options || (options = {});
      var i, l, index, model;
      for (i = 0, l = models.length; i < l; i++) {
        model = models[i] = this.get(models[i]);
        if (!model) continue;
        delete this._byId[model.id];
        delete this._byId[model.cid];
        index = this.indexOf(model);
        this.models.splice(index, 1);
        this.length--;
        if (!options.silent) {
          options.index = index;
          model.trigger('remove', model, this, options);
        }
        this._removeReference(model, options);
      }
      return singular ? models[0] : models;
    },

    // Update a collection by `set`-ing a new list of models, adding new ones,
    // removing models that are no longer present, and merging models that
    // already exist in the collection, as necessary. Similar to **Model#set**,
    // the core operation for updating the data contained by the collection.
    set: function(models, options) {
      options = _.defaults({}, options, setOptions);
      if (options.parse) models = this.parse(models, options);
      var singular = !_.isArray(models);
      models = singular ? (models ? [models] : []) : _.clone(models);
      var i, l, id, model, attrs, existing, sort;
      var at = options.at;
      var targetModel = this.model;
      var sortable = this.comparator && (at == null) && options.sort !== false;
      var sortAttr = _.isString(this.comparator) ? this.comparator : null;
      var toAdd = [], toRemove = [], modelMap = {};
      var add = options.add, merge = options.merge, remove = options.remove;
      var order = !sortable && add && remove ? [] : false;

      // Turn bare objects into model references, and prevent invalid models
      // from being added.
      for (i = 0, l = models.length; i < l; i++) {
        attrs = models[i] || {};
        if (attrs instanceof Model) {
          id = model = attrs;
        } else {
          id = attrs[targetModel.prototype.idAttribute || 'id'];
        }

        // If a duplicate is found, prevent it from being added and
        // optionally merge it into the existing model.
        if (existing = this.get(id)) {
          if (remove) modelMap[existing.cid] = true;
          if (merge) {
            attrs = attrs === model ? model.attributes : attrs;
            if (options.parse) attrs = existing.parse(attrs, options);
            existing.set(attrs, options);
            if (sortable && !sort && existing.hasChanged(sortAttr)) sort = true;
          }
          models[i] = existing;

        // If this is a new, valid model, push it to the `toAdd` list.
        } else if (add) {
          model = models[i] = this._prepareModel(attrs, options);
          if (!model) continue;
          toAdd.push(model);
          this._addReference(model, options);
        }

        // Do not add multiple models with the same `id`.
        model = existing || model;
        if (order && (model.isNew() || !modelMap[model.id])) order.push(model);
        modelMap[model.id] = true;
      }

      // Remove nonexistent models if appropriate.
      if (remove) {
        for (i = 0, l = this.length; i < l; ++i) {
          if (!modelMap[(model = this.models[i]).cid]) toRemove.push(model);
        }
        if (toRemove.length) this.remove(toRemove, options);
      }

      // See if sorting is needed, update `length` and splice in new models.
      if (toAdd.length || (order && order.length)) {
        if (sortable) sort = true;
        this.length += toAdd.length;
        if (at != null) {
          for (i = 0, l = toAdd.length; i < l; i++) {
            this.models.splice(at + i, 0, toAdd[i]);
          }
        } else {
          if (order) this.models.length = 0;
          var orderedModels = order || toAdd;
          for (i = 0, l = orderedModels.length; i < l; i++) {
            this.models.push(orderedModels[i]);
          }
        }
      }

      // Silently sort the collection if appropriate.
      if (sort) this.sort({silent: true});

      // Unless silenced, it's time to fire all appropriate add/sort events.
      if (!options.silent) {
        for (i = 0, l = toAdd.length; i < l; i++) {
          (model = toAdd[i]).trigger('add', model, this, options);
        }
        if (sort || (order && order.length)) this.trigger('sort', this, options);
      }

      // Return the added (or merged) model (or models).
      return singular ? models[0] : models;
    },

    // When you have more items than you want to add or remove individually,
    // you can reset the entire set with a new list of models, without firing
    // any granular `add` or `remove` events. Fires `reset` when finished.
    // Useful for bulk operations and optimizations.
    reset: function(models, options) {
      options || (options = {});
      for (var i = 0, l = this.models.length; i < l; i++) {
        this._removeReference(this.models[i], options);
      }
      options.previousModels = this.models;
      this._reset();
      models = this.add(models, _.extend({silent: true}, options));
      if (!options.silent) this.trigger('reset', this, options);
      return models;
    },

    // Add a model to the end of the collection.
    push: function(model, options) {
      return this.add(model, _.extend({at: this.length}, options));
    },

    // Remove a model from the end of the collection.
    pop: function(options) {
      var model = this.at(this.length - 1);
      this.remove(model, options);
      return model;
    },

    // Add a model to the beginning of the collection.
    unshift: function(model, options) {
      return this.add(model, _.extend({at: 0}, options));
    },

    // Remove a model from the beginning of the collection.
    shift: function(options) {
      var model = this.at(0);
      this.remove(model, options);
      return model;
    },

    // Slice out a sub-array of models from the collection.
    slice: function() {
      return slice.apply(this.models, arguments);
    },

    // Get a model from the set by id.
    get: function(obj) {
      if (obj == null) return void 0;
      return this._byId[obj] || this._byId[obj.id] || this._byId[obj.cid];
    },

    // Get the model at the given index.
    at: function(index) {
      return this.models[index];
    },

    // Return models with matching attributes. Useful for simple cases of
    // `filter`.
    where: function(attrs, first) {
      if (_.isEmpty(attrs)) return first ? void 0 : [];
      return this[first ? 'find' : 'filter'](function(model) {
        for (var key in attrs) {
          if (attrs[key] !== model.get(key)) return false;
        }
        return true;
      });
    },

    // Return the first model with matching attributes. Useful for simple cases
    // of `find`.
    findWhere: function(attrs) {
      return this.where(attrs, true);
    },

    // Force the collection to re-sort itself. You don't need to call this under
    // normal circumstances, as the set will maintain sort order as each item
    // is added.
    sort: function(options) {
      if (!this.comparator) throw new Error('Cannot sort a set without a comparator');
      options || (options = {});

      // Run sort based on type of `comparator`.
      if (_.isString(this.comparator) || this.comparator.length === 1) {
        this.models = this.sortBy(this.comparator, this);
      } else {
        this.models.sort(_.bind(this.comparator, this));
      }

      if (!options.silent) this.trigger('sort', this, options);
      return this;
    },

    // Pluck an attribute from each model in the collection.
    pluck: function(attr) {
      return _.invoke(this.models, 'get', attr);
    },

    // Fetch the default set of models for this collection, resetting the
    // collection when they arrive. If `reset: true` is passed, the response
    // data will be passed through the `reset` method instead of `set`.
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      if (options.parse === void 0) options.parse = true;
      var success = options.success;
      var collection = this;
      options.success = function(resp) {
        var method = options.reset ? 'reset' : 'set';
        collection[method](resp, options);
        if (success) success(collection, resp, options);
        collection.trigger('sync', collection, resp, options);
      };
      wrapError(this, options);
      return this.sync('read', this, options);
    },

    // Create a new instance of a model in this collection. Add the model to the
    // collection immediately, unless `wait: true` is passed, in which case we
    // wait for the server to agree.
    create: function(model, options) {
      options = options ? _.clone(options) : {};
      if (!(model = this._prepareModel(model, options))) return false;
      if (!options.wait) this.add(model, options);
      var collection = this;
      var success = options.success;
      options.success = function(model, resp) {
        if (options.wait) collection.add(model, options);
        if (success) success(model, resp, options);
      };
      model.save(null, options);
      return model;
    },

    // **parse** converts a response into a list of models to be added to the
    // collection. The default implementation is just to pass it through.
    parse: function(resp, options) {
      return resp;
    },

    // Create a new collection with an identical list of models as this one.
    clone: function() {
      return new this.constructor(this.models);
    },

    // Private method to reset all internal state. Called when the collection
    // is first initialized or reset.
    _reset: function() {
      this.length = 0;
      this.models = [];
      this._byId  = {};
    },

    // Prepare a hash of attributes (or other model) to be added to this
    // collection.
    _prepareModel: function(attrs, options) {
      if (attrs instanceof Model) return attrs;
      options = options ? _.clone(options) : {};
      options.collection = this;
      var model = new this.model(attrs, options);
      if (!model.validationError) return model;
      this.trigger('invalid', this, model.validationError, options);
      return false;
    },

    // Internal method to create a model's ties to a collection.
    _addReference: function(model, options) {
      this._byId[model.cid] = model;
      if (model.id != null) this._byId[model.id] = model;
      if (!model.collection) model.collection = this;
      model.on('all', this._onModelEvent, this);
    },

    // Internal method to sever a model's ties to a collection.
    _removeReference: function(model, options) {
      if (this === model.collection) delete model.collection;
      model.off('all', this._onModelEvent, this);
    },

    // Internal method called every time a model in the set fires an event.
    // Sets need to update their indexes when models change ids. All other
    // events simply proxy through. "add" and "remove" events that originate
    // in other collections are ignored.
    _onModelEvent: function(event, model, collection, options) {
      if ((event === 'add' || event === 'remove') && collection !== this) return;
      if (event === 'destroy') this.remove(model, options);
      if (model && event === 'change:' + model.idAttribute) {
        delete this._byId[model.previous(model.idAttribute)];
        if (model.id != null) this._byId[model.id] = model;
      }
      this.trigger.apply(this, arguments);
    }

  });

  // Underscore methods that we want to implement on the Collection.
  // 90% of the core usefulness of Backbone Collections is actually implemented
  // right here:
  var methods = ['forEach', 'each', 'map', 'collect', 'reduce', 'foldl',
    'inject', 'reduceRight', 'foldr', 'find', 'detect', 'filter', 'select',
    'reject', 'every', 'all', 'some', 'any', 'include', 'contains', 'invoke',
    'max', 'min', 'toArray', 'size', 'first', 'head', 'take', 'initial', 'rest',
    'tail', 'drop', 'last', 'without', 'difference', 'indexOf', 'shuffle',
    'lastIndexOf', 'isEmpty', 'chain', 'sample'];

  // Mix in each Underscore method as a proxy to `Collection#models`.
  _.each(methods, function(method) {
    Collection.prototype[method] = function() {
      var args = slice.call(arguments);
      args.unshift(this.models);
      return _[method].apply(_, args);
    };
  });

  // Underscore methods that take a property name as an argument.
  var attributeMethods = ['groupBy', 'countBy', 'sortBy', 'indexBy'];

  // Use attributes instead of properties.
  _.each(attributeMethods, function(method) {
    Collection.prototype[method] = function(value, context) {
      var iterator = _.isFunction(value) ? value : function(model) {
        return model.get(value);
      };
      return _[method](this.models, iterator, context);
    };
  });

  // Backbone.View
  // -------------

  // Backbone Views are almost more convention than they are actual code. A View
  // is simply a JavaScript object that represents a logical chunk of UI in the
  // DOM. This might be a single item, an entire list, a sidebar or panel, or
  // even the surrounding frame which wraps your whole app. Defining a chunk of
  // UI as a **View** allows you to define your DOM events declaratively, without
  // having to worry about render order ... and makes it easy for the view to
  // react to specific changes in the state of your models.

  // Creating a Backbone.View creates its initial element outside of the DOM,
  // if an existing element is not provided...
  var View = Backbone.View = function(options) {
    this.cid = _.uniqueId('view');
    options || (options = {});
    _.extend(this, _.pick(options, viewOptions));
    this._ensureElement();
    this.initialize.apply(this, arguments);
    this.delegateEvents();
  };

  // Cached regex to split keys for `delegate`.
  var delegateEventSplitter = /^(\S+)\s*(.*)$/;

  // List of view options to be merged as properties.
  var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'];

  // Set up all inheritable **Backbone.View** properties and methods.
  _.extend(View.prototype, Events, {

    // The default `tagName` of a View's element is `"div"`.
    tagName: 'div',

    // jQuery delegate for element lookup, scoped to DOM elements within the
    // current view. This should be preferred to global lookups where possible.
    $: function(selector) {
      return this.$el.find(selector);
    },

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // **render** is the core function that your view should override, in order
    // to populate its element (`this.el`), with the appropriate HTML. The
    // convention is for **render** to always return `this`.
    render: function() {
      return this;
    },

    // Remove this view by taking the element out of the DOM, and removing any
    // applicable Backbone.Events listeners.
    remove: function() {
      this.$el.remove();
      this.stopListening();
      return this;
    },

    // Change the view's element (`this.el` property), including event
    // re-delegation.
    setElement: function(element, delegate) {
      if (this.$el) this.undelegateEvents();
      this.$el = element instanceof Backbone.$ ? element : Backbone.$(element);
      this.el = this.$el[0];
      if (delegate !== false) this.delegateEvents();
      return this;
    },

    // Set callbacks, where `this.events` is a hash of
    //
    // *{"event selector": "callback"}*
    //
    //     {
    //       'mousedown .title':  'edit',
    //       'click .button':     'save',
    //       'click .open':       function(e) { ... }
    //     }
    //
    // pairs. Callbacks will be bound to the view, with `this` set properly.
    // Uses event delegation for efficiency.
    // Omitting the selector binds the event to `this.el`.
    // This only works for delegate-able events: not `focus`, `blur`, and
    // not `change`, `submit`, and `reset` in Internet Explorer.
    delegateEvents: function(events) {
      if (!(events || (events = _.result(this, 'events')))) return this;
      this.undelegateEvents();
      for (var key in events) {
        var method = events[key];
        if (!_.isFunction(method)) method = this[events[key]];
        if (!method) continue;

        var match = key.match(delegateEventSplitter);
        var eventName = match[1], selector = match[2];
        method = _.bind(method, this);
        eventName += '.delegateEvents' + this.cid;
        if (selector === '') {
          this.$el.on(eventName, method);
        } else {
          this.$el.on(eventName, selector, method);
        }
      }
      return this;
    },

    // Clears all callbacks previously bound to the view with `delegateEvents`.
    // You usually don't need to use this, but may wish to if you have multiple
    // Backbone views attached to the same DOM element.
    undelegateEvents: function() {
      this.$el.off('.delegateEvents' + this.cid);
      return this;
    },

    // Ensure that the View has a DOM element to render into.
    // If `this.el` is a string, pass it through `$()`, take the first
    // matching element, and re-assign it to `el`. Otherwise, create
    // an element from the `id`, `className` and `tagName` properties.
    _ensureElement: function() {
      if (!this.el) {
        var attrs = _.extend({}, _.result(this, 'attributes'));
        if (this.id) attrs.id = _.result(this, 'id');
        if (this.className) attrs['class'] = _.result(this, 'className');
        var $el = Backbone.$('<' + _.result(this, 'tagName') + '>').attr(attrs);
        this.setElement($el, false);
      } else {
        this.setElement(_.result(this, 'el'), false);
      }
    }

  });

  // Backbone.sync
  // -------------

  // Override this function to change the manner in which Backbone persists
  // models to the server. You will be passed the type of request, and the
  // model in question. By default, makes a RESTful Ajax request
  // to the model's `url()`. Some possible customizations could be:
  //
  // * Use `setTimeout` to batch rapid-fire updates into a single request.
  // * Send up the models as XML instead of JSON.
  // * Persist models via WebSockets instead of Ajax.
  //
  // Turn on `Backbone.emulateHTTP` in order to send `PUT` and `DELETE` requests
  // as `POST`, with a `_method` parameter containing the true HTTP method,
  // as well as all requests with the body as `application/x-www-form-urlencoded`
  // instead of `application/json` with the model in a param named `model`.
  // Useful when interfacing with server-side languages like **PHP** that make
  // it difficult to read the body of `PUT` requests.
  Backbone.sync = function(method, model, options) {
    var type = methodMap[method];

    // Default options, unless specified.
    _.defaults(options || (options = {}), {
      emulateHTTP: Backbone.emulateHTTP,
      emulateJSON: Backbone.emulateJSON
    });

    // Default JSON-request options.
    var params = {type: type, dataType: 'json'};

    // Ensure that we have a URL.
    if (!options.url) {
      params.url = _.result(model, 'url') || urlError();
    }

    // Ensure that we have the appropriate request data.
    if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
      params.contentType = 'application/json';
      params.data = JSON.stringify(options.attrs || model.toJSON(options));
    }

    // For older servers, emulate JSON by encoding the request into an HTML-form.
    if (options.emulateJSON) {
      params.contentType = 'application/x-www-form-urlencoded';
      params.data = params.data ? {model: params.data} : {};
    }

    // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
    // And an `X-HTTP-Method-Override` header.
    if (options.emulateHTTP && (type === 'PUT' || type === 'DELETE' || type === 'PATCH')) {
      params.type = 'POST';
      if (options.emulateJSON) params.data._method = type;
      var beforeSend = options.beforeSend;
      options.beforeSend = function(xhr) {
        xhr.setRequestHeader('X-HTTP-Method-Override', type);
        if (beforeSend) return beforeSend.apply(this, arguments);
      };
    }

    // Don't process data on a non-GET request.
    if (params.type !== 'GET' && !options.emulateJSON) {
      params.processData = false;
    }

    // If we're sending a `PATCH` request, and we're in an old Internet Explorer
    // that still has ActiveX enabled by default, override jQuery to use that
    // for XHR instead. Remove this line when jQuery supports `PATCH` on IE8.
    if (params.type === 'PATCH' && noXhrPatch) {
      params.xhr = function() {
        return new ActiveXObject("Microsoft.XMLHTTP");
      };
    }

    // Make the request, allowing the user to override any Ajax options.
    var xhr = options.xhr = Backbone.ajax(_.extend(params, options));
    model.trigger('request', model, xhr, options);
    return xhr;
  };

  var noXhrPatch =
    typeof window !== 'undefined' && !!window.ActiveXObject &&
      !(window.XMLHttpRequest && (new XMLHttpRequest).dispatchEvent);

  // Map from CRUD to HTTP for our default `Backbone.sync` implementation.
  var methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'patch':  'PATCH',
    'delete': 'DELETE',
    'read':   'GET'
  };

  // Set the default implementation of `Backbone.ajax` to proxy through to `$`.
  // Override this if you'd like to use a different library.
  Backbone.ajax = function() {
    return Backbone.$.ajax.apply(Backbone.$, arguments);
  };

  // Backbone.Router
  // ---------------

  // Routers map faux-URLs to actions, and fire events when routes are
  // matched. Creating a new one sets its `routes` hash, if not set statically.
  var Router = Backbone.Router = function(options) {
    options || (options = {});
    if (options.routes) this.routes = options.routes;
    this._bindRoutes();
    this.initialize.apply(this, arguments);
  };

  // Cached regular expressions for matching named param parts and splatted
  // parts of route strings.
  var optionalParam = /\((.*?)\)/g;
  var namedParam    = /(\(\?)?:\w+/g;
  var splatParam    = /\*\w+/g;
  var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;

  // Set up all inheritable **Backbone.Router** properties and methods.
  _.extend(Router.prototype, Events, {

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Manually bind a single named route to a callback. For example:
    //
    //     this.route('search/:query/p:num', 'search', function(query, num) {
    //       ...
    //     });
    //
    route: function(route, name, callback) {
      if (!_.isRegExp(route)) route = this._routeToRegExp(route);
      if (_.isFunction(name)) {
        callback = name;
        name = '';
      }
      if (!callback) callback = this[name];
      var router = this;
      Backbone.history.route(route, function(fragment) {
        var args = router._extractParameters(route, fragment);
        router.execute(callback, args);
        router.trigger.apply(router, ['route:' + name].concat(args));
        router.trigger('route', name, args);
        Backbone.history.trigger('route', router, name, args);
      });
      return this;
    },

    // Execute a route handler with the provided parameters.  This is an
    // excellent place to do pre-route setup or post-route cleanup.
    execute: function(callback, args) {
      if (callback) callback.apply(this, args);
    },

    // Simple proxy to `Backbone.history` to save a fragment into the history.
    navigate: function(fragment, options) {
      Backbone.history.navigate(fragment, options);
      return this;
    },

    // Bind all defined routes to `Backbone.history`. We have to reverse the
    // order of the routes here to support behavior where the most general
    // routes can be defined at the bottom of the route map.
    _bindRoutes: function() {
      if (!this.routes) return;
      this.routes = _.result(this, 'routes');
      var route, routes = _.keys(this.routes);
      while ((route = routes.pop()) != null) {
        this.route(route, this.routes[route]);
      }
    },

    // Convert a route string into a regular expression, suitable for matching
    // against the current location hash.
    _routeToRegExp: function(route) {
      route = route.replace(escapeRegExp, '\\$&')
                   .replace(optionalParam, '(?:$1)?')
                   .replace(namedParam, function(match, optional) {
                     return optional ? match : '([^/?]+)';
                   })
                   .replace(splatParam, '([^?]*?)');
      return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
    },

    // Given a route, and a URL fragment that it matches, return the array of
    // extracted decoded parameters. Empty or unmatched parameters will be
    // treated as `null` to normalize cross-browser behavior.
    _extractParameters: function(route, fragment) {
      var params = route.exec(fragment).slice(1);
      return _.map(params, function(param, i) {
        // Don't decode the search params.
        if (i === params.length - 1) return param || null;
        return param ? decodeURIComponent(param) : null;
      });
    }

  });

  // Backbone.History
  // ----------------

  // Handles cross-browser history management, based on either
  // [pushState](http://diveintohtml5.info/history.html) and real URLs, or
  // [onhashchange](https://developer.mozilla.org/en-US/docs/DOM/window.onhashchange)
  // and URL fragments. If the browser supports neither (old IE, natch),
  // falls back to polling.
  var History = Backbone.History = function() {
    this.handlers = [];
    _.bindAll(this, 'checkUrl');

    // Ensure that `History` can be used outside of the browser.
    if (typeof window !== 'undefined') {
      this.location = window.location;
      this.history = window.history;
    }
  };

  // Cached regex for stripping a leading hash/slash and trailing space.
  var routeStripper = /^[#\/]|\s+$/g;

  // Cached regex for stripping leading and trailing slashes.
  var rootStripper = /^\/+|\/+$/g;

  // Cached regex for detecting MSIE.
  var isExplorer = /msie [\w.]+/;

  // Cached regex for removing a trailing slash.
  var trailingSlash = /\/$/;

  // Cached regex for stripping urls of hash.
  var pathStripper = /#.*$/;

  // Has the history handling already been started?
  History.started = false;

  // Set up all inheritable **Backbone.History** properties and methods.
  _.extend(History.prototype, Events, {

    // The default interval to poll for hash changes, if necessary, is
    // twenty times a second.
    interval: 50,

    // Are we at the app root?
    atRoot: function() {
      return this.location.pathname.replace(/[^\/]$/, '$&/') === this.root;
    },

    // Gets the true hash value. Cannot use location.hash directly due to bug
    // in Firefox where location.hash will always be decoded.
    getHash: function(window) {
      var match = (window || this).location.href.match(/#(.*)$/);
      return match ? match[1] : '';
    },

    // Get the cross-browser normalized URL fragment, either from the URL,
    // the hash, or the override.
    getFragment: function(fragment, forcePushState) {
      if (fragment == null) {
        if (this._hasPushState || !this._wantsHashChange || forcePushState) {
          fragment = decodeURI(this.location.pathname + this.location.search);
          var root = this.root.replace(trailingSlash, '');
          if (!fragment.indexOf(root)) fragment = fragment.slice(root.length);
        } else {
          fragment = this.getHash();
        }
      }
      return fragment.replace(routeStripper, '');
    },

    // Start the hash change handling, returning `true` if the current URL matches
    // an existing route, and `false` otherwise.
    start: function(options) {
      if (History.started) throw new Error("Backbone.history has already been started");
      History.started = true;

      // Figure out the initial configuration. Do we need an iframe?
      // Is pushState desired ... is it available?
      this.options          = _.extend({root: '/'}, this.options, options);
      this.root             = this.options.root;
      this._wantsHashChange = this.options.hashChange !== false;
      this._wantsPushState  = !!this.options.pushState;
      this._hasPushState    = !!(this.options.pushState && this.history && this.history.pushState);
      var fragment          = this.getFragment();
      var docMode           = document.documentMode;
      var oldIE             = (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));

      // Normalize root to always include a leading and trailing slash.
      this.root = ('/' + this.root + '/').replace(rootStripper, '/');

      if (oldIE && this._wantsHashChange) {
        var frame = Backbone.$('<iframe src="javascript:0" tabindex="-1">');
        this.iframe = frame.hide().appendTo('body')[0].contentWindow;
        this.navigate(fragment);
      }

      // Depending on whether we're using pushState or hashes, and whether
      // 'onhashchange' is supported, determine how we check the URL state.
      if (this._hasPushState) {
        Backbone.$(window).on('popstate', this.checkUrl);
      } else if (this._wantsHashChange && ('onhashchange' in window) && !oldIE) {
        Backbone.$(window).on('hashchange', this.checkUrl);
      } else if (this._wantsHashChange) {
        this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
      }

      // Determine if we need to change the base url, for a pushState link
      // opened by a non-pushState browser.
      this.fragment = fragment;
      var loc = this.location;

      // Transition from hashChange to pushState or vice versa if both are
      // requested.
      if (this._wantsHashChange && this._wantsPushState) {

        // If we've started off with a route from a `pushState`-enabled
        // browser, but we're currently in a browser that doesn't support it...
        if (!this._hasPushState && !this.atRoot()) {
          this.fragment = this.getFragment(null, true);
          this.location.replace(this.root + '#' + this.fragment);
          // Return immediately as browser will do redirect to new url
          return true;

        // Or if we've started out with a hash-based route, but we're currently
        // in a browser where it could be `pushState`-based instead...
        } else if (this._hasPushState && this.atRoot() && loc.hash) {
          this.fragment = this.getHash().replace(routeStripper, '');
          this.history.replaceState({}, document.title, this.root + this.fragment);
        }

      }

      if (!this.options.silent) return this.loadUrl();
    },

    // Disable Backbone.history, perhaps temporarily. Not useful in a real app,
    // but possibly useful for unit testing Routers.
    stop: function() {
      Backbone.$(window).off('popstate', this.checkUrl).off('hashchange', this.checkUrl);
      if (this._checkUrlInterval) clearInterval(this._checkUrlInterval);
      History.started = false;
    },

    // Add a route to be tested when the fragment changes. Routes added later
    // may override previous routes.
    route: function(route, callback) {
      this.handlers.unshift({route: route, callback: callback});
    },

    // Checks the current URL to see if it has changed, and if it has,
    // calls `loadUrl`, normalizing across the hidden iframe.
    checkUrl: function(e) {
      var current = this.getFragment();
      if (current === this.fragment && this.iframe) {
        current = this.getFragment(this.getHash(this.iframe));
      }
      if (current === this.fragment) return false;
      if (this.iframe) this.navigate(current);
      this.loadUrl();
    },

    // Attempt to load the current URL fragment. If a route succeeds with a
    // match, returns `true`. If no defined routes matches the fragment,
    // returns `false`.
    loadUrl: function(fragment) {
      fragment = this.fragment = this.getFragment(fragment);
      return _.any(this.handlers, function(handler) {
        if (handler.route.test(fragment)) {
          handler.callback(fragment);
          return true;
        }
      });
    },

    // Save a fragment into the hash history, or replace the URL state if the
    // 'replace' option is passed. You are responsible for properly URL-encoding
    // the fragment in advance.
    //
    // The options object can contain `trigger: true` if you wish to have the
    // route callback be fired (not usually desirable), or `replace: true`, if
    // you wish to modify the current URL without adding an entry to the history.
    navigate: function(fragment, options) {
      if (!History.started) return false;
      if (!options || options === true) options = {trigger: !!options};

      var url = this.root + (fragment = this.getFragment(fragment || ''));

      // Strip the hash for matching.
      fragment = fragment.replace(pathStripper, '');

      if (this.fragment === fragment) return;
      this.fragment = fragment;

      // Don't include a trailing slash on the root.
      if (fragment === '' && url !== '/') url = url.slice(0, -1);

      // If pushState is available, we use it to set the fragment as a real URL.
      if (this._hasPushState) {
        this.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, url);

      // If hash changes haven't been explicitly disabled, update the hash
      // fragment to store history.
      } else if (this._wantsHashChange) {
        this._updateHash(this.location, fragment, options.replace);
        if (this.iframe && (fragment !== this.getFragment(this.getHash(this.iframe)))) {
          // Opening and closing the iframe tricks IE7 and earlier to push a
          // history entry on hash-tag change.  When replace is true, we don't
          // want this.
          if(!options.replace) this.iframe.document.open().close();
          this._updateHash(this.iframe.location, fragment, options.replace);
        }

      // If you've told us that you explicitly don't want fallback hashchange-
      // based history, then `navigate` becomes a page refresh.
      } else {
        return this.location.assign(url);
      }
      if (options.trigger) return this.loadUrl(fragment);
    },

    // Update the hash location, either replacing the current entry, or adding
    // a new one to the browser history.
    _updateHash: function(location, fragment, replace) {
      if (replace) {
        var href = location.href.replace(/(javascript:|#).*$/, '');
        location.replace(href + '#' + fragment);
      } else {
        // Some browsers require that `hash` contains a leading #.
        location.hash = '#' + fragment;
      }
    }

  });

  // Create the default Backbone.history.
  Backbone.history = new History;

  // Helpers
  // -------

  // Helper function to correctly set up the prototype chain, for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  var extend = function(protoProps, staticProps) {
    var parent = this;
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && _.has(protoProps, 'constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ return parent.apply(this, arguments); };
    }

    // Add static properties to the constructor function, if supplied.
    _.extend(child, parent, staticProps);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    var Surrogate = function(){ this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate;

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    return child;
  };

  // Set up inheritance for the model, collection, router, view and history.
  Model.extend = Collection.extend = Router.extend = View.extend = History.extend = extend;

  // Throw an error when a URL is needed, and none is supplied.
  var urlError = function() {
    throw new Error('A "url" property or function must be specified');
  };

  // Wrap an optional error callback with a fallback error event.
  var wrapError = function(model, options) {
    var error = options.error;
    options.error = function(resp) {
      if (error) error(model, resp, options);
      model.trigger('error', model, resp, options);
    };
  };

  return Backbone;

}));

/* Pattern router
 */
define('mockup-router',[
  'underscore',
  'backbone'
], function(_, Backbone) {
  'use strict';

  var regexEscape = function(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  };

  var Router = Backbone.Router.extend({
    actions: [],
    redirects: {},
    addRoute: function(patternName, id, callback, context, pathExp, expReplace) {
      if (_.findWhere(this.patterns, {patternName: patternName, id: id}) === undefined) {
        this.actions.push({patternName: patternName, id: id, callback: callback, context: context, pathExp: pathExp, expReplace: expReplace});
      }
      var regex = new RegExp('(' + regexEscape(patternName) + ':' + regexEscape(id) + ')');
      this.route(regex, 'handleRoute');
    },
    addRedirect: function(pathExp, destination) {
      this.redirects[pathExp] = destination;
    },
    handleRoute: function(pattern) {
      var parts = pattern.split(':');
      var patternName = parts[0];
      var id = parts[1];
      var action = _.findWhere(this.actions, {patternName: patternName, id: id});
      if (action) {
        action.callback.call(action.context);
      }
    },
    redirect: function() {
      var path = window.parent.location.pathname,
          newPath,
          regex,
          hash;

      _.some(this.actions, function(action) {
        if (action.pathExp) {
          regex = new RegExp(action.pathExp);
          if (path.match(regex)) {
            hash = '!/' + action.patternName + ':' + action.id;
            var replaceWith = '';
            if (action.expReplace) {
              replaceWith = action.expReplace;
            }
            newPath = path.replace(regex, replaceWith);
            return true;
          }
        }
      }, this);

      if (hash === undefined) {
        for (var pathExp in this.redirects) {
          regex = new RegExp(pathExp);
          if (path.match(regex)) {
            hash = '!/' + this.redirects[pathExp];
            newPath = path.replace(regex, '');
            break;
          }
        }
      }

      if (hash !== undefined) {
        this._changeLocation.apply(this, [newPath, hash]);
      }
    },
    _changeLocation: function(path, hash) {
      window.parent.location.hash = hash;
      window.parent.location.pathname = path;
    },
    start: function() {
      Backbone.history.start();
    },
    reset: function() {
      this.actions = [];
    }

  });

  return new Router();

});

/*!
 * jQuery Form Plugin
 * version: 4.2.2
 * Requires jQuery v1.7.2 or later
 * Project repository: https://github.com/jquery-form/form

 * Copyright 2017 Kevin Morris
 * Copyright 2006 M. Alsup

 * Dual licensed under the LGPL-2.1+ or MIT licenses
 * https://github.com/jquery-form/form#license

 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 */
/* global ActiveXObject */

/* eslint-disable */
(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define('jquery.form',['jquery'], factory);
	} else if (typeof module === 'object' && module.exports) {
		// Node/CommonJS
		module.exports = function( root, jQuery ) {
			if (typeof jQuery === 'undefined') {
				// require('jQuery') returns a factory that requires window to build a jQuery instance, we normalize how we use modules
				// that require this pattern but the window provided is a noop if it's defined (how jquery works)
				if (typeof window !== 'undefined') {
					jQuery = require('jquery');
				}
				else {
					jQuery = require('jquery')(root);
				}
			}
			factory(jQuery);
			return jQuery;
		};
	} else {
		// Browser globals
		factory(jQuery);
	}

}(function ($) {
/* eslint-enable */
	'use strict';

	/*
		Usage Note:
		-----------
		Do not use both ajaxSubmit and ajaxForm on the same form. These
		functions are mutually exclusive. Use ajaxSubmit if you want
		to bind your own submit handler to the form. For example,

		$(document).ready(function() {
			$('#myForm').on('submit', function(e) {
				e.preventDefault(); // <-- important
				$(this).ajaxSubmit({
					target: '#output'
				});
			});
		});

		Use ajaxForm when you want the plugin to manage all the event binding
		for you. For example,

		$(document).ready(function() {
			$('#myForm').ajaxForm({
				target: '#output'
			});
		});

		You can also use ajaxForm with delegation (requires jQuery v1.7+), so the
		form does not have to exist when you invoke ajaxForm:

		$('#myForm').ajaxForm({
			delegation: true,
			target: '#output'
		});

		When using ajaxForm, the ajaxSubmit function will be invoked for you
		at the appropriate time.
	*/

	var rCRLF = /\r?\n/g;

	/**
	 * Feature detection
	 */
	var feature = {};

	feature.fileapi = $('<input type="file">').get(0).files !== undefined;
	feature.formdata = (typeof window.FormData !== 'undefined');

	var hasProp = !!$.fn.prop;

	// attr2 uses prop when it can but checks the return type for
	// an expected string. This accounts for the case where a form
	// contains inputs with names like "action" or "method"; in those
	// cases "prop" returns the element
	$.fn.attr2 = function() {
		if (!hasProp) {
			return this.attr.apply(this, arguments);
		}

		var val = this.prop.apply(this, arguments);

		if ((val && val.jquery) || typeof val === 'string') {
			return val;
		}

		return this.attr.apply(this, arguments);
	};

	/**
	 * ajaxSubmit() provides a mechanism for immediately submitting
	 * an HTML form using AJAX.
	 *
	 * @param	{object|string}	options		jquery.form.js parameters or custom url for submission
	 * @param	{object}		data		extraData
	 * @param	{string}		dataType	ajax dataType
	 * @param	{function}		onSuccess	ajax success callback function
	 */
	$.fn.ajaxSubmit = function(options, data, dataType, onSuccess) {
		// fast fail if nothing selected (http://dev.jquery.com/ticket/2752)
		if (!this.length) {
			log('ajaxSubmit: skipping submit process - no element selected');

			return this;
		}

		/* eslint consistent-this: ["error", "$form"] */
		var method, action, url, $form = this;

		if (typeof options === 'function') {
			options = {success: options};

		} else if (typeof options === 'string' || (options === false && arguments.length > 0)) {
			options = {
				'url'      : options,
				'data'     : data,
				'dataType' : dataType
			};

			if (typeof onSuccess === 'function') {
				options.success = onSuccess;
			}

		} else if (typeof options === 'undefined') {
			options = {};
		}

		method = options.method || options.type || this.attr2('method');
		action = options.url || this.attr2('action');

		url = (typeof action === 'string') ? $.trim(action) : '';
		url = url || window.location.href || '';
		if (url) {
			// clean url (don't include hash vaue)
			url = (url.match(/^([^#]+)/) || [])[1];
		}

		options = $.extend(true, {
			url       : url,
			success   : $.ajaxSettings.success,
			type      : method || $.ajaxSettings.type,
			iframeSrc : /^https/i.test(window.location.href || '') ? 'javascript:false' : 'about:blank'		// eslint-disable-line no-script-url
		}, options);

		// hook for manipulating the form data before it is extracted;
		// convenient for use with rich editors like tinyMCE or FCKEditor
		var veto = {};

		this.trigger('form-pre-serialize', [this, options, veto]);

		if (veto.veto) {
			log('ajaxSubmit: submit vetoed via form-pre-serialize trigger');

			return this;
		}

		// provide opportunity to alter form data before it is serialized
		if (options.beforeSerialize && options.beforeSerialize(this, options) === false) {
			log('ajaxSubmit: submit aborted via beforeSerialize callback');

			return this;
		}

		var traditional = options.traditional;

		if (typeof traditional === 'undefined') {
			traditional = $.ajaxSettings.traditional;
		}

		var elements = [];
		var qx, a = this.formToArray(options.semantic, elements, options.filtering);

		if (options.data) {
			var optionsData = $.isFunction(options.data) ? options.data(a) : options.data;

			options.extraData = optionsData;
			qx = $.param(optionsData, traditional);
		}

		// give pre-submit callback an opportunity to abort the submit
		if (options.beforeSubmit && options.beforeSubmit(a, this, options) === false) {
			log('ajaxSubmit: submit aborted via beforeSubmit callback');

			return this;
		}

		// fire vetoable 'validate' event
		this.trigger('form-submit-validate', [a, this, options, veto]);
		if (veto.veto) {
			log('ajaxSubmit: submit vetoed via form-submit-validate trigger');

			return this;
		}

		var q = $.param(a, traditional);

		if (qx) {
			q = (q ? (q + '&' + qx) : qx);
		}

		if (options.type.toUpperCase() === 'GET') {
			options.url += (options.url.indexOf('?') >= 0 ? '&' : '?') + q;
			options.data = null;	// data is null for 'get'
		} else {
			options.data = q;		// data is the query string for 'post'
		}

		var callbacks = [];

		if (options.resetForm) {
			callbacks.push(function() {
				$form.resetForm();
			});
		}

		if (options.clearForm) {
			callbacks.push(function() {
				$form.clearForm(options.includeHidden);
			});
		}

		// perform a load on the target only if dataType is not provided
		if (!options.dataType && options.target) {
			var oldSuccess = options.success || function(){};

			callbacks.push(function(data, textStatus, jqXHR) {
				var successArguments = arguments,
					fn = options.replaceTarget ? 'replaceWith' : 'html';

				$(options.target)[fn](data).each(function(){
					oldSuccess.apply(this, successArguments);
				});
			});

		} else if (options.success) {
			if ($.isArray(options.success)) {
				$.merge(callbacks, options.success);
			} else {
				callbacks.push(options.success);
			}
		}

		options.success = function(data, status, xhr) { // jQuery 1.4+ passes xhr as 3rd arg
			var context = options.context || this;		// jQuery 1.4+ supports scope context

			for (var i = 0, max = callbacks.length; i < max; i++) {
				callbacks[i].apply(context, [data, status, xhr || $form, $form]);
			}
		};

		if (options.error) {
			var oldError = options.error;

			options.error = function(xhr, status, error) {
				var context = options.context || this;

				oldError.apply(context, [xhr, status, error, $form]);
			};
		}

		if (options.complete) {
			var oldComplete = options.complete;

			options.complete = function(xhr, status) {
				var context = options.context || this;

				oldComplete.apply(context, [xhr, status, $form]);
			};
		}

		// are there files to upload?

		// [value] (issue #113), also see comment:
		// https://github.com/malsup/form/commit/588306aedba1de01388032d5f42a60159eea9228#commitcomment-2180219
		var fileInputs = $('input[type=file]:enabled', this).filter(function() {
			return $(this).val() !== '';
		});
		var hasFileInputs = fileInputs.length > 0;
		var mp = 'multipart/form-data';
		var multipart = ($form.attr('enctype') === mp || $form.attr('encoding') === mp);
		var fileAPI = feature.fileapi && feature.formdata;

		log('fileAPI :' + fileAPI);

		var shouldUseFrame = (hasFileInputs || multipart) && !fileAPI;
		var jqxhr;

		// options.iframe allows user to force iframe mode
		// 06-NOV-09: now defaulting to iframe mode if file input is detected
		if (options.iframe !== false && (options.iframe || shouldUseFrame)) {
			// hack to fix Safari hang (thanks to Tim Molendijk for this)
			// see: http://groups.google.com/group/jquery-dev/browse_thread/thread/36395b7ab510dd5d
			if (options.closeKeepAlive) {
				$.get(options.closeKeepAlive, function() {
					jqxhr = fileUploadIframe(a);
				});

			} else {
				jqxhr = fileUploadIframe(a);
			}

		} else if ((hasFileInputs || multipart) && fileAPI) {
			jqxhr = fileUploadXhr(a);

		} else {
			jqxhr = $.ajax(options);
		}

		$form.removeData('jqxhr').data('jqxhr', jqxhr);

		// clear element array
		for (var k = 0; k < elements.length; k++) {
			elements[k] = null;
		}

		// fire 'notify' event
		this.trigger('form-submit-notify', [this, options]);

		return this;

		// utility fn for deep serialization
		function deepSerialize(extraData) {
			var serialized = $.param(extraData, options.traditional).split('&');
			var len = serialized.length;
			var result = [];
			var i, part;

			for (i = 0; i < len; i++) {
				// #252; undo param space replacement
				serialized[i] = serialized[i].replace(/\+/g, ' ');
				part = serialized[i].split('=');
				// #278; use array instead of object storage, favoring array serializations
				result.push([decodeURIComponent(part[0]), decodeURIComponent(part[1])]);
			}

			return result;
		}

		// XMLHttpRequest Level 2 file uploads (big hat tip to francois2metz)
		function fileUploadXhr(a) {
			var formdata = new FormData();

			for (var i = 0; i < a.length; i++) {
				formdata.append(a[i].name, a[i].value);
			}

			if (options.extraData) {
				var serializedData = deepSerialize(options.extraData);

				for (i = 0; i < serializedData.length; i++) {
					if (serializedData[i]) {
						formdata.append(serializedData[i][0], serializedData[i][1]);
					}
				}
			}

			options.data = null;

			var s = $.extend(true, {}, $.ajaxSettings, options, {
				contentType : false,
				processData : false,
				cache       : false,
				type        : method || 'POST'
			});

			if (options.uploadProgress) {
				// workaround because jqXHR does not expose upload property
				s.xhr = function() {
					var xhr = $.ajaxSettings.xhr();

					if (xhr.upload) {
						xhr.upload.addEventListener('progress', function(event) {
							var percent = 0;
							var position = event.loaded || event.position;			/* event.position is deprecated */
							var total = event.total;

							if (event.lengthComputable) {
								percent = Math.ceil(position / total * 100);
							}

							options.uploadProgress(event, position, total, percent);
						}, false);
					}

					return xhr;
				};
			}

			s.data = null;

			var beforeSend = s.beforeSend;

			s.beforeSend = function(xhr, o) {
				// Send FormData() provided by user
				if (options.formData) {
					o.data = options.formData;
				} else {
					o.data = formdata;
				}

				if (beforeSend) {
					beforeSend.call(this, xhr, o);
				}
			};

			return $.ajax(s);
		}

		// private function for handling file uploads (hat tip to YAHOO!)
		function fileUploadIframe(a) {
			var form = $form[0], el, i, s, g, id, $io, io, xhr, sub, n, timedOut, timeoutHandle;
			var deferred = $.Deferred();

			// #341
			deferred.abort = function(status) {
				xhr.abort(status);
			};

			if (a) {
				// ensure that every serialized input is still enabled
				for (i = 0; i < elements.length; i++) {
					el = $(elements[i]);
					if (hasProp) {
						el.prop('disabled', false);
					} else {
						el.removeAttr('disabled');
					}
				}
			}

			s = $.extend(true, {}, $.ajaxSettings, options);
			s.context = s.context || s;
			id = 'jqFormIO' + new Date().getTime();
			var ownerDocument = form.ownerDocument;
			var $body = $form.closest('body');

			if (s.iframeTarget) {
				$io = $(s.iframeTarget, ownerDocument);
				n = $io.attr2('name');
				if (!n) {
					$io.attr2('name', id);
				} else {
					id = n;
				}

			} else {
				$io = $('<iframe name="' + id + '" src="' + s.iframeSrc + '" />', ownerDocument);
				$io.css({position: 'absolute', top: '-1000px', left: '-1000px'});
			}
			io = $io[0];


			xhr = { // mock object
				aborted               : 0,
				responseText          : null,
				responseXML           : null,
				status                : 0,
				statusText            : 'n/a',
				getAllResponseHeaders : function() {},
				getResponseHeader     : function() {},
				setRequestHeader      : function() {},
				abort                 : function(status) {
					var e = (status === 'timeout' ? 'timeout' : 'aborted');

					log('aborting upload... ' + e);
					this.aborted = 1;

					try { // #214, #257
						if (io.contentWindow.document.execCommand) {
							io.contentWindow.document.execCommand('Stop');
						}
					} catch (ignore) {}

					$io.attr('src', s.iframeSrc); // abort op in progress
					xhr.error = e;
					if (s.error) {
						s.error.call(s.context, xhr, e, status);
					}

					if (g) {
						$.event.trigger('ajaxError', [xhr, s, e]);
					}

					if (s.complete) {
						s.complete.call(s.context, xhr, e);
					}
				}
			};

			g = s.global;
			// trigger ajax global events so that activity/block indicators work like normal
			if (g && $.active++ === 0) {
				$.event.trigger('ajaxStart');
			}
			if (g) {
				$.event.trigger('ajaxSend', [xhr, s]);
			}

			if (s.beforeSend && s.beforeSend.call(s.context, xhr, s) === false) {
				if (s.global) {
					$.active--;
				}
				deferred.reject();

				return deferred;
			}

			if (xhr.aborted) {
				deferred.reject();

				return deferred;
			}

			// add submitting element to data if we know it
			sub = form.clk;
			if (sub) {
				n = sub.name;
				if (n && !sub.disabled) {
					s.extraData = s.extraData || {};
					s.extraData[n] = sub.value;
					if (sub.type === 'image') {
						s.extraData[n + '.x'] = form.clk_x;
						s.extraData[n + '.y'] = form.clk_y;
					}
				}
			}

			var CLIENT_TIMEOUT_ABORT = 1;
			var SERVER_ABORT = 2;

			function getDoc(frame) {
				/* it looks like contentWindow or contentDocument do not
				 * carry the protocol property in ie8, when running under ssl
				 * frame.document is the only valid response document, since
				 * the protocol is know but not on the other two objects. strange?
				 * "Same origin policy" http://en.wikipedia.org/wiki/Same_origin_policy
				 */

				var doc = null;

				// IE8 cascading access check
				try {
					if (frame.contentWindow) {
						doc = frame.contentWindow.document;
					}
				} catch (err) {
					// IE8 access denied under ssl & missing protocol
					log('cannot get iframe.contentWindow document: ' + err);
				}

				if (doc) { // successful getting content
					return doc;
				}

				try { // simply checking may throw in ie8 under ssl or mismatched protocol
					doc = frame.contentDocument ? frame.contentDocument : frame.document;
				} catch (err) {
					// last attempt
					log('cannot get iframe.contentDocument: ' + err);
					doc = frame.document;
				}

				return doc;
			}

			// Rails CSRF hack (thanks to Yvan Barthelemy)
			var csrf_token = $('meta[name=csrf-token]').attr('content');
			var csrf_param = $('meta[name=csrf-param]').attr('content');

			if (csrf_param && csrf_token) {
				s.extraData = s.extraData || {};
				s.extraData[csrf_param] = csrf_token;
			}

			// take a breath so that pending repaints get some cpu time before the upload starts
			function doSubmit() {
				// make sure form attrs are set
				var t = $form.attr2('target'),
					a = $form.attr2('action'),
					mp = 'multipart/form-data',
					et = $form.attr('enctype') || $form.attr('encoding') || mp;

				// update form attrs in IE friendly way
				form.setAttribute('target', id);
				if (!method || /post/i.test(method)) {
					form.setAttribute('method', 'POST');
				}
				if (a !== s.url) {
					form.setAttribute('action', s.url);
				}

				// ie borks in some cases when setting encoding
				if (!s.skipEncodingOverride && (!method || /post/i.test(method))) {
					$form.attr({
						encoding : 'multipart/form-data',
						enctype  : 'multipart/form-data'
					});
				}

				// support timout
				if (s.timeout) {
					timeoutHandle = setTimeout(function() {
						timedOut = true; cb(CLIENT_TIMEOUT_ABORT);
					}, s.timeout);
				}

				// look for server aborts
				function checkState() {
					try {
						var state = getDoc(io).readyState;

						log('state = ' + state);
						if (state && state.toLowerCase() === 'uninitialized') {
							setTimeout(checkState, 50);
						}

					} catch (e) {
						log('Server abort: ', e, ' (', e.name, ')');
						cb(SERVER_ABORT);				// eslint-disable-line callback-return
						if (timeoutHandle) {
							clearTimeout(timeoutHandle);
						}
						timeoutHandle = undefined;
					}
				}

				// add "extra" data to form if provided in options
				var extraInputs = [];

				try {
					if (s.extraData) {
						for (var n in s.extraData) {
							if (s.extraData.hasOwnProperty(n)) {
								// if using the $.param format that allows for multiple values with the same name
								if ($.isPlainObject(s.extraData[n]) && s.extraData[n].hasOwnProperty('name') && s.extraData[n].hasOwnProperty('value')) {
									extraInputs.push(
									$('<input type="hidden" name="' + s.extraData[n].name + '">', ownerDocument).val(s.extraData[n].value)
										.appendTo(form)[0]);
								} else {
									extraInputs.push(
									$('<input type="hidden" name="' + n + '">', ownerDocument).val(s.extraData[n])
										.appendTo(form)[0]);
								}
							}
						}
					}

					if (!s.iframeTarget) {
						// add iframe to doc and submit the form
						$io.appendTo($body);
					}

					if (io.attachEvent) {
						io.attachEvent('onload', cb);
					} else {
						io.addEventListener('load', cb, false);
					}

					setTimeout(checkState, 15);

					try {
						form.submit();

					} catch (err) {
						// just in case form has element with name/id of 'submit'
						var submitFn = document.createElement('form').submit;

						submitFn.apply(form);
					}

				} finally {
					// reset attrs and remove "extra" input elements
					form.setAttribute('action', a);
					form.setAttribute('enctype', et); // #380
					if (t) {
						form.setAttribute('target', t);
					} else {
						$form.removeAttr('target');
					}
					$(extraInputs).remove();
				}
			}

			if (s.forceSync) {
				doSubmit();
			} else {
				setTimeout(doSubmit, 10); // this lets dom updates render
			}

			var data, doc, domCheckCount = 50, callbackProcessed;

			function cb(e) {
				if (xhr.aborted || callbackProcessed) {
					return;
				}

				doc = getDoc(io);
				if (!doc) {
					log('cannot access response document');
					e = SERVER_ABORT;
				}
				if (e === CLIENT_TIMEOUT_ABORT && xhr) {
					xhr.abort('timeout');
					deferred.reject(xhr, 'timeout');

					return;

				} else if (e === SERVER_ABORT && xhr) {
					xhr.abort('server abort');
					deferred.reject(xhr, 'error', 'server abort');

					return;
				}

				if (!doc || doc.location.href === s.iframeSrc) {
					// response not received yet
					if (!timedOut) {
						return;
					}
				}

				if (io.detachEvent) {
					io.detachEvent('onload', cb);
				} else {
					io.removeEventListener('load', cb, false);
				}

				var status = 'success', errMsg;

				try {
					if (timedOut) {
						throw 'timeout';
					}

					var isXml = s.dataType === 'xml' || doc.XMLDocument || $.isXMLDoc(doc);

					log('isXml=' + isXml);

					if (!isXml && window.opera && (doc.body === null || !doc.body.innerHTML)) {
						if (--domCheckCount) {
							// in some browsers (Opera) the iframe DOM is not always traversable when
							// the onload callback fires, so we loop a bit to accommodate
							log('requeing onLoad callback, DOM not available');
							setTimeout(cb, 250);

							return;
						}
						// let this fall through because server response could be an empty document
						// log('Could not access iframe DOM after mutiple tries.');
						// throw 'DOMException: not available';
					}

					// log('response detected');
					var docRoot = doc.body ? doc.body : doc.documentElement;

					xhr.responseText = docRoot ? docRoot.innerHTML : null;
					xhr.responseXML = doc.XMLDocument ? doc.XMLDocument : doc;
					if (isXml) {
						s.dataType = 'xml';
					}
					xhr.getResponseHeader = function(header){
						var headers = {'content-type': s.dataType};

						return headers[header.toLowerCase()];
					};
					// support for XHR 'status' & 'statusText' emulation :
					if (docRoot) {
						xhr.status = Number(docRoot.getAttribute('status')) || xhr.status;
						xhr.statusText = docRoot.getAttribute('statusText') || xhr.statusText;
					}

					var dt = (s.dataType || '').toLowerCase();
					var scr = /(json|script|text)/.test(dt);

					if (scr || s.textarea) {
						// see if user embedded response in textarea
						var ta = doc.getElementsByTagName('textarea')[0];

						if (ta) {
							xhr.responseText = ta.value;
							// support for XHR 'status' & 'statusText' emulation :
							xhr.status = Number(ta.getAttribute('status')) || xhr.status;
							xhr.statusText = ta.getAttribute('statusText') || xhr.statusText;

						} else if (scr) {
							// account for browsers injecting pre around json response
							var pre = doc.getElementsByTagName('pre')[0];
							var b = doc.getElementsByTagName('body')[0];

							if (pre) {
								xhr.responseText = pre.textContent ? pre.textContent : pre.innerText;
							} else if (b) {
								xhr.responseText = b.textContent ? b.textContent : b.innerText;
							}
						}

					} else if (dt === 'xml' && !xhr.responseXML && xhr.responseText) {
						xhr.responseXML = toXml(xhr.responseText);			// eslint-disable-line no-use-before-define
					}

					try {
						data = httpData(xhr, dt, s);						// eslint-disable-line no-use-before-define

					} catch (err) {
						status = 'parsererror';
						xhr.error = errMsg = (err || status);
					}

				} catch (err) {
					log('error caught: ', err);
					status = 'error';
					xhr.error = errMsg = (err || status);
				}

				if (xhr.aborted) {
					log('upload aborted');
					status = null;
				}

				if (xhr.status) { // we've set xhr.status
					status = ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) ? 'success' : 'error';
				}

				// ordering of these callbacks/triggers is odd, but that's how $.ajax does it
				if (status === 'success') {
					if (s.success) {
						s.success.call(s.context, data, 'success', xhr);
					}

					deferred.resolve(xhr.responseText, 'success', xhr);

					if (g) {
						$.event.trigger('ajaxSuccess', [xhr, s]);
					}

				} else if (status) {
					if (typeof errMsg === 'undefined') {
						errMsg = xhr.statusText;
					}
					if (s.error) {
						s.error.call(s.context, xhr, status, errMsg);
					}
					deferred.reject(xhr, 'error', errMsg);
					if (g) {
						$.event.trigger('ajaxError', [xhr, s, errMsg]);
					}
				}

				if (g) {
					$.event.trigger('ajaxComplete', [xhr, s]);
				}

				if (g && !--$.active) {
					$.event.trigger('ajaxStop');
				}

				if (s.complete) {
					s.complete.call(s.context, xhr, status);
				}

				callbackProcessed = true;
				if (s.timeout) {
					clearTimeout(timeoutHandle);
				}

				// clean up
				setTimeout(function() {
					if (!s.iframeTarget) {
						$io.remove();
					} else { // adding else to clean up existing iframe response.
						$io.attr('src', s.iframeSrc);
					}
					xhr.responseXML = null;
				}, 100);
			}

			var toXml = $.parseXML || function(s, doc) { // use parseXML if available (jQuery 1.5+)
				if (window.ActiveXObject) {
					doc = new ActiveXObject('Microsoft.XMLDOM');
					doc.async = 'false';
					doc.loadXML(s);

				} else {
					doc = (new DOMParser()).parseFromString(s, 'text/xml');
				}

				return (doc && doc.documentElement && doc.documentElement.nodeName !== 'parsererror') ? doc : null;
			};
			var parseJSON = $.parseJSON || function(s) {
				/* jslint evil:true */
				return window['eval']('(' + s + ')');			// eslint-disable-line dot-notation
			};

			var httpData = function(xhr, type, s) { // mostly lifted from jq1.4.4

				var ct = xhr.getResponseHeader('content-type') || '',
					xml = ((type === 'xml' || !type) && ct.indexOf('xml') >= 0),
					data = xml ? xhr.responseXML : xhr.responseText;

				if (xml && data.documentElement.nodeName === 'parsererror') {
					if ($.error) {
						$.error('parsererror');
					}
				}
				if (s && s.dataFilter) {
					data = s.dataFilter(data, type);
				}
				if (typeof data === 'string') {
					if ((type === 'json' || !type) && ct.indexOf('json') >= 0) {
						data = parseJSON(data);
					} else if ((type === 'script' || !type) && ct.indexOf('javascript') >= 0) {
						$.globalEval(data);
					}
				}

				return data;
			};

			return deferred;
		}
	};

	/**
	 * ajaxForm() provides a mechanism for fully automating form submission.
	 *
	 * The advantages of using this method instead of ajaxSubmit() are:
	 *
	 * 1: This method will include coordinates for <input type="image"> elements (if the element
	 *	is used to submit the form).
	 * 2. This method will include the submit element's name/value data (for the element that was
	 *	used to submit the form).
	 * 3. This method binds the submit() method to the form for you.
	 *
	 * The options argument for ajaxForm works exactly as it does for ajaxSubmit. ajaxForm merely
	 * passes the options argument along after properly binding events for submit elements and
	 * the form itself.
	 */
	$.fn.ajaxForm = function(options, data, dataType, onSuccess) {
		if (typeof options === 'string' || (options === false && arguments.length > 0)) {
			options = {
				'url'      : options,
				'data'     : data,
				'dataType' : dataType
			};

			if (typeof onSuccess === 'function') {
				options.success = onSuccess;
			}
		}

		options = options || {};
		options.delegation = options.delegation && $.isFunction($.fn.on);

		// in jQuery 1.3+ we can fix mistakes with the ready state
		if (!options.delegation && this.length === 0) {
			var o = {s: this.selector, c: this.context};

			if (!$.isReady && o.s) {
				log('DOM not ready, queuing ajaxForm');
				$(function() {
					$(o.s, o.c).ajaxForm(options);
				});

				return this;
			}

			// is your DOM ready?  http://docs.jquery.com/Tutorials:Introducing_$(document).ready()
			log('terminating; zero elements found by selector' + ($.isReady ? '' : ' (DOM not ready)'));

			return this;
		}

		if (options.delegation) {
			$(document)
				.off('submit.form-plugin', this.selector, doAjaxSubmit)
				.off('click.form-plugin', this.selector, captureSubmittingElement)
				.on('submit.form-plugin', this.selector, options, doAjaxSubmit)
				.on('click.form-plugin', this.selector, options, captureSubmittingElement);

			return this;
		}

		return this.ajaxFormUnbind()
			.on('submit.form-plugin', options, doAjaxSubmit)
			.on('click.form-plugin', options, captureSubmittingElement);
	};

	// private event handlers
	function doAjaxSubmit(e) {
		/* jshint validthis:true */
		var options = e.data;

		if (!e.isDefaultPrevented()) { // if event has been canceled, don't proceed
			e.preventDefault();
			$(e.target).closest('form').ajaxSubmit(options); // #365
		}
	}

	function captureSubmittingElement(e) {
		/* jshint validthis:true */
		var target = e.target;
		var $el = $(target);

		if (!$el.is('[type=submit],[type=image]')) {
			// is this a child element of the submit el?  (ex: a span within a button)
			var t = $el.closest('[type=submit]');

			if (t.length === 0) {
				return;
			}
			target = t[0];
		}

		var form = target.form;

		form.clk = target;

		if (target.type === 'image') {
			if (typeof e.offsetX !== 'undefined') {
				form.clk_x = e.offsetX;
				form.clk_y = e.offsetY;

			} else if (typeof $.fn.offset === 'function') {
				var offset = $el.offset();

				form.clk_x = e.pageX - offset.left;
				form.clk_y = e.pageY - offset.top;

			} else {
				form.clk_x = e.pageX - target.offsetLeft;
				form.clk_y = e.pageY - target.offsetTop;
			}
		}
		// clear form vars
		setTimeout(function() {
			form.clk = form.clk_x = form.clk_y = null;
		}, 100);
	}


	// ajaxFormUnbind unbinds the event handlers that were bound by ajaxForm
	$.fn.ajaxFormUnbind = function() {
		return this.off('submit.form-plugin click.form-plugin');
	};

	/**
	 * formToArray() gathers form element data into an array of objects that can
	 * be passed to any of the following ajax functions: $.get, $.post, or load.
	 * Each object in the array has both a 'name' and 'value' property. An example of
	 * an array for a simple login form might be:
	 *
	 * [ { name: 'username', value: 'jresig' }, { name: 'password', value: 'secret' } ]
	 *
	 * It is this array that is passed to pre-submit callback functions provided to the
	 * ajaxSubmit() and ajaxForm() methods.
	 */
	$.fn.formToArray = function(semantic, elements, filtering) {
		var a = [];

		if (this.length === 0) {
			return a;
		}

		var form = this[0];
		var formId = this.attr('id');
		var els = (semantic || typeof form.elements === 'undefined') ? form.getElementsByTagName('*') : form.elements;
		var els2;

		if (els) {
			els = $.makeArray(els); // convert to standard array
		}

		// #386; account for inputs outside the form which use the 'form' attribute
		// FinesseRus: in non-IE browsers outside fields are already included in form.elements.
		if (formId && (semantic || /(Edge|Trident)\//.test(navigator.userAgent))) {
			els2 = $(':input[form="' + formId + '"]').get(); // hat tip @thet
			if (els2.length) {
				els = (els || []).concat(els2);
			}
		}

		if (!els || !els.length) {
			return a;
		}

		if ($.isFunction(filtering)) {
			els = $.map(els, filtering);
		}

		var i, j, n, v, el, max, jmax;

		for (i = 0, max = els.length; i < max; i++) {
			el = els[i];
			n = el.name;
			if (!n || el.disabled) {
				continue;
			}

			if (semantic && form.clk && el.type === 'image') {
				// handle image inputs on the fly when semantic == true
				if (form.clk === el) {
					a.push({name: n, value: $(el).val(), type: el.type});
					a.push({name: n + '.x', value: form.clk_x}, {name: n + '.y', value: form.clk_y});
				}
				continue;
			}

			v = $.fieldValue(el, true);
			if (v && v.constructor === Array) {
				if (elements) {
					elements.push(el);
				}
				for (j = 0, jmax = v.length; j < jmax; j++) {
					a.push({name: n, value: v[j]});
				}

			} else if (feature.fileapi && el.type === 'file') {
				if (elements) {
					elements.push(el);
				}

				var files = el.files;

				if (files.length) {
					for (j = 0; j < files.length; j++) {
						a.push({name: n, value: files[j], type: el.type});
					}
				} else {
					// #180
					a.push({name: n, value: '', type: el.type});
				}

			} else if (v !== null && typeof v !== 'undefined') {
				if (elements) {
					elements.push(el);
				}
				a.push({name: n, value: v, type: el.type, required: el.required});
			}
		}

		if (!semantic && form.clk) {
			// input type=='image' are not found in elements array! handle it here
			var $input = $(form.clk), input = $input[0];

			n = input.name;

			if (n && !input.disabled && input.type === 'image') {
				a.push({name: n, value: $input.val()});
				a.push({name: n + '.x', value: form.clk_x}, {name: n + '.y', value: form.clk_y});
			}
		}

		return a;
	};

	/**
	 * Serializes form data into a 'submittable' string. This method will return a string
	 * in the format: name1=value1&amp;name2=value2
	 */
	$.fn.formSerialize = function(semantic) {
		// hand off to jQuery.param for proper encoding
		return $.param(this.formToArray(semantic));
	};

	/**
	 * Serializes all field elements in the jQuery object into a query string.
	 * This method will return a string in the format: name1=value1&amp;name2=value2
	 */
	$.fn.fieldSerialize = function(successful) {
		var a = [];

		this.each(function() {
			var n = this.name;

			if (!n) {
				return;
			}

			var v = $.fieldValue(this, successful);

			if (v && v.constructor === Array) {
				for (var i = 0, max = v.length; i < max; i++) {
					a.push({name: n, value: v[i]});
				}

			} else if (v !== null && typeof v !== 'undefined') {
				a.push({name: this.name, value: v});
			}
		});

		// hand off to jQuery.param for proper encoding
		return $.param(a);
	};

	/**
	 * Returns the value(s) of the element in the matched set. For example, consider the following form:
	 *
	 *	<form><fieldset>
	 *		<input name="A" type="text">
	 *		<input name="A" type="text">
	 *		<input name="B" type="checkbox" value="B1">
	 *		<input name="B" type="checkbox" value="B2">
	 *		<input name="C" type="radio" value="C1">
	 *		<input name="C" type="radio" value="C2">
	 *	</fieldset></form>
	 *
	 *	var v = $('input[type=text]').fieldValue();
	 *	// if no values are entered into the text inputs
	 *	v === ['','']
	 *	// if values entered into the text inputs are 'foo' and 'bar'
	 *	v === ['foo','bar']
	 *
	 *	var v = $('input[type=checkbox]').fieldValue();
	 *	// if neither checkbox is checked
	 *	v === undefined
	 *	// if both checkboxes are checked
	 *	v === ['B1', 'B2']
	 *
	 *	var v = $('input[type=radio]').fieldValue();
	 *	// if neither radio is checked
	 *	v === undefined
	 *	// if first radio is checked
	 *	v === ['C1']
	 *
	 * The successful argument controls whether or not the field element must be 'successful'
	 * (per http://www.w3.org/TR/html4/interact/forms.html#successful-controls).
	 * The default value of the successful argument is true. If this value is false the value(s)
	 * for each element is returned.
	 *
	 * Note: This method *always* returns an array. If no valid value can be determined the
	 *	array will be empty, otherwise it will contain one or more values.
	 */
	$.fn.fieldValue = function(successful) {
		for (var val = [], i = 0, max = this.length; i < max; i++) {
			var el = this[i];
			var v = $.fieldValue(el, successful);

			if (v === null || typeof v === 'undefined' || (v.constructor === Array && !v.length)) {
				continue;
			}

			if (v.constructor === Array) {
				$.merge(val, v);
			} else {
				val.push(v);
			}
		}

		return val;
	};

	/**
	 * Returns the value of the field element.
	 */
	$.fieldValue = function(el, successful) {
		var n = el.name, t = el.type, tag = el.tagName.toLowerCase();

		if (typeof successful === 'undefined') {
			successful = true;
		}

		/* eslint-disable no-mixed-operators */
		if (successful && (!n || el.disabled || t === 'reset' || t === 'button' ||
			(t === 'checkbox' || t === 'radio') && !el.checked ||
			(t === 'submit' || t === 'image') && el.form && el.form.clk !== el ||
			tag === 'select' && el.selectedIndex === -1)) {
		/* eslint-enable no-mixed-operators */
			return null;
		}

		if (tag === 'select') {
			var index = el.selectedIndex;

			if (index < 0) {
				return null;
			}

			var a = [], ops = el.options;
			var one = (t === 'select-one');
			var max = (one ? index + 1 : ops.length);

			for (var i = (one ? index : 0); i < max; i++) {
				var op = ops[i];

				if (op.selected && !op.disabled) {
					var v = op.value;

					if (!v) { // extra pain for IE...
						v = (op.attributes && op.attributes.value && !(op.attributes.value.specified)) ? op.text : op.value;
					}

					if (one) {
						return v;
					}

					a.push(v);
				}
			}

			return a;
		}

		return $(el).val().replace(rCRLF, '\r\n');
	};

	/**
	 * Clears the form data. Takes the following actions on the form's input fields:
	 *  - input text fields will have their 'value' property set to the empty string
	 *  - select elements will have their 'selectedIndex' property set to -1
	 *  - checkbox and radio inputs will have their 'checked' property set to false
	 *  - inputs of type submit, button, reset, and hidden will *not* be effected
	 *  - button elements will *not* be effected
	 */
	$.fn.clearForm = function(includeHidden) {
		return this.each(function() {
			$('input,select,textarea', this).clearFields(includeHidden);
		});
	};

	/**
	 * Clears the selected form elements.
	 */
	$.fn.clearFields = $.fn.clearInputs = function(includeHidden) {
		var re = /^(?:color|date|datetime|email|month|number|password|range|search|tel|text|time|url|week)$/i; // 'hidden' is not in this list

		return this.each(function() {
			var t = this.type, tag = this.tagName.toLowerCase();

			if (re.test(t) || tag === 'textarea') {
				this.value = '';

			} else if (t === 'checkbox' || t === 'radio') {
				this.checked = false;

			} else if (tag === 'select') {
				this.selectedIndex = -1;

			} else if (t === 'file') {
				if (/MSIE/.test(navigator.userAgent)) {
					$(this).replaceWith($(this).clone(true));
				} else {
					$(this).val('');
				}

			} else if (includeHidden) {
				// includeHidden can be the value true, or it can be a selector string
				// indicating a special test; for example:
				// $('#myForm').clearForm('.special:hidden')
				// the above would clean hidden inputs that have the class of 'special'
				if ((includeHidden === true && /hidden/.test(t)) ||
					(typeof includeHidden === 'string' && $(this).is(includeHidden))) {
					this.value = '';
				}
			}
		});
	};


	/**
	 * Resets the form data or individual elements. Takes the following actions
	 * on the selected tags:
	 * - all fields within form elements will be reset to their original value
	 * - input / textarea / select fields will be reset to their original value
	 * - option / optgroup fields (for multi-selects) will defaulted individually
	 * - non-multiple options will find the right select to default
	 * - label elements will be searched against its 'for' attribute
	 * - all others will be searched for appropriate children to default
	 */
	$.fn.resetForm = function() {
		return this.each(function() {
			var el = $(this);
			var tag = this.tagName.toLowerCase();

			switch (tag) {
			case 'input':
				this.checked = this.defaultChecked;
					// fall through

			case 'textarea':
				this.value = this.defaultValue;

				return true;

			case 'option':
			case 'optgroup':
				var select = el.parents('select');

				if (select.length && select[0].multiple) {
					if (tag === 'option') {
						this.selected = this.defaultSelected;
					} else {
						el.find('option').resetForm();
					}
				} else {
					select.resetForm();
				}

				return true;

			case 'select':
				el.find('option').each(function(i) {				// eslint-disable-line consistent-return
					this.selected = this.defaultSelected;
					if (this.defaultSelected && !el[0].multiple) {
						el[0].selectedIndex = i;

						return false;
					}
				});

				return true;

			case 'label':
				var forEl = $(el.attr('for'));
				var list = el.find('input,select,textarea');

				if (forEl[0]) {
					list.unshift(forEl[0]);
				}

				list.resetForm();

				return true;

			case 'form':
					// guard against an input with the name of 'reset'
					// note that IE reports the reset function as an 'object'
				if (typeof this.reset === 'function' || (typeof this.reset === 'object' && !this.reset.nodeType)) {
					this.reset();
				}

				return true;

			default:
				el.find('form,input,label,select,textarea').resetForm();

				return true;
			}
		});
	};

	/**
	 * Enables or disables any matching elements.
	 */
	$.fn.enable = function(b) {
		if (typeof b === 'undefined') {
			b = true;
		}

		return this.each(function() {
			this.disabled = !b;
		});
	};

	/**
	 * Checks/unchecks any matching checkboxes or radio buttons and
	 * selects/deselects and matching option elements.
	 */
	$.fn.selected = function(select) {
		if (typeof select === 'undefined') {
			select = true;
		}

		return this.each(function() {
			var t = this.type;

			if (t === 'checkbox' || t === 'radio') {
				this.checked = select;

			} else if (this.tagName.toLowerCase() === 'option') {
				var $sel = $(this).parent('select');

				if (select && $sel[0] && $sel[0].type === 'select-one') {
					// deselect all other options
					$sel.find('option').selected(false);
				}

				this.selected = select;
			}
		});
	};

	// expose debug var
	$.fn.ajaxSubmit.debug = false;

	// helper fn for console logging
	function log() {
		if (!$.fn.ajaxSubmit.debug) {
			return;
		}

		var msg = '[jquery.form] ' + Array.prototype.join.call(arguments, '');

		if (window.console && window.console.log) {
			window.console.log(msg);

		} else if (window.opera && window.opera.postError) {
			window.opera.postError(msg);
		}
	}
}));

/* Modal pattern.
 *
 * Options:
 *    height(string): Set the height of the modal, for example: 250px ('')
 *    width(string): Set the width of the modal, for example: 80% or 500px. ('')
 *    margin(function or integer): A function, Integer or String which will be used to set the margin of the modal in pixels. If a function is passed it must return an Integer. (20)
 *    position(string): Position the modal relative to the window with the format: "<horizontal> <vertical>" -- allowed values: top, bottom, left, right, center, middle. ('center middle')
 *    triggers(array): Add event listeners to elements on the page which will open the modal when triggered. Pass an Array of strings with the format ["&lt;event&gt; &lt;selector&gt;"] or ["&lt;event&gt;"]. For example, ["click .someButton"]. If you pass in only an event such as, ["change"], the event listener will be added to the element on which the modal was initiated, usually a link or button. ([])
 *    title(string): A string to place in the modal header. If title is provided, titleSelector is not used. (null)
 *    titleSelector(string): Selector for an element to extract from the content provided to the modal and place in the modal header. ('h1:first')
 *    content(string): Selector for an element within the content provided to the modal to use as the modal body. ('#content')
 *    prependContent(string): Selector for elements within the content provided to the modal which will be collected and inserted, by default above, the modal content. This is useful for extracting things like alerts or status messages on forms and displaying them to the user after an AJAX response. ('.portalMessage')
 *    backdrop(string): Selector for the element upon which the Backdrop pattern should be initiated. The Backdrop is a full width mask that will be apply above the content behind the modal which is useful for highlighting the modal dialog to the user. ('body')
 *    backdropOptions(object): Look at options at backdrop pattern. ({ zIndex: "1040", opacity: "0.8", className: "backdrop", classActiveName: "backdrop-active", closeOnEsc: true, closeOnClick: true })
 *    buttons(string): Selector for matching elements, usually buttons, inputs or links, from the modal content to place in the modal footer. The original elements in the content will be hidden. ('.formControls > input[type="submit"]')
 *    automaticallyAddButtonActions(boolean): Automatically create actions for elements matched with the buttons selector. They will use the options provided in actionOptions. (true)
 *    loadLinksWithinModal(boolean): Automatically load links inside of the modal using AJAX. (true)
 *    actionOptions(object): A hash of selector to options. Where options can include any of the defaults from actionOptions. Allows for the binding of events to elements in the content and provides options for handling ajax requests and displaying them in the modal. ({})
 *        onSuccess(Function|string): function which is called with parameters (modal, response, state, xhr, form) when form has been successfully submitted. if value is a string, this is the name of a function at window level
 *        onFormError(Function|string): function which is called with parameters (modal, response, state, xhr, form) when backend has sent an error after form submission. if value is a string, this is the name of a function at window level
 *        onError(Function|string): function which is called with parameters (xhr, textStatus, errorStatus) when form submission has failed. if value is a string, this is the name of a function at window level
 *
 *
 * Documentation:
 *    # Example
 *
 *    {{ example-basic }}
 *
 *    {{ example-long }}
 *
 *    {{ example-tinymce }}
 *
 *
 * Example: example-basic
 *    <a href="#modal1" class="plone-btn plone-btn-large plone-btn-primary pat-plone-modal"
 *                      data-pat-plone-modal="width: 400">Modal basic</a>
 *    <div id="modal1" style="display: none">
 *      <h1>Basic modal!</h1>
 *      <p>Indeed. Whoa whoa whoa whoa. Wait.</p>
 *    </div>
 *
 * Example: example-long
 *    <a href="#modal2" class="plone-btn plone-btn-lg plone-btn-primary pat-plone-modal"
 *                      data-pat-plone-modal="width: 500">Modal long scrolling</a>
 *    <div id="modal2" style="display: none">
 *      <h1>Basic with scrolling</h1>
 *      <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua</p>
 *      <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
 *      <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua</p>
 *      <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
 *      <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua</p>
 *      <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
 *      <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua</p>
 *      <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
 *      <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua</p>
 *      <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
 *      <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua</p>
 *    </div>
 *
 *
 * Example: example-tinymce
 *    <a href="#modaltinymce" class="btn btn-lg btn-primary pat-plone-modal"
 *       data-pat-plone-modal="height: 600px;
 *                       width: 80%">
 *       Modal with TinyMCE</a>
 *    <div id="modaltinymce" style="display:none">
 *      <textarea class="pat-tinymce"></textarea>
 *    </div>
 *
 */

define('mockup-patterns-modal',[
  'jquery',
  'underscore',
  'pat-base',
  'mockup-patterns-backdrop',
  'pat-registry',
  'mockup-router',
  'mockup-utils',
  'translate',
  'jquery.form'
], function($, _, Base, Backdrop, registry, Router, utils, _t) {
  'use strict';

  var Modal = Base.extend({
    name: 'plone-modal',
    trigger: '.pat-plone-modal',
    parser: 'mockup',
    createModal: null,
    $model: null,
    defaults: {
      width: '',
      height: '',
      margin: 20,
      position: 'center middle', // format: '<horizontal> <vertical>' -- allowed values: top, bottom, left, right, center, middle
      triggers: [],
      zIndexSelector: '.plone-modal-wrapper,.plone-modal-backdrop',
      backdrop: 'body', // Element to initiate the Backdrop on.
      backdropOptions: {
        zIndex: '1040',
        opacity: '0.85',
        className: 'plone-modal-backdrop',
        classActiveName: 'plone-backdrop-active',
        closeOnEsc: true,
        closeOnClick: true
      },
      title: null,
      titleSelector: 'h1:first',
      buttons: '.formControls > input[type="submit"], .formControls > button',
      content: '#content',
      automaticallyAddButtonActions: true,
      loadLinksWithinModal: true,
      prependContent: '.portalMessage, #global_statusmessage',
      onRender: null,
      templateOptions: {
        className: 'plone-modal fade',
        classDialog: 'plone-modal-dialog',
        classModal: 'plone-modal-content',
        classHeaderName: 'plone-modal-header',
        classBodyName: 'plone-modal-body',
        classFooterName: 'plone-modal-footer',
        classWrapperName: 'plone-modal-wrapper',
        classWrapperInnerName: 'modal-wrapper-inner',
        classActiveName: 'in',
        classPrependName: '', // String, css class to be applied to the wrapper of the prepended content
        classContentName: '',  // String, class name to be applied to the content of the modal, useful for modal specific styling
        template: '' +
          '<div class="<%= options.className %>">' +
          '  <div class="<%= options.classDialog %>">' +
          '    <div class="<%= options.classModal %>">' +
          '      <div class="<%= options.classHeaderName %>">' +
          '        <a class="plone-modal-close">&times;</a>' +
          '        <% if (title) { %><h2 class="plone-modal-title"><%= title %></h2><% } %>' +
          '      </div>' +
          '      <div class="<%= options.classBodyName %>">' +
          '        <div class="<%= options.classPrependName %>"><%= prepend %></div> ' +
          '        <div class="<%= options.classContentName %>"><%= content %></div>' +
          '      </div>' +
          '      <div class="<%= options.classFooterName %>"> ' +
          '        <% if (buttons) { %><%= buttons %><% } %>' +
          '      </div>' +
          '    </div>' +
          '  </div>' +
          '</div>'
      },
      actions: {},
      actionOptions: {
        eventType: 'click',
        disableAjaxFormSubmit: false,
        target: null,
        ajaxUrl: null, // string, or function($el, options) that returns a string
        modalFunction: null, // String, function name on self to call
        isForm: false,
        timeout: 5000,
        displayInModal: true,
        reloadWindowOnClose: true,
        error: '.portalMessage.error, .alert-danger',
        formFieldError: '.field.error',
        onSuccess: null,
        onError: null,
        onFormError: null,
        onTimeout: null,
        redirectOnResponse: false,
        redirectToUrl: function($action, response, options) {
          var reg;
          reg = /<body.*data-view-url=[\"'](.*)[\"'].*/im.exec(response);
          if (reg && reg.length > 1) {
            // view url as data attribute on body (Plone 5)
            return reg[1].split('"')[0];
          }
          reg = /<body.*data-base-url=[\"'](.*)[\"'].*/im.exec(response);
          if (reg && reg.length > 1) {
            // Base url as data attribute on body (Plone 5)
            return reg[1].split('"')[0];
          }
          reg = /<base.*href=[\"'](.*)[\"'].*/im.exec(response);
          if (reg && reg.length > 1) {
              // base tag available (Plone 4)
              return reg[1];
          }
          return '';
        }
      },
      routerOptions: {
        id: null,
        pathExp: null
      },
      form: function(actions) {
        var self = this;
        var $modal = self.$modal;

        if (self.options.automaticallyAddButtonActions) {
          actions[self.options.buttons] = {};
        }
        actions.a = {};

        $.each(actions, function(action, options) {
          var actionKeys = _.union(_.keys(self.options.actionOptions), ['templateOptions']);
          var actionOptions = $.extend(true, {}, self.options.actionOptions, _.pick(options, actionKeys));
          options.templateOptions = $.extend(true, options.templateOptions, self.options.templateOptions);

          var patternKeys = _.union(_.keys(self.options.actionOptions), ['actions', 'actionOptions']);
          var patternOptions = $.extend(true, _.omit(options, patternKeys), self.options);

          $(action, $('.' + options.templateOptions.classBodyName, $modal)).each(function(action) {
            var $action = $(this);
            $action.on(actionOptions.eventType, function(e) {
              e.stopPropagation();
              e.preventDefault();

              self.loading.show(false);

              // handle event on $action using a function on self
              if (actionOptions.modalFunction !== null) {
                self[actionOptions.modalFunction]();
              // handle event on input/button using jquery.form library
              } else if ($.nodeName($action[0], 'input') || $.nodeName($action[0], 'button') || options.isForm === true) {
                self.options.handleFormAction.apply(self, [$action, actionOptions, patternOptions]);
              // handle event on link with jQuery.ajax
              } else if (options.ajaxUrl !== null || $.nodeName($action[0], 'a')) {
                self.options.handleLinkAction.apply(self, [$action, actionOptions, patternOptions]);
              }

            });
          });
        });
      },
      handleFormAction: function($action, options, patternOptions) {
        var self = this;

        // pass action that was clicked when submiting form
        var extraData = {};
        extraData[$action.attr('name')] = $action.attr('value');

        var $form;

        if ($.nodeName($action[0], 'form')) {
          $form = $action;
        } else {
          $form = $action.parents('form:not(.disableAutoSubmit)');
        }

        var url;
        if (options.ajaxUrl !== null) {
          if (typeof options.ajaxUrl === 'function') {
            url = options.ajaxUrl.apply(self, [$action, options]);
          } else {
            url = options.ajaxUrl;
          }
        } else {
          url = $action.parents('form').attr('action');
        }

        if(options.disableAjaxFormSubmit){
          if($action.attr('name') && $action.attr('value')){
            $form.append($('<input type="hidden" name="' + $action.attr('name') + '" value="' + $action.attr('value') + '" />'));
          }
          $form.trigger('submit');
          return;
        }
        // We want to trigger the form submit event but NOT use the default
        $form.on('submit', function(e) {
          e.preventDefault();
        });
        $form.trigger('submit');

        self.loading.show(false);
        $form.ajaxSubmit({
          timeout: options.timeout,
          data: extraData,
          url: url,
          error: function(xhr, textStatus, errorStatus) {
            self.loading.hide();
            if (textStatus === 'timeout' && options.onTimeout) {
              options.onTimeout.apply(self, xhr, errorStatus);
            // on "error", "abort", and "parsererror"
            } else if (options.onError) {
              if (typeof options.onError === 'string') {
                window[options.onError](xhr, textStatus, errorStatus);
              } else {
                  options.onError(xhr, textStatus, errorStatus);
              }
            } else {
              // window.alert(_t('There was an error submitting the form.'));
              console.log('error happened', textStatus, ' do something');
            }
            self.emit('formActionError', [xhr, textStatus, errorStatus]);
          },
          success: function(response, state, xhr, form) {
            self.loading.hide();
            // if error is found (NOTE: check for both the portal errors
            // and the form field-level errors)
            if ($(options.error, response).size() !== 0 ||
                $(options.formFieldError, response).size() !== 0) {
              if (options.onFormError) {
                if (typeof options.onFormError === 'string') {
                  window[options.onFormError](self, response, state, xhr, form);
                } else {
                  options.onFormError(self, response, state, xhr, form);
                }
              } else {
                self.redraw(response, patternOptions);
              }
              return;
            }

            if (options.redirectOnResponse === true) {
              if (typeof options.redirectToUrl === 'function') {
                window.parent.location.href = options.redirectToUrl.apply(self, [$action, response, options]);
              } else {
                window.parent.location.href = options.redirectToUrl;
              }
              return; // cut out right here since we're changing url
            }

            if (options.onSuccess) {
              if (typeof options.onSuccess === 'string') {
                window[options.onSuccess](self, response, state, xhr, form);
              } else {
                  options.onSuccess(self, response, state, xhr, form);
              }
            }

            if (options.displayInModal === true) {
              self.redraw(response, patternOptions);
            } else {
              $action.trigger('destroy.plone-modal.patterns');
              // also calls hide
              if (options.reloadWindowOnClose) {
                self.reloadWindow();
              }
            }
            self.emit('formActionSuccess', [response, state, xhr, form]);
          }
        });
      },
      handleLinkAction: function($action, options, patternOptions) {
        var self = this;
        var url;
        if ($action.hasClass('pat-plone-modal')) {
          // if link is a modal pattern, do not reload the page
          return ;
        }

        // Figure out URL
        if (options.ajaxUrl) {
          if (typeof options.ajaxUrl === 'function') {
            url = options.ajaxUrl.apply(self, [$action, options]);
          } else {
            url = options.ajaxUrl;
          }
        } else {
          url = $action.attr('href');
        }

        // Non-ajax link (I know it says "ajaxUrl" ...)
        if (options.displayInModal === false) {
          if($action.attr('target') === '_blank'){
            window.open(url, '_blank');
            self.loading.hide();
          }else{
            window.location = url;
          }
          return;
        }

        // ajax version
        $.ajax({
          url: url
        }).fail(function(xhr, textStatus, errorStatus) {
          if (textStatus === 'timeout' && options.onTimeout) {
            options.onTimeout(self.$modal, xhr, errorStatus);

          // on "error", "abort", and "parsererror"
          } else if (options.onError) {
            options.onError(xhr, textStatus, errorStatus);
          } else {
            window.alert(_t('There was an error loading modal.'));
          }
          self.emit('linkActionError', [xhr, textStatus, errorStatus]);
        }).done(function(response, state, xhr) {
          self.redraw(response, patternOptions);
          if (options.onSuccess) {
            if (typeof options.onSuccess === 'string') {
              window[options.onSuccess](self, response, state, xhr);
            } else {
                options.onSuccess(self, response, state, xhr);
            }
          }

          self.emit('linkActionSuccess', [response, state, xhr]);
        }).always(function(){
          self.loading.hide();
        });
      },
      render: function(options) {
        var self = this;

        self.emit('before-render');

        if (!self.$raw) {
          return;
        }
        var $raw = self.$raw.clone();
        // fix for IE9 bug (see http://bugs.jquery.com/ticket/10550)
        $('input:checked', $raw).each(function() {
          if (this.setAttribute) {
            this.setAttribute('checked', 'checked');
          }
        });

        // Object that will be passed to the template
        var tplObject = {
          title: '',
          prepend: '<div />',
          content: '',
          buttons: '<div class="pattern-modal-buttons"></div>',
          options: options.templateOptions
        };

        // setup the Title
        if (options.title === null) {
          var $title = $(options.titleSelector, $raw);
          tplObject.title = $title.html();
          $(options.titleSelector, $raw).remove();
        } else {
          tplObject.title = options.title;
        }

        // Grab items to to insert into the prepend area
        if (options.prependContent) {
          tplObject.prepend = $('<div />').append($(options.prependContent, $raw).clone()).html();
          $(options.prependContent, $raw).remove();
        }

        // Filter out the content if there is a selector provided
        if (options.content) {
          tplObject.content = $(options.content, $raw).html();
        } else {
          tplObject.content = $raw.html();
        }

        // Render html
        self.$modal = $(_.template(self.options.templateOptions.template)(tplObject));
        self.$modalDialog = $('> .' + self.options.templateOptions.classDialog, self.$modal);
        self.$modalContent = $('> .' + self.options.templateOptions.classModal, self.$modalDialog);

        // In most browsers, when you hit the enter key while a form element is focused
        // the browser will trigger the form 'submit' event.  Google Chrome also does this,
        // but not when when the default submit button is hidden with 'display: none'.
        // The following code will work around this issue:
        $('form', self.$modal).on ('keydown', function (event) {
          // ignore keys which are not enter, and ignore enter inside a textarea.
          if (event.keyCode !== 13 || event.target.nodeName === 'TEXTAREA') {
            return;
          }
          event.preventDefault();
          $('input[type=submit], button[type=submit], button:not(type)', this).eq(0).trigger('click');
        });

        // Setup buttons
        $(options.buttons, self.$modal).each(function() {
          var $button = $(this);
          $button
            .on('click', function(e) {
              e.stopPropagation();
              e.preventDefault();
            })
            .clone()
            .appendTo($('.pattern-modal-buttons', self.$modal))
            .off('click').on('click', function(e) {
              e.stopPropagation();
              e.preventDefault();
              $button.trigger('click');
            });
          $button.hide();
        });

        self.emit('before-events-setup');

        // Wire up events
        $('.plone-modal-header > a.plone-modal-close, .plone-modal-footer > a.plone-modal-close', self.$modal)
          .off('click')
          .on('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            $(e.target).trigger('destroy.plone-modal.patterns');
          });

        // form
        if (options.form) {
          options.form.apply(self, [options.actions]);
        }

        self.$modal
          .addClass(self.options.templateOptions.className)
          .on('destroy.plone-modal.patterns', function(e) {
            e.stopPropagation();
            self.hide();
          })
          .on('resize.plone-modal.patterns', function(e) {
            e.stopPropagation();
            e.preventDefault();
            self.positionModal();
          })
          .appendTo(self.$wrapperInner);

        if (self.options.loadLinksWithinModal) {
          self.$modal.on('click', function(e) {
            e.stopPropagation();
            if ($.nodeName(e.target, 'a')) {
              e.preventDefault();
              // TODO: open links inside modal
              // and slide modal body
            }
            self.$modal.trigger('modal-click');
          });
        }
        self.$modal.data('pattern-' + self.name, self);
        self.emit('after-render');
        if (options.onRender) {
          if (typeof options.onRender === 'string') {
            window[options.onRender](self);
          } else {
              options.onRender(self);
          }
        }

      }
    },
    reloadWindow: function() {
      window.parent.location.reload();
    },
    init: function() {
      var self = this;
      self.options.loadLinksWithinModal = $.parseJSON(self.options.loadLinksWithinModal);

      // Router
      if (self.options.routerOptions.id !== null) {
        Router.addRoute('modal', self.options.routerOptions.id, function() {
          this.show();
        }, self, self.options.routerOptions.pathExp, self.options.routerOptions.expReplace);
      }

      if (self.options.backdropOptions.closeOnEsc === true) {
        $(document).on('keydown', function(e, data) {
          if (self.$el.is('.' + self.options.templateOptions.classActiveName)) {
            if (e.keyCode === 27) {  // ESC key pressed
              self.hide();
            }
          }
        });
      }




      $(window.parent).resize(function() {
        self.positionModal();
      });

      if (self.options.triggers) {
        $.each(self.options.triggers, function(i, item) {
          var e = item.substring(0, item.indexOf(' '));
          var selector = item.substring(item.indexOf(' '), item.length);
          $(selector || self.$el).on(e, function(e) {
            e.stopPropagation();
            e.preventDefault();
            self.show();
          });
        });
      }

      if (self.$el.is('a')) {
        if (self.$el.attr('href') && !self.options.image) {
          if (!self.options.target && self.$el.attr('href').substr(0, 1) === '#') {
            self.options.target = self.$el.attr('href');
            self.options.content = '';
          }
          if (!self.options.ajaxUrl && self.$el.attr('href').substr(0, 1) !== '#') {
            self.options.ajaxUrl = function () {
              // Resolve ``href`` attribute later, when modal is shown.
              return self.$el.attr('href');
            };
          }
        }
        self.$el.on('click', function(e) {
          e.stopPropagation();
          e.preventDefault();
          self.show();
        });
      }
      self.initModal();
    },

    createAjaxModal: function() {
      var self = this;
      self.emit('before-ajax');
      self.loading.show();

      var ajaxUrl = self.options.ajaxUrl;
      if (typeof ajaxUrl === 'function') {
        ajaxUrl = ajaxUrl.apply(self, [self.options]);
      }

      self.ajaxXHR = $.ajax({
        url: ajaxUrl,
        type: self.options.ajaxType
      }).done(function(response, textStatus, xhr) {
        self.ajaxXHR = undefined;
        self.$raw = $('<div />').append($(utils.parseBodyTag(response)));
        self.emit('after-ajax', self, textStatus, xhr);
        self._show();
      }).fail(function(xhr, textStatus, errorStatus){
        var options = self.options.actionOptions;
        if (textStatus === 'timeout' && options.onTimeout) {
          options.onTimeout(self.$modal, xhr, errorStatus);
        } else if (options.onError) {
          options.onError(xhr, textStatus, errorStatus);
        } else {
          window.alert(_t('There was an error loading modal.'));
          self.hide();
        }
        self.emit('linkActionError', [xhr, textStatus, errorStatus]);
      }).always(function(){
        self.loading.hide();
      });
    },

    createTargetModal: function() {
      var self = this;
      self.$raw = $(self.options.target).clone();
      self._show();
    },

    createBasicModal: function() {
      var self = this;
      self.$raw = $('<div/>').html(self.$el.clone());
      self._show();
    },

    createHtmlModal: function() {
      var self = this;
      var $el = $(self.options.html);
      self.$raw = $el;
      self._show();
    },

    createImageModal: function(){
      var self = this;
      self.$wrapper.addClass('image-modal');
      var src = self.$el.attr('href');
      var srcset = self.$el.attr('data-modal-srcset') || '';
      var title = $.trim(self.$el.context.innerText) || 'Image';
      // XXX aria?
      self.$raw = $('<div><h1>' + title + '</h1><div id="content"><div class="modal-image"><img src="' + src + '" srcset="' + srcset + '" /></div></div></div>');
      self._show();
    },

    initModal: function() {
      var self = this;
      if (self.options.ajaxUrl) {
        self.createModal = self.createAjaxModal;
      } else if (self.options.target) {
        self.createModal = self.createTargetModal;
      } else if (self.options.html) {
        self.createModal = self.createHtmlModal;
      } else if (self.options.image){
        self.createModal = self.createImageModal;
      } else {
        self.createModal = self.createBasicModal;
      }
    },

    findPosition: function(horpos, vertpos, margin, modalWidth, modalHeight,
                           wrapperInnerWidth, wrapperInnerHeight) {
      var returnpos = {};
      var absTop, absBottom, absLeft, absRight;
      absRight = absLeft = absTop = absLeft = 'auto';

      // -- HORIZONTAL POSITION -----------------------------------------------
      if (horpos === 'left') {
        absLeft = margin + 'px';
        // if the width of the wrapper is smaller than the modal, and thus the
        // screen is smaller than the modal, force the left to simply be 0
        if (modalWidth > wrapperInnerWidth) {
          absLeft = '0px';
        }
        returnpos.left = absLeft;
      }
      else if (horpos === 'right') {
        absRight =  margin + 'px';
        // if the width of the wrapper is smaller than the modal, and thus the
        // screen is smaller than the modal, force the right to simply be 0
        if (modalWidth > wrapperInnerWidth) {
          absRight = '0px';
        }
        returnpos.right = absRight;
        returnpos.left = 'auto';
      }
      // default, no specified location, is to center
      else {
        absLeft = ((wrapperInnerWidth / 2) - (modalWidth / 2) - margin) + 'px';
        // if the width of the wrapper is smaller than the modal, and thus the
        // screen is smaller than the modal, force the left to simply be 0
        if (modalWidth > wrapperInnerWidth) {
          absLeft = '0px';
        }
        returnpos.left = absLeft;
      }

      // -- VERTICAL POSITION -------------------------------------------------
      if (vertpos === 'top') {
        absTop = margin + 'px';
        // if the height of the wrapper is smaller than the modal, and thus the
        // screen is smaller than the modal, force the top to simply be 0
        if (modalHeight > wrapperInnerHeight) {
          absTop = '0px';
        }
        returnpos.top = absTop;
      }
      else if (vertpos === 'bottom') {
        absBottom = margin + 'px';
        // if the height of the wrapper is smaller than the modal, and thus the
        // screen is smaller than the modal, force the bottom to simply be 0
        if (modalHeight > wrapperInnerHeight) {
          absBottom = '0px';
        }
        returnpos.bottom = absBottom;
        returnpos.top = 'auto';
      }
      else {
        // default case, no specified location, is to center
        absTop = ((wrapperInnerHeight / 2) - (modalHeight / 2) - margin) + 'px';
        // if the height of the wrapper is smaller than the modal, and thus the
        // screen is smaller than the modal, force the top to simply be 0
        if (modalHeight > wrapperInnerHeight) {
          absTop = '0px';
        }
        returnpos.top = absTop;
      }
      return returnpos;
    },

    modalInitialized: function() {
      var self = this;
      return self.$modal !== null && self.$modal !== undefined;
    },

    positionModal: function() {
      /* re-position modal at any point.
       *
       * Uses:
       *  options.margin
       *  options.width
       *  options.height
       *  options.position
       */
      var self = this;
      // modal isn't initialized
      if (!self.modalInitialized()) { return; }
      // clear out any previously set styling
      self.$modal.removeAttr('style');

      // if backdrop wrapper is set on body, then wrapper should have height of
      // the window, so we can do scrolling of inner wrapper
      if (self.$wrapper.parent().is('body')) {
        self.$wrapper.height($(window.parent).height());
      }

      var margin = typeof self.options.margin === 'function' ? self.options.margin() : self.options.margin;
      self.$modal.css({
        'position': 'absolute',
        'padding': margin
      });
      self.$modalDialog.css({
        margin: '0',
        padding: '0',
        width: self.options.width, // defaults to "", which doesn't override other css
        height: self.options.height // defaults to "", which doesn't override other css
      });
      self.$modalContent.css({
        width: self.options.width, // defaults to "", which doesn't override other css
      });

      var posopt = self.options.position.split(' '),
          horpos = posopt[0],
          vertpos = posopt[1];
      var modalWidth = self.$modalDialog.outerWidth(true);
      var modalHeight = self.$modalDialog.outerHeight(true);
      var wrapperInnerWidth = self.$wrapperInner.width();
      var wrapperInnerHeight = self.$wrapperInner.height();
      var pos = self.findPosition(
        horpos, vertpos, margin, modalWidth, modalHeight,
        wrapperInnerWidth, wrapperInnerHeight
      );
      for (var key in pos) {
        self.$modalDialog.css(key, pos[key]);
      }
    },

    render: function(options) {
      var self = this;
      self.emit('render');
      self.options.render.apply(self, [options]);
      self.emit('rendered');
    },

    show: function() {
      var self = this;
      self.backdrop = self.createBackdrop();
      self.createModal();
    },

    createBackdrop: function() {
      var self = this,
          backdrop = new Backdrop(
            self.$el.parents(self.options.backdrop),
            self.options.backdropOptions
          ),
          zIndex = 1041;

      $(self.options.zIndexSelector).each(function(){
        zIndex = Math.max(zIndex, parseInt($(this).css('zIndex')) + 1 || 1041);
      });

      self.$wrapper = $('<div/>')
        .hide()
        .css({
          'z-index': zIndex,
          'overflow-y': 'auto',
          'position': 'fixed',
          'height': '100%',
          'width': '100%',
          'bottom': '0',
          'left': '0',
          'right': '0',
          'top': '0'
        })
        .addClass(self.options.templateOptions.classWrapperName)
        .insertBefore(backdrop.$backdrop)
        .on('click', function(e) {
          if (self.options.backdropOptions.closeOnClick) {
            e.stopPropagation();
            e.preventDefault();
            backdrop.hide();
          }
        });
      backdrop.on('hidden', function(e) {
        if (self.$modal !== undefined && self.$modal.hasClass(self.options.templateOptions.classActiveName)) {
          self.hide();
        }
      });
      self.loading = new utils.Loading({
        'backdrop': backdrop
      });
      self.$wrapperInner = $('<div/>')
        .addClass(self.options.classWrapperInnerName)
        .css({
          'position': 'absolute',
          'bottom': '0',
          'left': '0',
          'right': '0',
          'top': '0'
        })
        .appendTo(self.$wrapper);
      return backdrop;
    },

    _show: function() {
      var self = this;
      self.render.apply(self, [ self.options ]);
      self.emit('show');
      self.backdrop.show();
      self.$wrapper.show();
      self.loading.hide();
      self.$el.addClass(self.options.templateOptions.classActiveName);
      self.$modal.addClass(self.options.templateOptions.classActiveName);
      registry.scan(self.$modal);
      self.positionModal();
      $(window.parent).on('resize.plone-modal.patterns', function() {
        self.positionModal();
      });
      $('body').addClass('plone-modal-open');
      self.emit('shown');
    },
    hide: function() {
      var self = this;
      if (self.ajaxXHR) {
        self.ajaxXHR.abort();
      }
      self.emit('hide');
      if (self._suppressHide) {
        if (!window.confirm(self._suppressHide)) {
          return;
        }
      }
      self.loading.hide();
      self.$el.removeClass(self.options.templateOptions.classActiveName);
      if (self.$modal !== undefined) {
        self.$modal.remove();
        self.initModal();
      }
      self.$wrapper.remove();
      if ($('.plone-modal', $('body')).size() < 1) {
        self._suppressHide = undefined;
        self.backdrop.hide();
        $('body').removeClass('plone-modal-open');
        $(window.parent).off('resize.plone-modal.patterns');
      }
      self.emit('hidden');
    },

    redraw: function(response, options) {
      var self = this;
      self.emit('beforeDraw');
      self.$modal.remove();
      self.$raw = $('<div />').append($(utils.parseBodyTag(response)));
      self.render.apply(self, [options || self.options]);
      self.$modal.addClass(self.options.templateOptions.classActiveName);
      self.positionModal();
      registry.scan(self.$modal);
      self.emit('afterDraw');
    }
  });

  return Modal;
});

/* Navigation marker pattern.
 *
 * This pattern adds ``inPath`` and ``current`` classes to the navigation to
 * allow a different style on selected navigation items or navigation items
 * which are in the current path.
 *
 * This is done in JavaScript, so that the navigation pattern can be cached
 * for the whole site.
 *
 */

define('mockup-patterns-navigationmarker',[
    'jquery',
    'pat-base'
], function ($, Base) {

    var Navigation = Base.extend({
        name: 'navigationmarker',
        trigger: '.pat-navigationmarker',
        parser: 'mockup',
        init: function () {
            var self = this;
            var href = document.querySelector('head link[rel="canonical"]').href || window.location.href;

            $('a', this.$el).each(function () {
                var navlink = this.href.replace('/view', '');
                if (href.indexOf(navlink) !== -1) {
                    var parent = $(this).parent();

                    // check the input-openers within the path
                    var check = parent.find('> input');
                    if (check.length) {
                        check[0].checked = true;
                    }

                    // set "inPath" to all nav items which are within the current path
                    // check if parts of navlink are in canonical url parts
                    var hrefParts = href.split('/');
                    var navParts = navlink.split('/');
                    var inPath = false;
                    for (var i = 0, size = navParts.length; i < size; i++) {
                        // The last path-part must match.
                        inPath = false;
                        if (navParts[i] === hrefParts[i]) {
                            inPath = true;
                        }
                    }
                    if (inPath) {
                        parent.addClass('inPath');
                    }

                    // set "current" to the current selected nav item, if it is in the navigation structure.
                    if (href === navlink) {
                        parent.addClass('current');
                    }
                }
            });
        }
    });

    return Navigation;
});

/* PreventDoubleSubmit pattern.
 *
 * Options:
 *    guardClassName(string): Class applied to submit button after it is clicked once. ('submitting')
 *    optOutClassName(string): Class used to opt-out a submit button from double-submit prevention. ('allowMultiSubmit')
 *    message(string): Message to be displayed when "opt-out" submit button is clicked a second time. ('You already clicked the submit button. Do you really want to submit this form again?')
 *
 * Documentation:
 *    # Example
 *
 *    {{ example-1 }}
 *
 * Example: example-1
 *    <form class="pat-preventdoublesubmit" onsubmit="javascript:return false;">
 *      <input type="text" value="submit this value please!" />
 *      <input class="btn btn-large btn-primary" type="submit" value="Single submit" />
 *      <input class="btn btn-large btn-primary allowMultiSubmit" type="submit" value="Multi submit" />
 *    </form>
 *
 */


define('mockup-patterns-preventdoublesubmit',[
  'jquery',
  'pat-base',
  'translate'
], function($, Base, _t) {
  'use strict';

  var PreventDoubleSubmit = Base.extend({
    name: 'preventdoublesubmit',
    trigger: '.pat-preventdoublesubmit',
    parser: 'mockup',
    defaults: {
      message : _t('You already clicked the submit button. ' +
                'Do you really want to submit this form again?'),
      guardClassName: 'submitting',
      optOutClassName: 'allowMultiSubmit'
    },
    init: function() {
      var self = this;

      // if this is not a form just return
      if (!self.$el.is('form')) {
        return;
      }

      $(':submit', self.$el).click(function(e) {

        // mark the button as clicked
        $(':submit').removeAttr('clicked');
        $(this).attr('clicked', 'clicked');

        // if submitting and no opt-out guardClassName is found
        // pop up confirmation dialog
        if ($(this).hasClass(self.options.guardClassName) &&
              !$(this).hasClass(self.options.optOutClassName)) {
          return self._confirm.call(self);
        }

        $(this).addClass(self.options.guardClassName);
      });

    },

    _confirm: function(e) {
      return window.confirm(this.options.message);
    }

  });

  return PreventDoubleSubmit;

});

(function(root) {
define("bootstrap-collapse", ["jquery"], function() {
  return (function() {
/* ========================================================================
 * Bootstrap: collapse.js v3.4.1
 * https://getbootstrap.com/docs/3.4/javascript/#collapse
 * ========================================================================
 * Copyright 2011-2019 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

/* jshint latedef: false */

+function ($) {
  'use strict';

  // COLLAPSE PUBLIC CLASS DEFINITION
  // ================================

  var Collapse = function (element, options) {
    this.$element      = $(element)
    this.options       = $.extend({}, Collapse.DEFAULTS, options)
    this.$trigger      = $('[data-toggle="collapse"][href="#' + element.id + '"],' +
                           '[data-toggle="collapse"][data-target="#' + element.id + '"]')
    this.transitioning = null

    if (this.options.parent) {
      this.$parent = this.getParent()
    } else {
      this.addAriaAndCollapsedClass(this.$element, this.$trigger)
    }

    if (this.options.toggle) this.toggle()
  }

  Collapse.VERSION  = '3.4.1'

  Collapse.TRANSITION_DURATION = 350

  Collapse.DEFAULTS = {
    toggle: true
  }

  Collapse.prototype.dimension = function () {
    var hasWidth = this.$element.hasClass('width')
    return hasWidth ? 'width' : 'height'
  }

  Collapse.prototype.show = function () {
    if (this.transitioning || this.$element.hasClass('in')) return

    var activesData
    var actives = this.$parent && this.$parent.children('.panel').children('.in, .collapsing')

    if (actives && actives.length) {
      activesData = actives.data('bs.collapse')
      if (activesData && activesData.transitioning) return
    }

    var startEvent = $.Event('show.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    if (actives && actives.length) {
      Plugin.call(actives, 'hide')
      activesData || actives.data('bs.collapse', null)
    }

    var dimension = this.dimension()

    this.$element
      .removeClass('collapse')
      .addClass('collapsing')[dimension](0)
      .attr('aria-expanded', true)

    this.$trigger
      .removeClass('collapsed')
      .attr('aria-expanded', true)

    this.transitioning = 1

    var complete = function () {
      this.$element
        .removeClass('collapsing')
        .addClass('collapse in')[dimension]('')
      this.transitioning = 0
      this.$element
        .trigger('shown.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    var scrollSize = $.camelCase(['scroll', dimension].join('-'))

    this.$element
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(Collapse.TRANSITION_DURATION)[dimension](this.$element[0][scrollSize])
  }

  Collapse.prototype.hide = function () {
    if (this.transitioning || !this.$element.hasClass('in')) return

    var startEvent = $.Event('hide.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    var dimension = this.dimension()

    this.$element[dimension](this.$element[dimension]())[0].offsetHeight

    this.$element
      .addClass('collapsing')
      .removeClass('collapse in')
      .attr('aria-expanded', false)

    this.$trigger
      .addClass('collapsed')
      .attr('aria-expanded', false)

    this.transitioning = 1

    var complete = function () {
      this.transitioning = 0
      this.$element
        .removeClass('collapsing')
        .addClass('collapse')
        .trigger('hidden.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    this.$element
      [dimension](0)
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(Collapse.TRANSITION_DURATION)
  }

  Collapse.prototype.toggle = function () {
    this[this.$element.hasClass('in') ? 'hide' : 'show']()
  }

  Collapse.prototype.getParent = function () {
    return $(document).find(this.options.parent)
      .find('[data-toggle="collapse"][data-parent="' + this.options.parent + '"]')
      .each($.proxy(function (i, element) {
        var $element = $(element)
        this.addAriaAndCollapsedClass(getTargetFromTrigger($element), $element)
      }, this))
      .end()
  }

  Collapse.prototype.addAriaAndCollapsedClass = function ($element, $trigger) {
    var isOpen = $element.hasClass('in')

    $element.attr('aria-expanded', isOpen)
    $trigger
      .toggleClass('collapsed', !isOpen)
      .attr('aria-expanded', isOpen)
  }

  function getTargetFromTrigger($trigger) {
    var href
    var target = $trigger.attr('data-target')
      || (href = $trigger.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') // strip for ie7

    return $(document).find(target)
  }


  // COLLAPSE PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.collapse')
      var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data && options.toggle && /show|hide/.test(option)) options.toggle = false
      if (!data) $this.data('bs.collapse', (data = new Collapse(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.collapse

  $.fn.collapse             = Plugin
  $.fn.collapse.Constructor = Collapse


  // COLLAPSE NO CONFLICT
  // ====================

  $.fn.collapse.noConflict = function () {
    $.fn.collapse = old
    return this
  }


  // COLLAPSE DATA-API
  // =================

  $(document).on('click.bs.collapse.data-api', '[data-toggle="collapse"]', function (e) {
    var $this   = $(this)

    if (!$this.attr('data-target')) e.preventDefault()

    var $target = getTargetFromTrigger($this)
    var data    = $target.data('bs.collapse')
    var option  = data ? 'toggle' : $this.data()

    Plugin.call($target, option)
  })

}(jQuery);

return window.jQuery.fn.collapse.Constructor;
  }).apply(root, arguments);
});
}(this));

(function(root) {
define("bootstrap-dropdown", ["jquery"], function() {
  return (function() {
/* ========================================================================
 * Bootstrap: dropdown.js v3.4.1
 * https://getbootstrap.com/docs/3.4/javascript/#dropdowns
 * ========================================================================
 * Copyright 2011-2019 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // DROPDOWN CLASS DEFINITION
  // =========================

  var backdrop = '.dropdown-backdrop'
  var toggle   = '[data-toggle="dropdown"]'
  var Dropdown = function (element) {
    $(element).on('click.bs.dropdown', this.toggle)
  }

  Dropdown.VERSION = '3.4.1'

  function getParent($this) {
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    var $parent = selector !== '#' ? $(document).find(selector) : null

    return $parent && $parent.length ? $parent : $this.parent()
  }

  function clearMenus(e) {
    if (e && e.which === 3) return
    $(backdrop).remove()
    $(toggle).each(function () {
      var $this         = $(this)
      var $parent       = getParent($this)
      var relatedTarget = { relatedTarget: this }

      if (!$parent.hasClass('open')) return

      if (e && e.type == 'click' && /input|textarea/i.test(e.target.tagName) && $.contains($parent[0], e.target)) return

      $parent.trigger(e = $.Event('hide.bs.dropdown', relatedTarget))

      if (e.isDefaultPrevented()) return

      $this.attr('aria-expanded', 'false')
      $parent.removeClass('open').trigger($.Event('hidden.bs.dropdown', relatedTarget))
    })
  }

  Dropdown.prototype.toggle = function (e) {
    var $this = $(this)

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    clearMenus()

    if (!isActive) {
      if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
        // if mobile we use a backdrop because click events don't delegate
        $(document.createElement('div'))
          .addClass('dropdown-backdrop')
          .insertAfter($(this))
          .on('click', clearMenus)
      }

      var relatedTarget = { relatedTarget: this }
      $parent.trigger(e = $.Event('show.bs.dropdown', relatedTarget))

      if (e.isDefaultPrevented()) return

      $this
        .trigger('focus')
        .attr('aria-expanded', 'true')

      $parent
        .toggleClass('open')
        .trigger($.Event('shown.bs.dropdown', relatedTarget))
    }

    return false
  }

  Dropdown.prototype.keydown = function (e) {
    if (!/(38|40|27|32)/.test(e.which) || /input|textarea/i.test(e.target.tagName)) return

    var $this = $(this)

    e.preventDefault()
    e.stopPropagation()

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    if (!isActive && e.which != 27 || isActive && e.which == 27) {
      if (e.which == 27) $parent.find(toggle).trigger('focus')
      return $this.trigger('click')
    }

    var desc = ' li:not(.disabled):visible a'
    var $items = $parent.find('.dropdown-menu' + desc)

    if (!$items.length) return

    var index = $items.index(e.target)

    if (e.which == 38 && index > 0)                 index--         // up
    if (e.which == 40 && index < $items.length - 1) index++         // down
    if (!~index)                                    index = 0

    $items.eq(index).trigger('focus')
  }


  // DROPDOWN PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.dropdown')

      if (!data) $this.data('bs.dropdown', (data = new Dropdown(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  var old = $.fn.dropdown

  $.fn.dropdown             = Plugin
  $.fn.dropdown.Constructor = Dropdown


  // DROPDOWN NO CONFLICT
  // ====================

  $.fn.dropdown.noConflict = function () {
    $.fn.dropdown = old
    return this
  }


  // APPLY TO STANDARD DROPDOWN ELEMENTS
  // ===================================

  $(document)
    .on('click.bs.dropdown.data-api', clearMenus)
    .on('click.bs.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
    .on('click.bs.dropdown.data-api', toggle, Dropdown.prototype.toggle)
    .on('keydown.bs.dropdown.data-api', toggle, Dropdown.prototype.keydown)
    .on('keydown.bs.dropdown.data-api', '.dropdown-menu', Dropdown.prototype.keydown)

}(jQuery);


  }).apply(root, arguments);
});
}(this));

(function(root) {
define("bootstrap-tooltip", ["jquery"], function() {
  return (function() {
/* ========================================================================
 * Bootstrap: tooltip.js v3.4.1
 * https://getbootstrap.com/docs/3.4/javascript/#tooltip
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ========================================================================
 * Copyright 2011-2019 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

+function ($) {
  'use strict';

  var DISALLOWED_ATTRIBUTES = ['sanitize', 'whiteList', 'sanitizeFn']

  var uriAttrs = [
    'background',
    'cite',
    'href',
    'itemtype',
    'longdesc',
    'poster',
    'src',
    'xlink:href'
  ]

  var ARIA_ATTRIBUTE_PATTERN = /^aria-[\w-]*$/i

  var DefaultWhitelist = {
    // Global attributes allowed on any supplied element below.
    '*': ['class', 'dir', 'id', 'lang', 'role', ARIA_ATTRIBUTE_PATTERN],
    a: ['target', 'href', 'title', 'rel'],
    area: [],
    b: [],
    br: [],
    col: [],
    code: [],
    div: [],
    em: [],
    hr: [],
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    h5: [],
    h6: [],
    i: [],
    img: ['src', 'alt', 'title', 'width', 'height'],
    li: [],
    ol: [],
    p: [],
    pre: [],
    s: [],
    small: [],
    span: [],
    sub: [],
    sup: [],
    strong: [],
    u: [],
    ul: []
  }

  /**
   * A pattern that recognizes a commonly useful subset of URLs that are safe.
   *
   * Shoutout to Angular 7 https://github.com/angular/angular/blob/7.2.4/packages/core/src/sanitization/url_sanitizer.ts
   */
  var SAFE_URL_PATTERN = /^(?:(?:https?|mailto|ftp|tel|file):|[^&:/?#]*(?:[/?#]|$))/gi

  /**
   * A pattern that matches safe data URLs. Only matches image, video and audio types.
   *
   * Shoutout to Angular 7 https://github.com/angular/angular/blob/7.2.4/packages/core/src/sanitization/url_sanitizer.ts
   */
  var DATA_URL_PATTERN = /^data:(?:image\/(?:bmp|gif|jpeg|jpg|png|tiff|webp)|video\/(?:mpeg|mp4|ogg|webm)|audio\/(?:mp3|oga|ogg|opus));base64,[a-z0-9+/]+=*$/i

  function allowedAttribute(attr, allowedAttributeList) {
    var attrName = attr.nodeName.toLowerCase()

    if ($.inArray(attrName, allowedAttributeList) !== -1) {
      if ($.inArray(attrName, uriAttrs) !== -1) {
        return Boolean(attr.nodeValue.match(SAFE_URL_PATTERN) || attr.nodeValue.match(DATA_URL_PATTERN))
      }

      return true
    }

    var regExp = $(allowedAttributeList).filter(function (index, value) {
      return value instanceof RegExp
    })

    // Check if a regular expression validates the attribute.
    for (var i = 0, l = regExp.length; i < l; i++) {
      if (attrName.match(regExp[i])) {
        return true
      }
    }

    return false
  }

  function sanitizeHtml(unsafeHtml, whiteList, sanitizeFn) {
    if (unsafeHtml.length === 0) {
      return unsafeHtml
    }

    if (sanitizeFn && typeof sanitizeFn === 'function') {
      return sanitizeFn(unsafeHtml)
    }

    // IE 8 and below don't support createHTMLDocument
    if (!document.implementation || !document.implementation.createHTMLDocument) {
      return unsafeHtml
    }

    var createdDocument = document.implementation.createHTMLDocument('sanitization')
    createdDocument.body.innerHTML = unsafeHtml

    var whitelistKeys = $.map(whiteList, function (el, i) { return i })
    var elements = $(createdDocument.body).find('*')

    for (var i = 0, len = elements.length; i < len; i++) {
      var el = elements[i]
      var elName = el.nodeName.toLowerCase()

      if ($.inArray(elName, whitelistKeys) === -1) {
        el.parentNode.removeChild(el)

        continue
      }

      var attributeList = $.map(el.attributes, function (el) { return el })
      var whitelistedAttributes = [].concat(whiteList['*'] || [], whiteList[elName] || [])

      for (var j = 0, len2 = attributeList.length; j < len2; j++) {
        if (!allowedAttribute(attributeList[j], whitelistedAttributes)) {
          el.removeAttribute(attributeList[j].nodeName)
        }
      }
    }

    return createdDocument.body.innerHTML
  }

  // TOOLTIP PUBLIC CLASS DEFINITION
  // ===============================

  var Tooltip = function (element, options) {
    this.type       = null
    this.options    = null
    this.enabled    = null
    this.timeout    = null
    this.hoverState = null
    this.$element   = null
    this.inState    = null

    this.init('tooltip', element, options)
  }

  Tooltip.VERSION  = '3.4.1'

  Tooltip.TRANSITION_DURATION = 150

  Tooltip.DEFAULTS = {
    animation: true,
    placement: 'top',
    selector: false,
    template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
    trigger: 'hover focus',
    title: '',
    delay: 0,
    html: false,
    container: false,
    viewport: {
      selector: 'body',
      padding: 0
    },
    sanitize : true,
    sanitizeFn : null,
    whiteList : DefaultWhitelist
  }

  Tooltip.prototype.init = function (type, element, options) {
    this.enabled   = true
    this.type      = type
    this.$element  = $(element)
    this.options   = this.getOptions(options)
    this.$viewport = this.options.viewport && $(document).find($.isFunction(this.options.viewport) ? this.options.viewport.call(this, this.$element) : (this.options.viewport.selector || this.options.viewport))
    this.inState   = { click: false, hover: false, focus: false }

    if (this.$element[0] instanceof document.constructor && !this.options.selector) {
      throw new Error('`selector` option must be specified when initializing ' + this.type + ' on the window.document object!')
    }

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

  Tooltip.prototype.getDefaults = function () {
    return Tooltip.DEFAULTS
  }

  Tooltip.prototype.getOptions = function (options) {
    var dataAttributes = this.$element.data()

    for (var dataAttr in dataAttributes) {
      if (dataAttributes.hasOwnProperty(dataAttr) && $.inArray(dataAttr, DISALLOWED_ATTRIBUTES) !== -1) {
        delete dataAttributes[dataAttr]
      }
    }

    options = $.extend({}, this.getDefaults(), dataAttributes, options)

    if (options.delay && typeof options.delay == 'number') {
      options.delay = {
        show: options.delay,
        hide: options.delay
      }
    }

    if (options.sanitize) {
      options.template = sanitizeHtml(options.template, options.whiteList, options.sanitizeFn)
    }

    return options
  }

  Tooltip.prototype.getDelegateOptions = function () {
    var options  = {}
    var defaults = this.getDefaults()

    this._options && $.each(this._options, function (key, value) {
      if (defaults[key] != value) options[key] = value
    })

    return options
  }

  Tooltip.prototype.enter = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget).data('bs.' + this.type)

    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
      $(obj.currentTarget).data('bs.' + this.type, self)
    }

    if (obj instanceof $.Event) {
      self.inState[obj.type == 'focusin' ? 'focus' : 'hover'] = true
    }

    if (self.tip().hasClass('in') || self.hoverState == 'in') {
      self.hoverState = 'in'
      return
    }

    clearTimeout(self.timeout)

    self.hoverState = 'in'

    if (!self.options.delay || !self.options.delay.show) return self.show()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'in') self.show()
    }, self.options.delay.show)
  }

  Tooltip.prototype.isInStateTrue = function () {
    for (var key in this.inState) {
      if (this.inState[key]) return true
    }

    return false
  }

  Tooltip.prototype.leave = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget).data('bs.' + this.type)

    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
      $(obj.currentTarget).data('bs.' + this.type, self)
    }

    if (obj instanceof $.Event) {
      self.inState[obj.type == 'focusout' ? 'focus' : 'hover'] = false
    }

    if (self.isInStateTrue()) return

    clearTimeout(self.timeout)

    self.hoverState = 'out'

    if (!self.options.delay || !self.options.delay.hide) return self.hide()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'out') self.hide()
    }, self.options.delay.hide)
  }

  Tooltip.prototype.show = function () {
    var e = $.Event('show.bs.' + this.type)

    if (this.hasContent() && this.enabled) {
      this.$element.trigger(e)

      var inDom = $.contains(this.$element[0].ownerDocument.documentElement, this.$element[0])
      if (e.isDefaultPrevented() || !inDom) return
      var that = this

      var $tip = this.tip()

      var tipId = this.getUID(this.type)

      this.setContent()
      $tip.attr('id', tipId)
      this.$element.attr('aria-describedby', tipId)

      if (this.options.animation) $tip.addClass('fade')

      var placement = typeof this.options.placement == 'function' ?
        this.options.placement.call(this, $tip[0], this.$element[0]) :
        this.options.placement

      var autoToken = /\s?auto?\s?/i
      var autoPlace = autoToken.test(placement)
      if (autoPlace) placement = placement.replace(autoToken, '') || 'top'

      $tip
        .detach()
        .css({ top: 0, left: 0, display: 'block' })
        .addClass(placement)
        .data('bs.' + this.type, this)

      this.options.container ? $tip.appendTo($(document).find(this.options.container)) : $tip.insertAfter(this.$element)
      this.$element.trigger('inserted.bs.' + this.type)

      var pos          = this.getPosition()
      var actualWidth  = $tip[0].offsetWidth
      var actualHeight = $tip[0].offsetHeight

      if (autoPlace) {
        var orgPlacement = placement
        var viewportDim = this.getPosition(this.$viewport)

        placement = placement == 'bottom' && pos.bottom + actualHeight > viewportDim.bottom ? 'top'    :
                    placement == 'top'    && pos.top    - actualHeight < viewportDim.top    ? 'bottom' :
                    placement == 'right'  && pos.right  + actualWidth  > viewportDim.width  ? 'left'   :
                    placement == 'left'   && pos.left   - actualWidth  < viewportDim.left   ? 'right'  :
                    placement

        $tip
          .removeClass(orgPlacement)
          .addClass(placement)
      }

      var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight)

      this.applyPlacement(calculatedOffset, placement)

      var complete = function () {
        var prevHoverState = that.hoverState
        that.$element.trigger('shown.bs.' + that.type)
        that.hoverState = null

        if (prevHoverState == 'out') that.leave(that)
      }

      $.support.transition && this.$tip.hasClass('fade') ?
        $tip
          .one('bsTransitionEnd', complete)
          .emulateTransitionEnd(Tooltip.TRANSITION_DURATION) :
        complete()
    }
  }

  Tooltip.prototype.applyPlacement = function (offset, placement) {
    var $tip   = this.tip()
    var width  = $tip[0].offsetWidth
    var height = $tip[0].offsetHeight

    // manually read margins because getBoundingClientRect includes difference
    var marginTop = parseInt($tip.css('margin-top'), 10)
    var marginLeft = parseInt($tip.css('margin-left'), 10)

    // we must check for NaN for ie 8/9
    if (isNaN(marginTop))  marginTop  = 0
    if (isNaN(marginLeft)) marginLeft = 0

    offset.top  += marginTop
    offset.left += marginLeft

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

    var isVertical          = /top|bottom/.test(placement)
    var arrowDelta          = isVertical ? delta.left * 2 - width + actualWidth : delta.top * 2 - height + actualHeight
    var arrowOffsetPosition = isVertical ? 'offsetWidth' : 'offsetHeight'

    $tip.offset(offset)
    this.replaceArrow(arrowDelta, $tip[0][arrowOffsetPosition], isVertical)
  }

  Tooltip.prototype.replaceArrow = function (delta, dimension, isVertical) {
    this.arrow()
      .css(isVertical ? 'left' : 'top', 50 * (1 - delta / dimension) + '%')
      .css(isVertical ? 'top' : 'left', '')
  }

  Tooltip.prototype.setContent = function () {
    var $tip  = this.tip()
    var title = this.getTitle()

    if (this.options.html) {
      if (this.options.sanitize) {
        title = sanitizeHtml(title, this.options.whiteList, this.options.sanitizeFn)
      }

      $tip.find('.tooltip-inner').html(title)
    } else {
      $tip.find('.tooltip-inner').text(title)
    }

    $tip.removeClass('fade in top bottom left right')
  }

  Tooltip.prototype.hide = function (callback) {
    var that = this
    var $tip = $(this.$tip)
    var e    = $.Event('hide.bs.' + this.type)

    function complete() {
      if (that.hoverState != 'in') $tip.detach()
      if (that.$element) { // TODO: Check whether guarding this code with this `if` is really necessary.
        that.$element
          .removeAttr('aria-describedby')
          .trigger('hidden.bs.' + that.type)
      }
      callback && callback()
    }

    this.$element.trigger(e)

    if (e.isDefaultPrevented()) return

    $tip.removeClass('in')

    $.support.transition && $tip.hasClass('fade') ?
      $tip
        .one('bsTransitionEnd', complete)
        .emulateTransitionEnd(Tooltip.TRANSITION_DURATION) :
      complete()

    this.hoverState = null

    return this
  }

  Tooltip.prototype.fixTitle = function () {
    var $e = this.$element
    if ($e.attr('title') || typeof $e.attr('data-original-title') != 'string') {
      $e.attr('data-original-title', $e.attr('title') || '').attr('title', '')
    }
  }

  Tooltip.prototype.hasContent = function () {
    return this.getTitle()
  }

  Tooltip.prototype.getPosition = function ($element) {
    $element   = $element || this.$element

    var el     = $element[0]
    var isBody = el.tagName == 'BODY'

    var elRect    = el.getBoundingClientRect()
    if (elRect.width == null) {
      // width and height are missing in IE8, so compute them manually; see https://github.com/twbs/bootstrap/issues/14093
      elRect = $.extend({}, elRect, { width: elRect.right - elRect.left, height: elRect.bottom - elRect.top })
    }
    var isSvg = window.SVGElement && el instanceof window.SVGElement
    // Avoid using $.offset() on SVGs since it gives incorrect results in jQuery 3.
    // See https://github.com/twbs/bootstrap/issues/20280
    var elOffset  = isBody ? { top: 0, left: 0 } : (isSvg ? null : $element.offset())
    var scroll    = { scroll: isBody ? document.documentElement.scrollTop || document.body.scrollTop : $element.scrollTop() }
    var outerDims = isBody ? { width: $(window).width(), height: $(window).height() } : null

    return $.extend({}, elRect, scroll, outerDims, elOffset)
  }

  Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
    return placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth / 2 } :
           placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2 } :
           placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
        /* placement == 'right' */ { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width }

  }

  Tooltip.prototype.getViewportAdjustedDelta = function (placement, pos, actualWidth, actualHeight) {
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
      } else if (rightEdgeOffset > viewportDimensions.right) { // right overflow
        delta.left = viewportDimensions.left + viewportDimensions.width - rightEdgeOffset
      }
    }

    return delta
  }

  Tooltip.prototype.getTitle = function () {
    var title
    var $e = this.$element
    var o  = this.options

    title = $e.attr('data-original-title')
      || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)

    return title
  }

  Tooltip.prototype.getUID = function (prefix) {
    do prefix += ~~(Math.random() * 1000000)
    while (document.getElementById(prefix))
    return prefix
  }

  Tooltip.prototype.tip = function () {
    if (!this.$tip) {
      this.$tip = $(this.options.template)
      if (this.$tip.length != 1) {
        throw new Error(this.type + ' `template` option must consist of exactly 1 top-level element!')
      }
    }
    return this.$tip
  }

  Tooltip.prototype.arrow = function () {
    return (this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow'))
  }

  Tooltip.prototype.enable = function () {
    this.enabled = true
  }

  Tooltip.prototype.disable = function () {
    this.enabled = false
  }

  Tooltip.prototype.toggleEnabled = function () {
    this.enabled = !this.enabled
  }

  Tooltip.prototype.toggle = function (e) {
    var self = this
    if (e) {
      self = $(e.currentTarget).data('bs.' + this.type)
      if (!self) {
        self = new this.constructor(e.currentTarget, this.getDelegateOptions())
        $(e.currentTarget).data('bs.' + this.type, self)
      }
    }

    if (e) {
      self.inState.click = !self.inState.click
      if (self.isInStateTrue()) self.enter(self)
      else self.leave(self)
    } else {
      self.tip().hasClass('in') ? self.leave(self) : self.enter(self)
    }
  }

  Tooltip.prototype.destroy = function () {
    var that = this
    clearTimeout(this.timeout)
    this.hide(function () {
      that.$element.off('.' + that.type).removeData('bs.' + that.type)
      if (that.$tip) {
        that.$tip.detach()
      }
      that.$tip = null
      that.$arrow = null
      that.$viewport = null
      that.$element = null
    })
  }

  Tooltip.prototype.sanitizeHtml = function (unsafeHtml) {
    return sanitizeHtml(unsafeHtml, this.options.whiteList, this.options.sanitizeFn)
  }

  // TOOLTIP PLUGIN DEFINITION
  // =========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.tooltip')
      var options = typeof option == 'object' && option

      if (!data && /destroy|hide/.test(option)) return
      if (!data) $this.data('bs.tooltip', (data = new Tooltip(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.tooltip

  $.fn.tooltip             = Plugin
  $.fn.tooltip.Constructor = Tooltip


  // TOOLTIP NO CONFLICT
  // ===================

  $.fn.tooltip.noConflict = function () {
    $.fn.tooltip = old
    return this
  }

}(jQuery);


  }).apply(root, arguments);
});
}(this));

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
  'mockup-patterns-autotoc',
  'mockup-patterns-contentloader',
  'mockup-patterns-cookietrigger',
  'mockup-patterns-formautofocus',
  'mockup-patterns-formunloadalert',
  'mockup-patterns-livesearch',
  'mockup-patterns-markspeciallinks',
  'mockup-patterns-modal',
  'mockup-patterns-navigationmarker',
  'mockup-patterns-preventdoublesubmit',
  'bootstrap-collapse',
  'bootstrap-dropdown',
  'bootstrap-tooltip',
], function () {
  'use strict';
});

define("/home/_thet/data/dev/plone/buildout.coredev/src/plone.staticresources/src/plone/staticresources/static/plone.js", function(){});

