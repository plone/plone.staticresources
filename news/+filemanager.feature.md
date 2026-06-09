Add Svelte 5 folder-contents pattern `pat-filemanager`

A plone.restapi-only rewrite of pat-structure's folder contents, built on
Svelte 5 runes. Table and photo-grid views; selection, clipboard
(cut/copy/paste), delete with link-integrity check, drag-and-drop
reordering and drag-into-folder; multi-upload via @tus-upload — including
dropping a whole folder to recreate its tree behind a preview/approval
step; in-app folder browsing with breadcrumbs and live header sync; column
configuration, free-text and advanced querystring filtering; batch actions
(workflow, tags, properties, rename); cookie persistence, i18n and
accessibility. No Backbone, underscore, DataTables or custom Plone views.
