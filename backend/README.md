# Student Smart Marketplace — Backend API

A clean, modular Express + MongoDB REST API for a student buy/rent marketplace.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# 3. Start the server
npm run dev        # development (nodemon)
npm start          # production
```

---

## 📁 Folder Structure

```
student-marketplace/
├── config/
│   └── db.js                  # MongoDB connection
├── controllers/
│   ├── authController.js      # Register, Login, Me
│   ├── productController.js   # CRUD for products
│   └── rentalController.js    # Full rental lifecycle
├── middleware/
│   ├── auth.js                # JWT verify middleware
│   └── errorHandler.js        # Global error handler
├── models/
│   ├── User.js                # User schema
│   ├── Product.js             # Product schema
│   └── Rental.js              # Rental schema
├── routes/
│   ├── auth.js
│   ├── products.js
│   └── rentals.js
├── server.js                  # App entry point
├── .env.example
└── README.md
```

---

## 🔐 Auth API — `/api/auth`

| Method | Route       | Access  | Description     |
|--------|-------------|---------|-----------------|
| POST   | `/register` | Public  | Register user   |
| POST   | `/login`    | Public  | Login & get JWT |
| GET    | `/me`       | Private | Get current user|

### Register
```json
POST /api/auth/register
{
  "name": "Alice",
  "email": "alice@university.edu",
  "password": "secret123"
}
```

### Login
```json
POST /api/auth/login
{
  "email": "alice@university.edu",
  "password": "secret123"
}
```
Response includes a `token`. Use it as: `Authorization: Bearer <token>`

---

## 📦 Products API — `/api/products`

| Method | Route   | Access  | Description         |
|--------|---------|---------|---------------------|
| GET    | `/`     | Public  | Get all products    |
| POST   | `/`     | Private | Create product      |
| GET    | `/:id`  | Public  | Get single product  |
| PUT    | `/:id`  | Private | Update product      |
| DELETE | `/:id`  | Private | Delete product      |

### Create Product
```json
POST /api/products
Authorization: Bearer <token>
{
  "title": "Engineering Maths Textbook",
  "description": "Covers calculus, linear algebra. Good condition.",
  "price": 500,
  "rentPrice": 50,
  "deposit": 100,
  "category": "books"
}
```

### Get All Products (with filters)
```
GET /api/products?category=books&status=available&page=1&limit=10
```

**Categories:** `books` | `electronics` | `furniture` | `clothing` | `sports` | `other`

---

## 🔄 Rentals API — `/api/rentals`

All rental routes require `Authorization: Bearer <token>`

| Method | Route          | Access  | Description                    |
|--------|----------------|---------|--------------------------------|
| POST   | `/`            | Private | Create rental (status: pending)|
| GET    | `/my`          | Private | Get my rentals                 |
| GET    | `/:id`         | Private | Get single rental              |
| PATCH  | `/:id/confirm` | Private | Owner confirms (→ active)      |
| PATCH  | `/:id/return`  | Private | Return item (→ completed)      |
| PATCH  | `/:id/cancel`  | Private | Renter cancels pending rental  |

### Rental Flow
```
Renter creates rental → status: pending
         ↓
Owner confirms rental → status: active  (product → rented)
         ↓
Either party returns  → status: completed (product → available)
```

### Create Rental
```json
POST /api/rentals
Authorization: Bearer <renter-token>
{
  "productId": "64abc123...",
  "startDate": "2024-02-01",
  "endDate": "2024-02-15"
}
```

### Get My Rentals
```
GET /api/rentals/my?role=renter    # rentals you made
GET /api/rentals/my?role=owner     # rentals on your products
```

### Confirm Rental (product owner)
```
PATCH /api/rentals/:id/confirm
Authorization: Bearer <owner-token>
```

### Return Rental
```
PATCH /api/rentals/:id/return
Authorization: Bearer <renter-or-owner-token>
```

---

## 🌐 Health Check
```
GET /api/health
```

---

## 📋 Schemas

### User
| Field      | Type    | Notes              |
|------------|---------|--------------------|
| name       | String  | required           |
| email      | String  | unique             |
| password   | String  | bcrypt hashed      |
| isVerified | Boolean | default: false     |
| rating     | Number  | 0–5, default: 0    |

### Product
| Field       | Type     | Notes                                         |
|-------------|----------|-----------------------------------------------|
| title       | String   | required                                      |
| description | String   | required                                      |
| price       | Number   | sale price                                    |
| rentPrice   | Number   | per-day or per-period rent                    |
| deposit     | Number   | refundable deposit                            |
| category    | String   | books/electronics/furniture/clothing/sports/other |
| owner       | ObjectId | ref: User                                     |
| status      | String   | available / rented / sold                     |

### Rental
| Field     | Type     | Notes                          |
|-----------|----------|--------------------------------|
| productId | ObjectId | ref: Product                   |
| renterId  | ObjectId | ref: User                      |
| startDate | Date     | required                       |
| endDate   | Date     | required, must be > startDate  |
| deposit   | Number   | auto-copied from product       |
| status    | String   | pending/active/completed/cancelled |

---

## 🛡️ Error Responses

All errors follow this shape:
```json
{
  "success": false,
  "message": "Descriptive error message here"
}
```
