import React, { Component } from 'react'
import './NewGame.css'
import './Popup.css'
import Authentication from './Authentication'
import Popup from 'react-popup'

class NewGame extends Component {

    constructor() {
        super()
        this.state = {
            blackPlayer1: {sub: "", picture: "", confirmed: false},
            blackPlayer2: {sub: "", picture: "", confirmed: false},
            yellowPlayer1: {sub: "", picture: "", confirmed: false},
            yellowPlayer2: {sub: "", picture: "", confirmed: false},
            userSide: "",
            getConfirmation: false,
            newTeam: false,
            error: ""
        }
    }

    componentWillMount() {
        this.connection = new WebSocket("ws://localhost:3333/register/" + Authentication.getSub())
        this.connection.onmessage = msg => {
            var obj = JSON.parse(msg.data)
            console.log("DATA")
            console.log(obj)
            var bp1 = obj.black_player_1 ? obj.black_player_1 : this.state.blackPlayer1
            var bp2 = obj.black_player_2 ? obj.black_player_2 : this.state.blackPlayer2
            var yp1 = obj.yellow_player_1 ? obj.yellow_player_1 : this.state.yellowPlayer1
            var yp2 = obj.yellow_player_2 ? obj.yellow_player_2 : this.state.yellowPlayer2
            var userSide = ""
            if (bp1.sub === Authentication.getSub || bp2.sub === Authentication.getSub) userSide = "black"
            if (yp1.sub === Authentication.getSub || yp2.sub === Authentication.getSub) userSide = "yellow"
            var requiresConfirmation = (userSide ==="black" && bp1.sub != "" && bp2.sub != "") ||
                                       (userSide ==="yellow" && yp1.sub != "" && yp2.sub != "")
            var newTeam = false
            if (userSide === "black" && bp1.confirmed && bp2.confirmed && obj.name === "") newTeam = true
            if (userSide === "yellow" && yp1.confirmed && yp2.confirmed && obj.name === "") newTeam = true
            this.setState({
                blackPlayer1: bp1,
                blackPlayer2: bp2,
                yellowPlayer1: yp1,
                yellowPlayer2: yp2,
                userSide: userSide,
                getConfirmation: requiresConfirmation,
                newTeam: newTeam,
                error: obj.error
            })

            if (this.state.error && this.state.error != "") {
                Popup.alert(this.state.error)
            }
            
            if (this.state.getConfirmation) {
                Popup.create({
                    title: "Confirm",
                    content: "Ready to play?",
                    buttons: {
                        left: ['Cancel'],
                        right: [{
                            text: "Ready",
                            action: (popup) => {
                                this.sendConfirmation()
                                popup.close()
                            }
                        }]
                    }
                })
            }

            if (this.state.newTeam) {
                Popup.plugins().prompt((city, name) => {
                    this.connection.send(JSON.stringify({
                        action: "register team",
                        player_1: this.state.userSide == "black" ? this.state.blackPlayer1.sub : this.state.yellowPlayer1.sub,
                        player_2: this.state.userSide == "black" ? this.state.blackPlayer2.sub : this.state.yellowPlayer2.sub,
                        city: city,
                        name: name,
                        side: this.state.userSide
                    }))
                })
            }
        }
    }

    registerPlayer = (side) => {
        this.connection.send(JSON.stringify({
            action: "register game",
            sub: Authentication.getSub(),
            side: side
        }))
    }

    sendBlack = () => {
        this.registerPlayer("black")
    }

    sendYellow = () => {
        this.registerPlayer("yellow")
    }

    sendConfirmation = () => {
        this.connection.send(JSON.stringify({
            action: "confirm",
            sub: Authentication.getSub(),
            side: this.state.userSide
        }))
    }

    logout = () => {
        Authentication.logout()
        this.forceUpdate()
    }

    render() {
        if (!Authentication.loggedIn()) {
            console.log("redirect")
            return Authentication.loginRedirect()
        }
        return (
            <div className="registerContainer">
                <Popup/>
                <h2 onClick={this.logout}>Logout</h2>
                <div className="registerBlack" onClick={this.sendBlack}>
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
                </div>
                <div className="registerYellow" onClick={this.sendYellow}>
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
                </div>                
            </div>
        )
    }

}
export default NewGame

/** The prompt content component */
class Prompt extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            value: this.props.defaultValue
        };

        this.onChange = (e) => this._onChange(e);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.value !== this.state.value) {
            this.props.onChange(this.state.value);
        }
    }

    _onChange(e) {
        let value = e.target.value;

        this.setState({value: value});
    }

    render() {
        return <input type="text" placeholder={this.props.placeholder} className="mm-popup__input" value={this.state.value} onChange={this.onChange} />;
    }
}

/** Prompt plugin */
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
