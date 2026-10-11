const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

exports.generateToken = (req, res) => {
  const channelName = req.query.channelName;
  if (!channelName) {
    return res.status(400).json({ error: 'channel name is required' });
  }

  // Get uid
  let uid = req.query.uid;
  if(!uid || uid === '') {
    uid = 0;
  }

  // Get role
  let role = RtcRole.SUBSCRIBER;
  if (req.query.role === 'publisher') {
    role = RtcRole.PUBLISHER;
  }
  
  let expireTime = req.query.expireTime;
  if (!expireTime || expireTime === '') {
    expireTime = 3600; // default 1 hour
  } else {
    expireTime = parseInt(expireTime, 10);
  }

  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTime;

  const APP_ID = process.env.AGORA_APP_ID || 'cc1026d971f6445c89c2ec73a3603925';
  const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE || 'f61a378684ef4dbab08e7e79df82259f';

  try {
    const token = RtcTokenBuilder.buildTokenWithUid(
      APP_ID, 
      APP_CERTIFICATE, 
      channelName, 
      uid, 
      role, 
      privilegeExpireTime
    );
    return res.json({ token, appId: APP_ID });
  } catch (error) {
    console.error('Failed to generate Agora token:', error);
    return res.status(500).json({ error: 'Failed to generate token' });
  }
};
