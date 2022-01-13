import React, { Component } from 'react'
import { Breadcrumb } from 'antd';
import { postNotification } from "../../../../services/api.service";
import { Link } from "react-router-dom"
import { Steps, Button, message, Layout, Form, Input, Select, Row, Spin, Alert } from 'antd';

const { Step } = Steps;
const { Content } = Layout;
const { Option } = Select;

const steps = [
  {
    title: 'Channel',
    content: 'First-content',
  },
  {
    title: 'Options',
    content: 'Second-content',
  }
];

class AddNotifications extends Component {

  constructor() {
    super()
    this.state = {
      current: 0,
      type: 'email',
      param_1: '',
      loading: false
    };
  }

  next = () => {
    this.setState({ current: this.state.current + 1 });
  };

  prev = () => {
    this.setState({ current: this.state.current - 1 });
  };

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value })
  }

  onTypeChange = (value) => {
    this.setState({ type: value });
  };

  saveNotification() {
    this.setState({ loading: true });
    postNotification({
      type: this.state.type,
      param_1: this.state.param_1
    })
      .then(response => {
        if (response.status === 200) {
          message.success('Notification type saved');
          this.props.history.push('/notifications')
        }
        this.setState({ loading: false });
      }).catch(error => {
        this.setState({ message: 'Error, please check.' });
        this.setState({ loading: false });
      }).finally( () => {
        
      })
  }

  render() {
    return (
      <>
        <Breadcrumb style={{ margin: '16px 0' }}>
          <Breadcrumb.Item><Link to="/notifications">Notifications</Link></Breadcrumb.Item>
          <Breadcrumb.Item>Add Notification</Breadcrumb.Item>
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
                <Form.Item label="Notification Method" rules={[{ required: true }]}>
                  <Select
                    onChange={this.onTypeChange}
                  >
                    <Option value="email">Email</Option>
                  </Select>
                </Form.Item>
              </Form>
            }

            {this.state?.current === 1 &&
              <Form
                name="addJob_step2"
                layout="vertical"
              >
                {this.state.message && <Alert style={{ marginBottom: '20px', marginTop: '10px' }} message={this.state.message} type="error" showIcon />}
                <Form.Item label="Address">
                  <Input name="param_1" value={this.state.param_1} placeholder="Enter the email address" onChange={this.handleChange} />
                </Form.Item>
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
              <Button type="primary" onClick={() => this.next()}>
                Next
              </Button>
            )}
            {this.state?.current === steps.length - 1 && (
              <Button type="primary" onClick={() => this.saveNotification()} disabled={this.state.email === '' || this.state.param_1 === ''}>
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

export default AddNotifications;

