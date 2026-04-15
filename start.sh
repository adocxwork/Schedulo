#!/bin/bash
echo "Starting Schedulo (Calendly Clone)..."

# Start the Backend in the background
echo "Starting Backend on port 8000..."
cd backend
export PGPASSWORD="1234"
# Using activate if using venv (optional): source venv/bin/activate
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
cd ..

# Start the Frontend in the background
echo "Starting Frontend on port 5173..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "Both servers have been launched in the background!"
echo "Backend:   http://localhost:8000"
echo "Frontend:  http://localhost:5173"
echo "Press [CTRL+C] to stop both servers."

# Wait for user interruption to kill both processes
trap "kill $BACKEND_PID $FRONTEND_PID" SIGINT SIGTERM
wait
