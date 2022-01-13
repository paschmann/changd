import React, { Component } from 'react'
import { Layout, Menu, Modal } from 'antd';
import { Link, withRouter } from "react-router-dom";
import { FolderOutlined, ExperimentOutlined, SettingOutlined } from '@ant-design/icons';

const { SubMenu } = Menu;
const { Sider } = Layout;

class AppSider extends Component {
  state = {
    redirect: false,
    menu: "/jobs",
    showModal: false
  }

  constructor() {
    super();
    this.state = {};
    this.logout = this.logout.bind(this);
  }

  showModal() {
    this.setState({ showModal: true });
  }

  hideModal() {
    this.setState({ showModal: false });
  }

  logout(event) {
    localStorage.removeItem("token")
    sessionStorage.clear()
    window.location.reload(false)
  }

  render() {
    const { location } = this.props
    return (
      <Sider width={200} className="site-layout-background">
        <Modal
          title="Logout?"
          visible={this.state.showModal}
          onOk={() => this.logout()}
          onCancel={() => this.hideModal() }
          okText="Logout"
          cancelText="Cancel"
        >
          <p>Are you sure you want to logout?</p>
        </Modal>
        <Menu
          mode="inline"
          defaultSelectedKeys={[location.pathname + location.search]}
          defaultOpenKeys={['jobs', 'analytics', 'settings']}
          style={{ height: '100%', borderRight: 0 }}
        >
          <SubMenu key="jobs" icon={<FolderOutlined />} title="Jobs">
            <Menu.Item key="/jobs?status=1"><Link to="/jobs?status=1">Active Jobs</Link></Menu.Item>
            <Menu.Item key="/jobs?status=2"><Link to="/jobs?status=2">Inactive Jobs</Link></Menu.Item>
          </SubMenu>
          <SubMenu key="analytics" icon={<ExperimentOutlined />} title="Analytics">
            <Menu.Item key="/usage?show=daily"><Link to="/usage?show=daily">Daily Usage</Link></Menu.Item>
            <Menu.Item key="/usage?show=monthly"><Link to="/usage?show=monthly">Monthly Usage</Link></Menu.Item>
            <Menu.Item key="7"><Link to="/timeline">Timeline</Link></Menu.Item>
          </SubMenu>
          <SubMenu key="settings" icon={<SettingOutlined />} title="Settings">
            <Menu.Item key="8"><Link to="/account">Account</Link></Menu.Item>
            <Menu.Item key="9"><Link to="/notifications">Notifications</Link></Menu.Item>
            <Menu.Item key="10"><Link onClick={ () => this.showModal() }>Logout</Link></Menu.Item>
          </SubMenu>
        </Menu>
      </Sider>
    )
  }
}

export default withRouter(AppSider);