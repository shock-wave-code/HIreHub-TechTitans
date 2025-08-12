const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// In-memory data storage
let users = [];
let internships = [];
let applications = [];
let userIdCounter = 1;
let internshipIdCounter = 1;
let applicationIdCounter = 1;

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Internship Application Portal API',
      version: '1.0.0',
      description: 'API for managing internship applications between students and faculty',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./index.js'], // Path to the API docs
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Middleware for JWT authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Middleware for role-based access
const requireRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ error: `Access denied. ${role} role required.` });
    }
    next();
  };
};

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - role
 *       properties:
 *         name:
 *           type: string
 *           description: Full name of the user
 *         email:
 *           type: string
 *           format: email
 *           description: Email address of the user
 *         password:
 *           type: string
 *           description: Password for the user account
 *         role:
 *           type: string
 *           enum: [student, faculty]
 *           description: Role of the user
 *     Internship:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - skillsRequired
 *         - stipend
 *         - applicationDeadline
 *         - location
 *         - companyName
 *         - duration
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         skillsRequired:
 *           type: array
 *           items:
 *             type: string
 *         stipend:
 *           type: string
 *         applicationDeadline:
 *           type: string
 *           format: date
 *         location:
 *           type: string
 *         companyName:
 *           type: string
 *         duration:
 *           type: string
 */

// Authentication Routes

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 userId:
 *                   type: string
 *       400:
 *         description: Bad request
 *       409:
 *         description: User already exists
 */
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate role
    if (!['student', 'faculty'].includes(role)) {
      return res.status(400).json({ error: 'Role must be either "student" or "faculty"' });
    }

    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      id: userIdCounter.toString(),
      name,
      email,
      password: hashedPassword,
      role,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    userIdCounter++;

    res.status(201).json({
      message: 'User registered successfully',
      userId: newUser.id
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 role:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Internship Routes

/**
 * @swagger
 * /api/internships:
 *   post:
 *     summary: Create a new internship (Faculty only)
 *     tags: [Internships]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Internship'
 *     responses:
 *       201:
 *         description: Internship created successfully
 *       403:
 *         description: Access denied - Faculty role required
 */
app.post('/api/internships', authenticateToken, requireRole('faculty'), (req, res) => {
  try {
    const {
      title,
      description,
      skillsRequired,
      stipend,
      applicationDeadline,
      location,
      companyName,
      duration
    } = req.body;

    // Validate required fields
    if (!title || !description || !skillsRequired || !stipend || 
        !applicationDeadline || !location || !companyName || !duration) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Create new internship
    const newInternship = {
      id: internshipIdCounter.toString(),
      title,
      description,
      skillsRequired: Array.isArray(skillsRequired) ? skillsRequired : [skillsRequired],
      stipend,
      applicationDeadline,
      location,
      companyName,
      duration,
      facultyId: req.user.userId,
      createdAt: new Date().toISOString()
    };

    internships.push(newInternship);
    internshipIdCounter++;

    res.status(201).json({
      message: 'Internship created successfully',
      internshipId: newInternship.id
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/internships:
 *   get:
 *     summary: Get all internships
 *     tags: [Internships]
 *     responses:
 *       200:
 *         description: List of all internships
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   companyName:
 *                     type: string
 *                   location:
 *                     type: string
 *                   stipend:
 *                     type: string
 *                   applicationDeadline:
 *                     type: string
 */
app.get('/api/internships', (req, res) => {
  try {
    const internshipList = internships.map(internship => ({
      id: internship.id,
      title: internship.title,
      companyName: internship.companyName,
      location: internship.location,
      stipend: internship.stipend,
      applicationDeadline: internship.applicationDeadline
    }));

    res.json(internshipList);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/internships/{id}:
 *   get:
 *     summary: Get internship by ID
 *     tags: [Internships]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Internship ID
 *     responses:
 *       200:
 *         description: Internship details
 *       404:
 *         description: Internship not found
 */
app.get('/api/internships/:id', (req, res) => {
  try {
    const { id } = req.params;
    const internship = internships.find(i => i.id === id);

    if (!internship) {
      return res.status(404).json({ error: 'Internship not found' });
    }

    // Return internship details without facultyId
    const { facultyId, createdAt, ...internshipDetails } = internship;
    res.json(internshipDetails);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Application Routes

/**
 * @swagger
 * /api/applications:
 *   post:
 *     summary: Apply for internship (Student only)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               internshipId:
 *                 type: string
 *               resume:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Application submitted successfully
 *       403:
 *         description: Access denied - Student role required
 */
app.post('/api/applications', authenticateToken, requireRole('student'), upload.single('resume'), (req, res) => {
  try {
    const { internshipId } = req.body;

    if (!internshipId) {
      return res.status(400).json({ error: 'Internship ID is required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Resume file is required' });
    }

    // Check if internship exists
    const internship = internships.find(i => i.id === internshipId);
    if (!internship) {
      return res.status(404).json({ error: 'Internship not found' });
    }

    // Check if user already applied for this internship
    const existingApplication = applications.find(
      app => app.studentId === req.user.userId && app.internshipId === internshipId
    );
    if (existingApplication) {
      return res.status(409).json({ error: 'You have already applied for this internship' });
    }

    // Create new application
    const newApplication = {
      id: applicationIdCounter.toString(),
      internshipId,
      studentId: req.user.userId,
      resumeUrl: `/uploads/${req.file.filename}`,
      status: 'Pending',
      appliedAt: new Date().toISOString()
    };

    applications.push(newApplication);
    applicationIdCounter++;

    res.status(201).json({
      message: 'Application submitted successfully',
      applicationId: newApplication.id
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/internships/{id}/applications:
 *   get:
 *     summary: View applications for an internship (Faculty only)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Internship ID
 *     responses:
 *       200:
 *         description: List of applications
 *       403:
 *         description: Access denied - Faculty role required
 *       404:
 *         description: Internship not found
 */
app.get('/api/internships/:id/applications', authenticateToken, requireRole('faculty'), (req, res) => {
  try {
    const { id } = req.params;

    // Check if internship exists and belongs to the faculty
    const internship = internships.find(i => i.id === id && i.facultyId === req.user.userId);
    if (!internship) {
      return res.status(404).json({ error: 'Internship not found or access denied' });
    }

    // Get applications for this internship
    const internshipApplications = applications.filter(app => app.internshipId === id);

    // Enrich applications with student details
    const enrichedApplications = internshipApplications.map(app => {
      const student = users.find(u => u.id === app.studentId);
      return {
        applicationId: app.id,
        studentName: student ? student.name : 'Unknown',
        email: student ? student.email : 'Unknown',
        resumeUrl: app.resumeUrl,
        status: app.status
      };
    });

    res.json(enrichedApplications);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/applications/{id}:
 *   patch:
 *     summary: Update application status (Faculty only)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Accepted, Rejected]
 *     responses:
 *       200:
 *         description: Application status updated successfully
 *       403:
 *         description: Access denied - Faculty role required
 *       404:
 *         description: Application not found
 */
app.patch('/api/applications/:id', authenticateToken, requireRole('faculty'), (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be either "Accepted" or "Rejected"' });
    }

    // Find the application
    const application = applications.find(app => app.id === id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Check if the internship belongs to the faculty
    const internship = internships.find(i => i.id === application.internshipId && i.facultyId === req.user.userId);
    if (!internship) {
      return res.status(403).json({ error: 'Access denied. You can only update applications for your own internships.' });
    }

    // Update application status
    application.status = status;
    application.updatedAt = new Date().toISOString();

    res.json({
      message: 'Application status updated successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Notification Routes

/**
 * @swagger
 * /api/notifications/email:
 *   post:
 *     summary: Send email notification
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recipientEmail:
 *                 type: string
 *                 format: email
 *               subject:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email sent successfully
 *       400:
 *         description: Bad request
 */
app.post('/api/notifications/email', (req, res) => {
  try {
    const { recipientEmail, subject, message } = req.body;

    if (!recipientEmail || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // In a real implementation, you would use nodemailer or another email service
    // For this demo, we'll just simulate sending the email
    console.log('Email Notification:', {
      to: recipientEmail,
      subject: subject,
      message: message,
      timestamp: new Date().toISOString()
    });

    res.json({
      message: 'Email sent successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Internship Application Portal API',
    version: '1.0.0',
    documentation: `/api-docs`,
    endpoints: {
      auth: ['/api/auth/register', '/api/auth/login'],
      internships: ['/api/internships'],
      applications: ['/api/applications'],
      notifications: ['/api/notifications/email']
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size too large. Maximum size is 5MB.' });
    }
  }
  
  if (error.message === 'Only PDF files are allowed') {
    return res.status(400).json({ error: 'Only PDF files are allowed for resume upload.' });
  }

  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
  console.log(`💾 Using in-memory storage (data will be lost on restart)`);
});