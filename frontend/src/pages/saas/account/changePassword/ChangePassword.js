import React, { Component } from 'react'
import { Layout } from 'antd';
import { Breadcrumb, Form, Input, message, Button, Alert } from 'antd';
import { changePassword } from "../../../../services/api.service";
import { Link } from "react-router-dom"
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';

const { Content } = Layout;

class ChangePassword extends Component {
  constructor() {
    super()
    this.state = {
      loading: false,
      message: '',
      password: '',
      password1: ''
    };
  }

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  }

  updatePassword() {
    this.setState({ loading: true });
    changePassword( {
      password: this.state.password
    })
      .then(response => {
        if (response.status === 200) {
          message.success('Password updated');
          this.props.history.push('/account')
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
          <Breadcrumb.Item><Link to="/account">Account</Link></Breadcrumb.Item>
          <Breadcrumb.Item>Change Password</Breadcrumb.Item>
        </Breadcrumb>
        <Content className="site-layout-background main-background">
          <Form layout="vertical" 
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 10 }}>
            {this.state.message && <Alert style={{ marginBottom: '20px', marginTop: '10px' }} message={this.state.message} type="error" showIcon />}
            <Form.Item label="New Password">
              <Input.Password name="password" value={this.state.password} placeholder="Enter your new password" onChange={this.handleChange} iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)} />
            </Form.Item>
            <Form.Item label="Repeat New Password">
              <Input.Password  name="password1" value={this.state.password1} placeholder="Reenter your new password" onChange={this.handleChange} iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)} />
            </Form.Item>
          </Form>
          <Button type="primary" onClick={() => this.updatePassword()} disabled={ (this.state.password === '') || (this.state.password !== this.state.password1) }>
            Save
          </Button>
        </Content>
      </>
    )
  }
}

export default ChangePassword;

