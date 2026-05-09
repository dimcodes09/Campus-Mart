Backend Documentation — Smart Marketplace for Students
Stack: Node.js · Express.js · MongoDB (Mongoose) · JWT · Socket.IO
---
📁 Folder Structure
```
backend/
├── config/
│   └── db.js                  # MongoDB connection via Mongoose
├── controllers/
│   ├── authController.js      # Register, Login, GetMe
│   ├── productController.js   # CRUD operations for products
│   └── rentalController.js    # Full rental lifecycle logic
├── middleware/
│   ├── auth.js                # JWT verification (protect middleware)
│   └── errorHandler.js        # Global error handler
├── models/
│   ├── User.js                # User schema + password hashing
│   ├── Product.js             # Product schema + indexes
│   └── Rental.js              # Rental schema + date validation
├── routes/
│   ├── auth.js                # /api/auth
│   ├── products.js            # /api/products
│   └── rentals.js             # /api/rentals
├── server.js                  # App entry point
├── .env                       # Environment variables
└── package.json
```
---
⚙️ Environment Variables (`.env`)
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/student-marketplace
JWT_SECRET=supersecretkey123
JWT_EXPIRES_IN=7d
NODE_ENV=development
```
---
🗄️ Models
User (`models/User.js`)
Field	Type	Details
`name`	String	Required, trimmed
`email`	String	Required, unique, lowercase
`password`	String	Required, min 6 chars, bcrypt hashed, hidden from queries
`isVerified`	Boolean	Default: `false`
`rating`	Number	0–5, default: `0`
`timestamps`	Auto	`createdAt`, `updatedAt`
Key behaviour:
`pre('save')` hook hashes password with bcrypt (12 rounds) before every save
`comparePassword(candidate)` instance method for login verification
Password field has `select: false` — never returned in queries unless explicitly requested
---
Product (`models/Product.js`)
Field	Type	Details
`title`	String	Required
`description`	String	Required
`price`	Number	Sale price, min 0
`rentPrice`	Number	Rental rate, min 0
`deposit`	Number	Refundable deposit, default 0
`category`	String	Enum: `books`, `electronics`, `furniture`, `clothing`, `sports`, `other`
`owner`	ObjectId	Ref → User
`status`	String	Enum: `available`, `rented`, `sold` · Default: `available`
`timestamps`	Auto	`createdAt`, `updatedAt`
Indexes:
`{ category: 1, status: 1 }` — fast filtered listing
`{ owner: 1 }` — fast owner lookup
---
Rental (`models/Rental.js`)
Field	Type	Details
`productId`	ObjectId	Ref → Product
`renterId`	ObjectId	Ref → User
`startDate`	Date	Required
`endDate`	Date	Required, must be > startDate
`deposit`	Number	Auto-copied from product at creation
`status`	String	Enum: `pending`, `active`, `completed`, `cancelled` · Default: `pending`
`timestamps`	Auto	`createdAt`, `updatedAt`
Key behaviour:
`pre('save')` hook validates `endDate > startDate`
Deposit is snapshotted at rental creation — not affected by future product edits
Indexes:
`{ renterId: 1, status: 1 }` — fast user rental lookup
`{ productId: 1 }` — fast product rental history
---
🛡️ Middleware
`middleware/auth.js` — JWT Protect
```
Request → Extract Bearer token from Authorization header
       → Verify token with JWT_SECRET
       → Find user by decoded ID
       → Attach user to req.user
       → Call next()
```
Returns `401` if no token, invalid token, or user not found
Attached to any route that needs authentication
---
`middleware/errorHandler.js` — Global Error Handler
Catches all errors passed via `next(error)` and formats them cleanly:
Error Type	Detected By	Response
Duplicate key	`err.code === 11000`	`409` — "Email already exists"
Validation error	`err.name === 'ValidationError'`	`400` — field messages joined
Invalid ObjectId	`err.name === 'CastError'`	`400` — "Invalid ID"
Generic	fallback	`500` — "Internal Server Error"
In `development` mode, stack trace is included in response.
---
🔄 Rental Lifecycle Logic
```
① Renter calls POST /api/rentals
   - Checks product exists and is 'available'
   - Checks renter is not the product owner
   - Creates rental with status: 'pending'
   - Deposit auto-copied from product

② Owner calls PATCH /api/rentals/:id/confirm
   - Verifies caller is product owner
   - Rental status → 'active'
   - Product status → 'rented'
   - Both saved atomically via Promise.all()

③ Either party calls PATCH /api/rentals/:id/return
   - Verifies caller is renter OR owner
   - Rental status → 'completed'
   - Product status → 'available'
   - Both saved atomically via Promise.all()

④ Renter calls PATCH /api/rentals/:id/cancel
   - Only works when status is 'pending'
   - Rental status → 'cancelled'
   - Product remains 'available'
```
---
🔌 Socket.IO Integration Points
```
server.js
├── io.on('connection') → track connected users
├── emit('rental:requested')  → notify owner when renter creates rental
├── emit('rental:confirmed')  → notify renter when owner confirms
└── emit('rental:returned')   → notify both parties on completion
```
Suggested room strategy: Join users to a room by their `userId` on connect so targeted notifications work without broadcasting to everyone.
---
🚀 Running the Backend
```bash
cd backend
npm install
cp .env.example .env     # fill in your values
npm run dev              # nodemon watches for changes
```
Server starts at `http://localhost:5000`
---
📡 API Route Summary
Method	Route	Auth	Action
POST	`/api/auth/register`	❌	Register
POST	`/api/auth/login`	❌	Login
GET	`/api/auth/me`	✅	Get current user
GET	`/api/products`	❌	List all products
POST	`/api/products`	✅	Create product
GET	`/api/products/:id`	❌	Get product
PUT	`/api/products/:id`	✅	Update product
DELETE	`/api/products/:id`	✅	Delete product
POST	`/api/rentals`	✅	Request rental
GET	`/api/rentals/my`	✅	My rentals
GET	`/api/rentals/:id`	✅	Single rental
PATCH	`/api/rentals/:id/confirm`	✅	Confirm rental
PATCH	`/api/rentals/:id/return`	✅	Return item
PATCH	`/api/rentals/:id/cancel`	✅	Cancel rental
