# Portfólio — Dieni Kielermann

Front-end em Vue 3 com design system próprio, dashboard de cadastro, mapa de polígonos/GeoJSON, comparador WKT e mapa de chuva interpolada com relatório em PDF.

**Site:** [https://dienik.github.io/meu-portifolio](https://dienik.github.io/meu-portifolio)

O roteamento usa hash (`#/`), então as telas no GitHub Pages ficam:

| Tela | URL |
| --- | --- |
| Início | https://dienik.github.io/meu-portifolio/#/ |
| Design System | https://dienik.github.io/meu-portifolio/#/projects |
| Dashboard de cadastro | https://dienik.github.io/meu-portifolio/#/dashboard |
| Mapa de polígonos | https://dienik.github.io/meu-portifolio/#/mapa |
| Comparador WKT | https://dienik.github.io/meu-portifolio/#/comparar |
| Chuva interpolada | https://dienik.github.io/meu-portifolio/#/chuva |
| RAG do portfólio | https://dienik.github.io/meu-portifolio/#/rag |

## Stack

- **Vue 3** + **TypeScript** + **Vite**
- **Vue Router** (hash history, compatível com GitHub Pages)
- **Leaflet** + tiles do **OpenStreetMap**
- **Open-Meteo** (chuva atual e histórica, sem chave de API)
- RAG local (BM25 + embeddings + RRF, sem API de modelo)
- **html2canvas** + **jsPDF** (exportação do relatório)
- Tokens e componentes em `src/styles/tokens.css` e `src/components/ui/`

## O que foi feito

### Design system

Tokens de cor, tipo, espaço e raio. Componentes reutilizáveis (`DsButton`, `DsInput`, `DsSelect`, `DsCard`, `DsModal`, `DsTable`, `DsBadge`, `DsToggle`, `DsTooltip`, `DsAccordion`, `DsToast`). A página **Design System** mostra a paleta e o playground dos blocos.

### Dashboard de cadastro

CRUD de profissionais no navegador (`localStorage`): busca, filtros, formulário, badges de status e confirmação de exclusão. Serve como caso de uso do design system.

### Mapa de polígonos

Tela para **desenhar** polígonos/multipolígonos no Leaflet ou **inserir coordenadas** (lat/lng, cola de lista, GeoJSON). As features são plotadas no mapa, podem ser unidas, importadas e exportadas em GeoJSON. Persistência em `localStorage`.

### Mapa de chuva interpolada + PDF

Consulta pública da Open-Meteo numa **grade de pontos** do recorte visível. Os milímetros são interpolados por **IDW** (inverso da distância) e viram uma imagem sobre o mapa.

O mapa não é uma foto só: o Leaflet empilha **layers** (folhas transparentes), de baixo para cima:

1. **Ruas** — mosaico de tiles do OpenStreetMap (CSS invertido para o tema escuro)
2. **Chuva** — canvas interpolado publicado como `imageOverlay`
3. **Pontos da grade** — círculos com o valor de cada coordenada da API
4. **Área** — retângulo desenhado pelo usuário para o relatório

Dá para escolher **início e fim** (até 14 dias, inclusive histórico), arrastar uma área e **exportar PDF** com média diária, acumulado, dia mais chuvoso/seco e gráficos de barras e linha.

Arquivos principais: `src/lib/rain.ts`, `src/lib/rainCharts.ts`, `src/lib/rainPdf.ts`, `src/components/map/RainMapStudio.vue`, `src/components/map/RainMapCanvas.vue`.

### Comparador WKT

Cole duas geometrias em WKT, veja no mapa e calcule interseção, união ou diferença com `polygon-clipping`.

### RAG do portfólio

A tela `/rag` responde perguntas sobre os projetos **sem LLM e sem API key**.

Como foi feito:

1. **Corpus** — documentos curtos em `src/lib/agent/corpus.ts` (um assunto por `id`).
2. **Tokenize** — minúscula, sem acento, sem stopwords (`tokenize.ts`).
3. **BM25** — ranking por palavra em comum; termo raro pesa mais.
4. **Embedding + cosseno** — vetor 256d por *hashing trick*; textos parecidos sobem juntos.
5. **RRF** — funde as duas listas por posição: `1 / (60 + rank)`.
6. **Resposta** — o 1º hit vira o texto da resposta, com citações `[1] [2]`.

Arquivos: `src/lib/agent/` (`corpus.ts`, `tokenize.ts`, `retrieve.ts`, `answer.ts`), `src/components/agent/RetrieveStudio.vue`.

## Como rodar localmente

```bash
npm install
npm run dev
```

O Vite sobe em `http://127.0.0.1:5173/` (`base: '/'` em desenvolvimento). Em produção o `base` é `/meu-portifolio/`.

## Deploy (GitHub Pages)

```bash
npm run deploy
```

Isso gera `dist/` e publica o branch `gh-pages`. No repositório: **Settings → Pages → Deploy from branch `gh-pages`.**

## Estrutura

```
src/
  components/ui/           # design system
  components/dashboard/    # cadastro
  components/map/          # polígonos, WKT e chuva
  components/agent/        # tela do RAG
  components/playground/   # demos dos componentes
  lib/agent/               # corpus, tokenize, BM25, RRF
  lib/geo.ts               # GeoJSON, polígonos
  lib/rain.ts              # Open-Meteo, grade, IDW
  lib/rainCharts.ts        # gráficos do relatório
  lib/rainPdf.ts           # exportação PDF
  stores/                  # cadastros e features do mapa
  styles/tokens.css        # tokens visuais
```

Fonte de chuva: [Open-Meteo](https://open-meteo.com/) (CC BY 4.0). Mapas: © OpenStreetMap.
