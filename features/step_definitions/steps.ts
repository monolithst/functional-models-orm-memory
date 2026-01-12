import { assert } from 'chai'
import { Given, When, Then } from '@cucumber/cucumber'
import { datastoreAdapter } from '../../src'
import { createOrm, Orm, PrimaryKeyUuidProperty, queryBuilder, TextProperty } from 'functional-models'

const SeedData = {
  SeedData1: () => {
    return {
      'functional-models-orm-memory/Test1Models': {
        '29a766b5-e77b-4099-a7f2-61cda0a29cc3': {
          id: '29a766b5-e77b-4099-a7f2-61cda0a29cc3',
          name: 'my-name-1',
        },
        '032c282c-b367-4d15-b19a-01c855b38f44': {
          id: '032c282c-b367-4d15-b19a-01c855b38f44',
          name: 'my-name-2',
        },
        '49dd6b5b-cb33-4331-8224-98cc4fd4595a': {
          id: '49dd6b5b-cb33-4331-8224-98cc4fd4595a',
          name: 'my-name-3',
        },
        'd84734d3-2ec4-4da4-8cac-e2953394b7f4': {
          id: 'd84734d3-2ec4-4da4-8cac-e2953394b7f4',
          name: 'my-name-4',
        },
      },
    }
  }
}

const Data = {
  Undefined: () => undefined,
  Test1ModelDataId1: () => 'cbac64c0-36c0-42c8-b736-57c5b7ba1c5a',
  Test1ModelData: () => ({
    id: 'cbac64c0-36c0-42c8-b736-57c5b7ba1c5a',
    name: 'another-name'
  }),
  SearchTest1Models1: () => queryBuilder()
    .property('name', 'another-name')
    .compile(),
  SearchTest1Models1Result: () => ({
    instances: [{
      id: 'cbac64c0-36c0-42c8-b736-57c5b7ba1c5a',
      name: 'another-name'
    }],
      page: undefined,
  })
}

const Models = {
  Test1Models: (orm: Orm) => {
    return orm.Model({
      pluralName: 'Test1Models',
      namespace: 'functional-models-orm-memory',
      properties: {
        id: PrimaryKeyUuidProperty(),
        name: TextProperty(),
      }
    })
  }
}

Given('a datastore using seed data {word} is created', function(key: string) {
  const seedData = SeedData[key]()
  this.datastoreAdapter = datastoreAdapter.create({seedData})
  this.orm = createOrm({ datastoreAdapter: this.datastoreAdapter })
})

When('{word} is called with {word} and {word}', async function(funcKey: string, modelKey: string, dataKey: string) {
  const model = Models[modelKey](this.orm)
  const data = Data[dataKey]()
  this.result = await this.datastoreAdapter[funcKey](model, data)
})

When('save is called with {word} and data {word}', async function(modelKey: string, dataKey: string) {
  const model = Models[modelKey](this.orm)
  const data = Data[dataKey]()
  this.result = await this.datastoreAdapter.save(model.create(data))
})

Then('the result is {int}', function(value: any) {
  const actual = this.result
  const expected = value
  assert.deepEqual(actual, expected)
})

Then('the result is undefined', function() {
  const actual = this.result
  assert.isUndefined(actual)
})

Then('the result matches {word}', function(dataKey: string) {
  const expected = Data[dataKey]()
  const actual = this.result
  assert.deepEqual(actual, expected)
})
