# Interactive-To-Do-List-with-LocalStorage

How Data Is Saved and Loaded:
All tasks are stored in a single JavaScript array (tasks) where each item is an object of the form { id, text, done }. Whenever a task is added, toggled, deleted, or cleared, the save() function serializes the tasks array into a JSON string using JSON.stringify(tasks) and writes it to localStorage under the "tasks" key inside a try / catch block. When the page first opens or reloads, load() reads localStorage.getItem("tasks"), parses the JSON string back into an array with JSON.parse() inside a try / catch block, and validates each task object—falling back to an empty array ([]) for first-time visitors or if stored data is missing or corrupted—before calling render() to build the DOM list.
