import {
  DataDescription,
  DatastoreAdapter,
  DatastoreSearchResult,
  Maybe,
  ModelInstance,
  ModelType,
  OrmModel,
  OrmSearch,
  PrimaryKeyType,
  ToObjectResult,
} from 'functional-models'
import clone from 'lodash/clone'
import merge from 'lodash/merge'
import { defaultCollectionName, filterResults } from './lib'

type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }

type Props = {
  seedData?: Record<string, Record<string | number, any>>
  getCollectionNameForModel?: <T extends DataDescription>(
    model: ModelType<T>
  ) => string
}

const create = ({
  seedData,
  getCollectionNameForModel = defaultCollectionName,
}: Props = {}): WithRequired<DatastoreAdapter, 'count'> => {
  const database: Record<string, Record<string | number, any>> = clone(
    seedData
  ) || {}

  const _getRecords = <TData extends DataDescription>(
    model: ModelType<TData>
  ) => {
    const name = getCollectionNameForModel(model)
    if (!(name in database)) {
      // eslint-disable-next-line functional/immutable-data
      database[name] = {}
    }
    return database[name] as unknown as Record<string, ToObjectResult<TData>>
  }

  return {
    delete: <TData extends DataDescription>(
      model: OrmModel<TData>,
      id: PrimaryKeyType
    ): Promise<void> => {
      const records = _getRecords(model)
      // eslint-disable-next-line functional/immutable-data
      delete records[id]
      return Promise.resolve(undefined)
    },
    retrieve: <TData extends DataDescription>(
      model: OrmModel<TData>,
      primaryKey: PrimaryKeyType
    ): Promise<Maybe<ToObjectResult<TData>>> => {
      return Promise.resolve().then(() => {
        const records = _getRecords(model)
        return records[primaryKey] as unknown as
          | ToObjectResult<TData>
          | undefined
      })
    },
    save: async <TData extends DataDescription>(
      instance: ModelInstance<TData>
    ): Promise<ToObjectResult<TData>> => {
      return Promise.resolve().then(async () => {
        const model = instance.getModel()
        const data = await instance.toObj<TData>()
        const records = _getRecords(model)
        merge(records, { [await instance.getPrimaryKey()]: data })
        return data
      })
    },
    search: <TData extends DataDescription>(
      model: OrmModel<TData>,
      query: OrmSearch
    ): Promise<DatastoreSearchResult<TData>> => {
      const records = _getRecords(model)
      const instances = filterResults(query, Object.values(records))
      return Promise.resolve({ instances: instances, page: undefined })
    },
    count: <TData extends DataDescription>(model: OrmModel<TData>) => {
      return Promise.resolve().then(() => {
        const records = _getRecords(model)
        return Object.keys(records).length
      })
    },
  }
}

export { create }
