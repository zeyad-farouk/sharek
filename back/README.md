# Sharek Backend API

A production-ready Node.js + Express.js + MongoDB backend for the **Sharek** tool-sharing and rental platform.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (edit .env first)
# MONGO_URI=mongodb://127.0.0.1:27017/sharek-app
# PORT=5000
# JWT_SECRET=your_secret_here
# JWT_EXPIRE=30d

# 3. Start development server
npm run dev

# 4. Start production server
npm start
```

---

## 📁 Project Structure

```
back/
├── config/
│   └── db.js                    # MongoDB connection
├── controllers/
│   ├── auth.controller.js       # Register, login, profile
│   ├── item.controller.js       # Tool listings CRUD
│   ├── cart.controller.js       # Shopping cart
│   ├── order.controller.js      # Checkout & order history
│   ├── message.controller.js    # Conversations & chat
│   ├── notification.controller.js # Notifications
│   └── request.controller.js   # Rental requests
├── middlewares/
│   ├── auth.middleware.js       # JWT protect + authorize
│   ├── validate.middleware.js   # express-validator errors
│   └── error.middleware.js      # Global error handler
├── models/
│   ├── user.model.js            # Users (auth, profile)
│   ├── item.model.js            # Tool listings
│   ├── cart.model.js            # Per-user cart
│   ├── order.model.js           # Completed orders
│   ├── message.model.js         # Chat messages
│   ├── notification.model.js    # In-app notifications
│   └── request.model.js         # Tool rental requests
├── routes/
│   ├── auth.routes.js
│   ├── item.routes.js
│   ├── cart.routes.js
│   ├── order.routes.js
│   ├── message.routes.js
│   ├── notification.routes.js
│   └── request.routes.js
├── utils/
│   ├── response.js              # Unified sendSuccess / sendError
│   └── queryBuilder.js         # Search, filter, sort, paginate
├── .env
├── .gitignore
├── app.js
├── server.js
└── package.json
```

---

## 🌐 API Reference

**Base URL:** `http://localhost:5000/api`

**Response Format:**
```json
// Success
{ "success": true, "message": "...", "data": {}, "meta": {} }

// Error
{ "success": false, "message": "..." }
```

**Authentication:** Pass `Authorization: Bearer <token>` header for protected routes.

---

### 🔐 Auth — `/api/auth`

| Method | Endpoint              | Auth | Description              |
|--------|-----------------------|------|--------------------------|
| POST   | `/register`           | ❌   | Create a new account     |
| POST   | `/login`              | ❌   | Login and get JWT token  |
| GET    | `/me`                 | ✅   | Get my profile           |
| PUT    | `/me`                 | ✅   | Update my profile        |
| PUT    | `/change-password`    | ✅   | Change my password       |

**Register:**
```json
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "name": "Khaled Alaa",
  "department": "Fine Arts",
  "location": "Cairo, Egypt"
}
```

**Login:**
```json
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
// Response: { "data": { "token": "eyJ...", "user": {...} } }
```

---

### 🔧 Items — `/api/items`

| Method | Endpoint        | Auth | Description                   |
|--------|-----------------|------|-------------------------------|
| GET    | `/`             | ❌   | List items (search/filter)    |
| GET    | `/my`           | ✅   | My listed items (Profile page)|
| GET    | `/:id`          | ❌   | Get single item               |
| POST   | `/`             | ✅   | Create new item               |
| PUT    | `/:id`          | ✅   | Update item (owner only)      |
| DELETE | `/:id`          | ✅   | Delete item (owner only)      |

**Query Parameters:**
```
GET /api/items?search=laser              # Text search (name, desc, category)
GET /api/items?category=Engineering     # Filter by category
GET /api/items?condition=New            # Filter by condition
GET /api/items?available=true           # Filter by availability
GET /api/items?minPrice=5&maxPrice=50   # Price range
GET /api/items?sort=-createdAt          # Sort (- prefix = desc)
GET /api/items?sort=price               # Sort ascending
GET /api/items?page=2&limit=10          # Pagination
GET /api/items?fields=name,price,image  # Select fields
```

**Create Item:**
```json
POST /api/items  (requires Bearer token)
{
  "name": "Digital Laser Level",
  "description": "High precision laser level for construction works.",
  "category": "Engineering",
  "condition": "New",
  "price": 15,
  "image": "https://example.com/image.jpg",
  "location": "Cairo, Egypt"
}
```

**Categories:** `Engineering`, `Art Tools`, `Construction`, `Design`, `Electronics`, `Clothing`, `Furniture`, `Books`, `Other`

**Conditions:** `New`, `Used - Excellent`, `Used - Good`, `Used - Fair`

---

### 🛒 Cart — `/api/cart` (all protected)

| Method | Endpoint              | Description              |
|--------|-----------------------|--------------------------|
| GET    | `/`                   | Get my cart              |
| POST   | `/add`                | Add item to cart         |
| PUT    | `/update/:itemId`     | Update rental days       |
| DELETE | `/remove/:itemId`     | Remove item from cart    |
| DELETE | `/clear`              | Clear cart               |

**Add to Cart:**
```json
POST /api/cart/add
{ "itemId": "64f...", "rentalDays": 3 }
```

**Response includes:** `subtotal`, `serviceFee`, `total` (virtual fields)

---

### 📦 Orders — `/api/orders` (all protected)

| Method | Endpoint         | Auth   | Description              |
|--------|------------------|--------|--------------------------|
| POST   | `/`              | ✅     | Checkout from cart       |
| GET    | `/my`            | ✅     | My order history         |
| GET    | `/:id`           | ✅     | Single order             |
| PUT    | `/:id/cancel`    | ✅     | Cancel order             |
| GET    | `/all`           | 🔑 admin | All orders             |

**Checkout:**
```json
POST /api/orders
{ "paymentMethod": "visa" }
// or "vodafone"
// Response: { "message": "Payment of $35.00 successful! Order confirmed.", "data": {...} }
```

---

### 💬 Messages — `/api/messages` (all protected)

| Method | Endpoint                  | Description                    |
|--------|---------------------------|--------------------------------|
| GET    | `/conversations`          | All conversations (inbox list) |
| GET    | `/thread/:userId`         | Chat thread with a user        |
| POST   | `/`                       | Send a message                 |
| PUT    | `/:id/read`               | Mark message as read           |
| DELETE | `/:id`                    | Delete a message               |

**Send Message:**
```json
POST /api/messages
{
  "receiverId": "64f...",
  "text": "Is the laser level still available?",
  "itemId": "64f...",
  "itemName": "Digital Laser Level"
}
```

**Get Thread:**
```
GET /api/messages/thread/64f...?page=1&limit=50
```

---

### 🔔 Notifications — `/api/notifications` (all protected)

| Method | Endpoint                  | Description                          |
|--------|---------------------------|--------------------------------------|
| GET    | `/`                       | Get my notifications                 |
| GET    | `/:id`                    | Single notification                  |
| PUT    | `/read-all`               | Mark all as read                     |
| PUT    | `/:id/read`               | Mark single as read                  |
| PUT    | `/:id/action`             | Accept/Decline rental request        |
| DELETE | `/:id`                    | Delete notification (swipe)          |
| POST   | `/`                       | Push notification (admin only)       |

**Query:**
```
GET /api/notifications?type=alert&unread=true&sort=-createdAt
```

**Accept/Decline:**
```json
PUT /api/notifications/:id/action
{ "action": "accepted" }  // or "declined"
```

---

### 📋 Requests — `/api/requests` (all protected)

| Method | Endpoint              | Description                              |
|--------|-----------------------|------------------------------------------|
| GET    | `/`                   | My requests (admin sees all)             |
| POST   | `/`                   | Submit rental request                    |
| GET    | `/:id`                | Single request                           |
| PUT    | `/:id`                | Update request details (pending only)    |
| PUT    | `/:id/status`         | Accept/Decline/Cancel                    |
| DELETE | `/:id`                | Delete request                           |

**Create Request:**
```json
POST /api/requests
{
  "clientName": "Ahmed Mohamed",
  "toolName": "Power Drill",
  "durationDays": 3,
  "message": "Need for home renovation",
  "itemId": "64f..."
}
```

**Update Status:**
```json
PUT /api/requests/:id/status
{ "status": "accepted" }   // admin
{ "status": "declined" }   // admin
{ "status": "cancelled" }  // requester
```

---

## 🗄️ MongoDB Collections

| Collection     | Purpose                            | Key Fields                           |
|----------------|------------------------------------|--------------------------------------|
| `users`        | Authentication & profiles          | email, password, role, isOnline      |
| `items`        | Tool listings                      | owner, name, category, price, rating |
| `carts`        | Per-user cart (1 per user)         | user, items[], serviceFee            |
| `orders`       | Completed purchases                | user, items[], totalAmount, status   |
| `messages`     | Chat messages                      | sender, receiver, item, text, isRead |
| `notifications`| In-app alerts                      | user, type, isRead, actionTaken      |
| `requests`     | Tool rental requests               | requester, toolName, durationDays    |

---

## ⚙️ Environment Variables

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/sharek-app
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=30d
NODE_ENV=development
```

---

## 📦 Dependencies

| Package             | Purpose                            |
|---------------------|------------------------------------|
| express             | Web framework                      |
| mongoose            | MongoDB ODM                        |
| dotenv              | Environment variables              |
| cors                | Cross-Origin Resource Sharing      |
| morgan              | HTTP request logger                |
| bcryptjs            | Password hashing                   |
| jsonwebtoken        | JWT generation & verification      |
| express-validator   | Request validation                 |
| nodemon (dev)       | Auto-restart on file changes       |
