# TRIBHUVAN UNIVERSITY
## Faculty of Humanities and Social Sciences
### Bachelor of Computer Applications (BCA)
### 6th Semester Project Report

---

# INVENTORY MANAGEMENT SYSTEM

**A Project Report Submitted in Partial Fulfillment of the Requirements for the Degree of Bachelor in Computer Application**

---

**Submitted by:**
[Student Full Name]
TU Registration No: [Registration Number]
Roll No: [Roll Number]

**Submitted to:**
Department of Computer Science and Information Technology
[College Name]
[College Address]

**Date:** February, 2026

---

## DECLARATION

I hereby declare that the project work entitled **"Inventory Management System"** submitted as partial fulfillment of the requirement for the degree of Bachelor of Computer Applications (BCA) under Tribhuvan University is prepared by me and has not been submitted earlier to any university or institution for the award of any degree or diploma.

**Signature:** ___________________
**Name:** [Student Full Name]
**Date:** February 2026
**Place:** Kathmandu, Nepal

---

## SUPERVISOR'S RECOMMENDATION

This is to certify that the project report entitled **"Inventory Management System"** submitted by [Student Full Name], TU Reg. No. [Registration Number] for the degree of Bachelor of Computer Applications (BCA) has been carried out under my supervision. This project work is found to be original and ready for submission.

**Supervisor:**
[Supervisor Name]
Designation: [Designation]
Department of Computer Science
[College Name]

**Date:** February 2026

---

## ACKNOWLEDGEMENT

First and foremost, I would like to express my deep gratitude to Tribhuvan University and my college for providing this opportunity to develop a real-world project as part of the BCA curriculum.

I am sincerely grateful to my project supervisor, **[Supervisor Name]**, for his/her constant guidance, encouragement, and support throughout the development of this project. His/her invaluable suggestions and technical insights greatly helped in bringing this project to fruition.

I would also like to extend my heartfelt thanks to the Head of the Department and all the faculty members of the Department of Computer Science for their continuous support and motivation.

Finally, I express my sincere gratitude to my family and friends for their moral support and encouragement throughout the project period.

---

## ABSTRACT

The **Inventory Management System** is a full-stack web application developed using the MERN stack (MongoDB, Express.js, React.js, and Node.js). The system is designed to streamline and automate the core business operations of inventory management, including product management, supplier management, purchase tracking, sales processing, stock adjustment, and comprehensive reporting.

The system implements a role-based access control (RBAC) mechanism with two distinct user roles — **Admin** and **Staff** — ensuring that each user accesses only the functionality relevant to their responsibility. Real-time updates are delivered using Socket.io, while JWT (JSON Web Token)-based authentication ensures secure user sessions.

Key features of the system include an interactive dashboard with analytics, PDF invoice generation, Cloudinary-based product image management, stock level monitoring with reorder-level alerts, and detailed transaction logs. The system is designed with a modern, responsive user interface built using React.js with Redux Toolkit for state management.

This documentation covers the complete software development lifecycle — from requirement analysis and system design to implementation, testing, and deployment strategy — following the standards expected of a Tribhuvan University BCA 6th Semester project.

---

## TABLE OF CONTENTS

| Chapter | Title | Page |
|---------|-------|------|
| | Declaration | i |
| | Supervisor's Recommendation | ii |
| | Acknowledgement | iii |
| | Abstract | iv |
| | Table of Contents | v |
| | List of Figures | vi |
| | List of Tables | vii |
| **1** | **Introduction** | 1 |
| 1.1 | Background | 1 |
| 1.2 | Problem Statement | 1 |
| 1.3 | Objectives | 2 |
| 1.4 | Scope of the Project | 2 |
| 1.5 | Limitations | 3 |
| 1.6 | Report Organization | 3 |
| **2** | **Literature Review** | 4 |
| 2.1 | Related Works | 4 |
| 2.2 | Review of Technologies | 5 |
| **3** | **System Analysis** | 8 |
| 3.1 | Existing System | 8 |
| 3.2 | Proposed System | 8 |
| 3.3 | Feasibility Study | 9 |
| 3.4 | Functional Requirements | 10 |
| 3.5 | Non-Functional Requirements | 11 |
| **4** | **System Design** | 12 |
| 4.1 | System Architecture | 12 |
| 4.2 | Database Design | 14 |
| 4.3 | Use Case Diagram | 20 |
| 4.4 | Data Flow Diagram | 21 |
| 4.5 | Sequence Diagrams | 22 |
| **5** | **Implementation** | 23 |
| 5.1 | Tools and Technologies Used | 23 |
| 5.2 | Module Description | 24 |
| 5.3 | User Interface Description | 28 |
| **6** | **Testing** | 32 |
| 6.1 | Testing Methodology | 32 |
| 6.2 | Test Cases | 33 |
| **7** | **Conclusion and Future Enhancement** | 37 |
| 7.1 | Conclusion | 37 |
| 7.2 | Future Enhancements | 37 |
| | **References** | 39 |
| | **Appendices** | 40 |

---

# CHAPTER 1: INTRODUCTION

## 1.1 Background

In today's rapidly evolving business environment, efficient management of inventory is critical to the success of any organization dealing with physical goods. Traditional paper-based or spreadsheet-based inventory management is prone to errors, delays, and data inconsistencies. As businesses grow, the complexity of managing products, suppliers, purchases, and sales increases exponentially, making manual management impractical and inefficient.

An **Inventory Management System (IMS)** is a software solution designed to track, manage, and organize products and stock levels across a business lifecycle. With the proliferation of internet access and web technologies, web-based inventory systems have become increasingly popular as they provide real-time access from anywhere, multi-user collaboration, and centralized data management.

This project presents the development of a **web-based Inventory Management System** using the MERN stack — MongoDB, Express.js, React.js, and Node.js — which are modern, industry-standard technologies widely adopted for building scalable and high-performance web applications. The system was developed to address the real-world operational needs of small-to-medium businesses (SMBs) in Nepal, providing a comprehensive yet user-friendly platform for managing all aspects of inventory operations.

## 1.2 Problem Statement

Many small and medium-sized businesses in Nepal still rely on manual methods — such as paper registers or simple spreadsheet tools — for managing their inventory. This approach leads to several critical problems:

1. **Data Inconsistency:** Manually maintained records are prone to errors, duplication, and inconsistency, leading to incorrect stock counts and financial discrepancies.
2. **Lack of Real-Time Information:** Without a centralized system, it is impossible to get real-time visibility into current stock levels, purchase history, or sales performance.
3. **Inefficient Supplier Management:** Tracking supplier details, purchase invoices, and payment modes manually is cumbersome and error-prone.
4. **No Role-Based Access Control:** In a multi-user environment, manual systems lack the ability to restrict access based on user roles, leading to potential data misuse.
5. **Poor Reporting:** Generating meaningful reports (e.g., stock reports, profit/loss summaries, category-wise analysis) from manual records is time-consuming and often inaccurate.
6. **No Audit Trail:** Manual systems do not maintain a detailed transaction history, making it difficult to investigate discrepancies.

This project addresses all the above problems by providing a fully automated, role-aware, web-based Inventory Management System.

## 1.3 Objectives

The key objectives of this project are:

1. To develop a web-based inventory management system using the MERN stack (MongoDB, Express.js, React.js, Node.js).
2. To implement a secure, JWT-based user authentication system with role-based access control (RBAC) for Admin and Staff roles.
3. To provide complete CRUD (Create, Read, Update, Delete) operations for products, categories, suppliers, purchases, and sales.
4. To implement real-time stock tracking that automatically updates inventory levels upon purchase and sale transactions.
5. To provide a stock adjustment module for handling discrepancies such as damage, returns, and manual corrections.
6. To generate a detailed stock transaction log for complete auditability.
7. To provide an analytics dashboard with visual charts for sales trends, stock summaries, and financial metrics.
8. To support PDF invoice generation for purchase and sales transactions.
9. To implement a responsive, modern user interface accessible on desktop and mobile devices.
10. To incorporate real-time notifications using Socket.io for system events.

## 1.4 Scope of the Project

The **Inventory Management System** covers the following scope:

**Included in Scope:**
- User account management with Admin and Staff roles
- Product and category management (with SKU, pricing, stock levels, reorder levels)
- Supplier management with contact information and PAN/VAT details
- Purchase order management with multi-item support, tax, and discount calculations
- Sales management with customer details, product selection, discounts, and tax (13% VAT)
- Stock adjustment for manual corrections (increase/decrease)
- Stock transaction log for complete audit trail
- Dashboard with KPIs, sales trend charts, and recent activity feed
- Report generation (sales report, stock report, purchase report)
- Settings management (system configuration, RBAC toggle)
- User profile management with Cloudinary-based image upload
- PDF invoice generation for purchases and sales

**Excluded from Scope:**
- Multi-warehouse/multi-branch inventory management
- Integration with external accounting software (e.g., Tally, QuickBooks)
- Barcode/QR code scanner integration
- Mobile application (iOS/Android)
- E-commerce front-end for customers

## 1.5 Limitations

While the system provides a comprehensive solution, the following limitations exist:

1. The system is currently designed for single-location business use and does not support multi-warehouse operations.
2. There is no integration with physical barcode scanners or POS hardware terminals.
3. The system does not support multi-currency transactions; all prices are assumed to be in Nepalese Rupees (NPR).
4. Advanced forecasting or AI-driven demand prediction is not included.
5. The system does not provide integration with third-party payment gateways.
6. Bulk data import/export via CSV or Excel is not implemented in the current version.

## 1.6 Report Organization

This report is organized into the following chapters:

- **Chapter 1 – Introduction:** Background, problem statement, objectives, scope, and limitations of the project.
- **Chapter 2 – Literature Review:** Review of related work and the technologies used in the project.
- **Chapter 3 – System Analysis:** Analysis of the existing system, proposed system, feasibility study, and system requirements.
- **Chapter 4 – System Design:** System architecture, database design, use case diagrams, DFDs, and sequence diagrams.
- **Chapter 5 – Implementation:** Tools used, module descriptions, and user interface screenshots.
- **Chapter 6 – Testing:** Testing methodology and test case documentation.
- **Chapter 7 – Conclusion and Future Enhancement:** Summary of the project and potential future improvements.

---

# CHAPTER 2: LITERATURE REVIEW

## 2.1 Related Works

Several inventory management systems and research works exist in the domain of web-based inventory tracking. Below is a review of related works:

**1. Odoo Community Edition (Open Source ERP)**
Odoo is a widely used open-source ERP solution with inventory management capabilities. It provides features like multi-warehouse management, product variants, and purchase order tracking. However, it is complex to configure for small businesses with limited technical expertise. Unlike Odoo, this project is purpose-built for simplicity and ease of use for SMBs in Nepal.

**2. Zoho Inventory**
Zoho Inventory is a cloud-based inventory management SaaS tool offering comprehensive features including order management and integration with e-commerce platforms. It is a paid solution that may not be affordable for small Nepali businesses. The proposed system provides similar core functionality in a locally deployable, open-source manner.

**3. Academic Research: "Design and Implementation of an Inventory Management System Using Web Technology" (Various TU BCA Projects)**
Previous BCA projects at Tribhuvan University have implemented inventory systems using older technologies like PHP/MySQL or JSP/Servlet. These systems lack modern architectural patterns such as RESTful API design, real-time communication, and state management. This project improves upon those designs by adopting the MERN stack, which enables building scalable, component-driven, single-page applications with real-time capabilities.

**4. MEAN/MERN Stack Research**
Several research papers confirm the suitability of the MERN stack for building real-time web applications. Ahmad et al. (2018) demonstrated that Node.js-based servers outperform traditional PHP servers in handling concurrent requests, making it more suitable for multi-user inventory systems. MongoDB's flexible document model also reduces impedance mismatch between application data structures and database storage.

## 2.2 Review of Technologies

### 2.2.1 MongoDB
MongoDB is a NoSQL, document-oriented database that stores data as BSON (Binary JSON) documents. Unlike relational databases, MongoDB does not require a fixed schema, allowing for flexible data modeling. Key advantages for this project include:
- **Flexible Schema:** Product, supplier, and sales documents can evolve without database migrations.
- **Embedded Documents:** Purchase items are stored as embedded arrays within purchase documents, reducing complex JOINs.
- **Rich Query Language:** MongoDB's aggregation framework enables complex analytics for dashboard metrics.
- **Mongoose ODM:** The Mongoose library provides schema validation, type casting, and middleware (hooks) for MongoDB in Node.js.

### 2.2.2 Express.js
Express.js is a minimal, unopinionated web application framework for Node.js. It provides a robust set of features for building web and API servers. In this project, Express.js is used to:
- Define RESTful API routes organized by business module (auth, product, supplier, sales, purchase, etc.)
- Apply middleware for authentication (JWT verification), request parsing, and CORS handling
- Structure the application using the MVC (Model-View-Controller) architectural pattern

### 2.2.3 React.js
React.js is a component-based JavaScript library developed by Meta (Facebook) for building user interfaces. Key React.js features used in this project:
- **Component Architecture:** Each page and UI element (forms, tables, modals) is a reusable React component.
- **React Router DOM:** Client-side routing is implemented using React Router v6, enabling a Single Page Application (SPA) experience without full page reloads.
- **Hooks:** Functional components with React hooks (`useState`, `useEffect`, `useRef`) are used throughout for state and lifecycle management.
- **React Hot Toast:** User-friendly notification toasts for success/error feedback.

### 2.2.4 Node.js
Node.js is a JavaScript runtime built on Chrome's V8 engine that enables server-side JavaScript execution. Its event-driven, non-blocking I/O model makes it highly efficient for handling concurrent requests. In this project, Node.js serves as the backend runtime powering the Express.js server.

### 2.2.5 Redux Toolkit
Redux Toolkit is the official, opinionated toolset for Redux state management in React applications. It is used in this project to manage global application state including:
- Authentication state (`authSlice`) — current logged-in user, token
- Products, categories, suppliers, sales, purchases — separate slices for each business entity
- Thunk-based asynchronous API calls using `createAsyncThunk`

### 2.2.6 JSON Web Token (JWT)
JWT is an open standard (RFC 7519) for secure transmission of information between parties as a JSON object. In this system:
- Upon successful login, the server generates a signed JWT stored in an HTTP-only cookie.
- The JWT contains the user's ID and is verified on every protected API request by the `authmiddleware`.
- Token expiry ensures session management without server-side session storage.

### 2.2.7 Socket.io
Socket.io is a library for real-time, bidirectional event-based communication between browser and server. It is based on the WebSocket protocol with fallback support. In this project, Socket.io provides real-time dashboard updates and activity notifications.

### 2.2.8 Cloudinary
Cloudinary is a cloud-based image and video management service. It is used in this project for:
- Uploading and storing user profile images
- Returning secure CDN-hosted image URLs for display in the UI

### 2.2.9 PDFKit
PDFKit is a Node.js library for generating PDF documents programmatically. It is used in this system to generate downloadable purchase and sales invoices in PDF format.

### 2.2.10 Bcrypt.js
Bcrypt.js is a library for hashing passwords securely using the bcrypt algorithm. All user passwords are hashed with 10 salt rounds before being stored in the database, ensuring that plaintext passwords are never persisted.

---

# CHAPTER 3: SYSTEM ANALYSIS

## 3.1 Existing System

The existing methods of inventory management in small businesses in Nepal typically involve:

1. **Manual Registers:** Physical ledger books used to record stock-in and stock-out transactions. These are prone to human error, difficult to search, and impossible to query analytically.
2. **Spreadsheets (MS Excel/Google Sheets):** A step above manual registers, spreadsheets allow basic calculations but lack multi-user support, access control, automatic stock updates, and real-time features.
3. **Generic Accounting Software:** Some businesses use simple accounting tools like Tally, but these are not designed specifically for inventory with modern web-based access and are expensive.

**Drawbacks of the Existing System:**
- No centralized access — files are stored on individual machines
- No authentication or role-based access control
- High risk of data loss
- No support for reporting or analytics
- Cannot track who performed which operation
- No real-time stock update upon sales/purchases
- Inefficient for managing multiple product categories and suppliers

## 3.2 Proposed System

The proposed **web-based Inventory Management System** overcomes all limitations of the existing system by providing:

- **Centralized Cloud Database:** All data is stored in MongoDB Atlas, accessible from anywhere.
- **Secure Authentication:** JWT-based login with password hashing using Bcrypt.
- **Role-Based Access Control:** Admin users have full access; Staff users have limited operational access.
- **Automated Stock Management:** Stock levels are automatically adjusted when purchases are recorded (stock IN) and when sales are created (stock OUT).
- **Comprehensive Reporting:** Pre-built reports for sales, purchases, and stock summaries.
- **Real-Time Dashboard:** KPI cards, charts, and recent activity feed updated via Socket.io.
- **PDF Invoice Generation:** Professional PDF invoices for purchases and sales.
- **Modern Web Interface:** Responsive, mobile-friendly React.js UI accessible from any browser.

| Feature | Existing System | Proposed System |
|---------|----------------|-----------------|
| Data Storage | Paper/Excel | MongoDB (Cloud) |
| Multi-user Access | No | Yes |
| Role-Based Control | No | Yes (Admin/Staff) |
| Real-time Stock Update | No | Yes (Automatic) |
| Analytics & Reports | No | Yes (Charts + PDF) |
| Remote Access | No | Yes (Web Browser) |
| Invoice Generation | Manual | Automated PDF |
| Audit Trail | No | Yes (Stock Log) |

## 3.3 Feasibility Study

### 3.3.1 Technical Feasibility
The MERN stack (MongoDB, Express.js, React.js, Node.js) is a mature, well-documented, and widely adopted technology stack. All components used in this project are open-source with active community support. The development environment requires Node.js installed on the machine; deployment can be done on cloud platforms such as Vercel (frontend), Render/Railway (backend), and MongoDB Atlas (database). All technologies are technically feasible and available without cost for development and low-scale production use.

### 3.3.2 Economic Feasibility
The development costs for this project primarily consist of developer time. The following tools and services are used at zero or minimal cost:
- **MongoDB Atlas (Free Tier):** 512 MB storage, sufficient for the project scope
- **Cloudinary (Free Tier):** 25 GB storage + bandwidth
- **Node.js, Express.js, React.js:** Open-source, free
- **Vercel/Render Hosting:** Hobby tier available for free

Total estimated cost: **NPR 0 – 2,000** (domain registration only, if required). The project is economically feasible.

### 3.3.3 Operational Feasibility
The system is designed with a clean, intuitive user interface. Staff members with basic computer literacy can learn to use the system within a short training period. The admin panel provides comprehensive control, and the staff dashboard is simplified to show only relevant features. Context-sensitive form validation provides real-time feedback. The system is operationally feasible.

### 3.3.4 Schedule Feasibility
The project was developed over approximately **three months**, covering requirement analysis, system design, implementation, testing, and documentation. This timeline is achievable within a BCA 6th semester project schedule.

## 3.4 Functional Requirements

The functional requirements describe what the system must do:

### FR-01: User Authentication and Management
- The system shall allow users to register with full name, email, password, and role.
- The system shall authenticate users via email and password.
- The system shall issue JWT tokens upon successful login, stored in HTTP-only cookies.
- The system shall support profile image upload via Cloudinary.
- The system shall allow Admin users to manage user status (Active/Inactive).

### FR-02: Product Management
- The system shall allow adding products with name, SKU, category, description, cost price, selling price, and reorder level.
- The system shall display current stock quantity for each product.
- The system shall allow editing and deactivating products.
- The system shall prevent deletion of products with existing transactions.
- The system shall display a low-stock warning when stock falls below the reorder level.

### FR-03: Category Management
- The system shall allow creating, editing, and deactivating product categories.
- Each category shall have a name, description, and status.

### FR-04: Supplier Management
- The system shall allow adding suppliers with name, contact person, phone, email, address, PAN/VAT number, and auto-generated supplier ID.
- The system shall allow editing and deactivating suppliers.
- The system shall prevent deletion of suppliers with associated purchase records.

### FR-05: Purchase Management
- The system shall allow recording multi-item purchase orders linked to a supplier.
- Each purchase shall include invoice number, items (product, quantity, cost price, batch number, expiry date), discount, tax, total amount, and payment type.
- Recording a purchase shall automatically increase the stock of all included products.
- The system shall support generating a PDF invoice for each purchase.

### FR-06: Sales Management
- The system shall allow recording sales transactions with customer name, product selection, quantity, discount (%), tax (13% VAT), and payment type.
- Recording a sale shall automatically decrease the stock of sold products.
- The system shall prevent sales of products with insufficient stock.
- The system shall support generating a PDF invoice for each sale.
- Sales shall capture cost price snapshot for profit calculation.

### FR-07: Stock Adjustment
- The system shall allow authorised users to manually adjust stock (INCREASE or DECREASE) with a reason.
- Each adjustment shall be logged in the stock log with details of who performed it.

### FR-08: Stock Transaction Log
- The system shall maintain a complete log of all stock movements (IN from purchase, OUT from sales, ADJUST from manual adjustments).
- Each log entry shall record product, type, quantity, reason, previous stock, current stock, date, and the user who performed the action.

### FR-09: Dashboard and Analytics
- The system shall display KPI cards: Total Revenue, Total Products, Total Suppliers, Low Stock Alerts.
- The system shall display a sales trend chart (monthly/weekly).
- The system shall display recent activities and top-performing products.
- The system shall display total purchase cost vs. revenue comparisons.

### FR-10: Reports
- The system shall provide downloadable reports for sales, purchases, and stock.
- Reports shall be filterable by date range.

### FR-11: Settings
- Admin shall be able to configure system settings including RBAC toggle, company information, tax rates, and notification preferences.

## 3.5 Non-Functional Requirements

### NFR-01: Security
- All passwords must be hashed using Bcrypt before storage.
- Authentication tokens must be signed with a secret key and stored in HTTP-only cookies.
- All protected routes must verify the JWT token before processing.
- Role-based middleware must restrict Admin-only operations from Staff users.

### NFR-02: Performance
- The system shall respond to standard CRUD API requests within 2 seconds under normal network conditions.
- The dashboard shall load within 3 seconds on a standard broadband connection.
- MongoDB aggregation queries for analytics shall be optimized with proper indexing.

### NFR-03: Usability
- The user interface shall be responsive and accessible on desktops, tablets, and mobile devices.
- The system shall provide immediate visual feedback (toast notifications) for all user actions.
- Form validations shall be performed both on the client side and server side.

### NFR-04: Reliability
- The system shall use MongoDB Atlas with built-in replication for data durability.
- The HTTP server shall handle errors gracefully and return appropriate HTTP status codes.
- The JWT authentication system shall handle token expiry and invalid tokens without crashing.

### NFR-05: Maintainability
- The codebase shall follow a modular MVC architecture on the backend.
- The frontend shall use Redux Toolkit for predictable, centralized state management.
- Each business entity shall have its own dedicated Model, Controller, Router, Redux Slice, and Page component.

### NFR-06: Scalability
- The RESTful API design allows future clients (mobile apps, third-party integrations) to connect without changes to the backend.
- MongoDB's horizontal scalability supports future growth in data volume.
