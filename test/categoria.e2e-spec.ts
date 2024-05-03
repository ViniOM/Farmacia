import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';

describe('Testes dos Módulos Produto e Categoria (e2e)', () => {
  let app: INestApplication;
  let categoriaId: any;

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

  it('#01 - Deve cadastrar uma Categoria', async () => {
    const resposta = await request(app.getHttpServer())
      .post('/categorias/cadastrar')
      .send({
        nome: 'Categoria Teste',
      })
      .expect(201);

    categoriaId = resposta.body.id;
  });

  it('#02 - Não Deve Duplicar a Categoria', async () => {
    return request(app.getHttpServer())
      .post('/categorias/cadastrar')
      .send({
        nome: 'Categoria Teste',
      })
      .expect(400);
  });

  it('#03 - Deve Atualizar uma Categoria', async () => {
    return await request(app.getHttpServer())
      .put('/categorias/atualizar')
      .send({
        id: categoriaId,
        nome: 'Categoria Teste ATUALIZADO',
      })
      .expect(200)
      .then((resposta) => {
        expect('Categoria Teste ATUALIZADO').toEqual(resposta.body.nome);
      });
  });

  it('#04 - Deve Listar todos as Categorias', async () => {
    return request(app.getHttpServer()).get('/produtos/').send({}).expect(200);
  });

  it('#05 - Deve Procurar uma Categoria por ID', async () => {
    return request(app.getHttpServer())
      .get(`/categorias/${categoriaId}`)
      .send({})
      .expect(200);
  });

  it('#06 - Deve excluir uma Categoria', async () => {
    return request(app.getHttpServer())
      .delete(`/categorias/deletar/${categoriaId}`)
      .send({})
      .expect(200);
  });
});
