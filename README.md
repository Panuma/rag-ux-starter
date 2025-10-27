# ИИ-исследователь - микро RAG (LlamaIndex + Chroma + Streamlit)

Минимальный проект, чтобы запустить смысловой поиск по 5 исследовательским файлам (Markdown + YAML).

## 0) Что внутри
- build_index.py - индексация Markdown-файлов из /02_clean_texts в локальный ChromaDB
- app.py - интерфейс Streamlit для вопросов, цитат и источников
- requirements.txt - зависимости
- settings.example.env - образец .env
- RAG_TestResults.md - шаблон протокола качества
- 02_clean_texts/ - сюда положи свои 5 файлов .md (с YAML в начале)

## 1) Подготовка окружения
```bash
# macOS/Linux
python -m venv .venv && source .venv/bin/activate
# Windows (PowerShell)
python -m venv .venv; .\.venv\Scripts\Activate.ps1

pip install -r requirements.txt
cp settings.example.env .env   # Windows: copy settings.example.env .env
```

Открой .env, вставь OPENAI_API_KEY.
Если ключа нет или нельзя использовать облако, поставь OFFLINE_ONLY=true - ответы будут без LLM, только со списком лучших цитат.

## 2) Положи файлы
Скопируй 5 Markdown-файлов в ./02_clean_texts/. Каждый файл должен начинаться с YAML фронт-маттера:

```yaml
---
id: "R-2023-02-KK-DebtScreenRedesign"
title: "Редизайн экрана задолженности"
project: "Кредитная карта"
product: "СберКарта"
iteration: "1"
date: "2023-02"
type: "Юзабилити-тест"
method: "Модерируемое тестирование"
authors: ["UX Research Team Daily Banking B2C"]
source: "SBOL PRO / UX LAB"
key_findings:
  - ...
  - ...
tags: ["задолженность", "беспроцентный период", "удержание"]
---

# Контент
...
```

## 3) Индексация
```bash
python build_index.py
```

## 4) Запустить интерфейс
```bash
streamlit run app.py
```
Откроется страница в браузере. Введи вопрос и, при необходимости, задай фильтры.

## 5) Тестовые вопросы
1. Как пользователи понимали задолженность в 1 итерации и как во 2-й?
2. Что респонденты думали про проценты по наличным?
3. Какие были проблемы с визуализацией беспроцентного периода?
4. Какие ошибки восприятия были устранены после редизайна?

## 6) Оценка качества
Заполняй RAG_TestResults.md - релевантность (Да/Частично/Нет), точность цитат, корректность источника. Там же фиксируй идеи на улучшение (размер chunk, overlap, переранкер, фильтры).
