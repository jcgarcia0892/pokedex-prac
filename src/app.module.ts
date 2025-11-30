import { Module } from '@nestjs/common';
import { PokemonModule } from './pokemon/pokemon.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModule } from './common/common.module';
import { SeedModule } from './seed/seed.module';
import { ConfigModule } from '@nestjs/config';
import { EnvConfiguration } from './config/env.config';
import { JoiValidationSchema } from './config/joi.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [EnvConfiguration],
      validationSchema: JoiValidationSchema,
    }), // se necesita instalar @nestjs/config y este Hace que el proyecto detecte las variables de entorno creadas en el archivo .env
    // Siempre se debe colocar al inicio para que lea las variables de entorno esten definidas antes de usarlas
    PokemonModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../public'),
    }),
    MongooseModule.forRoot(process.env.MONGODB!, {
      dbName: 'pokemon_db'
    }),
    CommonModule,
    SeedModule,
  ]
})
export class AppModule {}
