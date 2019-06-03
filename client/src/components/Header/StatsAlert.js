import React, { Component } from "react";
import { Alert } from "react-bootstrap";

import "./Header.css";

class StatsAlert extends Component {
  render() {
    /* CPU - sum of all cpuTimeSec on every sorting result */
    /* Ground truth - count of all true units */
    /* Recording data - hard code*/
    let general = this.props.general || {};
    let totalCpu = 0;
    if (this.props.sortingResults) {
      for (let sortingResult of this.props.sortingResults) {
        totalCpu += sortingResult.cpuTimeSec;
      }
    }
    let totalNumTrueUnits = 0;
    if (this.props.studySets) {
      for (let studySet of this.props.studySets) {
        for (let study of studySet.studies) {
          for (let recording of study.recordings) {
            totalNumTrueUnits += recording.numTrueUnits;
          }
        }
      }
    }
    let coreHours = Math.round(totalCpu / 60);
    let groundTruth = totalNumTrueUnits;
    return (
      <div className="alert__wrapper">
        <Alert dismissible variant={"warning"} className="alert__stats">
          <div className="alert__ticker--wrapper">
            <div className="alert__ticker">
              <div className="ticker__item">
                <b>Beta notice:</b>
              </div>
              <div className="ticker__item">
                This is a website preview.
              </div>
              <div className="ticker__item">
                <b>Project totals:</b>
              </div>
              <div className="ticker__item">
                {coreHours.toLocaleString()} hours compute time
              </div>
              <div className="ticker__item">
                {groundTruth.toLocaleString()} ground truth units
              </div>
              <div className="ticker__item">1.2 TB of recordings</div>
              <div className="ticker__item">
                <b>Analysis updated:</b>
              </div>
              <div className="ticker__item">
                {general.dateUpdated ? new Date(general.dateUpdated).toLocaleString('en-US',{year:'numeric', month:'short', day:'numeric', hour:'numeric', minute:'numeric'}) : ''}
              </div>
            </div>
          </div>
        </Alert>
      </div>
    );
  }
}

export default StatsAlert;
