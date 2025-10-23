# Handwriting Digitizer API 📝

[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org) [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/) [![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com) [![License](https://img.shields.io/badge/License-ISC-green)](LICENSE)

A production-ready REST API for Optical Character Recognition (OCR) and multi-language translation, powered by Google Cloud services. Built with Node.js, TypeScript, Express, MongoDB, and Redis.

---

## ✨ Features

- **OCR Processing**: Extract text from images using Google Cloud Vision API.
- **Dynamic Language Hints**: Specify languages for the OCR engine to prioritize.
- **Optional Translation**: Translate recognized text only when needed.
- **Auto Language Detection**: Automatically detects the source language of the recognized text.
- **Asynchronous Job Queue**: Robust background job processing with BullMQ and Redis.
- **Dead-Letter Queue (DLQ)**: Failed jobs are moved to a DLQ for manual inspection and retry.
- **Comprehensive API**: Endpoints to create, list, filter, retrieve, and delete jobs.
- **Pagination**: Efficiently list jobs with paginated responses.
- **Cloud Storage**: Automatic image upload to Cloudinary.
- **Comprehensive Health Checks**: Monitors the status of the API, MongoDB, and Redis.
- **Rate Limiting**: Protects API endpoints from abuse.
- **Dockerized**: Production-ready `Dockerfile` and a `docker-compose.yml` for easy development setup.
- **Type-Safe**: 100% TypeScript with strict type checking.
- **Structured Logging**: JSON-formatted logs for easy parsing and monitoring.
- **Custom Error Handling**: Detailed, consistent, and user-friendly error responses.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Error Handling](#-error-handling)
- [Project Structure](#-project-structure)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🛠 Tech Stack

- **Core**: Node.js, TypeScript, Express.js
- **Database & Queue**: MongoDB, Redis, Mongoose, BullMQ
- **Cloud Services**: Google Cloud Vision, Google Cloud Translate, Cloudinary
- **Tooling**: Docker, Jest, Zod, Nodemon, Helmet

---

## 🏗 Architecture

The application uses a queue-based architecture. The API server handles incoming requests by creating jobs, which are then processed asynchronously by a separate worker process.

1.  **API Server**: Receives a request, validates it, uploads the image to Cloudinary, creates a job record in MongoDB, and adds a job to the Redis queue.
2.  **BullMQ Worker**: Picks up jobs from the queue. It updates the job status, performs OCR, optionally translates the text, and updates the final result in MongoDB.
3.  **DLQ**: If a job fails all its retry attempts, it is moved to a Dead-Letter Queue for manual review.

---

## ✅ Prerequisites

- **Node.js** >= 18.x
- **Docker & Docker Compose**
- **Google Cloud Platform Account** (with Vision and Translation APIs enabled)
- **Cloudinary Account**

---

## 📦 Installation

1.  **Clone the repository**

    ```bash
    git clone <repository-url>
    cd api
    ```

2.  **Install dependencies**

    ```bash
    npm install
    ```

3.  **Set up credentials**
    - Create a `.env` file from `.env.example`.
    - Place your Google Cloud service account JSON key in the project root.

---

## 🔐 Environment Variables

Create a `.env` file in the root directory. See `.env.example` for the full list of required variables.

| Variable                         | Description                              |
| -------------------------------- | ---------------------------------------- |
| `PORT`                           | Server port number (default: 3000)       |
| `MONGO_URI`                      | MongoDB connection string                |
| `REDIS_URL`                      | Redis connection URL                     |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to GCP service account JSON file    |
| `GOOGLE_CLOUD_PROJECT`           | Your Google Cloud project ID             |
| `CLOUDINARY_URL`                 | Your Cloudinary connection URL           |
| `JWT_SECRET`                     | Secret key for potential future JWT auth |
| `CLIENT_ORIGIN`                  | Allowed CORS origin for production       |

---

## 🚀 Running the Application

### Using Docker Compose (Recommended for Development)

This is the easiest way to get started, as it runs the API, MongoDB, and Redis in containers.

1.  **Start all services:**

    ```bash
    npm run docker:up -- --build
    ```

2.  **View API logs:**

    ```bash
    npm run docker:logs
    ```

3.  **Stop all services:**
    ```bash
    npm run docker:down
    ```

### Running Locally

Ensure you have local instances of MongoDB and Redis running first.

```bash
npm run dev
```

---

## 📚 API Documentation

**Base URL**: `http://localhost:3000`

### Endpoints

#### Health Check

- **`GET /health`**
  - Checks the status of the API server and its connections to MongoDB and Redis.
  - Returns `200 OK` if all services are healthy, `503 Service Unavailable` otherwise.

#### Digitization Jobs

- **`POST /api/v1/digitize/url`**

  - Creates a new digitization job from an image URL.
  - **Body**:
    ```json
    {
      "imageUrl": "string (url, required)",
      "targetLanguage": "string (optional)",
      "sourceLanguage": "string[] (optional)"
    }
    ```

- **`POST /api/v1/digitize/upload`**

  - Creates a new digitization job from a direct file upload.
  - **Request (multipart/form-data)**:
    - `image`: Image file (required, max 5MB, jpeg/png/webp).
    - `targetLanguage`: string (optional).
    - `sourceLanguage`: comma-separated string (optional).

- **`GET /api/v1/digitize/jobs`**

  - Returns a paginated list of all digitization jobs.
  - **Query Parameters**:
    - `page` (optional, number, default: 1)
    - `limit` (optional, number, default: 10, max: 100)
    - `status` (optional, string, one of: `pending`, `processing`, `completed`, `failed`)

- **`GET /api/v1/digitize/result/:digitizationId`**

  - Retrieves the status and result of a single digitization job by its ID.

- **`DELETE /api/v1/digitize/result/:digitizationId`**

  - Deletes a digitization job from the database and the queue.

---

## ❌ Error Handling

The API returns structured JSON error responses.

**Example (400 Bad Request):**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "imageUrl": ["A valid image URL is required"]
  }
}
```

**Example (404 Not Found):**

```json
{
  "success": false,
  "message": "Digitization job with ID 'invalid-id' not found"
}
```

---

## 📁 Project Structure

<details>
<summary>Click to view the project structure</summary>

```
api/
├── src/
│   ├── app.ts                      # Express app configuration
│   ├── server.ts                   # Server entry point
│   ├── config/
│   │   ├── database.ts             # MongoDB connection
│   │   ├── env.ts                  # Environment validation (Zod)
│   │   └── redis.ts                # Redis connection singleton
│   ├── features/
│   │   └── digitizer/
│   │       ├── controllers/
│   │       │   └── digitize.controller.ts # Route logic
│   │       ├── digitization.model.ts    # Mongoose schema
│   │       ├── ocr.service.ts           # Google Vision API integration
│   │       ├── storage.service.ts       # Cloudinary upload service
│   │       ├── translation.service.ts   # Google Translation API
│   │       └── routes/
│   │           └── digitize.routes.ts   # API routes
│   ├── middleware/
│   │   ├── errorHandler.ts         # Global error handling
│   │   ├── pagination.middleware.ts # Pagination logic
│   │   └── rateLimiter.ts          # API rate limiting
│   ├── queues/
│   │   ├── deadLetterQueue.ts      # DLQ for failed jobs
│   │   └── digitizationQueue.ts    # Main job queue
│   ├── routes/
│   │   └── index.ts                # Main API router
│   ├── schemas/
│   │   ├── digitizeUpload.schema.ts # Zod schema for uploads
│   │   └── digitizeUrl.schema.ts    # Zod schema for URLs
│   ├── types/
│   │   └── express/
│   │       └── index.d.ts          # Express Request type augmentation
│   ├── utils/
│   │   ├── ApiError.ts             # Custom error classes
│   │   ├── apiResponse.ts          # Standardized API responses
│   │   ├── asyncHandler.ts         # Async error wrapper
│   │   └── logger.ts               # Structured logger
│   └── workers/
│       └── digitizationWorker.ts   # BullMQ worker process
├── .env                            # Environment variables (local, not in repo)
├── .env.example                    # Example environment file
├── .dockerignore                   # Files to ignore in Docker build
├── Dockerfile                      # Production Docker image blueprint
├── docker-compose.yml              # Development environment setup
├── jest.config.js                  # Jest configuration
├── nodemon.json                    # Nodemon configuration
├── package.json                    # Dependencies and scripts
└── tsconfig.json                   # TypeScript configuration
```

</details>

---

## 🧪 Testing

The project uses Jest for unit and integration testing.

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage report
npm test -- --coverage
```

End-to-end API testing is managed via the **Postman collection** included in this repository.

---

## 🚢 Deployment

The application is designed to be deployed as a Docker container.

1.  **Build the production image:**

    ```bash
    docker build -t your-image-name:latest .
    ```

2.  **Run the container:**
    Provide all necessary environment variables to the container at runtime.

    ```bash
    docker run -p 3000:3000 \
      -e "MONGO_URI=..." \
      -e "REDIS_URL=..." \
      -v /path/to/your/credentials.json:/app/credentials.json \
      your-image-name:latest
    ```

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository and open a pull request with your changes.

## 📝 License

This project is licensed under the ISC License.
