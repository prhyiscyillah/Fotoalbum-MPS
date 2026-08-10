/* =========================================================
   LÓGICA DA GALERIA DA CLIENTE
   ========================================================= */
(async function () {
  const galleryId = sessionStorage.getItem('fotoalbum_sessao');
  if (!galleryId) { window.location.href = 'index.html'; return; }

  let gallery = await Store.getById(galleryId);
  if (!gallery) { window.location.href = 'index.html'; return; }

  const photos = await PhotoProvider.getPhotos(gallery.fotoIds);
  let selection = new Set(gallery.selecao || []);
  let currentIndex = 0;

  const els = {
    greetTitle: document.getElementById('greetTitle'),
    greetSubtitle: document.getElementById('greetSubtitle'),
    counterPill: document.getElementById('counterPill'),
    limitBanner: document.getElementById('limitBanner'),
    priceInfo: document.getElementById('priceInfo'),
    sheet: document.getElementById('contactSheet'),
    sheetLabel: document.getElementById('sheetLabel'),
    submitBtn: document.getElementById('submitBtn'),
    submitHint: document.getElementById('submitHint'),
    lightbox: document.getElementById('lightbox'),
    lightboxImg: document.getElementById('lightboxImg'),
    lightboxCounter: document.getElementById('lightboxCounter'),
    lightboxHeart: document.getElementById('lightboxHeart'),
    toast: document.getElementById('toast'),
  };

  els.greetTitle.textContent = `Olá, ${gallery.clienteNome.split(' ')[0]} ❤️`;
  els.greetSubtitle.textContent = `${gallery.ensaioNome} — escolha suas fotos favoritas`;
  els.sheetLabel.textContent = `${gallery.ensaioNome.toUpperCase()} · ${photos.length} FOTOS`;

  function isOverLimit() { return selection.size > gallery.limiteFotos; }
  function extraCount() { return Math.max(0, selection.size - gallery.limiteFotos); }

  function parseValor(v) {
    const n = parseFloat(String(v).replace(',', '.'));
    return isNaN(n) ? null : n;
  }
  function fmtMoney(n) {
    return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function calcTotal() {
    const base = parseValor(gallery.valorPacote);
    if (base === null) return null;
    const precoExtra = parseValor(gallery.valorFotoExtra) || 0;
    return base + (extraCount() * precoExtra);
  }

  function updateCounter() {
    els.counterPill.textContent = `${selection.size} / ${gallery.limiteFotos}`;
    els.counterPill.classList.toggle('full', isOverLimit());
    els.submitBtn.disabled = selection.size === 0;

    if (isOverLimit()) {
      const extra = extraCount();
      els.limitBanner.classList.add('show');
      const precoTxt = gallery.valorFotoExtra
        ? ` (fotos extras a R$ ${fmtMoney(parseValor(gallery.valorFotoExtra) || 0)} cada).`
        : '';
      els.limitBanner.textContent =
        `Seu pacote inclui ${gallery.limiteFotos} fotos. Você já selecionou ${extra} foto${extra > 1 ? 's' : ''} a mais do que o combinado${precoTxt}`;
    } else {
      els.limitBanner.classList.remove('show');
    }

    const total = calcTotal();
    if (total !== null) {
      els.priceInfo.style.display = 'block';
      const extra = extraCount();
      els.priceInfo.innerHTML = extra > 0
        ? `Pacote R$ ${fmtMoney(parseValor(gallery.valorPacote))} + ${extra} extra${extra > 1 ? 's' : ''} = <strong>Total R$ ${fmtMoney(total)}</strong>`
        : `Total do pedido: <strong>R$ ${fmtMoney(total)}</strong>`;
    } else {
      els.priceInfo.style.display = 'none';
    }

    els.submitHint.textContent = selection.size === 0
      ? 'Selecione ao menos 1 foto para enviar'
      : `${selection.size} foto${selection.size > 1 ? 's' : ''} pronta${selection.size > 1 ? 's' : ''} para enviar`;
  }

  async function persistSelection() {
    gallery.selecao = Array.from(selection);
    await Store.save(gallery);
  }

  function toggleSelect(id) {
    if (selection.has(id)) selection.delete(id); else selection.add(id);
    persistSelection(); // roda em segundo plano; a interface já atualiza no updateCounter()
    updateCounter();
    return true;
  }

  function showToast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => els.toast.classList.remove('show'), 2200);
  }

  function renderSheet() {
    els.sheet.innerHTML = '';
    // A ordem de seleção (Set preserva ordem de inserção) define quais fotos
    // contam como "do pacote" e quais são "extras" além do limite.
    const selectedOrder = Array.from(selection);
    const extraIds = new Set(selectedOrder.slice(gallery.limiteFotos));

    photos.forEach((p, idx) => {
      const selected = selection.has(p.id);
      const isExtra = selected && extraIds.has(p.id);
      const frame = document.createElement('div');
      frame.className = `frame${selected ? ' selected' : ''}`;
      frame.style.animationDelay = `${Math.min(idx * 25, 400)}ms`;
      frame.innerHTML = `
        <img src="${p.url}" alt="Foto ${p.numero}" loading="lazy">
        <span class="frame-number mono">#${p.numero}</span>
        ${isExtra ? `<span class="frame-extra-tag">EXTRA</span>` : ''}
        <button class="frame-heart" aria-label="Selecionar foto ${p.numero}">${selected ? '❤' : '♡'}</button>
      `;
      frame.querySelector('img').addEventListener('click', () => openLightbox(idx));
      frame.querySelector('.frame-heart').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSelect(p.id);
        renderSheet();
      });
      els.sheet.appendChild(frame);
    });
  }

  /* ---------- Lightbox ---------- */
  function openLightbox(idx) {
    currentIndex = idx;
    renderLightbox();
    els.lightbox.classList.add('open');
  }
  function closeLightbox() { els.lightbox.classList.remove('open'); }
  function renderLightbox() {
    const p = photos[currentIndex];
    els.lightboxImg.src = p.url;
    els.lightboxImg.alt = `Foto ${p.numero}`;
    els.lightboxCounter.textContent = `#${p.numero} · ${currentIndex + 1} / ${photos.length}`;
    const watermarkText = `${STUDIO_CONFIG.studioName.toUpperCase()} · PROVA · #${p.numero}`;
    document.getElementById('lightboxWatermark').innerHTML =
      Array.from({ length: 9 }).map(() => `<span>${watermarkText}</span>`).join('');
    const selected = selection.has(p.id);
    els.lightboxHeart.classList.toggle('selected', selected);
    els.lightboxHeart.textContent = selected ? '❤ Selecionada' : '❤ Selecionar';
  }
  document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
  document.getElementById('lightboxPrev').addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + photos.length) % photos.length;
    renderLightbox();
  });
  document.getElementById('lightboxNext').addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % photos.length;
    renderLightbox();
  });
  els.lightboxHeart.addEventListener('click', () => {
    const p = photos[currentIndex];
    if (toggleSelect(p.id)) { renderLightbox(); renderSheet(); }
  });
  document.addEventListener('keydown', (e) => {
    if (!els.lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') document.getElementById('lightboxPrev').click();
    if (e.key === 'ArrowRight') document.getElementById('lightboxNext').click();
  });

  /* ---------- Envio da seleção ---------- */
  const confirmModal = document.getElementById('confirmModal');
  const successModal = document.getElementById('successModal');

  els.submitBtn.addEventListener('click', () => {
    const extra = extraCount();
    const total = calcTotal();
    const totalTxt = total !== null ? ` Total do pedido: R$ ${fmtMoney(total)}.` : '';
    document.getElementById('confirmText').textContent = extra > 0
      ? `Você selecionou ${selection.size} fotos, sendo ${extra} a mais do que as ${gallery.limiteFotos} inclusas no seu pacote.${totalTxt} Deseja enviar mesmo assim?`
      : `Você selecionou ${selection.size} foto${selection.size > 1 ? 's' : ''}.${totalTxt} Deseja enviar sua seleção?`;
    confirmModal.classList.add('open');
  });
  document.getElementById('confirmCancel').addEventListener('click', () => confirmModal.classList.remove('open'));
  document.getElementById('confirmSend').addEventListener('click', async () => {
    gallery.selecao = Array.from(selection);
    gallery.selecaoEnviada = true;
    await Store.save(gallery);
    confirmModal.classList.remove('open');

    // Monta a mensagem e abre o WhatsApp já com o texto pronto.
    // A cliente só precisa apertar "enviar" dentro do WhatsApp.
    const selectedOrder = Array.from(selection);
    const incluidas = selectedOrder.slice(0, gallery.limiteFotos).sort().map(n => `#${n}`).join(', ');
    const extras = selectedOrder.slice(gallery.limiteFotos).sort().map(n => `#${n}`);
    const extraCountAtual = extras.length;

    let corpoMensagem = `Fotos escolhidas (${selection.size}/${gallery.limiteFotos} inclusas):\n${incluidas}`;
    if (extraCountAtual > 0) {
      const precoInfo = gallery.valorFotoExtra ? ` (R$ ${fmtMoney(parseValor(gallery.valorFotoExtra) || 0)} cada)` : '';
      corpoMensagem += `\n\n➕ Fotos extras além do pacote (${extraCountAtual})${precoInfo}:\n${extras.join(', ')}`;
    }

    const total = calcTotal();
    if (total !== null) {
      corpoMensagem += `\n\n💰 Valor total: R$ ${fmtMoney(total)}`;
    }

    const mensagem =
      `Olá! Aqui é ${gallery.clienteNome}. ✅ Enviando minha seleção do ensaio "${gallery.ensaioNome}":\n\n` +
      corpoMensagem;
    const link = `https://wa.me/${STUDIO_CONFIG.whatsappNumber}?text=${encodeURIComponent(mensagem)}`;
    window.open(link, '_blank');

    successModal.classList.add('open');
  });
  document.getElementById('successClose').addEventListener('click', () => successModal.classList.remove('open'));

  // Dificulta salvar as fotos diretamente (não impede print/gravação de tela,
  // mas evita o "salvar imagem" e o arraste comuns).
  document.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === 'IMG') e.preventDefault();
  });
  document.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'IMG') e.preventDefault();
  });

  updateCounter();
  renderSheet();
})();
