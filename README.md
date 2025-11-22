# TruckerLink Server

A professional Express.js REST API server built with industry best practices.

## Features

- **Express.js** - Fast, unopinionated, minimalist web framework
- **Security** - Helmet for security headers, CORS configuration
- **Validation** - Express-validator for request validation
- **Error Handling** - Centralized error handling with custom error classes
- **Logging** - Morgan for HTTP logging, custom logger for application logs
- **Code Quality** - ESLint and Prettier for code formatting and linting
- **Hot Reload** - Nodemon for development
- **Compression** - Gzip compression for responses

## Project Structure

```
truckerlink-server/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Request handlers
│   ├── routes/           # Route definitions
│   ├── middleware/       # Custom middleware
│   ├── models/           # Data models (add your database models here)
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   └── validators/       # Input validation rules
├── logs/                 # Application logs
├── tests/                # Test files
├── .env                  # Environment variables (not in git)
├── .env.example          # Example environment variables
├── .gitignore            # Git ignore rules
├── .eslintrc.json        # ESLint configuration
├── .prettierrc           # Prettier configuration
├── package.json          # Project dependencies
├── server.js             # Application entry point
└── README.md             # This file
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

1. Clone the repository or navigate to the project directory

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and update the values according to your environment.

### Running the Server

**Development mode (with hot reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on the port specified in your `.env` file (default: 3000).

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with hot reload
- `npm run lint` - Run ESLint to check code quality
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## API Endpoints

### Health Check
```
GET /health
```
Returns server health status.

### API Root
```
GET /api/v1
```
Returns API information and available endpoints.

### Users

**Get all users:**
```
GET /api/v1/users?page=1&limit=10&search=john
```

**Get user by ID:**
```
GET /api/v1/users/:id
```

**Create user:**
```
POST /api/v1/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "driver"
}
```

**Update user:**
```
PUT /api/v1/users/:id
Content-Type: application/json

{
  "name": "John Updated",
  "email": "john.updated@example.com"
}
```

**Delete user:**
```
DELETE /api/v1/users/:id
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment (development/production) | development |
| PORT | Server port | 3000 |
| API_VERSION | API version | v1 |
| CORS_ORIGIN | Allowed CORS origin | http://localhost:3000 |
| JWT_SECRET | JWT secret key | - |
| JWT_EXPIRE | JWT expiration time | 24h |
| DB_HOST | Database host | localhost |
| DB_PORT | Database port | 5432 |
| DB_NAME | Database name | truckerlink |
| DB_USER | Database user | postgres |
| DB_PASSWORD | Database password | - |

## Error Handling

The API uses a centralized error handling system with custom error classes:

- **400** - Bad Request (validation errors)
- **401** - Unauthorized
- **403** - Forbidden
- **404** - Not Found
- **409** - Conflict
- **500** - Internal Server Error

Error response format:
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error message here"
}
```

## Validation

Request validation is handled using express-validator. All user inputs are validated before processing.

## Security Features

- **Helmet** - Sets various HTTP headers for security
- **CORS** - Configurable cross-origin resource sharing
- **Input Validation** - All inputs are validated and sanitized
- **Error Handling** - Secure error messages in production

## Logging

- **HTTP Logging** - Morgan logs all HTTP requests
- **Application Logging** - Custom logger for application events
- **Log Files** - Logs are stored in the `logs/` directory

## Next Steps

1. **Add Database** - Integrate with PostgreSQL, MongoDB, or your preferred database
2. **Authentication** - Implement JWT-based authentication
3. **Testing** - Add unit and integration tests
4. **Documentation** - Add Swagger/OpenAPI documentation
5. **Rate Limiting** - Implement rate limiting for API endpoints
6. **Caching** - Add Redis for caching
7. **WebSockets** - Add real-time features if needed

## Best Practices

- Separation of concerns (routes, controllers, services)
- Centralized error handling
- Input validation
- Environment-based configuration
- Proper logging
- Code formatting and linting
- Security best practices

## Contributing

1. Follow the existing code style
2. Run `npm run lint:fix` before committing
3. Write meaningful commit messages
4. Add tests for new features

## License

ISC
