import React, { Component } from 'react'
import Authentication from './Authentication'
import './Game.css'
import Popup from 'react-popup'
import Stopwatch from 'react-stopwatch'
import GameState from './GameState'

const noGameHeader = "Lobby"

class Game extends Component {

    constructor(props) {
        super(props)
        this.state = {
            gameStarted: false,
            header: noGameHeader
        }
        this.sub = this.props.route ? this.props.route.sub : Authentication.getSub()
        this.connection = new WebSocket("ws://dcfl-server.herokuapp.com/register/" + this.sub)
    }

    onGameStart = (matchTitle) => {
        this.setState({
            gameStarted: true,
            header: matchTitle
        })
    }

    onGameEnd = () => {
        this.setState({
            gameStarted: false,
            header: noGameHeader
        })
    }

    matchName = () => {
        return "Portland East vs. El Paso Wallers"
    }

    goal = () => {
        this.connection.send(JSON.stringify({
            action: "goal",
            sub: this.sub
        }))
    }

    undo = () => {
        this.connection.send(JSON.stringify({
            action: "undo goal",
            sub: this.sub
        }))
    }

    logout = () => {
        Authentication.logout()
        this.forceUpdate()
    }

    render() {
        return (
            <div className="registerContainer">
                <Popup/>
                <span className="toolbar">
                    {this.state.gameStarted ?
                        <h2 className="leftToolbar" onClick={this.undo}>Undo</h2> :
                        <h2 className="leftToolbar" onClick={this.logout}>Logout</h2>}
                    <h2 className="centerToolbar">{this.state.header}</h2>
                    <h2 className="rightToolbar" onClick={this.state.gameStarted ? this.goal : false}>{this.state.gameStarted ? "Goal" : false}</h2>
                </span>
                <GameState sub={this.sub} onGameStart={this.onGameStart} onGameEnd={this.onGameEnd} connection={this.connection}/>
                {
                    this.state.gameStarted ? 
                        <div className="timerContainer">
                            <Stopwatch seconds={0} minutes={0} hours={0}/>
                        </div> :
                        false
                }
            </div>
        )
    }

}
export default Game