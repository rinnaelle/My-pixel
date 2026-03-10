// ╔══════════════════════════════════════════════════════════════╗
// ║  MonEntreprise — Carnet Pro                                  ║
// ║  Pour activer l'IA : ajoute dans Lovable                     ║
// ║  Settings → Environment Variables →                          ║
// ║  VITE_ANTHROPIC_KEY = sk-ant-xxxxxxxxxxxx                    ║
// ╚══════════════════════════════════════════════════════════════╝
import { useState, useEffect } from "react";

// ── DESIGN TOKENS — Palette Cuir Luxe ─────────────────────────────────────────
const C = {
  bg:           "#f5f0ef",
  card:         "#fffcf8",
  primary:      "#523237",
  primaryHover: "#3d2429",
  primaryLight: "#ede5e3",
  accent:       "#b49786",
  accentLight:  "#f0e8e4",
  green:        "#5a7a5e",
  greenLight:   "#e8f0e9",
  yellow:       "#b8924a",
  yellowLight:  "#f5ead8",
  purple:       "#7F5A68",
  purpleLight:  "#f0e8ed",
  red:          "#8b3a3a",
  redLight:     "#f5e5e5",
  text:         "#130800",
  sub:          "#a89f98",
  border:       "#e5ddd9",
  borderDark:   "#d4beb2",
};

const TABS = [
  { id: "home",      label: "Accueil",     icon: "⌂"  },
  { id: "parcours",  label: "Création",    icon: "🚀" },
  { id: "finances",  label: "Finance",     icon: "💰" },
  { id: "contacts",  label: "Contacts",    icon: "👥" },
  { id: "factures",  label: "Factures",    icon: "🧾" },
  { id: "taches",    label: "Tâches",      icon: "✅" },
  { id: "compte",    label: "Mon Compte",  icon: "👤" },
];

// ── SHARED COMPONENTS ─────────────────────────────────────────────────────────
function Card({ children, style = {} }) {
  return (
    <div style={{ background: C.card, borderRadius: 18, border: `1px solid ${C.border}`, padding: "20px", ...style }}>
      {children}
    </div>
  );
}

function Tag({ label, color, bg }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: bg, color }}>
      {label}
    </span>
  );
}

function SectionHead({ title, action, actionLabel }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
      <h2 style={{ fontSize: 14, fontWeight: 800, color: C.text, margin: 0, letterSpacing: "-0.3px" }}>{title}</h2>
      {action && (
        <button onClick={action} style={{ fontSize: 12, fontWeight: 700, color: C.primary, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          {actionLabel} →
        </button>
      )}
    </div>
  );
}

// ── HOME PAGE ─────────────────────────────────────────────────────────────────
function HomePage({ setTab, tasks, setTasks, notifs, setNotifs, profil, PLAN }) {
  // tasks & setTasks viennent des props App (état global)
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editTask, setEditTask]           = useState(null);
  const [newText, setNewText]             = useState("");
  const [newPriority, setNewPriority]     = useState("medium");
  const [newCat, setNewCat]               = useState("Création");
  const [newDue, setNewDue]               = useState("");

  // notifs & setNotifs viennent des props App (état global)
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [newNotifText, setNewNotifText]     = useState("");
  const [newNotifType, setNewNotifType]     = useState("info");
  const [newNotifDue, setNewNotifDue]       = useState("");

  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

  const greeting = () => { const h = time.getHours(); if (h < 12) return "Bonjour 🌅"; if (h < 18) return "Bon après-midi ☀️"; return "Bonsoir 🌙"; };
  const formatDate = iso => { if (!iso) return ""; return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }); };
  const joursRestants = iso => { if (!iso) return null; return Math.ceil((new Date(iso) - new Date()) / 86400000); };

  const toggleTask = id => setTasks(p => p.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const deleteTask = id => setTasks(p => p.filter(t => t.id !== id));
  const openNewTask = () => { setEditTask(null); setNewText(""); setNewPriority("medium"); setNewCat("Création"); setNewDue(""); setShowTaskModal(true); };
  const openEditTask = task => { setEditTask(task); setNewText(task.text); setNewPriority(task.priority); setNewCat(task.cat); setNewDue(task.echeance || ""); setShowTaskModal(true); };
  const saveTask = () => {
    if (!newText.trim()) return;
    if (editTask) setTasks(p => p.map(t => t.id === editTask.id ? { ...t, text: newText, priority: newPriority, cat: newCat, echeance: newDue } : t));
    else setTasks(p => [...p, { id: Date.now(), text: newText, priority: newPriority, cat: newCat, echeance: newDue, done: false }]);
    setShowTaskModal(false);
  };
  const dismissNotif = id => setNotifs(p => p.map(n => n.id === id ? { ...n, dismissed: true } : n));
  const saveNotif = () => {
    if (!newNotifText.trim()) return;
    setNotifs(p => [...p, { id: Date.now(), text: newNotifText, type: newNotifType, due: newNotifDue, dismissed: false }]);
    setNewNotifText(""); setNewNotifType("info"); setNewNotifDue(""); setShowNotifModal(false);
  };

  const activeTasks  = tasks.filter(t => !t.done);
  const doneTasks    = tasks.filter(t => t.done);
  const urgentTasks  = activeTasks.filter(t => t.priority === "high");
  const pct          = tasks.length ? Math.round(doneTasks.length / tasks.length * 100) : 0;
  const activeNotifs = notifs.filter(n => !n.dismissed);

  const shortcuts = [
    { icon: "🚀", label: "Création",  color: C.primary, bg: C.primaryLight, tab: "parcours" },
    { icon: "💰", label: "Finance",   color: C.green,   bg: C.greenLight,   tab: "finances" },
    { icon: "👥", label: "Contacts",  color: C.purple,  bg: C.purpleLight,  tab: "contacts" },
    { icon: "🧾", label: "Factures",  color: C.accent,  bg: C.accentLight,  tab: "factures" },
  ];
  const notifStyle = {
    warn:    { bg: C.yellowLight, border: "#FDE68A", icon: "⚠️" },
    info:    { bg: C.primaryLight,border: "#BFDBFE", icon: "💡" },
    success: { bg: C.greenLight,  border: "#BBF7D0", icon: "🎉" },
    alert:   { bg: C.redLight,    border: "#FECACA", icon: "🔔" },
  };
  const catColor = { Création: C.primary, Légal: C.purple, Finance: C.green, Marketing: C.accent, Admin: C.yellow };
  const catBg    = { Création: C.primaryLight, Légal: C.purpleLight, Finance: C.greenLight, Marketing: C.accentLight, Admin: C.yellowLight };
  const priColor = { high: C.red,     medium: C.yellow, low: C.primary };
  const priBg    = { high: "#FEE2E2", medium: C.yellowLight, low: C.primaryLight };
  const priLabel = { high: "Urgent",  medium: "Moyen",  low: "Normal" };

  const InputRow = ({ label, value, onChange, placeholder, type = "text" }) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: C.sub, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", padding: "11px 13px", borderRadius: 11, border: `1.5px solid ${C.border}`, fontSize: 13, fontFamily: "inherit", boxSizing: "border-box", color: C.text, outline: "none", background: C.bg }} />
    </div>
  );
  const SelectRow = ({ label, value, onChange, options }) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: C.sub, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ width: "100%", padding: "11px 13px", borderRadius: 11, border: `1.5px solid ${C.border}`, fontSize: 13, fontFamily: "inherit", boxSizing: "border-box", color: C.text, outline: "none", background: C.bg }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );

  return (
    <div style={{ padding: "22px 18px 40px", display: "flex", flexDirection: "column", gap: 26 }}>

      {/* Greeting */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ fontSize: 13, color: C.sub, margin: "0 0 3px" }}>{greeting()}</p>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: C.text, margin: "0 0 2px", fontFamily: "'Cormorant Garamond', 'Cormorant Garamond', 'Playfair Display', Georgia, serif", lineHeight: 1.1, letterSpacing: "-0.3px" }}>
            {profil?.nom || "Tableau de bord"}
          </h1>
          <p style={{ fontSize: 12, color: C.sub, margin: 0 }}>
            {time.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
            {" · "}{time.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <div style={{ background: C.primaryLight, borderRadius: 14, padding: "12px 16px", textAlign: "center", minWidth: 72, border: `1px solid ${C.borderDark}` }}>
          <p style={{ fontSize: 26, fontWeight: 700, color: C.primary, margin: 0, lineHeight: 1, fontFamily: "'Cormorant Garamond', serif" }}>{activeTasks.length}</p>
          <p style={{ fontSize: 10, color: C.accent, fontWeight: 700, margin: "3px 0 0", textTransform: "uppercase", letterSpacing: "0.8px" }}>tâche{activeTasks.length !== 1 ? "s" : ""}<br/>en cours</p>
        </div>
      </div>

      {/* Raccourcis */}
      <div>
        <SectionHead title="Accès rapide" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {shortcuts.map(s => (
            <button key={s.tab} onClick={() => setTab(s.tab)}
              style={{ background: s.bg, border: `1.5px solid ${s.color}22`, borderRadius: 16, padding: "16px 14px", cursor: "pointer", textAlign: "left", transition: "transform 0.12s, box-shadow 0.12s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 18px rgba(0,0,0,0.09)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{ fontSize: 26, marginBottom: 6, lineHeight: 1 }}>{s.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: s.color }}>{s.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Rappels */}
      <div>
        <SectionHead title="Rappels & Notifications" action={() => setShowNotifModal(true)} actionLabel="+ Ajouter" />
        {activeNotifs.length === 0 && (
          <div style={{ background: C.card, border: `1.5px dashed ${C.border}`, borderRadius: 14, padding: "22px", textAlign: "center" }}>
            <p style={{ fontSize: 22, margin: "0 0 6px" }}>✅</p>
            <p style={{ fontSize: 13, color: C.sub, margin: 0 }}>Aucun rappel actif</p>
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {activeNotifs.map(n => {
            const s = notifStyle[n.type] || notifStyle.info;
            const jours = joursRestants(n.due);
            return (
              <div key={n.id} style={{ background: s.bg, border: `1.5px solid ${s.border}`, borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{s.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, color: C.text, margin: 0, lineHeight: 1.45, fontWeight: 500 }}>{n.text}</p>
                  {n.due && <p style={{ fontSize: 11, color: jours !== null && jours <= 3 ? C.red : C.sub, margin: "4px 0 0", fontWeight: 600 }}>📅 {formatDate(n.due)}{jours !== null && jours >= 0 ? ` · dans ${jours} jour${jours !== 1 ? "s" : ""}` : ""}</p>}
                </div>
                <button onClick={() => dismissNotif(n.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: C.sub, padding: 0, flexShrink: 0 }}>×</button>
              </div>
            );
          })}
        </div>
      </div>

      {/* To-do */}
      <div>
        <SectionHead title="Ma liste de tâches" action={openNewTask} actionLabel="+ Ajouter" />
        <Card style={{ marginBottom: 14, padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.sub }}>{doneTasks.length} / {tasks.length} terminées</span>
            <span style={{ fontSize: 15, fontWeight: 900, color: pct === 100 ? C.green : C.primary }}>{pct}%</span>
          </div>
          <div style={{ background: C.bg, borderRadius: 8, height: 8 }}>
            <div style={{ background: pct === 100 ? `linear-gradient(90deg,${C.green},#4ADE80)` : `linear-gradient(90deg,${C.primary},#4F6FEC)`, borderRadius: 8, height: 8, width: `${pct}%`, transition: "width 0.5s ease" }} />
          </div>
          {urgentTasks.length > 0 && <p style={{ fontSize: 11, color: C.red, margin: "8px 0 0", fontWeight: 600 }}>🔴 {urgentTasks.length} tâche{urgentTasks.length > 1 ? "s urgentes" : " urgente"}</p>}
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {activeTasks.map(t => (
            <div key={t.id} style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 13, padding: "12px 13px", display: "flex", alignItems: "flex-start", gap: 11 }}>
              <button onClick={() => toggleTask(t.id)} style={{ width: 22, height: 22, borderRadius: 7, flexShrink: 0, background: "transparent", border: `2px solid ${C.borderDark}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", marginTop: 1 }} />
              <div onClick={() => openEditTask(t)} style={{ flex: 1, minWidth: 0, cursor: "pointer" }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: C.text, margin: "0 0 5px", lineHeight: 1.4 }}>{t.text}</p>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  <Tag label={t.cat} color={catColor[t.cat] || C.sub} bg={catBg[t.cat] || C.bg} />
                  <Tag label={priLabel[t.priority]} color={priColor[t.priority]} bg={priBg[t.priority]} />
                  {t.echeance && <Tag label={`📅 ${formatDate(t.echeance)}`} color={joursRestants(t.echeance) !== null && joursRestants(t.echeance) <= 2 ? C.red : C.sub} bg={joursRestants(t.echeance) !== null && joursRestants(t.echeance) <= 2 ? "#FEE2E2" : C.bg} />}
                </div>
              </div>
              <button onClick={() => deleteTask(t.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: C.borderDark, padding: 0, flexShrink: 0 }}>×</button>
            </div>
          ))}

          {doneTasks.length > 0 && (
            <details style={{ marginTop: 4 }}>
              <summary style={{ fontSize: 12, fontWeight: 700, color: C.sub, cursor: "pointer", padding: "6px 0", listStyle: "none" }}>▸ {doneTasks.length} tâche{doneTasks.length > 1 ? "s" : ""} terminée{doneTasks.length > 1 ? "s" : ""}</summary>
              <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 8 }}>
                {doneTasks.map(t => (
                  <div key={t.id} style={{ background: C.greenLight, border: `1.5px solid #BBF7D0`, borderRadius: 13, padding: "11px 13px", display: "flex", alignItems: "center", gap: 11 }}>
                    <button onClick={() => toggleTask(t.id)} style={{ width: 22, height: 22, borderRadius: 7, flexShrink: 0, background: C.green, border: `2px solid ${C.green}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                      <span style={{ color: "white", fontSize: 12, fontWeight: 900 }}>✓</span>
                    </button>
                    <p style={{ fontSize: 13, color: C.sub, margin: 0, textDecoration: "line-through", flex: 1 }}>{t.text}</p>
                    <button onClick={() => deleteTask(t.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: C.borderDark, padding: 0 }}>×</button>
                  </div>
                ))}
              </div>
            </details>
          )}

          <button onClick={openNewTask}
            style={{ background: "transparent", border: `2px dashed ${C.border}`, borderRadius: 13, padding: "11px 14px", cursor: "pointer", fontSize: 13, color: C.sub, fontWeight: 600, textAlign: "left", display: "flex", alignItems: "center", gap: 8, transition: "border-color 0.15s, color 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.color = C.primary; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border;  e.currentTarget.style.color = C.sub; }}
          >
            <span style={{ fontSize: 18 }}>+</span> Ajouter une tâche…
          </button>
        </div>
      </div>

      {/* Modal Tâche */}
      {showTaskModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={() => setShowTaskModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.card, borderRadius: "24px 24px 0 0", padding: "24px 20px 40px", width: "100%", maxWidth: 520, maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ width: 36, height: 4, background: C.border, borderRadius: 4, margin: "0 auto 18px" }} />
            <h3 style={{ fontSize: 17, fontWeight: 900, color: C.text, margin: "0 0 18px", fontFamily: "'Cormorant Garamond', 'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}>{editTask ? "Modifier la tâche" : "Nouvelle tâche"}</h3>
            <InputRow label="Description" value={newText} onChange={setNewText} placeholder="Ex : Rédiger mes CGV…" />
            <SelectRow label="Priorité" value={newPriority} onChange={setNewPriority} options={[{ value: "high", label: "🔴 Urgent" }, { value: "medium", label: "🟡 Moyen" }, { value: "low", label: "🔵 Normal" }]} />
            <SelectRow label="Catégorie" value={newCat} onChange={setNewCat} options={[{ value: "Création", label: "🚀 Création" }, { value: "Légal", label: "⚖️ Légal" }, { value: "Finance", label: "💰 Finance" }, { value: "Marketing", label: "📣 Marketing" }, { value: "Admin", label: "📋 Admin" }]} />
            <InputRow label="Échéance (optionnel)" value={newDue} onChange={setNewDue} placeholder="" type="date" />
            <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
              <button onClick={() => setShowTaskModal(false)} style={{ flex: 1, padding: "13px", background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", color: C.text }}>Annuler</button>
              <button onClick={saveTask} style={{ flex: 2, padding: "13px", background: C.primary, border: "none", borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: "pointer", color: "white" }}>{editTask ? "Enregistrer" : "Ajouter"}</button>
            </div>
            {editTask && <button onClick={() => { deleteTask(editTask.id); setShowTaskModal(false); }} style={{ width: "100%", marginTop: 10, padding: "11px", background: "#FEE2E2", border: `1.5px solid #FECACA`, borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", color: C.red }}>🗑 Supprimer cette tâche</button>}
          </div>
        </div>
      )}

      {/* Modal Rappel */}
      {showNotifModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={() => setShowNotifModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.card, borderRadius: "24px 24px 0 0", padding: "24px 20px 40px", width: "100%", maxWidth: 520, maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ width: 36, height: 4, background: C.border, borderRadius: 4, margin: "0 auto 18px" }} />
            <h3 style={{ fontSize: 17, fontWeight: 900, color: C.text, margin: "0 0 18px", fontFamily: "'Cormorant Garamond', 'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}>Nouveau rappel</h3>
            <InputRow label="Message" value={newNotifText} onChange={setNewNotifText} placeholder="Ex : Appeler mon comptable…" />
            <SelectRow label="Type" value={newNotifType} onChange={setNewNotifType} options={[{ value: "info", label: "💡 Information" }, { value: "warn", label: "⚠️ Avertissement" }, { value: "success", label: "🎉 Succès" }, { value: "alert", label: "🔔 Alerte" }]} />
            <InputRow label="Date limite (optionnel)" value={newNotifDue} onChange={setNewNotifDue} placeholder="" type="date" />
            <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
              <button onClick={() => setShowNotifModal(false)} style={{ flex: 1, padding: "13px", background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", color: C.text }}>Annuler</button>
              <button onClick={saveNotif} style={{ flex: 2, padding: "13px", background: C.primary, border: "none", borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: "pointer", color: "white" }}>Ajouter le rappel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── PARCOURS PAGE (IA intégrée) ───────────────────────────────────────────────
const CREATION_STEPS = [
  { id: 1, icon: "💡", label: "Mon Idée",      color: C.primary  },
  { id: 2, icon: "🎯", label: "Mes Clients",   color: C.purple   },
  { id: 3, icon: "✨", label: "Ma Marque",     color: C.accent   },
  { id: 4, icon: "⚖️", label: "Statut Légal",  color: C.green    },
  { id: 5, icon: "📋", label: "Business Plan", color: "#0F172A"  },
];

async function callClaude(prompt) {
  // ✏️ COLLE TA CLÉ API ICI (commence par sk-ant-...)
  const apiKey = "VOTRE_CLE_API_ICI";
  if (!apiKey || apiKey === "VOTRE_CLE_API_ICI") {
    return "⚠️ Clé API manquante. Remplace VOTRE_CLE_API_ICI par ta clé Anthropic dans le code.";
  }
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20251022",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return `⚠️ Erreur API (${res.status}) : ${err?.error?.message || "Vérife ta clé API."}`;
    }
    const data = await res.json();
    return data.content?.[0]?.text || "Erreur lors de la génération.";
  } catch (e) {
    return "⚠️ Erreur réseau. Vérifie ta connexion.";
  }
}

function AIButton({ label, onClick, loading }) {
  return (
    <button onClick={onClick} disabled={loading} style={{
      width: "100%", padding: "13px", marginTop: 8,
      background: loading ? C.sub : `linear-gradient(135deg, ${C.primary} 0%, #3B62E8 100%)`,
      border: "none", borderRadius: 13, color: "white",
      fontSize: 13, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    }}>
      {loading ? <><span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⟳</span> Génération en cours…</> : <>✨ {label}</>}
    </button>
  );
}

function AIResult({ content, onUse }) {
  if (!content) return null;
  return (
    <div style={{ background: C.primaryLight, border: `1.5px solid #BFDBFE`, borderRadius: 13, padding: "14px 16px", marginTop: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: C.primary, textTransform: "uppercase", letterSpacing: 0.5 }}>✨ Résultat IA</span>
        {onUse && <button onClick={onUse} style={{ fontSize: 11, fontWeight: 700, color: C.primary, background: "white", border: `1px solid ${C.primary}`, borderRadius: 8, padding: "3px 10px", cursor: "pointer" }}>Utiliser →</button>}
      </div>
      <p style={{ fontSize: 13, color: C.text, margin: 0, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{content}</p>
    </div>
  );
}

function CreationChips({ items, selected, onToggle, color, bg, multi = false }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
      {items.map(v => {
        const active = multi ? selected.includes(v) : selected === v;
        return (
          <button key={v} onClick={() => onToggle(v)} style={{
            padding: "6px 13px", borderRadius: 20, cursor: "pointer", fontSize: 12, fontWeight: 600,
            border: `2px solid ${active ? color : C.border}`,
            background: active ? bg : "white", color: active ? color : C.sub, transition: "all 0.12s",
          }}>{v}</button>
        );
      })}
    </div>
  );
}

function CreationTextArea({ value, onChange, placeholder, rows = 3 }) {
  return <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
    style={{ width: "100%", padding: "11px 13px", borderRadius: 11, border: `1.5px solid ${C.border}`, fontSize: 13, fontFamily: "inherit", boxSizing: "border-box", color: C.text, outline: "none", resize: "vertical", background: C.bg, lineHeight: 1.5 }} />;
}

function CreationInput({ value, onChange, placeholder }) {
  return <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    style={{ width: "100%", padding: "11px 13px", borderRadius: 11, border: `1.5px solid ${C.border}`, fontSize: 13, fontFamily: "inherit", boxSizing: "border-box", color: C.text, outline: "none", background: C.bg }} />;
}

function CLabel({ children, hint }) {
  return (
    <div style={{ marginBottom: hint ? 4 : 8 }}>
      <label style={{ fontSize: 13, fontWeight: 700, color: C.text, display: "block" }}>{children}</label>
      {hint && <p style={{ fontSize: 11, color: C.sub, margin: "3px 0 7px" }}>{hint}</p>}
    </div>
  );
}

function CStep1({ data, setData }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState("");
  const SECTORS = ["Tech & Digital","Commerce","Artisanat","Services","Santé","Éducation","Restauration","Immobilier","Conseil","Mode & Beauté"];
  const gen = async () => {
    if (!data.activity) { alert("Décris d'abord ce que fait ton entreprise !"); return; }
    setLoading(true);
    const r = await callClaude(`Tu es un expert en branding pour le marché français. Génère 5 noms d'entreprise originaux pour : "${data.activity}". Secteur : ${data.sector || "non précisé"}.\nPour chaque nom : le nom, une explication courte, un slogan.\nFormat : 1. [NOM] — [explication] | Slogan : "[slogan]"\nEn français uniquement.`);
    setResult(r); setLoading(false);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div><CLabel>Que fait ton entreprise ?</CLabel><CreationTextArea value={data.activity || ""} onChange={v => setData({ ...data, activity: v })} placeholder="Ex : J'aide les artisans locaux à vendre leurs créations en ligne…" /></div>
      <div><CLabel hint="Quel problème concret résous-tu ?">Quel problème résous-tu ?</CLabel><CreationTextArea value={data.problem || ""} onChange={v => setData({ ...data, problem: v })} placeholder="Ex : Les artisans manquent de temps pour gérer une boutique en ligne…" /></div>
      <div><CLabel hint="En quoi ton offre est-elle précieuse ?">Quelle valeur offres-tu ?</CLabel><CreationTextArea value={data.value || ""} onChange={v => setData({ ...data, value: v })} placeholder="Ex : Je leur permets de vendre sans s'occuper de la technique…" /></div>
      <div><CLabel>Secteur d'activité</CLabel><CreationChips items={SECTORS} selected={data.sector || ""} onToggle={v => setData({ ...data, sector: v })} color={C.primary} bg={C.primaryLight} /></div>
      <div><CLabel hint="Optionnel">Idée de nom</CLabel><CreationInput value={data.nameIdea || ""} onChange={v => setData({ ...data, nameIdea: v })} placeholder="Ex : ArtisanShop, MaBottega…" /></div>
      <AIButton label="Générer des noms d'entreprise" onClick={gen} loading={loading} />
      <AIResult content={result} />
    </div>
  );
}

function CStep2({ data, setData }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState("");
  const [ageMin, setAgeMin]   = useState(data.ageMin || 25);
  const [ageMax, setAgeMax]   = useState(data.ageMax || 45);
  const GEOS  = ["Paris & IDF","Grandes villes","France entière","Zone rurale","DOM-TOM","Europe","International"];
  const NEEDS = ["Gain de temps","Économies","Simplicité","Qualité","Proximité","Innovation","Sécurité","Accompagnement"];
  const gen = async () => {
    if (!data.who) { alert("Décris d'abord qui sont tes clients !"); return; }
    setLoading(true);
    const r = await callClaude(`Expert marketing français. Crée un persona client détaillé pour : "${data.who}". Entreprise : ${data.activity || ""}. Âge : ${ageMin}-${ageMax} ans. Lieu : ${(data.geos||[]).join(", ")||"France"}. Besoins : ${(data.needs||[]).join(", ")||""}.\nInclure : prénom/profil, journée type, 3 frustrations, 3 motivations, comment il découvrirait l'entreprise, une citation.\nEn français.`);
    setResult(r); setLoading(false); setData({ ...data, ageMin, ageMax });
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div><CLabel>Qui sont tes clients ?</CLabel><CreationTextArea value={data.who || ""} onChange={v => setData({ ...data, who: v })} placeholder="Ex : Artisans indépendants qui veulent vendre en ligne sans compétences techniques…" /></div>
      <div>
        <CLabel>Tranche d'âge cible</CLabel>
        <Card style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ textAlign: "center" }}>
              <span style={{ fontSize: 11, color: C.sub, fontWeight: 600 }}>Minimum</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                <button onClick={() => setAgeMin(Math.max(16, ageMin-1))} style={{ width: 24, height: 24, borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg, cursor: "pointer", fontSize: 14 }}>−</button>
                <span style={{ fontSize: 20, fontWeight: 900, color: C.primary, minWidth: 36, textAlign: "center" }}>{ageMin}</span>
                <button onClick={() => setAgeMin(Math.min(ageMax-1, ageMin+1))} style={{ width: 24, height: 24, borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg, cursor: "pointer", fontSize: 14 }}>+</button>
              </div>
            </div>
            <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "0 16px" }}>
              <div style={{ flex: 1, background: C.border, borderRadius: 4, height: 6 }}>
                <div style={{ background: C.primary, borderRadius: 4, height: 6, marginLeft: `${((ageMin-16)/(80-16))*100}%`, width: `${((ageMax-ageMin)/(80-16))*100}%` }} />
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <span style={{ fontSize: 11, color: C.sub, fontWeight: 600 }}>Maximum</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                <button onClick={() => setAgeMax(Math.max(ageMin+1, ageMax-1))} style={{ width: 24, height: 24, borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg, cursor: "pointer", fontSize: 14 }}>−</button>
                <span style={{ fontSize: 20, fontWeight: 900, color: C.primary, minWidth: 36, textAlign: "center" }}>{ageMax}</span>
                <button onClick={() => setAgeMax(Math.min(80, ageMax+1))} style={{ width: 24, height: 24, borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg, cursor: "pointer", fontSize: 14 }}>+</button>
              </div>
            </div>
          </div>
          <p style={{ fontSize: 11, color: C.sub, margin: 0, textAlign: "center" }}>Cible : {ageMin} – {ageMax} ans</p>
        </Card>
      </div>
      <div><CLabel>Zone géographique</CLabel><CreationChips items={GEOS} selected={data.geos||[]} onToggle={v => { const c=data.geos||[]; setData({...data,geos:c.includes(v)?c.filter(x=>x!==v):[...c,v]}); }} color={C.purple} bg={C.purpleLight} multi /></div>
      <div><CLabel>Besoins principaux</CLabel><CreationChips items={NEEDS} selected={data.needs||[]} onToggle={v => { const c=data.needs||[]; setData({...data,needs:c.includes(v)?c.filter(x=>x!==v):[...c,v]}); }} color={C.accent} bg={C.accentLight} multi /></div>
      <AIButton label="Générer mon persona client" onClick={gen} loading={loading} />
      <AIResult content={result} />
    </div>
  );
}

function CStep3({ data, setData }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState("");
  const VALUES = ["Innovation","Proximité","Qualité","Durabilité","Transparence","Accessibilité","Excellence","Humain","Créativité","Fiabilité"];
  const TONES  = ["Professionnel","Friendly","Expert","Inspirant","Simple","Luxueux","Bienveillant","Humoristique"];
  const gen = async () => {
    setLoading(true);
    const r = await callClaude(`Expert branding français. Génère une USP + pitch pour : activité="${data.activity||""}", valeurs="${(data.values||[]).join(", ")}", ton="${data.tone||""}", clients="${data.who||""}".\n1. USP courte (15 mots max)\n2. Pitch elevator (3-4 phrases)\n3. 3 messages clés\n4. Tagline mémorable\nEn français.`);
    setResult(r); setLoading(false);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <CLabel hint="Jusqu'à 3 valeurs">Valeurs fondamentales</CLabel>
        <CreationChips items={VALUES} selected={data.values||[]} onToggle={v => { const c=data.values||[]; if(c.includes(v)) setData({...data,values:c.filter(x=>x!==v)}); else if(c.length<3) setData({...data,values:[...c,v]}); }} color={C.accent} bg={C.accentLight} multi />
        {(data.values||[]).length===3 && <p style={{ fontSize:11, color:C.accent, margin:"6px 0 0", fontWeight:600 }}>Maximum 3 valeurs ✓</p>}
      </div>
      <div><CLabel hint="Ce qui te différencie vraiment">Proposition de Valeur Unique (USP)</CLabel><CreationTextArea value={data.usp||""} onChange={v=>setData({...data,usp:v})} placeholder="Ex : La seule solution qui permet aux artisans de vendre en ligne en moins de 24h…" /></div>
      <div><CLabel>Ton de voix</CLabel><CreationChips items={TONES} selected={data.tone||""} onToggle={v=>setData({...data,tone:v})} color={C.purple} bg={C.purpleLight} /></div>
      <div><CLabel hint="Comment veux-tu être perçu ?">Positionnement</CLabel><CreationTextArea value={data.positioning||""} onChange={v=>setData({...data,positioning:v})} placeholder="Ex : La référence accessible pour les artisans qui veulent se digitaliser sans stress…" rows={2} /></div>
      <AIButton label="Générer mon USP & pitch" onClick={gen} loading={loading} />
      <AIResult content={result} onUse={result ? () => { const l=result.split("\n").find(l=>l.startsWith("1.")); if(l) setData({...data,usp:l.replace(/^1\.\s*/,"").trim()}); } : null} />
    </div>
  );
}

function CStep4({ data, setData }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState("");
  const [glossaire, setGlossaire] = useState(false);
  const STATUTS = [
    { name:"Auto-entrepreneur", icon:"👤", pros:["Création en 5 min","Charges proportionnelles","Comptabilité simple","Idéal pour démarrer"], cons:["CA limité (77 700€)","Pas de déduction charges","Image moins pro"], best:"Démarrage & test" },
    { name:"EURL", icon:"🏢", pros:["Responsabilité limitée","Déduction charges réelles","Crédible banques"], cons:["Comptabilité obligatoire","Frais de création","Plus de formalités"], best:"Activité établie" },
    { name:"SASU", icon:"⭐", pros:["Statut assimilé salarié","Très flexible","Ouvert investisseurs"], cons:["Charges sociales élevées","Coût comptable","Complexité"], best:"Levée de fonds" },
    { name:"SAS", icon:"🤝", pros:["Flexible pour associés","Ouvert investisseurs","Statut salarié dirigeants"], cons:["Min. 2 associés","Coût et complexité","Commissaire possible"], best:"Projet avec associés" },
  ];
  const GLOSSAIRE = [
    { term:"CA", def:"Chiffre d'Affaires — total de tes ventes" },
    { term:"SIRET", def:"Numéro d'identification unique de ton entreprise" },
    { term:"TVA", def:"Taxe sur la Valeur Ajoutée — collectée sur tes ventes" },
    { term:"URSSAF", def:"Organisme qui collecte tes cotisations sociales" },
    { term:"TNS", def:"Travailleur Non Salarié — statut de la plupart des gérants" },
    { term:"KBIS", def:"Preuve officielle de l'existence légale de ton entreprise" },
    { term:"CFE", def:"Cotisation Foncière des Entreprises — impôt local annuel" },
  ];
  const gen = async () => {
    setLoading(true);
    const r = await callClaude(`Expert-comptable France. Recommande le meilleur statut juridique pour : activité="${data.activity||""}", CA estimé="${data.caEstimate||""}", associés="${data.associates||"seul"}".\n1. Statut recommandé + pourquoi\n2. 3 premières étapes concrètes\n3. Coûts à prévoir\n4. Avertissement important\nEn français. Précise que c'est un conseil général.`);
    setResult(r); setLoading(false);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card style={{ background: C.primaryLight, border: `1.5px solid #BFDBFE` }}>
        <p style={{ fontSize: 13, fontWeight: 800, color: C.primary, margin: "0 0 12px" }}>📝 Ton contexte</p>
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize:12, fontWeight:700, color:C.sub, display:"block", marginBottom:5 }}>CA ESTIMÉ 1ÈRE ANNÉE</label>
          <CreationInput value={data.caEstimate||""} onChange={v=>setData({...data,caEstimate:v})} placeholder="Ex : 30 000 €" />
        </div>
        <div>
          <label style={{ fontSize:12, fontWeight:700, color:C.sub, display:"block", marginBottom:6 }}>ASSOCIÉS PRÉVUS</label>
          <CreationChips items={["Seul(e)","1 associé","2+ associés"]} selected={data.associates||"Seul(e)"} onToggle={v=>setData({...data,associates:v})} color={C.primary} bg="white" />
        </div>
      </Card>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {STATUTS.map(s => (
          <div key={s.name} onClick={() => setData({...data,statut:s.name})} style={{ background:C.card, border:`2px solid ${data.statut===s.name?C.primary:C.border}`, borderRadius:15, padding:"14px 16px", cursor:"pointer", transition:"border-color 0.15s" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
              <span style={{ fontSize:20 }}>{s.icon}</span>
              <span style={{ fontSize:14, fontWeight:800, color:C.text }}>{s.name}</span>
              {data.statut===s.name && <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:10, background:C.primaryLight, color:C.primary, marginLeft:"auto" }}>Sélectionné ✓</span>}
            </div>
            <p style={{ fontSize:11, color:C.sub, margin:"0 0 8px", fontStyle:"italic" }}>Idéal : {s.best}</p>
            <div style={{ display:"flex", gap:12 }}>
              <div style={{ flex:1 }}><p style={{ fontSize:11, fontWeight:700, color:C.green, margin:"0 0 3px" }}>✅ Avantages</p>{s.pros.map(p=><p key={p} style={{fontSize:11,color:C.text,margin:"2px 0"}}>• {p}</p>)}</div>
              <div style={{ flex:1 }}><p style={{ fontSize:11, fontWeight:700, color:C.red, margin:"0 0 3px" }}>❌ Inconvénients</p>{s.cons.map(c=><p key={c} style={{fontSize:11,color:C.text,margin:"2px 0"}}>• {c}</p>)}</div>
            </div>
          </div>
        ))}
      </div>
      <AIButton label="Recommandation personnalisée par l'IA" onClick={gen} loading={loading} />
      <AIResult content={result} />
      <button onClick={() => setGlossaire(!glossaire)} style={{ width:"100%", padding:"12px 16px", background:C.yellowLight, border:`1.5px solid #FDE68A`, borderRadius:13, fontSize:13, fontWeight:700, color:C.yellow, cursor:"pointer", textAlign:"left", display:"flex", justifyContent:"space-between" }}>
        <span>📖 Glossaire Juridique</span><span>{glossaire?"▲":"▼"}</span>
      </button>
      {glossaire && <Card style={{ borderRadius:"0 0 13px 13px", marginTop:-4 }}>{GLOSSAIRE.map(g=><div key={g.term} style={{ padding:"8px 0", borderBottom:`1px solid ${C.border}` }}><span style={{ fontSize:13, fontWeight:800, color:C.text }}>{g.term}</span><span style={{ fontSize:12, color:C.sub }}> — {g.def}</span></div>)}</Card>}
    </div>
  );
}

function CStep5({ allData }) {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan]       = useState("");
  const [aboPlan]             = useState("freemium"); // "freemium" | "business" | "premium"

  // ── Données financières saisies dans cette étape ──────────────────────────
  // Ces chiffres alimentent DIRECTEMENT les calculs du BP (CA, charges, résultat)
  const [fin, setFin] = useState({
    // CA — méthode : prix × nombre de ventes/clients par mois
    prixUnitaire:    0,   // prix moyen d'une vente ou d'une prestation (€)
    volumeMensuel:   0,   // nombre de ventes / clients par mois
    moisActifs:     10,   // mois d'activité la 1ère année (démarrage progressif)
    // Investissements de départ (servent au BP section financement + amortissements)
    investMatériel:  0,   // matériel, équipements, véhicule
    investComm:      0,   // logo, site, communication
    investDivers:    0,   // frais création, dépôt garantie, stock…
    tresoDepart:     0,   // réserve de trésorerie souhaitée
    // Charges fixes mensuelles (servent à calculer le seuil de rentabilité)
    loyer:           0,   // loyer + charges locatives
    autresCharges:   0,   // assurances, téléphone, expert-comptable, etc.
    // Rémunération souhaitée
    remuNette:       0,   // salaire net mensuel souhaité
    // Financement
    apportPerso:     0,   // apport personnel disponible
    empruntSouhaite: 0,   // emprunt bancaire envisagé
  });
  const upd = (k, v) => setFin(f => ({...f, [k]: parseFloat(v)||0}));

  // ── Calculs automatiques (utilisés dans le prompt ET affichés à l'utilisateur) ──
  const caAnnuel        = fin.prixUnitaire * fin.volumeMensuel * fin.moisActifs;
  const totalInvest     = fin.investMatériel + fin.investComm + fin.investDivers + fin.tresoDepart;
  const chargesFixesMens= fin.loyer + fin.autresCharges;
  const chargesFixesAn  = chargesFixesMens * 12;
  const csApprox        = allData.statut?.includes("Micro") ? fin.remuNette*12*0.22
                         : allData.statut?.includes("SASU")  ? fin.remuNette*12*0.70
                         : fin.remuNette*12*0.45;
  const chargesTotalesAn= chargesFixesAn + fin.remuNette*12 + csApprox;
  const resultatBrut    = caAnnuel - chargesTotalesAn;
  const seuilMensuel    = chargesFixesMens > 0
    ? Math.ceil((chargesFixesMens + fin.remuNette + csApprox/12) / (fin.prixUnitaire||1))
    : 0;
  const totalFinancement= fin.apportPerso + fin.empruntSouhaite;
  const deltaFin        = totalFinancement - totalInvest;

  // ── Score complétude (étapes 1-4 + données financières) ──────────────────
  const completeness = [
    { label:"Idée",         done:!!(allData.activity && allData.problem) },
    { label:"Clients",      done:!!(allData.who) },
    { label:"Marque",       done:!!(allData.usp || allData.values?.length) },
    { label:"Statut légal", done:!!(allData.statut) },
    { label:"Chiffres",     done:!!(fin.prixUnitaire>0 && fin.volumeMensuel>0) },
  ];
  const readyCount = completeness.filter(c=>c.done).length;

  // ── Sections selon le plan ────────────────────────────────────────────────
  const SECTIONS_FREEMIUM = [
    "## 1. RÉSUMÉ EXÉCUTIF",
    "## 2. PRÉSENTATION DU PROJET",
    "## 3. ÉTUDE DE MARCHÉ SIMPLIFIÉE",
    "## 4. STRATÉGIE COMMERCIALE",
    "## 5. STRUCTURE JURIDIQUE & ORGANISATION",
    "## 6. PLAN FINANCIER PRÉVISIONNEL (Année 1)",
  ];
  const SECTIONS_BUSINESS = [...SECTIONS_FREEMIUM,
    "## 7. RISQUES & FACTEURS DE SUCCÈS",
    "## 8. STRATÉGIE DE CROISSANCE (An 2-3)",
  ];
  const SECTIONS_PREMIUM = [...SECTIONS_BUSINESS,
    "## 9. ANALYSE CONCURRENTIELLE DÉTAILLÉE",
    "## 10. ANNEXES & PROJECTIONS FINANCIÈRES DÉTAILLÉES",
  ];
  const sections = aboPlan==="premium" ? SECTIONS_PREMIUM
                 : aboPlan==="business" ? SECTIONS_BUSINESS
                 : SECTIONS_FREEMIUM;

  const gen = async () => {
    setLoading(true);
    const prompt = `Tu es expert-comptable et consultant en création d'entreprise en France.
Génère un business plan structuré, concret et chiffré basé sur ces données réelles :

=== PROJET ===
Activité : ${allData.activity||""}
Problème résolu : ${allData.problem||""}
Proposition de valeur : ${allData.value||""}
Secteur : ${allData.sector||""}
Nom de l'entreprise : ${allData.nameIdea||""}

=== MARCHÉ & CLIENTS ===
Cible : ${allData.who||""}
Âge : ${allData.ageMin||25}-${allData.ageMax||45} ans
Zones géographiques : ${(allData.geos||[]).join(", ")||"France"}
Besoins clients : ${(allData.needs||[]).join(", ")||""}

=== MARQUE ===
Valeurs : ${(allData.values||[]).join(", ")||""}
Ton de voix : ${allData.tone||""}
USP / Pitch : ${allData.usp||""}
Tagline : ${allData.tagline||""}

=== JURIDIQUE ===
Statut choisi : ${allData.statut||"Non défini"}

=== DONNÉES FINANCIÈRES RÉELLES (à utiliser pour tous les calculs) ===
Prix unitaire moyen : ${fin.prixUnitaire} €
Volume mensuel prévu : ${fin.volumeMensuel} ventes/clients par mois
Mois d'activité an 1 : ${fin.moisActifs} mois (démarrage progressif)
→ CA AN 1 CALCULÉ : ${caAnnuel.toLocaleString("fr-FR")} € (${fin.prixUnitaire}€ × ${fin.volumeMensuel} × ${fin.moisActifs} mois)

Investissements de départ :
  - Matériel & équipements : ${fin.investMatériel} €
  - Communication (logo, site) : ${fin.investComm} €
  - Divers (création, garantie, stock) : ${fin.investDivers} €
  - Trésorerie de départ : ${fin.tresoDepart} €
  → TOTAL INVESTISSEMENTS : ${totalInvest.toLocaleString("fr-FR")} €

Charges fixes mensuelles :
  - Loyer & charges locatives : ${fin.loyer} €/mois
  - Autres charges fixes : ${fin.autresCharges} €/mois
  → TOTAL CHARGES FIXES : ${chargesFixesMens} €/mois → ${chargesFixesAn.toLocaleString("fr-FR")} €/an

Rémunération nette souhaitée : ${fin.remuNette} €/mois (${fin.remuNette*12} €/an)
Charges sociales estimées : ${Math.round(csApprox).toLocaleString("fr-FR")} €/an

→ RÉSULTAT BRUT AN 1 : ${Math.round(resultatBrut).toLocaleString("fr-FR")} €
→ SEUIL DE RENTABILITÉ : ${seuilMensuel} ventes/clients par mois minimum

Financement :
  - Apport personnel : ${fin.apportPerso} €
  - Emprunt envisagé : ${fin.empruntSouhaite} €
  → TOTAL : ${totalFinancement.toLocaleString("fr-FR")} € (${deltaFin>=0?"couvre":"ne couvre pas"} les investissements)

=== INSTRUCTIONS ===
- Utilise EXACTEMENT les chiffres fournis ci-dessus dans toutes les sections financières
- Sois concret, précis et actionnable
- Inclus des recommandations spécifiques au statut ${allData.statut||"choisi"}
- En français professionnel

${sections.join("\n")}`;

    const r = await callClaude(prompt);
    setPlan(r); setLoading(false);
  };

  // ── Rendu ────────────────────────────────────────────────────────────────
  const FNum = ({ label, hint, stateKey, suffix="€", min=0 }) => (
    <div style={{ marginBottom:11 }}>
      <label style={{ fontSize:11, fontWeight:700, color:C.sub, display:"block", marginBottom:2, textTransform:"uppercase", letterSpacing:.4 }}>{label}</label>
      {hint && <p style={{ fontSize:10, color:C.sub, margin:"0 0 3px", fontStyle:"italic" }}>{hint}</p>}
      <div style={{ display:"flex", alignItems:"center", border:`1.5px solid ${C.border}`, borderRadius:9, background:C.bg, overflow:"hidden" }}>
        {suffix==="€" && <span style={{ padding:"0 8px", fontSize:12, color:C.sub, borderRight:`1px solid ${C.border}` }}>€</span>}
        <input type="number" value={fin[stateKey]} min={min}
          onChange={e => upd(stateKey, e.target.value)}
          style={{ flex:1, padding:"9px 10px", border:"none", background:"transparent", fontSize:13, color:C.text, outline:"none", fontFamily:"inherit" }} />
        {suffix!=="€" && <span style={{ padding:"0 8px", fontSize:12, color:C.sub, borderLeft:`1px solid ${C.border}` }}>{suffix}</span>}
      </div>
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

      {/* Score complétude */}
      <Card>
        <p style={{ fontSize:13, fontWeight:800, color:C.text, margin:"0 0 12px" }}>État de ton dossier</p>
        <div style={{ display:"flex", flexDirection:"column", gap:7, marginBottom:14 }}>
          {completeness.map(c=>(
            <div key={c.label} style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:22, height:22, borderRadius:7, background:c.done?C.green:C.bg, border:`2px solid ${c.done?C.green:C.border}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                {c.done && <span style={{ color:"white", fontSize:12, fontWeight:900 }}>✓</span>}
              </div>
              <span style={{ fontSize:13, color:c.done?C.text:C.sub, fontWeight:c.done?600:400 }}>{c.label}</span>
              {!c.done && <span style={{ fontSize:11, color:C.sub, marginLeft:"auto" }}>→ À compléter</span>}
            </div>
          ))}
        </div>
        <div style={{ background:C.bg, borderRadius:8, height:8, marginBottom:6 }}>
          <div style={{ background:readyCount===5?`linear-gradient(90deg,${C.green},#4ADE80)`:`linear-gradient(90deg,${C.primary},#4F6FEC)`, borderRadius:8, height:8, width:`${(readyCount/5)*100}%`, transition:"width 0.5s" }} />
        </div>
        <p style={{ fontSize:12, color:C.sub, margin:0 }}>{readyCount}/5 sections complétées · {sections.length} sections dans le BP</p>
      </Card>

      {/* DONNÉES FINANCIÈRES */}
      <Card>
        <div style={{ marginBottom:14, paddingBottom:12, borderBottom:`1px solid ${C.border}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:3 }}>
            <span style={{ fontSize:18 }}>📊</span>
            <h3 style={{ fontSize:15, fontWeight:900, color:C.text, margin:0, fontFamily:"'Playfair Display',serif" }}>Données financières</h3>
          </div>
          <p style={{ fontSize:11, color:C.sub, margin:"3px 0 0 25px" }}>Ces chiffres servent directement aux calculs du Business Plan</p>
        </div>

        {/* CA : prix × volume */}
        <div style={{ background:C.primaryLight, borderRadius:12, padding:"14px", marginBottom:14 }}>
          <p style={{ fontSize:12, fontWeight:800, color:C.primary, margin:"0 0 10px" }}>💰 Chiffre d'affaires prévisionnel</p>
          <p style={{ fontSize:11, color:C.sub, margin:"0 0 10px" }}>Méthode : Prix moyen × Nombre de ventes par mois × Mois actifs</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            <FNum label="Prix moyen par vente / prestation" stateKey="prixUnitaire" hint="Ex: 150€ pour 1h de conseil, 35€ pour un produit"/>
            <FNum label="Nb ventes ou clients par mois" stateKey="volumeMensuel" suffix="unités" hint="Objectif réaliste le 1er mois plein"/>
          </div>
          <FNum label="Mois d'activité la 1ère année" stateKey="moisActifs" suffix="mois" hint="Souvent 10 mois (démarrage en mars = 10 mois)" min={1}/>
          {fin.prixUnitaire>0 && fin.volumeMensuel>0 && (
            <div style={{ background:"white", borderRadius:9, padding:"10px 12px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:12, color:C.primary, fontWeight:600 }}>CA An 1 calculé :</span>
              <span style={{ fontSize:18, fontWeight:900, color:C.primary }}>{caAnnuel.toLocaleString("fr-FR")} €</span>
            </div>
          )}
        </div>

        {/* Investissements */}
        <div style={{ marginBottom:14 }}>
          <p style={{ fontSize:12, fontWeight:800, color:C.text, margin:"0 0 10px" }}>🏗️ Investissements de départ</p>
          <FNum label="Matériel & équipements" stateKey="investMatériel" hint="Machines, ordinateur, véhicule, outillage…"/>
          <FNum label="Communication (logo, site, enseigne)" stateKey="investComm" hint="Identité visuelle, site web, impression"/>
          <FNum label="Divers (création, dépôt garantie, stock)" stateKey="investDivers" hint="Frais INPI/greffe, caution bailleur, stock initial"/>
          <FNum label="Trésorerie de départ souhaitée" stateKey="tresoDepart" hint="Réserve pour les premiers mois sans CA"/>
          {totalInvest>0 && (
            <div style={{ background:C.bg, borderRadius:9, padding:"9px 12px", display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontSize:12, color:C.text, fontWeight:600 }}>Total investissements :</span>
              <span style={{ fontSize:14, fontWeight:900, color:C.primary }}>{totalInvest.toLocaleString("fr-FR")} €</span>
            </div>
          )}
        </div>

        {/* Charges fixes */}
        <div style={{ marginBottom:14 }}>
          <p style={{ fontSize:12, fontWeight:800, color:C.text, margin:"0 0 10px" }}>📋 Charges fixes mensuelles</p>
          <p style={{ fontSize:11, color:C.sub, margin:"0 0 8px" }}>Charges récurrentes indépendantes du CA — servent à calculer le seuil de rentabilité</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            <FNum label="Loyer & charges locatives" stateKey="loyer" hint="0€ si travail à domicile"/>
            <FNum label="Autres charges fixes" stateKey="autresCharges" hint="Assurances, tél, expert-compta, abonnements…"/>
          </div>
          {chargesFixesMens>0 && (
            <div style={{ background:C.bg, borderRadius:9, padding:"9px 12px", display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontSize:12, color:C.text, fontWeight:600 }}>Charges fixes/an :</span>
              <span style={{ fontSize:14, fontWeight:900, color:C.accent }}>{chargesFixesAn.toLocaleString("fr-FR")} €</span>
            </div>
          )}
        </div>

        {/* Rémunération */}
        <div style={{ marginBottom:14 }}>
          <p style={{ fontSize:12, fontWeight:800, color:C.text, margin:"0 0 10px" }}>💳 Rémunération & financement</p>
          <FNum label="Rémunération nette souhaitée" stateKey="remuNette" suffix="€/mois" hint="Ton objectif de salaire net mensuel"/>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            <FNum label="Apport personnel" stateKey="apportPerso" hint="Économies disponibles pour le projet"/>
            <FNum label="Emprunt envisagé" stateKey="empruntSouhaite" hint="Prêt bancaire ou d'honneur"/>
          </div>
          {totalFinancement>0 && (
            <div style={{ background:deltaFin>=0?C.greenLight:C.redLight, borderRadius:9, padding:"9px 12px", border:`1px solid ${deltaFin>=0?"#BBF7D0":"#FECACA"}` }}>
              <p style={{ fontSize:12, fontWeight:700, color:deltaFin>=0?C.green:C.red, margin:0 }}>
                Financement ({totalFinancement.toLocaleString("fr-FR")}€) {deltaFin>=0?"couvre ✓":"ne couvre pas ⚠️"} les investissements ({totalInvest.toLocaleString("fr-FR")}€)
              </p>
            </div>
          )}
        </div>

        {/* Synthèse */}
        {fin.prixUnitaire>0 && fin.volumeMensuel>0 && chargesFixesMens>0 && fin.remuNette>0 && (
          <div style={{ background:`linear-gradient(135deg,#0F172A,${C.primary})`, borderRadius:12, padding:"14px", color:"white" }}>
            <p style={{ fontSize:11, opacity:.7, margin:"0 0 8px", textTransform:"uppercase", letterSpacing:.8 }}>Synthèse calculée</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {[
                ["CA An 1", caAnnuel.toLocaleString("fr-FR")+"€"],
                ["Résultat brut", (resultatBrut>0?"+":"")+Math.round(resultatBrut).toLocaleString("fr-FR")+"€"],
                ["Seuil rentabilité", seuilMensuel+" ventes/mois"],
                ["Investissements", totalInvest.toLocaleString("fr-FR")+"€"],
              ].map(([l,v])=>(
                <div key={l}>
                  <p style={{ fontSize:10, opacity:.6, margin:"0 0 2px" }}>{l}</p>
                  <p style={{ fontSize:15, fontWeight:900, margin:0 }}>{v}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Sections du BP selon le plan */}
      <Card>
        <p style={{ fontSize:12, fontWeight:700, color:C.sub, textTransform:"uppercase", letterSpacing:.5, margin:"0 0 10px" }}>Sections incluses dans ton Business Plan</p>
        {sections.map((s,i)=>(
          <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 0", borderBottom:`1px solid ${C.border}` }}>
            <div style={{ width:22, height:22, borderRadius:7, background:C.primaryLight, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <span style={{ fontSize:11, fontWeight:800, color:C.primary }}>{i+1}</span>
            </div>
            <span style={{ fontSize:12, color:C.text, fontWeight:500 }}>{s.replace(/^## \d+\. /,"")}</span>
          </div>
        ))}
        {aboPlan==="freemium" && (
          <div style={{ marginTop:12, background:C.primaryLight, borderRadius:10, padding:"10px 12px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <p style={{ fontSize:12, fontWeight:700, color:C.primary, margin:0 }}>+2 sections avec Business</p>
              <p style={{ fontSize:11, color:C.sub, margin:"2px 0 0" }}>Risques, Croissance 3 ans</p>
            </div>
            <button style={{ padding:"7px 12px", background:C.primary, border:"none", borderRadius:9, color:"white", fontSize:11, fontWeight:700, cursor:"pointer" }}>💼 Business →</button>
          </div>
        )}
      </Card>

      {readyCount<3 && <div style={{ background:C.yellowLight, border:`1.5px solid #FDE68A`, borderRadius:13, padding:"12px 16px" }}><p style={{ fontSize:13, color:C.yellow, fontWeight:700, margin:0 }}>⚠️ Complète au moins les étapes Idée, Clients et tes données financières pour un BP chiffré.</p></div>}

      <AIButton label={plan?"Regénérer le Business Plan":"Générer mon Business Plan complet"} onClick={gen} loading={loading} />

      {plan && (
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, overflow:"hidden" }}>
          <div style={{ background:`linear-gradient(135deg,#0F172A,${C.primary})`, padding:"18px 20px" }}>
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.6)", margin:"0 0 4px", textTransform:"uppercase", letterSpacing:1 }}>Business Plan</p>
            <p style={{ fontSize:20, fontWeight:900, color:"white", margin:"0 0 2px", fontFamily:"'Playfair Display',serif" }}>{allData.nameIdea||"Mon Entreprise"}</p>
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.5)", margin:0 }}>CA An 1 : {caAnnuel.toLocaleString("fr-FR")}€ · {sections.length} sections</p>
          </div>
          <div style={{ padding:"20px", maxHeight:500, overflowY:"auto" }}>
            {plan.split("\n").map((line,i)=>{
              if(line.startsWith("## ")) return <h3 key={i} style={{ fontSize:14, fontWeight:800, color:C.primary, margin:"18px 0 8px", borderBottom:`2px solid ${C.primaryLight}`, paddingBottom:6 }}>{line.replace("## ","")}</h3>;
              if(line.startsWith("- ")||line.startsWith("• ")) return <p key={i} style={{ fontSize:13, color:C.text, margin:"3px 0", paddingLeft:12 }}>• {line.replace(/^[-•] /,"")}</p>;
              if(line.trim()==="") return <div key={i} style={{ height:6 }} />;
              return <p key={i} style={{ fontSize:13, color:C.text, margin:"4px 0", lineHeight:1.6 }}>{line}</p>;
            })}
          </div>
          <div style={{ padding:"14px 20px", borderTop:`1px solid ${C.border}`, display:"flex", gap:10 }}>
            <button onClick={()=>{ const blob=new Blob([plan],{type:"text/plain;charset=utf-8"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=`business-plan-${allData.nameIdea||"mon-entreprise"}.txt`; a.click(); URL.revokeObjectURL(url); }} style={{ flex:1, padding:"12px", background:C.green, border:"none", borderRadius:11, color:"white", fontSize:13, fontWeight:800, cursor:"pointer" }}>📥 Télécharger .txt</button>
            <button onClick={()=>navigator.clipboard.writeText(plan).then(()=>alert("Copié !"))} style={{ flex:1, padding:"12px", background:C.primaryLight, border:`1.5px solid ${C.primary}`, borderRadius:11, color:C.primary, fontSize:13, fontWeight:700, cursor:"pointer" }}>📋 Copier</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ParcoursPage() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({});
  const pct = Math.round(((step-1)/CREATION_STEPS.length)*100);
  const currentStep = CREATION_STEPS.find(s=>s.id===step);

  return (
    <div style={{ padding:"22px 18px 40px" }}>
      <h1 style={{ fontSize:24, fontWeight:900, color:C.text, margin:"0 0 4px", fontFamily:"'Playfair Display',serif" }}>Mon Parcours Créateur 🚀</h1>
      <p style={{ color:C.sub, fontSize:13, margin:"0 0 22px" }}>Construis ton projet étape par étape avec l'IA</p>
      <Card style={{ marginBottom:20, padding:"14px 16px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
          <span style={{ fontSize:12, fontWeight:700, color:C.sub }}>Étape {step} sur {CREATION_STEPS.length}</span>
          <span style={{ fontSize:15, fontWeight:900, color:C.primary }}>{pct}%</span>
        </div>
        <div style={{ background:C.bg, borderRadius:8, height:8 }}>
          <div style={{ background:`linear-gradient(90deg,${C.primary},#4F6FEC)`, borderRadius:8, height:8, width:`${Math.max(5,pct)}%`, transition:"width 0.5s ease" }} />
        </div>
      </Card>
      <div style={{ display:"flex", gap:6, marginBottom:22, overflowX:"auto", paddingBottom:4 }}>
        {CREATION_STEPS.map(s=>{
          const isActive=step===s.id, isComplete=step>s.id;
          return (
            <button key={s.id} onClick={()=>setStep(s.id)} style={{ flexShrink:0, cursor:"pointer", borderRadius:12, padding:"8px 13px", border:`2px solid ${isActive?s.color:isComplete?C.green:C.border}`, background:isActive?s.color:isComplete?C.greenLight:"white", color:isActive?"white":isComplete?C.green:C.sub, fontSize:12, fontWeight:700, display:"flex", alignItems:"center", gap:5, transition:"all 0.15s" }}>
              <span>{isComplete?"✓":s.icon}</span>
              <span style={{ whiteSpace:"nowrap" }}>{s.label}</span>
            </button>
          );
        })}
      </div>
      <Card style={{ marginBottom:20 }}>
        <div style={{ marginBottom:18, paddingBottom:14, borderBottom:`1px solid ${C.border}` }}>
          <span style={{ fontSize:10, fontWeight:700, color:C.sub, textTransform:"uppercase", letterSpacing:1 }}>Étape {step} / {CREATION_STEPS.length}</span>
          <h2 style={{ fontSize:19, fontWeight:900, color:C.text, margin:"4px 0 0", fontFamily:"'Playfair Display',serif" }}>{currentStep.icon} {currentStep.label}</h2>
        </div>
        {step===1 && <CStep1 data={data} setData={setData} />}
        {step===2 && <CStep2 data={data} setData={setData} />}
        {step===3 && <CStep3 data={data} setData={setData} />}
        {step===4 && <CStep4 data={data} setData={setData} />}
        {step===5 && <CStep5 allData={data} />}
      </Card>
      <div style={{ display:"flex", gap:10 }}>
        {step>1 && <button onClick={()=>setStep(s=>s-1)} style={{ flex:1, padding:"14px", background:"white", border:`2px solid ${C.border}`, borderRadius:13, fontSize:14, fontWeight:700, cursor:"pointer", color:C.text }}>← Précédent</button>}
        {step<5 && <button onClick={()=>{ if(data.activity||step>1) setStep(s=>s+1); else alert("Remplis au moins le premier champ !"); }} style={{ flex:2, padding:"14px", background:C.primary, border:"none", borderRadius:13, fontSize:14, fontWeight:800, cursor:"pointer", color:"white" }}>Sauvegarder & Continuer →</button>}
      </div>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}


// ── FINANCES PAGE ─────────────────────────────────────────────────────────────
function FinancesPage() {
  const tools = [
    { icon: "📊", title: "Business Plan Financier", desc: "Prévisions sur 3 ans",          color: C.primary, bg: C.primaryLight },
    { icon: "🧮", title: "Coût Produit / Service",  desc: "Calcule ton prix de revient",   color: C.green,   bg: C.greenLight   },
    { icon: "📈", title: "Chiffre d'Affaires",      desc: "Projections de revenus",         color: C.purple,  bg: C.purpleLight  },
    { icon: "💼", title: "Plan de Financement",     desc: "Besoins & ressources",           color: C.accent,  bg: C.accentLight  },
  ];
  const kpis = [
    { label: "CA Prévisionnel", value: "—",  color: C.primary },
    { label: "Charges fixes",   value: "—",  color: "#EF4444" },
    { label: "Rentabilité",     value: "—",  color: C.green   },
  ];
  return (
    <div style={{ padding: "22px 18px 32px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 900, color: C.text, margin: "0 0 4px", fontFamily: "'Cormorant Garamond', 'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}>Finances 💰</h1>
      <p style={{ color: C.sub, fontSize: 13, margin: "0 0 22px" }}>Outils financiers pour ton entreprise</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
        {kpis.map(k => (
          <Card key={k.label} style={{ padding: "14px 12px", textAlign: "center" }}>
            <p style={{ fontSize: 20, fontWeight: 900, color: k.color, margin: "0 0 4px" }}>{k.value}</p>
            <p style={{ fontSize: 10, color: C.sub, margin: 0, lineHeight: 1.3 }}>{k.label}</p>
          </Card>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {tools.map(t => (
          <button key={t.title} style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 16, padding: "16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, textAlign: "left", transition: "box-shadow 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.07)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
          >
            <div style={{ background: t.bg, borderRadius: 13, width: 52, height: 52, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{t.icon}</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 800, color: C.text, margin: "0 0 3px" }}>{t.title}</p>
              <p style={{ fontSize: 12, color: C.sub, margin: 0 }}>{t.desc}</p>
            </div>
            <span style={{ color: C.sub, fontSize: 20, fontWeight: 300 }}>›</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── CONTACTS PAGE ─────────────────────────────────────────────────────────────
function ContactsPage({ contacts, setContacts, PLAN, setTab }) {
  // PLAN vient des props App
  const MAX_CONTACTS = PLAN === "freemium" ? 20 : Infinity;
  const MAX_CLIENTS   = PLAN === "freemium" ? 10 : Infinity;
  const MAX_FOURNISS  = PLAN === "freemium" ? 10 : Infinity;

  const EMPTY = { nom:"", prenom:"", societe:"", type:"Client", email:"", tel:"", adresse:"", ville:"", notes:"", chiffreAffaires:"", tag:"" };

  // contacts & setContacts viennent des props App (état global)
  const [filter,   setFilter]   = useState("Tous");
  const [search,   setSearch]   = useState("");
  const [modal,    setModal]    = useState(false);   // "new" | id (edit) | false
  const [detail,   setDetail]   = useState(null);    // id fiche ouverte
  const [form,     setForm]     = useState(EMPTY);
  const [confirmDel, setConfirmDel] = useState(null);

  const nextId = () => Math.max(0, ...contacts.map(c => c.id)) + 1;
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Filtres
  const filtered = contacts.filter(c => {
    const matchType = filter === "Tous" || c.type === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || [c.nom,c.prenom,c.societe,c.ville,c.email].join(" ").toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  const nbClients    = contacts.filter(c => c.type === "Client").length;
  const nbFourniss   = contacts.filter(c => c.type === "Fournisseur").length;

  // CRUD
  const openNew = () => {
    const tooManyClients   = filter==="Client"      && nbClients   >= MAX_CLIENTS;
    const tooManyFourniss  = filter==="Fournisseur" && nbFourniss  >= MAX_FOURNISS;
    const tooMany = contacts.length >= MAX_CONTACTS || tooManyClients || tooManyFourniss;
    if (tooMany && PLAN === "freemium") { alert(`Limite Freemium atteinte (${MAX_CLIENTS} clients + ${MAX_FOURNISS} fournisseurs). Passez à Business pour des contacts illimités.`); return; }
    setForm({ ...EMPTY, type: filter === "Tous" ? "Client" : filter });
    setModal("new");
  };

  const openEdit = (c) => { setForm({ ...c }); setModal(c.id); setDetail(null); };

  const save = () => {
    if (!form.nom.trim()) { alert("Le nom est obligatoire."); return; }
    if (modal === "new") {
      setContacts(cs => [...cs, { ...form, id: nextId() }]);
    } else {
      setContacts(cs => cs.map(c => c.id === modal ? { ...form } : c));
    }
    setModal(false);
  };

  const del = (id) => { setContacts(cs => cs.filter(c => c.id !== id)); setDetail(null); setConfirmDel(null); };

  // Initiales pour avatar
  const initiales = (c) => ((c.prenom?.[0]||"") + (c.nom?.[0]||"")).toUpperCase() || "?";
  const avatarColor = (type) => type === "Client"
    ? { bg: C.primaryLight, color: C.primary }
    : { bg: C.accentLight,  color: C.accent  };

  const tagColors = { "VIP":"#b8924a", "Prospect":"#7F5A68", "Inactif":C.sub, "Prioritaire":C.green };

  // ── MODALE FORMULAIRE ──────────────────────────────────────────────────────
  const ModalForm = () => (
    <div style={{ position:"fixed", inset:0, background:"rgba(19,8,0,0.55)", zIndex:200, display:"flex", alignItems:"flex-end", justifyContent:"center" }}
      onClick={e => e.target===e.currentTarget && setModal(false)}>
      <div style={{ background:C.card, borderRadius:"20px 20px 0 0", padding:"22px 18px 36px", width:"100%", maxWidth:520, maxHeight:"92vh", overflowY:"auto" }}>

        {/* Header modale */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <h3 style={{ fontSize:18, fontWeight:700, color:C.text, margin:0, fontFamily:"'Cormorant Garamond',serif" }}>
            {modal==="new" ? "Nouveau contact" : "Modifier le contact"}
          </h3>
          <button onClick={()=>setModal(false)} style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:9, padding:"6px 10px", fontSize:12, cursor:"pointer", color:C.sub }}>✕</button>
        </div>

        {/* Type */}
        <div style={{ display:"flex", gap:8, marginBottom:16 }}>
          {["Client","Fournisseur"].map(t => (
            <button key={t} onClick={()=>upd("type",t)} style={{ flex:1, padding:"10px", borderRadius:10, border:`2px solid ${form.type===t?C.primary:C.border}`, background:form.type===t?C.primaryLight:"white", color:form.type===t?C.primary:C.sub, fontSize:13, fontWeight:700, cursor:"pointer" }}>
              {t==="Client"?"🧑 Client":"🏭 Fournisseur"}
            </button>
          ))}
        </div>

        {/* Champs */}
        {[
          [["Prénom","prenom","Ex : Marie"],["Nom *","nom","Ex : Dupont"]],
          [["Société / Enseigne","societe","Ex : Boulangerie Dupont"],["Ville","ville","Ex : Lyon"]],
          [["Email","email","contact@exemple.fr"],["Téléphone","tel","06 XX XX XX XX"]],
        ].map((row, ri) => (
          <div key={ri} style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
            {row.map(([label, key, ph]) => (
              <div key={key}>
                <label style={{ fontSize:11, fontWeight:700, color:C.sub, display:"block", marginBottom:3, textTransform:"uppercase", letterSpacing:.4 }}>{label}</label>
                <input type="text" value={form[key]} placeholder={ph} onChange={e=>upd(key,e.target.value)}
                  style={{ width:"100%", padding:"9px 10px", border:`1.5px solid ${C.border}`, borderRadius:9, background:C.bg, fontSize:13, color:C.text, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>
              </div>
            ))}
          </div>
        ))}

        {/* Adresse */}
        <div style={{ marginBottom:10 }}>
          <label style={{ fontSize:11, fontWeight:700, color:C.sub, display:"block", marginBottom:3, textTransform:"uppercase", letterSpacing:.4 }}>Adresse</label>
          <input type="text" value={form.adresse} placeholder="Ex : 12 rue de la Paix" onChange={e=>upd("adresse",e.target.value)}
            style={{ width:"100%", padding:"9px 10px", border:`1.5px solid ${C.border}`, borderRadius:9, background:C.bg, fontSize:13, color:C.text, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>
        </div>

        {/* CA + Tag (clients seulement) */}
        {form.type === "Client" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
            <div>
              <label style={{ fontSize:11, fontWeight:700, color:C.sub, display:"block", marginBottom:3, textTransform:"uppercase", letterSpacing:.4 }}>CA annuel (€)</label>
              <input type="number" value={form.chiffreAffaires} placeholder="0" onChange={e=>upd("chiffreAffaires",e.target.value)}
                style={{ width:"100%", padding:"9px 10px", border:`1.5px solid ${C.border}`, borderRadius:9, background:C.bg, fontSize:13, color:C.text, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>
            </div>
            <div>
              <label style={{ fontSize:11, fontWeight:700, color:C.sub, display:"block", marginBottom:3, textTransform:"uppercase", letterSpacing:.4 }}>Étiquette</label>
              <select value={form.tag} onChange={e=>upd("tag",e.target.value)}
                style={{ width:"100%", padding:"9px 10px", border:`1.5px solid ${C.border}`, borderRadius:9, background:C.bg, fontSize:13, color:C.text, outline:"none", fontFamily:"inherit" }}>
                <option value="">Aucune</option>
                <option value="VIP">⭐ VIP</option>
                <option value="Prospect">🔍 Prospect</option>
                <option value="Prioritaire">🟢 Prioritaire</option>
                <option value="Inactif">⏸ Inactif</option>
              </select>
            </div>
          </div>
        )}

        {/* Notes */}
        <div style={{ marginBottom:20 }}>
          <label style={{ fontSize:11, fontWeight:700, color:C.sub, display:"block", marginBottom:3, textTransform:"uppercase", letterSpacing:.4 }}>Notes internes</label>
          <textarea value={form.notes} placeholder="Informations utiles, préférences, historique…" onChange={e=>upd("notes",e.target.value)} rows={3}
            style={{ width:"100%", padding:"9px 10px", border:`1.5px solid ${C.border}`, borderRadius:9, background:C.bg, fontSize:13, color:C.text, outline:"none", fontFamily:"inherit", resize:"vertical", lineHeight:1.5, boxSizing:"border-box" }}/>
        </div>

        <div style={{ display:"flex", gap:10 }}>
          <button onClick={()=>setModal(false)} style={{ flex:1, padding:"13px", background:"white", border:`1.5px solid ${C.border}`, borderRadius:12, fontSize:14, fontWeight:600, cursor:"pointer", color:C.sub }}>Annuler</button>
          <button onClick={save} style={{ flex:2, padding:"13px", background:C.primary, border:"none", borderRadius:12, fontSize:14, fontWeight:800, cursor:"pointer", color:"white" }}>
            {modal==="new" ? "✓ Enregistrer" : "✓ Mettre à jour"}
          </button>
        </div>
      </div>
    </div>
  );

  // ── FICHE DÉTAIL ───────────────────────────────────────────────────────────
  const contact = contacts.find(c => c.id === detail);
  const FicheDetail = () => {
    if (!contact) return null;
    const av = avatarColor(contact.type);
    return (
      <div style={{ position:"fixed", inset:0, background:"rgba(19,8,0,0.55)", zIndex:200, display:"flex", alignItems:"flex-end", justifyContent:"center" }}
        onClick={e => e.target===e.currentTarget && setDetail(null)}>
        <div style={{ background:C.card, borderRadius:"20px 20px 0 0", padding:"22px 18px 36px", width:"100%", maxWidth:520, maxHeight:"85vh", overflowY:"auto" }}>

          {/* Header fiche */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ width:54, height:54, borderRadius:16, background:av.bg, border:`2px solid ${av.color}33`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <span style={{ fontSize:20, fontWeight:900, color:av.color, fontFamily:"'Cormorant Garamond',serif" }}>{initiales(contact)}</span>
              </div>
              <div>
                <p style={{ fontSize:18, fontWeight:700, color:C.text, margin:"0 0 2px", fontFamily:"'Cormorant Garamond',serif" }}>{contact.prenom} {contact.nom}</p>
                <p style={{ fontSize:13, color:C.sub, margin:0 }}>{contact.societe}</p>
              </div>
            </div>
            <button onClick={()=>setDetail(null)} style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:9, padding:"6px 10px", fontSize:12, cursor:"pointer", color:C.sub }}>✕</button>
          </div>

          {/* Badge type + tag */}
          <div style={{ display:"flex", gap:8, marginBottom:18 }}>
            <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, background:av.bg, color:av.color }}>{contact.type}</span>
            {contact.tag && <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, background:C.yellowLight, color:tagColors[contact.tag]||C.sub }}>{contact.tag}</span>}
            {contact.type==="Client" && contact.chiffreAffaires && (
              <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, background:C.greenLight, color:C.green }}>CA : {parseInt(contact.chiffreAffaires).toLocaleString("fr-FR")} €</span>
            )}
          </div>

          {/* Infos de contact */}
          <div style={{ background:C.bg, borderRadius:14, padding:"14px", marginBottom:14 }}>
            {[
              contact.email && ["✉️","Email",contact.email, `mailto:${contact.email}`],
              contact.tel   && ["📞","Téléphone",contact.tel, `tel:${contact.tel}`],
              (contact.adresse||contact.ville) && ["📍","Adresse",[contact.adresse,contact.ville].filter(Boolean).join(", "), null],
            ].filter(Boolean).map(([icon,label,val,href],i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"9px 0", borderBottom:`1px solid ${C.border}` }}>
                <span style={{ fontSize:16 }}>{icon}</span>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:10, color:C.sub, fontWeight:700, textTransform:"uppercase", letterSpacing:.5, margin:"0 0 1px" }}>{label}</p>
                  {href
                    ? <a href={href} style={{ fontSize:13, color:C.primary, fontWeight:500, textDecoration:"none" }}>{val}</a>
                    : <p style={{ fontSize:13, color:C.text, margin:0 }}>{val}</p>
                  }
                </div>
              </div>
            ))}
          </div>

          {/* Notes */}
          {contact.notes && (
            <div style={{ background:C.yellowLight, border:`1px solid ${C.borderDark}`, borderRadius:12, padding:"12px 14px", marginBottom:14 }}>
              <p style={{ fontSize:11, fontWeight:700, color:C.yellow, textTransform:"uppercase", letterSpacing:.5, margin:"0 0 5px" }}>📝 Notes</p>
              <p style={{ fontSize:13, color:C.text, margin:0, lineHeight:1.6 }}>{contact.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:14 }}>
            {contact.email && (
              <a href={`mailto:${contact.email}`} style={{ padding:"11px 6px", background:C.primaryLight, border:`1.5px solid ${C.primary}33`, borderRadius:11, color:C.primary, fontSize:12, fontWeight:700, textDecoration:"none", textAlign:"center" }}>✉️ Mail</a>
            )}
            {contact.tel && (
              <a href={`tel:${contact.tel}`} style={{ padding:"11px 6px", background:C.greenLight, border:`1.5px solid ${C.green}33`, borderRadius:11, color:C.green, fontSize:12, fontWeight:700, textDecoration:"none", textAlign:"center" }}>📞 Appel</a>
            )}
            <button onClick={()=>openEdit(contact)} style={{ padding:"11px 6px", background:C.accentLight, border:`1.5px solid ${C.accent}33`, borderRadius:11, color:C.accent, fontSize:12, fontWeight:700, cursor:"pointer" }}>✏️ Modifier</button>
          </div>
          {contact.type === "Client" && (
            <button onClick={()=>{ setDetail(null); setTab("factures"); }}
              style={{ width:"100%", padding:"11px", background:C.primaryLight, border:`1.5px solid ${C.primary}33`, borderRadius:11, fontSize:12, fontWeight:700, color:C.primary, cursor:"pointer", marginBottom:10 }}>
              🧾 Voir les factures de ce client →
            </button>
          )}

          {/* Suppression */}
          {confirmDel === contact.id ? (
            <div style={{ background:C.redLight, borderRadius:12, padding:"13px", textAlign:"center" }}>
              <p style={{ fontSize:13, color:C.red, fontWeight:700, margin:"0 0 12px" }}>Supprimer définitivement ce contact ?</p>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={()=>setConfirmDel(null)} style={{ flex:1, padding:"10px", background:"white", border:`1.5px solid ${C.border}`, borderRadius:10, fontSize:13, cursor:"pointer", color:C.sub }}>Annuler</button>
                <button onClick={()=>del(contact.id)} style={{ flex:1, padding:"10px", background:C.red, border:"none", borderRadius:10, fontSize:13, fontWeight:700, cursor:"pointer", color:"white" }}>Supprimer</button>
              </div>
            </div>
          ) : (
            <button onClick={()=>setConfirmDel(contact.id)} style={{ width:"100%", padding:"11px", background:"white", border:`1.5px solid ${C.border}`, borderRadius:11, fontSize:12, color:C.sub, cursor:"pointer" }}>🗑 Supprimer ce contact</button>
          )}
        </div>
      </div>
    );
  };

  // ── RENDU PRINCIPAL ────────────────────────────────────────────────────────
  const clientsCA = contacts.filter(c=>c.type==="Client"&&c.chiffreAffaires).reduce((s,c)=>s+parseFloat(c.chiffreAffaires||0),0);

  return (
    <div style={{ padding:"22px 18px 40px" }}>

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:700, color:C.text, margin:"0 0 3px", fontFamily:"'Cormorant Garamond',Georgia,serif" }}>Contacts</h1>
          <p style={{ color:C.sub, fontSize:13, margin:0 }}>{contacts.length} fiche{contacts.length!==1?"s":""} · {nbClients} client{nbClients!==1?"s":""} · {nbFourniss} fournisseur{nbFourniss!==1?"s":""}</p>
        </div>
        <button onClick={openNew} style={{ background:C.primary, color:"white", border:"none", borderRadius:12, padding:"10px 16px", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ fontSize:16 }}>+</span> Ajouter
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:20 }}>
        {[
          { label:"Clients",     value:nbClients,   max:MAX_CLIENTS,  color:C.primary, bg:C.primaryLight, icon:"🧑" },
          { label:"Fournisseurs",value:nbFourniss,  max:MAX_FOURNISS, color:C.accent,  bg:C.accentLight,  icon:"🏭" },
          { label:"CA clients",  value: clientsCA>0 ? clientsCA.toLocaleString("fr-FR")+"€" : "—",
            max:null, color:C.green, bg:C.greenLight, icon:"💰" },
        ].map(k => (
          <div key={k.label} style={{ background:k.bg, borderRadius:14, padding:"12px 10px", textAlign:"center", border:`1px solid ${k.color}22` }}>
            <div style={{ fontSize:16, marginBottom:3 }}>{k.icon}</div>
            <p style={{ fontSize:17, fontWeight:900, color:k.color, margin:"0 0 2px", fontFamily:"'Cormorant Garamond',serif" }}>{k.value}</p>
            <p style={{ fontSize:10, color:C.sub, margin:0, fontWeight:600 }}>{k.label}</p>
            {k.max && PLAN==="freemium" && (
              <p style={{ fontSize:9, color:k.color, margin:"2px 0 0", fontWeight:600, opacity:.7 }}>{typeof k.value==="number"?k.value:0}/{k.max}</p>
            )}
          </div>
        ))}
      </div>

      {/* Barre limite freemium */}
      {PLAN==="freemium" && (
        <div style={{ background:C.primaryLight, border:`1.5px solid ${C.borderDark}`, borderRadius:12, padding:"10px 14px", marginBottom:16, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <p style={{ fontSize:12, fontWeight:700, color:C.primary, margin:0 }}>
              {contacts.length}/{MAX_CONTACTS} contacts · Freemium
            </p>
            <div style={{ background:C.borderDark, borderRadius:6, height:4, width:160, marginTop:5 }}>
              <div style={{ background:C.primary, borderRadius:6, height:4, width:`${Math.min(100,(contacts.length/MAX_CONTACTS)*100)}%`, transition:"width .3s" }}/>
            </div>
          </div>
          <button style={{ padding:"7px 12px", background:C.primary, border:"none", borderRadius:9, color:"white", fontSize:11, fontWeight:700, cursor:"pointer" }}>💼 Business →</button>
        </div>
      )}

      {/* Recherche + filtres */}
      <div style={{ marginBottom:14 }}>
        <div style={{ position:"relative", marginBottom:10 }}>
          <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:14, color:C.sub }}>🔍</span>
          <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher nom, société, ville…"
            style={{ width:"100%", padding:"10px 12px 10px 36px", border:`1.5px solid ${C.border}`, borderRadius:12, background:C.card, fontSize:13, color:C.text, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>
        </div>
        <div style={{ display:"flex", gap:7 }}>
          {["Tous","Client","Fournisseur"].map(f => (
            <button key={f} onClick={()=>setFilter(f)} style={{ padding:"7px 14px", borderRadius:20, border:`2px solid ${filter===f?C.primary:C.border}`, background:filter===f?C.primaryLight:C.card, color:filter===f?C.primary:C.sub, fontSize:12, fontWeight:700, cursor:"pointer" }}>
              {f==="Tous"?"Tous ":""}
              {f==="Client"?"🧑 Clients":""}
              {f==="Fournisseur"?"🏭 Fournisseurs":""}
              {f==="Tous"?contacts.length:""}
            </button>
          ))}
        </div>
      </div>

      {/* Liste contacts */}
      {filtered.length === 0 ? (
        <div style={{ textAlign:"center", padding:"50px 20px", color:C.sub }}>
          <div style={{ fontSize:48, marginBottom:12 }}>📭</div>
          <p style={{ fontSize:15, fontWeight:700, color:C.text, margin:"0 0 6px" }}>Aucun contact trouvé</p>
          <p style={{ fontSize:13, margin:0 }}>
            {search ? "Essaie avec d'autres mots-clés" : "Commence par ajouter ton premier contact"}
          </p>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {filtered.map(c => {
            const av = avatarColor(c.type);
            return (
              <div key={c.id} onClick={()=>setDetail(c.id)}
                style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:"13px 15px", display:"flex", alignItems:"center", gap:13, cursor:"pointer", transition:"box-shadow .15s" }}
                onMouseEnter={e=>e.currentTarget.style.boxShadow="0 2px 12px rgba(82,50,55,0.1)"}
                onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
                {/* Avatar initiales */}
                <div style={{ width:44, height:44, borderRadius:13, background:av.bg, border:`1.5px solid ${av.color}33`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <span style={{ fontSize:15, fontWeight:800, color:av.color, fontFamily:"'Cormorant Garamond',serif" }}>{initiales(c)}</span>
                </div>
                {/* Infos */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
                    <p style={{ fontSize:14, fontWeight:700, color:C.text, margin:0 }}>{c.prenom} {c.nom}</p>
                    {c.tag && <span style={{ fontSize:9, fontWeight:700, padding:"2px 6px", borderRadius:10, background:C.yellowLight, color:tagColors[c.tag]||C.sub }}>{c.tag}</span>}
                  </div>
                  <p style={{ fontSize:12, color:C.sub, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {c.societe}{c.ville?` · ${c.ville}`:""}
                  </p>
                </div>
                {/* Badge type + CA */}
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <span style={{ fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:10, background:av.bg, color:av.color, display:"block", marginBottom:3 }}>{c.type}</span>
                  {c.type==="Client"&&c.chiffreAffaires&&(
                    <span style={{ fontSize:10, color:C.green, fontWeight:600 }}>{parseInt(c.chiffreAffaires).toLocaleString("fr-FR")}€</span>
                  )}
                </div>
                <span style={{ color:C.borderDark, fontSize:16 }}>›</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Modales */}
      {modal && <ModalForm />}
      {detail && <FicheDetail />}
    </div>
  );
}

// ── FACTURES PAGE ─────────────────────────────────────────────────────────────
function FacturesPage({ factures, setFactures, contacts, profil, PLAN, setTab }) {
  // PLAN vient des props App
  const MAX_FACTURES = PLAN === "freemium" ? 3 : Infinity;
  const TVA_RATES = [0, 5.5, 10, 20];

  // ── Données de démo ────────────────────────────────────────────────────────
  const CONTACTS_DEMO = contacts.filter(c => c.type === "Client"); // contacts clients depuis état global

  const MON_ENTREPRISE = { nom: profil.nom, adresse: profil.adresse||"", ville: profil.ville||"", cp: "", siret: profil.siret||"", email: profil.email||"" };

  const EMPTY_FACTURE = {
    numero:"", client:"", clientCustom:"", clientEmail:"", clientAdresse:"", clientVille:"", clientCP:"",
    date: new Date().toISOString().split("T")[0],
    dateEcheance:"",
    lignes:[{ desc:"", qte:1, pu:0, tva:20 }],
    notes:"", conditionsPaiement:"30 jours", statut:"Brouillon",
    mention:"",
  };

  // factures & setFactures viennent des props App (état global)

  const [view,    setView]    = useState("liste");   // "liste" | "form" | "detail" | "apercu"
  const [form,    setForm]    = useState(EMPTY_FACTURE);
  const [editId,  setEditId]  = useState(null);
  const [detailId,setDetailId]= useState(null);
  const [filter,  setFilter]  = useState("Toutes");
  const [confirmDel, setConfirmDel] = useState(null);

  const nextId   = () => Math.max(0, ...factures.map(f => f.id)) + 1;
  const nextNum  = () => { const y=new Date().getFullYear(); const n=factures.length+1; return `FA-${y}-${String(n).padStart(3,"0")}`; };
  const upd      = (k,v) => setForm(f => ({ ...f, [k]: v }));
  const updLigne = (i,k,v) => { const l=[...form.lignes]; l[i]={...l[i],[k]:v}; upd("lignes",l); };
  const addLigne = () => upd("lignes", [...form.lignes, { desc:"", qte:1, pu:0, tva:20 }]);
  const delLigne = (i) => { if(form.lignes.length===1)return; const l=[...form.lignes]; l.splice(i,1); upd("lignes",l); };

  // Calculs
  const calcLigne  = (l) => { const ht=parseFloat(l.qte||0)*parseFloat(l.pu||0); return { ht, tvaAmt: ht*(parseFloat(l.tva||0)/100), ttc: ht*(1+parseFloat(l.tva||0)/100) }; };
  const calcTotaux = (lignes) => lignes.reduce((acc,l) => { const c=calcLigne(l); return { ht:acc.ht+c.ht, tva:acc.tva+c.tvaAmt, ttc:acc.ttc+c.ttc }; }, { ht:0, tva:0, ttc:0 });

  const EUR = (n) => n.toLocaleString("fr-FR", { style:"currency", currency:"EUR", maximumFractionDigits:2 });

  // KPIs
  const kpiData = {
    payees:    factures.filter(f=>f.statut==="Payée").reduce((s,f)=>s+calcTotaux(f.lignes).ttc, 0),
    attente:   factures.filter(f=>f.statut==="En attente").reduce((s,f)=>s+calcTotaux(f.lignes).ttc, 0),
    retard:    factures.filter(f=>f.statut==="En retard").reduce((s,f)=>s+calcTotaux(f.lignes).ttc, 0),
    total:     factures.reduce((s,f)=>s+calcTotaux(f.lignes).ttc, 0),
  };

  const STATUTS = ["Brouillon","En attente","Payée","En retard","Annulée"];
  const STATUT_STYLE = {
    "Brouillon":  { color:C.sub,     bg:"#f0ebe8" },
    "En attente": { color:C.yellow,  bg:C.yellowLight },
    "Payée":      { color:C.green,   bg:C.greenLight },
    "En retard":  { color:C.red,     bg:C.redLight },
    "Annulée":    { color:C.sub,     bg:C.bg },
  };

  const filteredF = filter==="Toutes" ? factures : factures.filter(f=>f.statut===filter);

  // Sélection client depuis contacts
  const selectContact = (c) => {
    upd("client", `${c.prenom} ${c.nom}`);
    upd("clientEmail", c.email||"");
    upd("clientAdresse", c.adresse||"");
    upd("clientVille", c.ville||"");
    upd("clientCP", c.cp||"");
    upd("clientCustom", c.societe||"");
  };

  const openNew = () => {
    if (factures.length >= MAX_FACTURES && PLAN==="freemium") {
      alert(`Limite Freemium atteinte (${MAX_FACTURES} factures max). Passez à Business pour des factures illimitées.`);
      return;
    }
    setForm({ ...EMPTY_FACTURE, numero: nextNum(), dateEcheance: new Date(Date.now()+30*86400000).toISOString().split("T")[0] });
    setEditId(null);
    setView("form");
  };

  const openEdit = (f) => { setForm({ ...f }); setEditId(f.id); setView("form"); };

  const save = () => {
    if (!form.client.trim()) { alert("Le client est obligatoire."); return; }
    if (!form.numero.trim()) { alert("Le numéro de facture est obligatoire."); return; }
    const totaux = calcTotaux(form.lignes);
    const data = { ...form, id: editId || nextId() };
    if (editId) {
      setFactures(fs => fs.map(f => f.id===editId ? data : f));
    } else {
      setFactures(fs => [...fs, data]);
    }
    setView("liste");
  };

  const del = (id) => { setFactures(fs=>fs.filter(f=>f.id!==id)); setDetailId(null); setView("liste"); setConfirmDel(null); };
  const changeStatut = (id, statut) => setFactures(fs=>fs.map(f=>f.id===id?{...f,statut}:f));

  // ── VUE LISTE ──────────────────────────────────────────────────────────────
  const VueListe = () => (
    <div>
      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9, marginBottom:20 }}>
        {[
          { label:"Encaissé",    value:kpiData.payees,  color:C.green,   bg:C.greenLight,  icon:"✅" },
          { label:"En attente",  value:kpiData.attente, color:C.yellow,  bg:C.yellowLight, icon:"⏳" },
          { label:"En retard",   value:kpiData.retard,  color:C.red,     bg:C.redLight,    icon:"⚠️" },
          { label:"Total émis",  value:kpiData.total,   color:C.primary, bg:C.primaryLight,icon:"📊" },
        ].map(k=>(
          <div key={k.label} style={{ background:k.bg, borderRadius:14, padding:"13px 10px", textAlign:"center", border:`1px solid ${k.color}22` }}>
            <div style={{ fontSize:16, marginBottom:3 }}>{k.icon}</div>
            <p style={{ fontSize:15, fontWeight:900, color:k.color, margin:"0 0 2px", fontFamily:"'Cormorant Garamond',serif" }}>{EUR(k.value)}</p>
            <p style={{ fontSize:10, color:C.sub, margin:0, fontWeight:600 }}>{k.label}</p>
          </div>
        ))}
      </div>

      {/* Limite freemium */}
      {PLAN==="freemium" && (
        <div style={{ background:C.primaryLight, border:`1.5px solid ${C.borderDark}`, borderRadius:12, padding:"10px 14px", marginBottom:16, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <p style={{ fontSize:12, fontWeight:700, color:C.primary, margin:0 }}>{factures.length}/{MAX_FACTURES} factures · Freemium</p>
            <p style={{ fontSize:11, color:C.sub, margin:"2px 0 0" }}>Sans logo · Sans export PDF</p>
          </div>
          <button style={{ padding:"7px 12px", background:C.primary, border:"none", borderRadius:9, color:"white", fontSize:11, fontWeight:700, cursor:"pointer" }}>💼 Business →</button>
        </div>
      )}

      {/* Filtres statut */}
      <div style={{ display:"flex", gap:6, marginBottom:16, overflowX:"auto" }}>
        {["Toutes",...STATUTS].map(s=>(
          <button key={s} onClick={()=>setFilter(s)}
            style={{ flexShrink:0, padding:"6px 12px", borderRadius:20, border:`2px solid ${filter===s?C.primary:C.border}`, background:filter===s?C.primaryLight:C.card, color:filter===s?C.primary:C.sub, fontSize:11, fontWeight:700, cursor:"pointer" }}>
            {s}
          </button>
        ))}
      </div>

      {/* Liste factures */}
      {filteredF.length===0 ? (
        <div style={{ textAlign:"center", padding:"50px 20px" }}>
          <div style={{ fontSize:48, marginBottom:12 }}>🧾</div>
          <p style={{ fontSize:15, fontWeight:700, color:C.text, margin:"0 0 6px" }}>Aucune facture</p>
          <p style={{ fontSize:13, color:C.sub, margin:"0 0 20px" }}>Crée ta première facture en quelques clics</p>
          <button onClick={openNew} style={{ padding:"12px 24px", background:C.primary, border:"none", borderRadius:12, color:"white", fontSize:13, fontWeight:700, cursor:"pointer" }}>+ Nouvelle facture</button>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {filteredF.map(f=>{
            const tot=calcTotaux(f.lignes);
            const ss=STATUT_STYLE[f.statut]||STATUT_STYLE["Brouillon"];
            return(
              <div key={f.id} onClick={()=>{setDetailId(f.id);setView("detail");}}
                style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:"14px 15px", cursor:"pointer" }}
                onMouseEnter={e=>e.currentTarget.style.boxShadow="0 2px 12px rgba(82,50,55,0.1)"}
                onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                  <div>
                    <p style={{ fontSize:14, fontWeight:700, color:C.text, margin:"0 0 2px" }}>{f.client}</p>
                    <p style={{ fontSize:11, color:C.sub, margin:0 }}>{f.numero} · {new Date(f.date).toLocaleDateString("fr-FR")}</p>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <p style={{ fontSize:16, fontWeight:900, color:C.primary, margin:"0 0 4px", fontFamily:"'Cormorant Garamond',serif" }}>{EUR(tot.ttc)}</p>
                    <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:10, background:ss.bg, color:ss.color }}>{f.statut}</span>
                  </div>
                </div>
                {f.dateEcheance && (
                  <p style={{ fontSize:11, color:f.statut==="En retard"?C.red:C.sub, margin:0 }}>
                    Échéance : {new Date(f.dateEcheance).toLocaleDateString("fr-FR")}
                    {f.statut==="En retard" && " · ⚠️ Dépassée"}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // ── FORMULAIRE CRÉATION / ÉDITION ──────────────────────────────────────────
  const VueForm = () => {
    const totaux = calcTotaux(form.lignes);
    return (
      <div>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
          <button onClick={()=>setView("liste")} style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:9, padding:"8px 12px", fontSize:13, cursor:"pointer", color:C.sub }}>← Retour</button>
          <h2 style={{ fontSize:18, fontWeight:700, color:C.text, margin:0, fontFamily:"'Cormorant Garamond',serif" }}>
            {editId ? "Modifier la facture" : "Nouvelle facture"}
          </h2>
        </div>

        {/* Infos de base */}
        <div style={{ background:C.card, borderRadius:16, border:`1px solid ${C.border}`, padding:"16px", marginBottom:14 }}>
          <p style={{ fontSize:12, fontWeight:700, color:C.sub, textTransform:"uppercase", letterSpacing:.5, margin:"0 0 12px" }}>Informations générales</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
            {[["Numéro *","numero","FA-2026-001"],["Statut","statut",null]].map(([label,key,ph])=>(
              <div key={key}>
                <label style={{ fontSize:11, fontWeight:700, color:C.sub, display:"block", marginBottom:3, textTransform:"uppercase", letterSpacing:.4 }}>{label}</label>
                {key==="statut" ? (
                  <select value={form[key]} onChange={e=>upd(key,e.target.value)}
                    style={{ width:"100%", padding:"9px 10px", border:`1.5px solid ${C.border}`, borderRadius:9, background:C.bg, fontSize:13, color:C.text, outline:"none", fontFamily:"inherit" }}>
                    {STATUTS.map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                ) : (
                  <input type="text" value={form[key]} placeholder={ph} onChange={e=>upd(key,e.target.value)}
                    style={{ width:"100%", padding:"9px 10px", border:`1.5px solid ${C.border}`, borderRadius:9, background:C.bg, fontSize:13, color:C.text, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>
                )}
              </div>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {[["Date de facture","date","date"],["Date d'échéance","dateEcheance","date"]].map(([label,key,type])=>(
              <div key={key}>
                <label style={{ fontSize:11, fontWeight:700, color:C.sub, display:"block", marginBottom:3, textTransform:"uppercase", letterSpacing:.4 }}>{label}</label>
                <input type={type} value={form[key]} onChange={e=>upd(key,e.target.value)}
                  style={{ width:"100%", padding:"9px 10px", border:`1.5px solid ${C.border}`, borderRadius:9, background:C.bg, fontSize:13, color:C.text, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>
              </div>
            ))}
          </div>
        </div>

        {/* Client */}
        <div style={{ background:C.card, borderRadius:16, border:`1px solid ${C.border}`, padding:"16px", marginBottom:14 }}>
          <p style={{ fontSize:12, fontWeight:700, color:C.sub, textTransform:"uppercase", letterSpacing:.5, margin:"0 0 12px" }}>Client</p>
          {/* Sélecteur depuis contacts */}
          <p style={{ fontSize:11, color:C.sub, margin:"0 0 8px" }}>Choisir depuis mes contacts :</p>
          <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:12 }}>
            {CONTACTS_DEMO.map(c=>(
              <button key={c.id} onClick={()=>selectContact(c)}
                style={{ padding:"7px 12px", borderRadius:10, border:`1.5px solid ${form.client===`${c.prenom} ${c.nom}`?C.primary:C.border}`, background:form.client===`${c.prenom} ${c.nom}`?C.primaryLight:C.bg, color:form.client===`${c.prenom} ${c.nom}`?C.primary:C.text, fontSize:12, fontWeight:600, cursor:"pointer" }}>
                {c.prenom} {c.nom}
              </button>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
            {[["Nom client *","client","Ex : Marie Dupont"],["Société","clientCustom","Ex : Boulangerie Dupont"]].map(([label,key,ph])=>(
              <div key={key}>
                <label style={{ fontSize:11, fontWeight:700, color:C.sub, display:"block", marginBottom:3, textTransform:"uppercase", letterSpacing:.4 }}>{label}</label>
                <input type="text" value={form[key]} placeholder={ph} onChange={e=>upd(key,e.target.value)}
                  style={{ width:"100%", padding:"9px 10px", border:`1.5px solid ${C.border}`, borderRadius:9, background:C.bg, fontSize:13, color:C.text, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>
              </div>
            ))}
          </div>
          <div>
            <label style={{ fontSize:11, fontWeight:700, color:C.sub, display:"block", marginBottom:3, textTransform:"uppercase", letterSpacing:.4 }}>Email</label>
            <input type="email" value={form.clientEmail} placeholder="client@exemple.fr" onChange={e=>upd("clientEmail",e.target.value)}
              style={{ width:"100%", padding:"9px 10px", border:`1.5px solid ${C.border}`, borderRadius:9, background:C.bg, fontSize:13, color:C.text, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>
          </div>
        </div>

        {/* Lignes de facturation */}
        <div style={{ background:C.card, borderRadius:16, border:`1px solid ${C.border}`, padding:"16px", marginBottom:14 }}>
          <p style={{ fontSize:12, fontWeight:700, color:C.sub, textTransform:"uppercase", letterSpacing:.5, margin:"0 0 12px" }}>Prestations / Articles</p>
          {form.lignes.map((l,i)=>{
            const c=calcLigne(l);
            return(
              <div key={i} style={{ background:C.bg, borderRadius:12, padding:"12px", marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                  <span style={{ fontSize:12, fontWeight:700, color:C.sub }}>Ligne {i+1}</span>
                  {form.lignes.length>1 && (
                    <button onClick={()=>delLigne(i)} style={{ background:"none", border:"none", color:C.red, fontSize:14, cursor:"pointer", padding:"2px 6px" }}>✕</button>
                  )}
                </div>
                <input type="text" value={l.desc} placeholder="Description de la prestation ou de l'article" onChange={e=>updLigne(i,"desc",e.target.value)}
                  style={{ width:"100%", padding:"9px 10px", border:`1.5px solid ${C.border}`, borderRadius:9, background:C.card, fontSize:13, color:C.text, outline:"none", fontFamily:"inherit", boxSizing:"border-box", marginBottom:8 }}/>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:7 }}>
                  {[["Qté","qte","number",1],["Prix HT (€)","pu","number",0.01]].map(([label,key,type,min])=>(
                    <div key={key}>
                      <label style={{ fontSize:10, fontWeight:700, color:C.sub, display:"block", marginBottom:2 }}>{label}</label>
                      <input type={type} value={l[key]} min={min} step={type==="number"&&key==="pu"?0.01:1} onChange={e=>updLigne(i,key,e.target.value)}
                        style={{ width:"100%", padding:"8px 6px", border:`1.5px solid ${C.border}`, borderRadius:8, background:C.card, fontSize:12, color:C.text, outline:"none", textAlign:"center" }}/>
                    </div>
                  ))}
                  <div>
                    <label style={{ fontSize:10, fontWeight:700, color:C.sub, display:"block", marginBottom:2 }}>TVA %</label>
                    <select value={l.tva} onChange={e=>updLigne(i,"tva",e.target.value)}
                      style={{ width:"100%", padding:"8px 4px", border:`1.5px solid ${C.border}`, borderRadius:8, background:C.card, fontSize:12, color:C.text, outline:"none", fontFamily:"inherit" }}>
                      {TVA_RATES.map(r=><option key={r} value={r}>{r}%</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize:10, fontWeight:700, color:C.sub, display:"block", marginBottom:2 }}>Total TTC</label>
                    <p style={{ padding:"8px 6px", fontSize:12, fontWeight:700, color:C.primary, margin:0, textAlign:"right" }}>{EUR(c.ttc)}</p>
                  </div>
                </div>
              </div>
            );
          })}
          <button onClick={addLigne} style={{ width:"100%", padding:"10px", background:C.primaryLight, border:`1.5px dashed ${C.primary}`, borderRadius:11, color:C.primary, fontSize:13, fontWeight:700, cursor:"pointer" }}>
            + Ajouter une ligne
          </button>

          {/* Totaux */}
          <div style={{ background:C.bg, borderRadius:12, padding:"14px", marginTop:12 }}>
            {[["Total HT", totaux.ht],["TVA", totaux.tva]].map(([l,v])=>(
              <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:`1px solid ${C.border}` }}>
                <span style={{ fontSize:13, color:C.sub }}>{l}</span>
                <span style={{ fontSize:13, fontWeight:600, color:C.text }}>{EUR(v)}</span>
              </div>
            ))}
            <div style={{ display:"flex", justifyContent:"space-between", padding:"10px 0 0" }}>
              <span style={{ fontSize:15, fontWeight:800, color:C.text }}>TOTAL TTC</span>
              <span style={{ fontSize:18, fontWeight:900, color:C.primary, fontFamily:"'Cormorant Garamond',serif" }}>{EUR(totaux.ttc)}</span>
            </div>
          </div>
        </div>

        {/* Notes + conditions */}
        <div style={{ background:C.card, borderRadius:16, border:`1px solid ${C.border}`, padding:"16px", marginBottom:20 }}>
          <p style={{ fontSize:12, fontWeight:700, color:C.sub, textTransform:"uppercase", letterSpacing:.5, margin:"0 0 12px" }}>Notes & conditions</p>
          <div style={{ marginBottom:10 }}>
            <label style={{ fontSize:11, fontWeight:700, color:C.sub, display:"block", marginBottom:3, textTransform:"uppercase", letterSpacing:.4 }}>Conditions de paiement</label>
            <select value={form.conditionsPaiement} onChange={e=>upd("conditionsPaiement",e.target.value)}
              style={{ width:"100%", padding:"9px 10px", border:`1.5px solid ${C.border}`, borderRadius:9, background:C.bg, fontSize:13, color:C.text, outline:"none", fontFamily:"inherit" }}>
              {["À réception","8 jours","15 jours","30 jours","45 jours","60 jours"].map(v=><option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize:11, fontWeight:700, color:C.sub, display:"block", marginBottom:3, textTransform:"uppercase", letterSpacing:.4 }}>Message / notes</label>
            <textarea value={form.notes} placeholder="Merci pour votre confiance. En cas de retard de paiement…" onChange={e=>upd("notes",e.target.value)} rows={3}
              style={{ width:"100%", padding:"9px 10px", border:`1.5px solid ${C.border}`, borderRadius:9, background:C.bg, fontSize:13, color:C.text, outline:"none", fontFamily:"inherit", resize:"vertical", lineHeight:1.5, boxSizing:"border-box" }}/>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={()=>setView("liste")} style={{ flex:1, padding:"13px", background:C.card, border:`1.5px solid ${C.border}`, borderRadius:12, fontSize:13, fontWeight:600, cursor:"pointer", color:C.sub }}>Annuler</button>
          <button onClick={save} style={{ flex:2, padding:"13px", background:C.primary, border:"none", borderRadius:12, fontSize:14, fontWeight:800, cursor:"pointer", color:"white" }}>
            ✓ {editId?"Mettre à jour":"Enregistrer la facture"}
          </button>
        </div>
      </div>
    );
  };

  // ── DÉTAIL FACTURE ─────────────────────────────────────────────────────────
  const facture = factures.find(f=>f.id===detailId);
  const VueDetail = () => {
    if (!facture) return null;
    const tot = calcTotaux(facture.lignes);
    const ss  = STATUT_STYLE[facture.statut]||STATUT_STYLE["Brouillon"];
    return (
      <div>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
          <button onClick={()=>setView("liste")} style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:9, padding:"8px 12px", fontSize:13, cursor:"pointer", color:C.sub }}>← Retour</button>
          <h2 style={{ fontSize:18, fontWeight:700, color:C.text, margin:0, fontFamily:"'Cormorant Garamond',serif" }}>{facture.numero}</h2>
          <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, background:ss.bg, color:ss.color, marginLeft:"auto" }}>{facture.statut}</span>
        </div>

        {/* En-tête facture style doc */}
        <div style={{ background:C.card, borderRadius:16, border:`1px solid ${C.border}`, padding:"20px", marginBottom:14 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
            <div>
              <p style={{ fontSize:11, fontWeight:700, color:C.sub, margin:"0 0 2px", textTransform:"uppercase", letterSpacing:.5 }}>De</p>
              <p style={{ fontSize:14, fontWeight:700, color:C.text, margin:"0 0 1px" }}>{MON_ENTREPRISE.nom}</p>
              <p style={{ fontSize:12, color:C.sub, margin:0 }}>{MON_ENTREPRISE.adresse}, {MON_ENTREPRISE.cp} {MON_ENTREPRISE.ville}</p>
              <p style={{ fontSize:12, color:C.sub, margin:0 }}>SIRET : {MON_ENTREPRISE.siret}</p>
            </div>
            <div style={{ textAlign:"right" }}>
              <p style={{ fontSize:11, fontWeight:700, color:C.sub, margin:"0 0 2px", textTransform:"uppercase", letterSpacing:.5 }}>À</p>
              <p style={{ fontSize:14, fontWeight:700, color:C.text, margin:"0 0 1px" }}>{facture.client}</p>
              {facture.clientCustom && <p style={{ fontSize:12, color:C.sub, margin:0 }}>{facture.clientCustom}</p>}
              {facture.clientEmail  && <p style={{ fontSize:12, color:C.sub, margin:0 }}>{facture.clientEmail}</p>}
            </div>
          </div>
          <div style={{ display:"flex", gap:20, padding:"10px 0", borderTop:`1px solid ${C.border}` }}>
            {[["Date",new Date(facture.date).toLocaleDateString("fr-FR")],["Échéance",facture.dateEcheance?new Date(facture.dateEcheance).toLocaleDateString("fr-FR"):"—"],["Paiement",facture.conditionsPaiement]].map(([l,v])=>(
              <div key={l}>
                <p style={{ fontSize:10, fontWeight:700, color:C.sub, margin:"0 0 1px", textTransform:"uppercase", letterSpacing:.5 }}>{l}</p>
                <p style={{ fontSize:12, color:C.text, margin:0, fontWeight:600 }}>{v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Lignes */}
        <div style={{ background:C.card, borderRadius:16, border:`1px solid ${C.border}`, padding:"16px", marginBottom:14 }}>
          <div style={{ display:"grid", gridTemplateColumns:"3fr 1fr 1fr 1fr", gap:8, marginBottom:8 }}>
            {["Description","Qté","PU HT","Total TTC"].map(h=><span key={h} style={{ fontSize:10, fontWeight:700, color:C.sub, textTransform:"uppercase", letterSpacing:.4 }}>{h}</span>)}
          </div>
          {facture.lignes.map((l,i)=>{
            const c=calcLigne(l);
            return(
              <div key={i} style={{ display:"grid", gridTemplateColumns:"3fr 1fr 1fr 1fr", gap:8, padding:"9px 0", borderTop:`1px solid ${C.border}` }}>
                <span style={{ fontSize:13, color:C.text }}>{l.desc||"—"} <span style={{ fontSize:10, color:C.sub }}>(TVA {l.tva}%)</span></span>
                <span style={{ fontSize:13, color:C.text, textAlign:"center" }}>{l.qte}</span>
                <span style={{ fontSize:13, color:C.text, textAlign:"right" }}>{EUR(parseFloat(l.pu||0))}</span>
                <span style={{ fontSize:13, fontWeight:700, color:C.primary, textAlign:"right" }}>{EUR(c.ttc)}</span>
              </div>
            );
          })}
          <div style={{ borderTop:`2px solid ${C.primary}`, paddingTop:10, marginTop:8 }}>
            {[["Sous-total HT",tot.ht],["TVA",tot.tva]].map(([l,v])=>(
              <div key={l} style={{ display:"flex", justifyContent:"flex-end", gap:20, marginBottom:4 }}>
                <span style={{ fontSize:12, color:C.sub }}>{l}</span>
                <span style={{ fontSize:12, fontWeight:600, color:C.text, minWidth:80, textAlign:"right" }}>{EUR(v)}</span>
              </div>
            ))}
            <div style={{ display:"flex", justifyContent:"flex-end", gap:20 }}>
              <span style={{ fontSize:15, fontWeight:800, color:C.text }}>TOTAL TTC</span>
              <span style={{ fontSize:18, fontWeight:900, color:C.primary, fontFamily:"'Cormorant Garamond',serif", minWidth:80, textAlign:"right" }}>{EUR(tot.ttc)}</span>
            </div>
          </div>
        </div>

        {facture.notes && (
          <div style={{ background:C.yellowLight, borderRadius:12, padding:"12px 14px", marginBottom:14 }}>
            <p style={{ fontSize:11, fontWeight:700, color:C.yellow, margin:"0 0 4px", textTransform:"uppercase", letterSpacing:.5 }}>📝 Notes</p>
            <p style={{ fontSize:13, color:C.text, margin:0 }}>{facture.notes}</p>
          </div>
        )}

        {/* Changer statut */}
        <div style={{ background:C.card, borderRadius:14, border:`1px solid ${C.border}`, padding:"14px", marginBottom:14 }}>
          <p style={{ fontSize:12, fontWeight:700, color:C.sub, textTransform:"uppercase", letterSpacing:.5, margin:"0 0 10px" }}>Changer le statut</p>
          <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
            {STATUTS.filter(s=>s!==facture.statut).map(s=>{
              const st=STATUT_STYLE[s];
              return(
                <button key={s} onClick={()=>changeStatut(facture.id,s)}
                  style={{ padding:"7px 13px", borderRadius:10, border:`1.5px solid ${st.color}44`, background:st.bg, color:st.color, fontSize:12, fontWeight:700, cursor:"pointer" }}>
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
          <button onClick={()=>openEdit(facture)}
            style={{ padding:"12px", background:C.primaryLight, border:`1.5px solid ${C.primary}33`, borderRadius:12, color:C.primary, fontSize:13, fontWeight:700, cursor:"pointer" }}>
            ✏️ Modifier
          </button>
          {PLAN!=="freemium" ? (
            <button style={{ padding:"12px", background:C.greenLight, border:`1.5px solid ${C.green}33`, borderRadius:12, color:C.green, fontSize:13, fontWeight:700, cursor:"pointer" }}>
              📄 Export PDF
            </button>
          ) : (
            <button style={{ padding:"12px", background:C.bg, border:`1.5px solid ${C.border}`, borderRadius:12, color:C.sub, fontSize:13, fontWeight:600, cursor:"pointer" }}>
              🔒 PDF · Business
            </button>
          )}
        </div>

        {/* Supprimer */}
        {confirmDel===facture.id ? (
          <div style={{ background:C.redLight, borderRadius:12, padding:"13px", textAlign:"center" }}>
            <p style={{ fontSize:13, color:C.red, fontWeight:700, margin:"0 0 12px" }}>Supprimer définitivement cette facture ?</p>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={()=>setConfirmDel(null)} style={{ flex:1, padding:"10px", background:C.card, border:`1.5px solid ${C.border}`, borderRadius:10, fontSize:13, cursor:"pointer", color:C.sub }}>Annuler</button>
              <button onClick={()=>del(facture.id)} style={{ flex:1, padding:"10px", background:C.red, border:"none", borderRadius:10, fontSize:13, fontWeight:700, cursor:"pointer", color:"white" }}>Supprimer</button>
            </div>
          </div>
        ) : (
          <button onClick={()=>setConfirmDel(facture.id)} style={{ width:"100%", padding:"11px", background:C.card, border:`1.5px solid ${C.border}`, borderRadius:11, fontSize:12, color:C.sub, cursor:"pointer" }}>🗑 Supprimer cette facture</button>
        )}
      </div>
    );
  };

  // ── RENDU PRINCIPAL ────────────────────────────────────────────────────────
  return (
    <div style={{ padding:"22px 18px 40px" }}>
      {/* Header */}
      {view==="liste" && (
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
          <div>
            <h1 style={{ fontSize:24, fontWeight:700, color:C.text, margin:"0 0 3px", fontFamily:"'Cormorant Garamond',Georgia,serif" }}>Factures</h1>
            <p style={{ color:C.sub, fontSize:13, margin:0 }}>{factures.length} facture{factures.length!==1?"s":""}</p>
          </div>
          <button onClick={openNew} style={{ background:C.primary, color:"white", border:"none", borderRadius:12, padding:"10px 16px", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ fontSize:16 }}>+</span> Nouvelle
          </button>
        </div>
      )}
      {view==="liste"  && <VueListe/>}
      {view==="form"   && <VueForm/>}
      {view==="detail" && <VueDetail/>}
    </div>
  );
}

// ── MON COMPTE PAGE ───────────────────────────────────────────────────────────
function ComptePage({ profil, setProfil, PLAN, contacts, factures, tasks }) {
  // PLAN, profil, setProfil viennent des props App
  const [editProfil, setEditProfil] = useState(false);
  const [formProfil, setFormProfil] = useState({ ...profil });
  const updP = (k,v) => setFormProfil(f=>({...f,[k]:v}));

  const saveProfil = () => { setProfil({...formProfil}); setEditProfil(false); };

  const initiales = (nom) => nom.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase() || "ME";

  const PLANS = [
    {
      id: "freemium", name: "Freemium", price: "Gratuit", icon: "🌱",
      color: C.sub, bg: C.bg, border: C.borderDark,
      features: [
        "✓ Parcours création 5 étapes + IA",
        "✓ Simulateurs financiers (année 1)",
        "✓ 20 contacts (10 clients + 10 fourn.)",
        "✓ 3 factures max · sans logo",
        "✓ Tâches illimitées",
        "✗ Export PDF",
        "✗ Business plan complet",
        "✗ Prévisionnel 3 ans",
      ],
      cta: "Plan actuel", active: PLAN==="freemium",
    },
    {
      id: "business", name: "Business", price: "19 €/mois", icon: "💼",
      color: C.primary, bg: C.primaryLight, border: C.primary,
      features: [
        "✓ Tout Freemium +",
        "✓ Contacts illimités",
        "✓ Factures illimitées + logo",
        "✓ Export PDF (factures + BP)",
        "✓ Business plan 8 sections",
        "✓ Prévisionnel financier 3 ans",
        "✓ Graphiques & comparateurs",
        "✓ Support par email",
      ],
      cta: "Passer à Business", active: PLAN==="business",
    },
    {
      id: "premium", name: "Premium", price: "39 €/mois", icon: "⭐",
      color: C.purple, bg: C.purpleLight, border: C.purple,
      features: [
        "✓ Tout Business +",
        "✓ Business plan 10 sections (IA avancée)",
        "✓ Amortissements & BFR détaillé",
        "✓ Scénarios trésorerie (pessimiste/optimiste)",
        "✓ Simulation IS personnalisée",
        "✓ Factures personnalisation complète",
        "✓ Documents partagés (équipe)",
        "✓ Support prioritaire",
      ],
      cta: "Passer à Premium", active: PLAN==="premium",
    },
  ];

  const LIENS = [
    { icon:"📋", label:"Mentions légales", sub:"CGU & politique de confidentialité" },
    { icon:"🔒", label:"Sécurité & mot de passe", sub:"Changer mon mot de passe" },
    { icon:"🔔", label:"Notifications", sub:"Rappels d'échéances & alertes" },
    { icon:"📤", label:"Exporter mes données", sub:"Télécharger toutes mes données (RGPD)", locked: PLAN==="freemium" },
    { icon:"🗑", label:"Supprimer mon compte", sub:"Action irréversible", danger: true },
  ];

  return (
    <div style={{ padding:"22px 18px 40px" }}>

      {/* Header */}
      <div style={{ marginBottom:22 }}>
        <h1 style={{ fontSize:24, fontWeight:700, color:C.text, margin:"0 0 3px", fontFamily:"'Cormorant Garamond',Georgia,serif" }}>Mon Compte</h1>
        <p style={{ color:C.sub, fontSize:13, margin:0 }}>Profil · abonnement · paramètres</p>
      </div>

      {/* Carte Profil */}
      <div style={{ background:C.card, borderRadius:18, border:`1px solid ${C.border}`, padding:"18px", marginBottom:18 }}>
        <div style={{ display:"flex", alignItems:"center", gap:15, marginBottom: editProfil ? 18 : 0 }}>
          {/* Avatar monogramme cuir */}
          <div style={{
            width:58, height:58, borderRadius:18, flexShrink:0,
            background:`linear-gradient(135deg, ${C.primaryLight}, ${C.borderDark})`,
            border:`2px solid ${C.borderDark}`,
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            <span style={{ fontSize:20, fontWeight:800, color:C.primary, fontFamily:"'Cormorant Garamond',serif" }}>
              {initiales(profil.nom)}
            </span>
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontSize:16, fontWeight:700, color:C.text, margin:"0 0 2px", fontFamily:"'Cormorant Garamond',serif" }}>{profil.nom}</p>
            <p style={{ fontSize:12, color:C.sub, margin:"0 0 6px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{profil.email}</p>
            <span style={{ fontSize:10, fontWeight:700, padding:"3px 9px", borderRadius:10,
              background: PLAN==="premium"?C.purpleLight:PLAN==="business"?C.primaryLight:C.bg,
              color: PLAN==="premium"?C.purple:PLAN==="business"?C.primary:C.sub,
            }}>
              {PLAN==="freemium"?"🌱 Freemium":PLAN==="business"?"💼 Business":"⭐ Premium"}
            </span>
          </div>
          <button onClick={()=>{setFormProfil({...profil});setEditProfil(!editProfil);}}
            style={{ background:C.bg, border:`1.5px solid ${C.border}`, borderRadius:9, padding:"7px 12px", fontSize:12, fontWeight:700, cursor:"pointer", color:C.text, flexShrink:0 }}>
            {editProfil ? "✕" : "✏️ Modifier"}
          </button>
        </div>

        {/* Formulaire édition profil */}
        {editProfil && (
          <div>
            <div style={{ height:1, background:C.border, marginBottom:16 }}/>
            {[
              [["Nom / Raison sociale","nom","MonEntreprise SARL"],["Email","email","contact@exemple.fr"]],
              [["Téléphone","tel","06 XX XX XX XX"],["Activité","activite","Ex : Consultant digital"]],
              [["SIRET","siret","123 456 789 00012"],["Ville","ville","Paris"]],
            ].map((row, ri) => (
              <div key={ri} style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
                {row.map(([label,key,ph]) => (
                  <div key={key}>
                    <label style={{ fontSize:10, fontWeight:700, color:C.sub, display:"block", marginBottom:3, textTransform:"uppercase", letterSpacing:.4 }}>{label}</label>
                    <input type="text" value={formProfil[key]} placeholder={ph} onChange={e=>updP(key,e.target.value)}
                      style={{ width:"100%", padding:"9px 10px", border:`1.5px solid ${C.border}`, borderRadius:9, background:C.bg, fontSize:13, color:C.text, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>
                  </div>
                ))}
              </div>
            ))}
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:10, fontWeight:700, color:C.sub, display:"block", marginBottom:3, textTransform:"uppercase", letterSpacing:.4 }}>Adresse</label>
              <input type="text" value={formProfil.adresse} placeholder="12 rue de l'Innovation" onChange={e=>updP("adresse",e.target.value)}
                style={{ width:"100%", padding:"9px 10px", border:`1.5px solid ${C.border}`, borderRadius:9, background:C.bg, fontSize:13, color:C.text, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>setEditProfil(false)} style={{ flex:1, padding:"11px", background:"white", border:`1.5px solid ${C.border}`, borderRadius:11, fontSize:13, cursor:"pointer", color:C.sub, fontWeight:600 }}>Annuler</button>
              <button onClick={saveProfil} style={{ flex:2, padding:"11px", background:C.primary, border:"none", borderRadius:11, fontSize:13, fontWeight:800, cursor:"pointer", color:"white" }}>✓ Enregistrer</button>
            </div>
          </div>
        )}
      </div>

      {/* Stats rapides */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:9, marginBottom:18 }}>
        {[
          { label:"Contacts", value: contacts.length, icon:"👥", color:C.primary, bg:C.primaryLight },
          { label:"Factures", value: factures.length, icon:"🧾", color:C.accent,  bg:C.accentLight },
          { label:"Tâches en cours", value: tasks.filter(t=>!t.done).length, icon:"✅", color:C.green, bg:C.greenLight },
        ].map(s => (
          <div key={s.label} style={{ background:s.bg, border:`1px solid ${s.color}22`, borderRadius:13, padding:"12px 8px", textAlign:"center" }}>
            <div style={{ fontSize:16, marginBottom:3 }}>{s.icon}</div>
            <p style={{ fontSize:19, fontWeight:700, color:s.color, margin:"0 0 2px", fontFamily:"'Cormorant Garamond',serif" }}>{s.value}</p>
            <p style={{ fontSize:9, color:C.sub, margin:0, fontWeight:600, textTransform:"uppercase", letterSpacing:.5 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Section Abonnement */}
      <p style={{ fontSize:11, fontWeight:700, color:C.sub, textTransform:"uppercase", letterSpacing:1, margin:"0 0 12px" }}>Mon abonnement</p>

      <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:26 }}>
        {PLANS.map(p => (
          <div key={p.id} style={{
            background: p.active ? p.bg : C.card,
            border: `2px solid ${p.active ? p.border : C.border}`,
            borderRadius:16, padding:"16px 18px", position:"relative",
            transition:"border-color .2s",
          }}>
            {p.active && (
              <div style={{ position:"absolute", top:-10, left:16, background:p.color, color:"white", fontSize:9, fontWeight:700, padding:"3px 10px", borderRadius:10, textTransform:"uppercase", letterSpacing:.5 }}>
                Plan actuel
              </div>
            )}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:18 }}>{p.icon}</span>
                <span style={{ fontSize:16, fontWeight:700, color:p.color, fontFamily:"'Cormorant Garamond',serif" }}>{p.name}</span>
              </div>
              <span style={{ fontSize:15, fontWeight:800, color:C.text }}>{p.price}</span>
            </div>

            {/* Features — accordéon simple sur le plan actuel, toujours visibles sur les autres */}
            <div style={{ display:"flex", flexDirection:"column", gap:3, marginBottom:12 }}>
              {p.features.map((f,i) => (
                <span key={i} style={{
                  fontSize:11, color: f.startsWith("✗") ? C.sub : C.text,
                  opacity: f.startsWith("✗") ? 0.5 : 1,
                  fontWeight: f.startsWith("✓ Tout") ? 700 : 400,
                }}>{f}</span>
              ))}
            </div>

            <button
              disabled={p.active}
              style={{
                width:"100%", padding:"11px", borderRadius:11, fontSize:13, fontWeight:700, cursor: p.active?"default":"pointer",
                background: p.active ? "transparent" : p.color,
                border: p.active ? `1.5px solid ${p.border}` : "none",
                color: p.active ? p.color : "white",
                opacity: p.active ? 0.6 : 1,
              }}>
              {p.cta}
            </button>
          </div>
        ))}
      </div>

      {/* Section Paramètres */}
      <p style={{ fontSize:11, fontWeight:700, color:C.sub, textTransform:"uppercase", letterSpacing:1, margin:"0 0 12px" }}>Paramètres & confidentialité</p>

      <div style={{ background:C.card, borderRadius:16, border:`1px solid ${C.border}`, overflow:"hidden", marginBottom:32 }}>
        {LIENS.map((l, i) => (
          <div key={i}
            style={{
              display:"flex", alignItems:"center", gap:14, padding:"14px 16px",
              borderBottom: i<LIENS.length-1 ? `1px solid ${C.border}` : "none",
              cursor:"pointer", background:"white",
            }}
            onMouseEnter={e=>e.currentTarget.style.background=C.bg}
            onMouseLeave={e=>e.currentTarget.style.background="white"}>
            <span style={{ fontSize:20, flexShrink:0 }}>{l.icon}</span>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:13, fontWeight:700, color:l.danger?C.red:C.text, margin:"0 0 1px" }}>{l.label}</p>
              <p style={{ fontSize:11, color:C.sub, margin:0 }}>{l.sub}</p>
            </div>
            {l.locked && (
              <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:8, background:C.yellowLight, color:C.yellow }}>Business</span>
            )}
            {!l.locked && <span style={{ color:C.borderDark, fontSize:16 }}>›</span>}
          </div>
        ))}
      </div>

      {/* Version */}
      <div style={{ textAlign:"center" }}>
        <p style={{ fontSize:11, color:C.sub, margin:"0 0 3px", fontFamily:"'Cormorant Garamond',serif", letterSpacing:1 }}>MonEntreprise · Carnet Pro</p>
        <p style={{ fontSize:10, color:C.borderDark, margin:0 }}>v1.0.0 — 2026</p>
      </div>

    </div>
  );
}

// ── TÂCHES PAGE ───────────────────────────────────────────────────────────────
function TachesPage({ tasks, setTasks, PLAN }) {
  const CATS    = ["Toutes","Création","Légal","Finance","Marketing","Admin","Perso"];
  const PRIOS   = ["Toutes","urgent","high","medium","low"];
  const catMeta = {
    Création: { color:C.primary,  bg:C.primaryLight  },
    Légal:    { color:C.purple,   bg:C.purpleLight   },
    Finance:  { color:C.green,    bg:C.greenLight    },
    Marketing:{ color:C.accent,   bg:C.accentLight   },
    Admin:    { color:C.yellow,   bg:C.yellowLight   },
    Perso:    { color:C.sub,      bg:C.bg            },
  };
  const prioMeta = {
    urgent: { label:"🔴 Urgent",  color:C.red,     bg:C.redLight    },
    high:   { label:"🟠 Élevée",  color:C.accent,  bg:C.accentLight },
    medium: { label:"🟡 Moyenne", color:C.yellow,  bg:C.yellowLight },
    low:    { label:"🟢 Basse",   color:C.green,   bg:C.greenLight  },
  };

  const EMPTY = { text:"", cat:"Création", priority:"medium", echeance:"", notes:"" };

  // tasks & setTasks viennent des props App (état global partagé avec Accueil)

  const [filterCat,  setFilterCat]  = useState("Toutes");
  const [filterPrio, setFilterPrio] = useState("Toutes");
  const [filterDone, setFilterDone] = useState("En cours"); // "Toutes" | "En cours" | "Terminées"
  const [tri,        setTri]        = useState("echeance"); // "echeance" | "priorite" | "creation"
  const [modal,      setModal]      = useState(false);      // false | "new" | id
  const [form,       setForm]       = useState({ ...EMPTY });
  const [confirmDel, setConfirmDel] = useState(null);

  const nextId  = () => Math.max(0, ...tasks.map(t=>t.id)) + 1;
  const upd     = (k,v) => setForm(f=>({...f,[k]:v}));

  const toggle = (id) => setTasks(ts => ts.map(t => t.id===id ? {...t, done:!t.done} : t));
  const del    = (id) => { setTasks(ts => ts.filter(t=>t.id!==id)); setConfirmDel(null); };

  const openNew  = () => { setForm({...EMPTY}); setModal("new"); };
  const openEdit = (t) => { setForm({...t}); setModal(t.id); };

  const save = () => {
    if (!form.text.trim()) { alert("La description est obligatoire."); return; }
    if (modal === "new") {
      setTasks(ts => [...ts, { ...form, id:nextId(), done:false }]);
    } else {
      setTasks(ts => ts.map(t => t.id===modal ? { ...form, id:modal } : t));
    }
    setModal(false);
  };

  // Filtrage + tri
  const prioOrder = { urgent:0, high:1, medium:2, low:3 };
  const today = new Date().toISOString().split("T")[0];

  const shown = tasks
    .filter(t => filterCat==="Toutes"    || t.cat===filterCat)
    .filter(t => filterPrio==="Toutes"   || t.priority===filterPrio)
    .filter(t => filterDone==="Toutes"   || (filterDone==="En cours" ? !t.done : t.done))
    .sort((a,b) => {
      if (tri==="priorite") return (prioOrder[a.priority]||3)-(prioOrder[b.priority]||3);
      if (tri==="echeance") {
        if (!a.echeance && !b.echeance) return 0;
        if (!a.echeance) return 1;
        if (!b.echeance) return -1;
        return a.echeance.localeCompare(b.echeance);
      }
      return b.id - a.id;
    });

  const nbDone    = tasks.filter(t=>t.done).length;
  const nbUrgent  = tasks.filter(t=>!t.done && t.priority==="urgent").length;
  const nbRetard  = tasks.filter(t=>!t.done && t.echeance && t.echeance < today).length;
  const pct       = tasks.length ? Math.round(nbDone/tasks.length*100) : 0;

  const isRetard  = (t) => !t.done && t.echeance && t.echeance < today;
  const isAujourd = (t) => !t.done && t.echeance && t.echeance === today;

  // ── MODALE ─────────────────────────────────────────────────────────────────
  const Modale = () => (
    <div style={{ position:"fixed", inset:0, background:"rgba(19,8,0,0.55)", zIndex:200, display:"flex", alignItems:"flex-end", justifyContent:"center" }}
      onClick={e=>e.target===e.currentTarget&&setModal(false)}>
      <div style={{ background:C.card, borderRadius:"20px 20px 0 0", padding:"22px 18px 36px", width:"100%", maxWidth:520, maxHeight:"90vh", overflowY:"auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <h3 style={{ fontSize:18, fontWeight:700, color:C.text, margin:0, fontFamily:"'Cormorant Garamond',serif" }}>
            {modal==="new" ? "Nouvelle tâche" : "Modifier la tâche"}
          </h3>
          <button onClick={()=>setModal(false)} style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:9, padding:"6px 10px", fontSize:12, cursor:"pointer", color:C.sub }}>✕</button>
        </div>

        {/* Texte */}
        <div style={{ marginBottom:14 }}>
          <label style={{ fontSize:11, fontWeight:700, color:C.sub, display:"block", marginBottom:4, textTransform:"uppercase", letterSpacing:.4 }}>Description *</label>
          <textarea value={form.text} onChange={e=>upd("text",e.target.value)} rows={2} placeholder="Décris la tâche à accomplir…"
            style={{ width:"100%", padding:"10px", border:`1.5px solid ${C.border}`, borderRadius:10, background:C.bg, fontSize:13, color:C.text, outline:"none", fontFamily:"inherit", resize:"vertical", lineHeight:1.5, boxSizing:"border-box" }}/>
        </div>

        {/* Cat + Priorité */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
          <div>
            <label style={{ fontSize:11, fontWeight:700, color:C.sub, display:"block", marginBottom:4, textTransform:"uppercase", letterSpacing:.4 }}>Catégorie</label>
            <select value={form.cat} onChange={e=>upd("cat",e.target.value)}
              style={{ width:"100%", padding:"9px 10px", border:`1.5px solid ${C.border}`, borderRadius:9, background:C.bg, fontSize:13, color:C.text, outline:"none", fontFamily:"inherit" }}>
              {Object.keys(catMeta).map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize:11, fontWeight:700, color:C.sub, display:"block", marginBottom:4, textTransform:"uppercase", letterSpacing:.4 }}>Priorité</label>
            <select value={form.priority} onChange={e=>upd("priority",e.target.value)}
              style={{ width:"100%", padding:"9px 10px", border:`1.5px solid ${C.border}`, borderRadius:9, background:C.bg, fontSize:13, color:C.text, outline:"none", fontFamily:"inherit" }}>
              {Object.entries(prioMeta).map(([v,m])=><option key={v} value={v}>{m.label}</option>)}
            </select>
          </div>
        </div>

        {/* Échéance */}
        <div style={{ marginBottom:14 }}>
          <label style={{ fontSize:11, fontWeight:700, color:C.sub, display:"block", marginBottom:4, textTransform:"uppercase", letterSpacing:.4 }}>Date d'échéance (optionnel)</label>
          <input type="date" value={form.echeance} onChange={e=>upd("echeance",e.target.value)}
            style={{ width:"100%", padding:"9px 10px", border:`1.5px solid ${C.border}`, borderRadius:9, background:C.bg, fontSize:13, color:C.text, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>
        </div>

        {/* Notes */}
        <div style={{ marginBottom:20 }}>
          <label style={{ fontSize:11, fontWeight:700, color:C.sub, display:"block", marginBottom:4, textTransform:"uppercase", letterSpacing:.4 }}>Notes (optionnel)</label>
          <textarea value={form.notes} onChange={e=>upd("notes",e.target.value)} rows={2} placeholder="Détails, liens utiles, contexte…"
            style={{ width:"100%", padding:"10px", border:`1.5px solid ${C.border}`, borderRadius:10, background:C.bg, fontSize:13, color:C.text, outline:"none", fontFamily:"inherit", resize:"vertical", lineHeight:1.5, boxSizing:"border-box" }}/>
        </div>

        {/* Suppression si édition */}
        {modal !== "new" && (
          confirmDel === modal ? (
            <div style={{ background:C.redLight, borderRadius:11, padding:"12px", marginBottom:14, textAlign:"center" }}>
              <p style={{ fontSize:13, color:C.red, fontWeight:700, margin:"0 0 10px" }}>Supprimer cette tâche ?</p>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={()=>setConfirmDel(null)} style={{ flex:1, padding:"9px", background:"white", border:`1.5px solid ${C.border}`, borderRadius:9, fontSize:12, cursor:"pointer", color:C.sub }}>Annuler</button>
                <button onClick={()=>{del(modal);setModal(false);}} style={{ flex:1, padding:"9px", background:C.red, border:"none", borderRadius:9, fontSize:12, fontWeight:700, cursor:"pointer", color:"white" }}>Supprimer</button>
              </div>
            </div>
          ) : (
            <button onClick={()=>setConfirmDel(modal)} style={{ width:"100%", padding:"10px", background:"white", border:`1.5px solid ${C.border}`, borderRadius:10, fontSize:12, color:C.sub, cursor:"pointer", marginBottom:14 }}>🗑 Supprimer cette tâche</button>
          )
        )}

        <div style={{ display:"flex", gap:10 }}>
          <button onClick={()=>setModal(false)} style={{ flex:1, padding:"13px", background:"white", border:`1.5px solid ${C.border}`, borderRadius:12, fontSize:13, cursor:"pointer", color:C.sub, fontWeight:600 }}>Annuler</button>
          <button onClick={save} style={{ flex:2, padding:"13px", background:C.primary, border:"none", borderRadius:12, fontSize:14, fontWeight:800, cursor:"pointer", color:"white" }}>
            {modal==="new" ? "✓ Ajouter" : "✓ Mettre à jour"}
          </button>
        </div>
      </div>
    </div>
  );

  // ── RENDU ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding:"22px 18px 40px" }}>

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:700, color:C.text, margin:"0 0 3px", fontFamily:"'Cormorant Garamond',Georgia,serif" }}>Tâches</h1>
          <p style={{ color:C.sub, fontSize:13, margin:0 }}>
            {tasks.filter(t=>!t.done).length} en cours
            {nbUrgent>0 && <span style={{ color:C.red, fontWeight:700 }}> · {nbUrgent} urgente{nbUrgent>1?"s":""}</span>}
            {nbRetard>0 && <span style={{ color:C.red, fontWeight:700 }}> · {nbRetard} en retard</span>}
          </p>
        </div>
        <button onClick={openNew} style={{ background:C.primary, color:"white", border:"none", borderRadius:12, padding:"10px 16px", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ fontSize:16 }}>+</span> Ajouter
        </button>
      </div>

      {/* Progression */}
      <div style={{ background:C.card, borderRadius:16, border:`1px solid ${C.border}`, padding:"14px 16px", marginBottom:18 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
          <span style={{ fontSize:13, fontWeight:700, color:C.text }}>Progression globale</span>
          <span style={{ fontSize:17, fontWeight:900, color:pct===100?C.green:C.primary, fontFamily:"'Cormorant Garamond',serif" }}>{pct}%</span>
        </div>
        <div style={{ background:C.bg, borderRadius:8, height:8 }}>
          <div style={{ background:pct===100?`linear-gradient(90deg,${C.green},#6bbf6e)`:`linear-gradient(90deg,${C.primary},#7f6a5c)`, borderRadius:8, height:8, width:`${pct}%`, transition:"width 0.4s ease" }}/>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:8 }}>
          <span style={{ fontSize:11, color:C.sub }}>{nbDone} / {tasks.length} terminées</span>
          {nbRetard>0 && <span style={{ fontSize:11, color:C.red, fontWeight:700 }}>⚠ {nbRetard} en retard</span>}
        </div>
      </div>

      {/* Filtres */}
      <div style={{ marginBottom:16 }}>
        {/* Statut */}
        <div style={{ display:"flex", gap:6, marginBottom:8 }}>
          {["En cours","Terminées","Toutes"].map(s=>(
            <button key={s} onClick={()=>setFilterDone(s)} style={{ flex:1, padding:"7px 8px", borderRadius:10, border:`2px solid ${filterDone===s?C.primary:C.border}`, background:filterDone===s?C.primaryLight:C.card, color:filterDone===s?C.primary:C.sub, fontSize:11, fontWeight:700, cursor:"pointer" }}>{s}</button>
          ))}
        </div>
        {/* Catégories */}
        <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:4, marginBottom:8 }}>
          {CATS.map(c=>{
            const m = catMeta[c];
            return (
              <button key={c} onClick={()=>setFilterCat(c)} style={{ flexShrink:0, padding:"6px 12px", borderRadius:20, border:`2px solid ${filterCat===c?(m?.color||C.primary):C.border}`, background:filterCat===c?(m?.bg||C.primaryLight):C.card, color:filterCat===c?(m?.color||C.primary):C.sub, fontSize:11, fontWeight:700, cursor:"pointer" }}>{c}</button>
            );
          })}
        </div>
        {/* Tri */}
        <div style={{ display:"flex", gap:6, alignItems:"center" }}>
          <span style={{ fontSize:11, color:C.sub, fontWeight:600, flexShrink:0 }}>Trier par :</span>
          {[["echeance","Échéance"],["priorite","Priorité"],["creation","Récent"]].map(([v,l])=>(
            <button key={v} onClick={()=>setTri(v)} style={{ padding:"5px 10px", borderRadius:8, border:`1.5px solid ${tri===v?C.primary:C.border}`, background:tri===v?C.primaryLight:"transparent", color:tri===v?C.primary:C.sub, fontSize:11, fontWeight:700, cursor:"pointer" }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Liste tâches */}
      {shown.length===0 ? (
        <div style={{ textAlign:"center", padding:"50px 20px" }}>
          <div style={{ fontSize:44, marginBottom:10 }}>
            {filterDone==="Terminées" ? "🎉" : "📭"}
          </div>
          <p style={{ fontSize:15, fontWeight:700, color:C.text, margin:"0 0 6px" }}>
            {filterDone==="Terminées" ? "Aucune tâche terminée" : "Aucune tâche ici"}
          </p>
          <p style={{ fontSize:13, color:C.sub, margin:"0 0 20px" }}>
            {filterDone==="Terminées" ? "Complète des tâches pour les voir ici" : "C'est le moment d'en ajouter une !"}
          </p>
          {filterDone!=="Terminées" && (
            <button onClick={openNew} style={{ background:C.primary, color:"white", border:"none", borderRadius:12, padding:"11px 22px", fontSize:13, fontWeight:700, cursor:"pointer" }}>+ Ajouter une tâche</button>
          )}
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {shown.map(t => {
            const pm  = prioMeta[t.priority] || prioMeta.low;
            const cm  = catMeta[t.cat]       || { color:C.sub, bg:C.bg };
            const ret = isRetard(t);
            const auj = isAujourd(t);
            return (
              <div key={t.id} style={{ background:C.card, border:`1.5px solid ${ret?C.red:t.done?C.green:C.border}`, borderRadius:14, padding:"13px 14px", display:"flex", gap:11, alignItems:"flex-start" }}
                onMouseEnter={e=>e.currentTarget.style.boxShadow="0 2px 10px rgba(82,50,55,0.09)"}
                onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>

                {/* Checkbox */}
                <div onClick={()=>toggle(t.id)} style={{ width:22, height:22, borderRadius:7, flexShrink:0, cursor:"pointer", marginTop:1, background:t.done?C.green:"transparent", border:`2px solid ${t.done?C.green:C.borderDark}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {t.done && <span style={{ color:"white", fontSize:12, fontWeight:900 }}>✓</span>}
                </div>

                {/* Contenu */}
                <div style={{ flex:1, minWidth:0 }} onClick={()=>openEdit(t)}>
                  <p style={{ fontSize:13, fontWeight:600, color:t.done?C.sub:C.text, margin:"0 0 6px", textDecoration:t.done?"line-through":"none", cursor:"pointer", lineHeight:1.4 }}>{t.text}</p>
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center" }}>
                    <span style={{ fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:8, background:cm.bg, color:cm.color }}>{t.cat}</span>
                    <span style={{ fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:8, background:pm.bg, color:pm.color }}>{pm.label}</span>
                    {t.echeance && (
                      <span style={{ fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:8, background:ret?C.redLight:auj?C.yellowLight:C.bg, color:ret?C.red:auj?C.yellow:C.sub }}>
                        {ret?"⚠ ":auj?"📅 ":""}
                        {new Date(t.echeance).toLocaleDateString("fr-FR",{day:"numeric",month:"short"})}
                      </span>
                    )}
                    {t.notes && <span style={{ fontSize:10, color:C.sub }}>📝</span>}
                  </div>
                </div>

                {/* Bouton éditer */}
                <button onClick={()=>openEdit(t)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:16, color:C.border, padding:"2px 4px", flexShrink:0 }}>›</button>
              </div>
            );
          })}
        </div>
      )}

      {modal && <Modale/>}
    </div>
  );
}

// ── APP SHELL ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("home");

  // ── ÉTAT GLOBAL PARTAGÉ ──────────────────────────────────────────────────
  const PLAN = "freemium"; // "freemium" | "business" | "premium"

  const [profil, setProfil] = useState({
    nom: "Mon Entreprise", email: "entrepreneur@email.fr",
    tel: "", activite: "", siret: "", adresse: "", ville: "",
  });

  const [contacts, setContacts] = useState([
    { id:1, nom:"Dupont", prenom:"Marie", societe:"Boulangerie Dupont", type:"Client", email:"marie@boulangeriedupont.fr", tel:"06 12 34 56 78", adresse:"12 rue de la Paix", ville:"Lyon", cp:"69001", notes:"Commande chaque mois", chiffreAffaires:"1200", tag:"VIP" },
    { id:2, nom:"Martin", prenom:"Jean", societe:"Imprimerie Martin", type:"Fournisseur", email:"contact@imprimeriemartin.fr", tel:"04 78 00 11 22", adresse:"", ville:"Paris", cp:"75000", notes:"Délai 5j ouvrés", chiffreAffaires:"", tag:"" },
    { id:3, nom:"Bernard", prenom:"Sophie", societe:"Café des Arts", type:"Client", email:"sophie@cafedesarts.fr", tel:"06 98 76 54 32", adresse:"", ville:"Bordeaux", cp:"33000", notes:"", chiffreAffaires:"850", tag:"" },
  ]);

  const [factures, setFactures] = useState([
    { id:1, numero:"FA-2026-001", client:"Marie Dupont", clientEmail:"marie@boulangeriedupont.fr", societe:"Boulangerie Dupont",
      date:"2026-01-15", dateEcheance:"2026-02-14", statut:"Payée",
      lignes:[{ desc:"Création site internet", qte:1, pu:1200, tva:20 }, { desc:"Formation utilisation", qte:2, pu:150, tva:20 }],
      notes:"", conditionsPaiement:"30 jours" },
    { id:2, numero:"FA-2026-002", client:"Sophie Bernard", clientEmail:"sophie@cafedesarts.fr", societe:"Café des Arts",
      date:"2026-02-10", dateEcheance:"2026-03-11", statut:"En attente",
      lignes:[{ desc:"Consulting stratégie digitale", qte:3, pu:400, tva:20 }],
      notes:"Merci pour votre confiance.", conditionsPaiement:"30 jours" },
  ]);

  const [tasks, setTasks] = useState([
    { id:1, text:"Finaliser l'étude de marché",   done:false, cat:"Création", priority:"high",   echeance:"2026-03-15", notes:"" },
    { id:2, text:"Choisir mon statut juridique",  done:false, cat:"Légal",    priority:"urgent",  echeance:"2026-03-20", notes:"EURL ou SASU à trancher" },
    { id:3, text:"Ouvrir un compte bancaire pro", done:true,  cat:"Finance",  priority:"medium",  echeance:"2026-02-28", notes:"" },
    { id:4, text:"Commander mes cartes de visite",done:false, cat:"Marketing",priority:"low",     echeance:"", notes:"" },
    { id:5, text:"Rédiger mes CGV",               done:false, cat:"Légal",    priority:"medium",  echeance:"2026-04-01", notes:"Voir modèle sur service-public.fr" },
    { id:6, text:"Configurer ma comptabilité",    done:false, cat:"Admin",    priority:"medium",  echeance:"", notes:"" },
  ]);

  const [notifs, setNotifs] = useState([
    { id:1, text:"Déclaration TVA avant le 15 janvier", type:"warn",    due:"2026-01-15", dismissed:false },
    { id:2, text:"Business plan à 60% — continue !",   type:"info",    due:"",           dismissed:false },
    { id:3, text:"Bienvenue ! Lance ton parcours 🎉",   type:"success", due:"",           dismissed:false },
  ]);

  // Props partagées injectées dans chaque page
  const shared = { PLAN, profil, setProfil, contacts, setContacts, factures, setFactures, tasks, setTasks, notifs, setNotifs, setTab };

  const PAGES = {
    home:     HomePage,
    parcours: ParcoursPage,
    finances: FinancesPage,
    contacts: ContactsPage,
    factures: FacturesPage,
    taches:   TachesPage,
    compte:   ComptePage,
  };

  const Page = PAGES[tab] || HomePage;

  // Badge plan dynamique dans le header
  const planBadge = { freemium: "✦ Freemium", business: "💼 Business", premium: "⭐ Premium" };
  const planBadgeStyle = {
    freemium: { background: "linear-gradient(135deg, #b8924a, #d4a96a)", boxShadow: "0 1px 6px rgba(184,146,74,0.4)" },
    business: { background: "linear-gradient(135deg, #523237, #7a4a50)", boxShadow: "0 1px 6px rgba(82,50,55,0.4)" },
    premium:  { background: "linear-gradient(135deg, #7F5A68, #a07085)", boxShadow: "0 1px 6px rgba(127,90,104,0.4)" },
  };

  // Monogramme depuis profil
  const mono = profil.nom.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase() || "ME";

  return (
    <div style={{ fontFamily: "'Cormorant Garamond', 'Cormorant Garamond', 'Playfair Display', Georgia, serif", background: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@400;500;700;900&display=swap');
        * { box-sizing: border-box; }
        body { font-family: 'DM Sans', sans-serif; }

        /* Texture cuir subtile via CSS */
        .leather-header {
          background:
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(255,255,255,0.015) 2px,
              rgba(255,255,255,0.015) 4px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 3px,
              rgba(0,0,0,0.015) 3px,
              rgba(0,0,0,0.015) 6px
            ),
            linear-gradient(160deg, #523237 0%, #3d2429 50%, #523237 100%);
        }
        .tab-btn { transition: color 0.15s, border-color 0.15s, background 0.15s; }
        .tab-btn:hover { background: rgba(82,50,55,0.06) !important; }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>

      {/* ── HEADER CUIR LUXE ── */}
      <div className="leather-header" style={{ padding: "0 28px", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 16px rgba(19,8,0,0.18)" }}>

        {/* Logo row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Monogramme cuir */}
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: "linear-gradient(135deg, #d4beb2 0%, #b49786 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 1px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
            }}>
              <span style={{ fontSize: 15, fontWeight: 900, color: "#523237", fontFamily: "'Cormorant Garamond', serif" }}>{mono}</span>
            </div>
            <div>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#fffcf8", fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: "0.5px" }}>
                MonEntreprise
              </span>
              <div style={{ fontSize: 9, color: "rgba(212,190,178,0.7)", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", marginTop: -1 }}>
                Carnet Pro
              </div>
            </div>
          </div>
          <button
            onClick={() => setTab("compte")}
            style={{
              ...planBadgeStyle[PLAN],
              color: "#fffcf8", border: "none", borderRadius: 8,
              padding: "6px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer",
              letterSpacing: "0.5px", fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {planBadge[PLAN]}
          </button>
        </div>


      </div>

      {/* ── PAGE CONTENT ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Sidebar navigation */}
        <div style={{ width: 220, background: C.card, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", padding: "20px 0", flexShrink: 0 }}>
          {TABS.map(t => {
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 22px", background: active ? C.primaryLight : "none",
                border: "none", borderLeft: `3px solid ${active ? C.primary : "transparent"}`,
                cursor: "pointer", fontSize: 13, fontWeight: active ? 700 : 400,
                color: active ? C.primary : C.sub, textAlign: "left",
                fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s",
              }}>
                <span style={{ fontSize: 16 }}>{t.icon}</span>
                {t.label}
              </button>
            );
          })}
          {/* Spacer */}
          <div style={{ flex: 1 }} />
          {/* Plan badge bottom */}
          <div style={{ padding: "16px 22px" }}>
            <div style={{ background: C.primaryLight, borderRadius: 10, padding: "10px 14px", textAlign: "center" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.primary, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: 1 }}>
                {planBadge[PLAN]}
              </p>
              <button onClick={() => setTab("compte")} style={{ fontSize: 11, color: C.accent, fontWeight: 700, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                Gérer mon plan →
              </button>
            </div>
          </div>
        </div>
        {/* Main content */}
        <div style={{ flex: 1, overflowY: "auto", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", maxWidth: 900, padding: "0 40px" }}>
          <Page {...shared} />
        </div>
      </div>
    </div>
  );
}
