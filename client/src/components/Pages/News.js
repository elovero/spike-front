import React, { Component } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
const ReactMarkdown = require("react-markdown");

class News extends Component {
  render() {
    let posts = this.props.newsPosts || [
      {
        title: "loading...",
        date: "",
        author: ""
      }
    ];

    return (
      <div className="page__body">
        <Container className="container__heatmap">
          <Row className="subcontainer justify-content-md-center">
            <Col lg={12} sm={12} xl={12}>
              <div className="intro">
                <p className="big">News</p>
              </div>
            </Col>
          </Row>
          {posts.map(post => (
            <Row
              key={`${post.title}--${post.date}`}
              className=" justify-content-md-center"
            >
              <Col lg={12} sm={12} xl={12}>
                <div className="card card__std">
                  <div className="content">
                    <div className="card__label">
                      <p>
                        <strong>{post.title}</strong>
                      </p>
                    </div>
                    <div className="card__footer">
                      <hr />
                      <div style={{ height: "auto", overflow: "auto" }}>
                        <ReactMarkdown
                          source={preparePostMarkdown(post)}
                          renderers={{ link: renderLink }}
                        />
                      </div>
                    </div>
                    <div className="card__author">
                      {/* <img alt="avatar icon" src={avatar} height="28" /> */}
                      <p>
                        <Link exact="true" to="/about">
                          {post.author}
                        </Link>
                        , {post.date}
                      </p>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          ))}
        </Container>
      </div>
    );
  }
}

<<<<<<< HEAD
function renderLink(props) {
  return (
    <a href={props.href} rel="noopener noreferrer" target="_blank">
      {props.children}
    </a>
  );
}

function preparePostMarkdown(post) {
  return `${post.markdown}`;
=======
        return (
            <div className="page__body">
                <Container className="container__heatmap">
                    {posts.map(post => (
                        <Row key={`${post.title}--${post.date}`} className="container__sorter--row justify-content-md-center">
                            <Col lg={8} sm={12} xl={8}>
                                <div className="card card--stats">
                                    <div className="content">
                                        <div className="card__footer">
                                            <div style={{height: 400, overflow: 'auto'}}>
                                                <ReactMarkdown
                                                    source={prepare_post_markdown(post)}
                                                    renderers={{link: LinkRenderer}}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    ))}
                </Container>
            </div>
        );
    }
}

function LinkRenderer(props) {
    return <a href={props.href} target="_blank">{props.children}</a>
}

function prepare_post_markdown(post) {
    return `# ${post.title}\n\n## ${post.date}\n\nby ${post.author}\n\n${post.markdown}`;
>>>>>>> 60c0c6916aad65f5de662500aeb909bcf8131306
}

export default News;
