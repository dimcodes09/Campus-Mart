# System Architecture

## Overview
Smart Marketplace for Students is a full-stack platform enabling verified students to buy, sell, and rent items within a trusted ecosystem.

## Components

### 1. Frontend (Next.js)
- Handles UI and user interactions
- Communicates with backend via REST APIs
- Displays products, chat, and rental flow

### 2. Backend (Node.js + Express)
- Handles business logic
- Authentication (JWT)
- Product and rental management
- API endpoints

### 3. Database (MongoDB)
- Stores users, products, rentals
- Uses Mongoose for schema modeling

### 4. Real-time Layer (Socket.IO)
- Enables instant messaging between users
- Supports notifications

### 5. AI Layer (API-based)
- Generates product descriptions
- Provides recommendations
- Assists in smart search

---

## Data Flow

User → Frontend → Backend API → Database  
                      ↓  
                  AI API  
                      ↓  
                 Response → Frontend

---

## Key Design Principles
- Modular backend structure
- Scalable API design
- Real-time interaction
- Trust-focused rental system