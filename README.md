# Bouquet Tutorial Platform 🌸

A full-stack paid video tutorial platform for learning the art of bouquet making. Built with Next.js, TypeScript, Supabase, and Paystack.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?logo=supabase)
![Paystack](https://img.shields.io/badge/Paystack-Payment-blue)

## ✨ Features

### 👥 User Features
- **Browse Tutorials**: View all available bouquet-making video tutorials
- **Secure Authentication**: Sign up and log in with email/password via Supabase Auth
- **Purchase Videos**: Buy individual tutorials using Paystack payment gateway
- **Watch Videos**: Stream purchased videos with an integrated video player
- **Personal Dashboard**: View all purchased videos in one place
- **Access Control**: Server-side verification ensures only purchased content is accessible

### 🔐 Admin Features
- **Admin Dashboard**: Overview with analytics (total videos, sales, revenue)
- **Video Management**: Upload, edit, and delete video tutorials
- **Content Upload**: Upload videos directly to Supabase Storage
- **Pricing Control**: Set and update pricing for each video
- **Purchase Tracking**: View all transactions and recent purchases
- **Role-Based Access**: Secure admin-only routes with role verification

### 🛠 Technical Features
- **Next.js 16** with App Router and Server Components
- **TypeScript** for type safety
- **Supabase** for:
  - Authentication
  - PostgreSQL Database
  - File Storage
  - Row Level Security (RLS)
- **Paystack** for payment processing
- **TailwindCSS** for responsive styling
- **React Player** for video playback
- **Webhook Support** for payment verification

## 📋 Prerequisites

Before you begin, you'll need:
- **Node.js** 18 or higher
- **npm** or **yarn** package manager
- **Supabase account** ([Sign up here](https://supabase.com))
- **Paystack account** ([Sign up here](https://paystack.com))

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Elton133/tutorial-website.git
cd tutorial-website
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Paystack Configuration
PAYSTACK_SECRET_KEY=your_paystack_secret_key
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Set Up Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Paste and execute the script

This creates:
- Database tables (profiles, videos, purchases)
- Row Level Security policies
- Storage bucket for videos
- Triggers and functions

### 5. Create an Admin User

After setting up the database:
1. Sign up for an account through the application
2. Go to Supabase Dashboard → **Table Editor** → **profiles**
3. Find your user and set `is_admin` to `true`

### 6. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
tutorial-website/
├── app/                          # Next.js App Router
│   ├── admin/                    # Admin dashboard
│   │   ├── videos/
│   │   │   ├── new/             # Create video
│   │   │   └── [id]/edit/       # Edit video
│   │   └── page.tsx             # Admin home
│   ├── api/                      # API routes
│   │   └── payment/             # Payment endpoints
│   │       ├── initialize/      # Start payment
│   │       ├── verify/          # Verify payment
│   │       └── webhook/         # Payment webhook
│   ├── auth/signout/            # Sign out route
│   ├── dashboard/               # User dashboard
│   ├── login/                   # Login page
│   ├── signup/                  # Signup page
│   ├── videos/[id]/            # Video player
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Homepage
│   └── globals.css             # Global styles
├── lib/
│   ├── supabase/               # Supabase utilities
│   │   ├── client.ts           # Browser client
│   │   ├── server.ts           # Server client
│   │   └── middleware.ts       # Middleware helper
│   └── types.ts                # TypeScript types
├── supabase/
│   └── migrations/             # Database migrations
├── middleware.ts               # Next.js middleware
├── .env.example                # Environment template
├── SETUP_GUIDE.md             # Detailed setup guide
└── README.md                   # This file
```

## 🔑 Key Routes

| Route | Description | Access |
|-------|-------------|--------|
| `/` | Homepage with video gallery | Public |
| `/login` | User login | Public |
| `/signup` | User registration | Public |
| `/dashboard` | User's purchased videos | Authenticated |
| `/videos/[id]` | Video player page | Authenticated |
| `/admin` | Admin dashboard | Admin only |
| `/admin/videos/new` | Upload new video | Admin only |
| `/admin/videos/[id]/edit` | Edit video | Admin only |
| `/api/payment/initialize` | Initialize Paystack payment | API |
| `/api/payment/verify` | Verify payment | API |
| `/api/payment/webhook` | Payment webhook | API |

## 🔒 Security Features

- **Row Level Security (RLS)**: All database operations are secured with RLS policies
- **Admin Verification**: Admin routes check user roles before granting access
- **Payment Verification**: Webhook signatures are verified for Paystack callbacks
- **Access Control**: Video playback requires server-side purchase verification
- **Environment Variables**: Sensitive keys are stored securely
- **Service Role**: Only used server-side for privileged operations

## 🎨 Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: TailwindCSS v4
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (via Supabase)
- **Storage**: Supabase Storage
- **Payments**: Paystack
- **Video Player**: React Player
- **Deployment**: Vercel-ready

## 📚 Documentation

For detailed setup instructions and troubleshooting, see [SETUP_GUIDE.md](./SETUP_GUIDE.md).

### Getting Supabase Keys

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Settings** → **API**
4. Copy:
   - Project URL
   - `anon/public` key
   - `service_role` key (keep secret!)

### Getting Paystack Keys

1. Go to [Paystack Dashboard](https://dashboard.paystack.com)
2. Navigate to **Settings** → **API Keys & Webhooks**
3. Copy your **Secret Key** and **Public Key**
4. Use **Test Keys** for development, **Live Keys** for production

### Configure Paystack Webhook

For production:
1. Go to **Settings** → **API Keys & Webhooks**
2. Add webhook URL: `https://your-domain.com/api/payment/webhook`
3. Save changes

## 🧪 Testing

### Development Testing

```bash
npm run dev
```

Test the following flows:
1. **Authentication**: Sign up → Log in → Log out
2. **Browse Videos**: View homepage gallery
3. **Purchase Flow**: Select video → Initialize payment (use Paystack test card)
4. **Video Access**: Verify purchased video is playable
5. **Admin Operations**: Upload video → Edit → Delete

### Paystack Test Card

For testing payments:
- **Card Number**: 4084084084084081
- **CVV**: 408
- **Expiry**: Any future date
- **PIN**: 0000
- **OTP**: 123456

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables
5. Deploy

### Environment Variables in Production

Make sure to update:
- `NEXT_PUBLIC_APP_URL` to your production URL
- Use Paystack **Live Keys** instead of test keys
- Configure webhook URL in Paystack dashboard

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

Created by [Elton133](https://github.com/Elton133)

## 🐛 Issues

If you encounter any issues, please [open an issue](https://github.com/Elton133/tutorial-website/issues) on GitHub.

## ⭐ Show Your Support

If this project helped you, please give it a ⭐!
