#!/usr/bin/env python3
"""Basic deterministic checks for the TWO generated chibi icon files.

Usage: python verify_outputs.py option-a.png option-b.png
Requires Pillow. This script does NOT assess artistic fidelity.
"""

from pathlib import Path
import hashlib
import sys

try:
    from PIL import Image
except ImportError:
    raise SystemExit("Pillow indisponível: instale com 'pip install pillow', ou faça a checagem manual.")


def main() -> int:
    if len(sys.argv) != 3:
        print("Uso: python verify_outputs.py <opcao-a.png> <opcao-b.png>")
        return 2
    paths = [Path(sys.argv[1]), Path(sys.argv[2])]
    failures = []
    hashes = []
    dimensions = []
    for path in paths:
        if not path.is_file():
            failures.append(f"Arquivo ausente: {path}")
            continue
        with Image.open(path) as img:
            fmt = img.format
            w, h = img.size
            dimensions.append((w, h))
            if fmt != "PNG":
                failures.append(f"{path.name}: esperado PNG, encontrado {fmt}")
            if w != h:
                failures.append(f"{path.name}: proporção não quadrada ({w}×{h})")
            if min(w, h) < 1024:
                failures.append(f"{path.name}: resolução inferior ao padrão 1024×1024 ({w}×{h})")
            print(f"{path.name}: {fmt}, {w}×{h}")
        hashes.append(hashlib.sha256(path.read_bytes()).hexdigest())
    if len(hashes) == 2 and hashes[0] == hashes[1]:
        failures.append("As duas opções são exatamente o mesmo arquivo")
    if len(dimensions) == 2 and dimensions[0] != dimensions[1]:
        failures.append("As opções têm resoluções diferentes")
    if failures:
        print("FALHAS:")
        for failure in failures:
            print(f"- {failure}")
        return 1
    print("Validação técnica OK. Verificação artística/identidade continua obrigatória.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
