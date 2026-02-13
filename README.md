# 🏆 GoldBerg Perfumes — Luxury Fragrance E-Commerce

<div align="center">

**A premium, full-stack luxury perfume e-commerce platform built with the MERN stack.**

Gold & Black Theme · Responsive Design · Admin Dashboard · Stripe Integration · JWT Auth

</div>

---

## ✨ Features

### 🛍️ Customer Experience
- **Luxury UI/UX** — Gold & black themed with glassmorphism, micro-animations, and smooth transitions
- **Product Browsing** — Filter by category, gender, fragrance family, price range, and sort
- **Fragrance Details** — Full product pages with fragrance pyramid (top/heart/base notes), reviews, and ratings
- **Shopping Cart** — Animated slide-out drawer with quantity controls and free shipping indicator
- **Secure Checkout** — Multi-step checkout with shipping form and order summary
- **User Accounts** — Registration, login, profile management, order history
- **Wishlist** — Save favorite fragrances to your personal wishlist
- **Dark/Light Mode** — Toggle between luxury dark and elegant light themes
- **Responsive Design** — Fully optimized for desktop, tablet, and mobile

### 🔐 Security
- JWT-based authentication with HTTP-only cookies
- Password hashing with bcryptjs
- Helmet security headers
- Rate limiting on API endpoints
- MongoDB query sanitization
- CORS configuration
- Input validation with express-validator

### 👨‍💼 Admin Dashboard
- **Overview** — Revenue, orders, products, and users at a glance
- **Product Management** — Full CRUD operations
- **Order Management** — Update order statuses in real-time
- **User Management** — View all users and manage roles
- **Recent Activity** — Monitor latest orders

### 💳 Payments
- Stripe payment intent integration
- Demo mode (no real charges)

### 📧 Email
- Luxury-themed HTML order confirmation emails
- Configurable SMTP via environment variables

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, React Router v6, Framer Motion, Axios, Vite |
| **Styling** | Vanilla CSS with CSS custom properties design system |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB with Mongoose ODM |
| **Auth** | JWT (JSON Web Tokens), bcryptjs |
| **Payments** | Stripe |
| **Email** | Nodemailer |
| **Security** | Helmet, CORS, Rate Limiting, Mongo Sanitize, Express Validator |

---

## 📁 Project Structure

```
goldberg-perfumes/
├── client/                     # React Frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── cart/           # CartDrawer
│   │   │   ├── layout/        # Navbar, Footer
│   │   │   └── product/       # ProductCard
│   │   ├── context/           # AuthContext, CartContext, ThemeContext
│   │   ├── pages/             # Home, Shop, ProductDetail, Auth, Checkout,
│   │   │                      # Orders, Profile, Wishlist, Contact, About, Admin
│   │   ├── services/          # API service (Axios)
│   │   ├── styles/            # Global CSS design system
│   │   ├── App.jsx            # Routes & Layout
│   │   └── main.jsx           # Entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                     # Express Backend
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/           # Auth, Products, Orders, Contact, Payment, Admin
│   ├── middleware/            # Auth, Error Handler, Validators
│   ├── models/                # User, Product, Order, Contact
│   ├── routes/                # Auth, Products, Orders, Contact, Payment, Admin
│   ├── seeds/                 # Database seed script (12 luxury perfumes)
│   ├── utils/                 # Email utility
│   ├── server.js              # Express app entry
│   ├── .env.example
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version |
|---|---|
| **Node.js** | >= 18.x |
| **npm** | >= 9.x |
| **MongoDB** | >= 6.x (local) or MongoDB Atlas (cloud) |

### Step 1: Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd goldberg-perfumes

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Step 2: Configure Environment

Create `server/.env` from the example file:

```bash
cd server
cp .env.example .env
```

Edit `server/.env` with your values:

```env
# Server
NODE_ENV=development
PORT=5000

# MongoDB
MONGO_URI=mongodb://127.0.0.1:27017/goldberg-perfumes

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

# Stripe (get keys from https://stripe.com)
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here

# Email (optional — use Mailtrap for dev: https://mailtrap.io)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_mailtrap_user
SMTP_PASS=your_mailtrap_pass
FROM_EMAIL=noreply@goldbergperfumes.com
FROM_NAME=GoldBerg Perfumes

# Frontend URL
CLIENT_URL=http://localhost:5173
```

### Step 3: Seed the Database

```bash
cd server
npm run seed
```

This creates:
- **12 luxury perfume products** with detailed fragrance notes
- **Admin account**: `admin@goldbergperfumes.com` / `Admin@123`
- **Demo user**: `victoria@example.com` / `Demo@123`

### Step 4: Run the Application

Open **two terminal windows**:

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
# Server starts on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
# Client starts on http://localhost:5173
```

Open your browser to **[http://localhost:5173](http://localhost:5173)** 🎉

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | admin@goldbergperfumes.com | Admin@123 |
| **User** | victoria@example.com | Demo@123 |

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| PUT | `/api/auth/password` | Change password |
| PUT | `/api/auth/wishlist/:id` | Toggle wishlist item |

### Products
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products` | Get all products (with filters) |
| GET | `/api/products/featured` | Get featured products |
| GET | `/api/products/slug/:slug` | Get product by slug |
| GET | `/api/products/:id` | Get product by ID |
| POST | `/api/products` | Create product (admin) |
| PUT | `/api/products/:id` | Update product (admin) |
| DELETE | `/api/products/:id` | Delete product (admin) |
| POST | `/api/products/:id/reviews` | Add review |

### Orders
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/orders` | Create order |
| GET | `/api/orders/my` | Get my orders |
| GET | `/api/orders/:id` | Get order by ID |
| GET | `/api/orders` | Get all orders (admin) |
| PUT | `/api/orders/:id/status` | Update order status (admin) |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/stats` | Dashboard statistics |
| GET | `/api/admin/users` | Get all users |
| PUT | `/api/admin/users/:id/role` | Update user role |

---

## 🎨 Design System

The project uses a comprehensive CSS design system with:

- **Gold palette**: 10 shades (50–900)
- **Neutral palette**: 14 shades
- **Typography**: Playfair Display (display headings), Cormorant Garamond (headings), Inter (body)
- **Spacing scale**: xs (0.25rem) to 4xl (6rem)
- **Border radius**: sm (4px) to full (9999px)
- **Shadows**: Standard, gold-accented, and glassmorphism
- **Animations**: fadeIn, slideUp, slideDown, scaleIn, shimmer
- **Dark/Light mode**: Full theme toggle with CSS custom properties

---

## 🚢 Deployment

### Build Frontend
```bash
cd client
npm run build
```

The built files will be in `client/dist`. Configure your Express server to serve static files:

```js
// Already handled in server.js for production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/dist/index.html'));
  });
}
```

### Environment Variables for Production
- Set `NODE_ENV=production`
- Use a strong `JWT_SECRET`
- Use MongoDB Atlas for the database
- Configure real Stripe keys
- Set up proper SMTP for emails

---

## 📝 License

This project is created for educational and portfolio purposes.

---

<div align="center">
  <strong>GoldBerg Perfumes</strong> — Where Every Scent Tells a Story ✨
</div>
