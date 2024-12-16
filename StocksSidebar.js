import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Accordion, Card, Form, Button, Table, Alert } from 'react-bootstrap';
import { AuthContext } from '../AuthContext';

function StocksSidebar() {
  const { token } = useContext(AuthContext);
  const [stocks, setStocks] = useState([]);
  const [editingStock, setEditingStock] = useState(null);
  const [newStock, setNewStock] = useState({
    symbol: '',
    title: '',
    status: 'disabled',
    meta: [{ meta_key: '', meta_value: '' }]
  });
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    if (token) {
      fetchStocks();
    }
  }, [token]);

  const fetchStocks = async () => {
    try {
      console.log('Token:', token);
      const response = await axios.get('http://localhost:3000/stocks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Fetched stocks:', response.data);
      setStocks(response.data);
    } catch (error) {
      console.error('Error fetching stocks:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStock) {
        console.log('Updating stock:', newStock, token);
        await axios.put(`http://localhost:3000/stocks/${editingStock.id}`, newStock, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAlertMessage('Stock updated successfully!');
      } else {
        console.log('Adding new stock:', newStock, token);
        await axios.post('http://localhost:3000/stocks', newStock, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAlertMessage('Stock added successfully!');
      }
      fetchStocks();
      setShowAlert(true);
      setNewStock({ symbol: '', title: '', status: 'disabled', meta: [{ meta_key: '', meta_value: '' }] });
      setEditingStock(null);
    } catch (error) {
      console.error('Error saving stock:', error);
      alert('Error saving stock settings. Please check the console for details.' + error.message);
    }
  };

  const handleMetaChange = (index, field, value) => {
    const updatedMeta = [...newStock.meta];
    updatedMeta[index][field] = value;
    setNewStock({ ...newStock, meta: updatedMeta });
  };

  const addMetaRow = () => {
    setNewStock({
      ...newStock,
      meta: [...newStock.meta, { meta_key: '', meta_value: '' }]
    });
  };

  const removeMetaRow = (index) => {
    const updatedMeta = newStock.meta.filter((_, i) => i !== index);
    setNewStock({ ...newStock, meta: updatedMeta });
  };

  const handleEdit = (stock) => {
    console.log('Editing stock:', stock);
    setEditingStock(stock);
    setNewStock({
      symbol: stock.symbol,
      title: stock.title,
      status: stock.status,
      meta: stock.meta || [{ meta_key: '', meta_value: '' }]
    });
  };

  return (
    <Card className="mb-4">
      <Card.Header>Stocks</Card.Header>
      <Card.Body>
        {showAlert && (
          <Alert variant="success" onClose={() => setShowAlert(false)} dismissible>
            {alertMessage}
          </Alert>
        )}
        <Accordion>
          <Accordion.Item eventKey="new">
            <Accordion.Header>
              {editingStock ? `Edit ${editingStock.symbol}` : 'Add New Symbol'}
            </Accordion.Header>
            <Accordion.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Symbol</Form.Label>
                  <Form.Control
                    type="text"
                    value={newStock.symbol}
                    onChange={(e) => setNewStock({ ...newStock, symbol: e.target.value })}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    type="text"
                    value={newStock.title}
                    onChange={(e) => setNewStock({ ...newStock, title: e.target.value })}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={newStock.status}
                    onChange={(e) => setNewStock({ ...newStock, status: e.target.value })}
                  >
                    <option value="disabled">Disabled</option>
                    <option value="enabled">Enabled</option>
                  </Form.Select>
                </Form.Group>

                <Table striped bordered hover size="sm" className="mt-3">
                  <thead>
                    <tr>
                      <th>Meta Key</th>
                      <th>Meta Value</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {newStock.meta.map((meta, index) => (
                      <tr key={index}>
                        <td>
                          <Form.Control
                            type="text"
                            value={meta.meta_key}
                            onChange={(e) => handleMetaChange(index, 'meta_key', e.target.value)}
                            required
                          />
                        </td>
                        <td>
                          <Form.Control
                            type="text"
                            value={meta.meta_value}
                            onChange={(e) => handleMetaChange(index, 'meta_value', e.target.value)}
                            required
                          />
                        </td>
                        <td>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => removeMetaRow(index)}
                            disabled={index === 0}
                          >
                            -
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                <Button variant="secondary" size="sm" onClick={addMetaRow} className="mb-3">
                  + Add Meta Field
                </Button>

                <div>
                  <Button type="submit" variant="primary">
                    {editingStock ? 'Update' : 'Save'}
                  </Button>
                  {editingStock && (
                    <Button
                      variant="secondary"
                      className="ms-2"
                      onClick={() => {
                        setEditingStock(null);
                        setNewStock({ symbol: '', title: '', status: 'disabled', meta: [{ meta_key: '', meta_value: '' }] });
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </Form>
            </Accordion.Body>
          </Accordion.Item>

          {stocks.map((stock) => (
            <Accordion.Item key={stock.id} eventKey={stock.id.toString()}>
              <Accordion.Header>{stock.symbol}</Accordion.Header>
              <Accordion.Body>
                <div>
                  <p><strong>Title:</strong> {stock.title}</p>
                  <p><strong>Status:</strong> {stock.status}</p>
                  <Button variant="primary" onClick={() => handleEdit(stock)}>
                    Edit Settings
                  </Button>
                </div>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      </Card.Body>
    </Card>
  );
}

export default StocksSidebar;
