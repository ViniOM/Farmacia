import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Categoria } from '../entities/categoria.entity';
import { DeleteResult, ILike, Repository } from 'typeorm';

@Injectable()
export class CategoriaService {
  constructor(
    @InjectRepository(Categoria)
    private categoriaRepository: Repository<Categoria>,
  ) {}

  async findAll(): Promise<Categoria[]> {
    return this.categoriaRepository.find();
  }

  async findById(id: number): Promise<Categoria> {
    let busca = await this.categoriaRepository.findOneBy({ id });
    if (!busca)
      throw new HttpException(
        `Id: ${id} Não foi encontrado`,
        HttpStatus.NOT_FOUND,
      );

    return busca;
  }

  async findByNome(nome: string): Promise<Categoria[]> {
    let busca = await this.categoriaRepository.find({
      where: {
        nome: ILike(`%${nome}%`),
      },
    });

    if (!busca)
      throw new HttpException(
        `Categoria: ${nome} Não foi encontrado`,
        HttpStatus.NOT_FOUND,
      );

    return busca;
  }

  async create(categoria: Categoria): Promise<Categoria> {
    let verificaNome = await this.categoriaRepository.findOne({
      where: {
        nome: categoria.nome,
      },
    });
    if (verificaNome)
      throw new HttpException(
        `Categoria: ${categoria.nome} Ja Existe!`,
        HttpStatus.BAD_REQUEST,
      );

    return await this.categoriaRepository.save(categoria);
  }

  async update(categoriaAtt: Categoria): Promise<Categoria> {
    let verificaNome = await this.categoriaRepository.findOne({
      where: {
        nome: categoriaAtt.nome,
      },
    });
    if (verificaNome)
      throw new HttpException(
        `Categoria: ${categoriaAtt.nome} Ja Existe!`,
        HttpStatus.NOT_FOUND,
      );

    let verificaId = await this.findById(categoriaAtt.id);
    if (!verificaId)
      throw new HttpException(
        `Id: ${categoriaAtt.id} Não Existe!`,
        HttpStatus.NOT_FOUND,
      );

    return this.categoriaRepository.save(categoriaAtt);
  }

  async delete(id: number): Promise<DeleteResult> {
    let verificaId = await this.findById(id);
    if (!verificaId)
      throw new HttpException(`Id: ${id} Não Existe!`, HttpStatus.NOT_FOUND);

    return await this.categoriaRepository.delete(id);
  }
}
