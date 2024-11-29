
class Department {
    private fullName: string;
    private employee: string[] = [];

    constructor(fullName: string) {
        this.fullName = fullName;
    }

    describe(this: Department) {
        console.log("this here name is " + this.fullName)
    }

    addEmployee(employeeTag: string) {
        this.employee.push(employeeTag);
    }

    printEmployee (this: Department){
        console.log("employee Num : " + this.employee.length);
        console.log("employee list : " + this.employee);
    }

}

const myCompany = new Department("novaScript");

myCompany.describe();

myCompany.addEmployee("seji")
myCompany.addEmployee("amir")

myCompany.printEmployee();
