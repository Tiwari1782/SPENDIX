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
