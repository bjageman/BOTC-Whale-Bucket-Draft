import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Load environment variables from .env if running self-hosted mode
function loadEnv() {
  const envPath = path.join(__dirname, '../.env');
  if (!fs.existsSync(envPath)) return;
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const firstEquals = trimmed.indexOf('=');
    if (firstEquals === -1) continue;
    const key = trimmed.slice(0, firstEquals).trim();
    const value = trimmed.slice(firstEquals + 1).trim();
    process.env[key] = value;
  }
}

loadEnv();

const NTFY_SERVER_URL = process.env.VITE_NTFY_SERVER_URL || 'ntfy.sh';
const NTFY_USERNAME = process.env.VITE_NTFY_ADMIN_USERNAME || '';
const NTFY_PASSWORD = process.env.VITE_NTFY_ADMIN_PASSWORD || '';

// Build auth query parameter
function buildAuthParam() {
  if (!NTFY_USERNAME || !NTFY_PASSWORD) return '';
  const credentials = `${NTFY_USERNAME}:${NTFY_PASSWORD}`;
  const headerValue = `Basic ${btoa(credentials)}`;
  const encoded = btoa(headerValue)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return `?auth=${encoded}`;
}

async function runScaleTest() {
  const userCount = 15;
  const gameCode = `scale-test-${Math.random().toString(36).substring(2, 8)}`;
  const topic = `botc-companion-${gameCode}`;
  
  const cleanDomain = NTFY_SERVER_URL.replace(/^(https?:\/\/|wss?:\/\/)/, '');
  const wsProtocol = cleanDomain.startsWith('localhost') || cleanDomain.startsWith('127.0.0.1') ? 'ws' : 'wss';
  const httpProtocol = cleanDomain.startsWith('localhost') || cleanDomain.startsWith('127.0.0.1') ? 'http' : 'https';
  
  const authParam = buildAuthParam();
  const wsUrl = `${wsProtocol}://${cleanDomain}/${topic}/ws${authParam}`;
  const publishUrl = `${httpProtocol}://${cleanDomain}/${topic}${authParam}`;

  console.log(`[Scale Test] Starting Storyteller + 15 Players Gameplay Simulation.`);
  console.log(`[Scale Test] Mode:        Self-Hosted Server (from .env)`);
  console.log(`[Scale Test] Server URL:  ${NTFY_SERVER_URL}`);
  console.log(`[Scale Test] Game Code:   ${gameCode}`);
  console.log(`[Scale Test] Topic URL:   ${httpProtocol}://${cleanDomain}/${topic}`);
  console.log('--------------------------------------------------');

  // Helper to publish a message via HTTP POST with retry logic for 429 rate limiting
  async function publishMessage(payload, retries = 5, delay = 500) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(publishUrl, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        if (response.ok) return;
        if (response.status === 429 && attempt < retries) {
          console.warn(`    [Rate Limit 429] Retrying publish in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 1.5;
          continue;
        }
        throw new Error(`Publish failed with status: ${response.status} ${response.statusText}`);
      } catch (err) {
        if (attempt === retries) throw err;
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 1.5;
      }
    }
  }

  // 1. STORYTELLER state & setup
  const storytellerPlayers = [];
  const storytellerSocket = new WebSocket(wsUrl);

  storytellerSocket.onmessage = (event) => {
    try {
      const eventData = JSON.parse(event.data);
      if (!eventData.message) return;
      const payload = JSON.parse(eventData.message);

      if (payload.type === 'player_join') {
        const { name, id } = payload;
        console.log(`  [Storyteller] Received player_join from "${name}" (ID: ${id})`);
        
        // Respond to the player validating the code
        publishMessage({
          type: 'code_valid',
          gameType: 'standard',
          playerId: id,
          playerName: name
        }).catch(err => {
          console.error(`  [Storyteller] Error sending code validation for ${name}:`, err.message);
        });

        // Add player if not already added
        if (!storytellerPlayers.some(p => p.id === id)) {
          storytellerPlayers.push({
            id,
            name,
            isDead: false,
            roleId: ''
          });
        }
      }
    } catch (e) {
      // Ignore
    }
  };

  await new Promise((resolve, reject) => {
    storytellerSocket.onopen = resolve;
    storytellerSocket.onerror = reject;
  });
  console.log(`[Scale Test] Storyteller connected and listening for players.`);

  // 2. 15 PLAYERS state & setup
  const playerSockets = [];
  const playersData = Array.from({ length: userCount }, (_, i) => ({
    id: `player-id-${i + 1}`,
    name: `Player_${i + 1}`,
    assignedRoleReceived: false
  }));

  console.log(`[Scale Test] Connecting & joining 15 player clients sequentially...`);
  const joinDelay = 300;
  
  for (let i = 0; i < userCount; i++) {
    const pInfo = playersData[i];
    if (i > 0) {
      await new Promise(r => setTimeout(r, joinDelay));
    }

    try {
      await new Promise((resolve, reject) => {
        const ws = new WebSocket(wsUrl);
        playerSockets.push(ws);

        ws.onopen = () => {
          publishMessage({
            type: 'player_join',
            name: pInfo.name,
            id: pInfo.id
          }).then(() => {
            resolve();
          }).catch(err => {
            console.error(`  [${pInfo.name}] Failed to publish join:`, err.message);
            reject(err);
          });
        };

        ws.onmessage = (event) => {
          try {
            const eventData = JSON.parse(event.data);
            if (!eventData.message) return;
            const payload = JSON.parse(eventData.message);

            if (payload.type === 'code_valid' && payload.playerId === pInfo.id) {
              console.log(`  [${pInfo.name}] Received code validation confirmation.`);
            }

            if (payload.type === 'game_update' || payload.type === 'game_started') {
              const me = payload.players?.find(p => p.id === pInfo.id);
              if (me && me.roleId) {
                console.log(`  [${pInfo.name}] Successfully received assigned character: "${me.roleId}"`);
                pInfo.assignedRoleReceived = true;
              }
            }
          } catch (e) {
            // Ignore
          }
        };

        ws.onerror = (err) => {
          console.error(`  [${pInfo.name}] WebSocket error:`, err);
          reject(err);
        };
      });
      console.log(`  [${pInfo.name}] Connected and joined.`);
    } catch (err) {
      console.error(`  [${pInfo.name}] Failed to connect/join:`, err.message || err);
      cleanup([storytellerSocket, ...playerSockets]);
      process.exit(1);
    }
  }

  try {
    // Wait for Storyteller to receive all 15 join events
    console.log(`[Scale Test] Waiting for Storyteller to register all players...`);
    const startRegister = Date.now();
    while (Date.now() - startRegister < 5000) {
      if (storytellerPlayers.length === userCount) {
        break;
      }
      await new Promise(r => setTimeout(r, 200));
    }

    if (storytellerPlayers.length !== userCount) {
      throw new Error(`Only ${storytellerPlayers.length}/${userCount} players joined successfully.`);
    }
    console.log(`[Scale Test] Storyteller has all 15 players registered.`);

    // 3. STORYTELLER assigns characters and broadcasts game update (Grimoire Opened)
    console.log(`[Scale Test] Storyteller assigning characters to all 15 players...`);
    const mockRoles = [
      'washerwoman', 'librarian', 'investigator', 'chef', 'empath',
      'fortune_teller', 'undertaker', 'monk', 'ravenkeeper', 'virgin',
      'slayer', 'soldier', 'mayor', 'imp', 'poisoner'
    ];
    storytellerPlayers.forEach((p, idx) => {
      p.roleId = mockRoles[idx] || 'townsfolk';
    });

    console.log(`[Scale Test] Storyteller opening Grimoire -> sending 'game_update'...`);
    await publishMessage({
      type: 'game_update',
      players: storytellerPlayers,
      timeOfDay: 'night',
      dayNumber: 1
    });

    // 4. Verify all 15 players received their characters
    console.log(`[Scale Test] Verifying all 15 players received their assigned roles...`);
    const startVerify = Date.now();
    while (Date.now() - startVerify < 5000) {
      const allReceived = playersData.every(p => p.assignedRoleReceived);
      if (allReceived) {
        break;
      }
      await new Promise(r => setTimeout(r, 200));
    }

    const successCount = playersData.filter(p => p.assignedRoleReceived).length;
    console.log('--------------------------------------------------');
    if (successCount === userCount) {
      console.log(`[Scale Test] SUCCESS: Storyteller assigned characters and all 15 players received them!`);
      cleanup([storytellerSocket, ...playerSockets]);
      process.exit(0);
    } else {
      console.error(`[Scale Test] FAILURE: Only ${successCount}/${userCount} players successfully received their character.`);
      cleanup([storytellerSocket, ...playerSockets]);
      process.exit(1);
    }
  } catch (err) {
    console.error(`[Scale Test] Error during test execution:`, err);
    cleanup([storytellerSocket, ...playerSockets]);
    process.exit(1);
  }
}

function cleanup(sockets) {
  console.log('[Scale Test] Closing all websocket connections...');
  for (const ws of sockets) {
    try {
      ws.close();
    } catch (e) {
      // Ignore
    }
  }
}

runScaleTest();
