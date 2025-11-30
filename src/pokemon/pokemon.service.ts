import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';

import { isValidObjectId, Model } from 'mongoose';

import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class PokemonService {

  private defaultLimit: number;
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly configService: ConfigService,
  ) {
    // console.log(this.configService.get<number>('defaultLimit'));
    this.defaultLimit = this.configService.get<number>('defaultLimit')!;
  }

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();
    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto); 
      return pokemon;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    console.log(this.defaultLimit);
    const { limit = this.defaultLimit, offset = 0 } = paginationDto;
    // const { limit = 10, offset = 0 } = paginationDto;
    return await this.pokemonModel.find()
      .limit(limit)
      .skip(offset)
      .sort({
        no: 1
      })
      .select('-__v'); //remueve la propiedad '__v' del resultado
  }

  async findOne(term: string) {
    let pokemon: Pokemon | null = null;

    if(!isNaN(+term)) {
      pokemon = await this.pokemonModel.findOne({no: +term});
    }

    if(!pokemon && isValidObjectId(term)) {
      pokemon = await this.pokemonModel.findById(term);
    }

    if(!pokemon) {
      pokemon = await this.pokemonModel.findOne({name: term.toLowerCase()});
    }

    if(!pokemon) {
      throw new NotFoundException(`The pokemon with the id, name or no: ${term} wasn't found`);
    }
    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    let pokemon: Pokemon = await this.findOne(term);

    if(updatePokemonDto.name) {
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
    }

    try {
      await pokemon.updateOne(updatePokemonDto);
      return {...pokemon.toJSON(), ...updatePokemonDto}
    } catch (error) {
      this.handleExceptions(error);
    }

  }

  async remove(id: string) {
    // Forma 1: dos llamadas a la base de datos.
    // let pokemon = await this.findOne(id);
    // await pokemon.deleteOne();

    // Forma 2: una llamada pero si no encuentra el pokemon igual devuelve un 200.
    // await this.pokemonModel.findByIdAndDelete(id);

    // Forma 3: una sola llamada y si te dice si no encuentra un pokemon

    const response = await this.pokemonModel.deleteOne({ _id: id });
    
    console.log(response);
    if( response.deletedCount === 0 ) {
      throw new BadRequestException(`Pokemon with id: "${id}" was not found`);
    }
    return;
  }

  private handleExceptions(error: any): never {
      if(error.code === 11000) {
        throw new BadRequestException(`Pokemon exists in DB ${JSON.stringify(error.keyValue)}`);
      }      
      console.log(error);
      throw new InternalServerErrorException(`Can't create pokemon - Check server logs`);
  }
}
