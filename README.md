# SBU Backend API

A Node.js backend API for the SBU management system, featuring Redis-based queue processing using Bull queues and Bull Board for monitoring.

## Features

- **RESTful API** with Express.js
- **Queue Processing** with Bull and Redis
- **Queue Monitoring** with Bull Board dashboard
- **Database Integration** with MariaDB
- **Authentication & Authorization** with JWT token verification
- **API Documentation** with Swagger/OpenAPI
- **Comprehensive Logging** with Winston
- **Health Monitoring** with detailed system status
- **Rate Limiting** for specific queues
- **Graceful Shutdown** handling
- **CORS Support** for cross-origin requests
- **Dynamic Route Loading** for modular architecture

## Prerequisites

- Node.js (v14 or higher)
- Redis server
- MariaDB/MySQL database

## Installation

1. Clone the repository:
    ```bash
    git clone <repository-url>
    cd SBU-Backend
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Set up environment variables (create a `.env` file):

    ```plaintext
    # Server Configuration
    NODE_ENV=development
    PORT=3000
    LOG_LEVEL=info

    # CORS Configuration
    ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

    # Database Configuration
    DB_HOST=localhost
    DB_USER=your_db_user
    DB_PASS=your_db_password
    DB_NAME=your_db_name

    # Redis Configuration (choose one)
    # Option 1: Redis URL
    REDIS_URL=redis://localhost:6379

    # Option 2: Redis Host/Port
    REDIS_HOST=localhost
    REDIS_PORT=6379

    # JWT Configuration
    JWT_SECRET=your_jwt_secret_key
    ```

## Usage

1. Start the server:
    ```bash
    npm start
    ```

2. Access the API documentation at `http://localhost:3000/api-docs`.

## Testing

- Currently, there are no test scripts defined. Consider adding tests to ensure the reliability and stability of the application.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to the contributors and the open-source community for their valuable resources and tools.

## Project Structure
```plaintext
SBU-Backend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── database.js      # Database configuration
│   │   ├── swagger.js       # Swagger/OpenAPI configuration
│   │   └── bullBoardSetup.js # Bull Board setup
│   ├── controllers/         # Request handlers
│   │   ├── authController.js
│   │   ├── guildsController.js
│   │   └── verificationController.js
│   ├── middleware/          # Custom middleware
│   │   └── authMiddleware.js
│   ├── models/              # Data models
│   │   ├── guild.js
│   │   └── verification.js
│   ├── processors/          # Queue job processors
│   │   ├── guildsProcessor.js
│   │   └── verificationProcessor.js
│   ├── routes/              # API route definitions
│   │   ├── auth.js
│   │   ├── guilds.js
│   │   ├── system.js
│   │   ├── verifications.js
│   │   └── index.js         # Dynamic route loader
│   ├── utils/               # Utility functions
│   │   ├── logger.js        # Winston logger configuration
│   │   ├── queueManager.js  # Redis queue management
│   │   └── bullBoardManager.js # Bull Board management
│   └── index.js             # Application entry point
├── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with token and receive JWT
- `POST /api/auth/verify` - Verify JWT token

### Guilds
- `GET /api/guilds/all` - Get all guilds (requires authentication)

### Verification
- `GET /api/verifications` - Get verification data (requires authentication)

### System
- `GET /api/system/health` - Health check endpoint
- `GET /api/system/test-redis` - Test Redis connection

### Admin
- `GET /admin/queues` - Bull Board dashboard for queue monitoring

## Usage

1. Start the server:
    ```bash
    npm start
    ```

2. The server will start on the configured port (default: 3000)

3. Access the API documentation at `http://localhost:3000/api-docs` (if Swagger is configured)

4. Monitor queue jobs via Bull Board dashboard (if configured)

## Development

### Logging
The application uses Winston for comprehensive logging with different levels:
- Console logging in development mode with colorized output
- File logging in production mode
- Automatic log directory creation

### Queue Processing
- Redis-based job queues using Bull
- Configurable Redis connection (URL or host/port)
- Verification job processing with error handling

### Authentication
- JWT token verification middleware
- UAID-based user identification
- Protected route support

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `LOG_LEVEL` | Logging level | `info` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:3000` |
| `REDIS_URL` | Redis connection URL | - |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `JWT_SECRET` | JWT secret key | - |

## Testing

Currently, there are no test scripts defined. To add testing:

1. Install testing dependencies:
    ```bash
    npm install --save-dev jest supertest
    ```

2. Add test scripts to `package.json`:
    ```json
    {
      "scripts": {
        "test": "jest",
        "test:watch": "jest --watch"
      }
    }
    ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to the contributors and the open-source community for their valuable resources and tools.
- Built with Express.js, Bull, Redis, and Winston