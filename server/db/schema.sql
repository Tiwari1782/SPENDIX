-- ============================================================
-- Spendix — Full Database Schema
-- Run: mysql -u root -p < server/db/schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS spendix;
USE spendix;

-- ============================================================
-- Core Tables
-- ============================================================

-- Companies using the platform
CREATE TABLE IF NOT EXISTS companies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255),
  industry VARCHAR(100),
  employee_count_range VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Platform users (IT admins, finance, dept heads)
CREATE TABLE IF NOT EXISTS platform_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('it_admin', 'finance_viewer', 'dept_head', 'read_only') DEFAULT 'read_only',
  department VARCHAR(100),
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- All SaaS tools the company subscribes to
CREATE TABLE IF NOT EXISTS saas_tools (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  tool_name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  seats_purchased INT DEFAULT 0,
  monthly_cost_per_seat DECIMAL(10,2) DEFAULT 0,
  total_monthly_cost DECIMAL(10,2),
  billing_model ENUM('per_seat', 'flat_rate', 'usage_based', 'consumption') DEFAULT 'per_seat',
  renewal_date DATE,
  auto_renewal BOOLEAN DEFAULT FALSE,
  contract_term_months INT,
  vendor_contact_email VARCHAR(255),
   is_shadow_it BOOLEAN DEFAULT FALSE,
  added_by ENUM('manual', 'invoice_parse', 'integration_sync') DEFAULT 'manual',
  owner_user_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id),
  FOREIGN KEY (owner_user_id) REFERENCES platform_users(id)
);

-- Employees / users of the company
CREATE TABLE IF NOT EXISTS employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  department VARCHAR(100),
  job_title VARCHAR(100),
  manager_email VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  deactivated_at DATE,
  FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Login activity per employee per tool
CREATE TABLE IF NOT EXISTS usage_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  tool_id INT NOT NULL,
  last_login DATE,
  login_count_last_30_days INT DEFAULT 0,
  has_license BOOLEAN DEFAULT TRUE,
  data_source ENUM('manual', 'csv_import', 'google_workspace', 'integration') DEFAULT 'manual',
  synced_at TIMESTAMP NULL,
  FOREIGN KEY (employee_id) REFERENCES employees(id),
  FOREIGN KEY (tool_id) REFERENCES saas_tools(id),
  UNIQUE KEY unique_employee_tool (employee_id, tool_id)
);

-- Parsed invoices from the shadow IT inbox
CREATE TABLE IF NOT EXISTS parsed_invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  raw_text TEXT,
  parsed_tool_name VARCHAR(255),
  parsed_amount DECIMAL(10,2),
  parsed_seats INT,
  parsed_renewal_date DATE,
  status ENUM('pending_review', 'added', 'ignored') DEFAULT 'pending_review',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Tool overlap groups detected by AI
CREATE TABLE IF NOT EXISTS overlap_groups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  category VARCHAR(100),
  tool_ids JSON,
  combined_monthly_cost DECIMAL(10,2),
  recommendation TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Renewal alerts sent log
CREATE TABLE IF NOT EXISTS renewal_alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tool_id INT NOT NULL,
  alert_type ENUM('90_day', '60_day', '30_day') NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tool_id) REFERENCES saas_tools(id)
);

-- ============================================================
-- Future Module Tables (schema only, not seeded in MVP)
-- ============================================================

-- Monthly spend snapshots per tool (for forecasting)
CREATE TABLE IF NOT EXISTS spend_snapshots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tool_id INT NOT NULL,
  company_id INT NOT NULL,
  snapshot_month DATE NOT NULL,
  actual_spend DECIMAL(10,2),
  seats_used INT,
  consumption_units DECIMAL(10,4),
  consumption_unit_label VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_tool_month (tool_id, snapshot_month),
  FOREIGN KEY (tool_id) REFERENCES saas_tools(id),
  FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- AI-generated spend forecasts
CREATE TABLE IF NOT EXISTS spend_forecasts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tool_id INT NOT NULL,
  company_id INT NOT NULL,
  forecast_month DATE NOT NULL,
  projected_spend DECIMAL(10,2),
  confidence_level ENUM('low', 'medium', 'high') DEFAULT 'medium',
  forecast_basis TEXT,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tool_id) REFERENCES saas_tools(id),
  FOREIGN KEY (company_id) REFERENCES companies(id)
);
-- Provisioning workflow templates per role/department
CREATE TABLE IF NOT EXISTS workflow_templates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  template_name VARCHAR(255) NOT NULL,
  trigger_type ENUM('onboarding', 'offboarding', 'role_change') NOT NULL,
  department VARCHAR(100),
  tool_ids JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Active provisioning/deprovisioning workflow instances
CREATE TABLE IF NOT EXISTS workflow_instances (
  id INT AUTO_INCREMENT PRIMARY KEY,
  template_id INT,
  company_id INT NOT NULL,
  employee_id INT NOT NULL,
  trigger_type ENUM('onboarding', 'offboarding', 'role_change') NOT NULL,
  status ENUM('pending', 'in_progress', 'completed', 'overdue') DEFAULT 'pending',
  triggered_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  FOREIGN KEY (template_id) REFERENCES workflow_templates(id),
  FOREIGN KEY (company_id) REFERENCES companies(id),
  FOREIGN KEY (employee_id) REFERENCES employees(id),
  FOREIGN KEY (triggered_by) REFERENCES platform_users(id)
);

-- Individual tasks within a workflow instance
CREATE TABLE IF NOT EXISTS workflow_tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  workflow_instance_id INT NOT NULL,
  tool_id INT,
  task_description VARCHAR(500) NOT NULL,
  action_type ENUM('grant_access', 'revoke_access', 'transfer_data', 'notify_vendor', 'other'),
  assigned_to_email VARCHAR(255),
  status ENUM('pending', 'completed', 'skipped') DEFAULT 'pending',
  due_date DATE,
  completed_at TIMESTAMP NULL,
  FOREIGN KEY (workflow_instance_id) REFERENCES workflow_instances(id),
  FOREIGN KEY (tool_id) REFERENCES saas_tools(id)
);
