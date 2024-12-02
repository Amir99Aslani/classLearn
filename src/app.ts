function logger(logString: string) {
    return function (constructor: Function) {
        console.log(logString)
        console.log(constructor)
    }
}

@logger('log some shit')
class person {
    name = "max";

    constructor() {
        console.log("creating")
    }
}
