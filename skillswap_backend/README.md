# SkillSwap Backend

This is the Django backend for the SkillSwap platform.

## Setup Instructions

1. **Activate the virtual environment:**
   
   Windows:
   ```powershell
   venv\Scripts\activate
   ```
   
   macOS/Linux:
   ```bash
   source venv/bin/activate
   ```

2. **Install dependencies:**
   ```bash
   pip install django djangorestframework django-cors-headers
   ```

3. **Create Django project:**
   ```bash
   django-admin startproject skillswap_backend .
   ```

4. **Run migrations:**
   ```bash
   python manage.py migrate
   ```

5. **Start development server:**
   ```bash
   python manage.py runserver
   ```

## Features
- SQLite database
- Django REST Framework
- Token authentication
- CORS headers
- Models: UserProfile, Skill, SwapRequest

See project files for details.
