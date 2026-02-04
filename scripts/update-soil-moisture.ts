import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateSoilMoistureValues() {
    console.log('🌱 Actualizando niveles mínimos de humedad del suelo...\n');

    try {
        // Actualizar Fresa
        const fresaResult = await prisma.plant.updateMany({
            where: {
                name: {
                    contains: 'fresa',
                    mode: 'insensitive',
                },
            },
            data: {
                minSoilMoisture: 60.0,
            },
        });
        console.log(`✅ Fresa actualizada (${fresaResult.count} registros) - minSoilMoisture: 60%`);

        // Actualizar Menta
        const mentaResult = await prisma.plant.updateMany({
            where: {
                name: {
                    contains: 'menta',
                    mode: 'insensitive',
                },
            },
            data: {
                minSoilMoisture: 50.0,
            },
        });
        console.log(`✅ Menta actualizada (${mentaResult.count} registros) - minSoilMoisture: 50%`);

        // Actualizar Poto/Pothos
        const potoResult = await prisma.plant.updateMany({
            where: {
                OR: [
                    {
                        name: {
                            contains: 'poto',
                            mode: 'insensitive',
                        },
                    },
                    {
                        name: {
                            contains: 'pothos',
                            mode: 'insensitive',
                        },
                    },
                ],
            },
            data: {
                minSoilMoisture: 40.0,
            },
        });
        console.log(`✅ Poto actualizado (${potoResult.count} registros) - minSoilMoisture: 40%`);

        // Verificar los cambios
        console.log('\n📊 Verificando cambios...\n');
        const plants = await prisma.plant.findMany({
            where: {
                OR: [
                    { name: { contains: 'fresa', mode: 'insensitive' } },
                    { name: { contains: 'menta', mode: 'insensitive' } },
                    { name: { contains: 'poto', mode: 'insensitive' } },
                    { name: { contains: 'pothos', mode: 'insensitive' } },
                ],
            },
            select: {
                id: true,
                name: true,
                minSoilMoisture: true,
                minHumidity: true,
                maxHumidity: true,
            },
        });

        console.table(plants);
        console.log('\n✨ Actualización completada exitosamente!');
    } catch (error) {
        console.error('❌ Error al actualizar:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

updateSoilMoistureValues()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
