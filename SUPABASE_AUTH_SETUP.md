# Supabase Authentication Setup Guide

This guide will help you set up Supabase authentication for the Fircle family circle app.

## 🔐 Authentication System Overview

The app now uses **Supabase** for authentication with the following features:

- ✅ **Email/Password authentication**
- ✅ **OAuth providers** (Google, etc.)
- ✅ **Protected routes** - All pages require authentication
- ✅ **Member claiming system** - Users can claim existing family member profiles
- ✅ **Automatic account linking** - Supabase users are linked to Member records in our database
- ✅ **tRPC integration** - All API procedures are aware of the authenticated user

## 🚀 Quick Setup Steps

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose your organization and create the project
4. Wait for the project to be ready

### 2. Configure Authentication

In your Supabase dashboard:

1. Go to **Authentication** → **Settings**
2. Configure **Site URL**: `http://localhost:3000` (or your domain)
3. Add **Redirect URLs**: 
   - `http://localhost:3000/auth/callback`
   - Add your production URLs when deploying

### 3. Enable OAuth Providers (Optional)

For Google OAuth:
1. Go to **Authentication** → **Providers**
2. Enable **Google** provider
3. Add your Google OAuth credentials:
   - Client ID
   - Client Secret
4. Set authorized redirect URI in Google Console: 
   `https://your-project-ref.supabase.co/auth/v1/callback`

### 4. Get Your Project Credentials

From **Settings** → **API**:
- Project URL: `https://your-project-ref.supabase.co`
- Anon/Public Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- Service Role Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (keep secret!)

### 5. Update Environment Variables

Update your `.env` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
```

### 6. Start the Application

```bash
npm run dev
```

## 🎯 How It Works

### Authentication Flow

1. **Unauthenticated users** → Redirected to `/auth/login`
2. **New users sign up** → Supabase creates account
3. **Email confirmation** (if enabled) → User confirms email
4. **Member claiming** → User selects existing member profile or creates new one
5. **Full access** → User can access all app features

### Database Integration

```typescript
// Every tRPC procedure now has access to:
{
  session: SupabaseSession | null,        // Supabase session
  supabaseUser: SupabaseUser | null,      // Supabase user object  
  user: User | null,                      // Our database User record
}
```

### Route Protection

- **Middleware** checks authentication on every request
- **Public routes**: `/auth/login`, `/auth/signup`, `/auth/callback`
- **Protected routes**: Everything else requires authentication

## 🧩 Key Components

### `SupabaseProvider`
- Manages authentication state
- Provides `useSupabase()` hook
- Handles auth state changes

### `ProtectedContent`
- Wraps page content
- Shows member claiming flow for new users
- Ensures user has linked member profile

### `MemberClaimingFlow`
- Allows users to claim existing member profiles
- Option to create new member profile
- Links Supabase user to Member record

## 🛠️ API Procedures

### Authentication Procedures (`api.auth.*`)

```typescript
// Get current user info and member profile
const { data } = api.auth.getMe.useQuery()

// Get unclaimed member profiles
const { data: members } = api.auth.getUnclaimedMembers.useQuery()

// Claim existing member profile
api.auth.claimMember.useMutation()

// Create new member profile and link
api.auth.createMemberAndLink.useMutation()
```

### Protected Procedures

All main procedures now require authentication:
- `api.member.*` - Member management
- `api.post.*` - Post management
- `api.user.*` - User management

## 🔒 Security Features

### Middleware Protection
- Checks authentication on every request
- Redirects unauthenticated users to login
- Prevents access to auth pages when logged in

### tRPC Context
- Validates Supabase session on every API call
- Links Supabase users to database User records
- Provides user context to all procedures

### Database Integration
- User records are linked to Member profiles
- Member profiles can exist without user accounts
- Historical data preserved when users claim profiles

## 🎨 UI Components

### Login/Signup Pages
- Email/password authentication
- OAuth provider buttons (Google)
- Form validation and error handling
- Responsive design

### Member Claiming
- Visual member profile selection
- Option to create new profiles
- Form for entering member details
- Success handling and redirects

### Navigation
- User info display (member name)
- Sign out functionality
- Responsive navigation bar

## 🔄 Testing the Flow

### New User Journey:
1. Visit app → Redirected to login
2. Click "Sign up" → Create account
3. Confirm email (if required)
4. Choose existing member or create new
5. Access full app functionality

### Existing User Journey:
1. Visit app → Redirected to login
2. Sign in with credentials
3. Immediate access to app

### OAuth Journey:
1. Click "Continue with Google"
2. Authorize with Google
3. Return to app with session
4. Claim member profile if first time
5. Access app functionality

## 🚀 Deployment Considerations

### Environment Variables
- Add all Supabase credentials to production environment
- Update redirect URLs for production domain
- Ensure database URL is correct

### Supabase Configuration
- Update Site URL to production domain
- Add production redirect URLs
- Configure email templates (optional)
- Set up custom SMTP (optional)

### Database
- Run migrations: `npm run db:push`
- Ensure PostgreSQL database is accessible
- Backup existing data before migration

## 🐛 Troubleshooting

### Common Issues:

1. **"Invalid redirect URL"**
   - Check Supabase redirect URLs configuration
   - Ensure callback URL matches exactly

2. **"User already exists"**
   - User tried to claim already claimed member
   - Check member claiming logic

3. **"Database connection error"**
   - Check DATABASE_URL environment variable
   - Ensure PostgreSQL is running

4. **"tRPC unauthorized"**
   - Session might be expired
   - Check Supabase session handling

### Debug Tips:

```typescript
// Check authentication state
const { user, session, loading } = useSupabase()
console.log({ user, session, loading })

// Check user info from API
const { data: userInfo } = api.auth.getMe.useQuery()
console.log({ userInfo })
```

## 📚 Next Steps

1. **Customize the UI** - Update styling and branding
2. **Add more OAuth providers** - Facebook, GitHub, etc.
3. **Email customization** - Custom email templates in Supabase
4. **Role-based access** - Add admin/member roles
5. **Profile management** - Allow users to edit their profiles
6. **Family invitations** - Invite family members via email

The authentication system is now fully functional and ready for your family circle app! 🎉
