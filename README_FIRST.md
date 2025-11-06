# 🚨 СРОЧНО: Как запустить приложение

## Шаг 1: Откройте PowerShell

## Шаг 2: Перейдите в директорию

```powershell
cd C:\Users\Dell\Documents\rag-ux-starter\app-ui
```

## Шаг 3: Запустите сервер

```powershell
npm run dev
```

## Шаг 4: Откройте браузер

Перейдите на: **http://localhost:3000**

---

## Альтернатива: Двойной клик

Дважды кликните по файлу **`RUN_ME.bat`** в папке `app-ui`

---

## Если не работает

### Вариант A: Очистите кэш
```powershell
cd C:\Users\Dell\Documents\rag-ux-starter\app-ui
Remove-Item -Recurse -Force .next
npm run dev
```

### Вариант B: Переустановите зависимости
```powershell
cd C:\Users\Dell\Documents\rag-ux-starter\app-ui
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
npm run dev
```

### Вариант C: Используйте другой порт
```powershell
cd C:\Users\Dell\Documents\rag-ux-starter\app-ui
npx next dev -p 3001
```

Затем откройте: http://localhost:3001

---

## Проверка

Сервер запустился если вы видите:

```
▲ Next.js 16.0.1 (webpack)
- Local:        http://localhost:3000
✓ Ready in 3s
```

---

**Нужна помощь?** См. `TROUBLESHOOTING.md`





