import React, { useEffect } from "react"
import { Card, Row, Col, Statistic, Table, Spin, Alert } from "antd"
import { UserOutlined, BookOutlined, TeamOutlined, BarChartOutlined } from "@ant-design/icons"
import { useAppDispatch, useAppSelector } from "@src/store"
import { fetchTeacherStatistics, fetchTeacherClassStatistics, fetchTeacherGradeStatistics } from "@src/store/slices/teacher/statistics/thunk"

const TeacherStatistics: React.FC = () => {
  const dispatch = useAppDispatch()
  const { status, error, globalStats, classStats, gradeStats } = useAppSelector((state) => state.teacher.statistics)

  useEffect(() => {
    dispatch(fetchTeacherStatistics())
    dispatch(fetchTeacherClassStatistics())
    dispatch(fetchTeacherGradeStatistics())
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
      title: "Nombre d'étudiants",
      dataIndex: "studentCount",
      key: "studentCount",
    },
    {
      title: "Nombre de matières",
      dataIndex: "subjects",
      key: "subjects",
      render: (subjects: any[]) => subjects?.length || 0,
    },
  ]

  const gradeColumns = [
    {
      title: "Classe",
      dataIndex: "className",
      key: "className",
    },
    {
      title: "Matière",
      dataIndex: "subjectName",
      key: "subjectName",
    },
    {
      title: "Nombre de notes",
      dataIndex: "totalGrades",
      key: "totalGrades",
    },
    {
      title: "Moyenne",
      dataIndex: "averageGrade",
      key: "averageGrade",
      render: (value: any) => (value && typeof value === "number" ? value.toFixed(2) : "N/A"),
    },
    {
      title: "Note max",
      dataIndex: "maxGrade",
      key: "maxGrade",
      render: (value: any) => (value && typeof value === "number" ? value.toFixed(2) : "N/A"),
    },
    {
      title: "Note min",
      dataIndex: "minGrade",
      key: "minGrade",
      render: (value: any) => (value && typeof value === "number" ? value.toFixed(2) : "N/A"),
    },
  ]

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Tableau de bord - Statistiques</h1>

      {/* Statistiques globales */}
      <Row gutter={16} className="mb-6">
        <Col span={8}>
          <Card>
            <Statistic
              title="Classes enseignées"
              value={globalStats?.totalClasses || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Matières enseignées"
              value={globalStats?.totalSubjects || 0}
              prefix={<BookOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Étudiants total" value={globalStats?.totalStudents || 0} prefix={<UserOutlined />} valueStyle={{ color: "#722ed1" }} />
          </Card>
        </Col>
      </Row>

      {/* Statistiques par classe */}
      <Card title="Mes Classes" className="mb-6">
        <Table columns={classColumns} dataSource={classStats} rowKey="_id" pagination={false} size="small" />
      </Card>

      {/* Statistiques des notes */}
      <Card title="Statistiques des Notes" icon={<BarChartOutlined />}>
        <Table
          columns={gradeColumns}
          dataSource={gradeStats}
          rowKey={(record) => `${record._id.class}-${record._id.subject}`}
          pagination={{ pageSize: 10 }}
          size="small"
        />
      </Card>
    </div>
  )
}

export default TeacherStatistics
