#**ecommerce-hash-challenge**
Back end desenvolvido por André Dorneles

---

## Tecnologias

O projeto foi desenvolvido utilizando Nest.js, um framework versátil para a criação de servidores escaláveis.
A comunicação é feita utilizando API REST com o sistema.
O projeto e seu ambiente está configurado para ser rodado dentro de containeres Docker, com o facilitador Docker Compose.
Por baixo dos panos, foi configurado o framework de servidor HTTP Fastify para rápida comunicação entre os sistemas.

---

## Ambiente

Para montar e subir o ambiente, basta seguir os passos abaixo:

1. Clonar o repositório:
   *git clone https://github.com/AndreD23/ecommerce-hash-challenge.git*
2. Entrar na pasta do projeto: cd ecommerce-hash-challeng
3. Executar docker compose para subir os serviços:
   *docker-compose up*

Com isso, a aplicação estará rodando e escutando em localhost na porta 3000.

---

## Execução do Projeto

Para testar a API de desconto do projeto, basta seguir um dos dois passos:

1. Utilizar o arquivo *api.http* da pasta raiz do projeto. Algumas IDEs possuem plugins para testes de requisição, e poderá utilizar este arquivo para executar os testes.
2. Disparar a requisição via Postman. Para isso, basta preencher com os seguintes dados (os mesmos se encontram no arquivo api.http):

*URL:* http://localhost:3000/cart/checkout

Método *POST*

*HEADERS*:
Incluir opção 'Content-Type' com valor 'application/json'

*BODY raw Json*:
{
  "products": [
    {
      "id": 1,
      "quantity": 1
    },
    {
      "id": 2,
      "quantity": 2
    }
  ]
}

E enviar a requisição.


---

## Testes Unitários

Para executar os testes unitários, basta seguir os passos abaixo:

1. Abrir uma nova instância do terminal
2. Acessar o container docker com '*docker exec -it ecommerce-hash-challenge bash*'
3. Executar '*yarn test*'

Para mais detalhes, pode-se executar com a opção '*--verbose*'
