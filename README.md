# Habit Tracker - Task Manager

A web-based habit tracking application built with Flask that helps you build and maintain daily habits. Track your progress, visualize your consistency, and stay motivated with beautiful charts and analytics.

## Features

### 🎯 Core Functionality
- **User Authentication**: Secure login and registration system
- **Habit Management**: Add, edit, and remove habits for each month
- **Daily Task Tracking**: Mark habits as completed with real-time auto-save
- **Progress Visualization**: Interactive calendar view with color-coded progress indicators
- **Analytics Dashboard**: Comprehensive insights with charts and statistics

### 📊 Key Features
- **Auto-Save**: Tasks save automatically when clicked - no need to click save button
- **Calendar View**: Visual monthly overview with:
  - Color-coded days based on completion percentage
  - Red borders for missed past dates
  - Click any day to see a pie chart of completed vs pending tasks
- **Analytics**: 
  - Consistency score calculation
  - Daily completion trends
  - Habit completion rates
  - Weekly performance comparison
  - Best and worst habit identification
- **Streak Tracking**: Track consecutive days of perfect completion
- **Responsive Design**: Beautiful, modern UI that works on all devices

## Installation

### Prerequisites
- Python 3.7 or higher
- pip (Python package installer)

### Setup Steps

1. **Clone or download the repository**
   ```bash
   cd taskmnager
   ```

2. **Create a virtual environment (recommended)**
   ```bash
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application**
   ```bash
   python app.py
   ```

5. **Access the application**
   - Open your browser and navigate to: `http://localhost:5000`
   - Or if running on a network: `http://0.0.0.0:5000`

## Usage Guide

### Getting Started

1. **Register an Account**
   - Click "Register" on the login page
   - Enter a username and password
   - You'll be redirected to login

2. **Login**
   - Enter your credentials
   - You'll be taken to the dashboard

3. **Add Habits**
   - Navigate to "Manage Habits" from the dashboard
   - Enter a habit name (e.g., "Morning Exercise", "Read 30 min")
   - Click "Add Habit"
   - Habits are organized by month

4. **Track Daily Progress**
   - Go to "Today's Tasks" from the dashboard
   - Click checkboxes to mark habits as completed
   - Changes save automatically!
   - Click "Save Progress" to manually save and return to dashboard

5. **View Calendar**
   - Click "Calendar View" to see monthly progress
   - Days are color-coded:
     - 🟢 **Green (Excellent)**: 80%+ completion
     - 🟡 **Yellow (Good)**: 60-79% completion
     - 🟠 **Orange (Average)**: 40-59% completion
     - 🔴 **Red (Poor)**: 1-39% completion
     - ⚫ **Black (None)**: 0% completion
     - 🔴 **Red Border (Missed)**: Past dates with no completed tasks
   - Click any day to see a detailed pie chart

6. **View Analytics**
   - Navigate to "Analytics" for detailed insights
   - View consistency score, completion trends, and habit performance

## Project Structure

```
taskmnager/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── README.md             # This file
│
├── templates/            # HTML templates
│   ├── login.html        # Login page
│   ├── register.html    # Registration page
│   ├── dashboard.html   # Main dashboard
│   ├── today.html       # Daily task tracking
│   ├── habits.html      # Habit management
│   ├── calendar.html    # Calendar view
│   └── analysis.html    # Analytics dashboard
│
├── static/               # Static files
│   ├── charts/          # Generated chart images
│   └── css/             # CSS stylesheets
│
└── Data Files (auto-generated):
    ├── users.json       # User accounts
    ├── habits.json     # User habits by month
    └── progress.json   # Daily progress tracking
```

## Technologies Used

- **Backend**: Flask (Python web framework)
- **Frontend**: HTML5, CSS3, JavaScript
- **UI Framework**: Bootstrap 5
- **Icons**: Font Awesome 6
- **Charts**: Matplotlib
- **Data Storage**: JSON files

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/` | GET, POST | Login page |
| `/register` | GET, POST | User registration |
| `/logout` | GET | Logout user |
| `/dashboard` | GET | Main dashboard |
| `/today` | GET, POST | Daily task tracking |
| `/habits` | GET, POST | Habit management |
| `/calendar` | GET | Calendar view |
| `/analysis` | GET | Analytics dashboard |
| `/day_status/<date>` | GET | Get pie chart for specific day |

## Features in Detail

### Auto-Save Functionality
- Tasks are saved automatically when you click a checkbox
- Uses AJAX for seamless updates without page reload
- Visual feedback on successful save
- Manual "Save Progress" button also available

### Calendar View
- Interactive monthly calendar
- Color-coded progress indicators
- Click any day to view detailed breakdown
- Visual distinction for missed days

### Analytics
- **Consistency Score**: Overall completion percentage
- **Daily Trends**: Line chart showing daily completion
- **Habit Rates**: Bar chart comparing habit performance
- **Weekly Comparison**: Week-by-week progress
- **Best/Worst Habits**: Identifies your strongest and weakest habits

## Data Storage

The application uses JSON files for data storage:
- `users.json`: Stores user credentials and account information
- `habits.json`: Stores habits organized by user and month
- `progress.json`: Stores daily completion status for each habit

All data is stored locally in the project directory.

## Security Notes

⚠️ **Important**: This is a development application. For production use:
- Change the `app.secret_key` in `app.py`
- Implement proper password hashing (currently plain text)
- Use a proper database instead of JSON files
- Add CSRF protection
- Implement rate limiting

## Troubleshooting

### Port Already in Use
If port 5000 is already in use:
```python
# Edit app.py, change the last line:
app.run(debug=True, host='0.0.0.0', port=5001)  # Use different port
```

### Charts Not Displaying
- Ensure `static/charts/` directory exists
- Check file permissions
- Verify matplotlib is installed correctly

### Data Not Saving
- Check file permissions for JSON files
- Ensure the application has write access to the directory

## Future Enhancements

Potential features for future versions:
- Email reminders
- Habit categories/tags
- Export data to CSV/PDF
- Mobile app
- Social sharing
- Habit templates
- Goal setting and milestones

## License

This project is open source and available for personal and educational use.

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

## Support

For issues or questions, please check the code comments or create an issue in the repository.

---

**Happy Habit Tracking! 🎯**

