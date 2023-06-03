const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const writerRequestSchema = new Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: [true, "A user must be behind a request"],
  },
  message: {
    type: String,
    required: [true, "A request must hav a message"],
  },
  isAccepted: {
    type: Boolean,
    default: false,
  },
  requestDate: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("WriterRequest", writerRequestSchema);
