import pg from 'pg'

const DB_ERROR_TYPE_CLIENT = 'DB_ERROR_TYPE_CLIENT';
const DB_ERROR_TYPE_INTERNAL = 'DB_ERROR_TYPE_INTERNAL';

export{
    DB_ERROR_TYPE_CLIENT,
    DB_ERROR_TYPE_INTERNAL
};

export default class DBAdapter {
    #dbHost = '';
    #dbPost = -1;
    #dbName = '';
    #dbUserLogin = '';
    #dbUserPassword = '';
    #dbClient = null;

    constructor({
        dbHost,
        dbPost,
        dbName,
        dbUserLogin,
        dbUserPassword
    }){
        this.#dbHost = dbHost;
        this.#dbPost = dbPost;
        this.#dbName = dbName;
        this.#dbUserLogin = dbUserLogin;
        this.#dbUserPassword = dbUserPassword;

        this.#dbClient = new pg.Client({
            host: this.#dbHost,
            port: this.#dbPost,
            database: this.#dbName,
            user: this.#dbUserLogin,
            password: this.#dbUserPassword
        });
    }

    async connect(){
        try{
            await this.#dbClient.connect();
            console.log('db connection established');
        } catch (err){
            console.error(`unable to connect to bd: ${err}`);
            return Promise.reject(err);
        }
    }

    async disconnect(){
        await this.#dbClient.end();
        console.log('db connection closed');
    }

    async getEmployee() {
        try{
            const employeeData = await this.#dbClient.query(
                `select * from employee order by name asc;`
            );

            return employeeData.rows;
        } catch(err) {
            console.error(`DB Error: unable get employee (${err})`);
            return Promise.reject({
                type: DB_ERROR_TYPE_INTERNAL,
                error: err
            });
        }
    }

    async getEquipment() {
        try{
            const equipmentData = await this.#dbClient.query(
                `select * from equipment;`
            );

            return equipmentData.rows;
        } catch(err) {
            console.error(`DB Error: unable get equipment (${err})`);
            return Promise.reject({
                type: DB_ERROR_TYPE_INTERNAL,
                error: err
            });
        }
    }

    async getTasks() {
        try{
            const tasksData = await this.#dbClient.query(
                `select test_tasks.id, equp_id, emp_id, name, date_st, date_ed from test_tasks join equipment on test_tasks.equp_id = equipment.id order by date_st asc;`
            );

            return tasksData.rows;
        } catch(err) {
            console.error(`DB Error: unable get tasks (${err})`);
            return Promise.reject({
                type: DB_ERROR_TYPE_INTERNAL,
                error: err
            });
        }
    }

    async addEmployee({employeeID, name}){
        if (!employeeID || !name){
            const errMsg = `DB Error: wrong parameters for adding employee (id: ${employeeID}, name: ${name})`;
            console.error(errMsg);

            return Promise.reject({
                type: DB_ERROR_TYPE_CLIENT,
                error: new Error(errMsg)
            });
        }
        
        try{
            await this.#dbClient.query(
                `insert into employee (id,name) values($1, $2);`,
                [employeeID, name]
            );
        } catch (err) {
            console.error(`DB Error: unable get employee (${err})`);
            return Promise.reject({
                type: DB_ERROR_TYPE_INTERNAL,
                error: err
            });
        }
    }

    async addTask({taskID, date_str, date_end, equipmentID, employeeID}){
        if (!taskID || !date_str || !date_end || !equipmentID || !employeeID){
            const errMsg = `DB Error: wrong parameters for adding task (id: ${taskID}, date_st: ${date_str}, date_ed: ${date_end}, equp_id: ${equipmentID}, emp_id: ${employeeID})`;
            console.error(errMsg);

            return Promise.reject({
                type: DB_ERROR_TYPE_CLIENT,
                error: new Error(errMsg)
            });
        }
        
        try{
            await this.#dbClient.query(
                'insert into test_tasks (id, date_st, date_ed, equp_id, emp_id) values($1, $2, $3, $4, $5);',
                [taskID, date_str, date_end, equipmentID, employeeID]
            );

        } catch (err) {
            console.error(`DB Error: unable add task (${err})`);
            return Promise.reject({
                type: DB_ERROR_TYPE_INTERNAL,
                error: err
            });
        }
    }

    async updateEmployee({employeeID, name}){
        if (!employeeID || !name){
            const errMsg = `DB Error: wrong parameters for updating employee (id: ${employeeID}, name: ${name})`;
            console.error(errMsg);

            return Promise.reject({
                type: DB_ERROR_TYPE_CLIENT,
                error: new Error(errMsg)
            });
        }
        
        try{
            await this.#dbClient.query(
                `update employee set name = $1 where id = $2;`,
                [name, employeeID]
            );

        } catch (err) {
            console.error(`DB Error: unable update employee (${err})`);
            return Promise.reject({
                type: DB_ERROR_TYPE_INTERNAL,
                error: err
            });
        }
    }
    
    async deleteTask({taskID}){
        if (!taskID){
            const errMsg = `DB Error: wrong parameters for deleting task (id: ${taskID})`;
            console.error(errMsg);

            return Promise.reject({
                type: DB_ERROR_TYPE_CLIENT,
                error: new Error(errMsg)
            });
        }
        
        try{
            await this.#dbClient.query(`delete from test_tasks where id = $1;`, [taskID]);

        } catch (err) {
            console.error(`DB Error: unable update task (${err})`);
            return Promise.reject({
                type: DB_ERROR_TYPE_INTERNAL,
                error: err
            });
        }
    }

    async deleteEmployee({employeeID}){
        if (!employeeID){
            const errMsg = `DB Error: wrong parameters for deleting employee (id: ${employeeID})`;
            console.error(errMsg);

            return Promise.reject({
                type: DB_ERROR_TYPE_CLIENT,
                error: new Error(errMsg)
            });
        }

        try{
            await this.#dbClient.query(`delete from test_tasks where emp_id = $1;`, [employeeID]);
            await this.#dbClient.query(`delete from employee where id = $1;`, [employeeID]);

        } catch (err) {
            console.error(`DB Error: unable update task (${err})`);
            return Promise.reject({
                type: DB_ERROR_TYPE_INTERNAL,
                error: err
            });
        }
    }

    async moveTask({taskID, destEmployeeID}){
        if (!taskID || !destEmployeeID){
            const errMsg = `DB Error: wrong parameters for moving task (id: ${taskID}, dest_tasklist_id: ${destEmployeeID})`;
            console.error(errMsg);

            return Promise.reject({
                type: DB_ERROR_TYPE_CLIENT,
                error: new Error(errMsg)
            });
        }
        
        try{
            await this.#dbClient.query(`update test_tasks set emp_id = $1 where id = $2;`,
                [destEmployeeID, taskID]
            );

        } catch (err) {
            console.error(`DB Error: unable move task (${err})`);
            return Promise.reject({
                type: DB_ERROR_TYPE_INTERNAL,
                error: err
            });
        }
    }
}