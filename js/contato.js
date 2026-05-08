// 1 - Pega a tag do formulário pelo ID no HTML
const form = document.getElementById("formContato");

// 2 - Fica "ouvindo" o momento que o usuário clicar em Enviar
form.addEventListener("submit", async function(event){
    // CAPTURA OS DADOS E CRIA UM OBJETO COM ELES
    // 3 - Impede que a página recarregue 
    //  (comprotamento padrão do form)
    event.preventDefault();

    // 4 - Lê o que o usuário digitou em cada campo
    const nome = document.getElementById("nome").value; //HTMLInputElement -> valor
    const email = document.getElementById("email").value; //HTMLInputElement -> valor
    const mensagem = document.getElementById("mensagem").value; //HTMLTextAreaElement ->valor

    // 5 - Agrupa os dados em um OBJETO 
    // (como uma caixinha organizadora)
    const novaMensagem = {nome,email,mensagem}

    // ENVIANDO OS DADOS PARA O SERVIDOR
    // com tratamento de excessão
    try{
        // 6 - Envia os dados para ao servidor usando fetch
        const resposta = await fetch("http://localhost:3000/contatos",
            {
            method:"POST", // POST = estamos enviando os dados
            headers: {
                "Content-Type": "application/json" 
                    // Avisa que o formato é JSON
            },
            body: JSON.stringify(novaMensagem)
                //converte o objeto para texto JSON
            }
        );

        // 7 - Lê a resposta que o servidor enviou de volta
        const dados = await resposta.text();

        // 8 - Mostra os dados para o usuário
        alert(dados);

        // 9 - Limpa a resposta para o usuário
        form.reset();

    }catch(erro){
        // 10 - Se algo deu errado, avisa o usuário
        //alert(`Erro: ${erro}`);
        console.error(erro);
    }

})