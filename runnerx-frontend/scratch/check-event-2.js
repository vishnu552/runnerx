
async function test() {
  const API_URL = 'http://127.0.0.1:3001';
  try {
    const res = await fetch(`${API_URL}/api/events/public/2`);
    const data = await res.json();
    console.log('Event 2 Categories:', JSON.stringify(data.event?.categories, null, 2));
  } catch (e) {
    console.error(e);
  }
}
test();
