import React, { Component } from "react";
import { isEmpty } from "../../utils";

// Components
import Preloader from "../Preloader/Preloader";
import { Container, Jumbotron } from "react-bootstrap";

// Redux
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import * as actionCreators from "../../actions/actionCreators";

// Stylin'
import "./heatmap.css";

class HeatmapCPU extends Component {
  constructor(props) {
    super(props);
    this.state = {
      builtData: []
    };
  }

  componentDidMount() {
    if (this.props.cpus && this.props.cpus.length) {
      this.filterAndMap();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.props.cpus !== prevProps.cpus ||
      this.props.sliderValue !== prevProps.sliderValue
    ) {
      this.filterAndMap();
    }
  }

  filterAndMap() {
    this.setState({ builtData: this.props.cpus });
  }

  render() {
    let loading = isEmpty(this.state.builtData);
    console.log("🦓", this.state);
    return (
      <div>
        {loading ? (
          <Container>
            <Preloader />
          </Container>
        ) : (
          <Jumbotron fluid>
            <Container fluid>
              <h1>I am the entire viz</h1>
              <p>
                This is a modified jumbotron that occupies the entire horizontal
                space of its parent.
              </p>
              <img
                className="card__image"
                width="480"
                height="363"
                src="https://media.giphy.com/media/3o72FkiKGMGauydfyg/giphy.gif"
                alt="gif"
              />
            </Container>
          </Jumbotron>
        )}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    selectedStudy: state.selectedStudy,
    selectedRecording: state.selectedRecording
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(actionCreators, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HeatmapCPU);
