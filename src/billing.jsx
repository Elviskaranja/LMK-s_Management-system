import { useEffect, useMemo, useState } from "react";
import {
  CircleDollarSign,
  CreditCard,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { api, asArray } from "./services/api";
import { toApiDateTime, toInputDate } from "./utils/dates";
import "./billing.css";

const emptyForm = {
  invoiceId: "",
  paymentDate: "",
  amount: "",
  paymentMethod: "",
  referenceNumber: "",
  notes: "",
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

function formatPaymentDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en-KE", { dateStyle: "medium" }).format(date);
}

function invoiceIdOf(payment) {
  return payment.invoice?.invoiceId ?? payment.invoiceId ?? "";
}

function invoiceLabelOf(payment) {
  return (
    payment.invoice?.invoiceNumber ||
    (invoiceIdOf(payment) ? `Invoice #${invoiceIdOf(payment)}` : "—")
  );
}

export default function Billing() {
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadPayments() {
    setLoading(true);
    setError("");

    try {
      setPayments(asArray(await api.get("/payments")));
    } catch (loadError) {
      setError(`Could not load payments: ${loadError.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPayments();
  }, []);

  const totals = useMemo(
    () => ({
      amount: payments.reduce(
        (sum, payment) => sum + (Number(payment.amount) || 0),
        0,
      ),
      count: payments.length,
    }),
    [payments],
  );

  const paymentMethods = useMemo(
    () =>
      [...new Set(payments.map((payment) => payment.paymentMethod).filter(Boolean))]
        .sort((first, second) => first.localeCompare(second)),
    [payments],
  );

  const filteredPayments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return payments.filter((payment) => {
      const searchableText = [
        payment.paymentId,
        invoiceLabelOf(payment),
        invoiceIdOf(payment),
        payment.paymentMethod,
        payment.referenceNumber,
        payment.notes,
        payment.paymentDate,
        payment.amount,
      ]
        .join(" ")
        .toLowerCase();
      const matchesSearch = searchableText.includes(query);
      const matchesMethod =
        methodFilter === "All" || payment.paymentMethod === methodFilter;

      return matchesSearch && matchesMethod;
    });
  }, [payments, search, methodFilter]);

  function openAdd() {
    setEditingPayment(null);
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  }

  function openEdit(payment) {
    setEditingPayment(payment);
    setForm({
      invoiceId: String(invoiceIdOf(payment)),
      paymentDate: toInputDate(payment.paymentDate),
      amount: String(payment.amount ?? ""),
      paymentMethod: payment.paymentMethod || "",
      referenceNumber: payment.referenceNumber || "",
      notes: payment.notes || "",
    });
    setError("");
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingPayment(null);
    setForm(emptyForm);
  }

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function savePayment(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        invoice: { invoiceId: Number(form.invoiceId) },
        paymentDate: toApiDateTime(form.paymentDate),
        amount: Number(form.amount),
        paymentMethod: form.paymentMethod.trim() || null,
        referenceNumber: form.referenceNumber.trim() || null,
        notes: form.notes.trim() || null,
      };

      if (editingPayment) {
        await api.put(`/payments/${editingPayment.paymentId}`, payload);
      } else {
        await api.post("/payments", payload);
      }

      closeModal();
      await loadPayments();
    } catch (saveError) {
      setError(`Could not save payment: ${saveError.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function deletePayment(payment) {
    if (
      !window.confirm(
        `Delete payment ${payment.paymentId}? This cannot be undone.`,
      )
    ) {
      return;
    }

    setError("");
    try {
      await api.delete(`/payments/${payment.paymentId}`);
      await loadPayments();
    } catch (deleteError) {
      setError(`Could not delete payment: ${deleteError.message}`);
    }
  }

  return (
    <div className="billing-page">
      <div className="billing-heading">
        <div>
          <p className="billing-eyebrow">FINANCIAL MANAGEMENT</p>
          <h1>Billing &amp; Payments</h1>
          <p>View and manage recorded client payments.</p>
        </div>

        <button className="billing-primary-btn" onClick={openAdd}>
          <Plus size={18} /> Record Payment
        </button>
      </div>

      {error && <p className="billing-error" role="alert">{error}</p>}

      <div className="billing-stats">
        <div className="billing-stat-card">
          <div className="billing-stat-icon"><CircleDollarSign /></div>
          <span>Total Payments</span>
          <h2>{formatCurrency(totals.amount)}</h2>
          <small>Sum of recorded payment amounts</small>
        </div>

        <div className="billing-stat-card">
          <div className="billing-stat-icon"><CreditCard /></div>
          <span>Payments Recorded</span>
          <h2>{totals.count}</h2>
          <small>Payments returned by the API</small>
        </div>
      </div>

      <section className="billing-table-panel">
        <div className="billing-table-heading">
          <div>
            <h2>Payment Records</h2>
            <p>View payments recorded against invoices.</p>
          </div>
        </div>

        <div className="billing-toolbar">
          <div className="billing-search">
            <Search size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search payments, invoices or references..."
              aria-label="Search payments"
            />
          </div>

          <select
            value={methodFilter}
            onChange={(event) => setMethodFilter(event.target.value)}
            aria-label="Filter by payment method"
          >
            <option value="All">All payment methods</option>
            {paymentMethods.map((method) => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
        </div>

        <div className="billing-table-scroll">
          <table className="billing-table">
            <thead>
              <tr>
                <th>Payment</th>
                <th>Invoice</th>
                <th>Payment Date</th>
                <th>Payment Method</th>
                <th>Reference Number</th>
                <th>Notes</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="billing-empty">Loading payments...</td>
                </tr>
              ) : filteredPayments.map((payment) => (
                <tr key={payment.paymentId}>
                  <td className="billing-invoice-id">{payment.paymentId ?? "—"}</td>
                  <td>{invoiceLabelOf(payment)}</td>
                  <td>{formatPaymentDate(payment.paymentDate)}</td>
                  <td>{payment.paymentMethod || "—"}</td>
                  <td>{payment.referenceNumber || "—"}</td>
                  <td>{payment.notes || "—"}</td>
                  <td className="billing-amount">{formatCurrency(payment.amount)}</td>
                  <td>
                    <div className="billing-row-actions">
                      <button
                        className="billing-action-btn"
                        onClick={() => openEdit(payment)}
                        aria-label={`Edit payment ${payment.paymentId}`}
                      >
                        <Pencil size={14} /> Edit
                      </button>
                      <button
                        className="billing-action-btn"
                        onClick={() => deletePayment(payment)}
                        aria-label={`Delete payment ${payment.paymentId}`}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && filteredPayments.length === 0 && (
                <tr>
                  <td colSpan="8" className="billing-empty">
                    {payments.length
                      ? "No payments match your search."
                      : "No payment records found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showModal && (
        <div className="billing-modal-overlay">
          <form className="billing-modal" onSubmit={savePayment}>
            <div className="billing-modal-heading">
              <div>
                <h2>{editingPayment ? "Edit Payment" : "Record Payment"}</h2>
                <p>Enter the payment details below.</p>
              </div>
              <button
                type="button"
                className="billing-close-btn"
                onClick={closeModal}
                aria-label="Close payment form"
              >
                <X />
              </button>
            </div>

            <label htmlFor="payment-invoice-id">Invoice ID</label>
            <input
              id="payment-invoice-id"
              required
              type="number"
              min="1"
              name="invoiceId"
              value={form.invoiceId}
              onChange={updateField}
              placeholder="Enter the existing invoice ID"
            />

            <label htmlFor="payment-date">Payment Date</label>
            <input
              id="payment-date"
              required
              type="date"
              name="paymentDate"
              value={form.paymentDate}
              onChange={updateField}
            />

            <label htmlFor="payment-amount">Amount (KES)</label>
            <input
              id="payment-amount"
              required
              type="number"
              min="0.01"
              step="0.01"
              name="amount"
              value={form.amount}
              onChange={updateField}
              placeholder="Enter payment amount"
            />

            <label htmlFor="payment-method">Payment Method</label>
            <input
              id="payment-method"
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={updateField}
              placeholder="e.g. Bank transfer"
            />

            <label htmlFor="payment-reference">Reference Number</label>
            <input
              id="payment-reference"
              name="referenceNumber"
              value={form.referenceNumber}
              onChange={updateField}
              placeholder="Optional"
            />

            <label htmlFor="payment-notes">Notes</label>
            <textarea
              id="payment-notes"
              name="notes"
              value={form.notes}
              onChange={updateField}
              rows="3"
              placeholder="Optional"
            />

            <div className="billing-modal-actions">
              <button type="button" className="billing-cancel-btn" onClick={closeModal}>
                Cancel
              </button>
              <button type="submit" className="billing-primary-btn" disabled={saving}>
                {saving ? "Saving..." : editingPayment ? "Save Changes" : "Record Payment"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
