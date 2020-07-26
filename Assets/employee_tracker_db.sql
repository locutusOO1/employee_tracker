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

