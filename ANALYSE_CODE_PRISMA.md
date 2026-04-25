# Analyse du code source et explication detaillee de Prisma

## 1) Vue d'ensemble du projet

Ce projet est une API GraphQL en TypeScript basee sur:

- `graphql-yoga` pour le serveur GraphQL
- `@graphql-tools/schema` pour assembler `typeDefs` + `resolvers`
- `prisma` + `@prisma/client` pour l'acces base de donnees
- SQLite comme moteur de stockage

Le domaine metier principal tourne autour de 3 entites:

- `User`
- `Cv`
- `Skill`

Relations:

- Un `User` possede plusieurs `Cv` (1-N)
- Un `Cv` appartient a un seul `User` (N-1)
- Un `Cv` possede plusieurs `Skill` et une `Skill` peut etre liee a plusieurs `Cv` (N-N)

---

## 2) Analyse de tout le code source

### `src/main.ts`

- Cree un serveur HTTP Node.
- Instancie Yoga avec le schema GraphQL et le `context` applicatif.
- Expose l'endpoint GraphQL sur `http://localhost:4000/graphql`.

Flux:

1. Charger `schema`
2. Charger `createContext`
3. Creer Yoga
4. Attacher Yoga au serveur HTTP
5. `listen(4000)`

### `src/schema.ts`

- Lit le fichier SDL `schema.graphql`.
- Construit le schema executable via `createSchema`.
- Connecte les resolvers.

Point notable: fallback de chemin pour fonctionner en mode TS direct (`src/schema.graphql`) ou selon le dossier runtime (`__dirname`).

### `src/schema.graphql`

Contient:

- Types `Cv`, `Skill`, `User`
- Query CRUD lecture (`Cvs`, `Cv`, `Skills`, `Skill`, `Users`, `User`)
- Mutations sur `Cv` (`createCv`, `updateCv`, `deleteCv`)
- Subscription `cvChanged`

Point de design: les noms de champs cote GraphQL sont parfois en `PascalCase` (`Age`, `Job`, `UserId`, `Designation`, `Cvs`) alors que Prisma est en `camelCase` (`age`, `job`, `userId`, `designation`, `cvs`). Le code gere cet ecart par mapping dans les resolvers.

### `src/context.ts`

- Definit `AppContext` avec `prisma`.
- Injecte `prisma` dans chaque resolver.

### `src/prisma.ts`

- Cree une instance `PrismaClient`.
- Utilise un singleton via `globalThis` en dev pour eviter plusieurs connexions lors des reloads (`ts-node-dev`).
- Configure les logs Prisma (`error`, `warn`).

### `src/pubsub.ts`

- Cree un bus d'evenements in-memory via `createPubSub`.
- Defini le payload type de `cvChanged` (`CREATED`, `UPDATED`, `DELETED`).

### `src/resolvers/index.ts`

- Agrege les resolvers par domaine (`Query`, `Mutation`, `Cv`, `Skill`, `User`, `Subscription`).

### `src/resolvers/Query.ts`

- Lecture de donnees via Prisma:
  - `prisma.user.findMany/findUnique`
  - `prisma.skill.findMany/findUnique`
  - `prisma.cv.findMany/findUnique`
- Pour `Cv`, inclut `skills` + `user` pour enrichir la reponse.

### `src/resolvers/Mutation.ts`

Logique metier principale sur `Cv`:

- Validation d'existence `User` avant creation/mise a jour
- Validation d'existence des `Skill`
- Deduplication des ids skills (`Set`)
- Operations Prisma:
  - `prisma.cv.create`
  - `prisma.cv.update`
  - `prisma.cv.delete`
- Mapping DB -> GraphQL avec `mapCvToGraphQL` (age->Age, job->Job, userId->UserId)
- Publication d'evenement subscription apres mutation

### `src/resolvers/Cv.ts`

- Resolveurs de champs pour harmoniser les differences de nommage.
- `Age` et `Job` lisent autant `Age/Job` que `age/job`.
- `User` et `skills` recuperent les relations si pas deja presentes dans le parent.

### `src/resolvers/Skill.ts`

- Mappe `Designation` (GraphQL) sur `designation` (Prisma).
- `Cvs` recupere tous les CV lies a une skill via filtre relationnel Prisma.

### `src/resolvers/User.ts`

- `Cvs` recupere les CV d'un user via `userId`.

### `src/_db.ts`

- Jeu de donnees statique (legacy/mock).
- N'est pas utilise par les resolvers actifs (la source reelle est Prisma/SQLite).

---

## 3) Prisma en detail: code + fonctionnement

## 3.1 `prisma/schema.prisma`

### Datasource

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

- Le provider est SQLite.
- L'URL est lue depuis la variable d'environnement `DATABASE_URL`.

### Generator

```prisma
generator client {
  provider = "prisma-client-js"
}
```

- Genere le client TypeScript/JS (`@prisma/client`) a partir du schema.

### Model `User`

```prisma
model User {
  id    String @id @default(cuid())
  name  String
  email String @unique
  role  String @default("USER")
  cvs   Cv[]
}
```

- `id`: cle primaire texte, generee automatiquement par `cuid()` si non fournie.
- `email`: unique.
- `role`: string avec defaut `USER`.
- `cvs`: relation inverse 1-N vers `Cv`.

### Model `Skill`

```prisma
model Skill {
  id          String @id @default(cuid())
  designation String
  cvs         Cv[]
}
```

- Relation N-N implicite avec `Cv` via la liste `cvs`.

### Model `Cv`

```prisma
model Cv {
  id     String  @id @default(cuid())
  name   String
  age    Int?
  job    String?
  userId String
  user   User    @relation(fields: [userId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  skills Skill[]
}
```

- `age` et `job` sont optionnels.
- `userId` est obligatoire.
- `@relation` force l'integrite referentielle:
  - `onDelete: Restrict`: impossible de supprimer un user ayant des CV.
  - `onUpdate: Cascade`: changement d'id user propage (rare en pratique).
- `skills` cree une relation N-N implicite avec `Skill`.

## 3.2 Migration SQL generee

Le fichier de migration cree:

- table `User`
- table `Skill`
- table `Cv` avec FK `userId -> User.id`
- table pivot `_CvToSkill` pour la relation N-N
- index uniques (`User_email_key`, `_CvToSkill_AB_unique`)

La table `_CvToSkill` est geree automatiquement par Prisma quand la relation N-N est definie implicitement par des listes des deux cotes (`Cv.skills`, `Skill.cvs`).

## 3.3 Prisma Client dans l'application

### Initialisation (`src/prisma.ts`)

- Instancie `PrismaClient` une seule fois.
- En dev, met l'instance dans `globalThis` pour survivre aux hot reloads.

Pourquoi c'est important:

- Evite l'accumulation de connexions SQLite.
- Evite les warnings classiques de multiples instances Prisma en developpement.

### Injection via le context (`src/context.ts`)

- Chaque resolver recoit `{ prisma }`.
- Pas besoin d'importer `prisma` partout en direct.
- Facilite les tests et l'evolution du context.

## 3.4 Comment Prisma est utilise dans les resolvers

### Requetes (Query)

- Lecture simple:
  - `findMany()` pour listes
  - `findUnique({ where: { id } })` pour element unique
- Pour les CV, `include: { skills: true, user: true }` ramene les relations en une requete Prisma.

### Mutations (create/update/delete Cv)

#### Creation `createCv`

1. Verifie que l'utilisateur existe
2. Verifie que toutes les skills existent
3. `prisma.cv.create` avec:
   - attributs simples (`name`, `age`, `job`)
   - `user.connect`
   - `skills.connect` (si fourni)
4. Publie un event subscription `CREATED`

#### Mise a jour `updateCv`

1. Verifie que le CV cible existe
2. Si `UserId` fourni: verifie user existe
3. Si `skillsId` fourni: verifie toutes les skills existent
4. `prisma.cv.update` avec patch conditionnel
5. Si `skillsId` fourni: `skills.set` remplace l'ensemble des skills
6. Publie `UPDATED`

#### Suppression `deleteCv`

1. Verifie CV existe
2. Supprime via `prisma.cv.delete`
3. Publie `DELETED`

## 3.5 Seed Prisma (`prisma/seed.ts`)

Ordre d'operations:

1. `deleteMany` sur `cv`, puis `skill`, puis `user` pour vider proprement
2. `createMany` users
3. `createMany` skills
4. `create` CV un par un, avec `connect` user et skills

Pourquoi cet ordre:

- Il respecte les contraintes de FK.
- On cree d'abord les parents (`User`, `Skill`), puis les enfants (`Cv`).

Note: le seed force des ids (`"1"`, `"2"`, ...), ce qui override le defaut `cuid()` dans ce script uniquement.

---

## 4) Walkthrough step-by-step (execution complete)

## Etape 1 - Installer les dependances

```bash
npm install
```

## Etape 2 - Configurer la base SQLite

Creer (ou verifier) un fichier `.env` a la racine du projet avec:

```env
DATABASE_URL="file:./dev.db"
```

Avec ce schema Prisma, le fichier SQLite sera cree dans le dossier `prisma/`.

## Etape 3 - Generer le client Prisma

```bash
npm run prisma:generate
```

Effet:

- Prisma lit `prisma/schema.prisma`
- Genere `@prisma/client` type-safe

## Etape 4 - Appliquer la migration

```bash
npm run prisma:migrate -- --name init
```

Effet:

- Cree/maj la base SQLite
- Cree les tables et index

## Etape 5 - Inserer les donnees de seed

```bash
npm run prisma:seed
```

Effet:

- Reinitialise les tables
- Cree users, skills, puis CV relies

## Etape 6 - Lancer le serveur GraphQL

```bash
npm run dev
```

Endpoint:

- `http://localhost:4000/graphql`

## Etape 7 - Tester les operations GraphQL

### Query exemple

```graphql
query {
  Cvs {
    id
    name
    Age
    Job
    User { id name }
    skills { id Designation }
  }
}
```

### Mutation exemple

```graphql
mutation {
  createCv(
    input: {
      name: "CV Test"
      Age: 27
      Job: "DevOps"
      UserId: "1"
      skillsId: ["1", "3"]
    }
  ) {
    id
    name
    Age
  }
}
```

### Subscription exemple

```graphql
subscription {
  cvChanged {
    mutation
    cvId
    cv {
      id
      name
      Age
      Job
    }
  }
}
```

## Etape 8 - Suivre le flux interne d'une mutation (ex: `createCv`)

1. Le client envoie la mutation GraphQL
2. Yoga appelle le resolver `Mutation.createCv`
3. Le resolver lit `prisma` depuis le context
4. Verifications metier (user/skills)
5. Prisma ecrit en base (`cv.create` + relations)
6. Le resultat DB est mappe vers la forme GraphQL
7. Un event est publie vers `cvChanged`
8. La reponse est retournee au client

---

## 5) Points techniques importants a retenir

- Prisma est la source de verite data (plus `src/_db.ts`).
- Le schema GraphQL et le schema Prisma n'ont pas exactement le meme naming: les resolvers font l'adaptation.
- Les checks metier dans les mutations evitent des erreurs SQL peu lisibles et donnent des messages GraphQL explicites.
- Les subscriptions sont in-memory (adaptees au dev/single instance). Pour la production multi-instance, il faudrait un broker externe (Redis, NATS, etc.).
