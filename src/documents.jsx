import { useMemo, useState } from "react";
import {
  Search, Plus, X, Eye, Pencil, Trash2,
  FileText, FolderOpen, FileCheck, Clock3
} from "lucide-react";
import "./documents.css";

const initialDocuments = [
  {
    id: 1,
    name: "Land Ownership Agreement",
    category: "Legal Agreement",
    client: "James Mwangi",
    caseTitle: "Land Dispute",
    date: "2026-10-20",
  },
  {
    id: 2,
    name: "Divorce Petition",
    category: "Court Filing",
    client: "Mary Wanjiku",
    caseTitle: "Divorce Proceedings",
    date: "2026-10-22",
  },
  {
    id: 3,
    name: "Employment Contract",
    category: "Contract",
    client: "Peter Otieno",
    caseTitle: "Employment Dispute",
    date: "2026-10-25",
  },
];

export default function Documents() {
  const [documents, setDocuments] = useState(initialDocuments);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState("add");

  const emptyForm = {
    name: "",
    category: "Legal Agreement",
    client: "",
    caseTitle: "",
    date: new Date().toISOString().slice(0, 10),
  };

  const [form, setForm] = useState(emptyForm);

  const filteredDocuments = useMemo(() => {
    return documents.filter((document) => {
      const matchesSearch = [
        document.name,
        document.category,
        document.client,
        document.caseTitle,
      ].some((value) =>
        value.toLowerCase().includes(search.toLowerCase())
      );

      const matchesFilter =
        filter === "All" || document.category === filter;

      return matchesSearch && matchesFilter;
    });
  }, [documents, search, filter]);

  const openAdd = () => {
    setForm(emptyForm);
    setMode("add");
    setSelected(null);
    setShowModal(true);
  };

  const openEdit = (document) => {
    setForm({ ...document });
    setMode("edit");
    setSelected(document);
    setShowModal(true);
  };

  const openView = (document) => {
    setSelected(document);
    setMode("view");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelected(null);
  };

  const updateField = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (mode === "edit") {
      setDocuments((current) =>
        current.map((item) =>
          item.id === selected.id ? { ...form, id: selected.id } : item
        )
      );
    } else {
      setDocuments((current) => [
        ...current,
        { ...form, id: Date.now() },
      ]);
    }

    closeModal();
  };

  const deleteDocument = (id) => {
    if (window.confirm("Are you sure you want to delete this document record?")) {
      setDocuments((current) =>
        current.filter((document) => document.id !== id)
      );
    }
  };

  const categories = [
    "Legal Agreement",
    "Court Filing",
    "Contract",
    "Evidence",
    "Correspondence",
    "Other",
  ];

  return (
    <main className="documents-page">
      <div className="documents-heading">
        <div>
          <p className="documents-eyebrow">WORKSPACE</p>
          <h1>Document Register</h1>
          <p className="documents-subtitle">
            Organise and manage client and case documents.
          </p>
        </div>

        <button className="documents-primary-btn" onClick={openAdd}>
          <Plus size={18} /> Add Document
        </button>
      </div>

      <div className="documents-stats">
        <div className="document-stat-card">
          <span className="document-stat-icon"><FolderOpen /></span>
          <div>
            <p>Total Documents</p>
            <h2>{documents.length}</h2>
          </div>
        </div>

        <div className="document-stat-card">
          <span className="document-stat-icon"><FileText /></span>
          <div>
            <p>Legal Agreements</p>
            <h2>{documents.filter(d => d.category === "Legal Agreement").length}</h2>
          </div>
        </div>

        <div className="document-stat-card">
          <span className="document-stat-icon"><FileCheck /></span>
          <div>
            <p>Court Filings</p>
            <h2>{documents.filter(d => d.category === "Court Filing").length}</h2>
          </div>
        </div>

        <div className="document-stat-card">
          <span className="document-stat-icon"><Clock3 /></span>
          <div>
            <p>Recent Documents</p>
            <h2>
              {documents.filter((d) => {
                const age = (new Date() - new Date(d.date)) / 86400000;
                return age >= 0 && age <= 30;
              }).length}
            </h2>
          </div>
        </div>
      </div>

      <section className="documents-panel">
        <div className="documents-panel-heading">
          <div>
            <h2>Document Register</h2>
            <p>View and manage documents associated with clients and cases.</p>
          </div>
        </div>

        <div className="documents-toolbar">
          <div className="documents-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search document, client or case..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select value={filter} onChange={(event) => setFilter(event.target.value)}>
            <option value="All">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="documents-table-wrap">
          <table className="documents-table">
            <thead>
              <tr>
                <th>DOCUMENT NAME</th>
                <th>CATEGORY</th>
                <th>CLIENT</th>
                <th>RELATED CASE</th>
                <th>DATE ADDED</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {filteredDocuments.map((document) => (
                <tr key={document.id}>
                  <td>
                    <div className="document-name-cell">
                      <span className="document-file-icon"><FileText size={17} /></span>
                      {document.name}
                    </div>
                  </td>
                  <td>{document.category}</td>
                  <td>{document.client}</td>
                  <td>{document.caseTitle}</td>
                  <td>{document.date}</td>
                  <td>
                    <div className="document-actions">
                      <button title="View" onClick={() => openView(document)}><Eye size={16} /></button>
                      <button title="Edit" onClick={() => openEdit(document)}><Pencil size={16} /></button>
                      <button title="Delete" onClick={() => deleteDocument(document.id)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredDocuments.length === 0 && (
                <tr>
                  <td colSpan="6" className="documents-empty">
                    No documents found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showModal && (
        <div className="documents-modal-overlay" onClick={closeModal}>
          <div className="documents-modal" onClick={(event) => event.stopPropagation()}>
            <div className="documents-modal-heading">
              <div>
                <h2>
                  {mode === "add" ? "Add Document" : mode === "edit" ? "Edit Document" : "Document Details"}
                </h2>
                <p>Document record information</p>
              </div>
              <button onClick={closeModal}><X /></button>
            </div>

            {mode === "view" ? (
              <div className="document-details">
                <p><strong>Document:</strong> {selected.name}</p>
                <p><strong>Category:</strong> {selected.category}</p>
                <p><strong>Client:</strong> {selected.client}</p>
                <p><strong>Related case:</strong> {selected.caseTitle}</p>
                <p><strong>Date added:</strong> {selected.date}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <label>Document Name
                  <input
                    name="name"
                    value={form.name}
                    onChange={updateField}
                    placeholder="Enter document name"
                    required
                  />
                </label>

                <label>Category
                  <select name="category" value={form.category} onChange={updateField}>
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </label>

                <label>Client Name
                  <input
                    name="client"
                    value={form.client}
                    onChange={updateField}
                    placeholder="Enter client name"
                    required
                  />
                </label>

                <label>Related Case
                  <input
                    name="caseTitle"
                    value={form.caseTitle}
                    onChange={updateField}
                    placeholder="Enter related case"
                    required
                  />
                </label>

                <label>Date Added
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={updateField}
                    required
                  />
                </label>

                <div className="documents-modal-actions">
                  <button type="button" className="documents-cancel-btn" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="documents-primary-btn">
                    {mode === "edit" ? "Save Changes" : "Add Document"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
