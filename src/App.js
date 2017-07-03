import React from 'react'
import {
  BrowserRouter as Router,
  Route,
  Switch
} from 'react-router-dom'
import Login from './Login'
import NewGame from './NewGame'

const DCFLRouter = () => (
  <Router>
    <Switch>
      <Route exact path="/" component={Login}/>
      <Route exact path="/newgame" component={NewGame}/>
    </Switch>
  </Router>
)
export default DCFLRouter