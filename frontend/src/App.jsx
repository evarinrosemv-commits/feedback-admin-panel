import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:5000/feedback";

function Dashboard() {
  const [feedback, setFeedback] = useState([]);

  async function loadFeedback() {
    try {
      const response = await fetch(API);
      const data = await response.json();
      setFeedback(data);
    } catch {
      alert("Cannot connect to backend!");
    }
  }

  async function deleteFeedback(id) {
    if (!confirm("Delete this feedback?")) return;

    await fetch(`${API}/${id}`, { method: "DELETE" });
    loadFeedback();
  }

  useEffect(() => {
    loadFeedback();
  }, []);

  return (
    <div className="container">
      <h1>Feedback Dashboard</h1>
      <p>Manage course feedback in one place.</p>

      <div className="table-box">
        <table>
          <thead>
            <tr>
              <th>Course ID</th>
              <th>Course Name</th>
              <th>Duration</th>
              <th>Rating</th>
              <th>Comments</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {feedback.map((item) => (
              <tr key={item._id}>
                <td>{item._id.slice(-6)}</td>
                <td>{item.courseName}</td>
                <td>{item.courseDuration || "Not specified"}</td>
                <td>⭐ {item.rating}/5</td>
                <td>{item.comments}</td>
                <td>
                  <Link className="edit-btn" to={`/edit/${item._id}`}>
                    Edit
                  </Link>
                  <button
                    className="delete-btn"
                    onClick={() => deleteFeedback(item._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {feedback.length === 0 && <p className="empty">No feedback added yet.</p>}
      </div>
    </div>
  );
}

function AddFeedback({ editing = false }) {
  const [courseName, setCourseName] = useState("");
  const [courseDuration, setCourseDuration] = useState("");
  const [comments, setComments] = useState("");
  const [rating, setRating] = useState("5");
  const [message, setMessage] = useState("");

  const id = window.location.pathname.split("/")[2];

  useEffect(() => {
    if (editing && id) {
      fetch(API)
        .then((res) => res.json())
        .then((data) => {
          const item = data.find((f) => f._id === id);
          if (item) {
            setCourseName(item.courseName || "");
            setCourseDuration(item.courseDuration || "");
            setComments(item.comments || "");
            setRating(String(item.rating || 5));
          }
        });
    }
  }, [editing, id]);

  async function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      courseName,
      courseDuration,
      comments,
      rating: Number(rating),
    };

    const response = await fetch(editing ? `${API}/${id}` : API, {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      setMessage(editing ? "Feedback updated successfully!" : "Feedback added successfully!");
      if (!editing) {
        setCourseName("");
        setCourseDuration("");
        setComments("");
        setRating("5");
      }
    } else {
      setMessage("Could not save feedback. Check your backend and database.");
    }
  }

  return (
    <div className="container form-container">
      <h1>{editing ? "Update Feedback" : "Add Feedback"}</h1>

      <form onSubmit={handleSubmit}>
        <label>Course Name</label>
        <input
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
          placeholder="Enter course name"
          required
        />

        <label>Course Duration</label>
        <input
          value={courseDuration}
          onChange={(e) => setCourseDuration(e.target.value)}
          placeholder="Example: 3 months"
          required
        />

        <label>Feedback Comments</label>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Write your feedback"
          required
        />

        <label>Feedback Rating</label>
        <select value={rating} onChange={(e) => setRating(e.target.value)}>
          <option value="5">5 - Excellent</option>
          <option value="4">4 - Very Good</option>
          <option value="3">3 - Good</option>
          <option value="2">2 - Fair</option>
          <option value="1">1 - Poor</option>
        </select>

        <button className="submit-btn" type="submit">
          {editing ? "Update Feedback" : "Submit Feedback"}
        </button>

        {message && <p>{message}</p>}
      </form>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <nav className="navbar">
        <Link to="/" className="brand">Feedback Admin</Link>
        <div>
          <Link to="/">Dashboard</Link>
          <Link to="/add">Add Feedback</Link>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/add" element={<AddFeedback />} />
        <Route path="/edit/:id" element={<AddFeedback editing />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
