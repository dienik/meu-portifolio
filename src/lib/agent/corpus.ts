import type { CorpusDoc } from './types'

export const CORPUS: CorpusDoc[] = [
  {
    id: 'rag-build',
    title: 'Como esse RAG foi construído',
    source: '/rag',
    text: 'Esse RAG foi construído no próprio navegador, sem LLM e sem API key. O fluxo é: 1) Corpus — textos curtos em src/lib/agent/corpus.ts, um assunto por documento (design system, dashboard, layers, contato, o próprio RAG). 2) Tokenize — minúscula, sem acento, sem stopwords. 3) BM25 — ranking por palavra em comum; termo raro pesa mais. 4) Embedding + cosseno — vetor 256 dimensões por hashing trick; textos parecidos sobem juntos. 5) RRF — funde as duas listas por posição, 1 / (60 + rank). 6) Resposta — o trecho mais bem ranqueado vira o texto, com fontes. Além de recuperar, a tela /rag executa uma ação: gerar PDF de chuva pela Open-Meteo.',
  },
  {
    id: 'rag-actions',
    title: 'O RAG pode executar ações',
    source: '/rag',
    text: 'Sim: esse RAG executa uma ação do portfólio, gerar PDF de chuva. Se você pedir para gerar, criar, baixar ou exportar um PDF de chuva, ele consulta a Open-Meteo e dispara o download. Dá para dizer cidade, ontem/hoje e o intervalo de horas. Exemplo: gere um PDF de chuva em Porto Alegre ontem das 15h às 17h. Não é um agente genérico — fora dessa ação, ele só responde o que está no corpus.',
  },
  {
    id: 'about-author',
    title: 'Quem desenvolveu o portfólio e LinkedIn',
    source: '/',
    text: 'Este portfólio foi desenvolvido por Dieni Kielermann da Silva, desenvolvedora front-end. Ela trabalha com Vue.js, JavaScript, TypeScript, HTML, CSS, Node.js, Angular e APIs REST, com foco em usabilidade, performance, Clean Code e CI/CD. O contato profissional é o LinkedIn: https://www.linkedin.com/in/dieni-kielermann-da-silva-abb06120a/ . GitHub: https://github.com/dienik/dienik . Site publicado: https://dienik.github.io/meu-portifolio .',
  },
  {
    id: 'design-system',
    title: 'O que é o Design System',
    source: '/projects',
    text: 'O Design System deste portfólio é a biblioteca viva da interface: uma linguagem visual compartilhada para não reinventar botão, input ou modal em cada tela. Os tokens de cor, tipografia, espaço e raio ficam em src/styles/tokens.css. Cores principais: primary #818cf8, accent #22d3ee, success #34d399, warning #fbbf24, danger #f87171 e surface #151b36. Texto em Plus Jakarta Sans e código em IBM Plex Mono. Os componentes reutilizáveis estão em src/components/ui: DsButton, DsInput, DsSelect, DsCard, DsModal, DsTable, DsBadge, DsToggle, DsTooltip, DsAccordion e DsToast. A página /projects mostra a paleta, o playground e os estados de cada bloco. O dashboard de cadastro é o caso de uso real do mesmo sistema.',
  },
  {
    id: 'dash-crud',
    title: 'Como o dashboard de cadastro funciona',
    source: '/dashboard',
    text: 'O dashboard em /dashboard é um CRUD de profissionais no navegador e o caso de uso do Design System. Dá para criar, editar e excluir cadastros. Campos do formulário: nome, e-mail, telefone, cargo (Front-end, Back-end, Full-stack, UX/UI, QA), stack (Vue.js, React, Angular, TypeScript, Node.js, HTML/CSS, REST APIs, CI/CD), status (ativo, pendente, inativo), bio e alerta de atualizações. A tabela busca por nome, e-mail ou cargo e filtra por status e cargo. Os cards do topo mostram total, ativos, pendentes e inativos. Os dados ficam no localStorage (chave meu-portfolio:registrations), sem backend. Excluir pede confirmação no modal; um toast confirma criar, editar ou apagar.',
  },
  {
    id: 'geo-layer',
    title: 'O que é uma layer',
    source: '/mapa',
    text: 'Layer (camada) é o conceito central de um GIS (Geographic Information System, sistema de informação geográfica). O GIS trata o território como dados: cada tema vira uma layer — ruas, hidrografia, uso do solo, chuva, um polígono de área. A layer não é a foto do mapa: é uma folha transparente com um tema só, alinhada nas mesmas coordenadas. Empilhar layers é o que permite ligar ou desligar informação sem redesenhar o mundo. No Leaflet deste portfólio isso aparece na prática: tile de ruas embaixo, GeoJSON ou imagem de chuva no meio, pontos e o retângulo por cima.',
  },
  {
    id: 'geo-layer-build',
    title: 'Como as camadas são construídas no mapa',
    source: '/chuva',
    text: 'A construção de camadas no Leaflet é empilhar folhas transparentes na mesma projeção. Primeiro cria-se o mapa; depois cada layer entra com addTo, de baixo para cima. No mapa de chuva a ordem é: 1) tile layer do OpenStreetMap (ruas); 2) image overlay da chuva interpolada por IDW; 3) layer group dos pontos da grade da Open-Meteo; 4) rectangle da área do relatório. No mapa de polígonos: tile de ruas, layer group das features GeoJSON e layer group do rascunho enquanto se desenha. Ligar ou desligar uma camada não redesenha as outras. Isso é GIS na prática: um tema por camada, coordenadas alinhadas.',
  },
  {
    id: 'geo-layer-types',
    title: 'Tipos de layers neste portfólio',
    source: '/mapa',
    text: 'Tipos de layer usados aqui: tile layer (mosaico de ruas do OpenStreetMap), GeoJSON layer (polígonos desenhados), image overlay (chuva interpolada), layer group de pontos (grade da API) e rectangle (área do relatório). Cada tipo desenha um tema; o mapa final é a pilha dessas camadas.',
  },
  {
    id: 'rain-layers',
    title: 'Layers do mapa de chuva',
    source: '/chuva',
    text: 'No mapa de chuva o Leaflet empilha layers: ruas OSM embaixo, imagem interpolada da chuva, pontos da grade com o valor da API e o retângulo da área por cima.',
  },
  {
    id: 'rain-idw',
    title: 'Interpolação IDW',
    source: '/chuva',
    text: 'A Open-Meteo devolve chuva numa grade de pontos. IDW interpola os milímetros entre os pontos e vira uma imagem sobre o mapa.',
  },
  {
    id: 'wkt-ops',
    title: 'Comparador WKT',
    source: '/comparar',
    text: 'No comparador você cola duas geometrias WKT e calcula interseção, união ou diferença. O resultado é plotado no mapa.',
  },
  {
    id: 'map-geojson',
    title: 'Mapa de polígonos GeoJSON',
    source: '/mapa',
    text: 'Na tela /mapa dá para desenhar polígonos e multipolígonos no Leaflet, colar coordenadas lat/lng e importar ou exportar GeoJSON.',
  },
  {
    id: 'geo-geometry',
    title: 'Tipos de geometria',
    source: '/mapa',
    text: 'Geometria é a forma no mapa. As mais comuns: Point (um par lat/lng), LineString (linha), Polygon (área fechada) e MultiPolygon (várias áreas numa feature). Este portfólio trabalha Polygon e MultiPolygon.',
  },
  {
    id: 'geo-polygon',
    title: 'Polígono',
    source: '/mapa',
    text: 'Polígono é uma área fechada: um anel de coordenadas lat/lng em que o último ponto repete o primeiro. No Leaflet você desenha clicando vértices. Em GeoJSON o type é Polygon.',
  },
  {
    id: 'geo-multipolygon',
    title: 'Multipolígono',
    source: '/mapa',
    text: 'MultiPolygon junta vários polígonos numa só feature, por exemplo ilhas ou polígonos unidos. No mapa do portfólio dá para desenhar multi e unir polígonos existentes num MultiPolygon.',
  },
  {
    id: 'geo-wkt',
    title: 'O que é WKT',
    source: '/comparar',
    text: 'WKT (Well-Known Text) é um texto que descreve geometria. Exemplos: POINT(-51.2 -30.0), POLYGON((...)), MULTIPOLYGON(((...))). A tela /comparar lê dois WKTs e calcula operação espacial.',
  },
  {
    id: 'geo-geojson',
    title: 'O que é GeoJSON',
    source: '/mapa',
    text: 'GeoJSON é JSON de geometria e features. Um Feature tem type, geometry (Point, Polygon, MultiPolygon) e properties. O portfólio importa e exporta FeatureCollection de polígonos.',
  },
]
