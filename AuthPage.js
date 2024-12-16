import React, { useState, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import { Card, Button } from 'react-bootstrap';

function AuthPage() {
  const { login, register } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLogin, setIsLogin] = useState(true); // State to toggle between login and registration forms

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (error) {
      setError('Login failed. Please check your credentials and try again.');
    }
  };

  const handleRegisterSubmit = async (e) => {
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
      setIsLogin(true); // Switch to login form after successful registration
    } catch (error) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="container-fluid my-5">
      <h1 className="text-center mb-4">{isLogin ? 'User Login' : 'User Registration'}</h1>
      <div className="row">
        <div className="col-md-4 offset-md-4">
          <Card className="mb-4">
            <Card.Body>
              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}
              {isLogin ? (
                <form onSubmit={handleLoginSubmit}>
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
              ) : (
                <form onSubmit={handleRegisterSubmit}>
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
              )}
              <Button variant="link" onClick={() => setIsLogin(!isLogin)} className="mt-3">
                {isLogin ? 'Create an account' : 'Already have an account? Login'}
              </Button>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
