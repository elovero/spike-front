import React, { Component } from "react";
import { Link } from "react-router-dom";

import "./footer.css";
import github from "./github-white.svg";

class Footer extends Component {
  render() {
    return (
      <footer className="footer">
        <p className="updated">Updated on May 16, 2019 (morning)</p>
        <div className="outro">
          <p className="footer__description">
            SpikeForest is a website and open source computing framework for
            evaluating and comparing spike sorting algorithms for
                neurophysiology data analysis. It is a project of the
        Center for Computational Mathematics at the Flatiron Institute.
          </p>
        </div>

        <ul className="footer__links x-small">
          <li className="x-small">
            <Link exact="true" to="/about">
              About
            </Link>
          </li>
          <li className="x-small">
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://simonsfoundation.org"
            >
              Simons Foundation
            </a>
          </li>
          <li className="x-small">
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://flatironinstitute.org"
            >
              Flatiron Institute
            </a>
          </li>
          <li className="x-small">
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/flatironinstitute/spikeforest"
            >
              SpikeForest Analysis Framework
            </a>
          </li>
          <li className="x-small">
            <Link exact="true" to="/contact">
              Contact
            </Link>
          </li>
        </ul>
        <div className="footer__interwebs">
          <div className="interwebs__outer">
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/elovero/spike-front"
              className="github-logo"
            >
              <img alt="spikeforest logo" src={github} height="24" />
            </a>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/flatironinstitute/spikeforest"
              className="github-logo"
            >
              <img alt="spikeforest logo" src={github} height="24" />
            </a>
          </div>
        </div>
        <p className="footer__location xx-small tk-atlas">
          SpikeForest is made with
          <span
            role="img"
            aria-label="microscrope emoji"
            className="footer__emoji"
          >
            🔬
        </span>{" "}
          in NYC
          <span
            role="img"
            aria-label="statue of liberty"
            className="footer__emoji"
          >
            🗽
          </span>
        </p>
      </footer>
    );
  }
}
export default Footer;
