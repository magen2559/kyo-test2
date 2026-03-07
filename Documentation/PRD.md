# Product Requirements Document (PRD)

**Product:** KYO KL Digital Ecosystem
**Prepared for:** KYO KL
**Prepared by:** Tesseracq Labs
**Author:** Tivenesh A/L Srinivasan
**Version:** 1.0
**Date:** March 2026

---

## 1. Executive Summary

### 1.1 Vision

The goal of the KYO Digital Ecosystem is to build a unified platform that replaces fragmented systems used for ticketing, table reservations, and guest management.

The system will provide a seamless digital experience for customers while giving club management full control over events, bookings, customer data, and operations.

### 1.2 Current Problems

The current workflow relies on multiple disconnected platforms:

| Function | Current System |
|---|---|
| Ticket Sales | Third-party platform |
| Table Booking | WhatsApp |
| Entry Verification | Manual |
| Customer Data | Not owned |
| Analytics | Limited |

This leads to:
- Fragmented customer experience
- Manual operational work
- Loss of valuable customer data
- Reliance on third-party systems

### 1.3 Proposed Solution

Build a connected ecosystem consisting of:
- **Customer Mobile App**
- **Staff Scanner App**
- **Management Dashboard (Web)**

These systems will share a unified backend and database.

> **Note (Implementation Modification):** The Customer App and Staff Scanner App are combined into a **single mobile application** with role-based views. The Management Dashboard is a separate **web application**.

---

## 2. Product Goals

### 2.1 Business Goals

- Increase ticket conversion rate
- Improve table booking efficiency
- Reduce operational friction
- Capture and analyze customer data
- Improve repeat customer retention
- Reduce reliance on third-party ticket platforms

### 2.2 User Goals

**Customers should be able to:**
- Discover upcoming events
- Purchase tickets quickly
- Reserve tables easily
- Enter the venue without delays

**Staff should be able to:**
- Verify tickets quickly
- Manage tables efficiently

**Management should be able to:**
- Control events and pricing
- Track revenue
- Analyze customer behavior

---

## 3. Product Scope

### 3.1 Ecosystem Components

The system consists of three main applications:

#### Customer Mobile Application
Used by customers to browse events, purchase tickets, and reserve tables.

#### Staff Scanner Application
Used by security staff to verify tickets at entry.

> **Implementation Note:** Customer App and Staff Scanner App are built as a **single React Native Expo application** with role-based navigation.

#### Management Dashboard
Used by management to control events, tickets, bookings, and operations.

> **Implementation Note:** Built as a separate **web application**.

---

## 4. User Roles

### 4.1 Customer

**Permissions:**
- View events
- Purchase tickets
- Book tables
- Manage reservations

**Restrictions:**
- Cannot view other customers
- Cannot modify system settings

### 4.2 Door Staff

**Permissions:**
- Scan tickets
- Verify entry

**Restrictions:**
- Cannot modify bookings
- Cannot access customer data

### 4.3 Management

**Permissions:**
- Create and manage events
- Manage ticket pricing and limits
- View revenue data
- Configure tables

### 4.4 System Administrator

**Permissions:**
- Full infrastructure access
- System monitoring
- Role management

---

## 5. Customer Mobile App Requirements

### 5.1 Authentication

Users must be able to:
- Register an account
- Log in using:
  - Email
  - Phone number
  - Apple / Google login
- Verify age eligibility

### 5.2 Profile Management

Users can manage:
- Name
- Contact details
- Music preferences
- Notification preferences

### 5.3 Event Discovery

Users must be able to:
- Browse upcoming events
- Filter events by:
  - Date
  - DJ
  - Genre
  - Room

Each event page includes:
- Event title
- Event description
- Lineup
- Event time
- Ticket availability

### 5.4 Ticket Purchase

Users must be able to:
- Select ticket type
- Select quantity
- Complete payment
- Receive digital ticket

### 5.5 Ticket Types

Possible ticket tiers include:
- Early Bird
- General Admission
- Student Night
- Promotional

Ticket availability may be limited.

### 5.6 Digital Tickets

The system will generate a unique QR code ticket.

Ticket contains:
- Ticket ID
- Event ID
- User ID
- Timestamp

QR codes must prevent duplication.

### 5.7 Table Reservations

Users must be able to:
- View available tables
- See table capacity
- See minimum spend requirement

Users can reserve a table by paying a deposit.

### 5.8 Booking Confirmation

After booking:
- Reservation confirmation is shown
- User receives confirmation notification

### 5.9 Notifications

Users may receive:
- Event announcements
- Ticket availability alerts
- Reservation reminders

Users can disable notifications.

---

## 6. Staff Scanner App

### 6.1 QR Ticket Scanning

Staff must be able to:
- Open scanner instantly
- Scan QR code
- Verify ticket validity

### 6.2 Validation Result

Scanner displays:
- Ticket valid / invalid
- Ticket type
- Guest name
- Table reservation (if applicable)

### 6.3 Entry Logging

System records:
- Entry timestamp
- Staff member ID
- Event ID

Duplicate entry attempts must be blocked.

---

## 7. Management Dashboard

### 7.1 Event Management

Management must be able to:
- Create events
- Edit event details
- Publish or unpublish events

### 7.2 Ticket Configuration

Management must configure:
- Ticket types
- Ticket prices
- Ticket quantities
- Sales window

### 7.3 Table Management

Management must:
- Configure table layout
- Assign table numbers
- Set minimum spend requirements

### 7.4 Booking Management

Management must be able to:
- View bookings
- View table reservations
- View ticket sales

### 7.5 Revenue Dashboard

Dashboard should display:
- Ticket revenue
- Table booking revenue
- Total event revenue

---

## 8. System Architecture

### 8.1 High-Level Architecture

System consists of:
- Mobile Applications (React Native Expo)
- Backend API (Supabase)
- Database (PostgreSQL via Supabase)
- Admin Dashboard (Web)

All components communicate through a centralized backend.

### 8.2 Backend Services

Backend responsibilities:
- Authentication
- Payment processing
- Ticket generation
- Booking management
- Notification delivery

---

## 9. Database Entities

Core database tables include:
- **Users**
- **Events**
- **Tickets**
- **Orders**
- **Tables**
- **Reservations**
- **Entry Logs**

Relationships will connect users to bookings and event attendance.

---

## 10. Security Requirements

System must include:
- Encrypted user data
- Secure payment processing
- Prevention of ticket duplication
- Role-based access control

---

## 11. Performance Requirements

- Ticket scanning must complete within **1 second**
- App loading time must be under **3 seconds**
- System must support high traffic during ticket releases

---

## 12. Scalability

System must handle:
- High concurrency during ticket sales
- Peak traffic on event nights

Cloud infrastructure should allow horizontal scaling.

---

## 13. MVP Definition

The initial product release will include:

### Customer App
- Account registration
- Event discovery
- Ticket purchase
- Digital tickets
- Table reservations

### Scanner App
- QR scanning
- Ticket validation

### Management Dashboard
- Event creation
- Ticket configuration
- Booking viewing

---

## 14. Future Enhancements

Potential future features include:
- Interactive club floor map
- Loyalty program
- Promoter referral system
- Advanced analytics
- AI event recommendations

---

## 15. Success Metrics

The product will be evaluated based on:
- Ticket conversion rate
- Monthly active users
- Repeat customer rate
- Table booking utilization

---

## 16. Development Timeline (Estimated)

| Phase | Duration |
|---|---|
| Product Design | 3 weeks |
| Development | 10–12 weeks |
| Testing | 3 weeks |
| Launch | 1 week |

---

## 17. Risks

Potential risks include:
- Payment integration challenges
- High traffic during ticket launches
- Customer migration from existing systems

Mitigation strategies will include staged rollouts and testing.

---

## Recommendation for Next Steps

To move forward with development, the following documents should be prepared next:
1. System Architecture Diagram
2. Database Schema Design
3. User Journey Flow Diagrams
4. UI/UX Wireframes

These documents will allow engineering teams to begin implementation.

---

## Additional Critical Documents Needed

To elevate this from concept to production-ready:

1. **Full Database Schema** — Tables, relations, fields, constraints
2. **User Journey Diagrams** — How every action flows end-to-end
3. **API Endpoint Specification** — Every route, method, request/response format

---

## Implementation Notes

> This PRD has been modified to reflect the actual implementation approach:
> - The **Customer App** and **Staff Scanner App** are combined into a **single React Native Expo mobile application** with role-based navigation (customer view vs. staff/walk-in scanner view).
> - The **Management Dashboard** is a separate **web application**, deployed on **Vercel**.
> - The backend uses **Supabase** (PostgreSQL + Auth + Storage + Edge Functions).
