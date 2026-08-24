globalThis.window = {
  localStorage: {
    store: {},
    getItem(key) { return this.store[key] ?? null; },
    setItem(key, value) { this.store[key] = String(value); },
    removeItem(key) { delete this.store[key]; },
  },
  addEventListener() {},
  removeEventListener() {},
  dispatchEvent() {},
};
globalThis.crypto = { randomUUID: () => 'test-' + Math.random().toString(16).slice(2) };

const { default: inMemoryDb } = await import('./src/lib/inMemoryDb.js');
const booking = inMemoryDb.addBooking({
  name: 'New Customer',
  email: 'newcustomer@example.com',
  phone: '1234567890',
  vehicle: 'Honda Civic',
  package: 'Interior deep clean',
  preferred_date: '2026-08-25',
  amount: 250,
  status: 'Pending',
});

inMemoryDb.assignBookingToEmployee(booking.id, { id: 'emp-101', name: 'Alex Martinez' });
const assigned = inMemoryDb.getBookingsForEmployee('emp-101', 'Alex Martinez');
console.log('BOOKING_ID', booking.id);
console.log('ASSIGNED_COUNT', assigned.length);
console.log('ASSIGNED_BOOKING', JSON.stringify(assigned.find((item) => item.id === booking.id), null, 2));
