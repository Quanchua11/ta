# Backend Plan - Web Hoc Tieng Anh

## 1. Hien trang

- Thu muc backend moi chi co `package.json`.
- Chua co framework server, database, ORM, source code hoac test.
- Backend se la lop trung gian giua frontend va API tu dien Anh-Viet.

## 2. Muc tieu backend

- Cung cap API tim tu tieng Anh.
- Goi va chuan hoa du lieu tu API tu dien Anh-Viet.
- Luu tu, nghia, bo tu va flashcard.
- Tu dong tao flashcard khi nguoi dung luu tu.
- Luu ket qua hoc de phuc vu tien do va lich on tap.

## 3. Cong nghe de xuat

- Node.js.
- Express.
- TypeScript.
- Prisma ORM.
- SQLite trong giai doan phat trien.
- PostgreSQL khi dua len production.
- Vitest hoac Jest cho test.

## 4. Thu tu trien khai

### Buoc 1 - Khoi tao backend

- Cai Express, TypeScript, Prisma va cac goi type can thiet.
- Tao script `dev`, `build`, `start`, `lint` va `test`.
- Tao `tsconfig.json`.
- Tao file `.env.example`.
- Tao server entry point tai `src/server.ts`.

Bien moi truong du kien:

```env
PORT=3000
DATABASE_URL="file:./dev.db"
DICTIONARY_API_URL=
DICTIONARY_API_KEY=
FRONTEND_URL=http://localhost:5173
```

### Buoc 2 - Chon va tich hop API tu dien

Truoc khi code phai xac nhan:

- API co du lieu Anh-Viet.
- Cach xac thuc va gioi han request.
- Dieu khoan cho phep luu du lieu.
- Cau truc phien am, loai tu, nghia, vi du va audio.

Khong de frontend goi truc tiep API tu dien.

Tao interface `DictionaryProvider` de co the thay API sau nay:

```ts
interface DictionaryProvider {
  search(word: string): Promise<DictionaryResult | null>
}
```

Tao `dictionary.service.ts` de:

1. Chuan hoa tu dau vao.
2. Goi API tu dien.
3. Chuyen response ve format noi bo.
4. Xu ly timeout, rate limit va loi API.

### Buoc 3 - Tao database schema

Tao cac model Prisma:

#### `User`

- `id`.
- `email`.
- `passwordHash`.
- `createdAt`.
- `updatedAt`.

Neu chua lam dang nhap, co the bo qua model nay trong MVP va dung user mac dinh.

#### `WordSet`

- `id`.
- `name`.
- `description`.
- `createdAt`.
- `updatedAt`.

#### `Word`

- `id`.
- `word`.
- `normalizedWord`.
- `phonetic`.
- `audioUrl`.
- `createdAt`.

Dat unique index cho `normalizedWord`.

#### `WordDefinition`

- `id`.
- `wordId`.
- `partOfSpeech`.
- `vietnameseMeaning`.
- `englishExample`.
- `source`.

#### `Flashcard`

- `id`.
- `wordId`.
- `wordSetId`.
- `status`.
- `correctCount`.
- `wrongCount`.
- `nextReviewAt`.
- `createdAt`.
- `updatedAt`.

Dat unique constraint cho cap `wordId` va `wordSetId`.

#### `ReviewLog`

- `id`.
- `flashcardId`.
- `result`.
- `reviewedAt`.

### Buoc 4 - Tao lop server

Du kien cau truc:

```text
src/
├── config/
├── controllers/
├── middlewares/
├── routes/
├── services/
├── providers/
├── repositories/
├── types/
├── app.ts
└── server.ts
```

Them middleware:

- JSON parser.
- CORS cho frontend.
- Request logging.
- Error handler dung chung.
- 404 handler.

### Buoc 5 - Xay dung API tim tu

Endpoint:

```http
GET /api/dictionary/search?word=hello
```

Luong xu ly:

1. Kiem tra query khong rong.
2. Chuan hoa chuoi tim kiem.
3. Tim tu trong database.
4. Neu co, tra du lieu da luu.
5. Neu chua co, goi `DictionaryProvider`.
6. Chuan hoa ket qua va tra ve frontend.

Response noi bo:

```json
{
  "word": "hello",
  "phonetic": "/heˈləʊ/",
  "meanings": [
    {
      "partOfSpeech": "interjection",
      "vietnamese": ["xin chao"],
      "examples": ["Hello, how are you?"]
    }
  ],
  "audioUrl": null,
  "source": "dictionary-provider"
}
```

### Buoc 6 - API luu tu va tao flashcard

Endpoint:

```http
POST /api/words
```

Body:

```json
{
  "word": "hello",
  "wordSetId": "set-id"
}
```

Backend phai thuc hien trong mot transaction:

1. Kiem tra bo tu ton tai.
2. Tim hoac tao `Word`.
3. Luu cac dinh nghia.
4. Kiem tra flashcard trung.
5. Tao `Flashcard` neu chua co.
6. Tra ve word va flashcard vua tao.

Neu flashcard da ton tai, tra response ro rang va khong tao ban ghi trung.

### Buoc 7 - API quan ly bo tu

```http
GET    /api/word-sets
POST   /api/word-sets
GET    /api/word-sets/:id
PATCH  /api/word-sets/:id
DELETE /api/word-sets/:id
```

Khi xoa bo tu, phai xac dinh chinh sach xoa flashcard thuoc bo do. MVP de xuat xoa cascade cac flashcard, nhung khong xoa tu dung chung.

### Buoc 8 - API hoc flashcard

Lay danh sach:

```http
GET /api/word-sets/:id/flashcards
```

Lay flashcard tiep theo can hoc:

```http
GET /api/word-sets/:id/flashcards/next
```

Gui ket qua hoc:

```http
POST /api/flashcards/:id/review
```

Body:

```json
{
  "result": "good"
}
```

Gia tri hop le: `again`, `hard`, `good`, `easy`.

MVP co the dung lich don gian:

- `again`: xem lai ngay.
- `hard`: sau 1 ngay.
- `good`: sau 3 ngay.
- `easy`: sau 7 ngay.

### Buoc 9 - Validation va bao mat

- Kiem tra input bang Zod hoac thu vien tuong duong.
- Gioi han do dai tu, ten bo tu va mo ta.
- Khong ghi log API key.
- Them timeout cho request den API tu dien.
- Them rate limit cho endpoint tim tu.
- Cau hinh CORS chi cho phep frontend hop le.
- Neu co dang nhap, bam mat khau bang bcrypt va dung JWT/session.

### Buoc 10 - Kiem thu

Kiem thu cac truong hop:

- Tim tu hop le.
- Query rong.
- Tu khong ton tai.
- API tu dien timeout.
- Luu tu moi.
- Luu tu trung.
- Tao flashcard tu dong.
- Tao bo tu.
- Xoa bo tu.
- Gui ket qua hoc khong hop le.
- Cap nhat lich on tap.

Them integration test cho cac route chinh va unit test cho `DictionaryProvider`.

## 5. API contract voi frontend

Backend can thong nhat truoc cac response:

- `200`: doc du lieu thanh cong.
- `201`: tao du lieu thanh cong.
- `400`: input khong hop le.
- `404`: khong tim thay tai nguyen.
- `409`: du lieu trung.
- `429`: vuot gioi han request.
- `500`: loi server.
- `502`: API tu dien loi.

Tat ca loi nen co dang:

```json
{
  "error": {
    "code": "WORD_NOT_FOUND",
    "message": "Khong tim thay tu"
  }
}
```

## 6. Tieu chi hoan thanh MVP

- Backend khoi dong duoc bang lenh dev.
- Database migration chay thanh cong.
- Tim tu va tra ve du lieu da chuan hoa.
- Tao bo tu duoc.
- Luu tu tao flashcard trong transaction.
- Khong co flashcard trung trong cung bo.
- Lay va danh gia flashcard duoc.
- Loi tu dien, loi input va loi database duoc xu ly.
- Co test cho cac luong chinh.
