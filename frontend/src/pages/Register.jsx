import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password || !confirm) return setError('All fields required');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    if (password !== confirm) return setError('Passwords do not match');
    setLoading(true);
    try {
      await auth.register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <section className="glass-section">
      <h2>Register</h2>
      {error && <div className="nearby-error">{error}</div>}
      <form onSubmit={submit} className="disaster-form">
        <label>Full name<input className="bubble-input" value={name} onChange={e=>setName(e.target.value)} required /></label>
        <label>Email<input className="bubble-input" value={email} onChange={e=>setEmail(e.target.value)} type="email" required /></label>
        <label>Password<input className="bubble-input" value={password} onChange={e=>setPassword(e.target.value)} type="password" required /></label>
        <label>Confirm Password<input className="bubble-input" value={confirm} onChange={e=>setConfirm(e.target.value)} type="password" required /></label>
        <button className="location-button report-btn" type="submit" disabled={loading}>{loading? 'Registering...' : 'Register'}</button>
      </form>
    </section>
  );
}
