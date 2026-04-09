# Smart Task Management System

A full-stack MERN application for efficient task management with user authentication, CRUD operations, filtering, and responsive design.

## Features

- User registration and login with JWT authentication
- Create, read, update, and delete tasks
- Task filtering by status and priority
- Dashboard with statistics and visualizations
- Calendar view for deadline management
- Responsive design for mobile and desktop
- Modern UI with Tailwind CSS

## Tech Stack

### Frontend
- React.js with TypeScript
- React Router DOM for navigation
- Tailwind CSS for styling
- Lucide React for icons
- Axios for API requests

### Backend
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- bcryptjs for password hashing
- express-validator for input validation

## Project Structure

```
smart-task-management/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── context/           # React contexts (Auth)
│   │   ├── pages/             # Page components
│   │   └── services/          # API services
│   └── package.json
├── server/                    # Node.js backend
│   ├── config/                # Configuration files
│   ├── controllers/           # Route controllers
│   ├── middleware/            # Custom middleware
│   ├── models/                # Mongoose models
│   └── routes/                # API routes
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your MongoDB URI and JWT secret:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart_task_management
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

5. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your API URL:
```env
VITE_API_URL=http://localhost:5000/api
```

5. Start the development server:
```bash
npm run dev
```

6. Open http://localhost:5173 in your browser

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)

### Tasks
- `GET /api/tasks` - Get all user tasks (with optional filters)
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/stats/dashboard` - Get dashboard statistics

## Environment Variables

### Server (.env)
| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/smart_task_management |
| JWT_SECRET | Secret key for JWT signing | - |
| JWT_EXPIRE | JWT token expiration | 7d |
| NODE_ENV | Environment mode | development |

### Client (.env)
| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | http://localhost:5000/api |

## Available Scripts

### Server
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

### Client
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Database Schema

### User Model
- name: String (required)
- email: String (required, unique)
- password: String (required, hashed)
- timestamps: createdAt, updatedAt

### Task Model
- title: String (required)
- description: String
- deadline: Date (required)
- priority: Enum ['low', 'medium', 'high']
- status: Enum ['pending', 'in-progress', 'completed']
- user: ObjectId (reference to User)
- completedAt: Date
- timestamps: createdAt, updatedAt

## Security Features

- Password hashing with bcryptjs
- JWT-based authentication
- Protected API routes with middleware
- Input validation with express-validator
- CORS enabled for cross-origin requests
- Secure HTTP headers

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is for educational purposes.

## Author

Final Year Project - Smart Task Management System
