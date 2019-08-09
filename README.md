# Webscrap
Este app tem como objetivo coletar dados financeiros de contas do Nubank (mediante autenticação).
Dados coletados:
- Nome
- Telefone 
- Email
- Ultima transação
- Feed de transações
- Faturas


## Executando
A aplicação é baseada em docker e deve ser executada através do docker compose. Para isso:
```
docker-compose build && docker-compose up
```

#### Puppeteer? Chromium?
Para realizar o scrap das páginas foi usado o [Puppeteer](https://github.com/GoogleChrome/puppeteer), que é uma API em Node JS que executa uma instancia headless do "Chrome"/Chromium. Por isso ao compilar a imagem é necessário baixar e instalar o Chromium e suas dependencias e **isso pode demorar uns minutinhos**.

#### Base de dados
A aplicação salva todos os dados coletados no mongoDB que roda em paraelo. Um volume persistente é criado e os dados podem ser acessados depois em `mongo-data:/data/db`.


## Usando
Para realizar a coleta de dados é necessário seguir alguns passos.
1. **Aguarde a inicialização**: assim que a página é carregada a app inicia, no servidor, uma instancia do Puppeteer.

2. **Faça o login**: digite o seu usuário e senha e clique em entrar e aguarde pela geração do qrcode.

3. **Autorize o qrcode**: acesse o seu aplicativo do Nubank, depois clique no seu nome, vá em Perfil > Acesso pelo site e escaneie o qrcode.

4. **Colete os dados**: aguarde um segundo ou dois após a autorização o qrcode e clique no botão 'Coletar'

5. **Acesse os dados**: após alguns segundos, se tudo der certo, os dados coletadoes estarão disponível no link 'Ver dados' (estas infos também podem ser acessads no banco de dados usando o id que está no link).

6. **Clique em sair**: para não deixar nenhuma sessão aberta no Nubank o ideal é que seja feito o logout (clicando no botão 'Sair') no final da coleta, ou quando desejado.


## Stack
- Puppeteer
- ExpressJS
- VueJS
- MongoDB
- Mongoose

