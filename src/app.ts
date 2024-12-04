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

