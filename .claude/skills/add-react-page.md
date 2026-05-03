---
name: add-react-page
description: >
  Use this skill when adding a new React page that fetches data from the
  Express backend. Covers the api.js service function, the page component,
  and state management pattern used in this project.
---

# Skill: Add React Page

Produces a complete React page — service function, page component with loading and error states — following this project's conventions.

## Before You Start

Run the `frontend-scout` subagent to check if a similar page already exists.
Run the `api-mapper` subagent to confirm the backend route you will call is registered and what it returns.

---

## Step 1 — Add the Service Function

File: `client/src/services/api.js`

Add a new function for each endpoint this page needs:

```js
export const getToolsWithWaste = async (companyId) => {
  const res = await fetch(`/api/tools/${companyId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch tools');
  return res.json();
};
```

Rules:
- All fetch calls live here — never inside a component file
- Always attach the JWT from localStorage in the Authorization header
- Throw on non-ok responses so the page component can catch them

---

## Step 2 — Create the Page Component

File: `client/src/pages/[PageName].jsx`

```jsx
import { useEffect, useState } from 'react';
import { getToolsWithWaste } from '../services/api';

export default function ToolsPage() {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    getToolsWithWaste(1)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error)   return <p>Error: {error}</p>;

  return (
    <div>
      {data.map((tool) => (
        <div key={tool.id}>
          <h2>{tool.tool_name}</h2>
          <p>Unused seats: {tool.unused_seats}</p>
          <p>Monthly waste: ₹{tool.monthly_waste}</p>
        </div>
      ))}
    </div>
  );
}
```

Rules:
- Always show a loading state — never render with empty data silently
- Always show an error state — never swallow fetch errors
- Import data functions from `../services/api` — never fetch in the component
- Use `key` on every mapped element

---

## Step 3 — Register in the Router

In `client/src/main.jsx` or wherever your React Router is configured:

```jsx
import ToolsPage from './pages/ToolsPage';

// Inside your routes:
<Route path="/tools" element={<ToolsPage />} />
```

---

## Final Checklist

- [ ] Service function added to `client/src/services/api.js` — not inside the component
- [ ] JWT token attached in Authorization header in the service function
- [ ] Page has loading state rendered while fetch is in progress
- [ ] Page has error state rendered if fetch fails
- [ ] No direct fetch or axios calls inside the component file
- [ ] Component uses default export
- [ ] Route registered in the router config
