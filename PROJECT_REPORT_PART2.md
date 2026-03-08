# CHAPTER 4: SYSTEM DESIGN

## 4.1 System Architecture

The Inventory Management System follows a **3-Tier Client-Server Architecture** with the MERN stack:

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION TIER                         │
│                   React.js Frontend                          │
│  (Redux Toolkit, React Router, React Hot Toast, Chart.js)   │
│              Runs on: localhost:3000 / Vercel                │
└───────────────────────┬────────────────────────────────────--┘
                        │ HTTP REST API + Socket.io
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION TIER                          │
│                  Node.js + Express.js                        │
│    (JWT Middleware, RBAC, PDFKit, Cloudinary, Socket.io)    │
│              Runs on: localhost:3003 / Render                │
└───────────────────────┬─────────────────────────────────────┘
                        │ Mongoose ODM
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA TIER                               │
│                  MongoDB (Atlas Cloud)                       │
│  Collections: users, products, categories, suppliers,        │
│  purchases, sales, adjustments, stocklogs, settings          │
└─────────────────────────────────────────────────────────────┘
```

### 4.1.1 Backend Architecture (MVC Pattern)

The backend follows the **Model-View-Controller (MVC)** architectural pattern:

| Layer | Folder | Description |
|-------|--------|-------------|
| **Model** | `/backend/models/` | Mongoose schemas defining database structure |
| **Controller** | `/backend/controller/` | Business logic for each module |
| **View (Routes)** | `/backend/Routers/` | Express route definitions mapping HTTP endpoints to controllers |
| **Middleware** | `/backend/middleware/` | JWT auth, admin, staff, and role-specific middleware |
| **Utils** | `/backend/utils/` | Shared utility functions (e.g., stock update helper) |
| **Libs** | `/backend/libs/` | External service configurations (MongoDB, Cloudinary) |

### 4.1.2 Frontend Architecture (Feature-Based)

| Folder | Description |
|--------|-------------|
| `/src/pages/` | 18 page components (one per business module) |
| `/src/features/` | 9 Redux Toolkit slices for state management |
| `/src/Components/` | Shared layout components (Sidebar, TopNavbar, etc.) |
| `/src/lib/` | Utility code (ProtectedRoute, API base, etc.) |
| `/src/store/` | Redux store configuration |

### 4.1.3 API Endpoints Summary

| Module | Base URL | Methods |
|--------|----------|---------|
| Authentication | `/api/auth` | POST /login, POST /signup, POST /logout, GET /checkAuth |
| Products | `/api/product` | GET, POST, PUT /:id, DELETE /:id |
| Categories | `/api/category` | GET, POST, PUT /:id, DELETE /:id |
| Suppliers | `/api/supplier` | GET, POST, PUT /:id, DELETE /:id |
| Purchases | `/api/purchase` | GET, POST, GET /:id, DELETE /:id, GET /invoice/:id |
| Sales | `/api/sales` | GET, POST, GET /:id, DELETE /:id, GET /invoice/:id |
| Adjustments | `/api/adjustments` | GET, POST, DELETE /:id |
| Stock Log | `/api/stock` | GET, GET /:productId |
| Dashboard | `/api/dashboard` | GET /summary, GET /charts, GET /recent |
| Reports | `/api/reports` | GET /sales, GET /purchases, GET /stock |
| Settings | `/api/settings` | GET, PUT /:key |

### 4.1.4 Authentication Flow

```
Client                          Server                    Database
  │                               │                          │
  │── POST /api/auth/login ──────>│                          │
  │   {email, password}           │── findOne({email}) ─────>│
  │                               │<── User document ────────│
  │                               │── bcrypt.compare() ──    │
  │                               │── jwt.sign(userId) ──    │
  │<── Set-Cookie: JWT ──────────│                          │
  │    200 OK + user data         │                          │
  │                               │                          │
  │── GET /api/product ──────────>│                          │
  │   Cookie: JWT                 │── jwt.verify() ──        │
  │                               │── User.findById() ──────>│
  │                               │<── User doc ─────────────│
  │<── 200 OK + products ────────│                          │
```

## 4.2 Database Design

The system uses **MongoDB** with **9 collections**. Below is the detailed schema design for each collection:

### 4.2.1 Users Collection

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| _id | ObjectId | Primary Key | Auto-generated MongoDB ID |
| full_name | String | Required | User's full name |
| email | String | Required, Unique | Login email address |
| password | String | Required | Bcrypt-hashed password |
| role | String | Enum: ADMIN, STAFF | Access role (default: STAFF) |
| status | String | Enum: ACTIVE, INACTIVE | Account status (default: ACTIVE) |
| profile_image | String | Nullable | Cloudinary image URL |
| createdAt | Date | Auto | Timestamp |
| updatedAt | Date | Auto | Timestamp |

### 4.2.2 Products Collection

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| _id | ObjectId | Primary Key | Auto-generated MongoDB ID |
| name | String | Required, Unique | Product name |
| sku | String | Required, Unique | Stock Keeping Unit code |
| category | ObjectId | Ref: Category | Category reference |
| description | String | Required | Product description |
| current_cost_price | Number | Required, min: 0 | Latest purchase cost price |
| selling_price | Number | Required, min: 0 | Retail selling price |
| total_stock | Number | Default: 0 | Current available quantity |
| reorderLevel | Number | Default: 0 | Minimum stock threshold |
| status | String | Enum: Active, Inactive | Product status |
| createdAt | Date | Auto | Timestamp |
| updatedAt | Date | Auto | Timestamp |

### 4.2.3 Categories Collection

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| _id | ObjectId | Primary Key | Auto-generated MongoDB ID |
| name | String | Required, Unique | Category name |
| description | String | Optional | Category description |
| status | String | Enum: Active, Inactive | Category status |
| createdAt | Date | Auto | Timestamp |
| updatedAt | Date | Auto | Timestamp |

### 4.2.4 Suppliers Collection

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| _id | ObjectId | Primary Key | Auto-generated MongoDB ID |
| name | String | Required | Supplier company name |
| contact_person | String | Required | Contact person name |
| phone | String | Required | Phone number |
| email | String | Unique, Sparse | Email address (optional) |
| supplier_id | String | Required, Unique | Auto-generated supplier code |
| address | String | Required | Business address |
| pan_vat | String | Required, Unique | PAN/VAT registration number |
| status | String | Enum: Active, Inactive | Supplier status |
| createdAt | Date | Auto | Timestamp |
| updatedAt | Date | Auto | Timestamp |

### 4.2.5 Purchases Collection

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| _id | ObjectId | Primary Key | Auto-generated MongoDB ID |
| invoiceNumber | String | Unique, Sparse | Purchase invoice number |
| supplier | ObjectId | Ref: Supplier | Supplying company |
| items | Array | Sub-documents | Array of purchased items |
| items[].product | ObjectId | Ref: Product | Product reference |
| items[].quantity | Number | min: 1 | Quantity purchased |
| items[].costPrice | Number | min: 0 | Unit cost price |
| items[].batchNumber | String | Optional | Batch/lot number |
| items[].expiryDate | Date | Optional | Product expiry date |
| subtotal | Number | Default: 0 | Before discount/tax |
| discountPercentage | Number | Default: 0 | Discount % |
| discountAmount | Number | Default: 0 | Computed discount |
| taxPercentage | Number | Default: 0 | Tax % |
| taxAmount | Number | Default: 0 | Computed tax |
| totalAmount | Number | Required | Final payable amount |
| paymentType | String | Enum: Cash/Credit/Online | Payment method |
| notes | String | Optional | Additional notes |
| purchaseDate | Date | Default: now | Date of purchase |
| createdAt | Date | Auto | Timestamp |

### 4.2.6 Sales Collection

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| _id | ObjectId | Primary Key | Auto-generated MongoDB ID |
| invoiceNumber | String | Required, Unique | Sale invoice number |
| customerName | String | Default: Walking Customer | Customer name |
| products | Array | Sub-documents | Array of sold items |
| products[].product | ObjectId | Ref: Product | Product reference |
| products[].name | String | Snapshot | Product name at time of sale |
| products[].quantity | Number | min: 1 | Quantity sold |
| products[].price | Number | min: 0 | Selling price snapshot |
| products[].costPrice | Number | min: 0 | Cost price snapshot (profit calc.) |
| subtotal | Number | Required | Before discount/tax |
| discountPercentage | Number | Default: 10 | Discount % |
| discountAmount | Number | Default: 0 | Computed discount |
| taxPercentage | Number | Default: 13 | VAT % (Nepal standard) |
| taxAmount | Number | Default: 0 | Computed VAT |
| totalAmount | Number | Required | Final billed amount |
| paymentType | String | Enum: Cash/Credit/Online | Mode of payment |
| notes | String | Optional | Sale remarks |
| soldBy | ObjectId | Ref: User | Staff/Admin who made the sale |
| saleDate | Date | Default: now | Date of sale |
| createdAt | Date | Auto | Timestamp |

### 4.2.7 Adjustments Collection

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| _id | ObjectId | Primary Key | Auto-generated MongoDB ID |
| product | ObjectId | Ref: Product | Adjusted product |
| type | String | Enum: INCREASE, DECREASE | Adjustment direction |
| quantity | Number | Required | Quantity adjusted |
| reason | String | Required | Reason for adjustment |
| remarks | String | Default: '' | Additional remarks |
| adjustedBy | ObjectId | Ref: User | User who made the adjustment |
| date | Date | Default: now | Adjustment date |
| createdAt | Date | Auto | Timestamp |

### 4.2.8 StockLogs Collection

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| _id | ObjectId | Primary Key | Auto-generated MongoDB ID |
| product | ObjectId | Ref: Product | Product concerned |
| type | String | Enum: IN, OUT, ADJUST | Movement type |
| quantity | Number | Required, min: 1 | Quantity moved |
| reason | String | Default: '' | Movement reason |
| performedBy | ObjectId | Ref: User | User responsible |
| supplier | ObjectId | Ref: Supplier | Supplier (for IN logs) |
| previousStock | Number | Default: 0 | Stock before movement |
| currentStock | Number | Default: 0 | Stock after movement |
| date | Date | Default: now | Transaction date |
| createdAt | Date | Auto | Timestamp |

### 4.2.9 Settings Collection

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| _id | ObjectId | Primary Key | Auto-generated MongoDB ID |
| key | String | Required, Unique | Setting key (e.g., "enable_rbac") |
| value | Mixed | Required | Setting value (any type) |
| updated_at | Date | Auto-updated | Last modified timestamp |

### 4.2.10 Entity Relationship Overview

```
Category ──< Product >── Purchase (many items)
                │              │
                │           Supplier
                │
              Sales (many products)
                │
              User (soldBy)
                │
           Adjustment ──> StockLog
                │
              User (adjustedBy / performedBy)
```

## 4.3 Use Case Diagram

### Actors:
- **Admin:** Full system access — manage users, products, categories, suppliers, purchases, sales, adjustments, reports, and settings.
- **Staff:** Operational access — view products/categories/suppliers, record purchases, record sales, make adjustments, view stock log, view reports.
- **System:** Automated actions — stock updates on purchase/sale, stock log entry creation, JWT token validation.

### Use Cases for Admin:

```
Admin ──> Login / Logout
      ──> Manage Products (Add/Edit/Deactivate)
      ──> Manage Categories (Add/Edit/Deactivate)
      ──> Manage Suppliers (Add/Edit/Deactivate)
      ──> Record Purchase → [System: Update Stock IN, Log Entry]
      ──> Record Sale → [System: Update Stock OUT, Log Entry]
      ──> Make Stock Adjustment → [System: Update Stock, Log Entry]
      ──> View Stock Transactions
      ──> View & Download Reports
      ──> Manage User Accounts (Status)
      ──> Configure System Settings
      ──> View Dashboard Analytics
      ──> Manage Profile (Image Upload)
      ──> Generate PDF Invoices
```

### Use Cases for Staff:

```
Staff ──> Login / Logout
      ──> View Products / Categories / Suppliers
      ──> Record Purchase → [System: Update Stock IN, Log Entry]
      ──> Record Sale → [System: Update Stock OUT, Log Entry]
      ──> Make Stock Adjustment → [System: Update Stock, Log Entry]
      ──> View Stock Transactions
      ──> View Reports
      ──> View Dashboard
      ──> Manage Own Profile
      ──> Generate PDF Invoices
```

## 4.4 Data Flow Diagram (DFD)

### Level 0 – Context Diagram

```
            ┌──────────────────────────────────────────┐
            │                                          │
 [Admin] ──>│                                          │──> [Reports/Invoices]
 [Staff] ──>│    Inventory Management System           │
            │                                          │<── [Cloudinary (Images)]
            │                                          │<── [MongoDB (Data)]
            │                                          │
            └──────────────────────────────────────────┘
```

### Level 1 – DFD

```
                   ┌───────────────────────────────────────────────────────────────────────┐
  [User Input] ──> │ 1.0 Authentication │ ──> [User Session (JWT Cookie)]
                   └──────────────────────────────────────────────────────────────────────-┘

[Auth'd User] ─┬─> │ 2.0 Product Mgmt   │ <──> [Products DB]
               ├─> │ 3.0 Category Mgmt  │ <──> [Categories DB]
               ├─> │ 4.0 Supplier Mgmt  │ <──> [Suppliers DB]
               │
               ├─> │ 5.0 Purchase Mgmt  │ <──> [Purchases DB]
               │         │                           │
               │         └──────────────────────────>│ 8.0 Stock Update ──> [Products DB]
               │                                     │                 ──> [StockLogs DB]
               │
               ├─> │ 6.0 Sales Mgmt     │ <──> [Sales DB]
               │         │                           │
               │         └──────────────────────────>│ 8.0 Stock Update ──> [Products DB]
               │                                     │                 ──> [StockLogs DB]
               │
               ├─> │ 7.0 Adjustment     │ <──> [Adjustments DB]
               │         │                           │
               │         └──────────────────────────>│ 8.0 Stock Update ──> [Products DB]
               │                                     │                 ──> [StockLogs DB]
               │
               ├─> │ 9.0 Dashboard      │ <──> [All Collections (Read-Only)]
               └─> │ 10.0 Reports       │ <──> [Sales + Purchase + Stock DB]
```

## 4.5 Sequence Diagram: Recording a Sale

```
Client (React)        Redux Slice         Express API          MongoDB
     │                    │                    │                  │
     │─ dispatch(addSale)─>│                   │                  │
     │                    │─ POST /api/sales ─>│                  │
     │                    │                    │─ verifyJWT() ─   │
     │                    │                    │─ Find products ──>│
     │                    │                    │<── Product docs ──│
     │                    │                    │─ Validate stock   │
     │                    │                    │─ Create Sale ────>│
     │                    │                    │─ Decrement stock─>│
     │                    │                    │─ Create StockLog─>│
     │                    │                    │<── Success ───────│
     │                    │<── 201 Created ────│                  │
     │<─ State Updated ───│                    │                  │
     │─ Toast: "Sale created"                  │                  │
```

---

# CHAPTER 5: IMPLEMENTATION

## 5.1 Tools and Technologies Used

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Runtime** | Node.js | v18+ | Server-side JavaScript execution |
| **Framework** | Express.js | v4.21.2 | RESTful API server |
| **Database** | MongoDB | v6+ | NoSQL document store |
| **ODM** | Mongoose | v8.9.7 | MongoDB schema modeling & queries |
| **Frontend** | React.js | v18 | Component-based UI framework |
| **State Mgmt** | Redux Toolkit | Latest | Global state management |
| **Routing** | React Router DOM | v6 | Client-side SPA routing |
| **Auth** | JSON Web Token | v9.0.2 | Stateless authentication |
| **Password** | Bcrypt.js | v2.4.3 | Password hashing |
| **Real-time** | Socket.io | v4.8.1 | WebSocket communication |
| **File Upload** | Cloudinary | v2.5.1 | Cloud image storage |
| **PDF** | PDFKit | v0.17.2 | Invoice PDF generation |
| **HTTP Cookie** | cookie-parser | v1.4.7 | JWT cookie management |
| **CORS** | cors | v2.8.5 | Cross-origin request handling |
| **Env Variables** | dotenv | v16.4.7 | Environment configuration |
| **Dev Server** | Nodemon | v3.1.11 | Auto-restart on file changes |
| **Notifications** | react-hot-toast | Latest | UI toast notifications |
| **Charts** | Chart.js | v4.4.8 | Dashboard analytics charts |
| **ID Generation** | uuid | v13.0.0 | Unique identifier generation |

## 5.2 Module Description

### 5.2.1 Authentication Module

**Files:** `authcontroller.js`, `authRouther.js`, `authSlice.js`, `LoginPage.jsx`, `SignupPages.jsx`

**Functionality:**
- **Signup:** Registers a new user. Validates that email is unique. Hashes the password with Bcrypt (10 salt rounds) before saving to MongoDB. Returns a JWT token in an HTTP-only cookie.
- **Login:** Finds user by email, compares the provided password against the stored hash using `bcrypt.compare()`. On success, generates a JWT signed with the server's `SecretKey` and stores it in an HTTP-only cookie named `Inventorymanagmentsystem`.
- **Logout:** Clears the authentication cookie.
- **Check Auth:** Verifies the current JWT cookie to restore authenticated session on page reload.
- **Profile Update:** Allows users to update their full name and upload a new profile image to Cloudinary.

**Key Security Implementation:**
```javascript
// Token stored as HTTP-only cookie (not accessible via JavaScript)
res.cookie("Inventorymanagmentsystem", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict"
});
```

**Role-Based Access:**
The middleware file (`Authmiddleware.js`) provides three middleware functions:
- `authmiddleware` — verifies JWT and loads user into `req.user`
- `adminmiddleware` — blocks non-Admin access (checks `enable_rbac` setting)
- `staffmiddleware` — allows both Admin and Staff
- `authorizeRoles(...roles)` — generic role authorizer for custom role combinations

### 5.2.2 Product Management Module

**Files:** `productController.js`, `ProductRouter.js`, `productSlice.js`, `Productpage.jsx`

**Functionality:**
- Add new products with name, SKU, category, description, cost price, selling price, and reorder level.
- Edit existing products.
- Deactivate products (soft delete — status set to "Inactive").
- View all products with current stock, category, pricing, and status.
- Low-stock detection: products where `total_stock <= reorderLevel` are flagged.
- Deletion protection: products with any stock log entries cannot be deleted.

**Stock Reorder Alert Logic:**
```javascript
// Backend — products with stock at or below reorder level
const lowStockCount = await Product.countDocuments({
  $expr: { $lte: ["$total_stock", "$reorderLevel"] },
  total_stock: { $gt: 0 }
});
```

### 5.2.3 Category Management Module

**Files:** `categorycontroller.js`, `categoryRouter.js`, `categorySlice.js`, `Categorypage.jsx`

**Functionality:**
- Full CRUD for product categories.
- Category status management (Active/Inactive).
- Prevents deletion of categories that have associated products.
- Categories are referenced by products via ObjectId (foreign key equivalent in MongoDB).

### 5.2.4 Supplier Management Module

**Files:** `suppliercontroller.js`, `supplierrouter.js`, `SupplierSlice.js`, `Supplierpage.jsx`

**Functionality:**
- Add new suppliers with auto-generated supplier ID (format: `SUP-XXXX`).
- Capture contact person, phone, email, address, and PAN/VAT for compliance.
- Edit supplier information.
- Deactivate suppliers (soft delete).
- Prevents deletion of suppliers linked to purchase records.
- Email field is optional with sparse unique index (supports multiple null emails).

### 5.2.5 Purchase Management Module

**Files:** `purchasecontroller.js`, `purchaserouter.js`, `purchaseSlice.js`, `PurchasePage.jsx`

**Functionality:**
- Create multi-item purchase orders linked to a supplier.
- For each item: select product, enter quantity, cost price, batch number, and expiry date.
- Auto-calculate subtotal, discount amount, tax amount, and total amount.
- On submission, the system:
  1. Creates the Purchase document in MongoDB.
  2. **Increments `total_stock`** of each purchased product.
  3. **Updates `current_cost_price`** of the product with the latest purchase price.
  4. Creates a **StockLog entry** (type: IN) for each item.
- View all purchases with supplier details, item list, and financial summary.
- Generate and download a **PDF invoice** for each purchase.
- Admin-only: Delete a purchase (reverses stock changes).

### 5.2.6 Sales Management Module

**Files:** `salescontroller.js`, `salesRouter.js`, `salesSlice.js`, `Salespage.jsx`

**Functionality:**
- Create sales transactions with customer name, selected products, and quantities.
- Validates that sufficient stock exists before allowing sale creation.
- Auto-applies 13% VAT by default (configurable via settings).
- Price and cost price snapshots are stored at time of sale for historical accuracy.
- On submission, the system:
  1. Creates the Sale document.
  2. **Decrements `total_stock`** of each sold product.
  3. Creates a **StockLog entry** (type: OUT) for each item.
- Displays profit/loss per sale based on (selling price − cost price) × quantity.
- Generate and download a **PDF invoice** for each sale.
- Sale invoice includes customer details, itemized list, tax, discount, and total.

### 5.2.7 Stock Adjustment Module

**Files:** `Adjustmentcontroller.js`, `Adjustmentrouter.js`, `adjustmentSlice.js`, `AdjustmentPage.jsx`

**Functionality:**
- Allows authorized users to manually adjust stock for a product.
- Adjustment types:
  - **INCREASE:** Adds quantity (e.g., stock found, return from customer).
  - **DECREASE:** Reduces quantity (e.g., damage, loss, expired goods).
- Requires a mandatory reason (e.g., "Damaged stock", "Found during audit").
- On submission, the system:
  1. Creates an Adjustment document.
  2. Increments or decrements `total_stock` on the Product.
  3. Creates a **StockLog entry** (type: ADJUST).
- History of all adjustments is displayed in a filterable table.

### 5.2.8 Stock Transaction Log Module

**Files:** `stockLogController.js`, `stockLogRouter.js`, `stocktransactionSlice.js`, `StockTransaction.jsx`

**Functionality:**
- Displays a complete, chronological transaction log of all stock movements.
- Each entry shows: product name, movement type (IN/OUT/ADJUST), quantity, reason, previous stock, current stock, performed by, supplier, and date.
- Supports filtering by product and transaction type.
- This log is generated automatically by the system on every purchase, sale, and adjustment — it is never manually created.

### 5.2.9 Dashboard Module

**Files:** `dashboardController.js`, `dashboardRouter.js`, `Dashboardpage.jsx`

**Functionality:**
The dashboard provides a real-time business overview via four main sections:

**KPI Cards:**
- Total Revenue (sum of all sales totalAmount)
- Total Products (count of active products)
- Total Suppliers (count of active suppliers)
- Low Stock Alerts (count)

**Charts:**
- **Sales Trend Chart:** Monthly revenue bar/line chart using Chart.js
- **Top Products Chart:** Best-selling products by quantity

**Summary Table:**
- Recent Activities (last 10 stock log entries)
- Category-wise product breakdown

**Recent Purchases & Sales panels** for at-a-glance operational status.

### 5.2.10 Reports Module

**Files:** `reportController.js`, `reportRouter.js`, `ReportsPage.jsx`

**Functionality:**
- **Sales Report:** Total revenue, total transactions, average sale value, filterable by date range.
- **Purchase Report:** Total purchase cost, number of purchase orders, filterable by date.
- **Stock Report:** Current stock levels for all products, low-stock warnings.
- Admin-only module.

### 5.2.11 Settings Module

**Files:** `settingcontroller.js`, `settingRouter.js`, `settingsSlice.js`, `SettingsPage.jsx`

**Functionality:**
- Configures system-wide settings stored in the `Settings` collection.
- **RBAC Toggle (`enable_rbac`):** When enabled, Admin middleware enforces role restriction. When disabled, all users have full access.
- **Company Information:** Company name, address, phone — displayed on PDF invoices.
- **Tax/Discount defaults:** Default tax percentage and discount applied on new Sales forms.
- Settings are seeded with defaults on server startup (`seedDefaults()`).

### 5.2.12 User Management Module

**Files:** `authcontroller.js` (user management methods), `Userstatus.jsx`

**Functionality (Admin Only):**
- View all registered users.
- Activate or deactivate user accounts.
- Inactive users are blocked at the middleware level (HTTP 403 returned).
- Admin cannot deactivate their own account.

## 5.3 User Interface Description

### 5.3.1 Landing Page (HomePage)
The home page presents a professional introduction to the Inventory Management System with navigation links to login and sign up. It features a hero section and key feature highlights.

### 5.3.2 Login Page
Clean, centered login form with email and password fields. Form validation is performed on the client side before submission. On success, the user is redirected to their role-specific dashboard (AdminDashboard or StaffDashboard).

### 5.3.3 Dashboard Page
The most feature-rich page of the system. Displays:
- **4 KPI metric cards** (Total Revenue, Products, Suppliers, Low Stock)
- **Sales Trend Chart** (monthly bar chart using Chart.js)
- **Recent Activities Feed** (last 10 stock log entries)
- **Top Products table** (sorted by quantity sold)
- Role-sensitive: Admin sees all data; Staff sees operational data only

### 5.3.4 Product Page
Full-page data table with search and filter capabilities. Each row shows product name, SKU, category, cost price, selling price, stock quantity (with color-coded low-stock badge), and status. Action buttons for edit and deactivate. "Add Product" opens a slide-over modal form with full validation.

### 5.3.5 Supplier Page
Similar data table layout for supplier management. Displays supplier ID (auto-generated), name, contact person, phone, PAN/VAT, and status. Supports search and filtering by status.

### 5.3.6 Purchase Page
Complex form supporting multi-item purchase entry. The user selects a supplier, then adds multiple product rows (each with product, quantity, cost price, batch number, and expiry date). Real-time subtotal, discount, tax, and total amount calculation. Existing purchases displayed in a sortable table with detail view modal showing full invoice information.

### 5.3.7 Sales Page
Multi-product sales entry form with real-time total calculation. Product selection shows current stock and auto-fills selling price. Applies 13% VAT automatically. The sales history table supports searching by customer name or invoice number and detail view with profit analysis.

### 5.3.8 Adjustment Page
Simple form for stock adjustment with product dropdown, adjustment type (Increase/Decrease), quantity, and reason. Adjustment history table below.

### 5.3.9 Stock Transaction Page
Comprehensive log table with filtering. Color-coded badges for transaction types: IN (green), OUT (red), ADJUST (yellow). Shows before/after stock levels for full traceability.

### 5.3.10 Reports Page
Tab-based report interface for Sales, Purchase, and Stock reports with date range pickers and summary statistics cards.

### 5.3.11 Settings Page
Tab-based settings interface covering: General (company info), Security (RBAC toggle), Notifications (preferences), and Appearance. Admin-only access.

### 5.3.12 Profile Page
User profile page with editable full name and profile image upload. Cloudinary integration shows a real-time preview of the uploaded image.

---

# CHAPTER 6: TESTING

## 6.1 Testing Methodology

The system was tested using a combination of:

1. **Unit Testing:** Individual functions (e.g., controller methods, utility functions) were tested in isolation.
2. **Integration Testing:** API endpoints were tested using a REST client (Postman/Insomnia) to verify the complete request-response cycle, including database interactions.
3. **System Testing:** End-to-end testing of complete workflows (e.g., login → create purchase → verify stock update → view stock log).
4. **User Acceptance Testing (UAT):** The system was reviewed against the original requirements to verify all functional requirements are met.
5. **Security Testing:** JWT token tampering, unauthorized access to Admin routes, and inactive user access were all tested.

## 6.2 Test Cases

### Module 1: Authentication

| Test ID | Test Description | Input | Expected Result | Status |
|---------|----------------|-------|----------------|--------|
| TC-01 | Valid login | Correct email & password | JWT cookie set, redirect to dashboard | Pass |
| TC-02 | Invalid password | Correct email, wrong password | 401 Unauthorized, error toast | Pass |
| TC-03 | Non-existent user | Unknown email | 401 Unauthorized | Pass |
| TC-04 | Inactive user login | Email of INACTIVE user | 403 Access denied — account inactive | Pass |
| TC-05 | Token expiry | Expired JWT cookie | Redirect to login | Pass |
| TC-06 | Signup duplicate email | Existing email address | 400 error: Email already registered | Pass |
| TC-07 | Signup valid data | Valid name, email, password | Account created, JWT set | Pass |

### Module 2: Product Management

| Test ID | Test Description | Input | Expected Result | Status |
|---------|----------------|-------|----------------|--------|
| TC-08 | Add new product | All required fields | Product created, appears in table | Pass |
| TC-09 | Add product — duplicate SKU | Existing SKU | 400 error: SKU already exists | Pass |
| TC-10 | Edit product | Changed selling price | Record updated, reflected in table | Pass |
| TC-11 | Deactivate product | Click deactivate | Status changes to Inactive | Pass |
| TC-12 | Low stock display | Stock ≤ Reorder Level | Red badge on product row | Pass |

### Module 3: Purchase Management

| Test ID | Test Description | Input | Expected Result | Status |
|---------|----------------|-------|----------------|--------|
| TC-13 | Create purchase — single item | Supplier + 1 product × qty 10 | Purchase saved, stock +10 | Pass |
| TC-14 | Create purchase — multi-item | Supplier + 3 products | All stocks updated correctly | Pass |
| TC-15 | Stock IN log created | Any purchase | StockLog entry (type: IN) created | Pass |
| TC-16 | Cost price updated | Purchase with new cost price | `current_cost_price` updated on product | Pass |
| TC-17 | PDF invoice download | Click download icon | PDF file downloaded with correct data | Pass |
| TC-18 | Delete purchase | Admin deletes purchase | Stock reversed, log updated | Pass |

### Module 4: Sales Management

| Test ID | Test Description | Input | Expected Result | Status |
|---------|----------------|-------|----------------|--------|
| TC-19 | Create valid sale | Product with sufficient stock | Sale saved, stock decremented | Pass |
| TC-20 | Insufficient stock | Quantity > available stock | Validation error: insufficient stock | Pass |
| TC-21 | Stock OUT log created | Any sale | StockLog entry (type: OUT) created | Pass |
| TC-22 | VAT calculation | 13% tax applied | totalAmount = subtotal − discount + tax | Pass |
| TC-23 | Sales PDF invoice | Click generate invoice | PDF with customer, items, totals | Pass |
| TC-24 | Profit calculation | Cost price snapshot used | Profit = (price − costPrice) × qty | Pass |

### Module 5: Stock Adjustment

| Test ID | Test Description | Input | Expected Result | Status |
|---------|----------------|-------|----------------|--------|
| TC-25 | INCREASE adjustment | Product, qty: 5, reason | Stock + 5, log entry ADJUST created | Pass |
| TC-26 | DECREASE adjustment | Product, qty: 3, reason | Stock − 3, log entry ADJUST created | Pass |
| TC-27 | Adjustment without reason | Empty reason field | Client-side validation error | Pass |

### Module 6: Role-Based Access Control

| Test ID | Test Description | Input | Expected Result | Status |
|---------|----------------|-------|----------------|--------|
| TC-28 | Staff access Admin routes | Staff JWT, GET /api/settings | 403 Access denied: Admin required | Pass |
| TC-29 | Admin access all routes | Admin JWT | Full access granted | Pass |
| TC-30 | Unauthenticated API access | No cookie | 401 Unauthorized | Pass |
| TC-31 | RBAC disabled | enable_rbac: false | All authenticated users get Admin access | Pass |

### Module 7: Dashboard

| Test ID | Test Description | Input | Expected Result | Status |
|---------|----------------|-------|----------------|--------|
| TC-32 | KPI cards accuracy | Compare with DB counts | Values match actual DB aggregate | Pass |
| TC-33 | Sales trend chart | Monthly data loaded | Chart renders correctly with data | Pass |
| TC-34 | Low stock alert count | Products at/below reorder | Count matches product list filter | Pass |

---

# CHAPTER 7: CONCLUSION AND FUTURE ENHANCEMENT

## 7.1 Conclusion

The **Inventory Management System** developed using the MERN stack successfully addresses all the objectives set out at the beginning of this project. The system provides a comprehensive, secure, and user-friendly platform for managing inventory operations in a small-to-medium business environment.

The key achievements of this project are:

1. **Complete Business Coverage:** The system covers the full inventory lifecycle — from supplier and product setup, to purchase stock-in, sales stock-out, and manual adjustments — with every transaction automatically reflected in real-time stock levels and logged in the audit trail.

2. **Security Implementation:** JWT-based stateless authentication with HTTP-only cookies, Bcrypt password hashing, and role-based access control ensure that the system is secure against common web vulnerabilities.

3. **Modern Technology Stack:** The MERN stack provides a unified JavaScript development experience across the full stack, enabling efficient development and excellent performance. React.js with Redux Toolkit ensures a predictable, maintainable frontend codebase.

4. **Real-Time Capabilities:** Socket.io integration lays the foundation for real-time notifications and dashboard updates, making the system feel live and responsive.

5. **Professional Features:** PDF invoice generation, Cloudinary image management, Chart.js analytics, and a detailed stock transaction log give the system a production-ready, professional character.

6. **Responsive Design:** The UI is fully responsive, ensuring usability across desktop, tablet, and mobile devices.

This project demonstrates the practical application of modern full-stack web development principles — RESTful API design, component-based UI architecture, state management, NoSQL database modeling — and serves as a strong foundation for a production-grade inventory management solution.

## 7.2 Future Enhancements

The following enhancements are planned for future versions of the system:

### 7.2.1 Barcode and QR Code Integration
Integrating a barcode scanner or QR code reader would significantly speed up product lookup during purchases and sales transactions. Products could be identified by scanning their barcode, eliminating manual product selection.

### 7.2.2 Multi-warehouse / Multi-branch Support
Adding support for multiple storage locations (warehouses, branches) would allow businesses with multiple outlets to track inventory separately per location while maintaining a consolidated central view.

### 7.2.3 Bulk Data Import / Export
Implementing CSV or Excel import/export functionality would allow businesses to migrate existing inventory data into the system and extract reports in spreadsheet-compatible formats.

### 7.2.4 Customer and Receivables Module
Adding a dedicated customer management module with credit tracking would support businesses that sell on credit, enabling them to track outstanding balances and payment history per customer.

### 7.2.5 Advanced Analytics and Forecasting
Integrating machine learning models or statistical forecasting (e.g., demand prediction based on historical sales trends) would help businesses proactively manage stock levels and reduce both stockouts and overstock situations.

### 7.2.6 Mobile Application
Developing a companion mobile app (React Native or Flutter) connected to the same REST API would allow managers and staff to manage inventory operations on the go.

### 7.2.7 Email Notifications
Implementing automated email alerts for low stock thresholds, pending purchase orders, and system events using services like Nodemailer with Gmail SMTP would improve operational awareness.

### 7.2.8 Payment Gateway Integration
Integrating with local Nepalese payment gateways (e.g., eSewa, Khalti) for recording online payments within the sales module would enhance the financial tracking capabilities of the system.

### 7.2.9 Purchase Return and Credit Notes
Adding support for purchase returns to suppliers and issuing credit notes would provide a complete procure-to-pay workflow.

### 7.2.10 Progressive Web App (PWA)
Converting the React frontend into a Progressive Web App would allow offline functionality, push notifications, and an app-like experience on mobile devices without requiring a native app.

---

# REFERENCES

1. MongoDB Documentation. (2024). *The MongoDB Manual*. MongoDB, Inc. https://www.mongodb.com/docs/

2. OpenJS Foundation. (2024). *Express.js API Reference (v4.x)*. https://expressjs.com/en/4x/api.html

3. React Documentation. (2024). *React – A JavaScript Library for Building User Interfaces*. Meta Open Source. https://react.dev/

4. OpenJS Foundation. (2024). *Node.js Documentation*. https://nodejs.org/en/docs/

5. Redux Toolkit Documentation. (2024). *Redux Toolkit Introduction*. https://redux-toolkit.js.org/

6. Mongoose Documentation. (2024). *Mongoose v8 Documentation*. https://mongoosejs.com/docs/

7. JWT.io. (2024). *JSON Web Tokens - Introduction*. Auth0 Inc. https://jwt.io/introduction

8. Socket.IO Documentation. (2024). *Socket.IO Documentation*. https://socket.io/docs/v4/

9. Cloudinary Documentation. (2024). *Node.js SDK Quick Start*. Cloudinary Ltd. https://cloudinary.com/documentation/node_integration

10. PDFKit Documentation. (2024). *A PDF generation library for Node.js*. https://pdfkit.org/

11. Flanagan, D. (2020). *JavaScript: The Definitive Guide* (7th ed.). O'Reilly Media.

12. Haverbeke, M. (2022). *Eloquent JavaScript* (3rd ed.). No Starch Press.

13. Freeman, A. (2019). *Pro MERN Stack: Full Stack Web App Development with Mongo, Express, React, and Node* (2nd ed.). Apress.

14. Tribhuvan University, Faculty of Humanities and Social Sciences. (2023). *BCA Project Report Guidelines*. Kirtipur, Nepal.

---

# APPENDICES

## Appendix A: System Requirements

**Minimum Hardware Requirements:**
| Component | Minimum Requirement |
|-----------|-------------------|
| Processor | Dual-core 1.5 GHz or higher |
| RAM | 4 GB |
| Storage | 10 GB free disk space |
| Network | Broadband internet connection |
| Display | 1280×720 resolution minimum |

**Software Requirements:**
| Software | Requirement |
|----------|------------|
| Operating System | Windows 10/11, macOS 10.14+, Ubuntu 20.04+ |
| Web Browser | Chrome 88+, Firefox 85+, Edge 88+, Safari 14+ |
| Node.js (for development) | v18 LTS or higher |
| npm (for development) | v8.0 or higher |

## Appendix B: Installation Guide

### Backend Setup

```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Create environment file
# Create .env file with the following variables:
# PORT=3003
# MONGO_URI=<your_mongodb_atlas_connection_string>
# SecretKey=<your_jwt_secret_key>
# CLOUDINARY_CLOUD_NAME=<cloudinary_cloud_name>
# CLOUDINARY_API_KEY=<cloudinary_api_key>
# CLOUDINARY_API_SECRET=<cloudinary_api_secret>
# FRONTEND_URLS=http://localhost:3000,http://localhost:5173

# 4. Start development server
npm run dev
```

### Frontend Setup

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Create environment file  
# Create .env file with:
# REACT_APP_API_URL=http://localhost:3003

# 4. Start development server
npm start
```

## Appendix C: API Authentication Example

```javascript
// Login Request
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "Admin@123"
}

// Success Response (200 OK)
{
  "message": "Login successful",
  "user": {
    "_id": "65f2a3b4...",
    "full_name": "System Admin",
    "email": "admin@example.com",
    "role": "ADMIN",
    "status": "ACTIVE"
  }
}
// JWT token is set as HTTP-only cookie: Inventorymanagmentsystem
```

## Appendix D: Database Collection Summary

| Collection | Documents (Approx.) | Primary Use |
|-----------|-------------------|-------------|
| users | Low (5–50) | Authentication & user management |
| products | Medium (50–500) | Product catalog |
| categories | Low (5–30) | Product classification |
| suppliers | Medium (10–100) | Supplier directory |
| purchases | High (100s–1000s) | Purchase transaction history |
| sales | High (100s–1000s) | Sales transaction history |
| adjustments | Medium | Manual stock corrections |
| stocklogs | Very High | Auto-generated audit trail |
| settings | Low (10–20 keys) | System configuration |

---

*End of Project Report*

---

**Tribhuvan University – BCA 6th Semester**
**Inventory Management System**
**Academic Year: 2025/2026 (2082/2083 B.S.)**
