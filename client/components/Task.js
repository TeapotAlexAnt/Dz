import { TaskBtnTypes } from "./constants";

const TaskBtnParams = Object.freeze([
    Object.freeze({
        type: TaskBtnTypes.MOVE_TASK,
        className: 'move-btn',
        imgSrc: "./assets/right-arrow.svg",
        imgAlt: "Переместить"
    }),
    Object.freeze({
        type: TaskBtnTypes.DELETE_TASK,
        className: 'delete-btn',
        imgSrc: "./assets/delete-button.svg",
        imgAlt: "Удалить"
    })
]);

export default class Task{
    #taskID = '';
    #tEquipmentID = '';
    #tEmployeeID = '';
    #equipmentName = '';
    #taskDateSt = '';
    #taskDateEd = '';

    constructor({
        taskID,
        tEquipmentID,
        tEmployeeID,
        equipmentName,
        taskDateSt,
        taskDateEd,
        onDeleteTask,
        onMoveTask
    }){
        this.#taskID = taskID;
        this.#tEquipmentID = tEquipmentID;
        this.#tEmployeeID = tEmployeeID;
        this.#equipmentName = equipmentName;
        this.#taskDateSt = taskDateSt;
        this.#taskDateEd = taskDateEd;
        this.onDeleteTask = onDeleteTask;
        this.onMoveTask = onMoveTask;
    }

    get taskID() {return this.#taskID;}

    get tEquipmentID() {return this.#tEquipmentID;}
    
    get tEmployeeID() {return this.#tEmployeeID;}
    set tEmployeeID(newTEmployeeID) {
            if (typeof newTEmployeeID !== 'string') return;

            this.#tEmployeeID = newTEmployeeID;
        }

    get equipmentName() {return this.#equipmentName;}

    get taskDateSt() {return this.#taskDateSt;}

    get taskDateEd() {return this.#taskDateEd;}

    render(){
        const taskE1 = document.createElement('li');
        taskE1.classList.add('task');
        taskE1.setAttribute('id', this.#taskID);

        const spanE1 = document.createElement('span');
        spanE1.classList.add('task__text');
        spanE1.innerHTML = this.#equipmentName;
        taskE1.appendChild(spanE1);

        const controlsE1 = document.createElement('div');
        controlsE1.classList.add('task__actions');

        TaskBtnParams.forEach(({className, imgSrc, imgAlt, type}) => {
            const buttonE1 = document.createElement('button');
            buttonE1.classList.add(className);

            switch(type){
                case TaskBtnTypes.MOVE_TASK:
                    buttonE1.addEventListener('click', () => this.onMoveTask({
                        tEmployeeID: this.#tEmployeeID,
                        taskID: this.#taskID
                    }));
                    break;
                
                
                case TaskBtnTypes.DELETE_TASK:
                    buttonE1.addEventListener('click', () => this.onDeleteTask({
                        tEmployeeID: this.#tEmployeeID,
                        taskID: this.#taskID
                    }));
                    break;
                
                default:
                    break;
            }

            const imgE1 = document.createElement('img');
            imgE1.setAttribute('src', imgSrc);
            imgE1.setAttribute('alt', imgAlt);

            buttonE1.appendChild(imgE1);

            controlsE1.appendChild(buttonE1);
        });

        taskE1.appendChild(controlsE1);

        const tabsd = document.createElement('wbr');
        taskE1.appendChild(tabsd);

        const taskE2 = document.createElement('div');
        taskE2.classList.add('time_box_b');

        const timeE1 = document.createElement('time');
        const datest = new Date(this.#taskDateSt)
        const dateed = new Date(this.#taskDateEd)
        timeE1.innerHTML =`${datest.getMonth() + 1}/${datest.getDate()}/${datest.getFullYear()} - ${dateed.getMonth() + 1}/${dateed.getDate()}/${dateed.getFullYear()}`;
        taskE2.appendChild(timeE1);

        taskE1.appendChild(taskE2);
        

        document.querySelector(`li[id="${this.#tEmployeeID}"] > ul.tasklists__tasks-container`)
        .appendChild(taskE1);
    };
}