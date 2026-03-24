import { assert } from 'chai'
import {
  createOrm,
  DatastoreValueType,
  EqualitySymbol,
  NumberProperty,
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

const getSymbolSeedData = () => ({
  'functional-models-orm-memory/SymbolModels': {
    '299c2b6b-2079-5afe-b4e0-e2734aa4d97c': {
      id: '299c2b6b-2079-5afe-b4e0-e2734aa4d97c',
      name: 'Royal Gold, Inc.',
      symbol: 'RGLD',
      assetClass: 'UNCLASSIFIED',
      instrumentType: 'EQUITY',
      quoteType: 'EQUITY',
      sector: 'Basic Materials',
      industry: 'Gold',
      needsSecondaryClassification: false,
      marketCap: 18251980800,
      isActive: true,
      createdAt: '2026-03-23T12:38:22.617Z',
      updatedAt: '2026-03-23T14:16:47.493Z',
      averageDailyVolume10Day: 1577800,
      averageDailyVolume3Month: 1049944,
    },
    'b5f863f6-c566-5a28-b93b-fca29abdd516': {
      id: 'b5f863f6-c566-5a28-b93b-fca29abdd516',
      name: 'IDX Alternative FIAT ETF',
      symbol: 'GLDB',
      assetClass: 'UNCLASSIFIED',
      instrumentType: 'EQUITY',
      quoteType: 'ETF',
      needsSecondaryClassification: false,
      isActive: true,
      marketCap: 107602812928,
      createdAt: '2026-03-23T12:24:14.818Z',
      updatedAt: '2026-03-23T16:34:02.867Z',
      averageDailyVolume10Day: 16460,
      averageDailyVolume3Month: 19628,
      totalAssets: 38018520,
      sector: 'ETF',
      industry: 'Miscellaneous Sector',
    },

    'adccb9ee-31f8-5ec3-a20a-88b20f75abda': {
      id: 'adccb9ee-31f8-5ec3-a20a-88b20f75abda',
      name: 'Pacer MSCI World Industry Advan',
      symbol: 'BGLD',
      assetClass: 'UNCLASSIFIED',
      instrumentType: 'EQUITY',
      quoteType: 'ETF',
      needsSecondaryClassification: false,
      marketCap: 107602812928,
      isActive: true,
      createdAt: '2026-03-23T13:25:30.491Z',
      updatedAt: '2026-03-23T16:47:59.579Z',
      averageDailyVolume10Day: 110,
      averageDailyVolume3Month: 225,
      totalAssets: 1495058,
      sector: 'ETF',
      industry: 'Global Large-Stock Blend',
    },
    'd3c5c150-adea-5cee-bcb9-03ae798dc43f': {
      id: 'd3c5c150-adea-5cee-bcb9-03ae798dc43f',
      name: 'SPDR Gold Shares',
      symbol: 'GLD',
      assetClass: 'UNCLASSIFIED',
      instrumentType: 'EQUITY',
      quoteType: 'ETF',
      needsSecondaryClassification: false,
      marketCap: 107602812928,
      isActive: true,
      createdAt: '2026-03-23T13:25:31.357Z',
      updatedAt: '2026-03-23T16:47:59.602Z',
      averageDailyVolume10Day: 14189470,
      averageDailyVolume3Month: 18743096,
      totalAssets: 184864325632,
      sector: 'ETF',
      industry: 'Commodities Focused',
    },
  },
})

type Test1Models = Readonly<{
  id: string
  name: string
}>

type SymbolModels = Readonly<{
  id: string
  name: string
  symbol: string
  marketCap: number
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
    SymbolModels: orm.Model<SymbolModels>({
      pluralName: 'SymbolModels',
      namespace: 'functional-models-orm-memory',
      properties: {
        id: PrimaryKeyUuidProperty(),
        name: TextProperty(),
        symbol: TextProperty(),
        marketCap: NumberProperty(),
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
    describe('#getRecords()', () => {
      it('should return the database', () => {
        const instance = create()
        const actual = instance.getRecords()
        assert.isOk(actual)
      })
    })
    describe('#bulkInsert()', () => {
      it('should bulk insert the instances', async () => {
        const { datastoreAdapter, models } = setup()
        await datastoreAdapter.bulkInsert(models.Test1Models, [
          models.Test1Models.create<'id'>({ name: 'my-name' }),
        ])
      })
    })
    describe('#bulkDelete()', () => {
      it('should bulk delete the instances', async () => {
        const { datastoreAdapter, models } = setup()
        await datastoreAdapter.bulkDelete(models.Test1Models, [
          '032c282c-b367-4d15-b19a-01c855b38f44',
        ])
      })
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
      it('it should find 1 GLD when searching for GLD and market cap', async () => {
        const query = queryBuilder()
          .property('marketCap', 10000000000, {
            equalitySymbol: EqualitySymbol.gte,
            type: DatastoreValueType.number,
          })
          .and()
          .property('symbol', 'GLD')
          .compile()
        const { datastoreAdapter, models } = setup(getSymbolSeedData())
        const actual = await datastoreAdapter.search(models.SymbolModels, query)
        assert.equal(actual.instances.length, 1)
      })
      it('should return two objects when using SeedData1 and take is 2', async () => {
        const { datastoreAdapter, models } = setup(getSeedData1())
        const actual = await datastoreAdapter.search(
          models.Test1Models,
          queryBuilder().take(2).compile()
        )
        const expected = 2
        assert.equal(actual.instances.length, expected)
      })
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
