# CLAUDE.md — mega-site

---

## Next.js

Đây **không phải** Next.js bình thường — có breaking changes. Đọc guide trong `node_modules/next/dist/docs/` trước khi viết code. Tuân thủ deprecation notices.

---

## Cấu trúc thư mục

```
src/
├── app/          # Routing only — KHÔNG đặt logic ở đây. Page file chỉ là glue code
├── components/   # UI dùng chung: ui/ (shadcn), layout/, shared/
├── features/     # Module theo domain — mỗi feature độc lập, KHÔNG import chéo nhau
├── server/       # Server-only — KHÔNG bao giờ import vào Client Component
├── lib/          # Utilities, adapters, Zod schemas dùng chung
├── hooks/        # React hooks client-side dùng chung
├── config/       # env.ts, routes.ts, site.ts — mọi config đi qua đây
└── types/        # TypeScript types toàn cục
```

**Nguyên tắc:**

- `src/app/` chỉ routing — logic nghiệp vụ thuộc `src/features/`
- Feature A không import từ Feature B — dùng chung thì đưa lên `src/components/shared/` hoặc `src/lib/`
- Route constant dùng `@/config/routes` — không hardcode string `/blog/${slug}`
- Env var dùng `@/config/env` — không truy cập `process.env` rải rác
- Import dùng alias `@/` — không dùng relative path `../../../`

**Cấu trúc feature chuẩn:**

```
src/features/<ten>/
├── components/   # UI của feature
├── hooks/        # React hooks của feature
├── actions/      # Server Actions ("use server")
└── types.ts      # Types của feature
```

---

## Đặt tên

| Thứ                | Convention                                          | Ví dụ                  |
| ------------------ | --------------------------------------------------- | ---------------------- |
| File component     | `kebab-case.tsx`                                    | `post-card.tsx`        |
| File constants     | `<entity>.constants.ts`                             | `post.constants.ts`    |
| File models        | `<entity>.models.ts`                                | `post.models.ts`       |
| File api           | `<entity>.api.ts`                                   | `post.api.ts`          |
| File hook          | `use-<entity>.ts`                                   | `use-post.ts`          |
| File action        | `<verb>-<entity>.ts`                                | `create-post.ts`       |
| File utils         | `<entity>.utils.ts`                                 | `date.utils.ts`        |
| Interface          | `PascalCase` + `Interface`                          | `PostInterface`        |
| Model              | `PascalCase` + `Model`                              | `PostModel`            |
| Type (union/alias) | `PascalCase` + `Type`                               | `PostStatusType`       |
| Enum               | `PascalCase` + `Enum`, value `SCREAMING_SNAKE_CASE` | `PostStatusEnum.DRAFT` |
| Constant biến      | `SCREAMING_SNAKE_CASE`                              | `POST_MAX_TAGS`        |
| Schema (Zod)       | `PascalCase` + `Schema`                             | `CreatePostSchema`     |
| Component          | `PascalCase`                                        | `PostCard`             |
| Props              | `PascalCase` + `Props`                              | `PostCardProps`        |
| Hook               | `use` + `PascalCase`                                | `usePost`              |
| Icon file          | `ic-<ten>.tsx`                                      | `ic-arrow-right.tsx`   |
| Icon component     | `Ic` + `PascalCase`                                 | `IcArrowRight`         |

**Quy tắc:**

- Không dùng prefix `I` kiểu Hungary (`IPost` ✗)
- Object shape → `Interface`; union/alias/utility → `Type`
- Enum đặt cùng file `constants.ts` của feature
- Icon từ `lucide-react` ưu tiên — custom SVG mới dùng `Ic` prefix
- Import icon qua `@icons`, ảnh qua `@assets/images/...`

---

## Git

**Tên nhánh:** `<type>/<ten-ngan-gon>` — kebab-case, tối đa 5 từ

| Type        | Dùng khi                |
| ----------- | ----------------------- |
| `feat/`     | Tính năng mới           |
| `fix/`      | Sửa bug                 |
| `refactor/` | Tái cấu trúc            |
| `style/`    | CSS/UI, không đổi logic |
| `chore/`    | Config, deps, tooling   |
| `hotfix/`   | Fix khẩn cấp production |

**Commit message:** Conventional Commits — `<type>(<scope>): <mô tả>`

- Viết thường, không dấu chấm cuối, tối đa 100 ký tự
- `feat fix docs style refactor perf test chore revert ci`

```
feat(auth): add Google OAuth login       ✓
fix(blog): fix pagination offset         ✓
fix: bug fix                             ✗ (quá chung chung)
```

**Pre-commit hooks** (tự chạy, không bỏ qua):

- `lint-staged` → eslint --fix + prettier --write
- `commitlint` → validate commit message format

---

## CSS & Tailwind

**Tailwind CSS v4 · CSS-first · `globals.css` là nguồn sự thật duy nhất.**

**Thứ tự ưu tiên:**

```
1. Tailwind utility có sẵn          → dùng ngay
2. Token đã có trong @theme         → dùng ngay
3. Chưa có → khai báo vào globals.css đúng section
```

**Không được:**

- `style={{ ... }}` inline trên JSX
- File `.module.css` riêng
- `text-[36px]` hardcode — chưa có token thì thêm vào `@theme`
- `@apply` ngoài `@layer base`

### Tokens có sẵn

| Nhóm                              | Giá trị                                      |
| --------------------------------- | -------------------------------------------- |
| **Font size** `text-{px}`         | `10 12 14 16 17 18 20 24 30 36 48 60 72`     |
| **Font weight** `font-{n}`        | `300 400 500 600 700 800`                    |
| **Line height** `leading-{n}`     | `100 125 138 150 163 200`                    |
| **Letter spacing** `tracking-{n}` | `n2 n1 0 1 2 4` (`n` = âm)                   |
| **Border radius** `rounded-{px}`  | `4 6 8 10 12 16 24 full`                     |
| **Màu**                           | `bg-background text-foreground text-primary` |

### Responsive

| Variant                         | Kích hoạt khi                          |
| ------------------------------- | -------------------------------------- |
| `xs: sm: md: lg: xl: 2xl: 3xl:` | screen **≥** breakpoint (mobile-first) |
| `max-xs: max-sm: max-md: ...`   | screen **<** breakpoint                |

### Max/min width & Page wrapper

```
maxw-xs→480  maxw-sm→640  maxw-md→768  maxw-lg→1024  maxw-xl→1280  maxw-2xl→1536  maxw-3xl→1920
minw-xs→480  minw-sm→640  minw-md→768  minw-lg→1024  minw-xl→1280  minw-2xl→1536

container → max-w 1660px + mx-auto + px-15  (wrapper chính)
page-sm/md/lg/xl/2xl → max-w tương ứng + mx-auto + px
```

> `maxw-xl` ≠ `max-xl:` — một cái set `max-width` trên element, một cái là responsive variant.

### Thêm token vào globals.css

```css
/* Màu mới */
:root {
  --secondary: #6366f1;
}
@theme inline {
  --color-secondary: var(--secondary);
}
/* Dùng: bg-secondary text-secondary */

/* Font size / spacing */
@theme {
  --text-13: 13px;
  --spacing-13: 52px;
}
/* Dùng: text-13  w-13  h-13  p-13 */

/* Dark mode */
:root {
  --foreground: #171717;
}
.dark {
  --foreground: #ededed;
}
```

- Base element styles → `@layer base`
- Utility tái sử dụng → `@utility` (Tailwind v4, không phải `@layer utilities`)
- Dark mode: chỉ đổi CSS variable — Tailwind tự áp toàn bộ token dùng variable đó
