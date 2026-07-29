# Deploy — staging (`onepage-dev.kimtv.net`)

CI/CD tự động: **push vào nhánh `staging`** → GitHub Actions build image → đẩy **GHCR** → SSH vào server chạy `docker compose pull && up -d`.

App container chỉ nghe `127.0.0.1:3000`; **nginx trên host** terminate TLS và proxy vào.

```
[push staging] → GitHub Actions → ghcr.io/mcolin-frontend/mega-site-one-page-kimtv:staging
                                          │ (SSH)
                                          ▼
   nginx :443 (onepage-dev.kimtv.net) → 127.0.0.1:3000 (container)
```

---

## 1. Cấu hình GitHub (một lần)

**Settings → Secrets and variables → Actions**

Secrets:

| Secret | Giá trị |
|--------|---------|
| `SSH_HOST` | IP/hostname server |
| `SSH_USER` | user SSH (có quyền chạy docker) |
| `SSH_PRIVATE_KEY` | private key SSH (deploy key vào server) |
| `SSH_PORT` | *(tuỳ chọn)* nếu SSH khác cổng 22 |

Variables:

| Variable | Giá trị |
|----------|---------|
| `NEXT_PUBLIC_WS_BASE_URL` | `wss://ws.kimtv.org` |
| `DEPLOY_DIR` | *(tuỳ chọn)* mặc định `/opt/onepage-dev` |

> Không cần PAT cho GHCR: job deploy dùng `GITHUB_TOKEN` (còn hiệu lực trong lúc run) để `docker login ghcr.io` trên server và pull image.

---

## 2. Chuẩn bị server (một lần)

Yêu cầu: đã có **Docker + docker compose v2** và **nginx**.

```bash
# a) Deploy dir + compose + env
sudo mkdir -p /opt/onepage-dev
sudo cp docker-compose.yml /opt/onepage-dev/
sudo cp .env.example /opt/onepage-dev/.env      # rồi chỉnh giá trị nếu cần

# b) Đặt cert/key TLS (KHÔNG commit vào git)
sudo mkdir -p /etc/nginx/ssl/onepage-dev.kimtv.net
sudo cp fullchain.pem /etc/nginx/ssl/onepage-dev.kimtv.net/fullchain.pem
sudo cp privkey.pem   /etc/nginx/ssl/onepage-dev.kimtv.net/privkey.pem
sudo chmod 600 /etc/nginx/ssl/onepage-dev.kimtv.net/privkey.pem

# c) vhost nginx
sudo cp nginx/onepage-dev.kimtv.net.conf /etc/nginx/conf.d/
sudo nginx -t && sudo systemctl reload nginx
```

> Cert self-signed: `fullchain.pem` chính là file certificate bạn có; `privkey.pem` là private key tương ứng.

---

## 3. Chạy lần đầu (bootstrap)

Bình thường CI tự deploy. Chạy tay lần đầu (hoặc khi cần):

```bash
cd /opt/onepage-dev
echo "$GHCR_TOKEN" | docker login ghcr.io -u <github-username> --password-stdin
docker compose pull
docker compose up -d
docker compose ps
```

`GHCR_TOKEN` = một GitHub token có scope `read:packages` (dùng tay). Trong CI thì tự động bằng `GITHUB_TOKEN`.

---

## 4. Kiểm tra

```bash
docker compose ps                         # State = running / healthy
curl -k https://onepage-dev.kimtv.net     # -k vì cert self-signed
docker compose logs -f web                # xem log app
```

---

## 5. Vận hành

| Việc | Lệnh |
|------|------|
| Xem log | `docker compose logs -f web` |
| Restart | `docker compose restart web` |
| Cập nhật tay | `docker compose pull && docker compose up -d` |
| Rollback | đổi tag image sang `staging-<sha>` cũ trong `docker-compose.yml` rồi `up -d` |

> **Bảo mật:** private key TLS từng được chia sẻ qua kênh chat nên coi như đã lộ — nên tạo lại cặp cert/key mới cho `onepage-dev.kimtv.net` khi thuận tiện.
