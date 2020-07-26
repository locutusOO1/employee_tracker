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
                console.log("View Employees by Manager");
                viewEmployeesByManager();
                break;
            case "Delete Department":
            case "Delete Role":
            case "Delete Employee":
            case "View Total Utilized Budget by Department":
                viewBudgetByDept();
                break;
            case "Exit":
            default:
                console.log("answers.action:");
                console.log(answer.action);
                connection.end();
                process.exit();
        }
    });
}

function viewDepts() {
    connection.query("select * from department",(err, results) => {
        if (err) throw err;
        console.table(results);
        initPrompt();
    });
}

function viewRoles() {
    connection.query("select * from role",(err, results) => {
        if (err) throw err;
        console.table(results);
        initPrompt();
    });
}

function viewEmployees() {
    connection.query("select * from employee",(err, results) => {
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
    console.log("viewEmployeesByManager()");
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