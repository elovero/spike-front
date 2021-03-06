import React, { Component } from "react";

class RecordingRow extends Component {
  constructor() {
    super();

    this.state = {
      open: false
    };
  }

  render() {
    const recording = this.props.recording;
    return (
      <React.Fragment>
        <tr className="row__expanded-header-recordings">
          <td />
          <td></td>
          <td></td>
          <td>{recording.name}</td>
          <td>{recording.description}</td>
          <td>{recording.numChannels}</td>
          <td>{recording.numTrueUnits}</td>
          <td>{recording.sampleRateHz}</td>
          <td>{recording.spikeSign}</td>
        </tr>
      </React.Fragment>
    );
  }
}

export default RecordingRow;
