# 📅 Projeto Rotinalize API

O **Rotinalize API** é uma aplicação backend robusta desenvolvida com **Spring Boot**, focada em ajudar usuários a
gerenciar suas rotinas, criar hábitos e otimizar estudos através de técnicas de **Repetição Espaçada (Flashcards)** e
Inteligência Artificial.

O projeto utiliza **PostgreSQL** como banco de dados principal para garantir robustez e consistência dos dados.

## 🚀 Funcionalidades Principais

### 1. Gestão de Hábitos e Rotinas

* **Listas de Hábitos:** Organização de hábitos por listas personalizadas.
* **Flexibilidade de Agendamento:**
    * Dias específicos da semana (ex: Seg, Qua, Sex).
    * Intervalos de dias (ex: a cada 3 dias).
    * Prazos definidos (Due Date) ou metas semanais.
* **Notificações:** Sistema de envio de e-mails automáticos lembrando de hábitos que vencem "Hoje" ou "Amanhã".

### 2. Sistema de Estudos (Flashcards)

* **Decks e Cards:** Criação de baralhos e cartões de estudo (frente e verso).
* **Repetição Espaçada (SRS):** Algoritmo inteligente que agenda a próxima revisão do cartão baseada na dificuldade
  atribuída pelo usuário:
    * 🔴 **Difícil:** Revisa em 10 minutos (curto prazo).
    * 🟢 **Bom:** Aumenta o intervalo gradualmente (+1 dia).
    * 🔵 **Fácil:** Dobra o intervalo (exponencial).
* **Revisão Diária:** Endpoint dedicado para buscar apenas os cartões pendentes para o dia.

### 3. Integração com Inteligência Artificial (AI) 🤖

* Utiliza **LangChain4j** e **OpenAI (GPT)**.
* **Chat FAQ:** Assistente virtual para tirar dúvidas de planejamento.
* **Gerador de Flashcards:** Criação automática de flashcards (JSON) a partir de um tema ou texto fornecido pelo
  usuário.

### 4. Segurança e Usuários

* Cadastro e Login de usuários.
* Autenticação via **JWT (JSON Web Token)** usando chaves assimétricas (RSA Public/Private).
* Proteção de dados: Senhas criptografadas com BCrypt.

---

## 🛠️ Tecnologias Utilizadas

<div align="center">
  <img src="https://img.shields.io/badge/java-%23ED8B00.svg?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java" />
  <img src="https://img.shields.io/badge/spring-%236DB33F.svg?style=for-the-badge&logo=spring&logoColor=white" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/Spring_Security-6DB33F?style=for-the-badge&logo=Spring-Security&logoColor=white" alt="Spring Security" />
  <img src="https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens" alt="JWT" />
  <img src="https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white" alt="OpenAI" />
  <img src="https://img.shields.io/badge/Apache%20Maven-C71A36?style=for-the-badge&logo=Apache%20Maven&logoColor=white" alt="Maven" />
  <img src="https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white" alt="SMTP Gmail" />
</div>

<br />

* **Java 17**
* **Spring Boot 3.x**
* **Spring Security** (OAuth2 Resource Server + JWT)
* **Spring Data JPA** (Hibernate)
* **PostgreSQL** (Banco de dados)
* **LangChain4j** (Integração com LLMs)
* **Java Mail Sender** (Envio de e-mails via SMTP)
* **Maven** (Gerenciador de dependências)
* **Lombok** (Redução de boilerplate)

---

## ⚙️ Configuração e Instalação

### Pré-requisitos

* Java JDK 17+ instalado.
* PostgreSQL instalado e rodando na porta 5432.
* Maven (opcional, pois o projeto possui o wrapper `mvnw`).

### 1. Clonar o Repositório

```bash
git clone [https://github.com/seu-usuario/projeto-rotinalize.git](https://github.com/seu-usuario/projeto-rotinalize.git)
cd projeto-rotinalize/back
```

### 2. Configuração do Banco de Dados (PostgreSQL)

Certifique-se de criar um banco de dados vazio chamado rotinalize no seu PostgreSQL.

As configurações de conexão estão no arquivo src/main/resources/application.yml. Para segurança, recomenda-se usar
variáveis de ambiente ou um arquivo application-dev.yml (ignorado pelo git) para não expor suas senhas.

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/rotinalize
    username: SEU_USUARIO_POSTGRES  # (Padrão no código: postgres)
    password: SUA_SENHA_POSTGRES    # (Padrão no código: 123456)
```

### 3. Configuração de E-mail e IA

Também no `application.yml`, configure:

* **E-mail (SMTP Gmail):**
    * Necessário gerar uma "Senha de App" no Google se usar 2FA.
* **OpenAI API Key (Para funcionalidades de IA):**
    * Insira sua chave em `langchain4j.open-ai.chat-model.api-key`.

### 4. Chaves JWT (RSA)

O projeto utiliza um par de chaves RSA (app.key e app.pub) localizadas em src/main/resources/. Para gerar novas chaves (
recomendado para produção):

```bash
# Gerar chave privada
openssl genrsa -out app.key 2048
# Gerar chave pública
openssl rsa -in app.key -pubout -out app.pub
```

### 5. Executando a Aplicação

Com o Maven Wrapper:

```bash
# Windows
./mvnw.cmd spring-boot:run

# Linux/Mac
./mvnw spring-boot:run
```

A aplicação iniciará na porta 8080 (padrão).

### 📚 Documentação da API (Endpoints Principais)

### Autenticação & Usuários

| Método | Endpoint                  | Descrição                         |
|:-------|:--------------------------|:----------------------------------|
| `POST` | `/api/users`              | Cadastrar novo usuário (Aberto)   |
| `POST` | `/api/users/authenticate` | Login (Basic Auth) -> Retorna JWT |
| `GET`  | `/api/users/{id}`         | Buscar detalhes do usuário        |

### Hábitos (Habits)

| Método   | Endpoint           | Descrição                          |
|:---------|:-------------------|:-----------------------------------|
| `POST`   | `/api/habits`      | Criar um novo hábito               |
| `GET`    | `/api/habits`      | Listar todos os hábitos do usuário |
| `PUT`    | `/api/habits/{id}` | Editar hábito                      |
| `DELETE` | `/api/habits/{id}` | Remover hábito                     |
| `GET`    | `/api/lists`       | Listar listas de hábitos           |

### Flashcards (Estudos)

| Método | Endpoint                       | Descrição                                             |
|:-------|:-------------------------------|:------------------------------------------------------|
| `POST` | `/api/decks`                   | Criar novo baralho (Deck)                             |
| `POST` | `/api/flashcards`              | Criar um card dentro de um deck                       |
| `GET`  | `/api/flashcards/review-today` | **Algoritmo SRS:** Buscar cards para estudar hoje     |
| `POST` | `/api/flashcards/{id}/review`  | Avaliar estudo (params: `rating=FACIL, BOM, DIFICIL`) |

### IA (Chat & Generator)

| Método | Endpoint           | Descrição                                  |
|:-------|:-------------------|:-------------------------------------------|
| `GET`  | `/chat/faq`        | Chatbot para dúvidas de rotina             |
| `GET`  | `/chat/flashcards` | Gera JSON de flashcards baseado em um tema |

### 🤝 Contribuição

1. Faça um Fork do projeto.
2. Crie uma Branch para sua Feature (`git checkout -b feature/NovaFeature`).
3. Faça o Commit (`git commit -m 'Adicionando nova feature'`).
4. Faça o Push (`git push origin feature/NovaFeature`).
5. Abra um Pull Request.
