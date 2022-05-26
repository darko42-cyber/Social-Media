const app = require("./app");
const PORT = process.env.PORT || 5000;
const cloudinary = require("cloudinary");
const { connectDatabase } = require("./config/database");

connectDatabase();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.listen(process.env.PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});
