import React, { Component } from 'react'
import { Layout } from 'antd';
import { Breadcrumb, Form, Input, Button, Table, message, PageHeader, Select, Spin, Alert, Slider } from 'antd';
import { getJobDetail, getNotifications } from "../../../../services/api.service";
import { Link } from "react-router-dom"
import { putJob } from "../../../../services/api.service";
import { validURL, minuteFormatter } from "../../../../services/utils";

const { Content } = Layout;
const { Option } = Select;

const columns = [
  {
    title: 'Type',
    dataIndex: 'type'
  },
  {
    title: 'Name',
    dataIndex: 'name'
  }
];

const marks = {
  60: 'Hourly',
  720: '12 Hours',
  1440: '24 Hours',
  2880: '2 Days'
};

class JobEdit extends Component {
  constructor() {
    super()
    this.state = {
      selectedRowKeys: [],
      loading: false
    }
    this.state.jobDetail = {
      job_name: ""
    };
  }

  componentDidMount() {
    this.getUserJobs();
    this.getUserNotifications();
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

    this.setState({ [event.target.name]: event.target.value });
  }

  handleSliderChange = (event) => {
    this.setState({ frequency: event });
    //this.setState({ frequencyMins: event });
  }

  handleMinuteChange = (event) => {
    if (event.target.value >= 60) {
      //this.setState({ frequencyMins: event.target.value });
      this.setState({ frequency: event.target.value });
    }
  }

  onPercentageChange = (value) => {
    this.setState({ diff_percent: value });
  };

  onSelectNotificationsChange = selectedRowKeys => {
    this.setState({ selectedRowKeys });
  };

  getUserNotifications() {
    getNotifications().then(response => {
      if (response.data) {
        this.setState({ notifications: response.data });
      }
    }).catch(error => { })
  }

  getUserJobs() {
    this.setState({ loading: true });

    getJobDetail(this.props.match.params.job_id).then(response => {
      if (response.data) {
        this.setState({ job_name: response.data.jobDetail.job_name });
        this.setState({ url: response.data.jobDetail.url });
        this.setState({ frequency: response.data.jobDetail.frequency });
        //this.setState({ frequencyMins: response.data.jobDetail.frequency });
        this.setState({ diff_percent: response.data.jobDetail.diff_percent });
        this.setState({ xpath: response.data.jobDetail.xpath });
        this.setState({ job_type: response.data.jobDetail.job_type });
        this.setState({ delay: response.data.jobDetail.delay });

        var keys = [];
        response.data.jobNotifications.forEach(notification => {
          keys.push(notification.notification_id)
        });
        this.setState({ selectedRowKeys: keys });
      }
    })
      .catch(error => { })
      .finally(() => {
        this.setState({ loading: false });
      })
  }

  updateJob() {
    this.setState({ loading: true });

    var delay = parseInt(this.state.delay);
    var frequency = parseInt(this.state.frequency);
    if (delay > 5) {
      delay = 5
    }
    if (frequency < 60) {
      frequency = 60;
    }

    putJob(this.props.match.params.job_id, {
      job_name: this.state.job_name,
      url: this.state.url,
      frequency: frequency,
      notifications: this.state.selectedRowKeys,
      diff_percent: this.state.diff_percent,
      xpath: this.state.xpath,
      delay: delay
    })
      .then(response => {
        if (response.status === 200) {
          message.success('Job updated')
          this.props.history.push('/jobs?status=1')
        }
        this.setState({ loading: false });
      }).catch(error => {
        this.setState({ message: 'Error, invalid URL, please check.' });
        this.setState({ loading: false });
      }).finally(() => {
        //cannot use finally due to redirect
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
          <Breadcrumb.Item>{this.state.job_name}</Breadcrumb.Item>
        </Breadcrumb>
        <Content className="site-layout-background main-background">
          <Spin spinning={this.state.loading}>
            <PageHeader
              ghost={false}
              onBack={() => window.history.back()}
              title={'Edit ' + this.state.job_name}
            >
              <Form
                name="addJob_step1"
                layout="vertical"
              >
                {this.state.message && <Alert style={{ marginBottom: '20px', marginTop: '10px' }} message={this.state.message} type="error" showIcon />}

                <Form.Item label="Name">
                  <Input name="job_name" value={this.state.job_name} placeholder="Enter a job name for easy reference" onChange={this.handleChange} />
                </Form.Item>
                <Form.Item label="URL" validateStatus={this.state.validUrlStatus} hasFeedback={this.state.validUrl}>
                  <Input name="url" value={this.state.url} placeholder="The website URL to monitor" onChange={this.handleChange} />
                </Form.Item>
                <Form.Item label="Check Frequency">
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
                <Form.Item label="or Minutes" style={{ display: 'inline-block', width: '120px' }}>
                  <Input name="minutes" type="number" min={60} value={this.state.frequency} onChange={this.handleMinuteChange} />
                </Form.Item>
                { this.state.job_type === 0 && 
                    <Form.Item label="Change Percent" rules={[{ required: true }]}>
                    <Select
                      placeholder="What types of change should we track?"
                      onChange={this.onPercentageChange}
                      value={this.state.diff_percent}
                    >
                      <Option value={0}>All Changes</Option>
                      <Option value={5}>Small changes (text)</Option>
                      <Option value={20}>Medium Changes</Option>
                      <Option value={50}>Major Changes</Option>
                    </Select>
                  </Form.Item>
                  }
                  { this.state.job_type === 1 && 
                    <Form.Item label="XPath">
                      <Input name="xpath" value={this.state.xpath} placeholder="The XPath of the Element to monitor" onChange={this.handleChange} />
                    </Form.Item>
                  }

                  <Form.Item label="Delay (in Seconds, max 5)">
                    <Input name="delay" type="number" min={0} max={5} value={this.state.delay} onChange={this.handleChange} />
                  </Form.Item>

                <Form.Item label="Notifications">
                  <Table rowKey="notification_id" rowSelection={rowSelection} bordered={true} columns={columns} dataSource={this.state.notifications} />
                </Form.Item>
                <Button type="primary" onClick={() => this.updateJob()} disabled={this.state.notifications === '' || this.state.frequency === '' || this.state.url === '' || this.state.job_name === ''}>
                  Save
                </Button>
              </Form>
            </PageHeader>
          </Spin>
        </Content>
      </>
    )
  }
}

export default JobEdit;

