// Local-only configuration. The Vercel serverless runtime imports app.js directly
// and uses its encrypted project environment variables instead
const mongoose = require("mongoose"); 
require("dotenv").config({ path: __dirname + "/.env" });
const app = require("./app");

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log("MongoDB connected");

app.listen(PORT, () => {
  console.log(`ResQAI server listening on port ${PORT}`);
});
})
.catch((error)=>{
  console.error("MongoDB connection error:", error);
});
