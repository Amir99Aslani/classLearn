function logger(logString: string) {
    return function (constructor: Function) {
        console.log(logString)
        console.log(constructor)
    }
}

function WithTemplate(template: string, hookId: string) {
    console.log('TEMPLATE FACTORY');
    return function (personConstructor: any) {
        console.log('Rendering template');
        const hookEl = document.getElementById(hookId);
        const p = new personConstructor();
        if (hookEl) {
            hookEl.innerHTML = template;
            hookEl.querySelector('h2')!.textContent = p.name;
        }
    };
}


// @ts-ignore
@logger('log some shit')
// @ts-ignore
@WithTemplate("<h2 style='color: crimson'>hey hey hey</h2>", "appId")
class person {
    name = "Ami Aslani";

    constructor() {
        console.log("creating")
    }
}


function AutoBind(target: any, method: string, descriptor: PropertyDescriptor) {
    console.log(target);
    console.log(method);
    console.log(descriptor);

    const originalMethod = descriptor.value;
    const adjMethod: PropertyDescriptor = {
        configurable: true,
        enumerable: false,
        get() {
            return originalMethod.bind(this);
        },
    }
    return adjMethod;
}


class PrintButton {
    message = "this is it"


    @AutoBind
    showMessage() {
        console.log(this.message);
    }
}

const printer = new PrintButton();
printer.showMessage();

const myBTN = document.getElementById("printer")!;
myBTN.addEventListener('click', printer.showMessage);


//####################################################################################################################
console.log("//####################################################################################################################")


interface validationConfig {
    [property: string]: {
        [validatableProp: string]: string[]; // ['required', 'positive']
    }
}

const registeredValidators: validationConfig = {};


function requiredDec(target: any, propName: string) {
    registeredValidators[target.constructor.name] = {
        ...registeredValidators[target.constructor.name],
        [propName]: ["required"]
    }
}

function greaterThanZero(target: any, propName: string) {
    registeredValidators[target.constructor.name] = {
        ...registeredValidators[target.constructor.name],
        [propName]: ["greaterThanZero"]
    }
}

function validateClass(classObject: any)  {
    const objValidatorConfig = registeredValidators[classObject.constructor.name];
    if (!objValidatorConfig) {
        return true;
    }
    let isValid = true;
    for (const props in objValidatorConfig){
        for (const validator of objValidatorConfig[props]){
            if (validator === 'required'){
                isValid = isValid && !!classObject[props];
            }
            if (validator === 'greaterThanZero'){
                isValid = isValid && classObject[props] > 0;
            }
        }
    }

    return(isValid);
}

class MyCourse {
    @requiredDec
    name: string;
    @greaterThanZero
    price: number;

    constructor(n: string, p: number) {
        this.name = n
        this.price = p
    }
}

const courseForm = document.querySelector('form')!;
courseForm.addEventListener('submit', event => {
    event.preventDefault();
    const titleEl = document.getElementById('title') as HTMLInputElement;
    const priceEl = document.getElementById('price') as HTMLInputElement;

    const title = titleEl.value;
    const price = +priceEl.value;

    titleEl.value = "";
    priceEl.value = "0";

    const createdCourse = new MyCourse(title, price);

    if (!validateClass(createdCourse)) {
        alert('Invalid input, please try again!');
        return;
    }
    console.log(createdCourse);
});
