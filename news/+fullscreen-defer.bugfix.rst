Load ``plone-fullscreen`` JavaScript deferred, so it no longer blocks rendering. It only wires up ``.zoomable`` images on ``DOMContentLoaded``, which fires after deferred scripts have run. @MrTango
