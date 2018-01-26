# -*- coding: utf-8 -*-
"""Setup tests for this package."""
from plone import api
from plone.staticresources.testing import PLONE_STATICRESOURCES_INTEGRATION_TESTING  # noqa

import unittest


class TestSetup(unittest.TestCase):
    """Test that plone.staticresources is properly installed."""

    layer = PLONE_STATICRESOURCES_INTEGRATION_TESTING

    def setUp(self):
        """Custom shared utility setup for tests."""
        self.portal = self.layer['portal']
        self.installer = api.portal.get_tool('portal_quickinstaller')

    def test_product_installed(self):
        """Test if plone.staticresources is installed."""
        self.assertTrue(self.installer.isProductInstalled(
            'plone.staticresources'))

    def test_browserlayer(self):
        """Test that IPloneStaticresourcesLayer is registered."""
        from plone.staticresources.interfaces import (
            IPloneStaticresourcesLayer)
        from plone.browserlayer import utils
        self.assertIn(
            IPloneStaticresourcesLayer,
            utils.registered_layers())


class TestUninstall(unittest.TestCase):

    layer = PLONE_STATICRESOURCES_INTEGRATION_TESTING

    def setUp(self):
        self.portal = self.layer['portal']
        self.installer = api.portal.get_tool('portal_quickinstaller')
        self.installer.uninstallProducts(['plone.staticresources'])

    def test_product_uninstalled(self):
        """Test if plone.staticresources is cleanly uninstalled."""
        self.assertFalse(self.installer.isProductInstalled(
            'plone.staticresources'))

    def test_browserlayer_removed(self):
        """Test that IPloneStaticresourcesLayer is removed."""
        from plone.staticresources.interfaces import \
            IPloneStaticresourcesLayer
        from plone.browserlayer import utils
        self.assertNotIn(
           IPloneStaticresourcesLayer,
           utils.registered_layers())
