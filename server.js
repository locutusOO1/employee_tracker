const inquirer = require("inquirer");
const mysql = require("mysql");
const cTable = require('console.table');

const actionList = ["View Departments","View Roles","View Employees",
                    "View Employees by Manager","View Total Utilized Budget by Department",
                    "Add Department","Add Role","Add Employee",
                    "Update Employee Role","Update Employee Manager",
                    "Delete Department","Delete Role","Delete Employee",
                    "Exit"];

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "datadata2X!",
    database: "employee_tracker_db"
});

connection.connect(err => {
    if (err) throw err;
    console.log(`connected on thread ${connection.threadId}`);
    initPrompt();
});

function initPrompt () {
    inquirer.prompt([
        {
            name: "action",
            message: "Select action:",
            type: "list",
            choices: actionList
        }
    ]).then(answer => {
        switch (answer.action) {
            case "Add Department":
                addDepartment();
                break;
            case "Add Role":
                addRole();
                break;
            case "Add Employee":
                addEmployee();
                break;
            case "View Departments":
                viewDepts();
                break;
            case "View Roles":
                viewRoles();
                break;
            case "View Employees":
                viewEmployees();
                break;
            case "Update Employee Role":
                updateEmployeeRole();
                break;
            case "Update Employee Manager":
                updateEmployeeManager();
                break;
            case "View Employees by Manager":
                viewEmployeesByManager();
                break;
            case "Delete Department":
                deleteDepartment();
                break;
            case "Delete Role":
                deleteRole();
                break;
            case "Delete Employee":
                deleteEmployee();
                break;
            case "View Total Utilized Budget by Department":
                viewBudgetByDept();
                break;
            case "Exit":
            default:
                connection.end();
                process.exit();
        }
    });
}

function viewDepts() {
    connection.query("select name Department, id DeptID from department order by name",(err, results) => {
        if (err) throw err;
        console.table(results);
        initPrompt();
    });
}

function viewRoles() {
    connection.query(
        `select r.title Title, concat('$',format(r.salary,2)) Salary, d.name Department,r.id RoleID
         from role r
         left outer join department d on (r.department_id = d.id)
         order by r.title,d.name`,
         (err, results) => {
        if (err) throw err;
        console.table(results);
        initPrompt();
    });
}

function viewEmployees() {
    connection.query(
        `select e.first_name FirstName,e.last_name LastName,d.name Department,r.title Title, 
            concat('$',format(r.salary,2)) Salary,e.id EmployeeID,concat(m.first_name," ",m.last_name) Manager
         from employee e
         left join role r on (e.role_id = r.id)
         left join department d on (r.department_id = d.id)
         left join employee m on (e.manager_id = m.id)
         order by e.first_name,e.last_name,d.name,r.title`,
         (err, results) => {
        if (err) throw err;
        console.table(results);
        initPrompt();
    });
}

function viewBudgetByDept() {
    connection.query(
        `select ifnull(d.name,"*No Dept") Department,
            concat('$',format(sum(r.salary),2)) Budget,
            count(1) "Number of Employees",
            concat('$',format((sum(r.salary)/count(1)),2)) "Avg Cost Per Employee"
        from employee e
        inner join role r on (e.role_id = r.id)
        left join department d on (r.department_id = d.id)
        group by ifnull(d.name,"*No Dept")
        order by ifnull(d.name,"*No Dept")`,
        (err, results) => {
        if (err) throw err;
        console.table(results);
        initPrompt();
    });
}

function viewEmployeesByManager() {
    connection.query(
        `select ifnull(concat(m.first_name," ",m.last_name),"*No Manager") Manager,
            concat(e.first_name," ",e.last_name) Employee,
            ifnull(d.name,"*No Department") "Employee Department",
            r.title "Employee Title",
            concat('$',format(r.salary,2)) "Employee Salary"
        from employee e
        left join employee m on (e.manager_id = m.id)
        left join role r on (e.role_id = r.id)
        left join department d on (r.department_id = d.id)
        order by manager, "Employee Department", "Employee Title", title, "Employee Salary"`,
        (err, results) => {
        if (err) throw err;
        console.table(results);
        initPrompt();
    });
}

function addDepartment() {
    inquirer.prompt([
        {
            name: "dept",
            message: "Enter new department name:",
            type: "input",
            validate: answer => (answer.length > 0)||"Please enter something for the department name."
        }
    ]).then(answer => {
        connection.query("insert into department (name) values (?)",
        answer.dept,
        function(err) {
            if (err) throw err;
            viewDepts();
            initPrompt();
        });
    });
}

function deleteDepartment() {
    connection.query("select * from department order by name",
    function(err, results) {
        if (err) throw err;
        inquirer.prompt([
            {
                name: "choice",
                type: "list",
                message: "Choose department to delete (Department Name - Dept ID):",
                choices: function () {
                    var options = [];
                    results.forEach(element => {
                        options.push(`${element.name} - ${element.id}`);
                    });
                    return options;
                }
            }
        ]).then(function(answer) {
            connection.query("delete from department where concat(name,' - ',id) = ?",
            answer.choice,
            function(err2, results2) {
                if (err2) throw err2;
                initPrompt();
            });
        });
    });
}

function addRole() {
    connection.query("select * from department order by name,id",
    function(err, results) {
        let resArr = ["No Department"];
        if (err) throw err;
        results.forEach(element => {
            resArr.push(`${element.name} - ${element.id}`);
        });
        inquirer.prompt([
            {
                name: "title",
                type: "input",
                message: "Enter new title:",
                validate: answers => (answers.length > 0)||"Please enter something for the new title."
            },
            {
                name: "salary",
                type: "input",
                message: "Enter new salary:",
                validate: answers => (parseInt(answers) >= 0)||"Please enter valid number for the salary."
            },
            {
                name: "department_id",
                type: "list",
                message: "Choose department (Department Name - Dept ID):",
                choices: resArr
            }
        ]).then(answers => {
            let deptId = (answers.department_id === "No Department" ) ? null : parseInt(answers.department_id.split(' - ').pop());
            connection.query("insert into role (title,salary,department_id) values (?,?,?)",
            [answers.title,answers.salary,deptId],
            function(err) {
                if (err) throw err;
                initPrompt();
            }
            );
        });
    });
}

function deleteRole() {
    connection.query(
        `select r.title Title,concat('$',format(r.salary,2)) Salary,d.name Department,r.id RoleID
         from role r
         left join department d on (d.id = r.department_id)
         order by r.title,d.name`,
    function(err, results) {
        if (err) throw err;
        inquirer.prompt([
            {
                name: "role_id",
                type: "list",
                message: "Choose role to delete (Title - Salary - Department - RoleID):",
                choices: function () {
                    var options = [];
                    results.forEach(element => {
                        options.push(`${element.Title} - ${element.Salary} - ${element.Department} - ${element.RoleID}`);
                    });
                    return options;
                }
            }
        ]).then(function(answer) {
            let roleId = answer.role_id.split(' - ').pop();
            connection.query("delete from role where id = ?",
            roleId,
            function(err2, results2) {
                if (err2) throw err2;
                initPrompt();
            });
        });
    });
}

function addEmployee() {
    connection.query(
        `select r.title Title,concat('$',format(r.salary,2)) Salary,d.name Department,r.id RoleID
         from role r
         left join department d on (d.id = r.department_id)
         order by r.title,d.name`,
    function(err, results) {
        let roleArr = ["No Role"];
        if (err) throw err;
        results.forEach(element => {
            roleArr.push(`${element.Title} - ${element.Salary} - ${element.Department} - ${element.RoleID}`);
        });
        connection.query(
            `select e.first_name FirstName,e.last_name LastName,d.name Department,r.title Title,e.id EmployeeID,concat(m.first_name," ",m.last_name) Manager
             from employee e
             left join role r on (e.role_id = r.id)
             left join department d on (r.department_id = d.id)
             left join employee m on (e.manager_id = m.id)
             order by e.first_name,e.last_name,d.name,r.title`,
        function(err2,results2) {
            let managerArr = ["No Manager"];
            if (err2) throw err2;
            results2.forEach(element => {
                managerArr.push(`${element.FirstName} ${element.LastName} - ${element.Title} - ${element.Department} - ${element.EmployeeID}`);
            });
            inquirer.prompt([
                {
                    name: "first_name",
                    type: "input",
                    message: "Enter first name:",
                    validate: answers => (answers.length > 0)||"Please enter something for the first name."
                },
                {
                    name: "last_name",
                    type: "input",
                    message: "Enter last name:",
                    validate: answers => (answers.length > 0)||"Please enter something for the last name."
                },
                {
                    name: "role_id",
                    type: "list",
                    message: "Choose role (Title - Salary - Department - RoleID):",
                    choices: roleArr
                },
                {
                    name: "manager_id",
                    type: "list",
                    message: "Choose manager (Name - Title - Department - EmployeeID):",
                    choices: managerArr
                }
            ]).then(answers => {
                let roleId = (answers.role_id === "No Role" ) ? null : parseInt(answers.role_id.split(' - ').pop());
                let managerId = (answers.manager_id === "No Manager" ) ? null : parseInt(answers.manager_id.split(' - ').pop());
                connection.query("insert into employee (first_name,last_name,role_id,manager_id) values (?,?,?,?)",
                [answers.first_name,answers.last_name,roleId,managerId],
                function(err) {
                    if (err) throw err;
                    initPrompt();
                }
                );
            });
        });
    });
}

function deleteEmployee() {
    connection.query(
        `select e.first_name FirstName,e.last_name LastName,d.name Department,r.title Title, 
         concat('$',format(r.salary,2)) Salary,concat(m.first_name," ",m.last_name) Manager,e.id EmployeeID
         from employee e
         left join role r on (e.role_id = r.id)
         left join department d on (r.department_id = d.id)
         left join employee m on (e.manager_id = m.id)
         order by e.first_name,e.last_name,d.name,r.title`,
    function(err, results) {
        if (err) throw err;
        inquirer.prompt([
            {
                name: "employee_id",
                type: "list",
                message: "Choose employee to delete (Name - Department - Title - Salary - Manager - EmployeeID):",
                choices: function () {
                    var options = [];
                    results.forEach(element => {
                        options.push(`${element.FirstName} ${element.LastName} - ${element.Department} - ${element.Title} - ${element.Salary} - ${element.Manager} - ${element.EmployeeID}`);
                    });
                    return options;
                }
            }
        ]).then(function(answer) {
            let employeeId = answer.employee_id.split(' - ').pop();
            connection.query("delete from employee where id = ?",
            employeeId,
            function(err2, results2) {
                if (err2) throw err2;
                initPrompt();
            });
        });
    });
}

function updateEmployeeRole() {
    connection.query(
        `select e.first_name FirstName,e.last_name LastName,d.name Department,r.title Title, 
         concat('$',format(r.salary,2)) Salary,concat(m.first_name," ",m.last_name) Manager,e.id EmployeeID
         from employee e
         left join role r on (e.role_id = r.id)
         left join department d on (r.department_id = d.id)
         left join employee m on (e.manager_id = m.id)
         order by e.first_name,e.last_name,d.name,r.title`,
    function(err, results) {
        if (err) throw err;
        inquirer.prompt([
            {
                name: "employee_id",
                type: "list",
                message: "Choose employee to update (Name - Department - Title - Salary - Manager - EmployeeID):",
                choices: function () {
                    var options = [];
                    results.forEach(element => {
                        options.push(`${element.FirstName} ${element.LastName} - ${element.Department} - ${element.Title} - ${element.Salary} - ${element.Manager} - ${element.EmployeeID}`);
                    });
                    return options;
                }
            }
        ]).then(function(answer) {
            connection.query(
                `select r.title Title,concat('$',format(r.salary,2)) Salary,d.name Department,r.id RoleID
                 from role r
                 left join department d on (d.id = r.department_id)
                 order by r.title,d.name`,
            function(err2, results2) {
                if (err2) throw err2;
                inquirer.prompt([
                    {
                        name: "role_id",
                        type: "list",
                        message: "Choose role to delete (Title - Salary - Department - RoleID):",
                        choices: function () {
                            var options2 = ["No Role"];
                            results2.forEach(element => {
                                options2.push(`${element.Title} - ${element.Salary} - ${element.Department} - ${element.RoleID}`);
                            });
                            return options2;
                        }
                    }
                ]).then(function(answer2) {
                    let empId = parseInt(answer.employee_id.split(' - ').pop());
                    // let roleId = parseInt(answer2.role_id.split(' - ').pop());
                    let roleId = (answer2.role_id === "No Role" ) ? null : parseInt(answer2.role_id.split(' - ').pop());
                    connection.query(`update employee set role_id = ${roleId} where id = ${empId}`,
                    function(err3, results3) {
                        if (err3) throw err3;
                        initPrompt();
                    });
                });
            });
        });
    });
}

function updateEmployeeManager() {
    connection.query(
        `select e.first_name FirstName,e.last_name LastName,d.name Department,r.title Title, 
         concat('$',format(r.salary,2)) Salary,concat(m.first_name," ",m.last_name) Manager,e.id EmployeeID
         from employee e
         left join role r on (e.role_id = r.id)
         left join department d on (r.department_id = d.id)
         left join employee m on (e.manager_id = m.id)
         order by e.first_name,e.last_name,d.name,r.title`,
    function(err, results) {
        if (err) throw err;
        inquirer.prompt([
            {
                name: "employee_id",
                type: "list",
                message: "Choose employee to update (Name - Department - Title - Salary - Manager - EmployeeID):",
                choices: function () {
                    var options = [];
                    results.forEach(element => {
                        options.push(`${element.FirstName} ${element.LastName} - ${element.Department} - ${element.Title} - ${element.Salary} - ${element.Manager} - ${element.EmployeeID}`);
                    });
                    return options;
                }
            }
        ]).then(function(answer) {
            connection.query(
                `select e.first_name FirstName,e.last_name LastName,d.name Department,r.title Title, 
                 concat('$',format(r.salary,2)) Salary,concat(m.first_name," ",m.last_name) Manager,e.id EmployeeID
                 from employee e
                 left join role r on (e.role_id = r.id)
                 left join department d on (r.department_id = d.id)
                 left join employee m on (e.manager_id = m.id)
                 order by e.first_name,e.last_name,d.name,r.title`,
            function(err2, results2) {
                if (err2) throw err2;
                inquirer.prompt([
                    {
                        name: "manager_id",
                        type: "list",
                        message: "Choose manager to update to (Name - Department - Title - Salary - Manager - EmployeeID):",
                        choices: function () {
                            var options2 = ["No Manager"];
                            results2.forEach(element => {
                                options2.push(`${element.FirstName} ${element.LastName} - ${element.Department} - ${element.Title} - ${element.Salary} - ${element.Manager} - ${element.EmployeeID}`);
                            });
                            return options2;
                        }
                    }
                ]).then(function(answer2) {
                    let empId = parseInt(answer.employee_id.split(' - ').pop());
                    let managerId = (answer2.manager_id === "No Manager" ) ? null : parseInt(answer2.manager_id.split(' - ').pop());
                    connection.query(`update employee set manager_id = ${managerId} where id = ${empId}`,
                    function(err3, results3) {
                        if (err3) throw err3;
                        initPrompt();
                    });
                });
            });
        });
    });
}