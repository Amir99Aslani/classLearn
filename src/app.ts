function logger(target: Function) {
    console.log("logging...");
    console.log(target)
}

@logger
class person {
    name = "max";

    constructor() {
        console.log("creating")
    }
}
