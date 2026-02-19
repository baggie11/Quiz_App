import { Router } from 'express';
import { supabase } from '../db/index.js'; // Ensure your Supabase client is imported

const router = Router();

// --- Helper Functions for Database State Management ---

/**
 * Fetches the current state of a participant for a given session.
 */
const getParticipantState = async (session_id, user_identity) => {
    const { data, error } = await supabase
        .from('participants')
        .select('current_state, validated_session_id') // Assuming these columns exist
        .eq('session_id', session_id)
        .eq('livekit_identity', user_identity)
        .single();
    
    if (error || !data) {
        // If not found, assume initial state. In production, participant should exist.
        return { state: "INITIAL", validated_session_id: null };
    }
    return { 
        state: data.current_state || "INITIAL", 
        validated_session_id: data.validated_session_id 
    };
};

/**
 * Updates the state of a participant and optionally stores the validated session ID.
 */
const updateParticipantState = async (session_id, user_identity, newState, validatedId = null) => {
    const updateData = { current_state: newState };
    if (validatedId) {
        updateData.validated_session_id = validatedId;
    }

    const { error } = await supabase
        .from('participants')
        .update(updateData)
        .eq('session_id', session_id)
        .eq('livekit_identity', user_identity);

    if (error) {
        console.error("Supabase state update error:", error);
        throw new Error("Failed to save state to database.");
    }
};

// --- Agent Answer Endpoint ---

router.post('/answer', async (req, res) => {
    const { user_identity, session_id, text, command } = req.body;
    
    let replyText = "";
    let { state: currentState, validated_session_id: currentValidatedId } = await getParticipantState(session_id, user_identity);
    let nextState = currentState;

    try {
        if (command === "START_VERIFICATION" && currentState === "INITIAL") {
            // State: INITIAL -> AWAITING_SESSION_ID
            replyText = "Welcome to the quiz. Please clearly say your **Session ID** to begin.";
            nextState = "AWAITING_SESSION_ID";

        } else if (currentState === "AWAITING_SESSION_ID") {
            // State: AWAITING_SESSION_ID (Handle user input: text)
            const inputSessionId = text.trim().toUpperCase();
            
            // 1. Supabase Check for Session ID Existence
            const { data: sessionData, error } = await supabase
                .from('sessions')
                .select('id')
                .eq('id', inputSessionId)
                .single();

            if (error || !sessionData) {
                replyText = "I couldn't find a valid Session ID matching that. Please say your Session ID again.";
                nextState = "AWAITING_SESSION_ID";
            } else {
                replyText = "Thank you. Now, please say your **Roll Number** for verification.";
                nextState = "AWAITING_ROLL_NUMBER";
                currentValidatedId = inputSessionId; // Update validated ID for the next step
            }

        } else if (currentState === "AWAITING_ROLL_NUMBER") {
            // State: AWAITING_ROLL_NUMBER (Handle user input: text)
            const rollNumber = text.trim();
            
            // 2. Push Roll Number to Supabase (and set as verified)
            const { error: updateError } = await supabase
                .from('participants') 
                .update({ 
                    roll_number: rollNumber, 
                    is_verified: true,
                    // Use the validated session ID stored in the state table
                    validated_session_id: currentValidatedId
                })
                .eq('livekit_identity', user_identity) 
                .eq('session_id', session_id); 

            if (updateError) {
                console.error("Supabase update roll number error:", updateError);
                replyText = "There was an error saving your roll number. Could you please say it once more?";
                nextState = "AWAITING_ROLL_NUMBER";
            } else {
                replyText = `Thank you, verification complete. Your roll number ${rollNumber} has been saved. You may now begin the quiz.`;
                nextState = "VERIFIED";
            }

        } else if (currentState === "VERIFIED") {
            // State: VERIFIED -> Run Main LLM/Quiz Logic
            
            // 1. Fetch LLM Context/History from DB
            // 2. Call LLM API (e.g., Gemini)
            // 3. Save User/LLM turn to DB
            
            replyText = `I am verified. I received your message: "${text}". I am now running the main quiz logic.`;

        } else {
            replyText = "I'm a little confused. Let's restart. Please say your Session ID.";
            nextState = "AWAITING_SESSION_ID";
        }

    } catch (e) {
        console.error("Critical error in agent logic:", e);
        replyText = "A critical error occurred on the server. Please check the logs.";
        nextState = "INITIAL"; // Force restart
    }

    // --- Update State & Respond ---
    try {
        await updateParticipantState(session_id, user_identity, nextState, currentValidatedId);
    } catch (e) {
        // If state update fails, don't break the agent's ability to speak!
        console.error("Failed to persist final state:", e);
        replyText = "I successfully processed your request, but failed to save my current state.";
    }


    res.json({
        type: 'speak',
        text: replyText
    });
});

export default router;