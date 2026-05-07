const path    = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const pool    = require("./db.js");
const express = require("express");
const cors    = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..")));

// Valida formato de e-mail
function emailValido(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// POST /contatos — salva mensagem no banco
app.post("/contatos", async (req, res) => {
    try {
        const { nome, email, mensagem } = req.body;

        if (!nome || !email || !mensagem) {
            return res.status(400).json({ mensagem: "Preencha todos os campos." });
        }

        if (!emailValido(email)) {
            return res.status(400).json({ mensagem: "Formato de e-mail inválido." });
        }

        await pool.execute(
            "INSERT INTO contatos (nome, email, mensagem) VALUES (?, ?, ?)",
            [nome, email, mensagem]
        );

        return res.status(201).json({ mensagem: "Mensagem enviada com sucesso!" });

    } catch (error) {
        console.error("Erro no POST /contatos:", error);
        return res.status(500).json({ mensagem: "Erro interno no servidor." });
    }
});

// GET /contatos — lista todas as mensagens recebidas
app.get("/contatos", async (req, res) => {
    try {
        const [rows] = await pool.execute(
            "SELECT id, nome, email, mensagem, criado_em FROM contatos ORDER BY criado_em DESC"
        );
        return res.status(200).json(rows);

    } catch (error) {
        console.error("Erro no GET /contatos:", error);
        return res.status(500).json({ mensagem: "Erro interno no servidor." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});