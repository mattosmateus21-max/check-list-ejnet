// ==========================================================
// 1. INICIALIZAÇÃO E CONTROLE DE LOGIN (NETLIFY IDENTITY)
// ==========================================================
netlifyIdentity.init();

// Verifica o usuário do Netlify assim que a página carrega
const usuarioAtual = netlifyIdentity.currentUser();
const telaLogin = document.getElementById('tela-login');

if (!usuarioAtual) {
    netlifyIdentity.open(); // Abre a caixinha do Netlify se não estiver logado
    if (telaLogin) telaLogin.style.display = 'block'; // Garante que a tela de fundo bloqueie
} else {
    // Se já estiver logado, esconde a tela de login antiga e joga o e-mail na sessão para o PDF
    if (telaLogin) telaLogin.style.display = 'none';
    configurarNomeTecnico(usuarioAtual.email);
}

// O que acontece quando o funcionário faz o login com sucesso
netlifyIdentity.on('login', (user) => {
    console.log('Funcionário logado:', user.email);
    netlifyIdentity.close(); // Fecha a caixinha cinza do Netlify
    
    if (telaLogin) telaLogin.style.display = 'none'; // Esconde a tela de fundo antiga
    configurarNomeTecnico(user.email); // Salva o e-mail/nome para o PDF
});

// O que acontece se o funcionário deslogar
netlifyIdentity.on('logout', () => {
    sessionStorage.clear();
    window.location.reload(); 
});

// Função auxiliar para tratar o e-mail e salvar na sessão do seu relatório
function configurarNomeTecnico(email) {
    // Pega a parte antes do @ (ex: "joao.silva@gmail.com" vira "joao.silva") e deixa em maiúsculo
    let nomeTratado = email.split('@')[0].replace('.', ' ').toUpperCase();
    sessionStorage.setItem('usuarioLogado', nomeTratado);
}


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
setupChecklist('btnMotoCrosser', 'checklist-motocrosser');
setupChecklist('btnMotoFactor', 'checklist-motofactor');


// ==========================================================
// FUNÇÃO GENÉRICA PARA SALVAMENTO, DATA, HORA, IMPRESSÃO E WHATSAPP
// ==========================================================
function gerenciarSalvamento(idBotaoSalvar, idConfigSecao, chaveArmazenamento) {
    const btnSalvar = document.getElementById(idBotaoSalvar);
    const secaoChecklist = document.getElementById(idConfigSecao);

    if (!btnSalvar || !secaoChecklist) return;

    btnSalvar.addEventListener('click', () => {
        // Recupera o nome mapeado pelo login do Netlify
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
        
        // Fluxo de Impressão
        imprimirChecklist();

        // Configura o WhatsApp
        const numeroWhatsapp = "5587991683831"; 
        const textoMensagem = `Olá! Segue o Checklist (${idConfigSecao}) preenchido por *${tecnico}* em ${dataFormatada} às ${horaFormatada}. Já gerei o PDF pelo sistema.`;
        const linkWhatsapp = `https://wa.me/${numeroWhatsapp}?text=${encodeURIComponent(textoMensagem)}`;

        // Aguarda 10 segundos para dar tempo do sistema fechar a janela de impressão e joga pro WhatsApp
        setTimeout(() => {
            window.location.href = linkWhatsapp;
        }, 10000); 
    });
}

function imprimirChecklist() {
    document.body.classList.add('imprimir-apenas-checklist');
    window.print();
}

window.addEventListener('afterprint', () => {
    document.body.classList.remove('imprimir-apenas-checklist');
});

// Configuração do salvamento independente para cada botão
gerenciarSalvamento('btnSalvarEquipamentos', 'checklist-equipamentos', 'dadosEquipamentos');
gerenciarSalvamento('btnSalvarCrosser', 'checklist-motocrosser', 'dadosCrosser');
gerenciarSalvamento('btnSalvarFactor', 'checklist-motofactor', 'dadosFactor');

function toggleObservacao(radioEl, exibir) {
    if (!radioEl) return;
    var li = radioEl.closest('li');
    if (!li) return;
    var caixa = li.querySelector('.campo-observacao');
    if (!caixa) return;
    caixa.style.display = exibir ? 'block' : 'none';
}