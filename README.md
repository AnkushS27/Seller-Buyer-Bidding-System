# 🏗️ Seller-Buyer Project Bidding System

A full-stack application connecting buyers with sellers through a project bidding system. Built with Next.js 14, PostgreSQL, and modern web technologies.

🌐 **Live Demo**: [https://seller-buyer-bidding-system.vercel.app](https://seller-buyer-bidding-system.vercel.app)

## ✨ Features

- 🔐 **User Authentication** - Secure JWT-based login/register
- 📋 **Project Management** - Create and manage projects
- 💰 **Bidding System** - Sellers bid on buyer projects
- 👥 **Seller Selection** - Buyers choose the best seller
- 📁 **File Upload** - Upload deliverables and project files
- 📧 **Email Notifications** - Automated project updates
- 📊 **Dashboard** - Real-time project tracking
- 📱 **Responsive Design** - Works on all devices

## 🛠 Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Supabase)
- **Auth**: JWT with HTTP-only cookies
- **Email**: Nodemailer
- **Deployment**: Vercel

## 🚀 Quick Setup

### 1. Clone & Install

```bash
git clone https://github.com/AnkushS27/Seller-Buyer-Bidding-System.git
cd Seller-Buyer-Bidding-System
npm install
```

### 2. Environment Setup

Create `.env.local` file:

```env
# Authentication
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters

# Database (Choose one option)
# Option A: Supabase (Recommended)
POSTGRES_URL=your-supabase-connection-string
POSTGRES_PRISMA_URL=your-supabase-connection-string?pgbouncer=true
POSTGRES_URL_NON_POOLING=your-supabase-direct-connection
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Option B: Local PostgreSQL
POSTGRES_URL=postgresql://username:password@localhost:5432/seller_buyer_db
POSTGRES_HOST=localhost
POSTGRES_USER=your_username
POSTGRES_PASSWORD=your_password
POSTGRES_DATABASE=seller_buyer_db

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
SMTP_FROM=noreply@yourapp.com
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

### 4. Run Development Server

```bash
npm run dev
```

### 5. Initialize Database

Visit `http://localhost:3000/setup` and click **"Prisma Setup"** to create sample data.

## 🎯 Project Approach

### Architecture

- **Next.js App Router** for file-based routing and SSR
- **Prisma ORM** for type-safe database operations
- **JWT Authentication** with middleware protection
- **RESTful API** design with proper HTTP status codes

### Database Design

```
Users → Projects → Bids → Deliverables
```

- **Users**: BUYER/SELLER roles with authentication
- **Projects**: Lifecycle management (OPEN → IN_PROGRESS → COMPLETED)
- **Bids**: Seller proposals with amount and description
- **Deliverables**: File uploads linked to projects

### Security

- Password hashing with bcrypt
- JWT tokens in HTTP-only cookies
- Route protection via middleware
- Input validation and SQL injection prevention

### Email System

- Automated notifications for project updates
- HTML email templates
- Graceful error handling for optional email service

## 🧪 Test Accounts

After database setup:

- **Buyer**: `buyer@example.com` / `password123`
- **Seller**: `seller@example.com` / `password123`

## 📦 Deployment

### Deploy to Vercel

1. Push to GitHub
2. Import repository on [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy and visit `/setup` to initialize database

### Environment Variables for Production

Set all variables from `.env.local` in your Vercel project settings.

## 🔧 Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npx prisma studio    # View database
npx prisma generate  # Generate Prisma client
```

## 🐛 Troubleshooting

**Database Connection Issues:**

- Ensure PostgreSQL is running (local) or Supabase URL is correct
- Check environment variables are properly set
- Try the setup page at `/setup`

**Build Errors:**

- Run `npx prisma generate` before building
- Verify all environment variables are set in production

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/name`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to branch (`git push origin feature/name`)
5. Open Pull Request

---

**Built with ❤️ by [Ankush Singh](https://github.com/AnkushS27)**

⭐ Star this repo if you found it helpful!
