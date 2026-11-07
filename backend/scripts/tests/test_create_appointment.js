(async () => {
  try {
    const fetch = global.fetch || require('node-fetch');
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin26' })
    });
    const loginJson = await loginRes.json();
    const token = loginJson.data.token;

    const appointment = {
      AppointmentID: 'APT-TEST-2',
      PatientID: 'PT-7230',
      DoctorID: 'DR-TEST-1',
      AppointmentDate: '2026-06-20',
      AppointmentTime: '08:00:00',
      Status: 'Scheduled'
    };

    const res = await fetch('http://localhost:3000/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify(appointment)
    });

    console.log('status', res.status);
    console.log(await res.text());
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
