# Spendly - Smart Expense Tracker with AI Insights

A full-stack expense tracking application that leverages **Gemini AI** to provide intelligent insights into spending patterns. Track your expenses, visualize spending trends, and get AI-powered recommendations to optimize your budget.


## 🌐 Live Demo

- **Frontend**: [https://expense-tracker-client-diproyf87-1026s-projects.vercel.app/](https://expense-tracker-client-diproyf87-1026s-projects.vercel.app?_vercel_share=JNougBR8cPt4ulsEmjrvK57bxcAXdP5Q)
- **Backend API**: [https://expense-tracker-server-production-c801.up.railway.app/health](https://expense-tracker-server-production-c801.up.railway.app/health)

## Screenshots

![dashboard](.github/assets/dashboard.png)

![add-expense](.github/assets/image-3.png)

![transaction](.github/assets/image-1.png)

![Ai-insights](.github/assets/image-2.png)

## 🚀 Features

### Core Features
- ✅ **Expense Management**: Create, read, update, and delete expenses with real-time synchronization
- ✅ **Category Organization**: Organize expenses by customizable categories
- ✅ **Pagination**: Efficiently handle large datasets with limit/offset pagination
- ✅ **Dashboard Analytics**: 
  - Monthly expense summary (total, average, highest)
  - Category-wise spending distribution
  - Yearly spending trends across 12 months
  - Transaction history with filtering

### AI-Powered Insights 🤖
- ✅ **Spending Trend Analysis**: Compare current vs. previous month spending with percentage change
- ✅ **Top Category Detection**: Automatically identify your highest-spending category
- ✅ **Unusual Expense Detection**: Statistical outlier detection using IQR method
- ✅ **AI Monthly Summary**: Gemini AI generates personalized insights and actionable recommendations
- ✅ **Beautiful Modal UI**: Gorgeous loading animations while insights are being generated

### Authentication & Security
- ✅ **JWT Authentication**: Secure token-based authentication with refresh tokens
- ✅ **Password Hashing**: bcryptjs for secure password storage
- ✅ **Protected Routes**: Role-based access control for API endpoints and frontend navigation
- ✅ **Token Refresh**: Automatic token refresh mechanism for seamless user experience

## 📋 Tech Stack

### Frontend
- **React 19** - Modern UI library with hooks
- **TypeScript** - Type-safe JavaScript
- **Vite** - Lightning-fast build tool
- **Tailwind CSS + DaisyUI** - Utility-first styling
- **Recharts** - Beautiful data visualization charts
- **React Router v7** - Client-side routing
- **Axios** - HTTP client with interceptors
- **Lucide React** - Icon library
- **React Toastify** - Toast notifications

### Backend
- **Node.js + Express 5** - RESTful API server
- **TypeScript** - Type-safe backend development
- **Prisma ORM** - Database access layer with migrations
- **PostgreSQL** - Relational database
- **Google Generative AI (Gemini)** - AI insights generation
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Zod** - Schema validation
- **CORS** - Cross-origin resource sharing
- **ts-node-dev** - Development server with hot reload

## 📁 Project Structure
<details>
  <summary><b>View Project Structure</b></summary>

```
expense-tracker/
├── client/                          # React Frontend
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.ts            # Axios instance with interceptors
│   │   ├── components/
│   │   │   ├── Dashboard.tsx       # Main dashboard layout
│   │   │   ├── StatCard.tsx        # Summary statistics cards
│   │   │   ├── MonthlySpending.tsx # Yearly spending chart
│   │   │   ├── CategoryDistribution.tsx # Pie chart
│   │   │   ├── TransactionList.tsx # Expense table with pagination
│   │   │   ├── AddExpenseModal.tsx # Create/edit expense modal
│   │   │   ├── AIInsightsModal.tsx # AI insights modal
│   │   │   └── Navbar.tsx          # Navigation bar
│   │   ├── context/
│   │   │   └── AuthProvider.tsx    # Global auth state
│   │   ├── hooks/
│   │   │   └── useAuth.ts          # Custom auth hook
│   │   ├── routes/
│   │   │   └── Router.tsx          # Route definitions
│   │   └── App.tsx
│   └── package.json
│
└── server/                          # Node.js Backend
    ├── src/
    │   ├── controller/
    │   │   ├── expense.controller.ts     # Expense CRUD + analytics
    │   │   ├── ai.controller.ts          # AI insights generation
    │   │   ├── auth.controller.ts        # Authentication logic
    │   │   ├── category.controller.ts    # Category management
    │   │   └── user.controller.ts        # User profile
    │   ├── middleware/
    │   │   ├── auth.middleware.ts        # JWT verification
    │   │   ├── validation.middleware.ts  # Request validation
    │   │   └── api-error.middleware.ts   # Error handling
    │   ├── router/
    │   │   ├── expense.routes.ts
    │   │   ├── auth.routes.ts
    │   │   ├── category.routes.ts
    │   │   └── user.routes.ts
    │   ├── utils/
    │   │   └── validation.schemas.ts     # Zod validation schemas
    │   ├── prisma.ts                     # Prisma client instance
    │   └── index.ts                      # Express app setup
    ├── prisma/
    │   └── schema.prisma                 # Database schema
    ├── .env                              # Environment variables
    └── package.json
```

</details>

## 🗄️ Database Schema
<details>
  <summary><b>View Database Schema</b></summary>

```typescript
model User {
    id              Int
    email           String         @unique
    name            String?
    password        String
    refreshTokens   String[]
    expenses        Expense[]
    createdAt       DateTime       @default(now())
    updatedAt       DateTime
    }

    model Category {
    id              Int
    name            String
    expenses        Expense[]
    }

    model Expense {
    id              Int
    amount          Float
    description     String?
    categoryId      Int
    userId          Int
    createdAt       DateTime       @default(now())
    category        Category       @relation(fields: [categoryId])
    user            User           @relation(fields: [userId])
}
```

</details>

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)
- npm or yarn

### Backend Setup

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables** (`.env`):
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/expense_tracker
   JWT_SECRET=your_jwt_secret_key_here
   JWT_REFRESH_SECRET=your_refresh_token_secret_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Setup database:**
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

   Server runs on `http://localhost:3000`

### Frontend Setup

1. **Navigate to client directory:**
   ```bash
   cd client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure API endpoint** (`.env` or update `api/axios.ts`):
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

   App runs on `http://localhost:5173`


## 🔐 Authentication Flow

1. **Register**: User creates account with email and password
2. **Login**: Credentials validated, JWT token issued
3. **Token Storage**: Access token stored in memory, refresh token in secure storage
4. **Protected Routes**: Authorization header checked on every API request
5. **Token Refresh**: Automatic refresh using refresh token when access token expires

## 🧮 AI Insights Algorithm

**Spending Trend Analysis:**
- Compares current month total vs. previous month
- Calculates percentage change
- Categorizes as increase/decrease/stable (±5% threshold)

**Unusual Expense Detection:**
- Uses Interquartile Range (IQR) method
- Identifies outliers beyond 75th percentile + 1.5×IQR
- Highlights unusual transactions for user awareness

**AI Summary Generation:**
- Aggregates all metrics and expense data
- Sends contextualized prompt to gemini-3-flash-preview
- Generates personalized insights and budget recommendations

## 📈 Performance Optimizations

- **Pagination**: Limit/offset pagination for large datasets
- **Query Optimization**: Selective field inclusion in Prisma queries
- **Caching**: React query patterns for data freshness
- **Lazy Loading**: Components load on demand

## 🛡️ Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Refresh Token Rotation**: Long-lived refresh tokens
- **CORS Protection**: Configured origin restrictions
- **Input Validation**: Zod schema validation on all inputs
- **Error Handling**: Generic error messages to prevent information leakage

## 📞 Troubleshooting

### Gemini API Error
- Ensure `GEMINI_API_KEY` is set correctly in `.env`
- Use model name `gemini-3-flash-preview`
- Check API quota on Google Cloud Console

### Database Connection Issues
- Verify PostgreSQL is running
- Check `DATABASE_URL` format
- Run migrations: `npx prisma migrate dev`

### Authentication Errors
- Clear browser localStorage
- Check JWT secrets match between login and verification
- Verify token expiration times

## 📄 License

MIT License - Feel free to use this project for learning and personal purposes.

---

**Built with ❤️ using React, Node.js, and Gemini AI**
