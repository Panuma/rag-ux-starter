# -*- coding: utf-8 -*-
"""
build_index.py — индексация UX-исследований в Chroma с привязкой изображений к секциям

Что делает:
1) Читает все .md из ./02_clean_texts с YAML-frontmatter.
2) Разбивает Markdown на секции по заголовкам #..######, строит "section_path" (хлебные крошки).
3) Для каждой секции вытаскивает до 3 изображений (![](...)) — именно их и кладёт в meta["images"].
4) Делит текст секции на чанки (SentenceSplitter) и сохраняет в коллекцию "ux_research" (./storage/chroma).
5) Поддерживает офлайн-эмбеддинги через sentence-transformers (OFFLINE_ONLY=true в .env).

Важно:
- В meta["images"] кладётся СПИСОК строк путей из Markdown (напр. "/03_assets/fig.png"), не json.dumps.
  Твой app.py уже умеет такие пути резолвить в локальные файлы.
"""

import os
import re
import yaml
import json
import pathlib
from typing import List, Dict, Tuple, Optional

from dotenv import load_dotenv
load_dotenv()

# ── Параметры проекта ──────────────────────────────────────────────────────────
DATA_DIR = pathlib.Path("./02_clean_texts")   # где лежат .md
DB_DIR   = "./storage/chroma"                 # куда пишет Chroma
COLL_NAME = "ux_research"                     # имя коллекции (должно совпадать с app.py)

OFFLINE_ONLY      = os.getenv("OFFLINE_ONLY", "true").lower() == "true"
OPENAI_EMBED_MODEL = os.getenv("OPENAI_EMBED_MODEL", "text-embedding-3-large")
LOCAL_ST_MODEL     = os.getenv("LOCAL_ST_MODEL", "sentence-transformers/all-MiniLM-L6-v2")

# ── Embeddings ─────────────────────────────────────────────────────────────────
if OFFLINE_ONLY:
    from sentence_transformers import SentenceTransformer
    st_model = SentenceTransformer(LOCAL_ST_MODEL)

    def embed_fn(texts: List[str]) -> List[List[float]]:
        return st_model.encode(texts, normalize_embeddings=True).tolist()

    embed_meta = f"ST({LOCAL_ST_MODEL})"
else:
    from llama_index.embeddings.openai import OpenAIEmbedding
    emb = OpenAIEmbedding(model=OPENAI_EMBED_MODEL)

    def embed_fn(texts: List[str]) -> List[List[float]]:
        return emb.get_text_embedding_batch(texts)

    embed_meta = f"OpenAI({OPENAI_EMBED_MODEL})"

# ── LlamaIndex + Chroma ────────────────────────────────────────────────────────
import chromadb
from llama_index.core import Document
from llama_index.core.node_parser import SentenceSplitter

# ── Регэкспы ───────────────────────────────────────────────────────────────────
IMG_MD_RE  = re.compile(r"!\[[^\]]*\]\(([^)]+)\)")
HDR_RE     = re.compile(r"^(#{1,6})\s+(.+?)\s*$", flags=re.MULTILINE)
YAML_RE    = re.compile(r"^---\n(.*?)\n---\n(.*)$", re.S)

# ── Парсинг Markdown ───────────────────────────────────────────────────────────
def read_md_with_yaml(p: pathlib.Path) -> Tuple[Dict, str]:
    """Возвращает (frontmatter, body). frontmatter дополнен filename."""
    text = p.read_text(encoding="utf-8")
    m = YAML_RE.match(text)
    meta, body = {}, text
    if m:
        try:
            meta = yaml.safe_load(m.group(1)) or {}
        except Exception:
            meta = {}
        body = m.group(2)
    meta["filename"] = p.name
    return meta, body

def parse_sections(md_text: str) -> List[Tuple[str, str]]:
    """
    Делит Markdown на секции по заголовкам, возвращает список (section_path, text).
    section_path — "H2: Заголовок › H3: Подзаголовок" (крошки), без # в тексте.
    Текст секции — всё до следующего заголовка того же/меньшего уровня.
    """
    if not md_text.strip():
        return [("", md_text)]

    sections: List[Tuple[str, str]] = []
    lines = md_text.splitlines(keepends=True)

    # Найдём все заголовки с их позициями
    headers = [(m.start(), len(m.group(1)), m.group(2).strip()) for m in HDR_RE.finditer(md_text)]
    if not headers:
        return [("", md_text)]

    # Построим границы секций
    bounds = []
    for i, (pos, level, title) in enumerate(headers):
        start = pos
        end = headers[i+1][0] if i+1 < len(headers) else len(md_text)
        bounds.append((level, title, start, end))

    # Держим текущие хлебные крошки по уровням
    stack: Dict[int, str] = {}
    for level, title, start, end in bounds:
        stack[level] = title
        # выбрасываем всё глубже текущего уровня
        for k in list(stack.keys()):
            if k > level:
                del stack[k]
        breadcrumb = " › ".join(f"H{lvl}: {stack[lvl]}" for lvl in sorted(stack.keys()))
        section_text = md_text[start:end]
        sections.append((breadcrumb, section_text))

    # Контент ДО первого заголовка (если есть)
    first_pos = headers[0][0]
    if first_pos > 0:
        preface = md_text[:first_pos]
        if preface.strip():
            sections = [("H0: Preface", preface)] + sections

    return sections

def extract_images_from_text(md_text: str, max_count: int = 3) -> List[str]:
    """Возвращает до max_count путей к изображениям из текста секции (как в md)."""
    found = IMG_MD_RE.findall(md_text) if md_text else []
    clean: List[str] = []
    for p in found:
        p = (p or "").strip().split("?")[0]  # уберём возможные query
        if p:
            clean.append(p)
        if len(clean) >= max_count:
            break
    return clean

def split_text(body: str, chunk_size: int = 1100, chunk_overlap: int = 220) -> List[str]:
    splitter = SentenceSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    return splitter.split_text(body)

# ── Построение документов ──────────────────────────────────────────────────────
def docs_from_file(front: Dict, body: str) -> List[Document]:
    """
    На выходе — список LlamaIndex Document c корректной метой:
    - id, title, iteration, date, filename, section_path, chunk_index
    - images: список путей из той же секции (до 3 штук)
    """
    base = {
        "id":        front.get("id"),
        "title":     front.get("title"),
        "project":   front.get("project"),
        "product":   front.get("product"),
        "iteration": str(front.get("iteration")) if front.get("iteration") is not None else "",
        "date":      front.get("date"),
        "type":      front.get("type"),
        "method":    front.get("method"),
        "source":    front.get("source"),
        "authors":   ", ".join(front.get("authors", [])) if isinstance(front.get("authors"), list) else front.get("authors"),
        "tags":      ", ".join(front.get("tags", [])) if isinstance(front.get("tags"), list) else front.get("tags"),
        "filename":  front.get("filename"),
    }

    docs: List[Document] = []

    # key_findings из YAML (если есть)
    kf = front.get("key_findings", []) or []
    if isinstance(kf, list):
        for i, item in enumerate(kf):
            if not item:
                continue
            docs.append(
                Document(
                    text=str(item),
                    metadata={**base, "section_path": "key_findings", "chunk_index": f"kf_{i}", "images": []},
                )
            )

    # Разбиваем Markdown на секции и затем на чанки
    sections = parse_sections(body)
    for sec_idx, (section_path, section_text) in enumerate(sections):
        # Картинки секции (до 3)
        section_images = extract_images_from_text(section_text, max_count=3)

        # На случай, если секция без заголовка:
        section_path = section_path or ""

        # Режем секцию на чанки
        chunks = split_text(section_text)
        for i, chunk in enumerate(chunks):
            if not chunk.strip():
                continue
            meta = {
                **base,
                "section_path": section_path,
                "chunk_index": f"{sec_idx}_{i}",
                "images": section_images,  # СПИСОК строк путей — именно так ждёт app.py
            }
            docs.append(Document(text=chunk, metadata=meta))

    return docs

# ── Главная функция индексации ─────────────────────────────────────────────────
def main():
    files = sorted(DATA_DIR.glob("*.md"))
    if not files:
        print("Нет файлов в ./02_clean_texts — положите туда ваши .md исследования.")
        return

    client = chromadb.PersistentClient(path=DB_DIR)
    collection = client.get_or_create_collection(COLL_NAME)

    all_texts: List[str]   = []
    all_metas:  List[dict] = []
    all_ids:    List[str]  = []

    doc_counter = 0

    for p in files:
        front, body = read_md_with_yaml(p)
        docs = docs_from_file(front, body)

        for d in docs:
            all_texts.append(d.text)
            all_metas.append(d.metadata)
            # стабильный id: <filename>#<section>#<chunk>
            sid = f"{front.get('filename','file')}-{d.metadata.get('chunk_index','0')}"
            all_ids.append(sid)
            doc_counter += 1

    print(f"Prepared {len(all_texts)} chunks from {len(files)} files. Embedding via {embed_meta} ...")
    vectors = embed_fn(all_texts)

    # Запись в Chroma (upsert — безопасно перезаписывает)
    collection.upsert(
        ids=all_ids,
        embeddings=vectors,
        metadatas=all_metas,
        documents=all_texts
    )
    print(f"Indexed {len(all_texts)} chunks into collection '{COLL_NAME}'. Storage: {DB_DIR}")

if __name__ == "__main__":
    main()
