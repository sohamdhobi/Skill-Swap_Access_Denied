# Skill-Swap Frontend

A React TypeScript frontend for the Skill-Swap platform that allows users to exchange skills with each other.

## Features

- **User Authentication**: Login and registration with token-based authentication
- **Skill Management**: Add, view, and manage skills you offer or want to learn
- **Swap Requests**: Create and manage skill exchange requests
- **Profile Management**: View and edit your profile information
- **Responsive Design**: Modern UI with clean, responsive design
- **TypeScript**: Full TypeScript support for better development experience

## Pages

- `/login` - User login
- `/register` - User registration
- `/skills` - Browse and manage skills
- `/skills/new` - Add new skill
- `/swaps` - View and manage swap requests
- `/profile` - View and edit profile

## Components

### Authentication
- `LoginForm` - User login form
- `RegisterForm` - User registration form

### Navigation
- `Navbar` - Main navigation with authentication state

### Pages
- `SkillList` - Display and filter skills
- `SkillForm` - Add new skills
- `SwapList` - View and manage swap requests
- `ProfilePage` - User profile management

## Setup Instructions

### Prerequisites
- Node.js 16+ and npm
- The Django backend should be running on `http://localhost:8000`

### Installation

1. **Navigate to the frontend directory**
   ```bash
   cd skillswap_frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000`

## Development

### Project Structure
```
src/
├── components/          # Reusable components
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   └── Navbar.tsx
├── pages/              # Page components
│   ├── SkillList.tsx
│   ├── SkillForm.tsx
│   ├── SwapList.tsx
│   └── ProfilePage.tsx
├── services/           # API services
│   └── api.ts
├── types.ts            # TypeScript type definitions
├── App.tsx             # Main application component
├── index.tsx           # Application entry point
└── index.css           # Global styles
```

### API Integration

The frontend communicates with the Django backend through the API service (`src/services/api.ts`). The service includes:

- **Authentication**: Login, register, logout
- **Profiles**: Get and update user profiles
- **Skills**: CRUD operations for skills
- **Swap Requests**: CRUD operations and status management

### Authentication

The application uses token-based authentication:
- Tokens are stored in localStorage
- API requests include the token in the Authorization header
- Protected routes redirect to login if not authenticated

### Styling

The application uses CSS classes for styling:
- `.btn` - Button styles
- `.form-control` - Form input styles
- `.card` - Card container styles
- `.alert` - Alert message styles
- `.navbar` - Navigation styles

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

## Configuration

### API Base URL
The frontend is configured to proxy requests to `http://localhost:8000` (the Django backend). This is set in `package.json`:

```json
{
  "proxy": "http://localhost:8000"
}
```

### Environment Variables
Create a `.env` file in the root directory for environment-specific configuration:

```
REACT_APP_API_URL=http://localhost:8000
```

## Production Build

To create a production build:

```bash
npm run build
```

This creates an optimized build in the `build/` directory.

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the Django backend has CORS properly configured
2. **API Connection**: Verify the Django server is running on port 8000
3. **Token Issues**: Clear localStorage if authentication problems occur

### Development Tips

- Use the browser's developer tools to inspect network requests
- Check the console for TypeScript errors
- Use React Developer Tools for component debugging

## Contributing

1. Follow the existing code style
2. Add TypeScript types for new features
3. Test your changes thoroughly
4. Update documentation as needed 