# E-Commerce Admin API

This API allows users to manage products and single admin-user for an e-commerce platform. It includes endpoints for retrieving and updating product and admin data stored in JSON files.

---

## Setup Instructions

### Requirements

- **Node.js** (v16 or higher)
- **npm** (v7 or higher)

### Installation

1. Change directory to the `backend` folder:

    ```bash
    cd backend
    ```

1.  Install dependencies:

    ```bash
    npm install
    ```

1.  Start the server:

    ```js
    npm run start // or node main.js
    ```

1.  The API will be available at http://localhost:3000

## API Endpoints

### 1. Products

#### Get All Published Products

- Endpoint: 
  - `GET /products/published`
  - `GET /products/published?groupBy=product_type`
  - `GET /products/published?search=<search_query>`
- Description: Retrieves all published products. Optionally, group by `product_type`. Search will filter the products by all fields, before grouping.
- Response:

  ```json
  {
    "products": [
      {
        "id": "p1",
        "title": "Product Title",
        "description": "Product Description",
        "price": 49.99,
        "product_type": "Category",
        "published": true,
        "inventory": 100
      },
    ...
    ]
  }
  ```

- Group By Response:

  ```json
  {
    "products": {
      "Category": [
        {
          "id": "p1",
          "title": "Product Title",
          "description": "Product Description",
          "price": 49.99,
          "product_type": "Category",
          "published": true,
          "inventory": 100
        },
        ...
      ],
      ...
    }
  }
  ```

#### Get All Products

- Endpoint:
  - `GET /products/all`
  - `GET /products/all?groupBy=product_type`
  - `GET /products/all?search=<search_query>`
- Description: Retrieves all available products. Optionally, group by `product_type`. Search will filter the products all fields, before grouping.
- Response:

  ```json
  ... Same as Get All Published Products ...
  ```

#### Update a Product

- Endpoint: `PUT /products/:productId`
- Description: Updates a specific product by its productId.
- Request Body:

  ```json
  {
    "product": {
      "id": "1",
      "title": "Updated Product Title",
      "description": "Updated Description",
      "price": 59.99,
      "product_type": "Updated Category",
      "published": true,
      "inventory": 50
    }
  }
  ```

- Response Schema:

  ```json
  {
    "message": string
  }
  ```

- Error Response Schema:

  ```json
  {
    "message": string
  }
  ```

- Example:

  > Update product inventory of product with id "p1" to 50.

  ```javascript
  const response = await axios.put("http://localhost:3000/products/p1", {
    product: {
      inventory: 50,
    },
  });
  ```

### 2. Admin

#### Get Admin Settings

- Endpoint: `GET /admin`
- Description: Retrieves the current admin user settings.
- Response:

  ```json
  {
    "admin": {
      "username": "admin@example.com",
      "password": "hashed_password",
      "discount_threshold": 300,
      "discount_rate": 0.2
    }
  }
  ```

#### Update Admin Settings

- Endpoint: `PUT /admin`
- Description: Updates the admin settings.
- Request Body:

  ```json
  {
    "admin": {
      "username": "new_admin@example.com",
      "password": "new_hashed_password",
      "discount_threshold": 500,
      "discount_rate": 0.15
    }
  }
  ```

- Response:

  ```json
  {
    "message": "Admin User updated!"
  }
  ```

### 3. 404 - Not Found

- If an invalid endpoint is accessed, the API will return:

  ```json
  {
    "message": "404 - Not Found"
  }
  ```
