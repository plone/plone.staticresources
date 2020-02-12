# -*- coding: utf-8 -*-
"""Setup tests for this package."""
from plone.registry.interfaces import IRegistry
from plone.staticresources.testing import (
    PLONE_STATICRESOURCES_INTEGRATION_TESTING,
)
from zope.component import getMultiAdapter
from zope.component import getUtility

import unittest


class TestSetup(unittest.TestCase):
    """Test that plone.staticresources is properly installed."""

    layer = PLONE_STATICRESOURCES_INTEGRATION_TESTING

    def setUp(self):
        """Custom shared utility setup for tests."""
        self.portal = self.layer["portal"]
        self.request = self.layer["request"]
        self.installer = getMultiAdapter(
            (self.portal, self.request), name=u"prefs_install_products_form"
        )
        self.registry = getUtility(IRegistry)

    def test_install(self):
        """Test if plone.staticresources is installed."""
        self.assertTrue(self.installer.is_product_installed("plone.staticresources"))

        # Test availability of bundles and resources
        self.assertEqual(
            self.registry.records.get("plone.resources/resourceregistry.js").value,
            "++plone++static/resourceregistry.js",
        )

        self.assertEqual(
            self.registry.records.get("plone.resources/less.js").value,
            "++plone++static/components/less/dist/less.js",
        )

        self.assertEqual(
            self.registry.records.get("plone.resources/jquery.js").value,
            "++plone++static/components/jquery/dist/jquery.min.js",
        )

    def test_uninstall(self):
        """Test if plone.staticresources can be uninstalled."""
        self.installer.uninstall_product("plone.staticresources")
        self.assertFalse(self.installer.is_product_installed("plone.staticresources"))

        # We keep all bundles - at least this one should be available.
        self.assertEqual(
            self.registry.records.get("plone.resources/resourceregistry.js").value,
            "++plone++static/resourceregistry.js",
        )

        # This one is removed
        self.assertEqual(self.registry.records.get("plone.resources/less.js"), None)

        # jquery is also kept is it's still necessary for Plone core.
        self.assertEqual(
            self.registry.records.get("plone.resources/jquery.js").value,
            "++plone++static/components/jquery/dist/jquery.min.js",
        )
