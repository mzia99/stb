import React, { useContext } from 'react';
import { Card, Accordion } from 'react-bootstrap';
import { AuthContext } from '../AuthContext';
import StocksSidebar from '../components/StocksSidebar';

function DashboardPage() {
  const { user, token } = useContext(AuthContext);

  return (
    <div className="container-fluid my-5">
      <h1 className="text-center mb-4">User Dashboard</h1>
      <div className="row">
        <div className="col-md-3">
          <StocksSidebar token={token} />
        </div>
        <div className="col-md-9">
          <Card className="mb-4">
            <Card.Body>
              <h2>Welcome, {user?.name}!</h2>
              <p>Email: {user?.email}</p>
              <Accordion defaultActiveKey="0" className="mt-4">
                <Accordion.Item eventKey="0">
                  <Accordion.Header>Dashboard Section #1</Accordion.Header>
                  <Accordion.Body>Content for dashboard section #1</Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="1">
                  <Accordion.Header>Dashboard Section #2</Accordion.Header>
                  <Accordion.Body>Content for dashboard section #2</Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
