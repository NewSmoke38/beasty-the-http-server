import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import fs from 'fs';
import path from 'path';

// File to store visitor count data
const visitorDataFile = path.join(process.cwd(), 'visitor-data.json');

// Initialize visitor data structure
let visitorData = {
  totalVisits: 0,
  uniqueVisitors: new Map(), // IP -> lastVisitTime
  lastReset: Date.now()
};

// Load existing data if file exists
const loadVisitorData = () => {
  try {
    if (fs.existsSync(visitorDataFile)) {
      const data = JSON.parse(fs.readFileSync(visitorDataFile, 'utf8'));
      visitorData.totalVisits = data.totalVisits || 0;
      visitorData.lastReset = data.lastReset || Date.now();
      // Convert uniqueVisitors back to Map
      visitorData.uniqueVisitors = new Map(Object.entries(data.uniqueVisitors || {}));
    }
  } catch (error) {
    console.error('Error loading visitor data:', error);
  }
};

// Save visitor data to file
const saveVisitorData = () => {
  try {
    const dataToSave = {
      totalVisits: visitorData.totalVisits,
      lastReset: visitorData.lastReset,
      uniqueVisitors: Object.fromEntries(visitorData.uniqueVisitors)
    };
    fs.writeFileSync(visitorDataFile, JSON.stringify(dataToSave, null, 2));
  } catch (error) {
    console.error('Error saving visitor data:', error);
  }
};

// Load data on startup
loadVisitorData();

// Get visitor count
const getVisitorCount = asyncHandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponse(200, {
      totalVisits: visitorData.totalVisits,
      uniqueVisitors: visitorData.uniqueVisitors.size
    }, "Visitor count retrieved successfully")
  );
});

// Increment visitor count (with cooldown)
const incrementVisitorCount = asyncHandler(async (req, res) => {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const cooldownPeriod = 30 * 60 * 1000; // 30 minutes cooldown
  
  // Check if this IP has visited recently
  const lastVisit = visitorData.uniqueVisitors.get(clientIP);
  
  if (!lastVisit || (now - lastVisit) > cooldownPeriod) {
    // This is a new visit or cooldown expired
    visitorData.totalVisits += 1;
    visitorData.uniqueVisitors.set(clientIP, now);
    
    // Save to file
    saveVisitorData();
    
    return res.status(200).json(
      new ApiResponse(200, {
        totalVisits: visitorData.totalVisits,
        uniqueVisitors: visitorData.uniqueVisitors.size,
        message: "Visit counted"
      }, "Visit counted successfully")
    );
  } else {
    // Within cooldown period
    return res.status(200).json(
      new ApiResponse(200, {
        totalVisits: visitorData.totalVisits,
        uniqueVisitors: visitorData.uniqueVisitors.size,
        message: "Visit not counted (within cooldown period)"
      }, "Visit not counted - within cooldown period")
    );
  }
});

// Reset visitor count (admin only)
const resetVisitorCount = asyncHandler(async (req, res) => {
  visitorData.totalVisits = 0;
  visitorData.uniqueVisitors.clear();
  visitorData.lastReset = Date.now();
  
  saveVisitorData();
  
  return res.status(200).json(
    new ApiResponse(200, {
      totalVisits: visitorData.totalVisits,
      uniqueVisitors: visitorData.uniqueVisitors.size
    }, "Visitor count reset successfully")
  );
});

export {
  getVisitorCount,
  incrementVisitorCount,
  resetVisitorCount
}; 