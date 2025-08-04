import { test, expect } from '@playwright/test';

const BASE_URL = 'https://reqres.in/api';
const API_KEY = 'reqres-free-v1';
const HEADERS = {
  'x-api-key': API_KEY,
  'Content-Type': 'application/json',
};

test.describe('Reqres.in API - BDD Scenarios', () => {
  test('GET /users?page=2 - List users (Given-When-Then)', async ({ request }) => {
    // Given a valid API key and base URL
    // When I request the list of users on page 2
    const response = await request.get(`${BASE_URL}/users?page=2`, { headers: HEADERS });
    // Then the response should be successful and contain user data
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('GET /users/{id} - Single user (Given-When-Then)', async ({ request }) => {
    // Given a valid user ID
    const userId = 2;
    // When I request the user details
    const response = await request.get(`${BASE_URL}/users/${userId}`, { headers: HEADERS });
    // Then the response should be successful and contain user data
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('data');
    expect(body.data).toHaveProperty('id', userId);
  });

  test('POST /users - Create user (Given-When-Then)', async ({ request }) => {
    // Given a new user payload
    const payload = { name: 'morpheus', job: 'leader' };
    // When I send a POST request to create the user
    const response = await request.post(`${BASE_URL}/users`, {
      headers: HEADERS,
      data: payload,
    });
    // Then the response should be successful and contain the created user
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty('name', payload.name);
    expect(body).toHaveProperty('job', payload.job);
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('createdAt');
  });

  test('POST /register - Register user (Given-When-Then)', async ({ request }) => {
    // Given a valid registration payload
    const payload = { email: 'eve.holt@reqres.in', password: 'pistol' };
    // When I send a POST request to register
    const response = await request.post(`${BASE_URL}/register`, {
      headers: HEADERS,
      data: payload,
    });
    // Then the response should be successful and contain id and token
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('token');
  });

  test('POST /login - Login user (Given-When-Then)', async ({ request }) => {
    // Given a valid login payload
    const payload = { email: 'eve.holt@reqres.in', password: 'cityslicka' };
    // When I send a POST request to login
    const response = await request.post(`${BASE_URL}/login`, {
      headers: HEADERS,
      data: payload,
    });
    // Then the response should be successful and contain a token
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('token');
  });
});