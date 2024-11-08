from plone import api
from plone.registry import field
from plone.registry.record import Record


def upgrade_v215_to_v216(context):
    """Import missing icons."""

    registry = api.portal.get_tool('portal_registry')

    if 'plone.icon.plone-rearrange' not in registry.records:
        registry.records['plone.icon.plone-rearrange'] = Record(
            field.TextLine(title='Plone Icon rearrange'),
            '++plone++bootstrap-icons/sort-down-alt.svg'
        )

    if 'plone.icon.plone-selection' not in registry.records:
        registry.records['plone.icon.plone-selection'] = Record(
            field.TextLine(title='Plone Icon selection'),
            '++plone++bootstrap-icons/list-ul.svg'
        )
