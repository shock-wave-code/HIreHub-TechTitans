# API Contract

This document defines the contract between the frontend and backend for the Internship Application Portal.  
It serves as the single source of truth for all API communication.

---

## 1. Authentication

###1.1 Register User
- **Method:** POST  
- **Endpoint:** /api/auth/register  
- **Description:** Registers a new student or faculty user.  

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "role": "student"
}


## 2. Login User
- **Method:** POST
- **Endpoint:** /api/auth/login
- **Description:** Authenticates a user and returns a JWT token.

**Request Body:** 
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}

Success Response (200 OK):

{
  "token": "jwt_token_here",
  "role": "student"
}

## 3. Internships

### 3.1 Create Internship (Faculty Only)
- **Method:** POST  
- **Endpoint:** /api/internships  
- **Description:** Faculty posts a new verified internship.  
Request Body:

{
  "title": "Frontend Developer Intern",
  "description": "Work on building UI features using React.",
  "skillsRequired": ["React", "JavaScript", "CSS"],
  "stipend": "5000 INR",
  "applicationDeadline": "2025-09-01",
  "location": "Remote",
  "companyName": "TechCorp",
  "duration": "3 months"
}

Success Response (201 Created):
{
  "message": "Internship created successfully",
  "internshipId": "67890"
}

### 3.2 Get All Internships
- **Method:** GET  
- **Endpoint:** /api/internships  
- **Description:** Returns a list of all available internships.  
- **Success Response (200 OK):
[
  {
    "id": "67890",
    "title": "Frontend Developer Intern",
    "companyName": "TechCorp",
    "location": "Remote",
    "stipend": "5000 INR",
    "applicationDeadline": "2025-09-01"
  }
]

### 3.3 Get Internship by ID
- **Method:** GET  
- **Endpoint:** /api/internships/:id  
- **Description:** Returns details of a specific internship.
- **Success Response (200 OK):
{
  "id": "67890",
  "title": "Frontend Developer Intern",
  "description": "Work on building UI features using React.",
  "skillsRequired": ["React", "JavaScript", "CSS"],
  "stipend": "5000 INR",
  "applicationDeadline": "2025-09-01",
  "location": "Remote",
  "companyName": "TechCorp",
  "duration": "3 months"
}

## 4. Applications

### 4.1 Apply for Internship (Student Only)
- **Method:** POST  
- **Endpoint:** /api/applications  
- **Description:** Student applies for an internship by uploading resume. 
- **Request Body (Multipart Form Data):

{
  "internshipId": "67890",
  "resume": "resume.pdf"
}

- **Success Response (201 Created):
{
  "message": "Application submitted successfully",
  "applicationId": "abc123"
}

### 4.2 View Applications for an Internship (Faculty Only)
- **Method:** GET  
- **Endpoint:** /api/internships/:id/applications  
- **Description:** Faculty can view all applications for their posted internship.
- **Success Response (200 OK):

[
  {
    "applicationId": "abc123",
    "studentName": "John Doe",
    "email": "john@example.com",
    "resumeUrl": "/uploads/resume.pdf",
    "status": "Pending"
  }
]

### 4.3 Update Application Status (Faculty Only)
- **Method:** PATCH  
- **Endpoint:** /api/applications/:id  
- **Description:** Faculty updates status of an application (accept/reject).  
- **Request Body:
{
  "status": "Accepted"
}

- **Success Response (200 OK):
{
  "message": "Application status updated successfully"
}

## 5. Notifications

### 5.1 Send Email Notification (System Triggered)
- **Method:** POST  
- **Endpoint:** /api/notifications/email  
- **Description:** Sends an email notification to the student about application status.  
- **Request Body:
{
  "recipientEmail": "john@example.com",
  "subject": "Application Status Update",
  "message": "Congratulations! Your application has been accepted."
}

- **Success Response (200 OK):
{
  "message": "Email sent successfully"
}

