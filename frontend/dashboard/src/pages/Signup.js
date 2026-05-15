import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { FiMail, FiLock, FiBriefcase, FiZap } from "react-icons/fi";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export default function Signup() {
    const [form, setForm] = useState({ email: "", password: "", businessName: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const signup = async () => {
        setLoading(true);
        try {
            const res = await axios.post(`${API}/auth/signup`, form);
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("businessName", res.data.businessName);
            navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.error || "Signup failed");
        }
        setLoading(false);
    };

    return (
        <div style={s.page}>
            <div style={{ ...s.orb, top: "-20%", left: "-10%", background: "radial-gradient(circle, #7F77DD44, transparent 70%)", width: 600, height: 600 }} />
            <div style={{ ...s.orb, bottom: "-20%", right: "-10%", background: "radial-gradient(circle, #a855f744, transparent 70%)", width: 500, height: 500 }} />

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={s.card}
            >
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }} style={s.logo}>
                    <FiZap size={28} color="#7F77DD" />
                </motion.div>

                <h1 style={s.title}>Get started free</h1>
                <p style={s.sub}>Create your AI chatbot in 2 minutes</p>

                {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={s.error}>{error}</motion.div>}

                {[
                    { icon: FiBriefcase, placeholder: "Business Name", key: "businessName" },
                    { icon: FiMail, placeholder: "Email address", key: "email" },
                    { icon: FiLock, placeholder: "Password", key: "password", type: "password" }
                ].map(({ icon: Icon, placeholder, key, type }) => (
                    <div key={key} style={s.inputWrap}>
                        <Icon style={s.inputIcon} />
                        <input
                            style={s.input}
                            placeholder={placeholder}
                            type={type || "text"}
                            value={form[key]}
                            onChange={e => setForm({ ...form, [key]: e.target.value })}
                            onKeyDown={e => e.key === "Enter" && signup()}
                        />
                    </div>
                ))}

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={s.btn} onClick={signup} disabled={loading}>
                    {loading ? "Creating account..." : "Create Free Account"}
                </motion.button>

                <p style={s.link}>
                    Already have account?{" "}
                    <Link to="/login" style={{ color: "#7F77DD", textDecoration: "none", fontWeight: 600 }}>Sign in</Link>
                </p>
            </motion.div>
        </div>
    );
}

const s = {
    page: { minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" },
    orb: { position: "absolute", borderRadius: "50%", pointerEvents: "none" },
    card: { background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: "48px 40px", width: 420, position: "relative", zIndex: 1 },
    logo: { width: 56, height: 56, background: "rgba(127,119,221,0.15)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 },
    title: { fontSize: 28, fontWeight: 800, color: "#fff", marginBottom: 8 },
    sub: { color: "#666", fontSize: 14, marginBottom: 32 },
    error: { background: "rgba(255,59,59,0.1)", border: "1px solid rgba(255,59,59,0.3)", color: "#ff6b6b", padding: "12px 16px", borderRadius: 10, fontSize: 13, marginBottom: 20 },
    inputWrap: { position: "relative", marginBottom: 16 },
    inputIcon: { position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#555", fontSize: 16 },
    input: { width: "100%", padding: "14px 16px 14px 44px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box" },
    btn: { width: "100%", padding: "14px", background: "linear-gradient(135deg, #7F77DD, #a855f7)", border: "none", borderRadius: 12, color: "white", fontSize: 16, fontWeight: 700, cursor: "pointer", marginTop: 8, marginBottom: 24 },
    link: { textAlign: "center", color: "#555", fontSize: 14 }
};