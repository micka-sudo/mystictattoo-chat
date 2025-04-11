// tools/generateHash.js
const bcrypt = require('bcrypt');

const password = 'JaimeLesGauffres654'; // <-- À modifier
const saltRounds = 12;

bcrypt.hash(password, saltRounds).then(hash => {
    console.log("Hash bcrypt à coller dans .env:");
    console.log(hash);
});
