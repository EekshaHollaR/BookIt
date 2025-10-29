# Highway Delite - Experiences & Slots Booking Platform

A modern, fullstack web application for booking travel experiences like paragliding, river rafting, scuba diving, and wildlife safaris. Built with React, TypeScript, TailwindCSS, and Cloud (PostgreSQL + Edge Functions).

## 🚀 Live Demo

**Project URL**: 

[Deploy your application](#deployment) to get a live URL.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Testing](#testing)

## ✨ Features

### Frontend
- **Responsive Design**: Mobile-first design using TailwindCSS, matching exact Figma specifications
- **Experience Listing**: Browse travel experiences with beautiful cards
- **Search Functionality**: Real-time search by title, location, or category
- **Dynamic Booking Flow**: Select dates, time slots, and quantity
- **Real-time Availability**: Shows available slots and sold-out states
- **Promo Code Support**: Apply discount codes (SAVE10, FLAT100) at checkout
- **Booking Confirmation**: Unique booking reference generation
- **Loading States**: Proper loading indicators throughout the app
- **Toast Notifications**: User-friendly feedback for all actions

### Backend
- **RESTful API**: Clean API design with serverless edge functions
- **PostgreSQL Database**: Relational database with proper schemas and RLS
- **Slot Management**: Prevents double-booking with real-time availability tracking
- **Promo Code Validation**: Server-side validation of discount codes
- **Data Validation**: Input validation for all API endpoints
- **CORS Support**: Proper CORS headers for web integration
- **Transaction Safety**: Atomic operations for booking creation and slot updates

## 🛠️ Tech Stack

### Frontend
- **React 18**: Modern React with hooks and TypeScript
- **TypeScript**: Type-safe development
- **Vite**: Lightning-fast build tool and dev server
- **TailwindCSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **Sonner**: Beautiful toast notifications
- **Lucide React**: Icon library
- **Shadcn/ui**: High-quality component library

### Backend
- **Cloud**: Integrated backend platform (no external accounts needed)
- **PostgreSQL**: Relational database with Row Level Security
- **Supabase Edge Functions**: Serverless API endpoints (Deno runtime)
- **Supabase Client**: Type-safe database queries

## 🏗️ Architecture

```
┌─────────────────────────────┐
│      React Frontend         │
│   (TypeScript + Vite)       │
└──────────┬──────────────────┘
           │
           │ HTTP/REST API
           │
┌──────────▼──────────────────────┐
│   Supabase Edge Functions       │
│   ├── GET /experiences          │
│   ├── GET /experiences/:id      │
│   ├── POST /bookings            │
│   └── POST /promo-validate      │
└──────────┬──────────────────────┘
           │
           │ SQL Queries (Supabase Client)
           │
┌──────────▼──────────────────┐
│   PostgreSQL Database       │
│   ├── experiences           │
│   ├── time_slots            │
│   ├── bookings              │
│   └── promo_codes           │
└─────────────────────────────┘
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**
```bash
git clone <your-git-url>
cd bookIt-experiences
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Backend Setup

The backend is powered by Cloud and is already configured. No additional setup required!

**Included in the database:**
- ✅ 4 Sample experiences (Paragliding, Rafting, Scuba Diving, Safari)
- ✅ Time slots with availability tracking
- ✅ Promo codes (SAVE10, FLAT100)
- ✅ Row Level Security policies

## 🔌 API Endpoints

All endpoints are deployed as serverless functions and support CORS.

### GET /experiences
Returns a list of all available experiences.

**Example Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "title": "Paragliding in Bir Billing",
    "location": "Bir Billing, Himachal Pradesh",
    "description": "Experience the thrill of paragliding...",
    "longDescription": "Soar through the skies...",
    "price": 3000,
    "image": "https://images.unsplash.com/...",
    "category": "Adventure",
    "borderColor": "hsl(var(--primary))",
    "badge": {
      "text": "Popular",
      "color": "hsl(var(--primary))"
    }
  }
]
```

### GET /experiences/:id
Returns detailed information about a specific experience including available dates and time slots.

**Example Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "title": "Paragliding in Bir Billing",
  "availableDates": ["2025-11-15", "2025-11-16", "2025-11-17"],
  "availableTimes": [
    {
      "time": "8:00 AM",
      "available": 8,
      "soldOut": false
    },
    {
      "time": "10:00 AM",
      "available": 15,
      "soldOut": false
    },
    {
      "time": "2:00 PM",
      "available": 0,
      "soldOut": true
    }
  ]
}
```

### POST /bookings
Creates a new booking and updates slot availability atomically.

**Request Body:**
```json
{
  "experienceId": "550e8400-e29b-41d4-a716-446655440001",
  "experienceName": "Paragliding in Bir Billing",
  "date": "2025-11-15",
  "time": "8:00 AM",
  "quantity": 2,
  "fullName": "John Doe",
  "email": "john@example.com",
  "price": 6000,
  "taxes": 360,
  "discount": 10,
  "total": 6350
}
```

**Success Response:**
```json
{
  "bookingRef": "HUFAB12SO",
  "booking": { /* complete booking details */ }
}
```

**Error Response:**
```json
{
  "error": "Not enough slots available"
}
```

### POST /promo/validate
Validates a promo code and returns the discount amount.

**Request Body:**
```json
{
  "code": "SAVE10"
}
```

**Success Response:**
```json
{
  "valid": true,
  "discount": 10
}
```

**Error Response:**
```json
{
  "valid": false,
  "error": "Invalid promo code"
}
```

## 🗄️ Database Schema

### experiences
Stores all travel experience information.

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| title | TEXT | NOT NULL | Experience name |
| location | TEXT | NOT NULL | Location details |
| description | TEXT | NOT NULL | Short description |
| long_description | TEXT | NOT NULL | Detailed description |
| price | INTEGER | NOT NULL | Base price in rupees |
| image | TEXT | NOT NULL | Image URL |
| category | TEXT | NOT NULL | Category (Adventure, Wildlife, etc.) |
| border_color | TEXT | | UI border color |
| badge_text | TEXT | | Badge text (optional) |
| badge_color | TEXT | | Badge color (optional) |
| created_at | TIMESTAMP | DEFAULT now() | Creation timestamp |

### time_slots
Manages availability for each experience.

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| experience_id | UUID | FOREIGN KEY, NOT NULL | Links to experiences |
| date | TEXT | NOT NULL | Date (YYYY-MM-DD format) |
| time | TEXT | NOT NULL | Time slot (e.g., "8:00 AM") |
| total_capacity | INTEGER | DEFAULT 50 | Total available slots |
| available | INTEGER | DEFAULT 50 | Currently available slots |
| sold_out | BOOLEAN | DEFAULT false | Quick sold-out flag |
| created_at | TIMESTAMP | DEFAULT now() | Creation timestamp |
| | | UNIQUE(experience_id, date, time) | Prevents duplicate slots |

### bookings
Stores all customer bookings.

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| booking_ref | TEXT | UNIQUE, NOT NULL | Customer-facing reference |
| experience_id | UUID | FOREIGN KEY, NOT NULL | Links to experiences |
| experience_name | TEXT | NOT NULL | Experience title (denormalized) |
| date | TEXT | NOT NULL | Booking date |
| time | TEXT | NOT NULL | Booking time |
| quantity | INTEGER | NOT NULL | Number of slots booked |
| full_name | TEXT | NOT NULL | Customer full name |
| email | TEXT | NOT NULL | Customer email |
| price | INTEGER | NOT NULL | Subtotal before taxes |
| taxes | INTEGER | NOT NULL | Tax amount (6%) |
| discount | INTEGER | DEFAULT 0 | Discount applied |
| total | INTEGER | NOT NULL | Final total amount |
| created_at | TIMESTAMP | DEFAULT now() | Booking timestamp |

### promo_codes
Manages discount codes.

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| code | TEXT | UNIQUE, NOT NULL | Promo code string |
| discount | INTEGER | NOT NULL | Discount amount in rupees |
| active | BOOLEAN | DEFAULT true | Is code currently active |
| created_at | TIMESTAMP | DEFAULT now() | Creation timestamp |

## 🚀 Deployment



### Option 1: Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Build and deploy
npm run build
vercel --prod
```

### Option 2: Deploy to Netlify

```bash
# Build the project
npm run build

# Deploy the dist folder to Netlify
# Or connect your GitHub repo to Netlify for auto-deployment
```

### Backend Deployment

✅ **No action needed!** Edge functions and database are automatically deployed.

## 🧪 Testing

### Test Promo Codes
- `SAVE10` - ₹10 discount
- `FLAT100` - ₹100 discount

### Sample Booking Flow

1. **Browse Experiences**
   - Visit the home page
   - See 4 sample experiences with beautiful cards

2. **Search**
   - Try searching for "paragliding", "rafting", or "Rishikesh"
   - Results update in real-time

3. **View Details**
   - Click on any experience card
   - See detailed description, images, and available slots

4. **Select Slot**
   - Choose a date from available dates
   - Select a time slot (note: some slots are sold out)
   - Adjust quantity using +/- buttons

5. **Checkout**
   - Click "Confirm" to proceed to checkout
   - Fill in your name and email
   - Try applying promo code "SAVE10" or "FLAT100"
   - Agree to terms and conditions

6. **Confirmation**
   - Click "Pay and Confirm"
   - Receive a unique booking reference (e.g., "HUFAB12SO")
   - See complete booking summary

### Testing Double-Booking Prevention

1. Book all available slots for a specific time
2. Try booking the same time again
3. You'll receive an error: "Not enough slots available"

## 🔑 Key Implementation Details

### 1. Double-Booking Prevention
```typescript
// Check availability before booking
const { data: slot } = await supabase
  .from('time_slots')
  .select('*')
  .eq('experience_id', experienceId)
  .eq('date', date)
  .eq('time', time)
  .single();

if (slot.available < quantity) {
  throw new Error('Not enough slots available');
}
```

### 2. Atomic Slot Updates
```typescript
// Update availability after successful booking
const newAvailable = slot.available - quantity;
await supabase
  .from('time_slots')
  .update({ 
    available: newAvailable,
    sold_out: newAvailable === 0
  })
  .eq('id', slot.id);
```

### 3. Input Validation
All API endpoints validate required fields:
```typescript
if (!experienceId || !date || !time || !quantity || !fullName || !email) {
  return error(400, 'Missing required fields');
}
```

### 4. Error Handling
User-friendly error messages throughout:
```typescript
try {
  await api.createBooking(bookingData);
  toast.success('Booking created successfully!');
} catch (error) {
  toast.error('Failed to create booking. Please try again.');
}
```

## 📝 Project Structure

```
├── src/
│   ├── components/          # React components
│   │   ├── Header.tsx       # Navigation header
│   │   ├── ExperienceCard.tsx  # Experience card component
│   │   └── ui/              # Shadcn UI components
│   ├── pages/               # Route pages
│   │   ├── Index.tsx        # Home page
│   │   ├── SearchResults.tsx  # Search results
│   │   ├── ExperienceDetails.tsx  # Experience detail page
│   │   ├── Checkout.tsx     # Checkout page
│   │   └── Confirmation.tsx # Booking confirmation
│   ├── lib/
│   │   ├── api.ts           # API client functions
│   │   └── utils.ts         # Utility functions
│   ├── types/
│   │   └── experience.ts    # TypeScript types
│   └── data/
│       └── experiences.ts   # Static experience data (legacy)
├── supabase/
│   ├── functions/           # Edge functions
│   │   ├── experiences/     # GET experiences API
│   │   ├── bookings/        # POST bookings API
│   │   └── promo-validate/  # POST promo validation
│   └── config.toml          # Supabase configuration
└── README.md                # This file
```

## 🎨 Design System

The application uses a custom design system based on the Highway Delite brand:

- **Primary Color**: `#FFC107` (Yellow)
- **Typography**: System font stack for optimal performance
- **Spacing**: Tailwind's standard spacing scale
- **Components**: Shadcn/ui components customized to match design

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is built for educational purposes as part of a fullstack intern assignment.

## 👥 Contact

For questions or feedback:
- Open an issue on GitHub
---

**Built using React, TypeScript, TailwindCSS**

*This project demonstrates a complete fullstack booking system with:*
- ✅ Modern React frontend with TypeScript
- ✅ PostgreSQL database with proper schemas
- ✅ RESTful API with serverless edge functions
- ✅ Double-booking prevention
- ✅ Real-time availability tracking
- ✅ Input validation and error handling
- ✅ Responsive design matching Figma specifications
