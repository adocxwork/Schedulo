# Schedulo (Calendly Clone)

A functional scheduling/booking web application that closely replicates Calendly's design and user experience.

## Tech Stack
- **Frontend**: React.js (Vite), React Router, date-fns, vanilla CSS for UI.
- **Backend**: Python 3, FastAPI, SQLAlchemy (ORM).
- **Database**: PostgreSQL.

## Core Features
1. **Event Types Management**: Create, edit, and delete event types with attributes like duration, name, and URL slug. Each event has a unique public link.
2. **Availability Settings**: Configure weekly working schedules, including time slots and active days. Set availability timezone.
3. **Public Booking Page**: Date picking calendar view. Available time slots computed on-the-fly to prevent double bookings. Form to collect invitee details.
4. **Meetings Page**: Track past and upcoming meetings. Cancel scheduled meetings. 
5. **No Login System**: For simplicity and as per requirements, an administrative default context is assumed for creating event types/availability.

## Prerequisites
- Node.js (v20+)
- Python 3.10+
- PostgreSQL (running locally on port `5432` with username `postgres` and password `1234`, see `.env`).

## Setup Instructions

### Database Checkout
1. Start PostgreSQL server.
2. Create `calendly2` database using `psql`, e.g., `CREATE DATABASE calendly2 WITH ENCODING='UTF8';`

### Backend Setup
1. CD into the `backend/` folder.
2. Create and activate a Python virtual environment (optional but recommended).
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure `.env`:
   ```bash
   DATABASE_URL=postgresql://postgres:1234@localhost:5432/calendly2
   ```
5. Run the application (This will also auto-seed the database with Event Types and Bookings):
   ```bash
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

### Frontend Setup
1. CD into the `frontend/` folder.
2. Install NodeJS dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

### 🚀 One-Click Start (Recommended for Windows)
Instead of running backend and frontend terminals manually, you can just double-click the included `start.bat` file in the root directory!
It will instantly initialize two terminals, load environmental variables, and run both FastApi and Vite respectively.

### 🍏🐧 For Mac / Linux Users
You can run the equivalent `start.sh` shell script:
```bash
chmod +x start.sh
./start.sh
```
This will launch both servers in the background. Press `CTRL+C` to cleanly stop both of them.

4. Access the web app in your browser at `http://localhost:5173`.

## Assumptions
- Uses a default administrator state for setting event types, checking meetings, and updating availability (No robust authentication or RBAC).
- The user is the sole provider of schedules.
- `pg_hba.conf` allows connections based on `1234` for the `postgres` user.
- Timezone defaults to "Asia/Kolkata" but can be modified in Availability settings.
