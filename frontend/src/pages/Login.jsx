import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await auth.login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <section className="glass-section">
      <h2>Login</h2>
      {error && <div className="nearby-error">{error}</div>}
      <form onSubmit={submit} className="disaster-form">
        <label>Email<input className="bubble-input" value={email} onChange={e=>setEmail(e.target.value)} type="email" required /></label>
        <label>Password<input className="bubble-input" value={password} onChange={e=>setPassword(e.target.value)} type="password" required /></label>
        <button className="location-button report-btn" type="submit" disabled={loading}>{loading? 'Signing in...' : 'Login'}</button>
      </form>
    </section>
  );
}
