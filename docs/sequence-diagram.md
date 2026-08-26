# Sequence Diagram — Kosa Kata Wolio

Gabungan 4 alur utama: Login Admin, Kelola Kata (CRUD + Audio), Sinkronisasi Mobile, dan Kerjakan Kuis.

```mermaid
sequenceDiagram
    actor Admin
    actor UserMobile as Pengguna (Mobile)
    participant WebAdmin as Aplikasi Web Admin
    participant AppMobile as Aplikasi Mobile
    participant API as REST API
    participant DB as Database (MySQL)

    %% ===== 1. LOGIN ADMIN =====
    rect rgb(230, 240, 255)
    Note over Admin, DB: 1. Login Admin
    Admin->>WebAdmin: Input username & password
    WebAdmin->>API: POST /auth/login
    API->>DB: SELECT pengguna WHERE nama_pengguna = ?
    DB-->>API: Data pengguna
    API->>API: Verifikasi kata_sandi (bcrypt)
    alt Kredensial valid
        API->>API: Generate JWT token
        API-->>WebAdmin: 200 OK { token, user }
        WebAdmin-->>Admin: Redirect ke dashboard
    else Kredensial salah
        API-->>WebAdmin: 401 Unauthorized
        WebAdmin-->>Admin: Tampilkan pesan error
    end
    end

    %% ===== 2. KELOLA KATA =====
    rect rgb(230, 255, 230)
    Note over Admin, DB: 2. Kelola Kata (CRUD + Audio)
    Admin->>WebAdmin: Isi form kata baru (ID, daerah, aksara, kategori)
    WebAdmin->>API: POST /words { Authorization: Bearer token }
    API->>API: Verifikasi token & role
    API->>DB: INSERT INTO kata (...)
    DB-->>API: Data kata tersimpan
    API-->>WebAdmin: 201 Created
    WebAdmin-->>Admin: Tampilkan kata baru di list

    Admin->>WebAdmin: Upload audio pelafalan
    WebAdmin->>API: POST /words/audio { wordId, file }
    API->>API: Simpan file ke storage
    API->>DB: INSERT INTO audio (kata_id, url)
    DB-->>API: Data audio tersimpan
    API-->>WebAdmin: 201 Created
    WebAdmin-->>Admin: Tampilkan audio ter-attach
    end

    %% ===== 3. SINKRONISASI MOBILE =====
    rect rgb(255, 245, 220)
    Note over UserMobile, DB: 3. Sinkronisasi Data (Mobile)
    AppMobile->>API: GET /sync/version
    API->>DB: SELECT nilai FROM meta_sinkronisasi
    DB-->>API: Versi data terbaru
    API-->>AppMobile: 200 OK { version }
    AppMobile->>AppMobile: Bandingkan versi lokal vs server
    alt Ada data baru
        AppMobile->>API: GET /sync/categories?updatedAfter=...
        API->>DB: SELECT kategori WHERE diperbarui_pada > ?
        DB-->>API: List kategori
        API-->>AppMobile: 200 OK { data, meta }
        AppMobile->>API: GET /sync/words?updatedAfter=...
        API->>DB: SELECT kata WHERE diperbarui_pada > ?
        DB-->>API: List kata + relasi
        API-->>AppMobile: 200 OK { data, meta }
        AppMobile->>AppMobile: Simpan ke local storage (SQLite)
    else Sudah terbaru
        AppMobile->>AppMobile: Gunakan data lokal
    end
    end

    %% ===== 4. KERJAKAN KUIS =====
    rect rgb(255, 230, 230)
    Note over UserMobile, DB: 4. Kerjakan Kuis
    UserMobile->>AppMobile: Pilih tingkat kuis (EASY/MEDIUM/HARD)
    AppMobile->>API: GET /quiz/public?level=EASY
    API->>DB: SELECT kuis WHERE tingkat = ?
    DB-->>API: List kuis
    API-->>AppMobile: 200 OK { data }
    UserMobile->>AppMobile: Pilih salah satu kuis
    AppMobile->>API: GET /quiz/:id/play
    API->>DB: SELECT soal_kuis + kata JOIN
    DB-->>API: Soal & pilihan jawaban
    API-->>AppMobile: 200 OK { quiz, questions }
    AppMobile-->>UserMobile: Tampilkan soal satu per satu

    UserMobile->>AppMobile: Jawab semua soal
    AppMobile->>API: POST /quiz/:id/submit { answers }
    API->>DB: SELECT soal_kuis WHERE kuis_id = ?
    DB-->>API: Kunci jawaban
    API->>API: Hitung skor (cocokkan jawaban)
    API-->>AppMobile: 200 OK { score, correct, total }
    AppMobile-->>UserMobile: Tampilkan hasil skor
    end
```

Sumber flow: [auth.controller.ts](../src/modules/auth/auth.controller.ts), [words.controller.ts](../src/modules/words/words.controller.ts), [sync.controller.ts](../src/modules/sync/sync.controller.ts), [quiz.controller.ts](../src/modules/quiz/quiz.controller.ts).
