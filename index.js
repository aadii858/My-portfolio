const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
admin.initializeApp();

// Get a Firestore instance
const db = admin.firestore();

/**
 * Callable function to process contact form submissions.
 * NOTE: This function is currently not called by the frontend, but is
 * included here as part of the original project structure.
 */
exports.sendContactMessage = functions.https.onCall(async (data, context) => {
  // Enforcing authentication is good practice for callable functions, 
  // though the frontend currently uses direct Firestore write.
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const { name, email, message } = data;

  // Basic validation
  if (!name || !email || !message) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The request must contain name, email, and message."
    );
  }

  try {
    // This is the direct Firestore path, matching the security rules setup.
    // NOTE: For a callable function, you typically store data in a common, trusted collection 
    // where the function (Admin SDK) bypasses client rules.
    await db.collection("contactFormSubmissions").add({
      name: name,
      email: email,
      message: message,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      userId: context.auth.uid,
    });

    console.log("Contact message received via function:", data);
    return { success: true, message: "Message sent successfully!" };
  } catch (error) {
    console.error("Error writing contact message via function:", error);
    throw new functions.https.HttpsError(
      "unknown",
      "Failed to send message.",
      error.message
    );
  }
});
