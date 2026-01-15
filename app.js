// ==================== //
// AgriDock App JavaScript
// ==================== //

// State Management
const appState = {
    currentPage: 'dronePage',
    activeTool: 'polygon',
    fieldPoints: [],
    isDrawing: false,
    notificationPanelOpen: false,
    isDarkMode: false
};

// ==================== //
// Page Navigation
// ==================== //
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetPage = item.dataset.page;
            
            // Update nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Update pages
            pages.forEach(page => page.classList.remove('active'));
            document.getElementById(targetPage).classList.add('active');
            
            appState.currentPage = targetPage;
        });
    });
}

// ==================== //
// Notification Panel
// ==================== //
function initNotificationPanel() {
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationPanel = document.getElementById('notificationPanel');
    const closeNotifications = document.getElementById('closeNotifications');
    const overlay = document.getElementById('overlay');

    notificationBtn.addEventListener('click', () => {
        notificationPanel.classList.add('active');
        overlay.classList.add('active');
        appState.notificationPanelOpen = true;
    });

    closeNotifications.addEventListener('click', closeNotificationPanel);
    overlay.addEventListener('click', closeNotificationPanel);

    function closeNotificationPanel() {
        notificationPanel.classList.remove('active');
        overlay.classList.remove('active');
        appState.notificationPanelOpen = false;
    }
}

// ==================== //
// Drone Status Updates
// ==================== //
function initDroneStatus() {
    // Simulate real-time updates
    setInterval(() => {
        updateBatteryLevel();
        updateSprayLevel();
        updateMissionProgress();
        updateStats();
    }, 3000);
}

function updateBatteryLevel() {
    const batteryValue = document.querySelector('.stat-card.battery .stat-value');
    const batteryFill = document.querySelector('.battery-fill');
    const batteryTrend = document.querySelector('.stat-card.battery .stat-trend');
    
    if (batteryValue && batteryFill) {
        let currentLevel = parseInt(batteryValue.textContent);
        currentLevel = Math.max(20, currentLevel - Math.floor(Math.random() * 2));
        
        batteryValue.textContent = currentLevel + '%';
        batteryFill.style.width = currentLevel + '%';
        
        const timeRemaining = Math.floor(currentLevel * 0.25);
        batteryTrend.querySelector('span:last-child').textContent = `~${timeRemaining} min`;
        
        // Update trend color
        if (currentLevel < 30) {
            batteryTrend.classList.remove('good');
            batteryTrend.classList.add('warning');
        }
    }
}

function updateSprayLevel() {
    const sprayValue = document.querySelector('.stat-card.spray .stat-value');
    const sprayFill = document.querySelector('.spray-fill');
    const sprayTrend = document.querySelector('.stat-card.spray .stat-trend');
    
    if (sprayValue && sprayFill) {
        let currentLevel = parseInt(sprayValue.textContent);
        currentLevel = Math.max(10, currentLevel - Math.floor(Math.random() * 3));
        
        sprayValue.textContent = currentLevel + '%';
        sprayFill.style.width = currentLevel + '%';
        
        const litersLeft = (currentLevel / 10).toFixed(1);
        sprayTrend.querySelector('span:last-child').textContent = `${litersLeft}L left`;
    }
}

function updateMissionProgress() {
    const progressFill = document.querySelector('.flight-progress-fill');
    const areaCovered = document.querySelector('.progress-stat .value');
    const remaining = document.querySelectorAll('.progress-stat .value')[1];
    const eta = document.querySelectorAll('.progress-stat .value')[2];
    
    if (progressFill) {
        let currentProgress = parseFloat(progressFill.style.width);
        currentProgress = Math.min(100, currentProgress + Math.random() * 0.5);
        
        progressFill.style.width = currentProgress + '%';
        
        const covered = (currentProgress * 0.2).toFixed(1);
        const remain = (20 - covered).toFixed(1);
        const timeLeft = Math.floor((100 - currentProgress) * 0.2);
        
        if (areaCovered) areaCovered.textContent = `${covered} acres`;
        if (remaining) remaining.textContent = `${remain} acres`;
        if (eta) eta.textContent = `${timeLeft} min`;
    }
}

function updateStats() {
    // Update battery temperature
    const batteryTemp = document.querySelector('.stat-icon-small.temp').parentElement.querySelector('.stat-value-small');
    if (batteryTemp) {
        const temp = 40 + Math.floor(Math.random() * 5);
        batteryTemp.textContent = `${temp}°C`;
    }
    
    // Update altitude
    const altitude = document.querySelector('.stat-icon-small.altitude').parentElement.querySelector('.stat-value-small');
    if (altitude) {
        const alt = 13 + Math.floor(Math.random() * 5);
        altitude.textContent = `${alt}m`;
    }
    
    // Update speed
    const speed = document.querySelector('.stat-icon-small.speed').parentElement.querySelector('.stat-value-small');
    if (speed) {
        const spd = (7 + Math.random() * 3).toFixed(1);
        speed.textContent = `${spd} m/s`;
    }
}

// ==================== //
// Dock Status Updates
// ==================== //
function initDockStatus() {
    setInterval(() => {
        updateOperationTimer();
        updateBatterySwapProgress();
    }, 1000);
}

function updateOperationTimer() {
    const timer = document.querySelector('.operation-timer');
    if (timer) {
        const time = timer.textContent.split(':');
        let minutes = parseInt(time[0]);
        let seconds = parseInt(time[1]);
        
        seconds++;
        if (seconds >= 60) {
            seconds = 0;
            minutes++;
        }
        
        timer.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
}

function updateBatterySwapProgress() {
    const progressFill = document.querySelector('.step-progress-fill');
    if (progressFill) {
        let currentProgress = parseFloat(progressFill.style.width);
        currentProgress = Math.min(100, currentProgress + 0.5);
        progressFill.style.width = currentProgress + '%';
        
        if (currentProgress >= 100) {
            setTimeout(() => {
                progressFill.style.width = '0%';
            }, 2000);
        }
    }
}

// ==================== //
// Flight Planning Tools
// ==================== //
function initFlightPlanning() {
    const mapView = document.getElementById('mapView');
    const svg = document.getElementById('mapOverlay');
    const fieldBoundary = document.getElementById('fieldBoundary');
    const boundaryPoints = document.getElementById('boundaryPoints');
    const flightPath = document.getElementById('flightPath');
    
    // Tool selection
    const toolButtons = document.querySelectorAll('.tool-btn');
    toolButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            toolButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            appState.activeTool = btn.dataset.tool;
            
            if (appState.activeTool !== 'polygon') {
                alert('Tool coming soon! Use Draw Field for now.');
            }
        });
    });
    
    // Map drawing
    svg.addEventListener('click', (e) => {
        if (appState.activeTool === 'polygon') {
            const rect = svg.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            appState.fieldPoints.push({ x, y });
            
            // Add point marker
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', y);
            circle.setAttribute('r', '6');
            circle.setAttribute('fill', '#10b981');
            circle.setAttribute('stroke', 'white');
            circle.setAttribute('stroke-width', '2');
            boundaryPoints.appendChild(circle);
            
            // Update polygon
            updateFieldBoundary();
            
            // Hide instruction after first point
            if (appState.fieldPoints.length === 1) {
                document.getElementById('drawingInstruction').style.display = 'none';
            }
        }
    });
    
    // Clear field button
    document.getElementById('clearFieldBtn').addEventListener('click', () => {
        appState.fieldPoints = [];
        boundaryPoints.innerHTML = '';
        fieldBoundary.setAttribute('points', '');
        flightPath.innerHTML = '';
        document.getElementById('drawingInstruction').style.display = 'flex';
        document.getElementById('fieldInfoPanel').style.display = 'none';
        document.getElementById('planSummary').style.display = 'none';
    });
    
    // Finish field button
    document.getElementById('finishFieldBtn').addEventListener('click', () => {
        if (appState.fieldPoints.length >= 3) {
            updateFieldBoundary();
            calculateFieldStats();
            document.getElementById('fieldInfoPanel').style.display = 'block';
        } else {
            alert('Please add at least 3 points to define a field.');
        }
    });
    
    // Close field panel
    document.getElementById('closeFieldPanel').addEventListener('click', () => {
        document.getElementById('fieldInfoPanel').style.display = 'none';
    });
    
    // Map controls
    document.getElementById('zoomIn').addEventListener('click', () => {
        alert('Zoom in functionality would integrate with a real map API');
    });
    
    document.getElementById('zoomOut').addEventListener('click', () => {
        alert('Zoom out functionality would integrate with a real map API');
    });
    
    document.getElementById('locateBtn').addEventListener('click', () => {
        alert('Location functionality would use device GPS');
    });
    
    document.getElementById('layerBtn').addEventListener('click', () => {
        alert('Layer selection would show satellite/terrain options');
    });
}

function updateFieldBoundary() {
    const fieldBoundary = document.getElementById('fieldBoundary');
    
    if (appState.fieldPoints.length >= 2) {
        const pointsStr = appState.fieldPoints.map(p => `${p.x},${p.y}`).join(' ');
        fieldBoundary.setAttribute('points', pointsStr);
    }
}

function calculateFieldStats() {
    if (appState.fieldPoints.length < 3) return;
    
    // Calculate area using shoelace formula
    let area = 0;
    const n = appState.fieldPoints.length;
    
    for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        area += appState.fieldPoints[i].x * appState.fieldPoints[j].y;
        area -= appState.fieldPoints[j].x * appState.fieldPoints[i].y;
    }
    
    area = Math.abs(area / 2);
    
    // Convert pixels to acres (simulated - would use real coordinates)
    const acres = (area / 1000).toFixed(1);
    
    // Calculate perimeter
    let perimeter = 0;
    for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        const dx = appState.fieldPoints[j].x - appState.fieldPoints[i].x;
        const dy = appState.fieldPoints[j].y - appState.fieldPoints[i].y;
        perimeter += Math.sqrt(dx * dx + dy * dy);
    }
    
    const perimeterMeters = Math.floor(perimeter * 0.5);
    
    // Update UI
    document.getElementById('fieldArea').textContent = `${acres} acres`;
    document.getElementById('fieldPerimeter').textContent = `${perimeterMeters} m`;
}

// ==================== //
// Flight Plan Configuration
// ==================== //
function initFlightPlanConfig() {
    // Pattern selection
    const patternButtons = document.querySelectorAll('[data-pattern]');
    patternButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            patternButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // Sliders
    const sprayWidthSlider = document.getElementById('sprayWidth');
    const sprayWidthValue = document.getElementById('sprayWidthValue');
    sprayWidthSlider.addEventListener('input', (e) => {
        sprayWidthValue.textContent = e.target.value + 'm';
    });
    
    const altitudeSlider = document.getElementById('flightAltitude');
    const altitudeValue = document.getElementById('flightAltitudeValue');
    altitudeSlider.addEventListener('input', (e) => {
        altitudeValue.textContent = e.target.value + 'm';
    });
    
    const speedSlider = document.getElementById('flightSpeed');
    const speedValue = document.getElementById('flightSpeedValue');
    speedSlider.addEventListener('input', (e) => {
        speedValue.textContent = e.target.value + ' m/s';
    });
    
    // Generate plan button
    document.getElementById('generatePlanBtn').addEventListener('click', () => {
        if (appState.fieldPoints.length < 3) {
            alert('Please define a field first by drawing on the map.');
            return;
        }
        
        generateFlightPlan();
    });
    
    // Edit plan button
    document.getElementById('editPlanBtn').addEventListener('click', () => {
        document.getElementById('planSummary').style.display = 'none';
    });
    
    // Start mission button
    document.getElementById('startMissionBtn').addEventListener('click', () => {
        openMissionModal();
    });
}

function generateFlightPlan() {
    // Simulate flight plan generation
    const flightPath = document.getElementById('flightPath');
    flightPath.innerHTML = '';
    
    // Generate parallel lines across the field
    if (appState.fieldPoints.length >= 3) {
        // Find bounds
        const xs = appState.fieldPoints.map(p => p.x);
        const ys = appState.fieldPoints.map(p => p.y);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);
        
        const sprayWidth = parseInt(document.getElementById('sprayWidth').value);
        const lineSpacing = sprayWidth * 3; // Scaled for display
        
        let y = minY + lineSpacing;
        let direction = 1;
        
        while (y < maxY) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            
            if (direction === 1) {
                line.setAttribute('x1', minX);
                line.setAttribute('x2', maxX);
            } else {
                line.setAttribute('x1', maxX);
                line.setAttribute('x2', minX);
            }
            
            line.setAttribute('y1', y);
            line.setAttribute('y2', y);
            line.setAttribute('stroke', '#3b82f6');
            line.setAttribute('stroke-width', '2');
            line.setAttribute('stroke-dasharray', '8,4');
            
            flightPath.appendChild(line);
            
            y += lineSpacing;
            direction *= -1;
        }
    }
    
    // Calculate stats
    const area = parseFloat(document.getElementById('fieldArea').textContent);
    const speed = parseFloat(document.getElementById('flightSpeed').value);
    const altitude = parseFloat(document.getElementById('flightAltitude').value);
    
    const distance = (area * 200 + Math.random() * 500).toFixed(1);
    const time = Math.floor(distance / speed / 60);
    const battery = Math.floor(time * 2.5);
    const spray = (area * 3.6).toFixed(1);
    const waypoints = Math.floor(distance / 100) + 2;
    
    // Update UI
    document.getElementById('totalDistance').textContent = `${distance} m`;
    document.getElementById('estimatedTime').textContent = `${time} min`;
    document.getElementById('batteryNeeded').textContent = `${battery}%`;
    document.getElementById('sprayNeeded').textContent = `${spray}L`;
    document.getElementById('waypointCount').textContent = waypoints;
    
    // Show summary
    document.getElementById('planSummary').style.display = 'block';
    
    // Scroll to summary
    setTimeout(() => {
        document.getElementById('planSummary').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 300);
}

// ==================== //
// Mission Modal
// ==================== //
function initMissionModal() {
    const modal = document.getElementById('missionModal');
    const closeBtn = document.getElementById('closeMissionModal');
    const cancelBtn = document.getElementById('cancelMission');
    const confirmBtn = document.getElementById('confirmMission');
    const overlay = document.getElementById('overlay');
    
    closeBtn.addEventListener('click', closeMissionModal);
    cancelBtn.addEventListener('click', closeMissionModal);
    overlay.addEventListener('click', () => {
        if (modal.classList.contains('active')) {
            closeMissionModal();
        }
    });
    
    confirmBtn.addEventListener('click', () => {
        closeMissionModal();
        launchMission();
    });
    
    function closeMissionModal() {
        modal.classList.remove('active');
        if (!appState.notificationPanelOpen) {
            overlay.classList.remove('active');
        }
    }
}

function openMissionModal() {
    const modal = document.getElementById('missionModal');
    const overlay = document.getElementById('overlay');
    
    modal.classList.add('active');
    overlay.classList.add('active');
}

function launchMission() {
    // Show success notification
    alert('Mission started! The drone is now taking off and will follow the planned route.');
    
    // Switch to drone status page
    const droneNavItem = document.querySelector('[data-page="dronePage"]');
    droneNavItem.click();
}

// ==================== //
// Quick Actions
// ==================== //
function initQuickActions() {
    // Emergency stop
    const emergencyBtn = document.querySelector('.action-btn.emergency');
    if (emergencyBtn) {
        emergencyBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to emergency stop the drone? It will hover in place.')) {
                alert('Emergency stop activated! Drone is hovering in place.');
            }
        });
    }
    
    // Return home
    const returnBtn = document.querySelector('.action-btn.return');
    if (returnBtn) {
        returnBtn.addEventListener('click', () => {
            if (confirm('Send the drone back to the dock?')) {
                alert('Drone is returning to dock. Current mission will be paused.');
            }
        });
    }
}

// ==================== //
// Settings
// ==================== //
function initSettings() {
    // Dark mode toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', (e) => {
            appState.isDarkMode = e.target.checked;
            
            if (e.target.checked) {
                alert('Dark mode would be implemented here by adding a dark theme class to the body element.');
            }
        });
    }
    
    // Settings items
    const settingItems = document.querySelectorAll('.setting-item:not(.toggle)');
    settingItems.forEach(item => {
        item.addEventListener('click', () => {
            const text = item.querySelector('.setting-info span').textContent;
            alert(`${text} settings would open a detailed configuration page.`);
        });
    });
    
    // Profile card
    const profileCard = document.querySelector('.profile-card');
    if (profileCard) {
        profileCard.addEventListener('click', () => {
            alert('Profile settings would allow editing name, email, and photo.');
        });
    }
}

// ==================== //
// Touch Interactions
// ==================== //
function initTouchInteractions() {
    // Add haptic feedback for buttons (on supported devices)
    const allButtons = document.querySelectorAll('button, .nav-item, .tool-btn, .option-btn, .setting-item');
    
    allButtons.forEach(button => {
        button.addEventListener('touchstart', () => {
            // Haptic feedback would be implemented here
            if (navigator.vibrate) {
                navigator.vibrate(10);
            }
        });
    });
}

// ==================== //
// Live Data Simulation
// ==================== //
function startLiveDataSimulation() {
    // Simulate battery charging in dock
    setInterval(() => {
        const chargingBattery = document.querySelector('.battery-slot.charging');
        if (chargingBattery) {
            const currentLevel = parseInt(chargingBattery.querySelector('span').textContent);
            if (currentLevel < 100) {
                chargingBattery.querySelector('span').textContent = Math.min(100, currentLevel + 1) + '%';
            }
        }
    }, 5000);
    
    // Simulate tank level changes
    setInterval(() => {
        const tankFill = document.querySelector('.tank-fill');
        if (tankFill) {
            const currentHeight = parseFloat(tankFill.style.height);
            // Randomly fluctuate slightly
            const newHeight = Math.max(60, Math.min(90, currentHeight + (Math.random() - 0.5) * 2));
            tankFill.style.height = newHeight + '%';
            
            const tankLevel = document.querySelector('.tank-level');
            if (tankLevel) {
                tankLevel.textContent = Math.round(newHeight) + '%';
            }
        }
    }, 10000);
}

// ==================== //
// Initialization
// ==================== //
document.addEventListener('DOMContentLoaded', () => {
    console.log('AgriDock App Initializing...');
    
    // Initialize all modules
    initNavigation();
    initNotificationPanel();
    initDroneStatus();
    initDockStatus();
    initFlightPlanning();
    initFlightPlanConfig();
    initMissionModal();
    initQuickActions();
    initSettings();
    initTouchInteractions();
    startLiveDataSimulation();
    
    console.log('AgriDock App Ready! ✓');
    
    // Welcome message
    setTimeout(() => {
        console.log('%c🚁 AgriDock Control System', 'font-size: 20px; color: #10b981; font-weight: bold;');
        console.log('%cMonitoring drone systems...', 'color: #6b7280;');
    }, 500);
});

// ==================== //
// Service Worker Registration (PWA)
// ==================== //
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Service worker would be registered here for offline functionality
        console.log('PWA features ready for implementation');
    });
}

// ==================== //
// Utility Functions
// ==================== //
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function calculateDistance(p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
}

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

// Export for use in other modules if needed
window.AgriDock = {
    appState,
    updateBatteryLevel,
    updateSprayLevel,
    generateFlightPlan,
    launchMission
};
