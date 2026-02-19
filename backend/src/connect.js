import { Room } from "@livekit/rtc-node";
import { AccessToken } from "livekit-server-sdk";

// CHANGE THESE ONLY IF NEEDED
const LIVEKIT_URL = "ws://127.0.0.1:7880"; // force IPv4
const API_KEY = 'devkey';
const API_SECRET = "secret";

async function run() {
  const room = new Room();

  const token = new AccessToken(API_KEY, API_SECRET, {
    identity: "node-test",
  });

  token.addGrant({
    roomJoin: true,
    room: "debug-room",
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  console.log("Connecting to:", LIVEKIT_URL);

  await room.connect(LIVEKIT_URL, token.toJwt());

  console.log("✅ NODE CONNECTED TO ROOM");

  room.on("disconnected", () => {
    console.log("❌ disconnected");
  });
}

run().catch((err) => {
  console.error("❌ CONNECTION FAILED");
  console.error(err);
});
