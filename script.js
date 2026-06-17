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
        // FLUXO DE IMPRESSÃO: MOSTRA APENAS A SEÇÃO ATIVA
        // ==========================================================
        imprimirChecklist();

        // 2. Configura o WhatsApp
        const numeroWhatsapp = "5587991683831"; // <-- Substitua pelo seu número com DDD
        const textoMensagem = `Olá! Segue o Checklist (${idConfigSecao}) preenchido por *${tecnico}* em ${dataFormatada} às ${horaFormatada}. Já gerei o PDF pelo sistema.`;
        const linkWhatsapp = `https://wa.me/${numeroWhatsapp}?text=${encodeURIComponent(textoMensagem)}`;

        // 3. Aguarda 10 segundos para dar tempo do sistema fechar a janela de impressão e joga pro WhatsApp
        setTimeout(() => {
            window.location.href = linkWhatsapp;
        }, 10000); // Aumentei para 10 segundos para garantir que o PDF seja gerado e a janela de impressão seja fechada
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
// 1. Inicializa o motor de login do Netlify
netlifyIdentity.init();

// 2. Verifica se o funcionário já está logado. Se não estiver, abre a caixinha
const usuarioAtual = netlifyIdentity.currentUser();
if (!usuarioAtual) {
    netlifyIdentity.open(); 
}

// 3. O que acontece quando o funcionário digita o login correto
netlifyIdentity.on('login', (user) => {
    console.log('Funcionário logado:', user.email);
    netlifyIdentity.close(); // Fecha a caixinha de login e libera o site
});

// 4. O que acontece se o funcionário deslogar
netlifyIdentity.on('logout', () => {
    window.location.reload(); // Recarrega a página para travar a tela de novo
});