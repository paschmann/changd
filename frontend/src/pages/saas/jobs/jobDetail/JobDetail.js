import React, { Component } from 'react'
import { Layout } from 'antd';
import { Breadcrumb, Button, Table, PageHeader, Descriptions, Row, Statistic, Typography, Image, Spin, Tag, Popconfirm } from 'antd';
import { getJobDetail, runJob, resetJob } from "../../../../services/api.service";
import { Link } from "react-router-dom";
import Moment from 'moment';
import { formatPercentToWords } from "../../../../services/utils"
import { DownloadOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { recentFormatter, getFilepath } from '../../../../services/utils';
import imageNotFound from "../../../../assets/image-not-found-large.png";
import JSONPretty from 'react-json-pretty';

const { Content } = Layout;
const { Title } = Typography;
const { Paragraph } = Typography;

class JobDetail extends Component {
  state = {
    loading: false,
    consolidated: false,
    rawHistory: [],
    formattedHistory: []
  };

  componentDidMount() {
    this.setState({
      job_id: this.props.match.params.job_id
    })
    this.getJobdetail();
    this.intervalId = setInterval(() => this.getJobdetail(), 3000000);
  }

  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  runJob(job_id, type) {
    this.setState({ loading: true });
    this.setState({ message: '' });
    runJob(this.props.match.params.job_id, type).then(response => {
      if (response.data) {
        this.getJobdetail();
      }
      this.setState({ loading: false });
    }).catch(error => { })
  }

  resetJob(job_id) {
    this.setState({ loading: true });
    this.setState({ message: '' });
    resetJob(job_id, { url: this.state.jobDetail.url, xpath: this.state.jobDetail.xpath, job_type: this.state.jobDetail.job_type }).then(response => {
      this.getJobdetail();
    }).catch(error => {
      this.setState({ message: 'Error, unable to capture inital image, please check the URL' });
    }).finally(() => {
      this.setState({ loading: false });
    })
  }

  getJobdetail() {
    this.setState({ loading: true });
    this.setState({ message: '' });
    getJobDetail(this.props.match.params.job_id).then(response => {
      if (response.data) {
        //Add job type to each history element
        response.data.jobHistory.forEach((el)=>{el.job_type = response.data.jobDetail.job_type;}) 

        //Inject current reference image
        const current = {
          history_id: 'current',
          datetime: 'Current',
          job_id: this.props.match.params.job_id,
          screenshot: response.data.jobDetail.latest_screenshot,
          status: 3,
          change_percent: 0,
          job_type: response.data.jobDetail.job_type
        }
        response.data.jobHistory.unshift(current);
        this.setState({ rawHistory: response.data.jobHistory });

        this.loadJobHistory(response.data.jobHistory);

        this.setState({ jobDetail: response.data.jobDetail });
        this.setState({ jobNotifications: response.data.jobNotifications });
        this.setState({ loading: false });
      }
    }).catch(error => { })
  }

  loadJobHistory(data) {
    var jobHistory = data;
    var consolidated_history = [];

    if (this.state.consolidated === true) {
      var entries = 0;
      var consolidated = 0;
      jobHistory.forEach(function (item, index) {
        if (index === 0 || (item.status === 2 || item.status === 0 || item.status === 3 || item.run_type === "Test") || (item.status === 1 && jobHistory[index - 1].status !== 1)) {
          consolidated_history.push(item);
          consolidated = 0;
          entries++;
        } else {
          consolidated++;
          consolidated_history[entries - 1].status = 4;
          consolidated_history[entries - 1]["datetime"] = consolidated + " checks";
        }
      })
    } else {
      consolidated_history = jobHistory;
    }
    this.setState({ jobHistory: consolidated_history });
  }

  setDetail() {
    this.setState({ consolidated: !this.state.consolidated });
    this.loadJobHistory(this.state.rawHistory);
  }

  statusFormatter(value) {
    if (value === 1) {
      return "Active"
    } else if (value === 2) {
      return "Inactive"
    } else if (value === 3) {
      return "Deleted"
    }
  }

  render() {
    const columns = [
      {
        title: 'Date/Time',
        dataIndex: 'datetime',
        render: (text, record) => (
          <div>
            {record.status !== 3 && record.status !== 4 && record.datetime !== null ? Moment.utc(record.datetime).local().format('MMMM Do YYYY, h:mm a') : ""}
            {record.status === 3 && "Reference"}
            {record.status === 4 && record.datetime}
          </div>
        )
      },
      {
        title: 'Change',
        dataIndex: 'change_percent',
        render: (text, record) => (
          <div>
            {record.status === 0 && <Tag key="redtag" color="red">Error</Tag>}
            {record.status === 1 && <Tag key="orangetag" color="orange">{formatPercentToWords(record.change_percent)}</Tag>}
            {record.status === 2 && <Tag key="greentag" color="green">{formatPercentToWords(record.change_percent)}</Tag>}
            {record.run_type === "Test" && <Tag key="bluetag" color="blue">{record.run_type}</Tag>}
            {record.status === 3 && <Popconfirm title="This will replace the current reference for future comparisons. Are you sure?" onConfirm={() => this.resetJob(this.state.jobDetail?.job_id)}><Button style={{ marginLeft: '15px' }} type="primary" icon={<DownloadOutlined />} size={'small'}>Reset</Button></Popconfirm>}
          </div>
        )
      },
      {
        title: this.state.jobDetail?.job_type === 0 ? "Screenshot" : "Reference Text",
        dataIndex: 'screenshot',
        width: this.state.jobDetail?.job_type === 0 ? "120px" : "40%",
        render: (text, record) => (
          <div>
            {record.status === 0 && 
              <Paragraph
                key = "paragraph"
                ellipsis={{
                rows: 3,
                expandable: true
              }}>
                {record.log}
              </Paragraph>
            }
            {record.status === 2 && record.job_type === 0 && <Image key={'screenshot_' + record.history_id} width={200} style={{ 'objectPosition': '100% 0', 'width': '100%', 'height': '80px', 'objectFit': 'cover' }} src={ getFilepath() + record.job_id + '/' + record.diff_screenshot} fallback={imageNotFound} />}
            {record.status === 3 && record.job_type === 0 && <Image key={'screenshot_' + record.history_id} width={200} style={{ 'objectPosition': '100% 0', 'width': '100%', 'height': '80px', 'objectFit': 'cover' }} src={ getFilepath() + record.job_id + '/' + record.screenshot + '.png'} fallback={imageNotFound} />}
            {(record.status === 2 || record.status === 3) && record.job_type === 1 && 
              <Paragraph 
                key = "paragraph"
                ellipsis={{
                rows: 3,
                expandable: true
              }}>
                {record.screenshot}
              </Paragraph>
            }
            {(record.status === 2 || record.status === 3) && record.job_type === 2 && 
              <JSONPretty key="json" id="json-pretty" data={ record.screenshot }></JSONPretty>
            }
          </div>
        )
      }
    ];

    return (
      <>
        <Breadcrumb style={{ margin: '16px 0' }}>
          <Breadcrumb.Item><Link to="/jobs?status=1">Jobs</Link></Breadcrumb.Item>
          <Breadcrumb.Item>{this.state.jobDetail?.job_name}</Breadcrumb.Item>
        </Breadcrumb>
        <Content className="site-layout-background main-background">
          <Spin spinning={this.state.loading}>

            {this.state.message && <div style={{ textAlign: 'center', margin: '30px' }}><CloseCircleOutlined className="site-result-demo-error-icon" style={{ color: 'red', marginRight: '10px' }} />{this.state.message}</div>}

            <PageHeader
              ghost={false}
              onBack={() => window.history.back()}
              title={this.state.jobDetail?.job_name}
              tags=
              {[
                this.state.jobDetail?.status === 1 && <Tag key="1" color="green">Active</Tag>,
                this.state.jobDetail?.status === 2 && <Tag key="2" color="grey">Inactive</Tag>
              ]}
              extra={[
                <Button key="1" type="primary"><Link to={'/jobs/' + this.state.jobDetail?.job_id + '/edit'} >Edit</Link></Button>,
                <Button key="2" onClick={() => this.runJob(this.state.jobDetail?.job_id, "run")}>Run</Button>,
                <Button key="3" onClick={() => this.runJob(this.state.jobDetail?.job_id, "test")}>Test</Button>,
                <Popconfirm cancelButtonProps={{ hidden: true }} placement="bottomRight" okText="OK" cancelText="OK" title="Test will execute the job and trigger notifications regardless if there are changes, useful for testing a new job and notification delivery. Run will execute the job and send a notification, only if there are changes."><Button type="dashed" shape="round">?</Button></Popconfirm>
              ]}
            >
              <Row style={{ 'paddingTop': '20px' }}>
                <Statistic
                  key="runcount"
                  title="Run Count"
                  value={this.state.jobDetail?.run_count}
                />
                <Statistic
                  key="errorcount"
                  title="Error Count"
                  value={this.state.jobDetail?.error_count}
                  style={{
                    margin: '0 32px',
                  }}
                />
                {this.state.jobDetail?.status === 1 && <Statistic title="Next Run" value={recentFormatter(this.state.jobDetail?.next_run)} />}
              </Row>
              <Row style={{ 'paddingTop': '20px' }}>
                <Descriptions size="small" column={1}>
                  <Descriptions.Item key="url" label="URL"><a target="_blank" rel="noreferrer" href={this.state.jobDetail?.url}>{this.state.jobDetail?.url}</a></Descriptions.Item>
                  <Descriptions.Item key="check" label="Check Frequency">{this.state.jobDetail?.frequency} minutes</Descriptions.Item>
                  { this.state.jobDetail?.job_type !== 2 && <Descriptions.Item key="delay" label="Delay">{this.state.jobDetail?.delay} seconds</Descriptions.Item> }

                  {/* Job specific */}
                  { this.state.jobDetail?.job_type === 0 && 
                    <Descriptions.Item key="change" label="Notify on">
                      {
                        formatPercentToWords(this.state.jobDetail?.diff_percent)
                      }
                    </Descriptions.Item>
                  }
                  { this.state.jobDetail?.job_type === 1 && 
                    <Descriptions.Item key="change" label="XPath">
                      {
                        this.state.jobDetail?.xpath
                      }
                    </Descriptions.Item>
                  }
                  { this.state.jobDetail?.job_type === 2 && 
                    <Descriptions.Item key="change" label="API">True</Descriptions.Item>
                  }

                  <Descriptions.Item key="notifications" label="Notifications">
                    {
                      this.state.jobNotifications?.map(notification => (
                        <div key={notification.notification_id} style={{ 'marginRight': '20px' }}>{notification.name + ' (' + notification.type + ')'}</div>
                      ))
                    }
                  </Descriptions.Item>
                </Descriptions>
              </Row>
            </PageHeader>

            <Title style={{ 'padding': '16px 24px 0px 24px' }} level={5}>Job History</Title>
            <Table style={{ 'padding': '16px 24px 16px 24px' }} rowKey="history_id" bordered={true} columns={columns} dataSource={this.state.jobHistory} />
          </Spin>
        </Content>
      </>
    )
  }
}

export default JobDetail;

