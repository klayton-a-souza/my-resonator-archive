#!/usr/bin/env python3
'''Prepare, generate and validate two faithful Wuthering Waves chibi options.

Optional generation needs `pip install openai pillow` and OPENAI_API_KEY.
Research is performed by Codex/agent: the CLI never pretends it can visually verify online sources.
'''
from __future__ import annotations
import argparse
import base64
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import sys
from datetime import datetime, timezone

SKILL_ROOT = Path(__file__).resolve().parents[1]
STYLE_DIR = SKILL_ROOT / "assets" / "style-references"
REQUIRED_IDENTITY = (
    "hair_color", "hair_length", "hair_volume", "hairstyle", "bangs", "eye_color", "outfit"
)
VARIANTS = ("a", "b")


def slugify(name: str) -> str:
    import unicodedata
    normalized = unicodedata.normalize("NFKD", name)
    base = ''.join(c for c in normalized if not unicodedata.combining(c))
    slug = re.sub(r'[^a-z0-9]+', '-', base.lower()).strip('-')
    if not slug:
        raise ValueError('Nome inválido para nome de pasta')
    return slug


def read_json(path: Path) -> dict:
    with path.open(encoding='utf-8') as handle:
        value = json.load(handle)
    if not isinstance(value, dict):
        raise ValueError('JSON deve conter um objeto')
    return value


def write_json(path: Path, value: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def init_character(name: str, workspace: Path, project_ref: str | None = None) -> Path:
    slug = slugify(name)
    target = (workspace / slug / 'character.json').resolve()
    if target.exists():
        raise FileExistsError(f'Já existe: {target}; edite o arquivo em vez de sobrescrever pesquisa')
    spec = {
       'character': name, 'game': 'Wuthering Waves', 'slug': slug,
       'outfit_version': 'traje original',
       'project_reference': project_ref or '',
       'sources': [],
       'identity_images': [],
       'identity': {k: '' for k in REQUIRED_IDENTITY} | {'accessories': [], 'unique_features': []},
       'must_not_add': (['grande halo/dragão dourado acima da cabeça'] if slug in ('jinhsi', 'jinshi') else []),
       'user_corrections': (['cabelo comprido, mas com volume lateral controlado; reduzir mechas laterais exageradas'] if slug in ('jinhsi', 'jinshi') else []),
       'review': {'option_a': False, 'option_b': False, 'reviewed_by': '', 'notes': ''},
       'status': 'needs_research'
    }
    write_json(target, spec)
    return target


def resolve_local(spec_path: Path, path_value: str) -> Path:
    p = Path(path_value).expanduser()
    return p if p.is_absolute() else (spec_path.parent / p).resolve()


def research_errors(spec: dict, spec_path: Path, *, require_images: bool = True) -> list[str]:
    errors = []
    name = str(spec.get('character') or '').strip()
    if not name: errors.append('character ausente')
    if not str(spec.get('outfit_version') or '').strip(): errors.append('outfit_version ausente')
    identity = spec.get('identity') or {}
    for key in REQUIRED_IDENTITY:
        if not isinstance(identity.get(key), str) or not identity[key].strip():
            errors.append(f'identity.{key} precisa descrever um detalhe VERIFICADO')
    for key in ('accessories', 'unique_features'):
        if not isinstance(identity.get(key), list): errors.append(f'identity.{key} deve ser lista (pode ser vazia)')
    for key in ('must_not_add', 'user_corrections'):
        if not isinstance(spec.get(key), list): errors.append(f'{key} deve ser lista (pode ser vazia)')
    sources = spec.get('sources') or []
    if len(sources) < 2: errors.append('Exigidas pelo menos 2 referências visuais independentes')
    source_ids = set()
    for index, source in enumerate(sources):
        if not isinstance(source, dict):
            errors.append(f'sources[{index}] deve ser objeto'); continue
        locator = str(source.get('url') or source.get('file') or '').strip()
        if not locator: errors.append(f'sources[{index}] precisa de URL ou arquivo real')
        if locator and not (locator.startswith(('https://', 'http://')) or resolve_local(spec_path, locator).is_file()):
            errors.append(f'sources[{index}] URL/arquivo inválido: {locator}')
        if not str(source.get('what_was_verified') or '').strip():
            errors.append(f'sources[{index}] precisa de what_was_verified')
        if locator in source_ids: errors.append('Referências duplicadas não contam como fontes independentes')
        source_ids.add(locator)
    imgs = spec.get('identity_images') or []
    if require_images and not imgs:
        errors.append('Exigida pelo menos 1 imagem local de identidade (arte/modelo conferido)')
    for img in imgs:
        if not isinstance(img, str) or not resolve_local(spec_path, img).is_file():
            errors.append(f'Imagem local ausente: {img}')
    if require_images:
        for image in sorted(STYLE_DIR.glob('reference-*.png')):
            if not image.is_file(): errors.append(f'Referência de estilo ausente: {image}')
        if len(list(STYLE_DIR.glob('reference-*.png'))) != 7:
            errors.append('Devem existir exatamente 7 referências de estilo')
    return errors


def as_english_fragments(spec: dict) -> str:
    ident = spec['identity']
    keys = [
        ('Hair color', 'hair_color'), ('Hair length', 'hair_length'),
        ('Hair volume', 'hair_volume'), ('Hair silhouette and hairstyle', 'hairstyle'),
        ('Bangs', 'bangs'), ('Eye color', 'eye_color'), ('Outfit', 'outfit')
    ]
    parts = [f'{label}: {ident[key]}' for label, key in keys]
    parts.append('Existing accessories only: ' + (', '.join(ident['accessories']) or 'none confirmed'))
    parts.append('Existing special features only: ' + (', '.join(ident['unique_features']) or 'none confirmed'))
    parts.append('Explicitly prohibited additions: ' + (', '.join(spec['must_not_add']) or 'any accessory not verified by reference photos'))
    if spec['user_corrections']:
        parts.append('Corrections from user: ' + '; '.join(spec['user_corrections']))
    return '\n'.join(parts)


def prompt_for(spec: dict, variant: str) -> str:
    if variant not in VARIANTS: raise ValueError('variant inválida')
    composition = (
      'Option A: restrained near-frontal angle, faithful positioning of accessories, subtle head tilt, priority on exact recognition.'
      if variant == 'a' else
      'Option B: slightly different three-quarter angle and gentle natural head tilt, modestly changed crop, same canonical look; no new ornament, costume or eye colors.'
    )
    return f'''Create ONE original square 1:1 1024x1024 PNG chibi bust portrait of {spec['character']} from Wuthering Waves, wearing {spec['outfit_version']}.

IMPORTANT: Image 1 is the verified CHARACTER IDENTITY REFERENCE. Any additional identity images also show the SAME PERSON/OUTFIT. The remaining seven input images define STYLE ONLY; NEVER copy their characters, hairstyles, eye color, clothing, ears, or accessories. Identity reference beats style reference for physical character details.

Verified identity constraints, gathered BEFORE generation from source images:\n{as_english_fragments(spec)}

FIXED STYLE: oversized round head and small shoulders/chest, minimalist soft 2D vector-like anime chibi portrait; eyes are two plain vertical filled ovals matching the character eye color; two oval pink blush cheeks; no nose, no mouth, no eyelashes or realistic facial features; hair in well-defined large shapes with subtle soft flat/cel shadows and 2–3 tones; selective recognizable clothing details; smooth muted colors; clean edges without thick black outlines; warm solid off-white background. No text, logo, border, invented halo, backdrop, effects, props or watermark. Leave enough space for real ears, hat or accessories without clipping.

STRICT: preserve both verified LENGTH and VOLUME of hair separately. Do not confuse a themed power, dragon, lore imagery or combat effect with an accessory. Do not add horns/fox ears/halo/dragon/crown unless verified on the character reference. Never imitate an unrelated character from style images.

{composition}

Produce ONLY the single requested portrait as one image. Do not create panels, collages, UI, multiple options in one image, or commentary within the image.'''


def prompts_from_spec(spec_path: Path) -> tuple[Path, Path]:
    spec_path = spec_path.resolve()
    spec = read_json(spec_path)
    failures = research_errors(spec, spec_path)
    if failures: raise ValueError('\n'.join(' - ' + err for err in failures))
    result = []
    for variant in VARIANTS:
        dest = spec_path.parent / f"{spec['slug']}-opcao-{variant}.prompt.txt"
        dest.write_text(prompt_for(spec, variant), encoding='utf-8')
        result.append(dest)
    spec['status'] = 'ready_to_generate'
    write_json(spec_path, spec)
    return tuple(result)


def _openai_edit(prompt: str, sources: list[Path], model: str, quality: str, size: str, client=None) -> bytes:
    if client is None:
        if not os.environ.get('OPENAI_API_KEY'):
            raise RuntimeError('OPENAI_API_KEY não definido; não é possível gerar pela API')
        try:
            from openai import OpenAI
        except ImportError as error:
            raise RuntimeError('Instale o cliente: pip install openai') from error
        client = OpenAI()
    streams = []
    try:
        for path in sources:
            streams.append(path.open('rb'))
        result = client.images.edit(model=model, image=streams, prompt=prompt,
                                    size=size, quality=quality, output_format='png')
        result_data = result.data[0]
        output = getattr(result_data, 'b64_json', None)
        if not output: raise RuntimeError('A API não devolveu imagem codificada em base64')
        return base64.b64decode(output)
    finally:
        for stream in streams: stream.close()


def generate_from_spec(spec_path: Path, model='gpt-image-1.5', quality='high', size='1024x1024', client=None, resume=False):
    spec_path = spec_path.resolve()
    spec = read_json(spec_path)
    failures = research_errors(spec, spec_path)
    if failures: raise ValueError('\n'.join(' - ' + err for err in failures))
    if size != '1024x1024':
        raise ValueError('Este pipeline usa exatamente 1024x1024 para manter a coleção uniforme')
    paths = [resolve_local(spec_path, n) for n in spec['identity_images']]
    styles = sorted(STYLE_DIR.glob('reference-*.png'))
    paths += styles
    if len(paths) > 16: raise ValueError('Máximo 16 imagens por geração na API; reduza imagens de identidade')
    outputs = []
    previous = spec.setdefault('generation', {})
    for variant in VARIANTS:
        path = spec_path.parent / f"{spec['slug']}-opcao-{variant}.png"
        prompt = prompt_for(spec, variant)
        prompt_sha = hashlib.sha256(prompt.encode('utf-8')).hexdigest()
        if path.exists():
            prior = previous.get(variant) or {}
            verified_resume = (resume and prior.get('prompt_sha256') == prompt_sha
                and prior.get('file_sha256') == hashlib.sha256(path.read_bytes()).hexdigest()
                and prior.get('model') == model)
            if not verified_resume:
                raise FileExistsError(f'Imagem já existe; não será substituída: {path}')
            outputs.append(path)
            continue
        png = _openai_edit(prompt, paths, model, quality, size, client)
        # Validate image before making it visible at final path.
        try:
            from PIL import Image
            from io import BytesIO
            with Image.open(BytesIO(png)) as img:
                if img.format != 'PNG' or img.size != (1024, 1024):
                    raise ValueError('A API devolveu imagem com formato/dimensões inesperados')
        except ImportError as exc:
            raise RuntimeError('Pillow é necessário: pip install pillow') from exc
        temp = path.with_suffix('.png.partial')
        temp.write_bytes(png)
        temp.replace(path)
        outputs.append(path)
        previous[variant] = {'file_sha256': hashlib.sha256(png).hexdigest(),
                             'prompt_sha256': prompt_sha, 'model': model}
        spec['status'] = 'partial_generation'
        write_json(spec_path, spec)
    spec['status'] = 'pending_visual_review'
    spec['review'] = {'option_a': False, 'option_b': False, 'reviewed_by': '', 'notes': ''}
    write_json(spec_path, spec)
    return outputs


def validate_pair(spec_path: Path) -> list[str]:
    from PIL import Image, ImageChops
    spec = read_json(spec_path)
    errors, images, hashes, sizes = [], [], [], []
    for variant in VARIANTS:
        path = spec_path.parent / f"{spec['slug']}-opcao-{variant}.png"
        if not path.is_file():
            errors.append(f'Ausente: {path.name}')
            continue
        try:
            with Image.open(path) as im:
                if im.format != 'PNG': errors.append(f'{path.name} não é PNG')
                w, h = im.size
                sizes.append(im.size)
                if w != h or min(w, h) < 1024: errors.append(f'{path.name} deve ser quadrada e ter no mínimo 1024px')
                images.append(im.convert('RGB').resize((64,64)))
        except Exception as exc:
            errors.append(f'Não foi possível abrir {path.name}: {exc}')
        hashes.append(hashlib.sha256(path.read_bytes()).hexdigest())
    if len(sizes) == 2 and sizes[0] != sizes[1]: errors.append('A e B devem ter as mesmas dimensões')
    if len(hashes) == 2 and hashes[0] == hashes[1]: errors.append('A e B são idênticas byte a byte')
    if len(images) == 2 and ImageChops.difference(images[0], images[1]).getbbox() is None:
        errors.append('A e B têm visual pixel-identical no thumbnail de controle')
    return errors


def approval(spec_path: Path, reviewer: str) -> None:
    errors = validate_pair(spec_path)
    if errors: raise ValueError('\n'.join(errors))
    if not reviewer.strip(): raise ValueError('Informe o nome do revisor')
    spec = read_json(spec_path)
    spec['review'] = {
        'option_a': True, 'option_b': True, 'reviewed_by': reviewer.strip(),
        'notes': 'Revisão visual humana confirmada: personagem, penteado, acessórios, roupa e estilo.',
        'reviewed_at': datetime.now(timezone.utc).isoformat()
    }
    spec['status'] = 'approved'
    write_json(spec_path, spec)


def install(project: Path, source: Path=SKILL_ROOT) -> Path:
    target = project.expanduser().resolve() / '.agents' / 'skills' / 'wuthering-chibi-icons'
    if target.exists(): raise FileExistsError(f'Já existe: {target}; faça backup/atualização manual')
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copytree(source, target, ignore=shutil.ignore_patterns('__pycache__', '*.pyc', 'tests'))
    return target


def init_batch(manifest_path: Path, workspace: Path):
    manifest = read_json(manifest_path)
    created=[]
    for char in manifest.get('characters', []):
        # Existing generated files in old manifest are not automatically considered approved.
        name = char.get('name')
        if not name: continue
        path = workspace / slugify(name) / 'character.json'
        if path.exists(): continue
        p = init_character(name, workspace, char.get('project_reference'))
        created.append(p)
    return created


def main(argv=None):
    p=argparse.ArgumentParser(description='CLI da skill Wuthering Chibi Icons')
    sub=p.add_subparsers(dest='command',required=True)
    a=sub.add_parser('init');a.add_argument('character');a.add_argument('--workspace',type=Path,default=Path('outputs/chibi'));a.add_argument('--project-ref')
    a=sub.add_parser('check-research');a.add_argument('--spec',type=Path,required=True)
    a=sub.add_parser('prompts');a.add_argument('--spec',type=Path,required=True)
    a=sub.add_parser('generate');a.add_argument('--spec',type=Path,required=True);a.add_argument('--model',default='gpt-image-1.5');a.add_argument('--quality',default='high');a.add_argument('--resume',action='store_true')
    a=sub.add_parser('verify');a.add_argument('--spec',type=Path,required=True)
    a=sub.add_parser('approve');a.add_argument('--spec',type=Path,required=True);a.add_argument('--reviewer',required=True);a.add_argument('--confirm-visual',action='store_true')
    a=sub.add_parser('install');a.add_argument('--project',type=Path,required=True)
    a=sub.add_parser('batch-init');a.add_argument('--manifest',type=Path,required=True);a.add_argument('--workspace',type=Path,default=Path('outputs/chibi'))
    args=p.parse_args(argv)
    try:
        if args.command=='init': print(init_character(args.character,args.workspace,args.project_ref))
        elif args.command=='check-research':
            errors=research_errors(read_json(args.spec),args.spec.resolve())
            if errors: raise ValueError('\n'.join(errors))
            print('Pesquisa documentada e imagens locais encontradas. Faça conferência visual das fontes.')
        elif args.command=='prompts': print('\n'.join(map(str,prompts_from_spec(args.spec))))
        elif args.command=='generate': print('\n'.join(map(str,generate_from_spec(args.spec,args.model,args.quality,resume=args.resume))))
        elif args.command=='verify':
            errors=validate_pair(args.spec)
            if errors: raise ValueError('\n'.join(errors))
            print('Validação técnica OK. Falta avaliação visual humana antes de aprovar.')
        elif args.command=='approve':
            if not args.confirm_visual: raise ValueError('Use --confirm-visual somente após conferir ambas as imagens e fontes')
            approval(args.spec,args.reviewer);print('Par aprovado após confirmação visual explícita.')
        elif args.command=='install': print(install(args.project))
        elif args.command=='batch-init':
            results=init_batch(args.manifest,args.workspace)
            print(f'Inicializados {len(results)} personagens em {args.workspace}')
        return 0
    except (ValueError,FileNotFoundError,FileExistsError,RuntimeError,ImportError) as exc:
        print(f'ERRO: {exc}',file=sys.stderr);return 1

if __name__=='__main__': raise SystemExit(main())
