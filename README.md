# QuizVault

QuizVault is a no-nonsense / bloat-free , modern React application for exam preparation. It features a complete quiz platform with user authentication, progress tracking, and a multi-exam-ready architecture.

It is highly comprehensive and includes a very large data set which is extracted by reverse engineering a paywalled website.

Demo-video: https://drive.google.com/file/d/1r7T--XbuzrQQ87EJn04yRUCUM8f-Disa/view?usp=sharing
## Features

- **Authentication:** Secure user sign-up, login, and session management using Supabase Auth.
- **Progress Tracking:** Saves user quiz attempts, correct/incorrect choices, and bookmarks directly to a Supabase Postgres database.
- **Dynamic Filtering:** Cascading dropdowns to filter questions by Exam Group, Exam, Subject, Division, Chapter, and Topic.
- **Rich Question Rendering:** Renders HTML content and supports complex LaTeX equations (MathJax 3).
- **Responsive UI:** Clean, modern, and accessible design powered by Tailwind CSS.
- **Multi-Exam Architecture:** Built to easily scale beyond just JEE-Main to other exam formats.

## Tech Stack

- **Frontend:** React 18, Vite, React Router DOM
- **Styling:** Tailwind CSS (v4)
- **Backend/Database:** Supabase (Auth + Postgres RLS)
- **Deployment:** GitHub Actions -> GitHub Pages
- **Icons:** Lucide React

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- npm or yarn
- A Supabase project

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd prj3
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the root of the project:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Database Setup (Supabase SQL Editor):
   Run the following SQL to set up the required tables and RLS:
   ```sql
   -- Create profiles table
   CREATE TABLE profiles (
     id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
     email TEXT NOT NULL,
     display_name TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- Create progress table
   CREATE TABLE progress (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users NOT NULL,
     question_id TEXT NOT NULL,
     selected_option TEXT,
     is_correct BOOLEAN,
     marked_for_review BOOLEAN DEFAULT false,
     attempted_at TIMESTAMPTZ DEFAULT NOW(),
     UNIQUE(user_id, question_id)
   );

   -- Enable RLS
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

   -- Profiles Policies
   CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
   CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
   CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

   -- Progress Policies
   CREATE POLICY "Users can view their own progress" ON progress FOR SELECT USING (auth.uid() = user_id);
   CREATE POLICY "Users can insert their own progress" ON progress FOR INSERT WITH CHECK (auth.uid() = user_id);
   CREATE POLICY "Users can update their own progress" ON progress FOR UPDATE USING (auth.uid() = user_id);
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### Deployment

This project is configured to deploy automatically to GitHub Pages using GitHub Actions (`.github/workflows/deploy.yml`).

To enable deployment:
1. Go to your GitHub Repository Settings > Secrets and variables > Actions.
2. Add the following Repository Secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Push to the `main` branch to trigger the action.
