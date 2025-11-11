# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/93500489-381b-4b7a-b59f-f38c2b76d9c7

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/93500489-381b-4b7a-b59f-f38c2b76d9c7) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Supabase setup

The dashboard now persists data in Supabase (patients, prompts, schedules, call logs, and health metrics) and relies on Supabase Auth for login. Get started by:

1. **Environment variables**
   - Add the following to your `.env` file (values come from the Supabase project):
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY` (or set `SUPABASE_ACCESS_TOKEN` to a service role key for local scripts)
     - Existing `VITE_VAPI_*` keys still power VAPI calls.
2. **Apply the schema**
   - Open the SQL Editor and run `supabase/migrations/20251111165256_init_schema.sql` (or run `supabase db push`) to create the tables, indexes, and RLS policies.
3. **(New) Allow demo access**
   - Run `supabase db push` so the latest migration (`20250105140300_open_access_policies.sql`) relaxes RLS and lets the anon key read/write during demos.
4. **Seed sample data (optional)**
   - Run `npm run seed:supabase` to upsert the original mock patients/metrics using the service role key.
4. **Authentication**
   - Use Supabase Auth email/password accounts to log in through `/login`. The React app listens to Supabase session events and automatically redirects on sign-in/out.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/93500489-381b-4b7a-b59f-f38c2b76d9c7) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
