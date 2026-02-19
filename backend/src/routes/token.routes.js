import { Router } from 'express';
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import 'dotenv/config'; // Make sure you load environment variables

const router = Router();

// Configure LiveKit
const LIVEKIT_HOST = process.env.LIVEKIT_URL;
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;

// Service client for administration (optional for this, but good practice)
// const svc = new RoomServiceClient(LIVEKIT_HOST, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);

router.post('/generate', async (req, res) => {
    // 1. Get required data from the authenticated user (e.g., from a session/JWT)
    // NOTE: For this example, we'll assume the client sends the necessary IDs.
    // IN PRODUCTION: These should come from your user session AFTER authentication.
    const { roomName, participantIdentity } = req.body; 

    if (!roomName || !participantIdentity) {
        return res.status(400).json({ error: 'Missing roomName or participantIdentity' });
    }

    try {
        // 2. Create the Access Token
        const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
            identity: participantIdentity, // Unique ID (e.g., user_123)
            name: participantIdentity,     // Display name (optional)
        });

        // 3. Set the token grants (permissions)
        at.addGrant({
            roomJoin: true,
            room: roomName,
            canPublish: true,  // User can publish audio (microphone)
            canSubscribe: true, // User can subscribe to agent's audio
            canPublishData: true, // User can send data messages (optional)
        });

        const token = await at.toJwt();

        res.json({ token, roomName });

    } catch (error) {
        console.error('Error generating token:', error);
        res.status(500).json({ error: 'Failed to generate LiveKit token.' });
    }
});

export default router;