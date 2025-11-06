/**
 * Моки данных для API
 */

import type { SearchResponse, FollowupResponse, AnswerResponse } from "./types";

export const MOCK_SEARCH_RESPONSE: SearchResponse = {
  summary: "Беспроцентный период (БП) требует явной визуализации финальной даты и легенды прогресс-бара. Обязательный платёж должен сопровождаться микрокопией о назначении. Проценты за снятие наличных/переводы нужно акцентировать заголовком и примером в день.",
  quotes: [
    {
      id: "q1",
      text: "Несколько БП считываются, но финальные даты и правило «120 дней» без явного расчёта остаются неочевидны; нужна явная дата окончания и легенда графики.",
      metadata: {
        id: "R-2023-02-KK-DebtScreenRedesign",
        title: "Редизайн экрана задолженности по кредитной карте",
        iteration: "3",
        date: "2023-02",
        filename: "R-2023-02-KK-DebtScreenRedesign.md",
        section_path: "Основные наблюдения",
        chunk_index: 0,
        product: "Кредитная СберКарта"
      },
      distance: 0.23
    },
    {
      id: "q2",
      text: "Виджет «Обязательный платёж» помогает, но часть пользователей не понимает назначение и ожидает сумму/диапазон; требуется микротекст и ориентир по сумме.",
      metadata: {
        id: "R-2023-02-KK-DebtScreenRedesign",
        title: "Редизайн экрана задолженности по кредитной карте",
        iteration: "3",
        date: "2023-02",
        filename: "R-2023-02-KK-DebtScreenRedesign.md",
        section_path: "Основные наблюдения",
        chunk_index: 1,
        product: "Кредитная СберКарта"
      },
      distance: 0.28
    },
    {
      id: "q3",
      text: "Прогресс-бар БП и точки интерпретируются неверно; требуется легенда/подписи, разграничение таймлайна и плана выплат.",
      metadata: {
        id: "R-2023-02-KK-DebtScreenRedesign",
        title: "Редизайн экрана задолженности по кредитной карте",
        iteration: "3",
        date: "2023-02",
        filename: "R-2023-02-KK-DebtScreenRedesign.md",
        section_path: "Основные наблюдения",
        chunk_index: 2,
        product: "Кредитная СберКарта"
      },
      distance: 0.31
    },
    {
      id: "q4",
      text: "Предложение «вернуть всю сумму до [дата]» понятно и повышает доверие.",
      metadata: {
        id: "R-2023-02-KK-DebtScreenRedesign",
        title: "Редизайн экрана задолженности по кредитной карте",
        iteration: "3",
        date: "2023-02",
        filename: "R-2023-02-KK-DebtScreenRedesign.md",
        section_path: "Основные наблюдения",
        chunk_index: 3,
        product: "Кредитная СберКарта"
      },
      distance: 0.35
    },
    {
      id: "q5",
      text: "Блоки «Снятие наличных/переводы» малозаметны; нужны акцентные заголовки, пояснение «проценты с даты операции» и явная ставка/≈в день.",
      metadata: {
        id: "R-2023-02-KK-DebtScreenRedesign",
        title: "Редизайн экрана задолженности по кредитной карте",
        iteration: "3",
        date: "2023-02",
        filename: "R-2023-02-KK-DebtScreenRedesign.md",
        section_path: "Основные наблюдения",
        chunk_index: 4,
        product: "Кредитная СберКарта"
      },
      distance: 0.38
    },
    {
      id: "q6",
      text: "Баннеры перегружены датами; оставить одну ключевую дату, остальное — в подсказки.",
      metadata: {
        id: "R-2023-02-KK-DebtScreenRedesign",
        title: "Редизайн экрана задолженности по кредитной карте",
        iteration: "3",
        date: "2023-02",
        filename: "R-2023-02-KK-DebtScreenRedesign.md",
        section_path: "Основные наблюдения",
        chunk_index: 5,
        product: "Кредитная СберКарта"
      },
      distance: 0.41
    }
  ],
  sources: [
    {
      id: "R-2023-02-KK-DebtScreenRedesign",
      title: "Редизайн экрана задолженности по кредитной карте",
      date: "2023-02",
      iteration: "3"
    }
  ],
  images: [
    {
      path: "03_assets/2023_02_KK_DebtScreenRedesign/R-2023-02-KK-DebtScreenRedesign_fig02.png",
      alt: "Основные наблюдения",
      source_id: "R-2023-02-KK-DebtScreenRedesign"
    },
    {
      path: "03_assets/2023_02_KK_DebtScreenRedesign/R-2023-02-KK-DebtScreenRedesign_fig03.png",
      alt: "Сравнение итераций",
      source_id: "R-2023-02-KK-DebtScreenRedesign"
    }
  ]
};

export const getMockFollowupResponse = (threadId: string): FollowupResponse => ({
  ...MOCK_SEARCH_RESPONSE,
  threadId,
  answerId: `ans_${Date.now()}`,
  summary: "Уточняющий ответ: визуализация БП требует явной даты окончания и легенды. Обязательный платёж нуждается в микротексте.",
});

export const getMockAnswerResponse = (id: string, mode: "online" | "offline"): AnswerResponse => ({
  ...MOCK_SEARCH_RESPONSE,
  id,
  createdAt: new Date().toISOString(),
  mode,
});





