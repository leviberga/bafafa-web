# Bafafá Web

Front-end do [Bafafá](https://github.com/leviberga/bafafa-social), uma rede social brasileira no estilo microblog. É uma aplicação de página única em **React + TypeScript**, que consome a API do backend (Spring Boot).

## Stack

| Camada | Tecnologia |
|---|---|
| Base | React 19, TypeScript, Vite |
| Roteamento | React Router |
| Dados do servidor | TanStack Query (feed com paginação infinita e atualizações otimistas) |
| Estilo | Tailwind CSS 4, com tokens de cor e fontes próprios |
| Fontes | Bricolage Grotesque (interface) e Literata (texto dos posts), servidas localmente via Fontsource |
| Testes | Vitest |

## Como rodar

Requisitos: Node 22 ou superior e o backend rodando em `http://localhost:8080`.

```bash
npm install
npm run dev
```

O app abre em `http://localhost:5173`. A porta é fixa (`strictPort`) porque o backend só aceita essa origem no CORS. Para apontar para outra API, copie `.env.example` para `.env.local` e ajuste `VITE_API_URL`.

Outros comandos: `npm run build` (checagem de tipos e build de produção), `npm run lint`, `npm test`.

## Decisões

**Sessão: access token em memória, refresh em cookie `HttpOnly`.** O access token (15 min) vive só numa variável do módulo `lib/api.ts`: não vai para `localStorage`, então um XSS não consegue levá-lo. O refresh token é um cookie `HttpOnly` que o JavaScript nem enxerga. Ao abrir o app, a sessão é restaurada pelo cookie; num `401`, o cliente renova e repete a requisição uma vez.

**Uma única renovação por vez.** O backend rotaciona o refresh a cada uso e trata a reapresentação de um token já usado como roubo, derrubando a sessão. Por isso todas as chamadas simultâneas de renovação compartilham a mesma requisição (isso cobre também o `StrictMode` do React em desenvolvimento, que monta os efeitos duas vezes). É a parte mais delicada do front e tem testes dedicados em `src/lib/api.test.ts`.

**Curtir e repostar são otimistas.** O número muda na hora no cache do feed e reverte se a API falhar. Não recarregamos o feed logo depois: no backend os contadores são eventualmente consistentes (cerca de meio segundo), e recarregar traria o valor antigo de volta.

**Mensagens de erro que dizem o que fazer.** `lib/errors.ts` traduz erros da API (limite de requisições com o `Retry-After`, sessão expirada, servidor fora do ar) em frases úteis para a pessoa.

## Identidade visual

A palavra "bafafá" quer dizer rebuliço, e a referência é o cartaz lambe-lambe de rua. As cores saem da tinta desses cartazes (ipê, cobalto, pitanga e mate) sobre um papel frio, e a marca só "grita" na tela de entrada. O feed, que é onde se lê, é uma coluna contínua, quieta e legível, com o texto dos posts numa fonte feita para leitura. O único movimento da interface é a entrada "carimbada" do cartaz, e ele respeita `prefers-reduced-motion`.

## Estrutura

```
src/
├── lib/            // cliente HTTP (api.ts), endpoints, tipos, erros e formatação
├── auth/           // contexto de sessão e rotas protegidas
├── components/     // layout, avatar, campos, ícones, marca
├── features/feed/  // consultas, compositor e cartão de post
└── pages/          // entrar, cadastro, início, não encontrado
```

## Roadmap

- [x] Entrar, criar conta, sair e restauração da sessão
- [x] Feed *home* com paginação infinita
- [x] Compositor de posts
- [x] Curtir e repostar
- [ ] Página de perfil (feed do usuário, seguir e deixar de seguir, contagens)
- [ ] Página do post, com a thread de respostas
- [ ] Notificações de erro (toasts) para falhas em curtir e repostar
- [ ] Testes de componentes
- [ ] Deploy
