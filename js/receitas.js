/* ═══════════════════════════════════════════════════════════
   receitas.js
   Responsável por:
     1. Carregar as receitas do arquivo JSON
     2. Renderizar os cards na grade da página
     3. Filtrar receitas em tempo real pelo campo de busca
     4. Abrir/fechar o modal com os detalhes da receita
   ═══════════════════════════════════════════════════════════ */


/* ─── Referências aos elementos do HTML ─── */

// Grade onde os cards de receita são inseridos
const gradeDeReceitas = document.querySelector("#gradeDeReceitas");

// Campo de texto para buscar receitas
const campoDeBusca = document.querySelector("#campoDeBusca");


/* ─── Estado global ─── */

// Array que guarda TODAS as receitas carregadas do JSON.
// Fica salvo aqui para que a busca sempre filtre a lista completa,
// não apenas os cards que estão visíveis no momento.
let todasAsReceitas = [];


/* ════════════════════════════════════════
   CARREGAMENTO
   Busca o arquivo JSON e inicia a renderização
   ════════════════════════════════════════ */
async function carregarReceitas() {
    try {
        // Faz a requisição ao arquivo de dados
        const resposta = await fetch("../data/receitas.json");

        // Se o servidor respondeu com erro (ex: 404), lança exceção
        if (!resposta.ok) throw new Error(`Erro HTTP: ${resposta.status}`);

        // Converte a resposta para array de objetos JavaScript
        todasAsReceitas = await resposta.json();

        // Renderiza todos os cards pela primeira vez
        renderizarCards(todasAsReceitas);

    } catch (erro) {
        // Mostra mensagem amigável caso o JSON não carregue
        gradeDeReceitas.innerHTML = `
            <p style="color:var(--cor-texto-secundario); text-align:center; padding:40px">
                Não foi possível carregar as receitas. Verifique sua conexão.
            </p>`;
        console.error("Erro ao carregar receitas:", erro);
    }
}


/* ════════════════════════════════════════
   RENDERIZAÇÃO DOS CARDS
   Recebe uma lista (pode ser filtrada) e
   desenha um card para cada receita
   ════════════════════════════════════════ */
function renderizarCards(listaDeReceitas) {

    // Limpa os cards anteriores antes de renderizar os novos
    gradeDeReceitas.innerHTML = "";

    // Mensagem quando nenhuma receita corresponde à busca
    if (listaDeReceitas.length === 0) {
        gradeDeReceitas.innerHTML = `
            <p style="color:var(--cor-texto-secundario); text-align:center; padding:40px">
                Nenhuma receita encontrada para essa busca.
            </p>`;
        return;
    }

    // Cria um card para cada receita da lista
    listaDeReceitas.forEach((receita) => {

        // Cria o elemento div que vai ser o card
        const cardReceita = document.createElement("div");
        cardReceita.classList.add("card-receita");

        // Monta o caminho da imagem:
        // Se começar com "http" é uma URL externa, senão adiciona "../" para o caminho local
        const caminhoImagem = receita.img.startsWith("http")
            ? receita.img
            : "../" + receita.img;

        // Texto da etiqueta de categoria (ex: "Clássico", "Vegano"...)
        const etiquetaCategoria = receita.categoria || "Receita";

        // Monta o HTML interno do card
        cardReceita.innerHTML = `
            <img
                class="card-receita__imagem"
                src="${caminhoImagem}"
                alt="Foto de ${receita.titulo}"
                loading="lazy"
            >
            <span class="etiqueta-categoria">${etiquetaCategoria}</span>
            <div class="card-receita__corpo">
                <h3 class="card-receita__titulo">${receita.titulo}</h3>
                <p  class="card-receita__descricao">${receita.descricao}</p>
                <button
                    class="btn-abrir-receita"
                    data-id="${receita.id}"
                    aria-label="Ver receita de ${receita.titulo}"
                >
                    Ver receita
                </button>
            </div>
        `;

        // Adiciona o card na grade
        gradeDeReceitas.appendChild(cardReceita);
    });

    // ─── Delegação de eventos nos botões "Ver receita" ───
    // IMPORTANTE: o listener é adicionado UMA SÓ VEZ aqui fora do forEach,
    // pois a função usa event delegation — ele detecta QUAL botão foi clicado
    // inspecionando e.target. Adicionar dentro do forEach causaria múltiplos
    // listeners acumulados a cada nova renderização (bug de busca duplicada).
    gradeDeReceitas.addEventListener("click", (e) => {

        // Verifica se o clique foi em um botão "Ver receita" (ou filho dele)
        const botaoClicado = e.target.closest(".btn-abrir-receita");

        if (botaoClicado) {
            // Lê o id salvo no atributo data-id do botão
            const idDaReceita = Number(botaoClicado.dataset.id);

            // Encontra a receita correspondente no array completo
            const receitaSelecionada = todasAsReceitas.find(r => r.id === idDaReceita);

            // Abre o modal com os dados dessa receita
            if (receitaSelecionada) abrirModalReceita(receitaSelecionada);
        }
    });
}


/* ════════════════════════════════════════
   MODAL DE DETALHES
   Exibe os ingredientes e o modo de preparo
   de uma receita em uma janela flutuante
   ════════════════════════════════════════ */

/**
 * criarEstruturaModal()
 * Cria o HTML do modal e o insere no <body>.
 * Chamado UMA vez na inicialização da página.
 */
function criarEstruturaModal() {

    const modal = document.createElement("div");
    modal.id = "modalDetalheReceita";

    modal.innerHTML = `
        <!-- Fundo escuro clicável que fecha o modal -->
        <div class="modal-fundo-escuro" id="modalFundoEscuro"></div>

        <!-- Caixa com o conteúdo da receita -->
        <div class="modal-caixa" role="dialog" aria-modal="true" aria-labelledby="modal-titulo-receita">

            <!-- Botão X para fechar -->
            <button class="modal-btn-fechar" id="modal-btn-fechar" aria-label="Fechar modal">✕</button>

            <!-- Lado esquerdo: imagem + etiqueta de categoria -->
            <div class="modal-coluna-imagem">
                <img id="modal-imagem" src="" alt="">
                <span class="etiqueta-categoria" id="modal-etiqueta-categoria"></span>
            </div>

            <!-- Lado direito: textos, ingredientes e preparo -->
            <div class="modal-coluna-conteudo">
                <h2 id="modal-titulo-receita"></h2>
                <p  id="modal-descricao-receita"></p>

                <div class="modal-secoes">
                    <!-- Seção de ingredientes -->
                    <div class="modal-secao">
                        <h4>Ingredientes</h4>
                        <ul id="modal-lista-ingredientes"></ul>
                    </div>

                    <!-- Seção de modo de preparo -->
                    <div class="modal-secao">
                        <h4>Modo de preparo</h4>
                        <ol id="modal-lista-preparo"></ol>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Fecha o modal ao clicar no fundo escuro
    document.getElementById("modalFundoEscuro")
        .addEventListener("click", fecharModalReceita);

    // Fecha o modal ao clicar no botão X
    document.getElementById("modal-btn-fechar")
        .addEventListener("click", fecharModalReceita);

    // Fecha o modal ao pressionar a tecla Escape
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") fecharModalReceita();
    });
}

/**
 * abrirModalReceita(receita)
 * Preenche o modal com os dados da receita recebida
 * e o torna visível na tela.
 */
function abrirModalReceita(receita) {

    const caminhoImagem = receita.img.startsWith("http")
        ? receita.img
        : "../" + receita.img;

    document.getElementById("modal-imagem").src = caminhoImagem;
    document.getElementById("modal-imagem").alt = receita.titulo;
    document.getElementById("modal-etiqueta-categoria").textContent = receita.categoria || "Receita";
    document.getElementById("modal-titulo-receita").textContent     = receita.titulo;
    document.getElementById("modal-descricao-receita").textContent  = receita.descricao;

    // Gera os itens da lista de ingredientes
    const listaIngredientes = document.getElementById("modal-lista-ingredientes");
    listaIngredientes.innerHTML = (receita.ingredientes || [])
        .map(ingrediente => `<li>${ingrediente}</li>`)
        .join("");

    // Gera os passos numerados do preparo
    const listaPreparo = document.getElementById("modal-lista-preparo");
    listaPreparo.innerHTML = (receita.preparo || [])
        .map(passo => `<li>${passo}</li>`)
        .join("");

    // Torna o modal visível (classe controlada pelo CSS)
    document.getElementById("modalDetalheReceita").classList.add("visivel");

    // Trava o scroll da página enquanto o modal está aberto
    document.body.style.overflow = "hidden";
}

/**
 * fecharModalReceita()
 * Esconde o modal e libera o scroll da página.
 */
function fecharModalReceita() {
    document.getElementById("modalDetalheReceita").classList.remove("visivel");
    document.body.style.overflow = "";
}


/* ════════════════════════════════════════
   BUSCA EM TEMPO REAL
   Filtra os cards conforme o usuário digita
   ════════════════════════════════════════ */
campoDeBusca.addEventListener("input", () => {

    // Pega o texto digitado, em minúsculo e sem espaços nas bordas
    const termoBuscado = campoDeBusca.value.toLowerCase().trim();

    // Filtra o array COMPLETO (não só os cards visíveis)
    const receitasFiltradas = todasAsReceitas.filter(receita =>
        receita.titulo.toLowerCase().includes(termoBuscado) ||
        receita.descricao.toLowerCase().includes(termoBuscado) ||
        (receita.categoria || "").toLowerCase().includes(termoBuscado)
    );

    // Renderiza apenas as receitas filtradas
    renderizarCards(receitasFiltradas);
});


/* ════════════════════════════════════════
   INICIALIZAÇÃO
   ════════════════════════════════════════ */

// 1. Cria a estrutura do modal no DOM (feito uma única vez)
criarEstruturaModal();

// 2. Carrega as receitas do JSON e renderiza os cards
carregarReceitas();