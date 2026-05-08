# TWA1-W2026-Group3 - Airbnb Listing Explorer

A transactional web application for browsing Airbnb listings and writing reviews with photo uploads.

## Features

### Image Upload

- Users can upload photos when writing reviews (optional)
- Photos are displayed on reviews in the listing detail page
- Photos are also visible on the user's reviews page
- Image preview before submission with ability to remove

### User Profile

- **Profile Page** (`/profile`) - View user information (name, email, role)
- **Reviews Page** (`/reviews`) - See all reviews written by the user with links back to listings
- Easy navigation between profile and reviews

### Browse & Review

- Browse all available listings with filtering
- View listing details and all reviews from other users
- Write reviews with ratings (1-5 stars), comments, and optional photos
- Edit or delete your own reviews
- One review per listing per user

## Setup Instructions

### Prerequisites

- Node.js (v14+)
- npm or yarn
- MongoDB (for backend)

### Frontend Setup

1. Navigate to the client folder:

```bash
cd client
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Backend Setup

1. Navigate to the server folder:

```bash
cd server
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file with the following:

```
MONGODB_URI=mongodb://localhost:27017/airbnb
JWT_SECRET=your_secret_key_here
PORT=3000
```

4. Start the server:

```bash
node server.js
```

The backend will be available at `http://localhost:3000`

## Project Structure

```
client/
  src/
    components/
      Nav.jsx              # Navigation bar
      Card.jsx             # Reusable card component
      ReviewForm.jsx       # Form for writing reviews with photo upload
      ReviewsList.jsx      # Display reviews with edit/delete
      ListingCard.jsx      # Listing preview card
      ProtectedRoute.jsx   # Route protection for authenticated users
    pages/
      LoginPage.jsx        # User login
      RegisterPage.jsx     # User registration
      BrowsePage.jsx       # Browse all listings
      ListingDetailPage.jsx # View listing details and reviews
      ProfilePage.jsx      # User profile information
      ReviewsPage.jsx      # All user's written reviews
    App.jsx               # Main app with routes
    App.css               # Application styles
    index.css             # Global styles and CSS variables

server/
  routes/
    auth.js               # Authentication routes (login, register, get profile)
    listings.js           # Listing routes (get all, get by ID)
    reviews.js            # Review routes (create, read, update, delete)
  models/
    User.js              # User database model
    Listing.js           # Listing database model
    Review.js            # Review database model
  middleware/
    auth.js              # JWT authentication middleware
  config/
    db.js                # MongoDB connection
  scripts/
    import-airbnb-dataset.js  # Seed database with sample data
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### Listings

- `GET /api/listings` - Get all listings
- `GET /api/listings/:id` - Get listing details with reviews

### Reviews

- `POST /api/reviews` - Create a review (with optional photo upload via FormData)
- `GET /api/reviews/:listingId` - Get reviews for a listing
- `GET /api/reviews/user/:userId` - Get all reviews by a user
- `PUT /api/reviews/:id` - Update a review
- `DELETE /api/reviews/:id` - Delete a review

## User Flow

1. **Registration/Login** - User creates account or logs in
2. **Browse** - User views all available listings
3. **View Details** - Click on listing to see details and reviews
4. **Write Review** - Submit review with rating, comment, and optional photo
5. **View Profile** - Check user's profile information
6. **View Reviews** - See all reviews written by the user with links back to listings
7. **Manage Reviews** - Edit or delete own reviews
8. **Logout** - Clear session and return to login

## Notes

- Each user can only write one review per listing
- Photos are optional for reviews
- Users can only edit/delete their own reviews
- All inputs are validated on both frontend and backend
