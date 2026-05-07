const listaReceitas = document.querySelector("#listaReceitas");
const buscaReceitas = document.querySelector("#buscaReceitas");

let Receitas = [];

async function carregarReceitas() {
    try {
        // receitas.json está em data/ na raiz do projeto
        const resposta = await fetch("../data/receitas.json");
        if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
        Receitas = await resposta.json();
        renderizarReceitas(Receitas);
    } catch (erro) {
        listaReceitas.innerHTML = "<p>Não foi possível carregar as receitas. Tente novamente mais tarde.</p>";
        console.error("Erro ao carregar receitas:", erro);
    }
}

function renderizarReceitas(lista) {
    listaReceitas.innerHTML = "";

    if (lista.length === 0) {
        listaReceitas.innerHTML = "<p>Nenhuma receita encontrada.</p>";
        return;
    }

    lista.forEach((receita) => {
        const card = document.createElement("div");
        card.classList.add("card-receitas");

        // As imagens estão em img/ na raiz — pages/ precisa de ../
        const imgSrc = receita.img.startsWith("http")
            ? receita.img
            : "../" + receita.img;

        card.innerHTML = `
            <h3>${receita.titulo}</h3>
            <img src="${imgSrc}" width="250" height="250" alt="${receita.titulo}" loading="lazy">
            <p>${receita.descricao}</p>
        `;
        listaReceitas.appendChild(card);
    });
}

buscaReceitas.addEventListener("input", function () {
    const texto = buscaReceitas.value.toLowerCase();
    const filtrados = Receitas.filter((receita) =>
        receita.titulo.toLowerCase().includes(texto) ||
        receita.descricao.toLowerCase().includes(texto)
    );
    renderizarReceitas(filtrados);
});

carregarReceitas();