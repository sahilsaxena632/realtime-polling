const bcrypt = require("bcrypt");

const hashPassword = async (plain) => {
    const saltRounds = 10;
    return await bcrypt.hash(plain, saltRounds);
};

module.exports = { hashPassword };
