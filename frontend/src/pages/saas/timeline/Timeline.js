import React, { Component } from 'react'
import { Layout, Timeline, Breadcrumb, Image, Spin, Divider, Typography } from 'antd';
import { getUserTimeline } from "../../../services/api.service";
import Moment from 'moment';
import { formatPercentToWords, getFilepath } from "../../../services/utils"
import imageNotFound from "../../../assets/image-not-found.png"

const { Content } = Layout;
const { Paragraph } = Typography;

class Timelined extends Component {
  state = { 
    loading: false,
    filepath: ''
   };

  componentDidMount() {
    this.setState({ filepath: sessionStorage.getItem('filepath') });
    this.getTimeline();
  }

  getTimeline() {
    this.setState({ loading: true });
    getUserTimeline().then(response => {
      if (response.data) {
        this.setState({ jobTimeline: response.data });
      }
    })
      .catch(error => {

      })
      .finally(() => {
        this.setState({ loading: false });
      })
  }

  render() {
    const items = this.state.jobTimeline?.map(function (record) {
      var color;
      if (record.status === 1) {
        color = "grey";
      } else if (record.status === 2) {
        color = "green";
      } else if (record.status === 0) {
        color = "red";
      } else {
        color = "red";
      }
      return <Timeline.Item key={record.history_id} color={color} label={Moment.utc(record.datetime).local().format('MMMM Do YYYY, h:mm a')}>
        <p>{record.job_name}</p>
        <p>
          <b>
            {record.status === 2 && record.job_type === 0 && record.change_percent + "% (" + formatPercentToWords(record.change_percent) + ")"}
            {record.status === 2 && record.job_type === 1 && "Change detected"}
            {record.status === 2 && record.run_type === "Test" && "  (Test)" }
          </b>
        </p>
          {
            record.status === 2 && record.job_type === 0 && 
            <Image style={{ 'objectPosition': '100% 0', 'width': '100%', 'height': '80px', 'objectFit': 'cover' }}
              src={ window.origin + '/api/v1/screenshots/' + record.job_id + '/' + record.diff_screenshot }
              fallback={imageNotFound}>
            </Image>
          }
          {
            record.status === 2 && record.job_type === 1 && 
            <Paragraph ellipsis={{
              rows: 1,
              expandable: true
              }}>
              {record.screenshot}
            </Paragraph>
          }
      </Timeline.Item>;
    });

    return (
      <>
        <Breadcrumb style={{ margin: '16px 0' }}>
          <Breadcrumb.Item>Timeline</Breadcrumb.Item>
        </Breadcrumb>
        <Content className="site-layout-background main-background">
          <Spin spinning={this.state.loading}>
            <div className="timeline-legend timeline-legend-green" />Change Triggered
            <div className="timeline-legend timeline-legend-grey" style={{ marginLeft: '30px' }} />No Change within Threshold
            <div className="timeline-legend timeline-legend-red" style={{ marginLeft: '30px' }} />Error
            <Divider />
            <Timeline style={{ 'paddingTop': '20px' }} mode="left">
              {items}
            </Timeline>
          </Spin>
        </Content>
      </>
    )
  }
}

export default Timelined;

