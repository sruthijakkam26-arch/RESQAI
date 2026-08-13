import { useState } from "react";
import { useAuth } from "../AuthContext";

export default function Account() {
  const auth = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setMessage("");
    if (newPassword !== confirmPassword) return setMessage("New passwords do not match.");
    setLoading(true);
    try {
      await auth.changePassword(currentPassword, newPassword);
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      setMessage("Password updated successfully.");
    } catch (error) { setMessage(error.message || "Unable to update password."); }
    finally { setLoading(false); }
  };

  return <section className="glass-section account-page">
    <p className="landing-kicker">ACCOUNT SETTINGS</p>
    <h2>Your account</h2>
    <div className="account-details"><div><span>Name</span><strong>{auth.user?.name}</strong></div><div><span>Email</span><strong>{auth.user?.email}</strong></div></div>
    <div className="security-divider"></div>
    <h3>Security settings</h3>
    <p className="account-intro">Use a strong, unique password to keep your emergency reports secure.</p>
    {message && <div className="account-message">{message}</div>}
    <form className="disaster-form" onSubmit={submit}>
      <label>Current password<input className="bubble-input" type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required /></label>
      <label>New password<input className="bubble-input" type="password" minLength="6" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required /></label>
      <label>Confirm new password<input className="bubble-input" type="password" minLength="6" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required /></label>
      <button type="submit" className="location-button report-btn" disabled={loading}>{loading ? "Updating…" : "Update password"}</button>
    </form>
  </section>;
}
