\c postgres;

DROP DATABASE IF EXISTS employees_db;
CREATE DATABASE employees_db;

\c employees_db;

CREATE TABLE departments (
  department_id SERIAL PRIMARY KEY,
  department_name VARCHAR(30) UNIQUE NOT NULL
);

CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    role_title VARCHAR(30),
    role_salary DECIMAL NOT NULL,
    department_id INTEGER,
    FOREIGN KEY (department_id)
    REFERENCES departments(department_id)
    ON DELETE SET NULL
);

CREATE TABLE employees (
  employee_id SERIAL PRIMARY KEY,
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30) NOT NULL,
  role_id INTEGER,
  manager_id INTEGER,
  FOREIGN KEY (role_id)
  REFERENCES roles(role_id)
  ON DELETE SET NULL,
  FOREIGN KEY (manager_id)
  REFERENCES employees(employee_id) 
  ON DELETE SET NULL
);
