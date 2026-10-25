"""Generate responsive WebP assets from the supplied production illustrations.
Usage: python3 scripts/optimize-daylight-images.py /path/to/source-images
Requires cwebp on PATH. Originals remain untouched and outside the public build.
"""
from pathlib import Path
import argparse
import json
import subprocess

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("source_dir", type=Path)
parser.add_argument("--manifest", type=Path, default=Path(__file__).with_name("daylight-images.json"),
                    help="Image manifest; defaults to the original daylight set")
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
images = json.loads(args.manifest.read_text())
original = 0
sizes = {width: 0 for width in (640, 960, 1600)}
for item in images:
    source = args.source_dir / item["source"]
    original += source.stat().st_size
    for width in sizes:
        target = root / "public/assets/stills" / f"{item['name']}-{width}.webp"
        subprocess.run(["cwebp", "-quiet", "-q", "78", "-m", "6", "-metadata", "none",
                        "-resize", str(width), "0", str(source), "-o", str(target)], check=True)
        sizes[width] += target.stat().st_size
print(f"Original PNGs: {original / 1024**2:.2f} MiB")
for width, size in sizes.items():
    print(f"{width}px set: {size / 1024**2:.2f} MiB ({100 * (1-size/original):.1f}% smaller)")
