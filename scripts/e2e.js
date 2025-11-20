const { spawn } = require('child_process');
const http = require('http');

const API = 'http://localhost:4000';

async function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

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
  console.log('Starting backend server...');
  const serverProc = spawn(process.execPath, ['index.js'], { cwd: __dirname + '\\..\\server', stdio: ['ignore','inherit','inherit'] });

  try{
    // wait for server
    console.log('Waiting for server to be ready...');
    await waitForServer(10000);
    console.log('Server ready. Running E2E steps...');

    // helper for fetch with JSON
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
    const u1 = await postJson('/api/auth/register', { email: 'alice_cmd@example.com', name: 'Alice CMD', password: 'pass123', rollNo: 'RCMD1', institution: 'UniCMD', phone: '111' });
    if(!u1.ok){ console.error('Register u1 failed', u1); throw new Error('register u1 failed'); }
    const u2 = await postJson('/api/auth/register', { email: 'bob_cmd@example.com', name: 'Bob CMD', password: 'pass123', rollNo: 'RCMD2', institution: 'UniCMD', phone: '222' });
    if(!u2.ok){ console.error('Register u2 failed', u2); throw new Error('register u2 failed'); }
    console.log('Registered users:', u1.data.user.id, u2.data.user.id);

    // Create lost item
    const lost = await postJson('/api/items', {
      type: 'lost',
      title: 'CMD Blue Backpack',
      description: 'Blue backpack with white stripe, contains notebook',
      category: 'bag',
      location: 'Main Library',
      dateReported: (new Date()).toISOString(),
      status: 'active',
      reportedBy: u1.data.user.id,
      reporterName: 'Alice CMD',
      reporterRollNo: 'RCMD1',
      reporterInstitution: 'UniCMD'
    });
    if(!lost.ok){ console.error('Create lost failed', lost); throw new Error('create lost failed'); }
    console.log('Lost created:', lost.data.item.id);

    // Create found item
    const found = await postJson('/api/items', {
      type: 'found',
      title: 'Found: CMD Blue Backpack',
      description: 'Found a blue backpack with white stripe near the library',
      category: 'bag',
      location: 'Main Library',
      dateReported: (new Date()).toISOString(),
      status: 'active',
      reportedBy: u2.data.user.id,
      reporterName: 'Bob CMD',
      reporterRollNo: 'RCMD2',
      reporterInstitution: 'UniCMD'
    });
    if(!found.ok){ console.error('Create found failed', found); throw new Error('create found failed'); }
    console.log('Found created:', found.data.item.id);

    // wait a moment for matching to run
    await sleep(1200);

    // Get matches for u1
    const matches = await getJson('/api/matches/user/' + u1.data.user.id);
    console.log('Matches for user1:', JSON.stringify(matches.data.matches || [], null, 2));

    // Send message from u1 to u2
    const msg = await postJson('/api/messages', {
      fromUserId: u1.data.user.id,
      toUserId: u2.data.user.id,
      lostItemId: lost.data.item.id,
      foundItemId: found.data.item.id,
      content: 'Hello from automated CMD E2E test'
    });
    console.log('Message send result:', JSON.stringify(msg.data, null, 2));

    // Get messages for u2
    const msgs = await getJson('/api/messages/' + u2.data.user.id);
    console.log('Messages for user2:', JSON.stringify(msgs.data.messages || [], null, 2));

    console.log('E2E run completed successfully');
  }catch(err){
    console.error('E2E runner error:', err);
  }finally{
    // kill server
    try{ serverProc && serverProc.kill(); }catch(e){}
    process.exit(0);
  }
}

// ensure global fetch exists (Node 18+). If not, dynamically import node-fetch
(async ()=>{
  if (typeof fetch === 'undefined'){
    global.fetch = (...args) => import('node-fetch').then(({default:fetch})=>fetch(...args));
  }
  await run();
})();
