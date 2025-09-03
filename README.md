# NatiApp

Una aplicación móvil desarrollada con React Native que incluye un backend construido con Node.js, Express y MongoDB.

## Features

- ✅ **Cross-platform**: Works on iOS, and Android
- ✅ **Modern UI**: Clean and responsive design
- ✅ **User Authentication**: Registration and login functionality
- ✅ **Admin Dashboard**: User management interface
- ✅ **Backend API**: Node.js, Express, and MongoDB
- ✅ **TypeScript**: Type-safe development
- ✅ **JWT Authentication**: Secure API access

## Getting Started

### Prerequisites
- Node.js (18 or higher)
- npm or yarn
- MongoDB (local or cloud instance)

### Backend Setup

1. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables**
   
   Make sure the `.env` file in the `backend` folder contains:
   ```
   MONGODB_URI=mongodb://localhost:27017/natiapp
   JWT_SECRET=your-super-secret-jwt-key
   PORT=5000
   NODE_ENV=development
   ```

3. **Start the backend server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Install frontend dependencies**
   ```bash
   # From project root
   npm install
   ```

2. **Install AsyncStorage (required for token storage)**
   ```bash
   # On Windows PowerShell
   sh install_async_storage.sh
   ```

3. **Start the React Native development server**
   ```bash
   npm start
   ```

4. **Run on specific platforms**
   ```bash   
   # iOS Simulator (requires Xcode)
   npm run ios
   
   # Android Emulator (requires Android Studio)
   npm run android
   ```

## Project Structure

```
src/
├── components/          # React Native components
├── services/           # Business logic and API services
├── styles/             # Styling files
└── assets/             # Images and static files

backend/
├── src/
│   ├── config/         # Database and server configuration
│   ├── controllers/    # API endpoint controllers
│   ├── middleware/     # Express middleware
│   ├── models/         # Mongoose database models
│   └── routes/         # API route definitions
└── index.js            # Server entry point
```

## API Endpoints

### Authentication

- **Register a user**: `POST /api/auth/register`
  ```json
  {
    "name": "User Name",
    "phoneNumber": "+573123456789",
    "password": "password123"
  }
  ```

- **User login**: `POST /api/auth/login`
  ```json
  {
    "phoneNumber": "+573123456789",
    "password": "password123"
  }
  ```

- **Admin login**: `POST /api/auth/admin-login`
  ```json
  {
    "email": "admin@example.com",
    "password": "adminpass"
  }
  ```

### User Management (Admin only)

- **Get all users**: `GET /api/users`
- **Toggle user status**: `PUT /api/users/:id/status`

## Scripts

### Frontend
- `npm start` - Start Metro bundler
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm run lint` - Run ESLint

### Backend
- `npm run dev` - Start backend server with Nodemon (auto-reload)
- `npm start` - Start backend server

## Development Notes

- To use the actual backend API instead of the mock data, set `isDevelopment` to `false` in the `src/services/UserManagementService.ts` file.
- The backend requires MongoDB to be running locally or a valid MongoDB connection string in the `.env` file.
- Admin users must be created manually in the database or by modifying a user's role to 'admin'.

## License

This project is licensed under the MIT License.
