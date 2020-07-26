drop database if exists employee_tracker_db;

create database employee_tracker_db;

use employee_tracker_db;

create table department (
	id integer(10) not null auto_increment,
	name varchar(30) not null,
    primary key (id)
);

create table role (
	id integer(10) not null auto_increment,
	title varchar(30) not null,
    salary decimal(12,2) not null,
    department_id integer(10) null,
    primary key (id),
    foreign key (department_id) references department(id)
);

create table employee (
	id integer(10) not null auto_increment,
    first_name varchar(30) not null,
    last_name varchar(30) not null,
    role_id integer(10) not null,
    manager_id integer(10) null,
    primary key (id),
    foreign key (role_id) references role(id),
    foreign key (manager_id) references employee(id)
);

select ifnull(d.name,"*No Dept") as Department,sum(r.salary) as Budget, count(1) as "Number of Employees", (sum(r.salary)/count(1)) as "Avg Cost Per Employee"
from employee e
inner join role r on (e.role_id = r.id)
left join department d on (r.department_id = d.id)
group by ifnull(d.name,"*No Dept")
order by ifnull(d.name,"*No Dept")
