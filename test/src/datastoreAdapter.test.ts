import { assert } from 'chai'
import { create } from '../../src/datastoreAdapter'

describe('/src/datastoreAdapter.ts', () => {
  describe('#create()', () => {
    it('should be able to create without any arguments', () => {
      const instance = create()
      assert.isOk(instance)
    })
  })
})
