import React, { Component } from 'react'
import { Breadcrumb, Spin } from 'antd';
import { getNotifications, deleteNotification } from "../../../services/api.service";
import { Link } from "react-router-dom"
import { Button, Layout, Table, Space, Row, Col, message, Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons'

const { Content } = Layout;

class Notifications extends Component {
  constructor() {
    super()
    this.state = {
      type: 'email',
      param_1: '',
      loading: false
    };
  }

  componentDidMount() {
    this.getUserNotifications();
  }

  getUserNotifications() {
    this.setState({ loading: true });
    getNotifications().then(response => {
      if (response.data) {
        this.setState({ notifications: response.data });
      }
    }).catch(error => { })
    .finally( () => {
      this.setState({ loading: false });
    })
  }

  deleteUserNotification(notification_id) {
    this.setState({ loading: true });
    deleteNotification(notification_id).then(response => {
      message.success('Notification deleted');
      this.getUserNotifications();
    }).catch(error => { })
    .finally( () => {
      this.setState({ loading: false });
    })
  }

  render() {
    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        render: (text, record) => (
          <Link to={"/notifications/" + record.notification_id + "/edit"}>{record.name}</Link>
        )
      },
      {
        title: 'Type',
        dataIndex: 'type'
      },
      {
        title: 'Action',
        key: 'action',
        width: '100px',
        align: 'center',
        render: (text, record) => (
          <Space size="middle">
            <Popconfirm title="Are you sure?" onConfirm={() => this.deleteUserNotification(record.notification_id)}>
              <Button type="link" icon={ <DeleteOutlined /> } title="Delete this notification method" ></Button>
            </Popconfirm>
          </Space>
        )
      }
    ];

    return (
      <>
        <Breadcrumb style={{ margin: '16px 0' }}>
          <Breadcrumb.Item><Link to="/notifications">Notifications</Link></Breadcrumb.Item>
        </Breadcrumb>
        <Content className="site-layout-background main-background">
          <Spin spinning={this.state.loading}>
            <Row justify="end" style={{ marginBottom: 24 }}>
              <Col>
                <Button type="primary"><Link to="/addnotification">Add Notification</Link></Button>
              </Col>
            </Row>
            <Table rowKey="notification_id" bordered={true} columns={columns} dataSource={this.state.notifications} />
          </Spin>
        </Content >
      </>
    )
  }
}

export default Notifications;

