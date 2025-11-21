# Bouquet Tutorial Platform

A full-stack video tutorial platform built with Next.js, TypeScript, Supabase, and Paystack integration. This platform allows users to purchase and watch video tutorials on bouquet making, with a complete admin dashboard for content management.

## Features

### User-Facing Features
- Browse available video tutorials
- User authentication (sign up/login) with Supabase Auth
- Secure payment processing via Paystack
- Access purchased videos through a personal dashboard
- Video playback with access control (only purchased videos can be watched)
- Responsive design for mobile and desktop

### Admin Features
- Admin dashboard with analytics (total videos, sales, revenue)
- Upload new videos to Supabase Storage
- Create, edit, and delete video tutorials
- Set pricing for individual videos
- View recent purchases and transaction history
- Admin-only access with role-based authentication

### Technical Features
- Server-side rendering with Next.js 14+ (App Router)
- TypeScript for type safety
- Supabase for authentication, database, and file storage
- Row Level Security (RLS) for database access control
- Paystack integration for payment processing
- Webhook support for payment verification
- TailwindCSS for styling
- React Player for video playback

## Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- A Supabase account and project ([https://supabase.com](https://supabase.com))
- A Paystack account ([https://paystack.com](https://paystack.com))

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tutorial-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory (copy from `.env.example`):
   
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

   **Getting Supabase Keys:**
   - Go to your Supabase project dashboard
   - Navigate to Settings → API
   - Copy the Project URL and anon/public key
   - Copy the service_role key (keep this secret!)

   **Getting Paystack Keys:**
   - Log in to your Paystack dashboard
   - Go to Settings → API Keys & Webhooks
   - Copy your Secret Key and Public Key
   - For production, use live keys; for testing, use test keys

4. **Set up Supabase Database**

   Run the SQL migration script in your Supabase SQL editor:
   
   - Go to Supabase Dashboard → SQL Editor
   - Copy the contents of `supabase/migrations/001_initial_schema.sql`
   - Paste and execute the script

   This will create:
   - `profiles` table for user profiles
   - `videos` table for video tutorials
   - `purchases` table for tracking user purchases
   - Row Level Security policies
   - Storage bucket for videos
   - Necessary indexes and triggers

5. **Create an Admin User**

   After setting up the database:
   - Sign up for an account through the application
   - Go to Supabase Dashboard → Table Editor → profiles
   - Find your user and set `is_admin` to `true`

6. **Configure Paystack Webhook (Production)**

   For production deployment:
   - Go to Paystack Dashboard → Settings → API Keys & Webhooks
   - Add webhook URL: `https://your-domain.com/api/payment/webhook`
   - This ensures real-time payment verification

## Running the Application

### Development Mode
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## Project Structure

```
tutorial-website/
├── app/
│   ├── admin/                 # Admin dashboard pages
│   │   ├── videos/
│   │   │   ├── new/          # Create new video
│   │   │   └── [id]/edit/    # Edit video
│   │   └── page.tsx          # Admin dashboard
│   ├── api/                   # API routes
│   │   └── payment/          # Payment endpoints
│   │       ├── initialize/   # Initialize payment
│   │       ├── verify/       # Verify payment
│   │       └── webhook/      # Payment webhook
│   ├── auth/
│   │   └── signout/          # Sign out endpoint
│   ├── dashboard/            # User dashboard
│   ├── login/                # Login page
│   ├── signup/               # Signup page
│   ├── videos/
│   │   └── [id]/            # Video detail/player page
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Homepage
│   └── globals.css          # Global styles
├── lib/
│   ├── supabase/            # Supabase client utilities
│   │   ├── client.ts        # Browser client
│   │   ├── server.ts        # Server client
│   │   └── middleware.ts    # Middleware helper
│   └── types.ts             # TypeScript type definitions
├── supabase/
│   └── migrations/          # Database migration scripts
├── middleware.ts            # Next.js middleware
├── .env.example             # Environment variables template
└── README.md               # This file
```

## Key Functionality

### Authentication Flow
1. Users sign up/login using Supabase Auth
2. Profile is automatically created via database trigger
3. Middleware protects authenticated routes
4. Admin access is controlled via `is_admin` flag in profiles table

### Payment Flow
1. User selects a video to purchase
2. Payment is initialized via `/api/payment/initialize`
3. User is redirected to Paystack payment page
4. After payment, user is redirected to `/api/payment/verify`
5. Payment status is updated in the database
6. User gains access to the video

### Video Access Control
1. Server-side check verifies user has purchased the video
2. Only purchased videos can be played
3. Video URLs are stored in Supabase Storage with public access
4. Access control is enforced at the application level

### Admin Operations
1. Admins can upload videos to Supabase Storage
2. Video metadata is stored in the database
3. Admins can edit video details (title, description, price)
4. Admins can delete videos (removes from storage and database)
5. Dashboard shows analytics and recent purchases

## Security Considerations

1. **Row Level Security (RLS)**: All database tables have RLS enabled
2. **Admin Verification**: All admin operations verify user's admin status
3. **Payment Verification**: Webhook signature is verified for Paystack callbacks
4. **Access Control**: Video access is checked server-side before playback
5. **Environment Variables**: Sensitive keys are stored in environment variables
6. **Service Role Key**: Only used on the server for admin operations

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms
Ensure the platform supports:
- Node.js 18+
- Environment variables
- Server-side rendering
- API routes

## Troubleshooting

### Common Issues

**Build fails due to Google Fonts:**
- This is a network issue during build
- Fonts will be cached after first successful build
- Use local fonts if needed

**Videos not uploading:**
- Check Supabase Storage bucket exists and is public
- Verify user has admin privileges
- Check file size limits (default 50MB for Supabase free tier)

**Payments not working:**
- Verify Paystack keys are correct
- Check if using test keys in development
- Ensure callback URL is accessible
- Check webhook endpoint is configured

**User can't access purchased video:**
- Verify payment status is 'success' in purchases table
- Check RLS policies are set correctly
- Ensure video_id and user_id match in purchases table

## License

This project is open source and available under the MIT License.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review Supabase documentation: [https://supabase.com/docs](https://supabase.com/docs)
3. Review Paystack documentation: [https://paystack.com/docs](https://paystack.com/docs)
4. Open an issue on GitHub

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
