# Bajaj Finserv Backend

This is the backend service for the Bajaj Finserv Full Stack Challenge (or SRM Full Stack Challenge). It is built with Node.js and Express.

## Tech Stack
- **Node.js & Express:** Core server framework.
- **Supabase:** Used for database and authentication.
- **Firebase Admin:** Used for additional backend services.
- **Groq SDK:** Integrated for AI/LLM functionalities.

## Project Structure
- `app.js` / `server.js`: Application entry point and setup.
- `routes/`: Express route definitions.
  - `authRoutes.js`: Authentication related endpoints.
  - `bfhlRoutes.js`: BFHL challenge specific endpoints.
  - `chatRoutes.js`: Chat / AI endpoints.
- `controllers/`: Logic for handling incoming requests.
- `middleware/`: Custom Express middlewares (e.g., authentication).
- `services/`: Business logic and external API integrations.
- `utils/`: Helper functions and utilities.
- `config/`: Configuration files (e.g., Firebase, Supabase setup).

## Getting Started

### Prerequisites
- Node.js installed

### Installation

1. Clone the repository and navigate to the backend folder:
   ```bash
   git clone https://github.com/Puneet902/Bajaj-Finserv-backend-.git
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Environment Variables:
   Create a `.env` file in the root of the backend directory and configure the required environment variables (Supabase, Firebase, Groq, etc.).

4. Run the server:
   ```bash
   # For production
   npm start

   # For development (with watch mode)
   npm run dev
   ```

## API Endpoints
The backend provides endpoints under specific route prefixes (check `app.js` for the base paths). Generally:
- `/api/auth` or `/auth` - Authentication operations
- `/api/bfhl` or `/bfhl` - Challenge-specific operations
- `/api/chat` or `/chat` - Chat functionality

## Deployment
This backend is configured to be deployed easily on platforms like Railway, Render, or Heroku. Make sure to set up the necessary environment variables in your deployment platform's dashboard.
