import { assert } from 'chai'
import { Given, When, Then } from '@cucumber/cucumber'
import { datastoreAdapter } from '../../src'
import {
  createOrm,
  DatetimeProperty,
  IntegerProperty,
  Model,
  ModelType,
  ModelWithReferencesConstructorProps,
  Orm,
  OrmModelInstance,
  PrimaryKeyUuidProperty,
  queryBuilder,
  TextProperty,
} from 'functional-models'

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

const MODELS: Record<
  string,
  (props: ModelWithReferencesConstructorProps) => {
    models: readonly ModelType<any>[]
    instances: readonly OrmModelInstance<any>[]
  }
> = {
  ModelList1: ({ Model, fetcher }) => {
    const ModelA = Model({
      pluralName: 'ModelA',
      namespace: 'functional-models-orm-memory',
      properties: {
        id: PrimaryKeyUuidProperty(),
        name: TextProperty({ required: true }),
        age: IntegerProperty({ required: true }),
        datetime: DatetimeProperty(),
      },
    })

    return {
      models: [ModelA] as ModelType<any>[],
      instances: [
        ModelA.create({
          id: 'edf73dba-216a-4e10-a38f-398a4b38350a',
          name: 'name-2',
          age: 2,
        }),
        ModelA.create({
          id: '2c3e6547-2d6b-44c3-ad2c-1220a3d305be',
          name: 'name-3',
          age: 10,
          datetime: new Date('2020-02-01T00:00:00.000Z'),
        }),
        ModelA.create({
          id: 'ed1dc8ff-fdc5-401c-a229-8566a418ceb5',
          name: 'name-1',
          age: 1,
          datetime: new Date('2020-01-01T00:00:00.000Z'),
        }),
        ModelA.create({
          name: 'name-4',
          age: 15,
          datetime: new Date('2020-03-01T00:00:00.000Z'),
        }),
        ModelA.create({
          name: 'name-5',
          age: 20,
        }),
        ModelA.create({
          name: 'name-7',
          age: 20,
        }),
        ModelA.create({
          name: 'name-6',
          age: 20,
        }),
        ModelA.create({
          name: 'name-9',
          age: 30,
        }),
        ModelA.create({
          name: 'name-10',
          age: 100,
          datetime: new Date('2020-05-01T00:00:00.000Z'),
        }),
        ModelA.create({
          name: 'name-8',
          age: 50,
        }),
      ] as OrmModelInstance<any>[],
    }
  },
}

const SEARCHES = {
  OrPropertySearch: () =>
    queryBuilder()
      .property('name', 'name-8')
      .or()
      .property('name', 'name-1')
      .or()
      .property('name', 'name-10')
      .compile(),
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

Given('an orm is setup', function () {
  this.datastoreAdapter = datastoreAdapter.create()
  this.orm = createOrm({ datastoreAdapter: this.datastoreAdapter })
})

Given(
  '{word} is created and inserted into the database',
  async function (key: string) {
    const result = MODELS[key](this.orm)
    this.models = result.models
    // @ts-ignore
    await result.instances.reduce(async (accP, i) => {
      await accP
      return i.save()
    }, Promise.resolve())
  }
)

When(
  'search named {word} is executed on model named {word}',
  async function (key: string, modelPluralName: string) {
    const search = SEARCHES[key]()
    const model = this.models.find(
      x => x.getModelDefinition().pluralName === modelPluralName
    )
    this.result = await model.search(search)
  }
)

Then(/^(\d+) instances are found$/, function (count: number) {
  const actual = this.result.instances.length
  const expected = count
  assert.equal(actual, expected)
})
