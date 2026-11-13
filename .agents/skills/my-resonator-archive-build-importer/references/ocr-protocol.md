# Protocolo de leitura confiável

- Visualize a imagem inteira e depois faça crops de nome, cabeçalho, Eco/arma, custos, stats e rodapé.
- Registre o texto exatamente como visto antes de normalizar.
- Para números, confirme pelo menos duas vezes e preserve `%`, casas decimais, sinal e unidade.
- Diferencie `0`, `O`, `1`, `I`, `5`, `S`, `8`, `B`, hífen e separadores.
- Não inferir o valor de uma barra, ícone ou cor sem texto legível.
- Marque `low` quando houver compressão, corte, sobreposição, idioma não reconhecido ou símbolo ambíguo.
- Se duas leituras plausíveis permanecerem, não escolha uma: registre conflito e peça confirmação.
- A ausência de um campo na imagem significa “não observado”, não “zero”, “padrão” ou “não equipado”.
