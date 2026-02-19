import { getUserByEmail, createUser, updateUser } from "../db/users.repo.js";
import { hashPassword,verifyPassword } from "../utils/password.utils.js";
import jwt from 'jsonwebtoken';
//import { sendVerificationEmail, generateVerificationToken } from "../utils/email.util.js";
import 'dotenv/config';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h';

//sign up function
export async function SignUp(email,password,fullName) {

    //check if the user already exists
    const existing = await getUserByEmail(email);
    if(existing) throw new Error('Email already registered');

    // get the password hash and the salt
    const {hash,salt} = await hashPassword(password);

    //const verificationToken = generateVerificationToken();
    //const tokenExpiry  = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours


    const user = await createUser({
        email,
        password_hash : hash,
        salt,
        full_name: fullName,
        email_verified : true,
        //verification_token: verificationToken,
        //verification_token_expires: tokenExpiry,
    });

    //await sendVerificationEmail(email,verificationToken);

    return {message : 'Signup successful. Please verify your email',userId: user.id};
}

//login handler
export async function Login(email,password){
    const user = await getUserByEmail(email);
    if (!user) throw new Error('user not found');

    //check if user has verified their email
    if (!user.email_verified) throw new Error('Please verify your email before logging in');
    
    const valid = await verifyPassword(password,user.salt,user.password_hash);
    if (!valid) throw new Error('Invalid Password');

    const token = jwt.sign(
        {userId : user.id, email : user.email},
        JWT_SECRET,
        {expiresIn: JWT_EXPIRES_IN}
    );

    return {token,user};
}

export async function verifyEmail(email,token){
    const user = await getUserByEmail(email);
    if (!user) throw new Error('Invalid email');
    
    if(user.email_verified) throw new Error("Email already verified");
    //if (user.verification_token !== token) throw new Error("Invalid token");
    if (new Date(user.verification_token_expires) < new Date()) throw new Error('Token expired');

    await updateUser(user.id,{
        email_verified:true,
        verification_token: null,
        verification_token_expires:null,
    });

    return {message : 'Email verified successfully'};
}