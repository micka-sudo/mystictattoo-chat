const fs = require('fs');
const readline = require('readline');
const bcrypt = require('bcrypt');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('🔐 Entrez le mot de passe admin à hasher : ', async (plainPassword) => {
    try {
        const hash = await bcrypt.hash(plainPassword, 10);
        const content = `SECRET_KEY=tonSecretUltraFort\nADMIN_HASH=${hash}\n`;

        fs.writeFileSync('.env', content);
        console.log('✅ Fichier .env généré avec succès !');
        console.log('Contenu :\n', content);
    } catch (err) {
        console.error('❌ Erreur lors du hash :', err);
    } finally {
        rl.close();
    }
});
