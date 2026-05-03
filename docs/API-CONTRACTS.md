# API-CONTRACTS.md

Exact request and response shapes for every endpoint.
Frontend and backend members use this as the contract so neither blocks the other.
If you change a response shape, update this file in the same PR.

Base URL in development: `http://localhost:5000/api`
Auth: JWT stored in httpOnly cookie. Sent automatically by browser on every request.

---

## Auth

### POST /api/auth/login

Request:
```json
{
  "email": "admin@spendix.demo",
  "password": "spendix123"
}
```

Response 200:
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "Arjun Kumar",
    "email": "admin@spendix.demo",
    "role": "admin"
  }
}
```

Response 401:
```json
{
  "error": true,
  "message": "Invalid email or password"
}
```

Cookie set on success: `token=<jwt>; HttpOnly; Path=/; Max-Age=604800`

---

### POST /api/auth/logout

Request: no body

Response 200:
```json
{
  "success": true,
  "message": "Logged out"
}
```

Cookie cleared on success.

---

### GET /api/auth/me

Response 200:
```json
{
  "id": 1,
  "name": "Arjun Kumar",
  "email": "admin@spendix.demo",
  "role": "admin"
}
```

Response 401:
```json
{
  "error": true,
  "message": "Unauthorized"
}
```

---

## Summary

### GET /api/summary/:companyId

Response 200:
```json
{
  "total_monthly_spend": 340000,
  "total_monthly_waste": 112000,
  "annual_savings_potential": 1344000,
  "tools_count": 8,
  "employees_count": 60,
  "inactive_employees_count": 12,
  "shadow_it_count": 3,
  "overlap_groups_count": 2,
  "offboarding_risk_count": 3
}
```

---

## Tools and Licenses

### GET /api/tools/:companyId

Response 200:
```json
[
  {
    "id": 1,
    "tool_name": "Salesforce",
    "category": "CRM",
    "seats_purchased": 30,
    "monthly_cost_per_seat": 4200,
    "renewal_date": "2025-06-30",
    "auto_renewal": true,
    "active_users": 18,
    "unused_seats": 12,
    "monthly_waste": 50400,
    "usage_percent": 60,
    "status": "high_waste"
  }
]
```

Status values: `"healthy"` (usage >= 80%), `"moderate"` (50-79%), `"high_waste"` (below 50%)

---

### GET /api/tools/:toolId/unused

Response 200:
```json
[
  {
    "employee_id": 5,
    "name": "Priya Sharma",
    "email": "priya@demo.com",
    "department": "Marketing",
    "last_login": "2025-01-10",
    "days_inactive": 112,
    "monthly_cost": 4200
  }
]
```

---

### POST /api/tools

Request:
```json
{
  "company_id": 1,
  "tool_name": "Figma",
  "category": "Design",
  "seats_purchased": 10,
  "monthly_cost_per_seat": 1200,
  "billing_model": "per_seat",
  "renewal_date": "2025-12-01",
  "auto_renewal": false,
  "vendor_contact_email": "sales@figma.com"
}
```

Response 201:
```json
{
  "success": true,
  "id": 9,
  "message": "Tool added successfully"
}
```

---

## Shadow IT

### POST /api/shadow-it/parse

Request:
```json
{
  "company_id": 1,
  "invoice_text": "Invoice from Canva Pro. Amount: Rs. 4,999. Seats: 5. Renewal: 01 Aug 2025."
}
```

Response 200:
```json
{
  "invoice_id": 4,
  "parsed": {
    "tool_name": "Canva Pro",
    "amount": 4999,
    "seats": 5,
    "renewal_date": "2025-08-01",
    "billing_model": "flat_rate"
  },
  "status": "pending_review"
}
```

Response 422 (parse failed):
```json
{
  "error": true,
  "message": "Could not extract tool information from this text. Please check the invoice format."
}
```

---

### GET /api/shadow-it/:companyId

Response 200:
```json
[
  {
    "id": 4,
    "parsed_tool_name": "Canva Pro",
    "parsed_amount": 4999,
    "parsed_seats": 5,
    "parsed_renewal_date": "2025-08-01",
    "status": "pending_review",
    "created_at": "2025-05-01T10:23:00Z"
  }
]
```

---

### PUT /api/shadow-it/:invoiceId/add

Request: no body

Response 200:
```json
{
  "success": true,
  "tool_id": 9,
  "message": "Canva Pro added to your SaaS stack"
}
```

---

### PUT /api/shadow-it/:invoiceId/ignore

Request: no body

Response 200:
```json
{
  "success": true,
  "message": "Invoice marked as ignored"
}
```

---

## Renewals

### GET /api/renewals/:companyId

Response 200:
```json
[
  {
    "id": 1,
    "tool_name": "Salesforce",
    "renewal_date": "2025-06-30",
    "days_until_renewal": 23,
    "auto_renewal": true,
    "monthly_cost": 126000,
    "annual_cost": 1512000,
    "urgency": "urgent"
  }
]
```

Urgency values: `"urgent"` (0-30 days), `"upcoming"` (31-60 days), `"planned"` (61-90 days)

---

## Offboarding

### GET /api/offboarding/:companyId

Response 200:
```json
[
  {
    "employee_id": 14,
    "name": "Rohit Verma",
    "email": "rohit@demo.com",
    "department": "Sales",
    "deactivated_at": "2025-02-15",
    "days_since_departure": 75,
    "active_tools": [
      {
        "tool_id": 1,
        "tool_name": "Salesforce",
        "monthly_cost": 4200
      },
      {
        "tool_id": 3,
        "tool_name": "Slack",
        "monthly_cost": 850
      }
    ],
    "total_monthly_risk": 5050
  }
]
```

---

### PUT /api/offboarding/:employeeId/resolve

Request: no body

Response 200:
```json
{
  "success": true,
  "licenses_revoked": 2,
  "monthly_savings": 5050,
  "message": "All licenses revoked for Rohit Verma"
}
```

---

## Overlaps

### GET /api/overlaps/:companyId

Response 200:
```json
[
  {
    "id": 1,
    "category": "Video Conferencing",
    "tools": [
      { "id": 2, "tool_name": "Zoom", "monthly_cost": 70000 },
      { "id": 6, "tool_name": "Google Meet", "monthly_cost": 0 }
    ],
    "combined_monthly_cost": 70000,
    "recommendation": "You are paying Rs. 70,000/month for Zoom while Google Meet is included in your Google Workspace subscription. Consolidating to Google Meet alone would save Rs. 70,000/month."
  }
]
```

---

### POST /api/overlaps/detect

Request:
```json
{
  "company_id": 1
}
```

Response 200:
```json
{
  "success": true,
  "groups_found": 2,
  "message": "Overlap detection complete"
}
```

---

## Employees

### GET /api/employees/:companyId

Response 200:
```json
[
  {
    "id": 1,
    "name": "Arjun Kumar",
    "email": "arjun@demo.com",
    "department": "Engineering",
    "is_active": true,
    "deactivated_at": null
  }
]
```

---

### POST /api/employees

Request:
```json
{
  "company_id": 1,
  "name": "Sneha Patel",
  "email": "sneha@demo.com",
  "department": "Design"
}
```

Response 201:
```json
{
  "success": true,
  "id": 61,
  "message": "Employee added"
}
```

---

### PUT /api/employees/:id/deactivate

Request: no body

Response 200:
```json
{
  "success": true,
  "message": "Sneha Patel marked as departed",
  "active_licenses_flagged": 3
}
```

---

## Standard Error Response

All errors follow this shape:

```json
{
  "error": true,
  "message": "Human readable description of what went wrong",
  "code": 400
}
```

HTTP codes used:
- 200 — success
- 201 — created
- 400 — bad request (missing or invalid input)
- 401 — not authenticated
- 403 — authenticated but not authorized
- 404 — resource not found
- 422 — unprocessable (AI parse failed, validation failed)
- 500 — server error
