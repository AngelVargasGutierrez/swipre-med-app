import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Pill, ClipboardList, Bell,
  LogOut, AlertTriangle, FileText, BarChart2, Users,
} from 'lucide-react';

const ALL_ITEMS = [
  { key:'dashboard',      label:'Dashboard',          icon:LayoutDashboard },
  { key:'medicamentos',   label:'Medicamentos',        icon:Pill            },
  { key:'inventario',     label:'Control Inventario',  icon:ClipboardList   },
  { key:'analytics',      label:'Analytics Inteligente', icon:BarChart2     },

  { key:'reportes',       label:'Reportes',            icon:FileText        },
  { key:'usuarios',       label:'Usuarios',            icon:Users           },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPage = location.pathname.split('/')[1] || 'dashboard';

  const items = ALL_ITEMS.filter(i => user.menu.includes(i.key));

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <AlertTriangle size={22} />
        </div>
        <div className="sidebar-logo-text">
          <h2>SIPGIMED</h2>
          <span>Sistema de Inventario</span>
        </div>
      </div>

      {/* User info */}
      <div className="sidebar-user">
        <div className="sidebar-user-greeting">Bienvenido/a</div>
        <div className="sidebar-user-name">{user.name}</div>
        <div className="sidebar-user-role">{user.roleLabel}</div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {items.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`nav-item${currentPage === key ? ' active' : ''}`}
            onClick={() => navigate(`/${key}`)}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={logout}>
          <LogOut size={18} />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
