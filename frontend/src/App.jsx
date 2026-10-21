
import { useEffect, useState } from "react";
import "./App.css";

const API = "/api";

function App() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    company: "",
    role: "",
    applied_date: new Date().toISOString().slice(0, 10),
    status: "Applied",
    notes: "",
  });

  async function loadApplications() {
    try {
      setError("");
      const response = await fetch(`${API}/applications`);
      if (!response.ok) throw new Error("Could not load applications.");
      setApplications(await response.json());
    } catch {
      setError("Cannot connect to the backend. Make sure FastAPI is running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApplications();
  }, []);

  async function addApplication(event) {
    event.preventDefault();
    setError("");

    try {
      const response = await fetch(`${API}/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("Could not save the application. Check your details.");
      }

      setForm({
        company: "",
        role: "",
        applied_date: new Date().toISOString().slice(0, 10),
        status: "Applied",
        notes: "",
      });
      setShowForm(false);
      setLoading(true);
      await loadApplications();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
  }

  async function updateStatus(application, status) {
    try {
      const response = await fetch(
        `${API}/applications/${application.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) throw new Error("Could not update status.");
      await loadApplications();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteApplication(id) {
    if (!window.confirm("Delete this application?")) return;

    try {
      const response = await fetch(`${API}/applications/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Could not delete application.");
      await loadApplications();
    } catch (err) {
      setError(err.message);
    }
  }

  const counts = {
    total: applications.length,
    interviews: applications.filter((a) => a.status === "Interview").length,
    offers: applications.filter((a) => a.status === "Offer").length,
    rejected: applications.filter((a) => a.status === "Rejected").length,
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">C</div>
          <span>CareerTrack</span>
        </div>

        <p className="nav-label">WORKSPACE</p>
        <div className="nav-item active">▦ &nbsp; Dashboard</div>
        <div className="nav-item">▤ &nbsp; Applications</div>
        <div className="nav-item">◎ &nbsp; Career progress</div>

        <div className="sidebar-bottom">
          <div className="avatar">S</div>
          <div>
            <strong>Student workspace</strong>
            <small>Placement preparation</small>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <span>Workspace / Dashboard</span>
          <span className="status-pill">● Local environment</span>
        </header>

        <section className="welcome">
          <div>
            <p className="eyebrow">YOUR CAREER, ORGANIZED</p>
            <h1>Placement dashboard</h1>
            <p className="subtitle">
              Keep track of applications and move closer to your next opportunity.
            </p>
          </div>
          <button className="primary-button" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "+ Add application"}
          </button>
        </section>

        {error && <div className="error-message">{error}</div>}

        {showForm && (
          <form className="application-form" onSubmit={addApplication}>
            <h2>New application</h2>
            <div className="form-grid">
              <label>
                Company
                <input
                  required
                  maxLength={150}
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder="e.g. Google"
                />
              </label>
              <label>
                Role
                <input
                  required
                  maxLength={150}
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  placeholder="e.g. Software Engineer Intern"
                />
              </label>
              <label>
                Date applied
                <input
                  required
                  type="date"
                  value={form.applied_date}
                  onChange={(e) =>
                    setForm({ ...form, applied_date: e.target.value })
                  }
                />
              </label>
              <label>
                Status
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option>Applied</option>
                  <option>Assessment</option>
                  <option>Interview</option>
                  <option>Offer</option>
                  <option>Rejected</option>
                </select>
              </label>
              <label className="full-width">
                Notes (optional)
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Recruiter details, interview date, preparation notes..."
                />
              </label>
            </div>
            <button className="primary-button" type="submit">
              Save application
            </button>
          </form>
        )}

        <section className="stats-grid">
          <StatCard label="Total applications" value={counts.total} symbol="▤" />
          <StatCard label="Interviews" value={counts.interviews} symbol="◷" />
          <StatCard label="Offers received" value={counts.offers} symbol="✦" />
          <StatCard label="Rejected" value={counts.rejected} symbol="↗" />
        </section>

        <section className="applications-panel">
          <div className="panel-heading">
            <div>
              <h2>Recent applications</h2>
              <p>Your placement pipeline at a glance.</p>
            </div>
            <span className="record-count">{applications.length} records</span>
          </div>

          {loading ? (
            <p className="empty-state">Loading applications...</p>
          ) : applications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">▤</div>
              <h3>No applications yet</h3>
              <p>Add your first job application to get started.</p>
              <button
                className="secondary-button"
                onClick={() => setShowForm(true)}
              >
                Add your first application
              </button>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>COMPANY & ROLE</th>
                    <th>DATE APPLIED</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((application) => (
                    <tr key={application.id}>
                      <td>
                        <strong>{application.company}</strong>
                        <small className="role-name">{application.role}</small>
                      </td>
                      <td>{application.applied_date}</td>
                      <td>
                        <span
                          className={`status-badge ${application.status
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        >
                          {application.status}
                        </span>
                      </td>
                      <td>
                        <div className="row-actions">
                          <select
                            aria-label={`Update ${application.company} status`}
                            value={application.status}
                            onChange={(e) =>
                              updateStatus(application, e.target.value)
                            }
                          >
                            <option>Applied</option>
                            <option>Assessment</option>
                            <option>Interview</option>
                            <option>Offer</option>
                            <option>Rejected</option>
                          </select>
                          <button
                            className="delete-button"
                            onClick={() => deleteApplication(application.id)}
                            aria-label={`Delete ${application.company}`}
                            title="Delete application"
                          >
                            ×
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer>CareerTrack · Built for your next opportunity</footer>
      </main>
    </div>
  );
}

function StatCard({ label, value, symbol }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <span className="stat-symbol">{symbol}</span>
      </div>
      <div className="stat-value">{value}</div>
    </div>
  );
}

export default App;

