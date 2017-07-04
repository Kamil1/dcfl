import React, { Component } from 'react'
import './GameState.css'
import Authentication from './Authentication'
import Popup from 'react-popup'
import Prompt from './Prompt'

const newGame = {
    blackPlayer1: {sub: "", picture: "", confirmed: false},
    blackPlayer2: {sub: "", picture: "", confirmed: false},
    yellowPlayer1: {sub: "", picture: "", confirmed: false},
    yellowPlayer2: {sub: "", picture: "", confirmed: false},
    blackTeam: {id: 0, city: "", name: ""},
    yellowTeam: {id: 0, city: "", name: ""},
    blackScore: 0,
    yellowScore: 0,
    userSide: null,
    gameStarted: false,
    userConfirmed: false,
    getConfirmation: false,
    gettingConfirmation: false,
    newTeam: false,
    error: ""
}

class GameState extends Component {

    constructor(props) {
        super(props)
        this.state = newGame
    }

    componentDidMount() {
        this.props.connection.onmessage = msg => {
            var obj = JSON.parse(msg.data)
            console.log("=== SERVER RESPONSE ===")
            console.log(obj)

            // Last game ended.
            if (this.state.gameStarted && !obj.game_started) {
                this.setState(newGame)
            }

            var bp1 = obj.black_player_1 ? obj.black_player_1 : this.state.blackPlayer1
            var bp2 = obj.black_player_2 ? obj.black_player_2 : this.state.blackPlayer2
            var yp1 = obj.yellow_player_1 ? obj.yellow_player_1 : this.state.yellowPlayer1
            var yp2 = obj.yellow_player_2 ? obj.yellow_player_2 : this.state.yellowPlayer2

            var userSide = ""
            var userPlayer
            if (bp1.sub === this.props.sub) {userPlayer = bp1; userSide = "black"}
            if (bp2.sub === this.props.sub) {userPlayer = bp2; userSide = "black"}
            if (yp1.sub === this.props.sub) {userPlayer = yp1; userSide = "yellow"}
            if (yp2.sub === this.props.sub) {userPlayer = yp2; userSide = "yellow"}

            var requiresConfirmation = (userSide === "black" &&
                                        bp1.sub !== "" &&
                                        bp2.sub !== "" &&
                                        !userPlayer.confirmed) ||
                                       (userSide === "yellow" &&
                                        yp1.sub !== "" &&
                                        yp2.sub !== "" &&
                                        !userPlayer.confirmed)
            var newTeam = false
            if (bp1.sub === this.props.sub && bp1.confirmed && bp2.confirmed && this.isEmptyTeam(obj.black_team)) newTeam = true
            if (yp1.sub === this.props.sub && yp1.confirmed && yp2.confirmed && this.isEmptyTeam(obj.yellow_team)) newTeam = true
            this.setState({
                blackPlayer1: bp1,
                blackPlayer2: bp2,
                yellowPlayer1: yp1,
                yellowPlayer2: yp2,
                blackTeam: obj.black_team,
                yellowTeam: obj.yellow_team,
                blackScore: obj.black_score,
                yellowScore: obj.yellow_score,
                userSide: userSide,
                gameStarted: obj.game_started,
                userConfirmed: this.state.userConfirmed,
                getConfirmation: requiresConfirmation,
                gettingConfirmation: this.state.gettingConfirmation,
                newTeam: newTeam,
                error: obj.error
            })

            if (this.state.gameStarted) {
                var matchTitle = 
                    this.state.black_team.city +
                    " " +
                    this.state.black_team.name +
                    " vs. " +
                    this.state.yellow_team.city +
                    " " + 
                    this.state.yellow_team.name
                this.props.onGameStart(matchTitle)
            }

            if (this.state.error && this.state.error !== "") {
                Popup.alert(this.state.error)
            }
            
            if (this.state.getConfirmation && !this.state.gettingConfirmation) {
                var state = this.state
                state.gettingConfirmation = true
                this.setState(state)
                Popup.create({
                    title: "Confirm",
                    content: "Ready to play?",
                    buttons: {
                        left: ['Cancel'],
                        right: [{
                            text: "Ready",
                            action: (popup) => {
                                var state = this.state
                                state.gettingConfirmation = false
                                state.userConfirmed = true
                                this.setState(state)
                                this.sendConfirmation()
                                popup.close()
                            }
                        }]
                    }
                })
            }

            if (this.state.newTeam) {
                Popup.plugins().prompt((city, name) => {
                    this.props.connection.send(JSON.stringify({
                        action: "register team",
                        player_1: this.state.userSide === "black" ? this.state.blackPlayer1.sub : this.state.yellowPlayer1.sub,
                        player_2: this.state.userSide === "black" ? this.state.blackPlayer2.sub : this.state.yellowPlayer2.sub,
                        city: city,
                        name: name,
                        side: this.state.userSide
                    }))
                })
            }
        }
    }

    isEmptyTeam = (team) => {
        return team.id === 0 && team.city === "" || team.name === ""
    }

    registerPlayer = (side) => {
        this.props.connection.send(JSON.stringify({
            action: "register game",
            sub: this.props.sub,
            side: side
        }))
    }

    sendBlack = () => {
        console.log("sending black")
        if (!this.state.userConfirmed) {
            this.registerPlayer("black")
        }
    }

    sendYellow = () => {
        console.log("sending yellow")
        if (!this.state.userConfirmed) {
            this.registerPlayer("yellow")
        }
    }

    sendConfirmation = () => {
        this.props.connection.send(JSON.stringify({
            action: "confirm",
            sub: this.props.sub,
            side: this.state.userSide
        }))
    }

    render() {
        console.log("=== APP STATE ===")
        console.log(this.state)
        if (!Authentication.loggedIn()) {
            return Authentication.loginRedirect()
        }
        return (
            <div>
                <div className="registerBlack" onClick={this.sendBlack}>
                    <div className="scoreTop blackScore">{this.state.gameStarted ? this.state.blackScore : false}</div>
                    <div className="playersContainer">
                        <img
                            src={this.state.blackPlayer1.picture === "" ? "http://via.placeholder.com/96x96" : this.state.blackPlayer1.picture}
                            alt="Black side player 1"
                            className={this.state.blackPlayer1.confirmed ? "confirmedPlayerImage" : "playerImage"}
                        />
                        <img
                            src={this.state.blackPlayer2.picture === "" ? "http://via.placeholder.com/96x96" : this.state.blackPlayer2.picture}
                            alt="Black side player 2"
                            className={this.state.blackPlayer2.confirmed ? "confirmedPlayerImage" : "playerImage"}
                        />
                    </div>
                    <div className="scoreTop"></div>
                </div>
                <div className="registerYellow" onClick={this.sendYellow}>
                    <div className="scoreTop"></div>
                    <div className="playersContainer">
                        <img
                            src={this.state.yellowPlayer1.picture === "" ? "http://via.placeholder.com/96x96" : this.state.yellowPlayer1.picture}
                            alt="Yellow side player 1"
                            className={this.state.yellowPlayer1.confirmed ? "confirmedPlayerImage" : "playerImage"}
                        />
                        <img
                            src={this.state.yellowPlayer2.picture === "" ? "http://via.placeholder.com/96x96" : this.state.yellowPlayer2.picture}
                            alt="Yello side player 2"
                            className={this.state.yellowPlayer2.confirmed ? "confirmedPlayerImage" : "playerImage"}
                        />
                    </div>
                    <div className="scoreTop yellowScore">{this.state.gameStarted ? this.state.yellowScore : false}</div>
                </div>                
            </div>
        )
    }

}
export default GameState

Popup.registerPlugin('prompt', function(callback) {
    var cityValue = null
    var cityChange = (city) => {
        cityValue = city;
    }
    var nameValue = null
    var nameChange = (name) => {
        nameValue = name
    }

    this.create({
        title: 'Register Team',
        content: (
        <div>
            <Prompt onChange={cityChange} placeholder="City" value=""/>
            <br/>
            <Prompt onChange={nameChange} placeholder="Name" value=""/>
        </div>),
        buttons: {
            left: ['Cancel'],
            right: [{
                text: 'Register',
                action: () => {
                    callback(cityValue, nameValue);
                    Popup.close()
                }
            }]
        }
    });
});
