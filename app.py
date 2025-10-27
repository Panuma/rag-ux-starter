# -*- coding: utf-8 -*-
import os
import re
import json
from pathlib import Path
from datetime import datetime

import streamlit as st
import chromadb
from dotenv import load_dotenv

# =========================
# Константы и утилиты
# =========================
load_dotenv()

DB_DIR = "./storage/chroma"
OFFLINE_ONLY = os.getenv("OFFLINE_ONLY", "true").lower() == "true"
OPENAI_LLM_MODEL = os.getenv("OPENAI_LLM_MODEL", "gpt-4o")

BASE_DIR = Path(__file__).resolve().parent
ASSETS_DIR = (BASE_DIR / "03_assets").resolve()
TEXTS_DIR  = (BASE_DIR / "02_clean_texts").resolve()

# ---------- пути к изображениям ----------
def resolve_image_path(p: str) -> str:
    """Нормализует путь к картинке для локального запуска."""
    if not p:
        return ""
    p = str(p).strip()
    if p.startswith("http://") or p.startswith("https://"):
        return p
    if re.match(r"^[A-Za-z]:\\", p):  # абсолютный Windows-путь
        return p
    rel = p.lstrip("/\\").replace("\\", "/")
    candidates = [
        BASE_DIR / rel,
        ASSETS_DIR / rel,
        ASSETS_DIR / Path(rel).name,
        BASE_DIR / "03_assets" / "/".join(rel.split("/")[1:])
    ]
    for c in candidates:
        if c.exists():
            return str(c)
    return str(candidates[0])

def _append_img(imgs, item):
    if isinstance(item, str):
        imgs.append((item, None))
    elif isinstance(item, dict):
        path = item.get("path") or item.get("src") or item.get("url")
        if path:
            imgs.append((path, item.get("alt")))

def _parse_images(images_raw):
    """meta['images'] → список пар (path, alt). Поддерживает list/dict/JSON/str."""
    imgs = []
    if images_raw is None:
        return imgs
    if isinstance(images_raw, list):
        for it in images_raw: _append_img(imgs, it)
    elif isinstance(images_raw, dict):
        _append_img(imgs, images_raw)
    elif isinstance(images_raw, str):
        try:
            parsed = json.loads(images_raw)
            if isinstance(parsed, list):
                for it in parsed: _append_img(imgs, it)
            elif isinstance(parsed, dict):
                _append_img(imgs, parsed)
            else:
                _append_img(imgs, images_raw)
        except Exception:
            _append_img(imgs, images_raw)
    return imgs

# ---------- фолбэк: вытаскиваем картинки из исходного MD ----------
IMG_PATTERN = re.compile(r"!\[[^\]]*\]\(([^)]+)\)")
HDR_RE      = re.compile(r"^#{1,6}\s+.+?$", flags=re.MULTILINE)

def _slice_section(md_text: str, section_path: str) -> str:
    if not md_text or not section_path:
        return md_text or ""
    i = md_text.lower().find(section_path.strip().lower())
    if i == -1:
        return md_text
    tail = md_text[i:]
    m = HDR_RE.search(tail, pos=1)  # следующий заголовок в «хвосте»
    return tail[:m.start()] if m and m.start() > 0 else tail

def _fallback_images_from_md(meta, max_count=3):
    """Если meta['images'] пусто, берём 2–3 картинки из секции соответствующего .md."""
    filename = (meta or {}).get("filename")
    if not filename:
        return []
    md_path = TEXTS_DIR / filename
    if not md_path.exists():
        return []
    # читаем файл
    try:
        text = md_path.read_text(encoding="utf-8")
    except Exception:
        try:
            text = md_path.read_text(encoding="utf-16")
        except Exception:
            return []
    section_path = (meta or {}).get("section_path") or ""
    slice_text = _slice_section(text, section_path)
    found = IMG_PATTERN.findall(slice_text) or IMG_PATTERN.findall(text)
    found = [p.strip().split("?")[0] for p in found][:max_count]
    return [(p, None) for p in found]

# ---------- офлайн-свод (экстрактивно) ----------
def offline_summary(top_hits, max_sent=4):
    """Простой экстрактивный свод: выбираем информативные предложения из top-хитов."""
    import heapq, re as _re
    text = " ".join((h.get("text") or "") for h in top_hits[:8])
    sents = _re.split(r"(?<=[.!?])\s+", text)
    sents = [s.strip() for s in sents if s.strip()]
    if len(sents) <= max_sent:
        return " ".join(sents)
    def score(s):
        sc = len(s)
        for kw in ("процент", "лимит", "задолж", "беспроцент", "комис", "сняти", "перевод", "понят", "экран", "визуал"):
            if kw in s.lower(): sc += 30
        return sc
    best = heapq.nlargest(max_sent, sents, key=score)
    return " ".join(best)

# ---------- OFFLINE Интерпретация: TF-IDF + TextRank (без внешних библиотек) ----------
def _tokenize(text):
    text = text.lower()
    # убираем лишнее
    text = re.sub(r"[^a-zа-я0-9ё\- ]+", " ", text)
    # русские/английские стоп-слова (минимальный набор)
    stop = set("""
        и в во не что он на я с со как а то все она так его но да ты к у же вы за бы по только ее мне было
        вот от меня еще нет о из ли же до ни кто это того потому этот какой где когда здесь там него нее них
        при чем раз два три или либо также также-то чтобы для без про над под между около
        the a an to of is are was were be been being this that these those and or not from by as with into onto about
    """.split())
    toks = [t for t in text.split() if t and t not in stop and len(t) > 2]
    return toks

def _sent_split(text):
    parts = re.split(r"(?<=[.!?])\s+", text)
    return [p.strip() for p in parts if len(p.strip()) > 0]

def _build_tfidf(sentences):
    # словарь
    docs = [ _tokenize(s) for s in sentences ]
    vocab = {}
    for d in docs:
        for t in d:
            if t not in vocab:
                vocab[t] = len(vocab)
    # tf
    tf = []
    for d in docs:
        vec = [0]*len(vocab)
        for t in d:
            vec[vocab[t]] += 1
        tf.append(vec)
    # idf
    import math
    df = [0]*len(vocab)
    for j in range(len(vocab)):
        for i in range(len(docs)):
            if tf[i][j] > 0:
                df[j] += 1
    idf = [ math.log((1+len(docs))/(1+dfj))+1.0 for dfj in df ]
    # tf-idf нормировка
    tfidf = []
    for i in range(len(docs)):
        row = [ tf[i][j]*idf[j] for j in range(len(vocab)) ]
        # l2
        norm = math.sqrt(sum(x*x for x in row)) or 1.0
        row = [x/norm for x in row]
        tfidf.append(row)
    return tfidf

def _cosine(v1, v2):
    s = 0.0
    for a,b in zip(v1,v2):
        s += a*b
    return s

def _textrank_scores(tfidf, damping=0.85, iters=30, eps=1e-6):
    n = len(tfidf)
    if n == 0:
        return []
    # матрица схожести (без диагонали)
    sim = [[0.0]*n for _ in range(n)]
    for i in range(n):
        for j in range(i+1,n):
            c = _cosine(tfidf[i], tfidf[j])
            sim[i][j] = c
            sim[j][i] = c
    # нормировка по строкам
    row_sum = [sum(sim[i]) for i in range(n)]
    M = [[ (sim[i][j]/row_sum[i] if row_sum[i] > 0 else 0.0) for j in range(n)] for i in range(n)]
    # PageRank
    pr = [1.0/n]*n
    for _ in range(iters):
        new = [ (1.0-damping)/n + damping * sum(pr[j]*M[j][i] for j in range(n)) for i in range(n) ]
        # проверка сходимости
        diff = sum(abs(new[i]-pr[i]) for i in range(n))
        pr = new
        if diff < eps:
            break
    return pr

def summarize_tfidf_textrank(hits, query:str, max_sentences:int=5):
    """Берём топ-хиты → режем на предложения → считаем TF-IDF и TextRank → возвращаем свод."""
    text = " ".join((h.get("text") or "") for h in hits[:10])
    # подмешаем сам запрос (даёт лёгкий приоритет словам из запроса)
    text = (query or "") + ". " + text
    sentences = _sent_split(text)
    # фильтр слишком коротких
    sentences = [s for s in sentences if len(_tokenize(s)) >= 5]
    if not sentences:
        return ""
    tfidf = _build_tfidf(sentences)
    ranks = _textrank_scores(tfidf)
    # берём top-N по рангу, сохраняем порядок появления
    idx_sorted = sorted(range(len(sentences)), key=lambda i: ranks[i], reverse=True)[:max_sentences]
    idx_sorted = sorted(idx_sorted)
    # лёгкая «склейка»: убираем дубликаты по началу
    result = []
    seen = set()
    for i in idx_sorted:
        s = sentences[i].strip()
        key = s[:40].lower()
        if key not in seen:
            result.append(s)
            seen.add(key)
    return " ".join(result)

# =========================
# UI: настройка + стили
# =========================
st.set_page_config(page_title="ИИ-исследователь 2.0", page_icon="🔎", layout="wide")
st.markdown("""
<style>
.card {border:1px solid #e6e6e6; border-radius:14px; padding:14px 16px; margin:12px 0; background:#fff;}
.card h4 {margin:0 0 6px 0; font-size:16px;}
.badges {display:flex; flex-wrap:wrap; gap:6px; margin-bottom:8px;}
.badge {font-size:12px; background:#f5f5f7; border:1px solid #eee; padding:2px 8px; border-radius:999px; color:#333;}
.quote {font-size:14px; line-height:1.55; margin:8px 0 12px; padding-left:10px; border-left:3px solid #e3e3e3; color:#111;}
.meta {font-size:12px; color:#666;}
</style>
""", unsafe_allow_html=True)
st.title("ИИ-исследователь 2.0 — поиск и осмысление UX-кейсов")

# =========================
# Настройки режима работы
# =========================
st.sidebar.markdown("## ⚙️ Настройки")

# Переключатель режима интерпретации
use_offline_mode = st.sidebar.toggle(
    "🔄 Режим интерпретации", 
    value=OFFLINE_ONLY,
    help="Офлайн: локальная обработка (TF-IDF + TextRank)\nОнлайн: ChatGPT + локальная обработка как резерв"
)

# Визуальная индикация текущего режима
if use_offline_mode:
    st.sidebar.success("🟢 Офлайн режим")
else:
    st.sidebar.info("🔵 Онлайн режим")

# debug_images = st.sidebar.toggle("🔧 Показывать отладку изображений", value=False)

# Индикатор режима в основном интерфейсе
if use_offline_mode:
    st.info("🟢 **Офлайн режим**: Анализ выполняется локально с помощью TF-IDF и TextRank")
else:
    st.info("🔵 **Онлайн режим**: Используется ChatGPT для анализа с локальной обработкой как резерв")

# =========================
# Подключение к базам Chroma
# =========================
client = chromadb.PersistentClient(path=DB_DIR)
text_collection = client.get_or_create_collection("ux_research")   # чанк-тексты

# =========================
# TABs: По тексту / По макету
# =========================
tab_text, tab_image = st.tabs(["🔎 По тексту", "🖼 По макету"])

with tab_text:
    # --- Фильтры и ввод запроса ---
    col1, col2, col3 = st.columns(3)
    iteration = col1.text_input("Итерация (например, 1 или 2)", "")
    scenario  = col2.text_input("Сценарий/тег (например, 'беспроцентный период')", "")
    date_hint = col3.text_input("Дата (YYYY-MM, опционально)", "")
    query     = st.text_area("Идея экрана / вопрос / гипотеза", "Как показать беспроцентный период, чтобы не путали с планом выплат?")

    # --- Поиск по тексту ---
    def search_text(q: str, k: int = 12):
        res = text_collection.query(query_texts=[q], n_results=k)
        hits = []
        for i in range(len(res["documents"][0])):
            hits.append({
                "text": res["documents"][0][i],
                "meta": res["metadatas"][0][i],
                "dist": res["distances"][0][i] if "distances" in res else None
            })
        return hits

    def format_cite(hit, idx):
        md = hit["meta"] or {}
        label = f"{md.get('id')} · {md.get('title')} · итерация {md.get('iteration')} · {md.get('date')}"
        where = f"{md.get('filename')} / {md.get('section_path') or '…'} / chunk {md.get('chunk_index')}"
        return f"[{idx}] {label}\n{where}\n\"{(hit.get('text') or '').strip()}\""

    def llm_answer(q, top_hits, offline_mode):
        if offline_mode:
            return ("**Итог (офлайн).** Ниже — лучшие цитаты по запросу.\n\n" +
                    "\n\n".join(format_cite(h, i+1) for i, h in enumerate(top_hits[:3])))
        try:
            from openai import OpenAI
            client_oai = OpenAI()
            context = "\n\n".join(format_cite(h, i+1) for i, h in enumerate(top_hits[:5]))
            prompt = (
                "Ты — UX-исследователь. Ответь кратко и по делу.\n"
                "1) Итог (2–4 предложения).\n"
                "2) 1–3 дословные цитаты (ставь [номер источника]).\n"
                "3) Источники: id · title · iteration · date · filename/section/chunk.\n\n"
                f"Вопрос: {q}\n\nКонтекст:\n{context}\n"
            )
            resp = client_oai.chat.completions.create(
                model=OPENAI_LLM_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0
            )
            return resp.choices[0].message.content
        except Exception as e:
            return f"Не удалось вызвать LLM ({e}). Показаны цитаты:\n\n" + \
                   "\n\n".join(format_cite(h, i+1) for i, h in enumerate(top_hits[:3]))

    # ================ Кнопка поиска ================
    if st.button("Искать похожие кейсы", type="primary"):
        with st.spinner("Ищу релевантные фрагменты..."):
            hits = search_text(query, k=12)

            # Фильтры по метаданным
            def meta_ok(md):
                ok = True
                if iteration and (md.get("iteration", "") != iteration): ok = False
                if date_hint and (md.get("date", "").strip() != date_hint.strip()): ok = False
                if scenario and scenario.lower() not in (md.get("tags", "") or "").lower(): ok = False
                return ok

            filtered = [h for h in hits if meta_ok(h["meta"])] or hits

            # ======================= Аналитический вывод =======================
            st.markdown("## 🧠 Аналитический вывод")

            if use_offline_mode:
                # офлайн-«генерация»: TF-IDF + TextRank
                summary_text = summarize_tfidf_textrank(filtered, query, max_sentences=5)
            else:
                # если онлайн — сначала LLM, а ниже офлайн как резерв
                llm_out = llm_answer(query, filtered, use_offline_mode)
                st.markdown(llm_out)
                summary_text = offline_summary(filtered, max_sent=4)

            # красиво выведем офлайн-вывод как bullets
            if summary_text:
                bullets = [s.strip() for s in re.split(r"(?<=[.!?])\s+", summary_text) if len(s.strip()) > 0][:4]
                st.write("- " + "\n- ".join(bullets))
            else:
                st.info("Недостаточно контекста для свода. Попробуйте уточнить запрос.")

            # ======================= Экспорт отчёта =======================
            st.markdown("### 💾 Экспорт отчёта")
            # Сформируем markdown-отчёт
            def build_md_report():
                now = datetime.now().strftime("%Y-%m-%d %H:%M")
                parts = []
                parts.append(f"# Аналитический отчёт — ИИ-исследователь 2.0\n")
                parts.append(f"**Время:** {now}\n")
                parts.append(f"**Запрос:** {query}\n")
                parts.append("## Итоговый вывод\n")
                if summary_text:
                    for b in bullets:
                        parts.append(f"- {b}")
                    parts.append("")
                else:
                    parts.append("_Нет итогового свода._\n")
                parts.append("## Источники и цитаты\n")
                for i, h in enumerate(filtered[:8], start=1):
                    md = h["meta"] or {}
                    label = f"{md.get('id')} · {md.get('title')} · итерация {md.get('iteration')} · {md.get('date')}"
                    where = f"{md.get('filename')} / {md.get('section_path') or '…'} / chunk {md.get('chunk_index')}"
                    parts.append(f"### [{i}] {label}")
                    parts.append(where)
                    parts.append("")
                    parts.append(f"> { (h.get('text') or '').strip() }")
                    # картинки (если есть)
                    parsed_imgs = _parse_images(md.get("images") or [])
                    if not parsed_imgs:
                        parsed_imgs = _fallback_images_from_md(md, max_count=3)
                    if parsed_imgs:
                        parts.append("")
                        parts.append("Связанные изображения:")
                        for p, _ in parsed_imgs[:3]:
                            parts.append(f"![img]({p})")
                        parts.append("")
                return "\n".join(parts)

            md_report = build_md_report()
            st.download_button(
                label="⬇️ Скачать .md",
                data=md_report.encode("utf-8"),
                file_name="ux_insights_report.md",
                mime="text/markdown"
            )

            # Попытка PDF (если установлен reportlab)
            try:
                from reportlab.lib.pagesizes import A4
                from reportlab.pdfgen import canvas
                from reportlab.lib.units import mm

                def save_pdf(text: str, path: Path):
                    c = canvas.Canvas(str(path), pagesize=A4)
                    width, height = A4
                    x, y = 20*mm, height - 20*mm
                    for line in text.splitlines():
                        # простейшая обрезка по ширине
                        while len(line) > 110:
                            c.drawString(x, y, line[:110])
                            line = line[110:]
                            y -= 6*mm
                            if y < 15*mm:
                                c.showPage(); y = height - 20*mm
                        c.drawString(x, y, line)
                        y -= 6*mm
                        if y < 15*mm:
                            c.showPage(); y = height - 20*mm
                    c.save()

                pdf_path = BASE_DIR / "ux_insights_report.pdf"
                # для PDF возьмём текст без markdown-картинок (простая версия)
                text_for_pdf = re.sub(r"!\[[^\]]*\]\([^)]+\)", "[image]", md_report)
                save_pdf(text_for_pdf, pdf_path)

                with open(pdf_path, "rb") as f:
                    st.download_button(
                        label="⬇️ Скачать .pdf",
                        data=f.read(),
                        file_name="ux_insights_report.pdf",
                        mime="application/pdf"
                    )
            except Exception:
                st.caption("Совет: если нет PDF в один клик — сохрани страницу через браузер как PDF (Print → Save as PDF).")

            # ======================= Быстрый офлайн-свод для сравнения =======================
            if use_offline_mode:
                st.markdown("### 🧩 Альтернативный офлайн-свод (экстрактивный)")
                st.write(offline_summary(filtered, max_sent=4))

            st.divider()
            st.subheader("📌 Топ-фрагменты")

            # ======================= Рендер карточек фрагментов =======================
            for i, h in enumerate(filtered[:6], start=1):
                md = h["meta"] or {}
                title = md.get("title") or "Без названия"
                badges = [
                    f'id: {md.get("id") or "—"}',
                    f'итерация: {md.get("iteration") or "—"}',
                    f'дата: {md.get("date") or "—"}',
                    f'файл: {md.get("filename") or "—"}',
                ]
                section = md.get("section_path") or "…"
                chunk_ix = md.get("chunk_index") or "—"

                st.markdown('<div class="card">', unsafe_allow_html=True)
                st.markdown(f'<h4>[{i}] {title}</h4>', unsafe_allow_html=True)
                st.markdown('<div class="badges">' + "".join([f'<div class="badge">{b}</div>' for b in badges]) + '</div>', unsafe_allow_html=True)
                st.markdown(f'<div class="quote">{(h.get("text") or "").strip()}</div>', unsafe_allow_html=True)
                st.markdown(f'<div class="meta">{md.get("product") or ""} · секция: {section} · chunk: {chunk_ix}</div>', unsafe_allow_html=True)

                # ----- Превью: сначала из метаданных -----
                parsed_imgs = _parse_images(md.get("images") or [])

                # ----- Если в метаданных пусто — фолбэк из исходного Markdown -----
                if not parsed_imgs:
                    parsed_imgs = _fallback_images_from_md(md, max_count=3)

                # ----- Нормализация путей и показ -----
                resolved = []
                for p, alt in parsed_imgs:
                    rp = resolve_image_path(p)
                    exists = (not rp.startswith("http")) and Path(rp).exists()
                    resolved.append({"path": rp, "alt": alt, "exists": True if rp.startswith("http") else exists})
                to_show = [r for r in resolved if r["exists"]][:3]
                if to_show:
                    cols = st.columns(len(to_show))
                    for j, info in enumerate(to_show):
                        with cols[j]:
                            st.image(info["path"], caption=info["alt"] or Path(info["path"]).name, use_container_width=True)
                elif parsed_imgs:
                    st.caption("⚠️ Изображения указаны, но файлы не найдены. Проверь пути.")

                # if st.sidebar.toggle("🔧 Показывать отладку изображений", value=False, key=f"dbg_{i}"):
                #     with st.expander("🔧 Отладка путей к изображениям", expanded=False):
                #         st.write(resolved)

                st.markdown('</div>', unsafe_allow_html=True)

with tab_image:
    st.subheader("Поиск похожих интерфейсов по картинке (CLIP)")
    uploaded = st.file_uploader("Загрузите PNG/JPG макета", type=["png","jpg","jpeg","webp"])
    if uploaded:
        from PIL import Image
        from sentence_transformers import SentenceTransformer
        image = Image.open(uploaded).convert("RGB")
        st.image(image, caption="Запрос", use_container_width=True)

        # эмбеддинг изображения (CLIP)
        clip_model = SentenceTransformer("clip-ViT-B-32")
        qvec = clip_model.encode([image], convert_to_numpy=True, normalize_embeddings=True)[0].tolist()

        # поиск по коллекции ux_images
        client_img = chromadb.PersistentClient(path=DB_DIR)
        images_coll = client_img.get_or_create_collection("ux_images")
        res = images_coll.query(query_embeddings=[qvec], n_results=12, include=["metadatas","documents","distances"])

        hits = []
        # Получаем количество результатов из любого доступного поля
        result_count = len(res["metadatas"][0]) if "metadatas" in res and res["metadatas"] else 0
        
        for i in range(result_count):
            md = res["metadatas"][0][i] or {}
            # Используем индекс как ID, если ids недоступен
            item_id = res["ids"][0][i] if "ids" in res and res["ids"] else f"item_{i}"
            hits.append({
                "id": item_id,
                "path": md.get("path"),
                "name": md.get("filename"),
                "dist": res["distances"][0][i] if "distances" in res and res["distances"] else None
            })

        if hits:
            st.markdown("#### Похожие визуальные решения")
            cols = st.columns(4)
            for i, h in enumerate(hits):
                with cols[i % 4]:
                    st.image(h["path"], caption=f"{h['name']}", use_container_width=True)
        else:
            st.info("Ничего похожего не нашлось. Убедись, что индекс изображений собран (`build_images_index.py`).")
