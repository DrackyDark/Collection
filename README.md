# Sketching Gallery

This project now runs with a Python Flask backend and a MySQL database.

## Setup

1. Create a virtual environment and install dependencies:
   `python -m venv .venv`
   `.venv\Scripts\activate`
   `pip install -r requirements.txt`
2. Copy `.env.example` to `.env` and update the MySQL credentials.
3. Create the database by running the SQL inside `backend/schema.sql`, or let the Flask app create the tables automatically after the database exists.
4. Start the app:
   `python backend/app.py`
5. Open [http://127.0.0.1:5000](http://127.0.0.1:5000)

## Database-Controlled Website Content

The visible text for the main public pages is now controlled by the `site_content` table.

- `page` stores the page name such as `index`, `about`, `services`, `gallery`, `contact`, or `global`
- `section_key` stores the content slot name
- `value` stores the text shown on the website

Example:
```sql
UPDATE site_content
SET value = 'Your new homepage heading'
WHERE page = 'index' AND section_key = 'hero_title';
```

## Backend API

- `POST /api/register` creates a user account and starts a session.
- `POST /api/login` signs an existing user in with username or email.
- `POST /api/logout` clears the session.
- `GET /api/profile` returns the signed-in profile and that user's uploads.
- `GET /api/artworks` returns uploaded artworks for the gallery page.
- `POST /api/artworks` uploads a new artwork image for the signed-in user.
