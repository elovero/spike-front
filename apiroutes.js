const express = require("express");
const router = express.Router();

const sorterController = require("./controllers/sorterController");
const algorithmController = require("./controllers/algorithmController");
const sortingResultController = require("./controllers/sortingResultController");
const studySetController = require("./controllers/studySetController");
const studyAnalysisResultController = require("./controllers/studyAnalysisResultController");
const mailer = require("./email/mailer.js");

const MountainClient = require('./mountainclient-js').MountainClient;

/* V2 Data: New Routes
–––––––––––––––––––––––––––––––––––––––––––––––––– */

// CPU Routes
router.get("/api/cpus", sortingResultController.getCPUs);
// Sorters
router.get("/api/sorters", sorterController.getSorters);
// Algorithms
router.get("/api/algorithms", algorithmController.getAlgorithms);
// Sorting Results
router.get("/api/sortingresults", sortingResultController.getSortingResults);
// Study Sets
router.get("/api/studysets", studySetController.getStudySets);
// Summary Stats
router.get("/api/stats", sortingResultController.getStats);
// Load object
router.get("/api/loadObject", async (req, res) => {
  let path = decodeURIComponent(req.query.path)

  let mt = new MountainClient();
  mt.configDownloadFrom('spikeforest.public');
  
  let obj = await mt.loadObject(path);
  if (obj) {
    res.send({success:true, object: obj});
  }
  else {
    res.send({success:false});
  }
});
// Study analysis results
router.get("/api/studyanalysisresults", studyAnalysisResultController.getStudyAnalysisResults);
// Contact Routes
router.post("/api/contact", async (req, res) => {
  try {
    let sent = await mailer.send(req.body);
    res.send({
      success: true
    });
  } catch (e) {
    //TODO: Add Sentry logging
    console.log("Error", e);
  }
});

module.exports = router;
