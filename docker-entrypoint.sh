#!/bin/sh
# 學習島 Docker entrypoint
# 以 root 啟動，先修好資料夾擁有權，再降權執行 app。
#
# 預設以 node（uid 1000）執行。想改用自己的 NAS 帳號跑，設 PUID/PGID
# 為該帳號的 uid/gid（在 NAS 上用 `id` 查詢，例如 PUID=1026 PGID=100），
# entrypoint 會把 /data 改成該 uid/gid 擁有、再以該身分執行 app。
# 這樣主機上的 data 資料夾就跟你自己的帳號一致，不用再遷就 1000。
#
# 背景：Synology 上 bind mount 的 ./data 常是 root 擁有或被設為唯讀，
# node（uid 1000）寫不進去，server.js 在啟動建立 /data/app.db 時會以
# "SqliteError: unable to open database file / SQLITE_CANTOPEN" 或
# "attempt to write a readonly database" 崩潰、容器不斷重啟。這裡在
# 啟動時自動把資料夾（含已存在的 app.db）chown 給 app 使用者並補上
# 讀寫權限，之後 app 仍以降權後的身分執行，不以 root 跑程式。
set -e

DATA_DIR="${DATA_DIR:-${DATA_PATH:-/data}}"
APP_UID="${PUID:-1000}"
APP_GID="${PGID:-1000}"

if [ "$(id -u)" = "0" ]; then
  mkdir -p "$DATA_DIR"
  # 資料夾裡只有 app.db / WAL 等小檔案，遞迴 chown 成本很低；
  # 連已存在的 root 擁有 app.db 一起修好，舊容器留下的檔案也能用。
  chown -R "$APP_UID:$APP_GID" "$DATA_DIR" || echo "[warn] 無法將 $DATA_DIR 改為 $APP_UID:$APP_GID 擁有，app 可能仍無法寫入資料庫" >&2
  # 只改擁有者不夠：若 app.db 或資料夾本身被設為唯讀，chown 後檔案仍是
  # 唯讀，app 照樣寫不進去。這裡一併把擁有者的讀寫權限補上。
  chmod -R u+rwX "$DATA_DIR" || echo "[warn] 無法將 $DATA_DIR 改為可讀寫，app 可能仍無法寫入資料庫" >&2
  # 題庫更新會寫回 /app/data/questions.json，也改成 app 使用者的，
  # 否則以 PUID 跑時該功能會因權限失敗。
  chown "$APP_UID:$APP_GID" /app/data /app/data/questions.json 2>/dev/null || true

  # 降權執行 app：setpriv 可直接用數字 uid/gid；其次 runuser，最後 su；
  # 三者皆無則明確報錯，不以 root 執行。
  if command -v setpriv >/dev/null 2>&1; then
    exec setpriv --reuid="$APP_UID" --regid="$APP_GID" --clear-groups "$@"
  elif command -v runuser >/dev/null 2>&1; then
    if [ "$APP_UID" = "1000" ]; then RUN_AS="node"; else RUN_AS="#$APP_UID"; fi
    exec runuser -u "$RUN_AS" -- "$@"
  elif command -v su >/dev/null 2>&1; then
    if [ "$APP_UID" = "1000" ]; then RUN_AS="node"; else RUN_AS="#$APP_UID"; fi
    exec su "$RUN_AS" -s /bin/sh -c 'exec "$@"' "$@"
  else
    echo "[error] 找不到降權工具（setpriv/runuser/su），拒絕以 root 執行 app" >&2
    exit 1
  fi
fi

# 已經不是 root（例如以 --user 啟動），直接執行。
exec "$@"
