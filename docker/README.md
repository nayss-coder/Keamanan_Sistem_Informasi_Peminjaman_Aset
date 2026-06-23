# Docker — Konfigurasi Apache Security Stack

Folder ini berisi konfigurasi untuk komponen keamanan proyek SI-ALAT.
Diisi oleh tim security (Kila untuk APISIX, Nahda untuk Fortress, Agidia untuk SkyWalking).

## Struktur

```
docker/
├── apisix/          ← Konfigurasi Apache APISIX (API Gateway)
│   └── config.yaml  # Route, plugin JWT, rate limiting, TLS
│
├── fortress/        ← Konfigurasi Apache Fortress (RBAC)
│   └── ...          # Role definitions, permission policies
│
├── skywalking/      ← Konfigurasi Apache SkyWalking (Observability)
│   └── ...          # OAP server config, agent config
│
└── mysql/           ← Init script database (sudah ada lewat db-migrate.js)
    └── init.sql
```

## Cara Pakai (nanti setelah diisi)

```bash
docker compose up -d
```

Semua service akan jalan bersamaan:
- SI-ALAT app   → http://localhost:3000
- APISIX        → http://localhost:9080 (proxy ke app)
- APISIX Dashboard → http://localhost:9000
- SkyWalking UI → http://localhost:8088
