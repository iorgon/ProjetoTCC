# ProjetoTCC – Sistema de Tickets MonDesk

Sistema de gerenciamento de chamados (tickets) com backend Node.js (Express + Sequelize + MySQL) e frontend React.



##  Tecnologias Utilizadas

- **Backend:** Node.js, Express, Sequelize, MySQL
- **Frontend:** React
- **Autenticação:** JWT



##  Como rodar o projeto localmente


#1. Crie o banco de dados MySQL

Acesse seu MySQL e execute:

CREATE DATABASE ticket_system;

#2. Configure as variáveis de ambiente

Atualize o arquivo .env dentro da pasta backend conforme seu ambiente:


#3. Instale as dependências no backend e inicie:

Abra o cmd/terminal e digite

cd backend

npm install

npm start


Instale as dependências no backend e inicie:

Abra um novo cmd/terminal e digite

cd frontend

npm install

npm start


## Usuário Admin Padrão

Email: admin@example.com

Senha: 123456

Este usuário é criado automaticamente na primeira execução do backend, caso não exista.

## Observações Importantes

Antes de criar um ticket, é necessário cadastrar um cliente.

SLAs padrões são gerados automaticamente no banco ao iniciar o sistema.

O projeto utiliza autenticação JWT de login.

