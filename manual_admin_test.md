# Manual Admin Panel Testing Guide

## Test Steps

### 1. Admin Login Test
- Navigate to: `http://localhost:5173/admin/login`
- Enter credentials:
  - Mobile: `09302467932`
  - Password: `12345678`
- Click login button
- Verify redirect to admin dashboard

### 2. Dashboard Overview Test
- Check if dashboard loads properly
- Verify statistics are displayed:
  - Total Users
  - Total Consultations
  - Revenue information
  - Recent registrations

### 3. Users List Test
- Verify users list is displayed
- Check if user information includes:
  - User name and mobile
  - Pet details (type, name, breed, etc.)
  - Payment status
  - Registration date
  - Action buttons

### 4. Search Functionality Test
- Use search box to search for users
- Test search by:
  - Mobile number (e.g., `09125555555`)
  - User name
  - Date range filters
  - Payment status filters

### 5. User Details Test
- Click "مشاهده جزئیات" (View Details) button
- Verify detailed user information is displayed:
  - Complete user profile
  - Pet information
  - Consultation details
  - Payment information
  - Uploaded files (if any)

### 6. Navigation Test
- Test back button functionality
- Verify smooth navigation between sections
- Test logout functionality

## Expected Results

✅ **All functionality should work without errors**
✅ **Data should be displayed in Persian/Farsi**
✅ **Search should return relevant results**
✅ **User details should show comprehensive information**
✅ **Navigation should be smooth and intuitive**

## Issues to Look For

❌ **Loading errors or blank pages**
❌ **Missing or incorrect data**
❌ **Search not working**
❌ **Broken navigation**
❌ **Authentication issues**