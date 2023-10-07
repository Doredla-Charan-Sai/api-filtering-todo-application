const express = require("express");
const app = express();

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

app.use(express.json());

const path = require("path");
const dbpath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000);
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

// API 1
const hasPriority = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatus = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const hasPriorityAndStatus = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};
// scenario 1
app.get("/todos/", async (request, response) => {
  const { status, priority, search_q = "" } = request.query;
  // console.log(request.query);
  let getAPI1Query = "";
  switch (true) {
    case hasPriorityAndStatus(request.query):
      getAPI1Query = `SELECT * FROM todo WHERE todo like '%${search_q}%' AND status LIKE '${status}' AND priority LIKE '${priority}';`;
      break;
    case hasPriority(request.query):
      getAPI1Query = `SELECT * FROM todo WHERE todo like '%${search_q}%' AND priority LIKE '${priority}';`;
      break;
    case hasStatus(request.query):
      getAPI1Query = `SELECT * FROM todo WHERE todo like '%${search_q}%' AND status LIKE '${status}' ;`;
      break;
    default:
      getAPI1Query = `SELECT * FROM todo WHERE todo like '%${search_q}%';`;
      break;
  }
  const dbAPI1Response = await db.all(getAPI1Query);
  response.send(dbAPI1Response);
});

// API 2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getAPI2Query = `SELECT * FROM todo WHERE id = ${todoId};`;
  const dbAPI2Response = await db.get(getAPI2Query);
  response.send(dbAPI2Response);
});

// API 3

app.post("/todos/", async (request, response) => {
  const api3Details = request.body;
  const { id, todo, priority, status } = api3Details;
  const getAPI3Query = `INSERT INTO todo (id, todo, priority, status) VALUES (${id},"${todo}",'${priority}',"${status}");`;
  const dbAPI3Response = await db.run(getAPI3Query);
  response.send("Todo Successfully Added");
});

// API 4
const hasStatus4 = (requestBody) => {
  if (requestBody.status !== undefined) {
    return true;
  }
};
const hasPriority4 = (requestBody) => {
  if (requestBody.priority !== undefined) {
    return true;
  }
};
const hasTodo = (requestBody) => {
  if (requestBody.todo !== "") {
    return true;
  }
};

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let getAPI4Query = "";
  let api4Details = "";
  switch (true) {
    case hasStatus4(request.body):
      let { status } = request.body;
      a = `UPDATE todo SET status = '${status}' WHERE id = ${todoId};`;
      await db.run(a);
      response.send("Status Updated");
      break;
    case hasPriority4(request.body):
      let { priority } = request.body;
      b = `UPDATE todo SET priority = '${priority}' WHERE id = ${todoId};`;
      await db.run(b);
      response.send("Priority Updated");
      break;
    case hasTodo(request.body):
      let { todo } = request.body;
      c = `UPDATE todo SET todo = '${todo}' WHERE id = ${todoId};`;
      await db.run(c);
      response.send("Todo Updated");
      break;
    default:
      break;
  }
});

// API 5

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getAPI5Query = `DELETE FROM todo WHERE id = ${todoId};`;
  await db.run(getAPI5Query);
  response.send("Todo Deleted");
});

module.exports = app;
