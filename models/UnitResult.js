/* Example Unit Result
–––––––––––––––––––––––––––––––––––––––––––––––––– */
// Note: I included best unit and matched unit as numbers,
// but perhaps these should point to another document
// or another type of identifier.
// I've included also a directory item here for accessing kbucket
// to get spike data for further viz work
//
// {
//   _id: "58c03a428060197ca0b52d4f",
//   accuracy: 1.00,
//   bestUnit: 3,
//   directory: "kbucket://15734439d8cf/this_is_a_kbucket_link_for_spike_data",
//   falseNeg: 0.00,
//   falsePos: 0.00,
//   matchedUnit: 3,
//   numMatches: 1307,
//   name: "synth_10_K10_C4_001_1_IronClust_tetrode",
//   sorter: "511bde3e3985283f25000004",
//   unit: "58c039938060197ca0b52d4d",
// }

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const unitResultSchema = new mongoose.Schema({
  name: {
    type: String,
    required: "You must provide a name for the unit result."
  },
  accuracy: {
    type: Number
  },
  bestUnit: {
    // TODO: how is this unit distinguished?
    type: Number
  },
  directory: {
    type: String
  }
  falseNeg: {
    type: Number
  },
  falsePos: {
    type: Number
  },
  matchedUnit: {
    // TODO: how is this unit distinguished?
    type: Number
  },
  numMatches: {
    type: Number
  },
  sorter: {
    type: Schema.Types.ObjectId,
    ref: "Sorter"
  },
  unit: {
    type: Schema.Types.ObjectId,
    ref: "Unit"
  },
});

module.exports = mongoose.model("UnitResult", unitResultSchema);
