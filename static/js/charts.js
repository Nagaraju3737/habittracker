/**
 * TaskTraQ Charts Implementation
 * All charts with animations and interactivity
 */

// Store chart instances for cleanup
let chartInstances = {
    barChart: null,
    donutChart: null,
    lineChart: null,
    horizontalBarChart: null,
    weeklyTrendChart: null,
    weeklyPercentChart: null,
    weeklyComparisonChart: null,
    weeklyAverageChart: null,
    weeklyTrendLineChart: null,
    weeklyScoresBarChart: null
};

// Color palette
const COLORS = {
    primary: '#667eea',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    purple: '#8b5cf6',
    pink: '#ec4899',
    gradient: [
        '#667eea',
        '#764ba2',
        '#f093fb',
        '#4facfe',
        '#43e97b',
        '#fa709a',
        '#fee140',
        '#30cfd0'
    ]
};

/**
 * Chart 1: Habit Completion Bar Chart
 * Maps: Excel Column A (Habit Name) → X-axis
 *       Excel Column AG (Total) → Y-axis
 */
function renderBarChart(metrics) {
    destroyChart('barChart');
    
    const ctx = document.getElementById('barChart');
    if (!ctx) return;
    
    const habits = metrics.habit_summaries;
    const labels = habits.map(h => truncateText(h.name, 15));
    const data = habits.map(h => h.total);
    
    chartInstances.barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Completions',
                data: data,
                backgroundColor: COLORS.gradient,
                borderColor: COLORS.gradient.map(c => c + 'dd'),
                borderWidth: 2,
                borderRadius: 8,
                hoverBackgroundColor: COLORS.gradient.map(c => c + 'cc')
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 },
                    callbacks: {
                        title: function(context) {
                            return habits[context[0].dataIndex].name;
                        },
                        label: function(context) {
                            return `Completions: ${context.parsed.y} / ${metrics.days_in_month}`;
                        },
                        afterLabel: function(context) {
                            const habit = habits[context.dataIndex];
                            return `Completion Rate: ${habit.percent_complete}%`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: metrics.days_in_month,
                    ticks: {
                        stepSize: 5,
                        font: { size: 12 }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    title: {
                        display: true,
                        text: 'Total Completions',
                        font: { size: 13, weight: 'bold' }
                    }
                },
                x: {
                    ticks: {
                        font: { size: 11 },
                        maxRotation: 45,
                        minRotation: 45
                    },
                    grid: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Habit Name',
                        font: { size: 13, weight: 'bold' }
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    });
}

/**
 * Chart 2: Completion vs Remaining Donut Chart
 * Maps: Excel Column AG (Total) → Completed slice
 *       (Days in month - Total) → Remaining slice
 */
function renderDonutChart(metrics) {
    destroyChart('donutChart');
    
    const ctx = document.getElementById('donutChart');
    if (!ctx) return;
    
    const completed = metrics.total_completed_days;
    const remaining = metrics.total_possible_days - completed;
    const completionPercent = metrics.overall_completion_percent;
    
    chartInstances.donutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'Remaining'],
            datasets: [{
                data: [completed, remaining],
                backgroundColor: [COLORS.success, '#e5e7eb'],
                borderColor: ['#fff', '#fff'],
                borderWidth: 3,
                hoverOffset: 15
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: { size: 13 },
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 },
                    callbacks: {
                        label: function(context) {
                            const label = context.label;
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percent = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} (${percent}%)`;
                        }
                    }
                }
            },
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 1500,
                easing: 'easeInOutQuart'
            }
        },
        plugins: [{
            id: 'centerText',
            beforeDraw: function(chart) {
                const ctx = chart.ctx;
                const width = chart.width;
                const height = chart.height;
                
                ctx.restore();
                const fontSize = (height / 114).toFixed(2);
                ctx.font = `bold ${fontSize}em sans-serif`;
                ctx.textBaseline = 'middle';
                ctx.fillStyle = COLORS.success;
                
                const text = `${completionPercent}%`;
                const textX = Math.round((width - ctx.measureText(text).width) / 2);
                const textY = height / 2;
                
                ctx.fillText(text, textX, textY);
                ctx.save();
            }
        }]
    });
}

/**
 * Chart 3: Daily Completion Trend Line Chart
 * Maps: Excel Columns B-AF (Days 1-31) → X-axis
 *       Count of completed habits per day → Y-axis
 */
function renderLineChart(habitsData) {
    destroyChart('lineChart');
    
    const ctx = document.getElementById('lineChart');
    if (!ctx) return;
    
    // Calculate completions per day
    const dailyCompletions = {};
    habitsData.forEach(habit => {
        habit.days.forEach((completed, index) => {
            const day = index + 1;
            if (completed === 1) {
                dailyCompletions[day] = (dailyCompletions[day] || 0) + 1;
            }
        });
    });
    
    const daysInMonth = currentMetrics.days_in_month;
    const labels = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const data = labels.map(day => dailyCompletions[day] || 0);
    
    chartInstances.lineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Habits Completed',
                data: data,
                borderColor: COLORS.primary,
                backgroundColor: COLORS.primary + '20',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: COLORS.primary,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverBackgroundColor: COLORS.primary,
                pointHoverBorderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 3,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: { size: 13 },
                        usePointStyle: true
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 },
                    callbacks: {
                        title: function(context) {
                            const monthName = getMonthName(currentMonth);
                            return `${monthName} ${context[0].label}, ${currentYear}`;
                        },
                        label: function(context) {
                            const count = context.parsed.y;
                            const total = habitsData.length;
                            return `${count} of ${total} habits completed`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: habitsData.length + 1,
                    ticks: {
                        stepSize: 1,
                        font: { size: 12 }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    title: {
                        display: true,
                        text: 'Number of Habits Completed',
                        font: { size: 13, weight: 'bold' }
                    }
                },
                x: {
                    ticks: {
                        font: { size: 11 }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.03)'
                    },
                    title: {
                        display: true,
                        text: 'Day of Month',
                        font: { size: 13, weight: 'bold' }
                    }
                }
            },
            animation: {
                duration: 1500,
                easing: 'easeInOutCubic'
            }
        }
    });
}

/**
 * Chart 5: Top Performing Habits (Horizontal Bar Chart)
 * Maps: Excel Column A (Habit Name) → Y-axis
 *       Excel Column AH (% Complete) → X-axis
 */
function renderHorizontalBarChart(metrics) {
    destroyChart('horizontalBarChart');
    
    const ctx = document.getElementById('horizontalBarChart');
    if (!ctx) return;
    
    // Already sorted by % Complete descending
    const habits = metrics.habit_summaries;
    const labels = habits.map(h => truncateText(h.name, 20));
    const data = habits.map(h => h.percent_complete);
    
    // Color based on performance
    const backgroundColors = data.map(percent => {
        if (percent >= 80) return COLORS.success;
        if (percent >= 60) return COLORS.info;
        if (percent >= 40) return COLORS.warning;
        return COLORS.danger;
    });
    
    chartInstances.horizontalBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Completion %',
                data: data,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors.map(c => c + 'dd'),
                borderWidth: 2,
                borderRadius: 6,
                hoverBackgroundColor: backgroundColors.map(c => c + 'cc')
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 },
                    callbacks: {
                        title: function(context) {
                            return habits[context[0].dataIndex].name;
                        },
                        label: function(context) {
                            return `Completion Rate: ${context.parsed.x}%`;
                        },
                        afterLabel: function(context) {
                            const habit = habits[context.dataIndex];
                            return `Completed: ${habit.total} / ${metrics.days_in_month} days`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        },
                        font: { size: 12 }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    title: {
                        display: true,
                        text: 'Completion Percentage',
                        font: { size: 13, weight: 'bold' }
                    }
                },
                y: {
                    ticks: {
                        font: { size: 12 }
                    },
                    grid: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Habit Name',
                        font: { size: 13, weight: 'bold' }
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    });
}

// Utility functions
function destroyChart(chartId) {
    if (chartInstances[chartId]) {
        chartInstances[chartId].destroy();
        chartInstances[chartId] = null;
    }
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

/**
 * WEEK-TO-WEEK ANALYSIS CHARTS
 */

/**
 * Helper: Calculate week number from day of month
 */
function getWeekNumber(day) {
    return Math.ceil(day / 7);
}

/**
 * Helper: Get days range for a specific week
 */
function getWeekDays(weekNum, daysInMonth) {
    const startDay = (weekNum - 1) * 7 + 1;
    const endDay = Math.min(weekNum * 7, daysInMonth);
    return { startDay, endDay, daysInWeek: endDay - startDay + 1 };
}

/**
 * Helper: Calculate weekly data from habits
 */
function calculateWeeklyData(habitsData, daysInMonth) {
    const numWeeks = Math.ceil(daysInMonth / 7);
    const weeklyData = [];
    
    for (let week = 1; week <= numWeeks; week++) {
        const { startDay, endDay, daysInWeek } = getWeekDays(week, daysInMonth);
        
        // Calculate completions for each habit this week
        const habitCompletions = {};
        let totalCompletions = 0;
        
        habitsData.forEach(habit => {
            let weekCompletions = 0;
            for (let day = startDay - 1; day < endDay; day++) {
                if (habit.days[day] === 1) {
                    weekCompletions++;
                    totalCompletions++;
                }
            }
            habitCompletions[habit.id] = weekCompletions;
        });
        
        // Calculate completion percentage for this week
        const possibleCompletions = habitsData.length * daysInWeek;
        const completionPercent = possibleCompletions > 0 
            ? (totalCompletions / possibleCompletions * 100)
            : 0;
        
        weeklyData.push({
            week,
            startDay,
            endDay,
            daysInWeek,
            totalCompletions,
            habitCompletions,
            completionPercent: parseFloat(completionPercent.toFixed(1))
        });
    }
    
    return weeklyData;
}

/**
 * Chart 6: Weekly Completion Trend (Overall)
 * Type: Column Chart
 * Purpose: Measure weekly momentum and drops
 */
function renderWeeklyTrendChart(habitsData) {
    destroyChart('weeklyTrendChart');
    
    const ctx = document.getElementById('weeklyTrendChart');
    if (!ctx) return;
    
    const daysInMonth = currentMetrics.days_in_month;
    const weeklyData = calculateWeeklyData(habitsData, daysInMonth);
    
    const labels = weeklyData.map(w => `Week ${w.week}`);
    const data = weeklyData.map(w => w.totalCompletions);
    
    chartInstances.weeklyTrendChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Completions',
                data: data,
                backgroundColor: COLORS.primary,
                borderColor: COLORS.primary + 'dd',
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    callbacks: {
                        title: function(context) {
                            const weekData = weeklyData[context[0].dataIndex];
                            return `Week ${weekData.week} (Days ${weekData.startDay}-${weekData.endDay})`;
                        },
                        label: function(context) {
                            return `Total Completions: ${context.parsed.y}`;
                        },
                        afterLabel: function(context) {
                            const weekData = weeklyData[context.dataIndex];
                            return `Completion Rate: ${weekData.completionPercent}%`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { font: { size: 12 } },
                    title: {
                        display: true,
                        text: 'Total Completions',
                        font: { size: 13, weight: 'bold' }
                    }
                },
                x: {
                    ticks: { font: { size: 12 } },
                    title: {
                        display: true,
                        text: 'Week Number',
                        font: { size: 13, weight: 'bold' }
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    });
}

/**
 * Chart 7: Weekly Completion Percentage
 * Type: Area Chart
 * Purpose: Show improvement or decline per week
 */
function renderWeeklyPercentChart(habitsData) {
    destroyChart('weeklyPercentChart');
    
    const ctx = document.getElementById('weeklyPercentChart');
    if (!ctx) return;
    
    const daysInMonth = currentMetrics.days_in_month;
    const weeklyData = calculateWeeklyData(habitsData, daysInMonth);
    
    const labels = weeklyData.map(w => `Week ${w.week}`);
    const data = weeklyData.map(w => w.completionPercent);
    
    chartInstances.weeklyPercentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Completion %',
                data: data,
                borderColor: COLORS.success,
                backgroundColor: COLORS.success + '30',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: COLORS.success,
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    callbacks: {
                        title: function(context) {
                            const weekData = weeklyData[context[0].dataIndex];
                            return `Week ${weekData.week} (Days ${weekData.startDay}-${weekData.endDay})`;
                        },
                        label: function(context) {
                            return `Completion Rate: ${context.parsed.y}%`;
                        },
                        afterLabel: function(context) {
                            const weekData = weeklyData[context.dataIndex];
                            return `Completed: ${weekData.totalCompletions} / ${habitsData.length * weekData.daysInWeek}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        },
                        font: { size: 12 }
                    },
                    title: {
                        display: true,
                        text: 'Completion Percentage',
                        font: { size: 13, weight: 'bold' }
                    }
                },
                x: {
                    ticks: { font: { size: 12 } },
                    title: {
                        display: true,
                        text: 'Week Number',
                        font: { size: 13, weight: 'bold' }
                    }
                }
            },
            animation: {
                duration: 1500,
                easing: 'easeInOutCubic'
            }
        }
    });
}

/**
 * Chart 8: Weekly Habit Performance Comparison
 * Type: Grouped Bar Chart
 * Purpose: Compare habits week-by-week
 */
function renderWeeklyComparisonChart(habitsData) {
    destroyChart('weeklyComparisonChart');
    
    const ctx = document.getElementById('weeklyComparisonChart');
    if (!ctx) return;
    
    const daysInMonth = currentMetrics.days_in_month;
    const weeklyData = calculateWeeklyData(habitsData, daysInMonth);
    
    const labels = weeklyData.map(w => `Week ${w.week}`);
    
    // Create dataset for each habit
    const datasets = habitsData.map((habit, index) => {
        const data = weeklyData.map(w => w.habitCompletions[habit.id] || 0);
        const color = COLORS.gradient[index % COLORS.gradient.length];
        
        return {
            label: truncateText(habit.name, 15),
            data: data,
            backgroundColor: color,
            borderColor: color + 'dd',
            borderWidth: 2,
            borderRadius: 6
        };
    });
    
    chartInstances.weeklyComparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2.5,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: { size: 12 },
                        usePointStyle: true,
                        boxWidth: 10
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    callbacks: {
                        title: function(context) {
                            const weekData = weeklyData[context[0].dataIndex];
                            return `Week ${weekData.week} (Days ${weekData.startDay}-${weekData.endDay})`;
                        },
                        label: function(context) {
                            const habitName = context.dataset.label;
                            const completions = context.parsed.y;
                            const weekData = weeklyData[context.dataIndex];
                            return `${habitName}: ${completions}/${weekData.daysInWeek} days`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { 
                        stepSize: 1,
                        font: { size: 12 }
                    },
                    title: {
                        display: true,
                        text: 'Completions',
                        font: { size: 13, weight: 'bold' }
                    }
                },
                x: {
                    ticks: { font: { size: 12 } },
                    title: {
                        display: true,
                        text: 'Week Number',
                        font: { size: 13, weight: 'bold' }
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    });
}

/**
 * Chart 9: Top Habits by Weekly Average
 * Type: Horizontal Bar Chart
 * Purpose: Identify strongest habits over time
 */
function renderWeeklyAverageChart(habitsData) {
    destroyChart('weeklyAverageChart');
    
    const ctx = document.getElementById('weeklyAverageChart');
    if (!ctx) return;
    
    const daysInMonth = currentMetrics.days_in_month;
    const weeklyData = calculateWeeklyData(habitsData, daysInMonth);
    const numWeeks = weeklyData.length;
    
    // Calculate average weekly completion for each habit
    const habitAverages = habitsData.map(habit => {
        let totalWeeklyCompletions = 0;
        weeklyData.forEach(week => {
            totalWeeklyCompletions += week.habitCompletions[habit.id] || 0;
        });
        const averagePerWeek = totalWeeklyCompletions / numWeeks;
        
        return {
            name: habit.name,
            average: parseFloat(averagePerWeek.toFixed(2)),
            total: habit.total
        };
    });
    
    // Sort by average descending
    habitAverages.sort((a, b) => b.average - a.average);
    
    const labels = habitAverages.map(h => truncateText(h.name, 20));
    const data = habitAverages.map(h => h.average);
    
    // Color based on average
    const backgroundColors = data.map(avg => {
        const avgDays = 7; // Max days per week
        const percent = (avg / avgDays) * 100;
        if (percent >= 80) return COLORS.success;
        if (percent >= 60) return COLORS.info;
        if (percent >= 40) return COLORS.warning;
        return COLORS.danger;
    });
    
    chartInstances.weeklyAverageChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Avg Weekly Completions',
                data: data,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors.map(c => c + 'dd'),
                borderWidth: 2,
                borderRadius: 6
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    callbacks: {
                        title: function(context) {
                            return habitAverages[context[0].dataIndex].name;
                        },
                        label: function(context) {
                            return `Average per week: ${context.parsed.x.toFixed(2)} days`;
                        },
                        afterLabel: function(context) {
                            const habit = habitAverages[context.dataIndex];
                            return `Total month: ${habit.total} days`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: 7,
                    ticks: { 
                        stepSize: 1,
                        font: { size: 12 }
                    },
                    title: {
                        display: true,
                        text: 'Average Completions per Week',
                        font: { size: 13, weight: 'bold' }
                    }
                },
                y: {
                    ticks: { font: { size: 12 } },
                    title: {
                        display: true,
                        text: 'Habit Name',
                        font: { size: 13, weight: 'bold' }
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    });
}

/**
 * WEEKLY DAY-TO-DAY ANALYSIS CHARTS
 * Calculate weekly scores per day (Day 1-7 across all weeks)
 */

/**
 * Helper: Calculate day-to-day weekly scores
 * Returns data structure: { day: 1-7, week1Score, week2Score, week3Score, week4Score }
 */
function calculateDayToDayWeeklyScores(habitsData, daysInMonth) {
    const numWeeks = Math.ceil(daysInMonth / 7);
    const dayToDay = [];
    
    // For each day of the week (1-7)
    for (let dayOfWeek = 1; dayOfWeek <= 7; dayOfWeek++) {
        const dayData = { day: dayOfWeek };
        
        // For each week in the month
        for (let week = 1; week <= numWeeks; week++) {
            const { startDay, endDay } = getWeekDays(week, daysInMonth);
            const actualDayOfMonth = startDay + dayOfWeek - 1;
            
            // Check if this day exists in this week
            if (actualDayOfMonth <= endDay && actualDayOfMonth <= daysInMonth) {
                // Count completions for this specific day across all habits
                let dayScore = 0;
                habitsData.forEach(habit => {
                    if (habit.days[actualDayOfMonth - 1] === 1) {
                        dayScore++;
                    }
                });
                dayData[`week${week}`] = dayScore;
            } else {
                dayData[`week${week}`] = null;
            }
        }
        
        dayToDay.push(dayData);
    }
    
    return dayToDay;
}

/**
 * Chart 10: Weekly Trend Line Graph
 * Type: Multi-line Line Chart
 * X-axis: Days (1-7)
 * Y-axis: Weekly Score Value
 * Series: Week 1, Week 2, Week 3, Week 4
 */
function renderWeeklyTrendLineChart(habitsData) {
    destroyChart('weeklyTrendLineChart');
    
    const ctx = document.getElementById('weeklyTrendLineChart');
    if (!ctx) return;
    
    const daysInMonth = currentMetrics.days_in_month;
    const numWeeks = Math.ceil(daysInMonth / 7);
    const dayToDay = calculateDayToDayWeeklyScores(habitsData, daysInMonth);
    
    const labels = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
    
    // Week colors
    const weekColors = [
        { border: '#667eea', bg: '#667eea20' }, // Week 1 - Purple
        { border: '#10b981', bg: '#10b98120' }, // Week 2 - Green
        { border: '#f59e0b', bg: '#f59e0b20' }, // Week 3 - Orange
        { border: '#ec4899', bg: '#ec489920' }  // Week 4 - Pink
    ];
    
    // Create datasets for each week
    const datasets = [];
    for (let week = 1; week <= numWeeks; week++) {
        const data = dayToDay.map(d => d[`week${week}`]);
        const color = weekColors[week - 1] || weekColors[0];
        
        datasets.push({
            label: `Week ${week}`,
            data: data,
            borderColor: color.border,
            backgroundColor: color.bg,
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: color.border,
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointHoverBackgroundColor: color.border,
            pointHoverBorderColor: '#fff',
            spanGaps: false
        });
    }
    
    chartInstances.weeklyTrendLineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2.5,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: { size: 13, weight: 'bold' },
                        usePointStyle: true,
                        pointStyle: 'circle',
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                    padding: 14,
                    titleFont: { size: 15, weight: 'bold' },
                    bodyFont: { size: 13 },
                    callbacks: {
                        title: function(context) {
                            return `${context[0].label}`;
                        },
                        label: function(context) {
                            const weekNum = context.datasetIndex + 1;
                            const score = context.parsed.y;
                            return score !== null ? `Week ${weekNum}: ${score} habits completed` : `Week ${weekNum}: No data`;
                        },
                        afterLabel: function(context) {
                            const totalHabits = habitsData.length;
                            const score = context.parsed.y;
                            if (score !== null) {
                                const percent = ((score / totalHabits) * 100).toFixed(1);
                                return `${percent}% of ${totalHabits} total habits`;
                            }
                            return '';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: habitsData.length,
                    ticks: {
                        stepSize: Math.max(1, Math.floor(habitsData.length / 10)),
                        font: { size: 12 }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.06)'
                    },
                    title: {
                        display: true,
                        text: 'Completion Score (Total Habits Completed)',
                        font: { size: 14, weight: 'bold' }
                    }
                },
                x: {
                    ticks: {
                        font: { size: 12 }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.04)'
                    },
                    title: {
                        display: true,
                        text: 'Day of Week',
                        font: { size: 14, weight: 'bold' }
                    }
                }
            },
            animation: {
                duration: 1500,
                easing: 'easeInOutCubic'
            },
            interaction: {
                mode: 'index',
                intersect: false
            }
        }
    });
}

/**
 * Chart 11: Weekly Scores Grouped Bar Chart
 * Type: Grouped/Clustered Bar Chart
 * X-axis: Days (1-7)
 * Y-axis: Weekly Score Value
 * Bars: Week 1, Week 2, Week 3, Week 4 (side-by-side per day)
 */
function renderWeeklyScoresBarChart(habitsData) {
    destroyChart('weeklyScoresBarChart');
    
    const ctx = document.getElementById('weeklyScoresBarChart');
    if (!ctx) return;
    
    const daysInMonth = currentMetrics.days_in_month;
    const numWeeks = Math.ceil(daysInMonth / 7);
    const dayToDay = calculateDayToDayWeeklyScores(habitsData, daysInMonth);
    
    const labels = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
    
    // Week colors (same as line chart for consistency)
    const weekColors = ['#667eea', '#10b981', '#f59e0b', '#ec4899'];
    
    // Create datasets for each week
    const datasets = [];
    for (let week = 1; week <= numWeeks; week++) {
        const data = dayToDay.map(d => d[`week${week}`]);
        const color = weekColors[week - 1] || weekColors[0];
        
        datasets.push({
            label: `Week ${week}`,
            data: data,
            backgroundColor: color,
            borderColor: color + 'dd',
            borderWidth: 2,
            borderRadius: 6,
            barPercentage: 0.8,
            categoryPercentage: 0.9
        });
    }
    
    chartInstances.weeklyScoresBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2.5,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: { size: 13, weight: 'bold' },
                        usePointStyle: true,
                        pointStyle: 'rect',
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                    padding: 14,
                    titleFont: { size: 15, weight: 'bold' },
                    bodyFont: { size: 13 },
                    callbacks: {
                        title: function(context) {
                            return `${context[0].label}`;
                        },
                        label: function(context) {
                            const weekNum = context.datasetIndex + 1;
                            const score = context.parsed.y;
                            return score !== null ? `Week ${weekNum}: ${score} habits` : `Week ${weekNum}: No data`;
                        },
                        afterLabel: function(context) {
                            const totalHabits = habitsData.length;
                            const score = context.parsed.y;
                            if (score !== null) {
                                const percent = ((score / totalHabits) * 100).toFixed(1);
                                return `${percent}% completion rate`;
                            }
                            return '';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: habitsData.length,
                    ticks: {
                        stepSize: Math.max(1, Math.floor(habitsData.length / 10)),
                        font: { size: 12 }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.06)'
                    },
                    title: {
                        display: true,
                        text: 'Completion Score (Total Habits Completed)',
                        font: { size: 14, weight: 'bold' }
                    }
                },
                x: {
                    ticks: {
                        font: { size: 12 }
                    },
                    grid: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Day of Week',
                        font: { size: 14, weight: 'bold' }
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    });
}