import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, AlertTriangle } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm]       = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const ok = await login(form.username.trim(), form.password);
    if (!ok) {
      setError('Usuario o contraseña incorrectos.');
      setLoading(false);
    }
  }

  function handleChange(field, value) {
    setForm(f => ({ ...f, [field]: value }));
    setError('');
  }

  return (
    <div className="login-page">
      <div className="login-card">

        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">
            <AlertTriangle size={34} color="white" />
          </div>
          <h1>SIPGIMED</h1>
          <p>Sistema de Gestión de Inventario Farmacéutico</p>
        </div>

        {/* Form */}
        <div className="login-form">
          <h2>Iniciar Sesión</h2>

          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Usuario</label>
              <input
                className="form-input"
                placeholder="Ingrese su usuario"
                value={form.username}
                onChange={e => handleChange('username', e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <div className="password-wrapper">
                <input
                  className="form-input"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Ingrese su contraseña"
                  value={form.password}
                  onChange={e => handleChange('password', e.target.value)}
                  disabled={loading}
                />
                <button type="button" className="password-toggle" onClick={() => setShowPass(s => !s)}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Verificando...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Credentials hint */}
          <div className="credentials-box">
            <div className="credentials-title">Credenciales de prueba:</div>
            {[
              ['Admin',    'admin / admin123'],
              ['Farmacia', 'farmacia / farmacia123'],
              ['Jefatura', 'jefatura / jefatura123'],
              ['Almacén',  'almacen / almacen123'],
              ['Logística','logistica / logistica123'],
            ].map(([role, cred]) => (
              <div key={role} className="credential-row">
                <span className="credential-role">{role}:</span>
                <span className="credential-value">{cred}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
