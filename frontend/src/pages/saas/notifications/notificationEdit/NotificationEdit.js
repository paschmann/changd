import React, { Component } from 'react'
import { Layout } from 'antd';
import { Breadcrumb, Form, Input, message, Button, Alert, Spin } from 'antd';
import { getNotificationDetail, putNotification } from "../../../../services/api.service";
import { Link } from "react-router-dom"


const { Content } = Layout;

class EditNotification extends Component {
  constructor() {
    super()
    this.state = {
      loading: false
    };
  }

  componentDidMount() {
    this.getUserNotificationDetail();
  }

  getUserNotificationDetail() {
    this.setState({ loading: true });
    getNotificationDetail(this.props.match.params.notification_id)
      .then(response => {
        this.setState({ param_1: response.data.param_1 });
        this.setState({ type: response.data.type });
        this.setState({ name: response.data.name });
      }).catch(error => {
        console.log(error);
      }).finally( () => {
        this.setState({ loading: false });
      })
  }

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  }

  updateNotification() {
    this.setState({ loading: true });
    putNotification(this.props.match.params.notification_id, {
      param_1: this.state.param_1,
      name: this.state.name
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
              <Input name="name" value={this.state.name} placeholder="Name" onChange={this.handleChange} />
            </Form.Item>
            <Form.Item label="Parameters">
              <Input name="param_1" value={this.state.param_1} placeholder="Parameters" onChange={this.handleChange} />
            </Form.Item>
          </Form>
          <Button type="primary" onClick={() => this.updateNotification()} disabled={this.state.param_1 === '' }>
            Save
          </Button>
          </Spin>
        </Content>
      </>
    )
  }
}

export default EditNotification;

