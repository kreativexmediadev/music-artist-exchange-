import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up to 20 users
    { duration: '1m', target: 20 }, // Stay at 20 users for 1 minute
    { duration: '30s', target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'], // Less than 1% of requests should fail
  },
};

const BASE_URL = 'http://localhost:3000';

export default function () {
  // Test homepage
  const homeRes = http.get(`${BASE_URL}/`);
  check(homeRes, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage loads fast': (r) => r.timings.duration < 500,
  });
  sleep(1);

  // Test dashboard
  const dashboardRes = http.get(`${BASE_URL}/dashboard`);
  check(dashboardRes, {
    'dashboard status is 200': (r) => r.status === 200,
    'dashboard loads fast': (r) => r.timings.duration < 500,
  });
  sleep(1);

  // Test artist page
  const artistRes = http.get(`${BASE_URL}/artist/1`);
  check(artistRes, {
    'artist page status is 200': (r) => r.status === 200,
    'artist page loads fast': (r) => r.timings.duration < 500,
  });
  sleep(1);

  // Test API endpoints
  const apiRes = http.get(`${BASE_URL}/api/artists`);
  check(apiRes, {
    'API status is 200': (r) => r.status === 200,
    'API response is fast': (r) => r.timings.duration < 200,
  });
  sleep(1);
} 