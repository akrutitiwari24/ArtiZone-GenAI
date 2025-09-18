# Artizone - AI-Powered Artisan Marketplace

Artizone is a comprehensive full-stack web application that connects local artisans with vendors, customers, and collaborators through an AI-powered marketplace platform.

## 🌟 Features

### Core Functionality
- **Role-based Authentication**: Support for Artisans, Vendors, and Customers
- **AI-Powered Pricing**: Intelligent pricing suggestions based on market analysis
- **Audio Storytelling**: Artisans can record their stories with AI transcription
- **Product Catalog**: Comprehensive marketplace with search, filters, and categories
- **AI Recommendations**: Personalized suggestions for users and products
- **Event Management**: Community events, workshops, and exhibitions
- **Mentorship Matching**: Connect apprentices with master artisans

### Technical Features
- **Modern UI/UX**: Clean, warm design with earthy tones and smooth animations
- **Responsive Design**: Fully responsive across desktop, tablet, and mobile
- **Real-time Features**: Live notifications and updates
- **File Upload**: Support for product images and artisan media
- **Search & Filtering**: Advanced search with multiple filter options

## 🛠 Tech Stack

### Frontend
- **React.js** with TypeScript
- **TailwindCSS** for styling
- **Framer Motion** for animations
- **React Router** for navigation
- **Axios** for API calls
- **Lucide React** for icons

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcryptjs** for password hashing
- **OpenAI API** for AI features
- **Cloudinary** for file storage
- **Express Validator** for input validation

### AI/ML Integration
- **OpenAI GPT-3.5** for content generation and recommendations
- **Whisper API** for audio transcription
- **Custom pricing algorithms** for market analysis

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- OpenAI API key
- Cloudinary account (optional)

### MongoDB Setup Options

**Option 1: MongoDB Atlas (Recommended)**
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string and update `MONGODB_URI` in `.env`

**Option 2: Local MongoDB**
1. Install MongoDB locally
2. Start MongoDB service: `brew services start mongodb-community` (macOS) or `sudo systemctl start mongod` (Linux)
3. Use `mongodb://localhost:27017/artizone` as `MONGODB_URI`

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd artizone
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/artizone
   JWT_SECRET=your_jwt_secret_key_here
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   OPENAI_API_KEY=your_openai_api_key_here
   NODE_ENV=development
   ```

4. **Seed the database**
   ```bash
   cd server
   node seed.js
   ```

5. **Start the development servers**
   ```bash
   # From the root directory
   npm run dev
   ```

   This will start both the backend server (port 5000) and frontend development server (port 3000).

### Alternative: Start servers separately

**Backend:**
```bash
cd server
npm run dev
```

**Frontend:**
```bash
cd client
npm start
```

## 📱 Usage

### Test Accounts
The seed script creates several test accounts:

**Artisan Account:**
- Email: `sarah.chen@example.com`
- Password: `password123`

**Vendor Account:**
- Email: `retail@craftgallery.com`
- Password: `password123`

**Customer Account:**
- Email: `customer1@example.com`
- Password: `password123`

### Key Features to Try

1. **Registration & Login**: Create accounts for different user roles
2. **Profile Management**: Update profiles and add artisan-specific information
3. **Product Creation**: Artisans can add products with AI pricing suggestions
4. **Marketplace Browsing**: Search and filter products
5. **AI Features**: Try the pricing suggestions and content generation
6. **Event Management**: Create and register for events

## 🏗 Project Structure

```
artizone/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context providers
│   │   ├── types/          # TypeScript type definitions
│   │   └── ...
│   └── package.json
├── server/                 # Node.js backend
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── utils/              # Utility functions
│   ├── seed.js             # Database seeding script
│   └── package.json
└── package.json           # Root package.json
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token

### Users
- `GET /api/users/profile/:id` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/artisans` - Get artisans with filters
- `GET /api/users/vendors` - Get vendors with filters

### Products
- `GET /api/products` - Get products with filters
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (artisan only)
- `PUT /api/products/:id` - Update product
- `POST /api/products/:id/reviews` - Add review
- `POST /api/products/:id/favorite` - Toggle favorite

### AI Features
- `POST /api/ai/transcribe-audio` - Transcribe audio story
- `POST /api/ai/suggest-price` - Get pricing suggestions
- `POST /api/ai/generate-content` - Generate marketing content
- `GET /api/ai/recommendations/:userId` - Get user recommendations
- `POST /api/ai/mentorship-match` - Find mentorship matches

### Events
- `GET /api/events` - Get events with filters
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create event
- `POST /api/events/:id/register` - Register for event

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id/status` - Update order status

## 🎨 Design System

### Color Palette
- **Primary**: Warm browns and beiges (`#8B7355`, `#B5A896`)
- **Secondary**: Muted greens (`#3A9D3A`, `#5BB85B`)
- **Accent**: Earthy oranges (`#D97316`, `#E38D41`)

### Typography
- **Primary Font**: Poppins (clean, modern)
- **Display Font**: Nunito (friendly, artistic)

### Components
- Consistent button styles (primary, secondary, outline)
- Card-based layouts for products and profiles
- Smooth micro-animations throughout
- Responsive grid systems

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Render/Heroku)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push to main branch

### Database (MongoDB Atlas)
1. Create a MongoDB Atlas cluster
2. Update `MONGODB_URI` in environment variables
3. Configure IP whitelist and database user

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for AI capabilities
- Unsplash for placeholder images
- The artisan community for inspiration
- All contributors and supporters

## 📞 Support

For support, email support@artizone.com or join our community Discord server.

---

**Made with ❤️ for artisans worldwide**
