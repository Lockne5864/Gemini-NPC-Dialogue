/*:
 * @target MZ
 * @plugindesc Login antes do menu + saves separados por conta (filtra por usuário) + sessão em $gameSystem + runId por campanha (New Game) + preserva sessão após Load.
 * @author
 *
 * @param ApiBaseUrl
 * @text API Base URL
 * @type string
 * @default https://lockne.davidutra567.workers.dev
 */

(() => {
  "use strict";
  const PLUGIN = "AuthLogin";
  const p = PluginManager.parameters(PLUGIN);
  const API_BASE = String(p.ApiBaseUrl || "").replace(/\/+$/, "");

  // ---------------------------------------------------------
  // Sessão persistida em memória do app (não vai para o save)
  // ---------------------------------------------------------
  function saveAuthToWindow(authObj) {
    try {
      window.__AUTH_SESSION = authObj ? JSON.parse(JSON.stringify(authObj)) : null;
    } catch {
      window.__AUTH_SESSION = authObj || null;
    }
  }

  function getAuthFromWindow() {
    const a = window.__AUTH_SESSION;
    if (!a || !a.token) return null;
    return a;
  }

  function isLoggedIn() {
    return !!($gameSystem && $gameSystem._auth && $gameSystem._auth.token);
  }

  function auth() {
    return ($gameSystem && $gameSystem._auth) ? $gameSystem._auth : null;
  }

  // ===== runId por campanha =====
  function makeRunId() {
    return `run_${Date.now()}_${Math.floor(Math.random() * 1e9)}`;
  }

  function ensureRunId() {
    if (!$gameSystem) return;
    if (!$gameSystem._runId) $gameSystem._runId = makeRunId();
  }

  async function apiPost(path, body) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {})
    });

    const text = await res.text().catch(() => "");
    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch {}

    if (!res.ok) {
      const msg = json?.error || json?.message || text || `HTTP ${res.status}`;
      const err = new Error(msg);
      err.status = res.status;
      err.payload = json;
      throw err;
    }
    return json ?? {};
  }

  // ---------------------------------------------------------
  // Window_LoginInfo (mostra usuário/senha/status)
  // ---------------------------------------------------------
  class Window_LoginInfo extends Window_Base {
    initialize(rect) {
      super.initialize(rect);
      this._username = "";
      this._password = "";
      this._busy = false;
      this._busyText = "";
      this._error = "";
      this.refresh();
    }

    setValues(username, password) {
      this._username = username || "";
      this._password = password || "";
      this.refresh();
    }

    setBusy(v, text = "") {
      this._busy = v;
      this._busyText = text || "";
      if (v) this._error = "";
      this.refresh();
    }

    showError(msg) {
      this._error = msg || "";
      this.refresh();
    }

    clearError() {
      this._error = "";
      this.refresh();
    }

    refresh() {
      this.contents.clear();

      const lh = this.lineHeight();
      let y = 0;

      this.changeTextColor(ColorManager.systemColor());
      this.drawText("Login", 0, y, this.innerWidth, "center");
      this.resetTextColor();
      y += Math.floor(lh * 1.5);

      this.drawText(`Usuário: ${this._username}`, 0, y, this.innerWidth);
      y += lh;

      const hidden = this._password ? "*".repeat(Math.min(this._password.length, 18)) : "";
      this.drawText(`Senha: ${hidden}`, 0, y, this.innerWidth);
      y += Math.floor(lh * 1.2);

      this.changeTextColor(ColorManager.systemColor());
      this.resetTextColor();
      y += lh;

      // Rodapé (status)
      const statusY = this.innerHeight - lh * 2;
      if (this._busy) {
        this.changeTextColor(ColorManager.systemColor());
        this.drawText(this._busyText || "Processando...", 0, statusY, this.innerWidth, "center");
        this.resetTextColor();
      } else if (this._error) {
        this.changeTextColor(ColorManager.crisisColor());
        this.drawText(this._error, 0, statusY, this.innerWidth, "center");
        this.resetTextColor();
      } else {
        this.changeTextColor(ColorManager.systemColor());
        this.drawText("Faça login para continuar.", 0, statusY, this.innerWidth, "center");
        this.resetTextColor();
      }
    }
  }

  // ---------------------------------------------------------
  // Window_LoginCommands (4 opções)
  // ---------------------------------------------------------
  class Window_LoginCommands extends Window_Command {
    initialize(rect) {
      super.initialize(rect);
      this.refresh();
      this.select(0);
      this.activate();
    }

    makeCommandList() {
      this.addCommand("Editar usuário", "editUser");
      this.addCommand("Editar senha", "editPass");
      this.addCommand("Entrar", "login");
      this.addCommand("Sair", "exit");
    }
  }

  // ---------------------------------------------------------
  // Scene_Login (antes do menu)
  // ---------------------------------------------------------
  class Scene_Login extends Scene_Base {
    create() {
      super.create();
      this.createBackground();
      this.createWindowLayer();
      this._username = "";
      this._password = "";
      this.createInfoWindow();
      this.createCommandWindow();
      this.syncInfo();
    }

    createBackground() {
      this._backgroundSprite = new Sprite();
      this._backgroundSprite.bitmap = SceneManager.backgroundBitmap();
      this.addChild(this._backgroundSprite);
    }

    createInfoWindow() {
      const w = 560;
      const h = 220;
      const x = (Graphics.boxWidth - w) / 2;
      const y = (Graphics.boxHeight - (h + 180)) / 2;
      this._infoWin = new Window_LoginInfo(new Rectangle(x, y, w, h));
      this.addWindow(this._infoWin);
    }

    createCommandWindow() {
      const w = 560;
      const h = 180;
      const x = (Graphics.boxWidth - w) / 2;
      const y = this._infoWin.y + this._infoWin.height;
      this._cmdWin = new Window_LoginCommands(new Rectangle(x, y, w, h));

      this._cmdWin.setHandler("editUser", this.onEditUser.bind(this));
      this._cmdWin.setHandler("editPass", this.onEditPass.bind(this));
      this._cmdWin.setHandler("login", this.onLogin.bind(this));
      this._cmdWin.setHandler("exit", this.onExit.bind(this));
      this.addWindow(this._cmdWin);
    }

    syncInfo() {
      this._infoWin.setValues(this._username, this._password);
    }

    onEditUser() {
      if (this._infoWin._busy) return;
      const v = window.prompt("Usuário", this._username || "");
      if (v !== null) {
        this._username = String(v);
        this._infoWin.clearError();
        this.syncInfo();
      }
      this._cmdWin.activate();
    }

    onEditPass() {
      if (this._infoWin._busy) return;
      const v = window.prompt("Senha", "");
      if (v !== null) {
        this._password = String(v);
        this._infoWin.clearError();
        this.syncInfo();
      }
      this._cmdWin.activate();
    }

    async onLogin() {
      const username = String(this._username || "").trim();
      const password = String(this._password || "");

      if (!username || !password) {
        this._infoWin.showError("Preencha usuário e senha.");
        this._cmdWin.activate();
        return;
      }

      this._infoWin.setBusy(true, "Entrando...");
      this._cmdWin.deactivate();

      try {
        const data = await apiPost("/login", { username, password });

        $gameSystem._auth = {
          userId: data.userId,
          username: data.username,
          token: data.token
        };

        // NOVO: mantém sessão mesmo após "Continuar" (Load)
        saveAuthToWindow($gameSystem._auth);

        // garante runId ao logar (primeira campanha)
        ensureRunId();

        this._infoWin.setBusy(false, "");
        SceneManager.goto(Scene_Title);

      } catch (e) {
        this._infoWin.setBusy(false, "");
        this._infoWin.showError(`Login falhou: ${e.message}`);
        this._cmdWin.activate();
      }
    }

    onExit() {
      SceneManager.exit();
    }
  }

  // ---------------------------------------------------------
  // Boot -> vai pro Login antes do Title
  // ---------------------------------------------------------
  const _Scene_Boot_start = Scene_Boot.prototype.start;
  Scene_Boot.prototype.start = function() {
    _Scene_Boot_start.call(this);

    // Se tiver sessão guardada na memória do app, reanexa
    const winAuth = getAuthFromWindow();
    if (winAuth && $gameSystem) {
      $gameSystem._auth = JSON.parse(JSON.stringify(winAuth));
    }

    if (!isLoggedIn()) {
      SceneManager.goto(Scene_Login);
    } else {
      ensureRunId();
    }
  };

  // ---------------------------------------------------------
  // New Game -> mantém login e cria runId novo
  // ---------------------------------------------------------
  const _DataManager_setupNewGame = DataManager.setupNewGame;
  DataManager.setupNewGame = function() {
    const prevAuth = $gameSystem?._auth ? JSON.parse(JSON.stringify($gameSystem._auth)) : null;

    _DataManager_setupNewGame.call(this);

    if (prevAuth) {
      $gameSystem._auth = prevAuth;
      // também mantém no window
      saveAuthToWindow(prevAuth);
    }

    $gameSystem._runId = makeRunId();
  };

  // ---------------------------------------------------------
  // NOVO: Ao carregar "Continuar" (Load), reaplica a sessão do window
  // ---------------------------------------------------------
  const _DataManager_extractSaveContents = DataManager.extractSaveContents;
  DataManager.extractSaveContents = function(contents) {
    _DataManager_extractSaveContents.call(this, contents);

    // reanexa auth do app (para /history e /log continuarem)
    const winAuth = getAuthFromWindow();
    if (winAuth && $gameSystem) {
      $gameSystem._auth = JSON.parse(JSON.stringify(winAuth));
    }

    // garante runId (normalmente vem do save, mas por segurança)
    ensureRunId();
  };

  // ---------------------------------------------------------
  // Save owner: grava userId no savefileInfo e filtra saves por usuário
  // ---------------------------------------------------------
  const _DataManager_makeSavefileInfo = DataManager.makeSavefileInfo;
  DataManager.makeSavefileInfo = function() {
    const info = _DataManager_makeSavefileInfo.call(this);
    info.__authUserId = auth()?.userId ?? null;
    info.__authUsername = auth()?.username ?? null;
    info.__runId = $gameSystem?._runId ?? null;
    return info;
  };

  const _DataManager_savefileInfo = DataManager.savefileInfo;
  DataManager.savefileInfo = function(savefileId) {
    const info = _DataManager_savefileInfo.call(this, savefileId);
    if (!info) return info;

    const a = auth();
    if (!a || !a.userId) return null;

    if (info.__authUserId == null) return null;
    return (info.__authUserId === a.userId) ? info : null;
  };

})();