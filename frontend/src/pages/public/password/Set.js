import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { setUserPassword } from '../../../services/api.service'
import { Form, Input, Button, Row, Col, Typography, Spin } from 'antd';
import logo from "../../../assets/logo.svg"
import textLogo from "../../../assets/logo-text.svg"
import { getQueryParam } from '../../../services/utils'

const { Title } = Typography;

function SetPassword(props) {
  const [loading, setLoading] = useState(false)
  const [pass, setPass] = useState("")
  const [message, setMessage] = useState("")
  const [token, setToken] = useState("")

  useEffect(() => {
    setToken(getQueryParam("token", props))
  }, [props])

  const updatePassword = (values) => {
    setLoading(true)
    setUserPassword({
      password: pass,
      token: token
    }).then(response => {
      if (response.status === 200) {
        setMessage('Your password has been reset, please login.')
      }
    }).catch(error => {
      setMessage('Error resetting your account, please contact support.')
    }).finally(() => {
      setLoading(false)
    })
  };


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
                {!message &&
                  <>
                    <Form.Item
                      label="New Password"
                      name="password"
                      rules={[{ required: true, message: 'Please input your new password' }]}
                    >
                      <Input.Password name="password" onChange={e => setPass(e.target.value)} />
                    </Form.Item>

                    <Form.Item wrapperCol={{ offset: 8, span: 16 }}>

                      <Button type="primary" htmlType="submit" style={{ marginRight: '8px' }} onClick={() => updatePassword()}>
                        Set Password
                      </Button>
                    </Form.Item>
                  </>
                }

                {<div style={{ textAlign: 'center' }}>{message}</div>}

                {message &&
                  <Form.Item style={{ marginTop: '20px' }} wrapperCol={{ span: 24 }}>
                    <div style={{ justifyContent: 'space-between', display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                      <Button type="primary" htmlType="submit">
                        <Link to="/login">Login</Link>
                      </Button>
                    </div>
                  </Form.Item>
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


export default SetPassword