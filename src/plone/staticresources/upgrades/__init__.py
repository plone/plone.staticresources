from lxml import etree
from plone.registry.field import TextLine
from plone.registry.interfaces import IRegistry
from plone.registry.record import Record
from plone.staticresources._scripts.iconmap_json import FILES
from zope.component import getUtility

import logging

logger = logging.getLogger(__name__)


def update_all_icons(context):
    registry = getUtility(IRegistry)

    for file in FILES:
        root = etree.parse(file)
        for record in root.xpath("//record"):
            key = record.get("name")
            val = record.xpath("value")[0].text
            _val = registry.get(key)
            if not _val:
                # set
                title = record.xpath("field/title")[0].text
                field = TextLine(title=title)
                record = Record(field=field, value=val)
                registry.records[key] = record
                logger.info("Add icon %s", key)
