import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, ILike, Repository } from 'typeorm';
import { Produto } from '../entities/produto.entity';

@Injectable()
export class ProdutoService {
  constructor(
    @InjectRepository(Produto)
    private produtoRepository: Repository<Produto>,
  ) {}

  async findAll(): Promise<Produto[]> {
    return this.produtoRepository.find({
      relations: { categoria: true },
    });
  }

  async findById(id: number): Promise<Produto> {
    let busca = await this.produtoRepository.findOne({
      where: { id },
      relations: { categoria: true },
    });
    if (!busca)
      throw new HttpException(
        `Id: ${id} Não foi encontrado`,
        HttpStatus.NOT_FOUND,
      );

    return busca;
  }

  async findByNome(nome: string): Promise<Produto[]> {
    let busca = await this.produtoRepository.find({
      where: {
        nome: ILike(`%${nome}%`),
      },
      relations: {
        categoria: true,
      },
    });

    if (busca.length == 0)
      throw new HttpException(
        `Produto: ${nome} Não foi encontrado`,
        HttpStatus.BAD_REQUEST,
      );

    return busca;
  }

  async create(produto: Produto): Promise<Produto> {
    let verificaNome = await this.produtoRepository.findOne({
      where: {
        nome: produto.nome,
      },
    });
    if (verificaNome)
      throw new HttpException(
        `Produto: ${produto.nome} Ja Existe!`,
        HttpStatus.BAD_REQUEST,
      );

    return await this.produtoRepository.save(produto);
  }

  async update(produtoAtt: Produto): Promise<Produto> {
    let verificaId = await this.findById(produtoAtt.id);
    if (!verificaId)
      throw new HttpException(
        `Id: ${produtoAtt.id} Não Existe!`,
        HttpStatus.NOT_FOUND,
      );

    return this.produtoRepository.save(produtoAtt);
  }

  async delete(id: number): Promise<DeleteResult> {
    let verificaId = await this.findById(id);
    if (!verificaId)
      throw new HttpException(`Id: ${id} Não Existe!`, HttpStatus.NOT_FOUND);

    return await this.produtoRepository.delete(id);
  }
}
