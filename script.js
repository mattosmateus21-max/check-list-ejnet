// ==========================================================
// CONTROLADOR DE LOGIN (Guarda o usuário na sessão)
// ==========================================================
const telaLogin = document.getElementById('tela-login');
const btnEntrar = document.getElementById('btnEntrar');
const inputNome = document.getElementById('nomeUsuario');

// Verifica se o usuário já logou antes para não pedir o nome toda hora
if (sessionStorage.getItem('usuarioLogado')) {
    telaLogin.style.display = 'none';
}

btnEntrar.addEventListener('click', () => {
    const nome = inputNome.value.trim();
    if (nome === "") {
        alert("Por favor, digite seu nome antes de entrar.");
        return;
    }
    // Salva o nome apenas enquanto a aba do navegador estiver aberta
    sessionStorage.setItem('usuarioLogado', nome);
    telaLogin.style.display = 'none'; // Esconde a tela de login
});


// ==========================================================
// FUNÇÃO GENÉRICA PARA ABRIR / FECHAR OS CHECKLISTS
// ==========================================================
function setupChecklist(idBotao, idChecklist) {
    const botao = document.getElementById(idBotao);
    const checklist = document.getElementById(idChecklist);

    if (botao && checklist) {
        botao.addEventListener('click', () => {
            checklist.classList.toggle('ativo');
        });
    }
}
setupChecklist('btnEquipamentos', 'checklist-equipamentos');
setupChecklist('btnMotoCrosser', 'checklist-moto');


// ==========================================================
// FUNÇÃO GENÉRICA PARA SALVAMENTO, DATA, HORA, IMPRESSÃO E WHATSAPP
// ==========================================================
function gerenciarSalvamento(idBotaoSalvar, idConfigSecao, chaveArmazenamento) {
    const btnSalvar = document.getElementById(idBotaoSalvar);
    const secaoChecklist = document.getElementById(idConfigSecao);

    if (!btnSalvar || !secaoChecklist) return;

    btnSalvar.addEventListener('click', () => {
        // Recupera o nome de quem está logado
        const tecnico = sessionStorage.getItem('usuarioLogado') || "Não identificado";

        // 1. Descobre os campos de rádio da seção
        const nomesDosCampos = new Set();
        secaoChecklist.querySelectorAll('input[type="radio"]').forEach(input => {
            nomesDosCampos.add(input.name);
        });

        // 2. Validação dos campos
        let validouTudo = true;
        
        // Captura a Data Atual e o Horário Exato do clique
        const agora = new Date();
        const dataFormatada = agora.toLocaleDateString('pt-BR');
        const horaFormatada = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        const dadosChecklist = {
            tecnico: tecnico,
            data: dataFormatada,
            hora: horaFormatada
        };

        nomesDosCampos.forEach(nomeCampo => {
            const marcado = secaoChecklist.querySelector(`input[name="${nomeCampo}"]:checked`);
            if (!marcado) {
                validouTudo = false;
            } else {
                dadosChecklist[nomeCampo] = marcado.value;
            }
        });

        if (!validouTudo) {
            alert("Por favor, responda todos os itens desta seção antes de salvar!");
            return;
        }

        // 3. Atualiza o HTML da seção com os dados antes de mandar para a impressora
        secaoChecklist.querySelector('.txt-tecnico').innerText = tecnico;
        secaoChecklist.querySelector('.txt-data-hora').innerText = `${dataFormatada} às ${horaFormatada}`;

        // 4. Grava os dados de forma isolada no LocalStorage
        localStorage.setItem(chaveArmazenamento, JSON.stringify(dadosChecklist));

        console.log(`Salvo em [${chaveArmazenamento}]:`, dadosChecklist);
        
        // ==========================================================
        // FLUXO CORRIGIDO: IMPRESSÃO NATIVA + REDIRECIONAMENTO
        // ==========================================================
        
        // 1. Abre a tela de impressão nativa do aparelho (que gera o PDF bonito)
        window.print();

        // 2. Configura o WhatsApp
        const numeroWhatsapp = "5587991683831"; // <-- Substitua pelo seu número com DDD
        const textoMensagem = `Olá! Segue o Checklist (${idConfigSecao}) preenchido por *${tecnico}* em ${dataFormatada} às ${horaFormatada}. Já gerei o PDF pelo sistema.`;
        const linkWhatsapp = `https://wa.me/${numeroWhatsapp}?text=${encodeURIComponent(textoMensagem)}`;

        // 3. Aguarda 1 segundo para dar tempo do sistema fechar a janela de impressão e joga pro WhatsApp
        setTimeout(() => {
            window.location.href = linkWhatsapp;
        }, 10000); // Aumentei para 10 segundos para garantir que o PDF seja gerado e a janela de impressão seja fechada
    });
}
// Configuração do salvamento independente para cada botão
gerenciarSalvamento('btnSalvarEquipamentos', 'checklist-equipamentos', 'dadosEquipamentos');
gerenciarSalvamento('btnSalvarMoto', 'checklist-moto', 'dadosMoto');

function toggleObservacao(exibir) {
  var caixa = document.getElementById("campo-observacao");
  if (exibir) {
    caixa.style.display = "block"; // Mostra a caixa
  } else {
    caixa.style.display = "none";  // Esconde a caixa
  }
}
