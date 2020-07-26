const inquirer = require("inquirer");
const mysql = require("mysql");

const actionList = ["Add Department","Add Role","Add Employee",
                    "View Departments","View Roles","View Employees",
                    "Update Employee Role","Update Employee Manager",
                    "View Employees by Manger",
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
            case "View Roles":
            case "View Employees":
            case "Update Employee Role":
            case "Update Employee Manager":
            case "View Employees by Manager":
            case "Delete Department":
            case "Delete Role":
            case "Delete Employee":
            case "View Total Utilized Budget by Department":
            case "Exit":
            default:
                connection.end();
                process.exit();
        }
    });
}
