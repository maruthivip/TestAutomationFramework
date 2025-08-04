Feature: Reqres API Testing

  Scenario: List users on page 2
    Given I have the reqres API base URL
    When I request the list of users on page 2
    Then the response should contain a list of users

  Scenario: Register a user
    Given I have the reqres API base URL
    When I register a user with email "eve.holt@reqres.in" and password "pistol"
    Then the response should contain an id and token