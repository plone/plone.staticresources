import json
import os


this_dir = os.path.dirname(os.path.realpath(__file__))

# Part Register Country Flag Icons
DATA_FILE_COUNTRY = "{dir}/../static/icons-country-flags/countries.json".format(
    dir=this_dir
)
OUTPUT_FILE_COUNTRY = f"{this_dir}/../profiles/default/registry/icons_country_flags.xml"

DEFAULT_PATTERN_COUNTRY = """
  <record name="plone.icon.countryflag">
    <field type="plone.registry.field.TextLine">
      <title>Country Icon Flag Default</title>
    </field>
    <value key="resource">++plone++bootstrap-icons/flag.svg</value>
  </record>
"""

PATTERN_COUNTRY = """
  <record name="plone.icon.countryflag/##KEY##">
    <field type="plone.registry.field.TextLine">
      <title>Country Icon Flag ##NAME##</title>
    </field>
    <value key="resource">++plone++country-flag-icons/##KEY##.svg</value>
  </record>
"""


# Part Register Language Flag Icons
DATA_FILE_LANGUAGE = "{dir}/../static/icons-language-flags/languages.json".format(
    dir=this_dir
)
OUTPUT_FILE_LANGUAGE = (
    f"{this_dir}/../profiles/default/registry/icons_language_flags.xml"
)

DEFAULT_PATTERN_LANGUAGE = """
  <record name="plone.icon.languageflag">
    <field type="plone.registry.field.TextLine">
      <title>Language Icon Flag Default</title>
    </field>
    <value key="resource">++plone++bootstrap-icons/flag.svg</value>
  </record>
"""

PATTERN_LANGUAGE = """
  <record name="plone.icon.languageflag/##KEY##">
    <field type="plone.registry.field.TextLine">
      <title>Language Icon Flag ##NAME##</title>
    </field>
    <value key="resource">++plone++language-flag-icons/##KEY##.svg</value>
  </record>
"""


def registry_writer(datafile, output, default_pattern, pattern):
    entries = []
    entries.append(default_pattern)

    with open(datafile) as countries:
        data = countries.read()
        countries_data = json.loads(data)

        for key, name in countries_data.items():
            entry = pattern.replace("##KEY##", key.lower()).replace(
                "##NAME##", name.lower()
            )
            entries.append(entry)

    if entries:
        with open(output, "w") as f:
            f.write(
                '<?xml version="1.0" encoding="utf-8"?>\n<registry>'
                + "".join(entries)
                + "\n</registry>\n"
            )
            f.close()
    print("Done.")
    print("If any new icons were added also add an upgrade step!")


def main():
    registry_writer(
        DATA_FILE_COUNTRY, OUTPUT_FILE_COUNTRY, DEFAULT_PATTERN_COUNTRY, PATTERN_COUNTRY
    )

    registry_writer(
        DATA_FILE_LANGUAGE,
        OUTPUT_FILE_LANGUAGE,
        DEFAULT_PATTERN_LANGUAGE,
        PATTERN_LANGUAGE,
    )


if __name__ == "__main__":
    main()
