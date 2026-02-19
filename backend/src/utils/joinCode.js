import { supabase } from "../db/index.js";

/**
 * Generate a join code of given length
 * @param {number} length
 */
function generateJoinCode(length) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = '';
    
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

/**
 * Check if join code is unique
 * @param {string} code
 */
async function isCodeUnique(code) {
    const { data, error } = await supabase
        .from('sessions')
        .select('id')
        .eq('join_code', code)
        .maybeSingle();

    if (error) throw new Error(error.message);
    return !data; // true means: unique
}

/**
 * Generate a guaranteed unique join code
 * @param {number} length
 */
export async function generateUniqueJoinCode(length = 4) {
    let code;
    let unique = false;

    while (!unique) {
        code = generateJoinCode(length);
        unique = await isCodeUnique(code);
    }

    return code;
}
