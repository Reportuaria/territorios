// CONFIGURAÇÕES INICIAIS (Substitua com os seus dados)
const GOOGLE_CLIENT_ID = "1032457585178-v9geqen8g0utp7fapc5pk5put5qlvp8k.apps.googleusercontent.com";
const URL_APPS_SCRIPT = "https://script.google.com/macros/s/AKfycbxBJ65YpMRkxUrs4DFcn7Ek_9o0FPEXJnjRz4fM9tbpz7ndTIrBeFiHYDRmjjSROwLf/exec";

// 1. INICIALIZAR O GOOGLE SIGN-IN ASSIM QUE O APP CARREGA
window.onload = function () {
  // Registra o Service Worker para o PWA funcionar offline
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(() => console.log("Service Worker ativo!"))
      .catch(err => console.log("Erro no Service Worker:", err));
  }

  // Inicializa a biblioteca do Google
  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: tratarLogin // Função que roda quando você faz login com sucesso
  });

  // Renderiza o botão oficial do Google dentro daquela div do HTML
  google.accounts.id.renderButton(
    document.getElementById("buttonDiv"),
    { theme: "outline", size: "large", text: "signin_with" } 
  );
};

// 2. FUNÇÃO APÓS O LOGIN BEM-SUCEDIDO
function tratarLogin(resposta) {
  // O Google devolve um Token de Acesso temporário por segurança
  const token = resposta.credential;
  
  // Esconde a tela de login e mostra a tela do aplicativo
  document.getElementById("tela-login").style.display = "none";
  document.getElementById("conteudo-app").style.display = "block";
  document.getElementById("btn-sair").style.display = "block";
  
  // Chama a função para buscar os dados da sua planilha passando o token
  buscarDadosPlanilha(token);
}

// 3. BUSCAR OS DADOS NA PLANILHA GOOGLE
function buscarDadosPlanilha(token) {
  const loading = document.getElementById("loading");
  const listaContainer = document.getElementById("lista-territorios");
  
  loading.style.display = "block";
  listaContainer.innerHTML = "";

  // Faz a requisição enviando o token para o seu Apps Script validar
  fetch(`${URL_APPS_SCRIPT}?accessToken=${token}`)
    .then(res => res.json())
    .then(dados => {
      loading.style.display = "none";
      
      // Se o e-mail não for o cadastrado, o Apps Script devolve um erro
      if (dados.erro) {
        listaContainer.innerHTML = `<p style="color:red; text-align:center;">${dados.erro}</p>`;
        return;
      }

      // Se deu tudo certo, monta os cartões na tela
      if (dados.length === 0) {
        listaContainer.innerHTML = "<p>Nenhum território cadastrado.</p>";
        return;
      }

      dados.forEach(item => {
        const card = document.createElement("div");
        
        // Define a classe de cor baseada no Status (Coluna E da sua planilha)
        let classeStatus = "";
        if (item["Status"] === "Em Andamento") classeStatus = "em-andamento";
        if (item["Status"] === "Concluído") classeStatus = "concluido";

        card.className = `card ${classeStatus}`;
        card.innerHTML = `
          <h3>Território ${item["Território"] || "S/N"} - Quadra ${item["Quadra"] || "S/N"}</h3>
          <p><strong>Rua:</strong> ${item["Rua"] || "Não informada"}</p>
          <p><strong>Status:</strong> ${item["Status"] || "Não Iniciado"}</p>
          <p style="font-size:12px; color:#999;">Início: ${item["Data Início"] || "-"} | Fim: ${item["Data Fim"] || "-"}</p>
        `;
        listaContainer.innerHTML += card.outerHTML;
      });
    })
    .catch(erro => {
      loading.style.display = "none";
      listaContainer.innerHTML = "<p style='color:red;'>Erro ao conectar com o servidor.</p>";
      console.error(erro);
    });
}

// 4. FUNÇÃO DE LOGOUT (SAIR)
function deslogar() {
  // Recarrega a página para limpar os dados da memória e exigir novo login
  window.location.reload();
}
