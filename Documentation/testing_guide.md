# KYO Mobile App Testing Guide

This document outlines the testing parameters for the KYO Digital Ecosystem mobile application. It is divided into automated testing handled by Playwright (for web-exported views) and manual testing procedures.

## Features to Test & Expected Results

### 1. User Authentication
*   **Feature**: Sign Up / Sign In via Email.
*   **Expected Result**: User successfully logs in and is navigated to the Home screen. A session is created in Supabase. Invalid credentials show an appropriate error message.

### 2. Event Discovery & Navigation
*   **Feature**: Browse events on Home and Lineup screens.
*   **Expected Result**: Home screen displays featured/upcoming events. Lineup screen correctly filters events by 'All', 'Upcoming', and 'Past'. Tapping an event navigates to the Event Detail screen.

### 3. Ticket Purchase Flow
*   **Feature**: Purchasing a ticket from the Event Detail screen.
*   **Expected Result**: User can select quantity, proceed to checkout, and complete the transaction. A new record is created in the `tickets` Supabase table. The user is navigated to the Digital Pass screen showing a QR code.

### 4. Table Reservation
*   **Feature**: Reserving a table from the Map screen.
*   **Expected Result**: User can select an available table, proceed to checkout, pay the deposit, and get a confirmation. A record is created in the `reservations` table. The table becomes unavailable.

### 5. Digital Passes & Profile
*   **Feature**: Viewing purchased tickets and updating profile.
*   **Expected Result**: Profile screen shows user info. 'My Tickets & Passes' lists all valid reservations and tickets. Opening an item displays the correct QR code data. Profile details (Name, Phone, Music Preferences) can be edited and saved.

### 6. Admin / Staff Scanner
*   **Feature**: Door staff scanning QR codes for entry.
*   **Expected Result**: Scanning a valid QR code shows guest info and allows 'CHECK IN'. Status updates to 'USED' or 'CHECKED_IN'. Subsequent scans of the same QR code result in a 'DUPLICATE' or 'ALREADY USED' warning. Actions are logged in `entry_logs`.

## Running Automated Tests

To run the automated tests using Playwright:

1. Ensure all dependencies are installed, including Playwright browsers.
2. Start the local development server (web mode): `npm run web` or `npx expo start --web`.
3. Run the Playwright test suite: `npx playwright test`.

The automated tests primarily cover the critical flows that can be verified in a browser environment (Expo Web). Device-specific hardware features (like the actual camera for scanning) should be tested manually on a physical device using Expo Go.
