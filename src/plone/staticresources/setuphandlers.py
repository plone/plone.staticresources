from plone.base.interfaces import INonInstallable
from zope.interface import implementer


@implementer(INonInstallable)
class HiddenProfiles:
    def getNonInstallableProfiles(self):
        """Hide all profiles from site-creation and quickinstaller."""
        return [
            "plone.staticresources:default",
            "plone.staticresources:last_compilation",
            "plone.staticresources:async",
            "plone.staticresources:uninstall",
        ]

    def getNonInstallableProducts(self):
        """Hide the upgrades package from site-creation and quickinstaller.

        Our upgrades profiles are defined in the directory 'upgrades'.
        Plone sees this is a separate product.
        So instead of adding each new upgrade profile to the list of
        non installable profiles above, we can mark the upgrades product
        as non installable.
        """
        return ["plone.staticresources.upgrades"]
