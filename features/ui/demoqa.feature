Feature: DemoQA UI Testing

  Scenario: Fill out the Text Box form
    Given I am on the Text Box page
    When I fill in the form with name "John Doe" and email "john.doe@example.com"
    And I submit the form
    Then the output should show name "John Doe" and email "john.doe@example.com"