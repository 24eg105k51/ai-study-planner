import { useEffect, useState } from "react";
import "./App.css";

const starterTasks = [
  { id: 1, title: "Review Java fundamentals", done: false },
  { id: 2, title: "Practice React components", done: false },
  { id: 3, title: "Revise database concepts", done: true },
];

function readStoredValue(key, fallback) {
  try {
    const savedValue = localStorage.getItem(key);
    return savedValue ? JSON.parse(savedValue) : fallback;
  } catch (error) {
    console.error(`Unable to read ${key} from local storage.`, error);
    return fallback;
  }
}

function App() {
  const [activeSection, setActiveSection] = useState(() =>
    window.location.hash.slice(1) || "dashboard",
  );
  const [tasks, setTasks] = useState(() =>
    readStoredValue("studymate-tasks", starterTasks),
  );
  const [studentName, setStudentName] = useState(() =>
    readStoredValue("studymate-name", "Student"),
  );
  const [newTask, setNewTask] = useState("");
  const [taskFilter, setTaskFilter] = useState("all");
  const [taskMessage, setTaskMessage] = useState("");

  useEffect(() => {
    function syncActiveSection() {
      setActiveSection(window.location.hash.slice(1) || "dashboard");
    }

    window.addEventListener("hashchange", syncActiveSection);
    return () => window.removeEventListener("hashchange", syncActiveSection);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("studymate-tasks", JSON.stringify(tasks));
    } catch (error) {
      console.error("Unable to save study tasks to local storage.", error);
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem("studymate-name", JSON.stringify(studentName));
    } catch (error) {
      console.error("Unable to save your name to local storage.", error);
    }
  }, [studentName]);

  function addTask(event) {
    event.preventDefault();
    const title = newTask.trim();
    if (!title) {
      setTaskMessage("Enter a task before adding it.");
      return;
    }

    setTasks((currentTasks) => [
      ...currentTasks,
      { id: `${Date.now()}-${Math.random()}`, title, done: false },
    ]);
    setNewTask("");
    setTaskMessage("");
  }

  function toggleTask(id) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task,
      ),
    );
  }

  function deleteTask(id) {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== id));
  }

  const completed = tasks.filter((task) => task.done).length;
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  const visibleTasks = tasks.filter((task) => {
    if (taskFilter === "active") return !task.done;
    if (taskFilter === "completed") return task.done;
    return true;
  });

  return (
    <div className="app">
      <aside className="sidebar">
        <a className="brand" href="#dashboard" aria-label="StudyMate dashboard">
          Study<span>Mate</span>
        </a>
        <p className="menu-label">WORKSPACE</p>
        <nav aria-label="Main navigation">
          {[
            ["dashboard", "▦", "Dashboard"],
            ["study-plan", "▤", "My Study Plan"],
            ["tasks", "✓", "Tasks"],
            ["assistant", "✦", "AI Assistant"],
            ["settings", "⚙", "Settings"],
          ].map(([section, icon, label]) => (
            <a
              className={activeSection === section ? "nav-item active" : "nav-item"}
              href={`#${section}`}
              key={section}
            >
              {icon} <span>{label}</span>
            </a>
          ))}
        </nav>
        <div className="sidebar-note">
          <strong>Keep going!</strong>
          <p>Small steps every day lead to big results.</p>
        </div>
      </aside>

      <main className="main" id="dashboard">
        <header className="topbar">
          <div>
            <p className="eyebrow">YOUR PERSONAL LEARNING SPACE</p>
            <h1>Study Dashboard</h1>
          </div>
          <a className="avatar" href="#settings" aria-label="Open settings">
            {studentName.trim().charAt(0).toUpperCase() || "S"}
          </a>
        </header>

        <section className="welcome">
          <div>
            <p className="eyebrow">YOUR JOURNEY STARTS HERE</p>
            <h2>Learn smarter, not harder. ✨</h2>
            <p>Plan your time, track your progress, and reach your goals.</p>
          </div>
          <div className="welcome-icon" aria-hidden="true">📚</div>
        </section>

        <section className="stats" aria-label="Task progress">
          <article className="stat-card">
            <span aria-hidden="true">📋</span>
            <p>Total tasks</p>
            <h2>{tasks.length}</h2>
          </article>
          <article className="stat-card">
            <span aria-hidden="true">✅</span>
            <p>Completed</p>
            <h2>{completed}</h2>
          </article>
          <article className="stat-card">
            <span aria-hidden="true">🎯</span>
            <p>Progress</p>
            <h2>{progress}%</h2>
          </article>
        </section>

        <section className="task-panel" id="tasks">
          <div className="panel-heading">
            <div>
              <h2>Today's study tasks</h2>
              <p>Build consistency, one task at a time.</p>
            </div>
            <span className="task-count">{completed}/{tasks.length} done</span>
          </div>

          <div
            className="progress-track"
            role="progressbar"
            aria-label="Study tasks completed"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow={progress}
          >
            <span style={{ width: `${progress}%` }} />
          </div>

          <form className="add-task" onSubmit={addTask}>
            <input
              value={newTask}
              onChange={(event) => {
                setNewTask(event.target.value);
                if (taskMessage) setTaskMessage("");
              }}
              placeholder="Add a study task..."
              aria-label="New study task"
              maxLength={120}
            />
            <button type="submit">+ Add task</button>
          </form>
          {taskMessage && <p className="form-message" role="status">{taskMessage}</p>}

          <div className="task-filters" aria-label="Filter study tasks">
            {[
              ["all", "All"],
              ["active", "To do"],
              ["completed", "Completed"],
            ].map(([filter, label]) => (
              <button
                className={taskFilter === filter ? "filter-button selected" : "filter-button"}
                key={filter}
                type="button"
                onClick={() => setTaskFilter(filter)}
                aria-pressed={taskFilter === filter}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="task-list">
            {visibleTasks.length ? (
              visibleTasks.map((task) => (
                <div className="task-row" key={task.id}>
                  <label className="task-label">
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => toggleTask(task.id)}
                    />
                    <span className={task.done ? "done" : ""}>{task.title}</span>
                  </label>
                  <span className={task.done ? "task-status complete" : "task-status"}>
                    {task.done ? "Done" : "To do"}
                  </span>
                  <button
                    className="delete-task"
                    type="button"
                    onClick={() => deleteTask(task.id)}
                    aria-label={`Delete ${task.title}`}
                  >
                    ×
                  </button>
                </div>
              ))
            ) : (
              <p className="empty-tasks">
                {tasks.length ? "No tasks in this view." : "No tasks yet. Add one above to get started."}
              </p>
            )}
          </div>
        </section>

        <section className="plan-panel" id="study-plan">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">A SIMPLE ROUTINE</p>
              <h2>Your study plan</h2>
              <p>Use these focused blocks as a starting point for today.</p>
            </div>
          </div>
          <div className="plan-items">
            <article><span>09:00</span><div><strong>Review fundamentals</strong><p>Refresh key concepts and notes</p></div></article>
            <article><span>10:30</span><div><strong>Practice session</strong><p>Work through exercises hands-on</p></div></article>
            <article><span>13:00</span><div><strong>Quick recap</strong><p>Summarize what you learned</p></div></article>
          </div>
        </section>

        <section className="ai-panel" id="assistant">
          <div className="ai-icon" aria-hidden="true">✦</div>
          <div>
            <h2>Your AI Study Assistant</h2>
            <p>
              The assistant needs a connected AI service before it can create
              personalized study plans. Your task list is ready to use in the meantime.
            </p>
          </div>
        </section>

        <section className="settings-panel" id="settings">
          <div>
            <p className="eyebrow">PERSONALIZE YOUR SPACE</p>
            <h2>Settings</h2>
            <label htmlFor="student-name">Your name</label>
            <input
              id="student-name"
              value={studentName}
              onChange={(event) => setStudentName(event.target.value.slice(0, 40))}
              placeholder="Enter your name"
            />
          </div>
        </section>
        <footer>StudyMate · Your progress, your pace.</footer>
      </main>
    </div>
  );
}

export default App;
