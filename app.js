// ==================== //
// AgriDock App JavaScript
// ==================== //

// State Management
const appState = {
    currentPage: 'dronePage',
    activeTool: 'polygon',
    fieldPoints: [],
    fieldPolygon: null,
    flightPathLines: [],
    isDrawing: false,
    notificationPanelOpen: false,
    isDarkMode: false,
    map: null,
    userLocation: null,
    dockMarker: null,
    fieldMarkers: [],
    chemicalMix: [40, 30, 30]
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
    initializeMap();
    initDrawingTools();
    initMapControls();
}

// Initialize Leaflet Map
function initializeMap() {
    const mapView = document.getElementById('mapView');
    const mapLoading = document.getElementById('mapLoading');
    
    // Show loading indicator
    mapLoading.classList.remove('hidden');
    
    // Get user's location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                appState.userLocation = [lat, lon];
                createMap(lat, lon);
            },
            (error) => {
                // Fallback to a default location (agricultural area in California)
                console.log('Location access denied, using default location');
                const defaultLat = 36.7783;
                const defaultLon = -119.4179;
                appState.userLocation = [defaultLat, defaultLon];
                createMap(defaultLat, defaultLon);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    } else {
        // Browser doesn't support geolocation
        const defaultLat = 36.7783;
        const defaultLon = -119.4179;
        appState.userLocation = [defaultLat, defaultLon];
        createMap(defaultLat, defaultLon);
    }
}

function createMap(lat, lon) {
    const mapLoading = document.getElementById('mapLoading');
    
    // Initialize Leaflet map
    appState.map = L.map('mapView', {
        center: [lat, lon],
        zoom: 16,
        zoomControl: false,
        attributionControl: false
    });
    
    // Add satellite tile layer (using ESRI World Imagery)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: '&copy; Esri'
    }).addTo(appState.map);
    
    // Add a subtle overlay for better UI integration
    const overlayPane = appState.map.createPane('overlay');
    overlayPane.style.zIndex = 400;
    overlayPane.style.pointerEvents = 'none';
    
    // Add dock marker at user's location
    addDockMarker(lat, lon);
    
    // Enable polygon drawing now that map is ready
    enablePolygonDrawing();
    
    // Hide loading indicator
    setTimeout(() => {
        mapLoading.classList.add('hidden');
    }, 500);
}

function addDockMarker(lat, lon) {
    const dockIcon = L.divIcon({
        html: '<div class="dock-marker-icon"><i class="fas fa-warehouse"></i></div>',
        className: 'custom-marker',
        iconSize: [36, 44],
        iconAnchor: [18, 44]
    });
    
    appState.dockMarker = L.marker([lat, lon], { icon: dockIcon })
        .addTo(appState.map)
        .bindPopup('<strong>AgriDock Station</strong><br>Home Base');
}

// Initialize Drawing Tools
function initDrawingTools() {
    const toolButtons = document.querySelectorAll('.tool-btn');
    
    toolButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tool = btn.dataset.tool;
            
            toolButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            appState.activeTool = tool;
            
            if (tool === 'polygon') {
                enablePolygonDrawing();
            } else if (tool === 'rectangle') {
                drawRectangle();
            } else if (tool === 'circle') {
                drawCircle();
            } else if (tool === 'import') {
                alert('KML import functionality would allow importing field boundaries from external files.');
            }
        });
    });
}

function enablePolygonDrawing() {
    if (!appState.map) return;
    
    // Remove existing click handler
    appState.map.off('click');
    
    // Add new click handler for polygon drawing
    appState.map.on('click', (e) => {
        if (appState.activeTool === 'polygon') {
            addFieldPoint(e.latlng);
        }
    });
}

function addFieldPoint(latlng) {
    // Add point to array
    appState.fieldPoints.push(latlng);
    
    // Create marker for the point
    const pointIcon = L.divIcon({
        html: '<div class="field-point-marker"></div>',
        className: 'custom-marker',
        iconSize: [12, 12],
        iconAnchor: [6, 6]
    });
    
    const marker = L.marker(latlng, { icon: pointIcon }).addTo(appState.map);
    appState.fieldMarkers.push(marker);
    
    // Update polygon
    updateFieldPolygon();
    
    // Hide instruction after first point
    if (appState.fieldPoints.length === 1) {
        document.getElementById('drawingInstruction').classList.add('hidden');
    }
}

function updateFieldPolygon() {
    // Remove existing polygon
    if (appState.fieldPolygon) {
        appState.map.removeLayer(appState.fieldPolygon);
    }
    
    // Create new polygon if we have at least 2 points
    if (appState.fieldPoints.length >= 2) {
        appState.fieldPolygon = L.polygon(appState.fieldPoints, {
            color: '#10b981',
            fillColor: '#10b981',
            fillOpacity: 0.2,
            weight: 3
        }).addTo(appState.map);
    }
}

function drawRectangle() {
    if (!appState.userLocation) return;
    
    clearField();
    
    // Create a rectangle around the dock
    const lat = appState.userLocation[0];
    const lon = appState.userLocation[1];
    const offset = 0.002; // Approximately 220 meters
    
    const bounds = [
        [lat - offset, lon - offset],
        [lat + offset, lon + offset]
    ];
    
    appState.fieldPoints = [
        L.latLng(bounds[0][0], bounds[0][1]),
        L.latLng(bounds[0][0], bounds[1][1]),
        L.latLng(bounds[1][0], bounds[1][1]),
        L.latLng(bounds[1][0], bounds[0][1])
    ];
    
    // Add markers for each corner
    appState.fieldPoints.forEach(point => {
        const pointIcon = L.divIcon({
            html: '<div class="field-point-marker"></div>',
            className: 'custom-marker',
            iconSize: [12, 12],
            iconAnchor: [6, 6]
        });
        const marker = L.marker(point, { icon: pointIcon }).addTo(appState.map);
        appState.fieldMarkers.push(marker);
    });
    
    updateFieldPolygon();
    calculateFieldStats();
    document.getElementById('fieldInfoPanel').style.display = 'block';
    document.getElementById('drawingInstruction').classList.add('hidden');
}

function drawCircle() {
    if (!appState.userLocation) return;
    
    clearField();
    
    // Create a circular field around the dock
    const lat = appState.userLocation[0];
    const lon = appState.userLocation[1];
    const radius = 0.0015; // Approximately 165 meters
    const segments = 16;
    
    for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * 2 * Math.PI;
        const pointLat = lat + radius * Math.cos(angle);
        const pointLon = lon + radius * Math.sin(angle);
        
        const point = L.latLng(pointLat, pointLon);
        appState.fieldPoints.push(point);
        
        const pointIcon = L.divIcon({
            html: '<div class="field-point-marker"></div>',
            className: 'custom-marker',
            iconSize: [12, 12],
            iconAnchor: [6, 6]
        });
        const marker = L.marker(point, { icon: pointIcon }).addTo(appState.map);
        appState.fieldMarkers.push(marker);
    }
    
    updateFieldPolygon();
    calculateFieldStats();
    document.getElementById('fieldInfoPanel').style.display = 'block';
    document.getElementById('drawingInstruction').classList.add('hidden');
}

function clearField() {
    // Clear field points
    appState.fieldPoints = [];
    
    // Remove all markers
    appState.fieldMarkers.forEach(marker => appState.map.removeLayer(marker));
    appState.fieldMarkers = [];
    
    // Remove polygon
    if (appState.fieldPolygon) {
        appState.map.removeLayer(appState.fieldPolygon);
        appState.fieldPolygon = null;
    }
    
    // Remove flight path
    clearFlightPath();
    
    // Show instruction
    document.getElementById('drawingInstruction').classList.remove('hidden');
    document.getElementById('fieldInfoPanel').style.display = 'none';
    document.getElementById('planSummary').style.display = 'none';
}

function clearFlightPath() {
    appState.flightPathLines.forEach(line => appState.map.removeLayer(line));
    appState.flightPathLines = [];
}

// Initialize Map Controls
function initMapControls() {
    // Clear field button
    document.getElementById('clearFieldBtn').addEventListener('click', clearField);
    
    // Finish field button
    document.getElementById('finishFieldBtn').addEventListener('click', () => {
        if (appState.fieldPoints.length >= 3) {
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
    
    // Map control buttons
    document.getElementById('zoomIn').addEventListener('click', () => {
        if (appState.map) {
            appState.map.zoomIn();
        }
    });
    
    document.getElementById('zoomOut').addEventListener('click', () => {
        if (appState.map) {
            appState.map.zoomOut();
        }
    });
    
    document.getElementById('locateBtn').addEventListener('click', () => {
        if (appState.map && appState.userLocation) {
            appState.map.setView(appState.userLocation, 16);
        }
    });
    
    document.getElementById('layerBtn').addEventListener('click', () => {
        // Toggle between satellite and map view
        alert('Layer toggle: Switch between satellite, terrain, and street map views.');
    });
}

function calculateFieldStats() {
    if (appState.fieldPoints.length < 3) return;
    
    // Calculate area using turf.js algorithm (shoelace formula adapted for lat/lng)
    let area = 0;
    const n = appState.fieldPoints.length;
    
    // Convert to meters using Haversine approximation
    const toRadians = (deg) => deg * (Math.PI / 180);
    const earthRadius = 6371000; // meters
    
    // Calculate area in square meters
    for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        const lat1 = toRadians(appState.fieldPoints[i].lat);
        const lat2 = toRadians(appState.fieldPoints[j].lat);
        const lon1 = toRadians(appState.fieldPoints[i].lng);
        const lon2 = toRadians(appState.fieldPoints[j].lng);
        
        area += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
    }
    
    area = Math.abs(area * earthRadius * earthRadius / 2);
    
    // Convert to acres (1 acre = 4046.86 square meters)
    const acres = (area / 4046.86).toFixed(2);
    
    // Calculate perimeter
    let perimeter = 0;
    for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        const distance = appState.map.distance(appState.fieldPoints[i], appState.fieldPoints[j]);
        perimeter += distance;
    }
    
    const perimeterMeters = Math.floor(perimeter);
    
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

    // Chemical mix controls
    initChemicalMixControls();
    
    // Generate plan button
    document.getElementById('generatePlanBtn').addEventListener('click', () => {
        if (appState.fieldPoints.length < 3) {
            alert('Please define a field first by drawing on the map.');
            return;
        }
        const total = getChemicalMixTotal();
        if (total !== 100) {
            alert('Chemical mix must total 100% before generating a plan.');
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

function initChemicalMixControls() {
    const sliders = document.querySelectorAll('.chemical-slider');
    if (!sliders.length) return;
    
    sliders.forEach(slider => {
        slider.addEventListener('input', (e) => {
            const idx = parseInt(slider.dataset.index, 10);
            const rawValue = parseInt(e.target.value, 10);
            appState.chemicalMix[idx] = rawValue;
            
            // Keep total at or below 100% by trimming the slider that was just moved
            const total = getChemicalMixTotal();
            if (total > 100) {
                const adjusted = Math.max(0, rawValue - (total - 100));
                appState.chemicalMix[idx] = adjusted;
                slider.value = adjusted;
            }
            
            updateChemicalMixUI();
        });
    });
    
    updateChemicalMixUI();
}

function getChemicalMixTotal() {
    return appState.chemicalMix.reduce((sum, value) => sum + value, 0);
}

function updateChemicalMixUI() {
    const mixTotal = document.getElementById('mixTotal');
    const sliders = document.querySelectorAll('.chemical-slider');
    const total = getChemicalMixTotal();
    
    if (mixTotal) {
        mixTotal.textContent = `Total: ${total}%`;
        mixTotal.classList.toggle('error', total !== 100);
    }
    
    appState.chemicalMix.forEach((value, idx) => {
        const labelId = `jug${String.fromCharCode(65 + idx)}Value`;
        const resultId = `jug${String.fromCharCode(65 + idx)}Result`;
        const slider = sliders[idx];
        if (slider) {
            slider.value = value;
        }
        const valueLabel = document.getElementById(labelId);
        if (valueLabel) {
            valueLabel.textContent = `${value}%`;
        }
        const resultLabel = document.getElementById(resultId);
        if (resultLabel) {
            resultLabel.textContent = `${value}%`;
        }
    });
}

function generateFlightPlan() {
    if (appState.fieldPoints.length < 3) {
        alert('Please define a field first by drawing on the map.');
        return;
    }
    
    // Clear existing flight path
    clearFlightPath();
    
    // Get configuration
    const sprayWidth = parseFloat(document.getElementById('sprayWidth').value);
    const altitude = parseFloat(document.getElementById('flightAltitude').value);
    const speed = parseFloat(document.getElementById('flightSpeed').value);
    const pattern = document.querySelector('[data-pattern].active').dataset.pattern;
    
    // Generate flight path based on pattern
    let waypoints = [];
    
    if (pattern === 'parallel') {
        waypoints = generateParallelPattern(sprayWidth);
    } else if (pattern === 'spiral') {
        waypoints = generateSpiralPattern(sprayWidth);
    } else if (pattern === 'contour') {
        waypoints = generateContourPattern(sprayWidth);
    }
    
    // Draw flight path on map
    drawFlightPath(waypoints);
    
    // Calculate mission statistics
    calculateMissionStats(waypoints, speed, altitude);
    
    // Show summary
    document.getElementById('planSummary').style.display = 'block';
    
    // Scroll to summary
    setTimeout(() => {
        document.getElementById('planSummary').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 300);
}

function generateParallelPattern(sprayWidthMeters) {
    // Find the bounds of the field
    const bounds = L.latLngBounds(appState.fieldPoints);
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    
    // Calculate spray width in degrees (approximate)
    const metersPerDegreeLat = 111320;
    const sprayWidthDegrees = sprayWidthMeters / metersPerDegreeLat;
    
    // Determine the field orientation for optimal coverage
    const width = ne.lng - sw.lng;
    const height = ne.lat - sw.lat;
    const isWiderThanTall = width > height;
    
    const waypoints = [];
    
    // Start from dock location
    if (appState.userLocation) {
        waypoints.push(L.latLng(appState.userLocation[0], appState.userLocation[1]));
    }
    
    if (isWiderThanTall) {
        // Fly north-south lines
        let lng = sw.lng + sprayWidthDegrees / 2;
        let direction = 1; // 1 for north, -1 for south
        
        while (lng <= ne.lng) {
            if (direction === 1) {
                waypoints.push(L.latLng(sw.lat, lng));
                waypoints.push(L.latLng(ne.lat, lng));
            } else {
                waypoints.push(L.latLng(ne.lat, lng));
                waypoints.push(L.latLng(sw.lat, lng));
            }
            
            lng += sprayWidthDegrees;
            direction *= -1;
        }
    } else {
        // Fly east-west lines
        let lat = sw.lat + sprayWidthDegrees / 2;
        let direction = 1; // 1 for east, -1 for west
        
        while (lat <= ne.lat) {
            if (direction === 1) {
                waypoints.push(L.latLng(lat, sw.lng));
                waypoints.push(L.latLng(lat, ne.lng));
            } else {
                waypoints.push(L.latLng(lat, ne.lng));
                waypoints.push(L.latLng(lat, sw.lng));
            }
            
            lat += sprayWidthDegrees;
            direction *= -1;
        }
    }
    
    // Return to dock
    if (appState.userLocation) {
        waypoints.push(L.latLng(appState.userLocation[0], appState.userLocation[1]));
    }
    
    return waypoints;
}

function generateSpiralPattern(sprayWidthMeters) {
    // Calculate center of field
    const bounds = L.latLngBounds(appState.fieldPoints);
    const center = bounds.getCenter();
    
    const metersPerDegreeLat = 111320;
    const sprayWidthDegrees = sprayWidthMeters / metersPerDegreeLat;
    
    const waypoints = [];
    
    // Start from dock
    if (appState.userLocation) {
        waypoints.push(L.latLng(appState.userLocation[0], appState.userLocation[1]));
    }
    
    // Generate spiral from outside to inside
    const maxRadius = Math.max(
        bounds.getNorthEast().distanceTo(center),
        bounds.getSouthWest().distanceTo(center)
    ) / metersPerDegreeLat / metersPerDegreeLat;
    
    let radius = maxRadius;
    let angle = 0;
    const angleStep = Math.PI / 8; // 22.5 degrees
    
    while (radius > sprayWidthDegrees) {
        const lat = center.lat + radius * Math.cos(angle);
        const lng = center.lng + radius * Math.sin(angle);
        const point = L.latLng(lat, lng);
        
        // Only add if inside field polygon
        if (isPointInPolygon(point, appState.fieldPoints)) {
            waypoints.push(point);
        }
        
        angle += angleStep;
        radius -= sprayWidthDegrees / 8;
    }
    
    // Return to dock
    if (appState.userLocation) {
        waypoints.push(L.latLng(appState.userLocation[0], appState.userLocation[1]));
    }
    
    return waypoints;
}

function generateContourPattern(sprayWidthMeters) {
    // Generate paths that follow the field boundary
    const waypoints = [];
    
    // Start from dock
    if (appState.userLocation) {
        waypoints.push(L.latLng(appState.userLocation[0], appState.userLocation[1]));
    }
    
    const metersPerDegreeLat = 111320;
    const sprayWidthDegrees = sprayWidthMeters / metersPerDegreeLat;
    
    // Create concentric paths following field shape
    const center = L.latLngBounds(appState.fieldPoints).getCenter();
    
    for (let offset = 0; offset < 5; offset++) {
        const scale = 1 - (offset * sprayWidthDegrees * 2);
        if (scale <= 0.1) break;
        
        appState.fieldPoints.forEach((point, i) => {
            // Scale point towards center
            const lat = center.lat + (point.lat - center.lat) * scale;
            const lng = center.lng + (point.lng - center.lng) * scale;
            waypoints.push(L.latLng(lat, lng));
        });
        
        // Close the loop
        const firstScaled = appState.fieldPoints[0];
        const lat = center.lat + (firstScaled.lat - center.lat) * scale;
        const lng = center.lng + (firstScaled.lng - center.lng) * scale;
        waypoints.push(L.latLng(lat, lng));
    }
    
    // Return to dock
    if (appState.userLocation) {
        waypoints.push(L.latLng(appState.userLocation[0], appState.userLocation[1]));
    }
    
    return waypoints;
}

function drawFlightPath(waypoints) {
    if (waypoints.length < 2) return;
    
    // Create a polyline with all waypoints for the complete flight path
    const completePath = L.polyline(waypoints, {
        color: '#3b82f6',
        weight: 3,
        opacity: 0.85,
        dashArray: '8, 4',
        lineCap: 'round',
        lineJoin: 'round'
    }).addTo(appState.map);
    
    appState.flightPathLines.push(completePath);
    
    // Add waypoint markers at regular intervals
    const waypointIcon = L.divIcon({
        html: '<div class="waypoint-marker"></div>',
        className: 'custom-marker',
        iconSize: [8, 8],
        iconAnchor: [4, 4]
    });
    
    // Add markers at every waypoint for clear visibility
    waypoints.forEach((point, i) => {
        // Add marker at every waypoint
        const marker = L.marker(point, { 
            icon: waypointIcon,
            title: `Waypoint ${i + 1}`
        }).addTo(appState.map);
        appState.flightPathLines.push(marker);
    });
    
    // Add numbered start and end markers
    const startIcon = L.divIcon({
        html: '<div class="start-waypoint-marker"><span>START</span></div>',
        className: 'custom-marker start',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    });
    
    const endIcon = L.divIcon({
        html: '<div class="end-waypoint-marker"><span>END</span></div>',
        className: 'custom-marker end',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    });
    
    if (waypoints.length > 0) {
        const startMarker = L.marker(waypoints[0], { icon: startIcon }).addTo(appState.map);
        appState.flightPathLines.push(startMarker);
        
        const endMarker = L.marker(waypoints[waypoints.length - 1], { icon: endIcon }).addTo(appState.map);
        appState.flightPathLines.push(endMarker);
    }
    
    // Fit map to show entire flight path
    const flightBounds = L.latLngBounds(waypoints);
    appState.map.fitBounds(flightBounds, { padding: [50, 50] });
}

function calculateMissionStats(waypoints, speedMS, altitude) {
    // Calculate total distance
    let totalDistance = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
        totalDistance += appState.map.distance(waypoints[i], waypoints[i + 1]);
    }
    
    // Calculate time (distance / speed)
    const timeSeconds = totalDistance / speedMS;
    const timeMinutes = Math.ceil(timeSeconds / 60);
    
    // Calculate battery usage (assume 2.5% per minute)
    const batteryNeeded = Math.min(100, Math.ceil(timeMinutes * 2.5));
    
    // Calculate spray needed based on area
    const area = parseFloat(document.getElementById('fieldArea').textContent);
    const sprayPerAcre = 3.5; // Liters per acre
    const sprayNeeded = (area * sprayPerAcre).toFixed(1);
    
    // Update UI
    document.getElementById('totalDistance').textContent = `${(totalDistance / 1000).toFixed(2)} km`;
    document.getElementById('estimatedTime').textContent = `${timeMinutes} min`;
    document.getElementById('batteryNeeded').textContent = `${batteryNeeded}%`;
    document.getElementById('sprayNeeded').textContent = `${sprayNeeded}L`;
    document.getElementById('waypointCount').textContent = waypoints.length;
}

function isPointInPolygon(point, polygon) {
    let inside = false;
    const x = point.lng;
    const y = point.lat;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].lng;
        const yi = polygon[i].lat;
        const xj = polygon[j].lng;
        const yj = polygon[j].lat;
        
        const intersect = ((yi > y) !== (yj > y)) && 
                         (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    
    return inside;
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
