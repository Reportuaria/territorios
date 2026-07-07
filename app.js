// CONFIGURAÇÕES INICIAIS
const GOOGLE_CLIENT_ID = "://googleusercontent.com";
const URL_APPS_SCRIPT = "https://google.com";

// 1. REGISTRO DO SERVICE WORKER
window.addEventListener('load', function () {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(() => console.log("Service Worker ativo!"))
      .catch(err => console.error("Erro no Service Worker:", err));
  }
});

// 2. FUNÇÃO INTELIGENTE DE INICIALIZAÇÃO
window.inicializarGoogleLogin = function () {
  let tentativas = 0;

  function verificarEInicializar() {
    if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
      console.log("Biblioteca do Google carregada e pronta!");
      
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: tratarLogin
      });

      google.accounts.id.renderButton(
        document.getElementById("buttonDiv"),
        { theme: "outline", size: "large", text: "signin_with" } 
      );
    } else {
      tentativas++;
      if (tentativas < 10) {
        // Se não achou o objeto 'google', espera 200ms e tenta de novo (máximo 2 segundos)
        setTimeout(verificarEInicializar, 200);
      } else {
        console.error("Erro crítico: A biblioteca do Google não pôde ser carregada. Verifique se o seu AdBlock ou Bloqueador de Rastreamento está ativo.");
        const container = document.getElementById("buttonDiv");
        if (container) {
          container.innerHTML = "<p style='color:red; font-size:14px;'>Desative o AdBlock/Bloqueador do navegador para fazer login.</p>";
        }
      }
    }
  }

  verificarEInicializar();
};

// 3. FUNÇÃO APÓS O LOGIN BEM-SUCEDIDO
function tratarLogin(resposta) {
  const token = resposta.credential;
  document.getElementById("tela-login").style.display = "none";
  document.getElementById("conteudo-app").style.display = "block";
  document.getElementById("btn-sair").style.display = "block";
  buscarDadosPlanilha(token);
}

// 4. BUSCAR OS DADOS NA PLANILHA GOOGLE
function buscarDadosPlanilha(token) {
  const loading = document.getElementById("loading");
  const listaContainer = document.getElementById("lista-territorios");
  
  if (loading) loading.style.display = "block";
  if (listaContainer) listaContainer.innerHTML = "";

  fetch(`${URL_APPS_SCRIPT}?accessToken=${token}`)
    .then(res => {
      if (!res.ok) throw new Error("Erro na resposta do servidor.");
      return res.json();
    })
    .then(dados => {
      if (loading) loading.style.display = "none";
      if (!listaContainer) return;
      
      if (dados.erro) {
        listaContainer.innerHTML = `<p style="color:red; text-align:center; font-weight:bold;">${dados.erro}</p>`;
        return;
      }

      if (!dados || dados.length === 0) {
        listaContainer.innerHTML = "<p style='text-align:center;'>Nenhum território cadastrado.</p>";
        return;
      }

      dados.forEach(item => {
        const card = document.createElement("div");
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

// 5. FUNÇÃO DE LOGOUT
function deslogar() {
  window.location.reload();
}
