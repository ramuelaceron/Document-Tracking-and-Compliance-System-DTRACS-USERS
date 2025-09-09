# DTRACS - DepEd Biñan Record Monitoring System

A comprehensive web-based task management and record monitoring system designed for the Department of Education (DepEd) Biñan City Schools Division. This application facilitates efficient coordination between schools and the central office for task assignment, tracking, and completion.

## 🚀 Features

### For Schools
- Dashboard Overview: Comprehensive view of assigned tasks and progress
- Task Management: View, update, and complete assigned tasks
- SGOD Integration: Access to Schools Division Office directives and tasks
- Section-based Organization: Tasks organized by educational sections
- Real-time Updates: Live status tracking of task completion

### For Office Users
- Central Task Management: Create, assign, and monitor tasks across all schools
- School Oversight: View and manage all school accounts and activities
- Task Analytics: Track task completion rates, overdue items, and performance metrics
- Attachment Management: Handle file attachments and documentation
- Role-based Access: Secure access control for different user levels

## 🛠️ Technology Stack

- Frontend Framework: React 19.1.1
- Routing: React Router DOM 7.8.0
- Styling: CSS Modules with custom styling
- Animations: Framer Motion 12.23.12
- Rich Text Editor: Quill 2.0.3 with React-QuillJS
- Icons: React Icons 5.5.0
- Notifications: React Toastify 11.0.5
- Particle Effects: React TS Particles 2.12.2
- Build Tool: Create React App with React Scripts 5.0.1

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

## 🔧 Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd dtracs-frontend
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm start
   ```

4. Open your browser
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage

### Getting Started
1. Visit the application homepage
2. Choose your login type (School or Office)
3. Enter your credentials
4. Access your personalized dashboard

### For Schools
- View assigned tasks in your dashboard
- Navigate to SGOD section for division-wide tasks
- Update task status and add comments
- Upload required attachments

### For Office Personnel
- Create new tasks and assign to schools
- Monitor task completion across all schools
- Review school performance metrics
- Manage user accounts and permissions

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AttachedFiles/   # File attachment components
│   ├── TaskActions/     # Task action buttons
│   ├── Sidebar/         # Navigation sidebars
│   ├── Header/          # Application header
│   └── ...
├── pages/              # Main application pages
│   ├── Login/          # Authentication pages
│   ├── Dashboard/      # Dashboard components
│   ├── Task/           # Task management pages
│   ├── Todo/           # To-do list pages
│   └── ...
├── assets/             # Static assets
│   ├── images/         # Image files
│   └── schoolsImages/  # School-specific images
├── context/            # React context providers
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
└── data/               # Static data files
```

## 🚀 Available Scripts

### `npm start`
Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm test`
Launches the test runner in interactive watch mode.

### `npm run build`
Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

### `npm run eject`
**Note: This is a one-way operation!**
Removes the single build dependency and copies all configuration files into your project.

## 🎨 Key Components

- TaskActions: Handles task status updates and actions
- AttachedFiles: Manages file uploads and downloads
- RichTextEditor: Provides rich text editing capabilities
- Sidebar: Navigation component with role-based menus
- ProfileAvatar: User profile display component
- CommentBox: Task commenting system

## 🔐 Security Features

- Role-based access control
- Secure authentication system
- Input sanitization with DOMPurify
- Protected routes for authorized users only

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop computers
- Tablets
- Mobile devices

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software developed for DepEd Biñan City Schools Division.

## 🆘 Support

For technical support or questions, please contact the DepEd Biñan City ICT Department.

## 📊 Version

Current Version: 0.1.0

---

**Department of Education - Biñan City Schools Division**
