import React, { Component } from 'react'
import { Layout } from 'antd';
import { Breadcrumb, Form, Input, message, Button, Alert, Spin } from 'antd';
import { getNotificationDetail, putNotification, getReachParameters } from "../../../../services/api.service";
import { Link } from "react-router-dom"


const { Content } = Layout;

class EditNotification extends Component {
  constructor() {
    super()
    this.state = {
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
    this.getUserNotificationDetail();
  }


  getUserNotificationDetail() {
    this.setState({ loading: true });
    getNotificationDetail(this.props.match.params.notification_id)
      .then(response => {
        //this.setState({ param_1: response.data.param_1 });
        this.setState({ type: response.data.type });
        this.setState({ name: response.data.name });
        
        this.getParameters(response.data.type, response.data.param_1);

      }).catch(error => {
        console.log(error);
      }).finally( () => {
        this.setState({ loading: false });
      })
  }

  getParameters(value, params) {
      this.setState({ loading: true });
      getReachParameters(value).then(response => {
        if (response.data) {
          
          this.setState({requiredParameters: JSON.parse(params).required })
          this.setState({optionalParameters: JSON.parse(params).optional })
          
          var required = [];
          for (var key1 in response.data.required) {
            required.push(
              <Form.Item label={key1}>
                <Input type='text' id={key1} required onChange={this.onChangeRequiredProperty} defaultValue={this.state.requiredParameters[key1]}></Input>
              </Form.Item>
            )
          }
          this.setState({ requiredParameterInputs: required });
  
          var optional = [];
          for (var key in response.data.optional) {
            optional.push(
              <Form.Item label={key}>
                <Input type='text' id={key} onChange={this.onChangeOptionalProperty} defaultValue={this.state.optionalParameters[key]}></Input>
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

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  }

  updateNotification() {
    this.setState({ loading: true });

    var data = {
      required: this.state.requiredParameters,
      optional: this.state.optionalParameters,
      name: this.state.type
    }

    putNotification(this.props.match.params.notification_id, {
      param_1: data,
      name: this.state.name,
    })
      .then(response => {
        if (response.status === 200) {
          message.success('Notification updated')
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
          <Breadcrumb.Item>{this.state.type}</Breadcrumb.Item>
        </Breadcrumb>
        <Content className="site-layout-background main-background">
          <Spin spinning={this.state.loading}>
          <Form
            name="addJob_step2"
            layout="vertical"
          >
            { this.state.message && <Alert style={{ marginBottom: '20px', marginTop: '10px' }} message={ this.state.message } type="error" showIcon/> }
            <Form.Item label="Name">
              <Input key="name" name="name" value={this.state.name} placeholder="Name" onChange={this.handleChange} />
            </Form.Item>
               
                  {this.state.message && <Alert style={{ marginBottom: '20px', marginTop: '10px' }} message={this.state.message} type="error" showIcon />}
                    <h1>Required</h1>
                    { this.state?.requiredParameterInputs }
                    <h1>Optional</h1>
                    { this.state?.optionalParameterInputs }

          </Form>

            <Button type="primary" onClick={() => this.updateNotification()}>
              Save
            </Button>
          </Spin>
        </Content>
      </>
    )
  }
}

export default EditNotification;

