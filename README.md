# 學習島 — NAS Docker 版

七年級翰林版上學期自架練習 app：國文、英文、數學、生物、歷史、地理、公民，7 科、25 章、300 題，每題都有解析，每章都有複習講義。

和靜態版最大的不同：**有資料庫和帳號**。每個小朋友用自己的帳號登入，進度、錯題、星星分開記，iPad 練完、筆電登入同一個帳號就看得到。弱點補強用真實日期計算：最近 7 天錯題、最近 30 天錯誤率最高的章節、重複錯的觀念，都會真的影響出題。

題目依翰林七上課綱重點自編，非課本原文；段考範圍以學校課本與老師公告為準。

## 內容

- **7 科 25 章 300 題**：每章 12 題，每題 4 個選項，都有解析；困難概念會舉例說明，先引導思考再給答案。
- **島嶼地圖首頁**：一屏看完 7 座科目島嶼（國文、英文、數學、生物、歷史、地理、公民），每座島顯示章數、星星與掌握進度，點進去再選年級；首頁下方有一條馬路，小車會開來開去（純裝飾）。
- **年級選擇**：每科都有七上／七下／八上／八下／九上／九下六個年級按鈕；目前只有七上有題目，其他年級顯示「即將推出，敬請期待」，不放假題目。
- **複習講義**：每章有重點整理、容易錯的地方、想一想思考題。
- **延伸資源**：均一教育平台、教育部因材網、學習吧、Cool English（教育部），皆為真實網址。
- **弱點補強**：出題比例弱點 70%、基礎複習 20%、挑戰題 10%。弱點題優先取：最近 7 天錯過的題目 → 重複錯的觀念 → 最近 30 天錯誤率最高的章節 → 段考重點章節；也有均衡模式。
- **複習試卷產生器**：在每座島裡面生成**本科**複習卷（一次只考一科，不混科），可選題數與模式，測驗模式作答後結果會回饋到弱點紀錄，也可列印／下載 HTML（題目與答案解析分開）。題數依該科題量：國文／英文／數學／生物最多 40 題，歷史／地理／公民最多 30 題。
- **錯題本**：自動收集答錯的題目，可重練。
- **家長看板**：每個學生的作答數、答對率、最近 7 天錯題、錯誤率最高章節、重複錯的觀念、最近錯題；可建立學生帳號、重設學生密碼，或刪除學生帳號（刪除時該學生的作答紀錄、錯題本、星星一併清除，管理員帳號不能刪）。
- **影音教學**：來自網友分享的「國中生學習島」整理的 YouTube 頻道與網站，共 10 座島、42 個資源（見下方「影音教學資源」）。

## 影音教學資源

來源：網友分享的學習資源整理「國中生學習島」（https://iridescent-lolly-a19324.netlify.app/）。

| 島 | 數量 | 對應 |
|---|---:|---|
| 數學島 | 4 | 七上數學 |
| 自然島 | 8 | 自然／生物延伸（七上生物相關） |
| 理化島 | 5 | 八年級預習，不在七上段考範圍 |
| 歷史、社會島 | 6 | 七上歷史（歷史、地理、公民三科都可參考） |
| 地理島 | 4 | 七上地理 |
| 生物島 | 2 | 七上生物 |
| 國文島 | 4 | 七上國文 |
| 英文島 | 3 | 七上英文 |
| 公民島 | 1 | 七上公民 |
| 工具島 | 5 | 不分科的學習方法與工具 |

- 每科的島嶼卡片下方、每章的複習講義下方，都會顯示該科的影音頻道；首頁也有完整的影音教學資源區。
- 這些連結大多會開啟 YouTube 搜尋結果（只有温展浩是直接的頻道連結 `https://www.youtube.com/@howhow22228`），請確認頻道名稱後再訂閱；外部連結未逐一驗證是否仍可開啟、是否對應正確頻道。
- 影音資源存在 `data/questions.json` 的 `video_resources` 裡（題庫版本 2），更新題庫時會一起更新，學生作答紀錄不受影響。

## 技術

- Node.js + Express + SQLite，單一容器，沒有另外的資料庫容器。
- 密碼用 bcrypt 雜湊儲存，不存明文。
- 資料存在 `/data/app.db`（掛載在 NAS 的 `./data` 資料夾），重開容器、更新程式都不會消失。
- 題目與講義存在 `data/questions.json`（有版本號），學生作答紀錄只存在 SQLite，兩者分開。

## 在 Synology NAS 上架設

### 1. 把專案放到 NAS

用 File Station 在 NAS 上建立一個資料夾，例如 `docker/learning-island`，把這個專案的全部檔案放進去（`Dockerfile`、`docker-compose.yml`、`.env`、`data/`、`public/`、`server.js`、`package.json` 等）。

### 2. 設定帳號密碼

把 `.env.example` 複製成 `.env`，填寫：

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=請改成你自己的強密碼
QUESTIONS_URL=
```

`ADMIN_PASSWORD` 留空時，第一次登入的預設密碼是 `changeme123`，登入後系統會要求立即更改。**請務必在第一次登入後改掉。**

`QUESTIONS_URL` 是題庫來源（選填），見下方「更新題目」。

### 3. 用 Container Manager 啟動

1. 開啟 Synology 的 **Container Manager** → **專案** → **新增**。
2. 專案名稱填 `learning-island`，路徑選剛才放專案的資料夾，來源選 `docker-compose.yml`。
3. 按下一步、完成，等容器狀態變成「執行中」。
4. 第一次啟動會比較久，因為要安裝套件、建立資料庫和題庫。

> **不用再手動 chown：** 這個 image 啟動時會先以 root 把 `/data`（含已存在的 `app.db`）的擁有權改給 `node`，再降權為 `node` 執行程式。以前 Synology 上 `data` 資料夾是 root 擁有時，容器會以 `SQLITE_CANTOPEN` 不斷重啟，現在拉新版 image、重新建立容器就會自己修好；app 本身仍以 `node` 身份執行，不以 root 跑。

### 4. 登入

在區網內的瀏覽器打開：

```
http://NAS的IP:8080
```

例如 NAS 的 IP 是 `192.168.1.10`，就是 `http://192.168.1.10:8080`。

1. 用管理員帳號登入（`.env` 裡的 `ADMIN_USERNAME`／`ADMIN_PASSWORD`），第一次登入會要求更改密碼。
2. 在「家長看板與管理」建立學生帳號，例如帳號 `student1`、顯示名稱填小朋友的名字、設一個密碼。
3. 小朋友用自己的學生帳號登入，iPad 或筆電都可以，登入同一個帳號進度就會同步。

## 用自己的 NAS 帳號跑容器（PUID／PGID）

預設容器內的 app 以 `node`（uid 1000）執行。如果你的 NAS 帳號不是 1000、想讓容器用你的身分跑（主機上的 `data` 資料夾就跟你的帳號一致，不用再遷就 1000）：

1. 用 SSH 連進 NAS，跑 `id`（或 `id 你的帳號`），記下 `uid=` 和 `gid=` 後面的數字，例如 `uid=1026(alantsai) gid=100(users)`。
2. 在專案的環境變數加上 `PUID=1026` 和 `PGID=100`（填你查到的數字）。
3. 停容器，把 `data` 資料夾刪掉（裡面沒有實際資料時最乾淨），再啟動／重新建立容器。entrypoint 會把新的 `data` 改成你的 uid/gid 擁有，app 就以你的身分執行，學生紀錄的檔案也都是你的帳號擁有。
4. 不想刪 `data` 也可以：先把資料夾擁有者改成你的帳號一次（File Station → 內容 → 擁有者，或 `sudo chown -R 你的帳號:users data`），再重建容器即可。

不用在 compose 加 `user:`，PUID／PGID 就夠了；加了 `user:` 反而會讓 entrypoint 無法修權限。

## Docker Hub 部署

此專案可透過 GitHub Actions build image 並推送到 private Docker Hub repository。

1. 在 Docker Hub 建立 private repository：

```text
<dockerhub-username>/learning-island
```

2. 在 Docker Hub 建立 Access Token。

3. 到 GitHub repository 的 `Settings` > `Secrets and variables` > `Actions`，新增：

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`

4. Push 到 `main` 分支後，GitHub Actions 會建立並推送：

```text
<dockerhub-username>/learning-island:latest
<dockerhub-username>/learning-island:<commit-sha>
```

5. 在 Synology Container Manager 的專案中使用 [docker-compose.synology.yml](./docker-compose.synology.yml) 內容，並依 [.env.synology.example](./.env.synology.example) 建立 `.env`。

Synology 使用 private image 前，需先在 NAS 登入 Docker Hub，或在 Container Manager 的 Registry 設定 Docker Hub 帳號。

## 安全提醒（重要）

- **只在區網內使用，或走 Tailscale。** 不要把 8080 埠直接對外開放到網際網路，也不要用路由器 port forwarding 對外。
- 管理員密碼和學生密碼不要用生日、123456 這類好猜的密碼。
- 這個 app 是給家人自己用的學習工具，不適合公開給不認識的人。
- `.env` 裡有密碼，**不要上傳到公開的 GitHub repo**。
- 想用自己的 NAS 帳號跑容器而不是預設的 uid 1000，見上方「用自己的 NAS 帳號跑容器（PUID／PGID）」。

## 備份

學生所有的作答紀錄、星星、錯題都在 NAS 上 `data/app.db` 這一個檔案裡。

- 備份：定期把 `data/` 資料夾複製一份到別的地方（例如 NAS 的另一個共用資料夾或外接硬碟）。
- 還原：把備份的 `app.db` 放回 `data/`，再重新啟動容器即可。
- 建議每個月備份一次，段考前再備份一次。

## 更新

這個專案有兩種更新，**學生資料都不會被清除**：

### A. 更新題目或講義（不用重建容器）

題目和講義只存在 `data/questions.json`，學生紀錄只存在 `app.db`，兩者分開。更新題目有兩種做法：

**做法 1：用 GitHub 題庫網址（建議）**

1. 把 `data/questions.json` 放到 GitHub repo（例如 `learning-island`），取得 Raw 網址，例如：
   `https://raw.githubusercontent.com/alan0830/learning-island/main/data/questions.json`
2. 把這個網址填進 `.env` 的 `QUESTIONS_URL`，重新啟動容器；或在網頁上「家長看板 → 題庫更新」手動輸入網址。
3. 以後要加題、改題：請 Muse 改 GitHub 上的 `questions.json`（Muse 可以直接推到你的 GitHub repo，就像以前改 `stock_web` 那樣），改好後家長在網頁上按「檢查題庫更新」，新題目就會匯入，舊的作答紀錄、星星、錯題全部保留。

**做法 2：直接換檔案**

把新的 `questions.json` 蓋掉 NAS 上 `data/questions.json`，重新啟動容器，啟動時會自動匯入，同樣不會清除作答紀錄。

### B. 更新程式（改功能、修 bug）

若用 Docker Hub 部署：push 到 `main` 後等 GitHub Actions 建好新 image，再到 NAS 的專案資料夾執行 `docker compose -f docker-compose.synology.yml pull && docker compose -f docker-compose.synology.yml up -d`（或在 Container Manager 裡重新建立容器），學生資料在 `data/app.db`，不會消失。

若用本機建置（`docker-compose.yml`）：

1. 把新版程式碼放到 NAS 的專案資料夾，蓋掉舊檔案（**不要刪除 `data/` 資料夾**）。
2. 在 Container Manager 裡重新建立容器（或用 `docker compose up -d --build`）。
3. 學生資料在 `data/app.db`，重建容器不會消失。

## 本機測試

```bash
npm install
npm test
```

測試會啟動伺服器，驗證登入、作答、弱點計算（用回溯日期的作答紀錄驗證 7 天／30 天規則）、試卷產生器、家長看板，以及題庫更新不會清除紀錄。

本機直接跑（不用 Docker）：

```bash
DATA_DIR=./.local-data ADMIN_PASSWORD=你的密碼 node server.js
# 打開 http://127.0.0.1:3000
```

## 檔案說明

| 檔案 | 說明 |
|---|---|
| `server.js` | 後端：登入、作答、弱點引擎、試卷、家長看板、題庫匯入 |
| `data/questions.json` | 題庫與講義（有版本號），由 `scripts/gen_questions.py` 產生 |
| `scripts/gen_questions.py` | 產生題庫的腳本，改題目後重新執行即可 |
| `public/` | 前端網頁（登入、群島、測驗、試卷、錯題本、家長看板） |
| `Dockerfile` / `docker-compose.yml` | 單一容器部署，8080 對應容器內 3000，`./data` 掛載到 `/data` |
| `tests/test.js` | 自動測試 |
| `.env.example` | 環境變數範例，複製成 `.env` 後填寫 |

## 常見問題

**Q：小朋友在 iPad 練完，筆電看不到進度？**
A：請確認兩台裝置登入的是同一個學生帳號、連的是同一個 NAS 上的學習島（同一個網址）。不同帳號的進度是分開的。

**Q：按了「檢查題庫更新」說沒有設定網址？**
A：請在 `.env` 填 `QUESTIONS_URL` 後重啟容器，或在網頁上手動輸入 GitHub Raw 網址再按一次。

**Q：忘記管理員密碼怎麼辦？**
A：停止容器，刪除 `data/app.db` 會重建管理員，但**所有學生紀錄也會一起消失**，請先確認有備份。沒有備份時，請不要這樣做，改為聯絡我協助重設。

**Q：題目有錯或想加題？**
A：告訴我哪一題、哪個章節要改，我改好 GitHub 上的 `questions.json` 後，你在網頁上按「檢查題庫更新」即可，學生的紀錄不會被清除。
