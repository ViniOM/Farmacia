import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';

describe('Testes dos Módulos Produto e Categoria (e2e)', () => {
  let app: INestApplication;
  let produtoId: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [__dirname + './../src/**/entities/*.entity.ts'],
          synchronize: true,
          dropSchema: true,
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('01 - Deve cadastrar Produto', async () => {
    const resposta = await request(app.getHttpServer())
      .post('/produtos/cadastrar')
      .send({
        nome: 'ProdutoTeste',
        preco: 10,
        imagem: 'Produto.png',
        descricao: 'Descricao',
      })
      .expect(201);

    produtoId = resposta.body.id;
  });

  it('02 - Não Deve Duplicar o Produto', async () => {
    return request(app.getHttpServer())
      .post('/produtos/cadastrar')
      .send({
        nome: 'ProdutoTeste',
      })
      .expect(400);
  });

  it('03 - Deve Atualizar um Produto', async () => {
    const resposta = await request(app.getHttpServer())
      .put('/produtos/atualizar')
      .send({
        id: produtoId,
        nome: 'ProdutoTeste ATUALIZADO',
        preco: 10,
        imagem: 'Produto.png',
        descricao: 'Descricao',
      })
      .expect(200)
      .then((resposta) => {
        expect('ProdutoTeste ATUALIZADO').toEqual(resposta.body.nome);
      });
  });

  it('04 - Deve Listar todos os Produtos', async () => {
    return request(app.getHttpServer()).get('/produtos/').send({}).expect(200);
  });

  it('05 - Deve Procurar um Produto por ID', async () => {
    return request(app.getHttpServer())
      .get(`/produtos/${produtoId}`)
      .send({})
      .expect(200);
  });

  it('06 - Deve excluir um produto', async () => {
    return request(app.getHttpServer())
      .delete(`/produtos/deletar/${produtoId}`)
      .send({})
      .expect(200);
  });
});
