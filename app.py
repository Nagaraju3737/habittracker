"""
TaskTraQ - Excel-Style Habit Tracker
Flask Application Entry Point
"""

from flask import Flask, render_template, jsonify
from backend.routes import api_bp
from backend.database import init_db
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'tasktraq-secret-key-change-in-production')
app.config['JSON_SORT_KEYS'] = False

# Register API blueprint
app.register_blueprint(api_bp, url_prefix='/api')

# Initialize database
init_db()

@app.route('/')
def index():
    """Redirect to login page"""
    return render_template('login.html')

@app.route('/register')
def register():
    """Registration page"""
    return render_template('register.html')

@app.route('/tracker')
def tracker():
    """Habit tracker page"""
    return render_template('tracker.html')

@app.route('/dashboard')
def dashboard():
    """Dashboard analytics page"""
    return render_template('dashboard.html')

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)