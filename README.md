# AURA UNIFORM

This project is a premium AURA UNIFORM business website and CMS.

## Tech stack

- React + Vite + TypeScript
- Tailwind CSS
- React Router
- Supabase Auth, Database, and Storage
- Lucide icons

## Installation

1. Install Node.js 20+.
2. Open the project folder.
3. Install dependencies:

```bash
npm install
```

## Environment setup

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Then fill in:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-public-anon-key
```

## Supabase project setup

1. Create a new Supabase project.
2. Go to SQL Editor and run the provided schema migration.
3. Create a storage bucket called `product-images`.
4. Enable row-level security.
5. Create authentication users for admin access.
6. Add authorized users to `admin_profiles`.
7. Run `supabase/admin_authorization.sql` to authorize the existing `akbhi143@gmail.com` Auth user without creating a duplicate.

## Database migration

The SQL migration creates:

- `businesses`
- `categories`
- `products`
- `product_images`
- `admin_profiles`

Seed categories for AURA UNIFORM.

## Authentication setup

- Use Supabase Email/Auth.
- Create the first admin user in Supabase Auth.
- Insert the user ID into `admin_profiles`.
- Only users with an `admin_profiles` row having role `admin` or `super_admin` can access `/vijay` routes.

## Running locally

```bash
npm run dev
```

## Build for production

```bash
npm run build
```

## Deployment

Deploy to any static host such as Vercel or Netlify, or use the Vite production build on your preferred host. Ensure the environment variables are configured in the deployment platform.

## Admin workflow

1. Log in with an approved admin account.
2. Open the dashboard.
3. Add or edit products and categories.
4. Upload images to Supabase Storage.
5. Publish products to show them on the public site.
6. Use the settings page to update business information.

## Product management

The public catalog reads only published products for each brand. Admin changes are reflected immediately after saving and refreshing.

## Important notes

- Do not put service-role keys in the frontend.
- Public data is read-only for visitors.
- Product images are stored in Supabase Storage, not base64 in the database.
- Keep the publishable key in the local `.env`; never put a service-role key in frontend code.
