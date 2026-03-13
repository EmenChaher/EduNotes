import React, { useEffect } from "react"
import { Card, Row, Col, Statistic, Table, Spin, Alert, Progress } from "antd"
import { BookOutlined, TrophyOutlined, FileTextOutlined, BarChartOutlined } from "@ant-design/icons"
import { useAppDispatch, useAppSelector } from "@src/store"
import { fetchStudentStatistics, fetchStudentSubjectStatistics, fetchStudentRankings } from "@src/store/slices/student/statistics/thunk"

const StudentStatistics: React.FC = () => {
  const dispatch = useAppDispatch()
  const { status, error, globalStats, subjectStats, rankings } = useAppSelector((state) => state.student.statistics)

  useEffect(() => {
    dispatch(fetchStudentStatistics())
    dispatch(fetchStudentSubjectStatistics())
    dispatch(fetchStudentRankings())
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
      title: "Ma moyenne",
      dataIndex: "studentAverage",
      key: "studentAverage",
      render: (value: any) => (value && typeof value === "number" ? value.toFixed(2) : "N/A"),
    },
    {
      title: "Moyenne classe",
      dataIndex: "classAverage",
      key: "classAverage",
      render: (value: any) => (value && typeof value === "number" ? value.toFixed(2) : "N/A"),
    },
    {
      title: "Nombre de notes",
      dataIndex: "gradeCount",
      key: "gradeCount",
    },
    {
      title: "Performance",
      key: "performance",
      render: (record: any) => {
        if (!record.studentAverage || !record.classAverage) return "N/A"
        const percentage = (record.studentAverage / record.classAverage) * 100
        const color = percentage >= 100 ? "#52c41a" : percentage >= 80 ? "#faad14" : "#ff4d4f"
        return <Progress percent={Math.min(percentage, 100)} size="small" strokeColor={color} format={(percent) => `${percent?.toFixed(0)}%`} />
      },
    },
  ]

  const rankingColumns = [
    {
      title: "Matière",
      dataIndex: "subjectName",
      key: "subjectName",
    },
    {
      title: "Mon classement",
      dataIndex: "rank",
      key: "rank",
      render: (rank: number, record: any) => `${rank}/${record.totalStudents}`,
    },
    {
      title: "Ma moyenne",
      dataIndex: "studentAverage",
      key: "studentAverage",
      render: (value: any) => (value && typeof value === "number" ? value.toFixed(2) : "N/A"),
    },
    {
      title: "Position",
      key: "position",
      render: (record: any) => {
        const percentage = ((record.totalStudents - record.rank + 1) / record.totalStudents) * 100
        let color = "#ff4d4f" // Rouge par défaut
        let status = "Peut mieux faire"

        if (percentage >= 80) {
          color = "#52c41a"
          status = "Excellent"
        } else if (percentage >= 60) {
          color = "#faad14"
          status = "Bien"
        } else if (percentage >= 40) {
          color = "#1890ff"
          status = "Moyen"
        }

        return (
          <div className="flex items-center gap-2">
            <Progress percent={percentage} size="small" strokeColor={color} format={() => status} />
          </div>
        )
      },
    },
  ]

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Mon Tableau de Bord</h1>
      {globalStats?.className && (
        <div className="mb-4">
          <h2 className="text-lg text-gray-600">
            Classe: <span className="font-semibold text-blue-600">{globalStats.className}</span>
          </h2>
        </div>
      )}

      {/* Statistiques globales */}
      <Row gutter={16} className="mb-6">
        <Col span={8}>
          <Card>
            <Statistic
              title="Matières étudiées"
              value={globalStats?.totalSubjects || 0}
              prefix={<BookOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Notes obtenues" value={globalStats?.totalGrades || 0} prefix={<FileTextOutlined />} valueStyle={{ color: "#52c41a" }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Matières avec classement" value={rankings?.length || 0} prefix={<TrophyOutlined />} valueStyle={{ color: "#faad14" }} />
          </Card>
        </Col>
      </Row>

      {/* Mes moyennes par matière */}
      <Card title="Mes Moyennes par Matière" className="mb-6">
        <Table columns={subjectColumns} dataSource={subjectStats} rowKey="_id" pagination={false} size="small" />
      </Card>

      {/* Mon classement */}
      <Card title="Mon Classement" icon={<BarChartOutlined />}>
        <Table columns={rankingColumns} dataSource={rankings} rowKey="_id" pagination={false} size="small" />
      </Card>
    </div>
  )
}

export default StudentStatistics
