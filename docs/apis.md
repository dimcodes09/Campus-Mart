API Documentation — Smart Marketplace for Students
Base URL: `http://localhost:5000/api`
All protected routes require:
```
Authorization: Bearer <jwt_token>
```
---
🔐 Auth — `/api/auth`
---
POST `/api/auth/register`
Register a new user.
Headers: `Content-Type: application/json`
Request Body:
```json
{
  "name": "Rahul Sharma",
  "email": "rahul@university.edu",
  "password": "secret123"
}
```
Response `201`:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1...",
  "user": {
    "_id": "64abc...",
    "name": "Rahul Sharma",
    "email": "rahul@university.edu",
    "isVerified": false,
    "rating": 0
  }
}
```
---
POST `/api/auth/login`
Login and receive JWT.
Headers: `Content-Type: application/json`
Request Body:
```json
{
  "email": "rahul@university.edu",
  "password": "secret123"
}
```
Response `200`:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1...",
  "user": { "_id": "64abc...", "name": "Rahul Sharma" }
}
```
Error `401`:
```json
{ "success": false, "message": "Invalid email or password." }
```
---
GET `/api/auth/me`
Get current logged-in user.
Headers: `Authorization: Bearer <token>`
Response `200`:
```json
{
  "success": true,
  "user": {
    "_id": "64abc...",
    "name": "Rahul Sharma",
    "email": "rahul@university.edu",
    "rating": 4.2
  }
}
```
---
📦 Products — `/api/products`
---
GET `/api/products`
Get all products with optional filters.
Headers: None (public)
Query Params:
Param	Type	Example
`category`	string	`books`
`status`	string	`available`
`page`	number	`1`
`limit`	number	`10`
Example: `GET /api/products?category=books&status=available&page=1&limit=10`
Response `200`:
```json
{
  "success": true,
  "total": 42,
  "page": 1,
  "pages": 5,
  "products": [
    {
      "_id": "64xyz...",
      "title": "Engineering Maths Textbook",
      "price": 500,
      "rentPrice": 50,
      "deposit": 100,
      "category": "books",
      "status": "available",
      "owner": { "name": "Rahul Sharma", "rating": 4.2 }
    }
  ]
}
```
---
POST `/api/products`
Create a new product listing.
Headers: `Authorization: Bearer <token>`
Request Body:
```json
{
  "title": "Engineering Maths Textbook",
  "description": "Covers calculus and linear algebra. Good condition.",
  "price": 500,
  "rentPrice": 50,
  "deposit": 100,
  "category": "books"
}
```
Categories: `books` | `electronics` | `furniture` | `clothing` | `sports` | `other`
Response `201`:
```json
{
  "success": true,
  "product": {
    "_id": "64xyz...",
    "title": "Engineering Maths Textbook",
    "status": "available",
    "owner": "64abc..."
  }
}
```
---
GET `/api/products/:id`
Get a single product by ID.
Headers: None (public)
Response `200`:
```json
{
  "success": true,
  "product": {
    "_id": "64xyz...",
    "title": "Engineering Maths Textbook",
    "description": "Covers calculus...",
    "price": 500,
    "rentPrice": 50,
    "deposit": 100,
    "category": "books",
    "status": "available",
    "owner": { "name": "Rahul Sharma", "email": "rahul@university.edu", "rating": 4.2 }
  }
}
```
Error `404`:
```json
{ "success": false, "message": "Product not found." }
```
---
PUT `/api/products/:id`
Update a product (owner only).
Headers: `Authorization: Bearer <token>`
Request Body (any updatable fields):
```json
{
  "price": 450,
  "status": "sold"
}
```
Response `200`:
```json
{ "success": true, "product": { ... } }
```
---
DELETE `/api/products/:id`
Delete a product (owner only).
Headers: `Authorization: Bearer <token>`
Response `200`:
```json
{ "success": true, "message": "Product deleted successfully." }
```
---
🔄 Rentals — `/api/rentals`
> All rental routes require `Authorization: Bearer <token>`
---
POST `/api/rentals`
Create a new rental request (status: `pending`).
Request Body:
```json
{
  "productId": "64xyz...",
  "startDate": "2024-03-01",
  "endDate": "2024-03-15"
}
```
Response `201`:
```json
{
  "success": true,
  "rental": {
    "_id": "64ren...",
    "productId": "64xyz...",
    "renterId": "64abc...",
    "startDate": "2024-03-01T00:00:00.000Z",
    "endDate": "2024-03-15T00:00:00.000Z",
    "deposit": 100,
    "status": "pending"
  }
}
```
Validations:
Product must be `available`
Cannot rent your own product
---
PATCH `/api/rentals/:id/confirm`
Owner confirms rental → status becomes `active`, product becomes `rented`.
Headers: `Authorization: Bearer <owner-token>`
Response `200`:
```json
{ "success": true, "rental": { "status": "active", ... } }
```
---
PATCH `/api/rentals/:id/return`
Renter or owner marks item returned → status becomes `completed`, product becomes `available`.
Headers: `Authorization: Bearer <token>`
Response `200`:
```json
{ "success": true, "rental": { "status": "completed", ... } }
```
---
PATCH `/api/rentals/:id/cancel`
Renter cancels a `pending` rental.
Headers: `Authorization: Bearer <renter-token>`
Response `200`:
```json
{ "success": true, "rental": { "status": "cancelled", ... } }
```
---
GET `/api/rentals/my`
Get all rentals for the logged-in user.
Query Params:
Param	Value	Description
`role`	`renter`	Rentals I have made
`role`	`owner`	Rentals on my products
Example: `GET /api/rentals/my?role=owner`
Response `200`:
```json
{
  "success": true,
  "count": 3,
  "rentals": [
    {
      "_id": "64ren...",
      "productId": { "title": "Maths Textbook", "rentPrice": 50 },
      "renterId": { "name": "Priya Singh", "email": "priya@uni.edu" },
      "status": "active"
    }
  ]
}
```
---
GET `/api/rentals/:id`
Get a specific rental (renter or owner only).
Response `200`:
```json
{
  "success": true,
  "rental": { "_id": "64ren...", "status": "active", ... }
}
```
---
⚡ Rental Status Flow
```
POST /rentals          →  pending
PATCH /:id/confirm     →  active      (product → rented)
PATCH /:id/return      →  completed   (product → available)
PATCH /:id/cancel      →  cancelled   (pending only)
```
---
❌ Standard Error Response
```json
{
  "success": false,
  "message": "Descriptive error message here."
}
```
Code	Meaning
`400`	Bad request / validation failed
`401`	Unauthorized / invalid token
`403`	Forbidden / not your resource
`404`	Resource not found
`409`	Conflict (duplicate email)
`500`	Internal server error
