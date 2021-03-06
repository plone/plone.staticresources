/**
 * Patterns ajax - AJAX injection for forms and anchors
 *
 * Copyright 2012-2013 Florian Friesdorf
 * Copyright 2012-2013 Marko Durkovic
 */
define([
    "jquery",
    "pat-logger",
    "pat-parser",
    "pat-registry"
], function($, logger, Parser, registry) {
    var log = logger.getLogger("pat.ajax"),
        parser = new Parser("ajax");
    parser.addArgument("url", function($el) {
        return ($el.is("a") ? $el.attr("href") :
                ($el.is("form") ? $el.attr("action") : "")).split("#")[0];
    });

    $.ajaxSetup ({
        // Disable caching of AJAX responses
        cache: false
    });

    var xhrCount = {};
    xhrCount.get = function(a) { return this[a] !== undefined ? this[a] : 0; };
    xhrCount.inc = function(a) { this[a] = this.get(a) + 1; return this.get(a); };

    var _ = {
        name: "ajax",
        trigger: ".pat-ajax",
        parser: parser,
        init: function($el) {
            $el.off(".pat-ajax");
            $el.filter("a").on("click.pat-ajax", _.onTriggerEvents);
            $el.filter("form")
                .on("submit.pat-ajax", _.onTriggerEvents)
                .on("click.pat-ajax", "[type=submit]", _.onClickSubmit);
            $el.filter(":not(form,a)").each(function() {
                log.warn("Unsupported element:", this);
            });
            return $el;
        },
        destroy: function($el) {
            $el.off(".pat-ajax");
        },
        onClickSubmit: function(event) {
            var $form = $(event.target).parents("form").first(),
                name = event.target.name,
                value = $(event.target).val(),
                data = {};
            if (name) {
                data[name] = value;
            }
            $form.data("pat-ajax.clicked-data", data);
        },
        onTriggerEvents: function(event) {
            if (event) {
                event.preventDefault();
            }
            _.request($(this));
        },
        request: function($el, opts) {
            return $el.each(function() {
                _._request($(this), opts);
            });
        },
        _request: function($el, opts) {
            var cfg = _.parser.parse($el, opts),
                onError = function(jqxhr, status, error) {
                    // error can also stem from a javascript
                    // exception, not only errors described in the
                    // jqxhr.
                    log.error("load error for " + cfg.url + ":", error, jqxhr);
                    $el.trigger({
                        type: "pat-ajax-error",
                        jqxhr: jqxhr
                    });
                },
                seqNumber = xhrCount.inc(cfg.url),
                onSuccess = function(data, status, jqxhr) {
                    log.debug("success: jqxhr:", jqxhr);
                    if (seqNumber === xhrCount.get(cfg.url)) {
                        // if this url is requested multiple time, only return the last result
                        $el.trigger({
                            type: "pat-ajax-success",
                            jqxhr: jqxhr
                        });
                    } else {
                        // ignore
                    }
                },
                temp = $el.data("pat-ajax.clicked-data"),
                clickedData = (temp ? $.param(temp) : ''),
                args = {
                    context: $el,
                    data: [$el.serialize(), clickedData].filter(Boolean).join("&"),
                    url: cfg.url,
                    method: $el.attr("method") ? $el.attr("method") : "GET"
                };

            if ($el.is("form") && $el.attr("method") && $el.attr("method").toUpperCase() == "POST") {
                var formdata = new FormData($el[0]);
                for (var key in temp) {
                    formdata.append(key, temp[key]);
                }
                args["method"] = "POST";
                args["data"] = formdata;
                args["cache"] = false;
                args["contentType"] =  false;
                args["processData"] =  false;
                args["type"] = "POST";
            }

            $el.removeData("pat-ajax.clicked-data");
            log.debug("request:", args, $el[0]);

            // Make it happen
            var ajax_deferred = $.ajax(args);

            if (ajax_deferred)
                ajax_deferred.done(onSuccess).fail(onError);
        }
    };

    registry.register(_);
    return _;
});
