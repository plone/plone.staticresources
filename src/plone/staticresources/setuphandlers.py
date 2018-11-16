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
            'plone.staticresources:default',
            'plone.staticresources:uninstall',
        ]
