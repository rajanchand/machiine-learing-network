#!/bin/bash

# Network Anomaly Detection System - Startup Script
# This script starts the backend server, the streaming simulator, and the frontend dev server.

# Configuration
BACKEND_LOG="backend.log"
SIMULATOR_LOG="simulator.log"
FRONTEND_LOG="frontend.log"

echo "=================================================================="
echo "⚡ Starting Anomaly Guard Network Anomaly Detection System ⚡"
echo "=================================================================="

# Function to clean up background processes on exit
cleanup() {
  echo ""
  echo "=================================================================="
  echo "🛑 Stopping all services..."
  echo "=================================================================="
  
  # Terminate processes
  if [ -n "$BACKEND_PID" ]; then
    echo "Stopping Backend (PID $BACKEND_PID)..."
    kill -TERM "$BACKEND_PID" 2>/dev/null
  fi
  
  if [ -n "$SIMULATOR_PID" ]; then
    echo "Stopping Simulator (PID $SIMULATOR_PID)..."
    kill -TERM "$SIMULATOR_PID" 2>/dev/null
  fi
  
  if [ -n "$FRONTEND_PID" ]; then
    echo "Stopping Frontend (PID $FRONTEND_PID)..."
    kill -TERM "$FRONTEND_PID" 2>/dev/null
  fi
  
  # Wait for them to finish
  wait 2>/dev/null
  
  echo "✅ All services stopped successfully."
  exit 0
}

# Trap Ctrl+C (SIGINT) and SIGTERM
trap cleanup SIGINT SIGTERM

# Start Backend
echo "🚀 Starting Backend API on http://localhost:8000..."
echo "Logs redirected to $BACKEND_LOG"
backend/.venv/bin/python -m uvicorn anomaly_detection.app:create_app --factory --host 0.0.0.0 --port 8000 > "$BACKEND_LOG" 2>&1 &
BACKEND_PID=$!

# Wait for backend to start responding
echo "⌛ Waiting for Backend to be healthy..."
for i in {1..30}; do
  if curl -s http://localhost:8000/health >/dev/null; then
    echo "✅ Backend API is healthy!"
    break
  fi
  if [ $i -eq 30 ]; then
    echo "❌ Timeout waiting for Backend API to start. Please check $BACKEND_LOG"
    cleanup
  fi
  sleep 1
done

# Start Simulator
echo "🚀 Starting Network Traffic Simulator..."
echo "Logs redirected to $SIMULATOR_LOG"
cd simulator
PYTHONPATH=src ../backend/.venv/bin/python -u -m simulator.replay > "../$SIMULATOR_LOG" 2>&1 &
SIMULATOR_PID=$!
cd ..

# Start Frontend
echo "🚀 Starting Frontend Dev Server..."
echo "Logs redirected to $FRONTEND_LOG"
cd frontend
npm run dev > "../$FRONTEND_LOG" 2>&1 &
FRONTEND_PID=$!
cd ..

echo "=================================================================="
echo "🎉 System is running!"
echo "=================================================================="
echo "Dashboard: http://localhost:5173/ (or next available port)"
echo "Backend API: http://localhost:8000/docs"
echo "Press Ctrl+C to stop all services."
echo "=================================================================="

# Wait for all background jobs to finish (keeps script running)
wait
