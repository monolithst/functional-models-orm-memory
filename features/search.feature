Feature: Search Features

  Scenario: A property search with ors
    Given an orm is setup
    Given ModelList1 is created and inserted into the database
    When search named OrPropertySearch is executed on model named ModelA
    Then 3 instances are found

