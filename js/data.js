/* =========================================================
   CAMADA DE DADOS
   ---------------------------------------------------------
   Este arquivo é a ÚNICA fonte de fotos e galerias usada pelo
   site. Os dados agora ficam no Firebase Firestore — um banco
   de dados na nuvem, gratuito, que qualquer aparelho (seu
   celular, seu computador, o celular da cliente) enxerga do
   mesmo jeito. Antes, os dados ficavam presos no localStorage
   de cada navegador; por isso a cliente não via as galerias
   que você cadastrava.

   >>> COMO CONFIGURAR (uma vez só) <<<
   Veja o passo a passo completo em FIREBASE_SETUP.md.
   Resumo: crie um projeto gratuito no Firebase, ative o
   Firestore Database, cole as regras de segurança indicadas,
   e cole o "firebaseConfig" do seu projeto logo abaixo.

   >>> QUANDO FOR CONECTAR O GOOGLE DRIVE DE VERDADE <<<
   Basta reescrever as funções da seção "PROVEDOR DE FOTOS"
   para buscar de uma API. Nenhuma outra tela precisa mudar,
   porque todas chamam apenas PhotoProvider.
   ========================================================= */

/* ---------- CONFIGURAÇÃO GERAL (edite aqui) ---------- */
const STUDIO_CONFIG = {
  studioName: "MPS Photography",            // <-- nome da fotógrafa / estúdio
  studioTagline: "ensaios & retratos",
  logoInitials: "MPS",                      // usado enquanto não há logo em imagem
  whatsappNumber: "5511914746140"           // número que RECEBE as seleções das clientes — formato: 55 + DDD + número, só dígitos
};

/* ---------- CONFIGURAÇÃO DO FIREBASE (edite aqui) ----------
   Cole aqui o firebaseConfig do SEU projeto (veja o passo a
   passo em FIREBASE_SETUP.md). Os valores abaixo são só um
   exemplo e NÃO funcionam até você trocar pelos do seu projeto.
------------------------------------------------------------- */
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDOMwJL3pf-4Jo-k70UiU7hh1yBVN_PnN8",
  authDomain: "fotoalbum-mps.firebaseapp.com",
  projectId: "fotoalbum-mps",
  storageBucket: "fotoalbum-mps.firebasestorage.app",
  messagingSenderId: "216259552727",
  appId: "1:216259552727:web:fe01c5bdc0f5f962d4d792"
};

firebase.initializeApp(FIREBASE_CONFIG);
const db = firebase.firestore();

/* ---------- FOTOS DE EXEMPLO (mock) ----------
   Usadas apenas para popular o banco de dados na primeira vez
   que o site roda, caso a coleção de fotos ainda esteja vazia.
------------------------------------------------- */
const PHOTOS_MOCK = Array.from({ length: 24 }).map((_, i) => {
  const n = String(i + 1).padStart(3, "0");
  return {
    id: n,
    nome: `IMG_${n}.jpg`,
    url: `https://picsum.photos/seed/ensaio-${n}/520/640`,
    numero: n
  };
});

/* ---------- GALERIAS DE EXEMPLO (mock) ----------
   Usadas apenas para popular o banco de dados na primeira vez
   que o site roda, caso a coleção de galerias ainda esteja vazia.
--------------------------------------------------- */
const GALLERIES_SEED = [
  {
    id: "gal-maria-gestante",
    clienteNome: "Maria Fernandes",
    ensaioNome: "Ensaio Gestante",
    data: "2026-07-18",
    senha: "maria2026",
    limiteFotos: 20,
    valorPacote: "100",
    valorFotoExtra: "5",
    status: "ativa",
    expiraEm: "",
    fotoIds: PHOTOS_MOCK.slice(0, 18).map(p => p.id),
    selecao: [],
    selecaoEnviada: false
  }
];

/* =========================================================
   BIBLIOTECA DE FOTOS (Firestore, coleção "fotos")
   ========================================================= */
const PhotoLibrary = {
  _collection: () => db.collection("fotos"),
  _seeded: false,

  async _ensureSeed() {
    if (this._seeded) return;
    const snap = await this._collection().limit(1).get();
    if (snap.empty) {
      const batch = db.batch();
      PHOTOS_MOCK.forEach(p => batch.set(this._collection().doc(p.id), p));
      await batch.commit();
    }
    this._seeded = true;
  },
  async getAll() {
    await this._ensureSeed();
    const snap = await this._collection().get();
    return snap.docs.map(d => d.data());
  },
  async add(url) {
    const all = await this.getAll();
    let n = all.length + 1;
    let id = String(n).padStart(3, "0");
    while (all.some(p => p.id === id)) { n++; id = String(n).padStart(3, "0"); }
    const urlFinal = normalizeImageUrl(url); // converte link do Drive automaticamente, se for o caso
    const photo = { id, nome: `foto-${id}.jpg`, url: urlFinal, numero: id };
    await this._collection().doc(id).set(photo);
    return photo;
  },
  async remove(id) {
    await this._collection().doc(id).delete();
  }
};

/* =========================================================
   GALERIAS (Firestore, coleção "galerias")
   ========================================================= */
const Store = {
  _collection: () => db.collection("galerias"),
  _seeded: false,

  async _ensureSeed() {
    if (this._seeded) return;
    const snap = await this._collection().limit(1).get();
    if (snap.empty) {
      const batch = db.batch();
      GALLERIES_SEED.forEach(g => batch.set(this._collection().doc(g.id), g));
      await batch.commit();
    }
    this._seeded = true;
  },
  async getAll() {
    await this._ensureSeed();
    const snap = await this._collection().get();
    return snap.docs.map(d => d.data());
  },
  async getById(id) {
    await this._ensureSeed();
    const doc = await this._collection().doc(id).get();
    return doc.exists ? doc.data() : null;
  },
  async save(gallery) {
    await this._collection().doc(gallery.id).set(gallery);
    return gallery;
  },
  async remove(id) {
    await this._collection().doc(id).delete();
  }
};

/* =========================================================
   PROVEDOR DE FOTOS
   ========================================================= */
const PhotoProvider = {
  async getAllPhotos() {
    return PhotoLibrary.getAll();
  },
  async getPhotos(fotoIds) {
    const all = await PhotoLibrary.getAll();
    const byId = Object.fromEntries(all.map(p => [p.id, p]));
    return fotoIds.map(id => byId[id]).filter(Boolean);
  }
};

function slugify(str) {
  return str.toString().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
function uid(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,6)}`;
}

/* =========================================================
   NORMALIZAÇÃO DE LINKS DE IMAGEM
   ---------------------------------------------------------
   O Google Drive entrega links de compartilhamento comuns
   (drive.google.com/file/d/ID/view) que NÃO funcionam como
   imagem direta. Esta função detecta esse formato e converte
   automaticamente para o formato que funciona como imagem.
   ========================================================= */
function normalizeImageUrl(url) {
  const u = url.trim();

  let m = u.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (m) return `https://drive.google.com/thumbnail?id=${m[1]}&sz=w1000`;

  m = u.match(/drive\.google\.com\/.*[?&]id=([a-zA-Z0-9_-]+)/);
  if (m) return `https://drive.google.com/thumbnail?id=${m[1]}&sz=w1000`;

  return u;
}
