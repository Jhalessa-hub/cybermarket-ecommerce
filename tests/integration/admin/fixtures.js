import { ordersFixture } from '../orders/fixtures.js';

export function adminFixture() {
  const fixture = ordersFixture();
  fixture.db.update((data) => { data.Session = { role: 'admin', userId: 'admin', email: 'admin@cybermarket.com', createdAt: new Date().toISOString() }; });
  return fixture;
}
