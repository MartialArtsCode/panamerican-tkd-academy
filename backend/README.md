# Backend for Panamerican TKD Academy (React App)

This backend serves as the API layer for the Panamerican TKD Academy React application. It manages user data, schedules, and other resources.

## Features
- **API for React Frontend:** RESTful endpoints to power the React interface.
- **Authentication System:** Provides secure auth mechanisms, including integration with modern frameworks.
- **Database Interaction:** Manages persistent data such as users, students, and organizational data via a database.

## Prerequisites
1. [Node.js](https://nodejs.org) (version 14+)
2. [MongoDB](https://www.mongodb.com/) or your preferred database system.

## Installation
1. Clone this repository:
    ```bash
    git clone https://github.com/MartialArtsCode/panamerican-tkd-academy.git
    ```
2. Navigate to `/backend`:
    ```bash
    cd backend
    ```
3. Install necessary dependencies:
    ```bash
    npm install
    ```
4. Configure environment variables in a `.env` file:
    ```env
    PORT=5000
    MONGO_URI=your-mongodb-connection-string
    JWT_SECRET=your-jwt-secret
    ```

5. Run the backend server:
    ```bash
    npm run dev
    ```

6. The backend should now be running at `http://localhost:5000`.

---

### Frontend Integration
This backend works in conjunction with a React frontend, which you can set up in the `/frontend` directory of the repository. Ensure `frontend` and `backend` communicate by setting the API base URL in `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000
