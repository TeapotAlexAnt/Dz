import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';
import DBAdapter, { DB_ERROR_TYPE_CLIENT } from './adapters/DBAdapter.js';

dotenv.config({
    path: './server/.env'
});

const {
    TM_APP_HOST,
    TM_APP_PORT,
    TM_DB_HOST,
    TM_DB_PORT,
    TM_DB_NAME,
    TM_DB_USER_LOGIN,
    TM_DB_USER_PASSWORD,
    TM_APP_DEV_FRONT_ORIGIN
} = process.env;

const serverApp = express();
const dbAdapter = new DBAdapter({
    dbHost: TM_DB_HOST,
    dbPort: TM_DB_PORT,
    dbName: TM_DB_NAME,
    dbUserLogin: TM_DB_USER_LOGIN,
    dbUserPassword: TM_DB_USER_PASSWORD
});

//middleware - логирование запросов
serverApp.use((req, res, next) => {
    console.log(
        new Date().toISOString(),
        req.method,
        req.originalUrl
    );

    next();
});

//middlewares - cors
serverApp.use(cors({
    origin: TM_APP_DEV_FRONT_ORIGIN,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));

//middlewares - json parse
serverApp.use('/api/v1/employee', express.json());
serverApp.use('/api/v1/employee/:employeeID', express.json());
serverApp.use('/api/v1/equipment', express.json());
serverApp.use('/api/v1/tasks', express.json());
serverApp.use('/api/v1/tasks/:taskID', express.json());

//middleware для раздачи статики
serverApp.use('/', express.static('./dist'));

serverApp.get('/api/v1/employee', async (req, res) => {
    try{
        const [dbEmployee, dbTasks] = await Promise.all([
            dbAdapter.getEmployee(),
            dbAdapter.getTasks()
        ]);

        const tasks = dbTasks.map(
            ({id, equp_id, emp_id, name, date_st, date_ed}) => ({
                taskID: id,
                tEquipmentID: equp_id,
                tEmployeeID: emp_id,
                taskName: name,
                taskDateSt: date_st,
                taskDateEd: date_ed
            })
        );
        

        const employee = dbEmployee.map(
            ({id, name}) => ({
                employeeID: id,
                employeeName: name,
                tasks: tasks.filter(task => task.tEmployeeID === id)
            })
        );
        //console.log(employee);

        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.json({employee});
    } catch (err) {
        res.statusCode = 500;
        res.statusMessage = 'Internal server error';
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: 500,
            message: `get tasklists error: ${err.error.message || err.error}`
        });
    }
});

serverApp.get('/api/v1/employee', async (req, res) => {
    try{
        const [dbEmployee, dbTasks] = await Promise.all([
            dbAdapter.getEmployee(),
            dbAdapter.getTasks()
        ]);

        const tasks = dbTasks.map(
            ({id, equp_id, emp_id, name, date_st, date_ed}) => ({
                taskID: id,
                tEquipmentID: equp_id,
                tEmployeeID: emp_id,
                taskName: name,
                taskDateSt: date_st,
                taskDateEd: date_ed
            })
        );
        

        const employee = dbEmployee.map(
            ({id, name}) => ({
                employeeID: id,
                employeeName: name,
                tasks: tasks.filter(task => task.tEmployeeID === id)
            })
        );
        //console.log(employee);

        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.json({employee});
    } catch (err) {
        res.statusCode = 500;
        res.statusMessage = 'Internal server error';
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: 500,
            message: `get tasklists error: ${err.error.message || err.error}`
        });
    }
});

serverApp.post('/api/v1/employee', async (req, res) => {
    try{
        const {
            employeeName
        } = req.body;

        const employeeID = crypto.randomUUID();

        await dbAdapter.addEmployee({
            employeeID,
            name: employeeName
        });

        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.json({employeeID});
    } catch (err) {
        switch (err.type) {
            case DB_ERROR_TYPE_CLIENT:
                res.statusCode = 400;
                res.statusMessage = 'Bad request';
                break;
            default:
                res.statusCode = 500;
                res.statusMessage = 'Internal server error';
        }
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `add tasklists error: ${err.error.message || err.error}`
        });

    }
});

serverApp.get('/api/v1/equipment', async (req, res) => {
    try{
        const [dbEquipment] = await Promise.all([
            dbAdapter.getEquipment()
        ]);

        const equipment = dbEquipment.map(
            ({id, name}) => ({
                tEquipmentID: id,
                equipmentName: name
            })
        );

        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.json({equipment});
    } catch (err) {
        res.statusCode = 500;
        res.statusMessage = 'Internal server error';
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: 500,
            message: `get tasklists error: ${err.error.message || err.error}`
        });
    }
});

serverApp.get('/api/v1/tasks', async (req, res) => {
    try{
        const [dbTasks] = await Promise.all([dbAdapter.getTasks()]);

        const tasks = dbTasks.map(
            ({id, equp_id, emp_id, name, date_st, date_ed}) => ({
                taskID: id,
                tEquipmentID: equp_id,
                tEmployeeID: emp_id,
                taskName: name,
                taskDateSt: date_st,
                taskDateEd: date_ed
            })
        );

        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.json({tasks});
    } catch (err) {
        res.statusCode = 500;
        res.statusMessage = 'Internal server error';
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: 500,
            message: `get tasklists error: ${err.error.message || err.error}`
        });
    }
});

serverApp.post('/api/v1/tasks', async (req, res) => {
    try{
        const {
            tEquipmentID,
            tEmployeeID,
            taskDateSt,
            taskDateEd
        } = req.body;

        const taskID = crypto.randomUUID();

        await dbAdapter.addTask({
            taskID,
            date_str: taskDateSt,
            date_end: taskDateEd,
            equipmentID: tEquipmentID,
            employeeID: tEmployeeID
        });

        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.json({taskID});
    } catch (err) {
        switch (err.type) {
            case DB_ERROR_TYPE_CLIENT:
                res.statusCode = 400;
                res.statusMessage = 'Bad request';
                break;
            default:
                res.statusCode = 500;
                res.statusMessage = 'Internal server error';
        }
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `add task error: ${err.error.message || err.error}`
        });
    }
});

serverApp.patch('/api/v1/employee/:employeeID', async (req, res) => {
    try{
        const {
            employeeName
        } = req.body;

        const {employeeID} = req.params;

        await dbAdapter.updateEmployee({
            employeeID,
            name: employeeName
        });

        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.send();
    } catch (err) {
        switch (err.type) {
            case DB_ERROR_TYPE_CLIENT:
                res.statusCode = 400;
                res.statusMessage = 'Bad request';
                break;
            default:
                res.statusCode = 500;
                res.statusMessage = 'Internal server error';
        }
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `update task error: ${err.error.message || err.error}`
        });
    }
});

serverApp.delete('/api/v1/employee/:employeeID', async (req, res) => {
    try{
        const {employeeID} = req.params;

        await dbAdapter.deleteEmployee({employeeID});

        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.send();
    } catch (err) {
        switch (err.type) {
            case DB_ERROR_TYPE_CLIENT:
                res.statusCode = 400;
                res.statusMessage = 'Bad request';
                break;
            default:
                res.statusCode = 500;
                res.statusMessage = 'Internal server error';
        }
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `delete task error: ${err.error.message || err.error}`
        });
    }
});

serverApp.delete('/api/v1/tasks/:taskID', async (req, res) => {
    try{
        const {taskID} = req.params;

        await dbAdapter.deleteTask({taskID});

        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.send();
    } catch (err) {
        switch (err.type) {
            case DB_ERROR_TYPE_CLIENT:
                res.statusCode = 400;
                res.statusMessage = 'Bad request';
                break;
            default:
                res.statusCode = 500;
                res.statusMessage = 'Internal server error';
        }
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `delete task error: ${err.error.message || err.error}`
        });

    }
});

serverApp.patch('/api/v1/employee', async (req, res) => {
    try{
        const {
            taskID,
            destEmployeeID
        } = req.body;

        await dbAdapter.moveTask({
            taskID,
            destEmployeeID
        });

        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.send();
    } catch (err) {
        switch (err.type) {
            case DB_ERROR_TYPE_CLIENT:
                res.statusCode = 400;
                res.statusMessage = 'Bad request';
                break;
            default:
                res.statusCode = 500;
                res.statusMessage = 'Internal server error';
        }
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `move task error: ${err.error.message || err.error}`
        });
    }
});

serverApp.listen(Number(TM_APP_PORT), TM_APP_HOST, async () => {
    try{
        await dbAdapter.connect();
    } catch (err) {
        console.log('Task Manager app is shutting down');
        process.exit(100);
    }

    console.log(`TM App Server started(${TM_APP_HOST}:${TM_APP_PORT})`);
});

process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP and DB servers');
    serverApp.close(async()=>{
        await dbAdapter.disconnect();
        console.log('HTTP and DB servers closed');
    });
});
