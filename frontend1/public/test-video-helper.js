// Quick Test Script for VideoChat Feature
// Run this in browser console after logging in

console.log('🧪 VideoChat Test Helper Loaded');
console.log('================================');

// Helper function to check if appointment is within 30 minutes
function canJoinCall(appointmentDate, appointmentTime) {
    const appointmentDateTime = new Date(`${appointmentDate.split('T')[0]}T${appointmentTime}`);
    const now = new Date();
    const timeDiff = appointmentDateTime.getTime() - now.getTime();
    const within30Min = timeDiff <= 30 * 60 * 1000 && timeDiff > 0;

    console.log('📅 Appointment Time:', appointmentDateTime.toLocaleString());
    console.log('🕐 Current Time:', now.toLocaleString());
    console.log('⏱️  Time Difference:', Math.round(timeDiff / 1000 / 60), 'minutes');
    console.log('✅ Can Join Call:', within30Min);

    return within30Min;
}

// Helper function to create a test appointment time (15 minutes from now)
function getTestAppointmentTime() {
    const now = new Date();
    const testTime = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes from now

    const hours = testTime.getHours().toString().padStart(2, '0');
    const minutes = testTime.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;

    console.log('🎯 Suggested Test Time (15 min from now):', timeString);
    console.log('📅 Date:', testTime.toLocaleDateString());

    return {
        date: testTime.toISOString().split('T')[0],
        time: timeString,
        fullDateTime: testTime
    };
}

// Check Socket.IO connection
function checkSocketConnection() {
    console.log('\n🔌 Checking Socket.IO...');

    if (typeof io !== 'undefined') {
        console.log('✅ Socket.IO library loaded');
    } else {
        console.log('❌ Socket.IO library NOT loaded');
    }
}

// Check WebRTC support
function checkWebRTCSupport() {
    console.log('\n🎥 Checking WebRTC Support...');

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        console.log('✅ getUserMedia supported');
    } else {
        console.log('❌ getUserMedia NOT supported');
    }

    if (typeof RTCPeerConnection !== 'undefined') {
        console.log('✅ RTCPeerConnection supported');
    } else {
        console.log('❌ RTCPeerConnection NOT supported');
    }
}

// Test camera and microphone access
async function testMediaDevices() {
    console.log('\n📹 Testing Camera & Microphone Access...');

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });

        console.log('✅ Camera & Microphone access granted!');
        console.log('📊 Video tracks:', stream.getVideoTracks().length);
        console.log('📊 Audio tracks:', stream.getAudioTracks().length);

        // Stop the stream
        stream.getTracks().forEach(track => track.stop());
        console.log('✅ Test stream stopped');

        return true;
    } catch (error) {
        console.error('❌ Media access error:', error.message);
        console.log('💡 Please grant camera/microphone permissions in browser settings');
        return false;
    }
}

// Check current user and role
function checkUser() {
    console.log('\n👤 Checking User Info...');

    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
        const user = JSON.parse(userStr);
        console.log('✅ User logged in');
        console.log('   Name:', user.name);
        console.log('   Email:', user.email);
        console.log('   Role:', user.role);
    } else {
        console.log('❌ No user logged in');
    }
}

// Run all checks
async function runAllChecks() {
    console.clear();
    console.log('🚀 Running VideoChat Diagnostic Tests...\n');

    checkUser();
    checkSocketConnection();
    checkWebRTCSupport();
    await testMediaDevices();

    console.log('\n📋 Test Appointment Suggestion:');
    const testTime = getTestAppointmentTime();

    console.log('\n✨ All checks complete!');
    console.log('\n📝 Next Steps:');
    console.log('1. Book an appointment for:', testTime.time);
    console.log('2. Wait until', testTime.time);
    console.log('3. Click "Join Call" button on Dashboard');
    console.log('4. Test video/audio controls');
}

// Export functions to window for easy access
window.videoTestHelper = {
    runAllChecks,
    checkUser,
    checkSocketConnection,
    checkWebRTCSupport,
    testMediaDevices,
    canJoinCall,
    getTestAppointmentTime
};

console.log('\n💡 Usage:');
console.log('Run: videoTestHelper.runAllChecks()');
console.log('Or run individual tests:');
console.log('  - videoTestHelper.checkUser()');
console.log('  - videoTestHelper.testMediaDevices()');
console.log('  - videoTestHelper.getTestAppointmentTime()');
