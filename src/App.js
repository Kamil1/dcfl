import React from 'react'
import {
  BrowserRouter as Router,
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
      <Route path="/.well-known/acme-challenge" children={(props) => <pre>sh3NY_CNzKcxotSuN6Omk5H55u3-Uwjw6aSg1qlKhs8.DWnELZAorWbgbvcEow4o_OwQXvajVpfjKve8ESdWonQ</pre>}/>
    </Switch>
  </Router>
)
export default DCFLRouter