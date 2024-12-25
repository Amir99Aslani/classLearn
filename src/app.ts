interface validationRole {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    minValue?: number;
    maxValue?: number;
}

function validation(input: validationRole) {
    let isValid = true;
    if (input.required) {
        isValid = isValid && input.value.toString().trim().length !== 0;
    }
    if (input.minLength != null && typeof input.value === "string") {
        isValid = isValid && input.value.length > input.minLength;
    }
    if (input.maxLength != null && typeof input.value === "string") {
        isValid = isValid && input.value.length < input.maxLength;
    }
    if (input.minValue != null && typeof input.value === "number") {
        isValid = isValid && input.value > input.minValue;
    }
    if (input.maxValue != null && typeof input.value === "number") {
        isValid = isValid && input.value < input.maxValue;
    }

    return isValid;
}


function autoBindDec(_: any, _2: string, descriptor: any) {

    const orjConstructor = descriptor.value;
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        get() {
            const boundingShitsFn = orjConstructor.bind(this);
            return boundingShitsFn
        }
    }
    return adjDescriptor;
}

// Project Type
enum ProjectStatus {
    Active,
    Finished
}

// Project State Management
type Listener = (items: Project[]) => void;


// Component Base Class
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
    templateElement: HTMLTemplateElement;
    hostElement: T;
    element: U;

    constructor(templateId: string, hostElementId: string, insertAtStart: boolean, newElementId?: string) {
        this.templateElement = document.getElementById(
            templateId
        )! as HTMLTemplateElement;
        this.hostElement = document.getElementById(hostElementId)! as T;

        const importedNode = document.importNode(
            this.templateElement.content,
            true
        );
        this.element = importedNode.firstElementChild as U;
        if (newElementId)
            this.element.id = newElementId;

        this.attach(insertAtStart);
    }

    private attach(insertPlace: boolean) {
        this.hostElement.insertAdjacentElement(insertPlace ? 'afterbegin' : 'beforeend', this.element);
    }

    abstract configure(): void;

    abstract render(): void;

}

class Project {
    constructor(
        public id: string,
        public title: string,
        public description: string,
        public people: number,
        public status: ProjectStatus
    ) {
    }
}

class ProjectState {
    private listener: Listener[] = []
    private projects: Project[] = [];
    private static instance: ProjectState;

    private constructor() {
    }

    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new ProjectState();
        return this.instance;
    }

    addProject(Title: string, description: string, peopleNum: number): void {
        const newProject = new Project(
            Math.random().toString(36),
            Title,
            description,
            peopleNum,
            ProjectStatus.Active
        );

        this.projects.push(newProject);
        for (const listenerfn of this.listener) {
            listenerfn(this.projects.slice());
        }
    }

    addListener(listenerfn: Listener) {
        this.listener.push(listenerfn);
    }
}

const projectState = ProjectState.getInstance();

class projectList extends Component<HTMLDivElement, HTMLElement> {
    assignProject: Project[];

    constructor(private type: "active" | "finished") {
        super('project-list', 'app', false, `${type}-projects`);

        this.assignProject = [];

        this.render();
        this.configure();
    }

    private renderProjects() {
        const listEl = document.getElementById(`${this.type}-project-list`) as HTMLUListElement;
        listEl.innerHTML = '';
        for (const projectItem of this.assignProject) {
            const listItem = document.createElement("li");
            listItem.textContent = projectItem.title;
            listEl.append(listItem);
        }
    }

    configure() {
        projectState.addListener((projects: any[]) => {

            const relevantProjects = projects.filter(prj => {
                if (this.type === 'active') {
                    return prj.status === ProjectStatus.Active;
                }
                return prj.status === ProjectStatus.Finished;
            });

            this.assignProject = relevantProjects
            this.renderProjects();
        });
    }

     render() {
        const listId = `${this.type}-project-list`;
        this.element.querySelector("ul")!.id = listId;
        this.element.querySelector("h2")!.textContent =
            this.type.toUpperCase() + `PROJECTS`;
    }

}

class ProjectInput extends Component<HTMLDivElement, HTMLFormElement>{
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
        super('project-input' , 'app' , true , 'user-input');

        this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
        this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
        this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;

        this.configure();
        this.render();
    }

    private getUserInput(): [string, string, number] | void {
        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const peopleNum = this.peopleInputElement.value;

        const titleValidatable: validationRole = {
            value: enteredTitle,
            required: true
        };
        const descriptionValidatable: validationRole = {
            value: enteredDescription,
            required: true,
            minLength: 5
        };
        const peopleValidatable: validationRole = {
            value: +peopleNum,
            required: true,
            minValue: 1,
            maxValue: 5
        };

        if (
            !validation(titleValidatable) ||
            !validation(descriptionValidatable) ||
            !validation(peopleValidatable)
        ) {
            alert('Please enter a valid input');
            return;
        } else {
            return [enteredTitle, enteredDescription, +peopleNum]
        }
    }

    private clearInputs() {
        this.titleInputElement.value = '';
        this.descriptionInputElement.value = '';
        this.peopleInputElement.value = '';
    }

    @autoBindDec
    private submitHandler(event: Event) {
        event.preventDefault();
        const userInputs = this.getUserInput();
        if (Array.isArray(userInputs)) {
            const [title, desc, people] = userInputs;
            console.log(title, desc, people);
            projectState.addProject(title, desc, people);
            this.clearInputs();
        }
    }

     configure() {
        this.element.addEventListener('submit', this.submitHandler);
    }

    render() {

    }

}

const prjInput = new ProjectInput();
const activePrj = new projectList("active");
const finishedPrj = new projectList("finished");
