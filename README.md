# 💎 The Perfume Vault
### Production-Ready Luxury Perfume E-Commerce v2.0

A fully-featured multi-page SPA with Node.js/Express backend, MongoDB, JWT authentication, admin system, and Railway deployment support.

---

## 🚀 Quick Start (Local)

### Prerequisites
- Node.js 18+
- MongoDB running locally OR a MongoDB Atlas account

```bash
# 1. Clone & install
git clone https://github.com/your-username/perfume-vault.git
cd perfume-vault
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

cp admin.env.example admin.env
# Edit admin.env — add your email as admin

# 3. Seed database (adds 6 sample perfumes)
npm run seed

# 4. Start development server
npm run dev

# Open: http://localhost:5000
# Admin: http://localhost:5000/admin
```

### Fix MongoDB on Windows
If you see `ECONNREFUSED ::1:27017`, the `.env` already uses `127.0.0.1`. Just start MongoDB:
```bash
net start MongoDB         # Windows Service
# OR
mongod --dbpath C:\data\db
```

---

## 🌐 Pages & Routes

| URL | Page |
|-----|------|
| `/` | Home — Hero, featured perfumes, categories |
| `/shop` | Shop — Full product grid with filters |
| `/shop?category=Men` | Filtered by category |
| `/product/:id` | Product detail with gallery |
| `/cart` | Cart page |
| `/checkout` | Multi-step checkout |
| `/login` | Sign in page |
| `/register` | Registration with real-time validation |
| `/orders` | User order history |
| `/admin` | Admin dashboard (protected) |

---

## 🔐 Security Features

- ✅ **Unique email** — one account per email, checked in real-time
- ✅ **Unique username** — case-insensitive (`ibugamer` = `IBUGAMER`)
- ✅ **Admin protection** — only emails in `admin.env` get admin access
- ✅ **bcrypt** — passwords hashed with salt rounds 12
- ✅ **JWT** — stateless authentication, 30-day tokens
- ✅ **Rate limiting** — 15 auth attempts per 15 minutes
- ✅ **Input validation** — express-validator on all endpoints
- ✅ **Helmet** — security headers

---

## ✨ Features

| Feature | Status |
|---------|--------|
| 3D Three.js vault intro (r128 compatible) | ✅ |
| Luxury gold crosshair cursor | ✅ |
| Multi-page SPA router (no page reloads) | ✅ |
| Product grid with filters + search | ✅ |
| Product detail page with gallery | ✅ |
| AJAX cart with sound effect | ✅ |
| Dedicated cart page | ✅ |
| Multi-step checkout | ✅ |
| Mock payment + order saving | ✅ |
| Order history page | ✅ |
| Login / Register pages + modal | ✅ |
| Real-time email/username availability | ✅ |
| Password strength indicator | ✅ |
| Admin dashboard + analytics | ✅ |
| Admin: add/edit/delete products | ✅ |
| Admin: image upload | ✅ |
| Admin: order management | ✅ |
| Full mobile responsive | ✅ |
| SEO meta tags + structured data | ✅ |

---

## 🚀 Deploy to Railway

### Step 1: MongoDB Atlas
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) → Create free cluster
2. Database Access → Add user with password
3. Network Access → Allow from anywhere (`0.0.0.0/0`)
4. Connect → Compass → Copy the connection string
5. Replace `<password>` with your password

### Step 2: Push to GitHub
```bash
git init
git add .
git commit -m "The Perfume Vault v2.0 🚀"

# Create repo on github.com, then:
git remote add origin https://github.com/your-username/perfume-vault.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy on Railway
1. Go to [railway.app](https://railway.app) → Sign up with GitHub
2. **New Project** → **Deploy from GitHub repo**
3. Select your `perfume-vault` repository
4. Click **Add Variables** and set:

```
MONGODB_URI    = mongodb+srv://user:pass@cluster.mongodb.net/perfume-vault
JWT_SECRET     = (generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
ADMIN_EMAILS   = ibugamer120@gmail.com
NODE_ENV       = production
CLIENT_URL     = https://your-app-name.up.railway.app
```

5. Railway auto-detects `npm start` and deploys!
6. Your URL: `https://your-app-name.up.railway.app`

### Step 4: Seed Production Database
After deploying, run in Railway shell or locally with Atlas URI:
```bash
MONGODB_URI="your_atlas_uri" npm run seed
```

### Step 5: Final Testing
- ✅ Visit homepage — 3D intro loads
- ✅ Browse `/shop` — products appear
- ✅ Register account — email uniqueness works
- ✅ Login — JWT stored, name shows in nav
- ✅ Add to cart — sound plays, count updates
- ✅ Checkout — order saved in database
- ✅ `/admin` — login with admin email → dashboard shows

---

## 🛠️ Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Random 64-char string |
| `ADMIN_EMAILS` | ✅ | Comma-separated admin emails |
| `NODE_ENV` | ✅ | `production` or `development` |
| `PORT` | Auto | Railway sets this automatically |
| `CLIENT_URL` | Optional | Your Railway domain |

---

## 📁 Project Structure

```
perfume-vault/
├── client/                        # Frontend SPA
│   ├── css/style.css              # Complete luxury CSS (499 lines)
│   ├── js/
│   │   ├── cursor.js              # Gold crosshair cursor
│   │   ├── router.js              # Client-side SPA router
│   │   ├── auth.js                # Auth module (login/register/JWT)
│   │   ├── cart.js                # Cart module (localStorage)
│   │   ├── main.js                # App init + shared helpers
│   │   ├── three-intro.js         # 3D vault animation
│   │   └── pages/
│   │       ├── home.js            # Homepage
│   │       ├── shop.js            # Products page
│   │       ├── product.js         # Product detail
│   │       ├── cart-page.js       # Cart page
│   │       ├── checkout-page.js   # Checkout page
│   │       └── auth-pages.js      # Login/Register/Orders
│   ├── admin/index.html           # Admin panel (separate app)
│   └── index.html                 # SPA shell
├── server/
│   ├── config/db.js               # MongoDB (IPv4 forced)
│   ├── controllers/               # Route logic
│   ├── middleware/                # Auth, admin, errors
│   ├── models/                    # User, Product, Order
│   ├── routes/                    # API routes
│   ├── seed.js                    # 6 sample products
│   └── server.js                  # Express + Railway ready
├── .env.example                   # Template — copy to .env
├── admin.env.example              # Template — copy to admin.env
├── railway.toml                   # Railway deployment config
├── package.json                   # scripts: start, dev, seed
└── README.md
```

---

*The Perfume Vault — Rare Fragrances, Unlocked ✦*
