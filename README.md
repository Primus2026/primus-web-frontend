# Primus 2026 Web Frontend

This directory contains the React + Vite frontend application for the Warehouse Management System.

## Overview
Connects to the FastAPI backend to visualize warehouse status, inventory, and alerts.

## Project Structure
- **Framework**: React (TypeScript) via Vite.
- **Styling**: Vanilla CSS.
- **Communication**: REST API (Backend) + WebSocket (Real-time alerts).

## Quick Start

### Option 1: Docker (Full System)
The recommended way to run the application with the backend and database.
```bash
cd ../primus-infra
docker compose up --build
```
Access at [http://localhost:5173](http://localhost:5173).

### Option 2: Local Development
```bash
npm install
npm run dev
```
*Note: Ensure the backend is running separately.*
