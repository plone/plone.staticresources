"""Installer for the plone.staticresources package."""

from pathlib import Path
from setuptools import find_packages
from setuptools import setup


long_description = (
    f"{Path('README.rst').read_text()}\n{Path('CHANGES.rst').read_text()}"
)

setup(
    name="plone.staticresources",
    version="2.2.5",
    description="Static resources for Plone",
    long_description=long_description,
    long_description_content_type="text/x-rst",
    # Get more strings from
    # https://pypi.org/classifiers/
    classifiers=[
        "Development Status :: 5 - Production/Stable",
        "Environment :: Web Environment",
        "Framework :: Plone",
        "Framework :: Plone :: 6.0",
        "Framework :: Plone :: 6.1",
        "Framework :: Plone :: Core",
        "Programming Language :: Python",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Operating System :: OS Independent",
        "License :: OSI Approved :: GNU General Public License v2 (GPLv2)",
    ],
    keywords="Python Plone javascript icons staticresources",
    author="Plone Foundation",
    author_email="plone-developers@lists.sourceforge.net",
    url="https://github.com/plone/plone.staticresources",
    license="GPL version 2",
    packages=find_packages("src"),
    namespace_packages=["plone"],
    package_dir={"": "src"},
    python_requires=">=3.8",
    include_package_data=True,
    zip_safe=False,
    install_requires=[
        "Products.GenericSetup",
        "lxml",
        "setuptools",
        "plone.base",
        "plone.resource",
        "zope.i18nmessageid",
        "zope.interface",
    ],
    extras_require={
        "test": [
            "plone.app.testing",
            "plone.registry",
            "zope.component",
        ],
    },
    entry_points="""
    [console_scripts]
    plone-register-icons = plone.staticresources._scripts.register_icons:main
    plone-register-flags = plone.staticresources._scripts.register_flag_icons:main
    [z3c.autoinclude.plugin]
    target = plone
    """,
)
