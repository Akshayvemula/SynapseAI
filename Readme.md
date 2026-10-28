🚀 Synapse AI — AI-Powered SaaS Platform

Synapse AI is a full-stack AI-powered SaaS application that brings intelligent content creation and image-editing tools into one platform. It enables users to generate articles, create blog titles, generate images, remove image backgrounds and unwanted objects, review resumes, and share creations with a community.

✨ Features

* AI Article Writer: Generate articles using AI from user-provided prompts.
* Blog Title Generator: Create engaging blog title ideas for different topics.
* AI Image Generator: Generate images from text descriptions.
* Background Remover: Remove backgrounds from uploaded images.
* Object Remover: Remove unwanted objects from images.
* AI Resume Reviewer: Analyze resumes and receive AI-assisted feedback.
* Authentication: Secure user authentication using Clerk.
* Creation History: Save and access previously generated content.
* Community Platform: Explore published creations and interact with other users’ work.
* Premium Features: Support usage limits and premium feature restrictions.

🛠️ Tech Stack

Frontend

* React.js
* Vite
* React Router
* Tailwind CSS
* Clerk Authentication
* Axios
* React Markdown
* Lucide React

Backend

* Node.js
* Express.js
* Clerk Express
* REST APIs

Database and Cloud Services

* Neon Serverless PostgreSQL
* Cloudinary
* Google Gemini API
* Clipdrop API

🏗️ Architecture

Synapse AI follows a client-server architecture.

                 ┌─────────────────────┐
                 │      Frontend       │
                 │     React + Vite    │
                 └──────────┬──────────┘
                            │
                            │ REST API Requests
                            ▼
                 ┌─────────────────────┐
                 │       Backend       │
                 │   Node.js + Express │
                 └──────────┬──────────┘
                            │
             ┌──────────────┼──────────────┐
             ▼              ▼              ▼
      ┌────────────┐ ┌────────────┐ ┌────────────┐
      │ PostgreSQL │ │ Gemini API │ │ Clipdrop   │
      │  Database  │ │ AI Services│ │ Image API  │
      └────────────┘ └────────────┘ └────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │  Cloudinary  │
                    │ Image Storage│
                    └──────────────┘

📂 Project Structure

SynapseAI-main/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── server/
    ├── configs/
    ├── controllers/
    ├── middlewares/
    ├── routes/
    ├── server.js
    └── package.json

⚙️ Getting Started

Follow these steps to run the project locally.

Prerequisites

Make sure you have installed:

* Node.js
* npm
* Git
* A Clerk account
* A Neon PostgreSQL database
* Google Gemini API credentials
* Clipdrop API credentials
* Cloudinary account credentials

1. Clone the Repository

git clone <your-repository-url>
cd SynapseAI-main

Replace <your-repository-url> with your actual GitHub repository URL.

2. Install Frontend Dependencies

cd client
npm install

3. Configure Frontend Environment Variables

Create a .env file inside the client directory.

VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

Replace the placeholder with your Clerk publishable key.

4. Install Backend Dependencies

Open a new terminal and navigate to the server directory.

cd server
npm install

5. Configure Backend Environment Variables

Create a .env file inside the server directory.

PORT=3000
DATABASE_URL=your_neon_database_url
GEMINI_API_KEY=your_gemini_api_key
CLIPDROP_API_KEY=your_clipdrop_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

Replace the placeholders with your actual credentials. Check the backend configuration files for the exact environment variable names required by your implementation.

Important: Never upload your .env files or secret API keys to GitHub.

6. Start the Backend

From the server directory, run:

npm run server

The backend should start on the configured port, typically 3000.

7. Start the Frontend

Open another terminal:

cd client
npm run dev

Open the local URL displayed by Vite in your browser.

Your frontend and backend must both be running for the application to work correctly.

🔐 Authentication and Security

Synapse AI uses Clerk for user authentication.

Security considerations include:

* Authentication for protected API routes.
* Server-side validation of user requests.
* Environment variables for sensitive credentials.
* Backend enforcement of applicable usage limits and premium restrictions.
* Secure configuration of database connections and API credentials.

🤖 AI Capabilities

Content Generation

Generate articles and blog title ideas using AI models.

Image Generation

Create images from text prompts using the integrated image-generation service.

Image Editing

Remove backgrounds and unwanted objects from uploaded images.

Resume Analysis

Submit a resume for AI-assisted review and feedback.

🗄️ Database

The application uses Neon Serverless PostgreSQL to store application data.

Configure the database connection using DATABASE_URL and ensure the required tables and schema are initialized before running the application.

☁️ Deployment

The frontend and backend can be deployed separately or together, depending on your hosting setup.

Before deployment:

1. Configure production environment variables.
2. Initialize the PostgreSQL database schema.
3. Set the frontend API base URL to the deployed backend.
4. Configure CORS to allow your frontend domain.
5. Configure Clerk’s production domains and redirect URLs.
6. Verify that AI APIs and Cloudinary are configured correctly.
7. Keep all secret credentials out of frontend code and public repositories.

🧪 Future Improvements

Potential enhancements include:

* Additional AI-powered productivity tools.
* Improved error handling and input validation.
* More detailed AI usage analytics.
* Enhanced user dashboards.
* Subscription and payment integration.
* Automated testing and monitoring.
* Improved mobile responsiveness.

👨‍💻 Author

Akshay Vemula

AI/ML Engineer | Full-Stack Developer

Interested in building AI-powered applications, intelligent automation tools, and scalable web solutions.

📄 License

Add a license to the repository if you intend to distribute or reuse this project publicly.
