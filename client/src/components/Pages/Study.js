import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Col, Container, Row } from "react-bootstrap";

class Study extends Component {
  render() {
    let study = {};
    this.props.studies.forEach(ss => {
        if (ss.name === this.props.studyName) {
            study = ss;
        }
    })
    if (!study) {
      return <div>Study not found: {this.props.studyName}</div>
    }
    let recordingsInStudy = [];
    for (let rec of this.props.recordings) {
      if (rec.studyName === this.props.studyName) {
        recordingsInStudy.push(rec);
      }
    }
    let recording_header = (
      <tr>
        <th>Recording</th>
        <th>Sample rate (Hz)</th>
        <th>Num. Channels</th>
        <th>Duration (sec)</th>
        <th>Num. true units</th>
        <th>Directory</th>
        <th>True firings</th>
      </tr>
    )
    let recording_rows = [];
    for (let rec of recordingsInStudy) {
      recording_rows.push(
        <tr>
          <td>{rec.name}</td>
          <td>{rec.sampleRateHz}</td>
          <td>{rec.numChannels}</td>
          <td>{rec.durationSec}</td>
          <td>{rec.numTrueUnits}</td>
          <td>{abbreviateSha1Path(rec.directory)}</td>
          <td>{abbreviateSha1Path(rec.firingsTrue)}</td>
        </tr>
      )
    }
    return (
      <div className="page__body">
        <Container className="container__heatmap">
          <Row className="container__sorter--row justify-content-md-center">
            <Col lg={12} sm={12} xl={10}>
              <div className="card card--stats">
                <div className="content">
                  <div className="card__footer">
                    <hr />
                    <h3>Study name: {study.name}</h3>
                    <p>
                      This study is part of the <Link to={`/studyset/${study.studySetName}`}>{study.studySetName}</Link> study set.
                      You can <Link to={`/studyresults/${study.name}`}>view the sorting results</Link> associated with this study.
                    </p>
                    <h3>Recordings in {study.name}</h3>
                    <table className="table">
                      <thead>
                        {recording_header}
                      </thead>
                      <tbody>
                        {recording_rows}
                      </tbody>
                    </table>
                    {/* <pre>{JSON.stringify(this.props.recordings, null, 4)}</pre> */}
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

function abbreviateSha1Path(path) {
  let list0 = path.split('/');
  return <span title={path}>{`${list0[0]}//.../${list0[list0.length-1]}`}</span>;
}

export default Study;
