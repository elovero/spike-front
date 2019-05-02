import React from "react";
import "./expandingheatmaptable.css";

class ExpandingHeatmapTable extends React.Component {
  // props are rows and header
  constructor(props) {
    super(props);
    this.state = { expandedRowIds: {}, selectedCellId: null };
    this.handleCollapse = this.handleCollapse.bind(this);
    this.handleExpand = this.handleExpand.bind(this);
  }
  handleCellSelected(cell) {
    if (cell.expand_id_on_click) {
      this.handleToggle(cell.expand_id_on_click);
    }
    if (!cell.selectable) return;
    this.setState({
      selectedCellId: cell["id"]
    });
    if (this.props.onCellSelected)
      this.props.onCellSelected(cell);
  }
  createTableCell(cell) {
    let classes0 = [];
    if (cell["id"] === this.state.selectedCellId) classes0.push("selected");
    if (cell["rotate"]) classes0.push("rotate");
    if (cell["border_right"]) classes0.push("border_right");
    if (cell["border_top"]) classes0.push("border_top");
    if (cell["selectable"]) classes0.push("selectable");
    if (cell["spacer"]) classes0.push("spacer");
    if (cell.expand_id_on_click) classes0.push("expandable");
    let class0 = classes0.join(" ");
    let style0 = { color: cell.color || 'black', backgroundColor: cell.bgcolor || 'white', textAlign: cell.text_align || 'left' };
    if (cell.text_align === 'right')
      style0.paddingRight = '4px';
    return (
      <td
        //bgcolor={cell.bgcolor || ""}
        onClick={() => this.handleCellSelected(cell)}
        className={class0}
        style={style0}
      >
        <div>
          <span>{cell.text}</span>
        </div>
      </td>
    );
  }
  createTableRows(row, isSubrow) {
    let ret = [];
    let id0 = row.id || null;
    let expanded = this.state.expandedRowIds[id0];
    let tds = [];
    if ((row.subrows) && (row.subrows.length > 0)) {
      if (expanded) {
        tds.push(<td>{this.createCollapseButton(id0)}</td>);
      } else {
        tds.push(<td>{this.createExpandButton(id0)}</td>);
      }
    } else {
      tds.push(<td />);
    }
    row.cells.map(function (c, i) {
      tds.push(this.createTableCell(c));
      return null;
    }, this);
    ret.push(<tr className={isSubrow ? "subrow" : "toprow"}>{tds}</tr>);
    if (expanded) {
      if ((row.subrows) && (row.subrows.length > 0)) {
        row.subrows.forEach(function (subrow, i) {
          let trs0 = this.createTableRows(subrow, true);
          ret = ret.concat(trs0);
          return null;
        }, this);
      }
    }
    return ret;
  }
  handleCollapse(id) {
    let x = this.state.expandedRowIds;
    x[id] = false;
    this.setState({
      expandedRowIds: x
    });
  }
  handleExpand(id) {
    let x = this.state.expandedRowIds;
    x[id] = true;
    this.setState({
      expandedRowIds: x
    });
  }
  handleToggle(id) {
    let x = this.state.expandedRowIds;
    x[id] = !(x[id]);
    this.setState({
      expandedRowIds: x
    });
  }
  createCollapseButton(id) {
    return <div onClick={() => this.handleCollapse(id)}><span style={{ cursor: 'pointer' }}>{"-"}</span></div>;
  }
  createExpandButton(id) {
    return <div onClick={() => this.handleExpand(id)}><span style={{ cursor: 'pointer' }}>{"+"}</span></div>;
  }
  render() {
    let trs = [];
    trs = trs.concat(this.createTableRows(this.props.header));
    this.props.rows.forEach(function (row) {
      let trs0 = this.createTableRows(row);
      trs = trs.concat(trs0);
      return null;
    }, this);
    return <table className="expandingheatmaptable">{trs}</table>;
  }
}

export default ExpandingHeatmapTable;