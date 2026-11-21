---
name: wuthering-chibi-icons
description: Pesquisar o visual oficial de um personagem de Wuthering Waves, documentar identidade e produzir exatamente duas opções de ícone chibi 1:1 com as sete referências fixas, validar e aprovar apenas após conferência visual. Usar para ícones/avatares de personagens do My Resonator Archive, não para builds ou equipes.
---

# Wuthering Chibi Icons — operacional (v2)

Esta skill aplica o **padrão das sete imagens fornecidas pelo usuário**, salva duas imagens separadas por personagem e impede aprovações antes da revisão. Leia `references/style-guide.md` e `references/character-research.md` quando precisar de detalhes. Scripts em `scripts/chibi.py`; instalação em `INSTALL.md`.

## Regras essenciais

- **Primeiro identidade, depois imagem**: pesquise **pelo menos duas referências visuais independentes** (preferencialmente oficial + modelo no jogo). Confira nome exato, variante/skin, penteado, comprimento E volume, olhos, roupas e acessórios. Registre URLs consultadas e `what_was_verified` no JSON. Não invente fontes nem detalhes; copie ao menos uma imagem verificável de identidade para o workspace, respeitando direitos de uso e fontes. Imagens do repositório do usuário podem servir como referência inicial, mas também verifique outra fonte.
- **Estilo imutável**: inspecione as 7 imagens `assets/style-references/reference-01.png` até `reference-07.png` para estilo, não para identidade. 1:1 1024px, busto, cabeça muito grande, olhos ovais verticais sem detalhes internos, blush rosa, sem boca e nariz, fundo off-white, cel shading suave e sem contornos grossos.
- **Fidelidade**: preservar os traços reais do personagem. Não inventar orelhas, chifres, coroa, halo, dragão, roupa, arma ou joia. Jinhsi: cabelo longo porém volume lateral contido; remover grande dragão/halo não existente. Personagens de nome parecido não são intercambiáveis.
- **Saída**: opção A = máxima fidelidade, quase frontal; opção B = variação leve de pose/ângulo, **mesmo visual canônico**, sem recolor ou figurino alternativo. Arquivos independentes `<slug>-opcao-a.png` e `<slug>-opcao-b.png`.
- **Separação de fontes**: ferramentas de geração devem receber imagens do personagem como IDENTITY e as sete como STYLE ONLY; o prompt pronto explicita essa ordem. Nunca use uma imagem chibi de outro personagem como identidade.
- **Não inventar conclusão**: não marcar `approved` sem verificar as duas imagens visualmente. Não substituir imagens existentes sem solicitação. Nunca usar SVG de placeholder ou imagem aleatória como produto final.

## Sequência obrigatória por personagem

1. Crie um workspace com `python .agents/skills/wuthering-chibi-icons/scripts/chibi.py init "NOME" --workspace outputs/chibi` (ou use `batch-init` para preparar o manifesto dos personagens).
2. Pesquise via navegação/consulta de imagens disponível ao agente. Confira pelo menos duas **fontes realmente visitadas**. Preencha `outputs/chibi/<slug>/character.json` com `sources` (`url`/`file`, `what_was_verified`) e detalhes visuais observados em `identity`. Acrescente em `identity_images` caminhos de imagens locais baixadas/fornecidas, como `refs/model.png` (caminhos relativos ao JSON). Se uma fonte não fornecer imagem analisável, não a conte como verificação visual. Preencha `must_not_add`, inclusive adereços que não existem no design, e `user_corrections`.
3. Rode `python .agents/skills/wuthering-chibi-icons/scripts/chibi.py check-research --spec outputs/chibi/<slug>/character.json`. Falhas interrompem o fluxo. O validador confere estrutura e arquivos, **não** atesta veracidade da pesquisa — confira-a manualmente.
4. Rode `python .agents/skills/wuthering-chibi-icons/scripts/chibi.py prompts --spec ...` para gerar um prompt A e B com as restrições exatas.
5. **Gerar imagens**:
   - Se o ambiente Codex tiver um gerador de imagens nativo: gere cada prompt separadamente, passando a(s) imagem(ns) de IDENTIDADE e as sete imagens de ESTILO. Salve os dois PNGs em caminhos esperados.
   - Se não tiver: use a integração real com a API de imagens `python .../chibi.py generate --spec ...`, com `OPENAI_API_KEY` configurado e dependências `pip install -r .../requirements.txt`. O programa chama `client.images.edit` duas vezes, em sequência, cada vez com IDENTITY + sete STYLE, e salva PNGs distintos. O modelo padrão é `gpt-image-1.5`, podendo ser configurado. **Não simule geração se API/ferramenta estiver ausente**; declare bloqueio e preserve a pesquisa/prompts prontos.
6. Rode `python .../chibi.py verify --spec ...`: confere PNG, dimensões, presença e que A/B não são exatamente iguais. Verifique **manualmente** fidelidade e estilo contra todas as fontes e corrija/regere se precisar.
7. Após revisar ambas as opções, execute `python .../chibi.py approve --spec ... --reviewer "SEU_NOME" --confirm-visual`; isso só marca o trabalho como `approved` após confirmação explícita. Entregue ambos com links e resumo das diferenças.

## Lotes para My Resonator Archive

- Nunca presuma lista fixa de personagens. Primeiro confira o arquivo de cadastro do repositório; se fornecido um `batch-manifest.json`, confira-o e inicialize com `python .../chibi.py batch-init --manifest CAMINHO --workspace outputs/chibi`.
- Para cada personagem, execute pesquisa e geração separadas. Não reutilize automaticamente imagem do personagem anterior. Não marque os nomes como concluídos só porque há PNGs; exigir validação visual.
- Não edite o site nem substitua ícones existentes até o usuário aprovar. Gere as duas opções primeiro.

## Falhas e bloqueios

- Sem acesso a referências confiáveis? Documente a limitação, não fabrique identidade.
- Sem gerador/API? Entregue prompts e documentação da pesquisa, com status pendente.
- API pode falhar parcialmente entre A e B. Relate os arquivos criados; não marque como concluído automaticamente. Evite sobrescrever imagens já existentes.
- A ferramenta de validação é técnica; não avalia se o personagem está correto. A etapa visual é obrigatória.
