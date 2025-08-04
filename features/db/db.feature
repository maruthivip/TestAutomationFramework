Feature: Database Testing

  Scenario: Check if a user exists in the database
    Given I have a database connection
    When I query for a user with email "john.doe@example.com"
    Then the user should exist in the database