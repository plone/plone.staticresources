# -*- coding: utf-8 -*-
from zope.interface import implementer


try:
    from Products.CMFPlone.interfaces import INonInstallable
except ImportError:
    from zope.interface import Interface

    class INonInstallable(Interface):
        pass


@implementer(INonInstallable)
class HiddenProfiles(object):
    def getNonInstallableProfiles(self):
        """Hide all profiles from site-creation and quickinstaller."""
        return [
            "plone.staticresources:default",
            "plone.staticresources:async",
            "plone.staticresources:uninstall",
            "plone.staticresources.upgrades:2",
            "plone.staticresources.upgrades:3",
            "plone.staticresources.upgrades:4",
            "plone.staticresources.upgrades:5",
            "plone.staticresources.upgrades:6",
            "plone.staticresources.upgrades:7",
            "plone.staticresources.upgrades:8",
        ]
