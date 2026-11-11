import Clients from "./clients.jsx";
import Login from "./login.jsx";
import Cases from "./cases.jsx";
import Appointments from "./appointments.jsx";
import Documents from "./documents.jsx";
import Billing from "./billing.jsx";
import Settings from "./settings.jsx";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "./useAuth.js";
import Avatar from "./Avatar.jsx";
import { api } from "./services/api";
import {
  LayoutDashboard,
  Users,
  BriefcaseBusiness,
  CalendarDays,
  Files,
  CreditCard,
  Settings as SettingsIcon,
  Search,
  Bell,
  ArrowUpRight,
  Clock3,
  Menu,
  X,
  ChevronDown,
  Scale,
} from "lucide-react";
import "./app.css";

const navGroups = [
  {
    items: [
      { label: "Dashboard", page: "Dashboard", icon: LayoutDashboard },
      { label: "Clients", page: "Clients", icon: Users },
      { label: "Cases", page: "Cases", icon: BriefcaseBusiness },
      { label: "Hearings", page: "Appointments", icon: CalendarDays },
    ],
  },
  {
    heading: "Records",
    items: [
      { label: "Document Register", page: "Documents", icon: Files },
      { label: "Payments", page: "Billing", icon: CreditCard },
    ],
  },
  {
    heading: "Preferences",
    items: [
      { label: "Settings", page: "Settings", icon: SettingsIcon },
    ],
  },
];
const navigationItems = navGroups.flatMap(({ items }) => items);

const caseStatusClasses = {
  Active: "active",
  "In Progress": "in-progress",
  "Under Review": "under-review",
  Pending: "pending",
  Closed: "closed",
};

let dashboardSummaryRequest;

function requestDashboardSummary() {
  if (!dashboardSummaryRequest) {
    dashboardSummaryRequest = api.get("/dashboard/summary").finally(() => {
      dashboardSummaryRequest = null;
    });
  }
  return dashboardSummaryRequest;
}

function formatDashboardDate(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(date);
}

function formatDashboardTime(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(date);
}

function formatFees(value) {
  const amount = Number(value);
  return `KSh ${Number.isFinite(amount)
    ? amount.toLocaleString("en-US", { maximumFractionDigits: 2 })
    : "0"}`;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function DashboardSkeleton() {
  return (
    <div className="dashboard-skeleton" aria-label="Loading dashboard" aria-busy="true">
      <div className="dashboard-skeleton-stats">
        {Array.from({ length: 4 }, (_, index) => (
          <div className="panel skeleton-card" key={index}>
            <span />
            <span />
            <span />
          </div>
        ))}
      </div>
      <div className="dashboard-skeleton-panels">
        <div className="panel skeleton-panel"><span /><span /><span /><span /></div>
        <div className="panel skeleton-panel"><span /><span /><span /></div>
      </div>
    </div>
  );
}

function SummaryStat({ label, value, icon: Icon, detail }) {
  return (
    <article className="stat-card">
      <div className="stat-card-top">
        <div className="stat-icon"><Icon size={19} strokeWidth={1.7} /></div>
      </div>
      <p className="stat-label">{label}</p>
      <div className="stat-value">{value}</div>
      {detail && <div className="stat-detail">{detail}</div>}
    </article>
  );
}

function App() {
  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
    error: authError,
    login,
    logout,
    retryRestore,
  } = useAuth();
  const [activePage, setActivePage] = useState("Dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");
  const activePageLabel =
    navigationItems.find((item) => item.page === activePage)?.label ?? activePage;

  useEffect(() => {
    if (!userMenuOpen) return undefined;

    function closeOnOutsideClick(event) {
      if (!userMenuRef.current?.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }

    function closeOnEscape(event) {
      if (event.key === "Escape") setUserMenuOpen(false);
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [userMenuOpen]);

  async function loadDashboardSummary() {
    setDashboardLoading(true);
    setDashboardError("");

    try {
      setDashboardSummary(await requestDashboardSummary());
    } catch (error) {
      setDashboardError(`Could not load dashboard: ${error.message}`);
    } finally {
      setDashboardLoading(false);
    }
  }

  useEffect(() => {
    if (authLoading) return undefined;
    if (!isAuthenticated) return undefined;

    let isCurrent = true;

    requestDashboardSummary()
      .then((summary) => {
        if (isCurrent) setDashboardSummary(summary);
      })
      .catch((error) => {
        if (isCurrent) setDashboardError(`Could not load dashboard: ${error.message}`);
      })
      .finally(() => {
        if (isCurrent) setDashboardLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [authLoading, isAuthenticated]);

  const recentCases = dashboardSummary?.recentCases ?? [];
  const filteredCases = recentCases.filter((item) =>
    `${item.title ?? ""} ${item.clientName ?? ""} ${item.caseNumber ?? ""}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  function choosePage(page) {
    setActivePage(page);
    setMenuOpen(false);
  }

  if (authLoading) {
    return <main className="auth-page">Restoring your session...</main>;
  }

  if (authError) {
    return (
      <main className="auth-page">
        <p role="alert">{authError}</p>
        <button className="primary-button" onClick={retryRestore}>Retry</button>
        <button className="primary-button" onClick={logout}>Sign in again</button>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={login} />;
  }


  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <Scale size={25} strokeWidth={1.5} />
          </div>
          <div className="brand-copy">
            <span className="brand-name">LMK <span>Advocates</span></span>
            <span className="brand-subtitle">ATTORNEYS AT LAW</span>
          </div>
          <button
            className="icon-button mobile-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={19} />
          </button>
        </div>

        <nav className="navigation" aria-label="Main navigation">
          {navGroups.map(({ heading, items }) => (
            <div
              key={heading || "main"}
              className={`nav-group ${heading === "Preferences" ? "nav-group-preferences" : ""}`}
            >
              {heading && <div className="nav-group-heading">{heading}</div>}
              {items.map(({ label, page, icon: Icon }) => (
                <button
                  key={page}
                  className={`nav-item ${activePage === page ? "active" : ""}`}
                  onClick={() => choosePage(page)}
                >
                  <Icon size={19} strokeWidth={1.7} />
                  <span>{label}</span>
                  {page === "Cases" && <span className="nav-count">24</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-help">
          <div className="help-icon"><Scale size={18} /></div>
          <p>Need assistance?</p>
          <span>Contact your system administrator.</span>
          <button onClick={() => window.alert("Please contact your system administrator.")}>
            Get support <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="sidebar-profile">
          <Avatar fullName={user?.fullName} email={user?.email} className="avatar-gold" />
          <div className="profile-info">
            <strong>{user?.fullName ?? ""}</strong>
            <span>{user?.role ?? ""}</span>
          </div>
        </div>
      </aside>

      {menuOpen && (
        <button
          className="mobile-overlay"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button mobile-menu"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={21} />
            </button>
            <div className="breadcrumb">
              <span>Workspace</span>
              <span className="breadcrumb-slash">/</span>
              <strong>{activePageLabel}</strong>
            </div>
          </div>

          <div className="topbar-actions">
            <label className="search-box">
              <Search size={17} />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search cases..."
                aria-label="Search cases"
              />
              <kbd>⌘ K</kbd>
            </label>
            <div className="notification-wrap">
              <button
                className="icon-button notification-button"
                aria-label="Notifications"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={19} />
                <span className="notification-dot" />
              </button>
              {showNotifications && (
                <div className="notification-popover">
                  <strong>Notifications</strong>
                  <p>You have 2 items to review.</p>
                  <p className="notification-detail">Upcoming client consultation · Today</p>
                  <p className="notification-detail">Outstanding invoice requires follow-up</p>
                </div>
              )}
            </div>
            <div className="topbar-divider" />
            <div className="user-menu" ref={userMenuRef}>
              <button
                className="topbar-user"
                aria-label="Open account menu"
                aria-expanded={userMenuOpen}
                onClick={() => setUserMenuOpen((open) => !open)}
              >
                <Avatar fullName={user?.fullName} email={user?.email} className="avatar-dark" />
                <ChevronDown size={15} />
              </button>
              {userMenuOpen && (
                <div className="user-menu-popover">
                  <div className="user-menu-identity">
                    <strong>{user?.fullName}</strong>
                    <span className="user-menu-role">{user?.role}</span>
                    <span className="user-menu-email">{user?.email}</span>
                  </div>
                  <button
                    className="user-menu-action"
                    onClick={() => {
                      choosePage("Settings");
                      setUserMenuOpen(false);
                    }}
                  >
                    Settings
                  </button>
                  <button className="user-menu-action" onClick={logout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="page-content">
          {activePage === "Clients" ? (
            <Clients />
          ) 
          : activePage === "Cases" ? (
            <Cases />
          ) 
      : activePage === "Appointments" ? (
            <Appointments />
        )
           : activePage === "Documents" ? (
            <Documents />
          )
          : activePage === "Billing" ? (
            <Billing />
          )
          : activePage === "Settings" ? (
            <Settings />
          ) 
          : activePage === "Dashboard" ? (
            <>
              <section className="welcome-row">
                <div>
                  <div className="eyebrow"><span className="eyebrow-line" /> {getGreeting()}</div>
                  <h1>Welcome back<span>.</span></h1>
                </div>
              </section>

              {dashboardLoading ? (
                <DashboardSkeleton />
              ) : dashboardError ? (
                <section className="dashboard-error" role="alert">
                  <p>{dashboardError}</p>
                  <button className="primary-button" onClick={loadDashboardSummary}>
                    Retry
                  </button>
                </section>
              ) : dashboardSummary ? (
                <>
                  <section className="stats-grid" aria-label="Firm overview">
                    <SummaryStat
                      label="Active Cases"
                      value={dashboardSummary.activeCases}
                      icon={BriefcaseBusiness}
                    />
                    <SummaryStat
                      label="Total Clients"
                      value={dashboardSummary.totalClients}
                      icon={Users}
                    />
                    <SummaryStat
                      label="Upcoming Hearings"
                      value={dashboardSummary.upcomingHearingsCount}
                      icon={CalendarDays}
                      detail="Next 7 days"
                    />
                    <SummaryStat
                      label="Outstanding Fees"
                      value={formatFees(dashboardSummary.outstandingFees)}
                      icon={CreditCard}
                      detail={`${dashboardSummary.unpaidInvoicesCount} unpaid ${
                        dashboardSummary.unpaidInvoicesCount === 1 ? "invoice" : "invoices"
                      }`}
                    />
                  </section>

                  <section className="content-grid">
                    <article className="panel cases-panel">
                      <div className="panel-heading">
                        <div>
                          <h2>Recent cases</h2>
                          <p>A snapshot of your firm&apos;s ongoing matters.</p>
                        </div>
                        <button className="text-button" onClick={() => choosePage("Cases")}>
                          View all <ArrowUpRight size={15} />
                        </button>
                      </div>

                      <div className="table-scroll">
                        <table className="cases-table">
                          <thead>
                            <tr>
                              <th>CASE / CLIENT</th>
                              <th>CASE TYPE</th>
                              <th>NEXT DATE</th>
                              <th>STATUS</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredCases.length > 0 ? filteredCases.map((item) => (
                              <tr key={item.id}>
                                <td>
                                  <div className="case-name">{item.title}</div>
                                  <div className="case-id">{item.caseNumber} · {item.clientName}</div>
                                </td>
                                <td><span className="case-type">{item.caseType}</span></td>
                                <td>
                                  <span className="case-date">
                                    {item.nextHearingDate
                                      ? formatDashboardDate(item.nextHearingDate)
                                      : "No hearing scheduled"}
                                  </span>
                                </td>
                                <td>
                                  <span className={`status-pill ${caseStatusClasses[item.status] ?? ""}`}>
                                    <span className="status-dot" />{item.status}
                                  </span>
                                </td>
                              </tr>
                            )) : (
                              <tr>
                                <td colSpan="4" className="empty-state">
                                  No recent cases.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </article>

                    <article className="panel appointments-panel">
                      <div className="panel-heading">
                        <div>
                          <h2>Upcoming schedule</h2>
                          <p>Your upcoming hearings.</p>
                        </div>
                      </div>
                      <div className="appointments-list">
                        {dashboardSummary.upcomingHearings.length > 0 ? (
                          dashboardSummary.upcomingHearings.map((hearing) => (
                            <div className="appointment" key={hearing.id}>
                              <time
                                className="appointment-date"
                                dateTime={hearing.hearingDateTime}
                                aria-label={formatDashboardDate(hearing.hearingDateTime)}
                              >
                                <span>
                                  {new Date(hearing.hearingDateTime)
                                    .toLocaleDateString("en-GB", { month: "short" })
                                    .toUpperCase()}
                                </span>
                                <strong>
                                  {new Date(hearing.hearingDateTime)
                                    .toLocaleDateString("en-GB", { day: "2-digit" })}
                                </strong>
                                <small>
                                  {new Date(hearing.hearingDateTime)
                                    .toLocaleDateString("en-GB", { year: "numeric" })}
                                </small>
                              </time>
                              <div className="appointment-details">
                                <strong>{hearing.caseTitle}</strong>
                                <span>{hearing.clientName}</span>
                                <div className="appointment-time">
                                  <Clock3 size={13} />
                                  {formatDashboardTime(hearing.hearingDateTime)}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="empty-state">No upcoming hearings</p>
                        )}
                      </div>
                      <button className="schedule-button" onClick={() => choosePage("Appointments")}>
                        <CalendarDays size={16} /> Open calendar
                      </button>
                    </article>
                  </section>

                  <section className="quick-actions panel">
                    <div>
                      <h2>Quick actions</h2>
                    </div>
                    <div className="quick-action-buttons">
                      <button onClick={() => choosePage("Clients")}><Users size={16} /> Add client</button>
                      <button onClick={() => choosePage("Appointments")}><CalendarDays size={16} /> Schedule hearing</button>
                    </div>
                  </section>
                </>
              ) : null}
            </>
          ) : (
            <section className="placeholder-page panel">
              <div className="placeholder-icon">
                {(() => {
                  const ItemIcon = navigationItems.find((item) => item.page === activePage)?.icon || SettingsIcon;
                  return <ItemIcon size={28} />;
                })()}
              </div>
              <span className="eyebrow">LMK Advocates</span>
              <h1>{activePage}</h1>
              <p>
                The {activePage.toLowerCase()} workspace is ready for us to build next.
                This is a demonstration interface; records shown on the dashboard are sample data.
              </p>
              <button className="primary-button" onClick={() => choosePage("Dashboard")}>
                <LayoutDashboard size={16} /> Back to dashboard
              </button>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;