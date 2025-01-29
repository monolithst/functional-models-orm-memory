# Functional Models ORM Memory

![Unit Tests](https://github.com/monolithst/functional-models-orm-memory/actions/workflows/ut.yml/badge.svg?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/monolithst/functional-models-orm-memory/badge.svg?branch=master)](https://coveralls.io/github/monolithst/functional-models-orm-memory?branch=master)

An ORM datastore adapter that is in-memory.

Useful for testing and some caching applications.

# To Install

Run

```bash
npm install functional-models-orm-memory
```

# To Use

```typescript
import { datastoreAdapter as memoryDatastore } from 'functional-models-orm-memory'
import { createOrm } from 'functional-models'

const datastoreAdapter = memoryDatastore.create()
const orm = createOrm({ datastoreAdapter })
```
