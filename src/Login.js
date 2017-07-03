import React, { Component } from 'react'
import logo from './logo.svg'
import './DCFL.css'
import GoogleLogin from 'react-google-login'
import API from './API'
import Authentication from './Authentication'
import { Redirect } from 'react-router'

class Login extends Component {

  response = (response) => {
    if (response.error) {
      console.log(response.error)
      return
    }
    
    API().post('/authenticate', null, {
      headers: { Authorization: response.tokenId }
    }).then((response) => {
      if (response.status === 200) {
        Authentication.cacheLogin(response.data.sub)
        this.forceUpdate()
      }
    }).catch(function(error) {
      console.log(error)
    })
  }

  render = () => {
    if (Authentication.loggedIn()) {
        return <Redirect to="/newgame"/>
    }
    return (
        <div className="Dcfl">
          <div className="Dcfl-header">
            <h1>Welcome to the DCFL</h1>
          </div>
          <GoogleLogin
            clientId="679951802637-1elfqih4qe8hqa1r8sflql5vqaafonj4.apps.googleusercontent.com"
            buttonText="Login"
            onSuccess={this.response}
            onFailure={this.response}
          />
        </div>
    )
  }
}

export default Login
