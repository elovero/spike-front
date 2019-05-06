import React, { Component } from "react";
import { isEmpty } from "../../utils";
import * as Sentry from "@sentry/browser";

// Components
import { Col, Container, Row } from "react-bootstrap";
import HeatmapViz from "./HeatmapViz";
import Preloader from "../Preloader/Preloader";
import ScatterplotCard from "../ScatterplotBits/ScatterplotCard";

// Redux
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import * as actionCreators from "../../actions/actionCreators";

// Stylin'
import "./heatmap.css";

class HeatmapCPU2 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      builtData: []
    };
  }

  componentDidMount() {
    if (this.props.unitsMap.length) {
      this.filterCPUMap();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.props.unitsMap !== prevProps.unitsMap ||
      this.props.sliderValue !== prevProps.sliderValue ||
      this.props.metric !== prevProps.metric
    ) {
      this.filterCPUMap();
    }
  }

  filterCPUMap() {
    this.setState({ builtData: this.props.unitsMap });
  }

  render() {
    let loading = isEmpty(this.state.builtData);
    return (
      <div>
        {loading ? (
          <Container>
            <Preloader />
          </Container>
        ) : (
          <Container className="container__heatmap">
            <Row className="container__heatmap--row">
              <Col lg={6} sm={12}>
                <HeatmapViz
                  cpus={this.props.cpus}
                  selectStudySortingResult={this.props.selectStudySortingResult}
                  selectedStudySortingResult={
                    this.props.selectedStudySortingResult
                  }
                  groupedUnitResults={this.state.builtData}
                  studies={this.props.studies}
                  studysets={this.props.studysets}
                  format={this.props.format}
                  metric={this.props.metric}
                  threshold={this.props.sliderValue}
                />
              </Col>
              <Col lg={6} sm={12}>
                <ScatterplotCard
                  {...this.props}
                  sliderValue={this.props.sliderValue}
                />
              </Col>
            </Row>
          </Container>
        )}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    selectedStudySortingResult: state.selectedStudySortingResult,
    selectedRecording: state.selectedRecording
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(actionCreators, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HeatmapCPU2);
