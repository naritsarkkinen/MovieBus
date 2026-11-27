
import { sections } from "../data/adminData";

export default function AdminSidebar({ tab, setTab, data }) {
  return (
    <aside className="adm-sidebar">
      <div className="adm-brand">
        <span className="adm-logo">✦</span>
        <div>
          <strong>MOVIEBUS</strong>
          <small>CONTROL CENTER</small>
        </div>
      </div>

      <p className="adm-caption">MANAGEMENT</p>

      <nav aria-label="Admin sections">
        {Object.entries(sections).map(([key, item]) => (
          <button
            key={key}
            type="button"
            className={tab === key ? "selected" : ""}
            onClick={() => setTab(key)}
          >
            <span>{item.icon}</span>
            {item.label}
            <small>{data[key]?.length ?? 0}</small>
          </button>
        ))}
      </nav>

      <div className="adm-sidebar-bottom">
        ● Demo environment
      </div>
    </aside>
  );
}
