Final 3.0 release overview:

mockup was updated from 5.4.x to 5.6.x. See https://github.com/plone/mockup/releases/tag/5.6.4.

This is a substantial Classic UI modernization release with focused follow-up stabilization:

- TinyMCE was upgraded to version 8, including support for reading ``license_key`` from the Plone control panel.
- ``pat-contentbrowser`` was modernized internally (Svelte 5 migration), with follow-up fixes for batching, level filtering, selected items behavior, and upload interactions.
- ``pat-structure`` and related table handling were aligned with newer DataTables behavior, including fixes for initial sorting, column width handling, and ordering logic.
- Navigation and toolbar behavior were improved, including enhanced ``pat-navigationmarker`` capabilities and better toolbar scrolling behavior for constrained viewport heights.
- Accessibility and keyboard handling were improved in modal and recurrence interactions, including better focus trapping and semantically correct button-based controls.
- Several legacy jQuery-dependent paths were removed or reduced in favor of modernized pattern implementations.

After the larger feature jump in 5.6.0, the 5.6.1-5.6.4 updates primarily deliver bug fixes, UX polishing, and dependency maintenance for production readiness in Plone 6.2.

@petschki, @thet
