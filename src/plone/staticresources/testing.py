from plone.app.testing import applyProfile
from plone.app.testing import IntegrationTesting
from plone.app.testing import PloneSandboxLayer
from plone.app.testing.layers import PLONE_FIXTURE

import plone.staticresources


class PloneStaticresourcesLayer(PloneSandboxLayer):
    defaultBases = (PLONE_FIXTURE,)

    def setUpZope(self, app, configurationContext):
        self.loadZCML(package=plone.staticresources)

    def setUpPloneSite(self, portal):
        applyProfile(portal, "plone.staticresources:default")


PLONE_STATICRESOURCES_FIXTURE = PloneStaticresourcesLayer()


PLONE_STATICRESOURCES_INTEGRATION_TESTING = IntegrationTesting(
    bases=(PLONE_STATICRESOURCES_FIXTURE,),
    name="PloneStaticresourcesLayer:IntegrationTesting",
)
