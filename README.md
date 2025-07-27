# AI Article Generator

A modern web application for generating high-quality, SEO-optimized articles using AI. Built with Next.js, TypeScript, Tailwind CSS, and integrated with OpenRouter AI. **Completely free for all bloggers and content creators.**

## Features

- 🤖 **AI-Powered Content Generation** - Generate articles using OpenRouter AI
- 💡 **AI Ideas Generator** - Get AI-powered suggestions for article titles and SEO keywords
- 📊 **SEO Optimization** - Built-in SEO tools and metadata generation
- 🎨 **Modern UI** - Beautiful interface built with shadcn/ui and Tailwind CSS
- 👤 **User Authentication** - Secure login/register system with NextAuth.js
- 👑 **Admin Panel** - Complete admin dashboard for user and content management
- 📈 **Dashboard Analytics** - Track your article generation and usage
- 🔒 **Security First** - Rate limiting, input validation, and data protection
- 📱 **Responsive Design** - Works perfectly on all devices (mobile-first approach)
- ⚡ **Fast Performance** - Built with Next.js 15 and optimized for speed
- 🆓 **Free Forever** - No subscriptions, no limits, no hidden fees

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **Authentication**: NextAuth.js (JWT strategy)
- **Database**: MongoDB with Mongoose
- **AI Provider**: OpenRouter AI
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Notifications**: Sonner

## Security Features

- **Rate Limiting**: 10 articles per minute per user, 3 registrations per hour per IP
- **Input Validation**: All inputs are validated and sanitized
- **SQL Injection Protection**: Using Mongoose with proper validation
- **XSS Protection**: Input sanitization and proper encoding
- **CSRF Protection**: Built-in with NextAuth.js
- **Password Hashing**: Bcrypt with salt rounds
- **Session Management**: Secure JWT-based sessions
- **Role-Based Access Control**: Admin and user role separation
- **Admin Authentication**: Secure admin panel with NextAuth integration

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB database
- OpenRouter API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-article-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file with the following variables:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/ai-article-generator
   
   # NextAuth
   NEXTAUTH_SECRET=your-secret-key-here
   NEXTAUTH_URL=http://localhost:3000
   
   # OpenRouter AI
   OPENROUTER_API_KEY=your-openrouter-api-key-here
   OPENROUTER_SITE_URL=http://localhost:3000
   OPENROUTER_SITE_NAME=AI Article Generator
   
   # JWT
   JWT_SECRET=your-jwt-secret-here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── articles/      # Article management APIs
│   │   ├── auth/          # Authentication APIs
│   │   ├── ai-ideas/      # AI ideas generation API
│   │   ├── ghost-dashboard/ # Admin panel APIs
│   │   └── dashboard/     # Dashboard APIs
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard page
│   ├── generate/          # Article generation page
│   ├── ai-ideas/          # AI ideas generation page
│   ├── ghost-login/       # Admin login page
│   ├── ghost-register/    # Admin registration page
│   ├── ghost-dashboard/   # Admin dashboard page
│   └── articles/          # Article viewing/editing pages
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── forms/            # Form components
│   ├── dashboard/        # Dashboard components
│   └── article/          # Article components
├── lib/                  # Utility libraries
│   ├── ai/               # AI service integration
│   ├── auth/             # Authentication utilities
│   ├── db/               # Database models and connection
│   └── utils.ts          # General utilities
├── types/                # TypeScript type definitions
└── middleware.ts         # Next.js middleware for route protection
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (rate limited: 3/hour per IP)
- `POST /api/auth/login` - User login (handled by NextAuth)
- `GET /api/auth/me` - Get current user data

### Articles
- `GET /api/articles` - Get user's articles
- `POST /api/articles/generate` - Generate new article (rate limited: 10/minute per user)
- `GET /api/articles/[id]` - Get specific article
- `PUT /api/articles/[id]` - Update article
- `DELETE /api/articles/[id]` - Delete article

### AI Ideas
- `POST /api/ai-ideas` - Generate AI suggestions for titles and keywords (rate limited: 10/minute per IP)

### Dashboard
- `GET /api/dashboard/stats` - Get user statistics

### Admin Panel (Protected)
- `GET /api/ghost-dashboard/users` - Get all users (admin only)
- `DELETE /api/ghost-dashboard/users` - Delete user (admin only)
- `GET /api/ghost-dashboard/admins` - Get all admins (admin only)
- `POST /api/ghost-dashboard/admins` - Create new admin (admin only)
- `DELETE /api/ghost-dashboard/admins` - Delete admin (admin only)
- `PUT /api/ghost-dashboard/admins/[id]` - Update admin (admin only)
- `GET /api/ghost-dashboard/articles` - Get all articles (admin only)
- `DELETE /api/ghost-dashboard/articles` - Delete article (admin only)

### Admin Registration
- `POST /api/ghost-register` - Register first admin (one-time use)
- `GET /api/ghost-register/check` - Check if admin exists

## Features in Detail

### Article Generation
- Choose from 20+ categories
- Customize tone (professional, casual, friendly, formal)
- Set word count (100-2000 words)
- Add keywords for SEO (max 10 keywords)
- Additional instructions for customization (max 1000 characters)
- Input validation and sanitization
- Real-time generation with progress indicators

### AI Ideas Generator
- Get AI-powered suggestions for article titles (max 10)
- Generate SEO keywords (10-20 keywords)
- Topic-based or random suggestions
- Structured output format
- Rate limited for fair usage

### User Dashboard
- View all generated articles with search and filtering
- Track usage statistics and analytics
- Monitor article generation count
- Quick access to article generation and AI ideas
- Responsive design for all devices

### Admin Panel
- **User Management**: View, search, and delete users
- **Admin Management**: Create, edit, and delete admin accounts
- **Article Management**: View and delete all articles
- **Security**: Role-based access control with NextAuth
- **One-time Setup**: Admin registration limited to first admin only

### Responsive Design
- **Mobile-First Approach**: Optimized for smartphones and tablets
- **Adaptive Navigation**: Collapsible navigation for mobile
- **Flexible Layouts**: Cards and grids that adapt to screen size
- **Touch-Friendly**: Optimized buttons and interactions for mobile
- **Cross-Platform**: Works seamlessly on all devices

### Security Measures
- **Rate Limiting**: Prevents abuse and ensures fair usage
- **Input Validation**: All user inputs are validated and sanitized
- **Password Security**: Bcrypt hashing with salt rounds
- **Session Security**: JWT-based sessions with proper expiration
- **Role-Based Access**: Separate admin and user authentication
- **Data Protection**: User data is never shared with third parties
- **XSS Prevention**: Input sanitization and proper encoding
- **CSRF Protection**: Built-in with NextAuth.js

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `NEXTAUTH_SECRET` | Secret key for NextAuth | Yes |
| `NEXTAUTH_URL` | Your application URL | Yes |
| `OPENROUTER_API_KEY` | OpenRouter AI API key | Yes |
| `OPENROUTER_SITE_URL` | Your site URL for OpenRouter | Yes |
| `OPENROUTER_SITE_NAME` | Your site name for OpenRouter | Yes |
| `JWT_SECRET` | JWT secret key | Yes |

## Admin Setup

### First-Time Admin Setup
1. Navigate to `/ghost-register`
2. Create the first admin account (this can only be done once)
3. Use the admin credentials to login at `/ghost-login`
4. Access the admin dashboard at `/ghost-dashboard`

### Admin Features
- **User Management**: View all users, their roles, and article counts
- **Content Management**: Monitor and manage all generated articles
- **Admin Management**: Create additional admin accounts
- **System Analytics**: View platform usage statistics

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you have any questions or need help, please open an issue on GitHub or contact us.

## Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [OpenRouter](https://openrouter.ai/) - AI provider
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [MongoDB](https://www.mongodb.com/) - Database
- [Mongoose](https://mongoosejs.com/) - MongoDB ODM
