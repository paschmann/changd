import React, { Component } from 'react'
import { Layout } from 'antd';
import { Breadcrumb, Form, Input, message, Button, Row, Spin, Avatar, Col } from 'antd';
import { getAccount, putAccount } from "../../../services/api.service";
import { Link } from "react-router-dom"

const { Content } = Layout;

class Account extends Component {

  constructor() {
    super()
    this.state = {
      loading: false
    };
  }

  componentDidMount() {
    this.getAccountDetail();
    this.loadUserVars();
  }

  loadUserVars() {

  }

  getAccountDetail() {
    this.setState({ loading: true });
    getAccount()
      .then(response => {
        this.setState({ email: response.data.email });
        this.setState({ firstname: response.data.firstname });
        this.setState({ lastname: response.data.lastname });
        this.setState({ account_type: response.data.account_type });

        var emailMd5 = sessionStorage.getItem('emailMd5');
        this.setState({ avatarUrl: 'https://www.gravatar.com/avatar/' + emailMd5 + '?s=128&d=mp' })
      }).catch(error => {
        console.log(error);
      }).finally(() => {
        this.setState({ loading: false });
      })
  }

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  }

  updateAccount() {
    this.setState({ loading: true });
    putAccount({
      firstname: this.state.firstname,
      lastname: this.state.lastname
    })
      .then(response => {
        if (response.status === 200) {
          message.success('Account updated');
          this.props.history.push('/jobs?status=1')
        }
        this.setState({ loading: false });
      }).catch(error => {
        this.setState({ message: 'Error, please check.' });
        this.setState({ loading: false });
      }).finally(() => {

      })
  }

  getAccountType(account_type) {
    if (account_type === 0) {
      return "Free"
    } else {
      return "Unlimited"
    }
  }

  render() {
    return (
      <>
        <Breadcrumb style={{ margin: '16px 0' }}>
          <Breadcrumb.Item><Link to="/account">Account</Link></Breadcrumb.Item>
        </Breadcrumb>
        <Content className="site-layout-background main-background">
          <Spin spinning={this.state.loading}>
            <Row>
              <Col span={12} offset={6}>
                <Form layout="vertical">
                  <Form.Item wrapperCol={{ offset: 9 }}>
                    <a rel="noreferrer" href="https://www.gravatar.com" target="_blank"><Avatar size={128} src={this.state.avatarUrl} style={{ backgroundColor: '#888' }} /></a>
                  </Form.Item>
                  <Form.Item label="Email">
                    <Input name="email" disabled={true} value={this.state.email} />
                  </Form.Item>
                  <Form.Item label="Firstname">
                    <Input name="firstname" value={this.state.firstname} placeholder="Enter your first name" onChange={this.handleChange} />
                  </Form.Item>
                  <Form.Item label="Lastname">
                    <Input name="lastname" value={this.state.lastname} placeholder="Enter your last name" onChange={this.handleChange} />
                  </Form.Item>
                  <Form.Item>
                    <Row justify="space-between">
                      <Button type="primary" onClick={() => this.updateAccount()} disabled={this.state.firstname === '' || this.state.lastname === ''}>
                        Save
                      </Button>
                      <Button type="secondary">
                        <Link to={'/account/setpassword'}>Change Password</Link>
                      </Button>
                    </Row>
                  </Form.Item>
                </Form>
              </Col>
            </Row>
          </Spin>
        </Content>
      </>
    )
  }
}

export default Account;

