# RAG Backend API

A robust Retrieval-Augmented Generation (RAG) backend API built with Express.js, TypeScript, and PostgreSQL. This API enables document processing, text chunking, vector embeddings, and AI-powered question answering using Google Gemini.

## 🚀 Features

- **User Authentication** - JWT-based authentication system
- **File Upload & Processing** - Support for PDF, text files, and images (with OCR)
- **Text Extraction** - Extract text from PDFs, text files, and images using OCR
- **Text Chunking** - Intelligent text chunking for optimal embedding generation
- **Vector Embeddings** - Generate embeddings using Hugging Face models
- **Vector Search** - Semantic search using pgvector extension
- **RAG Chat** - AI-powered question answering with context retrieval
- **Cloud Storage** - File storage using Cloudinary
- **Health Monitoring** - Health check endpoint for service monitoring

## 🛠️ Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js v5
- **Database**: PostgreSQL with pgvector extension
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **File Upload**: Multer
- **Cloud Storage**: Cloudinary
- **AI/ML**:
  - Google Gemini (for chat completion)
  - Hugging Face Inference API (for embeddings)
- **PDF Processing**: pdf-parse
- **Image OCR**: Cloudinary OCR

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 15+ with pgvector extension
- npm or pnpm
- API Keys:
  - Google Gemini API Key
  - Hugging Face API Key
  - Cloudinary credentials

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rag_backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   DATABASE_URL="postgresql://user:password@localhost:5432/ragdb"
   JWT_SECRET="your-super-secret-jwt-key"
   HF_API_KEY="your-huggingface-api-key"
   GEMINI_API_KEY="your-google-gemini-api-key"
   CLOUDINARY_CLOUD="your-cloudinary-cloud-name"
   CLOUDINARY_KEY="your-cloudinary-api-key"
   CLOUDINARY_SECRET="your-cloudinary-api-secret"
   NODE_ENV="development"
   ```

4. **Set up PostgreSQL with pgvector**
   ```sql
   CREATE DATABASE ragdb;
   \c ragdb
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

5. **Run database migrations**
   ```bash
   npx prisma migrate deploy
   ```

6. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```
The server will start on `http://localhost:3000` (or the port specified in `.env`)

### Production Build
```bash
npm run build
npm start
```

## 📡 API Endpoints

### Health Check
- `GET /health` - Check API health and database connectivity

### Authentication
- `POST /auth/signup` - Register a new user
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword"
  }
  ```

- `POST /auth/login` - Login user
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword"
  }
  ```

### Files
- `POST /files/upload` - Upload a file (requires authentication)
  - Headers: `Authorization: Bearer <token>`
  - Body: `multipart/form-data` with `file` field

- `POST /files/process/:fileId` - Process uploaded file and create chunks (requires authentication)
  - Headers: `Authorization: Bearer <token>`
  - Params: `fileId` (UUID)

### Embeddings
- `POST /embed/:fileId` - Generate embeddings for file chunks (requires authentication)
  - Headers: `Authorization: Bearer <token>`
  - Params: `fileId` (UUID)

### RAG Chat
- `POST /rag/chat` - Ask questions using RAG (requires authentication)
  - Headers: `Authorization: Bearer <token>`
  - Body:
    ```json
    {
      "question": "What is the main topic of the document?"
    }
    ```

## 📁 Project Structure

```
rag_backend/
├── src/
│   ├── config/          # Configuration files (database, APIs)
│   ├── controllers/     # Request handlers
│   ├── middlewares/     # Express middlewares
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic services
│   ├── utils/           # Utility functions
│   ├── app.ts           # Express app setup
│   └── index.ts         # Entry point
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── migrations/      # Database migrations
├── scripts/
│   └── copy-prisma.js   # Build script for Prisma files
├── dist/                # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── render.yaml          # Render.com deployment config
```

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `HF_API_KEY` | Hugging Face API key | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `CLOUDINARY_CLOUD` | Cloudinary cloud name | Yes |
| `CLOUDINARY_KEY` | Cloudinary API key | Yes |
| `CLOUDINARY_SECRET` | Cloudinary API secret | Yes |
| `NODE_ENV` | Environment (development/production) | No |

## 🗄️ Database Schema

### Models
- **User** - User accounts with authentication
- **File** - Uploaded files metadata
- **Chunk** - Text chunks with vector embeddings
- **ChatMessage** - Chat conversation history

### Key Features
- Vector embeddings stored using pgvector extension
- Foreign key relationships for data integrity
- Timestamps for all models

## 🚢 Deployment

### Render.com Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick Steps:**
1. Push code to GitHub
2. Create PostgreSQL database on Render
3. Enable pgvector extension: `CREATE EXTENSION vector;`
4. Deploy web service using `render.yaml`
5. Set environment variables in Render dashboard
6. Run migrations: `npx prisma migrate deploy`

### Build Commands
- **Build**: `npm run build`
- **Start**: `npm start`

## 🧪 Development

### Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma migrate dev` - Create and apply migrations (dev)

### Code Style
- TypeScript with strict mode enabled
- ES Modules (ESM)
- Express.js best practices
- Error handling middleware

## 📝 API Response Format

### Success Response
```json
{
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "message": "Error description",
  "error": "Detailed error message"
}
```

## 🔍 Workflow

1. **Upload File** → File stored in Cloudinary, metadata in database
2. **Process File** → Extract text, chunk into smaller pieces
3. **Generate Embeddings** → Create vector embeddings for each chunk
4. **Query** → User asks question, system retrieves relevant chunks, generates answer

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

ISC License

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**
- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Check pgvector extension is installed

**Prisma Client Not Found**
- Run `npx prisma generate`
- Check `src/generated/prisma` directory exists

**Build Fails**
- Ensure all dependencies are installed: `npm install`
- Check TypeScript compilation: `npx tsc --noEmit`
- Verify Prisma schema is valid: `npx prisma validate`

**Vector Embedding Errors**
- Verify Hugging Face API key is valid
- Check API rate limits
- Ensure embedding model is accessible

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Guide](https://expressjs.com/)
- [pgvector Documentation](https://github.com/pgvector/pgvector)
- [Google Gemini API](https://ai.google.dev/docs)
- [Hugging Face Inference](https://huggingface.co/docs/api-inference)

## 👤 Author

Your Name

## 🙏 Acknowledgments

- Prisma team for excellent ORM
- Express.js community
- pgvector contributors
- Google Gemini and Hugging Face for AI capabilities

