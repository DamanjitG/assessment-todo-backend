export default (db) => {
    const { TODO_COLLECTION } = process.env;
    const collection = db.collection(TODO_COLLECTION);

    async function insertOne(todo) {
        return await collection.insertOne(todo);
    }

    async function findOne(todoID) {
        return await collection.findOne({ todoID: todoID })
    }

    async function findAll(userID) {
        return await collection.find({ userID: userID }).sort({ created: 1 }).toArray() // sort by creation date
    }

    async function updateOne(todoID, updates) {
        // assumes "updates" are in the form {field: new value}
        return await collection.updateOne({ todoID: todoID }, {$set:updates})
    }

    return {
        insertOne,
        findOne,
        findAll,
        updateOne
    };
};