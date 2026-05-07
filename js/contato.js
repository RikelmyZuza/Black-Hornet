// Detecta automaticamente a URL base:
// - Em localhost usa http://localhost:3000
// - Em produção (Render, etc.) usa a mesma origem da página
const API_URL = "http://localhost:3000"

const form  = document.getElementById("formContato");
const botao = form.querySelector("button[type='submit']");

form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const dados = {
        nome:     document.getElementById("nome").value,
        email:    document.getElementById("email").value,
        mensagem: document.getElementById("mensagem").value
    };

    // Desabilita o botão e mostra "Enviando..." enquanto aguarda
    botao.disabled    = true;
    botao.textContent = "Enviando...";

    // Esconde mensagens anteriores
    document.getElementById("msg-sucesso").style.display = "none";
    document.getElementById("msg-erro").style.display    = "none";

    try {
        const resposta = await fetch(`${API_URL}/contatos`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify(dados)
        });

        if (resposta.ok) {
            document.getElementById("msg-sucesso").style.display = "block";
            form.reset();
        } else {
            throw new Error("Resposta não ok");
        }

    } catch (erro) {
        document.getElementById("msg-erro").style.display = "block";
        console.error("Erro ao conectar com o servidor:", erro);

    } finally {
        // Sempre restaura o botão, independente do resultado
        botao.disabled    = false;
        botao.textContent = "Enviar";
    }
});