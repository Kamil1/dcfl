import React from 'react'
import cookie from 'react-cookies'
import { Redirect } from 'react-router'

class Authentication {
    
    static loggedIn() {
        return (
            cookie.load('sub') &&
            cookie.load('session_expiration') &&
            cookie.load('session_expiration') > (new Date()).getTime())
    }

    static loginRedirect() {
        return (<Redirect to="/"/>)
    }

    static cacheLogin(sub) {
        cookie.save(
            'session_expiration',
            (new Date()).getTime() + 86400000,
            { path: '/' })
        cookie.save(
            'sub',
            sub,
            { path: '/'})
    }

    static logout() {
        cookie.remove('session_expiration', {path: '/'})
        cookie.remove('sub', {path: '/'})
    }

    static getSub() {
        return cookie.load('sub')
    }

}
export default Authentication;