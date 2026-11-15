import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { api, asArray } from "./services/api";
import { toInputDate } from "./utils/dates";

const emptyForm = {
  caseId: "",
  invoiceNumber: "",
  totalAmount: "",
  issueDate: "",
  dueDate: "",
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

function invoiceCaseId(invoice) {
  return invoice.legalCase?.caseId ?? invoice.caseId ?? "";
}

function invoiceClient(invoice) {
  return invoice.client ?? invoice.legalCase?.client ?? {};
}

function paidAmountFor(invoice, payments) {
  const invoiceId = invoice.invoiceId;
  return payments
    .filter((payment) =>
      Number(payment.invoice?.invoiceId ?? payment.invoiceId) === Number(invoiceId)
    )
    .reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);
}

function paymentStatus(totalAmount, totalPaid) {
  if (totalPaid <= 0) return "Unpaid";
  return totalPaid >= totalAmount ? "Paid" : "Partially Paid";
}

function caseLabel(legalCase) {
  return `${legalCase.caseNumber || `Case #${legalCase.caseId}`} · ${legalCase.caseTitle || "Untitled case"}`;
}

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [cases, setCases] = useState([]);
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadRecords() {
    setLoading(true);
    setError("");

    try {
      const [invoiceRows, caseRows, paymentRows] = await Promise.all([
        api.get("/invoices"),
        api.get("/cases"),
        api.get("/payments"),
      ]);
      setInvoices(asArray(invoiceRows));
      setCases(asArray(caseRows));
      setPayments(asArray(paymentRows));
    } catch (loadError) {
      setError(`Could not load invoice records: ${loadError.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    Promise.resolve().then(() => loadRecords());
  }, []);

  const selectedCase = cases.find(
    (legalCase) => Number(legalCase.caseId) === Number(form.caseId)
  );
  const selectedClient = selectedCase?.client ?? {};

  const filteredInvoices = useMemo(() => {
    const query = search.trim().toLowerCase();
    return invoices.filter((invoice) => {
      const legalCase = invoice.legalCase ?? {};
      const client = invoiceClient(invoice);
      return [
        invoice.invoiceId,
        invoice.invoiceNumber,
        invoiceCaseId(invoice),
        legalCase.caseNumber,
        legalCase.caseTitle,
        client.fullName,
        invoice.status,
        invoice.issueDate,
        invoice.dueDate,
        invoice.totalAmount,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [invoices, search]);

  function openAdd() {
    setEditingInvoice(null);
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  }

  function openEdit(invoice) {
    setEditingInvoice(invoice);
    setForm({
      caseId: String(invoiceCaseId(invoice)),
      invoiceNumber: invoice.invoiceNumber || "",
      totalAmount: String(invoice.totalAmount ?? ""),
      issueDate: toInputDate(invoice.issueDate),
      dueDate: toInputDate(invoice.dueDate),
    });
    setError("");
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingInvoice(null);
    setForm(emptyForm);
  }

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function saveInvoice(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        ...(form.invoiceNumber ? { invoiceNumber: form.invoiceNumber } : {}),
        legalCase: { caseId: Number(form.caseId) },
        totalAmount: Number(form.totalAmount),
        issueDate: form.issueDate,
        dueDate: form.dueDate,
      };

      if (editingInvoice) {
        await api.put(`/invoices/${editingInvoice.invoiceId}`, payload);
      } else {
        await api.post("/invoices", payload);
      }

      closeModal();
      await loadRecords();
    } catch (saveError) {
      setError(`Could not save invoice: ${saveError.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function deleteInvoice(invoice) {
    if (!window.confirm(`Delete invoice ${invoice.invoiceNumber}? This cannot be undone.`)) {
      return;
    }

    setError("");
    try {
      await api.delete(`/invoices/${invoice.invoiceId}`);
      await loadRecords();
    } catch (deleteError) {
      setError(`Could not delete invoice: ${deleteError.message}`);
    }
  }

  const formPaid = editingInvoice ? paidAmountFor(editingInvoice, payments) : 0;
  const formStatus = paymentStatus(Number(form.totalAmount) || 0, formPaid);

  return (
    <div className="billing-page">
      <div className="billing-heading">
        <div>
          <p className="billing-eyebrow">FINANCIAL MANAGEMENT</p>
          <h1>Invoices</h1>
          <p>Register and manage the full amount charged for each case.</p>
        </div>
        <button className="billing-primary-btn" onClick={openAdd}>
          <Plus size={18} /> Create Invoice
        </button>
      </div>

      {error && <p className="billing-error" role="alert">{error}</p>}

      <section className="billing-table-panel">
        <div className="billing-table-heading">
          <div>
            <h2>Invoice Register</h2>
            <p>Invoice amounts represent the full fee charged, separate from payments received.</p>
          </div>
        </div>

        <div className="billing-toolbar">
          <div className="billing-search">
            <Search size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search invoices, cases or clients..."
              aria-label="Search invoices"
            />
          </div>
        </div>

        <div className="billing-table-scroll">
          <table className="billing-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Case / Client</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Amount Charged</th>
                <th>Paid</th>
                <th>Outstanding</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="9" className="billing-empty">Loading invoices...</td></tr>
              ) : filteredInvoices.map((invoice) => {
                const paid = paidAmountFor(invoice, payments);
                const amount = Number(invoice.totalAmount) || 0;
                const legalCase = invoice.legalCase ?? {};
                const client = invoiceClient(invoice);
                const status = paymentStatus(amount, paid);
                return (
                  <tr key={invoice.invoiceId}>
                    <td className="billing-invoice-id">
                      {invoice.invoiceNumber || `Invoice #${invoice.invoiceId}`}
                    </td>
                    <td>
                      <strong>{legalCase.caseNumber || `Case #${invoiceCaseId(invoice) || "—"}`}</strong>
                      <br />
                      <small>{client.fullName || "Client not linked"}</small>
                    </td>
                    <td>{toInputDate(invoice.issueDate) || "—"}</td>
                    <td>{toInputDate(invoice.dueDate) || "—"}</td>
                    <td className="billing-amount">{formatCurrency(amount)}</td>
                    <td>{formatCurrency(paid)}</td>
                    <td>{formatCurrency(Math.max(amount - paid, 0))}</td>
                    <td><span className={`invoice-status invoice-status-${status.toLowerCase().replaceAll(" ", "-")}`}>{status}</span></td>
                    <td>
                      <div className="billing-row-actions">
                        <button
                          className="billing-action-btn"
                          onClick={() => openEdit(invoice)}
                          aria-label={`Edit invoice ${invoice.invoiceNumber}`}
                        >
                          <Pencil size={14} /> Edit
                        </button>
                        <button
                          className="billing-action-btn"
                          onClick={() => deleteInvoice(invoice)}
                          aria-label={`Delete invoice ${invoice.invoiceNumber}`}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan="9" className="billing-empty">
                    {invoices.length ? "No invoices match your search." : "No invoices registered."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showModal && (
        <div className="billing-modal-overlay">
          <form className="billing-modal" onSubmit={saveInvoice}>
            <div className="billing-modal-heading">
              <div>
                <h2>{editingInvoice ? "Edit Invoice" : "Create Invoice"}</h2>
                <p>Record the total amount charged for the selected case.</p>
              </div>
              <button
                type="button"
                className="billing-close-btn"
                onClick={closeModal}
                aria-label="Close invoice form"
              >
                <X />
              </button>
            </div>

            <label htmlFor="invoice-number">Invoice Number</label>
            <input
              id="invoice-number"
              value={form.invoiceNumber || "Generated automatically when saved"}
              readOnly
            />

            <label htmlFor="invoice-case-id">Case</label>
            <select
              id="invoice-case-id"
              required
              name="caseId"
              value={form.caseId}
              onChange={updateField}
            >
              <option value="">Select a registered case</option>
              {cases.map((legalCase) => (
                <option key={legalCase.caseId} value={legalCase.caseId}>
                  {legalCase.caseId} · {caseLabel(legalCase)}
                </option>
              ))}
            </select>

            <label htmlFor="invoice-client-name">Client Details</label>
            <div className="billing-client-details">
              <input id="invoice-client-name" value={selectedClient.fullName || ""} readOnly placeholder="Client name from selected case" />
              <input aria-label="Client email" value={selectedClient.email || ""} readOnly placeholder="Client email" />
              <input aria-label="Client phone" value={selectedClient.phone || ""} readOnly placeholder="Client phone" />
            </div>

            <label htmlFor="invoice-total-amount">Invoice Amount (KES)</label>
            <input
              id="invoice-total-amount"
              required
              type="number"
              min={formPaid || "0.01"}
              step="0.01"
              name="totalAmount"
              value={form.totalAmount}
              onChange={updateField}
              placeholder="Enter the full amount charged"
            />

            <label htmlFor="invoice-issue-date">Issue Date</label>
            <input
              id="invoice-issue-date"
              required
              type="date"
              name="issueDate"
              value={form.issueDate}
              onChange={updateField}
            />

            <label htmlFor="invoice-due-date">Due Date</label>
            <input
              id="invoice-due-date"
              required
              type="date"
              name="dueDate"
              min={form.issueDate || undefined}
              value={form.dueDate}
              onChange={updateField}
            />

            <label htmlFor="invoice-status">Invoice Status</label>
            <input id="invoice-status" value={formStatus} readOnly />
            <small className="invoice-status-note">Status is calculated from recorded payments.</small>

            <div className="billing-modal-actions">
              <button type="button" className="billing-cancel-btn" onClick={closeModal}>Cancel</button>
              <button type="submit" className="billing-primary-btn" disabled={saving || cases.length === 0}>
                {saving ? "Saving..." : editingInvoice ? "Save Changes" : "Create Invoice"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
