import { useEffect, useState } from "react";
import axios from "axios";
import { type TodoItem } from "./types";
import dayjs from "dayjs";

function App() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [mode, setMode] = useState<"ADD" | "EDIT">("ADD");
  const [curTodoId, setCurTodoId] = useState("");
  

  async function fetchData() {
    const res = await axios.get<TodoItem[]>("api/todo");
    setTodos(res.data);
  }

  useEffect(() => {
    fetchData();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputText(e.target.value);
  }

  function handleSubmit() {
    if (!inputText) return;
    if (mode === "ADD") {
      axios
        .request({
          url: "/api/todo",
          method: "put",
          data: { todoText: inputText },
        })
        .then(() => {
          setInputText("");
        })
        .then(fetchData)
        .catch((err) => alert(err));
    } else {
      axios
        .request({
          url: "/api/todo",
          method: "patch",
          data: { id: curTodoId, todoText: inputText },
        })
        .then(() => {
          setInputText("");
          setMode("ADD");
          setCurTodoId("");
        })
        .then(fetchData)
        .catch((err) => alert(err));
    }
  }

  function handleDelete(id: string) {
    axios
      .delete("/api/todo", { data: { id } })
      .then(fetchData)
      .then(() => {
        setMode("ADD");
        setInputText("");
      })
      .catch((err) => alert(err));
  }

  function handleClear(){
    axios
      .post("/api/todo/all")
      .then(fetchData)
      .then(() => {
        setMode("ADD");
        setInputText("");
      })
      .catch((err) => alert(err));
  }

  function handleCancel() {
    setMode("ADD");
    setInputText("");
    setCurTodoId("");
  }

  function toggleCheckbox(id: string) {
    setTodos(todos.map(todo => todo.id === id ? { ...todo, isChecked: !todo.isChecked } : todo));
  }
  

  return (
    <div className="bg-blue-200 max-w-4xl mx-auto min-h-screen my-5 rounded-md flex flex-col items-center">
      <div className="bg-blue-100 max-w-3xl w-full min-h-screen my-8 rounded-md p-5">
         {/* Todo text */}
      <header>
        <h1 className="text-3xl font-bold flex  my-4">Todo List</h1>
      </header>
      {/* Adding Todo */}
      <main className="flex-grow">
        {/* Insert */}
        <div style={{ display: "flex", alignItems: "start" }} className="flex justify-center gap-2 my-2">
          <input
            type="text"
            onChange={handleChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubmit();
              }
            }}
            value={inputText}
            data-cy="input-text"
            className="my-auto appearance-none block w-full bg-white text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-white"
          />
          <button
            className="uppercase text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 text-center my-auto "
            onClick={handleSubmit}
            data-cy="submit"
          >
            {mode === "ADD" ? "Submit" : "Update"}
          </button>
          {mode === "EDIT" && (
            <button onClick={handleCancel} className="secondary uppercase text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-full text-sm px-5 py-2.5 text-center my-auto ">
              Cancel
            </button>
          )}
        </div>
        {/* Display */}
        <div data-cy="todo-item-wrapper">
          {todos.sort(compareDate).map((item) => {
            const { date, time } = formatDateTime(item.createdAt);
            const text = item.todoText;
            return (
              <article
              key={item.id}
              className={`flex mt-2 border-white border-b-2 p-3 text-xl gap-x-4 ${item.isChecked ? 'text-gray-300' : ''}`}>
      <input
        id="bordered-checkbox-1"
        type="checkbox"
        value=""
        name="bordered-checkbox"
        className="size-6 text-blue-600 my-auto bg-gray-100 border-gray-300 rounded focus:ring-blue-500  focus:ring-2 "
        onChange={()=>toggleCheckbox(item.id)}
      />
      <div>📅 {date}</div>
      <div>⏰ {time}</div>
      <div data-cy="todo-item-text">📰 {text}</div>
      <div className="flex ml-auto gap-x-3">
        <div
          style={{ cursor: "pointer" }}
          onClick={() => {
            setMode("EDIT");
            setCurTodoId(item.id);
            setInputText(item.todoText);
          }}
          data-cy="todo-item-update"
        >
          {curTodoId !== item.id ? "🖊️" : "✍🏻"}
        </div>

        {mode === "ADD" && (
          <div
            style={{ cursor: "pointer" }}
            onClick={() => handleDelete(item.id)}
            data-cy="todo-item-delete"
          >
            🗑️
          </div>
        )}
      </div>
    </article>
            );
          })}
        </div>
      </main>
      <button 
      onClick={handleClear} 
      className="mx-auto mt-5 uppercase text-white bg-blue-200 hover:bg-stone-300 focus:outline-none focus:ring-4 focus:ring-stone-100 font-medium  text-sm w-full py-2.5 text-center flex justify-center">
        Clear
      </button>

      </div>
    </div>


  );
}

export default App;

function formatDateTime(dateStr: string) {
  if (!dayjs(dateStr).isValid()) {
    return { date: "N/A", time: "N/A" };
  }
  const dt = dayjs(dateStr);
  const date = dt.format("D/MM/YY");
  const time = dt.format("HH:mm");
  return { date, time };
}

function compareDate(a: TodoItem, b: TodoItem) {
  const da = dayjs(a.createdAt);
  const db = dayjs(b.createdAt);
  return da.isBefore(db) ? -1 : 1;
}