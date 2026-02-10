# NextStep Guidance - Goal Consultancy Platform

A comprehensive consultancy platform built with Next.js and InsForge backend, helping users achieve their goals through structured planning and expert guidance.

## Features

### For Users
- **Professional Landing Page** with all sections (Hero, About, Services, How We Work, Testimonials, FAQ, Contact, Footer)
- **User Dashboard** to:
  - Set and manage goals
  - Answer intake questions
  - Track progress on assigned steps
  - View notices from consultants
- **AI Chatbot** available site-wide for instant help
- **Authentication** with sign up, sign in, and password reset (via InsForge hosted pages)

### For Admins
- **Admin Dashboard** with tabs for:
  - **Users**: View all users and their progress
  - **Schedules**: Create and manage step-by-step plans for user goals
  - **Questions**: Manage intake questions shown to users
  - **Notices**: Send personalized messages to users
  - **Social Media**: Manage social media links displayed on the site
  - **Site Config**: Update site name, contact details, and other settings

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Make sure your `.env` file has:

```env
NEXT_PUBLIC_INSFORGE_BASE_URL=https://dw38nz2i.ap-southeast.insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY=your-anon-key-here
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Create an Admin Account

To create an admin account:

1. Sign up as a regular user through the website
2. Note your user ID from the InsForge dashboard or database
3. Run this SQL query in InsForge (replace `YOUR_USER_ID` with your actual user ID):

```sql
-- First, ensure you have a profile
INSERT INTO profiles (user_id, full_name, role)
VALUES ('YOUR_USER_ID', 'Your Name', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
```

Or update an existing profile:

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE user_id = 'YOUR_USER_ID';
```

### 5. Default Site Configuration

The site is pre-configured with:
- **Site Name**: NextStep Guidance
- **Mobile**: 9933219459
- **WhatsApp**: 9933219459
- **Address**: Kolkata, India

You can update these in the Admin Dashboard under the "Site Config" tab.

## Project Structure

```
src/
├── app/
│   ├── admin/          # Admin dashboard
│   ├── dashboard/      # User dashboard
│   ├── api/auth/       # Auth API routes
│   ├── layout.tsx      # Root layout with header and chatbot
│   ├── page.tsx        # Landing page
│   └── providers.tsx   # InsForge provider
├── components/
│   └── Chatbot.tsx     # AI chatbot component
└── lib/
    └── insforge.ts     # InsForge client configuration
```

## Database Schema

The application uses the following main tables:
- `profiles` - User profiles with roles (user/admin)
- `goals` - User goals
- `goal_steps` - Steps assigned to goals
- `intake_questions` - Questions for users
- `user_question_answers` - User answers
- `notices` - Admin messages to users
- `social_media_links` - Social media links
- `site_config` - Site configuration
- `faqs` - Frequently asked questions
- `testimonials` - Client testimonials

## Usage Guide

### For Users

1. **Sign Up**: Create an account
2. **Set a Goal**: Go to Dashboard → Goals tab → Create a new goal
3. **Answer Questions**: Go to Questions tab → Answer intake questions
4. **Track Progress**: Go to Steps tab → View and mark steps as complete
5. **Check Notices**: Go to Notices tab → Read messages from your consultant

### For Admins

1. **Manage Users**: View all users and their progress
2. **Create Schedules**: 
   - Select a user → Select their goal → Add steps with due dates
3. **Manage Questions**: Add/edit intake questions
4. **Send Notices**: Send personalized messages to users
5. **Manage Social Links**: Add/remove social media links
6. **Update Site Config**: Update contact details and site information

## Technologies Used

- **Next.js 15** - React framework
- **InsForge** - Backend-as-a-Service (Database, Auth, AI)
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Claude AI** - Chatbot functionality

## Notes

- The chatbot uses InsForge's AI integration with Claude 3.5 Haiku
- Authentication is handled through InsForge's hosted auth pages
- All data is stored in InsForge's PostgreSQL database
- The site is fully responsive and works on mobile devices

## Support

For issues or questions, contact support through the website or check the InsForge documentation.
