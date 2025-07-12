# Skill-Swap Backend

A Django REST API backend for the Skill-Swap platform that allows users to exchange skills with each other.

## Features

- **User Management**: Custom UserProfile model with location, photo, and privacy settings
- **Skill Management**: Users can add skills they offer or want to learn
- **Swap Requests**: Users can request skill exchanges with other users
- **Authentication**: Token-based authentication with DRF
- **API Endpoints**: Full CRUD operations for all models

## Models

### UserProfile
- Extends Django's AbstractUser
- Additional fields: location, photo, is_public
- Custom admin interface

### Skill
- name: Skill name
- owner: ForeignKey to UserProfile
- offered: Boolean (True for skills offered, False for skills wanted)

### SwapRequest
- from_user/to_user: UserProfile references
- offered_skill/requested_skill: Skill references
- status: PENDING/ACCEPTED/REJECTED/CANCELLED
- Timestamps for tracking

## API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/token/` - Get auth token

### Profiles
- `GET /api/profiles/` - List public profiles
- `GET /api/profiles/{id}/` - Get specific profile
- `PUT /api/profiles/{id}/` - Update profile
- `GET /api/profiles/me/` - Get current user profile

### Skills
- `GET /api/skills/` - List skills (with filters)
- `POST /api/skills/` - Create new skill
- `GET /api/skills/{id}/` - Get specific skill
- `PUT /api/skills/{id}/` - Update skill
- `DELETE /api/skills/{id}/` - Delete skill

**Query Parameters:**
- `name` - Filter by skill name
- `owner` - Filter by owner username
- `offered` - Filter by availability (true/false)

### Swap Requests
- `GET /api/swaps/` - List user's swap requests
- `POST /api/swaps/` - Create new swap request
- `GET /api/swaps/{id}/` - Get specific swap request
- `PUT /api/swaps/{id}/` - Update swap request
- `DELETE /api/swaps/{id}/` - Delete swap request
- `POST /api/swaps/{id}/accept/` - Accept swap request
- `POST /api/swaps/{id}/reject/` - Reject swap request
- `POST /api/swaps/{id}/cancel/` - Cancel swap request

## Setup Instructions

### Prerequisites
- Python 3.10+
- pip

### Installation

1. **Clone the repository**
   ```bash
   cd skillswap
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run migrations**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **Create superuser (optional)**
   ```bash
   python manage.py createsuperuser
   ```

6. **Run development server**
   ```bash
   python manage.py runserver
   ```

The API will be available at `http://localhost:8000/api/`

## Development

### Database
- Uses SQLite by default (configured in settings.py)
- For production, consider PostgreSQL or MySQL

### CORS Configuration
- CORS is enabled for all origins in development
- Configure `CORS_ALLOWED_ORIGINS` for production

### Authentication
- Token-based authentication
- Tokens are automatically created for users
- Include token in Authorization header: `Authorization: Token <token>`

### File Uploads
- Profile photos are stored in `media/profile_photos/`
- Configure `MEDIA_ROOT` and `MEDIA_URL` for production

## Admin Interface

Access the Django admin at `http://localhost:8000/admin/` to manage:
- User profiles
- Skills
- Swap requests

## Testing

Run tests with:
```bash
python manage.py test
```

## Production Deployment

1. Set `DEBUG = False` in settings.py
2. Configure proper database
3. Set up static file serving
4. Configure CORS for your frontend domain
5. Use environment variables for sensitive settings 