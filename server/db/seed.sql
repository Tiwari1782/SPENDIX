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