# 🎵 Music Uploader

> **Note:** This repository contains an internal tool specifically designed and built for the **Ankur Pathshala Project**. We have decided to make this project public to demonstrate our development practices and showcase how we build our internal company tools!

A modern, highly-polished Next.js application for seamlessly uploading MP3 files and managing music metadata. It features a native-feeling UI, automatic album art extraction, and a direct integration with Supabase for cloud storage and database management.

## ✨ Features

- **Modern Native UI:** Built with Radix UI and Tailwind CSS for a sleek, responsive, and accessible experience.
- **Drag & Drop Upload:** Seamlessly drag and drop `.mp3` files right into the browser.
- **Auto-Metadata Extraction:** Automatically extracts ID3 tags and album cover art straight from the MP3 blobs entirely in the browser.
- **Inline Editing:** Double-click song titles to easily rename them before publishing.
- **Local Persistence:** Uses `localforage` (IndexedDB) to save your upload queue locally, so you don't lose data if you refresh the page.
- **Supabase Integration:** Publishes MP3s to a `music` bucket, Cover Art to an `albums` bucket, and upserts a highly structured row into your database.
- **Docker Ready:** Includes a multi-stage, highly optimized `Dockerfile` for instantaneous production deployment.

## 🛠 Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Styling:** [Radix UI Themes](https://www.radix-ui.com/) & [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Storage/DB:** [Supabase](https://supabase.com/)
- **Parsing:** `music-metadata-browser`

## 🚀 Getting Started

### 1. Environment Setup
Create a `.env.local` file in the root of the project with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-or-service-role-key
```

### 2. Local Development
Install dependencies and run the Next.js development server:

```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 3. Docker Deployment
This project is configured with a standalone Next.js build to keep the Docker image size extremely small.

**Build the image:**
```bash
docker build -t music-uploader-app .
```

**Run the container:**
```bash
docker run -d -p 3001:3000 --name music-uploader music-uploader-app
```
Then open [http://localhost:3001](http://localhost:3001).

## 🗄️ Supabase Schema Reference

If you are setting this up from scratch, here is the required SQL schema:

```sql
-- Create buckets
insert into storage.buckets (id, name, public) values ('music', 'music', true);
insert into storage.buckets (id, name, public) values ('albums', 'albums', true);

-- Allow public uploads
create policy "Public Upload Music" on storage.objects for insert with check ( bucket_id = 'music' );
create policy "Public Upload Albums" on storage.objects for insert with check ( bucket_id = 'albums' );

-- Create music table
create table if not exists public.music (
  id uuid primary key default gen_random_uuid(),
  music_name text not null,
  music_creator_name text,
  music_audio_url text not null,
  music_photo_url text,
  audio_storage_path text unique not null,
  created_at timestamptz default now()
);
```

---
*Built for the Ankur Pathshala Project.*
