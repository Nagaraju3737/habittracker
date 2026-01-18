/**
 * TaskTraQ - Shared Frontend Logic
 * Handles API calls and common utilities
 */

/**
 * Make authenticated API calls
 */
async function apiCall(url, method = 'GET', body = null) {
    const token = localStorage.getItem('token');
    
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };
    
    if (body) {
        options.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, options);
    let data;
    
    try {
        const text = await response.text();
        // Try to parse as JSON
        data = text ? JSON.parse(text) : {};
    } catch (e) {
        // If response is not valid JSON, throw a more specific error
        console.error('Response text:', response.status, response.statusText);
        throw new Error(`Server error (${response.status}): Invalid response from server`);
    }
    
    if (!response.ok) {
        // Token expired or invalid
        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user_email');
            window.location.href = '/';
            throw new Error('Session expired. Please login again.');
        }
        throw new Error(data.error || `Server error: ${response.statusText}`);
    }
    
    return data;
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(year, month, day) {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * Get days in month
 */
function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
}

/**
 * Debounce function for input handling
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Validate habit name
 */
function validateHabitName(name) {
    if (!name || name.trim().length === 0) {
        return 'Habit name cannot be empty';
    }
    if (name.length > 25) {
        return 'Habit name must be 25 characters or less';
    }
    return null;
}

/**
 * Get progress color based on percentage
 */
function getProgressColor(percent) {
    if (percent >= 80) return '#10b981'; // Green
    if (percent >= 60) return '#3b82f6'; // Blue
    if (percent >= 40) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Format month name
 */
function getMonthName(monthNumber) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1] || '';
}