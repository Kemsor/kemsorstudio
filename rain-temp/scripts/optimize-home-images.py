"""Regenerate homepage WebP derivatives. Requires cwebp on PATH."""
from pathlib import Path
import subprocess

assets = Path(__file__).resolve().parents[1] / "public/assets"
images = [
    *[("stills/" + name, "png") for name in (
        "development-packaging", "financing-co-production", "pre-production-casting",
        "post-production-release", "india-production-services", "work-action-set",
        "work-period-set", "work-dance-set", "work-celebration-set",
        "work-motorcycle-set", "work-forest-set")],
    ("stills/action-scene", "webp"),
    ("hero-films/kemsor-story", "jpg"),
    ("hero-films/kemsor-production", "jpg"),
    ("motion-films/theatre-facade", "jpg"),
    ("services/casting", "webp"),
]
for name, extension in images:
    for width in (640, 960, 1600):
        source = assets / f"{name}.{extension}"
        target = assets / f"{name}-{width}.webp"
        subprocess.run(["cwebp", "-quiet", "-q", "78", "-m", "6",
                        "-resize", str(width), "0", str(source), "-o", str(target)], check=True)
print("Generated responsive homepage images.")
