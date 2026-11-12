// ======================================================================================
// GeminiNPC_Chat.js (PT-BR + Proxy Cloudflare) - NW.js stable (No true streaming)
// ======================================================================================
/*:
 * @target MZ
 * @plugindesc Chat com IA (Gemini via Proxy) para NPCs com pré-conversa, descrições de ritmo e decisão estruturada. PT-BR. Sem streaming real.
 * @version 2.9.0
 *
 * @help
 * Fluxo:
 * 1) Opcionalmente exibe uma pré-conversa (antes do menu Falar/Sair)
 * 2) Dispara a IA imediatamente
 * 3) Exibe a descrição de ritmo do NPC (velocidade própria)
 * 4) Em seguida exibe a resposta da IA (velocidade própria)
 *
 * Pré-conversa:
 * - preChatFirst: aparece só na 1ª interação com ESTE evento (map+event)
 * - preChatAltA / preChatAltB: alternam nas próximas interações
 *
 * Descrições de ritmo:
 * - introFirst: aparece só na 1ª fala com ESTE evento (map+event)
 * - introAltA / introAltB: alternam nas próximas interações
 *
 *
 * @param --- Proxy (recomendado) ---
 * @default
 *
 * @param ProxyUrl
 * @parent --- Proxy (recomendado) ---
 * @text Proxy URL (Cloudflare Worker)
 * @type string
 * @default
 *
 * @param ProxyToken
 * @parent --- Proxy (recomendado) ---
 * @text Proxy Token (CLIENT_TOKEN)
 * @type string
 * @default
 *
 * @param --- API Configuration ---
 * @default
 *
 * @param GoogleAI_Model
 * @parent --- API Configuration ---
 * @text Modelo padrão
 * @type string
 * @default gemini-2.5-flash
 *
 * @param --- Variáveis do Jogo ---
 * @default
 *
 * @param PlayerMessageVarId
 * @parent --- Variáveis do Jogo ---
 * @text Variável: mensagem do jogador
 * @type variable
 * @default 1
 *
 * @param AIResponseVarId
 * @parent --- Variáveis do Jogo ---
 * @text Variável: resposta da IA
 * @type variable
 * @default 2
 *
 * @param HistoryVarId
 * @parent --- Variáveis do Jogo ---
 * @text Variável: histórico (array)
 * @type variable
 * @default 3
 *
 * @param --- Geral ---
 * @default
 *
 * @param PlayerCharacterName
 * @parent --- Geral ---
 * @text Nome do personagem do jogador
 * @type string
 * @default Herói
 *
 * @param BannedChars
 * @parent --- Geral ---
 * @text Remover caracteres (regex set)
 * @type string
 * @default ""
 *
 * @param FontFileName
 * @parent --- Geral ---
 * @text Fonte custom (opcional)
 * @type string
 * @default
 *
 * @param ChatWindowHeight
 * @parent --- Geral ---
 * @text Altura da janela do chat
 * @type string
 * @default 35%
 *
 * @command startChat
 * @text Iniciar Chat com NPC
 * @desc Inicia uma sessão de chat contínua com IA.
 *
 * @arg ---- Descrição Inicial antes da conversa ----
 * @default
 *
 * @arg preChatFirst
 * @parent ---- Descrição Inicial antes da conversa ----
 * @text Pré-conversa (1ª vez)
 * @type multiline_string
 * @default
 *
 * @arg preChatAltA
 * @parent ---- Descrição Inicial antes da conversa ----
 * @text Pré-conversa (alternativa A)
 * @type multiline_string
 * @default
 *
 * @arg preChatAltB
 * @parent ---- Descrição Inicial antes da conversa ----
 * @text Pré-conversa (alternativa B)
 * @type multiline_string
 * @default
 *
 * @arg ---- Descrições de Ritmo (opcional) ----
 * @default
 *
 * @arg introFirst
 * @parent ---- Descrições de Ritmo (opcional) ----
 * @text Descrição (1ª interação - longa)
 * @type multiline_string
 * @default
 *
 * @arg introAltA
 * @parent ---- Descrições de Ritmo (opcional) ----
 * @text Descrição (alternativa A - curta)
 * @type multiline_string
 * @default
 *
 * @arg introAltB
 * @parent ---- Descrições de Ritmo (opcional) ----
 * @text Descrição (alternativa B - curta)
 * @type multiline_string
 * @default
 *
 * @arg ---- Persona do NPC ----
 * @default
 *
 * @arg roleInstruction
 * @parent ---- Persona do NPC ----
 * @text Instruções de Persona
 * @type multiline_string
 *
 * @arg examplePrompt
 * @parent ---- Persona do NPC ----
 * @text Exemplo (Prompt)
 * @type multiline_string
 *
 * @arg exampleResponse
 * @parent ---- Persona do NPC ----
 * @text Exemplo (Resposta)
 * @type multiline_string
 *
 * @arg modelOverride
 * @parent ---- Persona do NPC ----
 * @text Modelo (override opcional)
 * @type string
 * @default
 *
 * @arg ---- Opções de Escolha ----
 * @default
 *
 * @arg sayChoiceText
 * @parent ---- Opções de Escolha ----
 * @text Texto da opção "Falar"
 * @type string
 * @default Falar
 *
 * @arg leaveChoiceText
 * @parent ---- Opções de Escolha ----
 * @text Texto da opção "Sair"
 * @type string
 * @default Sair
 *
 * @arg ---- Comportamento ----
 * @default
 *
 * @arg historySize
 * @parent ---- Comportamento ----
 * @text Tamanho do histórico (turnos)
 * @type Number
 * @default 10
 *
 * @arg ---- Exibição ----
 * @default
 *
 * @arg characterName
 * @parent ---- Exibição ----
 * @text Nome do NPC (na tela)
 * @type string
 *
 * @arg ---- Memória Social (opcional) ----
 * @default
 *
 * @arg npcSocialId
 * @parent ---- Memória Social (opcional) ----
 * @text ID social do NPC
 * @type string
 * @default
 *
 * @arg sharesInfoWith
 * @parent ---- Memória Social (opcional) ----
 * @text Compartilha info com
 * @desc IDs sociais separados por vírgula. Ex: vendedor_feira,cozinheira_castelo
 * @type string
 * @default
 *
 * @arg useDecisionTags
 * @parent ---- Memória Social (opcional) ----
 * @text Usa decisão estruturada?
 * @type boolean
 * @on Sim
 * @off Não
 * @default true
 *
 *  * @arg ---- Loja (opcional) ----
 * @default
 *
 * @arg shopEnabled
 * @parent ---- Loja (opcional) ----
 * @text Ativar loja por chat?
 * @type boolean
 * @on Sim
 * @off Não
 * @default false
 *
 * @arg shopGoods
 * @parent ---- Loja (opcional) ----
 * @text Catálogo (CSV)
 * @desc Formato: I:id:preco,W:id:preco,A:id:preco. Ex: I:1:50,I:2:20,W:3:120
 * @type string
 * @default
 *
 * @arg shopSellAny
 * @parent ---- Loja (opcional) ----
 * @text Permitir vender qualquer item?
 * @type boolean
 * @on Sim
 * @off Não
 * @default true
 * 
 * @arg ---- Variáveis Avançadas ----
 * @default
 *
 * @arg CustomResponseVarId
 * @parent ---- Variáveis Avançadas ----
 * @text Variável: resposta custom
 * @type variable
 *
 * @arg CustomHistoryVarId
 * @parent ---- Variáveis Avançadas ----
 * @text Variável: histórico custom
 * @type variable
 *
 * @arg DecisionVarId
 * @parent ---- Variáveis Avançadas ----
 * @text Variável: decisão da IA
 * @type variable
 * @default 0
 *
 * @arg PermitSwitchId
 * @parent ---- Variáveis Avançadas ----
 * @text Switch: ligar ao permitir
 * @type switch
 * @default 0
 *
 * @arg ---- Posição da janela de escolhas (opcional) ----
 * @default
 *
 * @arg choiceWindowX
 * @parent ---- Posição da janela de escolhas (opcional) ----
 * @text X (fórmula)
 * @type string
 * @default
 *
 * @arg choiceWindowY
 * @parent ---- Posição da janela de escolhas (opcional) ----
 * @text Y (fórmula)
 * @type string
 * @default
 *
 * @arg choiceWindowZ
 * @parent ---- Posição da janela de escolhas (opcional) ----
 * @text Z (número)
 * @type string
 * @default
 */

(() => {
  'use strict';

  const NOME_PLUGIN = 'GeminiNPC_Chat';
  const p = PluginManager.parameters(NOME_PLUGIN);

  const PROXY_URL = String(p['ProxyUrl'] || '').trim();
  const PROXY_TOKEN = String(p['ProxyToken'] || '').trim();
  const MODELO_PADRAO = String(p['GoogleAI_Model'] || 'gemini-2.5-flash').trim();

  const VAR_MSG_JOGADOR = Number(p['PlayerMessageVarId']) || 1;
  const VAR_RESPOSTA_IA = Number(p['AIResponseVarId']) || 2;
  const VAR_HISTORICO = Number(p['HistoryVarId']) || 3;

  const NOME_JOGADOR = (p['PlayerCharacterName'] || 'Herói').trim();
  const REMOVER_CHARS = String(p['BannedChars'] || '');
  const ARQUIVO_FONTE = String(p['FontFileName'] || '').trim();
  const ALTURA_JANELA = String(p['ChatWindowHeight'] || '35%');

  const DICA_PULAR = `<span style="opacity:0.65;font-size:14px;">(Espaço: pular)</span>`;

  const DECISAO_ENUM = {
    NENHUMA: 0,
    PERMITIR: 1,
    NEGAR: 2,
    ESCLARECER: 3
  };

  let estaGerando = false;
  let ultimoRequestEmMs = 0;

  const INTERVALO_MIN_MS = 1500;
  const RETRY = { tentativas: 2, baseMs: 2000 };

  const DESC_MS = 30;
  const DESC_CHUNK = 2;

  const RESP_MS = 30;
  const RESP_CHUNK = 2;

  const TYPEWRITER_MAX_CHARS = 2600;

  let _typewriterTimer = null;
  let _typewriterSkip = false;

  function pararTypewriter() {
    if (_typewriterTimer) {
      clearInterval(_typewriterTimer);
      _typewriterTimer = null;
    }
    _typewriterSkip = false;
  }

  function habilitarSkip() {
    const handler = (e) => {
      const k = e.keyCode || e.which;
      if (k === 32) _typewriterSkip = true;
    };
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }

  let elLog = null;
  let eventoAtual = null;
  let argsChat = null;
  let posEscolhaCustom = null;

  function getSocialMemory() {
    if (!$gameSystem._geminiNpcSocialMemory) {
      $gameSystem._geminiNpcSocialMemory = {
        reports: {},
        knowledge: {},
        lastPropagationMapId: 0
      };
    }
    return $gameSystem._geminiNpcSocialMemory;
  }

  function parseIdList(csv) {
    return String(csv || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
  }

  function getUseDecisionTags(args) {
    return String(args?.useDecisionTags ?? 'true').toLowerCase() !== 'false';
  }

  function getNpcSocialId(args) {
    return String(args?.npcSocialId || '').trim();
  }

  function getKnowledgeForNpc(npcId) {
    const mem = getSocialMemory();
    if (!mem.knowledge[npcId]) {
      mem.knowledge[npcId] = [];
    }
    return mem.knowledge[npcId];
  }

  function registrarInformacaoSocialDoNpc(npcId, sharesInfoWithCsv, socialSummary, socialStance) {
    if (!npcId || !socialSummary) {
      console.log('[SOCIAL] Não registrou informação social.', {
        npcId,
        socialSummary,
        socialStance
      });
      return;
    }

    const mem = getSocialMemory();
    const targets = parseIdList(sharesInfoWithCsv);

    mem.reports[npcId] = {
      sourceNpcId: npcId,
      summary: socialSummary,
      stance: socialStance || 'neutro',
      targets,
      deliveredTo: mem.reports[npcId]?.deliveredTo || [],
      createdAt: Date.now()
    };

    console.log('[SOCIAL] Relatório salvo pelo NPC:', {
      npcId,
      summary: socialSummary,
      stance: socialStance || 'neutro',
      targets,
      report: mem.reports[npcId]
    });
  }

  function propagarInformacoesSociais() {
    const mem = getSocialMemory();
    const reports = mem.reports || {};

    console.log('[SOCIAL] Iniciando propagação social...', {
      reports
    });

    Object.values(reports).forEach((report) => {
      if (!report || !Array.isArray(report.targets)) return;

      report.targets.forEach((targetId) => {
        if (!targetId) return;

        if (report.deliveredTo.includes(targetId)) {
          console.log('[SOCIAL] Já entregue antes, pulando:', {
            from: report.sourceNpcId,
            to: targetId
          });
          return;
        }

        const conhecimento = getKnowledgeForNpc(targetId);
        const exists = conhecimento.some(k =>
          k.sourceNpcId === report.sourceNpcId && k.summary === report.summary
        );

        if (!exists) {
          conhecimento.push({
            sourceNpcId: report.sourceNpcId,
            summary: report.summary,
            stance: report.stance || 'neutro',
            heardAt: Date.now()
          });

          console.log('[SOCIAL] Informação propagada:', {
            from: report.sourceNpcId,
            to: targetId,
            summary: report.summary,
            stance: report.stance || 'neutro'
          });
        } else {
          console.log('[SOCIAL] Informação já existia no alvo:', {
            from: report.sourceNpcId,
            to: targetId,
            summary: report.summary
          });
        }

        report.deliveredTo.push(targetId);
      });
    });

    console.log('[SOCIAL] Estado final da memória:', mem);
  }

  function montarContextoSocialNpcAtual(args) {
    const npcId = getNpcSocialId(args);

    console.log('[SOCIAL] Montando contexto social para NPC:', {
      npcId,
      args
    });

    if (!npcId) {
      console.log('[SOCIAL] NPC sem npcSocialId.');
      return '';
    }

    const conhecimento = getKnowledgeForNpc(npcId);

    console.log('[SOCIAL] Conhecimento encontrado para NPC:', {
      npcId,
      conhecimento
    });

    if (!conhecimento.length) return '';

    let txt = '\n--- Conhecimento social deste NPC ---\n';
    txt += 'As informações abaixo são rumores ou comentários que este NPC ouviu de outros personagens.\n';
    txt += 'Ele não presenciou esses fatos diretamente, a menos que a própria cena atual indique isso.\n';

    conhecimento.slice(-5).forEach((item) => {
      txt += `- Ouviu de ${item.sourceNpcId}: ${item.summary} (tom: ${item.stance || 'neutro'})\n`;
    });

    console.log('[SOCIAL] Contexto final injetado no prompt:', txt);

    return txt;
  }

  if (ARQUIVO_FONTE) {
    const nomeFonte = 'GeminiChatCustomFont';
    FontManager.load(nomeFonte, ARQUIVO_FONTE);
    const style = document.createElement('style');
    style.textContent = `
      #geminiChatWindow, #geminiInputDialog, #geminiInputDialog input, #geminiInputDialog button {
        font-family: "${nomeFonte}", "GameFont", sans-serif;
      }
    `;
    document.head.appendChild(style);
  }

  PluginManager.registerCommand(NOME_PLUGIN, 'startChat', async function (args) {
    this.setWaitMode('geminiChat');
    argsChat = args;

    posEscolhaCustom = {
      x: args.choiceWindowX,
      y: args.choiceWindowY,
      z: args.choiceWindowZ
    };

    const decisionVarId = Number(args.DecisionVarId || 0);
    if (decisionVarId > 0) {
      $gameVariables.setValue(decisionVarId, DECISAO_ENUM.NENHUMA);
    }

    criarJanelaChat();
    renderizarHistoricoNoChat(argsChat);
    travarMovimentoJogador();
    iniciarChatComDescricaoInicial();
  });

  async function iniciarChatComDescricaoInicial() {
    if (!argsChat) return;

    const npcKey = `MAP${$gameMap.mapId()}_EV${$gameMap._interpreter.eventId()}`;
    const preDesc = escolherDescricaoPreChat(npcKey, argsChat);

    if (preDesc && preDesc.trim()) {
      const idPre = 'gemini-prechat-' + Date.now();
      await exibirTextoComTypewriter(idPre, preDesc.trim(), true, DESC_MS, DESC_CHUNK);
    }

    loopChat();
  }

  async function loopChat() {
    if (!argsChat) return;
    esconderBotaoContinuar();

    const escolha = await mostrarHubEscolhas();
    if (escolha === 1 || escolha === -1) {
      limparTudo();
      $gameMap._interpreter.setWaitMode('');
      return;
    }

    const entrada = await mostrarDialogoInput('Digite o que você quer falar:');
    if (entrada === null) {
      loopChat();
      return;
    }

    if (contemPalavraProibida(entrada)) {
    adicionarLog('sistema', mensagemBloqueioDiegetica());
    mostrarBotaoContinuar();
    return; 
    }

    $gameVariables.setValue(VAR_MSG_JOGADOR, entrada);
    adicionarLog('jogador', `<b>${escapeHtml(NOME_JOGADOR)}:</b> ${escapeHtml(entrada)}`);

    await gerarRespostaIA(entrada, 'falar');
  }

  function renderizarHistoricoNoChat(args) {
  const varHist = Number(args.CustomHistoryVarId) || VAR_HISTORICO;
  const historico = $gameVariables.value(varHist) || [];
  if (!Array.isArray(historico) || historico.length === 0) return;

  // quantas mensagens mostrar no UI (20 = 10 turnos user+npc)
  const maxMsgs = Math.min(historico.length, 20);
  const slice = historico.slice(-maxMsgs);

  const npcNome = processarCtl(args.characterName) || 'NPC';

  for (const msg of slice) {
    if (!msg || typeof msg.content !== 'string') continue;

    if (msg.role === 'user') {
      adicionarLog('jogador', `<b>${escapeHtml(NOME_JOGADOR)}:</b> ${escapeHtml(msg.content)}`);
    } else {
      // msg.role === 'model'
      adicionarLog('sistema',
        `<b style="color:#87CEEB;">${escapeHtml(npcNome)}</b><br>${escapeHtmlPreservandoQuebras(msg.content)}`
      );
    }
  }
}

  function mostrarHubEscolhas() {
    return new Promise(resolve => {
      if ($gameMessage.isBusy()) {
        setTimeout(() => resolve(mostrarHubEscolhas()), 100);
        return;
      }
      const opcoes = [
        argsChat.sayChoiceText || 'Falar',
        argsChat.leaveChoiceText || 'Sair'
      ];
      $gameMessage.setChoices(opcoes, 0, 0);
      $gameMessage.setChoiceCallback(i => resolve(i));
    });
  }

  function diegeticErrorMessage() {
    const options = [
      `*O NPC pigarreia, como se tivesse perdido a linha de raciocínio.*`,
      `*O NPC hesita por um instante, buscando as palavras.*`,
      `*O NPC franze a testa, como se algo tivesse interrompido o pensamento.*`,
      `*O NPC abre a boca para falar, mas para no meio do caminho.*`
    ];
    return options[Math.floor(Math.random() * options.length)];
  }

  function showRetryHub() {
    return new Promise(resolve => {
      if ($gameMessage.isBusy()) { setTimeout(() => resolve(showRetryHub()), 100); return; }
      const choices = ["Tentar novamente", "Sair"];
      // 0 = default, 1 = cancel
      $gameMessage.setChoices(choices, 0, 1);
      $gameMessage.setChoiceCallback(i => resolve(i));
    });
  }

  function mostrarDialogoInput(labelTexto) {
    return new Promise((resolve) => {
      removerElemento('geminiInputDialog');

      const form = document.createElement('form');
      form.id = 'geminiInputDialog';
      form.autocomplete = 'off';

      Object.assign(form.style, {
        position: 'fixed',
        zIndex: '110',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: '520px',
        maxWidth: '90%',
        backgroundColor: 'rgba(0,0,0,0.85)',
        border: '1px solid rgba(255,255,255,0.35)',
        borderRadius: '10px',
        padding: '14px',
        boxSizing: 'border-box'
      });

      const label = document.createElement('div');
      label.innerText = labelTexto;
      Object.assign(label.style, { color: 'white', fontSize: '18px', marginBottom: '10px' });

      const input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 150;
      Object.assign(input.style, {
        width: '100%',
        padding: '10px',
        fontSize: '18px',
        color: 'white',
        backgroundColor: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '6px',
        boxSizing: 'border-box'
      });

      const botoes = document.createElement('div');
      Object.assign(botoes.style, { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' });

      const btnOk = document.createElement('button');
      btnOk.type = 'submit';
      btnOk.innerText = 'Enviar';
      estiloBotao(btnOk);

      const btnCancelar = document.createElement('button');
      btnCancelar.type = 'button';
      btnCancelar.innerText = 'Cancelar';
      estiloBotao(btnCancelar, true);

      const cleanup = () => {
        form.remove();
        document.removeEventListener('keydown', keydownHandler, true);
      };

      const submitHandler = (e) => {
        e.preventDefault();
        cleanup();
        resolve(input.value);
      };

      const cancelHandler = () => {
        cleanup();
        resolve(null);
      };

      const keydownHandler = (e) => { if (form) e.stopImmediatePropagation(); };

      document.addEventListener('keydown', keydownHandler, true);
      form.addEventListener('submit', submitHandler);
      btnCancelar.addEventListener('click', cancelHandler);

      botoes.appendChild(btnOk);
      botoes.appendChild(btnCancelar);

      form.appendChild(label);
      form.appendChild(input);
      form.appendChild(botoes);

      document.body.appendChild(form);
      input.focus();
    });
  }

  function estiloBotao(btn, cancelar = false) {
    Object.assign(btn.style, {
      padding: '8px 18px',
      fontSize: '16px',
      color: 'white',
      background: cancelar ? 'rgba(200,80,80,0.8)' : 'rgba(100, 150, 255, 0.8)',
      border: '1px solid rgba(255,255,255,0.25)',
      borderRadius: '6px',
      cursor: 'pointer'
    });
  }

  function getAuthSession() {
    // AuthLogin.js deve preencher: $gameSystem._auth = { userId, username, token }
    const a = $gameSystem?._auth;
    if (!a || !a.token) return null;
    return a;
  }

  function getApiBaseFromProxyUrl(proxyUrl) {
    // PROXY_URL pode ser "https://xxx.workers.dev" ou "https://xxx.workers.dev/gemini"
    try {
      return new URL(String(proxyUrl || '').trim()).origin;
    } catch {
      return String(proxyUrl || '').trim().replace(/\/+$/, '');
    }
  }

  async function logInteractionToDb(payload) {
    const sess = getAuthSession();
    if (!sess) return; // sem login, não loga

    const base = getApiBaseFromProxyUrl(PROXY_URL);
    if (!base) return;

    // Fire-and-forget com timeout curto pra nunca travar o jogo
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    try {
      await fetch(`${base}/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sess.token}`
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
    } catch (e) {
      // não quebra o jogo — só loga no console
      console.warn('[DBLOG] Falha ao salvar interação:', e?.message || e);
    } finally {
      clearTimeout(timeout);
    }
  }

  function getAuthSession() {
    const a = $gameSystem?._auth;
    if (!a || !a.token) return null;
    return a;
  }

  function getApiBaseFromProxyUrl(proxyUrl) {
    try { return new URL(String(proxyUrl || '').trim()).origin; }
    catch { return String(proxyUrl || '').trim().replace(/\/+$/, ''); }
  }

  async function fetchDbHistory(npcKey, limit = 6) {
    const sess = getAuthSession();
    if (!sess) return [];

    const base = getApiBaseFromProxyUrl(PROXY_URL);
    if (!base) return [];

    try {
      const res = await fetch(`${base}/history`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sess.token}`
        },
        body: JSON.stringify({ npcKey, limit, runId: ensureRunId() })
      });

      if (!res.ok) return [];
      const data = await res.json().catch(() => null);
      return Array.isArray(data?.items) ? data.items : [];
    } catch {
      return [];
    }
  }

  function formatDbHistoryAsContext(items) {
    if (!items || !items.length) return "";
    let txt = "\n--- Memória persistente (conversas anteriores deste usuário com este NPC) ---\n";
    txt += "Use isso apenas como lembrança; não repita literalmente.\n";
    for (const it of items) {
      if (it.playerText) txt += `${NOME_JOGADOR}: ${String(it.playerText).trim()}\n`;
      if (it.aiText) txt += `NPC: ${String(it.aiText).trim()}\n`;
    }
    return txt;
  }

  async function gerarRespostaIA(textoJogador, tipoInteracao) {

    if (contemPalavraProibida(textoJogador)) {
    const idResposta = 'gemini-resp-' + Date.now();
    atualizarLog(idResposta, 'ia', mensagemBloqueioDiegetica());
    estaGerando = false;
    mostrarBotaoContinuar();
    return;
  }
  
    if (!argsChat) return;
    if (estaGerando) return;
    estaGerando = true;

    const idDesc = 'gemini-desc-' + Date.now();
    const idResposta = 'gemini-resp-' + Date.now();

    // pega a descrição uma vez só (evita consumir alternância de novo em retry)
    const npcKey = `MAP${$gameMap.mapId()}_EV${$gameMap._interpreter.eventId()}`;
    const desc = escolherDescricaoRitmo(npcKey, argsChat);

    try {
      if (!PROXY_URL || !PROXY_TOKEN) {
        throw new Error('Configuração inválida: ProxyUrl/ProxyToken não configurados no Plugin Manager.');
      }

      await aguardarIntervaloMinimo();

      // mostra a descrição 1x (primeira tentativa)
      if (desc && desc.trim()) {
        await exibirTextoComTypewriter(idDesc, desc.trim(), true, DESC_MS, DESC_CHUNK);
      }

      // LOOP de retry manual (do jogador)
      while (true) {
        try {
          const npcKey = `MAP${$gameMap.mapId()}_EV${$gameMap._interpreter.eventId()}`;
          const historyItems = await fetchDbHistory(npcKey, 6);
          const dbContext = formatDbHistoryAsContext(historyItems);

          const requestBody = montarRequest(argsChat, textoJogador, tipoInteracao, dbContext);
          const modelo = escolherModelo();

          const promiseIA = comRetry429(() => chamarProxy(modelo, requestBody), RETRY)
            .then(res => lerRespostaCompleta(res))
            .then(txt => removerCaracteres(txt, REMOVER_CHARS).trim());

          const textoIA = await promiseIA;
          const lojaAtiva = shopIsEnabled(argsChat);
          const shopParsed = lojaAtiva ? extractShopAction(textoIA) : { cmd: { action: 'NONE' }, cleanText: textoIA };
          const shopCmd = shopParsed.cmd;
          const textoBase = shopParsed.cleanText || textoIA;

          console.log('[SOCIAL] Resposta bruta da IA:', textoIA);

          if (!textoIA || !textoIA.trim()) {
            atualizarLog(idResposta, 'ia', '<i>(A IA retornou uma resposta vazia.)</i>');
            return;
          }

          const useDecisionTags = getUseDecisionTags(argsChat);
          const metaSocial = extrairMetaSocial(textoBase);

          console.log('[SOCIAL] Meta social extraída:', metaSocial);

          let textoProcessado = metaSocial.textoLimpo || textoIA.trim();

          let resultadoIA = { decisao: '', textoLimpo: textoProcessado };
          if (useDecisionTags) {
            resultadoIA = extrairDecisaoIA(textoProcessado);
            textoProcessado = resultadoIA.textoLimpo || textoProcessado;
          }

          let textoExibicao = textoProcessado;
          if (textoPareceCortado(textoExibicao)) {
            textoExibicao += '...';
          }

          const npcSocialId = getNpcSocialId(argsChat);
          if (npcSocialId && metaSocial.summary) {
            registrarInformacaoSocialDoNpc(
              npcSocialId,
              argsChat.sharesInfoWith,
              metaSocial.summary,
              metaSocial.stance
            );
          }

          if (useDecisionTags) {
            aplicarResultadoDecisao(resultadoIA.decisao, argsChat);
          }

          let shopResult = null;
          if (lojaAtiva) {
            shopResult = runShopAction(argsChat, shopCmd);
            if (shopResult?.message) {
              textoExibicao += `\n*${shopResult.message}*`;
            }
          }

          await exibirTextoComTypewriter(idResposta, textoExibicao, true, RESP_MS, RESP_CHUNK);
          salvarVariaveis(argsChat, textoJogador, textoExibicao);

          // ---- LOG no banco (por usuário logado) ----
          try {
            const sess = getAuthSession();
            if (sess) {
              const npcKeyLog = `MAP${$gameMap.mapId()}_EV${$gameMap._interpreter.eventId()}`;

              // decision: usa resultadoIA se estiver ativo
              const decision = (useDecisionTags ? (resultadoIA?.decisao || '') : '');

              // meta social: summary/stance já extraídos
              const meta = {
                decision,
                socialSummary: metaSocial?.summary || '',
                stance: metaSocial?.stance || '',
                npcSocialId: getNpcSocialId(argsChat) || '',
                sharesInfoWith: String(argsChat?.sharesInfoWith || ''),
                model: escolherModelo(),
                  shop: {
                  action: shopCmd?.action || 'NONE',
                  type: shopCmd?.type || '',
                  id: shopCmd?.id || 0,
                  qty: shopCmd?.qty || 0,
                  ok: !!shopResult?.ok
                }
              };

              // manda pro worker (não trava o jogo)
              logInteractionToDb({
                runId: ensureRunId(),
                npcKey: npcKeyLog,
                mapId: $gameMap.mapId(),
                eventId: $gameMap._interpreter.eventId(),
                playerText: textoJogador,
                aiText: textoExibicao,
                meta
              });
            }
          } catch (e) {
            console.warn('[DBLOG] Erro inesperado ao preparar log:', e?.message || e);
          }

          if (useDecisionTags && resultadoIA.decisao === 'PERMITIR') {
            await esperarConfirmacaoParaFechar();
            encerrarChatPorDecisao();
            return;
          }

          // sucesso: sai do loop
          break;

        } catch (err) {
          console.error('[GeminiNPC] Erro:', err);

          // Mensagem diegética + pergunta
          const diegetic =
            `${diegeticErrorMessage()}\n` +
            `"Quer que eu tente de novo?"`;

          await exibirTextoComTypewriter(idResposta, diegetic, true, RESP_MS, RESP_CHUNK);

          const choice = await showRetryHub();
          if (choice === 0) {
            // Tentar novamente: uma frase curtinha e repete
            await exibirTextoComTypewriter(
              idResposta,
              `*Ele respira fundo e tenta novamente...*`,
              true,
              DESC_MS,
              DESC_CHUNK
            );
            continue;
          } else {
            // Sair
            break;
          }
        }
      }

    } finally {
      estaGerando = false;
      if (argsChat) {
        mostrarBotaoContinuar();
      }
    }
  }

  function escolherModelo() {
    const override = (argsChat?.modelOverride && String(argsChat.modelOverride).trim())
      ? String(argsChat.modelOverride).trim()
      : '';
    return override || MODELO_PADRAO || 'gemini-2.5-flash';
  }

  async function chamarProxy(modelo, requestBody) {
    const res = await fetch(PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PROXY_TOKEN}`
      },
      body: JSON.stringify({
        model: modelo,
        requestBody
      })
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      const e = new Error(`API Error (${res.status}): ${text}`);
      e.status = res.status;
      e.bodyText = text;
      e.modelName = modelo;
      throw e;
    }
    return res;
  }

  async function aguardarIntervaloMinimo() {
    const agora = Date.now();
    const delta = agora - ultimoRequestEmMs;
    if (delta < INTERVALO_MIN_MS) await sleep(INTERVALO_MIN_MS - delta);
    ultimoRequestEmMs = Date.now();
  }

  async function comRetry429(fn, { tentativas, baseMs }) {
    for (let i = 0; i <= tentativas; i++) {
      try {
        return await fn();
      } catch (err) {
        const status = err?.status || extrairStatus(err);
        const body = String(err?.bodyText || '');

        const is429 = status === 429;
        const is503 = status === 503;
        const is5xxTemp = [500, 502, 504].includes(status); // 503 já tratado acima

        const retryable = is429 || is503 || is5xxTemp;

        if (!retryable) throw err;

        // mantém sua regra: se for quota diária/limite duro, não adianta retry
        if (is429) {
          const quotaExceeded = isQuotaExceeded(body);
          if (quotaExceeded) {
            console.warn('[GeminiNPC] 429 por cota/limite. Retry cancelado.');
            throw err;
          }
        }

        if (i === tentativas) throw err;

        const espera = Math.round(baseMs * (2 ** i) * (0.7 + Math.random() * 0.6));

        if (is503) {
          console.warn(`[GeminiNPC] 503 (modelo sobrecarregado). Tentativa ${i + 1}/${tentativas} em ${espera}ms`);
        } else if (is5xxTemp) {
          console.warn(`[GeminiNPC] ${status} (falha temporária). Tentativa ${i + 1}/${tentativas} em ${espera}ms`);
        } else {
          console.warn(`[GeminiNPC] 429 (rate limit temporário). Tentativa ${i + 1}/${tentativas} em ${espera}ms`);
        }

        await sleep(espera);
      }
    }
  }

  function extrairStatus(err) {
    const msg = String(err?.message || '');
    const m = msg.match(/API Error\s*\((\d+)\)/i);
    return m ? Number(m[1]) : undefined;
  }

  function isQuotaExceeded(bodyText) {
    const body = String(bodyText || '').toLowerCase();
    return (
      body.includes('resource_exhausted') ||
      body.includes('generaterequestsperday') ||
      body.includes('quota') ||
      body.includes('exceeded your current quota') ||
      body.includes('free_tier_requests') ||
      body.includes('generaterequestsperdayperprojectpermodelfreetier')
    );
  }

  function getPreChatState() {
    if (!$gameSystem._geminiNpcPreChatState) $gameSystem._geminiNpcPreChatState = {};
    return $gameSystem._geminiNpcPreChatState;
  }

  function escolherDescricaoPreChat(npcKey, args) {
    const state = getPreChatState();
    if (!state[npcKey]) state[npcKey] = { seen: false, toggle: 0 };

    const first = (args.preChatFirst && String(args.preChatFirst).trim()) ? String(args.preChatFirst).trim() : '';
    const altA = (args.preChatAltA && String(args.preChatAltA).trim()) ? String(args.preChatAltA).trim() : '';
    const altB = (args.preChatAltB && String(args.preChatAltB).trim()) ? String(args.preChatAltB).trim() : '';

    if (!state[npcKey].seen && first) {
      state[npcKey].seen = true;
      return first;
    }

    const useA = (state[npcKey].toggle % 2 === 0);
    state[npcKey].toggle = (state[npcKey].toggle + 1) % 2;

    if (useA && altA) return altA;
    if (!useA && altB) return altB;

    return altA || altB || '';
  }

  function getIntroState() {
    if (!$gameSystem._geminiNpcIntroState) $gameSystem._geminiNpcIntroState = {};
    return $gameSystem._geminiNpcIntroState;
  }

  function escolherDescricaoRitmo(npcKey, args) {
    const state = getIntroState();
    if (!state[npcKey]) state[npcKey] = { seen: false, toggle: 0 };

    const first = (args.introFirst && String(args.introFirst).trim()) ? String(args.introFirst).trim() : '';
    const altA = (args.introAltA && String(args.introAltA).trim()) ? String(args.introAltA).trim() : '';
    const altB = (args.introAltB && String(args.introAltB).trim()) ? String(args.introAltB).trim() : '';

    if (!state[npcKey].seen && first) {
      state[npcKey].seen = true;
      return first;
    }

    const useA = (state[npcKey].toggle % 2 === 0);
    state[npcKey].toggle = (state[npcKey].toggle + 1) % 2;

    if (useA && altA) return altA;
    if (!useA && altB) return altB;

    return altA || altB || '';
  }

  function montarRequest(args, textoJogador, tipoInteracao, dbContext = '') {

  const varHist = Number(args.CustomHistoryVarId) || VAR_HISTORICO;
  let historico = $gameVariables.value(varHist) || [];

  const maxMsgs = Number(args.historySize || 10) * 2;
  if (maxMsgs > 0 && historico.length > maxMsgs) historico = historico.slice(-maxMsgs);
  if (maxMsgs === 0) historico = [];

  const nomeNpc = processarCtl(args.characterName) || 'NPC';
  const useDecisionTags = getUseDecisionTags(args);

  let regrasDecisao = '';
  if (useDecisionTags) {
    regrasDecisao = `
6) Ao final de TODA resposta, inclua EXATAMENTE uma destas marcas:
   [DECISAO=PERMITIR]
   [DECISAO=NEGAR]
   [DECISAO=ESCLARECER]
7) A marca deve ficar no final da resposta.
8) Use [DECISAO=PERMITIR] quando o NPC decidir deixar o jogador passar ou aceitar o pedido.
9) Use [DECISAO=NEGAR] quando o NPC decidir barrar o jogador ou rejeitar o pedido.
10) Use [DECISAO=ESCLARECER] quando o NPC ainda quiser fazer mais perguntas ou não tiver decidido.
11) Nunca explique o sistema de decisão. Apenas responda como o personagem.`;
  } else {
    regrasDecisao = `
6) Este NPC NÃO usa decisões estruturadas de permissão.
7) NÃO inclua [DECISAO=PERMITIR], [DECISAO=NEGAR] ou [DECISAO=ESCLARECER].`;
  }

  const contextoSocial = montarContextoSocialNpcAtual(args);

  const contextoBanco = (dbContext && String(dbContext).trim())
    ? `\n${String(dbContext).trim()}\n`
    : '';

  const lojaAtiva = shopIsEnabled(args);

  const goods = lojaAtiva ? parseShopGoods(args?.shopGoods || '') : [];
  const catalogTxt = lojaAtiva ? formatShopCatalogForPrompt(goods) : '';
  const goldTxt = lojaAtiva ? `\nO jogador tem atualmente ${$gameParty.gold()}G.\n` : '';

  const regrasLoja = lojaAtiva ? `
20) ESTE NPC É UMA LOJA. Você pode vender/comprar SOMENTE seguindo o catálogo e as regras abaixo.
21) NÃO invente itens, preços ou ouro. Use APENAS o catálogo.
22) Sempre finalize sua resposta com UMA tag [SHOP_ACTION=...], escolhendo:
   - [SHOP_ACTION=BUY;TYPE=I|W|A;ID=<id>;QTY=<qtd>]
   - [SHOP_ACTION=SELL;TYPE=I|W|A;ID=<id>;QTY=<qtd>]
   - [SHOP_ACTION=NONE]
23) Se o jogador pedir um item que não existe no catálogo, responda normalmente e use [SHOP_ACTION=NONE].
24) Se o jogador pedir para comprar algo, escolha o ID correto do catálogo.
25) Se o jogador pedir para vender, use SELL com o ID do item citado (se não souber, use NONE).
` : '';

  const instrucaoSistema =
`--- Regras do NPC ---
1) Você está interpretando um personagem chamado "${nomeNpc}".
2) O jogador controla "${NOME_JOGADOR}".
3) IDIOMA: Responda SEMPRE em português do Brasil (PT-BR). NÃO use inglês.
   - Mesmo que o jogador escreva em outro idioma, responda em PT-BR.
4) FORMATO:
   - Narração/Ações: use asteriscos. Ex: *Ele olha ao redor, desconfiado.*
   - Fala: use aspas duplas. Ex: "O que você quer?"
5) Seja coerente com a persona e o contexto. Não quebre o personagem.${regrasDecisao}
12) Sempre inclua também, ao final da resposta, uma marca de memória social resumida no formato:
   [SOCIAL_SUMMARY=texto curto resumindo sua impressão ou o fato principal]
13) Inclua também:
   [SOCIAL_STANCE=positivo]
   ou [SOCIAL_STANCE=neutro]
   ou [SOCIAL_STANCE=negativo]
14) O texto em [SOCIAL_SUMMARY=...] deve ser curto, em português, e descrever o principal que este NPC concluiu sobre o jogador.
15) Nunca explique as marcas. Apenas as inclua no final.
16) Prefira respostas curtas ou moderadas. Evite descrições excessivamente longas.
17) Faça no máximo uma pergunta por vez.
18) Termine suas frases completamente. Não deixe frases incompletas.
19) Seja direto.${contextoSocial}${contextoBanco}${goldTxt}${catalogTxt}${regrasLoja}`;

  let msgFinal = textoJogador;
  if (tipoInteracao === 'falar') {
    msgFinal = `${NOME_JOGADOR} diz: "${textoJogador}"`;
  }

  const contents = [];

  if (args.examplePrompt && args.exampleResponse) {
    contents.push(
      { role: 'user', parts: [{ text: processarCtl(args.examplePrompt) }] },
      { role: 'model', parts: [{ text: processarCtl(args.exampleResponse) }] }
    );
  }

  for (const msg of historico) {
    contents.push({
      role: (msg.role === 'model' ? 'model' : 'user'),
      parts: [{ text: msg.content }]
    });
  }

  contents.push({ role: 'user', parts: [{ text: msgFinal }] });

  const personaExtra = args.roleInstruction
    ? `\n--- Persona ---\n${processarCtl(args.roleInstruction)}`
    : '';

  return {
    contents,
    systemInstruction: { parts: [{ text: instrucaoSistema + personaExtra }] },
    generationConfig: {
      maxOutputTokens: 900,
      temperature: 0.65
    }
  };
}

  async function lerRespostaCompleta(resposta) {
    const bruto = await resposta.text();
    const texto = extrairTextoGemini(bruto);
    if (!texto || !texto.trim()) return '';
    return texto.trim();
  }

  function extrairTextoGemini(raw) {
    const s = String(raw || '').trim();
    if (!s) return '';

    try {
      const parsed = JSON.parse(s);
      const t = coletarTextoDeObj(parsed);
      if (t) return t;
    } catch (_) { }

    let out = '';
    const linhas = s.split('\n').map(l => l.trim()).filter(Boolean);
    for (const linha of linhas) {
      try {
        const obj = JSON.parse(linha);
        out += coletarTextoDeObj(obj);
      } catch (_) { }
    }
    return out;
  }

  function coletarTextoDeObj(obj) {
    let out = '';
    if (!obj) return out;

    if (Array.isArray(obj)) {
      for (const item of obj) out += coletarTextoDeObj(item);
      return out;
    }

    if (Array.isArray(obj.candidates)) {
      for (const cand of obj.candidates) {
        const parts = cand?.content?.parts;
        if (Array.isArray(parts)) {
          for (const p2 of parts) {
            if (typeof p2?.text === 'string') out += p2.text;
          }
        }
      }
    }
    return out;
  }

  async function exibirTextoComTypewriter(idPlaceholder, texto, comDica, ms, chunk) {
    pararTypewriter();

    if (!texto || texto.length > TYPEWRITER_MAX_CHARS) {
      atualizarLog(idPlaceholder, 'ia', escapeHtmlPreservandoQuebras(texto || ''));
      return;
    }

    atualizarLog(idPlaceholder, 'ia', '');
    const desabilitar = habilitarSkip();

    return new Promise((resolve) => {
      let i = 0;

      _typewriterTimer = setInterval(() => {
        if (_typewriterSkip) {
          pararTypewriter();
          desabilitar();
          atualizarLog(idPlaceholder, 'ia', escapeHtmlPreservandoQuebras(texto));
          resolve();
          return;
        }

        i = Math.min(i + chunk, texto.length);
        const parcial = texto.slice(0, i);

        if (comDica) {
          atualizarLog(idPlaceholder, 'ia', `${escapeHtmlPreservandoQuebras(parcial)}<br>${DICA_PULAR}`);
        } else {
          atualizarLog(idPlaceholder, 'ia', escapeHtmlPreservandoQuebras(parcial));
        }

        if (i >= texto.length) {
          pararTypewriter();
          desabilitar();
          atualizarLog(idPlaceholder, 'ia', escapeHtmlPreservandoQuebras(texto));
          resolve();
        }
      }, ms);
    });
  }

  function salvarVariaveis(args, textoJogador, respostaIa) {
    $gameVariables.setValue(Number(args.CustomResponseVarId) || VAR_RESPOSTA_IA, respostaIa);

    const varHist = Number(args.CustomHistoryVarId) || VAR_HISTORICO;
    const historico = $gameVariables.value(varHist) || [];

    historico.push({ role: 'user', content: textoJogador });
    historico.push({ role: 'model', content: respostaIa });

    $gameVariables.setValue(varHist, historico);
  }

    // ===========================
  // LOJA via chat (segura)
  // ===========================
  function shopIsEnabled(args) {
    return String(args?.shopEnabled ?? 'false').toLowerCase() === 'true';
  }

  function shopSellAny(args) {
    return String(args?.shopSellAny ?? 'true').toLowerCase() !== 'false';
  }

  function parseShopGoods(csv) {
    // "I:5:50,I:7:20,W:3:120"
    const goods = [];
    const parts = String(csv || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    for (const p of parts) {
      const m = p.match(/^([IWA]):(\d+):(\d+)$/i);
      if (!m) continue;
      goods.push({
        type: m[1].toUpperCase(),      // I/W/A
        id: Number(m[2]),
        price: Number(m[3])
      });
    }
    return goods;
  }

  function shopTypeToData(type, id) {
    if (type === 'I') return $dataItems?.[id];
    if (type === 'W') return $dataWeapons?.[id];
    if (type === 'A') return $dataArmors?.[id];
    return null;
  }

  function formatShopCatalogForPrompt(goods) {
    if (!goods || !goods.length) return '';
    let out = '\n--- Catálogo da Loja (itens permitidos) ---\n';
    for (const g of goods) {
      const item = shopTypeToData(g.type, g.id);
      const name = item?.name ? item.name : `${g.type}:${g.id}`;
      out += `- ${g.type}:${g.id} | ${name} | ${g.price}G\n`;
    }
    return out;
  }

  function extractShopAction(text) {
    const str = String(text || '');
    const m = str.match(/\[SHOP_ACTION=([^\]]*)\]/i);
    if (!m) return { cmd: { action: 'NONE' }, cleanText: str.trim() };

    const raw = String(m[1] || '').trim();
    const cleanText = str.replace(/\[SHOP_ACTION=[^\]]*\]/gi, '').trim();

    if (!raw || /^NONE$/i.test(raw)) return { cmd: { action: 'NONE' }, cleanText };

    // BUY;TYPE=I;ID=5;QTY=2
    const parts = raw.split(';').map(s => s.trim()).filter(Boolean);
    const action = (parts[0] || '').toUpperCase(); // BUY/SELL
    const kv = {};
    for (let i = 1; i < parts.length; i++) {
      const [k, v] = parts[i].split('=').map(s => s.trim());
      if (k && v) kv[k.toUpperCase()] = v;
    }

    let t = (kv.TYPE || '').toUpperCase();
    if (t === 'ITEM') t = 'I';
    if (t === 'WEAPON') t = 'W';
    if (t === 'ARMOR') t = 'A';

    const id = Number(kv.ID || 0);
    const qty = Math.max(1, Math.min(Number(kv.QTY || 1), 99));

    return { cmd: { action, type: t, id, qty }, cleanText };
  }

  function runShopAction(args, cmd) {
    const result = { ok: false, message: '', debug: cmd };

    if (!cmd || cmd.action === 'NONE') {
      result.ok = true;
      return result;
    }

    const goods = parseShopGoods(args?.shopGoods || '');
    const item = shopTypeToData(cmd.type, cmd.id);

    if (!item) {
      result.message = 'Item inválido.';
      return result;
    }

    const catalog = goods.find(g => g.type === cmd.type && g.id === cmd.id);

    if (cmd.action === 'BUY') {
      if (!catalog) {
        result.message = 'Esse item não está à venda aqui.';
        return result;
      }

      const total = catalog.price * cmd.qty;
      if ($gameParty.gold() < total) {
        result.message = 'Você não tem ouro suficiente.';
        return result;
      }

      $gameParty.loseGold(total);
      $gameParty.gainItem(item, cmd.qty);

      result.ok = true;
      result.message = `Compra realizada: ${cmd.qty}x ${item.name} por ${total}G.`;
      return result;
    }

    if (cmd.action === 'SELL') {
      const has = $gameParty.numItems(item);
      if (has < cmd.qty) {
        result.message = 'Você não possui essa quantidade.';
        return result;
      }

      // preço de venda: metade do preço do catálogo se existir; senão 1G
      const unitPrice = catalog ? Math.max(1, Math.floor(catalog.price * 0.5)) : 1;

      // se shopSellAny=false, só vende se estiver no catálogo
      if (!shopSellAny(args) && !catalog) {
        result.message = 'Eu não compro esse item.';
        return result;
      }

      const total = unitPrice * cmd.qty;
      $gameParty.loseItem(item, cmd.qty);
      $gameParty.gainGold(total);

      result.ok = true;
      result.message = `Venda realizada: ${cmd.qty}x ${item.name} por ${total}G.`;
      return result;
    }

    result.message = 'Ação de loja desconhecida.';
    return result;
  }

  function extrairDecisaoIA(texto) {
    const str = String(texto || '');
    const m = str.match(/\[DECISAO=(PERMITIR|NEGAR|ESCLARECER)\]/i);
    const decisao = m ? String(m[1]).toUpperCase() : '';
    const textoLimpo = str.replace(/\[DECISAO=(PERMITIR|NEGAR|ESCLARECER)\]/gi, '').trim();
    return { decisao, textoLimpo };
  }

  function extrairMetaSocial(texto) {
    const str = String(texto || '');

    const summaryMatch = str.match(/\[SOCIAL_SUMMARY=([^\]]*)\]/i);
    const stanceMatch = str.match(/\[SOCIAL_STANCE=(positivo|neutro|negativo)\]/i);

    const summary = summaryMatch ? String(summaryMatch[1]).trim() : '';
    const stance = stanceMatch ? String(stanceMatch[1]).trim().toLowerCase() : 'neutro';

    const textoLimpo = str
      .replace(/\[SOCIAL_SUMMARY=[^\]]*\]/gi, '')
      .replace(/\[SOCIAL_STANCE=(positivo|neutro|negativo)\]/gi, '')
      .trim();

    return { summary, stance, textoLimpo };
  }

  function aplicarResultadoDecisao(decisao, args) {
    const decisionVarId = Number(args.DecisionVarId || 0);
    const permitSwitchId = Number(args.PermitSwitchId || 0);

    let valor = DECISAO_ENUM.NENHUMA;

    if (decisao === 'PERMITIR') valor = DECISAO_ENUM.PERMITIR;
    else if (decisao === 'NEGAR') valor = DECISAO_ENUM.NEGAR;
    else if (decisao === 'ESCLARECER') valor = DECISAO_ENUM.ESCLARECER;

    if (decisionVarId > 0) {
      $gameVariables.setValue(decisionVarId, valor);
    }

    if (permitSwitchId > 0 && decisao === 'PERMITIR') {
      $gameSwitches.setValue(permitSwitchId, true);
    }
  }

  function criarJanelaChat() {
    removerElemento('geminiChatWindow');

    const janela = document.createElement('div');
    janela.id = 'geminiChatWindow';
    Object.assign(janela.style, {
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      zIndex: '100',
      left: '0',
      bottom: '0',
      width: '100%',
      height: ALTURA_JANELA,
      boxSizing: 'border-box',
      color: 'white',
      fontSize: '20px',
      background: 'linear-gradient(to bottom, rgba(15,28,69,0.90), rgba(8,59,112,0.90))',
      borderTop: '2px solid rgba(255,255,255,0.5)',
      overflow: 'hidden'
    });

    const area = document.createElement('div');
    area.id = 'geminiMessageLog';
    Object.assign(area.style, {
      padding: '18px',
      flexGrow: 1,
      overflowY: 'auto',
      lineHeight: 1.4
    });

    const containerBtn = document.createElement('div');
    containerBtn.id = 'geminiContinueButtonContainer';
    Object.assign(containerBtn.style, {
      display: 'none',
      padding: '10px',
      textAlign: 'center',
      backgroundColor: 'rgba(0,0,0,0.28)',
      flexShrink: 0
    });

    containerBtn.appendChild(criarBotao('Continuar...', loopChat));

    janela.appendChild(area);
    janela.appendChild(containerBtn);
    document.body.appendChild(janela);

    elLog = area;
  }

  function adicionarLog(tipo, html, id) {
    if (!elLog) return;
    const div = document.createElement('div');
    if (id) div.id = id;
    div.style.marginBottom = '12px';

    if (tipo === 'jogador') div.style.color = '#b7ffd2';
    if (tipo === 'sistema') div.style.color = '#ffd27a';

    div.innerHTML = html;
    elLog.appendChild(div);
    elLog.scrollTop = elLog.scrollHeight;
  }

  function atualizarLog(id, tipo, html) {
    let div = document.getElementById(id);
    if (!div) {
      if (!elLog) return;
      div = document.createElement('div');
      div.id = id;
      div.style.marginBottom = '12px';
      elLog.appendChild(div);
    }

    if (tipo === 'ia') {
      const nome = processarCtl(argsChat?.characterName || 'NPC');
      div.innerHTML = `<div><b style="color:#87CEEB;">${escapeHtml(nome)}</b><br>${html}</div>`;
    } else {
      div.innerHTML = html;
    }

    elLog.scrollTop = elLog.scrollHeight;
  }

  function criarBotao(texto, onClick) {
    const b = document.createElement('button');
    b.innerText = texto;
    if (onClick) b.onclick = onClick;
    Object.assign(b.style, {
      padding: '8px 25px',
      fontSize: '18px',
      color: 'white',
      background: 'rgba(100, 150, 255, 0.75)',
      border: '1px solid rgba(255,255,255,0.35)',
      borderRadius: '7px',
      cursor: 'pointer'
    });
    return b;
  }

  function esconderBotaoContinuar() {
    const el = document.getElementById('geminiContinueButtonContainer');
    if (el) el.style.display = 'none';
  }

  function mostrarBotaoContinuar() {
    const el = document.getElementById('geminiContinueButtonContainer');
    if (el) el.style.display = 'block';
  }

  function travarMovimentoJogador() {
    const eventId = $gameMap._interpreter.eventId();
    if (eventId > 0) {
      const ev = $gameMap.event(eventId);
      if (ev) {
        eventoAtual = ev;
        ev.setDirectionFix(true);
        ev._originalMoveType = ev._moveType;
        ev._moveType = 0;
      }
    }
  }

  function limparTudo() {
    posEscolhaCustom = null;
    pararTypewriter();
    removerElemento('geminiChatWindow');
    removerElemento('geminiInputDialog');
    elLog = null;
    argsChat = null;
    estaGerando = false;

    if (eventoAtual) {
      eventoAtual.setDirectionFix(false);
      if (eventoAtual._originalMoveType !== undefined) eventoAtual._moveType = eventoAtual._originalMoveType;
      eventoAtual = null;
    }
  }

  function encerrarChatPorDecisao() {
    const interpreter = $gameMap._interpreter;

    limparTudo();

    if (interpreter) {
      interpreter.setWaitMode('');
    }

    $gameMap.requestRefresh();
  }

  function esperarConfirmacaoParaFechar() {
    return new Promise((resolve) => {
      let finalizado = false;

      const cleanup = () => {
        window.removeEventListener('keydown', onKeyDown, true);
        window.removeEventListener('mousedown', onMouseDown, true);
        window.removeEventListener('touchstart', onTouchStart, true);
      };

      const done = () => {
        if (finalizado) return;
        finalizado = true;
        cleanup();
        resolve();
      };

      const onKeyDown = (e) => {
        const k = e.keyCode || e.which;
        if (k === 32 || k === 13 || k === 90) {
          e.preventDefault();
          e.stopImmediatePropagation();
          done();
        }
      };

      const onMouseDown = () => done();
      const onTouchStart = () => done();

      window.addEventListener('keydown', onKeyDown, true);
      window.addEventListener('mousedown', onMouseDown, true);
      window.addEventListener('touchstart', onTouchStart, true);
    });
  }

  const _Game_Player_performTransfer_GeminiSocial = Game_Player.prototype.performTransfer;
  Game_Player.prototype.performTransfer = function () {
    const oldMapId = $gameMap ? $gameMap.mapId() : 0;
    _Game_Player_performTransfer_GeminiSocial.call(this);
    const newMapId = $gameMap ? $gameMap.mapId() : 0;
    if (newMapId && newMapId !== oldMapId) {
      propagarInformacoesSociais();
      const mem = getSocialMemory();
      mem.lastPropagationMapId = newMapId;
    }
  };

  const _updateWaitMode = Game_Interpreter.prototype.updateWaitMode;
  Game_Interpreter.prototype.updateWaitMode = function () {
    return this._waitMode === 'geminiChat' ? true : _updateWaitMode.call(this);
  };

  const _choiceUpdatePlacement = Window_ChoiceList.prototype.updatePlacement;
  Window_ChoiceList.prototype.updatePlacement = function () {
    _choiceUpdatePlacement.call(this);
    if (posEscolhaCustom) {
      try {
        if (posEscolhaCustom.x) this.x = eval(posEscolhaCustom.x);
        if (posEscolhaCustom.y) this.y = eval(posEscolhaCustom.y);
        if (posEscolhaCustom.z) this.z = Number(posEscolhaCustom.z);
      } catch (e) {
        console.error('[GeminiNPC] Erro ao avaliar posição da janela de escolhas:', e);
      }
    }
  };

  function processarCtl(str) {
    return str ? Window_Base.prototype.convertEscapeCharacters(str) : '';
  }

  function removerCaracteres(str, chars) {
    if (!chars) return str;
    const regex = new RegExp(`[${chars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`, 'g');
    return str.replace(regex, '');
  }

  function removerElemento(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  function textoPareceCortado(texto) {
    const t = String(texto || '').trim();
    if (!t) return false;
    if (/[.!?…"”'\*\]]$/.test(t)) return false;
    if (/[a-zA-ZÀ-ÿ0-9,:;]$/.test(t)) return true;
    return false;
  }

  function makeRunId() {
    return `run_${Date.now()}_${Math.floor(Math.random() * 1e9)}`;
  }

  function ensureRunId() {
    if (!$gameSystem) return null;
    if (!$gameSystem._runId) $gameSystem._runId = makeRunId();
    return $gameSystem._runId;
  }

  function formatarErro(error) {
    const msg = String(error?.message || '');
    const body = String(error?.bodyText || '');

    if (msg.includes("Configuração inválida")) return msg;
    if (msg.includes("API Error (401)")) return "<b>Erro 401</b><br>Token do proxy inválido.";
    if (msg.includes("API Error (404)")) return "<b>Erro 404</b><br>Modelo não encontrado/permitido no worker.";

    if (msg.includes("API Error (429)")) {
      if (isQuotaExceeded(body)) {
        return "<b>Erro 429</b><br>Cota diária da API esgotada. Aguarde a renovação da cota ou use outra chave/projeto.";
      }
      return "<b>Erro 429</b><br>Limite temporário atingido. Tente novamente em alguns segundos.";
    }

    if (msg.includes("API Error (503)")) {
      return "<b>Erro 503</b><br>O modelo está com alta demanda no momento. Tente novamente em alguns segundos.";
    }

    return escapeHtml(msg || "Erro desconhecido");
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;');
  }


const PALAVRAS_BLOQUEADAS = [
  "caralho", "porra", "puta", "merda", "buceta", "pau", "foder", "viado"
];

function normalizarTextoFiltro(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/0/g, "o")
    .replace(/1/g, "i")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/5/g, "s")
    .replace(/@/g, "a");
}

function contemPalavraProibida(texto) {
  const t = normalizarTextoFiltro(texto);
  return PALAVRAS_BLOQUEADAS.some(p => {
    const pp = normalizarTextoFiltro(p);
    const re = new RegExp(`\\b${pp.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, "i");
    return re.test(t);
  });
}

function mensagemBloqueioDiegetica() {
  return `<i>*O NPC franze a testa.* "Vamos manter o respeito."</i>`;
}

  function escapeHtmlPreservandoQuebras(str) {
    return escapeHtml(str).replaceAll('\n', '<br>');
  }
})();


