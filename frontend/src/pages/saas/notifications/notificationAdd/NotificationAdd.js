import React, { Component } from 'react'
import { Breadcrumb } from 'antd';
import { postNotification, getReachProviders, getReachParameters } from "../../../../services/api.service";
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
      type: '',
      param_1: '',
      loading: false,
      providers: [],
      requiredParameterInputs: [],
      optionalParameterInputs: [],
      requiredParameters: {},
      optionalParameters: {}
    };
  }

  componentDidMount() {
    this.getProviders();
  }

  getProviders() {
    this.setState({ loading: true });
    getReachProviders().then(response => {
      if (response.data) {
        this.setState({ providers: response.data });
      }
    }).catch(error => { })
      .finally(() => {
        this.setState({ loading: false });
      })
  }

  getParameters(value) {
    this.setState({ loading: true });
    getReachParameters(value).then(response => {
      if (response.data) {
        var required = [];
        for (var key in response.data.required) {
          this.state.requiredParameters[key] = "";
          required.push(
            <Form.Item label={key}>
              <Input type='text' id={key} required onChange={this.onChangeRequiredProperty}></Input>
            </Form.Item>
          )
        }
        this.setState({ requiredParameterInputs: required });

        var optional = [];
        for (var key in response.data.optional) {
          this.state.optionalParameters[key] = "";
          optional.push(
            <Form.Item label={key}>
              <Input type='text' id={key} onChange={this.onChangeOptionalProperty}></Input>
            </Form.Item>
          )
        }
        this.setState({ optionalParameterInputs: optional });
      }
    }).catch(error => { })
      .finally(() => {
        this.setState({ loading: false });
      })
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
    this.getParameters(value);
  };

  onChangeRequiredProperty = (event) => {
    var params = this.state?.requiredParameters;
    params[event.target.id] = event.target.value;
    this.setState({ requiredParameters: params });
  }

  onChangeOptionalProperty = (event) => {
    var params = this.state?.optionalParameters;
    params[event.target.id] = event.target.value;
    this.setState({ optionalParameters: params });
  }

  saveNotification() {
    this.setState({ loading: true });

    var data = {
      name: this.state?.type,
      required: this.state?.requiredParameters,
      optional: this.state?.optionalParameters
    }

    postNotification({
      name: this.state.name,
      type: this.state.type,
      param_1: data
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
      }).finally(() => {

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
                    <Select id="providers"
                      onChange={this.onTypeChange}
                    >
                      {this.state?.providers.map(item => (
                        <option value={item}>{item}</option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item label="Name">
                    <Input name="name" value={this.state.name} placeholder="Name" onChange={this.handleChange} />
                  </Form.Item>
                </Form>
              }

              {this.state?.current === 1 &&
                <Form
                  name="addJob_step2"
                  layout="vertical"
                >
                  {this.state.message && <Alert style={{ marginBottom: '20px', marginTop: '10px' }} message={this.state.message} type="error" showIcon />}
                    <h1>Required</h1>
                    { this.state?.requiredParameterInputs }
                    <h1>Optional</h1>
                    { this.state?.optionalParameterInputs }
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
                <Button type="primary" onClick={() => this.saveNotification()}>
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

