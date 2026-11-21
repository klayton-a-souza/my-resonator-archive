# Instalação no Codex (Windows/macOS/Linux)

Esta skill é uma pasta de instruções e scripts. Não existe instalação remota automática a partir do ChatGPT.

1. Extraia o ZIP. Para instalar no repositório `my-resonator-archive`, use um terminal aberto na pasta em que extraiu o ZIP:

   ```powershell
   python wuthering-chibi-icons/scripts/chibi.py install --project CAMINHO_PARA_MEUREPOSITORIO
   ```

   Isso copia a skill para `CAMINHO_PARA_MEUREPOSITORIO/.agents/skills/wuthering-chibi-icons/` sem alterar o site.

2. No Codex, abra o repositório e digite `$wuthering-chibi-icons` seguido do nome do personagem. Verifique com `/skills` se foi reconhecida.

3. O Codex pesquisa as imagens oficiais, documenta pelo menos duas fontes e salva cópias locais do modelo/arte para geração.

4. Se o Codex não tiver gerador de imagens nativo, use a integração opcional da API. Em um terminal do projeto:

   ```powershell
   pip install -r .agents/skills/wuthering-chibi-icons/requirements.txt
   $env:OPENAI_API_KEY = 'SUA_CHAVE'  # configure localmente; nunca comite a chave
   python .agents/skills/wuthering-chibi-icons/scripts/chibi.py generate --spec outputs/chibi/jinhsi/character.json
   ```

   **A API de imagens pode gerar custos separados da assinatura do ChatGPT.** A chave e o acesso à rede são requisitos dessa alternativa. A criação pela API não funciona sem eles.

Se a API falhar depois de criar A, execute o mesmo comando `generate` adicionando `--resume` para continuar com B sem substituir A.

5. Depois de inspecionar as duas versões, execute `verify` e, se estiverem realmente corretas, `approve --confirm-visual`.

Para testar o empacotamento sem API, execute `python -m unittest discover -s wuthering-chibi-icons/tests -v` a partir da pasta que contém a skill.

## Preparar todos os personagens

O arquivo `examples/my-resonator-archive-roster-2026-11-20.json` é um **snapshot histórico**, não uma fonte automaticamente atualizada. Confirme os personagens cadastrados atualmente em `src/data/characters.js` antes de executar um lote:

```powershell
python .agents/skills/wuthering-chibi-icons/scripts/chibi.py batch-init --manifest .agents/skills/wuthering-chibi-icons/examples/my-resonator-archive-roster-2026-11-20.json --workspace outputs/chibi
```

Esse comando cria fichas de pesquisa para os personagens, **não** gera imagens e não aprova arquivos anteriores automaticamente.
