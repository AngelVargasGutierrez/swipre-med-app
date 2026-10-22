const mysqldump = require('mysqldump');

async function dumpDatabase() {
    try {
        console.log("Iniciando el volcado de la base de datos de Heroku...");
        await mysqldump({
            connection: {
                host: 'op2hpcwcbxb1t4z9.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
                user: 'cxoocr2fqlgvrxlz',
                password: 'vo8pl0htf4dsorap',
                database: 'jmd3rzozcew2tnpi',
                port: 3306
            },
            dumpToFile: '../heroku_database_dump.sql',
        });
        console.log("¡Volcado completado! El archivo se guardó en la raíz como heroku_database_dump.sql");
    } catch (error) {
        console.error("Error al realizar el volcado:", error);
    }
}

dumpDatabase();
