import os


this_dir = os.path.dirname(os.path.realpath(__file__))

ICONS_DIR = f"{this_dir}/../static/icons-bootstrap"
OUTPUT_FILE = "{dir}/../profiles/default/registry/icons_bootstrap.xml".format(
    dir=this_dir
)

registry_template = """<?xml version="1.0" encoding="utf-8"?>
<registry>
{}
</registry>
"""

entry = """
  <record name="plone.icon.{icon}">
    <field type="plone.registry.field.TextLine">
      <title>Bootstrap Icon {icon}</title>
    </field>
    <value key="resource">++plone++bootstrap-icons/{icon}.svg</value>
  </record>
"""


def main():
    output = ""

    for item in sorted(os.listdir(ICONS_DIR)):
        if item.endswith(".svg"):
            icon = item[:-4]
            output = output + entry.format(icon=icon)

    output = registry_template.format(output)

    with open(OUTPUT_FILE, "w") as f:
        f.write(output)

    print("Done.")
    print("If any new icons were added also add an upgrade step!")


if __name__ == "__main__":
    main()
