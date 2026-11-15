# Section 3 Postman Test Data

This folder contains request-body test data files for:
- `POST /api/orders`
- `POST /api/products`

Use these files with Postman Body -> raw -> JSON.

Important notes:
- Replace placeholder IDs with real IDs from your DB before running happy-path tests.
- `POST /api/orders` requires `Authorization: Bearer <FIREBASE_ID_TOKEN>`.
- `POST /api/products` requires seller/admin auth token.
- `POST /api/products` can be sent as raw JSON (without file upload) for validation tests.

Suggested endpoint URLs:
- `http://localhost:8080/api/orders`
- `http://localhost:8080/api/products`
