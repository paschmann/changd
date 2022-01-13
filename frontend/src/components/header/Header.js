import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Avatar } from 'antd';
import { Link } from "react-router-dom";
import logo from "../../assets/logo_text_white.png"

const { Header } = Layout;

function AppHeader(props) {
  const [emailMd5, setEmailMd5] = useState('')
  const [url, setUrl] = useState('')

  useEffect(()=>{
    loadUserVars()
  })

  const loadUserVars = () => {
    setEmailMd5(sessionStorage.getItem('emailMd5'))
    setUrl('https://www.gravatar.com/avatar/' + emailMd5 + '?s=50&d=mp')
  }

  return (
    <Header className="header">
      <img className="header-logo" src={logo} alt="logo" />
      <Row justify="end" style={{ marginBottom: 24 }}>
        <Col>
          <Link to="/account">
            <Avatar src={ url } style={{ backgroundColor: '#888' }} />
          </Link>
        </Col>
      </Row>
    </Header>
  )
  }

  export default AppHeader;