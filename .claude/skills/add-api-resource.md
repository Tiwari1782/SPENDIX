---
name: add-api-resource
description: >
  Use this skill when adding a new backend resource that needs a controller,
  an Express route file, and MySQL queries. Covers the full pattern from
  controller logic to route registration in server/index.js.
---

# Skill: Add API Resource

Produces a complete backend resource — controller, route, and registration — following this project's exact conventions.

## Before You Start

Run the `api-mapper` subagent to confirm this route does not already exist.
Run the `db-explorer` subagent to confirm the relevant MySQL table exists and check column names before writing queries.

---

## Step 1 — Create the Controller

File: `server/controllers/[resource]Controller.js`

```js
const db = require('../db/connection');

const getAll = async (req, res) => {
  try {
    const { companyId } = req.params;
    const [rows] = await db.query(
      'SELECT * FROM your_table WHERE company_id = ?',
      [companyId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getOne = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      'SELECT * FROM your_table WHERE id = ?',
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getAll, getOne };
```

Rules:
- Import db from `../db/connection` — never create a new connection
- Always use parameterized queries with `?` — never template literals in SQL
- Always wrap in try/catch and return a 500 on error
- Never return raw MySQL error objects to the client

---

## Step 2 — Create the Route File

File: `server/routes/[resource]Routes.js`

```js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getAll, getOne } = require('../controllers/[resource]Controller');

router.get('/:companyId', authMiddleware, getAll);
router.get('/detail/:id', authMiddleware, getOne);

module.exports = router;
```

Rules:
- Every route must have `authMiddleware` — no exceptions
- Use `router.get/post/put/delete` — not `app.get` directly

---

## Step 3 — Register in server/index.js

Add this line with the other route imports and registrations:

```js
const [resource]Routes = require('./routes/[resource]Routes');
app.use('/api/[resource]', [resource]Routes);
```

---

## Final Checklist

- [ ] Controller imports db from `../db/connection` — not a new connection
- [ ] All SQL uses `?` parameterized placeholders
- [ ] Every route has `authMiddleware` attached
- [ ] Route is registered in `server/index.js`
- [ ] Controller has try/catch on every async function
- [ ] No `console.log` left in the controller
- [ ] No secret values hardcoded anywhere in the file
