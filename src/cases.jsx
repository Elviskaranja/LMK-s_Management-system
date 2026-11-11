import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Eye,
  Pencil,
  Plus,
  Search,
  Trash2,
  X
} from "lucide-react";
import { api, asArray } from "./services/api";
import { toApiDateTime, toInputDate } from "./utils/dates";
import { useAuth } from "./useAuth.js";
import "./cases.css";

const blankForm = {
  caseNumber: "",
  caseTitle: "",
  clientId: "",
  advocateId: "",
  caseType: "Civil Litigation",
  description: "",
  status: "Pending",
  dateOpened: "",
  dateClosed: "",
  hearingDate: "",
  courtName: "",
  courtroom: ""
};

const statuses = ["Pending", "In Progress", "Under Review", "Closed"];
const caseTypes = [
  "Civil Litigation",
  "Criminal",
  "Succession",
  "Employment",
  "Commercial",
  "Family",
  "Other"
];

function getPersonName(person) {
  return person?.fullName || person?.name || person?.advocateName || "";
}

function getCaseId(row) {
  return row?.legalCase?.caseId ?? row?.case?.caseId ?? row?.caseId;
}

function normalizeCase(row, clients, advocates, assignments, hearings) {
  const clientId = row?.client?.clientId ?? row?.client?.id ?? row?.clientId ?? "";
  const assignment = assignments.find((item) => getCaseId(item) === row.caseId);
  const advocateId =
    assignment?.advocate?.advocateId ?? assignment?.advocate?.id ?? "";
  const hearing = hearings
    .filter((item) => getCaseId(item) === row.caseId)
    .sort((first, second) =>
      String(first.hearingDate || "").localeCompare(
        String(second.hearingDate || "")
      )
    )[0];

  return {
    id: row.caseId,
    number: row.caseNumber || "",
    title: row.caseTitle || "",
    clientId,
    client: getPersonName(
      clients.find((item) => (item.clientId ?? item.id) === clientId) ||
        row.client
    ),
    advocateId,
    advocate: getPersonName(
      advocates.find((item) => (item.advocateId ?? item.id) === advocateId) ||
        assignment?.advocate
    ),
    type: row.caseType || "Other",
    filed: toInputDate(row.dateOpened),
    closed: toInputDate(row.dateClosed),
    status: row.status || "Pending",
    notes: row.description || "",
    hearingId: hearing?.hearingId ?? "",
    hearing: toInputDate(hearing?.hearingDate),
    court: hearing?.courtName || "",
    courtroom: hearing?.courtroom || ""
  };
}

function CaseRecordsTable({
  cases,
  loading,
  isAdvocate,
  onDelete,
  onEdit,
  onView
}) {
  if (loading) {
    return <p className="cases-empty">Loading cases from the database...</p>;
  }

  return (
    <div className="cases-table-scroll">
      <table className="cases-table">
        <thead>
          <tr>
            <th>CASE / CLIENT</th>
            {!isAdvocate && <th>ADVOCATE</th>}
            <th>CASE TYPE</th>
            <th>FILED</th>
            <th>STATUS</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {cases.length ? (
            cases.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.title}</strong>
                  <small>
                    {item.number} · {item.client || "Client not linked"}
                  </small>
                </td>
                {!isAdvocate && <td>{item.advocate || "Not assigned"}</td>}
                <td>{item.type}</td>
                <td>{item.filed || "—"}</td>
                <td>
                  <span
                    className={`cases-status status-${item.status
                      .toLowerCase()
                      .replaceAll(" ", "-")}`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="cases-actions">
                  <button title="View" onClick={() => onView(item)}>
                    <Eye size={16} />
                  </button>
                  <button title="Edit" onClick={() => onEdit(item)}>
                    <Pencil size={16} />
                  </button>
                  <button title="Delete" onClick={() => onDelete(item)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={isAdvocate ? 5 : 6} className="cases-empty">
                No matching cases found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function CaseFormModal({
  selected,
  form,
  clients,
  advocates,
  error,
  saving,
  onChange,
  onClose,
  onSubmit
}) {
  return (
    <div className="cases-overlay">
      <section className="cases-modal" role="dialog" aria-modal="true">
        <div className="cases-modal-head">
          <div>
            <span className="cases-eyebrow">CASE DETAILS</span>
            <h2>{selected ? "Edit case" : "Add new case"}</h2>
          </div>
          <button className="cases-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="cases-form-grid">
            <label>
              Case number *
              <input
                name="caseNumber"
                value={form.caseNumber}
                onChange={onChange}
                required
              />
            </label>
            <label>
              Case title *
              <input
                name="caseTitle"
                value={form.caseTitle}
                onChange={onChange}
                required
              />
            </label>
            <label>
              Client *
              <select
                name="clientId"
                value={form.clientId}
                onChange={onChange}
                required
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option
                    key={client.clientId}
                    value={client.clientId}
                  >
                    {getPersonName(client)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Assigned advocate
              <select
                name="advocateId"
                value={form.advocateId}
                onChange={onChange}
              >
                {advocates.map((advocate) => (
                  <option
                    key={advocate.advocateId}
                    value={advocate.advocateId}
                  >
                    {getPersonName(advocate)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Case type
              <select
                name="caseType"
                value={form.caseType}
                onChange={onChange}
              >
                {caseTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </label>
            <label>
              Case status
              <select name="status" value={form.status} onChange={onChange}>
                {statuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </label>
            <label>
              Filing date
              <input
                type="date"
                name="dateOpened"
                value={form.dateOpened}
                onChange={onChange}
              />
            </label>
            <label>
              Closing date
              <input
                type="date"
                name="dateClosed"
                value={form.dateClosed}
                onChange={onChange}
              />
            </label>
            <label>
              Next hearing date
              <input
                type="date"
                name="hearingDate"
                value={form.hearingDate}
                onChange={onChange}
              />
            </label>
            <label>
              Court name
              <input
                name="courtName"
                value={form.courtName}
                onChange={onChange}
              />
            </label>
            <label>
              Courtroom
              <input
                name="courtroom"
                value={form.courtroom}
                onChange={onChange}
              />
            </label>
            <label className="cases-wide">
              Description / notes
              <textarea
                name="description"
                value={form.description}
                onChange={onChange}
                rows="3"
              />
            </label>
          </div>
          {error && <p className="cases-error">{error}</p>}
          <div className="cases-modal-footer">
            <button
              type="button"
              className="cases-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cases-primary"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : selected
                  ? "Save changes"
                  : "Create case"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function CaseDetailsModal({ item, onClose, onEdit }) {
  const details = [
    ["Client", item.client],
    ["Advocate", item.advocate],
    ["Case type", item.type],
    ["Status", item.status],
    ["Filing date", item.filed],
    ["Closing date", item.closed],
    ["Next hearing", item.hearing],
    ["Court", item.court],
    ["Courtroom", item.courtroom]
  ];

  return (
    <div className="cases-overlay">
      <section className="cases-modal" role="dialog" aria-modal="true">
        <div className="cases-modal-head">
          <div>
            <span className="cases-eyebrow">{item.number}</span>
            <h2>{item.title}</h2>
          </div>
          <button className="cases-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="cases-detail-grid">
          {details.map(([label, value]) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{value || "—"}</strong>
            </div>
          ))}
        </div>
        <div className="cases-notes">
          <span>Description</span>
          <p>{item.notes || "No description provided."}</p>
        </div>
        <div className="cases-modal-footer">
          <button className="cases-secondary" onClick={onClose}>
            Close
          </button>
          <button className="cases-primary" onClick={() => onEdit(item)}>
            <Pencil size={15} /> Edit case
          </button>
        </div>
      </section>
    </div>
  );
}

export default function Cases() {
  const { isAdvocate } = useAuth();
  const [cases, setCases] = useState([]);
  const [clients, setClients] = useState([]);
  const [advocates, setAdvocates] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [hearings, setHearings] = useState([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All cases");
  const [modal, setModal] = useState("");
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [
        caseResponse,
        clientResponse,
        advocateResponse,
        assignmentResponse,
        hearingResponse
      ] = await Promise.all([
        api.get("/cases"),
        api.get("/clients"),
        api.get("/advocates"),
        api.get("/case-advocates"),
        api.get("/hearings")
      ]);

      const caseRows = asArray(caseResponse);
      const clientRows = asArray(clientResponse);
      const advocateRows = asArray(advocateResponse);
      const assignmentRows = asArray(assignmentResponse);
      const hearingRows = asArray(hearingResponse);

      setClients(clientRows);
      setAdvocates(advocateRows);
      setAssignments(assignmentRows);
      setHearings(hearingRows);
      setCases(
        caseRows.map((row) =>
          normalizeCase(
            row,
            clientRows,
            advocateRows,
            assignmentRows,
            hearingRows
          )
        )
      );
    } catch (loadError) {
      setError(`Could not load cases: ${loadError.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const shownCases = useMemo(
    () =>
      cases.filter((item) => {
        const searchableText = [
          item.number,
          item.title,
          item.client,
          item.advocate,
          item.type
        ]
          .join(" ")
          .toLowerCase();
        const matchesQuery = searchableText.includes(query.toLowerCase());
        const matchesStatus = filter === "All cases" || item.status === filter;

        return matchesQuery && matchesStatus;
      }),
    [cases, query, filter]
  );

  function openAdd() {
    setSelected(null);
    setForm({
      ...blankForm,
      caseNumber: `LMK-${new Date().getFullYear()}-${String(
        cases.length + 1
      ).padStart(3, "0")}`,
      dateOpened: new Date().toISOString().slice(0, 10)
    });
    setError("");
    setModal("form");
  }

  function openEdit(item) {
    setSelected(item);
    setForm({
      ...blankForm,
      caseNumber: item.number,
      caseTitle: item.title,
      clientId: String(item.clientId),
      advocateId: String(item.advocateId),
      caseType: item.type,
      description: item.notes,
      status: item.status,
      dateOpened: item.filed,
      dateClosed: item.closed,
      hearingDate: item.hearing,
      courtName: item.court,
      courtroom: item.courtroom
    });
    setError("");
    setModal("form");
  }

  function handleFormChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  async function syncAdvocate(caseId, advocateId) {
    if (!advocateId) return;

    const existingAssignment = assignments.find(
      (item) => getCaseId(item) === caseId
    );
    const body = {
      legalCase: { caseId },
      advocate: { advocateId: Number(advocateId) }
    };

    if (existingAssignment) {
      await api.put(
        `/case-advocates/${existingAssignment.caseAdvocateId}`,
        body
      );
      return;
    }

    await api.post("/case-advocates", body);
  }

  async function syncHearing(caseId) {
    if (!form.hearingDate) return;

    const existingHearing = hearings.find(
      (item) =>
        getCaseId(item) === caseId && item.hearingId === selected?.hearingId
    );
    const body = {
      legalCase: { caseId },
      hearingDate: toApiDateTime(form.hearingDate),
      courtName: form.courtName || null,
      courtroom: form.courtroom || null,
      purpose: "Court hearing",
      outcome: null,
      status: "Scheduled"
    };

    if (existingHearing) {
      await api.put(`/hearings/${existingHearing.hearingId}`, body);
      return;
    }

    await api.post("/hearings", body);
  }

  async function saveCase(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (
        !form.caseNumber.trim() ||
        !form.caseTitle.trim() ||
        !form.clientId
      ) {
        throw new Error(
          "Enter a case number and title, then select a client."
        );
      }

      const body = {
        caseNumber: form.caseNumber.trim(),
        caseTitle: form.caseTitle.trim(),
        client: { clientId: Number(form.clientId) },
        caseType: form.caseType,
        description: form.description || null,
        status: form.status,
        dateOpened: toApiDateTime(form.dateOpened) || null,
        dateClosed: toApiDateTime(form.dateClosed) || null
      };
      const savedCase = selected
        ? await api.put(`/cases/${selected.id}`, body)
        : await api.post("/cases", body);
      const savedCaseId = savedCase?.caseId ?? selected?.id;

      if (savedCaseId && form.advocateId) {
        await syncAdvocate(savedCaseId, form.advocateId);
      }
      if (savedCaseId && form.hearingDate) {
        await syncHearing(savedCaseId);
      }

      setModal("");
      setSelected(null);
      await loadData();
    } catch (saveError) {
      setError(`Could not save case: ${saveError.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function deleteCase(item) {
    const confirmed = window.confirm(
      `Delete "${item.title}" (${item.number})? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await api.delete(`/cases/${item.id}`);
      if (selected?.id === item.id) setModal("");
      await loadData();
    } catch (deleteError) {
      setError(`Could not delete case: ${deleteError.message}`);
    }
  }

  function closeModal() {
    setModal("");
  }

  return (
    <main className="cases-page">
      <header className="cases-header">
        <div>
          <div className="cases-eyebrow">CASE MANAGEMENT</div>
          <h1>Cases</h1>
          <p>
            Manage case records, track progress, and keep upcoming hearings in
            view.
          </p>
        </div>
        <button className="cases-primary" onClick={openAdd}>
          <Plus size={18} /> Add New Case
        </button>
      </header>

      <section className="cases-panel">
        <div className="cases-panel-heading">
          <div>
            <h2>Case records</h2>
          </div>
        </div>
        <div className="cases-toolbar">
          <label className="cases-search">
            <Search size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search cases..."
            />
          </label>
          <select
            className="cases-filter"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <option>All cases</option>
            {statuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </div>
        {error && (
          <p className="cases-error" role="alert">
            {error}
          </p>
        )}
        <CaseRecordsTable
          cases={shownCases}
          loading={loading}
          isAdvocate={isAdvocate}
          onDelete={deleteCase}
          onEdit={openEdit}
          onView={(item) => {
            setSelected(item);
            setModal("view");
          }}
        />
      </section>

      {modal === "form" && (
        <CaseFormModal
          selected={selected}
          form={form}
          clients={clients}
          advocates={advocates}
          error={error}
          saving={saving}
          onChange={handleFormChange}
          onClose={closeModal}
          onSubmit={saveCase}
        />
      )}
      {modal === "view" && selected && (
        <CaseDetailsModal
          item={selected}
          onClose={closeModal}
          onEdit={openEdit}
        />
      )}
    </main>
  );
}
