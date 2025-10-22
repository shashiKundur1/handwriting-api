# Handwriting Digitizer API 📝

A robust backend API service that extracts handwritten text from images using OCR (Optical Character Recognition) and translates it to different languages. Built with Node.js, TypeScript, and powered by Google Cloud Vision and Translation APIs.

## 🌟 Features

- **Image Upload Support**: Accept images via URL or direct file upload
- **OCR Processing**: Extract handwritten text using Google Cloud Vision API
- **Multi-language Translation**: Translate recognized text to target languages using Google Cloud Translation API
- **Asynchronous Processing**: Queue-based architecture using BullMQ and Redis for scalable job processing
- **Real-time Progress Tracking**: Monitor digitization job status and progress
- **Cloud Storage**: Automatic image upload to Cloudinary
- **Type-Safe**: Fully written in TypeScript with strict type checking
- **Production Ready**: Includes error handling, logging, security middleware, and health checks
- **Test Coverage**: Jest test configuration included

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🛠 Tech Stack

### Core Technologies

- **Node.js** - Runtime environment
- **TypeScript** - Type-safe JavaScript
- **Express.js** - Web framework
- **MongoDB** - Database for storing digitization jobs
- **Redis** - Message broker for job queues
- **BullMQ** - Job queue management

### Cloud Services

- **Google Cloud Vision API** - OCR and text recognition
- **Google Cloud Translation API** - Multi-language translation
- **Cloudinary** - Image storage and CDN

### Key Libraries

- **Mongoose** - MongoDB ODM
- **IORedis** - Redis client
- **Multer** - File upload handling
- **Helmet** - Security headers
- **Zod** - Environment validation
- **Morgan** - HTTP request logging
- **Jest** - Testing framework

## 🏗 Architecture

The application follows a **queue-based microservice architecture** for scalable image processing:

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ↓
┌─────────────────────────────────────┐
│        Express API Server           │
│  ┌─────────────────────────────┐   │
│  │   Upload Image (URL/File)   │   │
│  └──────────┬──────────────────┘   │
│             │                       │
│             ↓                       │
│  ┌─────────────────────────────┐   │
│  │  Store in Cloudinary        │   │
│  └──────────┬──────────────────┘   │
│             │                       │
│             ↓                       │
│  ┌─────────────────────────────┐   │
│  │ Create DB Record (Pending)  │   │
│  └──────────┬──────────────────┘   │
│             │                       │
│             ↓                       │
│  ┌─────────────────────────────┐   │
│  │  Add Job to Redis Queue     │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
              │
              ↓
┌─────────────────────────────────────┐
│      BullMQ Worker Process          │
│  ┌─────────────────────────────┐   │
│  │  1. OCR (Vision API)        │   │
│  │  2. Translation (Trans API) │   │
│  │  3. Update DB Record        │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
              │
              ↓
         ┌─────────┐
         │ MongoDB │
         └─────────┘
```

### Workflow

1. **Client Request**: User submits an image (via URL or file upload)
2. **Image Storage**: Image is uploaded to Cloudinary
3. **Job Creation**: Digitization record created in MongoDB with "pending" status
4. **Queue Job**: Job added to Redis queue via BullMQ
5. **Worker Processing**:
   - Worker picks up the job
   - Updates status to "processing"
   - Performs OCR using Google Cloud Vision API
   - Translates text using Google Translation API
   - Updates status to "completed" with results
6. **Result Retrieval**: Client can query job status and results by ID

## ✅ Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 16.x
- **npm** or **yarn** or **pnpm**
- **MongoDB** >= 5.x (local or cloud instance)
- **Redis** >= 6.x
- **Google Cloud Platform Account** with:
  - Vision API enabled
  - Translation API enabled
  - Service account credentials
- **Cloudinary Account**

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd api
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up Google Cloud credentials**
   - Download your service account JSON key from Google Cloud Console
   - Place it in the project root (e.g., `handwriting-digitizer-v2-98c01506bdae.json`)
   - Ensure the file path matches the `GOOGLE_APPLICATION_CREDENTIALS` environment variable

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Application
NODE_ENV=development
PORT=3000

# Database
MONGO_URI=mongodb://localhost:27017/handwriting-digitizer

# Security
JWT_SECRET=your-super-secret-jwt-key-min-10-chars

# CORS
CLIENT_ORIGIN=http://localhost:5173

# Google Cloud
GOOGLE_APPLICATION_CREDENTIALS=./handwriting-digitizer-v2-98c01506bdae.json
GOOGLE_CLOUD_PROJECT=your-gcp-project-id

# Cloudinary
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# Redis
REDIS_URL=redis://localhost:6379
```

### Environment Variable Details

| Variable                         | Description                       | Required           | Example                             |
| -------------------------------- | --------------------------------- | ------------------ | ----------------------------------- |
| `NODE_ENV`                       | Application environment           | Yes                | `development`, `production`, `test` |
| `PORT`                           | Server port number                | No (default: 3000) | `3000`                              |
| `MONGO_URI`                      | MongoDB connection string         | Yes                | `mongodb://localhost:27017/dbname`  |
| `JWT_SECRET`                     | Secret key for JWT (min 10 chars) | Yes                | `mySecretKey123`                    |
| `CLIENT_ORIGIN`                  | Allowed CORS origin               | No (default: \*)   | `http://localhost:5173`             |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to GCP service account JSON  | Yes                | `./credentials.json`                |
| `GOOGLE_CLOUD_PROJECT`           | Google Cloud project ID           | Yes                | `my-project-123456`                 |
| `CLOUDINARY_URL`                 | Cloudinary connection URL         | Yes                | `cloudinary://key:secret@cloud`     |
| `REDIS_URL`                      | Redis connection URL              | Yes                | `redis://localhost:6379`            |

## 🚀 Running the Application

### Development Mode

```bash
npm run dev
```

This will start the server with hot-reloading using `nodemon`.

### Production Mode

1. **Build the TypeScript code**

   ```bash
   npm run build
   ```

2. **Start the server**
   ```bash
   npm start
   ```

### Running Tests

```bash
npm test
```

### Health Check

Once the server is running, verify it's working:

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{
  "status": "ok",
  "message": "Server is running",
  "environment": "development",
  "timestamp": "2025-10-22T10:30:00.000Z"
}
```

## 📚 API Documentation

### Base URL

```
http://localhost:3000/api/v1
```

### Endpoints

#### 1. Digitize Image by URL

Upload an image via URL for OCR and translation processing.

**Endpoint:** `POST /api/v1/digitize/url`

**Request Body:**

```json
{
  "imageUrl": "https://example.com/handwritten-image.jpg",
  "targetLanguage": "es"
}
```

**Response (202 Accepted):**

```json
{
  "success": true,
  "message": "Digitization job queued successfully.",
  "data": {
    "digitizationId": "507f1f77bcf86cd799439011"
  }
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:3000/api/v1/digitize/url \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/image.jpg",
    "targetLanguage": "es"
  }'
```

---

#### 2. Digitize Image by Direct Upload

Upload an image file directly for OCR and translation processing.

**Endpoint:** `POST /api/v1/digitize/upload`

**Request (multipart/form-data):**

- `image`: Image file (required)
- `targetLanguage`: Target language code (required)

**Response (202 Accepted):**

```json
{
  "success": true,
  "message": "Digitization job queued successfully.",
  "data": {
    "digitizationId": "507f1f77bcf86cd799439011"
  }
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:3000/api/v1/digitize/upload \
  -F "image=@/path/to/image.jpg" \
  -F "targetLanguage=es"
```

---

#### 3. Get Digitization Result

Retrieve the status and results of a digitization job.

**Endpoint:** `GET /api/v1/digitize/result/:digitizationId`

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Digitization job fetched successfully.",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "status": "completed",
    "imageUrl": "https://res.cloudinary.com/...",
    "originalLanguage": null,
    "recognizedText": "Hello World",
    "translatedText": "Hola Mundo",
    "targetLanguage": "es",
    "createdAt": "2025-10-22T10:00:00.000Z",
    "updatedAt": "2025-10-22T10:00:15.000Z"
  }
}
```

**Job Status Values:**

- `pending` - Job is queued but not yet started
- `processing` - Job is currently being processed
- `completed` - Job completed successfully
- `failed` - Job failed (check logs for details)

**cURL Example:**

```bash
curl http://localhost:3000/api/v1/digitize/result/507f1f77bcf86cd799439011
```

---

#### 4. Health Check

Check if the server is running.

**Endpoint:** `GET /health`

**Response (200 OK):**

```json
{
  "status": "ok",
  "message": "Server is running",
  "environment": "development",
  "timestamp": "2025-10-22T10:30:00.000Z"
}
```

---

### Supported Languages

The Translation API supports [110+ languages](https://cloud.google.com/translate/docs/languages). Common language codes:

| Language             | Code    |
| -------------------- | ------- |
| English              | `en`    |
| Spanish              | `es`    |
| French               | `fr`    |
| German               | `de`    |
| Hindi                | `hi`    |
| Kannada              | `kn`    |
| Chinese (Simplified) | `zh-CN` |
| Japanese             | `ja`    |
| Arabic               | `ar`    |

### Error Responses

**400 Bad Request:**

```json
{
  "success": false,
  "message": "No image file uploaded.",
  "error": null
}
```

**404 Not Found:**

```json
{
  "success": false,
  "message": "Digitization job not found.",
  "error": null
}
```

**500 Internal Server Error:**

```json
{
  "success": false,
  "message": "An error occurred",
  "error": {
    "name": "Error",
    "message": "Detailed error message"
  }
}
```

## 📁 Project Structure

```
api/
├── src/
│   ├── app.ts                      # Express app configuration
│   ├── server.ts                   # Server entry point
│   ├── config/
│   │   ├── database.ts             # MongoDB connection
│   │   └── env.ts                  # Environment validation (Zod)
│   ├── features/
│   │   └── digitizer/
│   │       ├── digitization.model.ts    # Mongoose schema
│   │       ├── ocr.service.ts           # Google Vision API integration
│   │       ├── storage.service.ts       # Cloudinary upload service
│   │       ├── translation.service.ts   # Google Translation API
│   │       ├── routes/
│   │       │   └── digitize.routes.ts   # API routes
│   │       └── __tests__/
│   │           └── ocr.service.test.ts  # Unit tests
│   ├── middleware/
│   │   └── errorHandler.ts         # Global error handling
│   ├── queues/
│   │   └── digitizationQueue.ts    # BullMQ queue setup
│   ├── routes/
│   │   └── index.ts                # Main router
│   ├── utils/
│   │   ├── apiResponse.ts          # Standardized API responses
│   │   ├── asyncHandler.ts         # Async error wrapper
│   │   └── download.util.ts        # URL download utility
│   └── workers/
│       └── digitizationWorker.ts   # BullMQ worker process
├── test-assets/                    # Sample test images
├── .env                            # Environment variables (not in repo)
├── jest.config.js                  # Jest configuration
├── nodemon.json                    # Nodemon configuration
├── package.json                    # Dependencies and scripts
├── tsconfig.json                   # TypeScript configuration
└── README.md                       # This file
```

### Key Components

#### Models

- **`digitization.model.ts`**: MongoDB schema for storing digitization job records with status tracking

#### Services

- **`ocr.service.ts`**: Google Cloud Vision API integration for text recognition
- **`translation.service.ts`**: Google Cloud Translation API integration
- **`storage.service.ts`**: Cloudinary image upload and management

#### Queue System

- **`digitizationQueue.ts`**: BullMQ queue configuration with retry logic
- **`digitizationWorker.ts`**: Background worker that processes OCR and translation jobs

#### Middleware

- **`errorHandler.ts`**: Global error handling middleware
- **`asyncHandler.ts`**: Async/await error wrapper utility

#### Utils

- **`apiResponse.ts`**: Standardized API response formatting
- **`download.util.ts`**: Helper for downloading images from URLs

## 🧪 Testing

The project uses Jest for testing.

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm test -- --watch
```

### Run Tests with Coverage

```bash
npm test -- --coverage
```

### Test Files

Tests are located in `__tests__` directories alongside the code they test:

- `src/features/digitizer/__tests__/ocr.service.test.ts`

## 🔒 Security Features

- **Helmet**: Security headers for Express apps
- **CORS**: Configurable cross-origin resource sharing
- **Environment Validation**: Strict validation using Zod
- **Error Handling**: Global error handler prevents information leakage
- **Type Safety**: Full TypeScript implementation

## 🚢 Deployment

### Docker Deployment (Recommended)

1. **Create a Dockerfile**:

   ```dockerfile
   FROM node:18-alpine

   WORKDIR /app

   COPY package*.json ./
   RUN npm ci --only=production

   COPY . .
   RUN npm run build

   EXPOSE 3000

   CMD ["npm", "start"]
   ```

2. **Build and run**:
   ```bash
   docker build -t handwriting-api .
   docker run -p 3000:3000 --env-file .env handwriting-api
   ```

### Cloud Deployment Options

- **Google Cloud Run**: Serverless container deployment
- **AWS ECS/Fargate**: Container orchestration
- **Heroku**: Platform as a service
- **DigitalOcean App Platform**: Simple container deployment
- **Render**: Modern cloud platform

### Environment Setup for Production

1. Set `NODE_ENV=production`
2. Use production MongoDB cluster (MongoDB Atlas recommended)
3. Use production Redis instance (Redis Cloud or AWS ElastiCache)
4. Configure proper CORS origin
5. Use strong JWT secret
6. Enable Google Cloud API quotas and billing
7. Configure Cloudinary production account

### Monitoring Recommendations

- **Application Monitoring**: New Relic, Datadog, or Application Insights
- **Error Tracking**: Sentry or Rollbar
- **Logging**: Winston with cloud logging (CloudWatch, Stackdriver)
- **Queue Monitoring**: BullMQ UI or custom dashboard

## 🔧 Configuration

### Redis Queue Configuration

Jobs are configured with the following defaults in `digitizationQueue.ts`:

- **Attempts**: 3 retries on failure
- **Backoff**: Exponential backoff starting at 2 seconds
- **Retention**: Completed jobs kept for 24 hours, failed jobs for 7 days
- **Concurrency**: 1 (can be increased based on resources)

### Worker Configuration

The digitization worker processes jobs with these steps:

1. Update job progress to 5% (mark as processing)
2. Progress to 25% (OCR complete)
3. Progress to 75% (translation complete)
4. Progress to 95% (database update)
5. Progress to 100% (job complete)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards

- Use TypeScript strict mode
- Follow ESLint configuration (if added)
- Write unit tests for new features
- Update documentation as needed
- Use conventional commit messages

## 📝 License

This project is licensed under the ISC License.

## 👥 Authors

- **Shashidhar Kundur** - [shashiKundur1](https://github.com/shashiKundur1)

## 🙏 Acknowledgments

- Google Cloud Platform for Vision and Translation APIs
- Cloudinary for image storage
- BullMQ for robust queue management
- The open-source community

## 📞 Support

For issues, questions, or contributions, please open an issue on the GitHub repository.

---

**Happy Coding! 🎉**
