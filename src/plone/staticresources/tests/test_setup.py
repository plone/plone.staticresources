# -*- coding: utf-8 -*-
"""Setup tests for this package."""
from plone.staticresources.testing import PLONE_STATICRESOURCES_INTEGRATION_TESTING  # noqa
from zope.component import getMultiAdapter

import unittest


class TestSetup(unittest.TestCase):
    """Test that plone.staticresources is properly installed."""

    layer = PLONE_STATICRESOURCES_INTEGRATION_TESTING

    def setUp(self):
        """Custom shared utility setup for tests."""
        self.portal = self.layer['portal']
        self.request = self.layer['request']

    def test_install_uninstall(self):
        """Test if plone.staticresources is installed and is able to be
        uninstalled."""

        installer = getMultiAdapter(
            (self.portal, self. request),
            name=u'prefs_install_products_form'
        )

        # Install
        self.assertTrue(installer.is_product_installed(
            'plone.staticresources')
        )

        # Uninstall
        installer.uninstall_product('plone.staticresources')
        self.assertFalse(installer.is_product_installed(
            'plone.staticresources')
        )
