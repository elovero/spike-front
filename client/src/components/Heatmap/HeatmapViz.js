import React, { Component } from "react";
import { isEmpty } from "../../utils";
import * as Sentry from "@sentry/browser";
import * as d3 from "d3";
import ExpandingHeatmapTable from "./ExpandingHeatmapTable";

import { Link } from "react-router-dom";

class HeatmapViz extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      tableRows: [], 
      tableHeader: [], 
      selectedStudyName: props.selectedStudyName,
      selectedRecordingName: props.selectedRecordingName,
      selectedSorterName: props.selectedSorterName
    };
    this.studySetNamesByStudyName = {};
    this.handleCellSelected = this.handleCellSelected.bind(this);
  }

  componentDidMount() {
    this.buildVizData();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.props.studySets !== prevProps.studySets ||
      this.props.studyAnalysisResults !== prevProps.studyAnalysisResults ||
      this.props.threshold !== prevProps.threshold ||
      this.props.format !== prevProps.format ||
      this.props.metric !== prevProps.metric ||
      this.state.selectedStudyName !== prevState.selectedStudyName ||
      this.state.selectedRecordingName !== prevState.selectedRecordingName ||
      this.state.selectedSorterName !== prevState.selectedSorterName
    ) {
      this.buildVizData();
    }
    if (
      this.state.tableHeader !== prevState.tableHeader ||
      this.state.tableRows !== prevState.tableRows
    ) {
      this.handleChartHeight();
    }
  }

  handleChartHeight() {
    let elmnt = document.getElementById("heatmap-card");
    let height = elmnt.offsetHeight;
    if (this.props.handleCardHeightChange)
      this.props.handleCardHeightChange(height);
  }

  buildVizData() {
    let sortedStudySets = this.props.studySets;
    // Note: study sets are sorted alphabetically by name on inititial fetch

    this.studySetNamesByStudyName = {};
    for (let studySet of this.props.studySets) {
      for (let study of studySet.studies) {
        this.studySetNamesByStudyName[study.name] = studySet.name;
      }
    }
    
    if (this.props.groupByStudySets) {
      const studySetGroupStrings = ['PAIRED_', 'SYNTH_', 'HYBRID_', 'MANUAL_'];
      sortedStudySets = [];
      for (let groupString of studySetGroupStrings) {
        for (let studySet of this.props.studySets) {
          if (studySet.name.includes(groupString)) {
            sortedStudySets.push(studySet);
          }
        }
        // empty row
        sortedStudySets.push(null);
      }
    }

    let studyAnalysisResultsByStudyName = {};
    for (let studyAnalysisResult of this.props.studyAnalysisResults.allResults) {
      studyAnalysisResultsByStudyName[studyAnalysisResult.studyName] = studyAnalysisResult;
    }

    // Assemble the table rows (list of objects that will be passed to the ExpandingHeatmapTable component)
    let tableRows = [];
    if (this.props.groupByStudySets) {
      for (let studySet of sortedStudySets) {
        if (studySet) {
          // Here's the table row associated with the study set
          let tableRow = {
            id: 'studySet--' + studySet.name,
            cells: this.computeTableRowCellsFromStudySet(studySet),
            subrows: []
          };
          for (let study of studySet.studies) {
            let studyAnalysisResult = studyAnalysisResultsByStudyName[study.name] || null;
            if (studyAnalysisResult) {
              tableRow.subrows.push({
                id: `subrow--${studySet.name}-${study.name}`,
                cells: this.computeTableRowCellsFromStudyAnalysisResult(studyAnalysisResult, {})
              });
            }
          }
          tableRows.push(tableRow);
        }
        else {
          // empty row
          let tableRow = {
            id: `empty--${tableRows.length}`,
            cells: this.computeEmptyTableRowCells(`empty--${tableRows.length}`),
            subrows: []
          };
          tableRows.push(tableRow);
        }
      }
    }
    else {
      for (let studyAnalysisResult of this.props.studyAnalysisResults.allResults) {
        let tableRow = {
          id: `sar--${studyAnalysisResult.studyName}`,
          cells: this.computeTableRowCellsFromStudyAnalysisResult(studyAnalysisResult, {}),
          subrows: []
        };
        let sar = studyAnalysisResult;
        for (let recind = 0; recind < sar.recordingNames.length; recind++) {
          let recname = sar.recordingNames[recind];
          tableRow.subrows.push({
            id: `sar--${studyAnalysisResult.studyName}--${recname}`,
            cells: this.computeTableRowCellsFromStudyAnalysisResultRecording(studyAnalysisResult, recind, recname)
          });
        }
        tableRows.push(tableRow);
      }
    }

    let headerCells = [];
    headerCells.push({
      id: 'header-sorter--',
      text: ""
    });
    let sorter_names = [];
    for (let sorter of this.props.sorters) {
      sorter_names.push(sorter.name);
    }
    sorter_names.sort();
    for (let sorter_name of sorter_names) {
      headerCells.push({
        id: 'header-sorter-' + sorter_name,
        text: sorter_name,
        link: '/algorithms',
        rotate: true
      });
    }
    let tableHeader = {
      id: 'table-header',
      cells: headerCells
    };

    let elmnt = document.getElementById("heatmap-card");
    let width = elmnt.offsetWidth;
    this.setState({
      tableRows: tableRows,
      tableHeader: tableHeader
    });
  }

  getFormatCopy() {
    let copy;
    switch (this.props.format) {
      case "count":
        copy = `Number of units found above ${this.props.metric} threshold`;
        break;
      case "average":
        copy = `Average ${this.props.metric} above SNR threshold`;
        break;
      case "cpu":
        copy = "Estimated average compute time per recording (sec)";
        break;
      default:
        copy = "";
    }
    return copy;
  }

  computeTableRowCellsFromStudySet(studySet) {
    let aggregatedStudyAnalysisResult = this.aggregateStudyAnalysisResults(studySet);
    return this.computeTableRowCellsFromStudyAnalysisResult(aggregatedStudyAnalysisResult, {isStudySet: true, expandIdOnClick: 'studySet--' + studySet.name});
  }

  computeTableRowCellsFromStudyAnalysisResultRecording(studyAnalysisResult, recordingIndex, recordingName) {
    let sar = this.getStudyAnalysisResultForRecording(studyAnalysisResult, recordingIndex, recordingName);
    return this.computeTableRowCellsFromStudyAnalysisResult(sar, {});
  }

  getStudyAnalysisResultForRecording(studyAnalysisResult, recordingIndex, recordingName) {
    let trueSnrs = [];
    let trueFiringRates = [];
    let trueNumEvents = [];
    // ...
    let sortingResults = [];
    let numSorters = this.props.sorters.length;
    for (let ii = 0; ii < numSorters; ii++) {
      sortingResults.push({
        accuracies: [],
        precisions: [],
        recalls: [],
        numMatches: [],
        numFalsePositives: [],
        numFalseNegatives: [],
        cpuTimesSec: [],
        sorterName: this.props.sorters[ii].name
      });
    }

    let sar = studyAnalysisResult;
    for (let jj = 0; jj < sar.trueRecordingIndices.length; jj++) {
      if (sar.trueRecordingIndices[jj] === recordingIndex) {
        trueSnrs.push(sar.trueSnrs[jj]);
        trueFiringRates.push(sar.trueFiringRates[jj]);
        trueNumEvents.push(sar.trueNumEvents[jj]);
        for (let ii = 0; ii < numSorters; ii++) {
          sortingResults[ii].accuracies.push(sar.sortingResults[ii].accuracies[jj]);
          sortingResults[ii].precisions.push(sar.sortingResults[ii].precisions[jj]);
          sortingResults[ii].recalls.push(sar.sortingResults[ii].recalls[jj]);
          sortingResults[ii].numMatches.push(sar.sortingResults[ii].numMatches[jj]);
          sortingResults[ii].numFalsePositives.push(sar.sortingResults[ii].numFalsePositives[jj]);
          sortingResults[ii].numFalseNegatives.push(sar.sortingResults[ii].numFalseNegatives[jj]);
          sortingResults[ii].cpuTimesSec.push(sar.sortingResults[ii].cpuTimesSec[jj]);
        }
      }
    }
    return {
      studyName: sar.studyName,
      recordingName: recordingName,
      trueSnrs: trueSnrs,
      trueFiringRates: trueFiringRates,
      trueNumEvents: trueNumEvents,
      sortingResults: sortingResults
    };
  }

  aggregateStudyAnalysisResults(studySet) {
    let trueSnrs = [];
    let trueFiringRates = [];
    let trueNumEvents = [];
    // ...
    let sortingResults = [];
    let numSorters = this.props.sorters.length;
    for (let ii = 0; ii < numSorters; ii++) {
      sortingResults.push({
        accuracies: [],
        precisions: [],
        recalls: [],
        numMatches: [],
        numFalsePositives: [],
        numFalseNegatives: [],
        cpuTimesSec: [],
        sorterName: this.props.sorters[ii].name
      });
    }

    let studyNamesInStudySet = {};
    for (let study of studySet.studies) {
      studyNamesInStudySet[study.name] = true;
    }

    for (let studyAnalysisResult of this.props.studyAnalysisResults.allResults) {
      if (studyAnalysisResult.studyName in studyNamesInStudySet) {
        trueSnrs = trueSnrs.concat(studyAnalysisResult.trueSnrs);
        trueFiringRates = trueFiringRates.concat(studyAnalysisResult.trueFiringRates);
        trueNumEvents = trueNumEvents.concat(studyAnalysisResult.trueNumEvents);
        // ...
        for (let ii = 0; ii < numSorters; ii++) {
          sortingResults[ii].accuracies = sortingResults[ii].accuracies.concat(studyAnalysisResult.sortingResults[ii].accuracies);
          sortingResults[ii].precisions = sortingResults[ii].precisions.concat(studyAnalysisResult.sortingResults[ii].precisions);
          sortingResults[ii].recalls = sortingResults[ii].recalls.concat(studyAnalysisResult.sortingResults[ii].recalls);
          sortingResults[ii].numMatches = sortingResults[ii].numMatches.concat(studyAnalysisResult.sortingResults[ii].numMatches);
          sortingResults[ii].numFalsePositives = sortingResults[ii].numFalsePositives.concat(studyAnalysisResult.sortingResults[ii].numFalsePositives);
          sortingResults[ii].numFalseNegatives = sortingResults[ii].numFalseNegatives.concat(studyAnalysisResult.sortingResults[ii].numFalseNegatives);
          sortingResults[ii].cpuTimesSec = sortingResults[ii].cpuTimesSec.concat(studyAnalysisResult.sortingResults[ii].cpuTimesSec);
        }
      }
    }

    return {
      studySetName: studySet.name,
      trueSnrs: trueSnrs,
      trueFiringRates: trueFiringRates,
      trueNumEvents: trueNumEvents,
      // ...
      sortingResults: sortingResults
    };
  }

  computeEmptyTableRowCells(id) {
    let ret = [];
    ret.push({
      id: `${id}---`,
      text: "",
      spacer: true,
      selectable: false
    });
    let numSorters = this.props.sorters.length;
    for (let ii = 0; ii < numSorters; ii++) {
      ret.push({
        id: `${id}--${ii}`,
        text: "",
        spacer: true,
        selectable: false
      });
    }
    return ret;
  }

  computeTableRowCellsFromStudyAnalysisResult(
    studyAnalysisResult,
    opts
  ) {
    let isStudySet = opts.isStudySet || false;
    let expandIdOnClick = opts.expandIdOnClick || null;

    // Compute the table row cells from a study (or for the aggregated results in a study set)
    let format = this.props.format;
    let metric = this.props.metric;
    let threshold = this.props.threshold;
    let ret = []; // the cells to return
    // the first cell is the name of the study
    let link;
    if (this.props.groupByStudySets) {
      // link = isStudySet ? `/studyset/${studyAnalysisResult.studyName}` : `/studyresults/${studyAnalysisResult.studyName}`;
      link = isStudySet ? null : `/studyresults/${studyAnalysisResult.studyName}`;
    }
    else if (studyAnalysisResult.recordingName) {
      link = `/recording/${studyAnalysisResult.studyName}/${studyAnalysisResult.recordingName}`;
    }
    else {
      // link = isStudySet ? `/studyset/${studyAnalysisResult.studyName}` : `/study/${studyAnalysisResult.studyName}`;
      link = isStudySet ? null : `/study/${studyAnalysisResult.studyName}`;
    }
    let name0, id0;
    if (this.props.groupByStudySets) {
      if (isStudySet) {
        name0 = studyAnalysisResult.studySetName;
        id0 = `study-set-${name0}`;
      }
      else {
        name0 = studyAnalysisResult.studyName;
        id0 = `study-${name0}`;
      }
    }
    else if (studyAnalysisResult.recordingName) {
      name0 = studyAnalysisResult.recordingName;
      id0 = `recording-${name0}`
    }
    else {
      let studySetName = this.studySetNamesByStudyName[studyAnalysisResult.studyName];
      if (studySetName)
        name0 = studySetName + '/' + studyAnalysisResult.studyName;
      else
        name0 = studyAnalysisResult.studyName;
      id0 = `study-name-${studyAnalysisResult.studyName}`;
    }
    ret.push({
      id: id0,
      text: name0,
      link: link,
      expand_id_on_click: expandIdOnClick,
      text_align: "right",
      selectable: false
    });
    let rowNormalize; // whether to normalize the rows
    switch (format) {
      case "count":
        rowNormalize = true;
        break;
      case "average":
        rowNormalize = false;
        break;
      default:
        rowNormalize = true;
    }
    let trueSnrs = studyAnalysisResult.trueSnrs;
    // loop through the sorting results for the study, and get the metrics (e.g., counts) to display
    let cellvalList = studyAnalysisResult.sortingResults.map(function(sortingResult) {
      let metricVals;
      if (format === "count" || format === "average") {
        switch (metric) {
          case "accuracy":
            metricVals = sortingResult.accuracies;
            break;
          case "recall":
            metricVals = sortingResult.recalls;
            break;
          case "precision":
            metricVals = sortingResult.precisions;
            break;
          default:
            throw Error("Unexpected metric: " + metric);
        }
      } else if (format === "cpu") {
        metricVals = sortingResult.cpuTimesSec;
      }
      let num_found = 0;
      let num_missing = 0
      for (let i = 0; i < trueSnrs.length; i++) {
        let val0 = sortingResult.accuracies[i];
        if (this.isNumeric(val0)) {
          num_found++;
        }
        else {
          num_missing++;
        }
      }
      if (num_found === 0)
        return {value: undefined, num_missing:num_missing};

      if (format === "count") {
        if (metricVals && metricVals.length > 0) {
          let numAbove = metricVals.filter(val => {
            return ((this.isNumeric(val)) && (val >= threshold)); // metric threshold
          });
          return {value: numAbove.length, num_missing:num_missing};
        } else {
          return {value: undefined, num_missing:num_missing};
        }
      } else if (format === "average") {
        if (metricVals && metricVals.length > 0) {
          let valsToUse = [];
          for (let i = 0; i < trueSnrs.length; i++) {
            if (trueSnrs[i] > threshold) {
              let val0 = metricVals[i];
              if (this.isNumeric(val0)) {
                valsToUse.push(metricVals[i]);
              }
            }
          }
          let aboveAvg = 0;
          if (valsToUse.length) {
            let sum = 0;
            let count = 0;
            for (let i=0; i<valsToUse.length; i++) {
              if (this.isNumeric(valsToUse[i])) {
                sum += valsToUse[i];
                count++;
              }
            }
            if (count === 0) {
              return {value: undefined, num_missing:num_missing};  
            }
            aboveAvg = sum / count;
          }

          // This just prints the output to 2 digits
          let avgRounded = Math.round(aboveAvg * 100) / 100;
          return {value: avgRounded, num_missing:num_missing};
        } else {
          return {value: undefined, num_missing:num_missing};
        }
      } else if (format === "cpu") {
        if (metricVals && metricVals.length > 0) {
          let sum = 0;
          let count = 0;
          for (let i=0; i<metricVals.length; i++) {
            if (this.isNumeric(metricVals[i])) {
              sum += metricVals[i];
              count++;
            }
          }
          if (count === 0) {
            return {value: undefined, num_missing:num_missing};  
          }
          let avg = sum / count;
          let avgRounded = Math.round(avg);
          return {value: avgRounded, num_missing:num_missing, vals: metricVals};
        } else {
          return {value: undefined, num_missing:num_missing};
        }
      } else {
        Sentry.captureMessage(
          "Unsupported format in computeTableRowCellsFromStudyAnalysisResult",
          format
        );
        return {value: undefined, num_missing:num_missing};
      }
    }, this);

    let maxMetricVal = 0;
    cellvalList.forEach(x => {
      if ((this.isNumeric(x.value)) && (x.value > maxMetricVal))
        maxMetricVal = x.value;
    })

    // For each result, we can now determine the color and text
    studyAnalysisResult.sortingResults.forEach(function(sortingResult, i) {
      let val0 = cellvalList[i].value;
      let text, color, bgcolor;
      if (val0 === undefined) {
        text = "";
        color = "black";
        bgcolor = "white";
      } else {
        text = val0;
        if (cellvalList[i].num_missing > 0)
          text += '*';
        if ((rowNormalize) && (maxMetricVal)) {
          val0 = val0 / maxMetricVal;
        }
        if (maxMetricVal) {
          color = this.computeForegroundColor(val0);
          bgcolor = this.computeBackgroundColor(val0);
        } else {
          color = "black";
          bgcolor = "white";
        }
      }
      // add a cell corresponding to a sorting result
      let selected0, id0;
      if (studyAnalysisResult.recordingName) {
        selected0 = ((studyAnalysisResult.studyName === this.state.selectedStudyName) && (sortingResult.sorterName === this.state.selectedSorterName) && (studyAnalysisResult.recordingName.recordingName === this.state.selectedRecordingName));
        id0 = `sorting-result-${studyAnalysisResult.studyName}---${studyAnalysisResult.recordingName}---${sortingResult.sorterName}`;
      }
      else {
        selected0 = ((studyAnalysisResult.studyName === this.state.selectedStudyName) && (sortingResult.sorterName === this.state.selectedSorterName))
        id0 = `sorting-result-${studyAnalysisResult.studyName}---${sortingResult.sorterName}`;
      }
      ret.push({
        id: id0,
        expand_id_on_click: expandIdOnClick,
        color: color,
        bgcolor: bgcolor,
        text: text,
        vals: cellvalList[i].vals,
        border_left: true,
        border_right: true,
        text_align: "center",
        selectable: isStudySet ? false : true,
        selected: selected0,
        info: {
          studyAnalysisResult: studyAnalysisResult,
          sorterName: sortingResult.sorterName
        } // needed in onCellSelected -> selectStudyName, selectSorterName
      });
    }, this);
    return ret;
  }

  computeBackgroundColor(val) {
    // TODO: Swap d3 ranges with these custom ones
    // const colorRanges = {
    //   count: [d3.rgb("#00CEA8"), d3.rgb("#0C4F42")],
    //   average: [d3.rgb("#edf0fc"), d3.rgb("#6B7CC4"), d3.rgb("#102BA3")],
    //   cpu: [d3.rgb("#EFC1E3"), d3.rgb("#B52F93")]
    // };
    let color;
    switch (this.props.format) {
      case "count":
        color = d3.interpolateGreens(val);
        break;
      case "average":
        color = d3.interpolateBlues(val);
        break;
      case "cpu":
        color = d3.interpolateYlOrRd(val);
        break;
      default:
        color = d3.interpolateInferno(val);
        break;
    }
    return color;
  }

  computeForegroundColor(val) {
    return val < 0.5 ? "black" : "white";
  }

  handleCellSelected(cell) {
    if (cell.selectable) {
      if (this.props.selectStudyName)
        this.props.selectStudyName(cell.info.studyAnalysisResult.studyName);
      if (this.props.selectRecordingName)
        this.props.selectRecordingName(cell.info.studyAnalysisResult.recordingName || null);
      if (this.props.selectSorterName)
        this.props.selectSorterName(cell.info.sorterName);
      this.setState({
        selectedStudyName: cell.info.studyAnalysisResult.studyName,
        selectedRecordingName: cell.info.studyAnalysisResult.recordingName || null,
        selectedSorterName: cell.info.sorterName
      });
    }
  }

  isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  render() {
    const loading =
      isEmpty(this.state.tableRows) ||
      isEmpty(this.state.tableHeader);
    const title = this.getFormatCopy();
    const copy =
      this.props.format !== "cpu"
        ? "  Select individual cells to see corresponding details. "
        : "";
    let divStyle = {
      backgroundColor: "#fffdc0",
      borderRadius: "5px",
      display: "inline-block"
    };
    return (
      <div className="card card--heatmap" id="heatmap-card">
        <div className="card__header">
          <h4 className="card__title">{title}</h4>
        </div>
        <div>
          {
            this.props.groupByStudySets ?
            (
              <span>
                <p style={divStyle}>
                  {
                    this.props.format === 'cpu' ?
                    (
                      <span><b>Important!</b> These numbers reflect actual compute times on our cluster and are not meant to be a rigorous benchmark. The algorithms were applied in batches, with many different algorithms possibly running
                        simultaneously on the same machine. Some runs may have been allocated more CPU cores than others. We are working toward a more accurate compute time test.
                      </span>
                    ) :
                    (
                      <span>
                        These are preliminary results prior to parameter optimization, and we are still in the process of ensuring that we are using the proper <Link to="/algorithms">versions of the spike sorters</Link>.
                        We expect to go live by the end of July at <a href="https://spikeforest.flatironinstitute.org">spikeforest.flatironinstitute.org</a>.
                      </span>

                    )
                  }
                </p>
                <p>
                  Click to expand study set rows and see component study data. {copy} * An asterisk indicates an incomplete or failed sorting on a subset of results.</p>
              </span>
            ) :
            (
              <span>
                <p>{copy} * An asterisk indicates an incomplete or failed sorting on a subset of results.</p>
              </span>
            )
          }
        </div>
        {loading ? (
          <h4>...</h4>
        ) : (
          <div className="heatmap__column">
            <ExpandingHeatmapTable
              header={this.state.tableHeader}
              rows={this.state.tableRows}
              onCellSelected={this.handleCellSelected}
            />
          </div>
        )}
      </div>
    );
  }
}

export default HeatmapViz;
