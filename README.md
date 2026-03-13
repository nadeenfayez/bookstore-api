# bookstore-api
RESTful Bookstore API built with Node.js, Express, and MongoDB.



# Orders & Payments System

This project implements a **secure order and payment flow** using **Stripe Checkout Sessions** and **webhook-based payment confirmation**.

The system is designed with:

* order snapshot integrity
* payment idempotency
* stock consistency
* transactional webhook handling

---

# Order Flow

## 1. Creating an Order

Users create an order by sending a list of books and quantities.

Example request:

```json
{
  "items": [
    { "bookId": "book_id_1", "quantity": 2 },
    { "bookId": "book_id_2", "quantity": 1 }
  ]
}
```

### Backend Logic

When creating an order, the server:

1. Merges duplicate books.
2. Fetches the books from the database.
3. Validates that all books exist and are active.
4. Ensures all books use the same currency.
5. Verifies stock availability.
6. Creates a **snapshot of book data** inside the order.

Example stored order item:

```json
{
  "bookId": "...",
  "title": "Clean Code",
  "price": {
    "amount": 500,
    "currency": "EGP"
  },
  "quantity": 2
}
```

This snapshot ensures the order remains correct even if book data changes later.

### Order Status

Orders use the following status values:

```
pending
paid
failed
```

---

# Payment Flow

Payments are handled using **Stripe Checkout Sessions**.

The system does **not rely on frontend redirects** to confirm payment.
Instead, the backend relies on **Stripe Webhooks**, which provide secure server-to-server confirmation.

---

# Checkout Session Creation

Endpoint creates a Stripe Checkout session.

Steps performed:

1. Validate the order exists.
2. Ensure the user owns the order (or is admin).
3. Ensure the order status is `pending`.
4. Ensure no payment already exists for this order.
5. Build Stripe `line_items` from order items.
6. Prefill the customer email when available.
7. Create a Stripe Checkout Session.

Example response:

```json
{
  "payment": { ... },
  "checkoutUrl": "https://checkout.stripe.com/...",
  "checkoutSessionId": "cs_test_..."
}
```

The frontend redirects the user to `checkoutUrl`.

---

# Webhook Processing

Stripe sends events to:

```
POST /webhooks/stripe
```

The backend verifies the Stripe signature before processing.

Example handled events:

```
checkout.session.completed
checkout.session.expired
```

---

# Webhook Transaction Handling

Webhook processing uses a **MongoDB transaction** to ensure consistency.

Inside the transaction the system:

1. Validates the payment and order exist.
2. Performs idempotency checks.
3. Validates stock availability.
4. Updates book stock.
5. Updates payment status.
6. Updates order status.
7. Marks the webhook event as processed.

If any step fails, the entire transaction is rolled back.

---

# Idempotency Protection

Stripe may retry webhook events.

To prevent duplicate processing, the system uses **two layers of protection**.

### 1. Webhook Event Log

Each Stripe event is stored in a `WebhookEvent` collection.

Example document:

```json
{
  "eventId": "evt_123",
  "type": "checkout.session.completed",
  "provider": "stripe",
  "orderId": "...",
  "processed": true,
  "processedAt": "2026-03-11T..."
}
```

If the event is already processed, the webhook handler exits early.

---

### 2. Business Logic Idempotency

The system also checks:

```
payment.status === "paid"
order.status === "paid"
```

If both are already paid, no further action is taken.

---

# Stock Consistency

Stock is updated **only after payment confirmation**.

The system:

1. Validates stock for all ordered items.
2. Prepares stock updates.
3. Applies updates using `bulkWrite`.
4. Executes the entire process inside a transaction.

This prevents inconsistent inventory states.

---

# Security Rules

The system enforces the following rules:

### Orders

* Users can only access their own orders.
* Admins can access all orders.
* Paid orders cannot be modified.
* Paid orders cannot be deleted.

### Payments

* Payments are created automatically during checkout.
* Payment status is controlled **only by Stripe webhooks**.
* Manual payment status updates are disabled.
* Paid payments cannot be deleted.

---

# Stripe Test Card

Use this card for local testing:

```
Card Number: 4242 4242 4242 4242
Expiry: any future date
CVC: any 3 digits
```

---

# Environment Variables

Required variables:

```env
# Frontend URL used for Stripe redirects
CLIENT_URL=http://localhost:3000

# Stripe configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

---

# Key Design Decisions

### Snapshot-based orders

Order items store a snapshot of book title and price to preserve historical accuracy.

### Webhook-based payment confirmation

The backend relies on Stripe webhooks instead of frontend redirects.

### Transactional webhook handling

MongoDB transactions ensure stock updates and payment updates remain consistent.

### Idempotent webhook processing

Webhook events are logged and checked to prevent duplicate processing.