
const tmBaseUrl = 'http://localhost:7777';

async function getEmployee() {
    try {
        const employeeResponse = await fetch(`${tmBaseUrl}/api/v1/employee`);
        const employeeData = await employeeResponse.json();

        if (employeeResponse.status !== 200){
            return Promise.reject(employeeData);
        }
        return employeeData.employee;
    } catch (err) {
        return Promise.reject({
            timestamp: new Date().toISOString(),
            statusCode: 1,
            message: err.message
        });
    }
}

async function getTasks() {
    try {
        const taskResponse = await fetch(`${tmBaseUrl}/api/v1/tasks`);
        const taskData = await taskResponse.json();

        if (taskResponse.status !== 200){
            return Promise.reject(taskData);
        }
        return taskData.tasks;
    } catch (err) {
        return Promise.reject({
            timestamp: new Date().toISOString(),
            statusCode: 1,
            message: err.message
        });
    }
}

async function createEmployee({
    employeeName
}) {
    if (!employeeName){
        return Promise.reject({
            timestamp: new Date().toISOString(),
            statusCode: 1,
            message: 'TM Model error: missing param employeeName'
        });
    }

    try {
        const createEmployeeResponse = await fetch(
            `${tmBaseUrl}/api/v1/employee`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body:JSON.stringify({
                    employeeName
                })
            }
        );
        const createEmployeeData = await createEmployeeResponse.json();

        if (createEmployeeResponse.status !== 200){
            return Promise.reject(createEmployeeData);
        }
        return createEmployeeData;
    } catch (err) {
        return Promise.reject({
            timestamp: new Date().toISOString(),
            statusCode: 1,
            message: err.message
        });
    }
}

async function getEquipment() {
    try {
        const equipmentResponse = await fetch(`${tmBaseUrl}/api/v1/equipment`);
        const equipmentData = await equipmentResponse.json();

        if (equipmentResponse.status !== 200){
            return Promise.reject(equipmentData);
        }
        return equipmentData.equipment;
    } catch (err) {
        return Promise.reject({
            timestamp: new Date().toISOString(),
            statusCode: 1,
            message: err.message
        });
    }
}

async function createTask({
    tEquipmentID,
    tEmployeeID,
    taskDateSt,
    taskDateEd
}) {
    if (!tEquipmentID || !tEmployeeID || !taskDateSt || !taskDateEd){
        return Promise.reject({
            timestamp: new Date().toISOString(),
            statusCode: 1,
            message: 'TM Model error: missing param tEquipmentID / tEmployeeID /taskDateSt /taskDateEd'
        });
    }

    try {
        const createTaskResponse = await fetch(
            `${tmBaseUrl}/api/v1/tasks`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body:JSON.stringify({
                    tEquipmentID,
                    tEmployeeID,
                    taskDateSt,
                    taskDateEd
                })
            }
        );
        const createTaskData = await createTaskResponse.json();

        if (createTaskResponse.status !== 200){
            return Promise.reject(createTaskData);
        }
        return createTaskData;
    } catch (err) {
        return Promise.reject({
            timestamp: new Date().toISOString(),
            statusCode: 1,
            message: err.message
        });
    }
}

async function editEmployee({
    employeeID,
    newEmployeeName
}) {
    if (!employeeID || !newEmployeeName){
        return Promise.reject({
            timestamp: new Date().toISOString(),
            statusCode: 1,
            message: 'TM Model error: missing param employeeID / newEmployeeName'
        });
    }

    try {
        const editEmployeeResponse = await fetch(
            `${tmBaseUrl}/api/v1/employee/${employeeID}`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body:JSON.stringify({
                    employeeName: newEmployeeName
                })
            }
        );

        if (editEmployeeResponse.status !== 200){
            const editEmployeeData = await editEmployeeResponse.json();
            return Promise.reject(editEmployeeData);
        }
    } catch (err) {
        return Promise.reject({
            timestamp: new Date().toISOString(),
            statusCode: 1,
            message: err.message
        });
    }
}

async function deleteEmployee({tEmployeeID}) {
    if (!tEmployeeID){
        return Promise.reject({
            timestamp: new Date().toISOString(),
            statusCode: 1,
            message: 'TM Model error: missing param tEmployeeID'
        });
    }
    
    try {
        const deleteEmployeeResponse = await fetch(
            `${tmBaseUrl}/api/v1/employee/${tEmployeeID}`,
            {
                method: 'DELETE'
            }
        );

        if (deleteEmployeeResponse.status !== 200){
            const deleteEmployeeData = await deleteEmployeeResponse.json();
            return Promise.reject(deleteEmployeeData);
        }
    } catch (err) {
        return Promise.reject({
            timestamp: new Date().toISOString(),
            statusCode: 1,
            message: err.message
        });
    }
}

async function deleteTask({taskID}) {
    if (!taskID){
        return Promise.reject({
            timestamp: new Date().toISOString(),
            statusCode: 1,
            message: 'TM Model error: missing param taskID'
        });
    }

    try {
        const deleteTaskResponse = await fetch(
            `${tmBaseUrl}/api/v1/tasks/${taskID}`,
            {
                method: 'DELETE'
            }
        );

        if (deleteTaskResponse.status !== 200){
            const deleteTaskData = await deleteTaskResponse.json();
            return Promise.reject(deleteTaskData);
        }
    } catch (err) {
        return Promise.reject({
            timestamp: new Date().toISOString(),
            statusCode: 1,
            message: err.message
        });
    }
}

async function moveTask({
    taskID,
    destEmployeeID
}) {
    if (!taskID || !destEmployeeID){
        return Promise.reject({
            timestamp: new Date().toISOString(),
            statusCode: 1,
            message: 'TM Model error: missing param taskID / destEmployeeID'
        });
    }

    try {
        const moveTaskResponse = await fetch(
            `${tmBaseUrl}/api/v1/employee`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body:JSON.stringify({
                    taskID,
                    destEmployeeID
                })
            }
        );
        
        if (moveTaskResponse.status !== 200){
            const moveTaskData = await moveTaskResponse.json();
            return Promise.reject(moveTaskData);
        }
    } catch (err) {
        return Promise.reject({
            timestamp: new Date().toISOString(),
            statusCode: 1,
            message: err.message
        });
    }
}

export {
    getEmployee,
    createEmployee,
    getEquipment,
    createTask,
    editEmployee,
    deleteEmployee,
    deleteTask,
    moveTask,
    getTasks
};