# Wave Account Hub

Projeto pessoal para acompanhar progresso de conta, builds de personagens e
resultados de endgame em Wuthering Waves.

## Funcionalidades

- Dashboard com personagem em construcao, objetivo atual e favoritos.
- Acoes na pagina de build para definir foco atual, favoritos e checklist.
- Checklists persistidos no navegador para nivel, arma, talentos e ecos.
- Pagina individual de build por personagem.
- Destaque para CV total da build e CV individual dos ecos.
- Analise de build com CV, RV, Match e Build Score a partir de `account.json`.
- Biblioteca de builds com filtros por nome, elemento e funcao.
- Tracker de endgame para Tower of Adversity, Whimpering Wastes e Matriz.

## Estrutura

```text
assets/
  images/
    characters/
    builds/

index.html       Dashboard principal
pages/
  build.html     Pagina de build/personagem
  builds.html    Biblioteca de builds
  endgame.html   Tracker de endgame

src/
  data/          Dados de personagens e endgame
  js/            Renderizacao, storage e helpers
  css/           Design system e estilos por camada
```

## Tecnologias

- HTML5
- CSS3
- JavaScript Vanilla

## Uso

Abra `index.html` no navegador para acessar o dashboard.
