# Descoberta do esquema e persistência

Antes de mapear qualquer imagem, procure nesta ordem:

1. `AGENTS.md`, `README`, `package.json`/equivalentes e documentação do projeto.
2. Tipos, schemas, migrações, modelos, fixtures e dados existentes.
3. Rotas/API, stores, hooks, loaders e comandos usados pela interface.
4. Testes que criam ou atualizam personagens.

Produza uma ficha interna com:

- fonte de verdade e caminho de persistência;
- chave estável do personagem e regra de resolução de aliases;
- formato de recomendações/meta;
- formato da build real equipada;
- representação de Eco, custo, arma, conjunto, main stats, substats, função e energia;
- campos obrigatórios, enums, defaults e relações;
- comando de validação/teste e limitações observadas.

Se houver conflito entre documentação e código executado, prefira o caminho usado pela aplicação e registre a divergência. Se não houver esquema identificável, pare antes da mutação. Não crie um modelo paralelo “temporário” como substituto do domínio real.

O registro intermediário recomendado é:

```json
{
  "characterKey": "stable-id-or-null",
  "displayNameObserved": "...",
  "sources": {
    "recommendations": {"path": "...", "sha256": "..."},
    "actualBuild": {"path": "...", "sha256": "..."}
  },
  "recommended": {},
  "actual": {},
  "unreadable": [],
  "conflicts": [],
  "confirmed": false
}
```

Esse envelope é apenas uma etapa de validação; adapte-o ao esquema real somente depois da descoberta.
