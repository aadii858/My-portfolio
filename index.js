const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();
exports.sendContactMessage = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const { name, email, message } = data;
  if (!name || !email || !message) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The request must contain name, email, and message."
    );
  }

  try {
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
