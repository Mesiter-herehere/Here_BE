const { MongoClient } = require('mongodb');

async function main() {
    const uri = "mongodb+srv://shinhuiseong07:siniseong@herehere.gnb7p2m.mongodb.net/?retryWrites=true&w=majority&appName=herehere";

    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();

        console.log("DB 연결 성공");

        const databasesList = await client.db().admin().listDatabases();

        console.log("Databases:");
        databasesList.databases.forEach(db => console.log(` - ${db.name}`));
    } catch (e) {
        console.error("DB 연결 실패:", e);
    } finally {
        await client.close();
    }
}

main().catch(console.error);
