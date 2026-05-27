-- Spendix Demo Seed Data
-- Run: mysql -u root -p spendix < server/db/seed.sql
USE spendix;

-- Company
INSERT INTO companies (name, domain, industry, employee_count_range) VALUES
('Spendix Demo Co', 'spendixdemo.in', 'Technology', '100-250');

-- Platform user (password: spendix123)
INSERT INTO platform_users (company_id, name, email, password_hash, role) VALUES
(1, 'Arjun Kumar', 'admin@spendix.demo', '$2a$10$aJt6Jzj1gWBxxEV1i19s7O4t9ehetMUYz.8d2tsQV4.YiOuXaUYcq', 'it_admin');

-- 8 SaaS Tools
INSERT INTO saas_tools (company_id, tool_name, category, seats_purchased, monthly_cost_per_seat, total_monthly_cost, billing_model, renewal_date, auto_renewal, contract_term_months, vendor_contact_email, owner_user_id) VALUES
(1,'Salesforce','CRM',30,4200.00,126000.00,'per_seat','2026-06-01',TRUE,12,'sales@salesforce.com',1),
(1,'Zoom Business','video_conferencing',50,1400.00,70000.00,'per_seat','2026-06-03',TRUE,12,'billing@zoom.us',1),
(1,'Slack Pro','communication',60,850.00,51000.00,'per_seat','2026-09-15',FALSE,12,'sales@slack.com',1),
(1,'GitHub Team','development',25,1500.00,37500.00,'per_seat','2026-11-01',TRUE,12,'enterprise@github.com',1),
(1,'Notion','project_management',40,700.00,28000.00,'per_seat','2026-08-20',FALSE,12,'team@notion.so',1),
(1,'Google Workspace','communication',60,750.00,45000.00,'per_seat','2026-12-01',TRUE,12,'workspace@google.com',1),
(1,'Jira','project_management',30,1200.00,36000.00,'per_seat','2026-07-10',TRUE,12,'sales@atlassian.com',1),
(1,'Asana','project_management',20,900.00,18000.00,'per_seat','2026-10-05',FALSE,12,'sales@asana.com',1);

-- 60 Employees (48 active, 12 inactive)
INSERT INTO employees (company_id, name, email, department, job_title, manager_email, is_active, deactivated_at) VALUES
(1,'Arjun Kumar','arjun@demo.com','Engineering','Backend Engineer','lead@demo.com',TRUE,NULL),
(1,'Priya Sharma','priya@demo.com','Marketing','Marketing Manager','vp@demo.com',TRUE,NULL),
(1,'Rahul Patel','rahul@demo.com','Sales','Sales Executive','head@demo.com',TRUE,NULL),
(1,'Sneha Gupta','sneha@demo.com','Engineering','Frontend Engineer','lead@demo.com',TRUE,NULL),
(1,'Vikram Singh','vikram@demo.com','Finance','Financial Analyst','cfo@demo.com',TRUE,NULL),
(1,'Ananya Reddy','ananya@demo.com','Engineering','DevOps Engineer','lead@demo.com',TRUE,NULL),
(1,'Karan Mehta','karan@demo.com','Sales','Account Manager','head@demo.com',TRUE,NULL),
(1,'Deepika Nair','deepika@demo.com','HR','HR Manager','chro@demo.com',TRUE,NULL),
(1,'Amit Joshi','amit@demo.com','Engineering','QA Engineer','lead@demo.com',TRUE,NULL),
(1,'Riya Verma','riya@demo.com','Design','UI Designer','designlead@demo.com',TRUE,NULL),
(1,'Suresh Rao','suresh@demo.com','Engineering','Senior Engineer','lead@demo.com',TRUE,NULL),
(1,'Kavita Iyer','kavita@demo.com','Marketing','Content Writer','vp@demo.com',TRUE,NULL),
(1,'Manish Tiwari','manish@demo.com','Sales','Sales Lead','head@demo.com',TRUE,NULL),
(1,'Pooja Das','pooja@demo.com','Finance','Accounts Executive','cfo@demo.com',TRUE,NULL),
(1,'Rajesh Kumar','rajesh@demo.com','Engineering','Tech Lead','cto@demo.com',TRUE,NULL),
(1,'Neha Agarwal','neha@demo.com','Marketing','SEO Specialist','vp@demo.com',TRUE,NULL),
(1,'Sanjay Mishra','sanjay@demo.com','Operations','Ops Manager','coo@demo.com',TRUE,NULL),
(1,'Meera Joshi','meera@demo.com','Finance','Finance Manager','cfo@demo.com',TRUE,NULL),
(1,'Arun Pandey','arun@demo.com','Engineering','Backend Engineer','lead@demo.com',TRUE,NULL),
(1,'Lakshmi Menon','lakshmi@demo.com','HR','Recruiter','chro@demo.com',TRUE,NULL),
(1,'Nikhil Kapoor','nikhil@demo.com','Sales','BDR','head@demo.com',TRUE,NULL),
(1,'Swati Chauhan','swati@demo.com','Design','Product Designer','designlead@demo.com',TRUE,NULL),
(1,'Gaurav Saxena','gaurav@demo.com','Engineering','Mobile Developer','lead@demo.com',TRUE,NULL),
(1,'Divya Pillai','divya@demo.com','Marketing','Growth Manager','vp@demo.com',TRUE,NULL),
(1,'Rohit Bhatt','rohit@demo.com','Engineering','SRE','lead@demo.com',TRUE,NULL),
(1,'Isha Malhotra','isha@demo.com','Sales','Enterprise Sales','head@demo.com',TRUE,NULL),
(1,'Vivek Sharma','vivek@demo.com','Finance','Payroll Analyst','cfo@demo.com',TRUE,NULL),
(1,'Nandini Rao','nandini@demo.com','Engineering','Data Engineer','lead@demo.com',TRUE,NULL),
(1,'Tushar Agrawal','tushar@demo.com','Operations','Supply Chain','coo@demo.com',TRUE,NULL),
(1,'Sakshi Desai','sakshi@demo.com','HR','HR Coordinator','chro@demo.com',TRUE,NULL),
(1,'Abhishek Goyal','abhishek@demo.com','Engineering','Platform Engineer','lead@demo.com',TRUE,NULL),
(1,'Pallavi Khanna','pallavi@demo.com','Marketing','Brand Manager','vp@demo.com',TRUE,NULL),
(1,'Manoj Kulkarni','manoj@demo.com','Sales','Regional Manager','head@demo.com',TRUE,NULL),
(1,'Shruti Bose','shruti@demo.com','Design','UX Researcher','designlead@demo.com',TRUE,NULL),
(1,'Varun Thakur','varun@demo.com','Engineering','Security Engineer','lead@demo.com',TRUE,NULL),
(1,'Anjali Dubey','anjali@demo.com','Finance','Tax Analyst','cfo@demo.com',TRUE,NULL),
(1,'Siddharth Jain','siddharth@demo.com','Engineering','Frontend Engineer','lead@demo.com',TRUE,NULL),
(1,'Tanvi Sethi','tanvi@demo.com','Marketing','Digital Marketing','vp@demo.com',TRUE,NULL),
(1,'Harsh Vardhan','harsh@demo.com','Sales','Sales Ops','head@demo.com',TRUE,NULL),
(1,'Megha Srivastava','megha@demo.com','HR','L&D Manager','chro@demo.com',TRUE,NULL),
(1,'Vishal Patil','vishal@demo.com','Engineering','Cloud Engineer','lead@demo.com',TRUE,NULL),
(1,'Aditi Banerjee','aditi@demo.com','Operations','Project Coordinator','coo@demo.com',TRUE,NULL),
(1,'Pankaj Rawat','pankaj@demo.com','Engineering','DBA','lead@demo.com',TRUE,NULL),
(1,'Roshni Kaur','roshni@demo.com','Marketing','Event Manager','vp@demo.com',TRUE,NULL),
(1,'Dhruv Chopra','dhruv@demo.com','Sales','Pre-sales Engineer','head@demo.com',TRUE,NULL),
(1,'Komal Yadav','komal@demo.com','Finance','Financial Controller','cfo@demo.com',TRUE,NULL),
(1,'Akash Sinha','akash@demo.com','Engineering','ML Engineer','lead@demo.com',TRUE,NULL),
(1,'Preeti Mahajan','preeti@demo.com','Design','Graphic Designer','designlead@demo.com',TRUE,NULL),
-- Inactive employees (12)
(1,'Rohit Verma','rohitv@demo.com','Sales','Sales Executive','head@demo.com',FALSE,'2026-02-15'),
(1,'Nisha Gupta','nisha@demo.com','Marketing','Campaign Manager','vp@demo.com',FALSE,'2026-03-01'),
(1,'Aman Khosla','aman@demo.com','Engineering','Junior Developer','lead@demo.com',FALSE,'2026-01-20'),
(1,'Geeta Raman','geeta@demo.com','Finance','Accounts Clerk','cfo@demo.com',FALSE,'2026-02-28'),
(1,'Tarun Batra','tarun@demo.com','Engineering','Intern','lead@demo.com',FALSE,'2026-03-15'),
(1,'Shalini Prasad','shalini@demo.com','HR','HR Intern','chro@demo.com',FALSE,'2026-01-10'),
(1,'Mohit Grover','mohit@demo.com','Sales','SDR','head@demo.com',FALSE,'2026-02-05'),
(1,'Jyoti Choudhary','jyoti@demo.com','Marketing','Social Media','vp@demo.com',FALSE,'2026-03-20'),
(1,'Rakesh Garg','rakesh@demo.com','Operations','Logistics','coo@demo.com',FALSE,'2026-01-25'),
(1,'Sunita Reddy','sunita@demo.com','Engineering','Tester','lead@demo.com',FALSE,'2026-02-10'),
(1,'Ajay Thapa','ajay@demo.com','Sales','Sales Intern','head@demo.com',FALSE,'2026-03-05'),
(1,'Bhavna Sharma','bhavna@demo.com','Finance','Billing Clerk','cfo@demo.com',FALSE,'2026-02-20');

-- ============================================================
-- Usage Logs
-- Active users: last_login within 60 days, good login counts
-- Idle users: last_login > 60 days ago = wasted seats
-- Target: ~35-40% idle rate → ~₹1,42,000 monthly waste
-- ============================================================

INSERT INTO usage_logs (employee_id, tool_id, last_login, login_count_last_30_days, has_license) VALUES
-- Salesforce (tool 1): 30 seats, 18 active / 12 idle → waste = 12×4200 = ₹50,400
(1,1,'2026-05-01',22,TRUE),(2,1,'2026-05-03',18,TRUE),(3,1,'2026-05-02',25,TRUE),
(4,1,'2026-04-28',15,TRUE),(7,1,'2026-05-04',20,TRUE),(11,1,'2026-05-01',12,TRUE),
(13,1,'2026-04-30',19,TRUE),(15,1,'2026-05-02',24,TRUE),(21,1,'2026-04-29',16,TRUE),
(25,1,'2026-05-03',14,TRUE),(26,1,'2026-05-01',21,TRUE),(33,1,'2026-04-28',17,TRUE),
(39,1,'2026-05-02',11,TRUE),(44,1,'2026-04-30',13,TRUE),(45,1,'2026-05-01',22,TRUE),
(5,1,'2026-04-25',10,TRUE),(8,1,'2026-04-20',8,TRUE),(14,1,'2026-04-22',6,TRUE),
-- idle seats (last_login > 60 days)
(6,1,'2026-02-15',0,TRUE),(9,1,'2026-02-20',0,TRUE),(10,1,'2026-01-10',0,TRUE),
(16,1,'2026-02-01',1,TRUE),(17,1,'2026-01-25',0,TRUE),(19,1,'2026-02-28',0,TRUE),
(22,1,'2026-01-15',0,TRUE),(24,1,'2026-02-10',0,TRUE),(27,1,'2026-01-30',0,TRUE),
(28,1,'2026-02-18',0,TRUE),(29,1,'2026-01-20',0,TRUE),(31,1,'2026-02-05',0,TRUE),
-- inactive employees with licenses (offboarding risks)
(49,1,'2026-01-10',0,TRUE),(55,1,'2026-01-05',0,TRUE),

-- Zoom (tool 2): 50 seats, 30 active / 20 idle → waste = 20×1400 = ₹28,000
(1,2,'2026-05-04',20,TRUE),(2,2,'2026-05-03',18,TRUE),(3,2,'2026-05-01',22,TRUE),
(4,2,'2026-04-29',15,TRUE),(6,2,'2026-05-02',19,TRUE),(7,2,'2026-05-03',21,TRUE),
(8,2,'2026-05-01',14,TRUE),(11,2,'2026-04-30',17,TRUE),(13,2,'2026-05-02',20,TRUE),
(15,2,'2026-05-04',23,TRUE),(17,2,'2026-05-01',16,TRUE),(19,2,'2026-04-28',12,TRUE),
(20,2,'2026-05-03',18,TRUE),(22,2,'2026-05-01',15,TRUE),(24,2,'2026-04-30',19,TRUE),
(25,2,'2026-05-02',21,TRUE),(27,2,'2026-05-01',13,TRUE),(29,2,'2026-04-29',17,TRUE),
(31,2,'2026-05-03',22,TRUE),(33,2,'2026-05-01',14,TRUE),(35,2,'2026-04-30',20,TRUE),
(37,2,'2026-05-02',16,TRUE),(39,2,'2026-05-04',18,TRUE),(41,2,'2026-05-01',15,TRUE),
(43,2,'2026-04-28',11,TRUE),(44,2,'2026-05-03',19,TRUE),(46,2,'2026-05-01',13,TRUE),
(47,2,'2026-04-30',17,TRUE),(5,2,'2026-04-25',8,TRUE),(14,2,'2026-04-22',6,TRUE),
-- idle
(9,2,'2026-02-10',0,TRUE),(10,2,'2026-01-20',0,TRUE),(12,2,'2026-02-05',0,TRUE),
(16,2,'2026-01-28',0,TRUE),(18,2,'2026-02-15',0,TRUE),(21,2,'2026-01-30',0,TRUE),
(23,2,'2026-02-01',0,TRUE),(26,2,'2026-01-15',0,TRUE),(28,2,'2026-02-20',0,TRUE),
(30,2,'2026-01-25',0,TRUE),(32,2,'2026-02-08',0,TRUE),(34,2,'2026-01-18',0,TRUE),
(36,2,'2026-02-12',0,TRUE),(38,2,'2026-01-22',0,TRUE),(40,2,'2026-02-03',0,TRUE),
(42,2,'2026-01-28',0,TRUE),(45,2,'2026-02-14',0,TRUE),(48,2,'2026-01-10',0,TRUE),
(49,2,'2026-01-05',0,TRUE),(50,2,'2026-01-12',0,TRUE),
