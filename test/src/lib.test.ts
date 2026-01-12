import { assert } from 'chai'
import {
  DatastoreValueType,
  EqualitySymbol,
  queryBuilder,
} from 'functional-models'
import { filterResults } from '../../src'

const TestData1 = [
  {
    id: 'id-1',
    name: 'name-1',
    aNumber: 7,
    aBool: false,
  },
  {
    id: 'id-2',
    name: 'name-2',
    aNumber: 2,
    aBool: false,
  },
  {
    id: 'id-3',
    name: 'name-3',
    aNumber: 8,
    aBool: undefined,
  },
  {
    id: 'id-4',
    name: null,
    aNumber: undefined,
    aBool: true,
  },
  {
    id: 'id-5',
    name: undefined,
    aNumber: 5,
    aBool: undefined,
  },
]

const DatedTestData1 = [
  {
    id: 1,
    datetime: new Date(Date.UTC(2025, 0, 1)),
  },
  {
    id: 2,
    datetime: new Date(Date.UTC(2024, 11, 31)),
  },
  {
    id: 3,
    datetime: new Date(Date.UTC(2025, 0, 2)),
  },
  {
    id: 4,
    datetime: new Date('2025-01-01T00:00:00.001Z'),
  },
  {
    id: 5,
    datetime: new Date('2024-12-31T23:59:59.999Z'),
  },
  {
    id: 6,
    datetime: new Date(Date.UTC(2020, 0, 1)),
  },
  {
    id: 7,
    datetime: new Date(Date.UTC(2027, 0, 1)),
  },
  {
    id: 8,
    datetime: new Date(Date.UTC(2023, 0, 1)),
  },
]

const TestData2 = [
  {
    name: '1',
    anObject: undefined,
  },
  {
    name: '2',
    anObject: { nested: 'value', id: 1 },
  },
  {
    name: '3',
    anObject: { id: 3, nested: 'diff-value' },
  },
]

describe('/src/lib.ts', () => {
  describe('#filterResults()', () => {
    it('should return 1 result with TestData2 when searching an object as a stringifyied json', () => {
      const actual = filterResults(
        queryBuilder()
          .property('anObject', JSON.stringify({ nested: 'value', id: 1 }), {
            type: DatastoreValueType.object,
          })
          .compile(),
        TestData2
      ).length
      const expected = 1
      assert.deepEqual(actual, expected)
    })
    it('should return 1 result with TestData2 when searching an object with properties in the same order', () => {
      const actual = filterResults(
        queryBuilder()
          .property(
            'anObject',
            { nested: 'value', id: 1 },
            { type: DatastoreValueType.object }
          )
          .compile(),
        TestData2
      ).length
      const expected = 1
      assert.deepEqual(actual, expected)
    })
    it('should return 1 result with TestData2 when searching an object with properties in the reverse order', () => {
      const actual = filterResults(
        queryBuilder()
          .property(
            'anObject',
            { id: 1, nested: 'value' },
            { type: DatastoreValueType.object }
          )
          .compile(),
        TestData2
      ).length
      const expected = 1
      assert.deepEqual(actual, expected)
    })
    it('should return 3 results with DatedTestData1 when searching a span of time, AND including the exact time', () => {
      const actual = filterResults(
        queryBuilder()
          .datesAfter('datetime', '2024-12-31T23:59:59.999Z', {
            equalToAndAfter: true,
          })
          .and()
          .datesBefore('datetime', '2025-01-01T00:00:00.001Z', {
            equalToAndBefore: true,
          })
          .compile(),
        DatedTestData1
      ).length
      const expected = 3
      assert.deepEqual(actual, expected)
    })
    it('should return 1 results with DatedTestData1 when searching a span of time, NOT including the exact time', () => {
      const actual = filterResults(
        queryBuilder()
          .datesAfter('datetime', '2024-12-31T23:59:59.999Z', {
            equalToAndAfter: false,
          })
          .and()
          .datesBefore('datetime', '2025-01-01T00:00:00.001Z', {
            equalToAndBefore: false,
          })
          .compile(),
        DatedTestData1
      ).length
      const expected = 1
      assert.deepEqual(actual, expected)
    })
    it('should return 1 results with TestData1 when searching a property with endsWith', () => {
      const actual = filterResults(
        queryBuilder().property('name', '-1', { endsWith: true }).compile(),
        TestData1
      ).length
      const expected = 1
      assert.deepEqual(actual, expected)
    })
    it('should return 2 results with TestData1 when searching a complex property query', () => {
      const actual = filterResults(
        queryBuilder()
          .property('name', '-1', { endsWith: true })
          .or()
          .complex(b =>
            b
              .property('name', 'name', { startsWith: true })
              .and()
              .complex(c =>
                c
                  .property('aNumber', 8, { type: DatastoreValueType.number })
                  .or()
                  .property('aNumber', 7, {
                    type: DatastoreValueType.number,
                  })
              )
          )
          .compile(),
        TestData1
      ).length
      const expected = 2
      assert.deepEqual(actual, expected)
    })
    it('should return 3 results with TestData1 when searching a property with startsWith', () => {
      const actual = filterResults(
        queryBuilder().property('name', 'name', { startsWith: true }).compile(),
        TestData1
      ).length
      const expected = 3
      assert.deepEqual(actual, expected)
    })
    it('should return 2 results with TestData1 when searching two OR properties', () => {
      const actual = filterResults(
        queryBuilder()
          .property('name', 'name-1')
          .or()
          .property('name', 'name-2')
          .compile(),
        TestData1
      ).length
      const expected = 2
      assert.deepEqual(actual, expected)
    })
    it('should return 1 result with TestData1 when searching a simple property', () => {
      const actual = filterResults(
        queryBuilder().property('name', 'name-1').compile(),
        TestData1
      ).length
      const expected = 1
      assert.deepEqual(actual, expected)
    })
    it('should return 0 results with TestData1 when searching a simple property case sensitive=true', () => {
      const actual = filterResults(
        queryBuilder()
          .property('name', 'Name-1', { caseSensitive: true })
          .compile(),
        TestData1
      ).length
      const expected = 0
      assert.deepEqual(actual, expected)
    })
    it('should return 2 results with TestData1 when searching for empty values', () => {
      const actual = filterResults(
        queryBuilder().property('name', undefined).compile(),
        TestData1
      ).length
      const expected = 2
      assert.deepEqual(actual, expected)
    })
    it('should return 2 results with TestData1 when searching <= 5', () => {
      const actual = filterResults(
        queryBuilder()
          .property('aNumber', 5, {
            type: DatastoreValueType.number,
            equalitySymbol: EqualitySymbol.lte,
          })
          .compile(),
        TestData1
      ).length
      const expected = 2
      assert.deepEqual(actual, expected)
    })
    it('should return 4 results with TestData1 when searching != 7', () => {
      const actual = filterResults(
        queryBuilder()
          .property('aNumber', 7, {
            type: DatastoreValueType.number,
            equalitySymbol: EqualitySymbol.ne,
          })
          .compile(),
        TestData1
      )
      const expected = 4
      assert.deepEqual(actual.length, expected)
    })
    it('should return 4 results with TestData1 when searching > 1', () => {
      const actual = filterResults(
        queryBuilder()
          .property('aNumber', 1, {
            type: DatastoreValueType.number,
            equalitySymbol: EqualitySymbol.gt,
          })
          .compile(),
        TestData1
      ).length
      const expected = 4
      assert.deepEqual(actual, expected)
    })
    it('should return 1 result with TestData1 when searching >= 8', () => {
      const actual = filterResults(
        queryBuilder()
          .property('aNumber', 8, {
            type: DatastoreValueType.number,
            equalitySymbol: EqualitySymbol.gte,
          })
          .compile(),
        TestData1
      ).length
      const expected = 1
      assert.deepEqual(actual, expected)
    })
    it('should return 1 result with TestData1 when searching < 8', () => {
      const actual = filterResults(
        queryBuilder()
          .property('aNumber', 8, {
            type: DatastoreValueType.number,
            equalitySymbol: EqualitySymbol.lt,
          })
          .compile(),
        TestData1
      ).length
      const expected = 3
      assert.deepEqual(actual, expected)
    })
    it('should return 1 result with TestData1 when searching true', () => {
      const actual = filterResults(
        queryBuilder()
          .property('aBool', true, {
            type: DatastoreValueType.boolean,
          })
          .compile(),
        TestData1
      ).length
      const expected = 1
      assert.deepEqual(actual, expected)
    })
    it('should return 2 result with TestData1 when searching false', () => {
      const actual = filterResults(
        queryBuilder()
          .property('aBool', false, {
            type: DatastoreValueType.boolean,
          })
          .compile(),
        TestData1
      ).length
      const expected = 2
      assert.deepEqual(actual, expected)
    })
  })
})
