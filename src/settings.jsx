import { useState } from "react";
import {
  UserRound,
  ShieldCheck,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";
import Avatar from "./Avatar.jsx";
import { useAuth } from "./useAuth.js";
import { api } from "./services/api";
import "./settings.css";

const blankPasswords = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const passwordFields = [
  { label: "Current password", key: "currentPassword" },
  { label: "New password", key: "newPassword" },
  { label: "Confirm new password", key: "confirmPassword" },
];

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Profile");
  const [passwords, setPasswords] = useState(blankPasswords);
  const [visibleFields, setVisibleFields] = useState({});
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  async function changePassword(event) {
    event.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwords.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }
    if (passwords.newPassword === passwords.currentPassword) {
      setPasswordError("New password must differ from the current password.");
      return;
    }

    setIsChangingPassword(true);
    try {
      await api.put("/auth/change-password", {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords(blankPasswords);
      setPasswordSuccess("Your password was updated successfully.");
    } catch (error) {
      setPasswordError(error.message);
    } finally {
      setIsChangingPassword(false);
    }
  }

  const tabs = [
    { name: "Profile", icon: UserRound },
    { name: "Security", icon: ShieldCheck },
  ];

  return (
    <div className="settings-page">
      <div className="settings-heading">
        <div>
          <p className="settings-eyebrow">ACCOUNT</p>
          <h1>Settings</h1>
        </div>
      </div>

      <div className="settings-layout">
        <aside className="settings-sidebar">
          <div className="settings-sidebar-title">ACCOUNT SETTINGS</div>

          {tabs.map(({ name, icon: Icon }) => (
            <button
              key={name}
              className={`settings-tab ${activeTab === name ? "active" : ""}`}
              onClick={() => setActiveTab(name)}
            >
              <Icon size={18} />
              <span>{name}</span>
            </button>
          ))}
        </aside>

        <section className="settings-content">
          {activeTab === "Profile" && (
            <div>
              <div className="settings-section-heading">
                <h2>Profile Information</h2>
              </div>

              <div className="settings-profile">
                <Avatar
                  fullName={user?.fullName}
                  email={user?.email}
                  className="settings-avatar"
                />
                <div className="settings-profile-identity">
                  <h3>{user?.fullName ?? ""}</h3>
                  <span className="settings-role-badge">{user?.role ?? ""}</span>
                </div>
              </div>

              <div className="settings-form-grid">
                <div className="settings-field">
                  <label htmlFor="settings-full-name">Full name</label>
                  <input
                    id="settings-full-name"
                    value={user?.fullName ?? ""}
                    readOnly
                  />
                </div>
                <div className="settings-field">
                  <label htmlFor="settings-email">Email address</label>
                  <input
                    id="settings-email"
                    type="email"
                    value={user?.email ?? ""}
                    readOnly
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "Security" && (
            <form onSubmit={changePassword}>
              <div className="settings-section-heading">
                <h2>Security Settings</h2>
              </div>

              <div className="settings-security-note">
                <ShieldCheck size={19} />
                <span>Keep your account secure by using a strong, unique password.</span>
              </div>

              {passwordFields.map(({ label, key }) => (
                <div className="settings-field settings-password-field" key={key}>
                  <label htmlFor={`settings-${key}`}>{label}</label>
                  <div className="settings-password-input">
                    <input
                      id={`settings-${key}`}
                      type={visibleFields[key] ? "text" : "password"}
                      value={passwords[key]}
                      onChange={(event) => {
                        setPasswords((current) => ({
                          ...current,
                          [key]: event.target.value,
                        }));
                        setPasswordError("");
                        setPasswordSuccess("");
                      }}
                      autoComplete={key === "currentPassword" ? "current-password" : "new-password"}
                      required
                      minLength={key === "newPassword" ? 8 : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setVisibleFields((current) => ({
                        ...current,
                        [key]: !current[key],
                      }))}
                      aria-label={`${visibleFields[key] ? "Hide" : "Show"} ${label.toLowerCase()}`}
                    >
                      {visibleFields[key] ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {key === "newPassword" && (
                    <p className={`settings-requirement ${
                      passwords.newPassword.length >= 8 ? "met" : ""
                    }`}>
                      At least 8 characters
                    </p>
                  )}
                </div>
              ))}

              {passwordError && (
                <p className="settings-message settings-error" role="alert">
                  {passwordError}
                </p>
              )}
              {passwordSuccess && (
                <div className="settings-message settings-success" role="status">
                  <Check size={17} /> {passwordSuccess}
                </div>
              )}

              <div className="settings-save-row">
                <button
                  type="submit"
                  className="settings-save-btn"
                  disabled={isChangingPassword}
                >
                  <ShieldCheck size={16} />
                  {isChangingPassword ? "Updating..." : "Update password"}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
