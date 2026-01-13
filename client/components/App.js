import { TaskBtnTypes } from './constants';
import Employee from './components/Employee';
import Task from './components/Task';
import{
    getEmployee,
    createEmployee,
    editEmployee,
    deleteEmployee,
    deleteTask,
    moveTask
} from './model/TestManagerModel';

export default class App{
    #employee = [];
    
    onEditEmployee = async ({ tEmployeeID }) => {
        const employee = this.#employee.find(
            employee => employee.tEmployeeID === tEmployeeID
        );
        if (!employee)  {
            console.error(`Остутствует список задач с ID = ${tEmployeeID}`);
            return;
        }

        const updatedEmployeeName = prompt('Введите замену сотрудника', employee.employeeName);
        if (!updatedEmployeeName || updatedEmployeeName === employee.employeeName) return;

        try {
            await editEmployee({
                employeeID: tEmployeeID,
                newEmployeeName: updatedEmployeeName
            });

            employee.employeeName = updatedEmployeeName;
            document.querySelector(`li[id="${tEmployeeID}"] > div.tasklist_box > h2.tasklists__name`)
                .innerHTML = updatedEmployeeName;
        } catch(err) {
            console.error(err);
        }
    };
    


    onDeleteTask = async ({ tEmployeeID, taskID }) => {
        const employ = this.#employee.find(
            employ => employ.tEmployeeID === tEmployeeID
        );
        if(!employ) {
            console.error(`Отсутствует список задач с ID = ${tEmployeeID}`);
            return;
        }

        const task = employ.getTask({ taskID });
        if (!task) {
            console.error(`В списке задач (ID: ${tEmployeeID}) отсутствует задача с ID = ${taskID}`);
            return;
        }

        const taskIsDeleted = confirm(`Тестирование оборудования '${task.equipmentName}' будет удалено. Продолжить?`);
        if (!taskIsDeleted) return;

        try {
            await deleteTask({ taskID });

            employ.deleteTask({ taskID });
            document.querySelector(`li[id="${taskID}"]`).remove();

        } catch(err) {
            console.error(err);
        }
    };

    onDeleteEmployee = async ({tEmployeeID}) => {
        const employ = this.#employee.find(
            employ => employ.tEmployeeID === tEmployeeID
        );
        if(!employ) {
            console.error(`Отсутствует сотрудник с ID = ${tEmployeeID}`);
            return;
        }

        const employeeIsDeleted = confirm(`Сотрудник '${employ.employeeName}' будет удалён. Продолжить?`);
        if (!employeeIsDeleted) return;

        try {
            await deleteEmployee({ tEmployeeID });

            document.querySelector(`li[id="${ tEmployeeID }"]`).remove();

        } catch(err) {
            console.error(err);
        }
    };

    

    onMoveTask = async  ({ tEmployeeID, taskID }) => {
        const srcEmployee = this.#employee.find(
            employ => employ.tEmployeeID === tEmployeeID
        );
        if(!srcEmployee) {
            console.error(`Отсутствует список задач с ID = ${tEmployeeID}`);
            return;
        }

        const movingTask = srcEmployee.getTask({ taskID });
        if (!movingTask) {
            console.error(`В списке задач (ID: ${tEmployeeID}) отсутствует задача с ID = ${taskID}`);
            return;
        };


        const destEmployeeName = prompt('Введите имя сотрудника, которому отправится задача');
        const destEmployee = this.#employee.find(
            employ => employ.employeeName === destEmployeeName
        );

        if(!destEmployee){
            alert("Работника с таким ФИО не найдено");
            return;
        };

        const srcEmployeeIndex = this.#employee.findIndex(
            employ => employ.tEmployeeID === tEmployeeID
        );

        const destEmployeeIndex = this.#employee.findIndex(
            employ => employ.tEmployeeID === destEmployee.tEmployeeID
        );
        
        try {
            await moveTask({
                taskID,
                destEmployeeID:  destEmployee.tEmployeeID
            });

            this.#employee[srcEmployeeIndex].deleteTask({ taskID });
            movingTask.tEmployeeID = this.#employee[destEmployeeIndex].tEmployeeID;
            this.#employee[destEmployeeIndex].addTask({ task: movingTask});

            const movingTaskEl = document.querySelector(`li[id="${taskID}"]`);
            document.querySelector(`li[id="${movingTask.tEmployeeID}"] > ul.tasklists__tasks-container`)
                .appendChild(movingTaskEl);
            
        } catch(err) {
            console.error(err);
        }
    };
    



    onKeydownEscape = (event) => {
        if (event.key !== 'Escape') return;

        const input = document.getElementById('add-tasklists-input');
        input.style.display = 'none';
        input.value = '';

        document.getElementById('add-tasklists-btn').style.display = 'initial';
    };

    onKeydownEnter = async (event) => {
        if (event.key !== 'Enter') return;

        const input = document.getElementById('add-tasklists-input');
        if (input.value !== '') {
            try{
                const { employeeID } = await createEmployee({
                    employeeName: input.value
                });

                const newEmployee = new Employee({
                    tEmployeeID: employeeID,
                    employeeName: input.value,
                    onEditEmployee: this.onEditEmployee,
                    onDeleteEmployee: this.onDeleteEmployee,
                    onDeleteTask: this.onDeleteTask,
                    onMoveTask: this.onMoveTask
                });

                this.#employee.push(newEmployee);
                newEmployee.render();

                input.value  = '';
            } catch(err) {
                console.error(err);
            }
        }

        input.style.display = 'none';

        document.getElementById('add-tasklists-btn').style.display = 'initial';
    }

    async init() {
        document.getElementById('add-tasklists-btn')
            .addEventListener('click', (event) => {
                event.target.style.display = 'none';

                const input = document.getElementById('add-tasklists-input');
                input.style.display = 'initial';
                input.focus();
            });
        
        document.addEventListener('keydown', this.onKeydownEscape);
        document.addEventListener('keydown', this.onKeydownEnter);

        try {
            const employee = await getEmployee();

            for (const employ of employee) {
                const employObj = new Employee({
                    tEmployeeID: employ.employeeID,
                    employeeName: employ.employeeName,
                    onEditEmployee: this.onEditEmployee,
                    onDeleteEmployee: this.onDeleteEmployee,
                    onDeleteTask: this.onDeleteTask,
                    onMoveTask: this.onMoveTask
                });

                //console.log(employObj);

                this.#employee.push(employObj);
                employObj.render();
                
                for (const task of employ.tasks) {
                    const taskObj = new Task({
                        taskID: task.taskID,
                        tEquipmentID: task.tEquipmentID,
                        tEmployeeID: task.tEmployeeID,
                        equipmentName: task.taskName,
                        taskDateSt: task.taskDateSt,
                        taskDateEd: task.taskDateEd,
                        onDeleteTask: this.onDeleteTask,
                        onMoveTask: this.onMoveTask
                    });

                    employObj.addTask({ task: taskObj });
                    taskObj.render();
                }
            }
        } catch(err) {
            console.error(err);
        }
    }
}