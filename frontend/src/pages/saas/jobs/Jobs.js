import React, { Component } from 'react'
import { Layout, Table, Space } from 'antd';
import { Breadcrumb, Row, Col, Button, Popconfirm, Spin, Badge, Tag } from 'antd';
import { getJobs, putJobStatus, deleteJob } from "../../../services/api.service";
import { Link } from "react-router-dom";
import Moment from 'moment';
import { recentFormatter, getQueryParam } from '../../../services/utils';
import { PlayCircleOutlined, PauseCircleOutlined, DeleteOutlined, RedoOutlined } from '@ant-design/icons'

const { Content } = Layout;

class Jobs extends Component {
  constructor() {
    super();
    this.state = {
      loading: false
    };
    Moment.locale('en');
  }

  componentDidMount() {
    var status = getQueryParam("status", this.props);
    this.setQueryParamsFromState("status", status);
    this.getUserJobs(status);
    this.intervalId = setInterval(() => this.getUserJobs(status), 3000000);
  }

  componentDidUpdate() {
    var status = getQueryParam("status", this.props);
    if (this.state.status !== status) {
      this.setQueryParamsFromState("status", status);
      this.getUserJobs(status)
    }
  }
  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  setQueryParamsFromState(name, value) {
    this.setState({ [name]: value });
  }

  getUserJobs(status) {
    this.setState({ loading: true });
    status = status === undefined ? 1 : status;
    getJobs(status).then(response => {
      if (response.data) {
        this.setState({ jobs: response.data });
        this.setState({ loading: false });
      }
    })
      .catch(error => {

      })
  }

  editJobStatus = (job_id, status) => {
    const obj = { status: status }
    this.setState({ loading: true });
    putJobStatus(job_id, obj).then(response => {
      const status = getQueryParam("status", this.props);
      this.getUserJobs(status);
      this.setState({ loading: false });
    })
      .catch(error => {

      })
  }

  deleteJob = (job_id) => {
    this.setState({ loading: true });
    deleteJob(job_id).then(response => {
      const status = getQueryParam("status", this.props);
      this.getUserJobs(status);
      this.setState({ loading: false });
    })
      .catch(error => {

      })
  }

  render() {
    const columns = [
      {
        title: 'Type',
        dataIndex: 'job_type',
        key: 'job_type',
        width: '90px',
        align: 'center',
        render: (text, record) =>  
        (
          <Space size="middle">
            {record.job_type === 0 && <Tag color="gold">Visual</Tag>}
            {record.job_type === 1 && <Tag color="lime">XPath</Tag>}
            {record.job_type === 2 && <Tag color="green">JSON</Tag>}
          </Space>
        ),
        sorter: (a, b) => a.job_type - b.job_type
      },{
        title: 'Name',
        dataIndex: 'job_name',
        key: 'job_name',
        render: (text, record) => <Link to={`/jobs/${record.job_id}`}>{text} </Link>,
        sorter: (a, b) => a.job_name.localeCompare(b.job_name)
      },
      {
        title: 'Run Count',
        dataIndex: 'run_count',
        width: '140px',
        align: 'center',
        render: (text, record) => (
          <Badge overflowCount={100000} count={ record.run_count } style={{ backgroundColor: '#52c41a' }} />
        ),
        sorter: (a, b) => a.run_count - b.run_count,
      },
      {
        title: 'Error Count',
        dataIndex: 'error_count',
        width: '140px',
        align: 'center',
        render: (text, record) => (
          <Badge overflowCount={500} count={ record.error_count } />
        ),
        sorter: (a, b) => a.error_count - b.error_count,
      },
      {
        title: 'Last Change',
        dataIndex: 'last_change',
        width: '150px',
        align: 'center',
        render: (text, record) => (
          recentFormatter(record.latest_success)
        ),
        sorter: (a, b) => new Date(a.latest_success) - new Date(b.latest_success),
      },
      {
        title: 'Last Run',
        dataIndex: 'last_run',
        width: '150px',
        align: 'center',
        render: (text, record) => (
          recentFormatter(record.last_run)
        ),
        sorter: (a, b) => new Date(a.last_run) - new Date(b.last_run),
      },
      {
        title: 'Next Run',
        dataIndex: 'next_run',
        width: '150px',
        align: 'center',
        render: (text, record) => (
          record.status === 1 && recentFormatter(record.next_run)
        ),
        sorter: (a, b) => new Date(a.next_run) - new Date(b.next_run),
      },
      {
        title: 'Action',
        key: 'action',
        width: '100px',
        align: 'center',
        render: (text, record) => (
          <Space size="middle">
            {record.status === 1 && <Button type="link" onClick={() => this.editJobStatus(record.job_id, 2)} icon={ <PauseCircleOutlined /> } title="Deactive this job" />}
            {record.status === 2 && <Button type="link" onClick={() => this.editJobStatus(record.job_id, 1)} icon={ <PlayCircleOutlined /> } title="Activate this job" />}
            {record.status === 2 && <Popconfirm title="Are you sure?" onConfirm={() => this.deleteJob(record.job_id)}><Button type="link" icon={ <DeleteOutlined /> } title="Delete this job" /></Popconfirm>}
          </Space>
        ),
      },
    ];

    return (
      <>
        <Breadcrumb style={{ margin: '16px 0' }}>
          <Breadcrumb.Item><Link to="/jobs">Jobs</Link></Breadcrumb.Item>
        </Breadcrumb>
        <Content className="site-layout-background main-background">
          <Spin spinning={this.state.loading}>
            { this.state.status !== "2" && 
              <Row justify="end" style={{ marginBottom: 24 }}>
                <Col>
                  <Button type="secondary" style={{ marginRight: 10 }} onClick={() => this.getUserJobs(this.state.status)} icon={ <RedoOutlined /> } title="Activate this job" />
                  <Button type="primary"><Link to="/addjob">Add Job</Link></Button>
                </Col>
              </Row>
            }
            <Table rowKey="job_id" bordered={true} columns={columns} dataSource={this.state.jobs} />
          </Spin>
        </Content>
      </>
    )
  }
}

export default Jobs;

