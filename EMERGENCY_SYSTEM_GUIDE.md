# TruckerLink Emergency Request System

## Overview
The emergency request system allows drivers to request help when they encounter problems with their trucks. Nearby mechanics can see these requests, view live locations, and accept them. Both parties can track each other in real-time once a request is accepted.

## Features
- 🚨 Emergency request creation by drivers
- 📍 Real-time location tracking for drivers and mechanics
- 🗺️ Geospatial queries to find nearby mechanics/drivers
- 🔄 Live updates via WebSocket (Socket.io)
- 🛣️ Route visualization support
- ⚡ Mechanic availability status
- 📊 Request status tracking

## Models

### EmergencyRequest
```javascript
{
  driver: ObjectId,           // Reference to Driver
  mechanic: ObjectId,         // Reference to Mechanic (null until accepted)
  problemType: String,        // 'engine', 'tire', 'brake', 'electrical', 'fuel', 'transmission', 'other'
  description: String,        // Problem description
  location: {                 // GeoJSON Point
    type: 'Point',
    coordinates: [lng, lat],
    address: String
  },
  status: String,            // 'pending', 'accepted', 'in-progress', 'completed', 'cancelled'
  priority: String,          // 'low', 'medium', 'high', 'critical'
  vehicleInfo: {
    type: String,
    model: String,
    year: Number,
    plateNumber: String
  },
  estimatedArrival: Date,
  acceptedAt: Date,
  completedAt: Date,
  cancelledAt: Date,
  cancelReason: String
}
```

### Updated Driver Model
Added fields:
- `currentLocation` (GeoJSON Point with coordinates and address)
- `socketId` (for real-time tracking)

### Updated Mechanic Model
Added fields:
- `currentLocation` (GeoJSON Point with coordinates and address)
- `isAvailable` (availability status)
- `socketId` (for real-time tracking)

## API Endpoints

### Emergency Request Routes

#### Create Emergency Request (Driver)
```http
POST /api/v1/emergency/create
Authorization: Bearer <driver_token>
Content-Type: application/json

{
  "problemType": "engine",
  "description": "Engine overheating and smoking",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "address": "123 Main St, New York, NY",
  "priority": "high",
  "vehicleInfo": {
    "type": "Semi-Truck",
    "model": "Freightliner Cascadia",
    "year": 2020,
    "plateNumber": "ABC123"
  }
}
```

#### Get Driver's Requests
```http
GET /api/v1/emergency/driver/my-requests?status=pending
Authorization: Bearer <driver_token>
```
Query Parameters:
- `status` (optional): Filter by status - 'pending', 'accepted', 'in-progress', 'completed', 'cancelled'

#### Get Mechanic's Requests
```http
GET /api/v1/emergency/mechanic/my-requests?status=accepted
Authorization: Bearer <mechanic_token>
```
Query Parameters:
- `status` (optional): Filter by status - 'accepted', 'in-progress', 'completed', 'cancelled'

#### Get Nearby Requests (Mechanic)
```http
GET /api/v1/emergency/nearby?latitude=40.7128&longitude=-74.0060&maxDistance=50000
Authorization: Bearer <mechanic_token>
```

#### Accept Emergency Request (Mechanic)
```http
POST /api/v1/emergency/accept/:requestId
Authorization: Bearer <mechanic_token>
```

#### Update Request Status
```http
PATCH /api/v1/emergency/:requestId/status
Authorization: Bearer <driver_or_mechanic_token>
Content-Type: application/json

{
  "status": "in-progress"
}
```

#### Get Request Details
```http
GET /api/v1/emergency/:requestId
Authorization: Bearer <driver_or_mechanic_token>
```

### Location Routes

#### Update Driver Location
```http
PATCH /api/v1/location/driver
Authorization: Bearer <driver_token>
Content-Type: application/json

{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "address": "123 Main St, New York, NY"
}
```

#### Get Driver Location
```http
GET /api/v1/location/driver/:driverId
```

#### Update Mechanic Location
```http
PATCH /api/v1/location/mechanic
Authorization: Bearer <mechanic_token>
Content-Type: application/json

{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "address": "456 Oak Ave, New York, NY"
}
```

#### Get Mechanic Location
```http
GET /api/v1/location/mechanic/:mechanicId
```

#### Update Mechanic Availability
```http
PATCH /api/v1/location/mechanic/availability
Authorization: Bearer <mechanic_token>
Content-Type: application/json

{
  "isAvailable": true
}
```

#### Get Nearby Mechanics (For Driver)
```http
GET /api/v1/location/nearby-mechanics?latitude=40.7128&longitude=-74.0060&maxDistance=50000
Authorization: Bearer <driver_token>
```

#### Get Nearby Drivers (For Mechanic)
```http
GET /api/v1/location/nearby-drivers?latitude=40.7128&longitude=-74.0060&maxDistance=10000
Authorization: Bearer <mechanic_token>
```

## WebSocket Events (Socket.io)

### Connection
```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your_jwt_token',
    userType: 'driver' // or 'mechanic'
  }
});
```

### Events to Emit (Client → Server)

#### Update Driver Location
```javascript
socket.emit('driver:location-update', {
  latitude: 40.7128,
  longitude: -74.0060,
  address: '123 Main St, New York, NY'
});
```

#### Update Mechanic Location
```javascript
socket.emit('mechanic:location-update', {
  latitude: 40.7128,
  longitude: -74.0060,
  address: '456 Oak Ave, New York, NY'
});
```

### Events to Listen (Server → Client)

#### New Emergency Request (Mechanic receives)
```javascript
socket.on('emergency:new-request', (data) => {
  console.log('New emergency request:', data.request);
  // Show notification to mechanic
});
```

#### Request Accepted (Driver receives)
```javascript
socket.on('emergency:request-accepted', (data) => {
  console.log('Your request was accepted:', data.request);
  // Show mechanic info and start tracking
});
```

#### Request Taken (Other mechanics receive)
```javascript
socket.on('emergency:request-taken', (data) => {
  console.log('Request no longer available:', data.requestId);
  // Remove from available requests list
});
```

#### Location Changed (Both parties)
```javascript
socket.on('driver:location-changed', (data) => {
  console.log('Driver location updated:', data.location);
  // Update map marker
});

socket.on('mechanic:location-changed', (data) => {
  console.log('Mechanic location updated:', data.location);
  // Update map marker
});
```

#### Status Updated
```javascript
socket.on('emergency:status-updated', (data) => {
  console.log('Request status changed:', data.request.status);
  // Update UI accordingly
});
```

#### Error Handling
```javascript
socket.on('error', (data) => {
  console.error('Socket error:', data.message);
});
```

## Implementation Flow

### Driver Creates Emergency Request
1. Driver registers/logs in and gets JWT token
2. Driver updates their location via REST API or WebSocket
3. Driver creates emergency request with location and problem details
4. Server finds all nearby available mechanics (within 50km)
5. Server emits `emergency:new-request` event to all nearby mechanics
6. Driver waits for acceptance

### Mechanic Accepts Request
1. Mechanic receives `emergency:new-request` via WebSocket
2. Mechanic views request details and driver location
3. Mechanic accepts request via REST API
4. Server updates request status to 'accepted'
5. Server emits `emergency:request-accepted` to driver
6. Server emits `emergency:request-taken` to other mechanics
7. Both parties can now track each other in real-time

### Real-Time Location Tracking
1. Both driver and mechanic emit location updates via WebSocket every few seconds
2. Server broadcasts location changes to the other party
3. Frontend updates map markers in real-time
4. Use services like Google Maps Directions API to show route

### Request Completion
1. Either party updates request status to 'in-progress' → 'completed'
2. Server emits `emergency:status-updated` to both parties
3. Final status is saved with completion timestamp

## Frontend Integration Tips

### Map Integration
Use libraries like:
- Google Maps JavaScript API
- Mapbox GL JS
- Leaflet

### Real-Time Location Updates
```javascript
// Update location every 10 seconds
setInterval(() => {
  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit('driver:location-update', {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      address: 'Current address' // Use reverse geocoding
    });
  });
}, 10000);
```

### Route Visualization
Use Google Maps Directions API:
```javascript
const directionsService = new google.maps.DirectionsService();
const directionsRenderer = new google.maps.DirectionsRenderer();

directionsService.route({
  origin: driverLocation,
  destination: mechanicLocation,
  travelMode: 'DRIVING'
}, (result, status) => {
  if (status === 'OK') {
    directionsRenderer.setDirections(result);
  }
});
```

## Testing

### Create a Driver
```bash
curl -X POST http://localhost:3000/api/v1/drivers/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "driver@test.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Driver",
    "phone": "1234567890",
    "licenseNumber": "DL123456",
    "licenseExpiry": "2025-12-31",
    "vehicleType": "Semi-Truck"
  }'
```

### Create a Mechanic
```bash
curl -X POST http://localhost:3000/api/v1/mechanics/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mechanic@test.com",
    "password": "password123",
    "firstName": "Mike",
    "lastName": "Mechanic",
    "phone": "0987654321",
    "certificationNumber": "CERT123456",
    "specializations": ["engine", "brake"],
    "yearsOfExperience": 5
  }'
```

### Test Emergency Request Flow
1. Login as driver and get token
2. Update driver location
3. Create emergency request
4. Login as mechanic and get token
5. Update mechanic location (near driver)
6. Get nearby requests as mechanic
7. Accept the request
8. Track status updates

## Notes
- Coordinates are stored in GeoJSON format: [longitude, latitude]
- Distances are in meters (50000 = 50km)
- MongoDB 2dsphere index is used for geospatial queries
- WebSocket authentication uses JWT tokens
- Both REST API and WebSocket can be used for location updates
