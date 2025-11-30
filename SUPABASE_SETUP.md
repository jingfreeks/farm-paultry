# Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization and name your project (e.g., "farm-poultry")
4. Set a secure database password
5. Select a region close to your users
6. Click "Create new project"

## 2. Get Your API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## 3. Set Up Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 4. Run Database Migrations

1. Go to your Supabase dashboard → **SQL Editor**
2. Run the migrations in order:
   - First: `supabase/migrations/001_initial_schema.sql`
   - Then: `supabase/migrations/002_seed_data.sql`

Or use the Supabase CLI:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## 5. Database Schema

The database includes the following tables:

| Table | Description |
|-------|-------------|
| `products` | Farm products (poultry, eggs, produce) |
| `customers` | Customer information |
| `orders` | Customer orders |
| `order_items` | Individual items in each order |
| `contact_submissions` | Contact form submissions |
| `testimonials` | Customer testimonials |

## 6. Row Level Security (RLS)

RLS policies are set up for:
- **Products**: Public read, authenticated write
- **Testimonials**: Public read for featured items
- **Contact Submissions**: Public insert (anyone can submit)
- **Orders**: Users can only view their own orders

## 7. Verify Setup

After setup, you can verify by:
1. Checking the Tables in Supabase dashboard
2. Running `npm run dev` and viewing the products
3. Submitting a contact form and checking the database

