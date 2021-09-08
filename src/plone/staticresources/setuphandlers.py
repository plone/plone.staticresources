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
            "plone.staticresources.upgrades:9",
            "plone.staticresources.upgrades:10",
            "plone.staticresources.upgrades:11",
            "plone.staticresources.upgrades:200",
            "plone.staticresources.upgrades:201",
            "plone.staticresources.upgrades:202",
            "plone.staticresources.upgrades:203",
            "plone.staticresources.upgrades:204",
            "plone.staticresources.upgrades:205",
            "plone.staticresources.upgrades:206",
        ]
