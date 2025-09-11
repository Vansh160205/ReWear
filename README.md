# 👕 ReWear – Community Clothing Exchange

### **ReWear** is a full-stack web platform that promotes sustainable fashion by allowing users to exchange unused clothing items through **direct swaps** or **point-based redemptions**. This community-driven initiative encourages reducing textile waste and reusing garments rather than discarding them.
---

## 📦 Tech Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, ShadCN UI
- **Backend:** Express.js, TypeScript
- **Database:** PostgreSQL via Prisma ORM
- **Authentication:** JWT-based custom auth
- **Other Tools:** 
  - File uploads with Multer
  - Toasts via `sonner`
---

## 🚀 Features

### 🧑‍💻 User Authentication
- Secure email/password sign up and login
- JWT token stored in `sessionStorage` and passed via `Authorization: Bearer <token>` headers

### 🏠 Landing Page
- Platform introduction
- Calls-to-action:
  - “Start Swapping”
  - “Browse Items”
  - “List an Item”
- Featured items carousel (planned)

### 🧑 User Dashboard
- View profile details and current points balance
- List of uploaded items
- Incoming swap requests
- History of approved/rejected swaps

### 📦 Item Management
- Add new clothing items with:
  - Title
  - Description
  - Category
  - Size
  - Condition
  - Tags
  - Images
- Items can be marked as:
  - **Available**
  - **Redeemable via points** (with defined point cost)

### 🔁 Swap System
- **Two-Way Swaps:** Swap your item for someone else’s
- **Point Redemption:** Redeem an item using points if available
- Incoming requests can be approved or rejected by item owners
- Users can track their active and past swaps

### 🔍 Item Detail Page
- Image gallery of the item
- Full description, size, condition, tags
- Actions:
  - “Swap with an Item” (dropdown of user’s own items)
  - “Redeem via Points” (if eligible)

### 🛠 Admin Panel
- View all users (excluding passwords)
- Add points to any user
- View all pending items
- Approve or reject item listings
- Remove spam or inappropriate content

---
# Demo Video 
(https://drive.google.com/file/d/1M_DGgzwd0xpxxrgiD0TlGHfGnAGAP5PA/view?usp=drive_link)
---
## 🔐 Auth Implementation

- JWT tokens are passed via `Authorization: Bearer <token>` header in all API requests.
- Authenticated routes are protected on the backend via middleware.

---

## 📁 Folder Structure Highlights
```plaintext
/frontend
  ├── app/
  │   ├── dashboard/         → User dashboard: listings, swaps, requests
  │   ├── items/             → List, view, and add items
  │   ├── admin/             → Admin panel for moderation and points
  │   └── page.tsx           → Landing page
  ├── components/            → Reusable UI components (buttons, forms, tabs)
  ├── lib/                   → API utilities and helpers
  └── styles/                → Tailwind and global styles

/backend
  ├── routes/
  │   ├── auth.ts            → Login, register routes
  │   ├── items.ts           → Add/list/fetch item routes
  │   ├── swaps.ts           → Swap request and response routes
  │   └── admin.ts           → Admin routes: users, points, moderation
  ├── controllers/           → Business logic for each route
  ├── middleware/
  │   └── auth.ts            → JWT auth middleware
  ├── lib/
  │   └── prisma.ts          → Prisma client setup
  ├── uploads/               → Directory for uploaded item images
  ├── prisma/
  │   └── schema.prisma      → Database schema
  └── server.ts              → Express server setup and entry point

```

## 🧪 Setup Instructions

### Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev

```

## Environment Variables

Set the following .env variables:
Backend .env
DATABASE_URL=postgresql://<username>:<password>@localhost:5432/rewear
JWT_SECRET=your_jwt_secret_key


### 📌 Upcoming Features
Search and filter items
Notifications for new requests and approvals
User reviews and swap feedback
Reporting system for items or users

### 🤝 Contributing
Contributions are welcome! Open an issue or submit a PR with enhancements or bug fixes.


### Made By : Vansh Vagadia (vanshvagadia1602@gmail.com)

