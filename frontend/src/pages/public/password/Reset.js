import React, { useState, useEffect } from 'react'
import { Redirect, Link } from 'react-router-dom'
import { forgotPassword } from '../../../services/api.service'
import { Form, Input, Button, Row, Col, Typography, Spin } from 'antd';
import logo from "../../../assets/logo.svg"
import textLogo from "../../../assets/logo-text.svg"

const { Title } = Typography;

function Reset(props) {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")

  const requestResetEmail = (values) => {
    setLoading(true)
    forgotPassword({
      email: email
    })
      .then(response => {
        if (response.status === 200) {
          setMessage('If that email exists in our system, you will recieve instructions shortly.')
        }
      }).catch(error => {
        console.log(error);
      }).finally(() => {
        setLoading(false)
      })
  };


  if (localStorage.getItem("token")) {
    return <Redirect to="/jobs" />
  } else {
    return (
      <>
        <div style={{ width: '500px', position: 'absolute', top: '30%', left: '50%', margin: '-160px 0 0 -250px', padding: '36px', boxShadow: '0 0 100px rgb(0 0 0 / 8%)' }} >
          <Spin spinning={loading}>
            <Row justify="center" align="middle" style={{ paddingBottom: '20px' }}>
              <Col span={24}>
                <div style={{ justifyContent: 'space-between', display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                  <div style={{ marginBottom: '20px' }}>
                    <img className="logo" src={logo} alt="logo" />
                  </div>
                  <div>
                    <Title level={2}>Reset Password</Title>
                  </div>
                </div>
              </Col>
            </Row>

            <Row type="flex" justify="center" align="middle">
              <Col span={24}>
                <Form
                  name="basic"
                  labelCol={{ span: 8 }}
                  wrapperCol={{ span: 16 }}
                  initialValues={{ remember: true }}
                >

                  {<div style={{ textAlign: 'center', marginBottom: '20px' }}>{message}</div>}

                  {!message &&
                    <>
                      <Form.Item
                        label="Email"
                        name="email"
                        rules={[{ required: true, message: 'Please input your email!' }]}
                      >
                        <Input name="email" onChange={e => setEmail(e.target.value)} />
                      </Form.Item>

                      <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                        <Button type="primary" htmlType="submit" style={{ marginRight: '8px' }} disabled={!email} onClick={() => requestResetEmail()}>
                          Request Reset Email
                        </Button>
                        <Button type="secondary" htmlType="submit">
                          <Link to="/login">Cancel</Link>
                        </Button>
                      </Form.Item>
                    </>
                  }

                </Form>
              </Col>
            </Row>
            <Row type="flex" justify="center" align="middle">
              <Col>
                <div style={{ justifyContent: 'space-between', display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                  <div>
                    <Link to="/"><img className="textLogo" src={textLogo} alt="logo" /></Link>
                  </div>
                </div>
              </Col>
            </Row>
          </Spin>
        </div>
      </>
    )
  }
}

export default Reset