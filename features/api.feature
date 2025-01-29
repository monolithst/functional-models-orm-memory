Feature: API Functions

  Scenario: A simple "Cruds" on a model
    Given a datastore using seed data SeedData1 is created
    When count is called with Test1Models and Undefined
    Then the result is 4
    When retrieve is called with Test1Models and Test1ModelDataId1
    Then the result is undefined
    When save is called with Test1Models and data Test1ModelData
    Then the result matches Test1ModelData
    When retrieve is called with Test1Models and Test1ModelDataId1
    Then the result matches Test1ModelData
    When count is called with Test1Models and Test1ModelDataId1
    Then the result is 5
    When search is called with Test1Models and SearchTest1Models1
    Then the result matches SearchTest1Models1Result
    When delete is called with Test1Models and Test1ModelDataId1
    Then the result is undefined
    When retrieve is called with Test1Models and Test1ModelDataId1
    Then the result is undefined
    When count is called with Test1Models and Test1ModelDataId1
    Then the result is 4
