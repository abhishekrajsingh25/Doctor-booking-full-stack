# 🏥 Doctor Appointment Booking System with Admin and Doctor Panel

This is a full-stack Doctor Appointment Booking web application designed to streamline the process of scheduling appointments between patients and doctors. The system includes separate interfaces for **Patients**, **Doctors**, and an **Admin Panel** to manage users, appointments, and schedules.
---

## ✨ Features

### Patient Features:
- Patient registration and login
- Browse and search doctors by specialization
- Book or cancel appointments
- View appointment history and upcoming schedules
- Responsive and user-friendly interface

### Doctor Panel Features:
- Doctor login and profile management
- Dashboard with overall statistics
- Manage availability and schedule time slots
- View and manage booked appointments

### Admin Panel Features:
- Admin login
- Add new doctor 
- Dashboard with overall statistics
- Manage appointments (View, Update, Cancel)

## Tech Stack

### Frontend:

- React.js (with React Router)
- Tailwind CSS for UI styling
- Axios for API requests

### Backend:

- Node.js with Express.js
- MongoDB with Mongoose (for database management)
- JWT Authentication
- Multer for image uploads
- Razorpay integration for payments

### Additional Tools:

- Cloudinary (for image storage)
- dotenv (for environment variables management)
- Bcrypt (for password hashing)
- Cors (for handling cross-origin requests)

## Setup Instructions

### Prerequisites:

- Node.js and npm installed
- MongoDB installed or a cloud MongoDB database (MongoDB Atlas)

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/abhishekrajsingh25/Prescripto-Doctor.git
   cd Prescripto-Doctor
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```
   
4. **Install Admin Panel Dependencies**
   ```bash
   cd ../admin
   npm install
   ```
   
5. **Environment Variables Setup**
   Create a .env file in the root directory of the backend with the following:
   ```bash
   MONGODB_URI = your_mongo_database_uri
   JWT_SECRET = your_jwt_secret_key
   CLOUDINARY_NAME=  your_cloudinary_cloud_name
   CLOUDINARY_API_KEY = your_cloudinary_api_key
   CLOUDINARY_SECRET_KEY = your_cloudinary_api_secret
   ADMIN_EMAIL = admin_email_id
   ADMIN_PASSWORD = admin_password
   RAZORPAY_KEY_SECRET = your_razorpay_secret_key
   RAZORPAY_KEY_ID = your_razorpay_key_id
   CURRENCY = your_currency
   ```

6. **Environment Variables Setup**
   Create a .env file in the root directory of the frontend with the following:
   ```bash
   VITE_BACKEND_URL = "http://localhost:4000"
   VITE_RAZORPAY_KEY_ID = your_razorpay_key_id
   ```
   
7. **Environment Variables Setup**
   Create a .env file in the root directory of the admin panel with the following:
   ```bash
   VITE_BACKEND_URL = "http://localhost:4000"
   ```
   
### Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   The backend server should now be running on `http://localhost:4000`.

2. **Start the Frontend**
   ```bash
   cd ../frontend
   npm run dev
   ```
   The frontend should now be running on `http://localhost:5173`.

3. **Start the Admin Panel**
   ```bash
   cd ../admin
   npm run dev
   ```
   The admin panel should now be running on `http://localhost:5174`.

## Deployment

- The frontend can be deployed using Vercel.
- The backend can be deployed using Vercel.
- The admin can be deployed using Vercel.
- MongoDB can be hosted on MongoDB Atlas.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Submit a pull request.

---

Feel free to contribute, suggest features, or open issues.

---

Thank you for visiting. I hope you find my work interesting and valuable! To see the Website. 
- For Frontend, Click <a href="https://prescripto-doctor-abhishek.vercel.app/" >Here</a>.
- For Admin, Click <a href="https://prescripto-doctor-admin-abhishek.vercel.app/" >Here</a>.
