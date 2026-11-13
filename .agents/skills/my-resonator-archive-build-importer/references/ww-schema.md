# Esquema atualmente observado em `ww`

Use esta referência somente quando o alvo for o projeto `C:\Users\Klayton\Documents\Repositorios\ww`; confirme o código novamente antes de persistir.

- Catálogo/meta: `src/data/characters.js`, uma constante `characters` com objetos identificados por `name`.
- Campos de catálogo observados: `name`, `element`, `role`, `level`, `rank`, `image`, `buildImage`, `goal`, `buildName`, `weapon`, `echoSet`, `mainEcho`, `mainStats`, `substats`, `stats`, `echoes` e, em alguns casos, `accountBuildOverride`.
- Build real importada: `assets/images/builds/account.json`, um array de registros. A correspondência usada pelo código é `build.character.name`; não crie uma nova chave numérica sem evidência.
- Estrutura real observada: `character.stats`, `weapon`, `echoes`; cada Eco usa `name`, `level`, `cost`, `sonata`, `mainStatType`, `mainStatValue` e `substats` (`type`, `value`).
- A interface lê o JSON por `src/js/common.js` (`loadAccountBuilds`/`getAccountBuildForCharacter`) e combina overrides definidos em `characters.js`.

Ao cadastrar um personagem novo, atualize somente os dados que o usuário confirmou. Para recomendações, use os campos de `characters.js`; para estado real, use `account.json` e/ou `accountBuildOverride` conforme o padrão já existente. Preserve os nomes de stats utilizados pelo projeto, incluindo diferenças como `Crit DMG` no catálogo e `Crit. DMG` no JSON real.

Antes de editar, confirme se `characters.js` usa exportação/consumo compatível com a página e se `account.json` continua sendo a fonte carregada em runtime. Depois, valide sintaxe JavaScript/JSON e abra as páginas de builds para verificar a leitura.
