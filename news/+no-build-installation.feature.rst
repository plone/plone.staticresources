Change the update method to download bundles.

Change the method to update Mockup, Bootstrap Icons and Country Flags to
download bundles.

The new installation method does not use webpack build but downloads releases
from GitHub. This is much faster and more reproductible - updating the build
dependencies and the build step itself is now obsolete.

The Makefile targets are inspired from plone.patternslib.
