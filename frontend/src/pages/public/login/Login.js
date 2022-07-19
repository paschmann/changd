import React, { useState, useEffect } from 'react'
import { Redirect, Link } from 'react-router-dom'
import { loginUser } from '../../../services/api.service'
import { Form, Input, Button, Checkbox, Row, Col, Typography, Spin, Alert } from 'antd';
import logo from "../../../assets/logo.svg"
import textLogo from "../../../assets/logo-text.svg"

const { Title } = Typography;

function Login (props) {
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [message, setMessage] = useState("")

    const onFinish = (values) => {
        setLoading(true);
        loginUser({
            email: email,
            password: password
        })
            .then(response => {
                if (response.status === 200) {
                    localStorage.setItem("token", response.data.token)
                }
                window.location.reload(false)
            }).catch(error => {
                console.log(error);
                setMessage('Incorrect username or password.')
            })
            .finally (() => {
                setLoading(false);
            })
    };

    if (localStorage.getItem("token")) {
        return <Redirect to="/jobs?status=1" />
    } else {
        return (
            <>
                <div style={{ width: '500px', position: 'absolute', top: '30%', left: '50%', margin: '-160px 0 0 -250px', padding: '36px', boxShadow: '0 0 100px rgb(0 0 0 / 8%)' }} >
                    <Spin spinning={loading}>
                    <Row justify="center" align="middle" style={{ paddingBottom: '20px' }}>
                        <Col span={24}>
                            <div style={{justifyContent: 'space-between', display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
                                <div style={{ marginBottom: '20px' }}>
                                    <img className="logo" src={logo} alt="logo" />
                                </div>
                                <div>
                                    <Title level={2}>Login</Title>
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
                                onFinish={() => onFinish()}
                                data-testid="login-form"
                            >

                                {message && <Alert style={{ marginBottom: '20px', marginTop: '10px' }} message={message} type="error" showIcon />}

                                <Form.Item
                                    label="Email"
                                    name="email"
                                    rules={[{ required: true, message: 'Please input your email!' }]}
                                >
                                    <Input name="email" data-testid="email-input" onChange={e => setEmail(e.target.value)} />
                                </Form.Item>

                                <Form.Item
                                    label="Password"
                                    name="password"
                                    
                                    rules={[{ required: true, message: 'Please input your password!' }]}
                                >
                                    <Input.Password name="password" data-testid="password-input" onChange={e => setPassword(e.target.value)} />
                                </Form.Item>

                                <Form.Item name="remember" valuePropName="checked" wrapperCol={{ offset: 8, span: 16 }}>
                                    <Checkbox>Remember me</Checkbox>
                                </Form.Item>

                                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>

                                    <Button type="primary" data-testid="login-button"  htmlType="submit" style={{ marginRight: '8px' }} disabled={ !email || !password }>
                                        Login
                                    </Button>
                                    <Button type="secondary" htmlType="submit">
                                        <Link to="/register">Register</Link>
                                    </Button>
                                </Form.Item>

                            </Form>
                        </Col>
                    </Row>
                    <Row type="flex" justify="center" align="middle">
                    <Col>
                        <div style={{justifyContent: 'space-between', display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
                                <div>
                                    <Link to="/"><img className="textLogo" src={textLogo} alt="logo" /></Link>
                                </div>
                            </div>
                    </Col>
                </Row>
                <Row type="flex" justify="center" align="middle" style={{marginTop: '40px'}}>
                    <Col>
                        <div style={{justifyContent: 'space-between', display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
                                <div>
                                    <Link to="/reset">Password Reset</Link>
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

export default Login