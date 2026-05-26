-- Spendix Advanced Module Seed Data
-- Run AFTER seed.sql: mysql -u root -p spendix < server/db/seed_advanced.sql
USE spendix;

-- ============================================================
-- Spend Snapshots — 6 months of history for all 8 tools
-- ============================================================
INSERT INTO spend_snapshots (tool_id, company_id, snapshot_month, actual_spend, seats_used) VALUES
-- Salesforce (tool 1)
(1, 1, '2025-12-01', 122000.00, 28),
(1, 1, '2026-01-01', 124000.00, 29),
(1, 1, '2026-02-01', 126000.00, 30),
(1, 1, '2026-03-01', 126000.00, 30),
(1, 1, '2026-04-01', 126000.00, 30),
(1, 1, '2026-05-01', 126000.00, 30),
-- Zoom (tool 2)
(2, 1, '2025-12-01', 63000.00, 45),
(2, 1, '2026-01-01', 65800.00, 47),
(2, 1, '2026-02-01', 67200.00, 48),
(2, 1, '2026-03-01', 70000.00, 50),
(2, 1, '2026-04-01', 70000.00, 50),
(2, 1, '2026-05-01', 70000.00, 50),
-- Slack (tool 3)
(3, 1, '2025-12-01', 44200.00, 52),
(3, 1, '2026-01-01', 46750.00, 55),
(3, 1, '2026-02-01', 48450.00, 57),
(3, 1, '2026-03-01', 49300.00, 58),
(3, 1, '2026-04-01', 51000.00, 60),
(3, 1, '2026-05-01', 51000.00, 60),
-- GitHub (tool 4)
(4, 1, '2025-12-01', 33000.00, 22),
(4, 1, '2026-01-01', 34500.00, 23),
(4, 1, '2026-02-01', 36000.00, 24),
(4, 1, '2026-03-01', 37500.00, 25),
(4, 1, '2026-04-01', 37500.00, 25),
(4, 1, '2026-05-01', 37500.00, 25),
-- Notion (tool 5)
(5, 1, '2025-12-01', 22400.00, 32),
(5, 1, '2026-01-01', 24500.00, 35),
(5, 1, '2026-02-01', 25900.00, 37),
(5, 1, '2026-03-01', 27300.00, 39),
(5, 1, '2026-04-01', 28000.00, 40),
(5, 1, '2026-05-01', 28000.00, 40),
-- Google Workspace (tool 6)
(6, 1, '2025-12-01', 39750.00, 53),
(6, 1, '2026-01-01', 41250.00, 55),
(6, 1, '2026-02-01', 42750.00, 57),
(6, 1, '2026-03-01', 43500.00, 58),
(6, 1, '2026-04-01', 45000.00, 60),
(6, 1, '2026-05-01', 45000.00, 60),
-- Jira (tool 7)
(7, 1, '2025-12-01', 30000.00, 25),
(7, 1, '2026-01-01', 32400.00, 27),
(7, 1, '2026-02-01', 33600.00, 28),
(7, 1, '2026-03-01', 34800.00, 29),
(7, 1, '2026-04-01', 36000.00, 30),
(7, 1, '2026-05-01', 36000.00, 30),
-- Asana (tool 8)
(8, 1, '2025-12-01', 14400.00, 16),
(8, 1, '2026-01-01', 15300.00, 17),
(8, 1, '2026-02-01', 16200.00, 18),
(8, 1, '2026-03-01', 17100.00, 19),
(8, 1, '2026-04-01', 18000.00, 20),
(8, 1, '2026-05-01', 18000.00, 20);
-- ============================================================
-- Workflow Templates — 2 templates
-- ============================================================
INSERT INTO workflow_templates (company_id, template_name, trigger_type, department, tool_ids) VALUES
(1, 'Engineering Onboarding', 'onboarding', 'Engineering', '[3, 4, 5, 7]'),
(1, 'Standard Offboarding', 'offboarding', NULL, '[1, 2, 3, 4, 5, 6, 7, 8]');

-- ============================================================
-- Workflow Instances — 2 active instances
-- ============================================================
INSERT INTO workflow_instances (template_id, company_id, employee_id, trigger_type, status, triggered_by) VALUES
(2, 1, 49, 'offboarding', 'in_progress', 1),
(2, 1, 55, 'offboarding', 'pending', 1);

-- Workflow Tasks for instance 1 (Rohit Verma offboarding)
INSERT INTO workflow_tasks (workflow_instance_id, tool_id, task_description, action_type, assigned_to_email, status, due_date) VALUES
(1, 1, 'Revoke Salesforce access for Rohit Verma', 'revoke_access', 'admin@spendix.demo', 'completed', '2026-02-22'),
(1, 2, 'Revoke Zoom Business access for Rohit Verma', 'revoke_access', 'admin@spendix.demo', 'completed', '2026-02-22'),
(1, 3, 'Revoke Slack Pro access for Rohit Verma', 'revoke_access', 'admin@spendix.demo', 'completed', '2026-02-22'),
(1, 5, 'Transfer Notion workspace data from Rohit Verma', 'transfer_data', 'admin@spendix.demo', 'pending', '2026-02-22'),
(1, 6, 'Revoke Google Workspace access for Rohit Verma', 'revoke_access', 'admin@spendix.demo', 'pending', '2026-02-22'),
(1, NULL, 'Notify IT security of account deactivation', 'other', 'security@demo.com', 'pending', '2026-02-22'),
(1, NULL, 'Collect hardware and revoke VPN', 'other', 'admin@spendix.demo', 'pending', '2026-02-22');

-- Workflow Tasks for instance 2 (Shalini Prasad offboarding)
INSERT INTO workflow_tasks (workflow_instance_id, tool_id, task_description, action_type, assigned_to_email, status, due_date) VALUES
(2, 3, 'Revoke Slack Pro access for Shalini Prasad', 'revoke_access', 'admin@spendix.demo', 'pending', '2026-01-17'),
(2, 6, 'Revoke Google Workspace access for Shalini Prasad', 'revoke_access', 'admin@spendix.demo', 'pending', '2026-01-17'),
(2, NULL, 'Notify HR of offboarding completion', 'other', 'chro@demo.com', 'pending', '2026-01-17');

-- ============================================================
-- Contracts — 1 parsed contract
-- ============================================================
INSERT INTO contracts (tool_id, company_id, file_name, file_path, raw_text, parsed_auto_renewal, parsed_notice_period_days, parsed_price_escalation_percent, parsed_penalty_clause, parsed_support_sla, parsed_termination_clause, groq_summary, parse_status, uploaded_by) VALUES
(1, 1, 'Salesforce_Enterprise_Agreement_2025.pdf', '/uploads/contracts/salesforce-contract.pdf',
'Salesforce Enterprise Agreement effective January 1, 2025. Auto-renewal clause: This agreement shall automatically renew for successive 12-month periods unless either party provides written notice of non-renewal at least 60 days prior to the end of the then-current term. Price escalation: Fees may increase by up to 8% upon each renewal. Early termination: A penalty of 50% of remaining contract value applies. Support: Salesforce will provide Premier Support with 4-hour response time for Severity 1 issues.',
TRUE, 60, 8.00,
'50% of remaining contract value applies for early termination',
'Premier Support with 4-hour response for Severity 1 issues',
'Either party may terminate with 60 days written notice. Early termination penalty of 50% of remaining value.',
'This Salesforce Enterprise Agreement auto-renews annually with 60 days notice required to cancel. Be aware of the 8% annual price escalation clause and the significant 50% early termination penalty. Premier Support with 4-hour SLA is included.',
'parsed', 1);

-- ============================================================
-- Benchmark Data — 3 categories
-- ============================================================
INSERT INTO benchmark_data (category, industry, employee_range, avg_monthly_spend_per_employee, median_monthly_spend_per_employee, p75_monthly_spend_per_employee, avg_seats_utilization_percent, sample_size) VALUES
('communication', 'Technology', '100-250', 1800.00, 1500.00, 2200.00, 72.00, 12),
('project_management', 'Technology', '100-250', 1400.00, 1200.00, 1800.00, 68.00, 8),
('CRM', 'Technology', '100-250', 2800.00, 2400.00, 3200.00, 65.00, 6),
('video_conferencing', 'Technology', '100-250', 1200.00, 1000.00, 1600.00, 70.00, 10),
('development', 'Technology', '100-250', 900.00, 750.00, 1100.00, 78.00, 15),
('design', 'Technology', '100-250', 600.00, 500.00, 800.00, 60.00, 3);

-- ============================================================
-- Integrations — 5 integration records
-- ============================================================
INSERT INTO integrations (company_id, integration_type, status, last_synced_at) VALUES
(1, 'google_workspace', 'connected', '2026-05-10 14:30:00'),
(1, 'zoho_books', 'disconnected', NULL),
(1, 'razorpay', 'disconnected', NULL),
(1, 'slack', 'connected', '2026-05-09 09:00:00'),
(1, 'jira', 'error', '2026-05-08 11:15:00');

-- Sync logs for Google Workspace
INSERT INTO integration_sync_logs (integration_id, sync_type, records_synced, status) VALUES
(1, 'usage_pull', 48, 'success'),
(1, 'employee_sync', 60, 'success');

-- Sync log for Slack
INSERT INTO integration_sync_logs (integration_id, sync_type, records_synced, status) VALUES
(4, 'usage_pull', 39, 'success');

-- Error log for Jira
INSERT INTO integration_sync_logs (integration_id, sync_type, records_synced, status, error_details) VALUES
(5, 'usage_pull', 0, 'failed', 'API token expired. Please reconnect with a valid token.');
