import { isAfter } from 'date-fns/isAfter'
import { isBefore } from 'date-fns/isBefore'
import {
  DataDescription,
  DatastoreValueType,
  DatesAfterQuery,
  DatesBeforeQuery,
  EqualitySymbol,
  isALinkToken,
  isPropertyBasedQuery,
  OrmSearch,
  PropertyQuery,
  Query,
  QueryTokens,
  threeitize,
  validateOrmSearch,
} from 'functional-models'
import { isEqual } from 'lodash'

const _emptyValueWrapper =
  (func: (property: PropertyQuery) => (obj: object) => boolean) =>
  (property: PropertyQuery) => {
    const isEmptyCheck = property.value === undefined || property.value === null
    const subfunc = func(property)
    return (obj: object) => {
      // @ts-ignore
      const value = obj[property.key]
      const valueIsEmpty = value === undefined || value === null
      // Are we looking for empty and its empty?
      if (isEmptyCheck && valueIsEmpty) {
        return true
      }
      // Are we checking for a value but its empty?
      if (!isEmptyCheck && valueIsEmpty) {
        return false
      }
      // Both have values, time to compare.
      return subfunc(obj)
    }
  }

const _stringCompare = _emptyValueWrapper((property: PropertyQuery) => {
  const rePrefix = property.options.startsWith ? '^' : ''
  const reSuffix = property.options.endsWith ? '$' : ''
  const flags = property.options.caseSensitive ? '' : 'i'
  const re = new RegExp(`${rePrefix}${property.value}${reSuffix}`, flags)
  return (obj: object) => {
    // @ts-ignore
    const value = obj[property.key]
    return re.test(value)
  }
})

const _checks = {
  [EqualitySymbol.eq]: (searchValue: number, dataValue: number) =>
    searchValue === dataValue,
  [EqualitySymbol.gt]: (searchValue: number, dataValue: number) =>
    searchValue < dataValue,
  [EqualitySymbol.gte]: (searchValue: number, dataValue: number) =>
    searchValue <= dataValue,
  [EqualitySymbol.lt]: (searchValue: number, dataValue: number) =>
    searchValue > dataValue,
  [EqualitySymbol.lte]: (searchValue: number, dataValue: number) =>
    searchValue >= dataValue,
}

const _numberCompare = _emptyValueWrapper((property: PropertyQuery) => {
  return (obj: object) => {
    // @ts-ignore
    const value = obj[property.key]
    return _checks[property.equalitySymbol](property.value, value)
  }
})

const _booleanCompare = _emptyValueWrapper((property: PropertyQuery) => {
  return (obj: object) => {
    // @ts-ignore
    const value = obj[property.key]
    return property.value === value
  }
})

const _objectCompare = _emptyValueWrapper((property: PropertyQuery) => {
  const asObj =
    typeof property.value === 'object'
      ? property.value
      : JSON.parse(property.value)
  return (obj: object) => {
    // @ts-ignore
    const value = obj[property.key]
    return isEqual(asObj, value)
  }
})

const _typeToCompare: Record<
  DatastoreValueType,
  (property: PropertyQuery) => (obj: object) => boolean
> = {
  [DatastoreValueType.number]: _numberCompare,
  [DatastoreValueType.string]: _stringCompare,
  [DatastoreValueType.date]: _stringCompare,
  [DatastoreValueType.boolean]: _booleanCompare,
  [DatastoreValueType.object]: _objectCompare,
}

const _datesBeforeCheck = (o: DatesBeforeQuery) => (obj: object) => {
  // @ts-ignore
  const value = obj[o.key]
  const dateA = new Date(o.date)
  const dateB = new Date(value)
  const before = isBefore(dateB, dateA)
  return o.options.equalToAndBefore ? before || isEqual(dateA, dateB) : before
}

const _datesAfterCheck = (o: DatesAfterQuery) => (obj: object) => {
  // @ts-ignore
  const value = obj[o.key]
  const dateA = new Date(o.date)
  const dateB = new Date(value)
  const after = isAfter(dateB, dateA)
  return o.options.equalToAndAfter ? after || isEqual(dateA, dateB) : after
}

const _compareProperty = (property: Query) => {
  if (property.type === 'property') {
    return _typeToCompare[property.valueType](property)
  }
  if (property.type === 'datesBefore') {
    return _datesBeforeCheck(property)
  }
  /* istanbul ignore next */
  if (property.type === 'datesAfter') {
    return _datesAfterCheck(property)
  }
  /* istanbul ignore next */
  throw new Error('Impossible property situation')
}

const _andCheck = (a: any, b: any) => (obj: object) => {
  const r1 = a(obj)
  const r2 = b(obj)
  if (!r1) {
    return false
  }
  return r2
}
const _orCheck = (a: any, b: any) => (obj: object) => {
  const r1 = a(obj)
  const r2 = b(obj)
  return r1 || r2
}
const _allCheck = (listOfChecks: any[]) => (obj: object) => {
  return listOfChecks.every(x => {
    return x(obj)
  })
}

const _buildChecks = (o: QueryTokens): ((obj: object) => boolean) => {
  if (isPropertyBasedQuery(o)) {
    return _compareProperty(o)
  }
  /* istanbul ignore next */
  if (Array.isArray(o)) {
    // Is this just queries?
    if (o.every(x => !isALinkToken(x))) {
      return _allCheck(o.map(_buildChecks))
    }

    const threes = threeitize(o)
    const checks = threes.reduce((acc, [a, link, b]) => {
      const check1 = _buildChecks(a)
      const check2 = _buildChecks(b)
      const checkFunc = link.toLowerCase() === 'and' ? _andCheck : _orCheck
      const combinedCheck = checkFunc(check1, check2)
      return [...acc, combinedCheck]
    }, [])
    return _allCheck(checks)
  }
  /* istanbul ignore next */
  throw new Error('Should never happen')
}

const filterResults = <T extends DataDescription>(
  searchQuery: OrmSearch,
  databaseEntries: T[]
) => {
  validateOrmSearch(searchQuery)
  const func = _buildChecks(searchQuery.query)
  return databaseEntries.filter(func)
}

export { filterResults }
