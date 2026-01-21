# 🏥 Doctor Appointment Booking System with Admin and Doctor Panel – Microservices-Based Full Stack Application

This is a full-stack Doctor Appointment Booking System designed to streamline appointment scheduling between patients and doctors.
The project evolved from a monolithic backend into a microservices-oriented architecture, incorporating Redis caching, event-driven notification handling, and audit logging, while maintaining separate interfaces for **Patients**, **Doctors**, and **Admin**.
---

## ✨ Features

### Patient Features:
- Patient registration and login
- Browse and search doctors by specialization
- Book or cancel appointments
- View appointment history and upcoming schedules
- Secure online payments
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

## Architecture Highlights
- Modular backend designed for microservices  
- Event-driven communication between services  
- Asynchronous processing using RabbitMQ and Kafka  
- Redis caching and distributed locking for performance and consistency  
- Dedicated Notification Service for email delivery  
- Dedicated Audit Service for system event tracking
- Prometheus and Grafana used for audit service observability and alerting
- Fault-tolerant messaging using Dead Letter Queues (DLQ)  
- Designed with serverless deployment constraints in mind

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

## 🧱 Microservices

### Notification Service
- Consumes events asynchronously  
- Sends appointment and payment-related emails  
- Implements retry handling with DLQ and delayed retries  

### Audit Service
- Stores all system events for traceability  
- Uses PostgreSQL for structured audit logs  
- Designed as a write-heavy, append-only service

## 📬 Messaging & Event Streaming

### RabbitMQ (Event Queue + DLQ)
Used for **reliable event delivery**:

- Backend publishes domain events such as:
  - `APPOINTMENT_BOOKED`
  - `APPOINTMENT_CANCELLED`
  - `PAYMENT_SUCCESS`
- Notification Service consumes events asynchronously  
- Dead Letter Queue (DLQ) handles failed messages  
- Retry mechanism with delayed retries using TTL queues  
- Prevents message loss and retry storms  

### Kafka (Event Streaming)
Used for **event streaming and audit consistency**:

- Backend produces events to Kafka topics  
- Audit Service consumes Kafka events independently  
- Enables:
  - Loose coupling between services  
  - Replayable event history  
  - Scalable audit logging  
- RabbitMQ and Kafka are used together to demonstrate different messaging patterns  

---
  
## ⚡ Caching & Performance

### Redis (Upstash)
Used as a performance optimization layer:

- Cache doctor listings  
- Cache dashboards (Admin and Doctor)  
- Cache user appointments  
- Distributed locking to prevent double booking of slots  

### Cache Invalidation
Handled on:
- Appointment booking  
- Appointment cancellation  
- Profile updates  
- Payment confirmation  

The system is designed so that:
- Redis failures do not break core functionality  
- MongoDB remains the source of truth  

---

## 🔔 Notification & Audit Flow

1. User books, cancels, or pays for an appointment  
2. Backend publishes an event  
3. RabbitMQ delivers the event to Notification Service  
4. Emails are sent asynchronously  
5. Failed messages are routed to DLQ and retried with delay  
6. Kafka streams the same events to Audit Service  
7. Audit Service stores events for traceability and debugging  

This ensures:
- Non-blocking user experience  
- Reliable message processing  
- Clear separation of concerns  

---

## 📊 Monitoring & Observability

The system includes basic observability using Prometheus and Grafana to monitor the health and behavior of the Audit Service.

### Metrics Collection (Prometheus)
- The Audit Service exposes a `/metrics` endpoint using Prometheus client libraries.
- Prometheus scrapes metrics at a fixed interval.
- Metrics collected include:
  - Total audit events processed
  - Audit events per type (BOOKED, CANCELLED, PAYMENT_SUCCESS)
  - Audit insert failure count
  - Default Node.js runtime metrics (CPU, memory, event loop)

### Visualization (Grafana)
- Grafana is connected to Prometheus as a data source.
- A dashboard is created to visualize:
  - Audit events per minute
  - Total audit events processed
  - Audit insert failures
- Metrics are visualized using time-series graphs and stat panels.

### Alerting
- Grafana Alerting is used to monitor critical conditions.
- An alert rule is configured for:
  - Audit insert failures (fires when failures > 0)
- Alerts are organized under a dedicated alert folder for clarity.

### Benefits
- Real-time visibility into audit event flow
- Early detection of audit logging failures
- Clear separation between business logic and monitoring
- Lightweight setup without impacting core application performance


## Setup Instructions

### Prerequisites:

- Node.js and npm  
- MongoDB (local or Atlas)  
- Redis (Upstash recommended)  
- RabbitMQ (CloudAMQP or local)  
- Kafka (local via Docker for development)
- Prometheus (for metrics collection)
- Grafana (for dashboards and alerting)

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
  
5. **Install Notification Service Dependencies**
   ```bash
   cd ../notification-service
   npm install
   ```

6. **Install Audit Service Dependencies**
   ```bash
   cd ../audit-service
   npm install
   ```
   
7. **Environment Variables Setup**
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
   REDIS_URL=your_upstash_redis_url
   NOTIFICATION_SERVICE_URL=your_notification_service_url
   AUDIT_SERVICE_URL=your_audit_service_url
   RABBITMQ_URL=your_rabbitmq_url
   KAFKA_BROKER=localhost:9092
   ```

8. **Environment Variables Setup**
   Create a .env file in the root directory of the frontend with the following:
   ```bash
   VITE_BACKEND_URL = "http://localhost:4000"
   VITE_RAZORPAY_KEY_ID = your_razorpay_key_id
   ```
   
9. **Environment Variables Setup**
   Create a .env file in the root directory of the admin panel with the following:
   ```bash
   VITE_BACKEND_URL = "http://localhost:4000"
   ```

9. **Environment Variables Setup**
   Create a .env file in the root directory of the notification service with the following:
   ```bash
   PORT=5001
   MONGODB_URI=your_url
   BREVO_USERNAME=your_name
   BREVO_PASSWORD=your_pass
   BREVO_FROM_EMAIL=your_gmail
   RABBITMQ_URL=your_url
   ```

9. **Environment Variables Setup**
   Create a .env file in the root directory of the audit service with the following:
   ```bash
   PORT=5002
   DATABASE_URL=your_url
   KAFKA_BROKER=localhost:9092
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

4. **Start the Notification Service**
   ```bash
   cd ../notification-service
   npm run dev
   ```
   The notification-service should now be running on `http://localhost:5001`.

5. **Start the Audit Service**
   ```bash
   cd ../audit-service
   npm run dev
   ```
   The audit-service should now be running on `http://localhost:5002`.

## Deployment

- The frontend can be deployed using Vercel.
- The backend can be deployed using Vercel.
- The admin can be deployed using Vercel.
- MongoDB can be hosted on MongoDB Atlas.
- Redis can be hosted on Upstash
- RabbitMQ can be hosted on CloudAMQP
- Kafka: Local (Docker) for development
- Prometheus and Grafana are typically run as standalone services for monitoring.

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
