# Configurando o banco de dados (Firebase) — passo a passo único

Este é o passo mais importante do projeto: sem isso, o site não funciona,
porque `js/data.js` está programado para usar um banco de dados que ainda
não existe (os dados de exemplo dentro dele são só um placeholder).

Leva uns 10 minutos, é 100% gratuito, e só precisa ser feito **uma vez**.

---

## 1. Crie o projeto no Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
   e entre com sua conta Google (a mesma do Gmail/Drive já serve).
2. Clique em **"Criar projeto"** (ou "Add project").
3. Dê um nome, por exemplo `fotoalbum-mps`. Pode desativar o Google
   Analytics (não é necessário para este projeto) — clique em "Criar projeto".

## 2. Ative o Firestore Database

1. No menu à esquerda do console, clique em **"Firestore Database"**
   (ou "Build → Firestore Database").
2. Clique em **"Criar banco de dados"**.
3. Escolha o modo **"Produção"** (production mode).
4. Escolha uma localização (qualquer uma próxima, ex: `southamerica-east1`
   se disponível, ou a sugerida). Clique em **"Ativar"**.

## 3. Configure as regras de segurança

1. Dentro do Firestore, clique na aba **"Regras"** (Rules).
2. Apague o conteúdo e cole exatamente isto:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /galerias/{galeriaId} {
      allow read, write: if true;
    }
    match /fotos/{fotoId} {
      allow read, write: if true;
    }
  }
}
```

3. Clique em **"Publicar"** (Publish).

> **Nota sobre segurança:** essas regras permitem que qualquer pessoa com
> o link do site leia e escreva nos dados — é o equivalente ao que já
> acontecia com o localStorage, só que agora compartilhado entre
> aparelhos. Isso é aceitável para o estágio atual do projeto (proteção
> por senha de cada galeria, painel admin com login). Se no futuro
> quiser reforçar a segurança (ex: impedir que alguém de fora crie
> galerias falsas), é possível evoluir essas regras — me avise quando
> chegar nesse ponto.

## 4. Pegue as credenciais do projeto (firebaseConfig)

1. No console, clique na engrenagem ⚙️ ao lado de "Visão geral do projeto"
   → **"Configurações do projeto"**.
2. Role até **"Seus apps"** e clique no ícone **`</>`** (Web) para criar
   um app da Web.
3. Dê um apelido (ex: `fotoalbum-site`) e clique em **"Registrar app"**.
4. Vai aparecer um bloco de código com um objeto `firebaseConfig` parecido
   com isto:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "fotoalbum-mps.firebaseapp.com",
  projectId: "fotoalbum-mps",
  storageBucket: "fotoalbum-mps.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

5. Copie esses 6 valores.

## 5. Cole as credenciais no projeto

1. Abra `js/data.js` no GitHub (ícone de lápis para editar).
2. Encontre o bloco `FIREBASE_CONFIG` no topo do arquivo.
3. Substitua os valores de exemplo pelos que você copiou no passo 4,
   mantendo as aspas:

```js
const FIREBASE_CONFIG = {
  apiKey: "AIzaSy...",              // <- cole o seu aqui
  authDomain: "fotoalbum-mps.firebaseapp.com",
  projectId: "fotoalbum-mps",
  storageBucket: "fotoalbum-mps.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

4. Clique em **"Commit changes"** para salvar.

## 6. Pronto — teste

1. Espere a Vercel republicar (1-2 minutos).
2. Acesse o site publicado e entre no painel admin.
3. Cadastre uma galeria de teste.
4. Abra o link da galeria em **outro aparelho** (ex: seu celular, se
   cadastrou pelo computador) — ela deve aparecer normalmente agora,
   porque os dados vêm do Firebase, não mais do navegador.

---

## Por que a chave (apiKey) pode ficar no código, diferente da senha do Drive?

Isso é uma dúvida comum: dissemos antes para nunca colocar chaves de API
no código do frontend (caso do Google Drive), mas aqui a `apiKey` do
Firebase **é diferente** — ela foi projetada pela Google para ficar
pública em apps do tipo "Web", pois não dá, sozinha, acesso de escrita
irrestrito aos dados. Quem controla o que pode ou não ser lido/escrito
são as **regras do Firestore** (passo 3 acima), não o segredo da chave.
Por isso o modelo de segurança aqui é diferente do modelo usado para a
API do Google Drive.
