import { assert } from 'chai'
import * as index from '../../src/index'

describe('/src/index.ts', () => {
  describe('just a test', () => {
    it('should be able to import the index', async () => {
      assert.isOk(index)
    })
  })
})
