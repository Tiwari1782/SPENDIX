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
    "role": "it_admin"
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

---

### GET /api/auth/me

Response 200:
```json
{
  "id": 1,
  "name": "Arjun Kumar",
  "email": "admin@spendix.demo",
  "role": "it_admin",
  "department": null
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
  "offboarding_risk_count": 3,
  "pending_workflow_tasks": 7,
  "contracts_expiring_soon": 2
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
    "billing_model": "per_seat",
    "renewal_date": "2025-06-30",
    "auto_renewal": true,
    "active_users": 18,
    "unused_seats": 12,
    "monthly_waste": 50400,
    "usage_percent": 60,
    "status": "high_waste",
    "owner_user_id": 1,
    "has_contract": true
  }
]
```

Status values: `"healthy"` (usage >= 80%), `"moderate"` (50–79%), `"high_waste"` (below 50%)

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
  "vendor_contact_email": "sales@figma.com",
  "owner_user_id": 1
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

### PUT /api/tools/:toolId

Request: any subset of tool fields to update
```json
{
  "seats_purchased": 25,
  "auto_renewal": false
}
```

Response 200:
```json
{
  "success": true,
  "message": "Tool updated"
}
```

---

### DELETE /api/tools/:toolId

Response 200:
```json
{
  "success": true,
  "message": "Tool removed"
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
    "urgency": "urgent",
    "has_contract": true,
    "notice_period_days": 30
  }
]
```

Urgency values: `"urgent"` (0–30 days), `"upcoming"` (31–60 days), `"planned"` (61–90 days)

---

### POST /api/renewals/trigger-alerts

Request: no body

Response 200:
```json
{
  "success": true,
  "alerts_sent": 2,
  "message": "Renewal alerts dispatched"
}
```

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
    "total_monthly_risk": 5050,
    "workflow_status": "in_progress"
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
    "job_title": "Backend Engineer",
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
  "department": "Design",
  "job_title": "Product Designer",
  "manager_email": "lead@demo.com"
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
  "active_licenses_flagged": 3,
  "workflow_instance_id": 14
}
```

Note: deactivating an employee automatically triggers an offboarding workflow instance.

---

## Spend Forecasting

### GET /api/forecast/:companyId

Response 200:
```json
[
  {
    "tool_id": 1,
    "tool_name": "Salesforce",
    "billing_model": "per_seat",
    "forecasts": [
      {
        "forecast_month": "2025-07-01",
        "projected_spend": 126000,
        "confidence_level": "high",
        "forecast_basis": "Spend has been stable for 5 months with no seat changes."
      },
      {
        "forecast_month": "2025-08-01",
        "projected_spend": 126000,
        "confidence_level": "high",
        "forecast_basis": "Stable trend continues. No renewal flag."
      },
      {
        "forecast_month": "2025-09-01",
        "projected_spend": 130200,
        "confidence_level": "medium",
        "forecast_basis": "Contract renews in Q3. Historical 3% price escalation applied."
      }
    ]
  }
]
```

---

### GET /api/forecast/:toolId/history

Response 200:
```json
[
  {
    "snapshot_month": "2025-01-01",
    "actual_spend": 126000,
    "seats_used": 18,
    "consumption_units": null,
    "consumption_unit_label": null
  },
  {
    "snapshot_month": "2025-02-01",
    "actual_spend": 126000,
    "seats_used": 17,
    "consumption_units": null,
    "consumption_unit_label": null
  }
]
```

---

### POST /api/forecast/:companyId/generate

Request: no body

Response 200:
```json
{
  "success": true,
  "tools_forecasted": 8,
  "tools_skipped": 1,
  "skipped_reason": "Insufficient history (< 3 months)",
  "message": "Forecasts generated for next 3 months"
}
```

---

### POST /api/forecast/snapshot

Request:
```json
{
  "tool_id": 1,
  "company_id": 1,
  "snapshot_month": "2025-06-01",
  "actual_spend": 126000,
  "seats_used": 18,
  "consumption_units": null,
  "consumption_unit_label": null
}
```

Response 201:
```json
{
  "success": true,
  "id": 24,
  "message": "Snapshot recorded"
}
```

---

## Workflows

### GET /api/workflows/:companyId

Response 200:
```json
[
  {
    "id": 3,
    "employee_name": "Rohit Verma",
    "employee_email": "rohit@demo.com",
    "department": "Sales",
    "trigger_type": "offboarding",
    "status": "in_progress",
    "triggered_by": "Arjun Kumar",
    "created_at": "2025-05-01T09:00:00Z",
    "completed_at": null,
    "total_tasks": 5,
    "completed_tasks": 2,
    "overdue_tasks": 1
  }
]
```

---

### GET /api/workflows/:instanceId/tasks

Response 200:
```json
[
  {
    "id": 11,
    "tool_name": "Salesforce",
    "task_description": "Revoke Salesforce CRM access for rohit@demo.com",
    "action_type": "revoke_access",
    "assigned_to_email": "it@demo.com",
    "status": "completed",
    "due_date": "2025-05-08",
    "completed_at": "2025-05-06T14:30:00Z"
  },
  {
    "id": 12,
    "tool_name": "GitHub",
    "task_description": "Remove rohit@demo.com from all GitHub repositories and teams",
    "action_type": "revoke_access",
    "assigned_to_email": "it@demo.com",
    "status": "pending",
    "due_date": "2025-05-08",
    "completed_at": null
  }
]
```

---

### POST /api/workflows/trigger

Request:
```json
{
  "employee_id": 14,
  "company_id": 1,
  "trigger_type": "offboarding",
  "triggered_by": 1
}
```

Response 201:
```json
{
  "success": true,
  "workflow_instance_id": 5,
  "tasks_created": 6,
  "message": "Offboarding workflow started for Rohit Verma"
}
```

---

### PUT /api/workflows/tasks/:taskId

Request:
```json
{
  "status": "completed"
}
```

Response 200:
```json
{
  "success": true,
  "message": "Task marked as completed"
}
```

Status values: `"completed"`, `"skipped"`

---

### GET /api/workflows/templates/:companyId

Response 200:
```json
[
  {
    "id": 1,
    "template_name": "Sales Team Offboarding",
    "trigger_type": "offboarding",
    "department": "Sales",
    "tool_count": 5,
    "created_at": "2025-04-01T00:00:00Z"
  }
]
```

---

### POST /api/workflows/templates

Request:
```json
{
  "company_id": 1,
  "template_name": "Engineering Offboarding",
  "trigger_type": "offboarding",
  "department": "Engineering",
  "tool_ids": [1, 3, 5, 7]
}
```

Response 201:
```json
{
  "success": true,
  "id": 3,
  "message": "Template created"
}
```

---

## Contract Intelligence

### GET /api/contracts/:companyId

Response 200:
```json
[
  {
    "id": 1,
    "tool_name": "Salesforce",
    "tool_id": 1,
    "file_name": "salesforce-contract-2024.pdf",
    "parse_status": "parsed",
    "parsed_auto_renewal": true,
    "parsed_notice_period_days": 30,
    "parsed_price_escalation_percent": 7.5,
    "uploaded_at": "2025-04-15T10:00:00Z",
    "uploaded_by_name": "Arjun Kumar"
  }
]
```

---

### GET /api/contracts/:contractId

Response 200:
```json
{
  "id": 1,
  "tool_id": 1,
  "tool_name": "Salesforce",
  "file_name": "salesforce-contract-2024.pdf",
  "parsed_auto_renewal": true,
  "parsed_notice_period_days": 30,
  "parsed_price_escalation_percent": 7.5,
  "parsed_penalty_clause": "Early termination incurs 50% of remaining contract value.",
  "parsed_support_sla": "Business hours support. 24-hour response time.",
  "parsed_termination_clause": "Either party may terminate with 30 days written notice.",
  "groq_summary": "This is a 12-month per-seat contract with auto-renewal. It escalates 7.5% annually. Cancellation requires 30 days notice before the renewal date or you are committed to another year. Early exit penalty is 50% of remaining value.",
  "parse_status": "parsed",
  "uploaded_at": "2025-04-15T10:00:00Z"
}
```

---

### POST /api/contracts/upload

Request: `multipart/form-data`
```
file: <pdf binary>
tool_id: 1
company_id: 1
uploaded_by: 1
```

Response 201:
```json
{
  "success": true,
  "contract_id": 3,
  "parse_status": "parsed",
  "message": "Contract uploaded and parsed successfully"
}
```

Response 422 (parse failed):
```json
{
  "error": true,
  "contract_id": 3,
  "parse_status": "failed",
  "message": "Contract uploaded but could not be parsed. The PDF may be scanned or image-based."
}
```

---

### DELETE /api/contracts/:contractId

Response 200:
```json
{
  "success": true,
  "message": "Contract removed"
}
```

---

## Benchmarks

### GET /api/benchmarks/:companyId

Response 200:
```json
[
  {
    "category": "Communication",
    "your_monthly_spend_per_employee": 420,
    "peer_avg_monthly_spend_per_employee": 280,
    "peer_median_monthly_spend_per_employee": 260,
    "peer_p75_monthly_spend_per_employee": 340,
    "peer_avg_utilization_percent": 74,
    "your_utilization_percent": 61,
    "position": "above_p75",
    "insight": "You are spending 50% more per employee on communication tools than the median company your size in your industry. Consider consolidating to one platform.",
    "sample_size": 23
  }
]
```

Position values: `"below_median"`, `"median"`, `"above_median"`, `"above_p75"`

---

### GET /api/benchmarks/categories

Response 200:
```json
[
  "Communication",
  "Video Conferencing",
  "Project Management",
  "Cloud Storage",
  "Design",
  "HR",
  "CRM",
  "Development",
  "Security",
  "Analytics"
]
```

---

## Role-Based Access (Platform Users)

### GET /api/users/:companyId

Response 200:
```json
[
  {
    "id": 1,
    "name": "Arjun Kumar",
    "email": "arjun@demo.com",
    "role": "it_admin",
    "department": null,
    "last_login": "2025-06-07T08:00:00Z"
  },
  {
    "id": 2,
    "name": "Meera Joshi",
    "email": "meera@demo.com",
    "role": "finance_viewer",
    "department": null,
    "last_login": "2025-06-05T11:00:00Z"
  }
]
```

---

### POST /api/users

Request:
```json
{
  "company_id": 1,
  "name": "Karan Mehta",
  "email": "karan@demo.com",
  "role": "dept_head",
  "department": "Engineering",
  "password": "TempPass@123"
}
```

Response 201:
```json
{
  "success": true,
  "id": 4,
  "message": "User invited. They can log in with the provided credentials."
}
```

---

### PUT /api/users/:userId/role

Request:
```json
{
  "role": "it_admin",
  "department": null
}
```

Response 200:
```json
{
  "success": true,
  "message": "Role updated"
}
```

---

### DELETE /api/users/:userId

Response 200:
```json
{
  "success": true,
  "message": "User access removed"
}
```

---

## Integrations

### GET /api/integrations/:companyId

Response 200:
```json
[
  {
    "id": 1,
    "integration_type": "google_workspace",
    "status": "connected",
    "last_synced_at": "2025-06-07T06:00:00Z",
    "sync_error_message": null
  },
  {
    "id": 2,
    "integration_type": "slack",
    "status": "disconnected",
    "last_synced_at": null,
    "sync_error_message": null
  }
]
```

---

### POST /api/integrations/connect

Request:
```json
{
  "company_id": 1,
  "integration_type": "google_workspace",
  "credentials": {
    "access_token": "ya29...",
    "refresh_token": "1//...",
    "scope": "https://www.googleapis.com/auth/admin.reports.audit.readonly"
  }
}
```

Response 200:
```json
{
  "success": true,
  "integration_id": 1,
  "message": "Google Workspace connected"
}
```

---

### POST /api/integrations/:integrationId/sync

Request: no body

Response 200:
```json
{
  "success": true,
  "sync_type": "usage_pull",
  "records_synced": 342,
  "message": "Sync complete. 342 usage log records updated."
}
```

Response 500 (sync failed):
```json
{
  "error": true,
  "message": "Sync failed. Token may have expired. Please reconnect the integration.",
  "code": 500
}
```

---

### GET /api/integrations/:integrationId/logs

Response 200:
```json
[
  {
    "id": 12,
    "sync_type": "usage_pull",
    "records_synced": 342,
    "status": "success",
    "error_details": null,
    "synced_at": "2025-06-07T06:00:00Z"
  },
  {
    "id": 11,
    "sync_type": "usage_pull",
    "records_synced": 0,
    "status": "failed",
    "error_details": "Token expired. Reconnect required.",
    "synced_at": "2025-06-06T06:00:00Z"
  }
]
```

---

### DELETE /api/integrations/:integrationId

Response 200:
```json
{
  "success": true,
  "message": "Integration disconnected and credentials removed"
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
- 403 — authenticated but not authorized (RBAC)
- 404 — resource not found
- 422 — unprocessable (AI parse failed, validation failed)
- 500 — server error
