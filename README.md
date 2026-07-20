# NomadAI Backend

A robust Node.js/Express REST API powering the NomadAI travel platform — an AI-powered travel destination marketplace with intelligent recommendations, real-time translation, and smart trip planning.

## Tech Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js 5
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Auth:** JWT + Firebase Admin (Google OAuth)
- **AI:** LangChain + Groq (Llama 3.3 70B)
- **Deployment:** Railway

## Features

### Authentication & Authorization
- Email/password registration & login
- Google OAuth via Firebase Admin SDK
- JWT token-based session management
- Role-based access control (user/admin)
- Demo login for quick testing

### Destinations Marketplace
- CRUD operations for travel destinations
- Search, filter by category/price/rating
- Pagination and sorting
- Image support with multiple uploads
- Related destinations

### AI-Powered Tools
- **Smart Trip Matcher** — Quiz-based destination recommendations using AI
- **AI Chat Assistant** — SSE streaming chat with page-context awareness
- **Multi-Language Translator** — Translates text with cultural context, pronunciation, and alternatives in 50+ languages
- **Data Analyzer** — Upload CSV/Excel/JSON/PDF files for AI-powered insights

### Bookings
- Create bookings with date range, guest count, price calculation
- Booking status management (pending → confirmed → completed/cancelled)
- User booking history

### Reviews & Ratings
- Star ratings (1-5) with title and comment
- One review per user per destination
- Automatic average rating recalculation
- Delete own reviews

### Favorites
- Toggle favorites on/off
- User favorites list
- Duplicate prevention

### Itineraries
- AI-powered day-by-day trip planner
- Create, update, delete itineraries
- Day-by-day activities with locations and notes

### Multi-Currency
- 20 supported currencies
- Real-time price conversion
- Currency persistence

### Admin Dashboard
- Platform statistics (users, destinations, revenue)
- Revenue and growth charts
- Category and rating analytics
- Location analytics
- Recent activity tables

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/demo` | Demo login |
| POST | `/api/auth/google` | Google OAuth login |

### Destinations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/destinations` | List (search/filter/paginate) |
| GET | `/api/destinations/:id` | Get by ID |
| POST | `/api/destinations` | Create (auth) |
| DELETE | `/api/destinations/:id` | Delete (owner) |
| GET | `/api/destinations/my-listings` | My listings (auth) |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create booking (auth) |
| GET | `/api/bookings/my` | My bookings (auth) |
| GET | `/api/bookings/:id` | Get booking (auth) |
| PATCH | `/api/bookings/:id/cancel` | Cancel (auth) |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reviews` | Create review (auth) |
| GET | `/api/reviews/destination/:id` | Get reviews |
| DELETE | `/api/reviews/:id` | Delete (owner) |

### Favorites
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/favorites/toggle` | Toggle favorite (auth) |
| GET | `/api/favorites/my` | My favorites (auth) |
| GET | `/api/favorites/check/:id` | Check if favorited (auth) |

### Itineraries
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/itineraries` | Create (auth) |
| GET | `/api/itineraries/my` | My itineraries (auth) |
| GET | `/api/itineraries/:id` | Get by ID (auth) |
| PUT | `/api/itineraries/:id` | Update (auth) |
| DELETE | `/api/itineraries/:id` | Delete (auth) |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/chat` | Chat with AI |
| POST | `/api/ai/chat/stream` | SSE streaming chat |
| POST | `/api/match` | Smart trip matcher |
| GET | `/api/quiz` | Get quiz questions |
| POST | `/api/translate` | Translate text |
| GET | `/api/languages` | Supported languages |

### Other
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/data/analyze` | Analyze uploaded data |
| GET | `/api/admin/stats` | Admin dashboard stats (auth) |
| GET | `/api/currencies` | Supported currencies |
| GET | `/api/convert` | Convert currency |

## Environment Variables

```env
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:3000
GROQ_API_KEY=gsk_...
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Seed the database (optional)
npm run seed

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

## Project Structure

```
src/
├── app.ts                 # Express app configuration
├── server.ts              # Server entry point
├── config/
│   ├── db.ts              # MongoDB connection
│   └── env.ts             # Environment variables
├── controllers/           # Route handlers
│   ├── auth.controller.ts
│   ├── booking.controller.ts
│   ├── review.controller.ts
│   ├── favorite.controller.ts
│   ├── itinerary.controller.ts
│   ├── currency.controller.ts
│   ├── admin.controller.ts
│   ├── translate.controller.ts
│   └── matcher.controller.ts
├── middleware/
│   └── auth.middleware.ts  # JWT auth middleware
├── models/                # Mongoose schemas
│   ├── User.model.ts
│   ├── Destination.model.ts
│   ├── Booking.model.ts
│   ├── Review.model.ts
│   ├── Favorite.model.ts
│   └── Itinerary.model.ts
├── routes/                # API routes
├── services/              # Business logic
│   └── ai.service.ts
└── utils/                 # Helpers
```

## License

MIT
