# -*- coding: utf-8 -*-
"""
build_images_index.py
Сканирует 03_assets, строит эмбеддинги CLIP и кладёт их в Chroma (коллекция 'ux_images').

• Работает офлайн (sentence-transformers), интернет нужен только на первый скачанный вес CLIP.
• Метаданные: path (абсолютный), filename (имя файла), rel (относительный путь от корня проекта).
"""

import os
from pathlib import Path
from typing import List

from PIL import Image
import chromadb
from sentence_transformers import SentenceTransformer

# --------- Константы проекта ---------
BASE_DIR = Path(__file__).resolve().parent
ASSETS_DIR = (BASE_DIR / "03_assets").resolve()
DB_DIR = (BASE_DIR / "storage" / "chroma").resolve()

COLLECTION_NAME = "ux_images"
ALLOW_SUFFIXES = {".png", ".jpg", ".jpeg", ".webp"}

# --------- Утилиты ---------
def iter_images(root: Path) -> List[Path]:
    for p in root.rglob("*"):
        if p.is_file() and p.suffix.lower() in ALLOW_SUFFIXES:
            yield p

def build_rel_path(p: Path) -> str:
    try:
        return str(p.relative_to(BASE_DIR)).replace("\\", "/")
    except Exception:
        return str(p).replace("\\", "/")

def main():
    if not ASSETS_DIR.exists():
        raise SystemExit(f"Не найдена папка с ассетами: {ASSETS_DIR}")

    print(f"[1/4] Сканирую изображения в: {ASSETS_DIR}")
    files = list(iter_images(ASSETS_DIR))
    if not files:
        raise SystemExit("В 03_assets нет изображений (*.png/jpg/jpeg/webp). Добавь файлы и повтори.")

    print(f"  Найдено файлов: {len(files)}")

    print("[2/4] Инициирую Chroma…")
    client = chromadb.PersistentClient(path=str(DB_DIR))
    # Создаём коллекцию (очистим, чтобы не плодить дубликаты)
    try:
        coll = client.get_collection(COLLECTION_NAME)
    except Exception:
        coll = client.create_collection(COLLECTION_NAME)

    # Полная очистка коллекции
    try:
        coll.delete(where={})
        print("  Коллекция очистилась (upsert по-честному).")
    except Exception:
        print("  Не удалось очистить коллекцию — продолжу добавление поверх.")

    print("[3/4] Загружаю CLIP-модель (sentence-transformers: clip-ViT-B-32)…")
    model = SentenceTransformer("clip-ViT-B-32")  # офлайн, если веса уже на диске

    # Батч-обработка (бережём память)
    BATCH = 32
    added = 0
    ids, embs, metas, docs = [], [], [], []

    def flush_batch():
        nonlocal ids, embs, metas, docs, added
        if not ids:
            return
        coll.add(ids=ids, embeddings=embs, metadatas=metas, documents=docs)
        added += len(ids)
        print(f"  + {len(ids)} (всего: {added})")
        ids, embs, metas, docs = [], [], [], []

    print("[4/4] Кодирую и добавляю в коллекцию…")
    for idx, p in enumerate(files, start=1):
        try:
            img = Image.open(p).convert("RGB")
        except Exception as e:
            print(f"  ! Пропуск (не читается): {p} ({e})")
            continue

        # эмбеддинг
        emb = model.encode([img], convert_to_numpy=True, normalize_embeddings=True)[0]

        # айди и метаданные
        fid = f"img::{p.stem}::{idx}"  # уникализация
        abs_path = str(p.resolve())
        rel_path = build_rel_path(p)

        ids.append(fid)
        embs.append(emb.tolist())
        metas.append({
            "path": abs_path,            # абсолютный для st.image
            "filename": p.name,          # для подписи
            "rel": rel_path,             # на всякий случай
        })
        docs.append(rel_path)  # документ = относительный путь

        if len(ids) >= BATCH:
            flush_batch()

    flush_batch()

    print("\nГотово ✅")
    print(f"Индекс изображений собран: коллекция '{COLLECTION_NAME}', хранилище: {DB_DIR}")
    print("Теперь во вкладке «🖼 По макету» можно искать похожие интерфейсы по картинке.")

if __name__ == "__main__":
    main()
