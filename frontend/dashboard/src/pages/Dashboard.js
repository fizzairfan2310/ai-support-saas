import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
    FiZap, FiMessageSquare, FiSettings, FiBarChart2,
    FiLogOut, FiCopy, FiCheck, FiUsers, FiTrendingUp,
    FiMail, FiSave, FiCode
} from "react-icons/fi";

const API = "http://localhost:5000/api";

export default function Dashboard() {
    const [chatbot, setChatbot] = useState(null);
    const [activeTab, setActiveTab] = useState("overview");
    const [saved, setSaved] = useState(false);
    const [copied, setCopied] = useState(false);
    const [embedCode, setEmbedCode] = useState("");
    const [analytics, setAnalytics] = useState({
        chartData: [], leads: [], totalChats: 0, thisWeek: 0, leadsCount: 0
    });

    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const businessName = localStorage.getItem("businessName");

    useEffect(() => {
        fetchChatbot();
        fetchEmbed();
        fetchAnalytics();
    }, []);

    const fetchChatbot = async () => {
        const res = await axios.get(`${API}/chatbot`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setChatbot(res.data);
    };

    const fetchEmbed = async () => {
        const res = await axios.get(`${API}/chatbot/embed`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setEmbedCode(res.data.embedCode);
    };

    const fetchAnalytics = async () => {
        const res = await axios.get(`${API}/chatbot/analytics`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setAnalytics(res.data);
    };

    const save = async () => {
        await axios.put(`${API}/chatbot`, chatbot, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const copyEmbed = () => {
        navigator.clipboard.writeText(embedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const logout = () => { localStorage.clear(); navigate("/login"); };

    if (!chatbot) return (
        <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                <FiZap size={32} color="#7F77DD" />
            </motion.div>
        </div>
    );

    const tabs = [
        { id: "overview", icon: FiBarChart2, label: "Overview" },
        { id: "customize", icon: FiSettings, label: "Customize" },
        { id: "embed", icon: FiCode, label: "Embed" },
        { id: "leads", icon: FiUsers, label: "Leads" },
    ];

    return (
        <div style={s.layout}>
            <motion.div initial={{ x: -80, opacity: 0 }} animate={{ x: 0, opacity: 1 }} style={s.sidebar}>
                <div style={s.sidebarLogo}>
                    <FiZap size={22} color="#7F77DD" />
                    <span style={{ fontWeight: 800, fontSize: 18 }}>AI Support</span>
                </div>

                <div style={s.bizBadge}>
                    <div style={s.bizAvatar}>{businessName?.[0]?.toUpperCase()}</div>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{businessName}</div>
                        <div style={{ fontSize: 11, color: "#4CAF50" }}>● Active</div>
                    </div>
                </div>

                <nav style={{ flex: 1 }}>
                    {tabs.map(({ id, icon: Icon, label }) => (
                        <motion.div
                            key={id}
                            whileHover={{ x: 4 }}
                            onClick={() => setActiveTab(id)}
                            style={{
                                ...s.navItem,
                                background: activeTab === id ? "rgba(127,119,221,0.15)" : "transparent",
                                color: activeTab === id ? "#7F77DD" : "#666",
                                borderLeft: activeTab === id ? "3px solid #7F77DD" : "3px solid transparent"
                            }}
                        >
                            <Icon size={18} />
                            <span>{label}</span>
                        </motion.div>
                    ))}
                </nav>

                <motion.button whileHover={{ scale: 1.02 }} onClick={logout} style={s.logoutBtn}>
                    <FiLogOut size={16} />
                    <span>Logout</span>
                </motion.button>
            </motion.div>

            <div style={s.main}>
                <AnimatePresence mode="wait">

                    {activeTab === "overview" && (
                        <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            <h1 style={s.pageTitle}>Overview</h1>
                            <p style={s.pageSub}>Your chatbot performance at a glance</p>

                            <div style={s.statsGrid}>
                                {[
                                    { icon: FiMessageSquare, label: "Total Chats", value: analytics.totalChats, color: "#7F77DD" },
                                    { icon: FiTrendingUp, label: "This Week", value: analytics.thisWeek, color: "#a855f7" },
                                    { icon: FiUsers, label: "Leads Captured", value: analytics.leadsCount, color: "#06b6d4" },
                                    { icon: FiMail, label: "Avg Response", value: "1.2s", color: "#10b981" },
                                ].map(({ icon: Icon, label, value, color }) => (
                                    <motion.div key={label} whileHover={{ y: -4, scale: 1.02 }} style={s.statCard}>
                                        <div style={{ ...s.statIcon, background: color + "22" }}>
                                            <Icon size={20} color={color} />
                                        </div>
                                        <div style={s.statValue}>{value}</div>
                                        <div style={s.statLabel}>{label}</div>
                                    </motion.div>
                                ))}
                            </div>

                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={s.chartCard}>
                                <h3 style={s.cardTitle}>Chat Activity — Last 7 Days</h3>
                                <ResponsiveContainer width="100%" height={200}>
                                    <LineChart data={analytics.chartData}>
                                        <XAxis dataKey="day" stroke="#444" tick={{ fill: "#666", fontSize: 12 }} />
                                        <YAxis stroke="#444" tick={{ fill: "#666", fontSize: 12 }} />
                                        <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: 8, color: "#fff" }} />
                                        <Line type="monotone" dataKey="chats" stroke="#7F77DD" strokeWidth={2} dot={{ fill: "#7F77DD", r: 4 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </motion.div>
                        </motion.div>
                    )}

                    {activeTab === "customize" && (
                        <motion.div key="customize" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            <h1 style={s.pageTitle}>Customize Chatbot</h1>
                            <p style={s.pageSub}>Make your chatbot match your brand</p>

                            <div style={s.twoCol}>
                                <div style={s.card}>
                                    {[
                                        { label: "Chatbot Name", key: "name" },
                                        { label: "Welcome Message", key: "welcomeMessage" },
                                    ].map(({ label, key }) => (
                                        <div key={key} style={{ marginBottom: 20 }}>
                                            <label style={s.label}>{label}</label>
                                            <input style={s.input} value={chatbot[key] || ""} onChange={e => setChatbot({ ...chatbot, [key]: e.target.value })} />
                                        </div>
                                    ))}

                                    {[
                                        { label: "Personality", key: "personality" },
                                        { label: "System Prompt (optional)", key: "systemPrompt", placeholder: "e.g. Only answer about our products..." },
                                    ].map(({ label, key, placeholder }) => (
                                        <div key={key} style={{ marginBottom: 20 }}>
                                            <label style={s.label}>{label}</label>
                                            <textarea style={s.textarea} value={chatbot[key] || ""} onChange={e => setChatbot({ ...chatbot, [key]: e.target.value })} placeholder={placeholder} />
                                        </div>
                                    ))}

                                    <div style={{ marginBottom: 24 }}>
                                        <label style={s.label}>Chat Button Color</label>
                                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                            <input type="color" value={chatbot.color} onChange={e => setChatbot({ ...chatbot, color: e.target.value })} style={{ width: 48, height: 48, borderRadius: 10, border: "none", cursor: "pointer" }} />
                                            <span style={{ color: "#666", fontSize: 14 }}>{chatbot.color}</span>
                                        </div>
                                    </div>

                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={save}
                                        style={{ ...s.btn, background: saved ? "linear-gradient(135deg, #10b981, #059669)" : "linear-gradient(135deg, #7F77DD, #a855f7)" }}>
                                        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                                            {saved ? <><FiCheck /> Saved!</> : <><FiSave /> Save Changes</>}
                                        </span>
                                    </motion.button>
                                </div>

                                <div style={s.previewCard}>
                                    <h3 style={s.cardTitle}>Live Preview</h3>
                                    <div style={{ ...s.previewWidget, borderColor: chatbot.color }}>
                                        <div style={{ ...s.previewHeader, background: chatbot.color }}>
                                            <span style={{ width: 8, height: 8, background: "#4CAF50", borderRadius: "50%", display: "inline-block" }} />
                                            <span style={{ marginLeft: 8, fontWeight: 600 }}>{chatbot.name}</span>
                                        </div>
                                        <div style={s.previewBody}>
                                            <div style={s.previewMsg}>{chatbot.welcomeMessage}</div>
                                        </div>
                                        <div style={s.previewInput}>
                                            <span style={{ color: "#aaa", fontSize: 13 }}>Type a message...</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "embed" && (
                        <motion.div key="embed" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            <h1 style={s.pageTitle}>Embed Your Chatbot</h1>
                            <p style={s.pageSub}>Add your chatbot to any website in seconds</p>

                            <div style={s.card}>
                                <h3 style={s.cardTitle}>Your Embed Code</h3>
                                <p style={{ color: "#666", fontSize: 14, marginBottom: 16 }}>Paste before closing &lt;/body&gt; tag</p>
                                <div style={s.codeBlock}>
                                    <code style={{ color: "#a855f7", fontSize: 13, fontFamily: "monospace" }}>{embedCode}</code>
                                </div>
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={copyEmbed}
                                    style={{ ...s.btn, background: copied ? "linear-gradient(135deg, #10b981, #059669)" : "linear-gradient(135deg, #7F77DD, #a855f7)", maxWidth: 200 }}>
                                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                                        {copied ? <><FiCheck /> Copied!</> : <><FiCopy /> Copy Code</>}
                                    </span>
                                </motion.button>

                                <div style={{ marginTop: 32 }}>
                                    <h3 style={s.cardTitle}>How to install</h3>
                                    {["Copy the embed code above", "Open your website HTML file", "Paste before closing </body> tag", "Save and refresh — chatbot appears!"].map((step, i) => (
                                        <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                                            style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                                            <div style={s.stepNum}>{i + 1}</div>
                                            <span style={{ color: "#ccc", fontSize: 14 }}>{step}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "leads" && (
                        <motion.div key="leads" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            <h1 style={s.pageTitle}>Leads</h1>
                            <p style={s.pageSub}>Customers who contacted you through chatbot</p>

                            <div style={s.card}>
                                {analytics.leads.length === 0 ? (
                                    <div style={{ textAlign: "center", padding: "60px 0" }}>
                                        <FiUsers size={48} color="#333" style={{ marginBottom: 16 }} />
                                        <p style={{ color: "#555", fontSize: 15 }}>No leads yet</p>
                                        <p style={{ color: "#444", fontSize: 13, marginTop: 8 }}>Leads appear when customers share their contact info</p>
                                    </div>
                                ) : (
                                    analytics.leads.map((lead, i) => (
                                        <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                                            style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                            <div style={{ width: 40, height: 40, background: "linear-gradient(135deg, #7F77DD, #a855f7)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#fff", fontSize: 16 }}>
                                                {lead.leadName?.[0]?.toUpperCase() || "?"}
                                            </div>
                                            <div>
                                                <div style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>{lead.leadName || "Unknown"}</div>
                                                <div style={{ color: "#666", fontSize: 13 }}>{lead.leadEmail}</div>
                                            </div>
                                            <div style={{ marginLeft: "auto", color: "#444", fontSize: 12 }}>
                                                {new Date(lead.createdAt).toLocaleDateString()}
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}

const s = {
    layout: { display: "flex", minHeight: "100vh", background: "#0a0a0f" },
    sidebar: { width: 240, background: "#0f0f1a", borderRight: "1px solid rgba(255,255,255,0.05)", padding: "24px 16px", display: "flex", flexDirection: "column", gap: 8 },
    sidebarLogo: { display: "flex", alignItems: "center", gap: 10, padding: "0 8px", marginBottom: 32, color: "#fff" },
    bizBadge: { display: "flex", alignItems: "center", gap: 10, padding: "12px", background: "rgba(255,255,255,0.03)", borderRadius: 12, marginBottom: 24 },
    bizAvatar: { width: 36, height: 36, background: "linear-gradient(135deg, #7F77DD, #a855f7)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, color: "#fff" },
    navItem: { display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 500, marginBottom: 4, transition: "all 0.2s" },
    logoutBtn: { display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", background: "rgba(255,59,59,0.08)", border: "1px solid rgba(255,59,59,0.15)", borderRadius: 10, color: "#ff6b6b", cursor: "pointer", fontSize: 14, fontWeight: 500 },
    main: { flex: 1, padding: "48px 40px", overflowY: "auto" },
    pageTitle: { fontSize: 32, fontWeight: 800, color: "#fff", marginBottom: 8 },
    pageSub: { color: "#555", fontSize: 15, marginBottom: 32 },
    statsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 },
    statCard: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 20, cursor: "pointer" },
    statIcon: { width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 },
    statValue: { fontSize: 28, fontWeight: 800, color: "#fff", marginBottom: 4 },
    statLabel: { fontSize: 13, color: "#555" },
    chartCard: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 24 },
    cardTitle: { fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 20 },
    twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 },
    card: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 24 },
    label: { display: "block", fontSize: 13, color: "#666", marginBottom: 8, fontWeight: 500 },
    input: { width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" },
    textarea: { width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box", minHeight: 80, resize: "vertical" },
    btn: { width: "100%", padding: "14px", border: "none", borderRadius: 12, color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer" },
    previewCard: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 24 },
    previewWidget: { border: "2px solid", borderRadius: 16, overflow: "hidden", marginTop: 16 },
    previewHeader: { padding: "12px 16px", color: "white", fontSize: 14 },
    previewBody: { padding: 16, background: "#f9f9f9", minHeight: 120 },
    previewMsg: { background: "white", padding: "10px 14px", borderRadius: 12, fontSize: 13, color: "#333", display: "inline-block", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
    previewInput: { padding: "12px 16px", borderTop: "1px solid #eee", background: "white" },
    codeBlock: { background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)", borderRadius: 12, padding: 20, marginBottom: 16, wordBreak: "break-all" },
    stepNum: { width: 28, height: 28, background: "linear-gradient(135deg, #7F77DD, #a855f7)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "white", flexShrink: 0 },
};