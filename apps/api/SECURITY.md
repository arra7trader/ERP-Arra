# Security Guidelines

- Gunakan .env untuk semua secret dan credential
- Selalu validasi input user (DTO, class-validator)
- Gunakan JWT untuk autentikasi API
- Implementasi RBAC di semua endpoint sensitif
- Audit dependency secara berkala (npm audit)
- Gunakan HTTPS di production
- Logging dan monitoring aktif
