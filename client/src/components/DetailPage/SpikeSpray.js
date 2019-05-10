import React, { Component } from "react";
import { Card, Col, Container, Row } from "react-bootstrap";
import Preloader from "../Preloader/Preloader";
import { XYPlot, XAxis, LineSeries, LabelSeries } from "react-vis";
import { isEmpty } from "../../utils";

class SpikeSpray extends Component {
  constructor(props) {
    super(props);
    this.state = {
      spikeObjArr: [],
      hoveredNode: null
    };
    this.colorArr = [
      "#e6194B",
      "#bfef45",
      "#3cb44b",
      "#42d4f4",
      "#4363d8",
      "#911eb4",
      "#f032e6",
      "#ffe119"
    ];
  }

  componentDidMount() {
    this.buildSprayData3();
  }

  addOffset(timepoints, i) {
    let offset = -0.2 * i;
    let newTPs = [];
    timepoints.forEach(timepoint => {
      let newtp = {
        x: timepoint.x,
        y: timepoint.y + offset
      };
      newTPs.push(newtp);
    });
    return newTPs;
  }

  formatWaveformsAddOffset(waveforms, i) {
    let xyWaves = waveforms.map((wave, index) => {
      let timeVal = 1.67 * index;
      return { x: timeVal, y: wave };
    });
    return this.addOffset(xyWaves, i);
  }

  formatWaveforms(waveforms, i) {
    let xyWaves = waveforms.map((wave, index) => {
      let timeVal = 1.67 * index;
      return { x: timeVal, y: wave };
    });
    return xyWaves;
  }

  colorOrganizeColumns(columnArr) {
    let colorGroups = [];
    this.colorArr.forEach(color => {
      let colorGroup = columnArr.filter(line => line.color === color);
      if (colorGroup.length) {
        colorGroups.push(colorGroup);
      }
    });
    return colorGroups;
  }

  buildSprayData3() {
    let withPlots = this.props.spikeSprayData.map(chartObj => {
      let plotData = [];
      if (chartObj.spike_waveforms.length) {
        chartObj.spike_waveforms.forEach(spike => {
          spike.channels.forEach((channel, i) => {
            let colorLine = this.colorArr[i];
            plotData.push({
              color: colorLine,
              channel: channel.channel_id,
              data: this.formatWaveformsAddOffset(channel.waveform, i)
            });
          });
        });
      } else {
        plotData.push([]);
      }
      return { ...chartObj, plotData: plotData };
    });
    let spikeObjArr = this.buildLabelData(withPlots);
    this.setState({
      spikeObjArr: spikeObjArr
    });
  }

  buildLabelData(spikeObjArr) {
    let withLabels = spikeObjArr.map(chartObj => {
      let labelData = [];
      chartObj.channel_ids.forEach((channel, i) => {
        let offset = -0.2 * i;
        let labelObj = {
          x: 0,
          y: offset,
          label: "Channel " + channel,
          style: { fontSize: "14px", lineHeight: "16px", fontWeight: "400" }
        };
        labelData.push(labelObj);
      });
      return { ...chartObj, labelData: labelData };
    });
    return withLabels;
  }

  render() {
    let loading = isEmpty(this.state.spikeObjArr);
    let colTitles = {
      true: "Groundtruth",
      sorted: "Sorted",
      true_missed: "True Missed / False Positive",
      sorted_false: "Sorted False / False Negative"
    };
    let totalSpikes = isEmpty(this.state.spikeObjArr)
      ? 0
      : this.state.spikeObjArr[0].num_spikes;
    return (
      <div>
        {loading ? (
          <Container className="container__heatmap">
            <Card>
              <Card.Body>
                <Preloader />
              </Card.Body>
            </Card>
          </Container>
        ) : (
          <div>
            <Row>
              {this.state.spikeObjArr.map((column, i) => (
                <Col lg={3} key={`spikecol-${Math.random(i)}`}>
                  <div className="card__label">
                    <p className="card__charttitle">
                      {colTitles[column.name]} <br />
                      {column.num_spikes} of {totalSpikes} spikes shown
                    </p>
                  </div>
                  <XYPlot
                    width={350}
                    height={700}
                    key={`spikeplot-${Math.random(i)}`}
                  >
                    <XAxis title="Samples in time" />
                    {column.plotData.map((line, i) => (
                      <LineSeries
                        key={`line-${Math.random(i)}`}
                        color={line.color}
                        data={line.data}
                        style={{ strokeWidth: 0.25 }}
                      />
                    ))}
                    <LabelSeries
                      animation
                      allowOffsetToBeReversed
                      data={column.labelData}
                    />
                  </XYPlot>
                </Col>
              ))}
            </Row>
          </div>
        )}
      </div>
    );
  }
}

export default SpikeSpray;