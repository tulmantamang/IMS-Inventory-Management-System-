(async () => {
  try {
    const fetch = globalThis.fetch;
    if (!fetch) throw new Error('fetch not available in this Node runtime');

    const ts = Date.now();
    const email = `test.${ts}@example.com`;
    console.log('Using test email:', email);

    const signupRes = await fetch('http://localhost:3003/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test User', email, password: 'TestPass123!', role: 'staff' }),
    });

    console.log('Signup status:', signupRes.status);
    let signupBody;
    try { signupBody = await signupRes.json(); } catch (e) { signupBody = null; }
    console.log('Signup body:', signupBody);

    // Try to read Set-Cookie header
    const rawSetCookie = signupRes.headers.get('set-cookie') || signupRes.headers.get('Set-Cookie');
    console.log('Raw Set-Cookie header:', rawSetCookie);
    const cookie = rawSetCookie ? rawSetCookie.split(';')[0] : null;
    console.log('Cookie to use:', cookie);

    // If signup didn't set cookie, try login
    if (!cookie) {
      const loginRes = await fetch('http://localhost:3003/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'TestPass123!' }),
      });
      console.log('Login status:', loginRes.status);
      try { const loginBody = await loginRes.json(); console.log('Login body:', loginBody); } catch(e){}
      const loginSetCookie = loginRes.headers.get('set-cookie') || loginRes.headers.get('Set-Cookie');
      console.log('Login Raw Set-Cookie:', loginSetCookie);
    }

    const headers = cookie ? { Cookie: cookie } : {};
    const countsRes = await fetch('http://localhost:3003/api/auth/usercounts', { method: 'GET', headers });
    console.log('Counts status:', countsRes.status);
    const countsBody = await countsRes.json();
    console.log('Counts response:', countsBody);
  } catch (err) {
    console.error('Error during test:', err);
    process.exitCode = 1;
  }
})();
