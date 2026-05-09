
# Frontend Documentation — Smart Marketplace for Students

**Stack:** Next.js (App Router) · JavaScript · Tailwind CSS · Axios · Socket.IO Client

---

## 📁 Folder Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.js                  # Root layout (Navbar + Toaster)
│   │   ├── page.js                    # Home — product listing
│   │   ├── login/
│   │   │   └── page.js                # Login page
│   │   ├── register/
│   │   │   └── page.js                # Register page
│   │   ├── products/
│   │   │   ├── new/page.js            # Create product form
│   │   │   └── [id]/page.js           # Single product detail + rent button
│   │   └── dashboard/
│   │       └── page.js                # User dashboard — my listings + rentals
│   ├── components/
│   │   ├── Navbar.js                  # Top nav with auth state
│   │   ├── ProductCard.js             # Product grid card
│   │   ├── RentalCard.js              # Rental status card
│   │   ├── CategoryFilter.js          # Filter bar for home page
│   │   └── ProtectedRoute.js          # Redirect if not logged in
│   └── lib/
│       ├── axios.js                   # Axios instance with base URL + auth
│       ├── auth.js                    # Token helpers (save, get, remove)
│       └── socket.js                  # Socket.IO client instance
├── public/
├── tailwind.config.js
└── package.json
```

---

## 🔧 Core Library Files

### `src/lib/axios.js` — API Client
```js
import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

---

### `src/lib/auth.js` — Token Helpers
```js
import Cookies from "js-cookie";

export const saveToken = (token) => Cookies.set("token", token, { expires: 7 });
export const getToken = () => Cookies.get("token");
export const removeToken = () => Cookies.remove("token");
export const isLoggedIn = () => !!getToken();
```

---

### `src/lib/socket.js` — Realtime Client
```js
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", { autoConnect: false });
export default socket;
```

Call `socket.connect()` after login, `socket.disconnect()` on logout.

---

## 📄 Pages

### `/` — Home (Product Listing)
- Fetches all products: `GET /api/products`
- Supports filter by category and status
- Renders `<ProductCard />` grid
- No auth required

**Key state:**
```js
const [products, setProducts] = useState([]);
const [category, setCategory] = useState("");
const [page, setPage] = useState(1);
```

---

### `/login` — Login Page
- Form: email + password
- Calls `POST /api/auth/login`
- Saves token via `saveToken(token)`
- Redirects to `/` on success
- Shows toast on error

---

### `/register` — Register Page
- Form: name + email + password
- Calls `POST /api/auth/register`
- Saves token via `saveToken(token)`
- Redirects to `/` on success

---

### `/products/new` — Create Product
- Protected route (redirect to `/login` if no token)
- Form: title, description, price, rentPrice, deposit, category
- Calls `POST /api/products`
- Redirects to `/products/:id` on success

---

### `/products/[id]` — Product Detail
- Fetches product: `GET /api/products/:id`
- Shows full details + owner info
- If logged in and not owner → shows **Rent** button
- Rent button opens date picker modal → calls `POST /api/rentals`
- Shows toast on success/error

---

### `/dashboard` — User Dashboard
- Protected route
- Two tabs: **My Listings** and **My Rentals**

**My Listings tab:**
- Fetches user's own products (filtered by `owner`)
- Allows edit/delete

**My Rentals tab:**
- Fetches `GET /api/rentals/my?role=renter` — rentals made
- Fetches `GET /api/rentals/my?role=owner` — rentals on my products
- Renders `<RentalCard />` with action buttons (confirm / return / cancel)

---

## 🧩 Components

### `<Navbar />`
- Shows logo + nav links
- If logged in: shows user name + Logout button
- If not: shows Login / Register links
- Reads token from cookie to determine auth state

---

### `<ProductCard />`
**Props:** `{ product }`

Displays:
- Title, category badge, price, rentPrice
- Owner name + rating
- Status badge (`available` → green, `rented` → yellow)
- Links to `/products/:id`

---

### `<RentalCard />`
**Props:** `{ rental, role }`

Displays:
- Product title, dates, deposit, status badge
- **If role = owner + status = pending** → Confirm button
- **If status = active** → Return button
- **If role = renter + status = pending** → Cancel button
- Calls respective PATCH endpoints on click

---

### `<CategoryFilter />`
**Props:** `{ selected, onChange }`

- Horizontal pill buttons for each category
- `books` | `electronics` | `furniture` | `clothing` | `sports` | `other`
- Updates parent state on click

---

### `<ProtectedRoute />`
```js
export default function ProtectedRoute({ children }) {
  const router = useRouter();
  useEffect(() => {
    if (!isLoggedIn()) router.push("/login");
  }, []);
  return isLoggedIn() ? children : null;
}
```

Wrap any page that requires auth.

---

## 🔌 API Integration Flow

```
User lands on Home
  └── useEffect → GET /api/products → setProducts()

User logs in
  └── POST /api/auth/login
      → save token in cookie
      → socket.connect()
      → socket.emit('join', userId)
      → redirect to /

User clicks Rent
  └── POST /api/rentals
      → on success: toast + socket emits 'rental:requested' to owner

Owner sees notification (Socket.IO)
  └── PATCH /api/rentals/:id/confirm
      → on success: product status updates + socket emits 'rental:confirmed' to renter

Either party returns item
  └── PATCH /api/rentals/:id/return
      → product back to available
      → socket emits 'rental:returned'
```

---

## 📦 Dependencies

```bash
# Core
npm install axios js-cookie react-hot-toast socket.io-client

# Already included via create-next-app
# next, react, react-dom, tailwindcss
```

---

## ▶️ Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs at `http://localhost:3000`

> Make sure backend is running on `http://localhost:5000` first.

---

## 🔔 Socket.IO Events Reference

| Event | Direction | Trigger |
|---|---|---|
| `join` | Client → Server | After login (sends userId) |
| `rental:requested` | Server → Owner | Renter creates a rental |
| `rental:confirmed` | Server → Renter | Owner confirms rental |
| `rental:returned` | Server → Both | Item marked returned |
