# Teste de aceitação: Hsin

O fixture contém duas imagens reais anexadas na conversa de referência:

- `fixtures/hsin/recommendations.png`: infográfico de recomendações/meta.
- `fixtures/hsin/real-build.png`: screenshot da build equipada.

O teste é executado pela skill no repositório consumidor. Ele deve descobrir o esquema local antes de persistir e deve falhar com segurança quando o esquema não existir.

Critérios mínimos:

- não misturar os dois papéis das imagens;
- não inventar texto ilegível;
- separar `recommended` de `actual`;
- confirmar divergências antes de substituir dados;
- repetir a importação sem duplicação;
- validar a leitura pós-escrita conforme o esquema real.
