// CONFIGURAÇÕES INICIAIS
const GOOGLE_CLIENT_ID = "1032457585178-v9geqen8g0utp7fapc5pk5put5qlvp8k.apps.googleusercontent.com";
const URL_APPS_SCRIPT = "https://script.google.com/macros/s/AKfycbxBJ65YpMRkxUrs4DFcn7Ek_9o0FPEXJnjRz4fM9tbpz7ndTIrBeFiHYDRmjjSROwLf/exec";

// 1. REGISTRO DO SERVICE WORKER (Executa de forma limpa ao carregar a página do PWA)
window.addEventListener('load', function () {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(() => console.log("Service Worker ativo!"))
      .catch(err => console.error("Erro no Service Worker:", err));
  }
});

// 2. FUNÇÃO QUE O GOOGLE CHAMA AUTOMATICAMENTE ASSIM QUE A BIBLIOTECA CARREGAR
window.inicializarGoogleLogin = function () {
  console.log("Biblioteca do Google carregada com sucesso!");
  
  if (typeof google !== 'undefined') {
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: tratarLogin // Função que roda após o login bem-sucedido
    });

    // Renderiza o botão oficial do Google dentro da div correspondente no HTML
    google.accounts.id.renderButton(
      document.getElementById("buttonDiv"),
      { theme: "outline", size: "large", text: "signin_with" } 
    );
  } else {
    console.error("Erro: Objeto 'google' não foi encontrado mesmo após o carregamento.");
  }
};

// 3. FUNÇÃO APÓS O LOGIN BEM-SUCEDIDO
function tratarLogin(resposta) {
  // Captura o ID Token (JWT) enviado pelo Google
  const token = resposta.credential;
  
  // Esconde a tela de login e exibe a interface do aplicativo
  document.getElementById("tela-login").style.display = "none";
  document.getElementById("conteudo-app").style.display = "block";
  document.getElementById("btn-sair").style.display = "block";
  
  // Busca os dados cadastrados na planilha passando o token de identificação
  buscarDadosPlanilha(token);
}

// 4. BUSCAR OS DADOS NA PLANILHA GOOGLE
function buscarDadosPlanilha(token) {
  const loading = document.getElementById("loading");
  const listaContainer = document.getElementById("lista-territorios");
  
  if (loading) loading.style.display = "block";
  if (listaContainer) listaContainer.innerHTML = "";

  // Faz a requisição enviando o token para validação no Apps Script
  fetch(`${URL_APPS_SCRIPT}?accessToken=${token}`)
    .then(res => {
      if (!res.ok) throw new Error("Erro na resposta do servidor.");
      return res.json();
    })
    .then(dados => {
      if (loading) loading.style.display = "none";
      if (!listaContainer) return;
      
      // Se o e-mail não for autorizado, o Apps Script devolve um erro formatado
      if (dados.erro) {
        listaContainer.innerHTML = `<p style="color:red; text-align:center; font-weight:bold;">${dados.erro}</p>`;
        return;
      }

      // Valida se existem territórios a serem listados
      if (!dados || dados.length === 0) {
        listaContainer.innerHTML = "<p style='text-align:center;'>Nenhum território cadastrado.</p>";
        return;
      }

      // Cria dinamicamente os elementos na tela
      dados.forEach(item => {
        const card = document.createElement("div");
        
        // Define a classe CSS de cor baseada na coluna Status da sua Planilha
        let classeStatus = "";
        const status = item["Status"] ? item["Status"].trim() : "";
        if (status === "Em Andamento") classeStatus = "em-andamento";
        if (status === "Concluído") classeStatus = "concluido";

        card.className = `card ${classeStatus}`;
        card.innerHTML = `
          <h3>Território ${item["Território"] || "S/N"} - Quadra ${item["Quadra"] || "S/N"}</h3>
          <p><strong>Rua:</strong> ${item["Rua"] || "Não informada"}</p>
          <p><strong>Status:</strong> ${item["Status"] || "Não Iniciado"}</p>
          <p style="font-size:12px; color:#999; margin-top:8px;">
            Início: ${item["Data Início"] || "-"} | Fim: ${item["Data Fim"] || "-"}
          </p>
        `;
        listaContainer.appendChild(card);
      });
    })
    .catch(erro => {
      if (loading) loading.style.display = "none";
      if (listaContainer) {
        listaContainer.innerHTML = "<p style='color:red; text-align:center;'>Erro ao conectar com a planilha externa.</p>";
      }
      console.error("Erro na requisição:", erro);
    });
}

// 5. FUNÇÃO DE LOGOUT (SAIR)
function deslogar() {
  // Limpa a sessão atual recarregando a página do aplicativo
  window.location.reload();
}
