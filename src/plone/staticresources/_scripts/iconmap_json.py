from lxml import etree
from pathlib import Path

import json

module_dir = Path(__file__).parent
base_path = module_dir / ".." / "profiles" / "default" / "registry"


FILES = [
    base_path / "icons_bootstrap.xml",
    base_path / "icons_contenttype.xml",
    base_path / "icons_country_flags.xml",
    base_path / "icons_language_flags.xml",
    base_path / "icons_mimetype.xml",
    base_path / "icons_plone.xml",
    base_path / "icons_toolbar.xml",
]

PATH_ICONMAP = module_dir / ".." / "static" / "iconmap.json"


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
