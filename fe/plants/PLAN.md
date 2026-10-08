# Frontend Plan - Web Hoc Tieng Anh

## 1. Hien trang

- React 19, TypeScript va Vite.
- `src/App.tsx` hien la giao dien mac dinh cua Vite.
- Chua co routing, component nghiep vu, ket noi backend hoac quan ly du lieu.
- Chi su dung CSS hien co trong `src/App.css` va `src/index.css`.

## 2. Muc tieu frontend

- Tim tu tieng Anh va xem nghia tieng Viet.
- Luu tu vao mot bo tu.
- Tu dong tao flashcard sau khi luu tu.
- Quan ly cac bo tu.
- Hoc, lat va danh gia flashcard.
- Hien thi tot tren desktop va mobile.

## 3. Thu tu trien khai

### Buoc 1 - Cai dat nen tang

- Cai `react-router-dom`.
- Tao cau truc `components`, `pages`, `services`, `types` va `hooks`.
- Doi ten title trong `index.html`.
- Xoa code mau cua Vite trong `App.tsx`.
- Tao bien moi truong cho URL backend, vi du `VITE_API_URL`.

Hoan thanh khi frontend chay duoc va co cac route rong co ban.

### Buoc 2 - Tao kieu du lieu

Tao `src/types/index.ts` voi cac kieu:

- `DictionaryResult`.
- `Meaning`.
- `Word`.
- `WordSet`.
- `Flashcard`.
- `ReviewResult`.

Kieu du lieu phai khop voi response ma backend cong bo.

### Buoc 3 - Tao lop goi API

Tao cac file:

- `src/services/api.ts`: ham request dung chung, xu ly loi va JSON.
- `src/services/dictionaryApi.ts`: tim tu.
- `src/services/wordSetApi.ts`: tao, sua, xoa va lay bo tu.
- `src/services/flashcardApi.ts`: lay flashcard va gui ket qua hoc.

Khong goi API truc tiep trong component giao dien.

### Buoc 4 - Tao routing va bo cuc ung dung

Du kien cac route:

- `/`: trang tim kiem.
- `/word-sets`: danh sach bo tu.
- `/word-sets/:id`: chi tiet mot bo tu.
- `/word-sets/:id/study`: man hinh hoc flashcard.

Tao layout chung gom header, navigation va khu vuc noi dung.

### Buoc 5 - Xay dung trang tim kiem

Tao cac component:

- `SearchBar`.
- `SearchResult`.
- `MeaningList`.
- `PronunciationButton`.
- `SaveWordDialog`.
- `CreateWordSetDialog`.

Luong xu ly:

1. Nguoi dung nhap tu.
2. Frontend goi `GET /api/dictionary/search?word=...`.
3. Hien thi loading trong luc cho ket qua.
4. Hien thi nghia, phien am, vi du va audio neu co.
5. Nguoi dung chon bo tu va bam luu.
6. Hien thi thong bao luu thanh cong.

Can xu ly cac truong hop: tu rong, khong tim thay, loi API, tu da ton tai.

### Buoc 6 - Xay dung trang quan ly bo tu

Tao:

- `WordSetListPage`.
- `WordSetCard`.
- `WordSetForm`.
- `WordSetDetailPage`.

Moi bo tu hien thi ten, mo ta, so flashcard, tien do va nut bat dau hoc.

Ho tro tao, sua va xoa bo tu. Khi xoa phai co xac nhan.

### Buoc 7 - Xay dung flashcard

Tao component `Flashcard` co cac trang thai:

- Mat truoc: tu tieng Anh va phien am.
- Mat sau: nghia tieng Viet, loai tu, vi du va audio.
- Trang thai dang lat.
- Trang thai khong con flashcard.

Tao `StudyPage` voi cac nut danh gia:

- `Again`: chua nho.
- `Hard`: kho.
- `Good`: da nho.
- `Easy`: rat de.

Sau khi danh gia, goi backend va chuyen sang the tiep theo.

### Buoc 8 - Loading, loi va responsive

- Tao loading state cho moi request.
- Tao empty state khi chua co du lieu.
- Tao error state co nut thu lai.
- Hien thi toast sau cac thao tac thanh cong.
- Kiem tra giao dien o man hinh mobile, tablet va desktop.
- Dam bao nut va form co the su dung bang ban phim.

### Buoc 9 - Kiem thu va nghiem thu

Kiem tra thu cong:

- Tim tu hop le.
- Tim tu khong ton tai.
- Luu tu vao bo tu hien co.
- Tao bo tu moi ngay tu man hinh luu tu.
- Khong tao flashcard trung trong cung bo.
- Lat flashcard.
- Danh gia flashcard va chuyen the.
- Xem bo tu rong.
- Xu ly khi backend khong chay.

Chay lenh:

```bash
pnpm lint
pnpm build
```

## 4. Cau truc frontend du kien

```text
src/
├── components/
│   ├── Flashcard.tsx
│   ├── SearchBar.tsx
│   ├── SearchResult.tsx
│   ├── WordSetCard.tsx
│   └── WordSetForm.tsx
├── hooks/
├── pages/
│   ├── SearchPage.tsx
│   ├── WordSetsPage.tsx
│   ├── WordSetDetailPage.tsx
│   └── StudyPage.tsx
├── services/
├── types/
├── App.tsx
└── index.css
```

## 5. Tieu chi hoan thanh MVP

- Nguoi dung tim duoc tu qua backend.
- Ket qua co nghia tieng Viet va thong tin co ban.
- Nguoi dung tao duoc bo tu.
- Luu tu se tao flashcard trong bo tu da chon.
- Nguoi dung hoc va danh gia duoc flashcard.
- Du lieu va loi duoc hien thi ro rang.
- Frontend build va lint thanh cong.
