# CareerChronos

A comprehensive job application tracking system to help job seekers organize their job search process, track applications, and manage interviews.

![CareerChronos](https://github.com/username/career-chronos/raw/main/public/screenshot.png)

## Features

- **Dashboard**: Get an overview of your job search progress with visual analytics
- **Application Tracking**: Log and monitor all your job applications in one place
- **Calendar Integration**: Keep track of interviews and important deadlines
- **Profile Management**: Maintain your professional profile information
- **Authentication**: Secure login with email/password, Microsoft, or Google accounts

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **UI Components**: shadcn/ui, Tailwind CSS
- **State Management**: React Context API, React Query
- **Authentication & Database**: Supabase
- **Location Search**: Google Places API
- **Charts & Visualizations**: Recharts
- **Form Handling**: React Hook Form, Zod

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Supabase account (for authentication and database)
- Google Cloud account (for Places API - optional)

### Installation

1. Clone the repository
   ```sh
   git clone https://github.com/username/career-chronos.git
   cd career-chronos
   ```

2. Install dependencies
   ```sh
   npm install
   # or
   yarn install
   ```

3. Set up environment variables
   - Copy the `.env.example` file to `.env`
   - Fill in the required environment variables:
     ```
     VITE_SUPABASE_URL=your-project-url
     VITE_SUPABASE_ANON_KEY=your-anon-key
     
     # OAuth Provider Settings (optional)
     VITE_MICROSOFT_CLIENT_ID=your-microsoft-client-id
     VITE_GOOGLE_CLIENT_ID=your-google-client-id
     
     # API Keys (optional)
     VITE_GOOGLE_PLACES_API_KEY=your-google-places-api-key
     ```

4. Start the development server
   ```sh
   npm run dev
   # or
   yarn dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Setting Up Authentication

### Supabase Configuration

1. Create a new project in [Supabase](https://supabase.com/)
2. Get your project URL and anon key from the project settings
3. Add these values to your `.env` file

### OAuth Providers (Optional)

#### Microsoft OAuth

1. Register a new application in the [Microsoft Azure Portal](https://portal.azure.com/)
2. Set the redirect URL to `https://[YOUR_SUPABASE_PROJECT].supabase.co/auth/v1/callback`
3. Get your client ID and add it to your `.env` file
4. Configure the Microsoft OAuth provider in your Supabase dashboard

#### Google OAuth

1. Create OAuth credentials in the [Google Cloud Console](https://console.cloud.google.com/)
2. Set the authorized redirect URI to `https://[YOUR_SUPABASE_PROJECT].supabase.co/auth/v1/callback`
3. Get your client ID and add it to your `.env` file
4. Configure the Google OAuth provider in your Supabase dashboard

## Setting Up Google Places API (Optional)

To enable enhanced location search functionality:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the "Places API" from the API Library
4. Create an API key from the Credentials page
5. Add the API key to your `.env` file as `VITE_GOOGLE_PLACES_API_KEY=your-api-key`
6. (Optional) Restrict the API key to only the Places API and your domain for security

## Deployment

### Build for Production

```sh
npm run build
# or
yarn build
```

The build artifacts will be stored in the `dist/` directory, ready to be deployed to any static hosting service.

### Recommended Hosting Options

- [Vercel](https://vercel.com/)
- [Netlify](https://www.netlify.com/)
- [GitHub Pages](https://pages.github.com/)
- [Cloudflare Pages](https://pages.cloudflare.com/)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Supabase](https://supabase.com/) for authentication and database services
- [Vite](https://vitejs.dev/) for the fast development experience
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
