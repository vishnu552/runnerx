
async function test() {
  const API_URL = 'http://127.0.0.1:3001';
  try {
    const res = await fetch(`${API_URL}/api/events/public`);
    const data = await res.json();
    console.log('Total Events:', data.events?.length);
    if (data.events) {
      data.events.forEach(e => {
        console.log(`Event ID: ${e.id}, Title: ${e.title}, Categories: ${e.categories?.length || 0}`);
      });
    }
  } catch (e) {
    console.error(e);
  }
}
test();
