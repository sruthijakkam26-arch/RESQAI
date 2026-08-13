(async ()=>{
  const fetch = global.fetch || (await import('node-fetch')).default;
  const backend = 'http://localhost:5000';
  try{
    let r = await fetch(backend + '/api/disasters');
    console.log('/api/disasters GET', r.status);
    console.log(await r.text());
  }catch(e){console.log('/api/disasters GET error', e.message)}
  try{
    let r = await fetch(backend + '/api/disasters', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({type:'Test',description:'x',location:'here',severity:'Low',status:'active'})});
    console.log('/api/disasters POST', r.status);
    console.log(await r.text());
  }catch(e){console.log('/api/disasters POST error', e.message)}
  try{
    let r = await fetch(backend + '/api/auth/register', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({name:'E2E',email:'e2e@example.com',password:'Test1234'})});
    console.log('/api/auth/register', r.status);
    let txt = await r.text();
    console.log(txt);
    let token = null;
    try{ const b = JSON.parse(txt); token = b.token } catch(e){ console.log('no token from register') }
    if(token){ let r2 = await fetch(backend + '/api/auth/me', { headers: { Authorization: 'Bearer ' + token } }); console.log('/api/auth/me', r2.status); console.log(await r2.text()); }
  }catch(e){console.log('/api/auth/register error', e.message)}
  try{
    let r = await fetch(backend + '/api/air/assess?lat=40.7128&lon=-74.0060');
    console.log('/api/air/assess', r.status);
    console.log(await r.text());
  }catch(e){console.log('/api/air/assess error', e.message)}
})();
