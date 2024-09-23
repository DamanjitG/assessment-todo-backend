import express from 'express';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import { v4 as uuidv4 } from 'uuid';
import { validateTodo, validateUser } from '../schemas/validators.js';
import auth from '../middleware/auth.js';
import { verifyToken } from '../functions/cookies.js';


dayjs.extend(utc);
const router = express.Router();

export default ({todoRepository}) => {
    // Create new todo
    router.post('/', auth, async (req, res) => {
        try {
            let session = verifyToken(req.cookies['todox-session']);

            const todoID = uuidv4();
            const created = dayjs().utc().toISOString();

            let newTodo = {
                ...req.body,
                todoID,
                userID: session.userID,
                created,
                done: false
            };

            if (validateTodo(newTodo)) {
                let resultTodo = await todoRepository.insertOne(newTodo);
                return res.status(201).send(resultTodo);
            }
            console.error(validateTodo.errors);
            return res.status(400).send({error: "Invalid field used."});
        }
        catch (err) {
            console.error(err);
            return res.status(500).send({error: "Todo creation failed."});
        }
    });

    // get todo via ID
    router.get('/:id', auth, async (req, res) => {
        try {
            let session = verifyToken(req.cookies['todox-session']);
            const id = req.params.id;
            const queriedTodo = await todoRepository.findOne(id);

            // return todo if it exists
            // we don't need to check if the user is correct because if the user doesn't own the todo, backend will return 403 error
            if (queriedTodo) {
                return res.status(200).send(queriedTodo);
            } else {
                return res.status(404).send({error: `Todo not found`});
            }
        } catch (err) {
            console.error(err);
            return res.status(500).send({error: `GETting todo ${id} failed`});
        }
    })

    // change a todo
    router.patch('/:id', auth, async (req, res) => {
        try {
            let session = verifyToken(req.cookies['todox-session']);
            const id = req.params.id;
        
            // check that todo exists
            // we don't need to check if the user is correct because if the user doesn't own the todo, backend will return 403 error
            const todo = await todoRepository.findOne(id);
            if (!todo) {
                return res.status(404).send({ error: 'Unable to update todo, todo not found'})
            }
        
            const updatedTodo = await todoRepository.updateOne(id, req.body);
        
            return res.status(200).send(updatedTodo);
          } catch (err) {
            console.error(err);
            return res.status(500).send({ error: 'Updating todo failed' });
          }
    })

    // get all of user's todos
    router.get('/', auth, async (req, res) => {
        try {
            let session = verifyToken(req.cookies['todox-session']);
            const todos = await todoRepository.findAll(session.userID)
            return res.status(200).send(todos)
        } catch (err) {
            console.error(err);
            return res.status(500).send({error: "Getting all todos failed"})
        }
    })

    return router;
}
