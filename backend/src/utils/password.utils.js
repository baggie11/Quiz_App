import bcrypt from 'bcryptjs';
import 'dotenv/config';

const PEPPER = process.env.PEPPER;

/**
 * Hash password with Salt + Pepper
 * @param {string} password  - User password
 * @returns {Promise<{hash : string,salt:string}}
**/

export async function hashPassword(password){
    //generate cryptographically secure salt
    const salt = await bcrypt.genSalt(12);

    //combine password + pepper
    const passwordPeppered = password + PEPPER;

    //has with brcypt (includes the salt internally)
    const hash = await bcrypt.hash(passwordPeppered,salt);

    return {hash,salt};
}

/**
 * Verify Password
 * @param {string} password - User entered password
 * @param {string} salt - Stored salt
 * @param {string} hash - Stored hash
 * @returns {Promise<boolean>}
**/

export async function verifyPassword(password,salt,hash){
    const passwordPeppered = password + PEPPER;

    //Rehash with stored salt
    const rehash = await bcrypt.hash(passwordPeppered,salt);

    return rehash === hash;
}