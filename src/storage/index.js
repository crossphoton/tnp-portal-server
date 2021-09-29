const admin = require("firebase-admin");
const serviceAccount = require("../../config/service.json");

// Initialize the Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://tnp-iiitr.firebaseio.com",
  storageBucket: "tnp-iiitr.appspot.com",
});

const bucket = admin.storage().bucket();

async function storeResume(id, base64File) {
  try {
    var file = bucket.file(`portal/resume/${id}`),
      plainBase64 = base64File.replace(/^data:\w+\/\w+;base64,/, ""),
      fileBuffer = Buffer.from(plainBase64, "base64");

    await file.save(fileBuffer, {
      contentType: String(base64File).split(";", 1)[0].replace("data:", ""),
      public: true,
    });

    return file.publicUrl();
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function storeAvatar(id, base64File) {
  try {
    var file = bucket.file(`portal/avatar/${id}`),
      plainBase64 = base64File.replace(/^data:\w+\/\w+;base64,/, ""),
      fileBuffer = Buffer.from(plainBase64, "base64");

    await file.save(fileBuffer, {
      contentType: String(base64File).split(";", 1)[0].replace("data:", ""),
      public: true,
    });

    return file.publicUrl();
  } catch (error) {
    console.error(error);
    return null;
  }
}

module.exports = { storeAvatar, storeResume };
