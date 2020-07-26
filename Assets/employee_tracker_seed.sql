use employee_tracker_db;

insert into department (name) values ('Facilities');
insert into department (name) values ('Finance');
insert into department (name) values ('HR');
insert into department (name) values ('IT');
insert into department (name) values ('Marketing');
insert into department (name) values ('Operations');
insert into department (name) values ('Purchasing');
insert into department (name) values ('R & D');
insert into department (name) values ('Sales');

-- select * from department;

insert into role (title,salary,department_id) values ("CEO",1000000,null);
insert into role (title,salary,department_id) values ("CIO",800000,4);
insert into role (title,salary,department_id) values ("CFO",800000,2);
insert into role (title,salary,department_id) values ("COO",800000,6);
insert into role (title,salary,department_id) values ("Manager",125000,4);
insert into role (title,salary,department_id) values ("Manager",125000,2);
insert into role (title,salary,department_id) values ("Sr Analyst",105000,4);
insert into role (title,salary,department_id) values ("Analyst",80000,4);
insert into role (title,salary,department_id) values ("Jr Analyst",60000,4);
insert into role (title,salary,department_id) values ("Assistant",40000,4);
insert into role (title,salary,department_id) values ("Project Manager",75000,4);

-- select * from role;

insert into employee (first_name,last_name,role_id,manager_id) values ("Jim","Bob",1,null);
insert into employee (first_name,last_name,role_id,manager_id) values ("Joe","Bob",2,1);
insert into employee (first_name,last_name,role_id,manager_id) values ("Jill","Bob",3,1);
insert into employee (first_name,last_name,role_id,manager_id) values ("Joan","Bob",4,1);
insert into employee (first_name,last_name,role_id,manager_id) values ("Jack","Bob",5,2);
insert into employee (first_name,last_name,role_id,manager_id) values ("John","Bob",7,5);

-- select * from employee;