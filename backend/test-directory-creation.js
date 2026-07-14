const fs = require('fs').promises;
const path = require('path');

// Test the directory creation logic
const testDir = path.join(__dirname, 'uploads/homepage-background');

async function testDirectoryCreation() {
  try {
    console.log('Testing directory creation for:', testDir);
    
    // Create directory if it doesn't exist
    await fs.mkdir(testDir, { recursive: true });
    console.log('Successfully created directory:', testDir);
    
    // Check if directory exists
    const stats = await fs.stat(testDir);
    console.log('Directory exists:', stats.isDirectory());
    
    // List contents of the directory
    const files = await fs.readdir(testDir);
    console.log('Files in directory:', files);
    
  } catch (error) {
    console.error('Error testing directory creation:', error);
  }
}

testDirectoryCreation();