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