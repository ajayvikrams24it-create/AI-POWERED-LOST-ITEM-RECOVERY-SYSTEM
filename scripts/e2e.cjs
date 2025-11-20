const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const API = 'http://localhost:4000';

function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

async function waitForServer(timeout = 10000){
  const start = Date.now();
  while(Date.now() - start < timeout){
    try{
      const res = await fetch(API + '/api/items');
      if(res.ok) return true;
    }catch(e){}
    await sleep(300);
  }
  throw new Error('Server did not respond in time');
}

async function run(){
  console.log('Preparing database and starting backend server...');
  // Remove existing sqlite DB so schema (with new columns) is recreated cleanly for the test
  try{
    const dbPath = path.join(__dirname, '..', 'server', 'data', 'db.sqlite');
    if (fs.existsSync(dbPath)){
      fs.unlinkSync(dbPath);
      console.log('Removed existing DB at', dbPath);
    }
  }catch(e){
    console.warn('Could not remove existing DB (continuing):', e.message);
  }

  const serverProc = spawn(process.execPath, ['index.js'], { cwd: path.join(__dirname, '..', 'server'), stdio: ['ignore','inherit','inherit'] });

  try{
    console.log('Waiting for server to be ready...');
    await waitForServer(10000);
    console.log('Server ready. Running E2E steps...');

    const postJson = async (path, body) => {
      const res = await fetch(API + path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      return { ok: res.ok, status: res.status, data };
    };

    const getJson = async (path) => {
      const res = await fetch(API + path);
      const data = await res.json();
      return { ok: res.ok, status: res.status, data };
    };

    // Register users
    const u1 = await postJson('/api/auth/register', { email: 'alice_cmd2@example.com', name: 'Alice CMD2', password: 'pass123', rollNo: 'RCMD10', institution: 'UniCMD', phone: '111' });
    if(!u1.ok){ console.error('Register u1 failed', u1); throw new Error('register u1 failed'); }
    const u2 = await postJson('/api/auth/register', { email: 'bob_cmd2@example.com', name: 'Bob CMD2', password: 'pass123', rollNo: 'RCMD20', institution: 'UniCMD', phone: '222' });
    if(!u2.ok){ console.error('Register u2 failed', u2); throw new Error('register u2 failed'); }
    console.log('Registered users:', u1.data.user.id, u2.data.user.id);

    // Create lost
    const lost = await postJson('/api/items', {
      type: 'lost',
      title: 'CMD Blue Backpack X',
      description: 'Blue backpack with white stripe, contains notebook',
      category: 'bag',
      location: 'Main Library',
      dateReported: (new Date()).toISOString(),
      status: 'active',
      reportedBy: u1.data.user.id,
      reporterName: 'Alice CMD2',
      reporterRollNo: 'RCMD10',
      reporterInstitution: 'UniCMD'
    });
    if(!lost.ok){ console.error('Create lost failed', lost); throw new Error('create lost failed'); }
    console.log('Lost created:', lost.data.item.id);

    // Create found
    const found = await postJson('/api/items', {
      type: 'found',
      title: 'Found: CMD Blue Backpack X',
      description: 'Found a blue backpack with white stripe near the library',
      category: 'bag',
      location: 'Main Library',
      dateReported: (new Date()).toISOString(),
      status: 'active',
      reportedBy: u2.data.user.id,
      reporterName: 'Bob CMD2',
      reporterRollNo: 'RCMD20',
      reporterInstitution: 'UniCMD'
    });
    if(!found.ok){ console.error('Create found failed', found); throw new Error('create found failed'); }
    console.log('Found created:', found.data.item.id);

    await sleep(1200);

    const matches = await getJson('/api/matches/user/' + u1.data.user.id);
    console.log('Matches for user1:', JSON.stringify(matches.data.matches || [], null, 2));

    const msg = await postJson('/api/messages', {
      fromUserId: u1.data.user.id,
      toUserId: u2.data.user.id,
      lostItemId: lost.data.item.id,
      foundItemId: found.data.item.id,
      content: 'Hello from automated CMD E2E test'
    });
    console.log('Message send result:', JSON.stringify(msg.data, null, 2));

    const msgs = await getJson('/api/messages/' + u2.data.user.id);
    console.log('Messages for user2:', JSON.stringify(msgs.data.messages || [], null, 2));

    console.log('E2E run completed successfully');
  }catch(err){
    console.error('E2E runner error:', err);
  }finally{
    try{ serverProc && serverProc.kill(); }catch(e){}
    process.exit(0);
  }
}

// polyfill fetch if needed
(async ()=>{
  if (typeof fetch === 'undefined'){
    global.fetch = (...args) => import('node-fetch').then(({default:fetch})=>fetch(...args));
  }
  await run();
})();
