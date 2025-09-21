# 🎨 Artizone - AI-Powered Artisan Marketplace

A modern, full-stack marketplace connecting local artisans with customers through AI-powered features and beautiful design.

## 🌐 Live Demo

**Deployed App:** [https://artizone-marketplace.surge.sh](https://artizone-marketplace.surge.sh)

## ✨ Features

### 🎨 **Frontend (React)**
- **Modern UI/UX** with burgundy, pink, and beige color scheme
- **Responsive Design** that works on all devices
- **Real Product Images** from Unsplash for authentic feel
- **Artisan Profiles** with professional photos
- **Shopping Cart & Wishlist** functionality
- **Order Tracking** system
- **User Authentication** with role management
- **AI Recommendations** sidebar

### 🚀 **Backend (Node.js)**
- **Express.js** REST API
- **MongoDB** database with Mongoose
- **JWT Authentication** with bcrypt
- **AI Integration** for pricing and recommendations
- **File Upload** with Cloudinary
- **Rate Limiting** and security middleware

### 👥 **User Roles**
- **Artisans** - Create and sell handmade products
- **Vendors** - Purchase products in bulk for resale
- **Customers** - Buy unique handmade items

## 🛠️ Tech Stack

### Frontend
- **React 18** with hooks
- **React Router 6** for navigation
- **Tailwind CSS** for styling
- **Axios** for API calls
- **Lucide React** for icons
- **Context API** for state management

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Cloudinary** for image storage
- **OpenAI** for AI features
- **Multer** for file uploads

## 📁 Project Structure

```
ArtiZone-1/
├── client/                 # React frontend
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── App.js         # Main app component
│   └── package.json
├── server/                # Node.js backend
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   └── index.js          # Server entry point
└── package.json          # Root package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/akrutitiwari24/ArtiZone-GenAI.git
cd ArtiZone-GenAI
```

2. **Install dependencies**
```bash
npm run install-all
```

3. **Set up environment variables**
```bash
# Copy server environment template
cp server/env.example server/.env

# Edit server/.env with your configuration
```

4. **Start the development servers**
```bash
# Start both frontend and backend
npm run dev

# Or start individually
npm run server  # Backend on port 5000
npm run client  # Frontend on port 3000
```

## 📱 Pages & Features

### 🏠 **Homepage**
- Hero section with statistics
- Feature highlights
- Customer testimonials
- Call-to-action sections

### 🛒 **Marketplace**
- Product listings with real images
- AI-powered recommendations
- Search and filtering
- Add to cart functionality

### 👨‍🎨 **Artisans**
- Artisan directory with profiles
- Specialties and experience
- Sample products
- Contact and follow features

### 📅 **Events**
- Workshop and exhibition listings
- Registration system
- Event filtering (online/in-person)
- Progress tracking

### 🌍 **Community**
- Featured artisans
- Customer testimonials
- Community achievements
- Success stories

### 🔐 **Authentication**
- Multi-role registration
- Secure login/logout
- Password reset functionality
- Social login options

### 👤 **User Dashboard**
- Order history
- Profile management
- Statistics overview
- Quick actions

## 🎨 Design System

### Colors
- **Primary (Burgundy):** #dc2626
- **Secondary (Pink):** #ec4899
- **Accent (Beige):** #e69a4a
- **Background:** #fefdfb

### Typography
- **Font:** Inter (Google Fonts)
- **Weights:** 300, 400, 500, 600, 700, 800

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/artisans` - Get artisans

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details

### AI Features
- `GET /api/ai/recommendations` - Get AI recommendations
- `POST /api/ai/pricing` - Get pricing suggestions

## 🚀 Deployment

### Frontend (Surge.sh)
```bash
cd client
npm run build
surge build your-domain.surge.sh
```

### Backend (Heroku/Railway)
```bash
# Set environment variables
# Deploy to your preferred platform
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

- **Frontend Development:** React, Tailwind CSS
- **Backend Development:** Node.js, Express, MongoDB
- **AI Integration:** OpenAI API
- **Design:** Custom burgundy/pink/beige theme
- **Deployment:** Surge.sh, Heroku

## 🔗 Links

- **Live Demo:** [https://artizone-marketplace.surge.sh](https://artizone-marketplace.surge.sh)
- **GitHub Repository:** [https://github.com/akrutitiwari24/ArtiZone-GenAI](https://github.com/akrutitiwari24/ArtiZone-GenAI)

## 📞 Support

For support or questions, please open an issue in the GitHub repository.

---

**Built with ❤️ for artisans worldwide** 🎨✨