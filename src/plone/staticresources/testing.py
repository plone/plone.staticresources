# -*- coding: utf-8 -*-
from plone.app.contenttypes.testing import PLONE_APP_CONTENTTYPES_FIXTURE
from plone.app.robotframework.testing import REMOTE_LIBRARY_BUNDLE_FIXTURE
from plone.app.testing import applyProfile
from plone.app.testing import FunctionalTesting
from plone.app.testing import IntegrationTesting
from plone.app.testing import PloneSandboxLayer
from plone.testing import z2

import plone.staticresources


class PloneStaticresourcesLayer(PloneSandboxLayer):

    defaultBases = (PLONE_APP_CONTENTTYPES_FIXTURE,)

    def setUpZope(self, app, configurationContext):
        # Load any other ZCML that is required for your tests.
        # The z3c.autoinclude feature is disabled in the Plone fixture base
        # layer.
        self.loadZCML(package=plone.staticresources)

    def setUpPloneSite(self, portal):
        applyProfile(portal, 'plone.staticresources:default')


PLONE_STATICRESOURCES_FIXTURE = PloneStaticresourcesLayer()


PLONE_STATICRESOURCES_INTEGRATION_TESTING = IntegrationTesting(
    bases=(PLONE_STATICRESOURCES_FIXTURE,),
    name='PloneStaticresourcesLayer:IntegrationTesting'
)


PLONE_STATICRESOURCES_FUNCTIONAL_TESTING = FunctionalTesting(
    bases=(PLONE_STATICRESOURCES_FIXTURE,),
    name='PloneStaticresourcesLayer:FunctionalTesting'
)


PLONE_STATICRESOURCES_ACCEPTANCE_TESTING = FunctionalTesting(
    bases=(
        PLONE_STATICRESOURCES_FIXTURE,
        REMOTE_LIBRARY_BUNDLE_FIXTURE,
        z2.ZSERVER_FIXTURE
    ),
    name='PloneStaticresourcesLayer:AcceptanceTesting'
)
