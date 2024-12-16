import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { Card, Tab, Tabs } from 'react-bootstrap';

function LoginRegisterPage() {
  const { login, register } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard'); // Redirect to dashboard after successful login
    } catch (error) {
      setError('Login failed. Please check your credentials and try again.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await register(name, email, password);
      setSuccess('Registration successful! You can now log in.');
      // Clear form
      setName('');
      setEmail('');
      setPassword('');
    } catch (error) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="container-fluid my-5">
      <h1 className="text-center mb-4">User Login / Register</h1>
      <div className="row">
        <div className="col-md-4 offset-md-4">
          <Card className="mb-4">
            <Card.Body>
              <Tabs defaultActiveKey="login">
                <Tab eventKey="login" title="Login">
                  {error && <div className="alert alert-danger">{error}</div>}
                  <form onSubmit={handleLogin}>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Password</label>
                      <input
                        type="password"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-primary mt-3">Login</button>
                  </form>
                </Tab>
                <Tab eventKey="register" title="Register">
                  {error && <div className="alert alert-danger">{error}</div>}
                  {success && <div className="alert alert-success">{success}</div>}
                  <form onSubmit={handleRegister}>
                    <div className="form-group">
                      <label>Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Password</label>
                      <input
                        type="password"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-primary mt-3">Register</button>
                  </form>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default LoginRegisterPage;
