# Quote of the Day App Setup

## Prerequisites
- Node.js (v16 or higher)
- MongoDB (running locally or MongoDB Atlas connection)
- API Ninjas API Key (free at https://api-ninjas.com/)

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following content:
   ```
   MONGO_URI=mongodb://localhost:27017/quotes-app
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   PORT=3000
   API_NINJAS_KEY=your-api-ninjas-key-here
   ```

4. Get your API Ninjas key:
   - Go to https://api-ninjas.com/
   - Sign up for a free account
   - Copy your API key from the dashboard
   - Add it to the `.env` file

5. Seed the database with sample quotes:
   ```bash
   npm run seed
   ```

6. Start the backend server:
   ```bash
   npm run dev
   ```

## Frontend Setup

1. In a new terminal, navigate to the project root:
   ```bash
   cd /path/to/your/project
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm run dev
   ```

## Usage

1. Open your browser and go to `http://localhost:5173`
2. Create a new account or sign in with existing credentials
3. Click "Get Random Quote" to fetch quotes from the external API
4. Favorite quotes you like
5. View your favorites by clicking the "Favorites" button in the header

## Features

- User authentication (signup/login)
- Fetch random quotes from API Ninjas
- Browse all fetched quotes
- Favorite/unfavorite quotes
- Dedicated favorites page
- Responsive design
- Modern UI with animations

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/quotes/fetch` - Fetch new quote from external API
- `GET /api/quotes` - Get all quotes (requires auth)
- `GET /api/quotes/favorites` - Get user's favorite quotes
- `POST /api/quotes/favorite/:id` - Toggle favorite (requires auth)

## Troubleshooting

- Make sure MongoDB is running before starting the backend
- If you get connection errors, check your MongoDB connection string in the `.env` file
- If quotes aren't loading, verify your API Ninjas key is correct
- For production, change the JWT_SECRET to a secure random string
- The free API Ninjas plan has rate limits (10,000 requests per month) 