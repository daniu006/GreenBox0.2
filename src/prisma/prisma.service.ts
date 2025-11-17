import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "generated/prisma";
@Injectable()
export class PrismaService 
extends PrismaClient
implements OnModuleInit, OnModuleDestroy{
    async onModuleInit() {
        await this.$connect();
        console.log('Conectado a la base de datos')
    }

    async onModuleDestroy() {
        await this.$disconnect();
        console.log('No se pudo conectar a la base de datos')
    }
}