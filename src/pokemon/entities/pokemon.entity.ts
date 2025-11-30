import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
export class Pokemon extends Document {

    // id: string; // esto lo coloca automáticamente mongo por lo que no es necesario que lo coloquemos
    
    @Prop({
        unique: true,
        index: true,
    })
    name: string;

    @Prop({
        unique: true,
        index: true,
    })
    no: number;

}


export const PokemonSchema = SchemaFactory.createForClass( Pokemon );