import React, { Component } from 'react'
import { Breadcrumb } from 'antd';
import { postJob, getNotifications, getXPathPreview, getAPIPreview } from "../../../../services/api.service";
import { Link } from "react-router-dom"
import { Steps, Button, message, Layout, Form, Input, Slider, Row, Select, Table, Spin, Alert, Tabs, Descriptions } from 'antd';
import { validURL } from "../../../../services/utils";
import { minuteFormatter } from "../../../../services/utils";
import JSONPretty from 'react-json-pretty';

const { Step } = Steps;
const { Content } = Layout;
const { Option } = Select;
const { TabPane } = Tabs;

const steps = [
  {
    title: 'URL',
    content: 'First-content',
  },
  {
    title: 'Type',
    content: 'Second-content',
  },
  {
    title: 'Options',
    content: 'Third-content',
  },
  {
    title: 'Notifications',
    content: 'Last-content',
  },
];

const marks = {
  60: 'Hourly',
  720: '12 Hours',
  1440: '24 Hours',
  2880: '2 Days'
};

const columns = [
  {
    title: 'Type',
    dataIndex: 'type'
  },
  {
    title: 'Address',
    dataIndex: 'param_1'
  }
];

class JobDetail extends Component {

  next = () => {
    this.setState({ current: this.state.current + 1 });
  };

  prev = () => {
    this.setState({ current: this.state.current - 1 });
  };

  constructor() {
    super()
    this.state = {
      current: 0,
      url: '',
      name: '',
      email: '',
      notifications: '',
      frequency: 120,
      frequencyMins: 120,
      diff_percent: 20,
      selectedRowKeys: [],
      validUrlStatus: "",
      validUrl: false,
      loading: false,
      xpath: '',
      jobType: "0",
      delay: 2,
      xpathresponse: "",
      apiresponse: ""
    }
  }

  componentDidMount() {
    this.getUserNotifications();
  }

  getUserNotifications() {
    this.setState({ loading: true });
    getNotifications().then(response => {
      if (response.data) {
        this.setState({ notifications: response.data });
      }
    }).catch(error => { })
      .finally(() => {
        this.setState({ loading: false });
      })
  }

  getXPathData() {
    this.setState({ loading: true });
    getXPathPreview(this.state.url, this.state.xpath).then(response => {
      if (response) {
        this.setState({ xpathresponse: JSON.stringify(response.data) });
      }
    }).catch(error => {
      this.setState({ xpathresponse: "Error" });
    }).finally(() => {
      this.setState({ loading: false });
    })
  }

  getAPIData() {
    this.setState({ loading: true });
    getAPIPreview(this.state.url).then(response => {
      if (response) {
        this.setState({ apiresponse: JSON.stringify(response.data) });
      }
    }).catch(error => {
      this.setState({ apiresponse: "Error" });
    }).finally(() => {
      this.setState({ loading: false });
    })
  }

  handleChange = (event) => {
    if (event.target.name === 'url') {
      var valid = validURL(event.target.value);
      if (valid) {
        this.setState({ validUrlStatus: 'success', validUrl: true });
      } else {
        this.setState({ validUrlStatus: 'error', validUrl: true });
      }
    }
    this.setState({ [event.target.name]: event.target.value })
  }

  handleSliderChange = (event) => {
    this.setState({ frequency: event });
    this.setState({ frequencyMins: event });
  }

  handleMinuteChange = (event) => {
    if (event.target.value >= 60) {
      this.setState({ frequencyMins: event.target.value });
      this.setState({ frequency: event.target.value });
    }
  }

  handleChangeType = (selectedKey) => {
    this.setState({ jobType: selectedKey })
  }

  onPercentageChange = (value) => {
    this.setState({ diff_percent: value });
  };

  onSelectNotificationsChange = selectedRowKeys => {
    this.setState({ selectedRowKeys });
  };

  saveJob() {
    
    this.setState({ loading: true });
    
    var delay = parseInt(this.state.delay);
    var frequency = parseInt(this.state.frequency);
    if (delay > 5) {
      delay = 5
    }
    if (frequency < 60) {
      frequency = 60;
    }

    postJob({
      job_name: this.state.name,
      url: this.state.url,
      frequency: frequency,
      notifications: this.state.selectedRowKeys,
      diff_percent: this.state.diff_percent,
      job_type: this.state.jobType,
      xpath: this.state.xpath,
      delay: delay
    })
      .then(response => {
        if (response.status === 200) {
          message.success('Job saved')
          this.props.history.push('/jobs?status=1')
        }
        this.setState({ loading: false });
      }).catch(error => {
        this.setState({ message: 'Error, please check.' });
        this.setState({ loading: false });
      })
      .finally(() => {
        this.setState({ loading: false });
      })
  }

  render() {
    const { selectedRowKeys } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectNotificationsChange,
    };

    return (
      <>
        <Breadcrumb style={{ margin: '16px 0' }}>
          <Breadcrumb.Item><Link to="/jobs?status=1">Jobs</Link></Breadcrumb.Item>
          <Breadcrumb.Item>Add Job</Breadcrumb.Item>
        </Breadcrumb>
        <Content className="site-layout-background main-background">
          <Spin spinning={this.state.loading}>
            <Steps current={this.state?.current}>
              {steps.map(item => (
                <Step key={item.title} title={item.title} />
              ))}
            </Steps>
            <div className="steps-content">
              {this.state?.current === 0 &&
                <Form
                  name="addJob_step1"
                  layout="vertical"
                >
                  <Form.Item label="Name">
                    <Input name="name" value={this.state.name} placeholder="Enter a job name for easy reference" onChange={this.handleChange} />
                  </Form.Item>
                  <Form.Item label="URL" validateStatus={this.state.validUrlStatus} hasFeedback={this.state.validUrl}>
                    <Input name="url" value={this.state.url} placeholder="The website URL to monitor" onChange={this.handleChange} />
                  </Form.Item>
                </Form>
              }

              {this.state?.current === 1 &&
                <Form
                  name="addJob_step2"
                  layout="vertical"
                >
                  {this.state.message && <Alert style={{ marginBottom: '20px', marginTop: '10px' }} message={this.state.message} type="error" showIcon />}
                  <Tabs type="card" onTabClick={this.handleChangeType} activeKey={this.state.jobType} >
                    <TabPane tab="Visual Snapshots" key="0">
                      <Form.Item label="Change Percent" rules={[{ required: true }]}>
                        <Select
                          placeholder="What types of change should we track?"
                          onChange={this.onPercentageChange}
                          defaultValue={'Small Changes'}
                        >
                          <Option value="0">All Changes</Option>
                          <Option value="5">Small Changes</Option>
                          <Option value="20">Medium Changes</Option>
                          <Option value="50">Major Changes</Option>
                        </Select>
                      </Form.Item>
                    </TabPane>

                    <TabPane tab="XPath" key="1" onTabClick={this.handleChangeType}>
                      <Form.Item label="XPath">
                        <Input name="xpath" value={this.state.xpath} placeholder="The XPath of the Element to monitor" onChange={this.handleChange} />
                      </Form.Item>

                      <Button type="primary" onClick={() => this.getXPathData()} disabled={this.state.xpath === ''}>Preview Content</Button>
                      <Descriptions size="small" column={1}  style={{ 'paddingTop': '20px' }}>
                        <Descriptions.Item key="xpathresponse" label="Content">{this.state.xpathresponse}</Descriptions.Item>
                      </Descriptions>
                    </TabPane>

                    <TabPane tab="JSON API" key="2" onTabClick={this.handleChangeType}>
                    <Descriptions size="small" column={1} label="">
                      <Descriptions.Item key="apiresponse1" label="Execute a HTTP Get"></Descriptions.Item>
                    </Descriptions>
                      <Button type="primary" onClick={() => this.getAPIData()} >Preview API Response</Button>
                      <Descriptions size="small" column={1}  style={{ 'paddingTop': '20px' }} label="Content">
                        <Descriptions.Item key="apiresponse" label="Content"></Descriptions.Item>
                      </Descriptions>
                      <JSONPretty id="json-pretty" data={ this.state.apiresponse }></JSONPretty>
                    </TabPane>

                  </Tabs>
                </Form>

              }

              {this.state?.current === 2 &&
                <Form
                  name="addJob_step2"
                  layout="vertical"
                >
                  {this.state.message && <Alert style={{ marginBottom: '20px', marginTop: '10px' }} message={this.state.message} type="error" showIcon />}
                  <Form.Item label="URL Check Frequency">
                    <Slider
                      marks={marks}
                      min={60}
                      max={2880}
                      name="frequency"
                      value={this.state.frequency}
                      tipFormatter={minuteFormatter}
                      onChange={this.handleSliderChange}
                      step={10}
                      style={{ 'marginLeft': '22px', 'marginRight': '22px' }}
                    />
                  </Form.Item>
                  <Form.Item label="or Minutes">
                    <Input name="minutes" type="number" min={60} value={this.state.frequencyMins} onChange={this.handleMinuteChange} />
                  </Form.Item>
                  <Form.Item label="Delay (in Seconds, max 5)">
                    <Input name="delay" type="number" min={0} max={5} value={this.state.delay} onChange={this.handleChange} />
                  </Form.Item>
                </Form>

              }

              {this.state?.current === 3 &&
                <Form
                  name="addJob_step2"
                  layout="vertical"
                >
                  {this.state.message && <Alert style={{ marginBottom: '20px', marginTop: '10px' }} message={this.state.message} type="error" showIcon />}
                  <Table rowKey="notification_id" rowSelection={rowSelection} bordered={true} columns={columns} dataSource={this.state.notifications} />
                </Form>
              }

            </div>
            <Row className="steps-action" justify="space-between">
              {this.state?.current > 0 && (
                <Button style={{ margin: '0 8px' }} onClick={() => this.prev()}>
                  Previous
                </Button>
              )}
              {
                this.state?.current === 0 && <span></span>
              }

              {this.state?.current < steps.length - 1 && (
                <Button type="primary" onClick={() => this.next()} disabled={this.state.url === '' || this.state.job_name === ''}>
                  Next
                </Button>
              )}
              {this.state?.current === steps.length - 1 && (
                <Button type="primary" onClick={() => this.saveJob()}>
                  Save
                </Button>
              )}
            </Row>
          </Spin>
        </Content >
      </>
    )
  }
}

export default JobDetail;

