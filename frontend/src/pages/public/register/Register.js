import React, { useState, useEffect } from 'react'
import { Redirect, Link } from 'react-router-dom'
import { registerUser } from '../../../services/api.service'
import logo from "../../../assets/logo.svg"
import textLogo from "../../../assets/logo-text.svg"
import { Form, Input, Button, Checkbox, Row, Col, Typography, Spin, Alert } from 'antd';
import { useMatomo } from '@datapunt/matomo-tracker-react';

const { Title } = Typography;

function Register(props) {
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [message, setMessage] = useState("")
    const [firstname, setFirstname] = useState("")
    const [lastname, setLastname] = useState("")

    const { trackPageView } = useMatomo()

    useEffect(()=>{
        trackPageView()
    }, [trackPageView])
    
    const onSubmit = () => {
        setLoading(true)
        registerUser({
            email: email,
            password: password,
            firstname: firstname,
            lastname: lastname
        })
            .then(response => {
                setLoading(false)
                if (response.status === 200) {
                    localStorage.setItem("token", response.data.token)
                }
                window.location.reload(false);
            }).catch(error => {
                setLoading(false)
                if (error.response.status === 409) {
                    setMessage("This email has already been registered, please login.")
                } else {
                    setMessage("Error, please try again.")
                }
            })
    };

    if (localStorage.getItem("token")) {
        return <Redirect to="/jobs" />
    } else {
        return (
            <>
                <div style={{ width: '500px', position: 'absolute', top: '30%', left: '50%', margin: '-160px 0 0 -250px', padding: '36px', boxShadow: '0 0 100px rgb(0 0 0 / 8%)' }} >
                    <Spin spinning={loading}>
                        <Row type="flex" justify="center" align="middle" style={{ paddingBottom: '20px' }}>
                            <Col>
                                <div style={{ justifyContent: 'space-between', display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                                    <div style={{ marginBottom: '20px' }}>
                                        <img className="logo" src={logo} alt="logo" />
                                    </div>
                                    <div>
                                        <Title level={2}>Register</Title>
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

                                    {message && <Alert style={{ marginBottom: '20px', marginTop: '10px' }} message={message} type="error" showIcon />}

                                    <Form.Item
                                        label="First Name"
                                        name="firstname"
                                        rules={[{ required: true, message: 'Please input a firstname' }]}
                                    >
                                        <Input name="firstname" onChange={e => setFirstname(e.target.value)} />
                                    </Form.Item>

                                    <Form.Item
                                        label="Last Name"
                                        name="lastname"
                                        rules={[{ required: true, message: 'Please input a last name' }]}
                                    >
                                        <Input name="lastname" onChange={e => setLastname(e.target.value)} />
                                    </Form.Item>

                                    <Form.Item
                                        label="Email"
                                        name="email"
                                        rules={[{ required: true, message: 'Please input a email!' }]}
                                    >
                                        <Input name="email" onChange={e => setEmail(e.target.value)} />
                                    </Form.Item>

                                    <Form.Item
                                        label="Password"
                                        name="password"
                                        rules={[{ required: true, message: 'Please input a password!' }]}
                                    >
                                        <Input.Password name="password" onChange={e => setPassword(e.target.value)} />
                                    </Form.Item>

                                    <Form.Item name="remember" valuePropName="checked" wrapperCol={{ offset: 8, span: 16 }}>
                                        <Checkbox>Remember me</Checkbox>
                                    </Form.Item>

                                    <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                                        <Button onClick={() => onSubmit()} type="primary" htmlType="submit" style={{ marginRight: '8px' }} disabled={!email || !firstname || !lastname || !password}>
                                            Register
                                        </Button>
                                        <Button type="secondary" htmlType="submit">
                                            <Link to="/login">Login</Link>
                                        </Button>
                                    </Form.Item>
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

export default Register