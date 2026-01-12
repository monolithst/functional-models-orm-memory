import { assert } from 'chai'
import {
  createOrm,
  PrimaryKeyUuidProperty,
  queryBuilder,
  TextProperty,
} from 'functional-models'
import { create } from '../../src/datastoreAdapter'

const getSeedData1 = () => ({
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
  },
})

type Test1Models = Readonly<{
  id: string
  name: string
}>

const setup = (seedData: any = undefined) => {
  const datastoreAdapter = create({ seedData })
  const orm = createOrm({ datastoreAdapter })
  const models = {
    Test1Models: orm.Model<Test1Models>({
      pluralName: 'Test1Models',
      namespace: 'functional-models-orm-memory',
      properties: {
        id: PrimaryKeyUuidProperty(),
        name: TextProperty(),
      },
    }),
  }

  return {
    datastoreAdapter,
    orm,
    models,
  }
}

describe('/src/datastoreAdapter.ts', () => {
  describe('#create()', () => {
    it('should be able to create without any arguments', () => {
      const instance = create()
      assert.isOk(instance)
    })
    it('should create all 4 main functions + count', () => {
      const instance = create()
      const actual = Object.keys(instance)
      const expected = ['save', 'delete', 'retrieve', 'search', 'count']
      assert.includeMembers(actual, expected)
    })
    describe('#retrieve()', () => {
      it('should return an object from the seedData when the primary key is provided', async () => {
        const { datastoreAdapter, models } = setup(getSeedData1())
        const actual = await datastoreAdapter.retrieve(
          models.Test1Models,
          '032c282c-b367-4d15-b19a-01c855b38f44'
        )
        const expected = {
          id: '032c282c-b367-4d15-b19a-01c855b38f44',
          name: 'my-name-2',
        }
        assert.deepEqual(actual, expected)
      })
      it('should return undefined from the seedData an unknown primary key is provided', async () => {
        const { datastoreAdapter, models } = setup(getSeedData1())
        const actual = await datastoreAdapter.retrieve(
          models.Test1Models,
          'b9143f12-a2b1-45d1-83c2-9ecc9ac8d142'
        )
        assert.isUndefined(actual)
      })
    })
    describe('#delete()', () => {
      it('should return undefined when using seedData when an actual primary key', async () => {
        const { datastoreAdapter, models } = setup(getSeedData1())
        const actual = await datastoreAdapter.delete(
          models.Test1Models,
          '032c282c-b367-4d15-b19a-01c855b38f44'
        )
        assert.isUndefined(actual)
      })
    })
    describe('#save()', () => {
      it('should return an object with a new id', async () => {
        const { datastoreAdapter, models } = setup()
        const actual = await datastoreAdapter.save(
          models.Test1Models.create<'id'>({ name: 'my-name' })
        )
        assert.isOk(actual.id)
      })
    })
    describe('#search()', () => {
      it('should return one object name the name is provided in the search when using SeedData1', async () => {
        const { datastoreAdapter, models } = setup(getSeedData1())
        const actual = await datastoreAdapter.search(
          models.Test1Models,
          queryBuilder().property('name', 'my-name-3').compile()
        )
        const expected = {
          page: undefined,
          instances: [
            {
              id: '49dd6b5b-cb33-4331-8224-98cc4fd4595a',
              name: 'my-name-3',
            },
          ],
        }
        assert.deepEqual(actual, expected)
      })
    })
    describe('#count()', () => {
      it('should return 3 when using SeedData1', async () => {
        const { datastoreAdapter, models } = setup(getSeedData1())
        const actual = await datastoreAdapter.count(models.Test1Models)
        const expected = 3
        assert.deepEqual(actual, expected)
      })
      it('should return 0 when NOT using SeedData1', async () => {
        const { datastoreAdapter, models } = setup()
        const actual = await datastoreAdapter.count(models.Test1Models)
        const expected = 0
        assert.deepEqual(actual, expected)
      })
    })
  })
})
