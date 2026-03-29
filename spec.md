# StudyVault

## Current State
New project. Only scaffolded backend and empty frontend exist.

## Requested Changes (Diff)

### Add
- Internet Identity authentication (admin and student roles)
- Category quick-access: Class 10, Class 11, Class 12, JEE, NEET, IIT-JEE
- PDF notes storage and browsing (upload via admin, view by all)
- Admin panel: upload PDFs with title, subject, category, description
- Student features: search notes, bookmark notes, track reading progress
- Bilingual UI: English and Hindi toggle
- Role-based access: admin can upload/delete, students can view/bookmark

### Modify
- Nothing (new project)

### Remove
- Nothing (new project)

## Implementation Plan
1. Select `authorization` and `blob-storage` components
2. Generate Motoko backend with:
   - Notes metadata store (title, subject, category, description, blobId, uploadedBy, timestamp)
   - CRUD for notes (admin only for create/delete)
   - Bookmark management per user
   - Reading progress tracking per user
   - Category enum: class10, class11, class12, jee, neet, iitjee
3. Frontend:
   - Landing/home page with category cards
   - Notes listing page filtered by category
   - Note detail/viewer page (PDF embed)
   - Search functionality
   - Bookmarks page
   - Progress tracking section
   - Admin panel (protected, admin role only)
   - Language toggle (EN/HI)
   - Internet Identity login button
