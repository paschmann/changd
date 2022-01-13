import React, { Component } from 'react';
import { Column } from '@ant-design/charts';
import { Layout, Spin } from 'antd';
import { getUsage } from "../../../services/api.service";
import { getQueryParam } from '../../../services/utils'

const { Content } = Layout;

class Usage extends Component {
  constructor() {
    super()
    this.state = {
      data: [],
      status: '',
      loading: false
    }
  }

  componentDidMount() {
    var show = getQueryParam("show", this.props);
    this.setQueryParamsFromState("show", show);
    this.getJobUsage();
  }

  componentDidUpdate() {
    var show = getQueryParam("show", this.props);
    if (this.state.show !== show) {
      this.setQueryParamsFromState("show", show);
      this.getJobUsage()
    }
  }

  setQueryParamsFromState(name, value) {
    this.setState({ [name]: value });
  }

  getJobUsage() {
    this.setState({ loading: true });
    var show = getQueryParam("show", this.props);
    getUsage(show).then(response => {
      if (response.data) {
        this.setState({ data: response.data });
        this.setState({ loading: false });
      }
    })
      .catch(error => {

      })
  }

  render() {
    var config = {
      data: this.state.data,
      xField: 'date',
      yField: 'value',
      seriesField: 'name',
      isStack: true,
      label: {
        position: 'middle',
        layout: [
          { type: 'interval-adjust-position' },
          { type: 'interval-hide-overlap' },
          { type: 'adjust-color' },
        ],
      },
    };


    return (
      <Content className="site-layout-background main-background">
        <Spin spinning={this.state.loading}>
          <div className='repo-container'>
            <ul>
              {this.state.show === 'monthly' && <h2 className='list-head' style={{ marginBottom: '60px' }}>Year to Date</h2>}
              {this.state.show === 'daily' && <h2 className='list-head' style={{ marginBottom: '60px' }}>Last 30 Days</h2>}
              <Column {...config} />
            </ul>
          </div>
        </Spin>
      </Content>
    );
  }
}

export default Usage;

