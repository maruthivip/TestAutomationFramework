import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import sqlite3 from 'sqlite3';

let db: sqlite3.Database;
let userExists: boolean;

Given('I have a database connection', function () {
  db = new sqlite3.Database(':memory:');
  db.serialize(() => {
    db.run('CREATE TABLE users (email TEXT)');
    db.run('INSERT INTO users (email) VALUES (?)', ['john.doe@example.com']);
  });
});

When('I query for a user with email {string}', function (email: string, done: () => void) {
  db.get('SELECT * FROM users WHERE email = ?', [email], (err: Error | null, row: any) => {
    if (err) throw err;
    userExists = !!row;
    done();
  });
});

Then('the user should exist in the database', function () {
  expect(userExists).toBe(true);
});