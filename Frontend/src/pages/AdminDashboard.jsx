
import { useEffect, useState } from "react";
import { initialData } from "../data/adminData";
import AdminSidebar from "../components/AdminSidebar";
import AdminTable from "../components/AdminTable";
import "./AdminDashboard.css";

const initialReviews = initialData.reviews;

export default function AdminDashboard({ open = true, onClose }) {
  const [visible, setVisible] = useState(open);
  const [reviews, setReviews] = useState(initialReviews);
  const [search, setSearch] = useState("");

  useEffect(() => setVisible(open), [open]);

  useEffect(() => {
    if (!visible) return;

    const handleKey = (e) => {
      if (e.key === "Escape") {
        e.stopImmediatePropagation();
        setVisible(false);
        onClose?.();
      } else if (/^(w|a|s|d|ArrowUp|ArrowDown|ArrowLeft|ArrowRight)$/i.test(e.key)) {
        e.stopImmediatePropagation();
      }
    };

    window.addEventListener("keydown", handleKey, true);
    return () => window.removeEventListener("keydown", handleKey, true);
  }, [visible, onClose]);

  const close = () => {
    setVisible(false);
    onClose?.();
  };

  const stats = [
    ["Total Reviews", initialReviews.length],
    ["Visible Reviews", reviews.length],
    ["Movies Reviewed", new Set(reviews.map((r) => r.movie)).size],
    ["Deleted in Demo", initialReviews.length - reviews.length],
  ];

  if (!visible) {
    return onClose ? null : (
      <div className="adm-launch">
        <button type="button" onClick={() => setVisible(true)}>
          {"\u2726"} Open Admin Control Center
        </button>
      </div>
    );
  }

  return (
    <div className="adm-overlay"
      onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div className="adm-modal" role="dialog" aria-modal="true"
        aria-label="MovieBus Admin Control Center">

        <AdminSidebar
          tab="reviews"
          setTab={() => setSearch("")}
          data={{ reviews }}
        />

        <main className="adm-content">
          <header className="adm-header">
            <div>
              <p className="adm-caption">MOVIEVERSE / ADMINISTRATION</p>
              <h1>Mission Control <span>{"\u2726"}</span></h1>
              <p>Manage MovieBus community reviews.</p>
            </div>

            <div className="adm-header-actions">
              <span className="adm-demo">DEMO MODE</span>
              <button type="button" className="adm-close"
                onClick={close} aria-label="Close dashboard">
                {"\u00D7"}
              </button>
            </div>
          </header>

          <section className="adm-stats">
            {stats.map(([label, value]) => (
              <div className="adm-stat" key={label}>
                <div><span>{label}</span><b>{"\u2606"}</b></div>
                <strong>{String(value).padStart(2, "0")}</strong>
                <small>Demo statistics</small>
              </div>
            ))}
          </section>

          <AdminTable
            reviews={reviews}
            setReviews={setReviews}
            search={search}
            setSearch={setSearch}
          />

          <p className="adm-footer">
            {"\u2726"} MOVIEBUS ADMIN CONTROL CENTER {"\u00B7"} PROTOTYPE
          </p>
        </main>
      </div>
    </div>
  );
}
