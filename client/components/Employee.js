import Task from "./components/Task";
import {
    getEquipment,
    getTasks,
    createTask
} from "./model/TestManagerModel";
/*
import {
    createTask,
    reorderTasks as modelReorderTasks
} from "./model/TaskManagerModel";*/

import { TaskBtnTypes } from "./constants";

const TaskBtnParams = Object.freeze([
    Object.freeze({
        type: TaskBtnTypes.EDIT_EMPLOYEE,
        className: 'edit-btn',
        imgSrc: "./assets/edit.svg",
        imgAlt: "Переместить"
    }),
    Object.freeze({
        type: TaskBtnTypes.DELETE_EMPLOYEE,
        className: 'delete-btn-emp',
        imgSrc: "./assets/delete-button.svg",
        imgAlt: "Удалить"
    })
]);


export default class Employee{
    #tEmployeeID = '';
    #employeeName = '';
    #tasks = [];

    constructor({
        tEmployeeID,
        employeeName,
        onEditEmployee,
        onDeleteEmployee,
        onDeleteTask,
        onMoveTask
    }){
        this.#tEmployeeID = tEmployeeID;
        this.#employeeName = employeeName;
        this.onEditEmployee = onEditEmployee;
        this.onDeleteEmployee = onDeleteEmployee;
        this.onDeleteTask = onDeleteTask;
        this.onMoveTask = onMoveTask;
    }

    get tEmployeeID() {return this.#tEmployeeID; }

    get employeeName() {return this.#employeeName;}
    set employeeName(newemployeeName){
        if (typeof newemployeeName !== 'string') return;

        this.#employeeName = newemployeeName;
    }



    getTask({taskID}) {
        return this.#tasks.find(task => task.taskID === taskID);
    }

    deleteTask({taskID}){
        const deletedTaskIndex = this.#tasks.findIndex(task => task.taskID === taskID);
        if (deletedTaskIndex === -1) return;

        this.#tasks.splice(deletedTaskIndex, 1);
    }

    addTask({task}){
        if (!task instanceof Task) return;
        this.#tasks.push(task);
    }

    
    onAddTask = async () => {
        document.getElementById('add-task-btn' + this.#tEmployeeID).style.display = 'none'; //Удаляем кнопку

        const divaddE1 = document.createElement('div');
        divaddE1.setAttribute('id', "divadd" + this.#tEmployeeID);
        divaddE1.classList.add('tasklist__add');
        
        const lslistE1 = document.createElement('label');
        lslistE1.setAttribute('for', "options" + this.#tEmployeeID);
        lslistE1.innerHTML = "Выберите оборудование";


        const listE1 = document.createElement('select');
        listE1.setAttribute('id', "options" + this.#tEmployeeID);
        listE1.classList.add('buttonpr');


        const equipment = await getEquipment(); // id, name

        for (const eqv of equipment) {
            const optE1 = document.createElement('option');
            optE1.setAttribute('value', eqv.tEquipmentID);
            optE1.innerHTML = eqv.equipmentName;
            listE1.appendChild(optE1);
        }

        const today = new Date().toISOString().split('T')[0];

        const lsdate_beg = document.createElement('label');
        lsdate_beg.setAttribute('for', "date_beg" + this.#tEmployeeID);
        lsdate_beg.innerHTML = "Дата начала бронирования";

        const date_beg = document.createElement('input');
        date_beg.setAttribute('id', "date_beg" + this.#tEmployeeID);
        date_beg.setAttribute('type', "date");
        date_beg.setAttribute('min', today);
        date_beg.classList.add('buttonpr');

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const ttomorrow = tomorrow.toISOString().split('T')[0];

        const lsdate_end = document.createElement('label');
        lsdate_end.setAttribute('for', "date_end" + this.#tEmployeeID);
        lsdate_end.innerHTML = "Дата окончания бронирования";

        const date_end = document.createElement('input');
        date_end.setAttribute('id', "date_end" + this.#tEmployeeID);
        date_end.setAttribute('type', "date");
        date_end.setAttribute('min', ttomorrow);
        date_end.classList.add('buttonpr');

        const sendE1 = document.createElement('button');
        sendE1.setAttribute('type', 'button');
        sendE1.addEventListener('click', this.onAddTaskSend);
        sendE1.innerHTML = "Создать";
        sendE1.classList.add('buttonpr');
        
        const tabad = document.createElement('br');
        const tabada = document.createElement('br');
        const tabadab = document.createElement('br');

        divaddE1.appendChild(lslistE1);
        divaddE1.appendChild(listE1);
        divaddE1.appendChild(tabad);
        divaddE1.appendChild(lsdate_beg);
        divaddE1.appendChild(date_beg);
        divaddE1.appendChild(tabada);
        divaddE1.appendChild(lsdate_end);
        divaddE1.appendChild(date_end);
        divaddE1.appendChild(tabadab);
        divaddE1.appendChild(sendE1);
        document.getElementById(this.#tEmployeeID).appendChild(divaddE1);

        return;
        
        
        /*
        <label for="ID_ser">Выберите оборудование</label>
        <select id="ID_ser" name="ID_ser"></select>
        */

    };

    onAddTaskSend = async () => {
        const equipmentID = document.getElementById("options" + this.#tEmployeeID).value;
        if(!equipmentID){
            alert('Нет оборудования');
            return;
        }

        const date_beg = document.getElementById("date_beg" + this.#tEmployeeID).value;
        if(!date_beg){
            alert('Введите дату начала бронирования');
            return;
        }

        const date_end = document.getElementById("date_end" + this.#tEmployeeID).value;
        if(!date_end){
            alert('Введите дату окончания бронирования');
            return;
        }
        
        if(date_beg >= date_end){
            alert('Введите корректный срок бронирования');
            return;
        }

        const tasks = await getTasks(); // taskID,tEquipmentID,tEmployeeID,taskName,taskDateSt,taskDateEd
        const curtasks = tasks.find(task => task.tEquipmentID === equipmentID);

        if(curtasks){
            if(curtasks.length){
                for (const curtask of curtasks){
                    if(!(((curtask.taskDateSt > date_beg) && (curtask.taskDateSt > date_end)) 
                        || ((curtask.taskDateEd < date_beg) && (curtask.taskDateEd < date_end)))){
                        alert('Срок бронирования пересекается с другим1');
                        return;
                    };
                };
                
            } else {
                if(!(((curtasks.taskDateSt > date_beg) && (curtasks.taskDateSt > date_end))
                    || ((curtasks.taskDateEd < date_beg) && (curtasks.taskDateEd < date_end)))){
                    alert('Срок бронирования пересекается с другим2');
                    return;
                }
            };
        }

        const equipment = await getEquipment(); // id, name
        const equipName = equipment.find(equip => equip.tEquipmentID === equipmentID).equipmentName;


        try{
            const {taskID} = await createTask({
                tEquipmentID: equipmentID,
                tEmployeeID: this.#tEmployeeID,
                taskDateSt: date_beg,
                taskDateEd: date_end
            });

            const newTask = new Task({
                taskID,
                tEquipmentID: equipmentID,
                tEmployeeID: this.#tEmployeeID,
                equipmentName: equipName,
                taskDateSt: date_beg,
                taskDateEd: date_end,
                onDeleteTask: this.onDeleteTask,
                onMoveTask: this.onMoveTask
            });

            this.#tasks.push(newTask);
            newTask.render();
        } catch (err) {
            console.error(err);
        }

        document.getElementById('divadd' + this.#tEmployeeID).remove();
        document.getElementById('add-task-btn' + this.#tEmployeeID).style.display = 'initial';
    };

    render(){
        const tasklistE1 = document.createElement('li');
        tasklistE1.classList.add('tasklist');
        tasklistE1.setAttribute('id', this.#tEmployeeID);

        const controlsbempE1 = document.createElement('div');
        controlsbempE1.classList.add('tasklist_box');

        const headerE1 = document.createElement('h2');
        headerE1.classList.add('tasklists__name');
        headerE1.innerHTML = this.#employeeName;
        controlsbempE1.appendChild(headerE1);

        const controlsempE1 = document.createElement('div');
        controlsempE1.classList.add('tasklist__actions');

        TaskBtnParams.forEach(({className, imgSrc, imgAlt, type}) => {
            const buttonempE1 = document.createElement('button');
            buttonempE1.classList.add(className);

            switch(type){
                case TaskBtnTypes.EDIT_EMPLOYEE:
                    buttonempE1.addEventListener('click', () => this.onEditEmployee({
                        tEmployeeID: this.#tEmployeeID
                    }));
                    break;
                
                
                case TaskBtnTypes.DELETE_EMPLOYEE:
                    buttonempE1.addEventListener('click', () => this.onDeleteEmployee({
                        tEmployeeID: this.#tEmployeeID
                    }));
                    break;
                
                default:
                    break;
            }

            const imgE1 = document.createElement('img');
            imgE1.setAttribute('src', imgSrc);
            imgE1.setAttribute('alt', imgAlt);

            buttonempE1.appendChild(imgE1);

            controlsempE1.appendChild(buttonempE1);
        });

        controlsbempE1.appendChild(controlsempE1);

        tasklistE1.appendChild(controlsbempE1);

        const tasksE1 = document.createElement('ul');
        tasksE1.classList.add('tasklists__tasks-container');
        tasklistE1.appendChild(tasksE1);

        const buttonE1 = document.createElement('button');
        buttonE1.classList.add('tasklist__add-task-btn');
        buttonE1.setAttribute('id', 'add-task-btn'+ this.#tEmployeeID);

        const textE1 = document.createElement('span');
        textE1.classList.add('add-task-btn-text');
        textE1.innerHTML = "Добавить заявку";
        buttonE1.appendChild(textE1);
        
        buttonE1.addEventListener('click', this.onAddTask);
        tasklistE1.appendChild(buttonE1);

        const tlListE1 = document.querySelector('ul.tasklists-container');

        tlListE1.insertBefore(tasklistE1, tlListE1.children[tlListE1.children.length - 1]);
    };
}