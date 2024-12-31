interface validationRole {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    minValue?: number;
    maxValue?: number;
}

//draganddrop
interface Draggable {
    Dragstart(event: DragEvent): void;

    DragEnd(event: DragEvent): void;
}

interface DragTarget {
    dragOver(event: DragEvent): void;

    drop(event: DragEvent): void;

    dragLeave(event: DragEvent): void;
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

    moveProject(projectId: string, newStatus: ProjectStatus) {
        const project = this.projects.find(prj => prj.id === projectId);
        if (project && project.status !== newStatus) {
            project.status = newStatus;
            for (const listenerfn of this.listener) {
                listenerfn(this.projects.slice());
            }
        }
    }

    addListener(listenerfn: Listener) {
        this.listener.push(listenerfn);
    }
}

const projectState = ProjectState.getInstance();

class projectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
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
            new ProjectItem(this.element.querySelector("ul")!.id, projectItem);

            // const listItem = document.createElement("li");
            // listItem.textContent = projectItem.title;
            // listEl.append(listItem);
        }
    }

    @autoBindDec
    dragOver(event: DragEvent) {
        if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
            event.preventDefault();
            const listEl = this.element.querySelector("ul")!
            listEl.classList.add("droppable");
        }
    }

    @autoBindDec
    drop(event: DragEvent) {
        const prjId = event.dataTransfer!.getData("text/plain");
        projectState.moveProject(prjId, this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished);
    }

    @autoBindDec
    dragLeave(_: DragEvent) {
        const listEl = this.element.querySelector("ul")!
        listEl.classList.remove("droppable");
    }

    configure() {
        this.element.addEventListener("dragover", this.dragOver);
        this.element.addEventListener("dragend", this.dragLeave);
        this.element.addEventListener("drop", this.drop);

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

class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
    private project: Project;

    get person() {
        if (this.project.people === 1) {
            return "1 person";
        } else if (this.project.people > 1) {
            return this.project.people.toString() + " persons";
        } else {
            return "--";
        }
    }

    constructor(hostId: string, project: Project) {
        super('single-project', hostId, true, project.id);
        this.project = project;

        this.configure();
        this.render();
    }

    @autoBindDec
    Dragstart(event: DragEvent) {
        event.dataTransfer!.setData("text/plain", this.project.id);
        event.dataTransfer!.effectAllowed = "move";
    }

    @autoBindDec
    DragEnd(_: DragEvent) {
        console.log("dragend")
    }

    configure() {
        this.element.addEventListener('dragstart', this.Dragstart)
        this.element.addEventListener('dragend', this.DragEnd)
    }

    render() {
        this.element.querySelector("h2")!.textContent = this.project.title;
        this.element.querySelector("h3")!.textContent = this.person + " assigned";
        this.element.querySelector("p")!.textContent = this.project.description;
    }
}

class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
        super('project-input', 'app', true, 'user-input');

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
            minValue: 0,
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
