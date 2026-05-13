/* ═══════════════════════════════════════════════════════════
   contato.js
   Responsável por:
     1. Capturar os dados do formulário de contato
     2. Enviar os dados para o servidor via fetch (POST)
     3. Exibir notificações visuais de sucesso ou erro
        (sem usar alert() do navegador, que é feio)
   ═══════════════════════════════════════════════════════════ */


/* ─── Referências aos elementos do HTML ─── */

// O formulário de contato
const formularioContato = document.getElementById("formularioContato");

// Parágrafos de feedback que ficam escondidos até serem necessários
const avisoSucesso = document.getElementById("aviso-sucesso");
const avisoErro    = document.getElementById("aviso-erro");


/* ════════════════════════════════════════
   FUNÇÃO: exibirNotificacao
   Mostra uma mensagem de sucesso ou erro
   abaixo do formulário por alguns segundos,
   sem usar o alert() nativo do navegador.

   Parâmetros:
     tipo     → "sucesso" ou "erro"
     mensagem → texto a exibir (opcional, usa padrão se omitido)
   ════════════════════════════════════════ */
function exibirNotificacao(tipo, mensagem) {

    if (tipo === "sucesso") {
        // Define o texto (usa padrão se não vier mensagem)
        avisoSucesso.textContent = mensagem || "✓ Mensagem enviada! Retornaremos em breve.";

        // Torna o parágrafo visível
        avisoSucesso.style.display = "block";

        // Esconde automaticamente após 5 segundos
        setTimeout(() => { avisoSucesso.style.display = "none"; }, 5000);

    } else {
        avisoErro.textContent = mensagem || "✗ Não foi possível enviar. Tente novamente.";
        avisoErro.style.display = "block";
        setTimeout(() => { avisoErro.style.display = "none"; }, 5000);
    }
}


/* ════════════════════════════════════════
   EVENTO: submit do formulário
   Dispara quando o usuário clica em "Enviar mensagem"
   ════════════════════════════════════════ */
formularioContato.addEventListener("submit", async function(evento) {

    // Impede o comportamento padrão do navegador,
    // que seria recarregar a página ao submeter o form
    evento.preventDefault();

    // ─── Lê os valores digitados nos campos ───
    const nome     = document.getElementById("campo-nome").value;
    const email    = document.getElementById("campo-email").value;
    const mensagem = document.getElementById("campo-mensagem").value;

    // Agrupa os dados em um objeto para enviar como JSON
    const dadosDoContato = { nome, email, mensagem };

    // ─── Envia os dados para o servidor ───
    try {
        const resposta = await fetch("http://localhost:3000/contatos", {
            method: "POST",              // POST = estamos ENVIANDO dados
            headers: {
                "Content-Type": "application/json"  // avisa o servidor que é JSON
            },
            body: JSON.stringify(dadosDoContato)    // converte o objeto para texto JSON
        });

        if (resposta.ok) {
            // Servidor respondeu com sucesso (status 200-299)
            exibirNotificacao("sucesso");

            // Limpa todos os campos do formulário
            formularioContato.reset();

        } else {
            // Servidor respondeu, mas com erro (ex: status 500)
            exibirNotificacao("erro");
        }

    } catch (erro) {
        // Erro de rede: servidor offline, sem internet, etc.
        exibirNotificacao("erro");
        console.error("Erro ao enviar mensagem:", erro);
    }
});