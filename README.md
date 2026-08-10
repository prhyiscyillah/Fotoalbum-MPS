# FotoAlbum — Galeria de seleção de fotos para clientes

Site para a fotógrafa entregar ensaios e a cliente selecionar suas fotos favoritas.
Feito em **HTML, CSS e JavaScript puro** — sem build, sem framework, sem custo.

Os dados (galerias, senhas, seleções e fotos) ficam salvos no
**Firebase Firestore**, um banco de dados gratuito na nuvem — qualquer
aparelho (seu celular, seu computador, o celular da cliente) enxerga os
mesmos dados. **Antes de usar o site, é obrigatório configurar o Firebase
uma única vez — veja `FIREBASE_SETUP.md`.** Sem isso, o site não funciona.

Está preparado para, no futuro, buscar as fotos direto do **Google Drive**
automaticamente, sem precisar refazer as telas (ver seção 10).

---

## 1. Estrutura do projeto

```
fotoalbum/
├── index.html              → tela de acesso da cliente (login da galeria)
├── galeria.html             → galeria da cliente (grade + seleção + lightbox)
├── admin/
│   ├── login.html           → login da área administrativa
│   ├── dashboard.html       → visão geral (estatísticas)
│   ├── galerias.html        → cadastrar/editar/ver galerias
│   └── selecoes.html        → ver as seleções enviadas pelas clientes
├── css/
│   └── style.css            → todo o visual do site (cores, tipografia, layout)
├── js/
│   ├── data.js               → CAMADA DE DADOS (fotos, galerias, config geral)
│   ├── app.js                 → lógica da galeria da cliente
│   └── admin.js                → funções compartilhadas do painel admin
└── data/
    └── photos.example.json  → exemplo do formato de foto para o futuro Google Drive
```

---

## 2. Como executar localmente

Como o site é só HTML/CSS/JS, não precisa instalar nada. Duas formas:

**Opção simples:** dê duplo clique em `index.html` para abrir no navegador.
(Funciona, mas alguns navegadores restringem certos recursos ao abrir arquivo local.)

**Opção recomendada:** rode um servidor local simples.

Se tiver Python instalado:
```bash
cd fotoalbum
python3 -m http.server 8000
```
Depois acesse `http://localhost:8000` no navegador.

Se tiver Node.js instalado, também funciona com:
```bash
npx serve fotoalbum
```

---

## 3. Como testar

- Acesse `index.html` → escolha uma galeria de exemplo → use a senha mostrada
  no painel administrativo (veja abaixo) para entrar.
- Na galeria, clique nas fotos para ampliar, use o coração ❤️ para selecionar,
  e o botão **"Enviar minha seleção"** no rodapé.
- Acesse `admin/login.html` com usuário `admin` e senha `admin123` para entrar
  no painel administrativo e ver clientes, galerias e seleções recebidas.

> A senha do admin (`admin123`) é só para esta demonstração. Numa versão em
> produção, a autenticação deve ser feita por um serviço de backend seguro,
> nunca comparando senhas em texto puro dentro do JavaScript do site.

---

## 4. Como colocar no GitHub

1. Crie um repositório novo no [github.com](https://github.com) (ex: `fotoalbum-cliente`).
2. No computador, dentro da pasta `fotoalbum`, rode:
```bash
git init
git add .
git commit -m "primeira versão do site de galerias"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/fotoalbum-cliente.git
git push -u origin main
```

---

## 5. Como publicar gratuitamente

**Opção A — Vercel (recomendada):**
1. Crie uma conta grátis em [vercel.com](https://vercel.com) com seu GitHub.
2. Clique em "Add New Project" e selecione o repositório que você criou.
3. Como é um site estático, não precisa configurar nada — clique em "Deploy".
4. Em poucos segundos você recebe um link público, tipo `fotoalbum-cliente.vercel.app`.

**Opção B — GitHub Pages (também grátis):**
1. No repositório do GitHub, vá em **Settings → Pages**.
2. Em "Branch", selecione `main` e a pasta `/root`, depois "Save".
3. Em alguns minutos o site fica disponível em
   `https://SEU-USUARIO.github.io/fotoalbum-cliente/`.

---

## 6. Onde alterar o nome da fotógrafa

Abra `js/data.js` e edite o topo do arquivo:

```js
const STUDIO_CONFIG = {
  studioName: "Ana Duarte Fotografia",   // <-- troque aqui
  studioTagline: "ensaios & retratos",
  logoInitials: "AD",
  whatsappNumber: "5511999999999"        // número usado no botão do WhatsApp
};
```

Esse nome aparece automaticamente na tela de login da cliente e em todo o painel administrativo.

---

## 7. Onde alterar o logo

Hoje o site usa o nome do estúdio como "logo em texto" (elegante e leve, sem
depender de imagem). Para usar uma logo em imagem:

1. Coloque o arquivo da logo em `img/logo.png`.
2. Em `index.html` e `admin/login.html`, troque a linha:
   ```html
   <div class="studio-mark" id="studioMark">Ana Duarte Fotografia</div>
   ```
   por:
   ```html
   <img src="img/logo.png" alt="Logo do estúdio" style="max-width:140px; margin:0 auto 8px;">
   ```

---

## 8. Onde adicionar as fotos (pelo painel, sem editar código)

A forma recomendada é direto no painel administrativo, pelo celular ou
computador — sem precisar mexer em nenhum arquivo:

1. Vá em `admin/galerias.html` → crie ou edite a galeria da cliente.
2. Na seção **"Fotos do ensaio"**, cole um ou vários links de imagem no
   campo de texto (um por linha) e toque em **"+ Adicionar fotos"**.
3. Todas as fotos coladas aparecem já marcadas na grade abaixo (borda
   vinho). Se alguma não pertencer a este ensaio específico, toque nela
   para desmarcar.
4. Clique em **Salvar galeria**.

Cada link precisa ser um **link direto de imagem** (termina em `.jpg`,
`.png` etc — não é uma página de visualização). Fotos adicionadas ficam
disponíveis para reutilizar em outras galerias também, caso precise.

> O site ainda não consegue importar um álbum inteiro automaticamente
> (isso exigiria a integração real com a API do Google Drive, descrita
> mais abaixo) — por enquanto, é preciso ter o link de cada foto em mãos
> e colar todos de uma vez nessa caixa de texto.

### Onde hospedar as fotos para conseguir o link

**Opção recomendada — ImgBB (mais simples e confiável):**

1. Acesse [imgbb.com](https://imgbb.com) — não precisa criar conta.
2. Arraste as fotos do ensaio pra lá (dá pra selecionar várias de uma vez).
3. Depois do upload, copie o link **"Direct link"** de cada foto (não o
   "HTML" nem o "BBCode" — o Direct link é o que termina em `.jpg`/`.png`).
4. Cole todos no painel, um por linha.

**Alternativa — Google Drive (funciona, com uma ressalva):**

O painel converte automaticamente o link comum do Drive para o formato
que funciona como imagem — você não precisa mais montar o link manualmente:

1. No Drive, clique com o botão direito na foto → **Compartilhar** →
   mude o acesso geral para **"Qualquer pessoa com o link"** → copie o link.
2. Cole esse link normal (tipo `drive.google.com/file/d/.../view`) direto
   na caixa do painel — a conversão acontece sozinha ao adicionar.

O Google mudou as regras de link direto algumas vezes nos últimos anos, e
pode falhar em galerias com **muitas fotos ao mesmo tempo** (o Google
limita quantas imagens carrega de uma vez).

Se notar fotos que não carregam na galeria do Drive, é esse limite do
Google — nesse caso, migre para o ImgBB, que não tem esse problema.

### Alternativa avançada: editar direto no código

Se preferir (ou quiser adicionar várias fotos de uma vez), ainda é
possível editar `js/data.js` direto no GitHub. O bloco `PHOTOS_MOCK` usa
este formato:

```json
{ "id": "001", "nome": "IMG_0001.jpg", "url": "https://...", "numero": "001" }
```

Por padrão o projeto vem com **60 fotos de exemplo** usando o serviço
`picsum.photos`, só para teste da interface. O arquivo
`data/photos.example.json` mostra esse mesmo formato isoladamente.

---

## 9. Onde configurar o limite de fotos

O limite é definido **por galeria**, não é fixo no código, e **não tem teto**
— pode ser 10, 20, 50, 100, o número que fizer sentido pro ensaio. No painel:

`admin/galerias.html` → **Nova galeria** (ou editar uma existente) →
campo **"Quantidade de fotos que a cliente pode escolher"** → digite
qualquer valor.

Cada cliente pode ter um limite diferente (ex: 15 no ensaio de família, 30
na gestante). Só fique atento para que o limite não seja maior do que a
quantidade de fotos disponíveis naquela galeria.

### Vendendo fotos extras além do limite

A cliente não é mais bloqueada ao atingir o limite — ela pode continuar
selecionando fotos além do combinado. As fotos que passam do limite ficam
marcadas com uma etiqueta **EXTRA** na grade.

No cadastro da galeria (`admin/galerias.html`), há dois campos opcionais:

- **Valor do pacote base**: o valor fixo do ensaio (ex: R$ 100 pelas 20
  fotos inclusas).
- **Valor por foto extra**: quanto cobrar por cada foto além do limite
  (ex: R$ 5 por foto).

Se você preencher os dois, o site calcula o **total automaticamente**
(pacote + fotos extras × valor da extra) e mostra esse total tanto na tela
da cliente quanto na mensagem que abre no WhatsApp — ela já vê o valor
final antes de confirmar o envio. Deixe os campos em branco se preferir
combinar o valor manualmente com cada cliente.

---

## 10. Como futuramente conectar o Google Drive

Todo o site busca fotos através de um único ponto central, em `js/data.js`:

```js
const PhotoProvider = {
  getAllPhotos() { return PHOTOS_MOCK; },
  getPhotos(fotoIds) { ... }
};
```

Quando for integrar o Google Drive de verdade, o caminho recomendado é:

1. **Criar um backend simples** (ex: uma função serverless na Vercel) que:
   - Recebe o pedido do site.
   - Usa a **Google Drive API** com uma chave de serviço para listar os
     arquivos de uma pasta específica.
   - Devolve ao site apenas uma lista de fotos no mesmo formato já usado
     (`id`, `nome`, `url`, `numero`) — nunca a chave da API.
2. **Nunca colocar a chave/credencial do Google no código do frontend.**
   Ela deve existir somente no backend/serverless, como variável de ambiente.
3. Trocar o conteúdo de `PhotoProvider.getPhotos()` para chamar essa rota
   do backend (`fetch('/api/drive-photos?galleryId=...')`) em vez de ler
   `PHOTOS_MOCK`.
4. Como todas as telas (`galeria.html`, `admin/galerias.html`, etc.) já
   chamam apenas `PhotoProvider`, nenhuma outra parte do site precisa mudar.

Essa arquitetura é o motivo de existir a camada `PhotoProvider`: ela isola
"de onde vêm as fotos" do "como elas são exibidas".

---

## 11. Como a seleção chega até você (envio via WhatsApp)

Quando a cliente confirma o envio, o site monta automaticamente uma
mensagem com o nome dela, o ensaio e os números das fotos escolhidas, e
abre o WhatsApp já com essa mensagem pronta, direcionada ao **seu**
número. Ela só precisa apertar "Enviar" dentro do WhatsApp para concluir.

> Por que ela precisa apertar enviar? Nenhum site consegue mandar
> mensagens pelo WhatsApp de alguém automaticamente, sem a pessoa
> confirmar — isso é uma proteção do próprio WhatsApp contra spam. O site
> já deixa a mensagem 100% pronta, faltando só esse toque final.

**Configure seu número** em `js/data.js`:
```js
whatsappNumber: "5511999999999"   // 55 + DDD + número, só dígitos, sem espaço ou traço
```

Note que a seleção continua também sendo salva no navegador da cliente
(útil para o painel administrativo mostrar quando testado no mesmo
aparelho), mas o WhatsApp é o canal que garante que a mensagem chega até
você de verdade, em qualquer aparelho.

## 12. Proteção das fotos na etapa de seleção

Como esta galeria serve só para a cliente **escolher**, não para receber o
arquivo final, o site aplica algumas barreiras para desestimular o uso das
fotos de prova como se fossem o produto final:

- **Resolução reduzida**: as fotos mostradas na seleção são menores que o
  arquivo final (ajuste isso em `js/data.js`, ou no tamanho das imagens reais
  que você subir).
- **Marca d'água repetida**: aparece por cima da foto na grade e na
  visualização ampliada, com o nome do estúdio e "PROVA".
- **Bloqueio de clique-direito e arraste**: dificulta "salvar imagem como"
  e arrastar a foto para fora do navegador.

**Importante ser transparente:** nenhuma dessas medidas impede alguém de
tirar um print ou gravar a tela — isso é uma limitação de qualquer site,
não só deste. O objetivo aqui é apenas reduzir a qualidade e deixar claro
(pela marca d'água) que aquela imagem é só uma prova, tornando pouco
atrativo usá-la fora da plataforma. A entrega da foto final, sem marca
d'água e em alta resolução, deve continuar sendo feita depois, por outro
canal (Google Drive, WeTransfer, etc.).

## Observações importantes

- Os dados de galerias, fotos e seleções ficam no Firebase Firestore —
  veja `FIREBASE_SETUP.md` para configurar (obrigatório, uma vez só).
  O plano gratuito do Firebase aguenta de sobra o uso de um estúdio
  pequeno/médio.
- O site não usa nenhum recurso pago, banco de dados pago, sistema de
  pagamento ou anúncios, conforme solicitado.
- Todo o layout é responsivo: 2 fotos por linha no celular, e de 4 a 6 no
  computador, dependendo do tamanho da tela.
