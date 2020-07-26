const inquirer = require("inquirer");
const mysql = require("mysql");

const actionList = ["Add Department","Add Role","Add Employee",
                    "View Departments","View Roles","View Employees",
                    "Update Employee Role","Update Employee Manager",
                    "View Employees by Manager",
                    "Delete Department","Delete Role","Delete Employee",
                    "View Total Utilized Budget by Department","Exit"];

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
    // console.log("init prompt...");
    inquirer.prompt([
        {
            name: "action",
            message: "Select action:",
            type: "list",
            choices: actionList
        }
    ]).then(answer => {
        // console.log(answer);
        switch (answer.action) {
            case "Add Department":
                addDepartment();
                break;
            case "Add Role":
            case "Add Employee":
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
            case "Update Employee Manager":
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
    connection.query("select * from department order by name",(err, results) => {
        if (err) throw err;
        console.table(results);
        initPrompt();
    });
}

function viewRoles() {
    connection.query("select * from role order by title",(err, results) => {
        if (err) throw err;
        console.table(results);
        initPrompt();
    });
}

function viewEmployees() {
    connection.query("select * from employee order by first_name,last_name",(err, results) => {
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
            ifnull(d.name,"*No Department") Employee Department,
            r.title Employee Title,
            concat('$',format(r.salary,2)) Employee Salary
        from employee e
        left join employee m on (e.manager_id = m.id)
        left join role r on (e.role_id = r.id)
        left join department d on (r.department_id = d.id)
        order by manager, department, employee, title, salary`,
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
            message: "Enter new department:",
            type: "input"
        }
    ]).then(answer => {
        // console.log(answer.dept);
        // initPrompt();
        connection.query("insert into department (name) values (?)",
        answer.dept,
        function(err) {
            if (err) throw err;
            console.log("Added department!");
            viewDepts();
            initPrompt();
        });
    });
}

function deleteDepartment() {
    // console.log("deleteDepartment");
    // initPrompt();
    connection.query("select * from department order by name",
    function(err, results) {
        if (err) throw err;
        inquirer.prompt([
            {
                name: "choice",
                type: "list",
                message: "Choose department to delete (Name - Dept):",
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

function deleteRole() {
    // console.log("deleteDepartment");
    // initPrompt();
    connection.query("select title,format(salary,2) salary,ifnull(department_id,'*No Dept') department_id,id from role order by title,department_id",
    function(err, results) {
        if (err) throw err;
        inquirer.prompt([
            {
                name: "choice",
                type: "list",
                message: "Choose role to delete (Title - Salary - Dept ID - ID):",
                choices: function () {
                    var options = [];
                    results.forEach(element => {
                        options.push(`${element.title} - ${element.salary} - ${element.department_id} - ${element.id}`);
                    });
                    return options;
                }
            }
        ]).then(function(answer) {
            console.log(answer.choice);
            connection.query("delete from role where concat(title,' - ',format(salary,2),' - ',ifnull(department_id,'*No Dept'),' - ',id) = ?",
            answer.choice,
            function(err2, results2) {
                if (err2) throw err2;
                initPrompt();
            });
        });
    });
}