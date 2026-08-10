/* =========================================================
   FUNÇÕES COMPARTILHADAS DO PAINEL ADMINISTRATIVO
   ========================================================= */
function adminGuard() {
  if (!sessionStorage.getItem('fotoalbum_admin')) {
    window.location.href = 'login.html';
  }
}

function renderAdminTopbar(activePage) {
  document.getElementById('studioMarkAdmin').textContent = STUDIO_CONFIG.studioName;
  document.querySelectorAll('.admin-nav a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === activePage);
  });
}

function logoutAdmin() {
  sessionStorage.removeItem('fotoalbum_admin');
  window.location.href = 'login.html';
}

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function showAdminToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(showAdminToast._t);
  showAdminToast._t = setTimeout(() => t.classList.remove('show'), 2200);
}

function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => showAdminToast('Copiado para a área de transferência'));
  } else {
    const ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); document.body.removeChild(ta);
    showAdminToast('Copiado para a área de transferência');
  }
}

function whatsappLink(gallery) {
  const url = `${location.origin}${location.pathname.replace(/admin\/.*/, '')}index.html?g=${gallery.id}`;
  const msg = `Olá, ${gallery.clienteNome.split(' ')[0]}! ✨ Sua galeria do ensaio "${gallery.ensaioNome}" já está pronta.\n\nAcesse e escolha suas fotos favoritas:\n${url}\n\nSenha de acesso: ${gallery.senha}`;
  return `https://wa.me/?text=${encodeURIComponent(msg)}`;
}
