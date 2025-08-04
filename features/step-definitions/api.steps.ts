import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

let baseUrl: string;
let response: any;

Given('I have the reqres API base URL', function () {
  baseUrl = 'https://reqres.in/api';
});

When('I request the list of users on page 2', async function () {
  response = await fetch(`${baseUrl}/users?page=2`, {
    headers: { 'x-api-key': 'reqres-free-v1' }
  });
  this.body = await response.json();
});

Then('the response should contain a list of users', function () {
  expect(this.body).toHaveProperty('data');
  expect(Array.isArray(this.body.data)).toBe(true);
});

When('I register a user with email {string} and password {string}', async function (email, password) {
  response = await fetch(`${baseUrl}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': 'reqres-free-v1' },
    body: JSON.stringify({ email, password })
  });
  this.body = await response.json();
});

Then('the response should contain an id and token', function () {
  expect(this.body).toHaveProperty('id');
  expect(this.body).toHaveProperty('token');
});