# Sample Project Template

내부망 프로젝트를 빠르게 시작하기 위한 Java 21 + Spring Boot + MyBatis + Oracle + React 18 템플릿입니다.

## 구성

- Backend: Java 21, Spring Boot, Spring Security, MyBatis, Oracle JDBC
- Frontend: React 18.2.0, Vite, Ant Design, Zustand, pnpm
- Database: Oracle XE Docker 이미지 기반 개발 DB
- Default 계정
  - DB: `root` / `root`
  - API Basic Auth: `root` / `root`

> 참고: Oracle 19c 자체는 무료 개발용 Docker 이미지로 바로 쓰기 까다롭습니다. 이 템플릿은 로컬 개발용으로 Oracle XE 이미지를 사용하고, 운영/검증 환경의 19.30.0.0.0 DB에 붙을 수 있도록 JDBC URL과 계정 값을 환경변수로 분리했습니다.

## 빠른 실행

```bash
docker compose up -d oracle
```

```bash
cd backend
mvn spring-boot:run
```

```bash
cd frontend
corepack enable
corepack prepare pnpm@9.15.4 --activate
pnpm install
pnpm dev
```

- Backend: http://localhost:8080
- Frontend: http://localhost:5173
- Health: http://localhost:8080/actuator/health

## 주요 API

- `GET /api/sample-items`
- `GET /api/sample-items/{id}`
- `POST /api/sample-items`
- `PUT /api/sample-items/{id}`
- `DELETE /api/sample-items/{id}`
- `GET /api/auth/me`

모든 샘플 API는 Basic Auth `root:root`를 사용합니다. 프론트엔드의 상단 로그인 패널에 같은 값을 넣으면 CRUD 화면에서 바로 호출됩니다.

## 디렉터리

```text
sample
  backend
    src/main/java/com/example/sample
    src/main/resources
  frontend
    src/apis
    src/assets
    src/common
    src/components
    src/contants
    src/dev
    src/language
    src/pages/admin
    src/pages/common
    src/pages/home
    src/pages/sample
    src/routes
    src/store
    src/utils
```

## Git

원격 저장소:

```bash
git remote add origin https://github.com/Hongju213/sample.git
```
