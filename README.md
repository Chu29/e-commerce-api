# E-Commerce API

REST API for managing e-commerce categories, products, and product images. Built with Express, Prisma, PostgreSQL, Cloudinary, and Swagger.

## Features

- Category creation and listing
- Product CRUD
- Product search and filtering by text, category, price range, and pagination
- Product image upload, replacement, and deletion via Cloudinary
- PostgreSQL persistence through Prisma
- Swagger API documentation
- Structured request logging with Pino

## Tech Stack

- Node.js with ES modules
- Express 5
- Prisma 7
- PostgreSQL
- Cloudinary
- Multer
- Swagger UI
- Pino

## Getting Started

### Prerequisites

- Node.js
- pnpm
- PostgreSQL database
- Cloudinary account

### Installation

```bash
pnpm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
PORT=3000
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
NODE_ENV="development"
```

`DATABASE_URL` and the Cloudinary values are required.

### Database Setup

Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE e_commerce_db;

# Exit psql
\q
```

Run migrations:

```bash
pnpm prisma migrate dev
```

Seed sample data:

```bash
pnpm seed
```

### Run the Server

Development:

```bash
pnpm dev
```

Production:

```bash
pnpm start
```

The API runs on `http://localhost:3000` by default. Set `PORT` to use a different port.

## API Documentation

Swagger UI is available at:

```text
http://localhost:3000/api-docs
```

## Endpoints

### Health

- `GET /` - API status
- `GET /ping` - service liveness check

### Categories

- `GET /api/categories` - list categories
- `POST /api/categories` - create a category

### Products

- `GET /api/products` - list products
- `GET /api/products/search` - search and filter products
- `GET /api/products/:id` - get a product by ID
- `POST /api/products` - create a product
- `PATCH /api/products/:id` - update a product
- `DELETE /api/products/:id` - delete a product

### Product Images

- `POST /api/product/:id/image` - upload or replace a product image
- `DELETE /api/product/:id/image` - delete a product image

## Example Requests

Create a category:

```bash
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Electronics",
    "description": "Electronic devices and accessories",
    "slug": "electronics"
  }'
```

Create a product:

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Wireless Headphones",
    "description": "Noise-canceling Bluetooth headphones",
    "price": 78000,
    "categoryId": 1,
    "stockQuantity": 45
  }'
```

Search products:

```bash
curl "http://localhost:3000/api/products/search?search=headphones&page=1&limit=10"
```

Upload a product image:

```bash
curl -X POST http://localhost:3000/api/product/1/image \
  -F "image=@/path/to/image.jpg"
```

## Project Structure

```text
.
├── app.js
├── prisma/
│   ├── schema.prisma
│   ├── seed.js
│   └── migrations/
└── src/
    ├── config/
    ├── middleware/
    ├── modules/
    │   ├── category/
    │   ├── image_upload/
    │   └── product/
    └── utils/
```

## Scripts

- `pnpm dev` - start the API with Nodemon
- `pnpm start` - start the API with Node
- `pnpm seed` - seed the database with sample categories and products
- `pnpm test` - placeholder test command


## Author

**Developed by:** MUEGHE ABUEMKEZE CHU

Connect with me:

- 🐙 GitHub: [@chu29](https://github.com/chu29)
- 🐦 Twitter: [@unku_chu](https://twitter.com/unku_chu)
- 💼 LinkedIn: [MUEGHE ABUEMKEZE CHU](https://linkedin.com/in/chu-abuemkeze)
- 📧 Email: chu.amk22@gmail.com