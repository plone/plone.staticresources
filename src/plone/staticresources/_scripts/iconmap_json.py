from lxml import etree

import json


FILES = [
    r"../profiles/default/registry/icons_bootstrap.xml",
    r"../profiles/default/registry/icons_contenttype.xml",
    r"../profiles/default/registry/icons_country_flags.xml",
    r"../profiles/default/registry/icons_language_flags.xml",
    r"../profiles/default/registry/icons_mimetype.xml",
    r"../profiles/default/registry/icons_plone.xml",
    r"../profiles/default/registry/icons_toolbar.xml",
]

PATH_ICONMAP = "../static/iconmap.json"


def main():
    iconmap = {}
    for file in FILES:
        root = etree.parse(file)
        for record in root.xpath("//record"):
            iconmap[record.get("name")] = record.xpath("value")[0].text

    with open(PATH_ICONMAP, "w") as f:
        f.write(json.dumps(iconmap, indent=4, sort_keys=True))


if __name__ == "__main__":
    main()
