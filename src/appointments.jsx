import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  X,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import { api, asArray, displayDate, idOfCase } from "./services/api";
import { toApiDateTime, toInputDate } from "./utils/dates";
import "./appointments.css";

const blankForm = {
  caseId: "",
  hearingDate: "",
  courtName: "",
  courtroom: "",
  purpose: "",
  outcome: "",
  status: "Scheduled",
};

const getCaseTitle = (item) =>
  item?.caseTitle || item?.caseNumber || "Case";

const getClientName = (item) =>
  item?.client?.fullName || item?.client?.name || "";

function formatHearing(hearing, cases) {
  const linkedCase =
    cases.find((item) => item.caseId === idOfCase(hearing)) ||
    hearing.legalCase ||
    {};

  return {
    ...hearing,
    linkedCase,
    client: getClientName(linkedCase),
    caseTitle: getCaseTitle(linkedCase),
    date: displayDate(hearing.hearingDate),
  };
}

function createHearingPayload(form) {
  return {
    legalCase: { caseId: Number(form.caseId) },
    hearingDate: toApiDateTime(form.hearingDate),
    courtName: form.courtName || null,
    courtroom: form.courtroom || null,
    purpose: form.purpose || null,
    outcome: form.outcome || null,
    status: form.status,
  };
}

export default function Appointments() {
  const [hearings, setHearings] = useState([]);
  const [cases, setCases] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState("add");
  const [form, setForm] = useState(blankForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [hearingRows, caseRows] = await Promise.all([
        api.get("/hearings"),
        api.get("/cases"),
      ]);

      setHearings(asArray(hearingRows));
      setCases(asArray(caseRows));
    } catch (err) {
      setError(`Could not load appointments: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const rows = useMemo(
    () => hearings.map((hearing) => formatHearing(hearing, cases)),
    [hearings, cases],
  );

  const filteredHearings = useMemo(() => {
    const query = search.toLowerCase();

    return rows.filter((hearing) => {
      const matchesSearch = [
        hearing.caseTitle,
        hearing.client,
        hearing.courtName,
        hearing.purpose,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
      const matchesStatus = filter === "All" || hearing.status === filter;

      return matchesSearch && matchesStatus;
    });
  }, [rows, search, filter]);

  function openAdd() {
    setSelected(null);
    setForm(blankForm);
    setMode("add");
    setError("");
    setShowModal(true);
  }

  function openEdit(item) {
    setSelected(item);
    setForm({
      caseId: String(idOfCase(item)),
      hearingDate: toInputDate(item.hearingDate),
      courtName: item.courtName || "",
      courtroom: item.courtroom || "",
      purpose: item.purpose || "",
      outcome: item.outcome || "",
      status: item.status || "Scheduled",
    });
    setMode("edit");
    setError("");
    setShowModal(true);
  }

  function openView(item) {
    setSelected(item);
    setMode("view");
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setSelected(null);
  }

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (!form.caseId || !form.hearingDate) {
        throw new Error("Select a case and enter the hearing date.");
      }

      const payload = createHearingPayload(form);

      if (mode === "edit") {
        await api.put(`/hearings/${selected.hearingId}`, payload);
      } else {
        await api.post("/hearings", payload);
      }

      closeModal();
      await loadData();
    } catch (err) {
      setError(`Could not save hearing: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function deleteAppointment(item) {
    if (
      !window.confirm(
        "Are you sure you want to delete this hearing record?",
      )
    ) {
      return;
    }

    try {
      await api.delete(`/hearings/${item.hearingId}`);
      await loadData();
    } catch (err) {
      setError(`Could not delete hearing: ${err.message}`);
    }
  }

  function renderTableRows() {
    if (filteredHearings.length === 0) {
      return (
        <tr>
          <td colSpan="6">No hearing records found.</td>
        </tr>
      );
    }

    return filteredHearings.map((item) => (
      <tr key={item.hearingId}>
        <td>{item.client || "—"}</td>
        <td>{item.caseTitle}</td>
        <td>
          {item.courtName || "—"}
          {item.courtroom && <small>{item.courtroom}</small>}
        </td>
        <td>{item.date || "—"}</td>
        <td>
          <span
            className={`appointment-status ${(item.status || "scheduled").toLowerCase()}`}
          >
            {item.status || "Scheduled"}
          </span>
        </td>
        <td className="appointment-actions">
          <button title="View" onClick={() => openView(item)}>
            <Eye size={16} />
          </button>
          <button title="Edit" onClick={() => openEdit(item)}>
            <Pencil size={16} />
          </button>
          <button title="Delete" onClick={() => deleteAppointment(item)}>
            <Trash2 size={16} />
          </button>
        </td>
      </tr>
    ));
  }

  function renderDetails() {
    return (
      <div className="appointment-details">
        <p>
          <strong>Case:</strong> {selected?.caseTitle}
        </p>
        <p>
          <strong>Client:</strong> {selected?.client || "—"}
        </p>
        <p>
          <strong>Date:</strong> {selected?.date}
        </p>
        <p>
          <strong>Court:</strong> {selected?.courtName || "—"}
        </p>
        <p>
          <strong>Courtroom:</strong> {selected?.courtroom || "—"}
        </p>
        <p>
          <strong>Purpose:</strong> {selected?.purpose || "—"}
        </p>
        <p>
          <strong>Outcome:</strong> {selected?.outcome || "—"}
        </p>
        <p>
          <strong>Status:</strong> {selected?.status}
        </p>
        <button
          className="appointments-primary-btn"
          onClick={() => openEdit(selected)}
        >
          Edit hearing
        </button>
      </div>
    );
  }

  function renderForm() {
    return (
      <form onSubmit={handleSubmit}>
        <label>
          Related case *
          <select
            name="caseId"
            value={form.caseId}
            onChange={updateField}
            required
          >
            <option value="">Select a case</option>
            {cases.map((item) => (
              <option key={item.caseId} value={item.caseId}>
                {item.caseNumber} — {item.caseTitle}
              </option>
            ))}
          </select>
        </label>

        <label>
          Hearing date *
          <input
            type="date"
            name="hearingDate"
            value={form.hearingDate}
            onChange={updateField}
            required
          />
        </label>

        <div className="appointments-form-row">
          <label>
            Court name
            <input
              name="courtName"
              value={form.courtName}
              onChange={updateField}
            />
          </label>
          <label>
            Courtroom
            <input
              name="courtroom"
              value={form.courtroom}
              onChange={updateField}
            />
          </label>
        </div>

        <label>
          Purpose
          <textarea
            name="purpose"
            value={form.purpose}
            onChange={updateField}
          />
        </label>

        <label>
          Outcome
          <textarea
            name="outcome"
            value={form.outcome}
            onChange={updateField}
          />
        </label>

        <label>
          Status
          <select name="status" value={form.status} onChange={updateField}>
            <option>Scheduled</option>
            <option>Completed</option>
            <option>Cancelled</option>
          </select>
        </label>

        {error && <p className="appointments-error">{error}</p>}

        <div className="appointments-modal-actions">
          <button
            type="button"
            className="appointments-cancel-btn"
            onClick={closeModal}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="appointments-primary-btn"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : mode === "edit"
                ? "Save Changes"
                : "Schedule Hearing"}
          </button>
        </div>
      </form>
    );
  }

  const modalTitle =
    mode === "view"
      ? "Hearing details"
      : mode === "edit"
        ? "Edit appointment"
        : "Add appointment";

  return (
    <main className="appointments-page">
      <header className="appointments-heading">
        <div>
          <p className="appointments-eyebrow">WORKSPACE</p>
          <h1>Hearings</h1>
          <p className="appointments-subtitle">
            Manage court hearings and case schedules.
          </p>
        </div>
        <button className="appointments-primary-btn" onClick={openAdd}>
          <Plus size={17} />
          Schedule hearing
        </button>
      </header>

      <section className="appointments-panel">
        <div className="appointments-panel-heading">
          <div>
            <h2>Hearing schedule</h2>
            <p>{hearings.length} records from the database</p>
          </div>
        </div>

        <div className="appointments-toolbar">
          <label className="appointments-search">
            <Search size={16} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by case, client or court..."
            />
          </label>
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <option>All</option>
            <option>Scheduled</option>
            <option>Completed</option>
            <option>Cancelled</option>
          </select>
        </div>

        {error && (
          <p className="appointments-error" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <p>Loading hearing records...</p>
        ) : (
          <div className="appointments-table-wrap">
            <table className="appointments-table">
              <thead>
                <tr>
                  <th>CLIENT</th>
                  <th>CASE</th>
                  <th>COURT</th>
                  <th>HEARING DATE</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>{renderTableRows()}</tbody>
            </table>
          </div>
        )}
      </section>

      {showModal && (
        <div className="appointments-modal-overlay">
          <div className="appointments-modal">
            <div className="appointments-modal-heading">
              <div>
                <p className="appointments-eyebrow">HEARING RECORD</p>
                <h2>{modalTitle}</h2>
              </div>
              <button onClick={closeModal} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            {mode === "view" ? renderDetails() : renderForm()}
          </div>
        </div>
      )}
    </main>
  );
}
