import {supabase} from './index.js';

/**
 * Fetch user by email
 * @param {string} email
 * @returns {Promise<Object|null>}
**/
export async function getUserByEmail(email){
    const {data,error} = await supabase
    .from('users')
    .select('*')
    .eq('email',email)
    .single();

    if (error && error.code !== 'PGRST116'){
        throw error;
    }

    return data;
}

/**
 * Create a new user
 * @param {Object} user - { email, password_hash, salt, full_name, email_verified }
 * @returns {Promise<Object>} created user
**/
export async function createUser(user){
    const {data, error} = await supabase
    .from('users')
    .insert([user])
    .select('*')
    .single();

    if (error){
        throw error;
    }

    return data;
}

/**
 * Update user fields
 * @param {string} userId
 * @param {Object} fields - fields to update
 * @returns {Promise<Object>}
**/
export async function updateUser(userId,fields){
    const {data, error} = await supabase
    .from('users')
    .update(fields)
    .eq("id",userId)
    .select('*')
    .single();

    if (error) throw error;
    return data;
}

/**
 * Delete User
 * @param {string}userId
 * @returns {Promise<boolean>}
**/
export async function deleteUser(userId){
    const {error} = await supabase
    .from('users')
    .delete()
    .eq('id',userId);

    if (erorr) throw error;
    return true;
}