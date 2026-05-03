
async function test() {
  const eventId = 1; // Assuming Kota Marathon is ID 1
  const API_URL = 'http://127.0.0.1:3001';
  try {
    const res = await fetch(`${API_URL}/api/events/public/${eventId}`);
    const data = await res.json();
    console.log('Event Title:', data.event?.title);
    console.log('Categories Count:', data.event?.categories?.length);
    if (data.event?.categories) {
      data.event.categories.forEach(c => {
        console.log(` - ${c.raceType}: ${c.category?.name || 'No Template Name'}`);
        if (c.raceType === 'VIRTUAL') {
          console.log('   Virtual Settings:', JSON.stringify(c.virtualSettings, null, 2));
        }
      });
    }
  } catch (e) {
    console.error(e);
  }
}
test();
