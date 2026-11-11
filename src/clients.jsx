import { useEffect, useMemo, useState } from "react";
import {
  Search, Plus, X, Pencil, Trash2, Eye,
  Users, Mail, Phone
} from "lucide-react";
import { api } from "./services/api";
import "./clients.css";

const blankForm = {
  name: "",
  email: "",
  phone: "",
  type: "Individual",
  status: "Active",
  address: "",
  notes: ""
};

// Converts the Java Client response into the format used by our React page.
function formatClient(client) {
  return {
    id: client.clientId,
    displayId: `CL-${String(client.clientId).padStart(3, "0")}`,
    name: client.fullName || "",
    email: client.email || "",
    phone: client.phone || "",
    type: client.clientType || "Individual",
    status: client.status || "Active",
    address: client.address || "",
    notes: client.notes || ""
  };
}

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [viewing, setViewing] = useState(null);
  const [error, setError] = useState("");
  const [pageError, setPageError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch real client records from Spring Boot.
  useEffect(() => {
    async function loadClients() {
      try {
        setLoading(true);
        setPageError("");

        const data = await api.get("/clients");

        setClients(data.map(formatClient));
      } catch (err) {
        setPageError(
          `Could not load clients. ${err.message}`
        );
      } finally {
        setLoading(false);
      }
    }

    loadClients();
  }, []);

  // Search by client name, ID, email or phone number.
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return clients.filter((client) =>
      `${client.displayId} ${client.name} ${client.email} ${client.phone}`
        .toLowerCase()
        .includes(query)
    );
  }, [clients, search]);

  // Opens an empty form for a new client.
  function addClient() {
    setEditingId(null);
    setForm(blankForm);
    setError("");
    setFormOpen(true);
  }

  // Opens the form with the selected client's details.
  function editClient(client) {
    setEditingId(client.id);

    setForm({
      name: client.name,
      email: client.email,
      phone: client.phone,
      type: client.type,
      status: client.status,
      address: client.address,
      notes: client.notes
    });

    setViewing(null);
    setError("");
    setFormOpen(true);
  }

  // Updates form values when the user types.
  function updateField(event) {
    const { name, value } = event.target;

    setForm((old) => ({
      ...old,
      [name]: value
    }));
  }

  // Creates or updates a client through the API.
  async function saveClient(event) {
    event.preventDefault();

    if (!form.name.trim() || !form.phone.trim()) {
      setError("Client name and phone number are required.");
      return;
    }

    const clientData = {
      fullName: form.name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim(),
      clientType: form.type,
      status: form.status,
      address: form.address.trim() || null,
      notes: form.notes.trim() || null
    };

    try {
      setSaving(true);
      setError("");
      setPageError("");

      const isEditing = editingId !== null;

      const savedData = isEditing
        ? await api.put(`/clients/${editingId}`, clientData)
        : await api.post("/clients", clientData);
      const savedClient = formatClient(savedData);

      if (isEditing) {
        setClients((old) =>
          old.map((client) =>
            client.id === editingId ? savedClient : client
          )
        );
      } else {
        setClients((old) => [savedClient, ...old]);
      }

      setFormOpen(false);
      setEditingId(null);
      setForm(blankForm);
    } catch (err) {
      setError(`Could not save client. ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  // Deletes a client from the database after confirmation.
  async function deleteClient(client) {
    if (!window.confirm(`Delete the client record for ${client.name}?`)) {
      return;
    }

    try {
      setPageError("");

      await api.delete(`/clients/${client.id}`);

      setClients((old) =>
        old.filter((item) => item.id !== client.id)
      );

      if (viewing?.id === client.id) {
        setViewing(null);
      }
    } catch (err) {
      setPageError(`Could not delete client. ${err.message}`);
    }
  }

  const activeCount = clients.filter(
    (client) => client.status === "Active"
  ).length;

  const emailCount = clients.filter(
    (client) => client.email.trim()
  ).length;

  return (
    <section className="clients-page">
      <header className="clients-heading">
        <div>
          <span className="clients-eyebrow">CLIENT RELATIONSHIPS</span>
          <h1>Clients<span>.</span></h1>
          <p>Register clients and keep their contact information organized.</p>
        </div>

        <button className="clients-primary" onClick={addClient}>
          <Plus size={17} /> Add client
        </button>
      </header>

      {pageError && (
        <p className="clients-error">{pageError}</p>
      )}

      <div className="clients-summary">
        <article>
          <div><Users size={18} /></div>
          <span>Total clients</span>
          <strong>{clients.length}</strong>
          <small>All registered records</small>
        </article>

        <article>
          <div><Users size={18} /></div>
          <span>Active clients</span>
          <strong>{activeCount}</strong>
          <small>Currently marked active</small>
        </article>

        <article>
          <div><Mail size={18} /></div>
          <span>With email</span>
          <strong>{emailCount}</strong>
          <small>Contact details recorded</small>
        </article>
      </div>

      <section className="clients-panel">
        <div className="clients-panel-head">
          <div>
            <h2>Client register</h2>
            <p>Search, view, update, or remove a client record.</p>
          </div>

          <label className="clients-search">
            <Search size={17} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients..."
              aria-label="Search clients"
            />
          </label>
        </div>

        <div className="clients-table-wrap">
          <table className="clients-table">
            <thead>
              <tr>
                <th>CLIENT</th>
                <th>CONTACT DETAILS</th>
                <th>TYPE</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="clients-empty">
                    Loading clients...
                  </td>
                </tr>
              ) : filtered.length ? (
                filtered.map((client) => (
                  <tr key={client.id}>
                    <td>
                      <div className="clients-person">
                        <div className="clients-avatar">
                          {client.name
                            .split(/\s+/)
                            .slice(0, 2)
                            .map((x) => x[0])
                            .join("")
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>{client.name}</strong>
                          <small>{client.displayId}</small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="clients-contact">
                        <Mail size={14} />
                        {client.email || "No email recorded"}
                      </div>

                      <div className="clients-contact">
                        <Phone size={14} />
                        {client.phone}
                      </div>
                    </td>

                    <td>
                      <span className="clients-type">
                        {client.type}
                      </span>
                    </td>

                    <td>
                      <span className={`clients-status ${client.status.toLowerCase()}`}>
                        <i />
                        {client.status}
                      </span>
                    </td>

                    <td>
                      <div className="clients-actions">
                        <button
                          title="View details"
                          aria-label={`View ${client.name}`}
                          onClick={() => setViewing(client)}
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          title="Edit client"
                          aria-label={`Edit ${client.name}`}
                          onClick={() => editClient(client)}
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          className="clients-delete"
                          title="Delete client"
                          aria-label={`Delete ${client.name}`}
                          onClick={() => deleteClient(client)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="clients-empty">
                    No clients match "{search}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className="clients-footer">
          Showing {filtered.length} of {clients.length} clients
        </footer>
      </section>

      {formOpen && (
        <div className="clients-backdrop">
          <section
            className="clients-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="client-form-title"
          >
            <header className="clients-modal-head">
              <div>
                <span className="clients-eyebrow">
                  {editingId !== null ? "UPDATE RECORD" : "NEW RECORD"}
                </span>

                <h2 id="client-form-title">
                  {editingId !== null ? "Edit client" : "Add a client"}
                </h2>
              </div>

              <button
                className="clients-close"
                onClick={() => setFormOpen(false)}
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </header>

            <form onSubmit={saveClient}>
              <div className="clients-form-grid">
                <label>
                  Full name / organization *
                  <input
                    name="name"
                    value={form.name}
                    onChange={updateField}
                    required
                    placeholder="Enter client name"
                  />
                </label>

                <label>
                  Phone number *
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={updateField}
                    required
                    placeholder="+254..."
                  />
                </label>

                <label>
                  Email address
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={updateField}
                    placeholder="name@example.com"
                  />
                </label>

                <label>
                  Client type
                  <select
                    name="type"
                    value={form.type}
                    onChange={updateField}
                  >
                    <option>Individual</option>
                    <option>Organization</option>
                  </select>
                </label>

                <label>
                  Status
                  <select
                    name="status"
                    value={form.status}
                    onChange={updateField}
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </label>

                <label>
                  Address
                  <input
                    name="address"
                    value={form.address}
                    onChange={updateField}
                    placeholder="Town / area"
                  />
                </label>

                <label className="clients-full">
                  Notes
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={updateField}
                    rows="3"
                    placeholder="Optional notes"
                  />
                </label>
              </div>

              {error && <p className="clients-error">{error}</p>}

              <div className="clients-form-actions">
                <button
                  type="button"
                  className="clients-secondary"
                  onClick={() => setFormOpen(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="clients-primary"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId !== null
                      ? "Save changes"
                      : "Save client"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {viewing && (
        <div
          className="clients-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setViewing(null);
            }
          }}
        >
          <section
            className="clients-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="client-details-title"
          >
            <header className="clients-modal-head">
              <div>
                <span className="clients-eyebrow">
                  {viewing.displayId}
                </span>
                <h2 id="client-details-title">{viewing.name}</h2>
              </div>

              <button
                className="clients-close"
                onClick={() => setViewing(null)}
                aria-label="Close details"
              >
                <X size={20} />
              </button>
            </header>

            <div className="clients-details">
              {[
                ["Email", viewing.email],
                ["Phone", viewing.phone],
                ["Client type", viewing.type],
                ["Status", viewing.status],
                ["Address", viewing.address],
                ["Notes", viewing.notes]
              ].map(([label, value]) => (
                <div key={label}>
                  <span>{label}</span>
                  <strong>{value || "Not provided"}</strong>
                </div>
              ))}
            </div>

            <div className="clients-form-actions">
              <button
                className="clients-secondary"
                onClick={() => setViewing(null)}
              >
                Close
              </button>

              <button
                className="clients-primary"
                onClick={() => editClient(viewing)}
              >
                <Pencil size={15} /> Edit client
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}