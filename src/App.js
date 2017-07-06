import React from 'react'
import {
  HashRouter as Router,
  Route,
  Switch
} from 'react-router-dom'
import Login from './Login'
import Game from './Game'
import SSL from './SSL'

const DCFLRouter = () => (
  <Router>
    <Switch>
      <Route exact path="/" component={Login}/>
      <Route exact path="/newgame" component={Game}/>
      <Route component={SSL}/>
    </Switch>
  </Router>
)
export default DCFLRouter