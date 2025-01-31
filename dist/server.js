import inquirer from 'inquirer'; //added
//import { QueryResult } from 'pg';
import { pool, connectToDb } from './connection.js';
await connectToDb();
// const PORT = process.env.PORT || 3001;
// GIVEN a command-line application that accepts user input
// WHEN I start the application
// THEN I am presented with the following options: view all departments, view all roles, view all employees, add a department, add a role, add an employee, and update an employee role
const mainMenu = async () => {
    const { action } = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'Choose an option:',
            choices: [
                'View all departments',
                'View all roles',
                'View all employees',
                'Add a department',
                'Add a role',
                'Add an employee',
                'Update an employee role',
                'Exit',
            ],
        },
    ]);
    switch (action) {
        case 'View all departments':
            await viewDepartments();
            break;
        case 'View all roles':
            await viewRoles();
            break;
        case 'View all employees':
            await viewEmployees();
            break;
        case 'Add a department':
            await addDepartment();
            break;
        case 'Add a role':
            await addRole();
            break;
        case 'Add an employee':
            await addEmployee();
            break;
        case 'Update an employee role':
            await updateEmployeeRole();
            break;
        case 'Exit':
            console.log('Goodbye!');
            process.exit();
    }
    mainMenu();
};
// WHEN I choose to view all departments
// THEN I am presented with a formatted table showing department names and department ids
const viewDepartments = async () => {
    const { rows } = await pool.query('SELECT * FROM departments');
    console.table(rows);
};
// WHEN I choose to view all roles
// THEN I am presented with the job title, role id, the department that role belongs to, and the salary for that role
const viewRoles = async () => {
    const { rows } = await pool.query(`
    SELECT roles.role_id, roles.role_title, roles.role_salary, departments.department_name
    FROM roles
    JOIN departments ON roles.department_id = departments.department_id;
  `);
    console.table(rows);
};
// WHEN I choose to view all employees
// THEN I am presented with a formatted table showing employee data, including employee ids, first names, last names, job titles, departments, salaries, and managers that the employees report to
const viewEmployees = async () => {
    const { rows } = await pool.query(`
    SELECT employees.employee_id, employees.first_name, employees.last_name, roles.role_title, departments.department_name AS departments, roles.role_salary,
           CONCAT(manager.first_name, ' ', manager.last_name) AS manager
    FROM employees
    JOIN roles ON employees.role_id = roles.role_id
    JOIN departments ON roles.department_id = departments.department_id
    LEFT JOIN employees AS manager ON employees.manager_id = manager.employee_id;
  `);
    console.table(rows);
};
// WHEN I choose to add a department
// THEN I am prompted to enter the name of the department and that department is added to the database
const addDepartment = async () => {
    const { name } = await inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'Enter the department name:',
        },
    ]);
    await pool.query('INSERT INTO departments (department_name) VALUES ($1)', [name]);
    console.log(`Department '${name}' added.`);
};
// WHEN I choose to add a role
// THEN I am prompted to enter the name, salary, and department for the role and that role is added to the database
const addRole = async () => {
    const departments = await pool.query('SELECT * FROM departments');
    const { title, salary, departmentId } = await inquirer.prompt([
        { type: 'input', name: 'title', message: 'Enter role name:' },
        { type: 'input', name: 'salary', message: 'Enter salary:' },
        {
            type: 'list',
            name: 'departmentId',
            message: 'Select a department:',
            choices: departments.rows.map((department) => ({
                name: department.department_name,
                value: department.department_id
            })),
        },
    ]);
    await pool.query('INSERT INTO roles (role_title, role_salary, department_id) VALUES ($1, $2, $3)', [
        title,
        salary,
        departmentId,
    ]);
    console.log(`Role '${title}' added.`);
};
// WHEN I choose to add an employee
// THEN I am prompted to enter the employee's first name, last name, role, and manager, and that employee is added to the database
const addEmployee = async () => {
    const roles = await pool.query('SELECT * FROM roles');
    const employees = await pool.query('SELECT * FROM employees');
    const { firstName, lastName, roleId, managerId } = await inquirer.prompt([
        { type: 'input', name: 'firstName', message: "Enter employee's first name:" },
        { type: 'input', name: 'lastName', message: "Enter employee's last name:" },
        {
            type: 'list',
            name: 'roleId',
            message: 'Select a role:',
            choices: roles.rows.map((role) => ({
                name: role.role_title,
                value: role.role_id
            })),
        },
        {
            type: 'list',
            name: 'managerId',
            message: 'Select a manager:',
            choices: [...employees.rows.map((employee) => ({
                    name: `${employee.first_name} ${employee.last_name}`,
                    value: employee.employee_id
                })),
                { name: 'None', value: null }],
        },
    ]);
    await pool.query('INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', [
        firstName,
        lastName,
        roleId,
        managerId,
    ]);
    console.log(`Employee '${firstName} ${lastName}' added.`);
};
// WHEN I choose to update an employee role
// THEN I am prompted to select an employee to update and their new role and this information is updated in the database
const updateEmployeeRole = async () => {
    const employees = await pool.query('SELECT * FROM employees');
    const roles = await pool.query('SELECT * FROM roles');
    const { employeeId, roleId } = await inquirer.prompt([
        {
            type: 'list',
            name: 'employeeId',
            message: 'Select an employee to update:',
            choices: employees.rows.map((employee) => ({
                name: `${employee.first_name} ${employee.last_name}`,
                value: employee.employee_id
            })),
        },
        {
            type: 'list',
            name: 'roleId',
            message: 'Select new role:',
            choices: roles.rows.map((role) => ({
                name: role.role_title,
                value: role.role_id
            })),
        },
    ]);
    const managerChoices = employees.rows.map((employee) => ({
        name: `${employee.first_name} ${employee.last_name}`,
        value: employee.employee_id,
    }));
    managerChoices.push({ name: 'None', value: null });
    const { managerId } = await inquirer.prompt([
        {
            type: 'list',
            name: 'managerId',
            message: 'Select a new manager for the employee:',
            choices: managerChoices,
        },
    ]);
    await pool.query('UPDATE employees SET role_id = $1, manager_id = $2 WHERE employee_id = $3', [roleId, managerId, employeeId]);
    console.log(`Employee updated successfully.`);
};
// Start the application
mainMenu();
