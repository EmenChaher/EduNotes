import React, { useEffect } from "react"
import { Card, Row, Col, Statistic, Table, Spin, Alert, Progress } from "antd"
import { 
  UserOutlined, 
  TeamOutlined, 
  BookOutlined, 
  FileTextOutlined, 
  HomeOutlined,
  BarChartOutlined 
} from "@ant-design/icons"
import { useAppDispatch, useAppSelector } from "@src/store"
import { 
  fetchAdminGlobalStatistics, 
  fetchAdminClassStatistics, 
  fetchAdminSubjectStatistics 
} from "@src/store/slices/admin/statistics/thunk"

const AdminStatistics: React.FC = () => {
  const dispatch = useAppDispatch()
  const { status, error, globalStats, classStats, subjectStats } = useAppSelector(
    (state) => state.administrator.statistics
  )

  useEffect(() => {
    dispatch(fetchAdminGlobalStatistics())
    dispatch(fetchAdminClassStatistics())
    dispatch(fetchAdminSubjectStatistics())
  }, [dispatch])

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    )
  }

  if (status === "failed") {
    return <Alert message="Erreur" description={error} type="error" showIcon />
  }

  const classColumns = [
    {
      title: "Classe",
      dataIndex: "className",
      key: "className",
    },
    {
      title: "Niveau",
      dataIndex: "levelLabel",
      key: "levelLabel",
    },
    {
      title: "Filière",
      dataIndex: "studyFieldName",
      key: "studyFieldName",
    },
    {
      title: "Étudiants",
      dataIndex: "studentCount",
      key: "studentCount",
      render: (count: number) => (
        <span className="font-semibold text-blue-600">{count}</span>
      ),
    },
    {
      title: "Matières",
      dataIndex: "subjectCount",
      key: "subjectCount",
      render: (count: number) => (
        <span className="font-semibold text-green-600">{count}</span>
      ),
    },
  ]

  const subjectColumns = [
    {
      title: "Matière",
      dataIndex: "subjectName",
      key: "subjectName",
    },
    {
      title: "Coefficient",
      dataIndex: "coefficient",
      key: "coefficient",
    },
    {
      title: "Moyenne générale",
      dataIndex: "averageGrade",
      key: "averageGrade",
      render: (value: any) => (value && typeof value === 'number') ? value.toFixed(2) : "N/A",
    },
    {
      title: "Note max",
      dataIndex: "maxGrade",
      key: "maxGrade",
      render: (value: any) => (value && typeof value === 'number') ? value.toFixed(2) : "N/A",
    },
    {
      title: "Note min",
      dataIndex: "minGrade",
      key: "minGrade",
      render: (value: any) => (value && typeof value === 'number') ? value.toFixed(2) : "N/A",
    },
    {
      title: "Total notes",
      dataIndex: "totalGrades",
      key: "totalGrades",
    },
    {
      title: "Performance",
      key: "performance",
      render: (record: any) => {
        if (!record.averageGrade) return "N/A"
        const percentage = (record.averageGrade / 20) * 100
        const color = percentage >= 70 ? "#52c41a" : percentage >= 50 ? "#faad14" : "#ff4d4f"
        return (
          <Progress 
            percent={percentage} 
            size="small" 
            strokeColor={color}
            format={(percent) => `${percent?.toFixed(0)}%`}
          />
        )
      },
    },
  ]

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Tableau de Bord Administrateur</h1>
      
      {/* Statistiques globales */}
      <Row gutter={16} className="mb-6">
        <Col span={5}>
          <Card>
            <Statistic
              title="Étudiants"
              value={globalStats?.totalStudents || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card>
            <Statistic
              title="Enseignants"
              value={globalStats?.totalTeachers || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card>
            <Statistic
              title="Classes"
              value={globalStats?.totalClasses || 0}
              prefix={<HomeOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card>
            <Statistic
              title="Matières"
              value={globalStats?.totalSubjects || 0}
              prefix={<BookOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Notes"
              value={globalStats?.totalGrades || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: "#eb2f96" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Statistiques par classe */}
      <Card title="Statistiques par Classe" className="mb-6">
        <Table
          columns={classColumns}
          dataSource={classStats}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
          size="small"
        />
      </Card>

      {/* Statistiques par matière */}
      <Card title="Performance par Matière" icon={<BarChartOutlined />}>
        <Table
          columns={subjectColumns}
          dataSource={subjectStats}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
          size="small"
        />
      </Card>
    </div>
  )
}

export default AdminStatistics
