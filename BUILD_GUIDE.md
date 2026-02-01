# Руководство по Сборке - Image to PDF Converter

## 📦 Автоматическая Сборка (Рекомендуется)

Проект настроен для автоматической сборки на всех платформах через **GitHub Actions**.

### Как Запустить:

1. **Push в main ветку:**
   ```bash
   git add .
   git commit -m "Release v0.1.0"
   git push origin main
   ```

2. **Создать Release Tag:**
   ```bash
   git tag v0.1.0
   git push origin v0.1.0
   ```

3. **Или через GitHub UI:**
   - Перейти в раздел "Actions"
   - Выбрать "Build Application"
   - Нажать "Run workflow"

### Результат:

GitHub Actions автоматически создаст сборки для:
- ✅ **Windows:** `.msi` и `.exe` (NSIS installer)
- ✅ **macOS:** `.dmg` и `.app`
- ✅ **Linux:** `.deb` и `.AppImage`

Артефакты будут доступны в разделе "Actions" → "Artifacts"

При создании тега `v*` автоматически создастся GitHub Release со всеми файлами.

---

## 🖥️ Локальная Сборка

### Windows

**Требования:**
- Windows 10/11
- Node.js 20+
- Rust (установить через https://rustup.rs/)
- Visual Studio Build Tools или Visual Studio с C++ workload

**Команды:**
```powershell
# Установить pnpm
npm install -g pnpm

# Клонировать репозиторий
git clone <your-repo-url>
cd images-to-pdf

# Установить зависимости
pnpm install

# Собрать приложение
pnpm tauri build
```

**Результат:**
```
src-tauri/target/release/bundle/msi/*.msi
src-tauri/target/release/bundle/nsis/*.exe
```

---

### macOS

**Требования:**
- macOS 10.13+
- Node.js 20+
- Rust (установить через `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`)
- Xcode Command Line Tools

**Команды:**
```bash
# Установить pnpm
npm install -g pnpm

# Клонировать репозиторий
git clone <your-repo-url>
cd images-to-pdf

# Установить зависимости
pnpm install

# Собрать приложение
pnpm tauri build
```

**Результат:**
```
src-tauri/target/release/bundle/dmg/*.dmg
src-tauri/target/release/bundle/macos/*.app
```

---

### Linux

**Требования:**
- Ubuntu 22.04+ / Debian / Fedora / Arch
- Node.js 20+
- Rust
- System dependencies

**Ubuntu/Debian:**
```bash
# Установить системные зависимости
sudo apt update
sudo apt install -y \
  libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libssl-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  patchelf

# Установить Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Установить pnpm
npm install -g pnpm

# Клонировать и собрать
git clone <your-repo-url>
cd images-to-pdf
pnpm install
pnpm tauri build
```

**Результат:**
```
src-tauri/target/release/bundle/deb/*.deb
src-tauri/target/release/bundle/appimage/*.AppImage
```

---

## 🚀 Быстрый Старт для Windows

Если у вас нет доступа к Windows машине, используйте **GitHub Actions**:

### Вариант 1: Через GitHub UI
1. Fork репозиторий
2. Перейти в "Actions"
3. Включить workflows (если нужно)
4. Нажать "Run workflow" → "Build Application"
5. Дождаться завершения (~10-15 минут)
6. Скачать артефакты

### Вариант 2: Через Git Tag
```bash
# На вашем Mac
git tag v0.1.0
git push origin v0.1.0

# GitHub Actions автоматически:
# - Соберёт для Windows, macOS, Linux
# - Создаст Draft Release
# - Прикрепит все установщики
```

---

## 📋 Что Создаётся на Каждой Платформе

### Windows
- **MSI Installer** (Windows Installer)
  - Путь: `src-tauri/target/release/bundle/msi/`
  - Формат: `Image to PDF Converter_0.1.0_x64_en-US.msi`
  - Поддерживает: установка/удаление через Control Panel

- **NSIS Installer** (Nullsoft Scriptable Install System)
  - Путь: `src-tauri/target/release/bundle/nsis/`
  - Формат: `Image to PDF Converter_0.1.0_x64-setup.exe`
  - Поддерживает: custom install wizard

### macOS
- **DMG Image**
  - Путь: `src-tauri/target/release/bundle/dmg/`
  - Формат: `Image to PDF Converter_0.1.0_aarch64.dmg` (ARM64)
  - Формат: `Image to PDF Converter_0.1.0_x64.dmg` (Intel)

- **App Bundle**
  - Путь: `src-tauri/target/release/bundle/macos/`
  - Формат: `Image to PDF Converter.app`

### Linux
- **DEB Package** (Debian/Ubuntu)
  - Путь: `src-tauri/target/release/bundle/deb/`
  - Формат: `image-to-pdf-converter_0.1.0_amd64.deb`
  - Установка: `sudo dpkg -i *.deb`

- **AppImage** (Universal)
  - Путь: `src-tauri/target/release/bundle/appimage/`
  - Формат: `image-to-pdf-converter_0.1.0_amd64.AppImage`
  - Запуск: `chmod +x *.AppImage && ./*.AppImage`

---

## 🔧 Настройка Сборки

### Изменить Версию
Файл: `src-tauri/tauri.conf.json`
```json
{
  "version": "0.1.0"  // Изменить здесь
}
```

Также в: `package.json`
```json
{
  "version": "0.1.0"  // И здесь
}
```

### Изменить Иконку
Заменить файлы в `src-tauri/icons/`:
- `icon.icns` (macOS)
- `icon.ico` (Windows)
- `*.png` (Linux, разные размеры)

### Изменить Bundle Identifier
Файл: `src-tauri/tauri.conf.json`
```json
{
  "identifier": "com.kdevlab.imageconverter"  // Изменить
}
```

---

## ⚡ Советы по Оптимизации Сборки

### 1. Кэширование для Быстрых Пересборок
GitHub Actions использует `Swatinem/rust-cache@v2` для кэширования Rust зависимостей.

### 2. Параллельная Сборка
Workflow собирает все платформы параллельно (~10-15 минут для всех).

### 3. Локальная Оптимизация
```bash
# Использовать sccache для кэширования Rust компиляций
cargo install sccache
export RUSTC_WRAPPER=sccache

# Или использовать mold linker (Linux)
sudo apt install mold
export RUSTFLAGS="-C link-arg=-fuse-ld=mold"
```

---

## 🐛 Troubleshooting

### Windows: "MSVC not found"
```powershell
# Установить Visual Studio Build Tools
# https://visualstudio.microsoft.com/downloads/
# Выбрать "Desktop development with C++"
```

### macOS: "Command Line Tools not found"
```bash
xcode-select --install
```

### Linux: "webkit2gtk not found"
```bash
sudo apt install libwebkit2gtk-4.1-dev
```

### GitHub Actions: "Workflow not running"
1. Проверить что workflows включены в Settings → Actions
2. Проверить что `.github/workflows/build.yml` в репозитории
3. Проверить permissions в Settings → Actions → General

---

## 📊 Размеры Сборок (Примерно)

| Платформа | Installer Size | Installed Size |
|-----------|---------------|----------------|
| Windows (MSI) | ~8 MB | ~20 MB |
| Windows (NSIS) | ~8 MB | ~20 MB |
| macOS (DMG) | ~6 MB | ~16 MB |
| Linux (DEB) | ~8 MB | ~20 MB |
| Linux (AppImage) | ~25 MB | N/A (portable) |

---

## 🎯 Рекомендации

**Для разработки:**
- Используйте `pnpm tauri dev` на вашей платформе

**Для тестирования:**
- Соберите локально на вашей платформе

**Для релиза:**
- Используйте GitHub Actions для всех платформ
- Создайте git tag для автоматического Release

**Для дистрибуции:**
- Windows: MSI (для enterprise) или NSIS (для обычных пользователей)
- macOS: DMG (универсальный формат)
- Linux: AppImage (portable) или DEB (для Debian/Ubuntu)

---

## 📝 Примечания

- Windows сборка требует ~2-3 GB дискового пространства
- macOS может создать universal binary (ARM64 + x64) при настройке
- Linux AppImage работает на большинстве дистрибутивов без установки
- Все сборки включают оптимизацию изображений (oxipng)

---

**Последнее обновление:** 2026-02-01
**Версия:** 0.1.0
